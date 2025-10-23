import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
// IMPORTANTE: Asegúrate que estas interfaces estén en src/app/core/models/admin.models.ts
import { Usuario, Cita, PuntoReciclaje, Material, TrendPoint, TopUser, RolPermiso, ConfiguracionSistema } from '../../core/models/admin.models';

@Injectable({
    providedIn: 'root'
})
// Esta clase es el Adaptador de API que provee toda la data al AdminDashboard
export class AdminApiService {

    // ====================================================================
    // 1. DATA SIMULADA (MOCK ARRAYS)
    // ====================================================================

    private mockUsuarios: Usuario[] = [
        {
            id: '1', nombre: 'María González', email: 'maria.gonzalez@email.com', rol: 'Usuario',
            distrito: 'Miraflores', estado: 'Activo', fechaRegistro: '15/03/2024'
        },
        {
            id: '2', nombre: 'Juan Pérez', email: 'juan.perez@empresa.com', rol: 'Empresa',
            distrito: 'San Isidro', estado: 'Activo', fechaRegistro: '12/03/2024'
        },
        {
            id: '3', nombre: 'Ana Rodríguez', email: 'ana.rodriguez@email.com', rol: 'Recolector',
            distrito: 'Surco', estado: 'Suspendido', fechaRegistro: '10/03/2024'
        },
        {
            id: '4', nombre: 'Carlos López', email: 'carlos.lopez@email.com', rol: 'Usuario',
            distrito: 'La Molina', estado: 'Activo', fechaRegistro: '08/03/2024'
        },
        {
            id: '5', nombre: 'EcoTech Solutions', email: 'info@ecotech.com', rol: 'Empresa',
            distrito: 'Miraflores', estado: 'Activo', fechaRegistro: '05/03/2024'
        }
    ];

    private mockCitas: Cita[] = [
        {
            id: '#001',
            usuario: { nombre: 'María González', direccion: 'Av. Larco 123, Miraflores' },
            material: { tipo: 'Plástico', cantidad: '15 kg aprox.' },
            fecha: { dia: '20/03/2024', hora: '10:00 AM' },
            estado: 'Pendiente',
            recolector: undefined
        },
        {
            id: '#002',
            usuario: { nombre: 'Juan Pérez', direccion: 'Av. Pardo 456, San Isidro' },
            material: { tipo: 'Papel', cantidad: '8 kg aprox.' },
            fecha: { dia: '19/03/2024', hora: '2:00 PM' },
            estado: 'En proceso',
            recolector: 'Carlos Ruiz'
        },
        {
            id: '#003',
            usuario: { nombre: 'Ana Rodríguez', direccion: 'Av. Benavides 789, Surco' },
            material: { tipo: 'Vidrio', cantidad: '12 kg aprox.' },
            fecha: { dia: '18/03/2024', hora: '4:00 PM' },
            estado: 'Completada',
            recolector: 'Luis Torres'
        }
    ];

    private mockPuntosReciclaje: PuntoReciclaje[] = [
        {
            id: '1', nombre: 'EcoPoint Miraflores', tipo: 'principal', tipoTexto: 'Centro Principal',
            direccion: 'Av. Larco 345, Miraflores', horario: 'Lun-Sáb 8:00 AM - 6:00 PM',
            materiales: ['Plástico', 'Papel', 'Vidrio'], estado: 'Activo'
        },
        {
            id: '2', nombre: 'ReciclaMax San Isidro', tipo: 'empresarial', tipoTexto: 'Centro Empresarial',
            direccion: 'Av. Javier Prado 1234, San Isidro', horario: 'Lun-Vie 9:00 AM - 5:00 PM',
            materiales: ['Plástico', 'Papel', 'Electrónicos'], estado: 'Activo'
        },
        {
            id: '3', nombre: 'Verde Surco', tipo: 'comunitario', tipoTexto: 'Centro Comunitario',
            direccion: 'Av. Benavides 567, Surco', horario: 'Mar-Dom 8:00 AM - 7:00 PM',
            materiales: ['Papel', 'Cartón', 'Vidrio'], estado: 'Mantenimiento'
        }
    ];

