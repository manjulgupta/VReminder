const pool = require('../db');

// MOCK SMS sender (replace with real provider later)
// async function sendSms({ to, message }) {
//   console.log(`📩 SMS to ${to}: ${message}`);
//   return { success: true, provider_id: 'mock-123' };
// }

async function logSms({ scheduled_dose_id, patient_id, to_phone, message, status }) {
  await pool.query(
    `INSERT INTO sms_logs
     (scheduled_dose_id, patient_id, to_phone, message, status, attempts, last_attempt_at)
     VALUES (?, ?, ?, ?, ?, 1, NOW())`,
    [scheduled_dose_id, patient_id, to_phone, message, status]
  );
}

async function sendSms({ phone, message }) {
  if (process.env.MSG91_MODE === 'mock') {
    // Simulate MSG91-like response
    return {
      status: 'queued',
      provider: 'msg91',
      mock: true,
      request_id: 'MOCK-' + Date.now(),
    };
  }

  // Live mode (kept but inactive until DLT)
  const payload = {
    template_id: process.env.MSG91_TEMPLATE_ID,
    sender: process.env.MSG91_SENDER_ID,
    short_url: 0,
    recipients: [
      {
        mobiles: phone,
        message,
      },
    ],
  };

  const res = await axios.post(
    'https://control.msg91.com/api/v5/flow/',
    payload,
    {
      headers: {
        authkey: process.env.MSG91_AUTH_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    status: 'sent',
    provider: 'msg91',
    mock: false,
    response: res.data,
  };
}

module.exports = { sendSms };
