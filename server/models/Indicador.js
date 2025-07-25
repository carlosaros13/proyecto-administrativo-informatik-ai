const { createConnection } = require('../database/init');

class Indicador {
  constructor(data) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.valor_actual = data.valor_actual;
    this.unidad = data.unidad;
    this.fecha_ultima_actualizacion = data.fecha_ultima_actualizacion;
    this.relacionado_a = data.relacionado_a;
    this.relacionado_id = data.relacionado_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Datos de la entidad relacionada (si existe)
    this.relacionado_nombre = data.relacionado_nombre;
  }

  // Obtener todos los indicadores
  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          i.*,
          CASE 
            WHEN i.relacionado_a = 'proyecto' THEN p.nombre
            WHEN i.relacionado_a = 'idea' THEN ia.titulo
            ELSE NULL
          END as relacionado_nombre
        FROM indicadores i
        LEFT JOIN proyectos p ON i.relacionado_a = 'proyecto' AND i.relacionado_id = p.id
        LEFT JOIN ideas_ia ia ON i.relacionado_a = 'idea' AND i.relacionado_id = ia.id
        ORDER BY i.fecha_ultima_actualizacion DESC
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Indicador(row)));
        }
        db.close();
      });
    });
  }

  // Obtener indicador por ID
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          i.*,
          CASE 
            WHEN i.relacionado_a = 'proyecto' THEN p.nombre
            WHEN i.relacionado_a = 'idea' THEN ia.titulo
            ELSE NULL
          END as relacionado_nombre
        FROM indicadores i
        LEFT JOIN proyectos p ON i.relacionado_a = 'proyecto' AND i.relacionado_id = p.id
        LEFT JOIN ideas_ia ia ON i.relacionado_a = 'idea' AND i.relacionado_id = ia.id
        WHERE i.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Indicador(row));
        } else {
          resolve(null);
        }
        db.close();
      });
    });
  }

  // Obtener indicadores por tipo de relación
  static async getByRelation(relacionadoA, relacionadoId = null) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      let query = `
        SELECT 
          i.*,
          CASE 
            WHEN i.relacionado_a = 'proyecto' THEN p.nombre
            WHEN i.relacionado_a = 'idea' THEN ia.titulo
            ELSE NULL
          END as relacionado_nombre
        FROM indicadores i
        LEFT JOIN proyectos p ON i.relacionado_a = 'proyecto' AND i.relacionado_id = p.id
        LEFT JOIN ideas_ia ia ON i.relacionado_a = 'idea' AND i.relacionado_id = ia.id
        WHERE i.relacionado_a = ?
      `;
      
      const params = [relacionadoA];
      
      if (relacionadoId) {
        query += ' AND i.relacionado_id = ?';
        params.push(relacionadoId);
      }
      
      query += ' ORDER BY i.fecha_ultima_actualizacion DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Indicador(row)));
        }
        db.close();
      });
    });
  }

  // Crear nuevo indicador
  static async create(data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        INSERT INTO indicadores (nombre, valor_actual, unidad, fecha_ultima_actualizacion, relacionado_a, relacionado_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        data.nombre,
        data.valor_actual,
        data.unidad,
        data.fecha_ultima_actualizacion || new Date().toISOString().split('T')[0],
        data.relacionado_a,
        data.relacionado_id || null
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          // Obtener el indicador recién creado
          Indicador.getById(this.lastID)
            .then(indicador => resolve(indicador))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Actualizar indicador
  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        UPDATE indicadores 
        SET nombre = ?, valor_actual = ?, unidad = ?, fecha_ultima_actualizacion = ?, 
            relacionado_a = ?, relacionado_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [
        data.nombre,
        data.valor_actual,
        data.unidad,
        data.fecha_ultima_actualizacion,
        data.relacionado_a,
        data.relacionado_id || null,
        id
      ], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          // Obtener el indicador actualizado
          Indicador.getById(id)
            .then(indicador => resolve(indicador))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Actualizar solo el valor de un indicador
  static async updateValue(id, nuevoValor) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        UPDATE indicadores 
        SET valor_actual = ?, fecha_ultima_actualizacion = date('now'), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [nuevoValor, id], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          Indicador.getById(id)
            .then(indicador => resolve(indicador))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Eliminar indicador
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.run(`DELETE FROM indicadores WHERE id = ?`, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
        db.close();
      });
    });
  }

  // Obtener resumen de indicadores
  static async getSummary() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          relacionado_a,
          COUNT(*) as total_indicadores,
          AVG(valor_actual) as valor_promedio
        FROM indicadores
        WHERE relacionado_a IS NOT NULL
        GROUP BY relacionado_a
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // También obtener el total general
          db.get('SELECT COUNT(*) as total FROM indicadores', (err2, totalRow) => {
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

  // Obtener indicadores críticos (valores extremos)
  static async getCritical() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          i.*,
          CASE 
            WHEN i.relacionado_a = 'proyecto' THEN p.nombre
            WHEN i.relacionado_a = 'idea' THEN ia.titulo
            ELSE NULL
          END as relacionado_nombre
        FROM indicadores i
        LEFT JOIN proyectos p ON i.relacionado_a = 'proyecto' AND i.relacionado_id = p.id
        LEFT JOIN ideas_ia ia ON i.relacionado_a = 'idea' AND i.relacionado_id = ia.id
        WHERE i.valor_actual IS NOT NULL
        ORDER BY i.valor_actual DESC
        LIMIT 10
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Indicador(row)));
        }
        db.close();
      });
    });
  }

  // Validar datos del indicador
  static validate(data) {
    const errors = [];
    
    if (!data.nombre || data.nombre.trim().length === 0) {
      errors.push('El nombre del indicador es requerido');
    }
    
    if (data.nombre && data.nombre.length > 200) {
      errors.push('El nombre no puede exceder 200 caracteres');
    }
    
    if (data.valor_actual !== null && data.valor_actual !== undefined) {
      if (isNaN(parseFloat(data.valor_actual))) {
        errors.push('El valor actual debe ser un número válido');
      }
    }
    
    if (data.relacionado_a && !['proyecto', 'idea'].includes(data.relacionado_a)) {
      errors.push('El campo relacionado_a debe ser "proyecto" o "idea"');
    }
    
    if (data.relacionado_a && data.relacionado_id && isNaN(parseInt(data.relacionado_id))) {
      errors.push('El ID relacionado debe ser un número válido');
    }
    
    if (data.fecha_ultima_actualizacion) {
      const fecha = new Date(data.fecha_ultima_actualizacion);
      if (isNaN(fecha.getTime())) {
        errors.push('Formato de fecha inválido');
      }
    }
    
    if (data.unidad && data.unidad.length > 50) {
      errors.push('La unidad no puede exceder 50 caracteres');
    }
    
    return errors;
  }
}

module.exports = Indicador;
