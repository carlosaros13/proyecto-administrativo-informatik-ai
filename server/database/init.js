const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'informatik_ai_hub.db');

// Crear conexión a la base de datos
function createConnection() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error al conectar con la base de datos:', err.message);
    } else {
      console.log('✅ Conectado a la base de datos SQLite');
    }
  });
}

// Esquemas de las tablas
const schemas = {
  proyectos: `
    CREATE TABLE IF NOT EXISTS proyectos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      estado TEXT DEFAULT 'activo' CHECK(estado IN ('activo', 'pausado', 'completado', 'cancelado')),
      responsable TEXT,
      fecha_inicio DATE,
      fecha_fin DATE,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  
  ideas_ia: `
    CREATE TABLE IF NOT EXISTS ideas_ia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      propuesto_por TEXT,
      fecha DATE DEFAULT CURRENT_DATE,
      estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'en_evaluacion', 'aceptada', 'rechazada')),
      proyecto_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (proyecto_id) REFERENCES proyectos (id) ON DELETE SET NULL
    )
  `,
  
  reuniones: `
    CREATE TABLE IF NOT EXISTS reuniones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha DATE NOT NULL,
      hora TIME NOT NULL,
      tema TEXT NOT NULL,
      responsables TEXT,
      notas TEXT,
      estado TEXT DEFAULT 'programada' CHECK(estado IN ('programada', 'en_curso', 'completada', 'cancelada')),
      proyecto_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (proyecto_id) REFERENCES proyectos (id) ON DELETE SET NULL
    )
  `,
  
  documentos: `
    CREATE TABLE IF NOT EXISTS documentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      tipo TEXT,
      link TEXT,
      fecha DATE DEFAULT CURRENT_DATE,
      subido_por TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  
  indicadores: `
    CREATE TABLE IF NOT EXISTS indicadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      valor_actual REAL,
      unidad TEXT,
      fecha_ultima_actualizacion DATE DEFAULT CURRENT_DATE,
      relacionado_a TEXT CHECK(relacionado_a IN ('proyecto', 'idea')),
      relacionado_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  colaboradores: `
    CREATE TABLE IF NOT EXISTS colaboradores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      email TEXT UNIQUE NOT NULL,
      telefono TEXT,
      cargo TEXT,
      departamento TEXT,
      fecha_ingreso DATE DEFAULT CURRENT_DATE,
      estado TEXT DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo', 'vacaciones')),
      puntaje INTEGER DEFAULT 0 CHECK(puntaje >= 0 AND puntaje <= 100),
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  empleados_mes: `
    CREATE TABLE IF NOT EXISTS empleados_mes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      colaborador_id INTEGER NOT NULL,
      mes INTEGER NOT NULL CHECK(mes >= 1 AND mes <= 12),
      año INTEGER NOT NULL,
      votos_recibidos INTEGER DEFAULT 0,
      criterios_desempeño INTEGER DEFAULT 0 CHECK(criterios_desempeño >= 0 AND criterios_desempeño <= 10),
      criterios_colaboracion INTEGER DEFAULT 0 CHECK(criterios_colaboracion >= 0 AND criterios_colaboracion <= 10),
      comentarios TEXT,
      estado TEXT DEFAULT 'nominado' CHECK(estado IN ('nominado', 'ganador', 'descalificado')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (colaborador_id) REFERENCES colaboradores (id) ON DELETE CASCADE,
      UNIQUE(colaborador_id, mes, año)
    )
  `,

  beneficios: `
    CREATE TABLE IF NOT EXISTS beneficios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      categoria TEXT NOT NULL CHECK(categoria IN ('Salud', 'Educación', 'Recreación', 'Tecnología', 'Descuentos', 'Bienestar')),
      proveedor TEXT,
      descuento REAL CHECK(descuento >= 0 AND descuento <= 100),
      vigencia_inicio DATE,
      vigencia_fin DATE,
      requisitos TEXT,
      estado TEXT DEFAULT 'activo' CHECK(estado IN ('activo', 'inactivo')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
};

// Datos de ejemplo
const sampleData = {
  proyectos: [
    {
      nombre: 'Sistema de Gestión Inteligente',
      descripcion: 'Desarrollo de un sistema de gestión con IA para optimizar procesos internos',
      estado: 'activo',
      responsable: 'Juan Pérez',
      fecha_inicio: '2024-01-15',
      fecha_fin: '2024-06-30',
      tags: 'IA,Gestión,Automatización'
    },
    {
      nombre: 'Chatbot de Atención al Cliente',
      descripcion: 'Implementación de chatbot con procesamiento de lenguaje natural',
      estado: 'activo',
      responsable: 'María García',
      fecha_inicio: '2024-02-01',
      fecha_fin: '2024-05-15',
      tags: 'IA,NLP,Chatbot'
    }
  ],
  
  ideas_ia: [
    {
      titulo: 'Análisis predictivo de ventas',
      descripcion: 'Usar machine learning para predecir tendencias de ventas',
      propuesto_por: 1, // Será migrado a colaborador_id
      estado: 'en_evaluacion',
      proyecto_id: 1
    },
    {
      titulo: 'Automatización de reportes',
      descripcion: 'Generar reportes automáticos usando IA generativa',
      propuesto_por: 2, // Será migrado a colaborador_id
      estado: 'pendiente',
      proyecto_id: null
    }
  ],

  colaboradores: [
    {
      nombre: 'Carlos López',
      descripcion: 'Especialista en Machine Learning y análisis de datos',
      email: 'carlos.lopez@informatik-ai.com',
      telefono: '+34 600 123 456',
      cargo: 'Data Scientist',
      departamento: 'Tecnología',
      fecha_ingreso: '2023-01-15',
      estado: 'activo',
      puntaje: 85
    },
    {
      nombre: 'Ana Martín',
      descripcion: 'Desarrolladora Full Stack con experiencia en IA',
      email: 'ana.martin@informatik-ai.com',
      telefono: '+34 600 234 567',
      cargo: 'Full Stack Developer',
      departamento: 'Desarrollo',
      fecha_ingreso: '2023-03-01',
      estado: 'activo',
      puntaje: 92
    },
    {
      nombre: 'Juan Pérez',
      descripcion: 'Project Manager con experiencia en proyectos de IA',
      email: 'juan.perez@informatik-ai.com',
      telefono: '+34 600 345 678',
      cargo: 'Project Manager',
      departamento: 'Gestión',
      fecha_ingreso: '2022-11-10',
      estado: 'activo',
      puntaje: 88
    },
    {
      nombre: 'María García',
      descripcion: 'UX/UI Designer especializada en interfaces de IA',
      email: 'maria.garcia@informatik-ai.com',
      telefono: '+34 600 456 789',
      cargo: 'UX/UI Designer',
      departamento: 'Diseño',
      fecha_ingreso: '2023-02-20',
      estado: 'activo',
      puntaje: 90
    }
  ],

  empleados_mes: [
    {
      colaborador_id: 2,
      mes: 11,
      año: 2024,
      votos_recibidos: 5,
      criterios_desempeño: 9,
      criterios_colaboracion: 10,
      comentarios: 'Excelente trabajo en el desarrollo del nuevo sistema',
      estado: 'ganador'
    },
    {
      colaborador_id: 1,
      mes: 12,
      año: 2024,
      votos_recibidos: 3,
      criterios_desempeño: 7,
      criterios_colaboracion: 8,
      comentarios: 'Gran contribución en el análisis de datos',
      estado: 'nominado'
    }
  ],

  beneficios: [
    {
      titulo: 'Seguro Médico Premium',
      descripcion: 'Cobertura médica completa para empleados y familiares',
      categoria: 'Salud',
      proveedor: 'Sanitas',
      descuento: 100,
      vigencia_inicio: '2024-01-01',
      vigencia_fin: '2024-12-31',
      requisitos: 'Empleados con contrato indefinido',
      estado: 'activo'
    },
    {
      titulo: 'Cursos de Certificación AWS',
      descripcion: 'Acceso gratuito a cursos de certificación en Amazon Web Services',
      categoria: 'Educación',
      proveedor: 'AWS Training',
      descuento: 100,
      vigencia_inicio: '2024-01-01',
      vigencia_fin: null,
      requisitos: 'Todos los empleados del departamento de Tecnología',
      estado: 'activo'
    },
    {
      titulo: 'Descuento en Gimnasio',
      descripcion: '30% de descuento en membresías del gimnasio local',
      categoria: 'Bienestar',
      proveedor: 'FitnessPro',
      descuento: 30,
      vigencia_inicio: '2024-01-01',
      vigencia_fin: '2024-12-31',
      requisitos: 'Todos los empleados',
      estado: 'activo'
    },
    {
      titulo: 'Licencias de Software',
      descripcion: 'Acceso a herramientas de desarrollo y diseño profesionales',
      categoria: 'Tecnología',
      proveedor: 'Adobe, JetBrains',
      descuento: 100,
      vigencia_inicio: '2024-01-01',
      vigencia_fin: null,
      requisitos: 'Empleados de Desarrollo y Diseño',
      estado: 'activo'
    }
  ]
};

// Función para inicializar la base de datos
async function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = createConnection();
    
    // Crear todas las tablas
    const tableNames = Object.keys(schemas);
    let completed = 0;
    
    tableNames.forEach((tableName) => {
      db.run(schemas[tableName], (err) => {
        if (err) {
          console.error(`Error creando tabla ${tableName}:`, err.message);
          reject(err);
          return;
        }
        
        console.log(`✅ Tabla ${tableName} creada/verificada`);
        completed++;
        
        if (completed === tableNames.length) {
          // Insertar datos de ejemplo solo si las tablas están vacías
          insertSampleData(db, () => {
            db.close((err) => {
              if (err) {
                console.error('Error cerrando la base de datos:', err.message);
                reject(err);
              } else {
                console.log('✅ Base de datos inicializada correctamente');
                resolve();
              }
            });
          });
        }
      });
    });
  });
}

// Función para insertar datos de ejemplo
function insertSampleData(db, callback) {
  // Verificar si ya hay datos
  db.get("SELECT COUNT(*) as count FROM proyectos", (err, row) => {
    if (err) {
      console.error('Error verificando datos existentes:', err.message);
      callback();
      return;
    }
    
    if (row.count > 0) {
      console.log('📊 Datos existentes encontrados, omitiendo inserción de datos de ejemplo');
      callback();
      return;
    }
    
    console.log('📊 Insertando datos de ejemplo...');
    
    // Insertar proyectos de ejemplo
    const insertProject = db.prepare(`
      INSERT INTO proyectos (nombre, descripcion, estado, responsable, fecha_inicio, fecha_fin, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    sampleData.proyectos.forEach(proyecto => {
      insertProject.run([
        proyecto.nombre,
        proyecto.descripcion,
        proyecto.estado,
        proyecto.responsable,
        proyecto.fecha_inicio,
        proyecto.fecha_fin,
        proyecto.tags
      ]);
    });
    
    insertProject.finalize();
    
    // Insertar ideas de ejemplo
    const insertIdea = db.prepare(`
      INSERT INTO ideas_ia (titulo, descripcion, propuesto_por, estado, proyecto_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    sampleData.ideas_ia.forEach(idea => {
      insertIdea.run([
        idea.titulo,
        idea.descripcion,
        idea.propuesto_por,
        idea.estado,
        idea.proyecto_id
      ]);
    });
    
    insertIdea.finalize();

    // Insertar colaboradores de ejemplo
    const insertColaborador = db.prepare(`
      INSERT INTO colaboradores (nombre, descripcion, email, telefono, cargo, departamento, fecha_ingreso, estado, puntaje)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleData.colaboradores.forEach(colaborador => {
      insertColaborador.run([
        colaborador.nombre,
        colaborador.descripcion,
        colaborador.email,
        colaborador.telefono,
        colaborador.cargo,
        colaborador.departamento,
        colaborador.fecha_ingreso,
        colaborador.estado,
        colaborador.puntaje
      ]);
    });

    insertColaborador.finalize();

    // Insertar empleados del mes de ejemplo
    const insertEmpleadoMes = db.prepare(`
      INSERT INTO empleados_mes (colaborador_id, mes, año, votos_recibidos, criterios_desempeño, criterios_colaboracion, comentarios, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleData.empleados_mes.forEach(empleado => {
      insertEmpleadoMes.run([
        empleado.colaborador_id,
        empleado.mes,
        empleado.año,
        empleado.votos_recibidos,
        empleado.criterios_desempeño,
        empleado.criterios_colaboracion,
        empleado.comentarios,
        empleado.estado
      ]);
    });

    insertEmpleadoMes.finalize();

    // Insertar beneficios de ejemplo
    const insertBeneficio = db.prepare(`
      INSERT INTO beneficios (titulo, descripcion, categoria, proveedor, descuento, vigencia_inicio, vigencia_fin, requisitos, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleData.beneficios.forEach(beneficio => {
      insertBeneficio.run([
        beneficio.titulo,
        beneficio.descripcion,
        beneficio.categoria,
        beneficio.proveedor,
        beneficio.descuento,
        beneficio.vigencia_inicio,
        beneficio.vigencia_fin,
        beneficio.requisitos,
        beneficio.estado
      ]);
    });

    insertBeneficio.finalize();

    console.log('✅ Datos de ejemplo insertados (incluyendo nuevos módulos)');
    callback();
  });
}

module.exports = {
  createConnection,
  initDatabase,
  DB_PATH
};
