import React, { useState, useEffect } from 'react';
import './CourseManagement.css';

const CourseManagement = () => {
  const [cursos, setCursos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [inscribedCourses, setInscribedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    id_curso: '',
    curso_busqueda: '', // Field for datalist search string
    nombre_grupo: '' // G1, G2, etc.
  });

  const fetchData = async () => {
    try {
      const [catRes, inscRes] = await Promise.all([
        fetch('/api/courses/catalog'),
        fetch('/api/courses/inscribed')
      ]);
      const catData = await catRes.json();
      const inscData = await inscRes.json();
      
      setCursos(catData.cursos || []);
      setGrupos(catData.grupos || []);
      setInscribedCourses(inscData || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!formData.id_curso || !formData.nombre_grupo) return;

    try {
      const res = await fetch('/api/enrollment/inscribir-grupo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_grupo: formData.nombre_grupo,
          id_curso: formData.id_curso
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchData();
        setFormData({ id_curso: '', curso_busqueda: '', nombre_grupo: '' });
      } else {
        alert('No se pudo inscribir (Posible colisión): ' + data.message);
      }
    } catch (err) {
      console.error('Error inscribiendo curso:', err);
      alert('Hubo un error de red al intentar inscribir.');
    }
  };

  const selectedCurso = cursos.find(c => c.id_curso.toString() === formData.id_curso) || {};

  const availableCursos = cursos.filter(c => 
    !inscribedCourses.some(insc => insc.id_curso === c.id_curso)
  );

  const availableGrupos = grupos.filter(g => 
    !inscribedCourses.some(insc => insc.nombre_grupo === g)
  );

  return (
    <div className="course-management-container">
      {/* Lado Izquierdo: Formulario */}
      <div className="course-form-section">
        <h2 className="section-title">Añadir cursos</h2>
        
        <form onSubmit={handleEnroll} className="course-form">
          <div className="form-group-row">
            <label>Curso</label>
            <input 
              type="text"
              name="curso_busqueda" 
              className="form-control"
              value={formData.curso_busqueda || ''}
              onChange={(e) => {
                const val = e.target.value;
                // Buscar si coincide exactamente con una opción
                const match = availableCursos.find(c => `${c.codigo_curso} - ${c.nombre_curso}` === val);
                if (match) {
                  setFormData({ ...formData, curso_busqueda: val, id_curso: match.id_curso.toString() });
                } else {
                  setFormData({ ...formData, curso_busqueda: val, id_curso: '' });
                }
              }}
              list="cursos-list"
              placeholder="Buscar por código o nombre..."
              autoComplete="off"
              required
            />
            <datalist id="cursos-list">
              {availableCursos.map((c, i) => (
                <option key={i} value={`${c.codigo_curso} - ${c.nombre_curso}`} />
              ))}
            </datalist>
          </div>

          <div className="form-group-row">
            <label>Grupo / Horario</label>
            <select 
              name="nombre_grupo" 
              className="form-control"
              value={formData.nombre_grupo}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Seleccionar Regla (G1, G2...)</option>
              {availableGrupos.map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="form-group-row">
            <label>Código</label>
            <input 
              type="text" 
              className="form-control" 
              value={selectedCurso.codigo_curso || ''} 
              readOnly 
            />
          </div>

          <div className="form-group-row">
            <label>Créditos</label>
            <input 
              type="text" 
              className="form-control" 
              value={selectedCurso.creditos || ''} 
              readOnly 
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Añadir Curso</button>
          </div>
        </form>
      </div>

      {/* Lado Derecho: Cursos Añadidos */}
      <div className="course-table-section">
        <h2 className="section-title">Cursos Añadidos</h2>
        
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre curso</th>
                <th>Crédito</th>
                <th>Grupo</th>
                <th>Días</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center">Cargando...</td></tr>
              ) : inscribedCourses.length > 0 ? (
                inscribedCourses.map((curso, idx) => (
                  <tr key={idx}>
                    <td style={{fontWeight: 'bold'}}>{curso.codigo_curso}</td>
                    <td>{curso.nombre_curso}</td>
                    <td>{curso.creditos}</td>
                    <td>{curso.nombre_grupo}</td>
                    <td>{curso.dias || 'Por definir'}</td>
                    <td>{curso.rango_horas || 'Por definir'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center empty-state">No hay cursos añadidos o inscritos actualmente</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
