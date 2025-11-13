# 👥 Usuarios de Prueba para EcoCollet

El backend en Azure ya tiene usuarios de prueba configurados. Puedes usar cualquiera de estos para iniciar sesión:

## 🔐 Credenciales de Acceso

### 👨‍💼 Administrador
- **Email:** `admin@ecocollect.com`
- **Password:** `admin123`
- **Rol:** ADMIN
- **Permisos:** Acceso completo al sistema

### 👤 Cliente
- **Email:** `user@ecocollect.com`
- **Password:** `user123`
- **Rol:** CLIENTE
- **Permisos:** Dashboard de usuario, agendar recolecciones, ver puntos

### 🚚 Recolector
- **Email:** `recolector@ecocollect.com`
- **Password:** `recolector123`
- **Rol:** RECOLECTOR
- **Permisos:** Ver y gestionar recolecciones asignadas

---

## 🌐 URLs del Sistema

### Backend en Azure
- **API URL:** `https://ecocollet-backend.azurewebsites.net/api`
- **WebSocket URL:** `wss://ecocollet-backend.azurewebsites.net`

### Frontend Local
- **Dev Server:** `http://localhost:4200`

---

## 🚀 Cómo probar

1. **Iniciar el frontend localmente:**
   ```bash
   npm start
   ```

2. **Abrir el navegador:**
   ```
   http://localhost:4200
   ```

3. **Iniciar sesión** con cualquiera de las credenciales de arriba

4. **CORS ya está configurado** en el backend para aceptar `http://localhost:4200`

---

## ✅ Verificaciones realizadas

- ✅ `environment.ts` configurado con URL de Azure
- ✅ `environment.prod.ts` configurado con URL de Azure
- ✅ Todos los servicios usan `environment.apiUrl`
- ✅ No hay URLs hardcodeadas a localhost
- ✅ BaseHttpService usa correctamente environment
- ✅ NivelApiService corregido para usar environment

---

## 🔧 Troubleshooting

Si tienes problemas de conexión:

1. Verifica que el backend esté activo: https://ecocollet-backend.azurewebsites.net/api
2. Revisa la consola del navegador (F12) para errores de CORS
3. Confirma que estás usando las credenciales correctas
4. Limpia el localStorage si hay problemas de token: `localStorage.clear()`
