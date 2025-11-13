-- =============================================
-- PROCEDIMIENTOS ALMACENADOS - EcoCollect Backend
-- =============================================
-- Generado: 2025-11-12
-- Base de datos: MySQL
-- =============================================

DELIMITER $$

-- =============================================
-- CRUD USUARIOS
-- =============================================

-- Crear Usuario
DROP PROCEDURE IF EXISTS sp_crear_usuario$$
CREATE PROCEDURE sp_crear_usuario(
    IN p_nombre VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_rol VARCHAR(50),
    IN p_telefono VARCHAR(50),
    IN p_direccion VARCHAR(500),
    IN p_nivel VARCHAR(50),
    IN p_puntos INT
)
BEGIN
    INSERT INTO usuarios (nombre, email, password, rol, telefono, direccion, nivel, puntos)
    VALUES (p_nombre, p_email, p_password, p_rol, p_telefono, p_direccion, p_nivel, IFNULL(p_puntos, 0));
    
    SELECT LAST_INSERT_ID() as id;
END$$

-- Obtener Usuario por ID
DROP PROCEDURE IF EXISTS sp_obtener_usuario$$
CREATE PROCEDURE sp_obtener_usuario(IN p_id BIGINT)
BEGIN
    SELECT id, nombre, email, rol, telefono, direccion, nivel, puntos
    FROM usuarios
    WHERE id = p_id;
END$$

-- Obtener Usuario por Email
DROP PROCEDURE IF EXISTS sp_obtener_usuario_por_email$$
CREATE PROCEDURE sp_obtener_usuario_por_email(IN p_email VARCHAR(255))
BEGIN
    SELECT id, nombre, email, password, rol, telefono, direccion, nivel, puntos
    FROM usuarios
    WHERE email = p_email;
END$$

-- Listar Usuarios
DROP PROCEDURE IF EXISTS sp_listar_usuarios$$
CREATE PROCEDURE sp_listar_usuarios()
BEGIN
    SELECT id, nombre, email, rol, telefono, direccion, nivel, puntos
    FROM usuarios
    ORDER BY id DESC;
END$$

-- Listar Usuarios por Rol
DROP PROCEDURE IF EXISTS sp_listar_usuarios_por_rol$$
CREATE PROCEDURE sp_listar_usuarios_por_rol(IN p_rol VARCHAR(50))
BEGIN
    SELECT id, nombre, email, rol, telefono, direccion, nivel, puntos
    FROM usuarios
    WHERE rol = p_rol
    ORDER BY id DESC;
END$$

-- Actualizar Usuario
DROP PROCEDURE IF EXISTS sp_actualizar_usuario$$
CREATE PROCEDURE sp_actualizar_usuario(
    IN p_id BIGINT,
    IN p_nombre VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_telefono VARCHAR(50),
    IN p_direccion VARCHAR(500),
    IN p_nivel VARCHAR(50),
    IN p_puntos INT
)
BEGIN
    UPDATE usuarios
    SET nombre = p_nombre,
        email = p_email,
        telefono = p_telefono,
        direccion = p_direccion,
        nivel = p_nivel,
        puntos = p_puntos
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Actualizar Password Usuario
DROP PROCEDURE IF EXISTS sp_actualizar_password_usuario$$
CREATE PROCEDURE sp_actualizar_password_usuario(
    IN p_id BIGINT,
    IN p_password VARCHAR(255)
)
BEGIN
    UPDATE usuarios
    SET password = p_password
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Actualizar Puntos Usuario
DROP PROCEDURE IF EXISTS sp_actualizar_puntos_usuario$$
CREATE PROCEDURE sp_actualizar_puntos_usuario(
    IN p_id BIGINT,
    IN p_puntos INT
)
BEGIN
    UPDATE usuarios
    SET puntos = p_puntos
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Eliminar Usuario
DROP PROCEDURE IF EXISTS sp_eliminar_usuario$$
CREATE PROCEDURE sp_eliminar_usuario(IN p_id BIGINT)
BEGIN
    DELETE FROM usuarios WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END$$

