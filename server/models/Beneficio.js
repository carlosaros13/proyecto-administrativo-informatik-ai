const { createConnection } = require('../database/init');

class Beneficio {
  constructor(data) {
    this.id = data.id;
    this.titulo = data.titulo;
    this.descripcion = data.descripcion;
    this.categoria = data.categoria;
    this.proveedor = data.proveedor;
    this.descuento = data.descuento;
    this.vigencia_inicio = data.vigencia_inicio;
    this.vigencia_fin = data.vigencia_fin;
    this.requisitos = data.requisitos;
    this.estado = data.estado || 'activo';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Obtener todos los beneficios
  static async getAll() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT * FROM beneficios 
        ORDER BY categoria ASC, titulo ASC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Beneficio(row)));
        }
        db.close();
      });
    });
  }

  // Obtener beneficio por ID
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.get(`
        SELECT * FROM beneficios WHERE id = ?
      `, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Beneficio(row));
        } else {
          resolve(null);
        }
        db.close();
      });
    });
  }

  // Obtener beneficios por categoría
  static async getByCategory(categoria) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT * FROM beneficios 
        WHERE categoria = ?
        ORDER BY titulo ASC
      `, [categoria], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Beneficio(row)));
        }
        db.close();
      });
    });
  }

  // Obtener beneficios activos
  static async getActive() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT * FROM beneficios 
        WHERE estado = 'activo' 
        AND (vigencia_fin IS NULL OR vigencia_fin >= date('now'))
        ORDER BY categoria ASC, titulo ASC
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Beneficio(row)));
        }
        db.close();
      });
    });
  }

  // Buscar beneficios
  static async search(termino) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT * FROM beneficios 
        WHERE titulo LIKE ? OR descripcion LIKE ? OR proveedor LIKE ? OR categoria LIKE ?
        ORDER BY titulo ASC
      `, [`%${termino}%`, `%${termino}%`, `%${termino}%`, `%${termino}%`], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Beneficio(row)));
        }
        db.close();
      });
    });
  }

  // Crear nuevo beneficio
  static async create(data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        INSERT INTO beneficios (titulo, descripcion, categoria, proveedor, descuento, vigencia_inicio, vigencia_fin, requisitos, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        data.titulo,
        data.descripcion,
        data.categoria,
        data.proveedor,
        data.descuento,
        data.vigencia_inicio,
        data.vigencia_fin,
        data.requisitos,
        data.estado || 'activo'
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          // Obtener el beneficio recién creado
          Beneficio.getById(this.lastID)
            .then(beneficio => resolve(beneficio))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Actualizar beneficio
  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        UPDATE beneficios 
        SET titulo = ?, descripcion = ?, categoria = ?, proveedor = ?, descuento = ?, 
            vigencia_inicio = ?, vigencia_fin = ?, requisitos = ?, estado = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [
        data.titulo,
        data.descripcion,
        data.categoria,
        data.proveedor,
        data.descuento,
        data.vigencia_inicio,
        data.vigencia_fin,
        data.requisitos,
        data.estado,
        id
      ], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          // Obtener el beneficio actualizado
          Beneficio.getById(id)
            .then(beneficio => resolve(beneficio))
            .catch(err => reject(err));
        }
        db.close();
      });
    });
  }

  // Eliminar beneficio
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.run(`DELETE FROM beneficios WHERE id = ?`, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
        db.close();
      });
    });
  }

  // Obtener categorías únicas
  static async getCategories() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT DISTINCT categoria 
        FROM beneficios 
        WHERE categoria IS NOT NULL AND categoria != ''
        ORDER BY categoria ASC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.categoria));
        }
        db.close();
      });
    });
  }

  // Obtener proveedores únicos
  static async getProviders() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      db.all(`
        SELECT DISTINCT proveedor 
        FROM beneficios 
        WHERE proveedor IS NOT NULL AND proveedor != ''
        ORDER BY proveedor ASC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.proveedor));
        }
        db.close();
      });
    });
  }

  // Obtener estadísticas de beneficios
  static async getStats() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
          COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) as inactivos,
          COUNT(DISTINCT categoria) as categorias,
          COUNT(DISTINCT proveedor) as proveedores
        FROM beneficios
      `;
      
      db.get(query, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            total: row.total,
            activos: row.activos,
            inactivos: row.inactivos,
            categorias: row.categorias,
            proveedores: row.proveedores
          });
        }
        db.close();
      });
    });
  }

  // Obtener beneficios por vencer
  static async getExpiringSoon(days = 30) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const query = `
        SELECT * FROM beneficios 
        WHERE estado = 'activo' 
        AND vigencia_fin IS NOT NULL 
        AND vigencia_fin BETWEEN date('now') AND date('now', '+${days} days')
        ORDER BY vigencia_fin ASC
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Beneficio(row)));
        }
        db.close();
      });
    });
  }

  // Verificar si un beneficio está vigente
  isActive() {
    if (this.estado !== 'activo') return false;
    
    const now = new Date();
    const inicio = this.vigencia_inicio ? new Date(this.vigencia_inicio) : null;
    const fin = this.vigencia_fin ? new Date(this.vigencia_fin) : null;
    
    if (inicio && now < inicio) return false;
    if (fin && now > fin) return false;
    
    return true;
  }

  // Validar datos del beneficio
  static validate(data) {
    const errors = [];
    
    if (!data.titulo || data.titulo.trim().length === 0) {
      errors.push('El título del beneficio es requerido');
    }
    
    if (data.titulo && data.titulo.length > 200) {
      errors.push('El título no puede exceder 200 caracteres');
    }
    
    if (!data.categoria || data.categoria.trim().length === 0) {
      errors.push('La categoría es requerida');
    }
    
    const categoriasValidas = ['Salud', 'Educación', 'Recreación', 'Tecnología', 'Descuentos', 'Bienestar'];
    if (data.categoria && !categoriasValidas.includes(data.categoria)) {
      errors.push(`La categoría debe ser una de: ${categoriasValidas.join(', ')}`);
    }
    
    if (data.descuento && (isNaN(data.descuento) || data.descuento < 0 || data.descuento > 100)) {
      errors.push('El descuento debe ser un número entre 0 y 100');
    }
    
    if (data.vigencia_inicio) {
      const fecha = new Date(data.vigencia_inicio);
      if (isNaN(fecha.getTime())) {
        errors.push('Formato de fecha de inicio de vigencia inválido');
      }
    }
    
    if (data.vigencia_fin) {
      const fecha = new Date(data.vigencia_fin);
      if (isNaN(fecha.getTime())) {
        errors.push('Formato de fecha de fin de vigencia inválido');
      }
    }
    
    if (data.vigencia_inicio && data.vigencia_fin) {
      const inicio = new Date(data.vigencia_inicio);
      const fin = new Date(data.vigencia_fin);
      
      if (fin < inicio) {
        errors.push('La fecha de fin de vigencia no puede ser anterior a la fecha de inicio');
      }
    }
    
    if (data.estado && !['activo', 'inactivo'].includes(data.estado)) {
      errors.push('Estado inválido. Debe ser: activo o inactivo');
    }
    
    return errors;
  }
}

module.exports = Beneficio;
