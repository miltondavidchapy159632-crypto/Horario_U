const { poolPromise } = require('./config/db');
const fs = require('fs');

async function check() {
  try {
    const pool = await poolPromise;
    const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
    console.log(tables.recordset.map(t => t.TABLE_NAME));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
