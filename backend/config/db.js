const sql = require('mssql');

const config = {
  user: 'Admin_Horario_N', // Usuario de la base de datos
  password: 'CHAPY159632&', // Contraseña de la base de datos
  server: 'LAPTOP-QUMU1VVP\\SQL2025', // Nombre del servidor SQL Server
  database: 'Horarios_2026_1', // Nombre de la base de datos
  options: {
    encrypt: true, // Usar true si estás usando Azure SQL, de lo contrario false
    trustServerCertificate: true, // Cambiar según sea necesario
  },
};

let pool = null;

const getPool = async () => {
  if (pool) return pool;

  try {
    pool = await new sql.ConnectionPool(config).connect();
    console.log('--- Conexión a SQL Server establecida con éxito ---');
    
    // Si la conexión se cierra, la reseteamos para re-intentar en la próxima llamada
    pool.on('error', (err) => {
      console.error('--- ERROR EN EL POOL DE SQL ---', err);
      pool = null;
    });

    return pool;
  } catch (err) {
    console.error('--- ERROR AL INTENTAR CONECTAR A SQL SERVER ---');
    console.error(err.message);
    pool = null;
    throw err; // El controlador manejará el error y enviará 500
  }
};

module.exports = {
  sql,
  getPool,
};