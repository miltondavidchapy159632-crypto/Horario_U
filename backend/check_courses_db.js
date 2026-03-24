const { poolPromise } = require('./config/db');
const fs = require('fs');

async function check() {
  try {
    const pool = await poolPromise;
    const tables = ['Grupos', 'Cursos'];
    const result = {};

    for (const table of tables) {
      const cols = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`);
      const data = await pool.request().query(`SELECT TOP 5 * FROM ${table}`);
      result[table] = {
        columns: cols.recordset,
        data: data.recordset
      };
    }
    
    fs.writeFileSync('courses_dump.json', JSON.stringify(result, null, 2));
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
