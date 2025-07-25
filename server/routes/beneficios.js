const express = require('express');
const router = express.Router();
const Beneficio = require('../models/Beneficio');

// GET /api/beneficios - Obtener todos los beneficios
router.get('/', async (req, res) => {
  try {
    const { categoria, estado, search } = req.query;
    
    let beneficios;
    if (search) {
      beneficios = await Beneficio.search(search);
    } else if (categoria) {
      beneficios = await Beneficio.getByCategory(categoria);
    } else if (estado === 'activo') {
      beneficios = await Beneficio.getActive();
    } else {
      beneficios = await Beneficio.getAll();
    }
    
    res.json({
      success: true,
      data: beneficios,
      total: beneficios.length
    });
  } catch (error) {
    console.error('Error obteniendo beneficios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/beneficios/categories - Obtener categorías únicas
router.get('/categories', async (req, res) => {
  try {
    const categories = await Beneficio.getCategories();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/beneficios/providers - Obtener proveedores únicos
router.get('/providers', async (req, res) => {
  try {
    const providers = await Beneficio.getProviders();
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/beneficios/stats - Obtener estadísticas de beneficios
router.get('/stats', async (req, res) => {
  try {
    const stats = await Beneficio.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de beneficios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/beneficios/expiring - Obtener beneficios por vencer
router.get('/expiring', async (req, res) => {
  try {
    const { days } = req.query;
    const beneficios = await Beneficio.getExpiringSoon(days ? parseInt(days) : 30);
    
    res.json({
      success: true,
      data: beneficios,
      total: beneficios.length
    });
  } catch (error) {
    console.error('Error obteniendo beneficios por vencer:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/beneficios/:id - Obtener beneficio por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const beneficio = await Beneficio.getById(id);
    
    if (!beneficio) {
      return res.status(404).json({
        success: false,
        error: 'Beneficio no encontrado',
        message: `No se encontró un beneficio con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: beneficio
    });
  } catch (error) {
    console.error('Error obteniendo beneficio:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/beneficios - Crear nuevo beneficio
router.post('/', async (req, res) => {
  try {
    const errors = Beneficio.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const beneficio = await Beneficio.create(req.body);
    
    res.status(201).json({
      success: true,
      data: beneficio,
      message: 'Beneficio creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando beneficio:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/beneficios/:id - Actualizar beneficio
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const errors = Beneficio.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const beneficio = await Beneficio.update(id, req.body);
    
    if (!beneficio) {
      return res.status(404).json({
        success: false,
        error: 'Beneficio no encontrado',
        message: `No se encontró un beneficio con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: beneficio,
      message: 'Beneficio actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando beneficio:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/beneficios/:id - Eliminar beneficio
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Beneficio.delete(id);
    
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: 'Beneficio no encontrado',
        message: `No se encontró un beneficio con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Beneficio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando beneficio:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;
