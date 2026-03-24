const { poolPromise } = require('./config/db');
const fs = require('fs');
async function run() {
  const pool = await poolPromise;
  const res = await pool.request().query("SELECT * FROM Mi_Horario");
  fs.writeFileSync('mi_horario_dump.json', JSON.stringify(res.recordset, null, 2));
  process.exit();
}
run();
