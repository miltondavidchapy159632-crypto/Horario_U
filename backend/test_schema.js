const { poolPromise } = require('./config/db');
const fs = require('fs');
async function run() {
  const pool = await poolPromise;
  const res1 = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Reglas_Grupos_UNP'");
  const res2 = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Cursos'");
  fs.writeFileSync('schema_new.json', JSON.stringify({ Reglas: res1.recordset, Cursos: res2.recordset }, null, 2));
  process.exit();
}
run();
