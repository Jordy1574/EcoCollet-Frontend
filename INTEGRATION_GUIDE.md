# Guía de Integración del Sistema de Niveles

## 🎯 Resumen

Se ha implementado un **sistema completo de niveles de usuario basado en puntos** en el backend de EcoCollect. El sistema asigna automáticamente un nivel a cada usuario dependiendo de su puntuación acumulada de reciclaje.

## 📋 Archivos Implementados

### Backend (Spring Boot)

1. **`NivelUsuario.java`** - Enum con 5 niveles
   - Ubicación: `com.upn.ecocollect.model`
   - Contiene la definición de los 5 niveles y métodos de cálculo
   - ✅ Implementado y listo

2. **`NivelService.java`** - Lógica de negocio
   - Ubicación: `com.upn.ecocollect.service`
   - Gestiona cálculos, actualizaciones y progresión de niveles
   - ✅ Implementado y listo

3. **`NivelController.java`** - Endpoints REST
   - Ubicación: `com.upn.ecocollect.controller`
   - Proporciona 4 endpoints para acceder a información de niveles
   - ✅ Implementado y listo

4. **`Usuario.java`** - Entidad modificada
   - Ubicación: `com.upn.ecocollect.model`
   - Campo `puntos` agregado (Integer, default 0)
   - ✅ Modificado

5. **`UsuarioAdminService.java`** - Servicio modificado
   - Ubicación: `com.upn.ecocollect.service`
   - Inicializa nuevos usuarios con `puntos=0` y `nivel=ECO_HEROE`
   - ✅ Modificado

## 🔗 Pasos de Integración Recomendados

### Paso 1: Migración de Base de Datos

Ejecutar el script SQL en `src/main/resources/sql/01_add_puntos_column.sql`:

```sql
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS puntos INT DEFAULT 0 NOT NULL;
UPDATE usuarios SET nivel = 'ECO_HEROE' WHERE nivel IS NULL OR nivel = '';
UPDATE usuarios SET puntos = 0 WHERE puntos IS NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_puntos ON usuarios(puntos);
CREATE INDEX IF NOT EXISTS idx_usuarios_nivel ON usuarios(nivel);
```

**O ejecutar en MySQL directamente:**
```bash
mysql -u root -p ecocollect < src/main/resources/sql/01_add_puntos_column.sql
```

### Paso 2: Compilar el Proyecto

```bash
# En la raíz del proyecto
./mvnw clean compile

# O en Windows
mvnw.cmd clean compile
```

Verificar que no hay errores de compilación.

### Paso 3: Integrar con CitaController

En `CitaController.java`, cuando se completa una cita:

1. **Inyectar NivelService:**
   ```java
   @Autowired
   private NivelService nivelService;
   ```

2. **En el método que marca cita como completada:**
   ```java
   @PostMapping("/{id}/completar")
   @PreAuthorize("isAuthenticated()")
   @Transactional
   public ResponseEntity<ApiResponse<CitaDTO>> completarCita(
           @PathVariable Long id,
           Authentication auth) {
       
       // ... validaciones ...
       
       // Calcular puntos ganados
       int puntosGanados = calcularPuntosGanados(cita);
       
       // INTEGRACIÓN: Actualizar puntos y nivel
       nivelService.incrementarPuntosYActualizarNivel(usuario.getId(), puntosGanados);
       
       // ... guardar cambios ...
   }
   ```

3. **Crear método auxiliar para calcular puntos:**
   ```java
   private int calcularPuntosGanados(Cita cita) {
       // Ejemplo: 10 puntos por kg
       return (int) (cita.getCantidadEstimada() * 10);
   }
   ```

Ver archivo `CitaControllerNivelesIntegrationExample.java` para ejemplo completo.

### Paso 4: Probar Endpoints

Usar Postman o curl para probar:

#### 4.1 Obtener todos los niveles
```bash
curl -X GET http://localhost:8080/api/niveles/disponibles
```

Respuesta esperada:
```json
{
  "success": true,
  "data": [
    {
      "nombre": "ECO_HEROE",
      "displayName": "Eco-Héroe",
      "minPuntos": 0,
      "maxPuntos": 249
    },
    {
      "nombre": "ECO_EXPLORADOR",
      "displayName": "Eco-Explorador",
      "minPuntos": 250,
      "maxPuntos": 499
    },
    // ... resto de niveles ...
  ]
}
```

#### 4.2 Obtener progresión de usuario
```bash
curl -X GET http://localhost:8080/api/niveles/1/progresion \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "nivelActual": "Eco-Héroe",
    "puntosActuales": 150,
    "puntosMinimos": 0,
    "puntosMaximos": 249,
    "porcentajeProgreso": 60,
    "esNivelMaximo": false,
    "nivelSiguiente": "Eco-Explorador",
    "puntosParaSiguienteNivel": 100
  }
}
```

