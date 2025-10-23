# Requisitos del Backend para CRUDs de Admin - EcoCollet

## 📋 Resumen Ejecutivo

El frontend de EcoCollet tiene 3 CRUDs completos y funcionales para el panel de administración:
1. **CRUD de Usuarios**
2. **CRUD de Materiales** 
3. **CRUD de Puntos de Reciclaje**

Este documento detalla **exactamente** lo que el backend debe implementar para que funcionen completamente.

---

## 🔐 1. SEGURIDAD Y AUTENTICACIÓN (CRÍTICO - BLOQUEANTE)

### 1.1. JWT Authentication Filter

**Implementar un filtro que valide el token JWT en cada request:**

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            final String userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"success\": false, \"message\": \"Token inválido o expirado\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
```

### 1.2. Security Configuration

**Configurar Spring Security para proteger las rutas admin:**

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                
                // Rutas de Admin - REQUIERE ROL ADMIN
                .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                
                // Rutas de Recolector
                .requestMatchers("/api/recolector/**").hasAuthority("RECOLECTOR")
                
                // Rutas de Cliente
                .requestMatchers("/api/cliente/**").hasAuthority("CLIENTE")
                
                // Cualquier otra ruta requiere autenticación
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Permitir el origen del frontend
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://localhost:4201",
            "https://ecocollet.pe"  // Producción
        ));
        
        // Permitir todos los métodos HTTP
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Permitir todos los headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // IMPORTANTE: Permitir credentials (cookies, Authorization header)
        configuration.setAllowCredentials(true);
        
        // Exponer headers en las respuestas
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type"
        ));
        
        // Cache de preflight requests
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### 1.3. User Details Service

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));

        return org.springframework.security.core.userdetails.User.builder()
            .username(usuario.getEmail())
            .password(usuario.getPassword())
            .authorities(usuario.getRol().name())  // "ADMIN", "RECOLECTOR", "CLIENTE"
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(false)
            .build();
    }
}
```

---

## 👥 2. CRUD DE USUARIOS

### 2.1. Entidad Usuario

```java
@Entity
@Table(name = "usuarios")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore  // IMPORTANTE: No exponer password en respuestas
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol;  // ADMIN, RECOLECTOR, CLIENTE

    @Column(length = 15)
    private String telefono;

    private String direccion;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
    }

    // Getters y Setters
}
```

### 2.2. Enum RolUsuario

```java
public enum RolUsuario {
    ADMIN,
    RECOLECTOR,
    CLIENTE
}
```

### 2.3. DTOs para Usuarios

```java
// Request para crear/actualizar usuario
@Data
public class UsuarioAdminRequest {
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email inválido")
    private String email;

    // Password es requerido en POST, opcional en PUT
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private RolUsuario rol;

    @Pattern(regexp = "^[0-9]{9,15}$", message = "Teléfono inválido")
    private String telefono;

    @Size(max = 200, message = "La dirección es muy larga")
    private String direccion;
}

// Response DTO (sin password)
@Data
public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String email;
    private RolUsuario rol;
    private String telefono;
    private String direccion;
    private LocalDateTime fechaRegistro;

    // Constructor desde entidad
    public UsuarioResponse(Usuario usuario) {
        this.id = usuario.getId();
        this.nombre = usuario.getNombre();
        this.email = usuario.getEmail();
        this.rol = usuario.getRol();
        this.telefono = usuario.getTelefono();
        this.direccion = usuario.getDireccion();
        this.fechaRegistro = usuario.getFechaRegistro();
    }
}
```

### 2.4. Controlador de Usuarios Admin

