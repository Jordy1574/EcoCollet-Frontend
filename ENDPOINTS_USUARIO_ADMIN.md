# 🎯 ENDPOINTS USUARIO vs ADMIN - Guía Rápida

## ⚠️ PROBLEMA

Usuario recibe **403 Forbidden** porque llama a endpoints de admin.

---

## ✅ SOLUCIÓN

### **USUARIO:**
```typescript
'http://localhost:8080/api/puntos-reciclaje'
```

### **ADMIN:**
```typescript
'http://localhost:8080/api/admin/puntos'
```

---

## 🔧 CAMBIO EN FRONTEND

### Buscar y reemplazar:

**❌ ANTES (usuario-dashboard.component.ts):**
```typescript
this.http.get('http://localhost:8080/api/admin/puntos')
```

**✅ DESPUÉS:**
```typescript
this.http.get('http://localhost:8080/api/puntos-reciclaje')
```

---

## 📋 Tabla de Endpoints

| Acción | Usuario | Admin |
|--------|---------|-------|
| Ver todos | `GET /api/puntos-reciclaje` | `GET /api/admin/puntos` |
| Ver uno | `GET /api/puntos-reciclaje/{id}` | `GET /api/admin/puntos/{id}` |
| Crear | ❌ | `POST /api/admin/puntos` |
| Actualizar | ❌ | `PUT /api/admin/puntos/{id}` |
| Eliminar | ❌ | `DELETE /api/admin/puntos/{id}` |

---

## 🧪 Código Completo Usuario

```typescript
cargarPuntosDeReciclaje() {
  const token = localStorage.getItem('token');
  
  this.http.get('http://localhost:8080/api/puntos-reciclaje', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }).subscribe({
    next: (response: any) => {
      if (response.success) {
        this.puntos = response.data;
      }
    },
    error: (error) => {
      console.error('Error:', error.status);
    }
  });
}
```

---

## ✅ Respuesta Esperada

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "EcoPoint Miraflores",
      "direccion": "Av. Larco 345, Miraflores",
      "estado": "activo",
      "horario": "Lun-Vie: 8am-6pm",
      "googleMapsUrl": "https://maps.google.com/...",
      "materialesAceptados": [...]
    }
  ]
}
```

---

## 🐛 Errores

- **403** = Usuario usa endpoint admin → Cambiar URL
- **401** = Token expirado → Login de nuevo
- **404** = Endpoint no existe → Verificar backend

---

**Backend:** ✅ Listo  
**Cambio:** Solo URL en frontend usuario
