import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Plus, Search, Download, ExternalLink } from 'lucide-react'
import { api, handleApiError } from '../services/api'
import './Pages.css'

const Documentos = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const { data: documentos = [], isLoading, error } = useQuery({
    queryKey: ['documentos'],
    queryFn: () => api.documentos.getAll()
  })

  const { data: tipos = [] } = useQuery({
    queryKey: ['documentos', 'types'],
    queryFn: () => api.documentos.getTypes()
  })

  const filteredDocumentos = documentos.filter(doc => {
    const matchesSearch = doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.subido_por?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || doc.tipo === filterType
    
    return matchesSearch && matchesType
  })

  const getFileIcon = (tipo) => {
    const icons = {
      'PDF': '📄',
      'Word': '📝',
      'Excel': '📊',
      'PowerPoint': '📋',
      'Imagen': '🖼️',
      'Video': '🎥',
      'Audio': '🎵'
    }
    return icons[tipo] || '📄'
  }

  if (isLoading) return <div className="loading">Cargando documentos...</div>
  if (error) return <div className="error">Error: {handleApiError(error)}</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <FileText size={32} />
            Documentos
          </h1>
          <p>Repositorio de documentos internos</p>
        </div>
        <button className="primary">
          <Plus size={20} />
          Subir Documento
        </button>
      </div>

      {/* Controles */}
      <div className="page-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-select">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Todos los tipos</option>
            {tipos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="documents-grid">
        {filteredDocumentos.map((documento) => (
          <div key={documento.id} className="document-card">
            <div className="document-icon">
              {getFileIcon(documento.tipo)}
            </div>
            
            <div className="document-content">
              <h3>{documento.titulo}</h3>
              <div className="document-meta">
                <span className="document-type">{documento.tipo}</span>
                <span className="document-date">
                  {new Date(documento.fecha).toLocaleDateString()}
                </span>
              </div>
              {documento.subido_por && (
                <p className="document-author">Por {documento.subido_por}</p>
              )}
            </div>

            <div className="document-actions">
              {documento.link && (
                <button className="secondary" title="Abrir documento">
                  <ExternalLink size={16} />
                </button>
              )}
              <button className="secondary" title="Descargar">
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocumentos.length === 0 && (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No hay documentos</h3>
          <p>No se encontraron documentos con los criterios seleccionados</p>
        </div>
      )}
    </div>
  )
}

export default Documentos
