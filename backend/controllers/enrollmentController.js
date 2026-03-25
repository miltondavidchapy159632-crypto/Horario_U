const { getPool } = require('../config/db');

/**
 * Inscribe un grupo en el horario del usuario.
 * @param {number} id_grupo - ID del grupo a inscribir.
 * @param {number} id_periodo - ID del periodo académico.
 */
const inscribirGrupo = async (req, res) => {
  const { id_grupo, id_curso } = req.body;

  if (!id_grupo || !id_curso) {
    return res.status(400).json({ message: 'El nombre del grupo y el id_curso son requeridos.' });
  }

  try {
    const pool = await getPool();

    // Verificar si los bloques están ocupados por otro CURSO (es_restringido = 1)
    const checkQuery = `
      SELECT COUNT(*) AS count
      FROM Mi_Horario mh
      JOIN Reglas_Grupos_UNP r 
        ON mh.id_bloque = r.id_bloque AND mh.dia_semana = r.dia_semana
      WHERE r.nombre_grupo_tipo = @id_grupo AND mh.es_restringido = 1
    `;

    const checkResult = await pool.request()
      .input('id_grupo', id_grupo)
      .query(checkQuery);

    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({ message: 'Choque de horario: Algunos bloques ya están ocupados por otro curso oficial.' });
    }

    // Si está ocupado por hobbies/personal (es_restringido = 0), los eliminamos para hacer espacio
    const deleteQuery = `
      DELETE mh
      FROM Mi_Horario mh
      JOIN Reglas_Grupos_UNP r
        ON mh.id_bloque = r.id_bloque AND mh.dia_semana = r.dia_semana
      WHERE r.nombre_grupo_tipo = @id_grupo AND mh.es_restringido = 0
    `;

    await pool.request()
      .input('id_grupo', id_grupo)
      .query(deleteQuery);

    // Insertar los bloques en Mi_Horario
    const insertQuery = `
      DECLARE @id_cat_uni INT;
      SELECT @id_cat_uni = id_categoria FROM Categorias_Actividad WHERE nombre_categoria = 'Universidad';
      
      INSERT INTO Mi_Horario (id_bloque, id_curso, dia_semana, nombre_grupo, es_restringido, id_categoria)
      SELECT r.id_bloque, @id_curso, r.dia_semana, r.nombre_grupo_tipo, 1, @id_cat_uni
      FROM Reglas_Grupos_UNP r
      WHERE r.nombre_grupo_tipo = @id_grupo
    `;

    await pool.request()
      .input('id_grupo', id_grupo)
      .input('id_curso', id_curso)
      .query(insertQuery);

    res.status(200).json({ message: 'Grupo inscrito exitosamente en Mi_Horario.' });
  } catch (error) {
    console.error('Error al inscribir el grupo:', error);
    res.status(500).json({ message: 'Error al inscribir el grupo.', error });
  }
};

/**
 * Elimina un grupo del horario (desinscripción).
 */
const desinscribirGrupo = async (req, res) => {
  const { id_curso, nombre_grupo } = req.body;

  if (!id_curso || !nombre_grupo) {
    return res.status(400).json({ message: 'El id_curso y el nombre del grupo son requeridos.' });
  }

  try {
    const pool = await getPool();
    const query = `
      DELETE FROM Mi_Horario 
      WHERE id_curso = @id_curso AND nombre_grupo = @nombre_grupo AND es_restringido = 1
    `;

    const result = await pool.request()
      .input('id_curso', id_curso)
      .input('nombre_grupo', nombre_grupo)
      .query(query);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: 'Curso desinscrito exitosamente.' });
    } else {
      res.status(404).json({ message: 'No se encontró el curso inscrito o ya fue eliminado.' });
    }
  } catch (error) {
    console.error('Error al desinscribir el grupo:', error);
    res.status(500).json({ message: 'Error interno al desinscribir el grupo.', error });
  }
};

module.exports = {
  inscribirGrupo,
  desinscribirGrupo
};