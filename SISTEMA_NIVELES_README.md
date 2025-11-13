# Sistema de Niveles de Usuario - Guía de Implementación

## Descripción General

Se ha implementado un sistema automático de asignación de niveles para usuarios basado en su puntaje acumulado de recolección en la aplicación EcoCollect. El sistema calcula y actualiza automáticamente el nivel cada vez que los puntos de un usuario cambian.

## Estructura de Niveles

Los niveles se asignan según el siguiente criterio:

| Nivel | Nombre | Rango de Puntos |
|-------|--------|-----------------|
| 1 | **Eco-Héroe** | 0 - 249 puntos |
| 2 | **Eco-Explorador** | 250 - 499 puntos |
| 3 | **Eco-Guardabosques** | 500 - 749 puntos |
| 4 | **Eco-Visionario** | 750 - 999 puntos |
| 5 | **Eco-Líder Global** | 1000+ puntos |

## Archivos Creados/Modificados

### 1. **NivelUsuario.java** (Enum)
- **Ruta**: `com.upn.ecocollect.model.NivelUsuario`
- **Función**: Define los 5 niveles con sus rangos de puntos y proporciona métodos de utilidad
- **Métodos principales**:
  - `calcularNivel(int puntos)`: Calcula el nivel según los puntos
  - `getNivelAnterior()`: Obtiene el nivel anterior
  - `getNivelSiguiente()`: Obtiene el nivel siguiente
  - `esNivelMaximo()`: Verifica si es el nivel máximo

### 2. **NivelService.java** (Servicio)
- **Ruta**: `com.upn.ecocollect.service.NivelService`
- **Función**: Gestiona la lógica de niveles
- **Métodos principales**:
  - `calcularNivelPorPuntos(int puntos)`: Calcula el nivel
  - `actualizarNivelUsuario(Usuario usuario)`: Actualiza el nivel en BD
  - `incrementarPuntosYActualizarNivel(Long usuarioId, int puntos)`: Incrementa puntos y actualiza nivel
  - `obtenerProgresionNivel(Long usuarioId)`: Obtiene información de progreso del usuario
  - `obtenerNivelDelUsuario(Long usuarioId)`: Obtiene el nivel actual del usuario

### 3. **Usuario.java** (Entidad)
- **Cambios**:
  - Añadido campo `puntos` (Integer, valor por defecto 0)
  - Campo `nivel` ahora almacena el nombre del enum (ECO_HEROE, ECO_EXPLORADOR, etc.)

### 4. **UsuarioAdminService.java** (Servicio)
- **Cambios**:
  - Inyectado `NivelService`
  - En `createUsuario()`: Se inicializa con nivel ECO_HEROE y 0 puntos

### 5. **NivelController.java** (Controlador REST)
- **Ruta base**: `/api/niveles`
- **Endpoints**:
  - `GET /api/niveles/disponibles`: Lista todos los niveles disponibles
  - `GET /api/niveles/{usuarioId}/progresion`: Obtiene el progreso del usuario
  - `POST /api/niveles/{usuarioId}/incrementar-puntos`: Incrementa puntos y actualiza nivel
  - `GET /api/niveles/mi-nivel`: Obtiene el nivel del usuario autenticado (ejemplo)

## Ejemplo de Uso en el Backend

### 1. Crear un Usuario Nuevo
```java
// El usuario nuevo se crea con:
// - puntos = 0
// - nivel = ECO_HEROE
UsuarioAdminRequest request = new UsuarioAdminRequest();
request.setNombre("Juan Pérez");
request.setEmail("juan@mail.com");
request.setPassword("password123");
request.setRol("CLIENTE");

Usuario usuario = usuarioAdminService.createUsuario(request);
// usuario.getPuntos() = 0
// usuario.getNivel() = "ECO_HEROE"
```

### 2. Incrementar Puntos y Actualizar Nivel Automáticamente
```java
@Autowired
private NivelService nivelService;

// Cuando un usuario completa una recolección y gana 100 puntos
Usuario usuarioActualizado = nivelService.incrementarPuntosYActualizarNivel(
    usuarioId,
    100  // Puntos a incrementar
);
// El nivel se actualiza automáticamente si es necesario
```

### 3. Obtener la Progresión del Usuario
```java
NivelService.NivelProgressInfo progresion = nivelService.obtenerProgresionNivel(usuarioId);

// La respuesta contiene:
// - nivelActual: "Eco-Héroe"
// - puntosActuales: 150
// - puntosMinimos: 0
// - puntosMaximos: 249
// - porcentajeProgreso: 60 (60% del camino al siguiente nivel)
// - nivelSiguiente: "Eco-Explorador"
// - puntosParaSiguienteNivel: 100 (faltan 100 puntos para siguiente nivel)
```

### 4. Calcular el Nivel Manualmente
```java
NivelUsuario nivel = NivelUsuario.calcularNivel(350);
// Retorna: ECO_EXPLORADOR
```