-- =============================================
-- CRUD MATERIALES
-- =============================================

-- Crear Material
DROP PROCEDURE IF EXISTS sp_crear_material$$
CREATE PROCEDURE sp_crear_material(
    IN p_nombre VARCHAR(255),
    IN p_precio_por_kg DOUBLE
)
BEGIN
    INSERT INTO materiales (nombre, precio_por_kg)
    VALUES (p_nombre, p_precio_por_kg);
    
    SELECT LAST_INSERT_ID() as id;
END$$

-- Obtener Material por ID
DROP PROCEDURE IF EXISTS sp_obtener_material$$
CREATE PROCEDURE sp_obtener_material(IN p_id BIGINT)
BEGIN
    SELECT id, nombre, precio_por_kg
    FROM materiales
    WHERE id = p_id;
END$$

-- Obtener Material por Nombre
DROP PROCEDURE IF EXISTS sp_obtener_material_por_nombre$$
CREATE PROCEDURE sp_obtener_material_por_nombre(IN p_nombre VARCHAR(255))
BEGIN
    SELECT id, nombre, precio_por_kg
    FROM materiales
    WHERE nombre = p_nombre;
END$$

-- Listar Materiales
DROP PROCEDURE IF EXISTS sp_listar_materiales$$
CREATE PROCEDURE sp_listar_materiales()
BEGIN
    SELECT id, nombre, precio_por_kg
    FROM materiales
    ORDER BY nombre;
END$$

-- Actualizar Material
DROP PROCEDURE IF EXISTS sp_actualizar_material$$
CREATE PROCEDURE sp_actualizar_material(
    IN p_id BIGINT,
    IN p_nombre VARCHAR(255),
    IN p_precio_por_kg DOUBLE
)
BEGIN
    UPDATE materiales
    SET nombre = p_nombre,
        precio_por_kg = p_precio_por_kg
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Eliminar Material
DROP PROCEDURE IF EXISTS sp_eliminar_material$$
CREATE PROCEDURE sp_eliminar_material(IN p_id BIGINT)
BEGIN
    DELETE FROM materiales WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END$$

-- =============================================
-- CRUD RECOLECCIONES
-- =============================================

-- Crear Recolección
DROP PROCEDURE IF EXISTS sp_crear_recoleccion$$
CREATE PROCEDURE sp_crear_recoleccion(
    IN p_cliente_id BIGINT,
    IN p_tipo_material VARCHAR(255),
    IN p_cantidad_kg DOUBLE,
    IN p_fecha_recojo DATETIME,
    IN p_direccion VARCHAR(500),
    IN p_distrito VARCHAR(255),
    IN p_referencia VARCHAR(500),
    IN p_estado VARCHAR(50)
)
BEGIN
    INSERT INTO recolecciones (
        cliente_id, 
        tipo_material, 
        cantidad_kg, 
        fecha_recojo,
        direccion,
        distrito,
        referencia,
        estado,
        fecha_solicitud
    )
    VALUES (
        p_cliente_id,
        p_tipo_material,
        p_cantidad_kg,
        p_fecha_recojo,
        p_direccion,
        p_distrito,
        p_referencia,
        IFNULL(p_estado, 'PENDIENTE'),
        NOW()
    );
    
    SELECT LAST_INSERT_ID() as id;
END$$

-- Obtener Recolección por ID
DROP PROCEDURE IF EXISTS sp_obtener_recoleccion$$
CREATE PROCEDURE sp_obtener_recoleccion(IN p_id BIGINT)
BEGIN
    SELECT 
        r.id,
        r.cliente_id,
        r.recolector_id,
        r.tipo_material,
        r.cantidad_kg,
        r.fecha_recojo,
        r.direccion,
        r.distrito,
        r.referencia,
        r.estado,
        r.fecha_solicitud,
        r.fecha_asignacion,
        r.fecha_completada,
        u.nombre as cliente_nombre,
        u.email as cliente_email,
        rec.nombre as recolector_nombre
    FROM recolecciones r
    INNER JOIN usuarios u ON r.cliente_id = u.id
    LEFT JOIN usuarios rec ON r.recolector_id = rec.id
    WHERE r.id = p_id;