```java
@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasAuthority('ADMIN')")
public class UsuarioAdminController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // GET: Listar todos los usuarios
    @GetMapping
    public ResponseEntity<ApiResponse<List<UsuarioResponse>>> getAll() {
        List<Usuario> usuarios = usuarioService.findAll();
        List<UsuarioResponse> response = usuarios.stream()
            .map(UsuarioResponse::new)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // GET: Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponse>> getById(@PathVariable Long id) {
        Usuario usuario = usuarioService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        return ResponseEntity.ok(ApiResponse.success(new UsuarioResponse(usuario)));
    }

    // POST: Crear nuevo usuario
    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioResponse>> create(
            @Valid @RequestBody UsuarioAdminRequest request) {
        
        // Validar que el email no exista
        if (usuarioService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("El email ya está registrado"));
        }

        // Validar que password no sea null en creación
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("La contraseña es obligatoria"));
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(request.getRol());
        usuario.setTelefono(request.getTelefono());
        usuario.setDireccion(request.getDireccion());

        Usuario saved = usuarioService.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(new UsuarioResponse(saved)));
    }

    // PUT: Actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioAdminRequest request) {
        
        Usuario usuario = usuarioService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Validar email único (excepto el propio usuario)
        if (!usuario.getEmail().equals(request.getEmail()) 
                && usuarioService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("El email ya está en uso"));
        }

        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setRol(request.getRol());
        usuario.setTelefono(request.getTelefono());
        usuario.setDireccion(request.getDireccion());

        // Solo actualizar password si se proporciona
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Usuario updated = usuarioService.save(usuario);
        return ResponseEntity.ok(ApiResponse.success(new UsuarioResponse(updated)));
    }

    // DELETE: Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!usuarioService.existsById(id)) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }

        // Validar que no se elimine a sí mismo
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = auth.getName();
        Usuario usuario = usuarioService.findById(id).get();
        
        if (usuario.getEmail().equals(currentUserEmail)) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("No puedes eliminar tu propio usuario"));
        }

        usuarioService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Usuario eliminado exitosamente"));
    }
}
```

---

## 📦 3. CRUD DE MATERIALES

### 3.1. Entidad Material

```java
@Entity
@Table(name = "materiales")
public class Material {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(name = "precio_por_kg", nullable = false)
    private Double precioPorKg;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }

    // Getters y Setters
}
```

### 3.2. DTOs para Materiales

```java
// Request para crear/actualizar material
@Data
public class MaterialRequest {
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    private String nombre;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @DecimalMax(value = "10000.00", message = "El precio es demasiado alto")
    private Double precioPorKg;
}

// Response DTO
@Data
public class MaterialResponse {
    private Long id;
    private String nombre;
    private Double precioPorKg;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    public MaterialResponse(Material material) {
        this.id = material.getId();
        this.nombre = material.getNombre();
        this.precioPorKg = material.getPrecioPorKg();
        this.fechaCreacion = material.getFechaCreacion();
        this.fechaActualizacion = material.getFechaActualizacion();
    }
}
```

### 3.3. Controlador de Materiales Admin

```java
@RestController
@RequestMapping("/api/admin/materiales")
@PreAuthorize("hasAuthority('ADMIN')")
public class MaterialAdminController {

    @Autowired
    private MaterialService materialService;

    // GET: Listar todos los materiales
    @GetMapping
    public ResponseEntity<ApiResponse<List<MaterialResponse>>> getAll() {
        List<Material> materiales = materialService.findAll();
        List<MaterialResponse> response = materiales.stream()
            .map(MaterialResponse::new)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // GET: Obtener material por ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaterialResponse>> getById(@PathVariable Long id) {
        Material material = materialService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));
        
        return ResponseEntity.ok(ApiResponse.success(new MaterialResponse(material)));
    }

    // POST: Crear nuevo material
    @PostMapping
    public ResponseEntity<ApiResponse<MaterialResponse>> create(
            @Valid @RequestBody MaterialRequest request) {
        
        // Validar que el nombre no exista
        if (materialService.existsByNombre(request.getNombre())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Ya existe un material con ese nombre"));
        }

        Material material = new Material();
        material.setNombre(request.getNombre());
        material.setPrecioPorKg(request.getPrecioPorKg());

        Material saved = materialService.save(material);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(new MaterialResponse(saved)));
    }

    // PUT: Actualizar material
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MaterialResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MaterialRequest request) {
        
        Material material = materialService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        // Validar nombre único (excepto el propio material)
        if (!material.getNombre().equals(request.getNombre()) 
                && materialService.existsByNombre(request.getNombre())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Ya existe un material con ese nombre"));
        }

        material.setNombre(request.getNombre());
        material.setPrecioPorKg(request.getPrecioPorKg());

        Material updated = materialService.save(material);
        return ResponseEntity.ok(ApiResponse.success(new MaterialResponse(updated)));
    }

    // DELETE: Eliminar material
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!materialService.existsById(id)) {
            throw new ResourceNotFoundException("Material no encontrado");
        }

        // Validar que no esté siendo usado en puntos de reciclaje
        if (materialService.isUsedInPuntos(id)) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("No se puede eliminar: el material está asignado a puntos de reciclaje"));
        }

        materialService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Material eliminado exitosamente"));
    }

    // GET: Buscar materiales por nombre
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MaterialResponse>>> search(
            @RequestParam String query) {
        
        List<Material> materiales = materialService.searchByNombre(query);
        List<MaterialResponse> response = materiales.stream()
            .map(MaterialResponse::new)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
```

