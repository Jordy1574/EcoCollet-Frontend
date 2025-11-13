# ✅ Flujo Correcto: Recolecciones de Usuario

## Arquitectura Actual

### Tabla Principal: `recolecciones`
Los usuarios crean sus "citas" (solicitudes de recolección) en la tabla **`recolecciones`**.

### Endpoints Usuario

#### Crear Recolección (Cita)
```http
POST /api/recolecciones
Authorization: Bearer <token_usuario>
Content-Type: application/json

{
  "tipoMaterial": "Plástico",
  "cantidadKg": 5.0,
  "direccion": "Av Ejemplo #123",
  "distrito": "Lima",
  "referencia": "Cerca del parque",
  "fechaRecojo": "2025-11-14T10:00:00"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 101,
    "tipoMaterial": "Plástico",
    "cantidadKg": 5.0,
    "estado": "PENDIENTE",
    "fechaRecojo": "2025-11-14T10:00:00"
  }
}
```

#### Consultar Mis Recolecciones
```http
GET /api/recolecciones/mis-recolecciones
Authorization: Bearer <token_usuario>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "tipoMaterial": "Plástico",
      "cantidadKg": 5.0,
      "estado": "COMPLETADA",
      "fechaRecojo": "2025-11-14T10:00:00",
      "fechaCompletada": "2025-11-14T11:30:00",
      "recolectorNombre": "Juan Pérez"
    }
  ]
}
```

### Endpoints Admin

#### Listar Todas las Recolecciones
```http
GET /api/admin/citas
Authorization: Bearer <token_admin>
```

**Response** (formato unificado):
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "usuarioNombre": "María López",
      "usuarioDireccion": "Av Ejemplo #123",
      "fecha": "2025-11-14",
      "hora": "10:00",
      "estado": "EN_PROCESO",
      "items": [
        {
          "materialNombre": "Plástico",
          "kg": 5.0
        }
      ],
      "recolectorNombre": "Juan Pérez"
    }
  ]
}
```

**Nota**: Estado `ASIGNADA` (de tabla recolecciones) se mapea como `EN_PROCESO` para UI.

#### Obtener Detalle de Recolección
```http
GET /api/admin/citas/{id}
Authorization: Bearer <token_admin>
```

#### Actualizar Recolección (Asignar, Cambiar Estado)
```http
PUT /api/admin/citas/{id}
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "recolectorId": 7,
  "estado": "COMPLETADA"
}
```

**Backend automáticamente**:
1. Busca id en tabla `recolecciones`
2. Asigna recolector si se proporcionó
3. Cambia estado (mapea EN_PROCESO → ASIGNADA si aplica)
4. Si estado es COMPLETADA:
   - Calcula `cantidadKg * 10` puntos
   - Acumula al usuario
   - Actualiza nivel automáticamente
   - Registra log

## Estados y Mapeo

### Estados en DB (tabla recolecciones)
- `PENDIENTE`: Recién creada, sin asignar
- `ASIGNADA`: Recolector asignado, en camino
- `COMPLETADA`: Finalizada, puntos acumulados
- `CANCELADA`: Cancelada por cualquier motivo

### Estados en UI (admin)
Para consistencia, el admin ve:
- `PENDIENTE` → `PENDIENTE`
- `ASIGNADA` → `EN_PROCESO`
- `COMPLETADA` → `COMPLETADA`
- `CANCELADA` → `CANCELADA`

Cuando admin envía `EN_PROCESO`, backend guarda como `ASIGNADA`.

## Sistema de Puntos

### Fórmula
```
Puntos Ganados = cantidadKg × 10
```

### Ejemplo
- Usuario tiene 50 puntos (nivel BRONCE)
- Completa recolección de 5kg
- Gana: 5 × 10 = 50 puntos
- Total: 100 puntos → nivel PLATA

### Log Generado
```
[PUNTOS] Usuario id=10 ganó 50 puntos (5.0kg de recolección). Total: 100 puntos. Nivel: PLATA
```

## Niveles

| Nivel    | Rango Puntos |
|----------|-------------|
| BRONCE   | 0 - 99      |
| PLATA    | 100 - 499   |
| ORO      | 500 - 999   |
| PLATINO  | 1000 - 4999 |
| DIAMANTE | 5000+       |

Se actualiza automáticamente al acumular puntos.

## Flujo End-to-End

```
1. Usuario:
   POST /api/recolecciones
   {"tipoMaterial": "Plástico", "cantidadKg": 5.0, ...}
   ↓
   Tabla: recolecciones (id=101, estado=PENDIENTE)

