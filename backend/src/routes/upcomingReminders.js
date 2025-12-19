const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/admin/upcoming-reminders
 * Next 7 days by default
 */
router.get('/', auth, async (req, res) => {
  const hospitalId = req.user.hospitalId;

  const [rows] = await pool.query(
    `
    SELECT
      sd.id AS scheduled_dose_id,
      p.child_name,
      p.parent_phone,
      v.name AS vaccine_name,
      sd.dose_number,
      sd.status,
      sd.scheduled_date
    FROM scheduled_doses sd
    JOIN patients p ON p.id = sd.patient_id
    JOIN vaccines v ON v.id = sd.vaccine_id
    WHERE p.hospital_id = ?
      AND sd.scheduled_date >= CURDATE()
      AND sd.scheduled_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    ORDER BY sd.scheduled_date ASC
    `,
    [hospitalId]
  );

  res.json(rows);
});

module.exports = router;
