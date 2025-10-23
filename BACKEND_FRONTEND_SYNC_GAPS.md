# 🔧 Ajustes Finales Backend - EcoCollet Admin CRUDs

## 📋 Contexto

El backend ya implementó los 3 CRUDs y la autenticación JWT. Sin embargo, hay **pequeños desajustes** entre los campos que el frontend envía/espera y lo que el backend procesa. Este documento lista los ajustes específicos necesarios para sincronizar completamente.

---

## 🎯 Los 3 CRUDs del Admin

1. **CRUD de Usuarios** (`UsuariosCrudComponent`)
2. **CRUD de Materiales** (`MaterialesCrudComponent`)
3. **CRUD de Puntos de Reciclaje** (`PuntosReciclajeCrudComponent`)

---

## 1️⃣ CRUD DE USUARIOS - Ajustes Necesarios

### ✅ Lo que YA funciona
- GET `/api/admin/usuarios` - Lista usuarios
- POST `/api/admin/usuarios` - Crea usuario
- PUT `/api/admin/usuarios/{id}` - Actualiza usuario
- DELETE `/api/admin/usuarios/{id}` - Elimina usuario
- Password hasheado con BCrypt
- Rol protegido (solo ADMIN)

### ⚠️ Ajustes requeridos

#### 1.1. Campo `distrito` vs `direccion`

**Problema**: El frontend usa `distrito` pero el backend tiene `direccion`.

**Request del Frontend (POST/PUT)**:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "password": "Pass123*",
  "rol": "Usuario",           // Frontend: 'Admin'|'Recolector'|'Usuario'
  "distrito": "Miraflores",   // ❌ Frontend envía "distrito"
  "telefono": "999888777",
  "estado": "Activo"           // ⚠️ Backend NO usa este campo
}
```

**Response esperada por Frontend**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "rol": "ADMIN",            // ✅ Backend devuelve ADMIN/RECOLECTOR/CLIENTE
    "distrito": "Miraflores",  // ❌ Frontend espera "distrito"
    "telefono": "999888777",
    "estado": "Activo",        // ⚠️ Frontend necesita este campo
    "fechaRegistro": "2024-03-20T10:30:00"
  }
}
```

**Solución Backend**:

**Opción A (Recomendada)**: Agregar campo `distrito` a la entidad Usuario
```java
@Entity
public class Usuario {
    // ... campos existentes
    
    private String telefono;
    private String direccion;  // Mantener para compatibilidad
    
    @Column(length = 100)
    private String distrito;   // ✅ AGREGAR este campo
    
    // En el DTO de request:
    @Size(max = 100)
    private String distrito;   // ✅ AGREGAR
}
```

**Opción B (Rápida)**: Mapear `distrito` a `direccion` en el controller
```java
@PostMapping
public ResponseEntity<ApiResponse<UsuarioResponse>> create(@Valid @RequestBody UsuarioAdminRequest request) {
    Usuario usuario = new Usuario();
    // ... otros campos
    usuario.setDireccion(request.getDistrito());  // ✅ Mapear distrito -> direccion
    // ...
}

// Y en UsuarioResponse:
public class UsuarioResponse {
    // ... campos existentes
    
    @JsonProperty("distrito")  // ✅ Alias para JSON
    public String getDistrito() {
        return this.direccion;  // Devolver direccion como distrito
    }
}
```

#### 1.2. Campo `estado` (UI-only)

**Problema**: El frontend muestra y edita `estado` ('Activo'|'Suspendido'|'Inactivo') pero el backend NO tiene este campo.

**Solución Backend**:

**Opción A**: Agregar campo `estado` a la entidad (si quieres gestionar usuarios suspendidos)
```java
public enum EstadoUsuario {
    ACTIVO,
    SUSPENDIDO,
    INACTIVO
}

@Entity
public class Usuario {
    // ... otros campos
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoUsuario estado = EstadoUsuario.ACTIVO;  // ✅ AGREGAR
}
```

**Opción B**: Ignorar en backend, el frontend lo maneja localmente (no se guarda en BD)
```java
// En UsuarioResponse, devolver siempre "Activo"
public class UsuarioResponse {
    // ...
    private String estado = "Activo";  // Hardcoded
}
```