END$$

-- Listar Recolecciones
DROP PROCEDURE IF EXISTS sp_listar_recolecciones$$
CREATE PROCEDURE sp_listar_recolecciones()
BEGIN
    SELECT 
        r.id,
        r.cliente_id,
        r.recolector_id,
        r.tipo_material,
        r.cantidad_kg,
        r.fecha_recojo,
        r.direccion,
        r.distrito,
        r.referencia,
        r.estado,
        r.fecha_solicitud,
        r.fecha_asignacion,
        r.fecha_completada,
        u.nombre as cliente_nombre,
        u.email as cliente_email,
        rec.nombre as recolector_nombre
    FROM recolecciones r
    INNER JOIN usuarios u ON r.cliente_id = u.id
    LEFT JOIN usuarios rec ON r.recolector_id = rec.id
    ORDER BY r.fecha_solicitud DESC;
END$$

-- Listar Recolecciones por Cliente
DROP PROCEDURE IF EXISTS sp_listar_recolecciones_por_cliente$$
CREATE PROCEDURE sp_listar_recolecciones_por_cliente(IN p_cliente_id BIGINT)
BEGIN
    SELECT 
        r.id,
        r.cliente_id,
        r.recolector_id,
        r.tipo_material,
        r.cantidad_kg,
        r.fecha_recojo,
        r.direccion,
        r.distrito,
        r.referencia,
        r.estado,
        r.fecha_solicitud,
        r.fecha_asignacion,
        r.fecha_completada
    FROM recolecciones r
    WHERE r.cliente_id = p_cliente_id
    ORDER BY r.fecha_solicitud DESC;
END$$

-- Listar Recolecciones por Email Cliente
DROP PROCEDURE IF EXISTS sp_listar_recolecciones_por_email$$
CREATE PROCEDURE sp_listar_recolecciones_por_email(IN p_email VARCHAR(255))
BEGIN
    SELECT 
        r.id,
        r.cliente_id,
        r.recolector_id,
        r.tipo_material,
        r.cantidad_kg,
        r.fecha_recojo,
        r.direccion,
        r.distrito,
        r.referencia,
        r.estado,
        r.fecha_solicitud,
        r.fecha_asignacion,
        r.fecha_completada
    FROM recolecciones r
    INNER JOIN usuarios u ON r.cliente_id = u.id
    WHERE u.email = p_email
    ORDER BY r.fecha_solicitud DESC;
END$$

-- Listar Recolecciones por Recolector
DROP PROCEDURE IF EXISTS sp_listar_recolecciones_por_recolector$$
CREATE PROCEDURE sp_listar_recolecciones_por_recolector(IN p_recolector_id BIGINT)
BEGIN
    SELECT 
        r.id,
        r.cliente_id,
        r.recolector_id,
        r.tipo_material,
        r.cantidad_kg,
        r.fecha_recojo,
        r.direccion,
        r.distrito,
        r.referencia,
        r.estado,
        r.fecha_solicitud,
        r.fecha_asignacion,
        r.fecha_completada,
        u.nombre as cliente_nombre,
        u.email as cliente_email,
        u.telefono as cliente_telefono
    FROM recolecciones r
    INNER JOIN usuarios u ON r.cliente_id = u.id
    WHERE r.recolector_id = p_recolector_id
    ORDER BY r.fecha_recojo;
END$$

-- Listar Recolecciones por Estado
DROP PROCEDURE IF EXISTS sp_listar_recolecciones_por_estado$$
CREATE PROCEDURE sp_listar_recolecciones_por_estado(IN p_estado VARCHAR(50))
BEGIN
    SELECT 
        r.id,
        r.cliente_id,
        r.recolector_id,
        r.tipo_material,
        r.cantidad_kg,
        r.fecha_recojo,
        r.direccion,
        r.distrito,
        r.referencia,
        r.estado,
        r.fecha_solicitud,
        r.fecha_asignacion,
        r.fecha_completada,
        u.nombre as cliente_nombre,
        u.email as cliente_email
    FROM recolecciones r
    INNER JOIN usuarios u ON r.cliente_id = u.id
    WHERE r.estado = p_estado
    ORDER BY r.fecha_solicitud DESC;
