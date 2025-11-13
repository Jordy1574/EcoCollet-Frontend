# Guía Frontend: Sistema de Recolecciones (Citas de Usuario)

## Objetivo
Aclarar que los usuarios crean "citas" usando la tabla `recolecciones` mediante `POST /api/recolecciones`. El panel admin visualiza y gestiona estas recolecciones, acumulando puntos automáticamente al completarlas.

## Flujo Correcto

### Usuario Crea Cita (Recolección)
El usuario agenda una recolección que el admin gestionará.

**Endpoint**: `POST /api/recolecciones`  
**Auth**: Header `Authorization: Bearer <token_usuario_CLIENTE>`

### 2. Payload (Formato Recolección)
Ejemplo de payload para crear una recolección:
```json
{
  "tipoMaterial": "Plástico",
  "cantidadKg": 5.0,
  "direccion": "Av X #123",
  "distrito": "Lima",
  "referencia": "Cerca del parque principal",
  "fechaRecojo": "2025-11-14T10:00:00"
}
```

**Campos obligatorios**:
- `tipoMaterial`: Nombre del material (ej: "Plástico", "Papel", "Vidrio")
- `cantidadKg`: Cantidad estimada en kilogramos (número decimal)
- `direccion`: Dirección completa de recolección
- `distrito`: Distrito donde se recogerá
- `fechaRecojo`: Fecha y hora deseada en formato ISO (YYYY-MM-DDTHH:mm:ss)

**Campos opcionales**:
- `referencia`: Punto de referencia para facilitar ubicación

Notas:
- El `cliente_id` se infiere automáticamente del token.
- Estado inicial será `PENDIENTE`.

### 3. Modelos / Interfaces en Frontend
Interfaz para recolección:
```ts
interface RecoleccionRequest {
  tipoMaterial: string;
  cantidadKg: number;
  direccion: string;
  distrito: string;
  referencia?: string;
  fechaRecojo: string; // "YYYY-MM-DDTHH:mm:ss"
}

interface RecoleccionResponse {
  id: number;
  tipoMaterial: string;
  cantidadKg: number;
  direccion: string;
  distrito: string;
  fechaRecojo: string;
  estado: 'PENDIENTE' | 'ASIGNADA' | 'COMPLETADA' | 'CANCELADA';
  recolectorNombre?: string;
}
```

### 4. Construcción del Formulario
- Campo select o dropdown para `tipoMaterial` (Plástico, Papel, Vidrio, Metal, etc.)
- Input numérico para `cantidadKg` (con validación > 0)
- Input de texto para `direccion`
- Select para `distrito`
- Input opcional para `referencia`
- Date/time picker para `fechaRecojo` (validar fecha futura)

### 5. Renderizado en Panel Admin
- Consumir `GET /api/admin/citas`.
- Cada entrada muestra:
  - Material único: `item.tipoMaterial + ' x' + item.cantidadKg + 'kg'`
  - Dirección: `item.direccion`
  - Estado mapeado: `ASIGNADA` se muestra como `EN_PROCESO` en UI
- Estados soportados para display: `PENDIENTE`, `EN_PROCESO`, `COMPLETADA`, `CANCELADA`.

### 6. Estados y Transiciones
- Backend usa estados de recolección: `PENDIENTE`, `ASIGNADA`, `COMPLETADA`, `CANCELADA`.
- Para consistencia UI, `ASIGNADA` se muestra como `EN_PROCESO`.
- Acciones admin válidas:
  - Asignar recolector: cualquier momento
  - Cambiar a `EN_PROCESO`/`ASIGNADA`: requiere recolector
  - Cambiar a `COMPLETADA`: requiere recolector, acumula puntos automáticamente
  - Cambiar a `CANCELADA`: en cualquier momento antes de completar

### 7. Validaciones Frontend
- `cantidadKg > 0`
- `tipoMaterial` no vacío
- `direccion` y `distrito` obligatorios
- `fechaRecojo` debe ser fecha/hora futura

### 8. Ejemplo Llamada Fetch (Crear Recolección)
```js
fetch('/api/recolecciones', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    tipoMaterial: materialSeleccionado,
    cantidadKg: cantidad,
    direccion,
    distrito,
    referencia,
    fechaRecojo
  })
})
  .then(r => r.json())
  .then(data => {
    // Actualizar lista local, mostrar confirmación
  });
```

