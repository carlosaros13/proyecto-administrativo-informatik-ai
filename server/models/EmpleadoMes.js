const { createConnection } = require('../database/init');

class EmpleadoMes {
  constructor(data) {
    this.id = data.id;
    this.colaborador_id = data.colaborador_id;
    this.mes = data.mes;
    this.año = data.año;
    this.votos_recibidos = data.votos_recibidos || 0;
    this.criterios_desempeño = data.criterios_desempeño || 0;
    this.criterios_colaboracion = data.criterios_colaboracion || 0;
    this.comentarios = data.comentarios;
    this.estado = data.estado || 'nominado';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Datos del colaborador relacionado
    this.colaborador_nombre = data.colaborador_nombre;
    this.colaborador_cargo = data.colaborador_cargo;
    this.colaborador_departamento = data.colaborador_departamento;
  }

  // Obtener todos los empleados del mes
  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          em.*,
          c.nombre as colaborador_nombre,
          c.cargo as colaborador_cargo,
          c.departamento as colaborador_departamento
        FROM empleados_mes em
        LEFT JOIN colaboradores c ON em.colaborador_id = c.id
        ORDER BY em.año DESC, em.mes DESC
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new EmpleadoMes(row)));
        }
        db.close();
      });
    });
  }

  // Obtener empleado del mes por ID
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          em.*,
          c.nombre as colaborador_nombre,
          c.cargo as colaborador_cargo,
          c.departamento as colaborador_departamento
        FROM empleados_mes em
        LEFT JOIN colaboradores c ON em.colaborador_id = c.id
        WHERE em.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new EmpleadoMes(row));
        } else {
          resolve(null);
        }
        db.close();
      });
    });
  }

  // Obtener empleados del mes por período
  static async getByPeriod(mes, año) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          em.*,
          c.nombre as colaborador_nombre,
          c.cargo as colaborador_cargo,
          c.departamento as colaborador_departamento
        FROM empleados_mes em
        LEFT JOIN colaboradores c ON em.colaborador_id = c.id
        WHERE em.mes = ? AND em.año = ?
        ORDER BY em.votos_recibidos DESC
      `;
      
      db.all(query, [mes, año], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new EmpleadoMes(row)));
        }
        db.close();
      });
    });
  }

  // Obtener ganadores históricos
  static async getWinners() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          em.*,
          c.nombre as colaborador_nombre,
          c.cargo as colaborador_cargo,
          c.departamento as colaborador_departamento
        FROM empleados_mes em
        LEFT JOIN colaboradores c ON em.colaborador_id = c.id
        WHERE em.estado = 'ganador'
        ORDER BY em.año DESC, em.mes DESC
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new EmpleadoMes(row)));
        }
        db.close();
      });
    });
  }

  // Crear nueva nominación
  static async create(data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        INSERT INTO empleados_mes (colaborador_id, mes, año, votos_recibidos, criterios_desempeño, criterios_colaboracion, comentarios, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        data.colaborador_id,
        data.mes,
        data.año,
        data.votos_recibidos || 0,
        data.criterios_desempeño || 0,
        data.criterios_colaboracion || 0,
        data.comentarios,
        data.estado || 'nominado'
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          // Obtener la nominación recién creada
          EmpleadoMes.getById(this.lastID)
            .then(empleado => resolve(empleado))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Actualizar nominación
  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        UPDATE empleados_mes 
        SET colaborador_id = ?, mes = ?, año = ?, votos_recibidos = ?, 
            criterios_desempeño = ?, criterios_colaboracion = ?, comentarios = ?, 
            estado = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [
        data.colaborador_id,
        data.mes,
        data.año,
        data.votos_recibidos,
        data.criterios_desempeño,
        data.criterios_colaboracion,
        data.comentarios,
        data.estado,
        id
      ], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          // Obtener la nominación actualizada
          EmpleadoMes.getById(id)
            .then(empleado => resolve(empleado))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Votar por un colaborador (sistema anónimo)
  static async vote(colaboradorId, mes, año, criterios) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      // Verificar si ya existe una nominación para este colaborador en este período
      db.get(`
        SELECT id FROM empleados_mes 
        WHERE colaborador_id = ? AND mes = ? AND año = ?
      `, [colaboradorId, mes, año], (err, row) => {
        if (err) {
          reject(err);
          db.close();
          return;
        }
        
        if (row) {
          // Actualizar votos existentes
          const updateQuery = `
            UPDATE empleados_mes 
            SET votos_recibidos = votos_recibidos + 1,
                criterios_desempeño = criterios_desempeño + ?,
                criterios_colaboracion = criterios_colaboracion + ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `;
          
          db.run(updateQuery, [
            criterios.desempeño || 0,
            criterios.colaboracion || 0,
            row.id
          ], function(err) {
            if (err) {
              reject(err);
            } else {
              EmpleadoMes.getById(row.id)
                .then(empleado => resolve(empleado))
                .catch(err => reject(err));
            }
            db.close();
          });
        } else {
          // Crear nueva nominación
          const insertQuery = `
            INSERT INTO empleados_mes (colaborador_id, mes, año, votos_recibidos, criterios_desempeño, criterios_colaboracion, estado)
            VALUES (?, ?, ?, 1, ?, ?, 'nominado')
          `;
          
          db.run(insertQuery, [
            colaboradorId,
            mes,
            año,
            criterios.desempeño || 0,
            criterios.colaboracion || 0
          ], function(err) {
            if (err) {
              reject(err);
            } else {
              EmpleadoMes.getById(this.lastID)
                .then(empleado => resolve(empleado))
                .catch(err => reject(err));
            }
            db.close();
          });
        }
      });
    });
  }

  // Seleccionar ganador del mes
  static async selectWinner(mes, año) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      // Obtener el colaborador con más votos
      const query = `
        SELECT id, colaborador_id, MAX(votos_recibidos) as max_votos
        FROM empleados_mes 
        WHERE mes = ? AND año = ? AND estado = 'nominado'
        GROUP BY colaborador_id
        ORDER BY max_votos DESC
        LIMIT 1
      `;
      
      db.get(query, [mes, año], (err, row) => {
        if (err) {
          reject(err);
          db.close();
          return;
        }
        
        if (!row) {
          resolve(null);
          db.close();
          return;
        }
        
        // Marcar como ganador
        db.run(`
          UPDATE empleados_mes 
          SET estado = 'ganador', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [row.id], function(err) {
          if (err) {
            reject(err);
          } else {
            EmpleadoMes.getById(row.id)
              .then(empleado => resolve(empleado))
              .catch(err => reject(err));
          }
          db.close();
        });
      });
    });
  }

  // Eliminar nominación
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.run(`DELETE FROM empleados_mes WHERE id = ?`, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
        db.close();
      });
    });
  }

  // Obtener estadísticas de votaciones
  static async getVotingStats(mes, año) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          COUNT(*) as total_nominaciones,
          SUM(votos_recibidos) as total_votos,
          AVG(criterios_desempeño) as promedio_desempeño,
          AVG(criterios_colaboracion) as promedio_colaboracion
        FROM empleados_mes
        WHERE mes = ? AND año = ?
      `;
      
      db.get(query, [mes, año], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            total_nominaciones: row.total_nominaciones || 0,
            total_votos: row.total_votos || 0,
            promedio_desempeño: Math.round(row.promedio_desempeño || 0),
            promedio_colaboracion: Math.round(row.promedio_colaboracion || 0)
          });
        }
        db.close();
      });
    });
  }

  // Validar datos de empleado del mes
  static validate(data) {
    const errors = [];
    
    if (!data.colaborador_id) {
      errors.push('El ID del colaborador es requerido');
    }
    
    if (!data.mes || data.mes < 1 || data.mes > 12) {
      errors.push('El mes debe ser un número entre 1 y 12');
    }
    
    if (!data.año || data.año < 2020 || data.año > 2030) {
      errors.push('El año debe estar entre 2020 y 2030');
    }
    
    if (data.criterios_desempeño && (data.criterios_desempeño < 0 || data.criterios_desempeño > 10)) {
      errors.push('El criterio de desempeño debe estar entre 0 y 10');
    }
    
    if (data.criterios_colaboracion && (data.criterios_colaboracion < 0 || data.criterios_colaboracion > 10)) {
      errors.push('El criterio de colaboración debe estar entre 0 y 10');
    }
    
    if (data.estado && !['nominado', 'ganador', 'descalificado'].includes(data.estado)) {
      errors.push('Estado inválido. Debe ser: nominado, ganador o descalificado');
    }
    
    return errors;
  }
}

module.exports = EmpleadoMes;
