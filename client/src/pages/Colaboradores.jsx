import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Users, Mail, Phone, Calendar, Award } from 'lucide-react'
import { api, handleApiError } from '../services/api'
import './Pages.css'

const Colaboradores = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingColaborador, setEditingColaborador] = useState(null)
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const queryClient = useQueryClient()

  // Consultas
  const { data: colaboradores = [], isLoading, error } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => api.colaboradores.getAll()
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['colaboradores', 'departments'],
    queryFn: () => api.colaboradores.getDepartments()
  })

  const { data: stats } = useQuery({
    queryKey: ['colaboradores', 'stats'],
    queryFn: () => api.colaboradores.getStats()
  })

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: api.colaboradores.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['colaboradores'])
      setShowForm(false)
      alert('Colaborador creado exitosamente')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.colaboradores.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['colaboradores'])
      setEditingColaborador(null)
      setShowForm(false)
      alert('Colaborador actualizado exitosamente')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const deleteMutation = useMutation({
    mutationFn: api.colaboradores.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['colaboradores'])
      alert('Colaborador eliminado exitosamente')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      cargo: formData.get('cargo'),
      departamento: formData.get('departamento'),
      fecha_ingreso: formData.get('fecha_ingreso'),
      estado: formData.get('estado'),
      puntaje: parseInt(formData.get('puntaje')) || 0
    }

    if (editingColaborador) {
      updateMutation.mutate({ id: editingColaborador.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (colaborador) => {
    setEditingColaborador(colaborador)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este colaborador?')) {
      deleteMutation.mutate(id)
    }
  }

  const filteredColaboradores = colaboradores.filter(colaborador => {
    const matchesSearch = colaborador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         colaborador.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         colaborador.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = filterDepartment === 'all' || colaborador.departamento === filterDepartment
    const matchesStatus = filterStatus === 'all' || colaborador.estado === filterStatus
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusColor = (estado) => {
    const colors = {
      activo: '#4CAF50',
      inactivo: '#F44336',
      vacaciones: '#FF9800'
    }
    return colors[estado] || '#9E9E9E'
  }

  const getScoreColor = (puntaje) => {
    if (puntaje >= 90) return '#4CAF50'
    if (puntaje >= 75) return '#FF9800'
    if (puntaje >= 60) return '#2196F3'
    return '#F44336'
  }

  if (isLoading) return <div className="loading">Cargando colaboradores...</div>
  if (error) return <div className="error">Error: {handleApiError(error)}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <Users size={32} />
            Colaboradores
          </h1>
          <p>Gestión del equipo de Informatik-AI</p>
          {stats && (
            <div className="header-stats">
              <span>👥 {stats.activos} activos</span>
              <span>🏢 {stats.departamentos} departamentos</span>
              <span>⭐ {stats.puntaje_promedio} promedio</span>
            </div>
          )}
        </div>
        <button onClick={() => setShowForm(true)} className="primary">
          <Plus size={20} />
          Nuevo Colaborador
        </button>
      </div>

      {/* Controles */}
      <div className="page-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar colaboradores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
            <option value="all">Todos los departamentos</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
            <option value="vacaciones">En vacaciones</option>
          </select>
        </div>
      </div>

      {/* Lista de colaboradores */}
      <div className="colaboradores-grid">
        {filteredColaboradores.map((colaborador) => (
          <div key={colaborador.id} className="colaborador-card">
            <div className="colaborador-header">
              <div className="colaborador-avatar">
                {colaborador.avatar_url ? (
                  <img src={colaborador.avatar_url} alt={colaborador.nombre} />
                ) : (
                  <span>{colaborador.nombre.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="colaborador-actions">
                <button onClick={() => handleEdit(colaborador)} className="secondary">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(colaborador.id)} className="danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="colaborador-info">
              <h3>{colaborador.nombre}</h3>
              <p className="colaborador-cargo">{colaborador.cargo}</p>
              <p className="colaborador-departamento">🏢 {colaborador.departamento}</p>
            </div>

            <div className="colaborador-contact">
              <div className="contact-item">
                <Mail size={14} />
                <span>{colaborador.email}</span>
              </div>
              {colaborador.telefono && (
                <div className="contact-item">
                  <Phone size={14} />
                  <span>{colaborador.telefono}</span>
                </div>
              )}
            </div>

            <div className="colaborador-meta">
              <div className="meta-item">
                <Calendar size={14} />
                <span>Desde {new Date(colaborador.fecha_ingreso).toLocaleDateString()}</span>
              </div>
              <div className="meta-item">
                <Award size={14} />
                <span 
                  className="score-badge"
                  style={{ backgroundColor: getScoreColor(colaborador.puntaje) }}
                >
                  {colaborador.puntaje}/100
                </span>
              </div>
            </div>

            <div className="colaborador-status">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(colaborador.estado) }}
              >
                {colaborador.estado}
              </span>
            </div>

            {colaborador.descripcion && (
              <p className="colaborador-description">{colaborador.descripcion}</p>
            )}
          </div>
        ))}
      </div>

      {filteredColaboradores.length === 0 && (
        <div className="empty-state">
          <Users size={48} />
          <h3>No hay colaboradores</h3>
          <p>No se encontraron colaboradores con los criterios seleccionados</p>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingColaborador ? 'Editar Colaborador' : 'Nuevo Colaborador'}</h2>
              <button onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    name="nombre"
                    type="text"
                    required
                    defaultValue={editingColaborador?.nombre || ''}
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editingColaborador?.email || ''}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  rows="3"
                  defaultValue={editingColaborador?.descripcion || ''}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    name="telefono"
                    type="tel"
                    defaultValue={editingColaborador?.telefono || ''}
                  />
                </div>

                <div className="form-group">
                  <label>Cargo</label>
                  <input
                    name="cargo"
                    type="text"
                    defaultValue={editingColaborador?.cargo || ''}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Departamento</label>
                  <input
                    name="departamento"
                    type="text"
                    defaultValue={editingColaborador?.departamento || ''}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Ingreso</label>
                  <input
                    name="fecha_ingreso"
                    type="date"
                    defaultValue={editingColaborador?.fecha_ingreso || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Estado</label>
                  <select name="estado" defaultValue={editingColaborador?.estado || 'activo'}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="vacaciones">En vacaciones</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Puntaje (0-100)</label>
                  <input
                    name="puntaje"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingColaborador?.puntaje || 0}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="secondary">
                  Cancelar
                </button>
                <button type="submit" className="primary">
                  {editingColaborador ? 'Actualizar' : 'Crear'} Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Colaboradores