### 9. Checklist de Implementación
- [ ] Endpoint correcto: `POST /api/recolecciones`
- [ ] Payload con campos: tipoMaterial, cantidadKg, direccion, distrito, fechaRecojo
- [ ] Interfaz RecoleccionRequest definida
- [ ] Panel admin consume `GET /api/admin/citas`
- [ ] Panel admin edita con `PUT /api/admin/citas/{id}`
- [ ] Usuario consulta con `GET /api/recolecciones/mis-recolecciones`
- [ ] Validaciones agregadas (cantidadKg > 0, fecha futura)
- [ ] Estados mapeados correctamente en UI (ASIGNADA → EN_PROCESO)

### 10. Consulta de Usuario
Usuario puede ver su historial de recolecciones:
```js
fetch('/api/recolecciones/mis-recolecciones', {
  headers: { 'Authorization': 'Bearer ' + userToken }
})
.then(r => r.json())
.then(data => {
  data.data.forEach(rec => {
    console.log(`${rec.tipoMaterial}: ${rec.estado} - ${rec.cantidadKg}kg`);
  });
});
```

### 14. Preguntas Frecuentes
**¿El usuario puede crear múltiples materiales en una recolección?** No, por ahora es un material por recolección. Si necesita reciclar varios tipos, crea múltiples recolecciones.
**¿Necesito enviar `cliente_id`?** No, se toma del token JWT automáticamente.
**¿Qué estados ve el usuario?** `PENDIENTE`, `ASIGNADA`, `COMPLETADA`, `CANCELADA`.
**¿Cómo funcionan los puntos?** El usuario acumula **10 puntos por cada kg** cuando admin marca como COMPLETADA.
**¿Habrá paginación?** Planeada como mejora posterior.

### 15. Sistema de Puntos y Niveles
#### Acumulación Automática
- Cuando el admin cambia una cita a estado `COMPLETADA`, el backend:
  1. Calcula total de kg recolectados (suma de todos los items).
  2. Otorga **10 puntos por kg** al usuario (ej: 5kg = 50 puntos).
  3. Actualiza automáticamente el nivel del usuario según los puntos acumulados.
  4. Registra log de la transacción.

#### Visualización Usuario
- Endpoint: `GET /api/citas/mis-citas` (con token CLIENTE).
- Retorna lista de citas del usuario con estado actual.
- El usuario ve:
  - Estado: `PENDIENTE`, `EN_PROCESO`, `COMPLETADA`, `CANCELADA`.
  - Materiales y cantidades.
  - Fecha/hora programada.
  - Recolector asignado (si aplica).

#### Endpoint Perfil Usuario
- `GET /api/usuarios/perfil` retorna:
  - `puntos`: Total acumulado.
  - `nivel`: Nivel actual (BRONCE, PLATA, ORO, PLATINO, DIAMANTE).
  - Otras estadísticas.

#### Niveles
El sistema calcula automáticamente el nivel según puntos:
- **BRONCE**: 0-99 puntos
- **PLATA**: 100-499 puntos
- **ORO**: 500-999 puntos
- **PLATINO**: 1000-4999 puntos
- **DIAMANTE**: 5000+ puntos

#### Frontend Tareas
- Mostrar puntos y nivel en perfil usuario.
- Indicar en listado de citas cuáles están `COMPLETADA` (para que usuario sepa que ya acumuló puntos).
- Opcional: Animación/notificación cuando se complete una cita mostrando puntos ganados (requiere polling o WebSocket).

### 16. Estado Final Esperado
Todos los registros de citas de usuario se guardan en tabla `recolecciones` mediante `POST /api/recolecciones`; panel admin muestra y edita estas recolecciones desde `/api/admin/citas`; **sistema de puntos funcionando automáticamente al completar recolecciones**.

### 17. Flujo Completo Validado
1. **Usuario crea recolección**: `POST /api/recolecciones` con material, kg, dirección → queda `PENDIENTE`.
2. **Admin visualiza**: `GET /api/admin/citas` → ve la nueva recolección.
3. **Admin asigna recolector**: `PUT /api/admin/citas/{id}` con `recolectorId`.
4. **Admin cambia estado**: `PUT /api/admin/citas/{id}` con `estado=EN_PROCESO` (backend guarda como ASIGNADA).
5. **Recolección completa**: Admin cambia a `estado=COMPLETADA` → **backend acumula puntos automáticamente** (10 puntos/kg).
6. **Usuario consulta**: `GET /api/recolecciones/mis-recolecciones` → ve estado `COMPLETADA`.
7. **Usuario ve puntos**: `GET /api/usuarios/perfil` → puntos actualizados y nivel recalculado.

---
**Estado Backend**: ✅ Completamente funcional con acumulación automática de puntos para recolecciones.
