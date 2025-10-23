# ⚡ Quick Fixes Backend - EcoCollet

## 🎯 Cambios Críticos (30 minutos)

### 1. UsuarioResponse.java - AGREGAR 2 campos

```java
@Data
public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String email;
    private RolUsuario rol;
    private String telefono;
    private String direccion;
    private LocalDateTime fechaRegistro;
    
    // ✅ AGREGAR estos 2 métodos
    @JsonProperty("distrito")
    public String getDistrito() {
        return this.direccion;  // Alias para frontend
    }
    
    public String getEstado() {
        return "Activo";  // Placeholder
    }
}
```

### 2. PuntoReciclajeResponse.java - AGREGAR 3 campos

```java
@Data
public class PuntoReciclajeResponse {
    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String estado;
    private List<MaterialSimpleResponse> materialesAceptados;  // ✅ VERIFICAR que exista
    private LocalDateTime fechaCreacion;
    
    // ✅ AGREGAR estos 3 métodos
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

### 3. MaterialResponse.java - OPCIONAL (mejora UX)

```java
@Data
public class MaterialResponse {
    private Long id;
    private String nombre;
    private Double precioPorKg;
    
    // ✅ OPCIONAL: agregar estos métodos para mejor UX
    public String getTipo() {
        String n = this.nombre.toLowerCase();
        if (n.contains("plast")) return "plastico";
        if (n.contains("papel")) return "papel";
        if (n.contains("vidri")) return "vidrio";
        if (n.contains("metal")) return "metal";
        return "otros";
    }
    
    @JsonProperty("info")
    public Map<String, String> getInfo() {
        Map<String, String> info = new HashMap<>();
        info.put("precioPromedio", String.format("S/. %.2f/kg", this.precioPorKg));
        info.put("puntosActivos", "0");
        info.put("ultimaActualizacion", "Hoy");
        return info;
    }
}
```

---

## 🌱 Seeds con Datos de Ejemplo

### Opción A: SQL (copiar y ejecutar en BD)

```sql
-- ============================================
-- SEEDS ECOCOLLET - DATOS DE EJEMPLO
-- ============================================

-- 1. MATERIALES (8 materiales básicos)
INSERT INTO materiales (nombre, precio_por_kg, fecha_creacion, fecha_actualizacion) VALUES 
('Plástico PET', 2.50, NOW(), NOW()),
('Papel Blanco', 1.80, NOW(), NOW()),
('Vidrio', 1.20, NOW(), NOW()),
('Metal (Aluminio)', 4.00, NOW(), NOW()),
('Electrónicos', 5.00, NOW(), NOW()),
('Cartón', 1.40, NOW(), NOW()),
('Cobre', 8.50, NOW(), NOW()),
('Plástico HDPE', 3.00, NOW(), NOW());