**Recomendación**: Opción A si planeas suspender usuarios en el futuro, Opción B si es solo decorativo.

#### 1.3. Mapeo de Roles

**✅ Ya funciona correctamente**:
- Frontend envía: `'Admin'|'Recolector'|'Usuario'`
- Backend recibe y convierte a: `'ADMIN'|'RECOLECTOR'|'CLIENTE'`
- Backend devuelve: `'ADMIN'|'RECOLECTOR'|'CLIENTE'`
- Frontend mapea de vuelta: `'Admin'|'Recolector'|'Usuario'`

**Verificar en backend**:
```java
// DTO Request
public class UsuarioAdminRequest {
    @NotNull
    private RolUsuario rol;  // ✅ Acepta ADMIN, RECOLECTOR, CLIENTE
}

// Para soportar el frontend, agregar método custom en el DTO:
public void setRol(String rolString) {
    switch (rolString.toLowerCase()) {
        case "admin": this.rol = RolUsuario.ADMIN; break;
        case "recolector": this.rol = RolUsuario.RECOLECTOR; break;
        case "usuario": this.rol = RolUsuario.CLIENTE; break;
        default: this.rol = RolUsuario.CLIENTE;
    }
}
```

---

## 2️⃣ CRUD DE MATERIALES - Ajustes Necesarios

### ✅ Lo que YA funciona
- GET `/api/admin/materiales` - Lista materiales
- POST `/api/admin/materiales` - Crea material
- PUT `/api/admin/materiales/{id}` - Actualiza material
- DELETE `/api/admin/materiales/{id}` - Elimina material
- GET `/api/admin/materiales/search?query=texto` - Búsqueda

### ⚠️ Ajustes requeridos

#### 2.1. Campos extra que el frontend necesita

**Request del Frontend (POST/PUT)**:
```json
{
  "nombre": "Plástico",
  "tipo": "plastico",              // ⚠️ Frontend envía esto, backend NO lo usa
  "cantidad": "1245 kg",           // ⚠️ Frontend envía esto, backend NO lo usa
  "periodo": "Este mes",           // ⚠️ Frontend envía esto, backend NO lo usa
  "info": {
    "precioPromedio": "S/. 2.50/kg",  // ✅ Frontend parsea a precioPorKg: 2.5
    "puntosActivos": "12",            // ⚠️ Backend NO usa esto
    "ultimaActualizacion": "Hoy"      // ⚠️ Backend NO usa esto
  }
}
```

**Response esperada por Frontend**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Plástico",
    "precioPorKg": 2.5,           // ✅ Backend devuelve esto
    // ⚠️ Frontend NECESITA estos campos para mostrar correctamente:
    "tipo": "plastico",           // Calculado del nombre
    "cantidad": "0 kg",           // Placeholder
    "periodo": "Este mes",        // Placeholder
    "info": {
      "precioPromedio": "S/. 2.50/kg",  // Formateado de precioPorKg
      "puntosActivos": "0",             // Placeholder
      "ultimaActualizacion": "Hoy"      // Placeholder
    }
  }
}
```

**Solución Backend**:

El frontend **ya mapea automáticamente** en `AdminApiService`, pero para que funcione mejor:

**En MaterialResponse, agregar campos calculados**:
```java
@Data
public class MaterialResponse {
    private Long id;
    private String nombre;
    private Double precioPorKg;
    
    // ✅ AGREGAR estos campos calculados para el frontend
    @JsonProperty("tipo")
    public String getTipo() {
        return normalizarTipo(this.nombre);
    }
    
    @JsonProperty("info")
    public Map<String, String> getInfo() {
        Map<String, String> info = new HashMap<>();
        info.put("precioPromedio", String.format("S/. %.2f/kg", this.precioPorKg));
        info.put("puntosActivos", "0");  // TODO: calcular real
        info.put("ultimaActualizacion", "Hoy");  // TODO: usar fechaActualizacion
        return info;
    }
    
