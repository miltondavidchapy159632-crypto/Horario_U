const { poolPromise } = require('../config/db');

/**
 * Obtiene el horario completo para renderizar el dashboard.
 * Realiza un LEFT JOIN entre Plantilla_Bloques y Mi_Horario.
 */
const getDashboard = async (req, res) => {
  const { id_periodo } = req.query;

  if (!id_periodo) {
    return res.status(400).json({ message: 'id_periodo es requerido.' });
  }

  try {
    const pool = await poolPromise;

    const query = `
      SELECT mh.id_horario, pb.id_bloque, pb.hora_inicio, pb.hora_fin, mh.dia_semana, mh.id_curso, mh.nombre_grupo AS actividad_personal, mh.es_restringido,
             c.codigo_curso, c.nombre_curso, cat.nombre_categoria
      FROM Plantilla_Bloques pb
      LEFT JOIN Mi_Horario mh ON pb.id_bloque = mh.id_bloque
      LEFT JOIN Cursos c ON mh.id_curso = c.id_curso
      LEFT JOIN Categorias_Actividad cat ON mh.id_categoria = cat.id_categoria
      ORDER BY pb.hora_inicio
    `;

    const result = await pool.request()
      .input('id_periodo', id_periodo)
      .query(query);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener el dashboard:', error);
    res.status(500).json({ message: 'Error al obtener el dashboard.', error });
  }
};

module.exports = {
  getDashboard,
};