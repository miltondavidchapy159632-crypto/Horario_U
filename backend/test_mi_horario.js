const { poolPromise } = require('./config/db');
const fs = require('fs');

async function test() {
  const pool = await poolPromise;
  const res = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Mi_Horario'");
  fs.writeFileSync('schema_mi_horario.json', JSON.stringify(res.recordset, null, 2));
  process.exit();
}
test();
