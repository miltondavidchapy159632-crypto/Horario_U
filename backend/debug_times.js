const { getPool } = require('./config/db');

(async () => {
    const pool = await getPool();

    // 1. Check raw times from Bloques_Horario
    const r = await pool.request().query(`
        SELECT TOP 5 b.hora_inicio, b.hora_fin, m.dia_semana, c.nombre_curso 
        FROM Mi_Horario m 
        JOIN Bloques_Horario b ON m.id_bloque = b.id_bloque 
        JOIN Cursos c ON m.id_curso = c.id_curso
    `);
    
    console.log('=== RAW DB DATA ===');
    r.recordset.forEach(d => {
        console.log(`${d.dia_semana} | hora_inicio: ${d.hora_inicio} (type: ${typeof d.hora_inicio}) | ${d.nombre_curso}`);
    });

    // 2. Simulate what the frontend does
    console.log('\n=== FRONTEND SIMULATION ===');
    const now = new Date();
    const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    console.log(`Hoy es: ${daysMap[now.getDay()]}`);
    console.log(`Hora local: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);

    if (r.recordset.length > 0) {
        const sample = r.recordset[0];
        const d = new Date(sample.hora_inicio);
        console.log(`\nSample hora_inicio raw: ${sample.hora_inicio}`);
        console.log(`  new Date(hora_inicio): ${d}`);
        console.log(`  getHours(): ${d.getHours()}`);
        console.log(`  getUTCHours(): ${d.getUTCHours()}`);
        console.log(`  formatTime (UTC): ${d.getUTCHours().toString().padStart(2,'0')}:${d.getUTCMinutes().toString().padStart(2,'0')}`);
        console.log(`  formatTime (Local): ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`);
    }

    process.exit();
})();
