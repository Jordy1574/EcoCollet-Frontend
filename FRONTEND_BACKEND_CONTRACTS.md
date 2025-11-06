# 🔄 Contratos Frontend ↔️ Backend

## 📌 Qué pide el Frontend y qué debe dar el Backend

---

## 🔐 AUTENTICACIÓN

### 1️⃣ Login
**Frontend solicita:**
```http
POST /api/auth/login
{
  "email": "usuario@mail.com",
  "password": "123456"
}
```

**Backend debe responder:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "nombre": "María González",
    "email": "usuario@mail.com",
    "rol": "CLIENTE"
  }
}
```

### 2️⃣ Registro
**Frontend solicita:**
```http
POST /api/auth/register
{
  "nombre": "María González",
  "email": "maria@mail.com",
  "password": "123456",
  "telefono": "999888777",
  "direccion": "Av. Larco 123, Miraflores"
}
```

**Backend debe responder:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 10,
    "nombre": "María González",
    "email": "maria@mail.com",
    "rol": "CLIENTE"
  }
}
```

---

## 👥 GESTIÓN DE USUARIOS (ADMIN)

### 3️⃣ Listar Usuarios
**Frontend solicita:**
```http
GET /api/admin/usuarios
Authorization: Bearer {token}
```

**Backend debe responder:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "María González",
      "email": "maria@mail.com",
      "rol": "CLIENTE",
      "telefono": "999888777",
      "direccion": "Av. Larco 123, Miraflores"
    }
  ]
}
```

### 4️⃣ Crear Usuario (Admin)
```http
POST /api/admin/usuarios
Authorization: Bearer {token}

{
  "nombre": "Juan Pérez",
  "email": "juan@mail.com",
  "password": "Temporal123*",
  "rol": "CLIENTE",
  "telefono": "988777666",
  "direccion": "Av. Pardo 456"
}
```

### 5️⃣ Actualizar Usuario
```http
PUT /api/admin/usuarios/15
Authorization: Bearer {token}

{
  "nombre": "Juan Pérez Actualizado",
  "rol": "RECOLECTOR",
  "telefono": "988777666"
}
```

### 6️⃣ Eliminar Usuario
```http
DELETE /api/admin/usuarios/15
Authorization: Bearer {token}
```
Respuesta: `204 No Content`

---

## 📦 GESTIÓN DE MATERIALES (ADMIN)

### 7️⃣ Listar Materiales
**Frontend solicita:**
```http
GET /api/admin/materiales
Authorization: Bearer {token}
```

**Backend debe responder:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Plástico",
      "precioPorKg": 2.50
    },
    {
      "id": 2,
      "nombre": "Papel",
      "precioPorKg": 1.80
    }
  ]
}
```

### 8️⃣ Crear Material
```http
POST /api/admin/materiales
{
  "nombre": "Vidrio",
  "precioPorKg": 1.20
}
```

### 9️⃣ Actualizar Material
```http
PUT /api/admin/materiales/3
{
  "nombre": "Vidrio",
  "precioPorKg": 1.50
}
```

### 🔟 Eliminar Material
```http
DELETE /api/admin/materiales/3
```

---

## 📍 PUNTOS DE RECICLAJE (ADMIN)

### 1️⃣1️⃣ Listar Puntos
**Frontend solicita:**
```http
GET /api/admin/puntos
Authorization: Bearer {token}
```

