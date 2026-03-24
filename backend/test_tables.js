const { poolPromise } = require('./config/db');
const fs = require('fs');
async function run() {
  const pool = await poolPromise;
  const res = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'");
  fs.writeFileSync('tables_dump.json', JSON.stringify(res.recordset, null, 2));
  process.exit();
}
run();
