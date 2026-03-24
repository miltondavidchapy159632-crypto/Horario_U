# Gestor de Horarios UNP

## Descripción
Aplicación web para la gestión de horarios académicos y actividades personales, optimizada para el sistema de bloques de la Universidad Nacional de Piura (UNP).

## Stack Tecnológico
- **Frontend**: Vite + JavaScript (Vanilla/React) + CSS (Grid/Flexbox).
- **Backend**: Node.js + Express.js.
- **Base de Datos**: SQL Server 2026.

## Funcionalidades
1. Inscripción automática de bloques al seleccionar un grupo.
2. Protección de datos para bloques de tipo "Universidad".
3. Representación visual de horarios con fusión de bloques consecutivos.
4. Validación de colisiones al añadir actividades personales.

## Estructura de Datos
- **Plantilla_Bloques**: Define los bloques de tiempo.
- **Cursos y Grupos**: Catálogo de materias y secciones.
- **Detalle_Grupo_Horario**: Mapea los bloques ocupados por cada grupo.
- **Mi_Horario**: Consolidación de cursos inscritos y actividades personales.

## Instalación
1. Clonar el repositorio.
2. Instalar dependencias con `npm install`.
3. Configurar la conexión a SQL Server en el archivo `.env`.
4. Ejecutar el servidor con `npm run dev`.

## Rutas API
- `GET /horario`: Obtener el horario consolidado.
- `POST /inscribir-grupo`: Inscribir bloques de un grupo.
- `POST /actividad`: Añadir actividades personales.

## Reglas de Negocio
- **Inscripción Automática**: Inserta bloques relacionados al seleccionar un grupo.
- **Protección de Datos**: Bloques de tipo "Universidad" no son editables.
- **Validación de Colisiones**: Impide añadir actividades en bloques ocupados.

---

**Autor**: David.