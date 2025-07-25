const { createConnection } = require('../database/init');

class Colaborador {
  constructor(data) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.email = data.email;
    this.telefono = data.telefono;
    this.cargo = data.cargo;
    this.departamento = data.departamento;
    this.fecha_ingreso = data.fecha_ingreso;
    this.estado = data.estado || 'activo';
    this.puntaje = data.puntaje || 0;
    this.avatar_url = data.avatar_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Obtener todos los colaboradores
  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT * FROM colaboradores 
        ORDER BY nombre ASC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Colaborador(row)));
        }
        db.close();
      });
    });
  }

  // Obtener colaborador por ID
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.get(`
        SELECT * FROM colaboradores WHERE id = ?
      `, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Colaborador(row));
        } else {
          resolve(null);
        }
        db.close();
      });
    });
  }

  // Obtener colaboradores por departamento
  static async getByDepartment(departamento) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT * FROM colaboradores 
        WHERE departamento = ?
        ORDER BY nombre ASC
      `, [departamento], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Colaborador(row)));
        }
        db.close();
      });
    });
  }

  // Obtener colaboradores activos
  static async getActive() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT * FROM colaboradores 
        WHERE estado = 'activo'
        ORDER BY nombre ASC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Colaborador(row)));
        }
        db.close();
      });
    });
  }

  // Buscar colaboradores
  static async search(termino) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT * FROM colaboradores 
        WHERE nombre LIKE ? OR email LIKE ? OR cargo LIKE ? OR departamento LIKE ?
        ORDER BY nombre ASC
      `, [`%${termino}%`, `%${termino}%`, `%${termino}%`, `%${termino}%`], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Colaborador(row)));
        }
        db.close();
      });
    });
  }

  // Crear nuevo colaborador
  static async create(data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        INSERT INTO colaboradores (nombre, descripcion, email, telefono, cargo, departamento, fecha_ingreso, estado, puntaje, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        data.nombre,
        data.descripcion,
        data.email,
        data.telefono,
        data.cargo,
        data.departamento,
        data.fecha_ingreso || new Date().toISOString().split('T')[0],
        data.estado || 'activo',
        data.puntaje || 0,
        data.avatar_url
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          // Obtener el colaborador recién creado
          Colaborador.getById(this.lastID)
            .then(colaborador => resolve(colaborador))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Actualizar colaborador
  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        UPDATE colaboradores 
        SET nombre = ?, descripcion = ?, email = ?, telefono = ?, cargo = ?, 
            departamento = ?, fecha_ingreso = ?, estado = ?, puntaje = ?, 
            avatar_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [
        data.nombre,
        data.descripcion,
        data.email,
        data.telefono,
        data.cargo,
        data.departamento,
        data.fecha_ingreso,
        data.estado,
        data.puntaje,
        data.avatar_url,
        id
      ], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          // Obtener el colaborador actualizado
          Colaborador.getById(id)
            .then(colaborador => resolve(colaborador))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Actualizar puntaje
  static async updateScore(id, nuevoPuntaje) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        UPDATE colaboradores 
        SET puntaje = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [nuevoPuntaje, id], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          Colaborador.getById(id)
            .then(colaborador => resolve(colaborador))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Eliminar colaborador
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.run(`DELETE FROM colaboradores WHERE id = ?`, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
        db.close();
      });
    });
  }

  // Obtener estadísticas de colaboradores
  static async getStats() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
          COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) as inactivos,
          COUNT(DISTINCT departamento) as departamentos,
          AVG(puntaje) as puntaje_promedio
        FROM colaboradores
      `;
      
      db.get(query, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            total: row.total,
            activos: row.activos,
            inactivos: row.inactivos,
            departamentos: row.departamentos,
            puntaje_promedio: Math.round(row.puntaje_promedio || 0)
          });
        }
        db.close();
      });
    });
  }

  // Obtener departamentos únicos
  static async getDepartments() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT DISTINCT departamento 
        FROM colaboradores 
        WHERE departamento IS NOT NULL AND departamento != ''
        ORDER BY departamento ASC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.departamento));
        }
        db.close();
      });
    });
  }

  // Validar datos del colaborador
  static validate(data) {
    const errors = [];
    
    if (!data.nombre || data.nombre.trim().length === 0) {
      errors.push('El nombre del colaborador es requerido');
    }
    
    if (data.nombre && data.nombre.length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }
    
    if (!data.email || data.email.trim().length === 0) {
      errors.push('El email es requerido');
    }
    
    if (data.email && !isValidEmail(data.email)) {
      errors.push('El formato del email no es válido');
    }
    
    if (data.estado && !['activo', 'inactivo', 'vacaciones'].includes(data.estado)) {
      errors.push('Estado inválido. Debe ser: activo, inactivo o vacaciones');
    }
    
    if (data.puntaje && (isNaN(data.puntaje) || data.puntaje < 0 || data.puntaje > 100)) {
      errors.push('El puntaje debe ser un número entre 0 y 100');
    }
    
    if (data.fecha_ingreso) {
      const fecha = new Date(data.fecha_ingreso);
      if (isNaN(fecha.getTime())) {
        errors.push('Formato de fecha de ingreso inválido');
      }
    }
    
    return errors;
  }
}

// Función auxiliar para validar emails
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = Colaborador;
