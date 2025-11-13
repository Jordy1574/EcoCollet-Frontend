# 🚀 Guía de Despliegue - EcoCollect Frontend en Azure

## ✅ Pre-requisitos Completados

- ✅ `environment.prod.ts` configurado con URL correcta del backend
- ✅ `staticwebapp.config.json` creado
- ✅ Todas las URLs hardcodeadas eliminadas
- ✅ Todos los servicios usan `environment.apiUrl`

---

## 📦 Opción 1: Azure Static Web Apps (RECOMENDADA - GRATIS)

### Paso 1: Compilar el Proyecto para Producción

```bash
ng build --configuration production
```

**Resultado esperado:** Se creará la carpeta `dist/frontend` con los archivos compilados.

### Paso 2: Instalar Azure Static Web Apps CLI (si no lo tienes)

```bash
npm install -g @azure/static-web-apps-cli
```

### Paso 3: Desplegar usando Azure CLI

#### 3.1 Login a Azure

```bash
az login
```

#### 3.2 Crear el Static Web App

```bash
az staticwebapp create \
  --name ecocollect-frontend \
  --resource-group EcoCollect-rg \
  --location brazilsouth \
  --source dist/frontend \
  --branch main \
  --app-location "/" \
  --output-location "dist/frontend"
```

**Nota para Windows CMD:** Reemplaza `\` con `^` al final de cada línea:

```cmd
az staticwebapp create ^
  --name ecocollect-frontend ^
  --resource-group EcoCollect-rg ^
  --location brazilsouth ^
  --source dist/frontend ^
  --branch main ^
  --app-location "/" ^
  --output-location "dist/frontend"
```

#### 3.3 Obtener la URL del Frontend

```bash
az staticwebapp show --name ecocollect-frontend --resource-group EcoCollect-rg --query "defaultHostname" --output tsv
```

**URL esperada:** `https://ecocollect-frontend.azurestaticapps.net` o similar

---

## 📦 Opción 2: Azure Storage + Static Website (ALTERNATIVA)

### Paso 1: Compilar

```bash
ng build --configuration production
```

### Paso 2: Crear Storage Account

```bash
az storage account create \
  --name ecocollectstorage \
  --resource-group EcoCollect-rg \
  --location brazilsouth \
  --sku Standard_LRS \
  --kind StorageV2
```

### Paso 3: Habilitar Static Website

```bash
az storage blob service-properties update \
  --account-name ecocollectstorage \
  --static-website \
  --index-document index.html \
  --404-document index.html
```

### Paso 4: Subir Archivos Compilados

```bash
az storage blob upload-batch \
  --account-name ecocollectstorage \
  --destination '$web' \
  --source dist/frontend
```

### Paso 5: Obtener URL

```bash
az storage account show \
  --name ecocollectstorage \
  --resource-group EcoCollect-rg \
  --query "primaryEndpoints.web" \
  --output tsv
```

---

## 📦 Opción 3: Despliegue Manual desde Azure Portal

### Paso 1: Compilar

```bash
ng build --configuration production
```

### Paso 2: Ir al Azure Portal