#### 4.3 Incrementar puntos (Admin)
```bash
curl -X POST http://localhost:8080/api/niveles/1/incrementar-puntos?puntos=150 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Paso 5: Actualizar Frontend (Angular)

En `usuario-dashboard.component.ts`:

```typescript
ngOnInit() {
  this.loadNivelInfo();
}

loadNivelInfo() {
  this.apiService.obtenerProgresion(this.usuarioId).subscribe(
    (response) => {
      this.estadisticas = {
        nivelActual: response.data.nivelActual,
        puntosActuales: response.data.puntosActuales,
        porcentajeProgreso: response.data.porcentajeProgreso,
        puntosParaSiguienteNivel: response.data.puntosParaSiguienteNivel,
        nivelSiguiente: response.data.nivelSiguiente
      };
    }
  );
}
```

En `usuario-dashboard.component.html`:

```html
<div class="nivel-info">
  <h3>Nivel Actual: {{ estadisticas.nivelActual }}</h3>
  
  <div class="barra-progreso">
    <div class="progreso-actual" 
         [style.width.%]="estadisticas.porcentajeProgreso">
    </div>
  </div>
  
  <p>
    {{ estadisticas.puntosActuales }} puntos
    <br/>
    Faltan {{ estadisticas.puntosParaSiguienteNivel }} para 
    {{ estadisticas.nivelSiguiente }}
  </p>
</div>
```

## 📊 Flujo Automático de Actualización de Niveles

```
Usuario completa una recolección (Cita)
                ↓
CitaController.completarCita()
                ↓
Calcular puntos ganados
                ↓
nivelService.incrementarPuntosYActualizarNivel(usuarioId, puntos)
                ↓
1. Obtener usuario actual
2. Adicionar puntos: usuario.puntos += puntos
3. Calcular nuevo nivel: NivelUsuario.calcularNivel(usuario.puntos)
4. Actualizar usuario: usuario.nivel = nuevoNivel.name()
5. Guardar en BD (transaccionalmente)
                ↓
Nivel del usuario actualizado automáticamente
```

## 🧪 Checklist de Validación

- [ ] Columna `puntos` agregada a tabla `usuarios`
- [ ] Migración SQL ejecutada exitosamente
- [ ] Proyecto compila sin errores
- [ ] NivelService inyectado en CitaController
- [ ] Método de cálculo de puntos implementado
- [ ] `incrementarPuntosYActualizarNivel()` llamado al completar cita
- [ ] Endpoints de nivel probados en Postman
- [ ] Progresión de nivel verificada en BD
- [ ] Frontend actualizado para mostrar nivel y progreso
- [ ] Usuarios existentes inicializados con ECO_HEROE

## 🚀 Verificación en Producción

Ejecutar estas queries para validar:

```sql
-- Ver distribución de usuarios por nivel
SELECT nivel, COUNT(*) as cantidad 
FROM usuarios 
GROUP BY nivel;

-- Ver usuarios con más puntos
SELECT id, nombre, email, puntos, nivel 
FROM usuarios 
ORDER BY puntos DESC 
LIMIT 10;

-- Verificar que todos los usuarios tienen puntos inicializados
SELECT COUNT(*) as usuarios_sin_puntos 
FROM usuarios 
WHERE puntos IS NULL;

-- Verificar índices creados
SHOW INDEXES FROM usuarios WHERE Column_name IN ('puntos', 'nivel');
```

## ⚠️ Consideraciones Importantes

1. **Transaccionalidad**: Todos los métodos de actualización usan `@Transactional` para garantizar consistencia
2. **Validación de Puntos**: No se permiten valores negativos
3. **Cálculo de Nivel**: Se realiza automáticamente cada vez que cambian los puntos
4. **Performance**: Se agregaron índices en las columnas `puntos` y `nivel`
5. **Compatibilidad**: No rompe cambios con código existente

## 📝 Notas

- El sistema está listo para producción
- La integración principal pendiente es en CitaController
- El frontend puede mostrar la información usando los endpoints de NivelController
- Se pueden agregar más reglas de puntuación según sea necesario
- Los valores de puntos pueden ajustarse en `calcularPuntosGanados()`

## 📚 Archivos de Referencia

- `SISTEMA_NIVELES_README.md` - Documentación técnica completa
- `CitaControllerNivelesIntegrationExample.java` - Ejemplo de integración
- `sql/01_add_puntos_column.sql` - Script de migración
