# Backend Spring Boot para EcoCollet - Guía de Integración

## 🚀 Estructura de Backend Spring Boot

### Configuración del Proyecto Spring Boot

```xml
<!-- pom.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.5</version>
        <relativePath/>
    </parent>
    <groupId>com.ecocollet</groupId>
    <artifactId>ecocollet-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>EcoCollet Backend</name>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
        </dependency>
        
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
        </dependency>
        
        <!-- Base de datos -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Herramientas -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>
```

### Estructura del Proyecto

```
src/main/java/com/ecocollet/backend/
├── EcoColletBackendApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── JwtAuthenticationEntryPoint.java
│   ├── JwtAuthenticationFilter.java
│   └── CorsConfig.java
├── controller/
│   ├── AuthController.java
│   ├── RecolectorController.java
│   ├── UsuarioController.java
│   └── AdminController.java
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   └── AgendarRecoleccionRequest.java
│   └── response/
│       ├── JwtResponse.java
│       ├── ApiResponse.java
│       └── StatsResponse.java
├── entity/
│   ├── User.java
│   ├── Recoleccion.java
│   ├── Cliente.java
│   └── Recolector.java
├── repository/
│   ├── UserRepository.java
│   ├── RecoleccionRepository.java
│   └── RecolectorRepository.java
├── service/
│   ├── AuthService.java
│   ├── RecolectorService.java
│   ├── UsuarioService.java
│   └── JwtService.java
└── util/
    ├── JwtUtil.java
    └── ResponseUtil.java
```

## 📋 APIs Específicas para tu Frontend

### 1. AuthController.java

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            JwtResponse response = authService.authenticateUser(request);
            return ResponseEntity.ok(ApiResponse.success("Login exitoso", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Credenciales incorrectas"));
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = authService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Usuario registrado exitosamente", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error al registrar usuario: " + e.getMessage()));
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        try {
            String token = refreshToken.replace("Bearer ", "");
            JwtResponse response = authService.refreshToken(token);
            return ResponseEntity.ok(ApiResponse.success("Token renovado", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Token inválido"));
        }
    }
    
    @GetMapping("/verify")
    @PreAuthorize("hasRole('USER') or hasRole('RECOLECTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> verifyToken(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success("Token válido", principal.getName()));
    }
}
```

### 2. RecolectorController.java

```java
@RestController
@RequestMapping("/api/recolector")
@PreAuthorize("hasRole('RECOLECTOR')")
@CrossOrigin(origins = "http://localhost:4200")
public class RecolectorController {
    