1. Navegar a [https://portal.azure.com](https://portal.azure.com)
2. Buscar **"Static Web Apps"**
3. Clic en **"+ Create"**

### Paso 3: Configurar el Recurso

- **Subscription:** Tu suscripción
- **Resource Group:** `EcoCollect-rg`
- **Name:** `ecocollect-frontend`
- **Plan type:** `Free`
- **Region:** `Brazil South`
- **Deployment source:** `Other` (para upload manual)

### Paso 4: Subir Archivos

**Usando Azure Storage Explorer:**

1. Descargar e instalar [Azure Storage Explorer](https://azure.microsoft.com/features/storage-explorer/)
2. Conectar a tu cuenta de Azure
3. Navegar al Static Web App creado
4. Subir todo el contenido de `dist/frontend/*` (NO subir la carpeta `dist`, solo su contenido)

**O usando Azure CLI:**

```bash
# Obtener el token de deployment
az staticwebapp secrets list --name ecocollect-frontend --resource-group EcoCollect-rg --query "properties.apiKey" --output tsv

# Usar el token para hacer deploy
az staticwebapp upload --app-name ecocollect-frontend --deployment-token "<token>" --source dist/frontend
```

---

## 🔧 IMPORTANTE: Actualizar CORS en el Backend

Una vez que obtengas la URL del frontend (por ejemplo: `https://ecocollect-frontend.azurestaticapps.net`), **DEBES** actualizar el CORS en el backend:

```bash
az containerapp update \
  --name ecocollect-backend \
  --resource-group EcoCollect-rg \
  --set-env-vars ALLOWED_ORIGINS="https://ecocollect-frontend.azurestaticapps.net,http://localhost:4200"
```

**⚠️ Sin este paso, el login NO funcionará debido a errores de CORS.**

---

## 📋 Checklist Final de Verificación

Antes de desplegar, confirmar:

- ✅ `environment.prod.ts` tiene URL correcta: `https://ecocollect-backend.mangostone-3954dfb1.brazilsouth.azurecontainerapps.io/api`
- ✅ `staticwebapp.config.json` existe en la raíz
- ✅ No hay URLs hardcodeadas (`localhost`, `ecocollet`)
- ✅ `ng build --configuration production` compila sin errores
- ✅ No hay errores de TypeScript

---

## 💰 Costos Estimados

| Opción | Costo/Mes |
|--------|-----------|
| Azure Static Web Apps (Free tier) | **$0** |
| Azure Storage Static Website | **~$1-2** |

**Recomendación:** Usar **Azure Static Web Apps (Free tier)** por su costo $0 y fácil configuración.

---

## 🧪 Después del Despliegue: Testing

1. **Acceder a la URL del frontend** (ej: `https://ecocollect-frontend.azurestaticapps.net`)
2. **Probar el Login:**
   - Email: `user@ecocollect.com`
   - Password: `user123`
3. **Verificar las funcionalidades:**
   - ✅ Dashboard del usuario carga correctamente
   - ✅ Edición de perfil funciona
   - ✅ Agendar recolección funciona
   - ✅ Cancelar recolección funciona
4. **Abrir DevTools (F12)** y verificar:
   - ✅ No hay errores de CORS
   - ✅ Las peticiones van a `https://ecocollect-backend.mangostone-3954dfb1...`
   - ✅ No hay errores 404 o 500

---

## 🐛 Troubleshooting

### Error: "Unknown Error" o Status: 0

**Causa:** CORS no configurado en el backend.

**Solución:** Ejecutar el comando de actualización de CORS del backend (ver sección IMPORTANTE arriba).

### Error: 404 en rutas al recargar

**Causa:** `staticwebapp.config.json` no está configurado correctamente.

**Solución:** Verificar que el archivo `staticwebapp.config.json` existe en la raíz y tiene la configuración de `navigationFallback`.

### Error al compilar: Budget exceeded

**Causa:** El bundle de JavaScript/CSS es muy grande.

**Solución:** Ajustar el `angular.json`:

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "1MB",
    "maximumError": "2MB"
  }
]
```

---

## 📞 Contacto y Soporte

- **Backend URL:** `https://ecocollect-backend.mangostone-3954dfb1.brazilsouth.azurecontainerapps.io/api`
- **Resource Group:** `EcoCollect-rg`
- **Región:** `Brazil South`

---

## 🎯 Resumen Rápido (TL;DR)

```bash
# 1. Compilar
ng build --configuration production

# 2. Login a Azure
az login

# 3. Crear Static Web App
az staticwebapp create --name ecocollect-frontend --resource-group EcoCollect-rg --location brazilsouth --source dist/frontend --branch main --app-location "/" --output-location "dist/frontend"

# 4. Obtener URL
az staticwebapp show --name ecocollect-frontend --resource-group EcoCollect-rg --query "defaultHostname" --output tsv

# 5. Actualizar CORS en backend (reemplazar <URL> con la URL obtenida)
az containerapp update --name ecocollect-backend --resource-group EcoCollect-rg --set-env-vars ALLOWED_ORIGINS="<URL>,http://localhost:4200"

# 6. Probar el frontend en la URL obtenida
```

---

✅ **¡Todo listo para desplegar!** 🚀
