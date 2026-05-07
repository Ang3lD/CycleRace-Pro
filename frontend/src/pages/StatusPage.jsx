import React, { useState, useEffect } from 'react';
import { ShieldAlert, ServerCog, Activity, Database, Clock } from 'lucide-react';

const StatusPage = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/monitor/api/status');
        const data = await response.json();
        setServicios(data.microservicios || []);
      } catch (error) {
        console.error("Error obteniendo el estado", error);
        setServicios([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Refresca cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-page" style={{ 
      padding: '120px 20px 40px', 
      maxWidth: '1000px', 
      margin: '0 auto', 
      color: '#e2e8f0',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      
      {/* HEADER INFORMATIVO */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '40px',
        border: '1px solid #334155',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <ShieldAlert size={32} color="#f59e0b" />
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#f8fafc' }}>Panel de Control de Microservicios</h2>
        </div>
        
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#cbd5e1', marginBottom: '15px' }}>
          Este panel es de <strong>acceso exclusivo para administradores</strong>. 
          Aquí puedes monitorear en tiempo real la salud ("Health Check") de la arquitectura de backend de CycleRace Pro.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <ServerCog color="#3b82f6" />
            <div>
              <strong style={{ display: 'block', color: '#93c5fd' }}>Origen de Datos</strong>
              <span style={{ fontSize: '0.9rem' }}>Las peticiones provienen del API Gateway (Monitor FastAPI en el puerto 8000), el cual hace ping a cada servicio interno.</span>
            </div>
          </div>
          <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Clock color="#10b981" />
            <div>
              <strong style={{ display: 'block', color: '#6ee7b7' }}>Actualización</strong>
              <span style={{ fontSize: '0.9rem' }}>El estado se actualiza automáticamente cada 10 segundos para garantizar precisión en tiempo real.</span>
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE ESTADO */}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', borderBottom: '2px solid #334155', paddingBottom: '10px' }}>
        Estado Actual de los Servicios
      </h3>

      {loading && servicios.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
        </div>
      ) : servicios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#3f1d1d', borderRadius: '12px', border: '1px solid #7f1d1d' }}>
          <h3 style={{ color: '#fca5a5' }}>El Monitor de Servicios no responde</h3>
          <p>Asegúrate de que los contenedores de Docker (especialmente <code>monitor-backend</code>) estén en ejecución.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {servicios.map((srv, index) => {
            const isActivo = srv.estado.includes('Activo');
            return (
              <div key={index} style={{ 
                backgroundColor: isActivo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                border: `1px solid ${isActivo ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, 
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                transition: 'transform 0.2s',
                ':hover': { transform: 'translateY(-5px)' }
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc', fontWeight: '600' }}>{srv.nombre}</h3>
                  <Activity color={isActivo ? '#10b981' : '#ef4444'} />
                </div>
                
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  backgroundColor: isActivo ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  width: 'fit-content'
                }}>
                  <div style={{ 
                    width: '10px', height: '10px', borderRadius: '50%', 
                    backgroundColor: isActivo ? '#10b981' : '#ef4444',
                    boxShadow: `0 0 10px ${isActivo ? '#10b981' : '#ef4444'}`
                  }} />
                  <span style={{ color: isActivo ? '#34d399' : '#fca5a5', fontWeight: '600', fontSize: '0.9rem' }}>
                    {srv.estado.replace('🟢','').replace('🔴','').replace('🟡','').trim()}
                  </span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: `1px solid ${isActivo ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={16} />
                    <span>BD: <strong>{srv.detalles?.database || 'N/A'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} />
                    <span>Uptime: <strong>{srv.detalles?.uptime_seconds ? srv.detalles.uptime_seconds + 's' : 'N/A'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ServerCog size={16} />
                    <span>Memoria: <strong>{srv.detalles?.memory_usage || 'N/A'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Versión: <strong>{srv.detalles?.version || 'N/A'}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusPage;
