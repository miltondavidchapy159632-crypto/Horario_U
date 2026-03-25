const { getPool } = require('../config/db');
const path = require('path');
const fs = require('fs');

/**
 * Obtiene los hitos académicos de un curso.
 */
const getHitos = async (req, res) => {
    const { id_curso } = req.query;
    if (!id_curso) return res.status(400).json({ message: 'id_curso es requerido.' });

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id_curso', id_curso)
            .query('SELECT * FROM Hitos_Academicos WHERE id_curso = @id_curso ORDER BY fecha ASC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener hitos.', error: err });
    }
};

/**
 * Añade un nuevo hito académico.
 */
const addHito = async (req, res) => {
    const { id_curso, titulo, tipo, fecha, descripcion } = req.body;
    console.log('[Planner] Intentando añadir hito:', { id_curso, titulo, tipo, fecha });

    if (!id_curso || !titulo || !tipo || !fecha) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.', received: req.body });
    }

    try {
        const pool = await getPool();
        // Convertimos la fecha de ISO/HTML a un objeto Date de JS para que mssql lo maneje bien
        const fechaObj = new Date(fecha);

        await pool.request()
            .input('id_curso', id_curso)
            .input('titulo', titulo)
            .input('tipo', tipo)
            .input('fecha', fechaObj)
            .input('descripcion', descripcion || '')
            .query(`
                INSERT INTO Hitos_Academicos (id_curso, titulo, tipo, fecha, descripcion)
                VALUES (@id_curso, @titulo, @tipo, @fecha, @descripcion)
            `);
        console.log('[Planner] Hito creado con éxito');
        res.status(201).json({ message: 'Hito creado exitosamente.' });
    } catch (err) {
        console.error('[Planner] Error en addHito:', err);
        res.status(500).json({ message: 'Error al crear hito.', error: err.message });
    }
};

/**
 * Elimina un hito académico.
 */
const deleteHito = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        await pool.request()
            .input('id', id)
            .query('DELETE FROM Hitos_Academicos WHERE id_hito = @id');
        res.json({ message: 'Hito eliminado.' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar hito.', error: err });
    }
};

/**
 * Sube un documento y lo asocia a un curso.
 */
const uploadDocument = async (req, res) => {
    const { id_curso } = req.body;
    if (!id_curso || !req.file) {
        return res.status(400).json({ message: 'Faltan datos o archivo.' });
    }

    try {
        const pool = await getPool();
        const rutaRelativa = `/uploads/${req.file.filename}`;
        
        await pool.request()
            .input('id_curso', id_curso)
            .input('nombre_archivo', req.file.originalname)
            .input('ruta_archivo', rutaRelativa)
            .query(`
                INSERT INTO Cursos_Documentos (id_curso, nombre_archivo, ruta_archivo)
                VALUES (@id_curso, @nombre_archivo, @ruta_archivo)
            `);
        res.status(201).json({ message: 'Archivo subido correctamente.', ruta: rutaRelativa });
    } catch (err) {
        res.status(500).json({ message: 'Error al registrar documento.', error: err });
    }
};

/**
 * Obtiene los documentos de un curso.
 */
const getDocuments = async (req, res) => {
    const { id_curso } = req.query;
    if (!id_curso) return res.status(400).json({ message: 'id_curso es requerido.' });

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id_curso', id_curso)
            .query('SELECT * FROM Cursos_Documentos WHERE id_curso = @id_curso ORDER BY fecha_subida DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener documentos.', error: err });
    }
};

module.exports = {
    getHitos,
    addHito,
    deleteHito,
    uploadDocument,
    getDocuments
};