### 3.4. Repository de Materiales

```java
@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    
    boolean existsByNombre(String nombre);
    
    List<Material> findByNombreContainingIgnoreCase(String nombre);
    
    @Query("SELECT COUNT(pm) > 0 FROM PuntoReciclaje p JOIN p.materialesAceptados pm WHERE pm.id = :materialId")
    boolean isUsedInPuntos(@Param("materialId") Long materialId);
}
```

---

## 📍 4. CRUD DE PUNTOS DE RECICLAJE

### 4.1. Entidad PuntoReciclaje

```java
@Entity
@Table(name = "puntos_reciclaje")
public class PuntoReciclaje {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String direccion;

    @Column(length = 15)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPunto estado;  // ACTIVO, INACTIVO, MANTENIMIENTO

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "punto_material",
        joinColumns = @JoinColumn(name = "punto_id"),
        inverseJoinColumns = @JoinColumn(name = "material_id")
    )
    private List<Material> materialesAceptados = new ArrayList<>();

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoPunto.ACTIVO;
        }
    }

    // Getters y Setters
}
```

### 4.2. Enum EstadoPunto

```java
public enum EstadoPunto {
    ACTIVO("activo"),
    INACTIVO("inactivo"),
    MANTENIMIENTO("mantenimiento");

    private String valor;

    EstadoPunto(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    // Método para convertir desde string
    public static EstadoPunto fromString(String estado) {
        for (EstadoPunto e : EstadoPunto.values()) {
            if (e.valor.equalsIgnoreCase(estado)) {
                return e;
            }
        }
        throw new IllegalArgumentException("Estado no válido: " + estado);
    }
}
```

### 4.3. DTOs para Puntos de Reciclaje

```java
// Request para crear/actualizar punto
@Data
public class PuntoReciclajeRequest {
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 200, message = "La dirección es muy larga")
    private String direccion;

    @Pattern(regexp = "^[0-9]{7,15}$", message = "Teléfono inválido")
    private String telefono;

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "activo|inactivo|mantenimiento", message = "Estado inválido")
    private String estado;

    @NotEmpty(message = "Debe seleccionar al menos un material")
    private List<Long> materialesAceptadosIds;
}

// Response DTO
@Data
public class PuntoReciclajeResponse {
    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String estado;
    private List<MaterialSimpleResponse> materialesAceptados;
    private LocalDateTime fechaCreacion;

    public PuntoReciclajeResponse(PuntoReciclaje punto) {
        this.id = punto.getId();
        this.nombre = punto.getNombre();
        this.direccion = punto.getDireccion();
        this.telefono = punto.getTelefono();
        this.estado = punto.getEstado().getValor();
        this.materialesAceptados = punto.getMaterialesAceptados().stream()
            .map(MaterialSimpleResponse::new)
            .collect(Collectors.toList());
        this.fechaCreacion = punto.getFechaCreacion();
    }
}

@Data
class MaterialSimpleResponse {
    private Long id;
    private String nombre;
    
    public MaterialSimpleResponse(Material material) {
        this.id = material.getId();
        this.nombre = material.getNombre();
    }
}
```