END$$

-- Actualizar Recolección
DROP PROCEDURE IF EXISTS sp_actualizar_recoleccion$$
CREATE PROCEDURE sp_actualizar_recoleccion(
    IN p_id BIGINT,
    IN p_tipo_material VARCHAR(255),
    IN p_cantidad_kg DOUBLE,
    IN p_fecha_recojo DATETIME,
    IN p_direccion VARCHAR(500),
    IN p_distrito VARCHAR(255),
    IN p_referencia VARCHAR(500),
    IN p_estado VARCHAR(50)
)
BEGIN
    UPDATE recolecciones
    SET tipo_material = p_tipo_material,
        cantidad_kg = p_cantidad_kg,
        fecha_recojo = p_fecha_recojo,
        direccion = p_direccion,
        distrito = p_distrito,
        referencia = p_referencia,
        estado = p_estado
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Asignar Recolector
DROP PROCEDURE IF EXISTS sp_asignar_recolector$$
CREATE PROCEDURE sp_asignar_recolector(
    IN p_id BIGINT,
    IN p_recolector_id BIGINT
)
BEGIN
    UPDATE recolecciones
    SET recolector_id = p_recolector_id,
        estado = 'ASIGNADA',
        fecha_asignacion = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Completar Recolección
DROP PROCEDURE IF EXISTS sp_completar_recoleccion$$
CREATE PROCEDURE sp_completar_recoleccion(IN p_id BIGINT)
BEGIN
    UPDATE recolecciones
    SET estado = 'COMPLETADA',
        fecha_completada = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Cancelar Recolección
DROP PROCEDURE IF EXISTS sp_cancelar_recoleccion$$
CREATE PROCEDURE sp_cancelar_recoleccion(IN p_id BIGINT)
BEGIN
    UPDATE recolecciones
    SET estado = 'CANCELADA'
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Eliminar Recolección
DROP PROCEDURE IF EXISTS sp_eliminar_recoleccion$$
CREATE PROCEDURE sp_eliminar_recoleccion(IN p_id BIGINT)
BEGIN
    DELETE FROM recolecciones WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END$$

-- =============================================
-- CRUD PUNTOS DE RECICLAJE
-- =============================================

-- Crear Punto de Reciclaje
DROP PROCEDURE IF EXISTS sp_crear_punto_reciclaje$$
CREATE PROCEDURE sp_crear_punto_reciclaje(
    IN p_nombre VARCHAR(255),
    IN p_tipo VARCHAR(255),
    IN p_direccion VARCHAR(500),
    IN p_telefono VARCHAR(50),
    IN p_estado VARCHAR(50),
    IN p_horario VARCHAR(255)
)
BEGIN
    INSERT INTO puntos_reciclaje (nombre, tipo, direccion, telefono, estado, horario)
    VALUES (p_nombre, p_tipo, p_direccion, p_telefono, IFNULL(p_estado, 'activo'), p_horario);
    
    SELECT LAST_INSERT_ID() as id;
END$$

-- Obtener Punto de Reciclaje por ID
DROP PROCEDURE IF EXISTS sp_obtener_punto_reciclaje$$
CREATE PROCEDURE sp_obtener_punto_reciclaje(IN p_id BIGINT)
BEGIN
    SELECT id, nombre, tipo, direccion, telefono, estado, horario
    FROM puntos_reciclaje
    WHERE id = p_id;
END$$

-- Listar Puntos de Reciclaje
DROP PROCEDURE IF EXISTS sp_listar_puntos_reciclaje$$
CREATE PROCEDURE sp_listar_puntos_reciclaje()
BEGIN
    SELECT id, nombre, tipo, direccion, telefono, estado, horario
    FROM puntos_reciclaje
    ORDER BY nombre;
END$$

