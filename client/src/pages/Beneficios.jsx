import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Gift, Plus, Search, Edit, Trash2, Calendar, Percent, AlertTriangle } from 'lucide-react'
import { api, handleApiError } from '../services/api'
import './Pages.css'

const Beneficios = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBeneficio, setEditingBeneficio] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const queryClient = useQueryClient()

  // Consultas
  const { data: beneficios = [], isLoading, error } = useQuery({
    queryKey: ['beneficios'],
    queryFn: () => api.beneficios.getAll()
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['beneficios', 'categories'],
    queryFn: () => api.beneficios.getCategories()
  })

  const { data: stats } = useQuery({
    queryKey: ['beneficios', 'stats'],
    queryFn: () => api.beneficios.getStats()
  })

  const { data: expiring = [] } = useQuery({
    queryKey: ['beneficios', 'expiring'],
    queryFn: () => api.beneficios.getExpiring(30)
  })

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: api.beneficios.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['beneficios'])
      setShowForm(false)
      alert('Beneficio creado exitosamente')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.beneficios.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['beneficios'])
      setEditingBeneficio(null)
      setShowForm(false)
      alert('Beneficio actualizado exitosamente')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const deleteMutation = useMutation({
    mutationFn: api.beneficios.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['beneficios'])
      alert('Beneficio eliminado exitosamente')
    },
    onError: (error) => alert(handleApiError(error))
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      titulo: formData.get('titulo'),
      descripcion: formData.get('descripcion'),
      categoria: formData.get('categoria'),
      proveedor: formData.get('proveedor'),
      descuento: parseFloat(formData.get('descuento')) || 0,
      vigencia_inicio: formData.get('vigencia_inicio') || null,
      vigencia_fin: formData.get('vigencia_fin') || null,
      requisitos: formData.get('requisitos'),
      estado: formData.get('estado')
    }

    if (editingBeneficio) {
      updateMutation.mutate({ id: editingBeneficio.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (beneficio) => {
    setEditingBeneficio(beneficio)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este beneficio?')) {
      deleteMutation.mutate(id)
    }
  }

  const filteredBeneficios = beneficios.filter(beneficio => {
    const matchesSearch = beneficio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beneficio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beneficio.proveedor?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || beneficio.categoria === filterCategory
    const matchesStatus = filterStatus === 'all' || beneficio.estado === filterStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryIcon = (categoria) => {
    const icons = {
      'Salud': '🏥',
      'Educación': '📚',
      'Recreación': '🎯',
      'Tecnología': '💻',
      'Descuentos': '🏷️',
      'Bienestar': '🧘'
    }
    return icons[categoria] || '🎁'
  }

  const getCategoryColor = (categoria) => {
    const colors = {
      'Salud': '#4CAF50',
      'Educación': '#2196F3',
      'Recreación': '#FF9800',
      'Tecnología': '#9C27B0',
      'Descuentos': '#F44336',
      'Bienestar': '#00BCD4'
    }
    return colors[categoria] || '#9E9E9E'
  }

  const isExpiringSoon = (beneficio) => {
    if (!beneficio.vigencia_fin) return false
    const today = new Date()
    const endDate = new Date(beneficio.vigencia_fin)
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const isExpired = (beneficio) => {
    if (!beneficio.vigencia_fin) return false
    const today = new Date()
    const endDate = new Date(beneficio.vigencia_fin)
    return endDate < today
  }

  if (isLoading) return <div className="loading">Cargando beneficios...</div>
  if (error) return <div className="error">Error: {handleApiError(error)}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <Gift size={32} />
            Beneficios y Convenios
          </h1>
          <p>Beneficios laborales y convenios empresariales</p>
          {stats && (
            <div className="header-stats">
              <span>🎁 {stats.activos} activos</span>
              <span>📂 {stats.categorias} categorías</span>
              <span>🏢 {stats.proveedores} proveedores</span>
            </div>
          )}
        </div>
        <button onClick={() => setShowForm(true)} className="primary">
          <Plus size={20} />
          Nuevo Beneficio
        </button>
      </div>

      {/* Alertas de beneficios por vencer */}
      {expiring.length > 0 && (
        <div className="expiring-alert">
          <AlertTriangle size={20} />
          <span>
            {expiring.length} beneficio{expiring.length > 1 ? 's' : ''} por vencer en los próximos 30 días
          </span>
        </div>
      )}

      {/* Controles */}
      <div className="page-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar beneficios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryIcon(category)} {category}
              </option>
            ))}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Lista de beneficios */}
      <div className="beneficios-grid">
        {filteredBeneficios.map((beneficio) => (
          <div 
            key={beneficio.id} 
            className={`beneficio-card ${isExpired(beneficio) ? 'expired' : ''} ${isExpiringSoon(beneficio) ? 'expiring' : ''}`}
          >
            <div className="beneficio-header">
              <div className="beneficio-category">
                <span 
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(beneficio.categoria) }}
                >
                  {getCategoryIcon(beneficio.categoria)} {beneficio.categoria}
                </span>
              </div>
              <div className="beneficio-actions">
                <button onClick={() => handleEdit(beneficio)} className="secondary">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(beneficio.id)} className="danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="beneficio-content">
              <h3>{beneficio.titulo}</h3>
              <p className="beneficio-description">{beneficio.descripcion}</p>
              
              {beneficio.proveedor && (
                <p className="beneficio-provider">🏢 {beneficio.proveedor}</p>
              )}

              {beneficio.descuento > 0 && (
                <div className="beneficio-discount">
                  <Percent size={16} />
                  <span>{beneficio.descuento}% de descuento</span>
                </div>
              )}

              <div className="beneficio-validity">
                {beneficio.vigencia_inicio && (
                  <div className="validity-item">
                    <Calendar size={14} />
                    <span>Desde: {new Date(beneficio.vigencia_inicio).toLocaleDateString()}</span>
                  </div>
                )}
                {beneficio.vigencia_fin && (
                  <div className="validity-item">
                    <Calendar size={14} />
                    <span>Hasta: {new Date(beneficio.vigencia_fin).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {beneficio.requisitos && (
                <div className="beneficio-requirements">
                  <strong>Requisitos:</strong>
                  <p>{beneficio.requisitos}</p>
                </div>
              )}
            </div>

            <div className="beneficio-status">
              <span 
                className={`status-badge ${beneficio.estado}`}
              >
                {beneficio.estado}
              </span>
              {isExpiringSoon(beneficio) && (
                <span className="expiring-badge">
                  <AlertTriangle size={12} />
                  Por vencer
                </span>
              )}
              {isExpired(beneficio) && (
                <span className="expired-badge">
                  Vencido
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBeneficios.length === 0 && (
        <div className="empty-state">
          <Gift size={48} />
          <h3>No hay beneficios</h3>
          <p>No se encontraron beneficios con los criterios seleccionados</p>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBeneficio ? 'Editar Beneficio' : 'Nuevo Beneficio'}</h2>
              <button onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Título *</label>
                <input
                  name="titulo"
                  type="text"
                  required
                  defaultValue={editingBeneficio?.titulo || ''}
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  rows="3"
                  defaultValue={editingBeneficio?.descripcion || ''}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoría *</label>
                  <select name="categoria" required defaultValue={editingBeneficio?.categoria || ''}>
                    <option value="">Selecciona una categoría</option>
                    <option value="Salud">🏥 Salud</option>
                    <option value="Educación">📚 Educación</option>
                    <option value="Recreación">🎯 Recreación</option>
                    <option value="Tecnología">💻 Tecnología</option>
                    <option value="Descuentos">🏷️ Descuentos</option>
                    <option value="Bienestar">🧘 Bienestar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Proveedor</label>
                  <input
                    name="proveedor"
                    type="text"
                    defaultValue={editingBeneficio?.proveedor || ''}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Descuento (%)</label>
                  <input
                    name="descuento"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    defaultValue={editingBeneficio?.descuento || 0}
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select name="estado" defaultValue={editingBeneficio?.estado || 'activo'}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vigencia desde</label>
                  <input
                    name="vigencia_inicio"
                    type="date"
                    defaultValue={editingBeneficio?.vigencia_inicio || ''}
                  />
                </div>

                <div className="form-group">
                  <label>Vigencia hasta</label>
                  <input
                    name="vigencia_fin"
                    type="date"
                    defaultValue={editingBeneficio?.vigencia_fin || ''}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Requisitos</label>
                <textarea
                  name="requisitos"
                  rows="2"
                  placeholder="Describe los requisitos para acceder a este beneficio"
                  defaultValue={editingBeneficio?.requisitos || ''}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="secondary">
                  Cancelar
                </button>
                <button type="submit" className="primary">
                  {editingBeneficio ? 'Actualizar' : 'Crear'} Beneficio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Beneficios
