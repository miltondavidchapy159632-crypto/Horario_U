const { getPool } = require('../config/db');

/**
 * Obtiene todos los bloques horarios ordenados por hora de inicio.
 */
const getBlocks = async (req, res) => {
  try {
    const pool = await getPool();
    const query = `SELECT id_bloque, etiqueta, hora_inicio, hora_fin FROM Plantilla_Bloques ORDER BY hora_inicio`;
    const result = await pool.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * Valida si un rango de horas choca con bloques existentes.
 * @param {string} horaInicio - Formato "HH:mm"
 * @param {string} horaFin - Formato "HH:mm"
 * @param {number|null} excludeId - ID a excluir (para actualizaciones)
 */
const checkOverlap = async (pool, horaInicio, horaFin, excludeId = null) => {
  const query = `
    SELECT COUNT(*) AS count 
    FROM Plantilla_Bloques 
    WHERE (
      (CAST(hora_inicio AS TIME) < CAST(@hora_fin AS TIME) AND CAST(hora_fin AS TIME) > CAST(@hora_inicio AS TIME))
    )
    ${excludeId ? 'AND id_bloque <> @excludeId' : ''}
  `;
  
  const result = await pool.request()
    .input('hora_inicio', horaInicio)
    .input('hora_fin', horaFin)
    .input('excludeId', excludeId)
    .query(query);
    
  return result.recordset[0].count > 0;
};

/**
 * Añade un nuevo bloque con validación de traslape.
 */
const addBlock = async (req, res) => {
  const { horaInicio, horaFin, etiqueta } = req.body;
  if (!horaInicio || !horaFin) {
    return res.status(400).json({ message: 'Hora inicio y hora fin son requeridas.' });
  }

  try {
    const pool = await getPool();
    
    // Validar traslape
    const isOverlapping = await checkOverlap(pool, horaInicio, horaFin);
    if (isOverlapping) {
      return res.status(400).json({ message: 'El horario choca con un bloque ya existente.' });
    }

    const query = `
      INSERT INTO Plantilla_Bloques (etiqueta, hora_inicio, hora_fin)
      VALUES (@etiqueta, @hora_inicio, @hora_fin)
    `;
    await pool.request()
      .input('etiqueta', etiqueta || 'Extra')
      .input('hora_inicio', `1970-01-01T${horaInicio}:00Z`)
      .input('hora_fin', `1970-01-01T${horaFin}:00Z`)
      .query(query);
    
    res.status(200).json({ message: 'Bloque añadido correctamente.' });
  } catch (error) {
    console.error('Error adding block:', error);
    res.status(500).json({ message: 'Error interno al añadir bloque.' });
  }
};

/**
 * Actualiza un bloque existente.
 */
const updateBlock = async (req, res) => {
  const { id } = req.params;
  const { horaInicio, horaFin, etiqueta } = req.body;

  try {
    const pool = await getPool();

    // Validar traslape excluyendo el actual
    const isOverlapping = await checkOverlap(pool, horaInicio, horaFin, id);
    if (isOverlapping) {
      return res.status(400).json({ message: 'El nuevo horario choca con otro bloque existente.' });
    }

    const query = `
      UPDATE Plantilla_Bloques 
      SET etiqueta = @etiqueta, 
          hora_inicio = @hora_inicio, 
          hora_fin = @hora_fin
      WHERE id_bloque = @id
    `;
    await pool.request()
      .input('id', id)
      .input('etiqueta', etiqueta)
      .input('hora_inicio', `1970-01-01T${horaInicio}:00Z`)
      .input('hora_fin', `1970-01-01T${horaFin}:00Z`)
      .query(query);

    res.status(200).json({ message: 'Bloque actualizado correctamente.' });
  } catch (error) {
    console.error('Error updating block:', error);
    res.status(500).json({ message: 'Error al actualizar el bloque.' });
  }
};

/**
 * Elimina un bloque.
 */
const deleteBlock = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    
    // Primero verificamos si hay registros en Mi_Horario que usen este bloque
    const checkQuery = `SELECT COUNT(*) AS count FROM Mi_Horario WHERE id_bloque = @id`;
    const checkRes = await pool.request().input('id', id).query(checkQuery);
    
    if (checkRes.recordset[0].count > 0) {
      return res.status(400).json({ message: 'No se puede eliminar: Hay clases o actividades registradas en este horario.' });
    }

    const query = `DELETE FROM Plantilla_Bloques WHERE id_bloque = @id`;
    await pool.request().input('id', id).query(query);

    res.status(200).json({ message: 'Bloque eliminado correctamente.' });
  } catch (error) {
    console.error('Error deleting block:', error);
    res.status(500).json({ message: 'Error al eliminar el bloque.' });
  }
};

module.exports = { getBlocks, addBlock, updateBlock, deleteBlock };
