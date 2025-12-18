const pool = require('../db');

// MOCK SMS sender (replace with real provider later)
async function sendSms({ to, message }) {
  console.log(`📩 SMS to ${to}: ${message}`);
  return { success: true, provider_id: 'mock-123' };
}

async function logSms({ scheduled_dose_id, patient_id, to_phone, message, status }) {
  await pool.query(
    `INSERT INTO sms_logs
     (scheduled_dose_id, patient_id, to_phone, message, status, attempts, last_attempt_at)
     VALUES (?, ?, ?, ?, ?, 1, NOW())`,
    [scheduled_dose_id, patient_id, to_phone, message, status]
  );
}

module.exports = { sendSms, logSms };