### 4.4. Controlador de Puntos Admin

```java
@RestController
@RequestMapping("/api/admin/puntos")
@PreAuthorize("hasAuthority('ADMIN')")
public class PuntoReciclajeAdminController {

    @Autowired
    private PuntoReciclajeService puntoService;

    @Autowired
    private MaterialService materialService;

    // GET: Listar todos los puntos
    @GetMapping
    public ResponseEntity<ApiResponse<List<PuntoReciclajeResponse>>> getAll() {
        List<PuntoReciclaje> puntos = puntoService.findAll();
        List<PuntoReciclajeResponse> response = puntos.stream()
            .map(PuntoReciclajeResponse::new)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // GET: Obtener punto por ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PuntoReciclajeResponse>> getById(@PathVariable Long id) {
        PuntoReciclaje punto = puntoService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Punto de reciclaje no encontrado"));
        
        return ResponseEntity.ok(ApiResponse.success(new PuntoReciclajeResponse(punto)));
    }

    // POST: Crear nuevo punto
    @PostMapping
    public ResponseEntity<ApiResponse<PuntoReciclajeResponse>> create(
            @Valid @RequestBody PuntoReciclajeRequest request) {
        
        // Validar que todos los materiales existan
        List<Material> materiales = materialService.findAllById(request.getMaterialesAceptadosIds());
        if (materiales.size() != request.getMaterialesAceptadosIds().size()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Algunos materiales no existen"));
        }

        PuntoReciclaje punto = new PuntoReciclaje();
        punto.setNombre(request.getNombre());
        punto.setDireccion(request.getDireccion());
        punto.setTelefono(request.getTelefono());
        punto.setEstado(EstadoPunto.fromString(request.getEstado()));
        punto.setMaterialesAceptados(materiales);

        PuntoReciclaje saved = puntoService.save(punto);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(new PuntoReciclajeResponse(saved)));
    }

    // PUT: Actualizar punto
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PuntoReciclajeResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PuntoReciclajeRequest request) {
        
        PuntoReciclaje punto = puntoService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Punto de reciclaje no encontrado"));

        // Validar materiales
        List<Material> materiales = materialService.findAllById(request.getMaterialesAceptadosIds());
        if (materiales.size() != request.getMaterialesAceptadosIds().size()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Algunos materiales no existen"));
        }

        punto.setNombre(request.getNombre());
        punto.setDireccion(request.getDireccion());
        punto.setTelefono(request.getTelefono());
        punto.setEstado(EstadoPunto.fromString(request.getEstado()));
        punto.setMaterialesAceptados(materiales);

        PuntoReciclaje updated = puntoService.save(punto);
        return ResponseEntity.ok(ApiResponse.success(new PuntoReciclajeResponse(updated)));
    }

    // DELETE: Eliminar punto
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!puntoService.existsById(id)) {
            throw new ResourceNotFoundException("Punto de reciclaje no encontrado");
        }

        // Validar que no tenga citas pendientes
        if (puntoService.hasPendingCitas(id)) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("No se puede eliminar: el punto tiene citas pendientes"));
        }

        puntoService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Punto eliminado exitosamente"));
    }

    // GET: Buscar puntos por nombre o dirección
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PuntoReciclajeResponse>>> search(
            @RequestParam String query) {
        
        List<PuntoReciclaje> puntos = puntoService.searchByNombreOrDireccion(query);
        List<PuntoReciclajeResponse> response = puntos.stream()
            .map(PuntoReciclajeResponse::new)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // GET: Filtrar por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponse<List<PuntoReciclajeResponse>>> getByEstado(
            @PathVariable String estado) {
        
        try {
            EstadoPunto estadoEnum = EstadoPunto.fromString(estado);
            List<PuntoReciclaje> puntos = puntoService.findByEstado(estadoEnum);
            List<PuntoReciclajeResponse> response = puntos.stream()
                .map(PuntoReciclajeResponse::new)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Estado inválido: " + estado));
        }
    }
}
```

### 4.5. Repository de Puntos

