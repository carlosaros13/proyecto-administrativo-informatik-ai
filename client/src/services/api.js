import axios from 'axios'

// Configuración base de Axios
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    // Agregar timestamp para evitar cache
    config.params = {
      ...config.params,
      _t: Date.now()
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    // Extraer solo los datos de la respuesta
    return response.data.data || response.data
  },
  (error) => {
    // Manejo de errores
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
    
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage,
      details: error.response?.data?.details
    })

    // Crear un error más descriptivo
    const customError = new Error(errorMessage)
    customError.status = error.response?.status
    customError.details = error.response?.data?.details
    
    return Promise.reject(customError)
  }
)

// Funciones de API
export const api = {
  // Métodos genéricos
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),

  // Proyectos
  proyectos: {
    getAll: (params = {}) => apiClient.get('/proyectos', { params }),
    getById: (id) => apiClient.get(`/proyectos/${id}`),
    create: (data) => apiClient.post('/proyectos', data),
    update: (id, data) => apiClient.put(`/proyectos/${id}`, data),
    delete: (id) => apiClient.delete(`/proyectos/${id}`),
  },

  // Ideas de IA
  ideas: {
    getAll: (params = {}) => apiClient.get('/ideas', { params }),
    getById: (id) => apiClient.get(`/ideas/${id}`),
    getStats: () => apiClient.get('/ideas/stats'),
    create: (data) => apiClient.post('/ideas', data),
    update: (id, data) => apiClient.put(`/ideas/${id}`, data),
    changeStatus: (id, estado) => apiClient.patch(`/ideas/${id}/status`, { estado }),
    delete: (id) => apiClient.delete(`/ideas/${id}`),
  },

  // Reuniones
  reuniones: {
    getAll: (params = {}) => apiClient.get('/reuniones', { params }),
    getById: (id) => apiClient.get(`/reuniones/${id}`),
    getUpcoming: (limit = 5) => apiClient.get(`/reuniones/upcoming?limit=${limit}`),
    getStats: () => apiClient.get('/reuniones/stats'),
    create: (data) => apiClient.post('/reuniones', data),
    update: (id, data) => apiClient.put(`/reuniones/${id}`, data),
    delete: (id) => apiClient.delete(`/reuniones/${id}`),
  },

  // Documentos
  documentos: {
    getAll: (params = {}) => apiClient.get('/documentos', { params }),
    getById: (id) => apiClient.get(`/documentos/${id}`),
    getRecent: (limit = 5) => apiClient.get(`/documentos/recent?limit=${limit}`),
    getTypes: () => apiClient.get('/documentos/types'),
    getStats: () => apiClient.get('/documentos/stats'),
    search: (termino) => apiClient.get(`/documentos?search=${encodeURIComponent(termino)}`),
    create: (data) => apiClient.post('/documentos', data),
    update: (id, data) => apiClient.put(`/documentos/${id}`, data),
    delete: (id) => apiClient.delete(`/documentos/${id}`),
  },

  // Indicadores
  indicadores: {
    getAll: (params = {}) => apiClient.get('/indicadores', { params }),
    getById: (id) => apiClient.get(`/indicadores/${id}`),
    getSummary: () => apiClient.get('/indicadores/summary'),
    getCritical: () => apiClient.get('/indicadores/critical'),
    create: (data) => apiClient.post('/indicadores', data),
    update: (id, data) => apiClient.put(`/indicadores/${id}`, data),
    updateValue: (id, valor) => apiClient.patch(`/indicadores/${id}/value`, { valor }),
    delete: (id) => apiClient.delete(`/indicadores/${id}`),
  },

  // Colaboradores
  colaboradores: {
    getAll: (params = {}) => apiClient.get('/colaboradores', { params }),
    getById: (id) => apiClient.get(`/colaboradores/${id}`),
    getStats: () => apiClient.get('/colaboradores/stats'),
    getDepartments: () => apiClient.get('/colaboradores/departments'),
    search: (termino) => apiClient.get(`/colaboradores?search=${encodeURIComponent(termino)}`),
    create: (data) => apiClient.post('/colaboradores', data),
    update: (id, data) => apiClient.put(`/colaboradores/${id}`, data),
    updateScore: (id, puntaje) => apiClient.patch(`/colaboradores/${id}/score`, { puntaje }),
    delete: (id) => apiClient.delete(`/colaboradores/${id}`),
  },

  // Empleado del Mes
  empleadosMes: {
    getAll: (params = {}) => apiClient.get('/empleados-mes', { params }),
    getById: (id) => apiClient.get(`/empleados-mes/${id}`),
    getWinners: () => apiClient.get('/empleados-mes/winners'),
    getStats: (mes, año) => apiClient.get(`/empleados-mes/stats/${mes}/${año}`),
    create: (data) => apiClient.post('/empleados-mes', data),
    update: (id, data) => apiClient.put(`/empleados-mes/${id}`, data),
    vote: (colaboradorId, mes, año, criterios) => apiClient.post('/empleados-mes/vote', {
      colaborador_id: colaboradorId,
      mes,
      año,
      criterios
    }),
    selectWinner: (mes, año) => apiClient.post(`/empleados-mes/select-winner/${mes}/${año}`),
    delete: (id) => apiClient.delete(`/empleados-mes/${id}`),
  },

  // Beneficios y Convenios
  beneficios: {
    getAll: (params = {}) => apiClient.get('/beneficios', { params }),
    getById: (id) => apiClient.get(`/beneficios/${id}`),
    getCategories: () => apiClient.get('/beneficios/categories'),
    getProviders: () => apiClient.get('/beneficios/providers'),
    getStats: () => apiClient.get('/beneficios/stats'),
    getExpiring: (days = 30) => apiClient.get(`/beneficios/expiring?days=${days}`),
    search: (termino) => apiClient.get(`/beneficios?search=${encodeURIComponent(termino)}`),
    create: (data) => apiClient.post('/beneficios', data),
    update: (id, data) => apiClient.put(`/beneficios/${id}`, data),
    delete: (id) => apiClient.delete(`/beneficios/${id}`),
  },

  // Health check
  health: () => apiClient.get('/health'),
}

// Utilidades para manejo de errores
export const handleApiError = (error, defaultMessage = 'Ha ocurrido un error') => {
  if (error.status === 404) {
    return 'Recurso no encontrado'
  } else if (error.status === 400) {
    return error.details ? error.details.join(', ') : 'Datos inválidos'
  } else if (error.status === 500) {
    return 'Error interno del servidor'
  } else if (error.message === 'Network Error') {
    return 'Error de conexión. Verifica tu conexión a internet.'
  }
  
  return error.message || defaultMessage
}

// Hook personalizado para manejo de estados de carga
export const createMutationOptions = (onSuccess, onError) => ({
  onSuccess: (data) => {
    if (onSuccess) onSuccess(data)
  },
  onError: (error) => {
    const message = handleApiError(error)
    console.error('Mutation error:', message)
    if (onError) onError(message)
  }
})

export default api
