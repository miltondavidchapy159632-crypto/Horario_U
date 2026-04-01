import React, { useState, useEffect } from 'react';
import './App.css';
import ScheduleGrid from './components/ScheduleGrid';
import CourseManagement from './components/CourseManagement';
import HoursManagement from './components/HoursManagement';
import Information from './components/Information';
import NotificationSentinel from './components/NotificationSentinel';
import AcademicPlanner from './components/AcademicPlanner';
import NotificationBell from './components/NotificationBell';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('Horario');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const tabs = ['Horario', 'Gestión de cursos', 'Gestión de Horas', 'Planificador', 'Información', 'Configuración'];

  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <div className="app-container">
      <NotificationSentinel />
      
      {/* 1. Cabecera Principal (Top Bar Global) */}
      <header className="main-header">
        <div className="header-brand">
          <img src="/logo_unp.png" alt="Logo Horario UNP" className="brand-logo" />
          <h1 className="brand-title">Horario UNP</h1>
        </div>
        
        <div className="header-actions">
          <NotificationBell />
        </div>
      </header>

      {/* 2. Cuerpo de la Aplicación (Sidebar + Main Content) */}
      <div className="app-body">
        {/* Sidebar Lateral (Izquierda) */}
        <aside className="sidebar">
          <div className="tabs-container" style={{ marginTop: '0.5rem' }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </aside>

        {/* Área de Visualización (Derecha) */}
        <main className="main-content">
          <div className="tab-content">
            {activeTab === 'Horario' && <ScheduleGrid />}
            {activeTab === 'Gestión de cursos' && <CourseManagement />}
            {activeTab === 'Gestión de Horas' && <HoursManagement />}
            {activeTab === 'Planificador' && <AcademicPlanner />}
            {activeTab === 'Información' && <Information />}
            {activeTab === 'Configuración' && <Settings isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
          </div>
        </main>
      </div> {/* Cierre del app-body */}
    </div>
  );
}

export default App;