    @Autowired
    private RecolectorService recolectorService;
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats(Principal principal) {
        StatsResponse stats = recolectorService.getRecolectorStats(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas", stats));
    }
    
    @GetMapping("/agenda")
    public ResponseEntity<ApiResponse> getAgenda(Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Recoleccion> agenda = recolectorService.getAgendaDelDia(principal.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Agenda obtenida", agenda));
    }
    
    @GetMapping("/recolecciones")
    public ResponseEntity<ApiResponse> getRecolecciones(Principal principal,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fecha,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Recoleccion> recolecciones = recolectorService.getRecolecciones(
            principal.getName(), estado, fecha, pageable);
        return ResponseEntity.ok(ApiResponse.success("Recolecciones obtenidas", recolecciones));
    }
    
    @GetMapping("/recolecciones/{id}")
    public ResponseEntity<ApiResponse> getRecoleccionById(@PathVariable Long id, Principal principal) {
        Recoleccion recoleccion = recolectorService.getRecoleccionById(id, principal.getName());
        if (recoleccion != null) {
            return ResponseEntity.ok(ApiResponse.success("Recolección encontrada", recoleccion));
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/recolecciones/{id}/iniciar")
    public ResponseEntity<ApiResponse> iniciarRecoleccion(@PathVariable Long id, Principal principal) {
        Recoleccion recoleccion = recolectorService.iniciarRecoleccion(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Recolección iniciada", recoleccion));
    }
    
    @PatchMapping("/recolecciones/{id}/completar")
    public ResponseEntity<ApiResponse> completarRecoleccion(@PathVariable Long id, 
            @RequestBody CompletarRecoleccionRequest request, Principal principal) {
        Recoleccion recoleccion = recolectorService.completarRecoleccion(id, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Recolección completada", recoleccion));
    }
    
    @GetMapping("/historial")
    public ResponseEntity<ApiResponse> getHistorial(Principal principal,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Recoleccion> historial = recolectorService.getHistorial(
            principal.getName(), fechaInicio, fechaFin, pageable);
        return ResponseEntity.ok(ApiResponse.success("Historial obtenido", historial));
    }
    
    @GetMapping("/rendimiento/semanal")
    public ResponseEntity<ApiResponse> getRendimientoSemanal(Principal principal) {
        Map<String, Object> rendimiento = recolectorService.getRendimientoSemanal(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Rendimiento semanal obtenido", rendimiento));
    }
    
    @PostMapping("/ubicacion")
    public ResponseEntity<ApiResponse> actualizarUbicacion(@RequestBody UbicacionRequest request, Principal principal) {
        recolectorService.actualizarUbicacion(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Ubicación actualizada"));
    }
    
    @GetMapping("/ruta")
    public ResponseEntity<ApiResponse> getRutaOptimizada(Principal principal) {
        List<Recoleccion> ruta = recolectorService.getRutaOptimizada(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Ruta optimizada obtenida", ruta));
    }
}
```

### 3. UsuarioController.java

```java
@RestController
@RequestMapping("/api/usuario")
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats(Principal principal) {
        Map<String, Object> stats = usuarioService.getUsuarioStats(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas", stats));
    }
    
    @PostMapping("/recoleccion")
    public ResponseEntity<ApiResponse> agendarRecoleccion(@Valid @RequestBody AgendarRecoleccionRequest request, 
            Principal principal) {
        Recoleccion recoleccion = usuarioService.agendarRecoleccion(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Recolección agendada exitosamente", recoleccion));
    }
    
    @GetMapping("/recolecciones")
    public ResponseEntity<ApiResponse> getMisRecolecciones(Principal principal,
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Recoleccion> recolecciones = usuarioService.getMisRecolecciones(
            principal.getName(), estado, pageable);
        return ResponseEntity.ok(ApiResponse.success("Recolecciones obtenidas", recolecciones));
    }
    
    @GetMapping("/puntos")
    public ResponseEntity<ApiResponse> getPuntosReciclaje() {
        List<PuntoReciclaje> puntos = usuarioService.getPuntosReciclaje();
        return ResponseEntity.ok(ApiResponse.success("Puntos de reciclaje obtenidos", puntos));
    }
    
    @GetMapping("/recompensas")
    public ResponseEntity<ApiResponse> getRecompensas(Principal principal) {
        Map<String, Object> recompensas = usuarioService.getRecompensasYRanking(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Recompensas obtenidas", recompensas));
    }
}
```

## 🔧 Configuración CORS para Angular

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:4200", "https://tu-frontend.com"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

## 📁 application.yml

```yaml
server:
  port: 8080
  servlet:
    context-path: /
    
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ecocollet_db
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
    
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        
jwt:
  secret: ecoColletSecretKeyForJWTGeneration2024
  expiration: 86400000 # 24 horas
  refresh-expiration: 604800000 # 7 días
```

## 🚀 Comandos para ejecutar

```bash
# Crear el proyecto
mvn archetype:generate -DgroupId=com.ecocollet -DartifactId=ecocollet-backend

# Compilar
mvn clean compile

# Ejecutar
mvn spring-boot:run

# Empaquetar
mvn clean package

# Ejecutar JAR
java -jar target/ecocollet-backend-0.0.1-SNAPSHOT.jar
```

## ✅ Frontend ya está preparado

Tu frontend Angular ya está configurado para conectar con Spring Boot:

1. ✅ **Puerto actualizado**: `localhost:8080` (puerto por defecto de Spring Boot)
2. ✅ **Services preparados**: Los métodos HTTP coinciden con los endpoints de Spring Boot
3. ✅ **Interceptores configurados**: Para manejar JWT automáticamente
4. ✅ **CORS manejado**: Spring Boot manejará las peticiones desde `localhost:4200`

## 🔄 Formato de Respuestas

Spring Boot debe devolver respuestas en este formato que tu frontend ya espera:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    // datos específicos
  }
}
```

¡El frontend está 100% listo para conectar con tu backend Spring Boot! Solo necesitas implementar los controladores con los endpoints que ya están configurados en los services de Angular.