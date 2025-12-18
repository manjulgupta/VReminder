const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/admin/sms-logs
 * View SMS logs for hospital
 */
router.get('/', auth, async (req, res) => {
  const hospitalId = req.user.hospitalId;

  try {
    const [rows] = await pool.query(
      `SELECT
         sl.id,
         sl.to_phone,
         sl.message,
         sl.status,
         sl.attempts,
         sl.last_attempt_at,
         sl.created_at,
         p.parent_name,
         p.child_name
       FROM sms_logs sl
       JOIN patients p ON p.id = sl.patient_id
       WHERE p.hospital_id = ?
       ORDER BY sl.created_at DESC
       LIMIT 100`,
      [hospitalId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch sms logs' });
  }
});

module.exports = router;
