const { poolPromise } = require('./config/db');

async function test() {
  const pool = await poolPromise;
  try {
    const insertQuery = `
      INSERT INTO Mi_Horario (id_bloque, id_curso, dia_semana, id_periodo, es_restringido)
      SELECT d.id_bloque, g.id_curso, d.dia_semana, d.id_periodo, 1
      FROM Detalle_Grupo_Horario d
      JOIN Grupos g ON d.id_grupo = g.id_grupo
      WHERE d.id_grupo = 1 AND d.id_periodo = 1
    `;
    await pool.request().query(insertQuery);
    console.log("Success");
  } catch(e) {
    console.error(e.message);
  }
  process.exit(0);
}
test();
