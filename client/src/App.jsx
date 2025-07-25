import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Proyectos from './pages/Proyectos'
import Ideas from './pages/Ideas'
import Reuniones from './pages/Reuniones'
import Documentos from './pages/Documentos'
import Indicadores from './pages/Indicadores'
import Colaboradores from './pages/Colaboradores'
import EmpleadoMes from './pages/EmpleadoMes'
import Beneficios from './pages/Beneficios'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/reuniones" element={<Reuniones />} />
        <Route path="/documentos" element={<Documentos />} />
        <Route path="/indicadores" element={<Indicadores />} />
        <Route path="/colaboradores" element={<Colaboradores />} />
        <Route path="/empleado-mes" element={<EmpleadoMes />} />
        <Route path="/beneficios" element={<Beneficios />} />
      </Routes>
    </Layout>
  )
}

export default App
