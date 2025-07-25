const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

// Importar rutas
const proyectosRoutes = require('./routes/proyectos');
const ideasRoutes = require('./routes/ideas');
const reunionesRoutes = require('./routes/reuniones');
const documentosRoutes = require('./routes/documentos');
const indicadoresRoutes = require('./routes/indicadores');
const colaboradoresRoutes = require('./routes/colaboradores');
const empleadosMesRoutes = require('./routes/empleados-mes');
const beneficiosRoutes = require('./routes/beneficios');

// Inicializar base de datos
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de seguridad y logging
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-dominio.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Middlewares de parsing
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Rutas API
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/reuniones', reunionesRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/indicadores', indicadoresRoutes);
app.use('/api/colaboradores', colaboradoresRoutes);
app.use('/api/empleados-mes', empleadosMesRoutes);
app.use('/api/beneficios', beneficiosRoutes);

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Informatik-AI Hub Interno API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en esta API`
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    await initDatabase();
    console.log('✅ Base de datos inicializada correctamente');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error);
    process.exit(1);
  }
}

startServer();