    private mockMateriales: Material[] = [
        {
            id: '1', nombre: 'Plástico', tipo: 'plastico', cantidad: '1,245 kg', periodo: 'Este mes',
            info: { precioPromedio: 'S/. 2.50/kg', puntosActivos: '12', ultimaActualizacion: 'Hoy' }
        },
        {
            id: '2', nombre: 'Papel', tipo: 'papel', cantidad: '892 kg', periodo: 'Este mes',
            info: { precioPromedio: 'S/. 1.80/kg', puntosActivos: '15', ultimaActualizacion: 'Ayer' }
        },
        {
            id: '3', nombre: 'Vidrio', tipo: 'vidrio', cantidad: '567 kg', periodo: 'Este mes',
            info: { precioPromedio: 'S/. 1.20/kg', puntosActivos: '8', ultimaActualizacion: 'Hace 2 días' }
        },
        {
            id: '4', nombre: 'Metal', tipo: 'metal', cantidad: '143 kg', periodo: 'Este mes',
            info: { precioPromedio: 'S/. 4.00/kg', puntosActivos: '5', ultimaActualizacion: 'Hoy' }
        }
    ];

    private mockTrendPoints: TrendPoint[] = [
        { x: 20, y: 150 }, { x: 80, y: 140 }, { x: 140, y: 120 }, { x: 200, y: 110 },
        { x: 260, y: 115 }, { x: 320, y: 108 }, { x: 380, y: 105 }
    ];

    private mockTopUsers: TopUser[] = [
        { id: '1', position: 1, nombre: 'María González', ubicacion: 'Miraflores', cantidad: '125 kg', citas: '15 citas' },
        { id: '2', position: 2, nombre: 'Juan Pérez', ubicacion: 'San Isidro', cantidad: '98 kg', citas: '12 citas' },
        { id: '3', position: 3, nombre: 'Ana Rodríguez', ubicacion: 'Surco', cantidad: '87 kg', citas: '10 citas' },
        { id: '4', position: 4, nombre: 'Carlos López', ubicacion: 'La Molina', cantidad: '75 kg', citas: '8 citas' },
        { id: '5', position: 5, nombre: 'EcoTech Solutions', ubicacion: 'Miraflores', cantidad: '65 kg', citas: '6 citas' }
    ];

    private mockRolesPermisos: RolPermiso[] = [
        { id: '1', nombre: 'Administrador', descripcion: 'Acceso completo al sistema' },
        { id: '2', nombre: 'Recolector', descripcion: 'Gestión de citas y recolecciones' },
        { id: '3', nombre: 'Usuario', descripcion: 'Acceso básico a la plataforma' }
    ];

    private mockConfiguracion: ConfiguracionSistema = {
        nombreSistema: 'EcoCollet', emailContacto: 'admin@ecocollet.pe', zonaHoraria: 'America/Lima',
        backupAutomatico: true, ultimoBackup: '18/03/2024 - 02:00 AM', colorPrincipal: '#5EA362',
        tema: 'claro', notificaciones: { email: true, sms: false, push: true },
        seguridad: { dobleAutenticacion: false, sesionSegura: true }
    };
    
    // ====================================================================
    // 2. MÉTODOS (CONTRATO DE LA API) - Devuelven los datos simulados
    // ====================================================================

    getUsuarios(): Observable<Usuario[]> {
        return of(this.mockUsuarios).pipe(delay(200));
    }
    
    getCitas(): Observable<Cita[]> {
        return of(this.mockCitas).pipe(delay(200));
    }

    getPuntosReciclaje(): Observable<PuntoReciclaje[]> {
        return of(this.mockPuntosReciclaje).pipe(delay(200));
    }

    getMateriales(): Observable<Material[]> {
        return of(this.mockMateriales).pipe(delay(200));
    }

    getTrendPoints(): Observable<TrendPoint[]> {
        return of(this.mockTrendPoints).pipe(delay(200));
    }

    getTopUsers(): Observable<TopUser[]> {
        return of(this.mockTopUsers).pipe(delay(200));
    }
    
    getRolesPermisos(): Observable<RolPermiso[]> {
        return of(this.mockRolesPermisos).pipe(delay(200));
    }

    getConfiguracion(): Observable<ConfiguracionSistema> {
        return of(this.mockConfiguracion).pipe(delay(100));
    }

    // ====================================================================
    // CRUD METHODS (mock implementations)
    // ====================================================================

