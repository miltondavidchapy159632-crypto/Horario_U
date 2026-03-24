const { poolPromise } = require('./config/db');
const fs = require('fs');

async function check() {
  const pool = await poolPromise;
  const tables = ['Mi_Horario', 'Detalle_Grupo_Horario'];
  
  const result = {};

  for (const table of tables) {
    const cols = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`);
    const data = await pool.request().query(`SELECT TOP 5 * FROM ${table}`);
    result[table] = {
      columns: cols.recordset,
      sampleData: data.recordset
    };
  }
  
  fs.writeFileSync('db_dump.json', JSON.stringify(result, null, 2));
  console.log('Done');
  process.exit(0);
}

check().catch(console.error);
