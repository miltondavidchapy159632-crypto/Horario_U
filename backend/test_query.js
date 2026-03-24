const { poolPromise } = require('./config/db');
async function run() {
  const pool = await poolPromise;
  try {
    await pool.request().query('SELECT pb.id_bloque, pb.hora_inicio, pb.hora_fin, mh.dia_semana, mh.id_curso, mh.actividad_personal, mh.es_restringido FROM Plantilla_Bloques pb LEFT JOIN Mi_Horario mh ON pb.id_bloque = mh.id_bloque AND mh.id_periodo = 1');
    console.log("OK");
  } catch(e) { console.error(e.message); }
  process.exit();
}
run();
