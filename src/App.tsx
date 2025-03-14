import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { GuardiasProvider } from "./contexts/GuardiasContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ManageUsers from "./pages/admin/ManageUsers"
import ManageHorarios from "./pages/admin/ManageHorarios"
import ManageLugares from "./pages/admin/ManageLugares"
import ManageGuardias from "./pages/admin/ManageGuardias"
import SalaGuardias from "./pages/SalaGuardias"
import ProfesorDashboard from "./pages/profesor/ProfesorDashboard"
import MisAusencias from "./pages/profesor/MisAusencias"
import GuardiasPendientes from "./pages/profesor/GuardiasPendientes"
import FirmarGuardia from "./pages/profesor/FirmarGuardia"
import Estadisticas from "./pages/admin/Estadisticas"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"

function App() {
  return (
    <Router>
      <AuthProvider>
        <GuardiasProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/horarios"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ManageHorarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lugares"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ManageLugares />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/guardias"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ManageGuardias />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/estadisticas"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Estadisticas />
                </ProtectedRoute>
              }
            />

            {/* Profesor Routes */}
            <Route
              path="/profesor"
              element={
                <ProtectedRoute requiredRole="profesor">
                  <ProfesorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profesor/ausencias"
              element={
                <ProtectedRoute requiredRole="profesor">
                  <MisAusencias />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profesor/guardias-pendientes"
              element={
                <ProtectedRoute requiredRole="profesor">
                  <GuardiasPendientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profesor/firmar-guardia"
              element={
                <ProtectedRoute requiredRole="profesor">
                  <FirmarGuardia />
                </ProtectedRoute>
              }
            />

            {/* Sala de Guardias (accesible para ambos roles) */}
            <Route
              path="/sala-guardias"
              element={
                <ProtectedRoute requiredRole="any">
                  <SalaGuardias />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </GuardiasProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