-- Listar Puntos de Reciclaje por Estado
DROP PROCEDURE IF EXISTS sp_listar_puntos_reciclaje_por_estado$$
CREATE PROCEDURE sp_listar_puntos_reciclaje_por_estado(IN p_estado VARCHAR(50))
BEGIN
    SELECT id, nombre, tipo, direccion, telefono, estado, horario
    FROM puntos_reciclaje
    WHERE estado = p_estado
    ORDER BY nombre;
END$$

-- Actualizar Punto de Reciclaje
DROP PROCEDURE IF EXISTS sp_actualizar_punto_reciclaje$$
CREATE PROCEDURE sp_actualizar_punto_reciclaje(
    IN p_id BIGINT,
    IN p_nombre VARCHAR(255),
    IN p_tipo VARCHAR(255),
    IN p_direccion VARCHAR(500),
    IN p_telefono VARCHAR(50),
    IN p_estado VARCHAR(50),
    IN p_horario VARCHAR(255)
)
BEGIN
    UPDATE puntos_reciclaje
    SET nombre = p_nombre,
        tipo = p_tipo,
        direccion = p_direccion,
        telefono = p_telefono,
        estado = p_estado,
        horario = p_horario
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Cambiar Estado Punto de Reciclaje
DROP PROCEDURE IF EXISTS sp_cambiar_estado_punto_reciclaje$$
CREATE PROCEDURE sp_cambiar_estado_punto_reciclaje(
    IN p_id BIGINT,
    IN p_estado VARCHAR(50)
)
BEGIN
    UPDATE puntos_reciclaje
    SET estado = p_estado
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Eliminar Punto de Reciclaje
DROP PROCEDURE IF EXISTS sp_eliminar_punto_reciclaje$$
CREATE PROCEDURE sp_eliminar_punto_reciclaje(IN p_id BIGINT)
BEGIN
    DELETE FROM puntos_reciclaje WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Asociar Material a Punto de Reciclaje
DROP PROCEDURE IF EXISTS sp_agregar_material_a_punto$$
CREATE PROCEDURE sp_agregar_material_a_punto(
    IN p_punto_id BIGINT,
    IN p_material_id BIGINT
)
BEGIN
    INSERT IGNORE INTO punto_materiales (punto_id, material_id)
    VALUES (p_punto_id, p_material_id);
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Eliminar Material de Punto de Reciclaje
DROP PROCEDURE IF EXISTS sp_eliminar_material_de_punto$$
CREATE PROCEDURE sp_eliminar_material_de_punto(
    IN p_punto_id BIGINT,
    IN p_material_id BIGINT
)
BEGIN
    DELETE FROM punto_materiales 
    WHERE punto_id = p_punto_id AND material_id = p_material_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Listar Materiales de un Punto de Reciclaje
DROP PROCEDURE IF EXISTS sp_listar_materiales_de_punto$$
CREATE PROCEDURE sp_listar_materiales_de_punto(IN p_punto_id BIGINT)
BEGIN
    SELECT m.id, m.nombre, m.precio_por_kg
    FROM materiales m
    INNER JOIN punto_materiales pm ON m.id = pm.material_id
    WHERE pm.punto_id = p_punto_id
    ORDER BY m.nombre;
END$$

-- =============================================
-- CRUD CITAS
-- =============================================

-- Crear Cita
DROP PROCEDURE IF EXISTS sp_crear_cita$$
CREATE PROCEDURE sp_crear_cita(
    IN p_usuario_id BIGINT,
    IN p_material_id BIGINT,
    IN p_cantidad_estimada DOUBLE,
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_estado VARCHAR(50),
    IN p_notas TEXT
)
BEGIN
    INSERT INTO citas (
        usuario_id,
        material_id,
        cantidad_estimada,
        fecha,
        hora,
        estado,
        notas,
        created_at
    )
    VALUES (
        p_usuario_id,
        p_material_id,
        p_cantidad_estimada,
        p_fecha,
        p_hora,
        IFNULL(p_estado, 'PENDIENTE'),
        p_notas,
        NOW()
    );
    
    SELECT LAST_INSERT_ID() as id;