    private String normalizarTipo(String nombre) {
        String n = nombre.toLowerCase();
        if (n.contains("plast") || n.contains("pvc")) return "plastico";
        if (n.contains("papel") || n.contains("carton")) return "papel";
        if (n.contains("vidri")) return "vidrio";
        if (n.contains("metal") || n.contains("alumin")) return "metal";
        return "otros";
    }
}
```

**O más simple (el frontend ya lo hace)**: Dejar solo `{ id, nombre, precioPorKg }` y el frontend se encarga del resto ✅

---

## 3️⃣ CRUD DE PUNTOS DE RECICLAJE - Ajustes Necesarios

### ✅ Lo que YA funciona
- GET `/api/admin/puntos` - Lista puntos
- POST `/api/admin/puntos` - Crea punto
- PUT `/api/admin/puntos/{id}` - Actualiza punto
- DELETE `/api/admin/puntos/{id}` - Elimina punto
- GET `/api/admin/puntos/search?query=texto` - Búsqueda
- GET `/api/admin/puntos/estado/{estado}` - Filtro por estado

### ⚠️ Ajustes requeridos

#### 3.1. Campos `tipo`, `tipoTexto`, `horario` (UI-only)

**Request del Frontend (POST/PUT)**:
```json
{
  "nombre": "EcoPoint Miraflores",
  "direccion": "Av. Larco 345",
  "telefono": "012345678",
  "estado": "activo",                    // ✅ Backend usa esto
  "tipo": "principal",                   // ⚠️ Frontend envía, backend NO usa
  "tipoTexto": "Centro Principal",       // ⚠️ Frontend envía, backend NO usa
  "horario": "Lun-Sáb 8AM-6PM",         // ⚠️ Frontend envía, backend NO usa
  "materiales": ["Plástico", "Papel"],   // ❌ Frontend envía nombres
  "materialesAceptadosIds": [1, 2]       // ✅ Backend espera IDs
}
```

**Response esperada por Frontend**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "EcoPoint Miraflores",
    "direccion": "Av. Larco 345",
    "telefono": "012345678",
    "estado": "activo",                    // ✅ Backend devuelve esto
    // ⚠️ Frontend NECESITA:
    "tipo": "principal",                   // Placeholder
    "tipoTexto": "Centro Principal",       // Placeholder
    "horario": "Lun-Sáb 8AM-6PM",         // Placeholder o campo real
    // ✅ Backend devuelve:
    "materialesAceptados": [
      { "id": 1, "nombre": "Plástico", "precioPorKg": 2.5 },
      { "id": 2, "nombre": "Papel", "precioPorKg": 1.8 }
    ]
  }
}
```

**Solución Backend**:

**Opción A**: Agregar campos a la entidad PuntoReciclaje (si quieres usarlos en el futuro)
```java
@Entity
public class PuntoReciclaje {
    // ... campos existentes
    
    @Column(length = 50)
    private String tipo;  // ✅ AGREGAR: 'principal', 'empresarial', 'comunitario'
    
    @Column(length = 100)
    private String horario;  // ✅ AGREGAR: 'Lun-Vie 8AM-6PM'
}

// En PuntoReciclajeResponse:
public class PuntoReciclajeResponse {
    // ... campos existentes
    private String tipo;
    private String horario;
    
    @JsonProperty("tipoTexto")
    public String getTipoTexto() {
        if (tipo == null) return "Centro Principal";
        switch (tipo) {
            case "principal": return "Centro Principal";
            case "empresarial": return "Centro Empresarial";
            case "comunitario": return "Centro Comunitario";
            default: return "Centro Principal";
        }
    }
}
```

**Opción B (Rápida)**: Devolver placeholders en el response
```java
public class PuntoReciclajeResponse {
    // ... campos existentes
    
    // Campos calculados (no se guardan en BD)
    public String getTipo() {
        return "principal";  // Hardcoded
    }
    
    public String getTipoTexto() {
        return "Centro Principal";  // Hardcoded
    }
    
    public String getHorario() {
        return "";  // Vacío, el frontend maneja default
    }
}
```

**Recomendación**: Opción A si quieres categorizar puntos, Opción B si solo es decorativo.

#### 3.2. Mapeo de materiales (nombres ↔ IDs)

**✅ Esto YA funciona bien**:
- Frontend: Al crear/editar, convierte nombres → IDs llamando primero `GET /api/admin/materiales`
- Backend: Recibe `materialesAceptadosIds: [1, 2, 3]` y devuelve `materialesAceptados: [{ id, nombre, precioPorKg }, ...]`

