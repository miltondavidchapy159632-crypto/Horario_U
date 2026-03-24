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

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('--- Conexión a SQL Server establecida con éxito ---');
    return pool;
  })
  .catch((err) => {
    console.error('--- ERROR CRÍTICO DE CONEXIÓN A DB ---');
    console.error(err);
    // No lanzamos el error para evitar que el proceso Node se cierre.
    // Los controladores recibirán un error de conexión al intentar usar el pool.
    return null; 
  });

module.exports = {
  sql,
  poolPromise,
};