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
11. [Testing](#testing)
12. [Despliegue](#despliegue)
13. [Bibliografía](#bibliografía)

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

### Middleware de Autenticación

```typescript
// middleware.ts
export default function middleware(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.redirect('/login');
    }
}
```

Equivalente en Java (Spring Security):

```java
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
            .antMatchers("/login").permitAll()
            .anyRequest().authenticated();
    }
}
```

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

### Componentes React

Los componentes React son similares a los fragmentos de vista en JSP:

```typescript
// GuardiaCard.tsx
export const GuardiaCard: React.FC<GuardiaProps> = ({ guardia }) => {
    return (
        <Card>
            <Card.Body>
                <Card.Title>{guardia.profesor}</Card.Title>
                <Card.Text>{guardia.fecha}</Card.Text>
            </Card.Body>
        </Card>
    );
};
```

Equivalente en JSP:

```jsp
<!-- guardia.jsp -->
<div class="card">
    <div class="card-body">
        <h5 class="card-title">${guardia.profesor}</h5>
        <p class="card-text">${guardia.fecha}</p>
    </div>
</div>
```

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