# Informatik-AI Hub Interno

Aplicación web administrativa interna para organizar los flujos de trabajo de la empresa Informatik-AI.

## 🚀 Características

- **Dashboard administrativo** tipo hub interno
- **5 módulos principales**: Proyectos, Ideas de IA, Reuniones, Documentos e Indicadores
- **CRUD completo** para todas las entidades
- **Persistencia local** con SQLite
- **Diseño responsive** para móvil y escritorio
- **Sin autenticación** (uso interno del equipo)

## 🎨 Diseño

- **Paleta de colores**: Fondo blanco, acentos en celeste (#00AEEF), gris claro y negro
- **Tipografía moderna** e íconos funcionales
- **Inspirado en el logo** de Informatik-AI

## 🛠️ Tecnologías

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Base de datos**: SQLite
- **Estilos**: CSS Modules / Styled Components

## 📦 Instalación

### Opción 1: Instalación automática
```bash
# Instalar dependencias en todos los proyectos
npm run install-all

# Ejecutar en modo desarrollo
npm run dev
```

### Opción 2: Instalación manual
```bash
# 1. Instalar dependencias del servidor
cd server
npm install

# 2. Inicializar base de datos
npm run init-db

# 3. Instalar dependencias del cliente
cd ../client
npm install

# 4. Volver al directorio raíz
cd ..
```

### Opción 3: Script de Windows
```bash
# Ejecutar el script de desarrollo (Windows)
start-dev.bat
```

## 🚀 Ejecución

### Desarrollo
```bash
# Opción 1: Ejecutar ambos servicios
npm run dev

# Opción 2: Ejecutar por separado
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

### Producción
```bash
# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## 📁 Estructura del proyecto

```
informatik-ai-hub-interno/
├── client/          # Frontend React
├── server/          # Backend Node.js
├── package.json     # Scripts principales
└── README.md
```

## 🧩 Módulos

1. **📁 Proyectos** - Gestión de proyectos de la empresa
2. **🧠 Ideas de IA** - Banco de ideas y propuestas de IA
3. **📅 Reuniones** - Planificación y seguimiento de reuniones
4. **📄 Documentos** - Repositorio de documentos internos
5. **📊 Indicadores** - Métricas y KPIs del negocio
6. **👥 Colaboradores** - Gestión del equipo y personal
7. **🏆 Empleado del Mes** - Sistema de votación y reconocimiento
8. **🎁 Beneficios y Convenios** - Beneficios laborales y convenios empresariales

## 🌐 URLs de la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📋 Funcionalidades Implementadas

### ✅ Backend (Node.js + Express + SQLite)
- [x] API REST completa para todos los módulos
- [x] Base de datos SQLite con datos de ejemplo
- [x] Modelos y validaciones
- [x] Manejo de errores y logging
- [x] CORS configurado
- [x] Endpoints para estadísticas

### ✅ Frontend (React + Vite)
- [x] Dashboard principal con estadísticas
- [x] Navegación responsive con sidebar
- [x] Módulo de Proyectos (CRUD completo)
- [x] Módulo de Ideas de IA (CRUD + cambio de estados)
- [x] Módulo de Reuniones (vista de calendario)
- [x] Módulo de Documentos (gestión de archivos)
- [x] Módulo de Indicadores (métricas visuales)
- [x] Módulo de Colaboradores (gestión de personal)
- [x] Módulo de Empleado del Mes (sistema de votación)
- [x] Módulo de Beneficios y Convenios (gestión de beneficios)
- [x] Diseño responsive para móvil y escritorio
- [x] Paleta de colores de Informatik-AI
- [x] Estados de carga y manejo de errores

### 🔧 Características Técnicas
- [x] React Query para gestión de estado
- [x] React Router para navegación
- [x] Axios para peticiones HTTP
- [x] Lucide React para iconos
- [x] CSS personalizado con variables
- [x] Proxy configurado entre frontend y backend
- [x] Hot reload en desarrollo

## 🗃️ Estructura de la Base de Datos

La aplicación utiliza SQLite con las siguientes tablas:

- **proyectos**: Gestión de proyectos
- **ideas_ia**: Banco de ideas de IA
- **reuniones**: Planificación de reuniones
- **documentos**: Repositorio de documentos
- **indicadores**: Métricas y KPIs
- **colaboradores**: Gestión de personal y equipo
- **empleados_mes**: Sistema de votación y reconocimiento
- **beneficios**: Beneficios laborales y convenios empresariales

## 🎨 Paleta de Colores

- **Primario**: #00AEEF (Celeste Informatik-AI)
- **Secundario**: #F5F5F5 (Gris claro)
- **Texto**: #333333 (Negro)
- **Fondo**: #FFFFFF (Blanco)
- **Éxito**: #4CAF50
- **Advertencia**: #FF9800
- **Error**: #F44336

## 🔄 Próximas Mejoras

- [ ] Autenticación y autorización
- [ ] Subida real de archivos
- [ ] Notificaciones en tiempo real
- [ ] Exportación de datos
- [ ] Gráficos avanzados
- [ ] Integración con APIs externas
- [ ] Tests unitarios y de integración

---

Desarrollado por el equipo de **Informatik-AI** 🤖

**Estado**: ✅ Funcional - Listo para uso interno

## 🆕 Nuevas Funcionalidades (v2.0)

### 👥 **Módulo de Colaboradores**
- Gestión completa del equipo de trabajo
- Perfiles con información de contacto y departamento
- Sistema de puntajes y evaluación
- Filtros por departamento y estado
- Integración con todos los demás módulos

### 🏆 **Sistema de Empleado del Mes**
- Votación anónima mensual
- Criterios de evaluación: desempeño y colaboración
- Historial de ganadores
- Estadísticas de votación
- Selección automática del ganador

### 🎁 **Beneficios y Convenios**
- Catálogo de beneficios laborales
- Categorización por tipo (Salud, Educación, etc.)
- Control de vigencias y vencimientos
- Gestión de proveedores y descuentos
- Alertas de beneficios por vencer

### 🔗 **Integración de Datos**
- Relaciones entre colaboradores y proyectos
- Trazabilidad de responsables en ideas y documentos
- Migración automática de datos existentes
- Índices optimizados para mejor rendimiento
