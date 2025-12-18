const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }

  const [rows] = await pool.query(
    'SELECT * FROM admins WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const admin = rows[0];
  const ok = await bcrypt.compare(password, admin.password_hash);

  if (!ok) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  // “I, the server, assert that this person is adminId=1, 
  // hospitalId=1, role=admin, and I cryptographically sign this statement.”
  // 3 parts: HEADER.PAYLOAD.SIGNATURE

  const token = jwt.sign(
    {
      adminId: admin.id,
      hospitalId: admin.hospital_id,
      role: admin.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token });
});

module.exports = router;
