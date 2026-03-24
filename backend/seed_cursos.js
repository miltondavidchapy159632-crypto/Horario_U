const { poolPromise } = require('./config/db');

const cursosData = [
  // CICLO I
  {codigo: "ED1292", nombre: "ACTIVIDAD DEPORTIVA", creditos: 2},
  {codigo: "SI1447", nombre: "ALGORITMOS", creditos: 4},
  {codigo: "ED1331", nombre: "COMUNICACION", creditos: 3},
  {codigo: "MA1470", nombre: "GEOMETRIA ANALITICA", creditos: 4},
  {codigo: "SI1358", nombre: "HERRAMIENTAS OFIMATICAS PARA LA VIDA UNIVERSITARIA", creditos: 3},
  {codigo: "SI1216", nombre: "INTRODUCCION A LA INGENIERIA INFORMATICA", creditos: 2},
  {codigo: "MA1408", nombre: "MATEMATICA BASICA", creditos: 4},
  {codigo: "ED1297", nombre: "METODOLOGIA DE LOS ESTUDIOS SUPERIORES UNIVERSITARIOS", creditos: 2},
  // CICLO II
  {codigo: "CB1324", nombre: "BIOLOGIA Y EDUCACION AMBIENTAL", creditos: 3},
  {codigo: "MA1435", nombre: "CALCULO I", creditos: 4},
  {codigo: "FI1363", nombre: "CONCEPCION FISICA DEL UNIVERSO", creditos: 3},
  {codigo: "SI1445", nombre: "ESTRUCTURAS DISCRETAS", creditos: 4},
  {codigo: "CS1286", nombre: "FILOSOFIA Y ETICA", creditos: 2},
  {codigo: "SI1435", nombre: "PROGRAMACION I", creditos: 4},
  {codigo: "QU1363", nombre: "QUIMICA GENERAL", creditos: 3},
  // CICLO III
  {codigo: "CA2337", nombre: "ADMINISTRACION", creditos: 3},
  {codigo: "MA2441", nombre: "CALCULO II", creditos: 4},
  {codigo: "EC2201", nombre: "ECONOMIA GENERAL", creditos: 2},
  {codigo: "FI2410", nombre: "FISICA I", creditos: 4},
  {codigo: "SI2422", nombre: "PROGRAMACION II", creditos: 4},
  {codigo: "CS2397", nombre: "REALIDAD NACIONAL Y REGIONAL", creditos: 3},
  {codigo: "CS2258", nombre: "SOCIOLOGIA", creditos: 2},
  {codigo: "ED2278", nombre: "TALLER DE ARTE", creditos: 2},
  // CICLO IV
  {codigo: "CA2101", nombre: "ACTIVIDAD DE RESPONSABILIDAD SOCIAL UNIVERSITARIA", creditos: 1},
  {codigo: "MA2333", nombre: "ALGEBRA LINEAL", creditos: 3},
  {codigo: "ES2300", nombre: "ESTADISTICA GENERAL", creditos: 3},
  {codigo: "SI2418", nombre: "ESTRUCTURA DE DATOS", creditos: 4},
  {codigo: "FI2411", nombre: "FISICA II", creditos: 4},
  {codigo: "SI2452", nombre: "INGENIERIA DE PROCESOS DE NEGOCIOS", creditos: 4},
  {codigo: "CO2201", nombre: "INTRODUCCION A LA CONTABILIDAD", creditos: 2},
  {codigo: "CS2259", nombre: "PSICOLOGIA GENERAL", creditos: 2},
  // CICLO V
  {codigo: "SI3422", nombre: "ANALISIS Y DISEÑO DE SISTEMAS I", creditos: 4},
  {codigo: "MA3412", nombre: "CALCULO III", creditos: 4},
  {codigo: "FI3492", nombre: "CIRCUITOS ELECTRICOS Y ELECTRONICOS", creditos: 4},
  {codigo: "ED3286", nombre: "DISCAPACIDAD Y DERECHOS HUMANOS", creditos: 2},
  {codigo: "ED3283", nombre: "INGLES I", creditos: 2},
  {codigo: "SI3421", nombre: "MODELADO DE DATOS", creditos: 4},
  {codigo: "SI3331", nombre: "APLICACIONES AVANZADAS CON HOJAS DE CALCULO", creditos: 3},
  {codigo: "SI3334", nombre: "INTRODUCCION A LOS ENTORNOS OPERATIVOS", creditos: 3},
  // CICLO VI
  {codigo: "SI3423", nombre: "ANALISIS Y DISEÑO DE SISTEMAS II", creditos: 4},
  {codigo: "SI3400", nombre: "ARQUITECTURA DE COMPUTADORES", creditos: 4},
  {codigo: "SI3420", nombre: "BASE DE DATOS", creditos: 4},
  {codigo: "ED3287", nombre: "DEFENSA NACIONAL", creditos: 2},
  {codigo: "ES3336", nombre: "INFERENCIA Y PROBABILIDADES", creditos: 3},
  {codigo: "ED3284", nombre: "INGLES II", creditos: 2},
  {codigo: "ED3285", nombre: "TALLER DE REDACCION CIENTIFICA", creditos: 2},
  {codigo: "SI3337", nombre: "ANALISIS DE ALGORITMOS", creditos: 3},
  {codigo: "SI3336", nombre: "GRAFICOS POR COMPUTADORAS", creditos: 3},
  {codigo: "AA3303", nombre: "LOGISTICA EMPRESARIAL", creditos: 3},
  {codigo: "SI3335", nombre: "TEORIA DE COMPILADORES", creditos: 3},
  // CICLO VII
  {codigo: "IO4447", nombre: "DISEÑOS DE INVESTIGACION PARA INGENIERIA", creditos: 4},
  {codigo: "CA4221", nombre: "EMPRENDEDURISMO", creditos: 2},
  {codigo: "IO4448", nombre: "INVESTIGACION DE OPERACIONES", creditos: 4},
  {codigo: "SI4386", nombre: "PROGRAMACION VISUAL", creditos: 3},
  {codigo: "SI4489", nombre: "SISTEMA DE ADMINISTRACION DE BASE DE DATOS", creditos: 4},
  {codigo: "SI4490", nombre: "SISTEMAS OPERATIVOS", creditos: 4},
  {codigo: "SI4388", nombre: "METODOS DE ACCESO", creditos: 3},
  {codigo: "IO4334", nombre: "METODOS NUMERICOS", creditos: 3},
  {codigo: "SI4387", nombre: "PROGRAMACION MULTIMEDIA", creditos: 3},
  {codigo: "IO4332", nombre: "SIMULACION Y JUEGOS", creditos: 3},
  // CICLO VIII
  {codigo: "DP4331", nombre: "DERECHO INFORMATICO", creditos: 3},
  {codigo: "SI4488", nombre: "INGENIERIA DE SOFTWARE", creditos: 4},
  {codigo: "EM4461", nombre: "MICROECONOMIA", creditos: 4},
  {codigo: "SI4360", nombre: "ORGANIZAC. Y ADMINIST. INFORMATICA", creditos: 3},
  {codigo: "SI4491", nombre: "REDES", creditos: 4},
  {codigo: "SI4465", nombre: "SISTEMAS DE INFORMACION GERENCIAL", creditos: 4},
  // CICLO IX
  {codigo: "SI5364", nombre: "ELABORACION DE PROYECTOS INFORMATICOS", creditos: 3},
  {codigo: "IO5365", nombre: "METODOLOGIA PARA EL PROYECTO DE INVESTIGACION", creditos: 3},
  {codigo: "SI5497", nombre: "PROCESOS DE DESARROLLO DE SOFTWARE", creditos: 4},
  {codigo: "SI5496", nombre: "SEGURIDAD DE LA INFORMACION", creditos: 4},
  {codigo: "SI5441", nombre: "SISTEMAS DE CONTROL Y AUDITORIA INFORMATICA", creditos: 4},
  {codigo: "SI5365", nombre: "TECNOLOGIA Y DESARROLLO WEB", creditos: 3},
  {codigo: "SI5370", nombre: "MICROCOMPUTADORAS", creditos: 3},
  {codigo: "II5314", nombre: "PROGRAMACION DE MICROBOTS", creditos: 3},
  {codigo: "SI5369", nombre: "TRATAMIENTO DIGITAL DE IMAGENES Y AUDIO", creditos: 3},
  // CICLO X
  {codigo: "CO5397", nombre: "CONTABILIDAD DE COSTOS Y PRESUPUESTOS", creditos: 3},
  {codigo: "SI5367", nombre: "DESARROLLO DE LA INVESTIGACION INFORMATICA", creditos: 3},
  {codigo: "SI5411", nombre: "GESTION EN INFORMATICA", creditos: 4},
  {codigo: "SI5499", nombre: "INTELIGENCIA DE NEGOCIOS", creditos: 4},
  {codigo: "SI5498", nombre: "SISTEMAS ORIENTADOS A SERVICIOS", creditos: 4},
  {codigo: "SI5368", nombre: "TECNOLOGIA Y DESARROLLO MOVIL", creditos: 3},
  {codigo: "SI5373", nombre: "TRABAJO DE INVESTIGACION", creditos: 3},
  {codigo: "SI5361", nombre: "INTRODUCION A LA INTELIGENCIA ARTIFICIAL", creditos: 3},
  {codigo: "II5345", nombre: "PLANEAMIENTO Y CONTROL DE PRODUCCION", creditos: 3},
  {codigo: "II5344", nombre: "SISTEMAS SCADA", creditos: 3},
  {codigo: "SI5371", nombre: "TALLER DE SERVIDORES", creditos: 3}
];

async function seed() {
  const pool = await poolPromise;
  let exito = 0;
  
  for (const c of cursosData) {
    try {
      // Verificar si ya existe para evitar duplicados infinitos
      const check = await pool.request()
        .input('codigo', c.codigo)
        .query('SELECT COUNT(*) as count FROM Cursos WHERE codigo_curso = @codigo');
        
      if (check.recordset[0].count === 0) {
        await pool.request()
          .input('codigo', c.codigo)
          .input('nombre', c.nombre)
          .input('creditos', c.creditos)
          .query('INSERT INTO Cursos (codigo_curso, nombre_curso, creditos) VALUES (@codigo, @nombre, @creditos)');
        exito++;
      }
    } catch (e) {
      console.error('Error insertando curso', c.codigo, e.message);
    }
  }
  
  console.log(`¡Perfecto! Se insertaron ${exito} cursos nuevos al Catálogo.`);
  process.exit();
}

seed();