**Backend debe responder:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "EcoPoint Miraflores",
      "direccion": "Av. Larco 345",
      "telefono": "999888777",
      "horario": "Lun-Sab 08:00-18:00",
      "estado": "activo",
      "materialesAceptados": [
        { "id": 1, "nombre": "Plástico" },
        { "id": 2, "nombre": "Papel" }
      ]
    }
  ]
}
```

### 1️⃣2️⃣ Crear Punto
```http
POST /api/admin/puntos
{
  "nombre": "EcoPoint San Isidro",
  "direccion": "Av. Pardo 123",
  "telefono": "999888777",
  "horario": "Lun-Vie 09:00-17:00",
  "estado": "activo",
  "materialesAceptadosIds": [1, 2, 3]
}
```

### 1️⃣3️⃣ Actualizar Punto
```http
PUT /api/admin/puntos/5
{
  "nombre": "EcoPoint San Isidro Actualizado",
  "estado": "activo",
  "materialesAceptadosIds": [1, 2, 3, 4]
}
```

### 1️⃣4️⃣ Eliminar Punto
```http
DELETE /api/admin/puntos/5
```

---

## 📅 CITAS - USUARIO (CLIENTE)

### 1️⃣5️⃣ Crear Cita
**Frontend solicita:**
```http
POST /api/citas
Authorization: Bearer {token}

{
  "materialId": 1,
  "cantidadEstimada": 10.5,
  "fecha": "2025-11-10",
  "hora": "10:00",
  "notas": "Bolsas azules en la entrada"
}
```

⚠️ **IMPORTANTE:** NO se envía `usuarioId`. El backend lo obtiene del token JWT.

**Backend debe responder:**
```json
{
  "data": {
    "id": 15,
    "materialId": 1,
    "materialNombre": "Plástico",
    "cantidadEstimada": 10.5,
    "fecha": "2025-11-10",
    "hora": "10:00",
    "estado": "PENDIENTE",
    "notas": "Bolsas azules en la entrada",
    "recolectorNombre": null
  }
}
```

### 1️⃣6️⃣ Ver Mis Citas
**Frontend solicita:**
```http
GET /api/citas/mis-citas
Authorization: Bearer {token}
```

**Backend debe responder:**
```json
{
  "data": [
    {
      "id": 15,
      "materialId": 1,
      "materialNombre": "Plástico",
      "cantidadEstimada": 10.5,
      "fecha": "2025-11-10",
      "hora": "10:00",
      "estado": "PENDIENTE",
      "recolectorNombre": null
    }
  ]
}
```

### 1️⃣7️⃣ Cancelar Mi Cita
**Frontend solicita:**
```http
DELETE /api/citas/15
Authorization: Bearer {token}
```

⚠️ Solo se puede cancelar si `estado == "PENDIENTE"`

**Backend debe responder:** `204 No Content` o error si no se puede cancelar.

---

## 📅 CITAS - ADMIN

### 1️⃣8️⃣ Ver TODAS las Citas
**Frontend solicita:**
```http
GET /api/admin/citas
Authorization: Bearer {token}
```

**Backend debe responder:**
```json
{
  "data": [
    {
      "id": 1,
      "usuarioNombre": "María González",
      "usuarioDireccion": "Av. Larco 123, Miraflores",
      "materialNombre": "Plástico",
      "cantidadEstimada": 15.5,
      "fecha": "2025-11-10",
      "hora": "10:00",
      "estado": "PENDIENTE",
      "recolectorNombre": null
    },
    {
      "id": 2,
      "usuarioNombre": "Juan Pérez",
      "usuarioDireccion": "Av. Pardo 456",
      "materialNombre": "Papel",
      "cantidadEstimada": 8.0,
      "fecha": "2025-11-09",
      "hora": "14:00",
      "estado": "EN_PROCESO",
      "recolectorNombre": "Carlos Ruiz"
    }
  ]
}
```

⚠️ **Diferencia importante:**
- `/api/citas/mis-citas` → Solo citas del usuario autenticado
- `/api/admin/citas` → **TODAS** las citas del sistema

### 1️⃣9️⃣ Actualizar Cita (Admin)
**Frontend solicita:**
```http
PUT /api/admin/citas/15
Authorization: Bearer {token}

