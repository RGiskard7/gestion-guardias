# Diagramas de Flujo - Sistema de Gestión de Guardias

Este documento contiene los diagramas de flujo de las principales funcionalidades del Sistema de Gestión de Guardias, representados en formato Mermaid.

## Índice
- [Diagramas de Flujo - Sistema de Gestión de Guardias](#diagramas-de-flujo---sistema-de-gestión-de-guardias)
  - [Índice](#índice)
  - [Flujo General del Sistema](#flujo-general-del-sistema)
  - [Flujos para Profesores](#flujos-para-profesores)
    - [Registro de Ausencia](#registro-de-ausencia)
    - [Visualización de Horario](#visualización-de-horario)
    - [Asignación a Guardia Pendiente](#asignación-a-guardia-pendiente)
    - [Firma de Guardia](#firma-de-guardia)
  - [Flujos para Administradores](#flujos-para-administradores)
    - [Gestión de Usuarios](#gestión-de-usuarios)
    - [Gestión de Horarios](#gestión-de-horarios)
    - [Gestión de Lugares](#gestión-de-lugares)
    - [Gestión de Guardias](#gestión-de-guardias)
    - [Gestión de Ausencias](#gestión-de-ausencias)
  - [Flujos de Procesos Automáticos](#flujos-de-procesos-automáticos)
    - [Creación de Guardia desde Ausencia](#creación-de-guardia-desde-ausencia)
    - [Anulación de Guardia](#anulación-de-guardia)

## Flujo General del Sistema

```mermaid
flowchart TD
    A[Usuario] -->|Accede| B[Pantalla de Login]
    B -->|Introduce credenciales| C{Validación}
    C -->|Credenciales correctas| D{Rol de usuario}
    C -->|Credenciales incorrectas| B
    D -->|Profesor| E[Dashboard Profesor]
    D -->|Administrador| F[Dashboard Administrador]
    E -->|Navega| G[Funcionalidades Profesor]
    F -->|Navega| H[Funcionalidades Administrador]
    G -->|Cierra sesión| B
    H -->|Cierra sesión| B
```

## Flujos para Profesores

### Registro de Ausencia

```mermaid
flowchart TD
    A[Profesor] -->|Accede a| B[Mis Ausencias]
    B -->|Clic en| C[Nueva Ausencia]
    C -->|Completa formulario| D{Validación}
    D -->|Datos correctos| E[Enviar solicitud]
    D -->|Datos incorrectos| C
    E -->|Solicitud enviada| F[Ausencia registrada como Pendiente]
    F -->|Espera aprobación| G{Decisión Admin}
    G -->|Aceptada| H[Ausencia Aceptada]
    G -->|Rechazada| I[Ausencia Rechazada]
    H -->|Genera| J[Guardia Pendiente]
```

### Visualización de Horario

```mermaid
flowchart TD
    A[Profesor] -->|Accede a| B[Mi Horario]
    B -->|Visualiza| C[Vista Semanal]
    C -->|Selecciona| D{Modo de visualización}
    D -->|Disponibilidad| E[Muestra tramos disponibles]
    D -->|Guardias Asignadas| F[Muestra guardias asignadas]
    C -->|Navega| G[Semana anterior/siguiente]
    G -->|Actualiza| C
```

### Asignación a Guardia Pendiente

```mermaid
flowchart TD
    A[Profesor] -->|Accede a| B[Guardias Pendientes]
    B -->|Visualiza| C[Lista de guardias pendientes]
    C -->|Selecciona guardia| D[Clic en Asignarme]
    D -->|Sistema verifica| E{Requisitos}
    E -->|Cumple requisitos| F[Guardia asignada]
    E -->|No cumple requisitos| G[Mensaje de error]
    F -->|Actualiza estado| H[Guardia en estado Asignada]
```

### Firma de Guardia

```mermaid
flowchart TD
    A[Profesor] -->|Accede a| B[Firmar Guardia]
    B -->|Visualiza| C[Lista de guardias asignadas]
    C -->|Selecciona guardia| D[Clic en Firmar]
    D -->|Completa| E[Formulario de observaciones]
    E -->|Envía| F[Guardia firmada]
    F -->|Actualiza estado| G[Guardia en estado Firmada]
```

## Flujos para Administradores

### Gestión de Usuarios

```mermaid
flowchart TD
    A[Administrador] -->|Accede a| B[Usuarios]
    B -->|Visualiza| C[Lista de usuarios]
    C -->|Acción| D{Selecciona operación}
    D -->|Nuevo usuario| E[Formulario nuevo usuario]
    D -->|Editar usuario| F[Formulario editar usuario]
    D -->|Desactivar usuario| G[Confirmación]
    E -->|Completa y envía| H[Usuario creado]
    F -->|Modifica y envía| I[Usuario actualizado]
    G -->|Confirma| J[Usuario desactivado]
```

### Gestión de Horarios

```mermaid
flowchart TD
    A[Administrador] -->|Accede a| B[Horarios]
    B -->|Selecciona| C[Profesor]
    C -->|Visualiza| D[Horario actual]
    D -->|Acción| E{Selecciona operación}
    E -->|Nuevo tramo| F[Formulario nuevo tramo]
    E -->|Eliminar tramo| G[Confirmación]
    F -->|Completa y envía| H[Tramo añadido]
    G -->|Confirma| I[Tramo eliminado]
```

### Gestión de Lugares

```mermaid
flowchart TD
    A[Administrador] -->|Accede a| B[Lugares]
    B -->|Visualiza| C[Lista de lugares]
    C -->|Acción| D{Selecciona operación}
    D -->|Nuevo lugar| E[Formulario nuevo lugar]
    D -->|Editar lugar| F[Formulario editar lugar]
    D -->|Eliminar lugar| G[Confirmación]
    E -->|Completa y envía| H[Lugar creado]
    F -->|Modifica y envía| I[Lugar actualizado]
    G -->|Confirma| J[Lugar eliminado]
```

### Gestión de Guardias

```mermaid
flowchart TD
    A[Administrador] -->|Accede a| B[Guardias]
    B -->|Visualiza| C[Lista de guardias]
    C -->|Filtra| D[Aplica filtros]
    D -->|Acción| E{Selecciona operación}
    E -->|Nueva guardia| F[Formulario nueva guardia]
    E -->|Editar guardia| G[Formulario editar guardia]
    E -->|Anular guardia| H[Confirmación]
    F -->|Completa y envía| I[Guardia creada]
    G -->|Modifica y envía| J[Guardia actualizada]
    H -->|Confirma| K[Guardia anulada]
```

### Gestión de Ausencias

```mermaid
flowchart TD
    A[Administrador] -->|Accede a| B[Ausencias]
    B -->|Visualiza| C[Lista de ausencias]
    C -->|Filtra| D[Aplica filtros]
    D -->|Acción| E{Selecciona operación}
    E -->|Nueva ausencia| F[Formulario nueva ausencia]
    E -->|Editar ausencia| G[Formulario editar ausencia]
    E -->|Aceptar ausencia| H[Formulario aceptar]
    E -->|Rechazar ausencia| I[Formulario rechazar]
    E -->|Anular ausencia| J[Confirmación]
    F -->|Completa y envía| K[Ausencia creada]
    G -->|Modifica y envía| L[Ausencia actualizada]
    H -->|Completa y envía| M[Ausencia aceptada y guardia creada]
    I -->|Indica motivo| N[Ausencia rechazada]
    J -->|Confirma| O[Ausencia anulada]
```

## Flujos de Procesos Automáticos

### Creación de Guardia desde Ausencia

```mermaid
flowchart TD
    A[Administrador] -->|Acepta| B[Ausencia pendiente]
    B -->|Completa formulario| C[Datos de guardia]
    C -->|Sistema procesa| D[Crear guardia]
    D -->|Actualiza| E[Estado ausencia a Aceptada]
    D -->|Crea| F[Nueva guardia en estado Pendiente]
    F -->|Disponible en| G[Lista de guardias pendientes]
```

### Anulación de Guardia

```mermaid
flowchart TD
    A[Usuario] -->|Solicita anular| B[Guardia]
    B -->|Sistema verifica| C{Estado de la guardia}
    C -->|Pendiente/Asignada| D[Anulación permitida]
    C -->|Firmada| E[Anulación no permitida]
    D -->|Actualiza| F[Estado guardia a Anulada]
    D -->|Si proviene de ausencia| G[Verifica ausencia relacionada]
    G -->|Anula también| H[Ausencia relacionada]
``` 