END$$

-- Obtener Cita por ID
DROP PROCEDURE IF EXISTS sp_obtener_cita$$
CREATE PROCEDURE sp_obtener_cita(IN p_id BIGINT)
BEGIN
    SELECT 
        c.id,
        c.usuario_id,
        c.material_id,
        c.cantidad_estimada,
        c.fecha,
        c.hora,
        c.estado,
        c.recolector_id,
        c.notas,
        c.created_at,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        m.nombre as material_nombre,
        rec.nombre as recolector_nombre
    FROM citas c
    INNER JOIN usuarios u ON c.usuario_id = u.id
    INNER JOIN materiales m ON c.material_id = m.id
    LEFT JOIN usuarios rec ON c.recolector_id = rec.id
    WHERE c.id = p_id;
END$$

-- Listar Citas
DROP PROCEDURE IF EXISTS sp_listar_citas$$
CREATE PROCEDURE sp_listar_citas()
BEGIN
    SELECT 
        c.id,
        c.usuario_id,
        c.material_id,
        c.cantidad_estimada,
        c.fecha,
        c.hora,
        c.estado,
        c.recolector_id,
        c.notas,
        c.created_at,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        m.nombre as material_nombre
    FROM citas c
    INNER JOIN usuarios u ON c.usuario_id = u.id
    INNER JOIN materiales m ON c.material_id = m.id
    ORDER BY c.fecha DESC, c.hora DESC;
END$$

-- Listar Citas por Usuario
DROP PROCEDURE IF EXISTS sp_listar_citas_por_usuario$$
CREATE PROCEDURE sp_listar_citas_por_usuario(IN p_usuario_id BIGINT)
BEGIN
    SELECT 
        c.id,
        c.usuario_id,
        c.material_id,
        c.cantidad_estimada,
        c.fecha,
        c.hora,
        c.estado,
        c.recolector_id,
        c.notas,
        c.created_at,
        m.nombre as material_nombre
    FROM citas c
    INNER JOIN materiales m ON c.material_id = m.id
    WHERE c.usuario_id = p_usuario_id
    ORDER BY c.fecha DESC, c.hora DESC;
END$$

-- Listar Citas por Estado
DROP PROCEDURE IF EXISTS sp_listar_citas_por_estado$$
CREATE PROCEDURE sp_listar_citas_por_estado(IN p_estado VARCHAR(50))
BEGIN
    SELECT 
        c.id,
        c.usuario_id,
        c.material_id,
        c.cantidad_estimada,
        c.fecha,
        c.hora,
        c.estado,
        c.recolector_id,
        c.notas,
        c.created_at,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        m.nombre as material_nombre
    FROM citas c
    INNER JOIN usuarios u ON c.usuario_id = u.id
    INNER JOIN materiales m ON c.material_id = m.id
    WHERE c.estado = p_estado
    ORDER BY c.fecha DESC, c.hora DESC;
END$$

-- Listar Citas por Recolector
DROP PROCEDURE IF EXISTS sp_listar_citas_por_recolector$$
CREATE PROCEDURE sp_listar_citas_por_recolector(IN p_recolector_id BIGINT)
BEGIN
    SELECT 
        c.id,
        c.usuario_id,
        c.material_id,
        c.cantidad_estimada,
        c.fecha,
        c.hora,
        c.estado,
        c.recolector_id,
        c.notas,
        c.created_at,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        u.telefono as usuario_telefono,
        u.direccion as usuario_direccion,
        m.nombre as material_nombre
    FROM citas c
    INNER JOIN usuarios u ON c.usuario_id = u.id
    INNER JOIN materiales m ON c.material_id = m.id
    WHERE c.recolector_id = p_recolector_id
    ORDER BY c.fecha, c.hora;
END$$

