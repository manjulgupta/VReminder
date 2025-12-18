const pool = require('./db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM hospitals');
    console.log(rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
