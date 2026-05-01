import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Terminal, ShieldAlert, Activity, Search, Database, Fingerprint } from 'lucide-react'
import './AnalyzerPage.css'

export default function AnalyzerPage() {
  const { token } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState(null)

  useEffect(() => {
    fetchLogs()
    // Real-time polling every 3 seconds
    const interval = setInterval(fetchLogs, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch('/analyzer/api/analyzer/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setLogs(data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleQuery = async (e) => {
    e.preventDefault()
    if (!query) return
    
    try {
      const res = await fetch('/analyzer/api/analyzer/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rule: query })
      })
      if (res.ok) {
        setQueryResult(await res.json())
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="analyzer-page">
      <div className="container analyzer-container">
        <header className="analyzer-header">
          <div className="analyzer-title-group">
            <Terminal size={32} className="analyzer-icon" />
            <div>
              <h1>Motor de Análisis Heurístico</h1>
              <p>Monitor de Compilación de Flujos en Tiempo Real (Go + MongoDB)</p>
            </div>
          </div>
        </header>

        <div className="analyzer-layout">
          {/* Query Engine */}
          <section className="query-section">
            <div className="card glass query-box">
              <div className="terminal-header">
                <Database size={18} />
                <h3>Sandbox de Consultas</h3>
              </div>
              <p className="query-help">Prueba reglas en la BD (ej. "vulnerabilidad", "sensitive", "admin")</p>
              <form onSubmit={handleQuery} className="query-form">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Escribe tu regla léxica/semántica..."
                />
                <button type="submit" className="btn btn-primary">Ejecutar</button>
              </form>

              {queryResult && (
                <div className="query-results">
                  <h4>Resultados: {queryResult.matches} coincidencias</h4>
                  <div className="query-result-scroll">
                    {queryResult.results?.map((r, i) => (
                      <div key={i} className="mini-log">
                        {r.user_id} - {r.token} - {r.analysis}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card glass info-box">
              <h4><ShieldAlert size={18} /> Resumen de Seguridad</h4>
              <p>El compilador léxico asigna tokens (ej. T_LOGIN, T_SENSITIVE_ACTION) a las acciones. El analizador semántico en Go valida el AST en tiempo real contra la base de datos.</p>
            </div>
          </section>

          {/* Main Terminal Table */}
          <section className="terminal-section card glass">
            <div className="terminal-header">
              <Activity size={18} />
              <h3>Flujo de Eventos (Live)</h3>
              <div className="status-indicator"><div className="pulse"></div> Conectado</div>
            </div>
            
            <div className="terminal-table-container">
              <table className="terminal-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Hora</th>
                    <th>Cadena Original</th>
                    <th>Tokens (Análisis Léxico)</th>
                    <th style={{textAlign: 'right'}}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Cargando registros...</td></tr>
                  ) : logs.map((log, i) => {
                    const isVulnerable = log.analysis.includes('VULNERABILIDAD');
                    return (
                      <tr key={log.id || i}>
                        <td>{logs.length - i}</td>
                        <td className="log-time">{new Date(log.timestamp).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', second:'2-digit'})}</td>
                        <td className="log-original">
                          <span className="info-tag">[INFO]</span> 
                          <span className="user-tag">[{log.user_id === 'anonymous' ? 'ANONIMO' : log.user_id.toUpperCase()}]</span> 
                          {log.action_type.toUpperCase()} {log.target_element}
                        </td>
                        <td className="log-tokens">
                          <span className="token-pill pill-purple"><span>&lt;USUARIO&gt;</span> {log.user_id}</span>
                          <span className="token-pill pill-blue"><span>&lt;ACCION&gt;</span> {log.action_type}</span>
                          <span className="token-pill pill-green"><span>&lt;OBJETIVO&gt;</span> {log.target_element}</span>
                          <span className="token-pill pill-yellow"><span>&lt;TOKEN&gt;</span> {log.token}</span>
                        </td>
                        <td style={{textAlign: 'right'}}>
                          <div className={`status-badge ${isVulnerable ? 'status-danger' : 'status-valid'}`}>
                            {isVulnerable ? '✕ Anomalía' : '✓ Válido'}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
