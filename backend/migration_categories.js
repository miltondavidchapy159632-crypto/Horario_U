const { getPool } = require('./config/db');

async function migrate() {
  try {
    const pool = await getPool();
    // 1. Create table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categorias_Actividad' AND xtype='U')
      CREATE TABLE Categorias_Actividad (
        id_categoria INT IDENTITY(1,1) PRIMARY KEY,
        nombre_categoria VARCHAR(50) NOT NULL UNIQUE
      );
    `);

    // 2. Insert defaults ignoring duplicates safely
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM Categorias_Actividad WHERE nombre_categoria = 'Universidad')
        INSERT INTO Categorias_Actividad (nombre_categoria) VALUES ('Universidad');
        
      IF NOT EXISTS (SELECT * FROM Categorias_Actividad WHERE nombre_categoria = 'Estudio')
        INSERT INTO Categorias_Actividad (nombre_categoria) VALUES ('Estudio');
        
      IF NOT EXISTS (SELECT * FROM Categorias_Actividad WHERE nombre_categoria = 'Habitos')
        INSERT INTO Categorias_Actividad (nombre_categoria) VALUES ('Habitos');
        
      IF NOT EXISTS (SELECT * FROM Categorias_Actividad WHERE nombre_categoria = 'Entrenamiento')
        INSERT INTO Categorias_Actividad (nombre_categoria) VALUES ('Entrenamiento');
    `);

    // 3. Add column to Mi_Horario
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Mi_Horario' AND COLUMN_NAME = 'id_categoria'
      )
      ALTER TABLE Mi_Horario ADD id_categoria INT FOREIGN KEY REFERENCES Categorias_Actividad(id_categoria);
    `);

    // 4. Update existing Mi_Horario rows seamlessly
    await pool.request().query(`
      UPDATE Mi_Horario 
      SET id_categoria = (SELECT top 1 id_categoria FROM Categorias_Actividad WHERE nombre_categoria = 'Universidad')
      WHERE es_restringido = 1 AND id_categoria IS NULL;
    `);

    console.log('Migración de Categorías completada con éxito.');
  } catch (err) {
    console.error('Error migrando:', err);
  } finally {
    process.exit();
  }
}
migrate();