{
  "estado": "EN_PROCESO",
  "recolectorId": 8,
  "notas": "Asignado a Carlos"
}
```

**Backend debe responder:**
```json
{
  "data": {
    "id": 15,
    "estado": "EN_PROCESO",
    "recolectorNombre": "Carlos Ruiz"
  }
}
```

### 2️⃣0️⃣ Crear Cita (Admin, múltiples materiales)
El Admin puede crear una cita para cualquier usuario y asignar múltiples materiales con sus kg.

**Frontend solicita:**
```http
POST /api/admin/citas
Authorization: Bearer {token}

{
  "usuarioId": 5,
  "materiales": [
    { "materialId": 1, "kg": 10.5 },
    { "materialId": 2, "kg": 4.0 }
  ],
  "fecha": "2025-11-12",
  "hora": "09:30",
  "notas": "Recojo en recepción",
  "recolectorId": 8 // opcional
}
```

**Backend debe responder:**
```json
{
  "data": {
    "id": 101,
    "usuarioNombre": "Juan Pérez",
    "usuarioDireccion": "Av. Pardo 456",
    "items": [
      { "materialNombre": "Plástico", "kg": 10.5 },
      { "materialNombre": "Papel", "kg": 4.0 }
    ],
    "fecha": "2025-11-12",
    "hora": "09:30",
    "estado": "PENDIENTE",
    "recolectorNombre": null
  }
}
```

Notas de compatibilidad frontend:
- Si el backend devuelve `items`/`materiales`/`detalles` como arreglo, el frontend resume como: "N materiales" y "TotalKg kg".
- También sigue soportando la respuesta clásica con `materialNombre` + `cantidadEstimada`.

---

## �️ Qué debe agregar el Backend (para que funcione esto)

### 1) Entidades y tablas (si no existen)
- `Cita` (id, usuario_id, fecha, hora, estado, notas, recolector_id nullable, created_at)
- `CitaItem` (id, cita_id, material_id, kg decimal(10,2))
  - Relación: Cita 1..N CitaItem
  - En JPA: `@OneToMany(mappedBy="cita", cascade = CascadeType.ALL, orphanRemoval = true)`

### 2) DTOs de Request/Response
- `CreateCitaAdminRequest`
  - usuarioId: number (requerido)
  - materiales: [{ materialId: number, kg: number }] (requerido, min 1, kg > 0)
  - fecha: string (yyyy-MM-dd)
  - hora: string (HH:mm)
  - notas?: string
  - recolectorId?: number

- `UpdateCitaAdminRequest`
  - estado?: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA'
  - recolectorId?: number
  - notas?: string

- `CitaAdminDTO` (response)
  - id
  - usuarioNombre, usuarioDireccion
  - fecha, hora, estado (UPPERCASE)
  - recolectorNombre (nullable)
  - items: [{ materialId, materialNombre, kg }]
  - (Compatibilidad) Alternativa simple: materialNombre + cantidadEstimada

### 3) Endpoints (ADMIN)
- `GET /api/admin/citas` → retorna TODAS las citas (no filtrar por usuario del token)
- `POST /api/admin/citas` → crear cita con múltiples materiales
- `PUT /api/admin/citas/{id}` → actualizar estado/recolector/notas

Recomendación de seguridad: `@PreAuthorize("hasRole('ADMIN')")`

### 4) Validaciones mínimas
- `usuarioId`, `materialId`, `recolectorId` deben existir.
- `materiales.length >= 1` y cada `kg > 0`.
- Formato `fecha` = yyyy-MM-dd, `hora` = HH:mm.
- Transiciones de estado:
  - PENDIENTE → EN_PROCESO → COMPLETADA
  - CANCELADA desde PENDIENTE/EN_PROCESO
  - No permitir cambiar una COMPLETADA (opcional estricto)
- Si `estado = EN_PROCESO` o `COMPLETADA`, se recomienda exigir `recolectorId` asignado

### 5) Respuestas consistentes
- Wrapper `{ "data": ... }` en todas las respuestas.
- Campos presentables: `usuarioNombre`, `usuarioDireccion`, `recolectorNombre` ya resueltos.
- Si se usa `items`, cada item con `materialNombre` además de `materialId`.

### 6) Ejemplos en Java (Spring Boot)
```java
@PostMapping("/api/admin/citas")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> crearCitaAdmin(@RequestBody CreateCitaAdminRequest req) {
  Usuario usuario = usuarioRepo.findById(req.getUsuarioId())
    .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

  Cita cita = new Cita();
  cita.setUsuario(usuario);
  cita.setFecha(LocalDate.parse(req.getFecha()));
  cita.setHora(LocalTime.parse(req.getHora()));
  cita.setEstado(EstadoCita.PENDIENTE);
  cita.setNotas(req.getNotas());

  if (req.getRecolectorId() != null) {
    Usuario reco = usuarioRepo.findById(req.getRecolectorId())
      .orElseThrow(() -> new NotFoundException("Recolector no encontrado"));
    cita.setRecolector(reco);
  }

  List<CitaItem> items = req.getMateriales().stream().map(it -> {
    Material m = materialRepo.findById(it.getMaterialId())
      .orElseThrow(() -> new NotFoundException("Material no encontrado"));
    CitaItem ci = new CitaItem();
    ci.setMaterial(m);
    ci.setKg(BigDecimal.valueOf(it.getKg()));
    ci.setCita(cita);
    return ci;
  }).toList();
  cita.setItems(items);

  Cita guardada = citaRepo.save(cita);
  return ResponseEntity.ok(Map.of("data", CitaAdminDTO.from(guardada)));
}

