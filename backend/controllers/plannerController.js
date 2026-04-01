const { getPool } = require('../config/db');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

/**
 * Obtiene todos los hitos próximos de todos los cursos registrados.
 */
const getAllUpcomingHitos = async (req, res) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT h.*, c.nombre_curso, c.codigo_curso
            FROM Hitos_Academicos h
            JOIN Cursos c ON h.id_curso = c.id_curso
            WHERE h.fecha >= DATEADD(hour, -5, GETDATE()) 
            ORDER BY h.fecha ASC
        `;
        const result = await pool.request().query(query);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('[Planner] Error en getAllUpcomingHitos:', err);
        res.status(500).json({ message: 'Error al obtener hitos globales.', error: err.message });
    }
};

/**
 * Elimina un documento, borrando tanto el registro como el archivo físico.
 */
const deleteDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        
        // 1. Obtener la ruta del archivo antes de borrar el registro
        const docResult = await pool.request()
            .input('id', id)
            .query('SELECT ruta_archivo FROM Cursos_Documentos WHERE id_documento = @id');
            
        if (docResult.recordset.length > 0) {
            const doc = docResult.recordset[0];
            const normalizedPath = doc.ruta_archivo.replace(/^\//, '');
            const filePath = path.resolve(__dirname, '..', normalizedPath);
            
            // 2. Borrar archivo físico si existe
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('[Planner] Archivo físico eliminado:', filePath);
            }
        }

        // 3. Borrar registro de la base de datos
        await pool.request()
            .input('id', id)
            .query('DELETE FROM Cursos_Documentos WHERE id_documento = @id');
            
        res.json({ message: 'Documento eliminado correctamente.' });
    } catch (err) {
        console.error('[Planner] Error en deleteDocument:', err);
        res.status(500).json({ message: 'Error al eliminar documento.', error: err.message });
    }
};

/**
 * Analiza un PDF con Gemini AI para extraer hitos académicos.
 */
const analyzeSyllabus = async (req, res) => {
    const { id_documento } = req.body;
    if (!id_documento) return res.status(400).json({ message: 'id_documento requerido.' });

    try {
        console.log('[AI] Iniciando análisis para documento ID:', id_documento);
        const pool = await getPool();
        const docResult = await pool.request()
            .input('id', id_documento)
            .query('SELECT * FROM Cursos_Documentos WHERE id_documento = @id');

        if (docResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Documento no encontrado en la base de datos.' });
        }

        const doc = docResult.recordset[0];
        console.log('[AI] ruta_archivo en DB:', doc.ruta_archivo);

        // Detectar si es Word (.docx)
        if (doc.nombre_archivo && doc.nombre_archivo.toLowerCase().endsWith('.docx')) {
            return res.status(400).json({ message: 'El archivo es Word (.docx). Por favor sube la versión PDF del sílabo.' });
        }

        // Construir ruta absoluta: __dirname = backend/controllers/, .. sube a backend/
        const normalizedPath = doc.ruta_archivo.replace(/^\//, '');
        const finalPath = path.resolve(__dirname, '..', normalizedPath);
        console.log('[AI] Ruta absoluta:', finalPath);

        if (!fs.existsSync(finalPath)) {
            console.error('[AI] Archivo NO encontrado en:', finalPath);
            return res.status(404).json({ message: 'Archivo físico no encontrado.', tried: finalPath });
        }

        console.log('[AI] Leyendo PDF...');
        const dataBuffer = fs.readFileSync(finalPath);
        const pdfData = await pdf(dataBuffer);
        const textToAnalyze = pdfData.text.trim();

        if (!textToAnalyze || textToAnalyze.length < 20) {
            return res.status(400).json({ message: 'El PDF no tiene texto legible. Puede ser un PDF escaneado (imagen).' });
        }

        console.log('[AI] Texto extraído OK. Longitud:', textToAnalyze.length);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
        const prompt = `
Eres un asistente académico experto en sílabos universitarios peruanos.
Extrae TODOS los hitos académicos con fecha del siguiente texto.
Busca: Exámenes Parciales, Exámenes Finales, Prácticas Calificadas, Trabajos, Exposiciones, TIF.

REGLAS:
1. El año actual es 2026. Si dice "semana 4", cuenta 4 semanas desde 2026-08-25.
2. Clasifica el tipo como: "Examen", "Práctica", "Exposición", "Tarea" o "TIF".
3. Si no hay hora, usa 08:00.
4. Responde ÚNICAMENTE con un JSON array válido, sin markdown:
   [{"titulo":"string","tipo":"string","fecha":"YYYY-MM-DD HH:mm","descripcion":"string"}]
5. Si no encuentras nada, responde: []

TEXTO DEL SÍLABO:
${textToAnalyze.substring(0, 15000)}
        `;

        console.log('[AI] Enviando a Gemini...');
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        console.log('[AI] Respuesta Gemini (primeros 200c):', responseText.substring(0, 200));

        let hitosExtraidos = [];
        try {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                hitosExtraidos = JSON.parse(jsonMatch[0]);
            }
        } catch (parseErr) {
            console.error('[AI] Error parseando JSON:', parseErr.message);
        }

        console.log('[AI] Hitos encontrados:', hitosExtraidos.length);
        res.json({ message: 'Análisis IA completado.', hitos: hitosExtraidos });

    } catch (err) {
        console.error('[AI] Error CRÍTICO:', err.message);
        // Detectar error de cuota agotada
        if (err.status === 429 || (err.message && err.message.includes('429'))) {
            return res.status(429).json({ message: 'Cuota de la API de Google agotada. Espera unos minutos e intenta de nuevo.' });
        }
        res.status(500).json({ message: 'Error en el cerebro de IA.', error: err.message });
    }
};

module.exports = {
    getHitos,
    addHito,
    deleteHito,
    uploadDocument,
    getDocuments,
    getAllUpcomingHitos,
    deleteDocument,
    analyzeSyllabus
};
