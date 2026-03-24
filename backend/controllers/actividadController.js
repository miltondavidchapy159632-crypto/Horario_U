const { poolPromise } = require('../config/db');

/**
 * Añade una actividad personal al horario.
 * @param {Object} datos - Datos de la actividad personal.
 */
const addActividadPersonal = async (req, res) => {
  const { id_bloque, dia_semana, actividad_personal, tipo } = req.body;

  if (!id_bloque || !dia_semana || !actividad_personal || !tipo) {
    return res.status(400).json({ message: 'Todos los campos son requeridos, incluyendo el Tipo.' });
  }

  try {
    const pool = await poolPromise;

    // Verificar si el bloque ya está ocupado
    const checkQuery = `
      SELECT COUNT(*) AS count
      FROM Mi_Horario
      WHERE id_bloque = @id_bloque AND dia_semana = @dia_semana AND es_restringido = 1
    `;

    const checkResult = await pool.request()
      .input('id_bloque', id_bloque)
      .input('dia_semana', dia_semana)
      .query(checkQuery);

    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({ message: 'El bloque ya está ocupado por una actividad restringida.' });
    }

    // Eliminar actividad personal anterior en el mismo bloque si existe (UPSERT logic)
    const deleteQuery = `
      DELETE FROM Mi_Horario
      WHERE id_bloque = @id_bloque AND dia_semana = @dia_semana AND es_restringido = 0
    `;
    await pool.request()
      .input('id_bloque', id_bloque)
      .input('dia_semana', dia_semana)
      .query(deleteQuery);

    // Insertar la actividad personal mapeando el Category ID
    const insertQuery = `
      DECLARE @id_cat INT;
      SELECT @id_cat = id_categoria FROM Categorias_Actividad WHERE nombre_categoria = @tipo;

      INSERT INTO Mi_Horario (id_bloque, dia_semana, nombre_grupo, es_restringido, id_categoria)
      VALUES (@id_bloque, @dia_semana, @nombre_grupo, 0, @id_cat)
    `;

    await pool.request()
      .input('id_bloque', id_bloque)
      .input('dia_semana', dia_semana)
      .input('nombre_grupo', actividad_personal)
      .input('tipo', tipo)
      .query(insertQuery);

    res.status(200).json({ message: 'Actividad personal añadida exitosamente.' });
  } catch (error) {
    console.error('Error al añadir la actividad personal:', error);
    res.status(500).json({ message: 'Error al añadir la actividad personal.', error });
  }
};

/**
 * Mueve una actividad ya existente a una nueva posición.
 */
const moveActividad = async (req, res) => {
  const { id_horario, nuevo_id_bloque, nuevo_dia_semana } = req.body;

  if (!id_horario || !nuevo_id_bloque || !nuevo_dia_semana) {
    return res.status(400).json({ message: 'Todos los campos son requeridos para el movimiento.' });
  }

  try {
    const pool = await poolPromise;
    const query = `
      UPDATE Mi_Horario 
      SET id_bloque = @nuevo_id_bloque, dia_semana = @nuevo_dia_semana
      WHERE id_horario = @id_horario
    `;

    await pool.request()
      .input('id_horario', id_horario)
      .input('nuevo_id_bloque', nuevo_id_bloque)
      .input('nuevo_dia_semana', nuevo_dia_semana)
      .query(query);

    res.status(200).json({ message: 'Actividad movida exitosamente.' });
  } catch (error) {
    console.error('Error al mover actividad:', error);
    res.status(500).json({ message: 'Error interno al mover la actividad.', error });
  }
};

/**
 * Elimina una actividad personal del horario.
 */
const deleteActividad = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const query = `
      DELETE FROM Mi_Horario 
      WHERE id_horario = @id AND es_restringido = 0
    `;

    const result = await pool.request()
      .input('id', id)
      .query(query);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: 'Actividad eliminada exitosamente.' });
    } else {
      res.status(404).json({ message: 'Actividad no encontrada o es restringida.' });
    }
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    res.status(500).json({ message: 'Error interno al eliminar la actividad.', error });
  }
};

module.exports = {
  addActividadPersonal,
  moveActividad,
  deleteActividad
};