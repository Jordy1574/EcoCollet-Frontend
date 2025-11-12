import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router'; 
// Asegúrate de que esta ruta sea correcta y que tus interfaces Cita y User estén allí.
import { Cita, } from '../../../../../core/models/cita.model'; 
import {  User } from '../../../../../core/models/user.model';
import { AuthApiService } from '../../../../api/auth.api.service'; 
<<<<<<< Updated upstream
=======
import { UserCitasApiService, CitaUsuario } from '../../../../api/user-citas.api.service';
import { AdminApiService } from '../../../../api/admin.api.service';
import { NivelApiService, ProgresionNivel } from '../../../../api/nivel.api.service';
import { RecoleccionApiService } from '../../../../api/recoleccion.api.service';
import { Recoleccion } from '../../../../../core/models/recoleccion.model';
>>>>>>> Stashed changes
// NOTA: Es fundamental que Cita.id y User.id sean ambos STRING o ambos NUMBER para evitar errores.
// Asumo que tu backend usa STRINGs para IDs.

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], 
  templateUrl: './usuario-dashboard.component.html',

  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class UsuarioDashboardComponent implements OnInit {
  hoy = new Date().toISOString().split('T')[0];
  // --- PROPIEDADES INICIALES Y DATA SIMULADA ---
  user: User | null = null; 
  isLoading: boolean = true; 
  
  currentSection: 'dashboard' | 'citas' | 'puntos' | 'recompensas' | 'perfil' = 'dashboard'; 
  pageTitle: string = 'Panel de Control'; 
  pageSubtitle: string = 'Bienvenido a tu dashboard'; 

  // Datos simulados (MOCK DATA)
  estadisticas = {
    citasCompletadas: 8,
    materialReciclado: 45.5,
    puntosGanados: 890,
    impactoAmbiental: 12
  };
<<<<<<< Updated upstream
  citasPendientes: Cita[] = [
    // IDs como string para coincidir con la interfaz en core/models
    { id: '1', fecha: '2025-10-25', hora: '10:00 AM', estado: 'Pendiente', direccion: 'Calle Los Rosales 123', tipoMaterial: 'PLASTICO', cantidadEstimada: 5, puntos: 50 },
    { id: '2', fecha: '2025-10-22', hora: '02:00 PM', estado: 'Completada', direccion: 'Av. Siempreviva 742', tipoMaterial: 'PAPEL', cantidadEstimada: 3, puntos: 30 },
    { id: '3', fecha: '2025-11-01', hora: '09:00 AM', estado: 'Pendiente', direccion: 'Jr. Miraflores 999', tipoMaterial: 'VIDRIO', cantidadEstimada: 12, puntos: 120 }
  ];
=======
  citasPendientes: Cita[] = [];
  misCitasBackend: CitaUsuario[] = []; // Citas del backend
  materialesBackend: any[] = []; // Lista de materiales del backend
    misRecolecciones: Recoleccion[] = []; // Recolecciones del usuario autenticado
>>>>>>> Stashed changes
  
  // --- FORMULARIOS Y ESTADOS ---
  showAgendarForm = false; 
  agendarStep = 1; 
  materialesDisponibles = [
    { tipo: 'PLASTICO', nombre: 'Plástico', seleccionado: false, icono: '♲' }, 
    { tipo: 'PAPEL', nombre: 'Papel', seleccionado: false, icono: '📄' }, 
    { tipo: 'VIDRIO', nombre: 'Vidrio', seleccionado: false, icono: '🍾' }, 
    { tipo: 'METAL', nombre: 'Metal', seleccionado: false, icono: '🔧' } 
  ]; 
  agendarForm = {
    cantidad: 0,
    fecha: '',
    hora: '',
    direccion: '',
    referencia: '',
    distrito: '',
    materiales: [] as string[]
  }; 
  horasDisponibles = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']; 
  distritos = ['San Isidro', 'Miraflores', 'Surco', 'San Borja', 'La Molina', 'Barranco'];
  materialesFiltro = ['Todos', 'Plástico', 'Papel', 'Vidrio', 'Metal'];

  // --- PERFIL Y OTROS DATOS ---
  perfilUsuario = { nombre: 'Alexander', nivel: 'Eco-Héroe', correo: 'alexander@mail.com', avatar: '👤', titulo: 'Reciclador Pro', kilos: 45 };
  editandoPerfil = false;
  perfilForm = { nombre: '', apellido: '', correo: '', email: '', telefono: '', distrito: '', direccion: '', tipoUsuario: 'Individual', notificacionesEmail: true, notificacionesPush: true, recordatorios: true };
  puntosDisponibles = 1250;
  
  puntos: any[] = [
    { id: '1', nombre: 'Centro de Reciclaje San Isidro', estado: 'Abierto', direccion: 'Av. Los Rosales 123, San Isidro', horario: '9:00 AM - 6:00 PM', materiales: ['Plástico', 'Papel', 'Vidrio'], distancia: '1.2 km', tipo: 'punto-oficial' },
    { id: '2', nombre: 'EcoRecicla Miraflores', estado: 'Abierto', direccion: 'Calle Las Orquídeas 456, Miraflores', horario: '8:00 AM - 5:00 PM', materiales: ['Plástico', 'METAL'], distancia: '2.5 km', tipo: 'punto-comunidad' },
  ];
  rankingUsuarios: any[] = [
    { id: 1, nombre: 'Carlos P.', puntos: 2500, posicion: 1, avatar: '👨', titulo: 'Eco Warrior', kilos: 250 },
    { id: 2, nombre: 'María S.', puntos: 2200, posicion: 2, avatar: '👩', titulo: 'Eco Master', kilos: 220 },
    { id: 3, nombre: 'Juan R. (Tú)', puntos: 1800, posicion: 3, avatar: '👨', titulo: 'Eco Guardian', kilos: 180 },
  ];
  recompensasDisponibles: any[] = [
    { id: 1, nombre: 'Bolsa Ecológica', puntos: 500, stock: 10, imagen: '🛍️', descripcion: 'Bolsa reutilizable', colorFondo: 'bg-eco-green', disponible: true },
    { id: 2, nombre: 'Botella Reutilizable', puntos: 1800, stock: 5, imagen: '🍶', descripcion: 'Botella de acero inoxidable', colorFondo: 'bg-eco-blue', disponible: false },
  ];
  distritoSeleccionado = '';
  materialSeleccionado = 'Todos';


  // --- CONSTRUCTOR Y LIFECYCLE ---
<<<<<<< Updated upstream
  constructor(private authService: AuthApiService, private router: Router) {}
=======
  constructor(
    private authService: AuthApiService, 
    private router: Router,
    private userCitasService: UserCitasApiService,
    private adminApi: AdminApiService,
    private nivelApi: NivelApiService,
    private recoleccionApi: RecoleccionApiService
  ) {}
>>>>>>> Stashed changes

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    // Lógica de Redirección y Autenticación
    if (!this.authService.isAuthenticated() || !this.user || this.user.rol !== 'CLIENTE') {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadDashboardData();
<<<<<<< Updated upstream
=======
    // this.cargarMisCitas(); // Comentado: usamos cargarMisRecolecciones() en su lugar
    this.cargarMateriales();
    this.cargarNivelUsuario();
    this.cargarMisRecolecciones();
>>>>>>> Stashed changes
  }


  // --- MÉTODOS DE LA UI Y NEGOCIO ---
  cargarMisRecolecciones(): void {
    this.recoleccionApi.getMisRecolecciones().subscribe({
      next: (recolecciones: any[]) => {
        console.log('✅ Recolecciones cargadas:', recolecciones);
        
        // Mapear datos del backend al modelo del frontend
        this.misRecolecciones = recolecciones.map(r => {
          // Extraer dirección del string DireccionRecoleccion(...)
          const direccion = this.extraerDireccion(r.direccionRecojo);
          
          return {
            id: String(r.id),
            cantidad_kg: String(r.cantidadKg || r.cantidad_kg || '0'),
            direccion: direccion,
            distrito: '',
            referencia: '',
            estado: this.normalizarEstadoRecoleccion(r.estado),
            fechaAsignacion: r.fechaAsignacion || '',
            fechaCompletada: r.fechaCompletada || '',
            fechaSolicitud: r.fechaSolicitud || '',
            fechaRecojo: r.fechaSolicitud || '', // Usar fechaSolicitud como fechaRecojo
            tipo_material: r.tipoMaterial || '',
            cliente_id: String(r.clienteId || ''),
            recolector_id: r.recolectorId ? String(r.recolectorId) : undefined
          };
        }) as Recoleccion[];
        
        // Actualizar citasPendientes también para que se vean en el dashboard
        this.citasPendientes = this.misRecolecciones.map(r => ({
          id: r.id,
          fecha: r.fechaRecojo,
          hora: '00:00', // No tenemos hora del backend, usar default
          estado: r.estado as any,
          direccion: r.direccion,
          tipoMaterial: r.tipo_material,
          cantidadEstimada: Number(r.cantidad_kg),
          puntos: this.calcularPuntos(Number(r.cantidad_kg))
        }));
        
        console.log('✅ CitasPendientes actualizadas:', this.citasPendientes);
      },
      error: (err: any) => {
        console.error('❌ Error al cargar recolecciones:', err);
      }
    });
  }

  private extraerDireccion(direccionString: any): string {
    // Intenta extraer la dirección de un string como:
    // "DireccionRecoleccion(direccion=Mi casa, distrito=null, referencia=null)"
    if (!direccionString) return '';
    
    if (typeof direccionString === 'object') {
      return direccionString.direccion || '';
    }
    
    // Si es string, usar regex para extraer el valor de "direccion="
    const match = String(direccionString).match(/direccion=([^,\)]+)/);
    return match ? match[1].trim() : String(direccionString);
  }

  private normalizarEstadoRecoleccion(estado: string): 'Pendiente' | 'En proceso' | 'Completada' | 'Confirmada' | 'Cancelada' {
    const e = (estado || '').toUpperCase();
    if (e.includes('PEND')) return 'Pendiente';
    if (e.includes('PROCESO')) return 'En proceso';
    if (e.includes('COMPLET')) return 'Completada';
    if (e.includes('CONFIRM')) return 'Confirmada';
    if (e.includes('CANCEL')) return 'Cancelada';
    return 'Pendiente';
  }

  calcularPuntos(cantidadKg: number): number {
    return cantidadKg * 10; // 10 puntos por kg
  }

  private loadDashboardData(): void {
    setTimeout(() => {
      // mock user con id como string para coincidir con User model
      this.user = { id: '1', name: 'Alexander Rodriguez', rol: 'CLIENTE', email: 'alex@mail.com' };
      if (this.user) {
        this.perfilForm.nombre = this.user.name.split(' ')[0] || '';
        this.perfilForm.apellido = this.user.name.split(' ')[1] || '';
        this.perfilForm.email = this.user.email || '';
        this.perfilUsuario.nombre = this.user.name || this.perfilUsuario.nombre;
      }

      this.isLoading = false;
    }, 500);
  }

  loadSection(section: 'dashboard' | 'citas' | 'puntos' | 'recompensas' | 'perfil'): void {
    this.currentSection = section; 
    switch(section) {
      case 'dashboard': this.pageTitle = 'Panel de Control'; this.pageSubtitle = 'Bienvenido a tu dashboard'; break;
      case 'citas': this.pageTitle = 'Mis Citas'; this.pageSubtitle = 'Gestiona tus citas de recolección'; break;
      case 'puntos': this.pageTitle = 'Puntos de Reciclaje'; this.pageSubtitle = 'Encuentra puntos cercanos'; break;
      case 'recompensas': this.pageTitle = 'Recompensas'; this.pageSubtitle = 'Canjea tus puntos por premios'; break;
      case 'perfil': this.pageTitle = 'Mi Perfil'; this.pageSubtitle = 'Gestiona tu información personal'; break;
    }
  }

  // >>> GETTER CORREGIDO PARA EL DASHBOARD (Soluciona el error de "Parser Error" en el filtro)
  get citasPendientesDashboard(): Cita[] {
    // Filtramos el array una sola vez en TypeScript
    return this.citasPendientes.filter(cita => cita.estado === 'Pendiente');
  }

  // Métodos de UTILIDAD y FORMATO
  formatFechaCorta(fecha: string): string { return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }); }
  formatearFecha(fecha: string): string { 
    return new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); 
  }

  // Métodos de ESTILOS
  getMaterialClass(material: any) { return { 'p-4 rounded-lg border-2 flex items-center space-x-3 transition-colors': true, 'border-eco-green bg-green-50': material.seleccionado, 'border-gray-200 hover:border-eco-green': !material.seleccionado }; }
  getMaterialIconClass(tipoMaterial: string): string { 
    const classes: { [key: string]: string } = {
      'PLASTICO': 'bg-blue-500',
      'PAPEL': 'bg-yellow-500',
      'VIDRIO': 'bg-green-500',
      'METAL': 'bg-gray-600',
      'default': 'bg-gray-500'
    };
    return classes[tipoMaterial.toUpperCase()] || classes['default'];
  }
  getMaterialIcon(tipoMaterial: string): string { 
    return this.materialesDisponibles.find(m => m.tipo === tipoMaterial)?.icono || '♲'; 
  }
  getPuntosPorCita(cita: any): number { return cita.puntos || 0; }
  getCrecimientoClass() { return 'text-green-600'; }
  getCrecimientoCitasClass() { return 'text-green-600'; }
  getCrecimientoPuntosClass() { return 'text-green-600'; }
  calcularPorcentajeCrecimiento() { return '+15%'; }
  calcularCrecimientoCitas() { return '+20%'; }
  calcularCrecimientoPuntos() { return '+25%'; }
  getRankingIcon(posicion: number): string { return { 1: '🥇', 2: '🥈', 3: '🥉' }[posicion] || `${posicion}`; }
  getTipoColor(punto: any): string { return `bg-${punto.tipo.toLowerCase()}-500`; }
  getEstadoPuntoClass(estado: string): string { return `estado-${estado.toLowerCase()}`; }
  puedesCanjear(recompensa: any): boolean { return this.puntosDisponibles >= recompensa.puntos && recompensa.disponible; }

  // Método ajustado para el estado de las citas
  getCitaStatusClass(estado: string): string { 
    const classes: { [key: string]: string } = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'CONFIRMADA': 'bg-green-100 text-green-800',
      'CANCELADA': 'bg-red-100 text-red-800',
      'COMPLETADA': 'bg-blue-100 text-blue-800',
      'EN PROCESO': 'bg-purple-100 text-purple-800',
    };
    return classes[estado.toUpperCase()] || 'bg-gray-100 text-gray-800';
  }

  // Métodos de ACCIÓN
  toggleMaterial(material: any) {
    material.seleccionado = !material.seleccionado;
    this.agendarForm.materiales = this.materialesDisponibles.filter(m => m.seleccionado).map(m => m.tipo);
  }
  solicitarNuevaCita() { this.showAgendarForm = true; this.agendarStep = 1; this.resetAgendarForm(); }
  cancelarAgendamiento() { this.showAgendarForm = false; this.resetAgendarForm(); }
  prevAgendarStep() { if (this.agendarStep > 1) { this.agendarStep--; } }
  nextAgendarStep() { if (this.agendarStep < 3) { this.agendarStep++; } else { this.confirmarRecoleccion(); } }
  canProceedToNext(): boolean { 
    if (this.agendarStep === 1) return this.agendarForm.materiales.length > 0 && this.agendarForm.cantidad > 0;
    if (this.agendarStep === 2) return !!this.agendarForm.fecha && !!this.agendarForm.hora;
    if (this.agendarStep === 3) return !!this.agendarForm.direccion && !!this.agendarForm.distrito;
    return false;
  }
