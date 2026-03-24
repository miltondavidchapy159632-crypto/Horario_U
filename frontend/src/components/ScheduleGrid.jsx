import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

// Helper to format ISO date to readable time "HH:MM"
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const ScheduleGrid = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState({ day: '', id_bloque: null });
  const [formData, setFormData] = useState({ nombre: '', tipo: '' });
  const [isExporting, setIsExporting] = useState(false);

  // Grid Ref for export
  const gridRef = useRef(null);

  const handleExportPDF = async () => {
    if (!gridRef.current || isExporting) return;
    
    setIsExporting(true);
    
    // Defer the execution to let the UI show "Exportando..." before locking the main thread
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(gridRef.current, {
          scale: 2, 
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
        
        const imgWidth = canvas.width * ratio;
        const imgHeight = canvas.height * ratio;
        
        const x = (pdfWidth - imgWidth) / 2;
        // const y = (pdfHeight - imgHeight) / 2; // Center vertically
        const y = 10; // Better to align top with a 10mm margin
        
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save('Mi_Horario.pdf');
      } catch (err) {
        console.error('Error exportando PDF:', err);
        alert('Hubo un error al generar el PDF.');
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      // Hardcoded id_periodo=1 for now
      const res = await fetch('/api/dashboard?id_periodo=1');
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data);
        
        // Extract unique time blocks (id_bloque, hora_inicio, hora_fin)
        const uniqueBlocksMap = new Map();
        data.forEach(item => {
          if (!uniqueBlocksMap.has(item.id_bloque)) {
            uniqueBlocksMap.set(item.id_bloque, {
              id_bloque: item.id_bloque,
              hora: `${formatTime(item.hora_inicio)}-${formatTime(item.hora_fin)}`
            });
          }
        });
        setTimeSlots(Array.from(uniqueBlocksMap.values()).sort((a,b) => a.id_bloque - b.id_bloque));
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleAddClick = (day, id_bloque) => {
    // Normalizar día para base de datos
    const dayDb = day === 'Miercoles' ? 'Miércoles' : day;
    setSelectedCell({ day: dayDb, id_bloque });
    setFormData({ nombre: '', tipo: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (day, id_bloque, currentName, currentTipo) => {
    const dayDb = day === 'Miercoles' ? 'Miércoles' : day;
    setSelectedCell({ day: dayDb, id_bloque });
    setFormData({ nombre: currentName, tipo: currentTipo || '' });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.tipo) return;

    try {
      const res = await fetch('/api/actividad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_bloque: selectedCell.id_bloque,
          dia_semana: selectedCell.day,
          id_periodo: 1, 
          actividad_personal: formData.nombre,
          tipo: formData.tipo
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchSchedule(); // Reload grid
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error('Error post actividad:', error);
      alert('Error en conexión con el servidor.');
    }
  };

  const renderCell = (day, id_bloque) => {
    const dayDb = day === 'Miercoles' ? 'Miércoles' : day;
    
    // Check if there is an activity for this specific block and day
    const activity = scheduleData.find(item => 
      item.id_bloque === id_bloque && 
      item.dia_semana === dayDb
    );
    
    if (activity && (activity.actividad_personal || activity.id_curso)) {
      let color = '#fef08a';
      let textColor = '#854d0e';
      
      if (activity.nombre_categoria === 'Universidad') {
        color = '#1A5276'; // Azul Profundo
        textColor = '#ffffff';
      } else if (activity.nombre_categoria === 'Estudio') {
        color = '#8E44AD'; // Morado Intenso
        textColor = '#ffffff';
      } else if (activity.nombre_categoria === 'Habitos') {
        color = '#27AE60'; // Verde Esmeralda
        textColor = '#ffffff';
      } else if (activity.nombre_categoria === 'Entrenamiento') {
        color = '#E67E22'; // Naranja Vibrante
        textColor = '#ffffff';
      } else if (activity.es_restringido) {
        // Fallback for official
        color = '#1A5276';
        textColor = '#ffffff';
      }

      const title = activity.actividad_personal || `Curso ${activity.id_curso}`;

      return (
        <div className="activity-card" style={{ backgroundColor: color, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4px', boxSizing: 'border-box', width: '100%', height: '100%' }}>
          {activity.es_restringido ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: textColor }}>{activity.codigo_curso}</span>
              <span style={{ fontSize: '0.75rem', lineHeight: '1.1', color: textColor, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', opacity: 0.9 }}>
                {activity.nombre_curso}
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: '600', color: textColor, marginTop: '2px', opacity: 0.8 }}>({title})</span>
            </div>
          ) : (
            <span style={{ fontWeight: '500', color: textColor, fontSize: '0.9rem' }}>{title}</span>
          )}
          {!activity.es_restringido && (
            <span 
              className="edit-icon" 
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(day, id_bloque, activity.actividad_personal, activity.nombre_categoria);
              }}
              style={{ position: 'absolute', top: '4px', right: '4px', cursor: 'pointer', background: 'rgba(255,255,255,0.2)', color: textColor, borderRadius: '4px', padding: '2px 4px', fontSize: '0.7rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              title="Editar"
            >
              ✏️
            </span>
          )}
        </div>
      );
    }

    return (
      <button className="add-btn" onClick={() => handleAddClick(day, id_bloque)}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    );
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando horario...</div>;
  }

  return (
    <div className="schedule-grid-container">
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--tab-bg)' }}>
        <button onClick={handleExportPDF} className="btn btn-primary" disabled={isExporting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isExporting ? (
            <span>⏳ Exportando PDF...</span>
          ) : (
            <>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar a PDF
            </>
          )}
        </button>
      </div>
      
      <div className="schedule-grid" ref={gridRef}>
        {/* Header Row */}
        <div className="grid-header">Hora</div>
        {days.map(day => (
          <div key={day} className="grid-header">{day}</div>
        ))}

        {/* Time Rows */}
        {timeSlots.map(slot => (
          <React.Fragment key={slot.id_bloque}>
            <div className="grid-cell time-label">{slot.hora}</div>
            {days.map(day => (
              <div key={`${day}-${slot.id_bloque}`} className="grid-cell">
                {renderCell(day, slot.id_bloque)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Añadir, hobby, habito o Estudio</h3>
            
            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  type="text" 
                  className="form-control" 
                  autoFocus
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo</label>
                <select 
                  className="form-control"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  required
                >
                  <option value="" disabled>Seleccionar</option>
                  <option value="Estudio">Estudio</option>
                  <option value="Habitos">Hábitos</option>
                  <option value="Entrenamiento">Entrenamiento</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleGrid;