**Verificar en backend que PuntoReciclajeResponse incluya**:
```java
public class PuntoReciclajeResponse {
    // ...
    private List<MaterialSimpleResponse> materialesAceptados;  // ✅ DEBE incluir esto
}

class MaterialSimpleResponse {
    private Long id;
    private String nombre;
    private Double precioPorKg;  // Opcional pero útil
}
```

**IMPORTANTE**: El array `materialesAceptados` debe venir **completo con los objetos Material**, no solo IDs.

---

## 📊 Resumen de Cambios por CRUD

### 1. CRUD Usuarios

| Campo | Frontend | Backend Actual | Acción Requerida |
|-------|----------|----------------|------------------|
| `id` | ✅ | ✅ | OK |
| `nombre` | ✅ | ✅ | OK |
| `email` | ✅ | ✅ | OK |
| `password` | ✅ | ✅ | OK (solo POST, opcional PUT) |
| `rol` | 'Admin'/'Recolector'/'Usuario' | ADMIN/RECOLECTOR/CLIENTE | ✅ Mapeo OK |
| `distrito` | ✅ | ❌ (tiene `direccion`) | **AGREGAR** o mapear |
| `telefono` | ✅ | ✅ | OK |
| `estado` | ✅ | ❌ | **AGREGAR** o devolver placeholder |
| `fechaRegistro` | ✅ | ✅ | OK |

### 2. CRUD Materiales

| Campo | Frontend | Backend Actual | Acción Requerida |
|-------|----------|----------------|------------------|
| `id` | ✅ | ✅ | OK |
| `nombre` | ✅ | ✅ | OK |
| `precioPorKg` | ✅ (parseado de info.precioPromedio) | ✅ | OK |
| `tipo` | ✅ | ❌ | Opcional (frontend calcula) |
| `cantidad` | ✅ | ❌ | Opcional (placeholder) |
| `periodo` | ✅ | ❌ | Opcional (placeholder) |
| `info.precioPromedio` | ✅ | ❌ | Opcional (formatear precioPorKg) |
| `info.puntosActivos` | ✅ | ❌ | Opcional (placeholder) |
| `info.ultimaActualizacion` | ✅ | ❌ | Opcional (placeholder) |

### 3. CRUD Puntos

| Campo | Frontend | Backend Actual | Acción Requerida |
|-------|----------|----------------|------------------|
| `id` | ✅ | ✅ | OK |
| `nombre` | ✅ | ✅ | OK |
| `direccion` | ✅ | ✅ | OK |
| `telefono` | ✅ | ✅ | OK |
| `estado` | 'Activo'/'Inactivo'/'Mantenimiento' | activo/inactivo/mantenimiento | ✅ Mapeo OK |
| `tipo` | ✅ | ❌ | **AGREGAR** o placeholder |
| `tipoTexto` | ✅ | ❌ | Calcular de `tipo` |
| `horario` | ✅ | ❌ | **AGREGAR** o placeholder |
| `materialesAceptados` | ✅ | ✅ | **VERIFICAR** que venga array completo |
| `materialesAceptadosIds` | ✅ (solo en POST/PUT) | ✅ | OK |

---

## 🔧 Cambios Mínimos Recomendados (Quick Fixes)

### Para que TODO funcione HOY (sin modificar entidades):

#### En `UsuarioResponse.java`:
```java
@Data
public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String email;
    private RolUsuario rol;
    private String telefono;
    private String direccion;
    
    // ✅ Agregar alias para distrito
    @JsonProperty("distrito")
    public String getDistrito() {
        return this.direccion;
    }
    
    // ✅ Agregar estado default
    public String getEstado() {
        return "Activo";
    }
}
```

