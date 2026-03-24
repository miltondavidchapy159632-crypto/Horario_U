const sql = require('mssql');
const { poolPromise } = require('./config/db');

async function test() {
  try {
    const pool = await poolPromise;
    const res = await pool.request().query('SELECT 1 as num');
    console.log('SUCCESS:', res.recordset);
    process.exit(0);
  } catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
  }
}
test();