<<<<<<< Updated upstream
  confirmarRecoleccion() { this.showAgendarForm = false; this.resetAgendarForm(); }
  cancelarCita(id: string) { console.log('Cancelando cita:', id); } 
=======
  
  // ✅ CONFIRMAR RECOLECCIÓN - COMBINA AMBOS MÉTODOS
  confirmarRecoleccion() {
    // Construir el objeto de recolección según el modelo y el formulario
    if (!this.user) return;
    
    const nuevaRecoleccion: Partial<Recoleccion> = {
      cantidad_kg: String(this.agendarForm.cantidad),
      direccion: this.agendarForm.direccion,
      distrito: this.agendarForm.distrito,
      referencia: this.agendarForm.referencia,
      estado: 'Pendiente',
      fechaRecojo: this.agendarForm.fecha,
      tipo_material: this.agendarForm.materiales.join(', '),
      cliente_id: this.user.id,
      fechaSolicitud: new Date().toISOString(),
      fechaAsignacion: '',
    };
    
    this.isLoading = true;
    this.recoleccionApi.createRecoleccion(nuevaRecoleccion).subscribe({
      next: (recoleccion) => {
        console.log('✅ Recolección creada exitosamente:', recoleccion);
        alert('¡Recolección agendada exitosamente! 🎉');
        // Agregar la nueva cita a la lista local
        this.citasPendientes.push({
          id: recoleccion.id,
          fecha: recoleccion.fechaRecojo,
          hora: this.agendarForm.hora,
          estado: recoleccion.estado as any,
          direccion: recoleccion.direccion,
          tipoMaterial: recoleccion.tipo_material,
          cantidadEstimada: Number(recoleccion.cantidad_kg),
          puntos: 0
        });
        this.showAgendarForm = false;
        this.resetAgendarForm();
        this.isLoading = false;
        this.cargarMisCitas(); // Recargar desde backend
      },
      error: (err) => {
        console.error('❌ Error al agendar recolección:', err);
        alert('Error al agendar la recolección. Intenta nuevamente.');
        this.isLoading = false;
      }
    });
  }
  
  // ✅ CANCELAR CITA CON BACKEND
  cancelarCita(id: string) {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    
    this.userCitasService.cancelarCita(parseInt(id)).subscribe({
      next: () => {
        console.log('✅ Cita cancelada:', id);
        alert('Cita cancelada exitosamente');
        this.cargarMisCitas(); // Recargar lista
      },
      error: (err) => {
        console.error('❌ Error al cancelar cita:', err);
        alert('Error al cancelar la cita');
      }
    });
  }