-- Actualizar Cita
DROP PROCEDURE IF EXISTS sp_actualizar_cita$$
CREATE PROCEDURE sp_actualizar_cita(
    IN p_id BIGINT,
    IN p_material_id BIGINT,
    IN p_cantidad_estimada DOUBLE,
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_estado VARCHAR(50),
    IN p_notas TEXT
)
BEGIN
    UPDATE citas
    SET material_id = p_material_id,
        cantidad_estimada = p_cantidad_estimada,
        fecha = p_fecha,
        hora = p_hora,
        estado = p_estado,
        notas = p_notas
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Asignar Recolector a Cita
DROP PROCEDURE IF EXISTS sp_asignar_recolector_cita$$
CREATE PROCEDURE sp_asignar_recolector_cita(
    IN p_id BIGINT,
    IN p_recolector_id BIGINT
)
BEGIN
    UPDATE citas
    SET recolector_id = p_recolector_id,
        estado = 'ASIGNADA'
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Cambiar Estado Cita
DROP PROCEDURE IF EXISTS sp_cambiar_estado_cita$$
CREATE PROCEDURE sp_cambiar_estado_cita(
    IN p_id BIGINT,
    IN p_estado VARCHAR(50)
)
BEGIN
    UPDATE citas
    SET estado = p_estado
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$

-- Eliminar Cita
DROP PROCEDURE IF EXISTS sp_eliminar_cita$$
CREATE PROCEDURE sp_eliminar_cita(IN p_id BIGINT)
BEGIN
    DELETE FROM citas WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END$$

-- =============================================
-- PROCEDIMIENTOS DE ESTADÍSTICAS Y REPORTES
-- =============================================

-- Estadísticas de Recolecciones
DROP PROCEDURE IF EXISTS sp_estadisticas_recolecciones$$
CREATE PROCEDURE sp_estadisticas_recolecciones()
BEGIN
    SELECT 
        COUNT(*) as total_recolecciones,
        SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'ASIGNADA' THEN 1 ELSE 0 END) as asignadas,
        SUM(CASE WHEN estado = 'EN_PROCESO' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN estado = 'COMPLETADA' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'CANCELADA' THEN 1 ELSE 0 END) as canceladas,
        SUM(cantidad_kg) as total_kg_recolectados
    FROM recolecciones;
END$$

-- Estadísticas de Usuario
DROP PROCEDURE IF EXISTS sp_estadisticas_usuario$$
CREATE PROCEDURE sp_estadisticas_usuario(IN p_usuario_id BIGINT)
BEGIN
    SELECT 
        u.nombre,
        u.email,
        u.nivel,
        u.puntos,
        COUNT(r.id) as total_recolecciones,
        SUM(r.cantidad_kg) as total_kg_reciclados,
        SUM(CASE WHEN r.estado = 'COMPLETADA' THEN 1 ELSE 0 END) as recolecciones_completadas
    FROM usuarios u
    LEFT JOIN recolecciones r ON u.id = r.cliente_id
    WHERE u.id = p_usuario_id
    GROUP BY u.id;
END$$

-- Ranking de Usuarios por Puntos
DROP PROCEDURE IF EXISTS sp_ranking_usuarios$$
CREATE PROCEDURE sp_ranking_usuarios(IN p_limit INT)
BEGIN
    SELECT 
        id,
        nombre,
        email,
        nivel,
        puntos,
        RANK() OVER (ORDER BY puntos DESC) as ranking
    FROM usuarios
    WHERE rol = 'CLIENTE'
    ORDER BY puntos DESC
    LIMIT p_limit;
END$$

-- Reporte de Materiales Recolectados
DROP PROCEDURE IF EXISTS sp_reporte_materiales$$
CREATE PROCEDURE sp_reporte_materiales()
BEGIN
    SELECT 
        tipo_material,
        COUNT(*) as total_recolecciones,
        SUM(cantidad_kg) as total_kg,
        AVG(cantidad_kg) as promedio_kg
    FROM recolecciones
    WHERE estado = 'COMPLETADA'
    GROUP BY tipo_material
    ORDER BY total_kg DESC;
END$$

DELIMITER ;

-- =============================================
-- FIN DE PROCEDIMIENTOS ALMACENADOS
-- =============================================
