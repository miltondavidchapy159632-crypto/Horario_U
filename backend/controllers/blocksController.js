const { poolPromise } = require('../config/db');

const getBlocks = async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `SELECT id_bloque, etiqueta, hora_inicio, hora_fin FROM Plantilla_Bloques ORDER BY hora_inicio`;
    const result = await pool.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const addBlock = async (req, res) => {
  const { horaInicio, horaFin, etiqueta } = req.body;
  if (!horaInicio || !horaFin) {
    return res.status(400).json({ message: 'Hora inicio y hora fin son requeridas' });
  }

  try {
    const pool = await poolPromise;
    const query = `
      INSERT INTO Plantilla_Bloques (etiqueta, hora_inicio, hora_fin)
      VALUES (@etiqueta, @hora_inicio, @hora_fin)
    `;
    await pool.request()
      .input('etiqueta', etiqueta || 'Extra')
      .input('hora_inicio', horaInicio)
      .input('hora_fin', horaFin)
      .query(query);
    
    res.status(200).json({ message: 'Bloque añadido correctamente' });
  } catch (error) {
    console.error('Error adding block:', error);
    res.status(500).json({ message: 'Error interno del servidor al añadir bloque.' });
  }
};

module.exports = { getBlocks, addBlock };
