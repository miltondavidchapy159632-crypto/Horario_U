import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DndContext, useDraggable, useDroppable, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

// Helper to format ISO date to readable time "HH:MM"
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const DraggableActivity = ({ activity, day, id_bloque, colors, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `drag-${activity.id_horario}`,
    data: { activity, fromDay: day, fromBlock: id_bloque },
    disabled: !!activity.es_restringido
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    backgroundColor: colors[activity.nombre_categoria] || (activity.es_restringido ? '#1A5276' : '#fef08a'),
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '4px',
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    cursor: activity.es_restringido ? 'default' : 'grab'
  };

  const textColor = activity.nombre_categoria ? '#ffffff' : '#854d0e';
  const title = activity.actividad_personal || `Curso ${activity.id_curso}`;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...(!activity.es_restringido ? attributes : {})} 
      {...(!activity.es_restringido ? listeners : {})}
      className="activity-card"
    >
      {activity.es_restringido ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: textColor }}>{activity.codigo_curso}</span>
          <span style={{ fontSize: '0.75rem', lineHeight: '1.1', color: textColor, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', opacity: 0.9 }}>
            {activity.nombre_curso}
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: textColor, marginTop: '2px', opacity: 0.8 }}>({title})</span>
        </div>
      ) : (
        <>
          <span style={{ fontWeight: '500', color: textColor, fontSize: '0.9rem' }}>{title}</span>
          <span 
            className="edit-icon" 
            onPointerDown={(e) => {
              e.stopPropagation();
              onEdit(day, id_bloque, activity.actividad_personal, activity.nombre_categoria);
            }}
            style={{ position: 'absolute', top: '4px', right: '4px', cursor: 'pointer', background: 'rgba(255,255,255,0.2)', color: textColor, borderRadius: '4px', padding: '2px 4px', fontSize: '0.7rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            title="Editar"
          >
            ✏️
          </span>
        </>
      )}
    </div>
  );
};

const DroppableCell = ({ day, id_bloque, children, onAdd }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${day}-${id_bloque}`,
    data: { day, id_bloque }
  });

  const style = {
    width: '100%',
    height: '100%',
    backgroundColor: isOver ? 'rgba(39, 174, 96, 0.1)' : 'transparent',
    transition: 'background-color 0.2s'
  };

  return (
    <div ref={setNodeRef} style={style} className="grid-cell">
      {children}
    </div>
  );
};

const DroppableTrash = () => {
    const { setNodeRef, isOver } = useDroppable({
      id: 'trash-can'
    });
  
    const style = {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '70px',
      height: '70px',
      backgroundColor: isOver ? '#e74c3c' : '#bdc3c7',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      zIndex: 1000,
      transform: isOver ? 'scale(1.2)' : 'scale(1)',
      cursor: 'pointer'
    };
  
    return (
      <div ref={setNodeRef} style={style} title="Arrastra aquí para eliminar">
        <svg fill="white" viewBox="0 0 24 24" width="35" height="35">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      </div>
    );
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
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(gridRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
        const imgWidth = canvas.width * ratio;
        const imgHeight = canvas.height * ratio;
        const x = (pdfWidth - imgWidth) / 2;
        const y = 10;
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
      const res = await fetch('/api/dashboard?id_periodo=1');
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data);
        const uniqueBlocksMap = new Map();
        data.forEach(item => {
          if (!uniqueBlocksMap.has(item.id_bloque)) {
            uniqueBlocksMap.set(item.id_bloque, {
              id_bloque: item.id_bloque,
              hora: `${formatTime(item.hora_inicio)}-${formatTime(item.hora_fin)}`,
              raw_hora_inicio: item.hora_inicio
            });
          }
        });
        setTimeSlots(Array.from(uniqueBlocksMap.values()).sort((a,b) => new Date(a.raw_hora_inicio) - new Date(b.raw_hora_inicio)));
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
        headers: { 'Content-Type': 'application/json' },
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
        fetchSchedule();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error('Error post actividad:', error);
      alert('Error en conexión con el servidor.');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const dragData = active.data.current;
    const { activity } = dragData;

    // Lógica para el basurero
    if (over.id === 'trash-can') {
        if (activity.es_restringido) {
            alert('No puedes eliminar clases de la universidad.');
            return;
        }
        
        try {
            const res = await fetch(`/api/actividad/${activity.id_horario}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchSchedule();
            } else {
                alert('No se pudo eliminar la actividad.');
            }
        } catch (err) {
            console.error('Error eliminando:', err);
        }
        return;
    }

    const dropData = over.data.current;
    const { day: newDay, id_bloque: newBlock } = dropData;

    const dayDb = newDay === 'Miercoles' ? 'Miércoles' : newDay;

    if (dragData.fromDay === newDay && dragData.fromBlock === newBlock) return;

    const targetActivity = scheduleData.find(item => 
      item.id_bloque === newBlock && 
      item.dia_semana === dayDb
    );

    if (targetActivity && targetActivity.es_restringido) {
      alert('No puedes mover una actividad a un horario ocupado por la universidad.');
      return;
    }

    try {
      const res = await fetch('/api/actividad/move', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_horario: activity.id_horario,
          nuevo_id_bloque: newBlock,
          nuevo_dia_semana: dayDb
        })
      });
      if (res.ok) {
        fetchSchedule();
      } else {
        const err = await res.json();
        alert(`Error al mover: ${err.message}`);
      }
    } catch (error) {
      console.error('Error moviendo actividad:', error);
    }
  };

  const activityColors = {
    'Universidad': '#1A5276',
    'Estudio': '#8E44AD',
    'Habitos': '#27AE60',
    'Entrenamiento': '#E67E22'
  };

  const renderCellContent = (day, id_bloque) => {
    const dayDb = day === 'Miercoles' ? 'Miércoles' : day;
    const activity = scheduleData.find(item => 
      item.id_bloque === id_bloque && 
      item.dia_semana === dayDb
    );
    
    if (activity && (activity.actividad_personal || activity.id_curso)) {
      return (
        <DraggableActivity 
          activity={activity} 
          day={day} 
          id_bloque={id_bloque} 
          colors={activityColors}
          onEdit={handleEditClick}
        />
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

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando horario...</div>;

  return (
    <div className="schedule-grid-container">
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--tab-bg)' }}>
        <button onClick={handleExportPDF} className="btn btn-primary" disabled={isExporting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isExporting ? <span>⏳ Exportando...</span> : <>Exportar a PDF</>}
        </button>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="schedule-grid" ref={gridRef}>
          <div className="grid-header">Hora</div>
          {days.map(day => <div key={day} className="grid-header">{day}</div>)}
          {timeSlots.map(slot => (
            <React.Fragment key={slot.id_bloque}>
              <div className="grid-cell time-label">{slot.hora}</div>
              {days.map(day => (
                <DroppableCell key={`${day}-${slot.id_bloque}`} day={day} id_bloque={slot.id_bloque}>
                  {renderCellContent(day, slot.id_bloque)}
                </DroppableCell>
              ))}
            </React.Fragment>
          ))}
        </div>
        <DroppableTrash />
      </DndContext>
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Añadir Actividad</h3>
            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" className="form-control" autoFocus value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select className="form-control" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} required>
                  <option value="" disabled>Seleccionar</option>
                  <option value="Estudio">Estudio</option>
                  <option value="Habitos">Hábitos</option>
                  <option value="Entrenamiento">Entrenamiento</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleGrid;
