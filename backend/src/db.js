const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // put your mysql password if any
  database: 'vacc_reminder'
});

module.exports = pool;
