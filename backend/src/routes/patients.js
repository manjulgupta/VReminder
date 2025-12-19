const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const generateSchedule = require('../services/scheduleGenerator');

const router = express.Router();

/**
 * POST /api/admin/patients
 * Register a new patient + generate vaccine schedule
 */
router.post('/', auth, async (req, res) => {
  const {
    parent_name,
    parent_phone,
    parent_email,
    child_name,
    child_dob
  } = req.body;

  if (!parent_name || !parent_phone || !child_dob) {
    return res.status(400).json({ error: 'missing required fields' });
  }

  const hospitalId = req.user.hospitalId;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Insert patient
    const [result] = await conn.query(
      `INSERT INTO patients
       (hospital_id, parent_name, parent_phone, parent_email, child_name, child_dob)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        hospitalId,
        parent_name,
        parent_phone,
        parent_email || null,
        child_name || null,
        child_dob
      ]
    );

    const patientId = result.insertId;

    // 2. Generate schedule
    const schedule = generateSchedule(child_dob);

    // 3. Insert scheduled doses
    for (const dose of schedule) {
      await conn.query(
        `INSERT INTO scheduled_doses
         (patient_id, vaccine_id, dose_number, scheduled_date)
         VALUES (?, ?, ?, ?)`,
        [patientId, dose.vaccine_id, dose.dose_number, dose.scheduled_date]
      );
    }

    await conn.commit();
    res.json({ patientId });

  } catch (err) {
    await conn.rollback();
    console.error('Patient creation failed:', err);
    res.status(500).json({ error: 'failed to create patient' });
  } finally {
    conn.release();
  }
});

/**
 * GET /api/admin/patients
 * List all patients for the admin's hospital
 */
router.get('/', auth, async (req, res) => {
  const hospitalId = req.user.hospitalId;

  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         parent_name,
         parent_phone,
         parent_email,
         child_name,
         child_dob,
         created_at
       FROM patients
       WHERE hospital_id = ?
       ORDER BY created_at DESC`,
      [hospitalId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch patients' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const hospitalId = req.user.hospitalId;
  const patientId = req.params.id;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. delete sms logs
    await conn.query(
      `DELETE FROM sms_logs WHERE patient_id = ?`,
      [patientId]
    );

    // 2. delete scheduled doses
    await conn.query(
      `DELETE FROM scheduled_doses WHERE patient_id = ?`,
      [patientId]
    );

    // 3. delete patient
    const [result] = await conn.query(
      `DELETE FROM patients WHERE id = ? AND hospital_id = ?`,
      [patientId, hospitalId]
    );

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'patient not found' });
    }

    res.json({ success: true });

  } catch (err) {
    await conn.rollback();
    console.error('Delete patient error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});




module.exports = router;
