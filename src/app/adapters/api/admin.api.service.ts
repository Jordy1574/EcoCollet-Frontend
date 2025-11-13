import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { delay, map, catchError, switchMap } from 'rxjs/operators';
// IMPORTANTE: Asegúrate que estas interfaces estén en src/app/core/models/admin.models.ts
import { Usuario, Cita, PuntoReciclaje, Material, TrendPoint, TopUser, RolPermiso, ConfiguracionSistema } from '../../core/models/admin.models';
import { BaseHttpService, ApiResponse } from '../../core/services/base-http.service';

@Injectable({
    providedIn: 'root'
})
// Esta clase es el Adaptador de API que provee toda la data al AdminDashboard
export class AdminApiService {

    constructor(private http: BaseHttpService) {}

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

    // ============ MAPEO BACKEND -> UI (helpers) ============
    private toUiRol(apiRol: string | undefined): string {
        switch ((apiRol || '').toUpperCase()) {
            case 'ADMIN': return 'Admin';
            case 'RECOLECTOR': return 'Recolector';
            case 'CLIENTE': return 'Usuario';
            default: return 'Usuario';
        }
    }

    private toApiRol(uiRol: string | undefined): 'ADMIN' | 'RECOLECTOR' | 'CLIENTE' {
        switch ((uiRol || '').toLowerCase()) {
            case 'admin': return 'ADMIN';
            case 'recolector': return 'RECOLECTOR';
            default: return 'CLIENTE';
        }
    }