@PutMapping("/api/admin/citas/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> actualizarCitaAdmin(@PathVariable Long id, @RequestBody UpdateCitaAdminRequest req) {
  Cita cita = citaRepo.findById(id)
    .orElseThrow(() -> new NotFoundException("Cita no encontrada"));

  if (req.getEstado() != null) {
    cita.setEstado(EstadoCita.valueOf(req.getEstado()));
  }
  if (req.getRecolectorId() != null) {
    Usuario reco = usuarioRepo.findById(req.getRecolectorId())
      .orElseThrow(() -> new NotFoundException("Recolector no encontrado"));
    cita.setRecolector(reco);
  }
  if (req.getNotas() != null) {
    cita.setNotas(req.getNotas());
  }
  citaRepo.save(cita);
  return ResponseEntity.ok(Map.of("data", CitaAdminDTO.from(cita)));
}
```

---

## �📊 DASHBOARD Y REPORTES (ADMIN)

### 2️⃣0️⃣ Resumen Dashboard
**Frontend solicita:**
```http
GET /api/admin/dashboard/resumen
Authorization: Bearer {token}
```

**Backend debe responder:**
```json
{
  "data": {
    "estadisticas": {
      "totalUsuarios": 245,
      "citasActivas": 23,
      "puntosActivos": 12,
      "kgRecolectadosEsteMes": 1247.5
    },
    "topUsuarios": [
      {
        "nombre": "María González",
        "totalKg": 125.5,
        "totalCitas": 15
      }
    ],
    "citasPorEstado": {
      "PENDIENTE": 15,
      "EN_PROCESO": 8,
      "COMPLETADA": 66,
      "CANCELADA": 5
    }
  }
}
```

### 2️⃣1️⃣ Estadísticas Generales
```http
GET /api/admin/reportes/estadisticas
Authorization: Bearer {token}
```

### 2️⃣2️⃣ Top Usuarios
```http
GET /api/admin/reportes/top-usuarios
Authorization: Bearer {token}
```

---

## ⚙️ CONFIGURACIÓN (ADMIN)

### 2️⃣3️⃣ Obtener Configuración
**Frontend solicita:**
```http
GET /api/admin/configuracion
Authorization: Bearer {token}
```

**Backend debe responder:**
```json
{
  "data": {
    "nombreSistema": "EcoCollet",
    "emailContacto": "admin@ecocollet.pe",
    "backupAutomatico": true,
    "notificaciones": {
      "email": true,
      "sms": false
    }
  }
}
```

### 2️⃣4️⃣ Actualizar Configuración
```http
PUT /api/admin/configuracion
{
  "emailContacto": "nuevo@ecocollet.pe",
  "notificaciones": { "email": true, "sms": true }
}
```

---

## 📋 PRIORIDADES DE IMPLEMENTACIÓN

### ⭐⭐⭐ CRÍTICO (Implementar primero)
1. ✅ `POST /api/auth/login` - Login
2. ✅ `POST /api/auth/register` - Registro
3. ✅ `POST /api/citas` - Usuario crea cita (usuarioId del token)
4. ✅ `GET /api/citas/mis-citas` - Usuario ve sus citas
5. ⏳ **`GET /api/admin/citas`** - Admin ve TODAS las citas
6. ⏳ **`PUT /api/admin/citas/{id}`** - Admin actualiza cita

### ⭐⭐ ALTO (Implementar pronto)
7. ✅ `GET /api/admin/usuarios` - Listar usuarios
8. ✅ CRUD completo de usuarios, materiales, puntos
9. ⏳ `DELETE /api/citas/{id}` - Cancelar cita

### ⭐ MEDIO (Implementar después)
10. ⏳ `GET /api/admin/dashboard/resumen` - Dashboard
11. ⏳ `GET /api/admin/configuracion` - Configuración

---

## 🔑 ENUMS Importantes

### Estados de Cita
```java
public enum EstadoCita {
    PENDIENTE,    // Recién creada
    EN_PROCESO,   // Recolector asignado
    COMPLETADA,   // Finalizada
    CANCELADA     // Cancelada
}
```

### Roles
```java
public enum Rol {
    ADMIN,        // Administrador
    RECOLECTOR,   // Recolector
    CLIENTE       // Usuario normal
}
```

---

## 📝 NOTAS TÉCNICAS

1. **Todas las responses usan wrapper:**
   ```json
   { "data": { ... } }
   ```

2. **Token JWT en headers:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Formato de fechas:**
   - Fecha: `"2025-11-10"` (yyyy-MM-dd)
   - Hora: `"10:00"` (HH:mm)

4. **usuarioId NUNCA se envía en POST /api/citas:**
   - El backend lo extrae automáticamente del token JWT

5. **Diferencia clave:**
   - `/api/citas/*` → Endpoints para CLIENTE
   - `/api/admin/citas` → Endpoints para ADMIN (ve todo)

---

## ✅ Checklist Backend

**Crítico:**
- [ ] GET `/api/admin/citas` - Admin ve TODAS las citas
- [ ] PUT `/api/admin/citas/{id}` - Admin actualiza cita (estado, recolector)

**Ya implementado (según frontend):**
- [x] POST `/api/auth/login`
- [x] POST `/api/auth/register`
- [x] POST `/api/citas` (usuarioId del token)
- [x] GET `/api/citas/mis-citas`
- [x] CRUD usuarios, materiales, puntos

**Pendiente:**
- [ ] DELETE `/api/citas/{id}` (cancelar cita)
- [ ] GET `/api/admin/dashboard/resumen`
- [ ] GET `/api/admin/reportes/*`
- [ ] GET/PUT `/api/admin/configuracion`

---

## 🎯 Endpoint Más Importante Ahora

```http
GET /api/admin/citas
Authorization: Bearer {token-admin}
```

**Debe retornar TODAS las citas del sistema**, no solo las del admin.

**Ejemplo implementación Java:**
```java
@GetMapping("/api/admin/citas")
public ResponseEntity<?> getAllCitas() {
    // NO filtrar por usuario del token
    // Retornar TODAS las citas de la BD
    List<Cita> todasLasCitas = citaRepository.findAll();
    return ResponseEntity.ok(Map.of("data", todasLasCitas));
}
```
