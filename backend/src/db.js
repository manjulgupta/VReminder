// Purpose:
// Create and share a MySQL connection pool.
// Repository / service files that run SQL queries use this pool.

// Why pooling:
// Avoid opening a new DB connection per request.

// What this file does NOT do:
// - No queries
// - No schema logic
// - No business rules

// When I’ll revisit:
// Production deployment / scaling.

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // put your mysql password if any
  database: 'vacc_reminder'
});

module.exports = pool;
