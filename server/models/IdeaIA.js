const { createConnection } = require('../database/init');

class IdeaIA {
  constructor(data) {
    this.id = data.id;
    this.titulo = data.titulo;
    this.descripcion = data.descripcion;
    this.propuesto_por = data.propuesto_por;
    this.fecha = data.fecha;
    this.estado = data.estado || 'pendiente';
    this.proyecto_id = data.proyecto_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Datos del proyecto relacionado (si existe)
    this.proyecto_nombre = data.proyecto_nombre;
  }

  // Obtener todas las ideas
  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = createConnection();

      const query = `
        SELECT
          i.*,
          p.nombre as proyecto_nombre,
          c.nombre as propuesto_por_nombre,
          c.cargo as propuesto_por_cargo
        FROM ideas_ia i
        LEFT JOIN proyectos p ON i.proyecto_id = p.id
        LEFT JOIN colaboradores c ON i.propuesto_por_id = c.id
        ORDER BY i.created_at DESC
      `;

      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new IdeaIA(row)));
        }
        db.close();
      });
    });
  }

  // Obtener idea por ID
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          i.*,
          p.nombre as proyecto_nombre
        FROM ideas_ia i
        LEFT JOIN proyectos p ON i.proyecto_id = p.id
        WHERE i.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new IdeaIA(row));
        } else {
          resolve(null);
        }
        db.close();
      });
    });
  }

  // Obtener ideas por proyecto
  static async getByProject(proyectoId) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          i.*,
          p.nombre as proyecto_nombre
        FROM ideas_ia i
        LEFT JOIN proyectos p ON i.proyecto_id = p.id
        WHERE i.proyecto_id = ?
        ORDER BY i.created_at DESC
      `;
      
      db.all(query, [proyectoId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new IdeaIA(row)));
        }
        db.close();
      });
    });
  }

  // Crear nueva idea
  static async create(data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        INSERT INTO ideas_ia (titulo, descripcion, propuesto_por, fecha, estado, proyecto_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        data.titulo,
        data.descripcion,
        data.propuesto_por,
        data.fecha || new Date().toISOString().split('T')[0],
        data.estado || 'pendiente',
        data.proyecto_id || null
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          // Obtener la idea recién creada
          IdeaIA.getById(this.lastID)
            .then(idea => resolve(idea))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Actualizar idea
  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        UPDATE ideas_ia 
        SET titulo = ?, descripcion = ?, propuesto_por = ?, fecha = ?, 
            estado = ?, proyecto_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [
        data.titulo,
        data.descripcion,
        data.propuesto_por,
        data.fecha,
        data.estado,
        data.proyecto_id || null,
        id
      ], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          // Obtener la idea actualizada
          IdeaIA.getById(id)
            .then(idea => resolve(idea))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Eliminar idea
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.run(`DELETE FROM ideas_ia WHERE id = ?`, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
        db.close();
      });
    });
  }

  // Obtener estadísticas de ideas
  static async getStats() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          estado,
          COUNT(*) as total
        FROM ideas_ia
        GROUP BY estado
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const stats = {
            pendiente: 0,
            en_evaluacion: 0,
            aceptada: 0,
            rechazada: 0,
            total: 0
          };
          
          rows.forEach(row => {
            stats[row.estado] = row.total;
            stats.total += row.total;
          });
          
          resolve(stats);
        }
        db.close();
      });
    });
  }

  // Cambiar estado de idea
  static async changeStatus(id, nuevoEstado) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        UPDATE ideas_ia 
        SET estado = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [nuevoEstado, id], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          IdeaIA.getById(id)
            .then(idea => resolve(idea))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Validar datos de la idea
  static validate(data) {
    const errors = [];
    
    if (!data.titulo || data.titulo.trim().length === 0) {
      errors.push('El título de la idea es requerido');
    }
    
    if (data.titulo && data.titulo.length > 200) {
      errors.push('El título no puede exceder 200 caracteres');
    }
    
    if (data.estado && !['pendiente', 'en_evaluacion', 'aceptada', 'rechazada'].includes(data.estado)) {
      errors.push('Estado inválido. Debe ser: pendiente, en_evaluacion, aceptada o rechazada');
    }
    
    if (data.fecha) {
      const fecha = new Date(data.fecha);
      if (isNaN(fecha.getTime())) {
        errors.push('Formato de fecha inválido');
      }
    }
    
    return errors;
  }
}

module.exports = IdeaIA;
