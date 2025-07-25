import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, FolderOpen } from 'lucide-react'
import { api, handleApiError } from '../services/api'
import './Pages.css'

const Proyectos = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const queryClient = useQueryClient()

  // Consulta para obtener proyectos
  const { data: proyectos = [], isLoading, error } = useQuery({
    queryKey: ['proyectos'],
    queryFn: () => api.proyectos.getAll({ stats: true })
  })

  // Mutación para crear proyecto
  const createMutation = useMutation({
    mutationFn: api.proyectos.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['proyectos'])
      setShowForm(false)
      alert('Proyecto creado exitosamente')
    },
    onError: (error) => {
      alert(handleApiError(error))
    }
  })

  // Mutación para actualizar proyecto
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.proyectos.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['proyectos'])
      setEditingProject(null)
      setShowForm(false)
      alert('Proyecto actualizado exitosamente')
    },
    onError: (error) => {
      alert(handleApiError(error))
    }
  })

  // Mutación para eliminar proyecto
  const deleteMutation = useMutation({
    mutationFn: api.proyectos.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['proyectos'])
      alert('Proyecto eliminado exitosamente')
    },
    onError: (error) => {
      alert(handleApiError(error))
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      estado: formData.get('estado'),
      responsable: formData.get('responsable'),
      fecha_inicio: formData.get('fecha_inicio'),
      fecha_fin: formData.get('fecha_fin'),
      tags: formData.get('tags')
    }

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (proyecto) => {
    setEditingProject(proyecto)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      deleteMutation.mutate(id)
    }
  }

  const filteredProyectos = proyectos.filter(proyecto =>
    proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyecto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyecto.responsable?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (estado) => {
    const colors = {
      activo: '#4CAF50',
      pausado: '#FF9800',
      completado: '#2196F3',
      cancelado: '#F44336'
    }
    return colors[estado] || '#9E9E9E'
  }

  if (isLoading) return <div className="loading">Cargando proyectos...</div>
  if (error) return <div className="error">Error: {handleApiError(error)}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <FolderOpen size={32} />
            Proyectos
          </h1>
          <p>Gestiona los proyectos de la empresa</p>
        </div>
        <button onClick={() => setShowForm(true)} className="primary">
          <Plus size={20} />
          Nuevo Proyecto
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar proyectos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de proyectos */}
      <div className="projects-grid">
        {filteredProyectos.map((proyecto) => (
          <div key={proyecto.id} className="project-card">
            <div className="project-header">
              <h3>{proyecto.nombre}</h3>
              <div className="project-actions">
                <button onClick={() => handleEdit(proyecto)} className="secondary">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(proyecto.id)} className="danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <p className="project-description">{proyecto.descripcion}</p>
            
            <div className="project-meta">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(proyecto.estado) }}
              >
                {proyecto.estado}
              </span>
              {proyecto.responsable && (
                <span className="responsible">👤 {proyecto.responsable}</span>
              )}
            </div>

            {proyecto.stats && (
              <div className="project-stats">
                <span>💡 {proyecto.stats.total_ideas} ideas</span>
                <span>📅 {proyecto.stats.total_reuniones} reuniones</span>
              </div>
            )}

            <div className="project-dates">
              {proyecto.fecha_inicio && (
                <span>Inicio: {new Date(proyecto.fecha_inicio).toLocaleDateString()}</span>
              )}
              {proyecto.fecha_fin && (
                <span>Fin: {new Date(proyecto.fecha_fin).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProyectos.length === 0 && (
        <div className="empty-state">
          <FolderOpen size={48} />
          <h3>No hay proyectos</h3>
          <p>Comienza creando tu primer proyecto</p>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
              <button onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  name="nombre"
                  type="text"
                  required
                  defaultValue={editingProject?.nombre || ''}
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  rows="3"
                  defaultValue={editingProject?.descripcion || ''}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Estado</label>
                  <select name="estado" defaultValue={editingProject?.estado || 'activo'}>
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Responsable</label>
                  <input
                    name="responsable"
                    type="text"
                    defaultValue={editingProject?.responsable || ''}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Inicio</label>
                  <input
                    name="fecha_inicio"
                    type="date"
                    defaultValue={editingProject?.fecha_inicio || ''}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Fin</label>
                  <input
                    name="fecha_fin"
                    type="date"
                    defaultValue={editingProject?.fecha_fin || ''}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tags (separados por comas)</label>
                <input
                  name="tags"
                  type="text"
                  placeholder="IA, Automatización, Web"
                  defaultValue={editingProject?.tags || ''}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="secondary">
                  Cancelar
                </button>
                <button type="submit" className="primary">
                  {editingProject ? 'Actualizar' : 'Crear'} Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Proyectos