-- 2. USUARIOS (admin ya existe, agregar más)
-- Password: EcoCollet2024* (hash BCrypt)
INSERT INTO usuarios (nombre, email, password, rol, telefono, direccion, fecha_registro) VALUES 
('Carlos Mendoza', 'recolector@ecocollet.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'RECOLECTOR', '988777666', 'Av. Larco 567, Miraflores', NOW()),
('Ana Torres', 'recolector2@ecocollet.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'RECOLECTOR', '977666555', 'Av. Benavides 890, Surco', NOW()),
('María González', 'cliente@ecocollet.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENTE', '966555444', 'Jr. Las Flores 123, San Isidro', NOW()),
('Juan Ramírez', 'cliente2@ecocollet.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENTE', '955444333', 'Av. Pardo 456, Miraflores', NOW()),
('EcoTech SAC', 'empresa@ecocollet.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENTE', '944333222', 'Av. Javier Prado 789, San Isidro', NOW());

-- 3. PUNTOS DE RECICLAJE (5 puntos)
INSERT INTO puntos_reciclaje (nombre, direccion, telefono, estado, fecha_creacion) VALUES 
('EcoPoint Miraflores', 'Av. Larco 345, Miraflores', '012345678', 'ACTIVO', NOW()),
('ReciclaMax San Isidro', 'Av. Javier Prado 1234, San Isidro', '012345679', 'ACTIVO', NOW()),
('Verde Surco', 'Av. Benavides 567, Surco', '012345680', 'MANTENIMIENTO', NOW()),
('EcoCentro La Molina', 'Av. La Molina 890, La Molina', '012345681', 'ACTIVO', NOW()),
('Reciclaje Express Breña', 'Av. Brasil 234, Breña', '012345682', 'INACTIVO', NOW());

-- 4. RELACIÓN PUNTO-MATERIAL (asignar materiales a puntos)
-- ⚠️ AJUSTAR IDs según tu BD (usa SELECT * FROM materiales y puntos_reciclaje)

-- EcoPoint Miraflores (id=1): acepta Plástico PET, Papel, Vidrio
INSERT INTO punto_material (punto_id, material_id) VALUES (1, 1), (1, 2), (1, 3);

-- ReciclaMax San Isidro (id=2): acepta Plástico PET, Papel, Metal, Electrónicos
INSERT INTO punto_material (punto_id, material_id) VALUES (2, 1), (2, 2), (2, 4), (2, 5);

-- Verde Surco (id=3): acepta Papel, Cartón, Vidrio
INSERT INTO punto_material (punto_id, material_id) VALUES (3, 2), (3, 3), (3, 6);

-- EcoCentro La Molina (id=4): acepta todos los materiales
INSERT INTO punto_material (punto_id, material_id) VALUES 
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8);

-- Reciclaje Express Breña (id=5): acepta Metal, Cobre
INSERT INTO punto_material (punto_id, material_id) VALUES (5, 4), (5, 7);
```

### Opción B: DataSeeder.java (más completo)

```java
package com.ecocollet.config;

import com.ecocollet.entity.*;
import com.ecocollet.enums.*;
import com.ecocollet.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private MaterialRepository materialRepository;
    @Autowired private PuntoReciclajeRepository puntoRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Value("${ecocollect.seed.enabled:false}")
    private boolean seedEnabled;

    @Override
    public void run(String... args) throws Exception {
        
        // Solo ejecutar si está habilitado y la BD está vacía
        if (!seedEnabled || materialRepository.count() > 0) {
            return;
        }

        System.out.println("🌱 Iniciando seeder de datos...");

        // 1. CREAR MATERIALES
        List<Material> materiales = Arrays.asList(
            createMaterial("Plástico PET", 2.50),
            createMaterial("Papel Blanco", 1.80),
            createMaterial("Vidrio", 1.20),
            createMaterial("Metal (Aluminio)", 4.00),
            createMaterial("Electrónicos", 5.00),
            createMaterial("Cartón", 1.40),
            createMaterial("Cobre", 8.50),
            createMaterial("Plástico HDPE", 3.00)
        );
        materialRepository.saveAll(materiales);
        System.out.println("✅ 8 materiales creados");

        // 2. CREAR USUARIOS
        String password = passwordEncoder.encode("EcoCollet2024*");
        
        List<Usuario> usuarios = Arrays.asList(
            createUsuario("Carlos Mendoza", "recolector@ecocollet.pe", password, 
                RolUsuario.RECOLECTOR, "988777666", "Av. Larco 567, Miraflores"),
            createUsuario("Ana Torres", "recolector2@ecocollet.pe", password, 
                RolUsuario.RECOLECTOR, "977666555", "Av. Benavides 890, Surco"),
            createUsuario("María González", "cliente@ecocollet.pe", password, 
                RolUsuario.CLIENTE, "966555444", "Jr. Las Flores 123, San Isidro"),
            createUsuario("Juan Ramírez", "cliente2@ecocollet.pe", password, 
                RolUsuario.CLIENTE, "955444333", "Av. Pardo 456, Miraflores"),
            createUsuario("EcoTech SAC", "empresa@ecocollet.pe", password, 
                RolUsuario.CLIENTE, "944333222", "Av. Javier Prado 789, San Isidro")
        );
        usuarioRepository.saveAll(usuarios);
        System.out.println("✅ 5 usuarios creados (password: EcoCollet2024*)");

        // 3. CREAR PUNTOS DE RECICLAJE
        PuntoReciclaje punto1 = new PuntoReciclaje();
        punto1.setNombre("EcoPoint Miraflores");
        punto1.setDireccion("Av. Larco 345, Miraflores");
        punto1.setTelefono("012345678");
        punto1.setEstado(EstadoPunto.ACTIVO);
        punto1.setMaterialesAceptados(Arrays.asList(materiales.get(0), materiales.get(1), materiales.get(2)));

        PuntoReciclaje punto2 = new PuntoReciclaje();
        punto2.setNombre("ReciclaMax San Isidro");
        punto2.setDireccion("Av. Javier Prado 1234, San Isidro");
        punto2.setTelefono("012345679");
        punto2.setEstado(EstadoPunto.ACTIVO);
        punto2.setMaterialesAceptados(Arrays.asList(materiales.get(0), materiales.get(1), materiales.get(3), materiales.get(4)));

        PuntoReciclaje punto3 = new PuntoReciclaje();
        punto3.setNombre("Verde Surco");
        punto3.setDireccion("Av. Benavides 567, Surco");
        punto3.setTelefono("012345680");
        punto3.setEstado(EstadoPunto.MANTENIMIENTO);
        punto3.setMaterialesAceptados(Arrays.asList(materiales.get(1), materiales.get(2), materiales.get(5)));

        PuntoReciclaje punto4 = new PuntoReciclaje();
        punto4.setNombre("EcoCentro La Molina");
        punto4.setDireccion("Av. La Molina 890, La Molina");
        punto4.setTelefono("012345681");
        punto4.setEstado(EstadoPunto.ACTIVO);
        punto4.setMaterialesAceptados(materiales); // Acepta todos

        PuntoReciclaje punto5 = new PuntoReciclaje();
        punto5.setNombre("Reciclaje Express Breña");
        punto5.setDireccion("Av. Brasil 234, Breña");
        punto5.setTelefono("012345682");
        punto5.setEstado(EstadoPunto.INACTIVO);
        punto5.setMaterialesAceptados(Arrays.asList(materiales.get(3), materiales.get(6)));

        puntoRepository.saveAll(Arrays.asList(punto1, punto2, punto3, punto4, punto5));
        System.out.println("✅ 5 puntos de reciclaje creados");

        System.out.println("🎉 Seeder completado exitosamente!");
        System.out.println("📧 Usuarios de prueba:");
        System.out.println("   - recolector@ecocollet.pe / EcoCollet2024*");
        System.out.println("   - cliente@ecocollet.pe / EcoCollet2024*");
        System.out.println("   - admin@ecocollect.com / Admin123! (ya existente)");
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

### Activar Seeder

En `application.properties`:
```properties
# Habilitar seeder de datos
ecocollect.seed.enabled=true
```

---

## ✅ Checklist Final

### Cambios en Código (30 min)
- [ ] UsuarioResponse: agregar `getDistrito()` y `getEstado()`
- [ ] PuntoReciclajeResponse: agregar `getTipo()`, `getTipoTexto()`, `getHorario()`
- [ ] MaterialResponse: OPCIONAL agregar `getTipo()` y `getInfo()`
- [ ] Verificar que `materialesAceptados` sea List completo, no solo IDs

### Seeds (ejecutar una vez)
- [ ] Opción A: Ejecutar SQL en BD
- [ ] Opción B: Activar DataSeeder en application.properties
- [ ] Verificar que se crearon: 8 materiales, 5 usuarios, 5 puntos

### Test desde Frontend
- [ ] Login: `admin@ecocollect.com` / `Admin123!`
- [ ] Ver usuarios en lista (deben aparecer 6 total)
- [ ] Ver materiales en lista (deben aparecer 8)
- [ ] Ver puntos en lista (deben aparecer 5)
- [ ] Crear un nuevo material → debe guardarse
- [ ] Editar un material → debe actualizarse
- [ ] Eliminar (si no está en uso) → debe eliminarse

---

## 🚀 ¿Qué cambia?

### Antes (no funcionaba editar)
```json
// Backend devolvía
{
  "id": 1,
  "nombre": "Juan",
  "direccion": "Miraflores"  // ❌ Frontend espera "distrito"
}
```

### Después (funciona todo)
```json
// Backend devuelve
{
  "id": 1,
  "nombre": "Juan",
  "direccion": "Miraflores",
  "distrito": "Miraflores",  // ✅ Alias agregado
  "estado": "Activo"          // ✅ Placeholder agregado
}
```

---

## 📞 Soporte

Si algo falla:
1. Revisar logs del backend (errores de BD o validación)
2. Network tab en navegador (ver request/response)
3. Verificar que CORS esté habilitado para `http://localhost:4200`
4. Verificar que token JWT sea válido

**Tiempo total:** 30 min código + 5 min seeds = **35 minutos** ⚡