    // Usuarios
    createUsuario(usuario: Partial<Usuario>): Observable<Usuario> {
        const newUsuario: Usuario = {
            id: (this.mockUsuarios.length + 1).toString(),
            nombre: usuario.nombre || 'Nuevo Usuario',
            email: usuario.email || 'nuevo@dominio.com',
            rol: usuario.rol || 'Usuario',
            distrito: usuario.distrito || '',
            estado: usuario.estado || 'Activo',
            fechaRegistro: usuario.fechaRegistro || new Date().toLocaleDateString()
        };
        this.mockUsuarios.push(newUsuario);
        return of(newUsuario).pipe(delay(300));
    }

    updateUsuario(id: string, usuario: Partial<Usuario>): Observable<Usuario> {
        const idx = this.mockUsuarios.findIndex(u => u.id === id);
        if (idx !== -1) {
            this.mockUsuarios[idx] = { ...this.mockUsuarios[idx], ...usuario };
            return of(this.mockUsuarios[idx]).pipe(delay(300));
        }
        throw new Error('Usuario no encontrado');
    }

    deleteUsuario(id: string): Observable<void> {
        const idx = this.mockUsuarios.findIndex(u => u.id === id);
        if (idx !== -1) {
            this.mockUsuarios.splice(idx, 1);
            return of(void 0).pipe(delay(300));
        }
        throw new Error('Usuario no encontrado');
    }

    // Materiales
    createMaterial(material: Partial<Material>): Observable<Material> {
        const newMaterial: Material = {
            id: (this.mockMateriales.length + 1).toString(),
            nombre: material.nombre || 'Nuevo Material',
            tipo: material.tipo || 'otro',
            cantidad: material.cantidad || '0',
            periodo: material.periodo || 'Hoy',
            info: material.info
        } as Material;
        this.mockMateriales.push(newMaterial);
        return of(newMaterial).pipe(delay(300));
    }

    updateMaterial(id: string, material: Partial<Material>): Observable<Material> {
        const idx = this.mockMateriales.findIndex(m => m.id === id);
        if (idx !== -1) {
            this.mockMateriales[idx] = { ...this.mockMateriales[idx], ...material };
            return of(this.mockMateriales[idx]).pipe(delay(300));
        }
        throw new Error('Material no encontrado');
    }

    deleteMaterial(id: string): Observable<void> {
        const idx = this.mockMateriales.findIndex(m => m.id === id);
        if (idx !== -1) {
            this.mockMateriales.splice(idx, 1);
            return of(void 0).pipe(delay(300));
        }
        throw new Error('Material no encontrado');
    }

    // Puntos de reciclaje
    createPuntoReciclaje(punto: Partial<PuntoReciclaje>): Observable<PuntoReciclaje> {
        const newPunto: PuntoReciclaje = {
            id: (this.mockPuntosReciclaje.length + 1).toString(),
            nombre: punto.nombre || 'Nuevo Punto',
            tipo: punto.tipo || 'comunitario',
            tipoTexto: punto.tipoTexto || 'Centro',
            direccion: punto.direccion || '',
            horario: punto.horario || '',
            materiales: punto.materiales || [],
            estado: punto.estado || 'Activo'
        } as PuntoReciclaje;
        this.mockPuntosReciclaje.push(newPunto);
        return of(newPunto).pipe(delay(300));
    }

    updatePuntoReciclaje(id: string, punto: Partial<PuntoReciclaje>): Observable<PuntoReciclaje> {
        const idx = this.mockPuntosReciclaje.findIndex(p => p.id === id);
        if (idx !== -1) {
            this.mockPuntosReciclaje[idx] = { ...this.mockPuntosReciclaje[idx], ...punto };
            return of(this.mockPuntosReciclaje[idx]).pipe(delay(300));
        }
        throw new Error('Punto de reciclaje no encontrado');
    }

    deletePuntoReciclaje(id: string): Observable<void> {
        const idx = this.mockPuntosReciclaje.findIndex(p => p.id === id);
        if (idx !== -1) {
            this.mockPuntosReciclaje.splice(idx, 1);
            return of(void 0).pipe(delay(300));
        }
        throw new Error('Punto de reciclaje no encontrado');
    }
}