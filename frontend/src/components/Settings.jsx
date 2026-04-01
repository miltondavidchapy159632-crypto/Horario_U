import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = ({ isDarkMode, toggleTheme }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');

  const handleNotificationRequest = async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        new Notification("¡Notificaciones Activadas!", { body: "El sistema de alertas funcionará correctamente para tus cursos." });
      }
    } else if (Notification.permission === 'denied') {
      alert("Las notificaciones están bloqueadas en tu navegador. Debes habilitarlas manualmente desde el candado en la barra de direcciones.");
    } else {
      alert("Las notificaciones ya se encuentran activadas.");
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Configuración del Sistema</h2>
        <p>Ajusta el aspecto visual y las alertas de tu planificador.</p>
      </div>

      <div className="settings-section">
        <h3 className="section-title">✨ Apariencia</h3>
        <div className="setting-item">
          <div className="setting-info">
            <h3>Modo Oscuro</h3>
            <p>Alternar esquema de colores claros / oscuros para reducir fatiga visual.</p>
          </div>
          <label className="theme-switch">
            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
            <span className="slider">
              <span className="slider-icon icon-sun">☀️</span>
              <span className="slider-icon icon-moon">🌙</span>
            </span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">🔔 Notificaciones y Sonidos</h3>
        <div className="setting-item">
          <div className="setting-info">
            <h3>Alertas de Cursos y Eventos</h3>
            <p>Habilitar notificaciones en tiempo real para ser alertado antes de clases.</p>
          </div>
          <button 
            className={`btn-notification ${notificationsEnabled ? 'granted' : ''}`}
            onClick={handleNotificationRequest}
          >
            {notificationsEnabled ? '✅ Alertas Activadas' : 'Activar Alertas (Sonido + Pop-up)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