```java
@Repository
public interface PuntoReciclajeRepository extends JpaRepository<PuntoReciclaje, Long> {
    
    List<PuntoReciclaje> findByEstado(EstadoPunto estado);
    
    @Query("SELECT p FROM PuntoReciclaje p WHERE " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.direccion) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<PuntoReciclaje> searchByNombreOrDireccion(@Param("query") String query);
    
    @Query("SELECT COUNT(c) > 0 FROM Cita c WHERE c.puntoReciclaje.id = :puntoId AND c.estado IN ('PENDIENTE', 'EN_PROCESO')")
    boolean hasPendingCitas(@Param("puntoId") Long puntoId);
}
```

---

## 📊 5. CLASE ApiResponse (WRAPPER ESTÁNDAR)

**Todas las respuestas deben usar este formato:**

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    
    private boolean success;
    private T data;
    private String message;
    
    // Métodos factory para facilitar uso
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }
}
```

**Ejemplo de uso:**
```java
// Éxito con data
return ResponseEntity.ok(ApiResponse.success(usuarioResponse));

// Éxito con mensaje
return ResponseEntity.ok(ApiResponse.success(null, "Usuario eliminado exitosamente"));

// Error
return ResponseEntity.badRequest().body(ApiResponse.error("Email ya existe"));
```

---

## 🌱 6. DATOS DE PRUEBA (SEEDS)

### 6.1. Script SQL para Seeds Iniciales

```sql
-- =====================================================
-- SEEDS PARA ECOCOLLET - ADMIN CRUDS
-- =====================================================

-- 1. MATERIALES (crear primero, necesario para puntos)
INSERT INTO materiales (nombre, precio_por_kg, fecha_creacion, fecha_actualizacion) VALUES 
('Plástico', 2.50, NOW(), NOW()),
('Papel', 1.80, NOW(), NOW()),
('Vidrio', 1.20, NOW(), NOW()),
('Metal', 4.00, NOW(), NOW()),
('Electrónicos', 5.00, NOW(), NOW()),
('Cartón', 1.40, NOW(), NOW()),
('Aluminio', 3.50, NOW(), NOW()),
('Cobre', 8.00, NOW(), NOW());

-- 2. USUARIOS (passwords hasheados con BCrypt)
-- Password para todos: EcoCollet2024*
-- Hash BCrypt: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO usuarios (nombre, email, password, rol, telefono, direccion, fecha_registro) VALUES 
-- Admin principal
('Admin EcoCollet', 'admin@ecocollet.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', '999888777', 'Av. Arequipa 1234, Lima', NOW()),

-- Recolectores
('Carlos Recolector', 'recolector1@ecocollet.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'RECOLECTOR', '988777666', 'Av. Larco 567, Miraflores', NOW()),
('Ana Recolectora', 'recolector2@ecocollet.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'RECOLECTOR', '977666555', 'Av. Benavides 890, Surco', NOW()),

-- Clientes
('María Cliente', 'cliente1@ecocollet.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENTE', '966555444', 'Jr. Las Flores 123, San Isidro', NOW()),
('Juan Cliente', 'cliente2@ecocollet.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENTE', '955444333', 'Av. Pardo 456, Miraflores', NOW()),
('EcoTech SAC', 'empresa1@ecocollet.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENTE', '944333222', 'Av. Javier Prado 789, San Isidro', NOW());

-- 3. PUNTOS DE RECICLAJE
INSERT INTO puntos_reciclaje (nombre, direccion, telefono, estado, fecha_creacion) VALUES 
('EcoPoint Miraflores', 'Av. Larco 345, Miraflores', '012345678', 'ACTIVO', NOW()),
('ReciclaMax San Isidro', 'Av. Javier Prado 1234, San Isidro', '012345679', 'ACTIVO', NOW()),
('Verde Surco', 'Av. Benavides 567, Surco', '012345680', 'MANTENIMIENTO', NOW()),
('EcoCentro La Molina', 'Av. La Molina 890, La Molina', '012345681', 'ACTIVO', NOW()),
('Reciclaje Express Breña', 'Av. Brasil 234, Breña', '012345682', 'INACTIVO', NOW());

-- 4. RELACIÓN PUNTO-MATERIAL (muchos a muchos)
-- Nota: Ajustar IDs según los generados por la BD

-- EcoPoint Miraflores acepta: Plástico, Papel, Vidrio
INSERT INTO punto_material (punto_id, material_id) VALUES 
(1, 1), (1, 2), (1, 3);

-- ReciclaMax San Isidro acepta: Plástico, Papel, Electrónicos, Metal
INSERT INTO punto_material (punto_id, material_id) VALUES 
(2, 1), (2, 2), (2, 4), (2, 5);

-- Verde Surco acepta: Papel, Cartón, Vidrio
INSERT INTO punto_material (punto_id, material_id) VALUES 
(3, 2), (3, 3), (3, 6);

-- EcoCentro La Molina acepta: Todos los materiales
INSERT INTO punto_material (punto_id, material_id) VALUES 
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8);

-- Reciclaje Express Breña acepta: Metal, Aluminio, Cobre
INSERT INTO punto_material (punto_id, material_id) VALUES 
(5, 4), (5, 7), (5, 8);
```

### 6.2. Clase Seeder Spring (Alternativa)

```java
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private PuntoReciclajeRepository puntoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        // Solo ejecutar si la BD está vacía
        if (usuarioRepository.count() > 0) {
            return;
        }

        System.out.println("🌱 Sembrando datos iniciales...");

        // 1. Crear materiales
        List<Material> materiales = Arrays.asList(
            createMaterial("Plástico", 2.50),
            createMaterial("Papel", 1.80),
            createMaterial("Vidrio", 1.20),
            createMaterial("Metal", 4.00),
            createMaterial("Electrónicos", 5.00),
            createMaterial("Cartón", 1.40)
        );
        materialRepository.saveAll(materiales);

        // 2. Crear usuarios
        String defaultPassword = passwordEncoder.encode("EcoCollet2024*");
        
        Usuario admin = createUsuario("Admin EcoCollet", "admin@ecocollet.pe", 
            defaultPassword, RolUsuario.ADMIN, "999888777", "Lima");
        
        Usuario recolector = createUsuario("Carlos Recolector", "recolector1@ecocollet.pe",
            defaultPassword, RolUsuario.RECOLECTOR, "988777666", "Miraflores");
        
        Usuario cliente = createUsuario("María Cliente", "cliente1@ecocollet.pe",
            defaultPassword, RolUsuario.CLIENTE, "966555444", "San Isidro");

        usuarioRepository.saveAll(Arrays.asList(admin, recolector, cliente));

        // 3. Crear puntos de reciclaje
        PuntoReciclaje punto1 = new PuntoReciclaje();
        punto1.setNombre("EcoPoint Miraflores");
        punto1.setDireccion("Av. Larco 345, Miraflores");
        punto1.setTelefono("012345678");
        punto1.setEstado(EstadoPunto.ACTIVO);
        punto1.setMaterialesAceptados(Arrays.asList(materiales.get(0), materiales.get(1), materiales.get(2)));

        PuntoReciclaje punto2 = new PuntoReciclaje();
        punto2.setNombre("ReciclaMax San Isidro");
        punto2.setDireccion("Av. Javier Prado 1234");
        punto2.setTelefono("012345679");
        punto2.setEstado(EstadoPunto.ACTIVO);
        punto2.setMaterialesAceptados(Arrays.asList(materiales.get(0), materiales.get(1), materiales.get(4)));

        puntoRepository.saveAll(Arrays.asList(punto1, punto2));

        System.out.println("✅ Seeds creados exitosamente");
        System.out.println("📧 Usuario admin: admin@ecocollet.pe");
        System.out.println("🔑 Password: EcoCollet2024*");
    }

    private Material createMaterial(String nombre, Double precio) {
        Material m = new Material();
        m.setNombre(nombre);
        m.setPrecioPorKg(precio);
        return m;
    }

    private Usuario createUsuario(String nombre, String email, String password, 
                                   RolUsuario rol, String telefono, String direccion) {
        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setEmail(email);
        u.setPassword(password);
        u.setRol(rol);
        u.setTelefono(telefono);
        u.setDireccion(direccion);
        return u;
    }
}
```

---

## ⚠️ 7. MANEJO DE EXCEPCIONES GLOBAL

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        ApiResponse<Map<String, String>> response = new ApiResponse<>(false, errors, "Errores de validación");
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("Error interno del servidor: " + ex.getMessage()));
    }
}

// Exception custom
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

---

## 🧪 8. TESTING - ENDPOINTS CON POSTMAN

### 8.1. Login (obtener token)

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "admin@ecocollet.pe",
  "password": "EcoCollet2024*"
}

# Respuesta esperada:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nombre": "Admin EcoCollet",
      "email": "admin@ecocollet.pe",
      "rol": "ADMIN"
    }
  }
}
```

