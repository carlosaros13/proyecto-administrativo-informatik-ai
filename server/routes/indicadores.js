const express = require('express');
const router = express.Router();
const Indicador = require('../models/Indicador');

// GET /api/indicadores - Obtener todos los indicadores
router.get('/', async (req, res) => {
  try {
    const { relacionado_a, relacionado_id } = req.query;
    
    let indicadores;
    if (relacionado_a) {
      indicadores = await Indicador.getByRelation(relacionado_a, relacionado_id);
    } else {
      indicadores = await Indicador.getAll();
    }
    
    res.json({
      success: true,
      data: indicadores,
      total: indicadores.length
    });
  } catch (error) {
    console.error('Error obteniendo indicadores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/indicadores/summary - Obtener resumen de indicadores
router.get('/summary', async (req, res) => {
  try {
    const summary = await Indicador.getSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error obteniendo resumen de indicadores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/indicadores/critical - Obtener indicadores críticos
router.get('/critical', async (req, res) => {
  try {
    const indicadores = await Indicador.getCritical();
    
    res.json({
      success: true,
      data: indicadores,
      total: indicadores.length
    });
  } catch (error) {
    console.error('Error obteniendo indicadores críticos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/indicadores/:id - Obtener indicador por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const indicador = await Indicador.getById(id);
    
    if (!indicador) {
      return res.status(404).json({
        success: false,
        error: 'Indicador no encontrado',
        message: `No se encontró un indicador con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: indicador
    });
  } catch (error) {
    console.error('Error obteniendo indicador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/indicadores - Crear nuevo indicador
router.post('/', async (req, res) => {
  try {
    const errors = Indicador.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const indicador = await Indicador.create(req.body);
    
    res.status(201).json({
      success: true,
      data: indicador,
      message: 'Indicador creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando indicador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/indicadores/:id - Actualizar indicador
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const errors = Indicador.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const indicador = await Indicador.update(id, req.body);
    
    if (!indicador) {
      return res.status(404).json({
        success: false,
        error: 'Indicador no encontrado',
        message: `No se encontró un indicador con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: indicador,
      message: 'Indicador actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando indicador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PATCH /api/indicadores/:id/value - Actualizar solo el valor de un indicador
router.patch('/:id/value', async (req, res) => {
  try {
    const { id } = req.params;
    const { valor } = req.body;
    
    if (valor === null || valor === undefined || isNaN(parseFloat(valor))) {
      return res.status(400).json({
        success: false,
        error: 'Valor inválido',
        message: 'El valor debe ser un número válido'
      });
    }
    
    const indicador = await Indicador.updateValue(id, parseFloat(valor));
    
    if (!indicador) {
      return res.status(404).json({
        success: false,
        error: 'Indicador no encontrado',
        message: `No se encontró un indicador con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: indicador,
      message: 'Valor del indicador actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando valor del indicador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/indicadores/:id - Eliminar indicador
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Indicador.delete(id);
    
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: 'Indicador no encontrado',
        message: `No se encontró un indicador con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Indicador eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando indicador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;
