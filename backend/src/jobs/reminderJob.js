const cron = require('node-cron');
const pool = require('../db');
const { sendSms, logSms } = require('../services/smsService');

function buildMessage(row) {
  return `Reminder: ${row.parent_name}, your child is due for ${row.vaccine_name} (dose ${row.dose_number}) on ${row.scheduled_date}.`;
}

async function runReminderJob() {
  console.log('⏰ Running reminder job');

  const [rows] = await pool.query(`
    SELECT
      sd.id AS scheduled_dose_id,
      sd.scheduled_date,
      p.id AS patient_id,
      p.parent_name,
      p.parent_phone,
      v.name AS vaccine_name,
      sd.dose_number
    FROM scheduled_doses sd
    JOIN patients p ON p.id = sd.patient_id
    JOIN vaccines v ON v.id = sd.vaccine_id
    WHERE
      sd.status = 'pending'
      AND p.consent_optin = 1
      AND sd.scheduled_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY)
  `);

  for (const row of rows) {
    const message = buildMessage(row);

    try {
      const result = await sendSms({
        to: row.parent_phone,
        message
      });

      await logSms({
        scheduled_dose_id: row.scheduled_dose_id,
        patient_id: row.patient_id,
        to_phone: row.parent_phone,
        message,
        status: 'sent'
      });

    } catch (err) {
      await logSms({
        scheduled_dose_id: row.scheduled_dose_id,
        patient_id: row.patient_id,
        to_phone: row.parent_phone,
        message,
        status: 'failed'
      });
    }
  }
}

// Run every day at 02:00
cron.schedule('0 2 * * *', runReminderJob);

module.exports = { runReminderJob };
