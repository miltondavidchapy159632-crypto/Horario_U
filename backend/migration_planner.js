const { getPool } = require('./config/db');

async function migratePlanner() {
    try {
        const pool = await getPool();
        console.log('--- Iniciando Migración Planificador ---');

        // 1. Tabla Cursos_Documentos
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cursos_Documentos')
            BEGIN
                CREATE TABLE Cursos_Documentos (
                    id_documento INT PRIMARY KEY IDENTITY(1,1),
                    id_curso INT NOT NULL,
                    nombre_archivo NVARCHAR(255) NOT NULL,
                    ruta_archivo NVARCHAR(500) NOT NULL,
                    fecha_subida DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso) ON DELETE CASCADE
                );
                PRINT 'Tabla Cursos_Documentos creada.';
            END
        `);

        // 2. Tabla Hitos_Academicos
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Hitos_Academicos')
            BEGIN
                CREATE TABLE Hitos_Academicos (
                    id_hito INT PRIMARY KEY IDENTITY(1,1),
                    id_curso INT NOT NULL,
                    titulo NVARCHAR(255) NOT NULL,
                    tipo NVARCHAR(50) NOT NULL,
                    fecha DATETIME NOT NULL,
                    descripcion NVARCHAR(MAX),
                    notificado BIT DEFAULT 0,
                    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso) ON DELETE CASCADE
                );
                PRINT 'Tabla Hitos_Academicos creada.';
            END
        `);

        console.log('--- Migración Completada Exitosamente ---');
        process.exit(0);
    } catch (err) {
        console.error('Error en la migración:', err);
        process.exit(1);
    }
}

migratePlanner();
