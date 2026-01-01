const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const generateSchedule = require('../services/scheduleGenerator');
const router = express.Router();

// ASYNC/AWAIT
// JavaScript is single-threaded. One brain cell. If it waits, everything waits. That’s bad when:
// // hitting a database
// // calling an API
// // reading files
// // sending SMS
// // basically anything useful
// So JS says:
// “I won’t wait. I’ll come back later.”
// That “come back later” thing is asynchronous code.
// -await only works inside async functions

/**
 * POST /api/admin/patients
 * Register a new patient + generate vaccine schedule
 */

// without auth, anyone can call this.
router.post('/', auth, async (req, res) => {
  //due to auth middleware:
  // 1. auth middleware runs FIRST
  // 2. If token invalid → request rejected, this function never runs
  // 3. If token valid → req.user is populated, then this runs

  //routes: Define endpoints (URLs) that respond to requests
  //middleware: A reusable function that runs BEFORE route handlers



  //HOW DOES THIS ACTUALLY WORK? HOW ARE THESE VALUES PASSESD AND WHO ANWHERE IS IT PASSED?
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
  // Why get a dedicated connection?
  // // Usually pool.query() grabs any available connection
  // // For transactions, you need the SAME connection for all operations
  // // Think of it as: "Reserve a phone line for this entire conversation"

  try {
    await conn.beginTransaction();

    try {
      // 0. Check if patient already exists
      const [existing] = await conn.query(
        `
    SELECT id
    FROM patients
    WHERE hospital_id = ?
      AND parent_phone = ?
      AND child_dob = ?
    LIMIT 1
    `,
        [hospitalId, parent_phone, child_dob]
      );

      if (existing.length > 0) {
        // Patient already exists — do NOT insert again
        await conn.rollback();

        return res.status(409).json({
          message: "Patient already exists for this phone number and date of birth",
          patientId: existing[0].id
        });
      }

      // 1. Insert patient
      const [result] = await conn.query(
        `
    INSERT INTO patients
      (hospital_id, parent_name, parent_phone, parent_email, child_name, child_dob)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
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
          `
      INSERT INTO scheduled_doses
        (patient_id, vaccine_id, dose_number, scheduled_date)
      VALUES (?, ?, ?, ?)
      `,
          [patientId, dose.vaccine_id, dose.dose_number, dose.scheduled_date]
        );
      }

      await conn.commit();

      res.json({ patientId });

    } catch (err) {
      await conn.rollback();
      throw err;
    }

  }
  catch (err) {
    await conn.rollback();//Without rollback: Database has patient with incomplete schedule (BAD!)
    console.error('Patient creation failed:', err);
    res.status(500).json({ error: 'failed to create patient' });
  }
  finally {//finally runs always, whatever be the case
    conn.release();//CRITICAL! Returns connection to pool for reuse  
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


// Database Transactions (ACID Properties):
// // Atomicity: All operations succeed or all fail
// // Consistency: Database rules are never violated
// // Isolation: Other connections don't see partial changes
// // Durability: Once committed, changes survive crashes