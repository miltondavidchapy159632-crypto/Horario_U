import React, { useState, useEffect } from 'react';
import './AcademicPlanner.css';

const AcademicPlanner = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [hitos, setHitos] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [showHitoForm, setShowHitoForm] = useState(false);
    const [hitoData, setHitoData] = useState({ titulo: '', tipo: 'Examen', fecha: '', descripcion: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses/inscribed');
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
                if (data.length > 0) setSelectedCourse(data[0].id_curso);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
        }
    };

    const fetchPlannerData = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const [hitosRes, docsRes] = await Promise.all([
                fetch(`/api/planner/hitos?id_curso=${id}`),
                fetch(`/api/planner/documents?id_curso=${id}`)
            ]);
            if (hitosRes.ok) setHitos(await hitosRes.json());
            if (docsRes.ok) setDocuments(await docsRes.json());
        } catch (err) {
            console.error('Error fetching planner data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) fetchPlannerData(selectedCourse);
    }, [selectedCourse]);

    const handleHitoSubmit = async (e) => {
        e.preventDefault();
        
        // Validación de fecha a futuro
        const selectedDate = new Date(hitoData.fecha);
        const now = new Date();
        if (selectedDate < now) {
            alert('¡Ups! No puedes registrar eventos en el pasado. Selecciona una fecha de hoy en adelante.');
            return;
        }

        try {
            const res = await fetch('/api/planner/hitos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...hitoData, id_curso: selectedCourse })
            });
            if (res.ok) {
                setShowHitoForm(false);
                setHitoData({ titulo: '', tipo: 'Examen', fecha: '', descripcion: '' });
                fetchPlannerData(selectedCourse);
                // Notificar a la campanita de que hay cambios
                window.dispatchEvent(new Event('hitosUpdated'));
            } else {
                const errData = await res.json();
                alert(`Error: ${errData.message}\nDetalle: ${errData.error || 'N/A'}`);
            }
        } catch (err) {
            console.error('Error saving hito:', err);
            alert('Error de conexión con el servidor.');
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !selectedCourse) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('archivo', selectedFile);
        formData.append('id_curso', selectedCourse);

        try {
            const res = await fetch('/api/planner/upload', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                setSelectedFile(null);
                fetchPlannerData(selectedCourse);
                alert('Archivo subido con éxito.');
            }
        } catch (err) {
            console.error('Error uploading file:', err);
        } finally {
            setUploading(false);
        }
    };

    const deleteHito = async (id) => {
        if (!window.confirm('¿Eliminar este hito?')) return;
        try {
            const res = await fetch(`/api/planner/hitos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchPlannerData(selectedCourse);
                // Notificar a la campanita de que hay cambios
                window.dispatchEvent(new Event('hitosUpdated'));
            }
        } catch (err) {
            console.error('Error deleting hito:', err);
        }
    };

    return (
        <div className="planner-container">
            <div className="planner-sidebar">
                <h3>Mis Cursos</h3>
                <div className="course-list">
                    {courses.map(c => (
                        <div 
                            key={c.id_curso} 
                            className={`course-item ${selectedCourse === c.id_curso ? 'active' : ''}`}
                            onClick={() => setSelectedCourse(c.id_curso)}
                        >
                            <span className="course-code">{c.codigo_curso}</span>
                            <span className="course-name">{c.nombre_curso}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="planner-main">
                {selectedCourse ? (
                    <>
                        <div className="planner-header">
                            <h2>{courses.find(c => c.id_curso === selectedCourse)?.nombre_curso}</h2>
                            <div className="header-actions">
                                <button className="btn btn-primary" onClick={() => setShowHitoForm(true)}>+ Añadir Hito</button>
                            </div>
                        </div>

                        <div className="planner-grid">
                            <section className="planner-section documents">
                                <h3>Sílabos y Documentos 📄</h3>
                                <div className="upload-box">
                                    <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                                    <button className="btn btn-secondary" onClick={handleFileUpload} disabled={!selectedFile || uploading}>
                                        {uploading ? 'Subiendo...' : 'Subir Archivo'}
                                    </button>
                                </div>
                                <div className="document-list">
                                    {documents.map(doc => (
                                        <div key={doc.id_documento} className="document-card">
                                            <span>{doc.nombre_archivo}</span>
                                            <a href={`http://localhost:3000${doc.ruta_archivo}`} target="_blank" rel="noreferrer" className="btn-view">Ver PDF</a>
                                        </div>
                                    ))}
                                    {documents.length === 0 && <p className="empty-text">No hay documentos subidos.</p>}
                                </div>
                            </section>

                            <section className="planner-section milestones">
                                <h3>Fechas Importantes 🏁</h3>
                                <div className="milestone-list">
                                    {hitos.map(h => (
                                        <div key={h.id_hito} className={`milestone-card type-${h.tipo.toLowerCase()}`}>
                                            <div className="milestone-info">
                                                <span className="milestone-title">{h.titulo}</span>
                                                <span className="milestone-date">{new Date(h.fecha).toLocaleString()}</span>
                                                {h.descripcion && <p className="milestone-desc">{h.descripcion}</p>}
                                            </div>
                                            <button className="btn-delete" onClick={() => deleteHito(h.id_hito)}>🗑️</button>
                                        </div>
                                    ))}
                                    {hitos.length === 0 && <p className="empty-text">No hay exámenes o tareas registradas.</p>}
                                </div>
                            </section>
                        </div>
                    </>
                ) : (
                    <div className="no-selection">Selecciona un curso para empezar el planeamiento.</div>
                )}
            </div>

            {showHitoForm && (
                <div className="modal-overlay" onClick={() => setShowHitoForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Nuevo Hito Académico</h3>
                        <form onSubmit={handleHitoSubmit}>
                            <div className="form-group">
                                <label>Título</label>
                                <input type="text" className="form-control" value={hitoData.titulo} onChange={e => setHitoData({...hitoData, titulo: e.target.value})} required placeholder="Ej: Examen Parcial" />
                            </div>
                            <div className="form-group">
                                <label>Tipo</label>
                                <select className="form-control" value={hitoData.tipo} onChange={e => setHitoData({...hitoData, tipo: e.target.value})}>
                                    <option value="Examen">Examen</option>
                                    <option value="Práctica">Práctica</option>
                                    <option value="Exposición">Exposición</option>
                                    <option value="Tarea">Tarea</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Fecha y Hora</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control" 
                                    value={hitoData.fecha} 
                                    min={new Date().toISOString().slice(0, 16)}
                                    onChange={e => setHitoData({...hitoData, fecha: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Notas (Opcional)</label>
                                <textarea className="form-control" value={hitoData.descripcion} onChange={e => setHitoData({...hitoData, descripcion: e.target.value})} placeholder="Temas, requisitos..." />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowHitoForm(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Añadir</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicPlanner;
