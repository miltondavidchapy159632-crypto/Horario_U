const { poolPromise } = require('./config/db');
async function run() {
  const pool = await poolPromise;
  try {
    const q = `
      SELECT DISTINCT c.codigo_curso, c.nombre_curso, c.creditos, g.nombre_grupo, mh.id_curso
      FROM Mi_Horario mh
      JOIN Cursos c ON mh.id_curso = c.id_curso
      JOIN Grupos g ON mh.id_curso = g.id_curso
      WHERE mh.es_restringido = 1
    `;
    await pool.request().query(q);
    console.log("OK");
  } catch(e) { console.error(e.message); }
  process.exit();
}
run();