### 8.2. Listar Usuarios (con token)

```http
GET http://localhost:8080/api/admin/usuarios
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Respuesta esperada:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Admin EcoCollet",
      "email": "admin@ecocollet.pe",
      "rol": "ADMIN",
      "telefono": "999888777",
      "direccion": "Lima",
      "fechaRegistro": "2024-03-20T10:30:00"
    },
    ...
  ]
}
```

### 8.3. Crear Material

```http
POST http://localhost:8080/api/admin/materiales
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nombre": "Tetra Pak",
  "precioPorKg": 2.30
}

# Respuesta esperada:
{
  "success": true,
  "data": {
    "id": 9,
    "nombre": "Tetra Pak",
    "precioPorKg": 2.30,
    "fechaCreacion": "2024-03-20T11:00:00"
  }
}
```

### 8.4. Actualizar Punto

```http
PUT http://localhost:8080/api/admin/puntos/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nombre": "EcoPoint Miraflores Renovado",
  "direccion": "Av. Larco 345, Miraflores",
  "telefono": "012345678",
  "estado": "activo",
  "materialesAceptadosIds": [1, 2, 3, 6]
}
```

---

## 📝 9. CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Seguridad (BLOQUEANTE - hacer primero)
- [ ] Implementar `JwtAuthenticationFilter`
- [ ] Configurar `SecurityConfig` con rutas protegidas
- [ ] Implementar `UserDetailsService`
- [ ] Configurar CORS con origins permitidos
- [ ] Probar login y obtención de token
- [ ] Probar acceso a `/api/admin/**` con y sin token

### Fase 2: Entidades y Repositorios
- [ ] Crear entidad `Usuario` con enum `RolUsuario`
- [ ] Crear entidad `Material`
- [ ] Crear entidad `PuntoReciclaje` con enum `EstadoPunto`
- [ ] Crear repositorios con métodos de búsqueda
- [ ] Configurar relación ManyToMany entre Punto y Material

### Fase 3: DTOs
- [ ] Crear `UsuarioAdminRequest` y `UsuarioResponse`
- [ ] Crear `MaterialRequest` y `MaterialResponse`
- [ ] Crear `PuntoReciclajeRequest` y `PuntoReciclajeResponse`
- [ ] Crear `ApiResponse<T>` wrapper

### Fase 4: Servicios
- [ ] Implementar `UsuarioService` con métodos CRUD
- [ ] Implementar `MaterialService` con métodos CRUD y búsqueda
- [ ] Implementar `PuntoReciclajeService` con métodos CRUD, búsqueda y filtros

### Fase 5: Controladores
- [ ] Implementar `UsuarioAdminController` con todos los endpoints
- [ ] Implementar `MaterialAdminController` con todos los endpoints
- [ ] Implementar `PuntoReciclajeAdminController` con todos los endpoints
- [ ] Agregar validaciones de negocio en cada endpoint

### Fase 6: Manejo de Errores
- [ ] Crear `ResourceNotFoundException`
- [ ] Implementar `GlobalExceptionHandler`
- [ ] Agregar logs de errores

### Fase 7: Seeds y Testing
- [ ] Crear script SQL de seeds o clase `DataSeeder`
- [ ] Ejecutar seeds en BD de desarrollo
- [ ] Probar todos los endpoints con Postman
- [ ] Validar formato de respuestas `ApiResponse`

