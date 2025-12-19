require('dotenv').config();
const pool = require('../db');
const { sendSms } = require('../services/smsService');

async function run() {
  const [rows] = await pool.query(`
    SELECT
      sd.id AS scheduled_dose_id,
      sd.patient_id,
      p.parent_phone,
      v.name AS vaccine_name,
      sd.scheduled_date
    FROM scheduled_doses sd
    JOIN patients p ON p.id = sd.patient_id
    JOIN vaccines v ON v.id = sd.vaccine_id
    WHERE sd.status = 'pending'
      AND sd.scheduled_date = CURDATE()
      AND NOT EXISTS (
        SELECT 1
        FROM sms_logs sl
        WHERE sl.scheduled_dose_id = sd.id
          AND DATE(sl.created_at) = CURDATE()
      )
  `);

  // to resend, modify with this one
  // WHERE sd.status = 'pending'
  // AND sd.scheduled_date = CURDATE()

  console.log(`Found ${rows.length} reminders`);

  for (const r of rows) {
    const message = `Reminder: ${r.vaccine_name} vaccine scheduled today.`;

    // 1️⃣ Log FIRST (queued)
    const [logResult] = await pool.query(
      `
      INSERT INTO sms_logs
        (scheduled_dose_id, patient_id, to_phone, message, status)
      VALUES (?, ?, ?, ?, 'queued')
      `,
      [
        r.scheduled_dose_id,
        r.patient_id,
        r.parent_phone,
        message,
      ]
    );

    const smsLogId = logResult.insertId;

    try {
      // 2. Send SMS (dry-run or real)
      const response = await sendSms({
        phone: r.parent_phone,
        message,
      });

      // 3. Update log after attempt
      // await pool.query(
      //   `
      //   UPDATE sms_logs
      //   SET status = ?, attempts = attempts + 1, last_attempt_at = NOW()
      //   WHERE id = ?
      //   `,
      //   [
      //     response.status === 'dry-run' ? 'queued' : 'sent',
      //     smsLogId,
      //   ]
      // );
      const finalStatus =
        response.status === 'queued' ? 'queued' : 'sent';

      await pool.query(
        `
        UPDATE sms_logs
        SET status = ?, attempts = attempts + 1, last_attempt_at = NOW()
        WHERE id = ?
        `,
        [finalStatus, smsLogId]
      );


      console.log('[SMS]', r.parent_phone, response.status);

    } catch (err) {
      // 4. Failure path (important)
      await pool.query(
        `
        UPDATE sms_logs
        SET status = 'failed', attempts = attempts + 1, last_attempt_at = NOW()
        WHERE id = ?
        `,
        [smsLogId]
      );

      console.error('SMS failed for', r.parent_phone, err.message);
    }
  }
}

run()
  .then(() => process.exit())
  .catch((err) => {
    console.error('Job failed:', err);
    process.exit(1);
  });
