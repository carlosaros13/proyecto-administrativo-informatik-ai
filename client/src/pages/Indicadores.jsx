import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Plus, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { api, handleApiError } from '../services/api'
import './Pages.css'

const Indicadores = () => {
  const [filterType, setFilterType] = useState('all')

  const { data: indicadores = [], isLoading, error } = useQuery({
    queryKey: ['indicadores'],
    queryFn: () => api.indicadores.getAll()
  })

  const { data: summary } = useQuery({
    queryKey: ['indicadores', 'summary'],
    queryFn: () => api.indicadores.getSummary()
  })

  const filteredIndicadores = indicadores.filter(indicador => {
    if (filterType === 'all') return true
    return indicador.relacionado_a === filterType
  })

  const getIndicatorIcon = (relacionadoA) => {
    const icons = {
      proyecto: '📁',
      idea: '💡'
    }
    return icons[relacionadoA] || '📊'
  }

  const getTrendIcon = (valor) => {
    if (valor > 75) return <TrendingUp className="trend-up" size={16} />
    if (valor < 25) return <TrendingDown className="trend-down" size={16} />
    return <Activity className="trend-stable" size={16} />
  }

  if (isLoading) return <div className="loading">Cargando indicadores...</div>
  if (error) return <div className="error">Error: {handleApiError(error)}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <BarChart3 size={32} />
            Indicadores
          </h1>
          <p>Métricas y KPIs del negocio</p>
        </div>
        <button className="primary">
          <Plus size={20} />
          Nuevo Indicador
        </button>
      </div>

      {/* Resumen */}
      {summary && (
        <div className="indicators-summary">
          <div className="summary-card">
            <h3>Total de Indicadores</h3>
            <span className="summary-value">{summary.total}</span>
          </div>
          {summary.por_tipo?.map(tipo => (
            <div key={tipo.relacionado_a} className="summary-card">
              <h3>Indicadores de {tipo.relacionado_a}</h3>
              <span className="summary-value">{tipo.total_indicadores}</span>
              <span className="summary-subtitle">
                Promedio: {tipo.valor_promedio?.toFixed(1) || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="filter-tabs">
        <button 
          className={filterType === 'all' ? 'active' : ''}
          onClick={() => setFilterType('all')}
        >
          Todos
        </button>
        <button 
          className={filterType === 'proyecto' ? 'active' : ''}
          onClick={() => setFilterType('proyecto')}
        >
          Proyectos
        </button>
        <button 
          className={filterType === 'idea' ? 'active' : ''}
          onClick={() => setFilterType('idea')}
        >
          Ideas
        </button>
      </div>

      {/* Lista de indicadores */}
      <div className="indicators-grid">
        {filteredIndicadores.map((indicador) => (
          <div key={indicador.id} className="indicator-card">
            <div className="indicator-header">
              <div className="indicator-icon">
                {getIndicatorIcon(indicador.relacionado_a)}
              </div>
              <div className="indicator-trend">
                {getTrendIcon(indicador.valor_actual)}
              </div>
            </div>
            
            <h3>{indicador.nombre}</h3>
            
            <div className="indicator-value">
              <span className="value">{indicador.valor_actual}</span>
              {indicador.unidad && (
                <span className="unit">{indicador.unidad}</span>
              )}
            </div>

            {indicador.relacionado_nombre && (
              <div className="indicator-relation">
                {getIndicatorIcon(indicador.relacionado_a)} {indicador.relacionado_nombre}
              </div>
            )}

            <div className="indicator-date">
              Actualizado: {new Date(indicador.fecha_ultima_actualizacion).toLocaleDateString()}
            </div>

            {/* Barra de progreso visual */}
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(100, Math.max(0, indicador.valor_actual))}%`,
                  backgroundColor: indicador.valor_actual > 75 ? '#4CAF50' : 
                                 indicador.valor_actual > 50 ? '#FF9800' : '#F44336'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {filteredIndicadores.length === 0 && (
        <div className="empty-state">
          <BarChart3 size={48} />
          <h3>No hay indicadores</h3>
          <p>No se encontraron indicadores con los criterios seleccionados</p>
        </div>
      )}
    </div>
  )
}

export default Indicadores
