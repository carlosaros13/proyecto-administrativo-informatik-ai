import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Plus, Clock, MapPin } from 'lucide-react'
import { api, handleApiError } from '../services/api'
import './Pages.css'

const Reuniones = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const { data: reuniones = [], isLoading, error } = useQuery({
    queryKey: ['reuniones'],
    queryFn: () => api.reuniones.getAll()
  })

  const { data: proyectos = [] } = useQuery({
    queryKey: ['proyectos'],
    queryFn: () => api.proyectos.getAll()
  })

  const getStatusColor = (estado) => {
    const colors = {
      programada: '#2196F3',
      en_curso: '#FF9800',
      completada: '#4CAF50',
      cancelada: '#F44336'
    }
    return colors[estado] || '#9E9E9E'
  }

  const filteredReuniones = reuniones.filter(reunion => {
    if (!selectedDate) return true
    return reunion.fecha === selectedDate
  })

  if (isLoading) return <div className="loading">Cargando reuniones...</div>
  if (error) return <div className="error">Error: {handleApiError(error)}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <Calendar size={32} />
            Reuniones
          </h1>
          <p>Planificación y seguimiento de reuniones</p>
        </div>
        <button className="primary">
          <Plus size={20} />
          Nueva Reunión
        </button>
      </div>

      {/* Selector de fecha */}
      <div className="date-selector">
        <label>Filtrar por fecha:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Lista de reuniones */}
      <div className="meetings-list">
        {filteredReuniones.length > 0 ? (
          filteredReuniones.map((reunion) => (
            <div key={reunion.id} className="meeting-card">
              <div className="meeting-time">
                <Clock size={20} />
                <span>{reunion.hora}</span>
              </div>
              
              <div className="meeting-content">
                <h3>{reunion.tema}</h3>
                <p>{reunion.responsables}</p>
                {reunion.proyecto_nombre && (
                  <span className="meeting-project">📁 {reunion.proyecto_nombre}</span>
                )}
                {reunion.notas && (
                  <p className="meeting-notes">{reunion.notas}</p>
                )}
              </div>

              <div className="meeting-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(reunion.estado) }}
                >
                  {reunion.estado}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No hay reuniones</h3>
            <p>No hay reuniones programadas para esta fecha</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reuniones
