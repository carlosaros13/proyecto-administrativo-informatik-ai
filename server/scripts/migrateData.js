const { createConnection } = require('../database/init');

async function migrateData() {
  const db = createConnection();
  
  try {
    console.log('🔄 Iniciando migración de datos...');
    
    // 1. Actualizar tabla proyectos para usar colaborador_id
    console.log('📁 Migrando proyectos...');
    
    // Agregar columna responsable_id si no existe
    try {
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE proyectos ADD COLUMN responsable_id INTEGER`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.log('Columna responsable_id ya existe en proyectos');
    }
    
    // Mapear nombres a IDs de colaboradores
    const colaboradoresMap = {};
    await new Promise((resolve, reject) => {
      db.all(`SELECT id, nombre FROM colaboradores`, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          rows.forEach(row => {
            colaboradoresMap[row.nombre] = row.id;
          });
          resolve();
        }
      });
    });
    
    // Actualizar proyectos
    await new Promise((resolve, reject) => {
      db.all(`SELECT id, responsable FROM proyectos WHERE responsable_id IS NULL`, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        const updates = rows.map(row => {
          const colaboradorId = colaboradoresMap[row.responsable] || null;
          return new Promise((resolveUpdate, rejectUpdate) => {
            db.run(
              `UPDATE proyectos SET responsable_id = ? WHERE id = ?`,
              [colaboradorId, row.id],
              (updateErr) => {
                if (updateErr) {
                  rejectUpdate(updateErr);
                } else {
                  resolveUpdate();
                }
              }
            );
          });
        });
        
        Promise.all(updates)
          .then(() => resolve())
          .catch(reject);
      });
    });
    
    // 2. Actualizar tabla ideas_ia para usar colaborador_id
    console.log('💡 Migrando ideas de IA...');
    
    // Agregar columna propuesto_por_id si no existe
    try {
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE ideas_ia ADD COLUMN propuesto_por_id INTEGER`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.log('Columna propuesto_por_id ya existe en ideas_ia');
    }
    
    // Actualizar ideas (asumiendo que propuesto_por ya contiene IDs)
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE ideas_ia SET propuesto_por_id = CAST(propuesto_por AS INTEGER) WHERE propuesto_por_id IS NULL AND propuesto_por IS NOT NULL`,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
    
    // 3. Actualizar tabla reuniones para usar colaborador_id
    console.log('📅 Migrando reuniones...');
    
    // Agregar columna responsables_ids si no existe
    try {
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE reuniones ADD COLUMN responsables_ids TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.log('Columna responsables_ids ya existe en reuniones');
    }
    
    // Actualizar reuniones (mapear nombres a IDs)
    await new Promise((resolve, reject) => {
      db.all(`SELECT id, responsables FROM reuniones WHERE responsables_ids IS NULL`, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        const updates = rows.map(row => {
          // Intentar mapear nombres a IDs
          const nombres = row.responsables ? row.responsables.split(',').map(n => n.trim()) : [];
          const ids = nombres.map(nombre => colaboradoresMap[nombre]).filter(id => id !== undefined);
          const idsString = ids.length > 0 ? ids.join(',') : null;
          
          return new Promise((resolveUpdate, rejectUpdate) => {
            db.run(
              `UPDATE reuniones SET responsables_ids = ? WHERE id = ?`,
              [idsString, row.id],
              (updateErr) => {
                if (updateErr) {
                  rejectUpdate(updateErr);
                } else {
                  resolveUpdate();
                }
              }
            );
          });
        });
        
        Promise.all(updates)
          .then(() => resolve())
          .catch(reject);
      });
    });
    
    // 4. Actualizar tabla documentos para usar colaborador_id
    console.log('📄 Migrando documentos...');
    
    // Agregar columna subido_por_id si no existe
    try {
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE documentos ADD COLUMN subido_por_id INTEGER`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.log('Columna subido_por_id ya existe en documentos');
    }
    
    // Actualizar documentos
    await new Promise((resolve, reject) => {
      db.all(`SELECT id, subido_por FROM documentos WHERE subido_por_id IS NULL`, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        const updates = rows.map(row => {
          const colaboradorId = colaboradoresMap[row.subido_por] || null;
          return new Promise((resolveUpdate, rejectUpdate) => {
            db.run(
              `UPDATE documentos SET subido_por_id = ? WHERE id = ?`,
              [colaboradorId, row.id],
              (updateErr) => {
                if (updateErr) {
                  rejectUpdate(updateErr);
                } else {
                  resolveUpdate();
                }
              }
            );
          });
        });
        
        Promise.all(updates)
          .then(() => resolve())
          .catch(reject);
      });
    });
    
    // 5. Crear índices para mejorar rendimiento
    console.log('🔍 Creando índices...');
    
    const indices = [
      `CREATE INDEX IF NOT EXISTS idx_proyectos_responsable_id ON proyectos(responsable_id)`,
      `CREATE INDEX IF NOT EXISTS idx_ideas_propuesto_por_id ON ideas_ia(propuesto_por_id)`,
      `CREATE INDEX IF NOT EXISTS idx_documentos_subido_por_id ON documentos(subido_por_id)`,
      `CREATE INDEX IF NOT EXISTS idx_empleados_mes_colaborador_id ON empleados_mes(colaborador_id)`,
      `CREATE INDEX IF NOT EXISTS idx_empleados_mes_periodo ON empleados_mes(mes, año)`,
      `CREATE INDEX IF NOT EXISTS idx_beneficios_categoria ON beneficios(categoria)`,
      `CREATE INDEX IF NOT EXISTS idx_beneficios_estado ON beneficios(estado)`,
      `CREATE INDEX IF NOT EXISTS idx_colaboradores_departamento ON colaboradores(departamento)`,
      `CREATE INDEX IF NOT EXISTS idx_colaboradores_estado ON colaboradores(estado)`
    ];
    
    for (const indexQuery of indices) {
      await new Promise((resolve, reject) => {
        db.run(indexQuery, (err) => {
          if (err) {
            console.log(`Error creando índice: ${err.message}`);
          }
          resolve(); // Continuar aunque falle un índice
        });
      });
    }
    
    console.log('✅ Migración completada exitosamente');
    console.log(`📊 Colaboradores mapeados: ${Object.keys(colaboradoresMap).length}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('🎉 Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };
