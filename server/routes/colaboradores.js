const express = require('express');
const router = express.Router();
const Colaborador = require('../models/Colaborador');

// GET /api/colaboradores - Obtener todos los colaboradores
router.get('/', async (req, res) => {
  try {
    const { departamento, estado, search } = req.query;
    
    let colaboradores;
    if (search) {
      colaboradores = await Colaborador.search(search);
    } else if (departamento) {
      colaboradores = await Colaborador.getByDepartment(departamento);
    } else if (estado === 'activo') {
      colaboradores = await Colaborador.getActive();
    } else {
      colaboradores = await Colaborador.getAll();
    }
    
    res.json({
      success: true,
      data: colaboradores,
      total: colaboradores.length
    });
  } catch (error) {
    console.error('Error obteniendo colaboradores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/colaboradores/stats - Obtener estadísticas de colaboradores
router.get('/stats', async (req, res) => {
  try {
    const stats = await Colaborador.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de colaboradores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/colaboradores/departments - Obtener departamentos únicos
router.get('/departments', async (req, res) => {
  try {
    const departments = await Colaborador.getDepartments();
    
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error obteniendo departamentos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/colaboradores/:id - Obtener colaborador por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const colaborador = await Colaborador.getById(id);
    
    if (!colaborador) {
      return res.status(404).json({
        success: false,
        error: 'Colaborador no encontrado',
        message: `No se encontró un colaborador con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: colaborador
    });
  } catch (error) {
    console.error('Error obteniendo colaborador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/colaboradores - Crear nuevo colaborador
router.post('/', async (req, res) => {
  try {
    const errors = Colaborador.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const colaborador = await Colaborador.create(req.body);
    
    res.status(201).json({
      success: true,
      data: colaborador,
      message: 'Colaborador creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando colaborador:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Email duplicado',
        message: 'Ya existe un colaborador con este email'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/colaboradores/:id - Actualizar colaborador
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const errors = Colaborador.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const colaborador = await Colaborador.update(id, req.body);
    
    if (!colaborador) {
      return res.status(404).json({
        success: false,
        error: 'Colaborador no encontrado',
        message: `No se encontró un colaborador con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: colaborador,
      message: 'Colaborador actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando colaborador:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Email duplicado',
        message: 'Ya existe un colaborador con este email'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PATCH /api/colaboradores/:id/score - Actualizar puntaje de colaborador
router.patch('/:id/score', async (req, res) => {
  try {
    const { id } = req.params;
    const { puntaje } = req.body;
    
    if (puntaje === null || puntaje === undefined || isNaN(puntaje) || puntaje < 0 || puntaje > 100) {
      return res.status(400).json({
        success: false,
        error: 'Puntaje inválido',
        message: 'El puntaje debe ser un número entre 0 y 100'
      });
    }
    
    const colaborador = await Colaborador.updateScore(id, puntaje);
    
    if (!colaborador) {
      return res.status(404).json({
        success: false,
        error: 'Colaborador no encontrado',
        message: `No se encontró un colaborador con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: colaborador,
      message: 'Puntaje actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando puntaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/colaboradores/:id - Eliminar colaborador
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Colaborador.delete(id);
    
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: 'Colaborador no encontrado',
        message: `No se encontró un colaborador con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Colaborador eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando colaborador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;
