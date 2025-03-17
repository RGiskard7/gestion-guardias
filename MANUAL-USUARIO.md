# Manual de Usuario - Sistema de Gestión de Guardias

## Índice
- [Manual de Usuario - Sistema de Gestión de Guardias](#manual-de-usuario---sistema-de-gestión-de-guardias)
  - [Índice](#índice)
  - [Introducción](#introducción)
  - [Requisitos del Sistema](#requisitos-del-sistema)
  - [Acceso al Sistema](#acceso-al-sistema)
  - [Interfaz General](#interfaz-general)
  - [Funcionalidades para Profesores](#funcionalidades-para-profesores)
    - [Dashboard del Profesor](#dashboard-del-profesor)
    - [Mi Horario](#mi-horario)
    - [Mis Ausencias](#mis-ausencias)
    - [Guardias Pendientes](#guardias-pendientes)
    - [Firmar Guardia](#firmar-guardia)
  - [Funcionalidades para Administradores](#funcionalidades-para-administradores)
    - [Dashboard del Administrador](#dashboard-del-administrador)
    - [Gestión de Usuarios](#gestión-de-usuarios)
    - [Gestión de Horarios](#gestión-de-horarios)
    - [Gestión de Lugares](#gestión-de-lugares)
    - [Gestión de Guardias](#gestión-de-guardias)
    - [Gestión de Ausencias](#gestión-de-ausencias)
    - [Estadísticas](#estadísticas)
  - [Sala de Guardias](#sala-de-guardias)
  - [Modo Oscuro](#modo-oscuro)
  - [Preguntas Frecuentes](#preguntas-frecuentes)
    - [¿Cómo puedo cambiar mi contraseña?](#cómo-puedo-cambiar-mi-contraseña)
    - [¿Puedo registrarme en el sistema por mi cuenta?](#puedo-registrarme-en-el-sistema-por-mi-cuenta)
    - [¿Cuántas guardias puedo realizar por semana?](#cuántas-guardias-puedo-realizar-por-semana)
    - [¿Puedo cancelar una ausencia ya registrada?](#puedo-cancelar-una-ausencia-ya-registrada)
    - [¿Cómo puedo ver las tareas asignadas para una guardia?](#cómo-puedo-ver-las-tareas-asignadas-para-una-guardia)
  - [Solución de Problemas](#solución-de-problemas)
    - [No puedo iniciar sesión](#no-puedo-iniciar-sesión)
    - [No veo todas las funcionalidades descritas en este manual](#no-veo-todas-las-funcionalidades-descritas-en-este-manual)
    - [El sistema se muestra incorrectamente en mi dispositivo](#el-sistema-se-muestra-incorrectamente-en-mi-dispositivo)
    - [He encontrado un error en el sistema](#he-encontrado-un-error-en-el-sistema)

## Introducción

El Sistema de Gestión de Guardias es una aplicación web diseñada para facilitar la gestión de guardias y ausencias en centros educativos. Permite a los profesores registrar sus ausencias, ver su horario de guardias, firmar guardias realizadas y consultar guardias pendientes. Los administradores pueden gestionar usuarios, horarios, lugares, guardias y ausencias, así como visualizar estadísticas del sistema.

Este manual proporciona instrucciones detalladas sobre cómo utilizar todas las funcionalidades del sistema, tanto para profesores como para administradores.

![Imagen de la pantalla principal del sistema](ruta/a/imagen-principal.png)
*Imagen 1: Pantalla principal del Sistema de Gestión de Guardias mostrando el dashboard con las principales funcionalidades.*

## Requisitos del Sistema

Para utilizar el Sistema de Gestión de Guardias, necesitará:

- Un dispositivo con conexión a Internet (ordenador, tablet o smartphone)
- Un navegador web actualizado (recomendamos Chrome, Firefox, Safari o Edge en sus últimas versiones)
- Credenciales de acceso proporcionadas por el administrador del sistema

El sistema es completamente responsive, por lo que se adapta a diferentes tamaños de pantalla y puede utilizarse tanto en dispositivos de escritorio como en dispositivos móviles.

## Acceso al Sistema

Para acceder al Sistema de Gestión de Guardias:

1. Abra su navegador web y vaya a la URL del sistema proporcionada por su centro educativo.
2. En la pantalla de inicio de sesión, introduzca su dirección de correo electrónico y contraseña.
3. Haga clic en el botón "Iniciar Sesión".

![Imagen de la pantalla de inicio de sesión](ruta/a/imagen-login.png)
*Imagen 2: Pantalla de inicio de sesión donde debe introducir sus credenciales.*

Si ha olvidado su contraseña, póngase en contacto con el administrador del sistema para restablecerla.

## Interfaz General

Una vez que haya iniciado sesión, verá la interfaz principal del sistema, que consta de los siguientes elementos:

- **Barra de navegación superior**: Muestra su nombre de usuario, rol en el sistema y el botón para cambiar entre modo claro y oscuro.
- **Menú lateral**: Contiene enlaces a todas las funcionalidades disponibles según su rol (profesor o administrador).
- **Área de contenido principal**: Muestra la información y formularios correspondientes a la sección seleccionada.

En dispositivos móviles, el menú lateral se oculta y se puede acceder a él mediante el botón de menú en la barra de navegación superior.

![Imagen de la interfaz general](ruta/a/imagen-interfaz.png)
*Imagen 3: Interfaz general del sistema mostrando la barra de navegación, el menú lateral y el área de contenido principal.*

## Funcionalidades para Profesores

### Dashboard del Profesor

El Dashboard del Profesor es la pantalla principal que verá al iniciar sesión como profesor. Proporciona una visión general de:

- Guardias pendientes para el día actual
- Guardias asignadas pendientes de firma
- Ausencias registradas recientemente
- Estadísticas personales de guardias realizadas

![Imagen del dashboard del profesor](ruta/a/imagen-dashboard-profesor.png)
*Imagen 4: Dashboard del profesor mostrando información resumida de guardias y ausencias.*

### Mi Horario

La sección "Mi Horario" permite a los profesores visualizar su horario semanal, incluyendo:

- Horario de disponibilidad para guardias
- Guardias asignadas para la semana actual

Para utilizar esta funcionalidad:

1. Acceda a la sección "Mi Horario" desde el menú lateral.
2. Verá una vista semanal de su horario con dos modos de visualización:
   - **Disponibilidad**: Muestra los tramos horarios en los que está disponible para realizar guardias.
   - **Guardias Asignadas**: Muestra las guardias que tiene asignadas para la semana actual.
3. Utilice los botones de navegación para cambiar de semana.

![Imagen de la sección Mi Horario](ruta/a/imagen-mi-horario.png)
*Imagen 5: Sección "Mi Horario" mostrando la vista semanal con disponibilidad y guardias asignadas.*

### Mis Ausencias

La sección "Mis Ausencias" permite a los profesores registrar y gestionar sus ausencias. Para registrar una nueva ausencia:

1. Acceda a la sección "Mis Ausencias" desde el menú lateral.
2. Haga clic en el botón "Nueva Ausencia".
3. Complete el formulario con la siguiente información:
   - **Fecha**: Seleccione la fecha de la ausencia.
   - **Tramo Horario**: Seleccione el tramo horario o "Todo el día" para ausentarse durante toda la jornada.
   - **Observaciones**: Añada cualquier información relevante sobre la ausencia.
   - **Tarea para los alumnos**: Describa la tarea que deben realizar los alumnos durante su ausencia.
4. Haga clic en "Guardar" para registrar la ausencia.

También puede ver el historial de sus ausencias, incluyendo su estado (Pendiente, Aceptada o Rechazada).

![Imagen de la sección Mis Ausencias](ruta/a/imagen-mis-ausencias.png)
*Imagen 6: Sección "Mis Ausencias" mostrando el formulario para registrar una nueva ausencia y el historial de ausencias.*

### Guardias Pendientes

La sección "Guardias Pendientes" muestra las guardias disponibles para ser cubiertas. Los profesores pueden asignarse a sí mismos una guardia si cumplen con los requisitos necesarios:

1. Acceda a la sección "Guardias Pendientes" desde el menú lateral.
2. Verá una lista de guardias pendientes para el día actual, incluyendo:
   - Profesor ausente
   - Tramo horario
   - Lugar
   - Tipo de guardia
3. Para asignarse una guardia, haga clic en el botón "Asignarme" junto a la guardia correspondiente.

El sistema verificará automáticamente si cumple con los requisitos para realizar la guardia:
- Debe tener disponibilidad en ese tramo horario
- No debe tener otra guardia asignada en el mismo tramo
- No debe exceder el límite de guardias semanales (6 guardias por semana)

![Imagen de la sección Guardias Pendientes](ruta/a/imagen-guardias-pendientes.png)
*Imagen 7: Sección "Guardias Pendientes" mostrando la lista de guardias disponibles para ser cubiertas.*

### Firmar Guardia

La sección "Firmar Guardia" permite a los profesores firmar las guardias que han realizado:

1. Acceda a la sección "Firmar Guardia" desde el menú lateral.
2. Verá una lista de guardias asignadas pendientes de firma.
3. Para firmar una guardia, haga clic en el botón "Firmar" junto a la guardia correspondiente.
4. Complete el formulario con las observaciones sobre la guardia realizada.
5. Haga clic en "Confirmar" para firmar la guardia.

Una vez firmada, la guardia pasará al estado "Firmada" y se registrará la fecha y hora de la firma.

![Imagen de la sección Firmar Guardia](ruta/a/imagen-firmar-guardia.png)
*Imagen 8: Sección "Firmar Guardia" mostrando la lista de guardias pendientes de firma y el formulario para firmar una guardia.*

## Funcionalidades para Administradores

### Dashboard del Administrador

El Dashboard del Administrador proporciona una visión general del sistema, incluyendo:

- Guardias pendientes para el día actual
- Ausencias pendientes de aprobación
- Estadísticas generales del sistema
- Actividad reciente

![Imagen del dashboard del administrador](ruta/a/imagen-dashboard-admin.png)
*Imagen 9: Dashboard del administrador mostrando información resumida del sistema.*

### Gestión de Usuarios

La sección "Usuarios" permite a los administradores gestionar los usuarios del sistema:

1. Acceda a la sección "Usuarios" desde el menú lateral.
2. Verá una lista de todos los usuarios registrados en el sistema.
3. Para añadir un nuevo usuario, haga clic en el botón "Nuevo Usuario" y complete el formulario con la siguiente información:
   - **Nombre**: Nombre completo del usuario.
   - **Email**: Dirección de correo electrónico (se utilizará como nombre de usuario).
   - **Rol**: Seleccione "Administrador" o "Profesor".
   - **Activo**: Indique si el usuario está activo en el sistema.
4. Para editar un usuario existente, haga clic en el botón "Editar" junto al usuario correspondiente.
5. Para desactivar un usuario, haga clic en el botón "Desactivar" junto al usuario correspondiente.

![Imagen de la sección Usuarios](ruta/a/imagen-usuarios.png)
*Imagen 10: Sección "Usuarios" mostrando la lista de usuarios y el formulario para añadir/editar un usuario.*

### Gestión de Horarios

La sección "Horarios" permite a los administradores gestionar los horarios de disponibilidad de los profesores para realizar guardias:

1. Acceda a la sección "Horarios" desde el menú lateral.
2. Seleccione un profesor de la lista desplegable para ver su horario actual.
3. Para añadir un nuevo tramo horario, haga clic en el botón "Nuevo Tramo" y complete el formulario con la siguiente información:
   - **Día de la semana**: Seleccione el día (Lunes a Viernes).
   - **Tramo Horario**: Seleccione el tramo horario (1ª hora, 2ª hora, etc.).
4. Para eliminar un tramo horario, haga clic en el botón "Eliminar" junto al tramo correspondiente.

![Imagen de la sección Horarios](ruta/a/imagen-horarios.png)
*Imagen 11: Sección "Horarios" mostrando el horario de un profesor y el formulario para añadir un nuevo tramo horario.*

### Gestión de Lugares

La sección "Lugares" permite a los administradores gestionar los lugares donde se realizan las guardias:

1. Acceda a la sección "Lugares" desde el menú lateral.
2. Verá una lista de todos los lugares registrados en el sistema.
3. Para añadir un nuevo lugar, haga clic en el botón "Nuevo Lugar" y complete el formulario con la siguiente información:
   - **Código**: Código identificativo del lugar (por ejemplo, "A101").
   - **Descripción**: Descripción detallada del lugar.
   - **Tipo de Lugar**: Seleccione el tipo de lugar (Aula, Patio, Laboratorio, etc.).
4. Para editar un lugar existente, haga clic en el botón "Editar" junto al lugar correspondiente.
5. Para eliminar un lugar, haga clic en el botón "Eliminar" junto al lugar correspondiente.

![Imagen de la sección Lugares](ruta/a/imagen-lugares.png)
*Imagen 12: Sección "Lugares" mostrando la lista de lugares y el formulario para añadir/editar un lugar.*

### Gestión de Guardias

La sección "Guardias" permite a los administradores gestionar todas las guardias del sistema:

1. Acceda a la sección "Guardias" desde el menú lateral.
2. Verá una lista de todas las guardias registradas en el sistema, con opciones de filtrado por fecha, estado y profesor.
3. Para añadir una nueva guardia manualmente, haga clic en el botón "Nueva Guardia" y complete el formulario con la siguiente información:
   - **Fecha**: Seleccione la fecha de la guardia.
   - **Tramo Horario**: Seleccione el tramo horario.
   - **Tipo de Guardia**: Seleccione el tipo de guardia (Aula, Patio, Recreo).
   - **Lugar**: Seleccione el lugar donde se realizará la guardia.
   - **Profesor Cubridor**: Seleccione el profesor que realizará la guardia (opcional).
   - **Observaciones**: Añada cualquier información relevante sobre la guardia.
4. Para editar una guardia existente, haga clic en el botón "Editar" junto a la guardia correspondiente.
5. Para anular una guardia, haga clic en el botón "Anular" junto a la guardia correspondiente.

![Imagen de la sección Guardias](ruta/a/imagen-guardias.png)
*Imagen 13: Sección "Guardias" mostrando la lista de guardias y el formulario para añadir/editar una guardia.*

### Gestión de Ausencias

La sección "Ausencias" permite a los administradores gestionar todas las ausencias del sistema:

1. Acceda a la sección "Ausencias" desde el menú lateral.
2. Verá una lista de todas las ausencias registradas en el sistema, con opciones de filtrado por estado, profesor y fecha.
3. Para añadir una nueva ausencia, haga clic en el botón "Nueva Ausencia" y complete el formulario con la siguiente información:
   - **Profesor**: Seleccione el profesor que se ausentará.
   - **Fecha**: Seleccione la fecha de la ausencia.
   - **Tramo Horario**: Seleccione el tramo horario.
   - **Estado**: Seleccione el estado de la ausencia (Pendiente, Aceptada, Rechazada).
   - **Tarea para los alumnos**: Describa la tarea que deben realizar los alumnos durante la ausencia.
   - **Observaciones**: Añada cualquier información relevante sobre la ausencia.
4. Para editar una ausencia existente, haga clic en el botón "Editar" junto a la ausencia correspondiente.
5. Para aceptar una ausencia pendiente, haga clic en el botón "Aceptar" y complete el formulario para crear la guardia asociada.
6. Para rechazar una ausencia pendiente, haga clic en el botón "Rechazar" e indique el motivo del rechazo.
7. Para anular una ausencia, haga clic en el botón "Anular" e indique el motivo de la anulación.

![Imagen de la sección Ausencias](ruta/a/imagen-ausencias.png)
*Imagen 14: Sección "Ausencias" mostrando la lista de ausencias y el formulario para añadir/editar una ausencia.*

### Estadísticas

La sección "Estadísticas" proporciona información estadística sobre el sistema:

1. Acceda a la sección "Estadísticas" desde el menú lateral.
2. Verá diferentes gráficos y tablas con información estadística, incluyendo:
   - Número de guardias por estado
   - Número de ausencias por estado
   - Guardias realizadas por profesor
   - Ausencias registradas por profesor
   - Distribución de guardias por día de la semana y tramo horario

![Imagen de la sección Estadísticas](ruta/a/imagen-estadisticas.png)
*Imagen 15: Sección "Estadísticas" mostrando gráficos y tablas con información estadística del sistema.*

## Sala de Guardias

La "Sala de Guardias" es una pantalla diseñada para ser mostrada en un monitor en la sala de profesores, mostrando información en tiempo real sobre las guardias pendientes y asignadas para el día actual:

1. Acceda a la sección "Sala de Guardias" desde el menú lateral (disponible tanto para profesores como para administradores).
2. Verá una pantalla dividida en dos secciones:
   - **Guardias Pendientes**: Muestra las guardias que aún no tienen un profesor asignado.
   - **Guardias Asignadas**: Muestra las guardias que ya tienen un profesor asignado.
3. La información se actualiza automáticamente cada minuto.

Esta pantalla está diseñada para ser visualizada a distancia, por lo que utiliza colores y tamaños de fuente que facilitan su lectura.

![Imagen de la Sala de Guardias](ruta/a/imagen-sala-guardias.png)
*Imagen 16: Pantalla "Sala de Guardias" mostrando las guardias pendientes y asignadas para el día actual.*

## Modo Oscuro

El sistema incluye un modo oscuro que reduce la fatiga visual y el consumo de batería en dispositivos móviles:

1. Para activar o desactivar el modo oscuro, haga clic en el botón de cambio de tema en la barra de navegación superior.
2. El sistema recordará su preferencia para futuras sesiones.
3. El modo oscuro se aplicará a todas las pantallas del sistema.

![Imagen del sistema en modo oscuro](ruta/a/imagen-modo-oscuro.png)
*Imagen 17: Sistema de Gestión de Guardias en modo oscuro.*

## Preguntas Frecuentes

### ¿Cómo puedo cambiar mi contraseña?
Actualmente, el sistema no permite a los usuarios cambiar su contraseña directamente. Si necesita cambiar su contraseña, póngase en contacto con el administrador del sistema.

### ¿Puedo registrarme en el sistema por mi cuenta?
No, los usuarios deben ser creados por un administrador del sistema. Si necesita acceso al sistema, póngase en contacto con el administrador de su centro educativo.

### ¿Cuántas guardias puedo realizar por semana?
El sistema limita a 6 el número de guardias que un profesor puede realizar por semana. Este límite se aplica automáticamente al intentar asignarse a una guardia.

### ¿Puedo cancelar una ausencia ya registrada?
Los profesores no pueden cancelar ausencias una vez registradas. Si necesita cancelar una ausencia, póngase en contacto con un administrador del sistema.

### ¿Cómo puedo ver las tareas asignadas para una guardia?
Al ver los detalles de una guardia, podrá ver las tareas asignadas en el campo "Tareas". También puede ver esta información en la sección "Guardias Pendientes" o "Firmar Guardia".

## Solución de Problemas

### No puedo iniciar sesión
- Verifique que está introduciendo correctamente su dirección de correo electrónico y contraseña.
- Compruebe que su cuenta está activa en el sistema.
- Borre la caché del navegador y vuelva a intentarlo.
- Si el problema persiste, póngase en contacto con el administrador del sistema.

### No veo todas las funcionalidades descritas en este manual
- Las funcionalidades disponibles dependen de su rol en el sistema (profesor o administrador).
- Verifique que está utilizando la última versión del sistema.
- Si cree que debería tener acceso a una funcionalidad que no ve, póngase en contacto con el administrador del sistema.

### El sistema se muestra incorrectamente en mi dispositivo
- Asegúrese de que está utilizando un navegador web actualizado.
- Pruebe a acceder desde otro dispositivo o navegador.
- Si el problema persiste, póngase en contacto con el administrador del sistema.

### He encontrado un error en el sistema
Si encuentra un error o comportamiento inesperado en el sistema, por favor:
1. Anote los pasos exactos que realizó antes de encontrar el error.
2. Capture una imagen de la pantalla que muestra el error (si es posible).
3. Anote cualquier mensaje de error que aparezca.
4. Póngase en contacto con el administrador del sistema proporcionando esta información.

---

Este manual ha sido creado para el Sistema de Gestión de Guardias versión 1.0.0. Para obtener la versión más reciente de este manual o para cualquier consulta adicional, póngase en contacto con el administrador del sistema. 