2. Admin lista:
   GET /api/admin/citas
   ↓
   Ve id=101 con estado=PENDIENTE

3. Admin asigna recolector:
   PUT /api/admin/citas/101
   {"recolectorId": 7}
   ↓
   Tabla: recolecciones.recolector_id=7

4. Admin marca en proceso:
   PUT /api/admin/citas/101
   {"estado": "EN_PROCESO"}
   ↓
   Tabla: recolecciones.estado=ASIGNADA

5. Admin completa:
   PUT /api/admin/citas/101
   {"estado": "COMPLETADA"}
   ↓
   Backend:
   - recolecciones.estado=COMPLETADA
   - fechaCompletada=now()
   - Calcula: 5kg × 10 = 50 puntos
   - usuarios.puntos += 50
   - Recalcula nivel
   - Log: "[PUNTOS] Usuario id=10 ganó 50 puntos..."

6. Usuario consulta:
   GET /api/recolecciones/mis-recolecciones
   ↓
   Ve estado=COMPLETADA

7. Usuario ve perfil:
   GET /api/usuarios/perfil
   ↓
   {"puntos": 100, "nivel": "PLATA"}
```

## Validaciones Backend

### Al Crear
- tipoMaterial no vacío
- cantidadKg > 0
- direccion y distrito obligatorios
- fechaRecojo válida

### Al Actualizar
- Requiere recolector para cambiar a ASIGNADA/EN_PROCESO
- Requiere recolector para COMPLETADA
- No permite cambios si ya está COMPLETADA o CANCELADA

### Transiciones Permitidas
- `PENDIENTE` → `ASIGNADA`, `COMPLETADA`, `CANCELADA`
- `ASIGNADA` → `COMPLETADA`, `CANCELADA`
- `COMPLETADA` → (ninguna)
- `CANCELADA` → (ninguna)

## Frontend: Checklist

### Usuario
- [x] Crear: `POST /api/recolecciones`
- [ ] Listar: `GET /api/recolecciones/mis-recolecciones`
- [ ] Ver perfil con puntos: `GET /api/usuarios/perfil`
- [ ] Mostrar historial con estados

### Admin
- [ ] Listar: `GET /api/admin/citas` (lee desde recolecciones)
- [ ] Ver detalle: `GET /api/admin/citas/{id}`
- [ ] Asignar recolector: `PUT /api/admin/citas/{id}` con recolectorId
- [ ] Cambiar estado: `PUT /api/admin/citas/{id}` con estado
- [ ] Mapear estados: mostrar ASIGNADA como EN_PROCESO

## Ventajas del Flujo Actual

1. **Simple**: Una tabla para recolecciones de usuario
2. **Unificado**: Admin gestiona todo desde `/api/admin/citas`
3. **Automático**: Puntos se acumulan sin intervención manual
4. **Trazable**: Logs completos de acumulación
5. **Escalable**: Preparado para sistema de canjes

## ¿Por Qué NO Usar Tabla `citas`?

La tabla `citas` puede reservarse para:
- Funcionalidad futura de multi-material
- Citas administrativas internas
- Otro flujo diferente

**Actualmente**: Todo el flujo de usuario funciona perfectamente con `recolecciones`.

---

**Estado**: ✅ 100% funcional
**Documentos relacionados**:
- `ADMIN_EDICION_RECOLECCIONES.md`: Detalles técnicos de edición
- `RESUMEN_FLUJO_COMPLETO_CITAS.md`: Resumen general
- `FRONTEND_CORRECCION_CITAS.md`: Guía para implementación frontend
