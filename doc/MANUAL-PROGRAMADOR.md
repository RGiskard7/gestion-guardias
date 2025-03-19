# Manual del Programador - Sistema de Gestión de Guardias

## Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Comparativa con Java EE/Jakarta EE](#comparativa-con-java-eejakarta-ee)
4. [Tecnologías Utilizadas](#tecnologías-utilizadas)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Patrones de Diseño](#patrones-de-diseño)
7. [Acceso a Datos](#acceso-a-datos)
8. [Autenticación y Autorización](#autenticación-y-autorización)
9. [Gestión del Estado](#gestión-del-estado)
10. [Interfaz de Usuario](#interfaz-de-usuario)
11. [Ciclos de Vida y Flujos Clave](#ciclos-de-vida-y-flujos-clave)
12. [Testing](#testing)
13. [Despliegue](#despliegue)
14. [Bibliografía](#bibliografía)

## Introducción

El Sistema de Gestión de Guardias es una aplicación web moderna desarrollada utilizando tecnologías de última generación. Este manual está diseñado para ayudar a los desarrolladores, especialmente a aquellos familiarizados con Java y patrones tradicionales, a comprender la arquitectura y funcionamiento del sistema.

## Arquitectura del Sistema

### Visión General

El sistema sigue una arquitectura de capas moderna basada en componentes, similar a la arquitectura MVC tradicional pero adaptada al paradigma de desarrollo web actual:

```text
Frontend (Next.js/React)
├── Presentación (Componentes React)
├── Lógica de Negocio (Contexts/Hooks)
└── Acceso a Datos (Services)
    └── API Backend (Supabase)
```

### Comparativa con Java EE/Jakarta EE

Para facilitar la comprensión a desarrolladores con experiencia en Java EE/Jakarta EE y Spring, aquí se presenta una visión general de las equivalencias entre conceptos tradicionales y modernos:

| Java (Spring MVC)          | Next.js/React                    |
|---------------------------|----------------------------------|
| Controller                | Pages/API Routes                 |
| Service                   | Context/Hooks                    |
| DAO/Repository            | Services                         |
| JSP/Thymeleaf            | React Components                 |
| Entity                    | TypeScript Interfaces            |
| Spring Security           | Middleware + Supabase Auth       |
| JPA/Hibernate            | Supabase Client                  |

A continuación, se detalla cada una de estas equivalencias con ejemplos prácticos:

### Servlets vs API Routes

Los Servlets en Java EE manejan las peticiones HTTP de manera similar a cómo lo hacen las API Routes en Next.js:

```java
// Servlet en Java EE
@WebServlet("/api/guardias/*")
public class GuardiasServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
        throws ServletException, IOException {
        String id = request.getParameter("id");
        Guardia guardia = guardiaService.findById(id);
        response.setContentType("application/json");
        response.getWriter().write(convertToJson(guardia));
    }
}
```

Equivalente en Next.js:

```typescript
// app/api/guardias/[id]/route.ts
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const guardia = await getGuardia(params.id);
    return Response.json(guardia);
}
```

### JavaBeans vs React Components

Los JavaBeans se utilizaban para encapsular múltiples objetos en un componente reutilizable, similar a los componentes React:

```java
// JavaBean
public class GuardiaBean implements Serializable {
    private String profesor;
    private Date fecha;
    
    public GuardiaBean() {}
    
    public String getProfesor() { return profesor; }
    public void setProfesor(String profesor) { this.profesor = profesor; }
    
    public Date getFecha() { return fecha; }
    public void setFecha(Date fecha) { this.fecha = fecha; }
}
```

Equivalente en React:

```typescript
// GuardiaComponent.tsx
interface GuardiaProps {
    profesor: string;
    fecha: Date;
}

export const GuardiaComponent: React.FC<GuardiaProps> = ({ profesor, fecha }) => {
    return (
        <div className="guardia">
            <h3>{profesor}</h3>
            <p>{format(fecha, 'dd/MM/yyyy')}</p>
        </div>
    );
};
```

### JSP vs React Components

Las Java Server Pages (JSP) se utilizaban para generar HTML dinámicamente, similar a los componentes React:

```jsp
<!-- guardia.jsp -->
<%@ page language="java" contentType="text/html; charset=UTF-8" %>
<div class="guardia">
    <h3><%= guardia.getProfesor() %></h3>
    <p><%= formatDate(guardia.getFecha()) %></p>
    <c:if test="${guardia.estado == 'PENDIENTE'}">
        <button onclick="asignarGuardia(${guardia.id})">
            Asignar
        </button>
    </c:if>
</div>
```

Equivalente en React:

```typescript
// GuardiaCard.tsx
export const GuardiaCard: React.FC<GuardiaProps> = ({ guardia }) => {
    const { asignarGuardia } = useGuardias();
    
    return (
        <div className="guardia">
            <h3>{guardia.profesor}</h3>
            <p>{format(guardia.fecha, 'dd/MM/yyyy')}</p>
            {guardia.estado === 'PENDIENTE' && (
                <Button onClick={() => asignarGuardia(guardia.id)}>
                    Asignar
                </Button>
            )}
        </div>
    );
};
```

### Filters vs Middleware

Los Filters en Java EE son similares al middleware en Next.js:

```java
// Filter en Java EE
@WebFilter("/*")
public class AuthenticationFilter implements Filter {
    public void doFilter(ServletRequest request, ServletResponse response,
            FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpSession session = req.getSession(false);
        
        if (session == null || session.getAttribute("user") == null) {
            ((HttpServletResponse) response).sendRedirect("/login");
            return;
        }
        chain.doFilter(request, response);
    }
}
```

Equivalente en Next.js:

```typescript
// middleware.ts
export default async function middleware(req: NextRequest) {
    const session = await getSession();
    
    if (!session) {
        return NextResponse.redirect(new URL('/login', req.url));
    }
    
    return NextResponse.next();
}
```

### EJB vs Context API

Los Enterprise JavaBeans (EJB) proporcionaban una forma de manejar la lógica de negocio y el estado, similar a como lo hace el Context API en React:

```java
// EJB Stateful Session Bean
@Stateful
public class GuardiasManagerEJB {
    private List<Guardia> guardiasActivas;
    
    public void addGuardia(Guardia guardia) {
        guardiasActivas.add(guardia);
    }
    
    public List<Guardia> getGuardiasActivas() {
        return guardiasActivas;
    }
}
```

Equivalente usando Context API:

```typescript
// GuardiasContext.tsx
export const GuardiasContext = createContext<GuardiasContextType>({});

export const GuardiasProvider: React.FC = ({ children }) => {
    const [guardiasActivas, setGuardiasActivas] = useState<Guardia[]>([]);
    
    const addGuardia = (guardia: Guardia) => {
        setGuardiasActivas(prev => [...prev, guardia]);
    };
    
    return (
        <GuardiasContext.Provider value={{ guardiasActivas, addGuardia }}>
            {children}
        </GuardiasContext.Provider>
    );
};
```

## Tecnologías Utilizadas

### Frontend
- **Next.js 15.1.0**: Framework de React que proporciona renderizado del lado del servidor (SSR) y generación de sitios estáticos (SSG).
  - Equivalente en Java: Spring MVC con Thymeleaf
- **React 19**: Biblioteca para construir interfaces de usuario.
  - Equivalente en Java: JSP/JSF
- **TypeScript**: Superset tipado de JavaScript.
  - Equivalente en Java: Java (ambos son lenguajes tipados)
- **Bootstrap 5.3.2**: Framework CSS para diseño responsive.
  - Equivalente en Java: Similar a usar Bootstrap con Spring

### Backend
- **Supabase**: Plataforma de backend como servicio (BaaS).
  - Equivalente en Java: Spring Boot + PostgreSQL + Spring Security

### Herramientas de Desarrollo
- **npm**: Gestor de paquetes.
  - Equivalente en Java: Maven/Gradle
- **ESLint**: Analizador de código.
  - Equivalente en Java: SonarQube/CheckStyle

## Estructura del Proyecto

### Organización de Carpetas

```text
gestion-guardias/
├── app/                    # Páginas y rutas (similar a Controllers en Spring)
├── components/            # Componentes React reutilizables
├── lib/                   # Servicios y utilidades (similar a Services en Spring)
├── src/
│   └── contexts/         # Gestión del estado global
├── public/               # Archivos estáticos
└── doc/                  # Documentación
```

### Ejemplo de Estructura de Componente

```typescript
// Componente React (similar a un Controller en Spring)
import React from 'react';
import { useGuardias } from '@/contexts/GuardiasContext';

interface GuardiaProps {
    id: number;
    fecha: Date;
}

export const GuardiaComponent: React.FC<GuardiaProps> = ({ id, fecha }) => {
    const { getGuardia, updateGuardia } = useGuardias();
    // ... resto del código
};
```

Equivalente en Java (Spring MVC):

```java
@Controller
@RequestMapping("/guardias")
public class GuardiaController {
    @Autowired
    private GuardiaService guardiaService;
    
    @GetMapping("/{id}")
    public String getGuardia(@PathVariable Long id, Model model) {
        // ... código similar
    }
}
```

## Patrones de Diseño

### Context API (Gestión del Estado)
Similar al patrón Singleton en Java, pero para estado global en React:

```typescript
// GuardiasContext.tsx
export const GuardiasContext = createContext<GuardiasContextType>({});

export const GuardiasProvider: React.FC = ({ children }) => {
    // ... lógica del contexto
};
```

Equivalente en Java:

```java
// Singleton en Java
public class GuardiasManager {
    private static GuardiasManager instance;
    
    private GuardiasManager() {}
    
    public static GuardiasManager getInstance() {
        if (instance == null) {
            instance = new GuardiasManager();
        }
        return instance;
    }
}
```

### Flujos de Trabajo y Ciclos de Vida

El sistema implementa flujos de trabajo complejos para la gestión de ausencias y guardias, siguiendo un patrón similar a una máquina de estados:

#### Ciclo de Vida de una Ausencia

```typescript
// Ejemplo de estados y transiciones en AusenciasContext.tsx
enum EstadoAusencia {
    PENDIENTE = "Pendiente",
    ACEPTADA = "Aceptada",
    RECHAZADA = "Rechazada"
}

// Al aceptar una ausencia
const acceptAusencia = async (ausenciaId: number, tipoGuardia: string, lugarId: number) => {
    await updateAusencia(ausenciaId, { estado: EstadoAusencia.ACEPTADA });
    // Tras aceptar, se crea automáticamente una guardia
    await createGuardia({ 
        /* datos de la guardia */ 
        ausenciaId: ausenciaId 
    });
};

// Al rechazar una ausencia
const rejectAusencia = async (ausenciaId: number, motivo?: string) => {
    await updateAusencia(ausenciaId, { 
        estado: EstadoAusencia.RECHAZADA,
        observaciones: motivo
    });
};
```

#### Ciclo de Vida de una Guardia

```typescript
// Ejemplo de estados y transiciones en GuardiasContext.tsx
enum EstadoGuardia {
    PENDIENTE = "Pendiente",
    ASIGNADA = "Asignada",
    FIRMADA = "Firmada",
    ANULADA = "Anulada"
}

// Al anular una guardia que tiene una ausencia asociada
const anularGuardia = async (guardiaId: number, motivo: string) => {
    const guardia = guardias.find(g => g.id === guardiaId);
    if (!guardia) return false;
    
    // Si la guardia tiene una ausencia asociada, actualizar su estado
    if (guardia.ausenciaId) {
        await updateAusenciaService(guardia.ausenciaId, { 
            estado: "Pendiente",
            observaciones: `Original: ${ausencia.observaciones}. Guardia anulada: ${motivo}`
        });
    }
    
    // Actualizar la guardia
    await updateGuardiaService(guardiaId, {
        estado: EstadoGuardia.ANULADA,
        ausencia_id: undefined,
        observaciones: `${guardia.observaciones} | ANULADA: ${motivo}`
    });
    
    // Actualizar los estados locales
    refreshGuardias();
    refreshAusencias();
    
    return true;
};
```

Equivalente en Java (Patrón State):

```java
// Enum de estados
public enum EstadoAusencia {
    PENDIENTE, ACEPTADA, RECHAZADA
}

// Clase de servicio con métodos de transición
@Service
public class AusenciaService {
    @Transactional
    public void aceptarAusencia(Long ausenciaId, String tipoGuardia, Long lugarId) {
        Ausencia ausencia = ausenciaRepository.findById(ausenciaId)
            .orElseThrow(() -> new EntityNotFoundException());
        ausencia.setEstado(EstadoAusencia.ACEPTADA);
        ausenciaRepository.save(ausencia);
        
        // Crear guardia asociada
        Guardia guardia = new Guardia();
        guardia.setAusenciaId(ausenciaId);
        // Setear demás campos
        guardiaRepository.save(guardia);
    }
}
```

### Manejo de Observaciones y Trazabilidad

El sistema mantiene un historial de cambios mediante la actualización de observaciones, similar al patrón Decorator en Java:

```typescript
// Ejemplo del patrón en anularGuardia
const anularGuardia = async (guardiaId: number, motivo: string) => {
    // ...
    // Preservar las observaciones originales y añadir el motivo de anulación
    await updateGuardiaService(guardiaId, {
        observaciones: `${observacionesOriginales} | ANULADA: ${motivo}`
    });
    // ...
};
```

Equivalente en Java:

```java
@Transactional
public void anularGuardia(Long guardiaId, String motivo) {
    Guardia guardia = guardiaRepository.findById(guardiaId)
        .orElseThrow(() -> new EntityNotFoundException());
    
    // Preservar observaciones originales
    String observacionesActualizadas = guardia.getObservaciones() + " | ANULADA: " + motivo;
    guardia.setObservaciones(observacionesActualizadas);
    guardia.setEstado(EstadoGuardia.ANULADA);
    
    guardiaRepository.save(guardia);
}
```

### Servicios (Capa de Acceso a Datos)
Similar al patrón DAO en Java:

```typescript
// guardiasService.ts
export class GuardiasService {
    async getGuardia(id: number): Promise<Guardia> {
        const { data, error } = await supabase
            .from('Guardias')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        return data;
    }
}
```

Equivalente en Java (DAO):

```java
@Repository
public class GuardiaDAO {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public Guardia getGuardia(Long id) {
        return jdbcTemplate.queryForObject(
            "SELECT * FROM Guardias WHERE id = ?",
            new Object[]{id},
            new GuardiaRowMapper()
        );
    }
}
```

## Acceso a Datos

### Supabase como ORM

Supabase proporciona una interfaz similar a un ORM para acceder a la base de datos PostgreSQL:

```typescript
// Consulta en Supabase
const { data, error } = await supabase
    .from('Guardias')
    .select(`
        id,
        fecha,
        tramo_horario,
        profesor_cubridor:Usuarios(nombre)
    `)
    .eq('estado', 'Pendiente');
```

Equivalente en Java (JPA):

```java
@Query("SELECT g FROM Guardia g JOIN FETCH g.profesorCubridor WHERE g.estado = :estado")
List<Guardia> findGuardiasPendientes(@Param("estado") String estado);
```

### Transacciones

Ejemplo de transacción en Supabase:

```typescript
const anularGuardia = async (guardiaId: number) => {
    const { data, error } = await supabase.rpc('anular_guardia', {
        p_guardia_id: guardiaId
    });
};
```

Equivalente en Java:

```java
@Transactional
public void anularGuardia(Long guardiaId) {
    Guardia guardia = guardiaRepository.findById(guardiaId)
        .orElseThrow(() -> new EntityNotFoundException());
    guardia.setEstado("ANULADA");
    guardiaRepository.save(guardia);
}
```

## Autenticación y Autorización

### Sistema de Autenticación

El sistema implementa un mecanismo de autenticación basado en cookies y localStorage, utilizando bcrypt para el hash de contraseñas y Supabase como backend:

```typescript
// Definición del servicio de autenticación (authService.ts)
export async function loginUser(email: string, password: string): Promise<boolean> {
  try {
    // Buscamos el usuario por su email
    const { data, error } = await supabase
      .from(getTableName('USUARIOS'))
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data || !data.activo) {
      return false;
    }
    
    // Verificamos la contraseña usando bcrypt
    const passwordValid = await bcrypt.compare(password, data.password);
    return passwordValid;
  } catch (error) {
    console.error('Error inesperado al verificar usuario:', error);
    return false;
  }
}

// Función para generar hash de contraseñas
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
```

La implementación utiliza el algoritmo bcrypt para el hash de contraseñas, que es una práctica moderna y segura que incluye:

1. **Función de derivación de clave (KDF)**: Bcrypt utiliza el algoritmo Blowfish para crear un hash de contraseña que es resistente a ataques de fuerza bruta.
2. **Salt aleatorio**: Cada contraseña incluye un salt único generado aleatoriamente, lo que evita que dos contraseñas idénticas generen el mismo hash.
3. **Factor de trabajo configurable**: El sistema utiliza un factor de trabajo de 10, que proporciona un buen equilibrio entre seguridad y rendimiento.

### Context API para Gestión de Sesiones

La gestión del estado de autenticación se realiza mediante el Context API de React, siguiendo un patrón similar al Provider-Consumer:

```typescript
// AuthContext.tsx
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    const userValid = await loginUser(email, password);
    
    if (!userValid) return false;
    
    // Obtenemos datos completos del usuario
    const { data } = await supabase
      .from(getTableName('USUARIOS'))
      .select('*')
      .eq('email', email)
      .single();
    
    // Almacenamos en localStorage y cookies para persistencia
    const userData: User = {...};
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
    
    return true;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    Cookies.remove("user");
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
```

Este enfoque proporciona varias ventajas:

1. **Estado global**: El estado de autenticación está disponible en toda la aplicación.
2. **Persistencia doble**: Almacena la sesión tanto en localStorage como en cookies, lo que permite:
   - Acceso desde JavaScript mediante localStorage
   - Verificación en el servidor mediante cookies para protección de rutas

### Middleware para Protección de Rutas

La protección de rutas se implementa mediante un middleware de Next.js que verifica la autenticación del usuario antes de permitir el acceso a rutas protegidas:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user')?.value;
  const isAuthPage = request.nextUrl.pathname === '/login';
  const user = userCookie ? JSON.parse(userCookie) : null;

  // Si no hay usuario y no estamos en login, redirigir a login
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si el usuario está autenticado y trata de acceder a login
  if (user && isAuthPage) {
    const redirectUrl = user.rol === 'admin' ? '/admin' : '/profesor';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Control de acceso basado en roles
  if (user) {
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isProfesorRoute = request.nextUrl.pathname.startsWith('/profesor');

    if (isAdminRoute && user.rol !== 'admin') {
      return NextResponse.redirect(new URL('/profesor', request.url));
    }

    if (isProfesorRoute && user.rol !== 'profesor') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}
```

El middleware implementa las siguientes funcionalidades:

1. **Verificación de autenticación**: Comprueba si existe la cookie de usuario antes de permitir el acceso a rutas protegidas.
2. **Redirección inteligente**: Redirige al usuario a la ruta correspondiente según su rol.
3. **Control de acceso basado en roles**: Restringe el acceso a áreas administrativas para usuarios sin el rol adecuado.
4. **Protección contra acceso no autorizado**: Evita que usuarios no autenticados accedan a rutas protegidas.

Esta implementación es equivalente a la configuración de Spring Security en Java:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .antMatchers("/login").permitAll()
                .antMatchers("/admin/**").hasRole("ADMIN")
                .antMatchers("/profesor/**").hasRole("PROFESOR")
                .anyRequest().authenticated()
            .and()
            .formLogin()
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard", true)
            .and()
            .logout()
                .logoutSuccessUrl("/login")
                .deleteCookies("JSESSIONID");
    }
}
```

### Flujo Completo de Autenticación

El flujo completo de autenticación sigue estos pasos:

1. **Inicio**: Usuario accede a una ruta protegida
2. **Middleware**: Verifica la existencia de la cookie de usuario
3. **Redirección**: Si no hay cookie, redirige al login
4. **Login**: Usuario introduce credenciales
5. **Verificación**: El sistema verifica las credenciales contra la base de datos
6. **Hash**: Compara la contraseña introducida con el hash almacenado usando bcrypt
7. **Sesión**: Si las credenciales son válidas, crea la sesión en cookies y localStorage
8. **Redirección**: Redirige al usuario a la página correspondiente según su rol
9. **Protección continua**: El middleware protege todas las rutas durante la navegación

Este enfoque proporciona un sistema de autenticación robusto y seguro, siguiendo las mejores prácticas actuales de seguridad web.

## Gestión del Estado

### Uso de Contexts y Hooks

Los Contexts en React son similares a los Servicios singleton en Spring:

```typescript
// Uso de Context
export const useGuardias = () => {
    const context = useContext(GuardiasContext);
    if (!context) {
        throw new Error('useGuardias debe usarse dentro de GuardiasProvider');
    }
    return context;
};
```

Equivalente en Java:

```java
@Service
@Scope("singleton")
public class GuardiasService {
    // Lógica del servicio
}
```

## Interfaz de Usuario

### Componentes Principales

La interfaz de usuario se construye mediante componentes React que encapsulan la lógica de presentación. Los principales componentes del sistema son:

#### Componentes Comunes
- `Sidebar.tsx`: Menú lateral para navegación principal.
- `Navbar.tsx`: Barra superior con acciones globales y perfil.
- `DataCard.tsx`: Contenedor con estilo para secciones de datos.
- `Pagination.tsx`: Control de paginación reutilizable.

#### Componentes de Negocio
- `HorarioSemanal.tsx`: Visualización del horario semanal.
- `GuardiaCard.tsx`: Tarjeta que muestra información de una guardia.
- `AusenciaForm.tsx`: Formulario para registro/edición de ausencias.

### Sistema de Pestañas de "Mis Guardias"

La página "Mis Guardias" implementa un sistema de pestañas para unificar la gestión de diferentes tipos de guardias:

```typescript
// app/profesor/mis-guardias/page.tsx
export default function MisGuardiasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'pendientes';

  // Lógica para cambiar de pestaña
  const handleTabChange = (tabName: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tabName);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="container py-4">
      <h1>Mis Guardias</h1>
      
      {/* Sistema de pestañas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${tab === 'pendientes' ? 'active' : ''}`}
            onClick={() => handleTabChange('pendientes')}
          >
            Guardias Pendientes
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${tab === 'generadas' ? 'active' : ''}`}
            onClick={() => handleTabChange('generadas')}
          >
            Guardias Generadas
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${tab === 'por-firmar' ? 'active' : ''}`}
            onClick={() => handleTabChange('por-firmar')}
          >
            Guardias por Firmar
          </button>
        </li>
      </ul>
      
      {/* Contenido de la pestaña activa */}
      {tab === 'pendientes' && <GuardiasPendientes />}
      {tab === 'generadas' && <GuardiasGeneradas />}
      {tab === 'por-firmar' && <GuardiasPorFirmar />}
    </div>
  );
}
```

Este sistema de pestañas implementa varias características importantes:

1. **Persistencia de estado mediante URL**: El parámetro `tab` en la URL permite que el estado de la pestaña activa persista entre recargas.
2. **Navegación sin recargas**: Utiliza el router de Next.js para cambiar entre pestañas sin recargar la página.
3. **Componentes específicos por pestaña**: Cada pestaña carga un componente especializado para ese tipo de guardias.

### Verificación de Disponibilidad de Profesores

Para la asignación de guardias, se implementa una función que verifica si un profesor tiene disponibilidad basada en su horario y otras guardias asignadas:

```typescript
// app/admin/guardias/page.tsx
const profesorTieneDisponibilidad = (profesorId: number, fecha: string, tramoHorario: string): boolean => {
  // Si estamos editando una guardia, el profesor cubridor actual siempre debe estar disponible
  if (editingId) {
    const guardiaActual = guardias.find(g => g.id === editingId);
    if (guardiaActual && guardiaActual.profesorCubridorId === profesorId) {
      return true; // El profesor actual siempre está disponible para la guardia que edita
    }
  }
  
  // Obtener el día de la semana (1-7, donde 1 es lunes y 7 es domingo)
  const fechaObj = new Date(fecha);
  const diaSemanaNumerico = fechaObj.getDay() || 7; // Si es domingo (0), convertirlo a 7
  
  // Solo considerar días laborables (lunes a viernes)
  if (diaSemanaNumerico > 5) {
    return false; // No hay disponibilidad en fin de semana
  }
  
  // Obtener el nombre del día a partir del número
  const nombreDiaSemana = DB_CONFIG.DIAS_SEMANA[diaSemanaNumerico - 1];
  
  // Verificar si el profesor tiene horario para ese día y tramo
  const tieneHorario = horarios.some(h => 
    h.profesorId === profesorId && 
    h.diaSemana === nombreDiaSemana && 
    h.tramoHorario === tramoHorario
  );
  
  // Si no tiene horario para este día y tramo, no está disponible
  if (!tieneHorario) {
    return false;
  }
  
  // Verificar si ya tiene una guardia asignada para esta fecha específica y tramo
  const tieneProgramada = guardias.some(g => 
    g.profesorCubridorId === profesorId && 
    g.fecha === fecha && 
    g.tramoHorario === tramoHorario &&
    g.id !== editingId && // Ignorar la guardia que estamos editando
    (g.estado === DB_CONFIG.ESTADOS_GUARDIA.ASIGNADA || g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA)
  );
  
  // Está disponible si no tiene otra guardia ya asignada
  return !tieneProgramada;
};
```

## Ciclos de Vida y Flujos Clave

### Ciclo de Vida de las Guardias

El sistema implementa un ciclo de vida bien definido para las guardias:

1. **Creación**: Una guardia puede crearse por dos vías:
   - **Automática**: Generada a partir de una ausencia aceptada
   - **Manual**: Creada directamente por un administrador

2. **Estados**: Una guardia puede pasar por los siguientes estados:
   - **PENDIENTE**: La guardia está disponible para ser cubierta
   - **ASIGNADA**: Un profesor se ha asignado para cubrir la guardia
   - **FIRMADA**: La guardia ha sido realizada y firmada por el profesor
   - **ANULADA**: La guardia ha sido cancelada

3. **Transiciones**:
   - PENDIENTE → ASIGNADA: Cuando un profesor se asigna a la guardia
   - ASIGNADA → FIRMADA: Cuando el profesor firma la guardia tras realizarla
   - PENDIENTE → ANULADA: Cuando un administrador anula la guardia
   - ASIGNADA → ANULADA: Cuando un administrador anula la guardia
   - ASIGNADA → PENDIENTE: Cuando se quita el profesor cubridor

4. **Validaciones**:
   - Solo se muestran guardias pendientes a profesores con horario compatible
   - Una guardia firmada no puede ser anulada
   - Solo las guardias anuladas pueden ser eliminadas permanentemente

### Ciclo de Vida de las Ausencias

Las ausencias siguen este ciclo de vida:

1. **Creación**: Por el profesor que se ausentará o por el administrador

2. **Estados**:
   - **PENDIENTE**: La ausencia está esperando aprobación
   - **ACEPTADA**: La ausencia ha sido aprobada y tiene una guardia asociada
   - **RECHAZADA**: La ausencia ha sido rechazada
   - **ANULADA**: La ausencia ha sido anulada por un administrador

3. **Transiciones**:
   - PENDIENTE → ACEPTADA: Cuando un administrador aprueba la ausencia (genera guardia)
   - PENDIENTE → RECHAZADA: Cuando un administrador rechaza la ausencia
   - ACEPTADA → PENDIENTE: Cuando se anula la guardia asociada
   - PENDIENTE → ANULADA: Cuando un administrador anula la ausencia

### Relación entre Guardias y Ausencias

La relación entre guardias y ausencias es una parte fundamental en el sistema, implementada mediante un flujo bien definido:

#### 1. Creación y Edición Inicial

- **Ausencia creada por profesor**: El profesor inicia el proceso creando una ausencia con todos los detalles necesarios, quedando en estado **PENDIENTE**.
- **Edición en estado inicial**: Mientras la ausencia está en estado PENDIENTE, el profesor puede modificar libremente todos sus campos o incluso anularla.

```typescript
// Ejemplo de creación de ausencia por un profesor
const createAusencia = async (ausenciaData: Omit<Ausencia, "id">) => {
  const { data, error } = await supabase
    .from('ausencias')
    .insert({
      ...ausenciaData,
      estado: DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE,
      fecha_creacion: new Date().toISOString(),
      profesor_id: currentUser.id
    });
  
  if (error) throw error;
  return data?.[0]?.id;
};
```

#### 2. Decisión del Administrador

- **Visualización**: El administrador visualiza todas las ausencias pendientes en su panel.
- **Aceptación**: Al aceptar una ausencia, se inicia un proceso automático:
  - La ausencia cambia a estado **ACEPTADA**
  - Se crea una guardia en estado **PENDIENTE** vinculada a la ausencia mediante el campo `ausencia_id`
  - El administrador puede configurar detalles adicionales de la guardia (tipo, lugar, observaciones)
- **Rechazo**: Si el administrador rechaza la ausencia, su estado cambia a **RECHAZADA** y finaliza el proceso.

```typescript
// Proceso de aceptación de ausencia por el administrador
const acceptAusencia = async (ausenciaId: number, guardiaDetails: GuardiaDetails) => {
  // 1. Actualizar estado de la ausencia
  await ausenciasService.updateAusencia(ausenciaId, {
    estado: DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA
  });
  
  // 2. Obtener datos de la ausencia para la guardia
  const ausencia = await ausenciasService.getAusenciaById(ausenciaId);
  
  // 3. Crear guardia asociada
  await guardiasService.createGuardia({
    fecha: ausencia.fecha,
    tramo_horario: ausencia.tramo_horario,
    tipo_guardia: guardiaDetails.tipo_guardia,
    lugar_id: guardiaDetails.lugar_id,
    estado: DB_CONFIG.ESTADOS_GUARDIA.PENDIENTE,
    observaciones: guardiaDetails.observaciones || '',
    ausencia_id: ausenciaId // Vinculación con la ausencia
  });
};
```

#### 3. Restricciones de Modificación en Estado Asociado

- **Campos inmutables**: Una vez que la ausencia está en estado **ACEPTADA** y vinculada a una guardia:
  - No se puede modificar la **fecha** ni el **tramo horario** en ninguna de las dos entidades
  - No se puede cambiar el **profesor** asociado a la ausencia
  - Otros campos (observaciones, tipo, lugar) sí pueden modificarse

```typescript
// Validación de campos inmutables al editar una ausencia con guardia asociada
const validateAusenciaEdit = (ausencia: Ausencia, newData: Partial<Ausencia>): boolean => {
  // Si la ausencia está aceptada (tiene guardia asociada)
  if (ausencia.estado === DB_CONFIG.ESTADOS_AUSENCIA.ACEPTADA) {
    // No permitir cambios en fecha, tramo o profesor
    if (
      (newData.fecha && newData.fecha !== ausencia.fecha) ||
      (newData.tramo_horario && newData.tramo_horario !== ausencia.tramo_horario) ||
      (newData.profesor_id && newData.profesor_id !== ausencia.profesor_id)
    ) {
      return false; // Cambios no permitidos
    }
  }
  return true; // Cambios permitidos
};
```

#### 4. Desasociación para Modificación Completa

- **Proceso de desasociación**: Si es necesario modificar completamente la información:
  - La guardia no debe estar en estado **FIRMADA**
  - El administrador puede desasociar la guardia estableciendo `ausencia_id = null`
  - Al desasociar, la ausencia vuelve a estado **PENDIENTE**
  - Ambas entidades pueden modificarse libremente

```typescript
// Desasociación de guardia y ausencia para modificación completa
const desasociarGuardiaDeAusencia = async (guardiaId: number): Promise<boolean> => {
  try {
    // Obtener la guardia actual
    const guardia = guardias.find(g => g.id === guardiaId);
    if (!guardia) {
      console.error("Guardia no encontrada");
      return false;
    }
    
    // Verificar que no esté firmada
    if (guardia.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA) {
      console.error("No se puede desasociar una guardia firmada");
      return false;
    }
    
    // Obtener la ausencia asociada
    const ausenciaId = guardia.ausencia_id;
    if (!ausenciaId) {
      console.info("La guardia no tiene ausencia asociada");
      return true; // No hay ausencia que desasociar
    }
    
    // Actualizar la guardia para eliminar la asociación
    await guardiasService.updateGuardia(guardiaId, {
      ...guardia,
      ausencia_id: null
    });
    
    // Actualizar la ausencia a estado PENDIENTE
    const ausencia = ausencias.find(a => a.id === ausenciaId);
    if (ausencia) {
      await ausenciasService.updateAusencia(ausenciaId, {
        ...ausencia,
        estado: DB_CONFIG.ESTADOS_AUSENCIA.PENDIENTE,
        observaciones: `${ausencia.observaciones} | Guardia desasociada manualmente`
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error al desasociar guardia de ausencia:", error);
    return false;
  }
};
```

#### 5. Proceso de Anulación

- **Anulación de entidad vinculada**: Tanto el profesor que creó la ausencia como el administrador pueden anular una ausencia si:
  - La guardia asociada no está en estado **FIRMADA**
- **Efecto cascada**:
  - Al anular la ausencia, la guardia asociada cambia automáticamente a estado **ANULADA**
  - Se registra el motivo de anulación en las observaciones de ambas entidades

```typescript
// Anulación de ausencia con efecto cascada sobre la guardia asociada
const anularAusencia = async (ausenciaId: number, motivo: string): Promise<boolean> => {
  try {
    // Obtener la ausencia
    const ausencia = ausencias.find(a => a.id === ausenciaId);
    if (!ausencia) {
      console.error("Ausencia no encontrada");
      return false;
    }
    
    // Buscar guardias asociadas a esta ausencia
    const guardiasAsociadas = guardias.filter(g => g.ausencia_id === ausenciaId);
    
    // Verificar que ninguna guardia asociada esté firmada
    if (guardiasAsociadas.some(g => g.estado === DB_CONFIG.ESTADOS_GUARDIA.FIRMADA)) {
      console.error("No se puede anular la ausencia porque tiene guardias firmadas");
      return false;
    }
    
    // Anular cada guardia asociada
    for (const guardia of guardiasAsociadas) {
      await guardiasService.updateGuardia(guardia.id, {
        ...guardia,
        estado: DB_CONFIG.ESTADOS_GUARDIA.ANULADA,
        observaciones: `${guardia.observaciones || ''} | ANULADA: ${motivo}`
      });
    }
    
    // Anular la ausencia
    await ausenciasService.updateAusencia(ausenciaId, {
      ...ausencia,
      estado: DB_CONFIG.ESTADOS_AUSENCIA.ANULADA,
      observaciones: `${ausencia.observaciones || ''} | ANULADA: ${motivo}`
    });
    
    return true;
  } catch (error) {
    console.error("Error al anular ausencia y guardias asociadas:", error);
    return false;
  }
};
```

#### 6. Resumen del Flujo Completo

El flujo completo entre ausencias y guardias puede representarse conceptualmente así:

```
Profesor crea ausencia → Ausencia PENDIENTE → Admin acepta → Ausencia ACEPTADA + Guardia PENDIENTE (vinculadas)
    → Profesor se asigna a guardia → Guardia ASIGNADA → Profesor firma → Guardia FIRMADA (irreversible)
    
Alternativas:
- Admin rechaza ausencia → Ausencia RECHAZADA (fin del proceso)
- Admin/Profesor anula ausencia → Ausencia ANULADA + Guardia ANULADA (si no está firmada)
- Admin desasocia guardia → Ausencia vuelve a PENDIENTE + Guardia independiente
```

Este diseño garantiza la integridad referencial y la trazabilidad entre ausencias y guardias, manteniendo un registro histórico completo mediante el uso de observaciones y preservando la relación entre ambas entidades a lo largo de todo su ciclo de vida.

## Testing

### Jest y React Testing Library

```typescript
// GuardiaCard.test.tsx
describe('GuardiaCard', () => {
    it('muestra la información de la guardia correctamente', () => {
        render(<GuardiaCard guardia={mockGuardia} />);
        expect(screen.getByText(mockGuardia.profesor)).toBeInTheDocument();
    });
});
```

Equivalente en Java (JUnit):

```java
@Test
public void testGuardiaInfo() {
    Guardia guardia = new Guardia();
    // ... configurar guardia
    assertEquals("Profesor", guardia.getProfesor());
}
```

## Despliegue

El sistema está configurado para desplegarse en plataformas modernas de hosting:

1. **Construcción**:
   ```bash
   npm run build
   ```
   Equivalente en Java: `mvn package`

2. **Despliegue**:
   - [Render](https://render.com/) para el frontend: [https://gestion-guardias.onrender.com/](https://gestion-guardias.onrender.com/)
   - [Supabase](https://supabase.com/) para el backend
   
   Equivalente en Java: Despliegue en Tomcat/WildFly

## Bibliografía

### Documentación Oficial
1. [Next.js Documentation](https://nextjs.org/docs)
2. [React Documentation](https://reactjs.org/docs)
3. [TypeScript Handbook](https://www.typescriptlang.org/docs/)
4. [Supabase Documentation](https://supabase.io/docs)
5. [Bootstrap Documentation](https://getbootstrap.com/docs)

### Recursos de Aprendizaje
1. "React - The Complete Guide", Maximilian Schwarzmüller, Udemy
2. "Understanding TypeScript", Maximilian Schwarzmüller, Udemy
3. "Next.js & React - The Complete Guide", Maximilian Schwarzmüller, Udemy
4. "Building Modern Web Applications with Next.js", Fernando Herrera, Udemy

### Artículos y Tutoriales
1. [Patrones de Diseño en React](https://reactpatterns.com/)
2. [Supabase Auth Helpers](https://supabase.com/docs/guides/auth)
3. [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)
4. [React Context vs Redux](https://www.robinwieruch.de/redux-vs-react-context/)

### Herramientas y Utilidades
1. [ESLint Documentation](https://eslint.org/docs/user-guide/)
2. [Prettier Documentation](https://prettier.io/docs/en/)
3. [npm Documentation](https://docs.npmjs.com/)

### Mejores Prácticas
1. [React Best Practices](https://reactjs.org/docs/thinking-in-react.html)
2. [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
3. [Next.js Best Practices](https://nextjs.org/docs/basic-features/pages) 