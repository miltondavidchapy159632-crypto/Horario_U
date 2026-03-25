const { getPool } = require('../config/db');

const getCatalog = async (req, res) => {
  try {
    const pool = await getPool();
    const cursosQuery = `SELECT * FROM Cursos`;
    const gruposQuery = `SELECT DISTINCT nombre_grupo_tipo FROM Reglas_Grupos_UNP`;
    
    const cursosRes = await pool.request().query(cursosQuery);
    const gruposRes = await pool.request().query(gruposQuery);
    
    res.status(200).json({
      cursos: cursosRes.recordset,
      grupos: gruposRes.recordset.map(g => g.nombre_grupo_tipo)
    });
  } catch (error) {
    console.error('Error al obtener catalogo:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getInscribedCourses = async (req, res) => {
  try {
    const pool = await getPool();
    // Mi_Horario tiene id_curso y nombre_grupo. Seleccionamos lo que hay.
    const query = `
      SELECT c.codigo_curso, c.nombre_curso, c.creditos, mh.nombre_grupo, mh.id_curso,
             mh.dia_semana, pb.hora_inicio, pb.hora_fin
      FROM Mi_Horario mh
      JOIN Cursos c ON mh.id_curso = c.id_curso
      JOIN Plantilla_Bloques pb ON mh.id_bloque = pb.id_bloque
      WHERE mh.es_restringido = 1
      ORDER BY mh.id_curso, mh.dia_semana, pb.hora_inicio
    `;
    const result = await pool.request().query(query);

    const coursesMap = new Map();
    result.recordset.forEach(row => {
      if (!coursesMap.has(row.id_curso)) {
        coursesMap.set(row.id_curso, {
          codigo_curso: row.codigo_curso,
          nombre_curso: row.nombre_curso,
          creditos: row.creditos,
          nombre_grupo: row.nombre_grupo,
          id_curso: row.id_curso,
          dias: new Set(),
          horas: []
        });
      }
      const course = coursesMap.get(row.id_curso);
      course.dias.add(row.dia_semana);
      course.horas.push({ start: row.hora_inicio, end: row.hora_fin });
    });

    const formatTime = (d) => {
      if (!d) return "";
      const date = new Date(d);
      return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
    };

    const finalCourses = Array.from(coursesMap.values()).map(c => {
      let minH = "23:59";
      let maxH = "00:00";

      c.horas.forEach(h => {
        const startStr = formatTime(h.start);
        const endStr = formatTime(h.end);
        if (startStr < minH) minH = startStr;
        if (endStr > maxH) maxH = endStr;
      });

      return {
        codigo_curso: c.codigo_curso,
        nombre_curso: c.nombre_curso,
        creditos: c.creditos,
        nombre_grupo: c.nombre_grupo,
        id_curso: c.id_curso,
        dias: Array.from(c.dias).join(', '),
        rango_horas: minH !== "23:59" ? `${minH} - ${maxH}` : "No definido"
      };
    });

    res.status(200).json(finalCourses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching enrolled courses' });
  }
};

module.exports = { getCatalog, getInscribedCourses };