### Fase 8: Validaciones Extra
- [ ] Email único en usuarios
- [ ] Password hasheado con BCrypt (mínimo 6 caracteres)
- [ ] Precio de material > 0
- [ ] Materiales aceptados existen en BD
- [ ] No eliminar usuario actual (admin)
- [ ] No eliminar material usado en puntos
- [ ] No eliminar punto con citas pendientes

---

## 🚀 10. ENDPOINTS COMPLETOS - REFERENCIA RÁPIDA

### Usuarios Admin
```
GET    /api/admin/usuarios          - Listar todos
GET    /api/admin/usuarios/{id}     - Obtener por ID
POST   /api/admin/usuarios          - Crear nuevo
PUT    /api/admin/usuarios/{id}     - Actualizar
DELETE /api/admin/usuarios/{id}     - Eliminar
```

### Materiales Admin
```
GET    /api/admin/materiales             - Listar todos
GET    /api/admin/materiales/{id}        - Obtener por ID
POST   /api/admin/materiales             - Crear nuevo
PUT    /api/admin/materiales/{id}        - Actualizar
DELETE /api/admin/materiales/{id}        - Eliminar
GET    /api/admin/materiales/search      - Buscar por nombre (?query=)
```

### Puntos de Reciclaje Admin
```
GET    /api/admin/puntos                 - Listar todos
GET    /api/admin/puntos/{id}            - Obtener por ID
POST   /api/admin/puntos                 - Crear nuevo
PUT    /api/admin/puntos/{id}            - Actualizar
DELETE /api/admin/puntos/{id}            - Eliminar
GET    /api/admin/puntos/search          - Buscar (?query=)
GET    /api/admin/puntos/estado/{estado} - Filtrar por estado
```

---

## ✅ CRITERIOS DE ACEPTACIÓN

El backend está completo cuando:

1. ✅ Login devuelve token JWT válido
2. ✅ Rutas `/api/admin/**` protegidas (401 sin token, 403 sin rol ADMIN)
3. ✅ CORS habilitado para frontend (`http://localhost:4200`)
4. ✅ Todos los endpoints GET devuelven `ApiResponse<List<T>>` o `ApiResponse<T>`
5. ✅ POST/PUT/DELETE retornan `ApiResponse<T>` con data o mensaje
6. ✅ Validaciones de campos funcionan (400 con errores)
7. ✅ Seeds cargados: mínimo 6 materiales, 3 usuarios (admin, recolector, cliente), 2 puntos
8. ✅ Password hasheado con BCrypt y NO expuesto en respuestas
9. ✅ Búsquedas case-insensitive funcionan
10. ✅ No se pueden eliminar recursos con dependencias activas

---

## 📞 CONTACTO Y SOPORTE

Si tienes dudas durante la implementación:

1. **Campo `materialesAceptados` en respuesta de Puntos**: debe incluir array completo de objetos Material con `{ id, nombre }`, no solo IDs
2. **Estados lowercase**: el frontend envía "activo"|"inactivo"|"mantenimiento" en minúsculas, convertir a ENUM en backend
3. **Roles uppercase**: el frontend espera "ADMIN"|"RECOLECTOR"|"CLIENTE" en respuestas (exactamente así)
4. **Password en creación**: el frontend envía password en POST, opcional en PUT
5. **CORS**: sin CORS configurado correctamente, el navegador bloqueará todas las peticiones

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DE ADMIN CRUDS

Una vez que los 3 CRUDs funcionen:

1. Dashboard de Recolector (rutas y citas asignadas)
2. Dashboard de Cliente (agendar citas, historial)
3. Sistema de Citas completo (crear, actualizar estado, asignar recolector)
4. Notificaciones en tiempo real (WebSockets)
5. Reportes y estadísticas para admin

---

**Documento generado para:** EcoCollet Backend Team  
**Fecha:** Octubre 2024  
**Frontend listo:** ✅ 100% operativo esperando backend  
**Prioridad:** 🔴 ALTA - Bloqueante para demo