>>>>>>> Stashed changes
  editarCita(citaId: string) { console.log('Editando cita:', citaId); } 
  verRutaHacia(punto: any) { console.log('Ver ruta hacia:', punto); } 
  llamarPunto(punto: any) { console.log('Llamar a punto:', punto); } 
  canjearRecompensa(recompensa: any) { console.log('Canjeando recompensa:', recompensa); } 
  guardarPerfil() { 
    this.perfilUsuario.nombre = this.perfilForm.nombre + ' ' + this.perfilForm.apellido;
    this.perfilUsuario.correo = this.perfilForm.email;
    this.editandoPerfil = false;
    console.log('Guardando perfil:', this.perfilForm); 
  } 
  toggleEditarPerfil() {
    this.editandoPerfil = !this.editandoPerfil;
    if (this.editandoPerfil) {
      this.perfilForm = { 
        nombre: this.perfilUsuario.nombre.split(' ')[0], 
        apellido: this.perfilUsuario.nombre.split(' ')[1] || '',
        correo: this.perfilUsuario.correo, 
        email: this.perfilUsuario.correo, telefono: '', distrito: 'Miraflores', 
        direccion: '', tipoUsuario: 'Individual', notificacionesEmail: true, 
        notificacionesPush: true, recordatorios: true 
      };
    }
  }
  
  logout(): void { 
    this.authService.logoutLocal(); 
    this.router.navigate(['/login']); 
  }

  resetAgendarForm() {
    this.agendarForm = { cantidad: 0, fecha: '', hora: '', direccion: '', referencia: '', distrito: '', materiales: [] };
    this.materialesDisponibles.forEach(m => m.seleccionado = false);
  }

  // Método para filtrar Puntos de Reciclaje
  getPuntosFiltrados() {
    return this.puntos
      .filter(punto => {
        const distritoMatch = !this.distritoSeleccionado || punto.direccion.includes(this.distritoSeleccionado);
        const materialMatch = this.materialSeleccionado === 'Todos' || punto.materiales.some((m: string) => m.toLowerCase() === this.materialSeleccionado.toLowerCase());
        return distritoMatch && materialMatch;
      });
  }
}