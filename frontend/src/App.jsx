import React, { useState } from 'react';
import './App.css';
import ScheduleGrid from './components/ScheduleGrid';
import CourseManagement from './components/CourseManagement';
import HoursManagement from './components/HoursManagement';
import Information from './components/Information';

function App() {
  const [activeTab, setActiveTab] = useState('Horario');
  const tabs = ['Horario', 'Gestión de cursos', 'Gestión de Horas', 'Información'];

  return (
    <div className="app-container">
      <div className="tabs-container">
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
      <div className="tab-content">
        {activeTab === 'Horario' && <ScheduleGrid />}
        {activeTab === 'Gestión de cursos' && <CourseManagement />}
        {activeTab === 'Gestión de Horas' && <HoursManagement />}
        {activeTab === 'Información' && <Information />}
      </div>
    </div>
  );
}

export default App;
