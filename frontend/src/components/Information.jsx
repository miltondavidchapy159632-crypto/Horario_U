import React, { useState, useEffect } from 'react';
import './Information.css';

const Information = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = {
    'Universidad': '#1A5276',
    'Estudio': '#8E44AD',
    'Habitos': '#27AE60',
    'Entrenamiento': '#E67E22'
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
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
    fetchStats();
  }, []);

  if (loading) return <div className="info-container">Cargando estadísticas...</div>;

  const maxHours = Math.max(...stats.map(s => s.hours), 5); // Al menos 5 para escala

  return (
    <div className="info-container">
      <div className="stats-card">
        <h2 className="stats-title">Horas Administradas</h2>
        
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
                    title={`${item.category}: ${item.hours.toFixed(1)} horas`}
                  >
                    <span className="bar-value">{item.hours.toFixed(1)}h</span>
                  </div>
                  <span className="bar-label">{item.category}</span>
                </div>
              );
            }) : (
              <div className="empty-chart">No hay datos registrados todavía.</div>
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
