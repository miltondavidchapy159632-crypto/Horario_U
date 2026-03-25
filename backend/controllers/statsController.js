const { getPool } = require('../config/db');

/**
 * Obtiene las estadísticas de horas por categoría.
 */
const getStats = async (req, res) => {
  const { dia } = req.query;
  console.log('--- GET /api/stats/ hit ---');
  console.log('Query Params:', req.query);
  try {
    const pool = await getPool();

    let whereClause = '';
    if (dia && dia !== 'Semana completa') {
      whereClause = 'WHERE mh.dia_semana = @dia';
    }
    console.log('Final whereClause:', whereClause);

    const query = `
      SELECT 
        cat.nombre_categoria as category,
        SUM(DATEDIFF(MINUTE, pb.hora_inicio, pb.hora_fin)) / 60.0 as hours
      FROM Mi_Horario mh
      JOIN Plantilla_Bloques pb ON mh.id_bloque = pb.id_bloque
      JOIN Categorias_Actividad cat ON mh.id_categoria = cat.id_categoria
      ${whereClause}
      GROUP BY cat.nombre_categoria
    `;

    const request = pool.request();
    if (whereClause) {
      request.input('dia', dia);
    }

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error interno al calcular estadísticas.', error });
  }
};

module.exports = { getStats };
