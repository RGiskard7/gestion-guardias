# Diagramas de Estados del Sistema

Este documento describe los diferentes estados y transiciones posibles para los elementos principales del sistema.

## Índice
1. [Estados de Guardias](#estados-de-guardias)
2. [Estados de Ausencias](#estados-de-ausencias)
3. [Estados de Usuarios](#estados-de-usuarios)

## Estados de Guardias

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE: Creación automática\npor ausencia
    PENDIENTE --> ASIGNADA: Profesor acepta\ncubrir guardia
    ASIGNADA --> COMPLETADA: Profesor firma\nla guardia
    PENDIENTE --> ANULADA: Admin anula guardia\no ausencia anulada
    ASIGNADA --> ANULADA: Admin anula guardia\no ausencia anulada
    ANULADA --> [*]
    COMPLETADA --> [*]

    state PENDIENTE {
        [*] --> Visible: Aparece en lista\nde guardias disponibles
        Visible --> EnEspera: Otro profesor\nintenta asignar
        EnEspera --> Visible: Timeout/Cancelación
    }

    state ASIGNADA {
        [*] --> EsperandoFirma: Hora de guardia\nno alcanzada
        EsperandoFirma --> ListaParaFirmar: Hora de guardia\nalcanzada
    }
```

## Estados de Ausencias

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE: Profesor registra\nausencia
    PENDIENTE --> APROBADA: Admin aprueba
    PENDIENTE --> RECHAZADA: Admin rechaza
    APROBADA --> ANULADA: Profesor/Admin anula
    APROBADA --> COMPLETADA: Todas las guardias\ncompletadas
    ANULADA --> [*]
    RECHAZADA --> [*]
    COMPLETADA --> [*]

    state APROBADA {
        [*] --> GenerandoGuardias: Sistema crea\nguardias
        GenerandoGuardias --> GuardiasCreadas: Guardias creadas\npara cada tramo
    }
```

## Estados de Usuarios

```mermaid
stateDiagram-v2
    [*] --> INACTIVO: Usuario creado
    INACTIVO --> ACTIVO: Admin activa
    ACTIVO --> INACTIVO: Admin desactiva
    ACTIVO --> BLOQUEADO: Múltiples intentos\nfallidos de login
    BLOQUEADO --> ACTIVO: Admin desbloquea
    INACTIVO --> [*]: Admin elimina
    
    state ACTIVO {
        [*] --> Normal
        Normal --> EnGuardia: Cubriendo guardia
        EnGuardia --> Normal: Guardia completada
    }
```

## Notas sobre los Estados

### Guardias
- **PENDIENTE**: La guardia está disponible para ser cubierta por cualquier profesor.
- **ASIGNADA**: Un profesor se ha comprometido a cubrir la guardia.
- **COMPLETADA**: La guardia ha sido realizada y firmada.
- **ANULADA**: La guardia ha sido cancelada (por anulación de ausencia o decisión administrativa).

### Ausencias
- **PENDIENTE**: Esperando aprobación administrativa.
- **APROBADA**: Ausencia autorizada, genera guardias automáticamente.
- **RECHAZADA**: Ausencia no autorizada.
- **ANULADA**: Ausencia cancelada (elimina o anula guardias asociadas).
- **COMPLETADA**: Todas las guardias asociadas han sido realizadas.

### Usuarios
- **INACTIVO**: Usuario creado pero no puede acceder al sistema.
- **ACTIVO**: Usuario puede acceder y utilizar el sistema.
- **BLOQUEADO**: Usuario temporalmente bloqueado por seguridad. 