#### En `MaterialResponse.java`:
```java
@Data
public class MaterialResponse {
    private Long id;
    private String nombre;
    private Double precioPorKg;
    
    // ✅ Opcional: agregar campos calculados
    public String getTipo() {
        return inferirTipo(this.nombre);
    }
    
    @JsonProperty("info")
    public Map<String, String> getInfo() {
        Map<String, String> info = new HashMap<>();
        info.put("precioPromedio", String.format("S/. %.2f/kg", this.precioPorKg));
        info.put("puntosActivos", "0");
        info.put("ultimaActualizacion", "Hoy");
        return info;
    }
    
    private String inferirTipo(String nombre) {
        String n = nombre.toLowerCase();
        if (n.contains("plast")) return "plastico";
        if (n.contains("papel")) return "papel";
        if (n.contains("vidri")) return "vidrio";
        if (n.contains("metal")) return "metal";
        return "otros";
    }
}
```

#### En `PuntoReciclajeResponse.java`:
```java
@Data
public class PuntoReciclajeResponse {
    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String estado;
    private List<MaterialSimpleResponse> materialesAceptados;  // ✅ CRÍTICO
    
    // ✅ Agregar placeholders
    public String getTipo() {
        return "principal";
    }
    
    @JsonProperty("tipoTexto")
    public String getTipoTexto() {
        return "Centro Principal";
    }
    
    public String getHorario() {
        return "";
    }
}
```

---

## ✅ Checklist de Verificación

### Usuarios
- [ ] Campo `distrito` disponible en response (alias de `direccion`)
- [ ] Campo `estado` disponible en response (default 'Activo' o real)
- [ ] Mapeo rol 'Admin'/'Recolector'/'Usuario' ↔ ADMIN/RECOLECTOR/CLIENTE
- [ ] Password NO expuesto en responses (@JsonIgnore)

### Materiales
- [ ] Response incluye `precioPorKg` (número)
- [ ] Opcional: `tipo`, `info` calculados para mejor UX
- [ ] Búsqueda `/search?query=` funciona case-insensitive

### Puntos
- [ ] Response incluye array `materialesAceptados` completo (no solo IDs)
- [ ] Cada material en el array tiene: `id`, `nombre`, `precioPorKg`
- [ ] Opcional: campos `tipo`, `tipoTexto`, `horario`
- [ ] Estado en minúsculas: 'activo'/'inactivo'/'mantenimiento'

### Generales
- [ ] Todas las responses usan wrapper `ApiResponse<T>`
- [ ] CORS habilitado para `http://localhost:4200`
- [ ] JWT válido requerido en `/api/admin/**`
- [ ] Solo rol ADMIN puede acceder

---

## 🧪 Cómo Probar

### 1. Test de Usuarios
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecocollect.com","password":"Admin123!"}'

# Crear usuario
curl -X POST http://localhost:8080/api/admin/usuarios \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Usuario",
    "email": "test@test.com",
    "password": "Test123*",
    "rol": "CLIENTE",
    "telefono": "999888777",
    "direccion": "Miraflores"
  }'

# Verificar response incluye: distrito, estado
```

### 2. Test de Materiales
```bash
# Crear material
curl -X POST http://localhost:8080/api/admin/materiales \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Plástico PET","precioPorKg":2.5}'

# Verificar response incluye: id, nombre, precioPorKg
# Opcional: tipo, info
```

### 3. Test de Puntos
```bash
# Listar materiales primero
curl http://localhost:8080/api/admin/materiales \
  -H "Authorization: Bearer <TOKEN>"

# Crear punto (usar IDs reales de materiales)
curl -X POST http://localhost:8080/api/admin/puntos \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "EcoPoint Test",
    "direccion": "Av. Test 123",
    "telefono": "012345678",
    "estado": "activo",
    "materialesAceptadosIds": [1, 2]
  }'

# Verificar response incluye: materialesAceptados con objetos completos
```

---

## 📞 Siguiente Paso

Una vez aplicados estos ajustes, el frontend debería:

1. ✅ Listar usuarios/materiales/puntos correctamente
2. ✅ Crear nuevos registros sin errores
3. ✅ Editar registros existentes y guardar cambios
4. ✅ Eliminar registros con confirmación

Si después de estos cambios algo sigue fallando, revisar:
- Console del navegador (errores JS)
- Network tab (status code y response body)
- Logs del backend (exceptions)

---

**Documento actualizado:** Octubre 2024  
**Prioridad:** 🟡 MEDIA - Mejoras de compatibilidad  
**Tiempo estimado:** 1-2 horas de ajustes
