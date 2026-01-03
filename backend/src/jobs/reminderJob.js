// //This file is a time-triggered worker that finds upcoming vaccine doses and sends reminder SMS.

// // Clock rings (2 AM)
// //    ↓
// // Fetch due doses from DB
// //    ↓
// // For each dose:
// //    - Build message
// //    - Send SMS
// //    - Log result

// /*
// Type:
// Background worker (time-triggered)

// Purpose:
// Send vaccine reminders 3 days before scheduled date.

// Reads:
// scheduled_doses, patients, vaccines

// Writes:
// sms_logs

// Failure handling:
// Logs failure, does not retry (Phase 1 decision)
// server off at 2 AM → no reminders sent that day

// Future improvements:
// - Retry with backoff
// - Avoid duplicate sends
// - Queue-based processing
// */

// const cron = require('node-cron'); // to run code based on time.
// const pool = require('../db');
// const { sendSms, logSms } = require('../services/smsService');

// // “This function contains operations that will take time.
// // When waiting, don’t block the whole app.”    !== MULTI THREADIING, PARALLEL PROCESSING
// //Sync: one waiter waits at the kitchen for each order
// // Async: waiter takes multiple orders, kitchen calls when ready
// async function runReminderJob() {
//   console.log('⏰ Running reminder job');

//   // “Give me all pending vaccine doses that are scheduled 3 days from today, where parents have given consent.”

//   // how to actually store sql query results in js variable:
//   // “Pause this function until the DB responds,
//   // but let the rest of the Node app keep running.”
//   const [rows] = await pool.query(`
//     SELECT
//       sd.id AS scheduled_dose_id,
//       sd.scheduled_date,
//       p.id AS patient_id,
//       p.parent_name,
//       p.parent_phone,
//       p.child_name,
//       v.name AS vaccine_name,
//       sd.dose_number
//     FROM scheduled_doses sd
//     JOIN patients p ON p.id = sd.patient_id
//     JOIN vaccines v ON v.id = sd.vaccine_id
//     WHERE
//       sd.status = 'pending'
//       AND p.consent_optin = 1
//       AND sd.scheduled_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY)
//   `);

//   for (const row of rows) { // traversing each row of sql query result
//     // const message = buildMessage(row);

//     row.scheduled_date=new Date(row.scheduled_date).toLocaleDateString("en-IN")

//     try {
//       const result = await sendSms({
//         to: row.parent_phone,
//         components: {
//           body_1: { type: "text", value: row.parent_name },
//           body_2: { type: "text", value: row.child_name },
//           body_3: { type: "text", value: row.vaccine_name },
//           body_4: { type: "text", value: row.scheduled_date }
//         }
//       });

//       await logSms({
//         scheduled_dose_id: row.scheduled_dose_id,
//         patient_id: row.patient_id,
//         to_phone: row.parent_phone,
//         message: row.vaccine_name,
//         status: 'sent'
//       });

//     } catch (err) {
//       await logSms({
//         scheduled_dose_id: row.scheduled_dose_id,
//         patient_id: row.patient_id,
//         to_phone: row.parent_phone,
//         message: row.vaccine_name+" for "+row.child_name+" - FAILED: "+err.message,
//         status: 'failed'
//       });
//     }
//   }
// }

// // Run every day at 08:00
// cron.schedule('0 8 * * *', runReminderJob);
// // cron.schedule('48 21 * * *', runReminderJob);

// module.exports = { runReminderJob };


const cron = require('node-cron');
const pool = require('../db');
const { sendSms, logSms } = require('../services/smsService');
///
async function runReminderJob() {
  const [rows] = await pool.query(`
    SELECT
      sd.id AS scheduled_dose_id,
      sd.patient_id,
      p.parent_phone,
      v.name AS vaccine_name,
      sd.scheduled_date,
      p.child_name,
      p.parent_name
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

  console.log(`Found ${rows.length} reminders`);

  for (const r of rows) {
    const message = `${r.vaccine_name} for ${r.child_name}`;

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
        message
      ]
    );

    const smsLogId = logResult.insertId;

    r.scheduled_date = new Date(r.scheduled_date)
      .toLocaleDateString("en-IN");

    try {
      // 2️⃣ Send WhatsApp via Fast2SMS
      const response = await sendSms({
        to: r.parent_phone,
        components: {
          parent: r.parent_name,
          child: r.child_name,
          vaccine: r.vaccine_name,
          schedule: r.scheduled_date
        }
      });

      await pool.query(
        `
        UPDATE sms_logs
        SET status = ?, attempts = attempts + 1, last_attempt_at = NOW()
        WHERE id = ?
        `,
        [response.status, smsLogId]
      );

    } catch (err) {
      // 3️⃣ Failure path
      await pool.query(
        `
        UPDATE sms_logs
        SET status = 'failed',
            attempts = attempts + 1,
            last_attempt_at = NOW()
        WHERE id = ?
        `,
        [smsLogId]
      );

      console.error('SMS failed for', r.parent_phone, err.message);
    }
  }
}
///
// async function runReminderJob() {
//   console.log('⏰ Running reminder job');

//   const [rows] = await pool.query(`
//     SELECT
//       sd.id AS scheduled_dose_id,
//       sd.scheduled_date,
//       p.id AS patient_id,
//       p.parent_name,
//       p.parent_phone,
//       p.child_name,
//       v.name AS vaccine_name,
//       sd.dose_number
//     FROM scheduled_doses sd
//     JOIN patients p ON p.id = sd.patient_id
//     JOIN vaccines v ON v.id = sd.vaccine_id
//     WHERE
//       sd.status = 'pending'
//       AND p.consent_optin = 1
//       AND sd.scheduled_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY)
//   `);

//   for (const row of rows) {
//     row.scheduled_date = new Date(row.scheduled_date)
//       .toLocaleDateString("en-IN");

//     try {
//       const result = await sendSms({
//         to: row.parent_phone,
//         components: {
//           parent: row.parent_name,
//           child: row.child_name,
//           vaccine: row.vaccine_name,
//           schedule: row.scheduled_date
//         }
//       });

//       await logSms({
//         scheduled_dose_id: row.scheduled_dose_id,
//         patient_id: row.patient_id,
//         to_phone: row.parent_phone,
//         message: row.vaccine_name,
//         status: 'sent'
//       });

//     } catch (err) {
//       await logSms({
//         scheduled_dose_id: row.scheduled_dose_id,
//         patient_id: row.patient_id,
//         to_phone: row.parent_phone,
//         message: `${row.vaccine_name} for ${row.child_name} - FAILED: ${err.message}`,
//         status: 'failed'
//       });
//     }
//   }
// }

// Run every day at 08:00
// cron.schedule('15 10 * * *', runReminderJob);

cron.schedule(
  '40 10 * * *',
  runReminderJob,
  {
    timezone: 'Asia/Kolkata'
  }
);


module.exports = { runReminderJob };
