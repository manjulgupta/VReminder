// require('dotenv').config();
// // const fetch = require('node-fetch');
// const fetch = global.fetch;

// const pool = require('../db');
// /**
//  * SEND via WhatsApp (MSG91)
//  * This replaces SMS but keeps the same function name
//  */
// async function sendSms({ to, components }) {
//   // console.log(`Sending WhatsApp to ${to} with components:`, components, "from smsService.js");
//   const payload = {
//     integrated_number: process.env.MSG91_WHATSAPP_NUMBER,
//     content_type: "template",
//     payload: {
//       messaging_product: "whatsapp",
//       type: "template",
//       template: {
//         name: "vaccination_reminder",
//         language: {
//           code: "hi",
//           policy: "deterministic"
//         },
//         namespace: process.env.MSG91_NAMESPACE,
//         to_and_components: [
//           {
//             to: [to],
//             components
//           }
//         ]
//       }
//     }
//   };

//   // console.log("WHATSAPP PAYLOAD:", JSON.stringify(payload, null, 2));

//   var myHeaders = new Headers();
//   myHeaders.append("Content-Type", "application/json");
//   myHeaders.append("authkey", process.env.MSG91_AUTHKEY);

//   const res = await fetch(
//     "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
//     {
//       method: 'POST',
//       headers: myHeaders,
//       body: JSON.stringify(payload),
//       redirect: 'follow'
//     }
//   );

//   // console.log("MSG91 STATUS:", res.status);

//   const result = await res.json();

//   // console.log("MSG91 RAW RESPONSE:", JSON.stringify(result, null, 2));


//   // We return raw provider response

//   if (!res.ok) {
//     throw new Error(`MSG91 error: ${JSON.stringify(result)}`);
//   }

//   return {
//     status: "sent", // WhatsApp is async by nature
//     providerResponse: result
//   };
// }

// /**
//  * LOG message attempt (UNCHANGED)
//  */
// async function logSms({
//   scheduled_dose_id,
//   patient_id,
//   to_phone,
//   message,
//   status
// }) {
//   await pool.query(
//     `
//     INSERT INTO sms_logs
//       (scheduled_dose_id, patient_id, to_phone, message, status, attempts, last_attempt_at)
//     VALUES (?, ?, ?, ?, ?, 1, NOW())
//     `,
//     [scheduled_dose_id, patient_id, to_phone, message, status]
//   );
// }

// module.exports = { sendSms, logSms };
require('dotenv').config();
const fetch = global.fetch;
const pool = require('../db');

/**
 * SEND via WhatsApp (FAST2SMS)
 */
async function sendSms({ to, components }) {
  const {
    parent,
    child,
    vaccine,
    schedule
  } = components;

  // console.log(`Sending WhatsApp to ${to} with components:`, components, "from smsService.js");

  const variableValues =
    `${parent}|${child}|${vaccine}|${schedule}`;

  const url =
    `https://www.fast2sms.com/dev/whatsapp` +
    `?authorization=${encodeURIComponent(process.env.FAST2SMS_API_KEY)}` +
    `&message_id=${encodeURIComponent(process.env.FAST2SMS_MESSAGE_ID)}` +
    `&phone_number_id=${encodeURIComponent(process.env.FAST2SMS_PHONE_NUMBER_ID)}` +
    `&numbers=${encodeURIComponent(to)}` +
    `&variables_values=${encodeURIComponent(variableValues)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { accept: 'application/json' }
  });

  const result = await res.json();

  if (!res.ok || result.return !== true) {
    throw new Error(`FAST2SMS error: ${JSON.stringify(result)}`);
  }

  return {
    status: "sent",
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
