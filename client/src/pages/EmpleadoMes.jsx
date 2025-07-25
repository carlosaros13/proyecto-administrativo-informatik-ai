import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Award, Vote, Trophy, Star, Calendar, Users } from 'lucide-react'
import { api, handleApiError } from '../services/api'
import './Pages.css'

const EmpleadoMes = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showVoteForm, setShowVoteForm] = useState(false)
  const [selectedColaborador, setSelectedColaborador] = useState('')
  const queryClient = useQueryClient()

  // Consultas
  const { data: empleados = [], isLoading, error } = useQuery({
    queryKey: ['empleados-mes', selectedMonth, selectedYear],
    queryFn: () => api.empleadosMes.getAll({ mes: selectedMonth, año: selectedYear })
  })

  const { data: winners = [] } = useQuery({
    queryKey: ['empleados-mes', 'winners'],
    queryFn: () => api.empleadosMes.getWinners()
  })

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores', 'active'],
    queryFn: () => api.colaboradores.getAll({ estado: 'activo' })
  })

  const { data: stats } = useQuery({
    queryKey: ['empleados-mes', 'stats', selectedMonth, selectedYear],
    queryFn: () => api.empleadosMes.getStats(selectedMonth, selectedYear),
    enabled: empleados.length > 0
  })

  // Mutaciones
  const voteMutation = useMutation({
    mutationFn: ({ colaboradorId, criterios }) => 
      api.empleadosMes.vote(colaboradorId, selectedMonth, selectedYear, criterios),
    onSuccess: () => {
      queryClient.invalidateQueries(['empleados-mes'])
      setShowVoteForm(false)
      alert('¡Voto registrado exitosamente!')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const selectWinnerMutation = useMutation({
    mutationFn: () => api.empleadosMes.selectWinner(selectedMonth, selectedYear),
    onSuccess: () => {
      queryClient.invalidateQueries(['empleados-mes'])
      alert('¡Ganador seleccionado exitosamente!')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const handleVote = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const criterios = {
      desempeño: parseInt(formData.get('desempeño')),
      colaboracion: parseInt(formData.get('colaboracion'))
    }

    voteMutation.mutate({
      colaboradorId: parseInt(selectedColaborador),
      criterios
    })
  }

  const handleSelectWinner = () => {
    if (window.confirm('¿Estás seguro de que quieres seleccionar al ganador del mes?')) {
      selectWinnerMutation.mutate()
    }
  }

  const getMonthName = (month) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[month - 1]
  }

  const currentWinner = empleados.find(emp => emp.estado === 'ganador')
  const nominees = empleados.filter(emp => emp.estado === 'nominado').sort((a, b) => b.votos_recibidos - a.votos_recibidos)

  if (isLoading) return <div className="loading">Cargando empleados del mes...</div>
  if (error) return <div className="error">Error: {handleApiError(error)}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <Award size={32} />
            Empleado del Mes
          </h1>
          <p>Sistema de reconocimiento y votación</p>
        </div>
        <button onClick={() => setShowVoteForm(true)} className="primary">
          <Vote size={20} />
          Votar
        </button>
      </div>

      {/* Selector de período */}
      <div className="period-selector">
        <div className="period-controls">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {getMonthName(i + 1)}
              </option>
            ))}
          </select>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            })}
          </select>
        </div>

        {stats && (
          <div className="period-stats">
            <span>🗳️ {stats.total_votos} votos</span>
            <span>👥 {stats.total_nominaciones} nominados</span>
          </div>
        )}
      </div>

      {/* Ganador actual */}
      {currentWinner && (
        <div className="winner-section">
          <div className="winner-card">
            <div className="winner-crown">
              <Trophy size={32} />
            </div>
            <div className="winner-info">
              <h2>🏆 Ganador de {getMonthName(selectedMonth)} {selectedYear}</h2>
              <h3>{currentWinner.colaborador_nombre}</h3>
              <p>{currentWinner.colaborador_cargo} - {currentWinner.colaborador_departamento}</p>
              <div className="winner-stats">
                <span>🗳️ {currentWinner.votos_recibidos} votos</span>
                <span>⭐ Desempeño: {Math.round(currentWinner.criterios_desempeño / currentWinner.votos_recibidos)}/10</span>
                <span>🤝 Colaboración: {Math.round(currentWinner.criterios_colaboracion / currentWinner.votos_recibidos)}/10</span>
              </div>
              {currentWinner.comentarios && (
                <p className="winner-comments">"{currentWinner.comentarios}"</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nominados */}
      <div className="nominees-section">
        <div className="section-header">
          <h2>Nominados para {getMonthName(selectedMonth)} {selectedYear}</h2>
          {nominees.length > 0 && !currentWinner && (
            <button onClick={handleSelectWinner} className="primary">
              <Trophy size={20} />
              Seleccionar Ganador
            </button>
          )}
        </div>

        {nominees.length > 0 ? (
          <div className="nominees-grid">
            {nominees.map((nominee, index) => (
              <div key={nominee.id} className="nominee-card">
                <div className="nominee-rank">
                  #{index + 1}
                </div>
                
                <div className="nominee-info">
                  <h3>{nominee.colaborador_nombre}</h3>
                  <p>{nominee.colaborador_cargo}</p>
                  <p className="nominee-department">{nominee.colaborador_departamento}</p>
                </div>

                <div className="nominee-stats">
                  <div className="stat-item">
                    <Vote size={16} />
                    <span>{nominee.votos_recibidos} votos</span>
                  </div>
                  <div className="stat-item">
                    <Star size={16} />
                    <span>Desempeño: {Math.round(nominee.criterios_desempeño / nominee.votos_recibidos || 0)}/10</span>
                  </div>
                  <div className="stat-item">
                    <Users size={16} />
                    <span>Colaboración: {Math.round(nominee.criterios_colaboracion / nominee.votos_recibidos || 0)}/10</span>
                  </div>
                </div>

                {nominee.comentarios && (
                  <p className="nominee-comments">"{nominee.comentarios}"</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Award size={48} />
            <h3>No hay nominaciones</h3>
            <p>Aún no hay nominaciones para este período</p>
          </div>
        )}
      </div>

      {/* Historial de ganadores */}
      {winners.length > 0 && (
        <div className="winners-history">
          <h2>🏆 Historial de Ganadores</h2>
          <div className="winners-timeline">
            {winners.slice(0, 6).map((winner) => (
              <div key={winner.id} className="timeline-item">
                <div className="timeline-date">
                  {getMonthName(winner.mes)} {winner.año}
                </div>
                <div className="timeline-content">
                  <h4>{winner.colaborador_nombre}</h4>
                  <p>{winner.colaborador_cargo}</p>
                  <span className="timeline-votes">{winner.votos_recibidos} votos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de votación */}
      {showVoteForm && (
        <div className="modal-overlay" onClick={() => setShowVoteForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗳️ Votar por Empleado del Mes</h2>
              <button onClick={() => setShowVoteForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleVote} className="form">
              <div className="form-group">
                <label>Colaborador *</label>
                <select 
                  value={selectedColaborador} 
                  onChange={(e) => setSelectedColaborador(e.target.value)}
                  required
                >
                  <option value="">Selecciona un colaborador</option>
                  {colaboradores.map(colaborador => (
                    <option key={colaborador.id} value={colaborador.id}>
                      {colaborador.nombre} - {colaborador.cargo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Desempeño (1-10) *</label>
                  <input
                    name="desempeño"
                    type="number"
                    min="1"
                    max="10"
                    required
                  />
                  <small>Califica la calidad del trabajo y cumplimiento de objetivos</small>
                </div>

                <div className="form-group">
                  <label>Colaboración (1-10) *</label>
                  <input
                    name="colaboracion"
                    type="number"
                    min="1"
                    max="10"
                    required
                  />
                  <small>Califica el trabajo en equipo y ayuda a compañeros</small>
                </div>
              </div>

              <div className="vote-info">
                <p><strong>Período:</strong> {getMonthName(selectedMonth)} {selectedYear}</p>
                <p><small>Tu voto es anónimo y no puede ser modificado una vez enviado.</small></p>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowVoteForm(false)} className="secondary">
                  Cancelar
                </button>
                <button type="submit" className="primary">
                  <Vote size={20} />
                  Enviar Voto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmpleadoMes
