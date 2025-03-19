# Diagramas de Estados del Sistema

Este documento describe los diferentes estados y transiciones posibles para los elementos principales del sistema.

## Índice
1. [Estados de Guardias](#estados-de-guardias)
2. [Estados de Ausencias](#estados-de-ausencias)
3. [Estados de Usuarios](#estados-de-usuarios)

## Estados de Guardias

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE: Creación automática\npor ausencia o manual\npor administrador
    PENDIENTE --> ASIGNADA: Profesor acepta\ncubrir guardia
    ASIGNADA --> FIRMADA: Profesor firma\nla guardia
    PENDIENTE --> ANULADA: Admin anula guardia\no ausencia anulada
    ASIGNADA --> ANULADA: Admin anula guardia\no ausencia anulada
    ASIGNADA --> PENDIENTE: Admin/Profesor quita\nprofesor cubridor
    ANULADA --> [*]: Admin elimina\n(solo guardias anuladas)
    FIRMADA --> [*]

    state PENDIENTE {
        [*] --> SinAsignar: Aparece en lista\nde guardias disponibles
        SinAsignar --> EnSeleccion: Profesor intenta\nasignar
        EnSeleccion --> SinAsignar: Timeout/Cancelación
    }

    state ASIGNADA {
        [*] --> EsperandoRealizacion: Asignada pero\nno realizada
        EsperandoRealizacion --> ListaParaFirmar: Hora de guardia\nalcanzada
    }
    
    state FIRMADA {
        [*] --> Completada: Firmada sin tareas
        [*] --> CompletadaConTareas: Firmada con tareas
    }

    note right of PENDIENTE
      La guardia puede estar asociada o no a una ausencia.
      Las guardias pendientes aparecen en la pestaña
      "Guardias pendientes" de la vista "Mis guardias".
    end note
    
    note right of ANULADA
      Solo las guardias ANULADAS pueden ser
      eliminadas definitivamente del sistema.
    end note
```

## Estados de Ausencias

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE: Profesor registra\nausencia o creación\npor administrador
    PENDIENTE --> ACEPTADA: Admin acepta\ny crea guardias
    PENDIENTE --> RECHAZADA: Admin rechaza
    ACEPTADA --> PENDIENTE: Guardia asociada\nanulada
    ACEPTADA --> PENDIENTE: Admin desasocia\nla guardia
    PENDIENTE --> ANULADA: Admin anula ausencia
    ANULADA --> [*]
    RECHAZADA --> [*]
    ACEPTADA --> [*]

    state PENDIENTE {
        [*] --> EsperandoAprobacion
        EsperandoAprobacion --> ConGuardiaAnulada: Guardia previa\nanulada
    }
    
    state ACEPTADA {
        [*] --> ConGuardiaAsociada: Guardia creada\nen estado PENDIENTE
        ConGuardiaAsociada --> ConGuardiaAsignada: Guardia pasa\na ASIGNADA
        ConGuardiaAsignada --> ConGuardiaFirmada: Guardia pasa\na FIRMADA
    }

    note right of PENDIENTE
      Cuando una guardia asociada se anula,
      la ausencia vuelve a estado PENDIENTE
      para permitir crear una nueva guardia.
    end note
    
    note right of ACEPTADA
      Una ausencia ACEPTADA tiene al menos
      una guardia asociada. El estado de la
      ausencia no cambia si la guardia asociada
      cambia de estado.
    end note
```

## Estados de Usuarios

```mermaid
stateDiagram-v2
    [*] --> INACTIVO: Usuario creado
    INACTIVO --> ACTIVO: Admin activa
    ACTIVO --> INACTIVO: Admin desactiva
    ACTIVO --> [*]: Admin elimina
    INACTIVO --> [*]: Admin elimina
    
    state ACTIVO {
        [*] --> Normal
        Normal --> EnGuardia: Cubriendo guardia
        EnGuardia --> Normal: Guardia completada
        Normal --> Ausente: Registra ausencia
        Ausente --> Normal: Ausencia completada
    }
```

## Notas sobre los Estados

### Guardias
- **PENDIENTE**: La guardia está disponible para ser cubierta por cualquier profesor que tenga horario para ese día y tramo y no esté cubriendo otra guardia en ese momento.
- **ASIGNADA**: Un profesor se ha comprometido a cubrir la guardia pero aún no la ha realizado o no la ha firmado.
- **FIRMADA**: La guardia ha sido realizada y firmada. Puede incluir tareas realizadas durante la guardia.
- **ANULADA**: La guardia ha sido cancelada (por anulación de ausencia o decisión administrativa).

### Ausencias
- **PENDIENTE**: Esperando aprobación administrativa o requiere nueva asignación tras anulación.
- **ACEPTADA**: Ausencia autorizada que tiene al menos una guardia asociada.
- **RECHAZADA**: Ausencia no autorizada.
- **ANULADA**: Ausencia cancelada por el administrador.

### Usuarios
- **INACTIVO**: Usuario creado pero no puede acceder al sistema.
- **ACTIVO**: Usuario puede acceder y utilizar el sistema.

## Relación entre Ausencias y Guardias

```mermaid
stateDiagram-v2
    direction LR
    
    state Ausencia {
        [*] --> PENDIENTE
        PENDIENTE --> ACEPTADA: Admin acepta
        ACEPTADA --> PENDIENTE: Guardia anulada
        PENDIENTE --> RECHAZADA
        PENDIENTE --> ANULADA
    }
    
    state Guardia {
        [*] --> PENDIENTE
        PENDIENTE --> ASIGNADA: Profesor se asigna
        ASIGNADA --> FIRMADA: Profesor firma
        PENDIENTE --> ANULADA: Admin anula
        ASIGNADA --> ANULADA: Admin anula
        ASIGNADA --> PENDIENTE: Quitar profesor
    }
    
    Ausencia_ACEPTADA --> Guardia_PENDIENTE: Genera
    Guardia_ANULADA --> Ausencia_PENDIENTE: Retorna a
    
    note right of Ausencia
      Una ausencia ACEPTADA siempre tiene
      al menos una guardia asociada.
    end note
    
    note left of Guardia
      Una guardia puede existir sin ausencia
      (creada manualmente) o estar asociada
      a una ausencia.
    end note
``` 