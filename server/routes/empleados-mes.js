const express = require('express');
const router = express.Router();
const EmpleadoMes = require('../models/EmpleadoMes');

// GET /api/empleados-mes - Obtener todos los empleados del mes
router.get('/', async (req, res) => {
  try {
    const { mes, año } = req.query;
    
    let empleados;
    if (mes && año) {
      empleados = await EmpleadoMes.getByPeriod(parseInt(mes), parseInt(año));
    } else {
      empleados = await EmpleadoMes.getAll();
    }
    
    res.json({
      success: true,
      data: empleados,
      total: empleados.length
    });
  } catch (error) {
    console.error('Error obteniendo empleados del mes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/empleados-mes/winners - Obtener ganadores históricos
router.get('/winners', async (req, res) => {
  try {
    const winners = await EmpleadoMes.getWinners();
    
    res.json({
      success: true,
      data: winners,
      total: winners.length
    });
  } catch (error) {
    console.error('Error obteniendo ganadores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/empleados-mes/stats/:mes/:año - Obtener estadísticas de votación
router.get('/stats/:mes/:año', async (req, res) => {
  try {
    const { mes, año } = req.params;
    const stats = await EmpleadoMes.getVotingStats(parseInt(mes), parseInt(año));
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de votación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/empleados-mes/:id - Obtener empleado del mes por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await EmpleadoMes.getById(id);
    
    if (!empleado) {
      return res.status(404).json({
        success: false,
        error: 'Empleado del mes no encontrado',
        message: `No se encontró un empleado del mes con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: empleado
    });
  } catch (error) {
    console.error('Error obteniendo empleado del mes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/empleados-mes - Crear nueva nominación
router.post('/', async (req, res) => {
  try {
    const errors = EmpleadoMes.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const empleado = await EmpleadoMes.create(req.body);
    
    res.status(201).json({
      success: true,
      data: empleado,
      message: 'Nominación creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando nominación:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Nominación duplicada',
        message: 'Este colaborador ya está nominado para este período'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/empleados-mes/vote - Votar por un colaborador (anónimo)
router.post('/vote', async (req, res) => {
  try {
    const { colaborador_id, mes, año, criterios } = req.body;
    
    // Validaciones básicas
    if (!colaborador_id || !mes || !año) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Se requiere colaborador_id, mes y año'
      });
    }
    
    if (!criterios || typeof criterios !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Criterios inválidos',
        message: 'Se requieren criterios de evaluación'
      });
    }
    
    // Validar criterios
    const { desempeño, colaboracion } = criterios;
    if (desempeño < 1 || desempeño > 10 || colaboracion < 1 || colaboracion > 10) {
      return res.status(400).json({
        success: false,
        error: 'Criterios fuera de rango',
        message: 'Los criterios deben estar entre 1 y 10'
      });
    }
    
    const empleado = await EmpleadoMes.vote(colaborador_id, mes, año, criterios);
    
    res.json({
      success: true,
      data: empleado,
      message: 'Voto registrado exitosamente'
    });
  } catch (error) {
    console.error('Error registrando voto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/empleados-mes/:id - Actualizar nominación
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const errors = EmpleadoMes.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const empleado = await EmpleadoMes.update(id, req.body);
    
    if (!empleado) {
      return res.status(404).json({
        success: false,
        error: 'Empleado del mes no encontrado',
        message: `No se encontró un empleado del mes con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: empleado,
      message: 'Nominación actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando nominación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/empleados-mes/select-winner/:mes/:año - Seleccionar ganador del mes
router.post('/select-winner/:mes/:año', async (req, res) => {
  try {
    const { mes, año } = req.params;
    const winner = await EmpleadoMes.selectWinner(parseInt(mes), parseInt(año));
    
    if (!winner) {
      return res.status(404).json({
        success: false,
        error: 'No hay nominaciones',
        message: `No se encontraron nominaciones para ${mes}/${año}`
      });
    }
    
    res.json({
      success: true,
      data: winner,
      message: 'Ganador seleccionado exitosamente'
    });
  } catch (error) {
    console.error('Error seleccionando ganador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/empleados-mes/:id - Eliminar nominación
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await EmpleadoMes.delete(id);
    
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: 'Empleado del mes no encontrado',
        message: `No se encontró un empleado del mes con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Nominación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando nominación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;
