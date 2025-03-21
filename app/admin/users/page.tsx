"use client"

import { useState } from "react"
import { useUsuarios, type UsuarioConPassword } from "@/src/contexts/UsuariosContext"
import { useHorarios } from "@/src/contexts/HorariosContext"
import { Usuario, Horario } from "@/src/types"
import { Pagination } from "@/components/ui/pagination"
import DataCard from "@/components/common/DataCard"
import { DB_CONFIG } from "@/lib/db-config"

export default function UsersPage() {
  const { usuarios, addUsuario, addUsuarioConHorarios, updateUsuario, deleteUsuario } = useUsuarios()
  const { horarios, addHorario } = useHorarios()

  // Filtrar solo profesores (no admins)
  const profesores = usuarios.filter((u: Usuario) => u.rol === DB_CONFIG.ROLES.PROFESOR)
  
  // Obtener profesores inactivos
  const profesoresInactivos = profesores.filter((u: Usuario) => !u.activo)
  
  // Verificar si profesores inactivos tienen horarios asignados
  const profesoresInactivosConHorario = profesoresInactivos.filter((profesor) => {
    return horarios.some((horario) => horario.profesorId === profesor.id)
  })
  
  // Verificar si hay profesores inactivos sin horarios
  const hayProfesoresInactivosSinHorario = profesoresInactivos.length > 0 && 
                                          profesoresInactivosConHorario.length === 0

  // Estado para el formulario
  const [formData, setFormData] = useState<UsuarioConPassword>({
    nombre: "",
    apellido: "",
    email: "",
    rol: DB_CONFIG.ROLES.PROFESOR,
    activo: true,
    password: "", // Campo para la contraseña
    confirmPassword: "", // Campo para confirmar contraseña
  })

  // Estados para el modal de activación con transferencia de horarios
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [activatingUserId, setActivatingUserId] = useState<number | null>(null)
  const [selectedTransferFromId, setSelectedTransferFromId] = useState<number | null>(null)
  
  // Estado para controlar la transferencia de horarios en el formulario de edición
  const [showTransferOptions, setShowTransferOptions] = useState(false)
  const [editTransferFromId, setEditTransferFromId] = useState<number | null>(null)
  const [wasInactive, setWasInactive] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [inheritFromId, setInheritFromId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Estados para filtros
  const [filterNombre, setFilterNombre] = useState<string>("")
  const [filterEstado, setFilterEstado] = useState<string>("")
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrar profesores según criterios
  const filteredProfesores = profesores.filter((profesor: Usuario) => {
    // Filtrar por nombre, apellido o email
    if (filterNombre && 
        !profesor.nombre.toLowerCase().includes(filterNombre.toLowerCase()) &&
        !profesor.apellido.toLowerCase().includes(filterNombre.toLowerCase()) &&
        !profesor.email.toLowerCase().includes(filterNombre.toLowerCase())) {
      return false
    }
    
    // Filtrar por estado
    if (filterEstado === DB_CONFIG.ESTADOS_USUARIO.ACTIVO && !profesor.activo) {
      return false
    }
    if (filterEstado === DB_CONFIG.ESTADOS_USUARIO.INACTIVO && profesor.activo) {
      return false
    }
    
    return true
  })

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredProfesores.length / itemsPerPage)
  
  // Obtener los elementos de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProfesores.slice(startIndex, endIndex)
  }
  
  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const isCheckbox = type === "checkbox"
    const newValue = isCheckbox ? (e.target as HTMLInputElement).checked : value

    // Verificar si se está activando un usuario inactivo durante la edición
    if (name === "activo" && isCheckbox && editingId && !formData.activo && newValue === true) {
      // Si hay profesores inactivos con horarios para transferir
      if (profesoresInactivosConHorario.length > 0) {
        setShowTransferOptions(true)
        setWasInactive(true)
      }
    } else if (name === "activo" && isCheckbox && !newValue) {
      // Si se está desactivando, ocultar opciones de transferencia
      setShowTransferOptions(false)
      setEditTransferFromId(null)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))
  }

  // Comprobar si las contraseñas coinciden para la validación visual
  const passwordsMatch = !formData.password || !formData.confirmPassword 
    ? null // No validar si alguno de los campos está vacío
    : formData.password === formData.confirmPassword;

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        // Validar que las contraseñas coincidan si se ha introducido alguna
        if (formData.password && formData.password !== formData.confirmPassword) {
          setError("Las contraseñas no coinciden")
          setIsSubmitting(false)
          return
        }
        
        // Eliminar el campo confirmPassword antes de enviarlo al servicio
        const { confirmPassword, ...userData } = formData
        
        // Actualizar usuario existente
        await updateUsuario(editingId, userData)
        
        // Si se está activando un usuario y se ha seleccionado un profesor para transferir horarios
        if (wasInactive && formData.activo && editTransferFromId) {
          // Obtener el usuario que estamos activando
          const usuarioActivado = usuarios.find(u => u.id === editingId)
          if (usuarioActivado) {
            // Obtenemos los horarios del profesor seleccionado
            const horariosSeleccionados = horarios.filter(h => h.profesorId === editTransferFromId)
            
            // Actualizamos cada horario para asignarlo al profesor activado
            for (const horario of horariosSeleccionados) {
              await addHorario({
                profesorId: editingId,
                diaSemana: horario.diaSemana,
                tramoHorario: horario.tramoHorario
              })
            }
            
            alert(`Usuario actualizado correctamente con ${horariosSeleccionados.length} horarios transferidos.`)
          }
        } else {
          alert("Usuario actualizado correctamente")
        }
      } else {
        // Validar datos básicos
        if (!formData.nombre) {
          setError("El nombre es obligatorio")
          setIsSubmitting(false)
          return
        }
        if (!formData.email) {
          setError("El email es obligatorio")
          setIsSubmitting(false)
          return
        }
        
        // Verificar si la contraseña está configurada cuando se crea un nuevo usuario
        if (!formData.password) {
          if (!confirm("No ha establecido una contraseña. ¿Desea usar la contraseña por defecto 'changeme'?")) {
            setError("Por favor, establezca una contraseña")
            setIsSubmitting(false)
            return
          }
          // Usar contraseña por defecto
          formData.password = "changeme"
          formData.confirmPassword = "changeme"
        } else if (formData.password !== formData.confirmPassword) {
          setError("Las contraseñas no coinciden")
          setIsSubmitting(false)
          return
        }
        
        // Verificar restricciones para la creación de usuarios
        if (profesoresInactivos.length === 0) {
          setError("No se pueden crear nuevos usuarios porque no hay ningún profesor inactivo")
          setIsSubmitting(false)
          return
        }
        
        // Si hay profesores inactivos con horarios, debe seleccionar uno para transferir
        if (profesoresInactivosConHorario.length > 0 && !inheritFromId) {
          setError("Debe seleccionar un profesor inactivo del cual transferir los horarios")
          setIsSubmitting(false)
          return
        }
        
        // Eliminar el campo confirmPassword antes de enviarlo al servicio
        const { confirmPassword, ...userData } = formData
        
        // Si hay un usuario del que transferir horarios, usar la función correspondiente
        if (inheritFromId) {
          // Añadir usuario con horarios transferidos
          await addUsuarioConHorarios(userData, inheritFromId)
          alert("Usuario creado correctamente con horarios transferidos")
        } else if (hayProfesoresInactivosSinHorario) {
          // Añadir usuario normal si no hay horarios que transferir
          await addUsuario(userData)
          alert("Usuario creado correctamente sin horarios (no había horarios para transferir)")
        } else {
          // Este caso no debería ocurrir con las validaciones anteriores
          setError("Error en la validación de horarios transferidos")
          setIsSubmitting(false)
          return
        }
      }
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error("Error al procesar usuario:", error)
      setError("Error al procesar usuario")
    } finally {
      setIsSubmitting(false)
      // Resetear estados de transferencia
      setShowTransferOptions(false)
      setEditTransferFromId(null)
      setWasInactive(false)
    }
  }

  // Resetear formulario y estado
  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      rol: DB_CONFIG.ROLES.PROFESOR,
      activo: true,
      password: "",
      confirmPassword: "",
    })
    setEditingId(null)
    setInheritFromId(null)
    setError(null)
    setShowTransferOptions(false)
    setEditTransferFromId(null)
    setWasInactive(false)
  }

  // Comenzar edición de usuario
  const handleEdit = (usuario: Usuario) => {
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido || "", // Incluir apellido
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo,
      password: "", // Vacío por defecto, se actualizará solo si se introduce algo
      confirmPassword: "", // Vacío por defecto, se actualizará solo si se introduce algo
    })
    setEditingId(usuario.id)
    setShowForm(true)
    setInheritFromId(null)
    setShowTransferOptions(false)
    setEditTransferFromId(null)
    setWasInactive(!usuario.activo) // Guardamos si el usuario estaba inactivo
  }

  // Manejar activación/desactivación de usuario
  const handleDeactivate = (id: number, isActive: boolean) => {
    if (isActive) {
      // Desactivación - proceso simple
      if (window.confirm(`¿Estás seguro de que quieres desactivar este usuario?`)) {
        updateUsuario(id, { activo: false })
      }
    } else {
      // Activación - puede incluir transferencia de horarios
      if (profesoresInactivosConHorario.length > 0) {
        // Hay profesores inactivos con horarios, mostrar modal para elegir
        setActivatingUserId(id)
        setSelectedTransferFromId(null)
        setShowActivateModal(true)
      } else {
        // No hay profesores inactivos con horarios, activar directamente
        if (window.confirm(`¿Estás seguro de que quieres activar este usuario?`)) {
          updateUsuario(id, { activo: true })
        }
      }
    }
  }

  // Función para activar usuario con o sin transferencia de horarios
  const handleConfirmActivation = async () => {
    if (!activatingUserId) return

    try {
      // Primero, activar al usuario
      await updateUsuario(activatingUserId, { activo: true })
      
      // Si se seleccionó un profesor para transferir horarios
      if (selectedTransferFromId) {
        // Obtener el usuario que estamos activando
        const usuarioActivado = usuarios.find(u => u.id === activatingUserId)
        if (usuarioActivado) {
          // Obtenemos los horarios del profesor seleccionado
          const horariosSeleccionados = horarios.filter(h => h.profesorId === selectedTransferFromId)
          
          // Actualizamos cada horario para asignarlo al profesor activado
          for (const horario of horariosSeleccionados) {
            // Usamos la función addHorario del contexto de horarios para actualizar el profesor_id
            await addHorario({
              profesorId: activatingUserId,
              diaSemana: horario.diaSemana,
              tramoHorario: horario.tramoHorario
            })
          }
          
          alert(`Usuario activado correctamente con ${horariosSeleccionados.length} horarios transferidos.`)
        }
      } else {
        alert("Usuario activado correctamente sin horarios transferidos.")
      }
      
      // Limpiar estados del modal
      setShowActivateModal(false)
      setActivatingUserId(null)
      setSelectedTransferFromId(null)
    } catch (error) {
      console.error("Error al activar usuario:", error)
      alert("Error al activar el usuario. Por favor, inténtelo de nuevo.")
    }
  }

  // Función para refrescar los datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // En un entorno real, aquí iría la llamada para refrescar datos
      // Por ahora, simulamos un retraso
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Error al refrescar los usuarios:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="container py-4">
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .user-select-none {
          user-select: none;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Gestión de Usuarios</h1>
        <button 
          className="btn btn-outline-primary" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Actualizando...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Actualizar
            </>
          )}
        </button>
      </div>
      
      {/* Modal para activación con transferencia de horarios */}
      {showActivateModal && (
        <div className="modal show d-block" tabIndex={-1} role="dialog" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Activar Usuario</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowActivateModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>¿Deseas transferir horarios de algún profesor inactivo a este usuario?</p>
                
                <div className="form-group mb-3">
                  <label htmlFor="transferFromId" className="form-label fw-bold">
                    Profesor del que transferir horarios (opcional)
                  </label>
                  <select
                    className="form-select"
                    id="transferFromId"
                    value={selectedTransferFromId || ""}
                    onChange={(e) => setSelectedTransferFromId(e.target.value ? Number.parseInt(e.target.value) : null)}
                  >
                    <option value="">No transferir horarios</option>
                    {profesoresInactivosConHorario.map((profesor) => (
                      <option key={profesor.id} value={profesor.id}>
                        {profesor.nombre} {profesor.apellido} (inactivo)
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">
                    Si seleccionas un profesor, todos sus horarios serán transferidos al usuario que estás activando.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowActivateModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleConfirmActivation}
                >
                  Activar Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <DataCard
        title="Filtros y Acciones"
        icon="filter"
        className="mb-4"
      >
        <div className="row g-3">
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="filterNombre" className="form-label fw-bold">Buscar</label>
              <input
                type="text"
                id="filterNombre"
                className="form-control"
                placeholder="Nombre, apellido o email"
                value={filterNombre}
                onChange={(e) => setFilterNombre(e.target.value)}
              />
              <small className="form-text text-muted">Buscar por nombre, apellido o email del profesor</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="filterEstado" className="form-label fw-bold">Estado</label>
              <select
                id="filterEstado"
                className="form-select"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value={DB_CONFIG.ESTADOS_USUARIO.ACTIVO}>Activos</option>
                <option value={DB_CONFIG.ESTADOS_USUARIO.INACTIVO}>Inactivos</option>
              </select>
              <small className="form-text text-muted">Filtrar por estado del profesor</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group d-flex flex-column">
              <label className="form-label fw-bold">Acciones</label>
              <div className="mt-2">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    // Si el formulario ya está visible, simplemente cerrarlo
                    if (showForm) {
                      resetForm()
                      setShowForm(false)
                      return
                    }
                    
                    // Validar si se puede crear un nuevo usuario
                    if (profesoresInactivos.length === 0) {
                      alert("No hay profesores inactivos. Para crear un nuevo profesor, debes desactivar uno existente.")
                      return
                    }
                    
                    resetForm()
                    setShowForm(true)
                  }}
                  title={profesoresInactivos.length === 0 ? 
                    "Para crear un nuevo profesor, primero debes desactivar uno existente" : 
                    showForm ? "Cancelar" : "Crear nuevo profesor"}
                >
                  <i className={`bi ${showForm ? "bi-x-circle" : "bi-plus-circle"} me-2`}></i>
                  {showForm ? "Cancelar" : "Nuevo Profesor"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DataCard>

      {showForm && (
        <DataCard
          title={editingId ? "Editar Profesor" : "Nuevo Profesor"}
          icon={editingId ? "pencil-square" : "person-plus"}
          className="mb-4"
        >
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="nombre" className="form-label fw-bold">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                  <small className="form-text text-muted">Nombre del profesor</small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="apellido" className="form-label fw-bold">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                  />
                  <small className="form-text text-muted">Apellidos del profesor</small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="email" className="form-label fw-bold">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <small className="form-text text-muted">Correo electrónico del profesor</small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="password" className="form-label fw-bold">
                    {editingId ? "Nueva Contraseña" : "Contraseña"}
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      formData.password && formData.confirmPassword
                        ? passwordsMatch
                          ? "is-valid border-success" 
                          : "is-invalid border-danger"
                        : ""
                    }`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={editingId ? "Dejar en blanco para no cambiar" : ""}
                    required={!editingId}
                  />
                  <small className="form-text text-muted">
                    {editingId 
                      ? "Solo introduzca si desea cambiar la contraseña actual" 
                      : "Contraseña para acceder al sistema"}
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label fw-bold">
                    {editingId ? "Confirmar Nueva Contraseña" : "Confirmar Contraseña"}
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      formData.password && formData.confirmPassword
                        ? passwordsMatch
                          ? "is-valid border-success" 
                          : "is-invalid border-danger"
                        : ""
                    }`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={editingId ? "Dejar en blanco para no cambiar" : ""}
                    required={!editingId}
                  />
                  <small className={`form-text ${
                    formData.password && formData.confirmPassword && !passwordsMatch 
                      ? "text-danger" 
                      : "text-muted"
                  }`}>
                    {formData.password && formData.confirmPassword && !passwordsMatch
                      ? "Las contraseñas no coinciden"
                      : "Vuelva a introducir la contraseña para confirmarla"}
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <div className="form-check form-switch mt-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="activo"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="activo">
                      Usuario Activo
                    </label>
                    <div className="form-text">
                      Los usuarios inactivos no pueden acceder al sistema
                    </div>
                  </div>
                </div>
              </div>

              {/* Opciones de transferencia de horarios en edición */}
              {editingId && showTransferOptions && profesoresInactivosConHorario.length > 0 && (
                <div className="col-md-12 mt-3">
                  <div className="form-group">
                    <label htmlFor="editTransferFromId" className="form-label fw-bold">
                      Transferir horarios de otro profesor (opcional)
                    </label>
                    <select
                      className="form-select"
                      id="editTransferFromId"
                      value={editTransferFromId || ""}
                      onChange={(e) => setEditTransferFromId(e.target.value ? Number.parseInt(e.target.value) : null)}
                    >
                      <option value="">No transferir horarios</option>
                      {profesoresInactivosConHorario.map((profesor) => (
                        <option key={profesor.id} value={profesor.id}>
                          {profesor.nombre} {profesor.apellido} (inactivo)
                        </option>
                      ))}
                    </select>
                    <small className="form-text text-muted">
                      Al activar este usuario, puedes transferirle los horarios de otro profesor inactivo
                    </small>
                  </div>
                </div>
              )}

              {/* Opciones para crear nuevo usuario */}
              {!editingId && profesoresInactivosConHorario.length > 0 && (
                <div className="col-md-12 mt-3">
                  <div className="form-group">
                    <label htmlFor="inheritFromId" className="form-label fw-bold">
                      Profesor del que transferir horarios <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="inheritFromId"
                      value={inheritFromId || ""}
                      onChange={(e) => setInheritFromId(e.target.value ? Number.parseInt(e.target.value) : null)}
                      required
                    >
                      <option value="">Selecciona un profesor</option>
                      {profesoresInactivosConHorario.map((profesor) => (
                        <option key={profesor.id} value={profesor.id}>
                          {profesor.nombre} {profesor.apellido} (inactivo)
                        </option>
                      ))}
                    </select>
                    <small className="form-text text-muted">
                      El nuevo profesor recibirá los horarios de guardias del profesor seleccionado
                    </small>
                  </div>
                </div>
              )}

              {!editingId && hayProfesoresInactivosSinHorario && (
                <div className="col-md-12 mt-3">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Los profesores inactivos no tienen horarios asignados. El nuevo profesor se creará con un horario vacío.
                  </div>
                </div>
              )}
              
              {/* Mensaje informativo para edición cuando no hay profesores con horarios para transferir */}
              {editingId && wasInactive && formData.activo && profesoresInactivosConHorario.length === 0 && (
                <div className="col-md-12 mt-3">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No hay profesores inactivos con horarios disponibles para transferir. El usuario se activará sin horarios adicionales.
                  </div>
                </div>
              )}

              {error && (
                <div className="col-12">
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-3"
                onClick={() => {
                  resetForm()
                  setShowForm(false)
                }}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {editingId ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  <>
                    <i className={`bi ${editingId ? "bi-check-circle" : "bi-plus-circle"} me-2`}></i>
                    {editingId ? "Actualizar" : "Guardar"}
                  </>
                )}
              </button>
            </div>
          </form>
        </DataCard>
      )}

      <DataCard
        title="Listado de Profesores"
        icon="people"
        className="mb-4"
      >
        {filteredProfesores.length === 0 ? (
          <div className="alert alert-info d-flex align-items-center">
            <i className="bi bi-info-circle-fill fs-4 me-3"></i>
            <div>No hay profesores que coincidan con los filtros seleccionados.</div>
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{ overflow: 'auto', maxWidth: '100%' }}>
              <table className="table table-striped table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ minWidth: '60px' }}>ID</th>
                    <th scope="col" style={{ minWidth: '150px' }}>Nombre</th>
                    <th scope="col" style={{ minWidth: '180px' }}>Email</th>
                    <th scope="col" style={{ minWidth: '90px' }}>Estado</th>
                    <th scope="col" className="text-center" style={{ minWidth: '100px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageItems().map((profesor: Usuario) => (
                    <tr key={profesor.id}>
                      <td className="text-muted small">{profesor.id}</td>
                      <td className="fw-medium">
                        {profesor.nombre} {profesor.apellido || ""}
                      </td>
                      <td>{profesor.email}</td>
                      <td>
                        {profesor.activo ? (
                          <span className="badge bg-success rounded-pill px-3 py-2">Activo</span>
                        ) : (
                          <span className="badge bg-danger rounded-pill px-3 py-2">Inactivo</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(profesor)}
                            title="Editar profesor"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleDeactivate(profesor.id, profesor.activo)}
                            title={profesor.activo ? "Desactivar profesor" : "Activar profesor"}
                          >
                            <i className={`bi ${profesor.activo ? "bi-person-dash" : "bi-person-check"}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <div className="text-muted small">
                Mostrando <span className="fw-bold">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredProfesores.length)}</span> de <span className="fw-bold">{filteredProfesores.length}</span> profesores
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </DataCard>
    </div>
  )
} 