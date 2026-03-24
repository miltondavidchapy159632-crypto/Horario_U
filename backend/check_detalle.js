const { poolPromise } = require('./config/db');
const fs = require('fs');

async function run() {
  const pool = await poolPromise;
  const res = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Detalle_Grupo_Horario'");
  fs.writeFileSync('schema_detalle.json', JSON.stringify(res.recordset, null, 2));
  process.exit(0);
}
run();
