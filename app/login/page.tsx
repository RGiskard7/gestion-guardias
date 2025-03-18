"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/src/contexts/AuthContext"
import { DB_CONFIG } from "@/lib/db-config"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Por favor, introduce tu email")
      return
    }

    try {
      setError("")
      setLoading(true)
      console.log("Intentando login con:", email)

      const success = await login(email)
      console.log("Resultado login:", success)

      if (success) {
        console.log("Login exitoso, redirigiendo...")
        // Obtenemos el usuario del localStorage para determinar su rol
        const userString = localStorage.getItem("user")
        if (userString) {
          const user = JSON.parse(userString)
          // Redirect based on user role
          if (user.rol === DB_CONFIG.ROLES.ADMIN) {
            await router.replace(DB_CONFIG.RUTAS.ADMIN)
          } else {
            await router.replace(DB_CONFIG.RUTAS.PROFESOR)
          }
        }
      } else {
        setError("Email no encontrado o usuario inactivo")
      }
    } catch (err) {
      console.error("Error en login:", err)
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0 rounded-lg mt-5">
            <div className="card-header bg-primary text-white text-center">
              <h3 className="my-3">Gestión de Guardias</h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="alert alert-info">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    Por el momento, solo se requiere el email para iniciar sesión. No es necesario introducir contraseña.
                  </small>
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      "Iniciar sesión"
                    )}
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center py-3">
              <div className="small">
                <p className="mb-0">Emails de prueba:</p>
                <p className="mb-0">Admin: admin@instituto.es</p>
                <p className="mb-0">Profesor: profesor@instituto.es</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 