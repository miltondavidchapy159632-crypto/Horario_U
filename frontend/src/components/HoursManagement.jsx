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
  const [editingId, setEditingId] = useState(null); // Track which block is being edited

  const fetchBlocks = async () => {
    try {
      const res = await fetch('/api/blocks');
      const data = await res.json();
      const sortedData = [...data].sort((a, b) => new Date(a.hora_inicio) - new Date(b.hora_inicio));
      setAddedHours(sortedData);
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

  const handleEditClick = (hour) => {
    setEditingId(hour.id_bloque);
    setFormData({
      horaInicio: formatTime(hour.hora_inicio) || hour.hora_inicio,
      horaFin: formatTime(hour.hora_fin) || hour.hora_fin,
      etiqueta: hour.etiqueta
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      horaInicio: '',
      horaFin: '',
      etiqueta: 'Clase Regular'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.horaInicio || !formData.horaFin) return;

    // Basic frontend validation
    if (formData.horaInicio >= formData.horaFin) {
        alert('La hora de inicio debe ser menor a la hora de fin.');
        return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/blocks/${editingId}` : '/api/blocks';

    try {
      const res = await fetch(url, {
        method,
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
        handleCancelEdit();
        alert(editingId ? 'Bloque actualizado correctamente.' : 'Bloque registrado correctamente.');
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err) {
      console.error('Error guardando horario', err);
      alert('Error en conexión con el servidor.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este bloque?')) return;

    try {
        const res = await fetch(`/api/blocks/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchBlocks();
        } else {
            const err = await res.json();
            alert(`Error: ${err.message}`);
        }
    } catch (err) {
        console.error('Error eliminando bloque:', err);
        alert('Error en conexión con el servidor.');
    }
  };

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
        <h2 className="section-title">
            {editingId ? 'Editar Bloque' : 'Añadir Nueva Hora'}
        </h2>
        
        <form onSubmit={handleSubmit} className="course-form">
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

          <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">
                {editingId ? 'Actualizar Bloque' : 'Registrar en Plantilla'}
            </button>
            {editingId && (
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                    Cancelar
                </button>
            )}
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center">Cargando...</td></tr>
              ) : addedHours.length > 0 ? (
                addedHours.map(hour => (
                  <tr key={hour.id_bloque}>
                    <td style={{fontWeight: 'bold'}}>BL-{hour.id_bloque}</td>
                    <td>{hour.etiqueta}</td>
                    <td>{formatTime(hour.hora_inicio) || hour.hora_inicio}</td>
                    <td>{formatTime(hour.hora_fin) || hour.hora_fin}</td>
                    <td>
                        <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                className="action-btn edit" 
                                onClick={() => handleEditClick(hour)}
                                title="Editar"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                            >
                                ✏️
                            </button>
                            <button 
                                className="action-btn delete" 
                                onClick={() => handleDelete(hour.id_bloque)}
                                title="Eliminar"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                            >
                                🗑️
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center empty-state">No hay horas registradas en la plantilla.</td>
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
