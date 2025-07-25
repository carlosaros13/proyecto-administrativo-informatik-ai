const { createConnection } = require('../database/init');

class Documento {
  constructor(data) {
    this.id = data.id;
    this.titulo = data.titulo;
    this.tipo = data.tipo;
    this.link = data.link;
    this.fecha = data.fecha;
    this.subido_por = data.subido_por;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Obtener todos los documentos
  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT * FROM documentos 
        ORDER BY created_at DESC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Documento(row)));
        }
        db.close();
      });
    });
  }

  // Obtener documento por ID
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.get(`
        SELECT * FROM documentos WHERE id = ?
      `, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Documento(row));
        } else {
          resolve(null);
        }
        db.close();
      });
    });
  }

  // Obtener documentos por tipo
  static async getByType(tipo) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT * FROM documentos 
        WHERE tipo = ?
        ORDER BY created_at DESC
      `, [tipo], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Documento(row)));
        }
        db.close();
      });
    });
  }

  // Buscar documentos por título
  static async search(termino) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT * FROM documentos 
        WHERE titulo LIKE ? OR tipo LIKE ?
        ORDER BY created_at DESC
      `, [`%${termino}%`, `%${termino}%`], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Documento(row)));
        }
        db.close();
      });
    });
  }

  // Crear nuevo documento
  static async create(data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        INSERT INTO documentos (titulo, tipo, link, fecha, subido_por)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        data.titulo,
        data.tipo,
        data.link,
        data.fecha || new Date().toISOString().split('T')[0],
        data.subido_por
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          // Obtener el documento recién creado
          Documento.getById(this.lastID)
            .then(documento => resolve(documento))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Actualizar documento
  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        UPDATE documentos 
        SET titulo = ?, tipo = ?, link = ?, fecha = ?, 
            subido_por = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [
        data.titulo,
        data.tipo,
        data.link,
        data.fecha,
        data.subido_por,
        id
      ], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          // Obtener el documento actualizado
          Documento.getById(id)
            .then(documento => resolve(documento))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Eliminar documento
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.run(`DELETE FROM documentos WHERE id = ?`, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
        db.close();
      });
    });
  }

  // Obtener tipos de documentos únicos
  static async getTypes() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT DISTINCT tipo 
        FROM documentos 
        WHERE tipo IS NOT NULL AND tipo != ''
        ORDER BY tipo ASC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.tipo));
        }
        db.close();
      });
    });
  }

  // Obtener estadísticas de documentos
  static async getStats() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          tipo,
          COUNT(*) as total
        FROM documentos
        WHERE tipo IS NOT NULL AND tipo != ''
        GROUP BY tipo
        ORDER BY total DESC
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // También obtener el total general
          db.get('SELECT COUNT(*) as total FROM documentos', (err2, totalRow) => {
            if (err2) {
              reject(err2);
            } else {
              resolve({
                por_tipo: rows,
                total: totalRow.total
              });
            }
            db.close();
          });
        }
      });
    });
  }

  // Obtener documentos recientes
  static async getRecent(limit = 5) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT * FROM documentos 
        ORDER BY created_at DESC
        LIMIT ?
      `, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Documento(row)));
        }
        db.close();
      });
    });
  }

  // Validar datos del documento
  static validate(data) {
    const errors = [];
    
    if (!data.titulo || data.titulo.trim().length === 0) {
      errors.push('El título del documento es requerido');
    }
    
    if (data.titulo && data.titulo.length > 300) {
      errors.push('El título no puede exceder 300 caracteres');
    }
    
    if (data.link && data.link.length > 500) {
      errors.push('El enlace no puede exceder 500 caracteres');
    }
    
    if (data.link && !isValidUrl(data.link)) {
      errors.push('El enlace debe ser una URL válida');
    }
    
    if (data.fecha) {
      const fecha = new Date(data.fecha);
      if (isNaN(fecha.getTime())) {
        errors.push('Formato de fecha inválido');
      }
    }
    
    if (data.tipo && data.tipo.length > 100) {
      errors.push('El tipo no puede exceder 100 caracteres');
    }
    
    return errors;
  }
}

// Función auxiliar para validar URLs
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    // También permitir URLs relativas o rutas de archivos
    return string.startsWith('/') || string.startsWith('./') || string.startsWith('../');
  }
}

module.exports = Documento;
