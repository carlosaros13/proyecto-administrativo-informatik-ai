import { useQuery } from '@tanstack/react-query'
import {
  FolderOpen,
  Lightbulb,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Award,
  Gift,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy
} from 'lucide-react'
import { api } from '../services/api'
import './Dashboard.css'

const Dashboard = () => {
  // Consultas para obtener estadísticas
  const { data: proyectos = [] } = useQuery({
    queryKey: ['proyectos', 'stats'],
    queryFn: () => api.get('/proyectos?stats=true')
  })

  const { data: ideas = [] } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => api.get('/ideas')
  })

  const { data: reunionesProximas = [] } = useQuery({
    queryKey: ['reuniones', 'upcoming'],
    queryFn: () => api.get('/reuniones/upcoming?limit=5')
  })

  const { data: documentosRecientes = [] } = useQuery({
    queryKey: ['documentos', 'recent'],
    queryFn: () => api.get('/documentos/recent?limit=5')
  })

  // Nuevas consultas para los módulos adicionales
  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => api.colaboradores.getAll()
  })

  const { data: colaboradoresStats } = useQuery({
    queryKey: ['colaboradores', 'stats'],
    queryFn: () => api.colaboradores.getStats()
  })

  const { data: empleadoMesActual = [] } = useQuery({
    queryKey: ['empleados-mes', 'current'],
    queryFn: () => {
      const now = new Date()
      return api.empleadosMes.getAll({ mes: now.getMonth() + 1, año: now.getFullYear() })
    }
  })

  const { data: beneficiosActivos = [] } = useQuery({
    queryKey: ['beneficios', 'active'],
    queryFn: () => api.beneficios.getAll({ estado: 'activo' })
  })

  const { data: beneficiosStats } = useQuery({
    queryKey: ['beneficios', 'stats'],
    queryFn: () => api.beneficios.getStats()
  })

  // Calcular estadísticas
  const stats = {
    proyectos: {
      total: proyectos.length,
      activos: proyectos.filter(p => p.estado === 'activo').length,
      completados: proyectos.filter(p => p.estado === 'completado').length
    },
    ideas: {
      total: ideas.length,
      pendientes: ideas.filter(i => i.estado === 'pendiente').length,
      enEvaluacion: ideas.filter(i => i.estado === 'en_evaluacion').length,
      aceptadas: ideas.filter(i => i.estado === 'aceptada').length
    }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="stat-card" style={{ '--card-color': color }}>
      <div className="stat-header">
        <div className="stat-icon">
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={16} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  )

  const QuickActionCard = ({ icon: Icon, title, description, color, onClick }) => (
    <div className="quick-action-card" onClick={onClick} style={{ '--action-color': color }}>
      <div className="action-icon">
        <Icon size={20} />
      </div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  )

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Bienvenido al Hub Interno de Informatik-AI</p>
        </div>
        <div className="dashboard-date">
          <span>{new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-grid">
        <StatCard
          icon={FolderOpen}
          title="Proyectos Activos"
          value={stats.proyectos.activos}
          subtitle={`${stats.proyectos.total} total`}
          color="#4CAF50"
          trend={12}
        />
        <StatCard
          icon={Lightbulb}
          title="Ideas Pendientes"
          value={stats.ideas.pendientes}
          subtitle={`${stats.ideas.total} total`}
          color="#FF9800"
          trend={8}
        />
        <StatCard
          icon={Calendar}
          title="Próximas Reuniones"
          value={reunionesProximas.length}
          subtitle="Esta semana"
          color="#9C27B0"
        />
        <StatCard
          icon={FileText}
          title="Documentos"
          value={documentosRecientes.length}
          subtitle="Recientes"
          color="#2196F3"
        />
        <StatCard
          icon={Users}
          title="Colaboradores"
          value={colaboradoresStats?.activos || 0}
          subtitle={`${colaboradores.length} total`}
          color="#607D8B"
          trend={5}
        />
        <StatCard
          icon={Award}
          title="Nominaciones"
          value={empleadoMesActual.length}
          subtitle="Este mes"
          color="#FF5722"
        />
        <StatCard
          icon={Gift}
          title="Beneficios"
          value={beneficiosStats?.activos || 0}
          subtitle={`${beneficiosStats?.categorias || 0} categorías`}
          color="#795548"
        />
      </div>

      <div className="dashboard-content">
        {/* Acciones rápidas */}
        <div className="dashboard-section">
          <h2>Acciones Rápidas</h2>
          <div className="quick-actions-grid">
            <QuickActionCard
              icon={FolderOpen}
              title="Nuevo Proyecto"
              description="Crear un nuevo proyecto"
              color="#4CAF50"
              onClick={() => window.location.href = '/proyectos'}
            />
            <QuickActionCard
              icon={Lightbulb}
              title="Proponer Idea"
              description="Agregar una nueva idea de IA"
              color="#FF9800"
              onClick={() => window.location.href = '/ideas'}
            />
            <QuickActionCard
              icon={Calendar}
              title="Programar Reunión"
              description="Agendar una nueva reunión"
              color="#9C27B0"
              onClick={() => window.location.href = '/reuniones'}
            />
            <QuickActionCard
              icon={FileText}
              title="Subir Documento"
              description="Agregar un nuevo documento"
              color="#2196F3"
              onClick={() => window.location.href = '/documentos'}
            />
            <QuickActionCard
              icon={Users}
              title="Agregar Colaborador"
              description="Registrar nuevo miembro del equipo"
              color="#607D8B"
              onClick={() => window.location.href = '/colaboradores'}
            />
            <QuickActionCard
              icon={Award}
              title="Votar Empleado del Mes"
              description="Nominar a un colaborador destacado"
              color="#FF5722"
              onClick={() => window.location.href = '/empleado-mes'}
            />
            <QuickActionCard
              icon={Gift}
              title="Nuevo Beneficio"
              description="Agregar beneficio o convenio"
              color="#795548"
              onClick={() => window.location.href = '/beneficios'}
            />
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Empleado del mes actual */}
          {empleadoMesActual.find(emp => emp.estado === 'ganador') && (
            <div className="dashboard-card empleado-mes-card">
              <div className="card-header">
                <h3>
                  <Trophy size={20} />
                  🏆 Empleado del Mes
                </h3>
              </div>
              <div className="card-content">
                {(() => {
                  const ganador = empleadoMesActual.find(emp => emp.estado === 'ganador')
                  return (
                    <div className="empleado-mes-winner">
                      <div className="winner-info">
                        <h4>{ganador.colaborador_nombre}</h4>
                        <p>{ganador.colaborador_cargo}</p>
                        <div className="winner-stats">
                          <span>🗳️ {ganador.votos_recibidos} votos</span>
                          <span>⭐ {Math.round(ganador.criterios_desempeño / ganador.votos_recibidos)}/10</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Próximas reuniones */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <Calendar size={20} />
                Próximas Reuniones
              </h3>
            </div>
            <div className="card-content">
              {reunionesProximas.length > 0 ? (
                <div className="list-items">
                  {reunionesProximas.slice(0, 3).map((reunion) => (
                    <div key={reunion.id} className="list-item">
                      <div className="item-icon">
                        <Clock size={16} />
                      </div>
                      <div className="item-content">
                        <h4>{reunion.tema}</h4>
                        <p>{new Date(reunion.fecha).toLocaleDateString()} - {reunion.hora}</p>
                        {reunion.proyecto_nombre && (
                          <span className="item-tag">{reunion.proyecto_nombre}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No hay reuniones programadas</p>
                </div>
              )}
            </div>
          </div>

          {/* Ideas recientes */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <Lightbulb size={20} />
                Ideas Recientes
              </h3>
            </div>
            <div className="card-content">
              {ideas.length > 0 ? (
                <div className="list-items">
                  {ideas.slice(0, 3).map((idea) => (
                    <div key={idea.id} className="list-item">
                      <div className="item-icon">
                        {idea.estado === 'aceptada' ? (
                          <CheckCircle size={16} className="success" />
                        ) : idea.estado === 'en_evaluacion' ? (
                          <AlertCircle size={16} className="warning" />
                        ) : (
                          <Clock size={16} className="info" />
                        )}
                      </div>
                      <div className="item-content">
                        <h4>{idea.titulo}</h4>
                        <p>Por {idea.propuesto_por}</p>
                        <span className={`status-badge ${idea.estado}`}>
                          {idea.estado.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No hay ideas registradas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
