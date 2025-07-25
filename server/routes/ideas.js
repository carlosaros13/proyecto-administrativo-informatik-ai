const express = require('express');
const router = express.Router();
const IdeaIA = require('../models/IdeaIA');

// GET /api/ideas - Obtener todas las ideas
router.get('/', async (req, res) => {
  try {
    const { proyecto_id } = req.query;
    
    let ideas;
    if (proyecto_id) {
      ideas = await IdeaIA.getByProject(proyecto_id);
    } else {
      ideas = await IdeaIA.getAll();
    }
    
    res.json({
      success: true,
      data: ideas,
      total: ideas.length
    });
  } catch (error) {
    console.error('Error obteniendo ideas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/ideas/stats - Obtener estadísticas de ideas
router.get('/stats', async (req, res) => {
  try {
    const stats = await IdeaIA.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de ideas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/ideas/:id - Obtener idea por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idea = await IdeaIA.getById(id);
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Idea no encontrada',
        message: `No se encontró una idea con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: idea
    });
  } catch (error) {
    console.error('Error obteniendo idea:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/ideas - Crear nueva idea
router.post('/', async (req, res) => {
  try {
    const errors = IdeaIA.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const idea = await IdeaIA.create(req.body);
    
    res.status(201).json({
      success: true,
      data: idea,
      message: 'Idea creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando idea:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/ideas/:id - Actualizar idea
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const errors = IdeaIA.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const idea = await IdeaIA.update(id, req.body);
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Idea no encontrada',
        message: `No se encontró una idea con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: idea,
      message: 'Idea actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando idea:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PATCH /api/ideas/:id/status - Cambiar estado de idea
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado || !['pendiente', 'en_evaluacion', 'aceptada', 'rechazada'].includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido',
        message: 'El estado debe ser: pendiente, en_evaluacion, aceptada o rechazada'
      });
    }
    
    const idea = await IdeaIA.changeStatus(id, estado);
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Idea no encontrada',
        message: `No se encontró una idea con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: idea,
      message: `Estado de la idea cambiado a ${estado}`
    });
  } catch (error) {
    console.error('Error cambiando estado de idea:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/ideas/:id - Eliminar idea
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await IdeaIA.delete(id);
    
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: 'Idea no encontrada',
        message: `No se encontró una idea con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Idea eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando idea:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;