    private normalizeTipo(nombre: string | undefined): string {
        const n = (nombre || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        // map nombres comunes a tipos conocidos
        if (n.includes('plast')) return 'plastico';
        if (n.includes('papel') || n.includes('carton')) return 'papel';
        if (n.includes('vidri')) return 'vidrio';
        if (n.includes('metal') || n.includes('alumin') || n.includes('acero')) return 'metal';
        return n || 'otros';
    }

    private precioLabel(precio: number | undefined): string {
        if (precio == null || isNaN(precio)) return 'S/. 0.00/kg';
        return `S/. ${precio.toFixed(2)}/kg`;
    }

    private parsePrecioLabel(label: string | undefined): number {
        if (!label) return 0;
        const m = label.replace(/[^0-9.,]/g, '').replace(',', '.');
        const val = parseFloat(m);
        return isNaN(val) ? 0 : val;
    }

    private capitalizeEstado(estado: string | undefined): string {
        const e = (estado || '').toLowerCase();
        if (e === 'activo') return 'Activo';
        if (e === 'inactivo') return 'Inactivo';
        if (e === 'mantenimiento') return 'Mantenimiento';
        return estado || 'Activo';
    }

    private toApiEstado(uiEstado: string | undefined): 'activo' | 'inactivo' | 'mantenimiento' {
        const e = (uiEstado || '').toLowerCase();
        if (e.includes('manten')) return 'mantenimiento';
        if (e.includes('inac')) return 'inactivo';
        return 'activo';
    }

    private mapBackendUsuario(u: any): Usuario {
        return {
            id: String(u.id),
            nombre: u.nombre ?? '',
            email: u.email ?? '',
            rol: this.toUiRol(u.rol),
            distrito: u.direccion ?? '',
            estado: 'Activo',
            fechaRegistro: new Date().toLocaleDateString()
        };
    }

    private mapBackendMaterial(m: any): Material {
        return {
            id: String(m.id),
            nombre: m.nombre ?? '',
            tipo: this.normalizeTipo(m.nombre),
            cantidad: '0 kg',
            periodo: 'Este mes',
            info: {
                precioPromedio: this.precioLabel(m.precioPorKg),
                puntosActivos: '0',
                ultimaActualizacion: 'Hoy'
            }
        };
    }

    private mapBackendPunto(p: any): PuntoReciclaje {
        return {
            id: String(p.id),
            nombre: p.nombre ?? '',
            tipo: 'principal',
            tipoTexto: 'Centro Principal',
            direccion: p.direccion ?? '',
            horario: p.horario ?? '',
            materiales: (p.materialesAceptados || []).map((mat: any) => mat?.nombre ?? '').filter((n: string) => !!n),
            estado: this.capitalizeEstado(p.estado),
            googleMapsUrl: p.googleMapsUrl ?? ''
        };
    }

    // ============ USUARIOS (Backend) ============
    getUsuarios(): Observable<Usuario[]> {
        return this.http.get<any[]>('admin/usuarios')
            .pipe(
                map(resp => (resp.data || []).map(u => this.mapBackendUsuario(u))),
                catchError(() => of([]))
            );
    }
    
    getCitas(): Observable<Cita[]> {
        return of(this.mockCitas).pipe(delay(200));
    }

    // ============ PUNTOS DE RECICLAJE (Backend) ============
    getPuntosReciclaje(): Observable<PuntoReciclaje[]> {
        return this.http.get<any[]>('admin/puntos')
            .pipe(
                map(resp => (resp.data || []).map(p => this.mapBackendPunto(p))),
                catchError(() => of([]))
            );
    }

    // ============ MATERIALES (Backend) ============
    getMateriales(): Observable<Material[]> {
        return this.http.get<any[]>('admin/materiales')
            .pipe(
                map(resp => (resp.data || []).map(m => this.mapBackendMaterial(m))),
                catchError(() => of([]))
            );
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
    createUsuario(usuario: Partial<Usuario> & { password?: string }): Observable<Usuario> {
        const body = {
            nombre: usuario.nombre ?? '',
            email: usuario.email ?? '',
            password: usuario['password'] ?? 'Temporal123*',
            rol: this.toApiRol(usuario.rol),
            telefono: undefined,
            direccion: usuario.distrito ?? ''
        };
        return this.http.post<any>('admin/usuarios', body)
            .pipe(map(resp => this.mapBackendUsuario((resp as any).data)));
    }

    updateUsuario(id: string, usuario: Partial<Usuario> & { password?: string }): Observable<Usuario> {
        const body: any = {
            nombre: usuario.nombre ?? '',
            email: usuario.email ?? '',
            rol: this.toApiRol(usuario.rol),
            telefono: undefined,
            direccion: usuario.distrito ?? ''
        };
        if (usuario['password']) {
            body.password = usuario['password'];
        }
        return this.http.put<any>(`admin/usuarios/${id}`, body)
            .pipe(map(resp => this.mapBackendUsuario((resp as any).data)));
    }

    deleteUsuario(id: string): Observable<void> {
        return this.http.delete<void>(`admin/usuarios/${id}`)
            .pipe(map(() => void 0));
    }

    // Materiales
    createMaterial(material: any): Observable<Material> {
        const precio = typeof material?.precioPorKg === 'number'
            ? material.precioPorKg
            : this.parsePrecioLabel(material?.info?.precioPromedio);
        const body = {
            nombre: material?.nombre ?? '',
            precioPorKg: isNaN(precio) ? 0 : precio
        };
        return this.http.post<any>('admin/materiales', body)
            .pipe(map(resp => this.mapBackendMaterial((resp as any).data)));
    }

    updateMaterial(id: string, material: any): Observable<Material> {
        const precio = typeof material?.precioPorKg === 'number'
            ? material.precioPorKg
            : this.parsePrecioLabel(material?.info?.precioPromedio);
        const body = {
            nombre: material?.nombre ?? '',
            precioPorKg: isNaN(precio) ? 0 : precio
        };
        return this.http.put<any>(`admin/materiales/${id}`, body)
            .pipe(map(resp => this.mapBackendMaterial((resp as any).data)));
    }

    deleteMaterial(id: string): Observable<void> {
        return this.http.delete<void>(`admin/materiales/${id}`)
            .pipe(map(() => void 0));
    }

    // Puntos de reciclaje
    private buildPuntoRequest(punto: Partial<PuntoReciclaje>, backendMateriales: any[]): any {
        const nombres = (punto.materiales || []) as string[];
        const idMap = new Map<string, number>();
        const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        backendMateriales.forEach(m => idMap.set(norm((m.nombre || '').toString()), m.id));
        const materialesAceptadosIds: number[] = nombres
            .map(n => idMap.get(norm(n)))
            .filter((v): v is number => typeof v === 'number');

        return {
            nombre: punto.nombre ?? '',
            direccion: punto.direccion ?? '',
            telefono: undefined,
            horario: punto.horario ?? '',
            estado: this.toApiEstado(punto.estado),
            materialesAceptadosIds,
            googleMapsUrl: (punto.googleMapsUrl || '').toString()
        };
    }

    createPuntoReciclaje(punto: Partial<PuntoReciclaje>): Observable<PuntoReciclaje> {
        // Obtener materiales del backend para mapear nombres -> IDs
        return this.http.get<any[]>('admin/materiales').pipe(
            switchMap(resp => {
                const body = this.buildPuntoRequest(punto, (resp as any).data || []);
                return this.http.post<any>('admin/puntos', body);
            }),
            map(resp => this.mapBackendPunto((resp as any).data))
        );
    }

    updatePuntoReciclaje(id: string, punto: Partial<PuntoReciclaje>): Observable<PuntoReciclaje> {
        return this.http.get<any[]>('admin/materiales').pipe(
            switchMap(resp => {
                const body = this.buildPuntoRequest(punto, (resp as any).data || []);
                return this.http.put<any>(`admin/puntos/${id}`, body);
            }),
            map(resp => this.mapBackendPunto((resp as any).data))
        );
    }

    deletePuntoReciclaje(id: string): Observable<void> {
        return this.http.delete<void>(`admin/puntos/${id}`)
            .pipe(map(() => void 0));
    }

    // ====== Búsquedas específicas (no usadas aún por la UI pero listas) ======
    searchMateriales(query: string): Observable<Material[]> {
        const params = new HttpParams().set('query', query);
        return this.http.get<any[]>('admin/materiales/search', params)
            .pipe(map(resp => (resp.data || []).map(m => this.mapBackendMaterial(m))));
    }

    searchPuntos(query: string): Observable<PuntoReciclaje[]> {
        const params = new HttpParams().set('query', query);
        return this.http.get<any[]>('admin/puntos/search', params)
            .pipe(map(resp => (resp.data || []).map(p => this.mapBackendPunto(p))));
    }

    getPuntosPorEstado(estado: 'activo' | 'inactivo' | 'mantenimiento'): Observable<PuntoReciclaje[]> {
        return this.http.get<any[]>(`admin/puntos/estado/${estado}`)
            .pipe(map(resp => (resp.data || []).map(p => this.mapBackendPunto(p))));
    }

    // ====================================================================
    // CITAS (Recolecciones) - Backend Integration
    // ====================================================================
    
    private mapBackendCita(c: any): Cita {
        // Multi-material support vía items[] y normalización de estados
        let tipo = 'Sin especificar';
        let cantidad = 'N/A';
        const items = c.items || [];
        if (Array.isArray(items) && items.length > 0) {
            const totalKg = items.reduce((sum: number, it: any) => sum + (Number(it.kg) || 0), 0);
            const nombresMateriales = items.map((it: any) => it.materialNombre).filter(Boolean);
            tipo = nombresMateriales.length > 0 ? nombresMateriales.join(', ') : `${items.length} materiales`;
            cantidad = `${totalKg.toFixed(1)} kg`;
        } else {
            tipo = c.materialNombre ?? 'Sin especificar';
            cantidad = c.cantidadEstimada ? `${c.cantidadEstimada} kg aprox.` : 'N/A';
        }

        const estadoRaw = (c.estado || '').toUpperCase();
        // Mapeo específico según guía: ASIGNADA -> En proceso
        let estadoUi: string;
        switch (estadoRaw) {
            case 'PENDIENTE': estadoUi = 'Pendiente'; break;
            case 'ASIGNADA': estadoUi = 'En proceso'; break;
            case 'EN_PROCESO': estadoUi = 'En proceso'; break;
            case 'COMPLETADA': estadoUi = 'Completada'; break;
            case 'CANCELADA': estadoUi = 'Cancelada'; break;
            default: estadoUi = 'Pendiente';
        }

        return {
            id: c.id ? `#${String(c.id).padStart(3, '0')}` : '#000',
            usuario: { nombre: c.usuarioNombre ?? 'Sin nombre', direccion: c.usuarioDireccion ?? 'Sin dirección' },
            material: { tipo, cantidad },
            fecha: { dia: c.fecha ?? 'Sin fecha', hora: c.hora ?? 'Sin hora' },
            estado: estadoUi,
            recolector: c.recolectorNombre ?? undefined
        };
    }

    getCitasFromBackend(): Observable<Cita[]> {
        return this.http.get<any[]>('admin/citas')
            .pipe(
                map(resp => {
                    console.log('✅ [ADMIN] Citas backend raw response:', resp);
                    const citas = (resp.data || []).map(c => this.mapBackendCita(c));
                    console.log('✅ [ADMIN] Citas mapeadas:', citas.length, 'citas');
                    return citas;
                }),
                catchError(err => {
                    console.error('❌ Error al obtener citas del backend:', err);
                    return of(this.mockCitas);
                })
            );
    }

    // Crear cita usuario legacy (1 material)
    createCita(cita: { usuarioId: number; materialId: number; cantidadEstimada: number; fecha: string; hora: string; notas?: string }): Observable<Cita> {
        console.log('📤 [ADMIN] Creando cita (legacy 1 material):', cita);
        return this.http.post<any>('admin/citas', cita)
            .pipe(map(resp => {
                console.log('✅ [ADMIN] Cita creada:', resp);
                return this.mapBackendCita(resp.data);
            }));
    }

    // Crear cita con múltiples materiales [{ materialId, kg }] (admin)
    createCitaMulti(payload: { usuarioId: number; materiales: { materialId: number; kg: number }[]; fecha: string; hora: string; notas?: string; recolectorId?: number; }): Observable<Cita> {
        console.log('📤 [ADMIN] Creando cita multi-material:', payload);
        return this.http.post<any>('admin/citas', payload)
            .pipe(map(resp => {
                console.log('✅ [ADMIN] Cita multi-material creada:', resp);
                return this.mapBackendCita(resp.data);
            }));
    }

    updateCita(id: string, updates: { estado?: string; recolectorId?: number; notas?: string }): Observable<Cita> {
        const numericId = id.replace('#', '');
        console.log(`📤 [ADMIN] Actualizando cita ${numericId}:`, updates);
        return this.http.put<any>(`admin/citas/${numericId}`, updates)
            .pipe(map(resp => {
                console.log('✅ [ADMIN] Cita actualizada:', resp);
                return this.mapBackendCita(resp.data);
            }));
    }

    deleteCita(id: string): Observable<void> {
        const numericId = id.replace('#', '');
        return this.http.delete<void>(`admin/citas/${numericId}`)
            .pipe(map(() => void 0));
    }

    // ====================================================================
    // REPORTES Y ESTADÍSTICAS - Backend Integration
    // ====================================================================

    getEstadisticasGenerales(): Observable<any> {
        return this.http.get<any>('admin/reportes/estadisticas')
            .pipe(
                map(resp => resp.data),
                catchError(() => of({
                    totalUsuarios: 0,
                    totalCitas: 0,
                    totalPuntosActivos: 0,
                    totalMaterialesRecolectados: 0,
                    citasPendientes: 0,
                    citasEnProceso: 0,
                    citasCompletadas: 0,
                    materialesPorTipo: {}
                }))
            );
    }

    getTopUsuariosBackend(limit: number = 10): Observable<TopUser[]> {
        const params = new HttpParams().set('limit', limit.toString());
        return this.http.get<any[]>('admin/reportes/top-usuarios', params)
            .pipe(
                map(resp => (resp.data || []).map(u => ({
                    id: String(u.id),
                    position: u.position ?? 0,
                    nombre: u.nombre ?? '',
                    ubicacion: u.distrito ?? '',
                    cantidad: `${u.totalKg ?? 0} kg`,
                    citas: `${u.totalCitas ?? 0} citas`
                }))),
                catchError(() => of(this.mockTopUsers))
            );
    }

    getActividadMensual(): Observable<any> {
        return this.http.get<any>('admin/reportes/actividad-mensual')
            .pipe(
                map(resp => resp.data),
                catchError(() => of({
                    labels: [],
                    citasCreadas: [],
                    citasCompletadas: [],
                    kgRecolectados: []
                }))
            );
    }

    getPuntosRendimiento(): Observable<any[]> {
        return this.http.get<any[]>('admin/reportes/puntos-rendimiento')
            .pipe(
                map(resp => resp.data || []),
                catchError(() => of([]))
            );
    }

    // ====================================================================
    // CONFIGURACIÓN DEL SISTEMA - Backend Integration
    // ====================================================================

    getConfiguracionFromBackend(): Observable<ConfiguracionSistema> {
        return this.http.get<any>('admin/configuracion')
            .pipe(
                map(resp => ({
                    nombreSistema: resp.data?.nombreSistema ?? 'EcoCollet',
                    emailContacto: resp.data?.emailContacto ?? '',
                    zonaHoraria: resp.data?.zonaHoraria ?? 'America/Lima',
                    backupAutomatico: resp.data?.backupAutomatico ?? false,
                    ultimoBackup: resp.data?.ultimoBackup ?? '',
                    colorPrincipal: resp.data?.colorPrincipal ?? '#5EA362',
                    tema: resp.data?.tema ?? 'claro',
                    notificaciones: resp.data?.notificaciones ?? { email: true, sms: false, push: true },
                    seguridad: resp.data?.seguridad ?? { dobleAutenticacion: false, sesionSegura: true }
                })),
                catchError(() => of(this.mockConfiguracion))
            );
    }

    updateConfiguracion(config: Partial<ConfiguracionSistema>): Observable<ConfiguracionSistema> {
        return this.http.put<any>('admin/configuracion', config)
            .pipe(
                map(resp => resp.data),
                catchError(() => of(this.mockConfiguracion))
            );
    }

    // ====================================================================
    // DASHBOARD RESUMEN - Backend Integration
    // ====================================================================

    getDashboardResumen(): Observable<any> {
        return this.http.get<any>('admin/dashboard/resumen')
            .pipe(
                map(resp => resp.data),
                catchError(() => of({
                    estadisticas: {
                        totalUsuarios: 0,
                        citasActivas: 0,
                        puntosActivos: 0,
                        kgRecolectadosEsteMes: 0
                    },
                    topUsuarios: [],
                    actividadReciente: [],
                    citasPorEstado: {
                        PENDIENTE: 0,
                        EN_PROCESO: 0,
                        COMPLETADA: 0,
                        CANCELADA: 0
                    }
                }))
            );
    }
}