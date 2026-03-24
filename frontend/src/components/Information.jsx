import React, { useState, useEffect } from 'react';
import './Information.css';

const Information = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Semana completa');

  const days = ['Semana completa', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const colors = {
    'Universidad': '#1A5276',
    'Estudio': '#8E44AD',
    'Habitos': '#27AE60',
    'Entrenamiento': '#E67E22'
  };

  const formatHours = (decimalHours) => {
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const url = selectedDay === 'Semana completa' 
        ? `/api/stats/?t=${Date.now()}` 
        : `/api/stats/?dia=${encodeURIComponent(selectedDay)}&t=${Date.now()}`;
      console.log('Fetching stats from:', url);
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedDay]);

  const maxHours = Math.max(...stats.map(s => s.hours), 5);

  return (
    <div className="info-container">
      <div className="stats-card">
        <h2 className="stats-title">Horas Administradas</h2>
        
        <div className="day-selector">
          {days.map(day => (
            <button 
              key={day} 
              className={`day-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="chart-wrapper">
          <div className="y-axis">
            {[Math.round(maxHours), Math.round(maxHours/2), 0].map(val => (
                <span key={val}>{val}h</span>
            ))}
          </div>
          
          <div className="chart-area">
            {stats.length > 0 ? stats.map((item, idx) => {
              const height = (item.hours / maxHours) * 100;
              return (
                <div key={item.category} className="bar-group">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${height}%`, 
                      backgroundColor: colors[item.category] || '#ccc' 
                    }}
                    title={`${item.category}: ${formatHours(item.hours)}`}
                  >
                    <span className="bar-value">{formatHours(item.hours)}</span>
                  </div>
                  <span className="bar-label">{item.category}</span>
                </div>
              );
            }) : (
              <div className="empty-chart"></div>
            )}
          </div>
        </div>

        <div className="legend">
          {Object.entries(colors).map(([name, color]) => (
            <div key={name} className="legend-item">
              <span className="dot" style={{ backgroundColor: color }}></span>
              <span className="legend-text">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Information;
