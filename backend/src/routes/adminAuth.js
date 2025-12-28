// dependencies:
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // After login, server gives you a signed token. 
// You send this token with future requests instead of username/password every time.
const pool = require('../db'); //Connection to your MySQL database
const router = express.Router(); //Creates a mini-application that can handle routes
//Benefit: You can organize routes by feature (adminAuth routes, parent routes, etc.) 
// then combine them in your main server file

//refer reminderJob.js for async, await

// handles the post request to /api/admin/login; refer Login.jsx in frontend
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}; //dereferencing

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
    //400 - HTTP status code for "Bad Request" (client's fault)
  }

  const [rows] = await pool.query( //[rows] - destructuring
    'SELECT * FROM admins WHERE email = ?',
    [email]
    // BAD (SQL injection vulnerable): 'SELECT * FROM admins WHERE email = ' + email
    // GOOD: The ? is safely replaced with [email] value
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: 'invalid credentials' });
    //401 - "Unauthorized" status code
  }

  const admin = rows[0];

  // Guard against bad seeded passwords
  if (!admin.password_hash || !admin.password_hash.startsWith('$2')) {
    // Why this exists: Defensive programming: $2 - bcrypt hashes start with $2a$, $2b$, or $2y$
    // Scenario: If someone manually inserted admin in database without proper hashing, this catches it
    return res.status(500).json({
      error: 'admin password misconfigured'
    });
  }

  // await because bcrypt.compare is async. 
  const ok = await bcrypt.compare(password, admin.password_hash);

  if (!ok) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  // “I, the server, assert that this person is adminId=1, 
  // hospitalId=1, role=admin, and I cryptographically sign this statement.”
  // 3 parts: HEADER.PAYLOAD.SIGNATURE
  //   **What is JWT?** A token with 3 parts:  
  // 1. **HEADER** - metadata (algorithm used)
  // 2. **PAYLOAD** - your data (adminId, hospitalId, role) - NOT encrypted, anyone can read this!
  // 3. **SIGNATURE** - cryptographic proof using JWT_SECRET that server created this
  const token = jwt.sign(
    {
      adminId: admin.id,
      hospitalId: admin.hospital_id,
      role: admin.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
    // JWT contains iat (issued at) time and exp (expiration time) so server will reject it.
  );

  res.json({ token });
  //Returns: { "token": "eyJhbGciOiJ..." }
  // What client does: Stores this token (usually in memory or localStorage) 
  // and sends it with future requests in Authorization header
  // MOST PROBABLY STORED IN FRONTEND. CHECK LATER AND UPDATE
});

module.exports = router;
