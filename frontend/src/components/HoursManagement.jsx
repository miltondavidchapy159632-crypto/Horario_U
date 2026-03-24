import React, { useState, useEffect } from 'react';
import './CourseManagement.css'; 

const HoursManagement = () => {
  const [formData, setFormData] = useState({
    horaInicio: '',
    horaFin: '',
    etiqueta: 'Clase Regular'
  });

  const [addedHours, setAddedHours] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocks = async () => {
    try {
      const res = await fetch('/api/blocks');
      const data = await res.json();
      setAddedHours(data);
      setLoading(false);
    } catch (err) {
      console.error('Error cargando bloques:', err);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddHour = async (e) => {
    e.preventDefault();
    if (!formData.horaInicio || !formData.horaFin) return;

    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          etiqueta: formData.etiqueta
        })
      });

      if (res.ok) {
        fetchBlocks();
        setFormData({
          ...formData,
          horaInicio: '',
          horaFin: ''
        });
        alert('Bloque registrado correctamente en la base de datos.');
      } else {
        alert('Hubo un problema registrando el horario.');
      }
    } catch (err) {
      console.error('Error guardando horario', err);
      alert('Error en conexión con el servidor.');
    }
  };

  // Utility to format ISO time from SQL to HH:mm
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date)) return isoString;
    return date.toISOString().substr(11, 5);
  };

  return (
    <div className="course-management-container">
      {/* Lado Izquierdo: Formulario */}
      <div className="course-form-section">
        <h2 className="section-title">Añadir Nueva Hora</h2>
        
        <form onSubmit={handleAddHour} className="course-form">
          <div className="form-group-row">
            <label>Hora Inicio</label>
            <input 
              type="time" 
              name="horaInicio" 
              className="form-control" 
              value={formData.horaInicio}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group-row">
            <label>Hora Fin</label>
            <input 
              type="time" 
              name="horaFin" 
              className="form-control" 
              value={formData.horaFin}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group-row">
            <label>Tipo / Nombre</label>
            <input 
              type="text"
              name="etiqueta" 
              className="form-control"
              value={formData.etiqueta}
              onChange={handleChange}
              placeholder="Ej: Clase Especial, G1_T"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Registrar en Plantilla</button>
          </div>
        </form>
      </div>

      {/* Lado Derecho: Tabla de Horas Añadidas */}
      <div className="course-table-section">
        <h2 className="section-title">Plantilla de Bloques Oficial</h2>
        
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID Bloque</th>
                <th>Etiqueta</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center">Cargando...</td></tr>
              ) : addedHours.length > 0 ? (
                addedHours.map(hour => (
                  <tr key={hour.id_bloque}>
                    <td style={{fontWeight: 'bold'}}>BL-{hour.id_bloque}</td>
                    <td>{hour.etiqueta}</td>
                    <td>{formatTime(hour.hora_inicio) || hour.hora_inicio}</td>
                    <td>{formatTime(hour.hora_fin) || hour.hora_fin}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center empty-state">No hay horas registradas en la plantilla.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HoursManagement;
