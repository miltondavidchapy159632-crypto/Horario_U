import React, { useState, useEffect, useRef } from 'react';
import './NotificationBell.css';

const NotificationBell = () => {
    const [hitos, setHitos] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchHitos = async () => {
        try {
            const res = await fetch('/api/planner/all-hitos');
            if (res.ok) {
                const data = await res.json();
                setHitos(data);
            }
        } catch (err) {
            console.error('Error fetching global hitos:', err);
        }
    };

    useEffect(() => {
        fetchHitos();
        // Recargar cada 2 min para estar al día
        const interval = setInterval(fetchHitos, 120000);

        // Escuchar cambios en tiempo real desde otros componentes
        window.addEventListener('hitosUpdated', fetchHitos);

        return () => {
            clearInterval(interval);
            window.removeEventListener('hitosUpdated', fetchHitos);
        };
    }, []);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calcular cuántos son "críticos" (hoy o mañana)
    const criticalCount = hitos.filter(h => {
        const hDate = new Date(h.fecha);
        const soon = new Date();
        soon.setDate(soon.getDate() + 2); // 48 horas
        return hDate < soon;
    }).length;

    const formatShortDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button className="bell-button" onClick={() => setIsOpen(!isOpen)}>
                <span className="bell-icon">🔔</span>
                {criticalCount > 0 && <span className="bell-badge">{criticalCount}</span>}
            </button>

            {isOpen && (
                <div className="bell-dropdown animate-fade-in">
                    <div className="dropdown-header">
                        <h4>Misiones Próximas 🚀</h4>
                        <span className="count-label">{hitos.length} pendientes</span>
                    </div>
                    <div className="dropdown-list">
                        {hitos.length > 0 ? (
                            hitos.slice(0, 5).map(h => (
                                <div key={h.id_hito} className={`dropdown-item type-${h.tipo.toLowerCase()}`}>
                                    <div className="item-dot"></div>
                                    <div className="item-content">
                                        <p className="item-title">{h.titulo}</p>
                                        <p className="item-meta">{h.nombre_curso} • {formatShortDate(h.fecha)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="dropdown-empty">
                                <p>¡Todo al día! 😎</p>
                                <span>No hay tareas próximas.</span>
                            </div>
                        )}
                    </div>
                    {hitos.length > 5 && (
                        <div className="dropdown-footer">
                            Ver más en Planificador
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
