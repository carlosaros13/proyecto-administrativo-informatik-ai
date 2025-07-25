const { createConnection } = require('../database/init');

class Proyecto {
  constructor(data) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.estado = data.estado || 'activo';
    this.responsable = data.responsable;
    this.fecha_inicio = data.fecha_inicio;
    this.fecha_fin = data.fecha_fin;
    this.tags = data.tags;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Obtener todos los proyectos
  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = createConnection();

      db.all(`
        SELECT
          p.*,
          c.nombre as responsable_nombre,
          c.cargo as responsable_cargo
        FROM proyectos p
        LEFT JOIN colaboradores c ON p.responsable_id = c.id
        ORDER BY p.created_at DESC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Proyecto(row)));
        }
        db.close();
      });
    });
  }

  // Obtener proyecto por ID
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.get(`
        SELECT * FROM proyectos WHERE id = ?
      `, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Proyecto(row));
        } else {
          resolve(null);
        }
        db.close();
      });
    });
  }

  // Crear nuevo proyecto
  static async create(data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        INSERT INTO proyectos (nombre, descripcion, estado, responsable, fecha_inicio, fecha_fin, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        data.nombre,
        data.descripcion,
        data.estado || 'activo',
        data.responsable,
        data.fecha_inicio,
        data.fecha_fin,
        data.tags
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          // Obtener el proyecto recién creado
          Proyecto.getById(this.lastID)
            .then(proyecto => resolve(proyecto))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Actualizar proyecto
  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        UPDATE proyectos 
        SET nombre = ?, descripcion = ?, estado = ?, responsable = ?, 
            fecha_inicio = ?, fecha_fin = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [
        data.nombre,
        data.descripcion,
        data.estado,
        data.responsable,
        data.fecha_inicio,
        data.fecha_fin,
        data.tags,
        id
      ], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null); // No se encontró el proyecto
        } else {
          // Obtener el proyecto actualizado
          Proyecto.getById(id)
            .then(proyecto => resolve(proyecto))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Eliminar proyecto
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.run(`DELETE FROM proyectos WHERE id = ?`, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
        db.close();
      });
    });
  }

  // Obtener proyectos con estadísticas
  static async getWithStats() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          p.*,
          COUNT(DISTINCT i.id) as total_ideas,
          COUNT(DISTINCT r.id) as total_reuniones
        FROM proyectos p
        LEFT JOIN ideas_ia i ON p.id = i.proyecto_id
        LEFT JOIN reuniones r ON p.id = r.proyecto_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            ...new Proyecto(row),
            stats: {
              total_ideas: row.total_ideas,
              total_reuniones: row.total_reuniones
            }
          })));
        }
        db.close();
      });
    });
  }

  // Validar datos del proyecto
  static validate(data) {
    const errors = [];
    
    if (!data.nombre || data.nombre.trim().length === 0) {
      errors.push('El nombre del proyecto es requerido');
    }
    
    if (data.nombre && data.nombre.length > 200) {
      errors.push('El nombre del proyecto no puede exceder 200 caracteres');
    }
    
    if (data.estado && !['activo', 'pausado', 'completado', 'cancelado'].includes(data.estado)) {
      errors.push('Estado inválido. Debe ser: activo, pausado, completado o cancelado');
    }
    
    if (data.fecha_inicio && data.fecha_fin) {
      const inicio = new Date(data.fecha_inicio);
      const fin = new Date(data.fecha_fin);
      
      if (fin < inicio) {
        errors.push('La fecha de fin no puede ser anterior a la fecha de inicio');
      }
    }
    
    return errors;
  }
}

module.exports = Proyecto;
