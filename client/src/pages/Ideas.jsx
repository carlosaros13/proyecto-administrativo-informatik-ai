import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Lightbulb, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import { api, handleApiError } from '../services/api'
import './Pages.css'

const Ideas = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingIdea, setEditingIdea] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const queryClient = useQueryClient()

  // Consultas
  const { data: ideas = [], isLoading, error } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => api.ideas.getAll()
  })

  const { data: proyectos = [] } = useQuery({
    queryKey: ['proyectos'],
    queryFn: () => api.proyectos.getAll()
  })

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: api.ideas.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['ideas'])
      setShowForm(false)
      alert('Idea creada exitosamente')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.ideas.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ideas'])
      setEditingIdea(null)
      setShowForm(false)
      alert('Idea actualizada exitosamente')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, estado }) => api.ideas.changeStatus(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries(['ideas'])
      alert('Estado actualizado exitosamente')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const deleteMutation = useMutation({
    mutationFn: api.ideas.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['ideas'])
      alert('Idea eliminada exitosamente')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      titulo: formData.get('titulo'),
      descripcion: formData.get('descripcion'),
      propuesto_por: formData.get('propuesto_por'),
      fecha: formData.get('fecha'),
      estado: formData.get('estado'),
      proyecto_id: formData.get('proyecto_id') || null
    }

    if (editingIdea) {
      updateMutation.mutate({ id: editingIdea.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (idea) => {
    setEditingIdea(idea)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta idea?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleStatusChange = (id, estado) => {
    changeStatusMutation.mutate({ id, estado })
  }

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.propuesto_por?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || idea.estado === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (estado) => {
    const icons = {
      pendiente: <Clock size={16} className="status-icon pending" />,
      en_evaluacion: <AlertCircle size={16} className="status-icon evaluating" />,
      aceptada: <CheckCircle size={16} className="status-icon accepted" />,
      rechazada: <XCircle size={16} className="status-icon rejected" />
    }
    return icons[estado] || icons.pendiente
  }

  const getStatusColor = (estado) => {
    const colors = {
      pendiente: '#9E9E9E',
      en_evaluacion: '#FF9800',
      aceptada: '#4CAF50',
      rechazada: '#F44336'
    }
    return colors[estado] || '#9E9E9E'
  }

  if (isLoading) return <div className="loading">Cargando ideas...</div>
  if (error) return <div className="error">Error: {handleApiError(error)}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <Lightbulb size={32} />
            Ideas de IA
          </h1>
          <p>Banco de ideas y propuestas de inteligencia artificial</p>
        </div>
        <button onClick={() => setShowForm(true)} className="primary">
          <Plus size={20} />
          Nueva Idea
        </button>
      </div>

      {/* Controles */}
      <div className="page-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button 
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            Todas
          </button>
          <button 
            className={filterStatus === 'pendiente' ? 'active' : ''}
            onClick={() => setFilterStatus('pendiente')}
          >
            Pendientes
          </button>
          <button 
            className={filterStatus === 'en_evaluacion' ? 'active' : ''}
            onClick={() => setFilterStatus('en_evaluacion')}
          >
            En Evaluación
          </button>
          <button 
            className={filterStatus === 'aceptada' ? 'active' : ''}
            onClick={() => setFilterStatus('aceptada')}
          >
            Aceptadas
          </button>
          <button 
            className={filterStatus === 'rechazada' ? 'active' : ''}
            onClick={() => setFilterStatus('rechazada')}
          >
            Rechazadas
          </button>
        </div>
      </div>

      {/* Lista de ideas */}
      <div className="ideas-grid">
        {filteredIdeas.map((idea) => (
          <div key={idea.id} className="idea-card">
            <div className="idea-header">
              <div className="idea-status">
                {getStatusIcon(idea.estado)}
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(idea.estado) }}
                >
                  {idea.estado.replace('_', ' ')}
                </span>
              </div>
              <div className="idea-actions">
                <button onClick={() => handleEdit(idea)} className="secondary">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(idea.id)} className="danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <h3 className="idea-title">{idea.titulo}</h3>
            <p className="idea-description">{idea.descripcion}</p>
            
            <div className="idea-meta">
              <span className="idea-author">💡 {idea.propuesto_por}</span>
              <span className="idea-date">
                {new Date(idea.fecha).toLocaleDateString()}
              </span>
            </div>

            {idea.proyecto_nombre && (
              <div className="idea-project">
                📁 {idea.proyecto_nombre}
              </div>
            )}

            {/* Acciones de estado */}
            <div className="status-actions">
              {idea.estado === 'pendiente' && (
                <>
                  <button 
                    onClick={() => handleStatusChange(idea.id, 'en_evaluacion')}
                    className="status-btn evaluating"
                  >
                    Evaluar
                  </button>
                </>
              )}
              {idea.estado === 'en_evaluacion' && (
                <>
                  <button 
                    onClick={() => handleStatusChange(idea.id, 'aceptada')}
                    className="status-btn accepted"
                  >
                    Aceptar
                  </button>
                  <button 
                    onClick={() => handleStatusChange(idea.id, 'rechazada')}
                    className="status-btn rejected"
                  >
                    Rechazar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="empty-state">
          <Lightbulb size={48} />
          <h3>No hay ideas</h3>
          <p>Comienza agregando tu primera idea de IA</p>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingIdea ? 'Editar Idea' : 'Nueva Idea'}</h2>
              <button onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Título *</label>
                <input
                  name="titulo"
                  type="text"
                  required
                  defaultValue={editingIdea?.titulo || ''}
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  rows="4"
                  defaultValue={editingIdea?.descripcion || ''}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Propuesto por</label>
                  <input
                    name="propuesto_por"
                    type="text"
                    defaultValue={editingIdea?.propuesto_por || ''}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    name="fecha"
                    type="date"
                    defaultValue={editingIdea?.fecha || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Estado</label>
                  <select name="estado" defaultValue={editingIdea?.estado || 'pendiente'}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_evaluacion">En Evaluación</option>
                    <option value="aceptada">Aceptada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Proyecto (opcional)</label>
                  <select name="proyecto_id" defaultValue={editingIdea?.proyecto_id || ''}>
                    <option value="">Sin proyecto</option>
                    {proyectos.map(proyecto => (
                      <option key={proyecto.id} value={proyecto.id}>
                        {proyecto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="secondary">
                  Cancelar
                </button>
                <button type="submit" className="primary">
                  {editingIdea ? 'Actualizar' : 'Crear'} Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ideas