## Integración con CitaController (Cuando se Completa una Recolección)

Para integrar el sistema de niveles con las citas completadas:

```java
@PostMapping("/{id}/completar")
@PreAuthorize("isAuthenticated()")
@Transactional
public ResponseEntity<ApiResponse<CitaDTO>> completarCita(
        @PathVariable Long id,
        @RequestBody CompletarCitaRequest req,
        Authentication auth) {
    
    String email = auth.getName();
    Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    Cita cita = citaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

    // Validar que pertenece al usuario
    if (!cita.getUsuario().getId().equals(usuario.getId())) {
        return ResponseEntity.status(403)
            .body(ApiResponse.fail("No tienes permiso para completar esta cita"));
    }

    // Marcar como completada
    cita.setEstado(EstadoCita.COMPLETADA);
    
    // Calcular puntos basándose en el material y cantidad
    int puntosGanados = calcularPuntos(cita.getMaterial(), cita.getCantidadEstimada());
    
    // INTEGRACIÓN CON SISTEMA DE NIVELES
    nivelService.incrementarPuntosYActualizarNivel(usuario.getId(), puntosGanados);
    
    cita = citaRepository.save(cita);
    return ResponseEntity.ok(ApiResponse.success(CitaDTO.fromEntity(cita)));
}

private int calcularPuntos(Material material, double cantidad) {
    // Ejemplo: 10 puntos por kg
    return (int) (cantidad * 10);
}
```

## API Endpoints Disponibles

### 1. Obtener Todos los Niveles Disponibles
```
GET /api/niveles/disponibles

Respuesta:
{
  "success": true,
  "data": [
    {
      "nombre": "ECO_HEROE",
      "displayName": "Eco-Héroe",
      "minPuntos": 0,
      "maxPuntos": 249
    },
    ...
  ]
}
```

### 2. Obtener Progresión del Usuario
```
GET /api/niveles/{usuarioId}/progresion

Respuesta:
{
  "success": true,
  "data": {
    "nivelActual": "Eco-Explorador",
    "puntosActuales": 350,
    "puntosMinimos": 250,
    "puntosMaximos": 499,
    "porcentajeProgreso": 33,
    "esNivelMaximo": false,
    "nivelSiguiente": "Eco-Guardabosques",
    "puntosParaSiguienteNivel": 150
  }
}
```

### 3. Incrementar Puntos (Admin)
```
POST /api/niveles/{usuarioId}/incrementar-puntos?puntos=100

Respuesta:
{
  "success": true,
  "message": "Puntos incrementados y nivel actualizado correctamente"
}
```

## Configuración en la Base de Datos

### Migración SQL Necesaria
```sql
-- Añadir columna de puntos a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN puntos INT DEFAULT 0 NOT NULL;

-- Actualizar el nivel inicial para usuarios existentes
UPDATE usuarios SET nivel = 'ECO_HEROE' WHERE nivel IS NULL;
UPDATE usuarios SET puntos = 0 WHERE puntos IS NULL;
```

## Consideraciones Importantes

1. **Actualización Automática**: Cada vez que se incrementan los puntos usando `incrementarPuntosYActualizarNivel()`, el nivel se calcula y actualiza automáticamente.

2. **Transacción Garantizada**: Todos los métodos del `NivelService` están anotados con `@Transactional` para garantizar consistencia en la base de datos.

3. **Validación de Puntos**: El sistema valida que los puntos no sean negativos.

4. **Nivel por Defecto**: Los nuevos usuarios comienzan con nivel "Eco-Héroe" y 0 puntos.

5. **Progresión Visual**: El método `obtenerProgresionNivel()` proporciona toda la información necesaria para mostrar barras de progreso en el frontend.

## Ejemplo de Progreso Visual en Frontend

```typescript
// En el componente Angular
this.estadisticas = {
  nivelActual: "Eco-Explorador",
  puntosActuales: 350,
  porcentajeProgreso: 33,
  puntosParaSiguienteNivel: 150,
  nivelSiguiente: "Eco-Guardabosques"
};

// En el template HTML
<div class="progreso-nivel">
  <h3>{{ estadisticas.nivelActual }}</h3>
  <div class="barra-progreso">
    <div class="progreso" [style.width.%]="estadisticas.porcentajeProgreso"></div>
  </div>
  <p>{{ estadisticas.puntosActuales }} puntos - 
     Faltan {{ estadisticas.puntosParaSiguienteNivel }} para {{ estadisticas.nivelSiguiente }}</p>
</div>
```

## Próximos Pasos

1. **Ejecutar la migración SQL** para añadir la columna de puntos
2. **Compilar el proyecto** para asegurar que no hay errores
3. **Probar los endpoints** desde Postman o similar
4. **Integrar con CitaController** para actualizar puntos cuando se completen recolecciones
5. **Actualizar el Frontend** para mostrar información de niveles
