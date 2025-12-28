require('dotenv').config();
// const fetch = require('node-fetch');
const fetch = global.fetch;

const pool = require('../db');
/**
 * SEND via WhatsApp (MSG91)
 * This replaces SMS but keeps the same function name
 */
async function sendSms({ to, components }) {
  // console.log(`Sending WhatsApp to ${to} with components:`, components, "from smsService.js");
  const payload = {
    integrated_number: process.env.MSG91_WHATSAPP_NUMBER,
    content_type: "template",
    payload: {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: "vaccination_reminder",
        language: {
          code: "hi",
          policy: "deterministic"
        },
        namespace: process.env.MSG91_NAMESPACE,
        to_and_components: [
          {
            to: [to],
            components
          }
        ]
      }
    }
  };

  // console.log("WHATSAPP PAYLOAD:", JSON.stringify(payload, null, 2));

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("authkey", process.env.MSG91_AUTHKEY);

  const res = await fetch(
    "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
    {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: 'follow'
    }
  );

  // console.log("MSG91 STATUS:", res.status);

  const result = await res.json();

  // console.log("MSG91 RAW RESPONSE:", JSON.stringify(result, null, 2));


  // We return raw provider response

  if (!res.ok) {
    throw new Error(`MSG91 error: ${JSON.stringify(result)}`);
  }

  return {
    status: "sent", // WhatsApp is async by nature
    providerResponse: result
  };
}

/**
 * LOG message attempt (UNCHANGED)
 */
async function logSms({
  scheduled_dose_id,
  patient_id,
  to_phone,
  message,
  status
}) {
  await pool.query(
    `
    INSERT INTO sms_logs
      (scheduled_dose_id, patient_id, to_phone, message, status, attempts, last_attempt_at)
    VALUES (?, ?, ?, ?, ?, 1, NOW())
    `,
    [scheduled_dose_id, patient_id, to_phone, message, status]
  );
}

module.exports = { sendSms, logSms };
