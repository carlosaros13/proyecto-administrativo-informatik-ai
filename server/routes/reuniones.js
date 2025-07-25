const express = require('express');
const router = express.Router();
const Reunion = require('../models/Reunion');

// GET /api/reuniones - Obtener todas las reuniones
router.get('/', async (req, res) => {
  try {
    const { proyecto_id, fecha } = req.query;
    
    let reuniones;
    if (proyecto_id) {
      reuniones = await Reunion.getByProject(proyecto_id);
    } else if (fecha) {
      reuniones = await Reunion.getByDate(fecha);
    } else {
      reuniones = await Reunion.getAll();
    }
    
    res.json({
      success: true,
      data: reuniones,
      total: reuniones.length
    });
  } catch (error) {
    console.error('Error obteniendo reuniones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/reuniones/upcoming - Obtener próximas reuniones
router.get('/upcoming', async (req, res) => {
  try {
    const { limit } = req.query;
    const reuniones = await Reunion.getUpcoming(limit ? parseInt(limit) : 5);
    
    res.json({
      success: true,
      data: reuniones,
      total: reuniones.length
    });
  } catch (error) {
    console.error('Error obteniendo próximas reuniones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/reuniones/stats - Obtener estadísticas de reuniones
router.get('/stats', async (req, res) => {
  try {
    const stats = await Reunion.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de reuniones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/reuniones/:id - Obtener reunión por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reunion = await Reunion.getById(id);
    
    if (!reunion) {
      return res.status(404).json({
        success: false,
        error: 'Reunión no encontrada',
        message: `No se encontró una reunión con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: reunion
    });
  } catch (error) {
    console.error('Error obteniendo reunión:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/reuniones - Crear nueva reunión
router.post('/', async (req, res) => {
  try {
    const errors = Reunion.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const reunion = await Reunion.create(req.body);
    
    res.status(201).json({
      success: true,
      data: reunion,
      message: 'Reunión creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando reunión:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/reuniones/:id - Actualizar reunión
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const errors = Reunion.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const reunion = await Reunion.update(id, req.body);
    
    if (!reunion) {
      return res.status(404).json({
        success: false,
        error: 'Reunión no encontrada',
        message: `No se encontró una reunión con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: reunion,
      message: 'Reunión actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando reunión:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/reuniones/:id - Eliminar reunión
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Reunion.delete(id);
    
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: 'Reunión no encontrada',
        message: `No se encontró una reunión con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Reunión eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando reunión:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;
