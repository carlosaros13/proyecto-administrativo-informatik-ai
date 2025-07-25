const express = require('express');
const router = express.Router();
const Proyecto = require('../models/Proyecto');

// GET /api/proyectos - Obtener todos los proyectos
router.get('/', async (req, res) => {
  try {
    const { stats } = req.query;
    
    let proyectos;
    if (stats === 'true') {
      proyectos = await Proyecto.getWithStats();
    } else {
      proyectos = await Proyecto.getAll();
    }
    
    res.json({
      success: true,
      data: proyectos,
      total: proyectos.length
    });
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/proyectos/:id - Obtener proyecto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.getById(id);
    
    if (!proyecto) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto no encontrado',
        message: `No se encontró un proyecto con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: proyecto
    });
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/proyectos - Crear nuevo proyecto
router.post('/', async (req, res) => {
  try {
    const errors = Proyecto.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const proyecto = await Proyecto.create(req.body);
    
    res.status(201).json({
      success: true,
      data: proyecto,
      message: 'Proyecto creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/proyectos/:id - Actualizar proyecto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const errors = Proyecto.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const proyecto = await Proyecto.update(id, req.body);
    
    if (!proyecto) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto no encontrado',
        message: `No se encontró un proyecto con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: proyecto,
      message: 'Proyecto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/proyectos/:id - Eliminar proyecto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Proyecto.delete(id);
    
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto no encontrado',
        message: `No se encontró un proyecto con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Proyecto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;
