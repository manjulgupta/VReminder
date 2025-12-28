// gives the upcoming list of scheduled doses for patients in the hospital

const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/admin/schedules/upcoming
 * List upcoming scheduled doses (next N days)
 */
router.get('/upcoming', auth, async (req, res) => {
  const hospitalId = req.user.hospitalId;
  const days = Number(req.query.days || 7);
              //Query parameters are ALWAYS strings, so Number() req.

  try {
    const [rows] = await pool.query(
      `SELECT
         sd.id AS scheduled_dose_id,
         sd.scheduled_date,
         sd.status,
         p.parent_name,
         p.parent_phone,
         p.child_name,
         v.name AS vaccine_name,
         sd.dose_number
       FROM scheduled_doses sd
       JOIN patients p ON p.id = sd.patient_id
       JOIN vaccines v ON v.id = sd.vaccine_id
       WHERE
        p.hospital_id = ?
        AND sd.status = 'pending'
        AND sd.scheduled_date >= CURDATE()
        AND sd.scheduled_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY sd.scheduled_date ASC`,
      [hospitalId, days]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch schedules' });
  }
});

module.exports = router;
