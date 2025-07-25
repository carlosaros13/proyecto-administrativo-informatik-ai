const express = require('express');
const router = express.Router();
const Documento = require('../models/Documento');

// GET /api/documentos - Obtener todos los documentos
router.get('/', async (req, res) => {
  try {
    const { tipo, search } = req.query;
    
    let documentos;
    if (search) {
      documentos = await Documento.search(search);
    } else if (tipo) {
      documentos = await Documento.getByType(tipo);
    } else {
      documentos = await Documento.getAll();
    }
    
    res.json({
      success: true,
      data: documentos,
      total: documentos.length
    });
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/documentos/types - Obtener tipos de documentos únicos
router.get('/types', async (req, res) => {
  try {
    const tipos = await Documento.getTypes();
    
    res.json({
      success: true,
      data: tipos
    });
  } catch (error) {
    console.error('Error obteniendo tipos de documentos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/documentos/stats - Obtener estadísticas de documentos
router.get('/stats', async (req, res) => {
  try {
    const stats = await Documento.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de documentos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/documentos/recent - Obtener documentos recientes
router.get('/recent', async (req, res) => {
  try {
    const { limit } = req.query;
    const documentos = await Documento.getRecent(limit ? parseInt(limit) : 5);
    
    res.json({
      success: true,
      data: documentos,
      total: documentos.length
    });
  } catch (error) {
    console.error('Error obteniendo documentos recientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// GET /api/documentos/:id - Obtener documento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const documento = await Documento.getById(id);
    
    if (!documento) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado',
        message: `No se encontró un documento con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: documento
    });
  } catch (error) {
    console.error('Error obteniendo documento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// POST /api/documentos - Crear nuevo documento
router.post('/', async (req, res) => {
  try {
    const errors = Documento.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const documento = await Documento.create(req.body);
    
    res.status(201).json({
      success: true,
      data: documento,
      message: 'Documento creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando documento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// PUT /api/documentos/:id - Actualizar documento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const errors = Documento.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos',
        details: errors
      });
    }
    
    const documento = await Documento.update(id, req.body);
    
    if (!documento) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado',
        message: `No se encontró un documento con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: documento,
      message: 'Documento actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando documento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// DELETE /api/documentos/:id - Eliminar documento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Documento.delete(id);
    
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado',
        message: `No se encontró un documento con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;
