const { createConnection } = require('../database/init');

class Reunion {
  constructor(data) {
    this.id = data.id;
    this.fecha = data.fecha;
    this.hora = data.hora;
    this.tema = data.tema;
    this.responsables = data.responsables;
    this.notas = data.notas;
    this.estado = data.estado || 'programada';
    this.proyecto_id = data.proyecto_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Datos del proyecto relacionado (si existe)
    this.proyecto_nombre = data.proyecto_nombre;
  }

  // Obtener todas las reuniones
  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          r.*,
          p.nombre as proyecto_nombre
        FROM reuniones r
        LEFT JOIN proyectos p ON r.proyecto_id = p.id
        ORDER BY r.fecha DESC, r.hora DESC
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Reunion(row)));
        }
        db.close();
      });
    });
  }

  // Obtener reunión por ID
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          r.*,
          p.nombre as proyecto_nombre
        FROM reuniones r
        LEFT JOIN proyectos p ON r.proyecto_id = p.id
        WHERE r.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Reunion(row));
        } else {
          resolve(null);
        }
        db.close();
      });
    });
  }

  // Obtener reuniones por proyecto
  static async getByProject(proyectoId) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          r.*,
          p.nombre as proyecto_nombre
        FROM reuniones r
        LEFT JOIN proyectos p ON r.proyecto_id = p.id
        WHERE r.proyecto_id = ?
        ORDER BY r.fecha DESC, r.hora DESC
      `;
      
      db.all(query, [proyectoId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Reunion(row)));
        }
        db.close();
      });
    });
  }

  // Obtener reuniones por fecha
  static async getByDate(fecha) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          r.*,
          p.nombre as proyecto_nombre
        FROM reuniones r
        LEFT JOIN proyectos p ON r.proyecto_id = p.id
        WHERE r.fecha = ?
        ORDER BY r.hora ASC
      `;
      
      db.all(query, [fecha], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Reunion(row)));
        }
        db.close();
      });
    });
  }

  // Crear nueva reunión
  static async create(data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        INSERT INTO reuniones (fecha, hora, tema, responsables, notas, estado, proyecto_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        data.fecha,
        data.hora,
        data.tema,
        data.responsables,
        data.notas,
        data.estado || 'programada',
        data.proyecto_id || null
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          // Obtener la reunión recién creada
          Reunion.getById(this.lastID)
            .then(reunion => resolve(reunion))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Actualizar reunión
  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        UPDATE reuniones 
        SET fecha = ?, hora = ?, tema = ?, responsables = ?, notas = ?, 
            estado = ?, proyecto_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [
        data.fecha,
        data.hora,
        data.tema,
        data.responsables,
        data.notas,
        data.estado,
        data.proyecto_id || null,
        id
      ], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          // Obtener la reunión actualizada
          Reunion.getById(id)
            .then(reunion => resolve(reunion))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Eliminar reunión
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.run(`DELETE FROM reuniones WHERE id = ?`, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
        db.close();
      });
    });
  }

  // Obtener próximas reuniones
  static async getUpcoming(limit = 5) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          r.*,
          p.nombre as proyecto_nombre
        FROM reuniones r
        LEFT JOIN proyectos p ON r.proyecto_id = p.id
        WHERE r.fecha >= date('now') AND r.estado IN ('programada', 'en_curso')
        ORDER BY r.fecha ASC, r.hora ASC
        LIMIT ?
      `;
      
      db.all(query, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Reunion(row)));
        }
        db.close();
      });
    });
  }

  // Obtener estadísticas de reuniones
  static async getStats() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          estado,
          COUNT(*) as total
        FROM reuniones
        GROUP BY estado
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const stats = {
            programada: 0,
            en_curso: 0,
            completada: 0,
            cancelada: 0,
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

  // Validar datos de la reunión
  static validate(data) {
    const errors = [];
    
    if (!data.fecha) {
      errors.push('La fecha de la reunión es requerida');
    }
    
    if (!data.hora) {
      errors.push('La hora de la reunión es requerida');
    }
    
    if (!data.tema || data.tema.trim().length === 0) {
      errors.push('El tema de la reunión es requerido');
    }
    
    if (data.tema && data.tema.length > 300) {
      errors.push('El tema no puede exceder 300 caracteres');
    }
    
    if (data.estado && !['programada', 'en_curso', 'completada', 'cancelada'].includes(data.estado)) {
      errors.push('Estado inválido. Debe ser: programada, en_curso, completada o cancelada');
    }
    
    if (data.fecha) {
      const fecha = new Date(data.fecha);
      if (isNaN(fecha.getTime())) {
        errors.push('Formato de fecha inválido');
      }
    }
    
    if (data.hora) {
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(data.hora)) {
        errors.push('Formato de hora inválido (HH:MM)');
      }
    }
    
    return errors;
  }
}

module.exports = Reunion;
