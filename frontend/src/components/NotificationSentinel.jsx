import React, { useState, useEffect, useRef } from 'react';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const NotificationSentinel = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');
  const [activeAlert, setActiveAlert] = useState(null);
  const notifiedBlocksRef = useRef(new Set());
  
  // Sonido de alerta premium
  const alertSound = useRef(null);
  useEffect(() => {
    alertSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await fetch('/api/dashboard?id_periodo=1');
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data);
      }
    } catch (error) {
      console.error('Error fetching global schedule:', error);
    }
  };

  useEffect(() => {
    fetchSchedule();
    // Refresh schedule data every 30 seconds to stay in sync with manual changes
    const fetchInterval = setInterval(fetchSchedule, 30000);
    return () => clearInterval(fetchInterval);
  }, []);

  useEffect(() => {
    setNotificationsEnabled(Notification.permission === 'granted');
  }, []);

  // Latido del Sistema (Web Worker para evitar suspensión del navegador)
  useEffect(() => {
    if (!notificationsEnabled) return;

    const worker = new Worker('/timer-worker.js');
    
    const checkActivities = () => {
        const now = new Date();
        const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const currentDay = daysMap[now.getDay()];
        const currentHM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        console.log(`[Sentinel] Latido recibido. Revisando: ${currentDay} (${currentHM})...`);

        scheduleData.forEach(item => {
            const startHM = formatTime(item.hora_inicio);
            const blockKey = `${item.id_bloque}-${currentDay}`;

            if (item.dia_semana === currentDay && startHM === currentHM) {
                if (!notifiedBlocksRef.current.has(blockKey)) {
                    triggerAlert(item, startHM, blockKey);
                }
            }
        });

        if (currentHM === "00:00") notifiedBlocksRef.current.clear();
    };

    const triggerAlert = (item, startHM, blockKey) => {
        const title = item.actividad_personal || item.nombre_curso || 'Actividad';
        console.log(`[Sentinel] ¡ALERTA ACTIVADA! Iniciando: ${title}`);
        
        alertSound.current.play().catch(e => {
            console.warn("[Sentinel] Audio bloqueado por el navegador. Se requiere interacción previa.", e);
        });

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification("📅 ¡HORA DE INICIAR!", {
                    body: `Comienza: ${title} (${startHM})`,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    requireInteraction: true,
                    silent: false,
                    tag: blockKey,
                    renotify: true,
                    vibrate: [200, 100, 200]
                });
            });
        }
        
        setActiveAlert({ title, time: startHM });
        notifiedBlocksRef.current.add(blockKey);
    };

    worker.onmessage = () => checkActivities();
    checkActivities(); // Primera ejecución inmediata

    return () => worker.terminate();
  }, [notificationsEnabled, scheduleData]);

  // Title Flash Logic
  useEffect(() => {
    if (!activeAlert) {
        document.title = "Horario_U";
        return;
    }
    let isFlashing = false;
    const flashInterval = setInterval(() => {
        document.title = isFlashing ? "¡NUEVA TAREA! 🔔" : "🔴 [ALERTA] 🔴";
        isFlashing = !isFlashing;
    }, 1000);
    return () => {
        clearInterval(flashInterval);
        document.title = "Horario_U";
    };
  }, [activeAlert]);

  if (!activeAlert) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.85)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="modal alert-modal" style={{ borderTop: '5px solid #e74c3c', textAlign: 'center', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔔</div>
            <h2 style={{ color: '#e74c3c', fontSize: '1.8rem' }}>¡ALERTA DE HORARIO!</h2>
            <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
                Es hora de iniciar: <br/>
                <strong style={{ fontSize: '1.5rem', color: '#3498db' }}>{activeAlert.title}</strong>
            </p>
            <p style={{ opacity: 0.7 }}>Inicio: {activeAlert.time}</p>
            <button className="btn btn-primary" style={{ width: '100%', padding: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setActiveAlert(null)}>
                ENTENDIDO, ¡VAMOS! 🚀
            </button>
        </div>
    </div>
  );
};

export default NotificationSentinel;
