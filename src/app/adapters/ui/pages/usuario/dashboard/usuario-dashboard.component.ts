// src/app/adapters/ui/pages/usuario/dashboard/usuario-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// IMPORTACIONES CORREGIDAS (4 NIVELES DE SALTO)
import { User } from '../../../../../core/models/user.model';
import { AuthApiService } from '../../../../api/auth.api.service';

// INTERFACES LOCALES
interface CitaUsuario {
  id: string;
  fecha: string;
  hora: string;
  direccion: string;
  material: string;
  cantidad: string;
  estado: 'Pendiente' | 'Confirmada' | 'En proceso' | 'Completada' | 'Cancelada';
  recolector?: string;
}

interface EstadisticasUsuario {
  citasCompletadas: number;
  materialReciclado: number;
  puntosGanados: number;
  impactoAmbiental: number;
}

interface PuntoReciclaje {
  id: string;
  nombre: string;
  direccion: string;
  distancia: string;
  materiales: string[];
  horario: string;
  estado: 'Abierto' | 'Cerrado' | 'Mantenimiento';
}

interface RankingUsuario {
  id: string;
  nombre: string;
  titulo: string;
  puntos: number;
  kilos: number;
  avatar: string;
  posicion: number;
}

interface Recompensa {
  id: string;
  nombre: string;
  descripcion: string;
  puntos: number;
  categoria: 'ecologico' | 'descuento' | 'curso' | 'tecnologia' | 'jardineria' | 'transporte';
  disponible: boolean;
  imagen: string;
  colorFondo: string;
}

interface MaterialReciclado {
  tipo: 'Plastico' | 'Papel' | 'Vidrio' | 'Metal';
  cantidad: number;
  porcentaje: number;
  color: string;
}

interface ActividadReciente {
  id: string;
  tipo: 'recoleccion' | 'canje' | 'puntos';
  descripcion: string;
  fecha: string;
  icono: string;
  color: string;
}

interface PerfilUsuario {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaRegistro: string;
  nivel: string;
  proximoNivel: string;
  experiencia: number;
  experienciaRequerida: number;
}

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-dashboard.component.html',
  styleUrls: [],
})
export class UsuarioDashboardComponent implements OnInit {
  user: User | null = null;
  
  // Sección activa y títulos
  currentSection: 'dashboard' | 'citas' | 'puntos' | 'recompensas' | 'perfil' = 'dashboard';
  pageTitle: string = 'EcoCollet - Usuario';
  pageSubtitle: string = 'Inicio';

  private titlesMap = {
    'dashboard': { title: '¡Bienvenido a EcoCollet! 🌱', subtitle: 'Tu centro de control ambiental' },
    'citas': { title: 'Mis Citas de Recolección 📅', subtitle: 'Gestiona y revisa tus citas programadas' },
    'puntos': { title: 'Puntos de Reciclaje 📍', subtitle: 'Encuentra centros de reciclaje cercanos' },
    'recompensas': { title: 'Mis Recompensas 🏆', subtitle: 'Canjea tus puntos por premios' },
    'perfil': { title: 'Mi Perfil 👤', subtitle: 'Gestiona tu información personal' }
  };
  
  // PROPIEDADES DE DATOS
  estadisticas: EstadisticasUsuario = {
    citasCompletadas: 0,
    materialReciclado: 0,
    puntosGanados: 0,
    impactoAmbiental: 0
  };

  // Estadísticas del mes anterior para comparación
  estadisticasMesAnterior: EstadisticasUsuario = {
    citasCompletadas: 0,
    materialReciclado: 0,
    puntosGanados: 0,
    impactoAmbiental: 0
  };
  
  citasPendientes: CitaUsuario[] = [];
  historialCitas: CitaUsuario[] = [];
  puntosReciclajeCercanos: PuntoReciclaje[] = [];
  
  // Estados del componente
  isLoading = false;

  // Filtros para puntos de reciclaje
  distritoSeleccionado: string = 'Todos los distritos';
  materialSeleccionado: string = 'Todos los materiales';
  
  distritosDisponibles: string[] = [
    'Todos los distritos',
    'Miraflores', 
    'San Isidro', 
    'Surco', 
    'La Molina', 
    'Barranco', 
    'Magdalena'
  ];
  
  materialesFiltro: string[] = [
    'Todos los materiales',
    'Plástico',
    'Papel', 
    'Cartón',
    'Vidrio',
    'Electrónicos',
    'Metal'
  ];

  // PROPIEDADES PARA RECOMPENSAS Y RANKING
  puntosDisponibles: number = 2847;
  rankingUsuarios: RankingUsuario[] = [];
  recompensasDisponibles: Recompensa[] = [];
  usuarioActual: RankingUsuario = {
    id: 'user-1',
    nombre: 'Alexander',
    titulo: 'Eco-Héroe',
    puntos: 2847,
    kilos: 47.5,
    avatar: 'A',
    posicion: 3
  };

  // PROPIEDADES PARA PERFIL
  perfilUsuario: PerfilUsuario = {
    nombre: 'Alexander',
    email: 'alexander@email.com',
    telefono: '+51 999 999 999',
    direccion: 'Av. Larco 123, Miraflores',
    fechaRegistro: '2024-01-15',
    nivel: 'Eco-Héroe',
    proximoNivel: 'Eco-Campeón',
    experiencia: 75,
    experienciaRequerida: 100
  };

  materialesReciclados: MaterialReciclado[] = [];
  actividadReciente: ActividadReciente[] = [];
  progresoMensual: number = 95;
  metaMensual: number = 50;

  // PROPIEDADES PARA FORMULARIO DE PERFIL
  editandoPerfil: boolean = false;
  perfilForm = {
    nombre: 'Alexander',
    apellido: 'Rodriguez',
    email: 'alexander.rodriguez@email.com',
    telefono: '+51 987 654 321',
    distrito: 'Miraflores',
    direccion: 'Av. Larco 123, Miraflores',
    tipoUsuario: 'Individual',
    notificacionesEmail: true,
    notificacionesPush: false,
    recordatorios: true
  };

  constructor(
    private authService: AuthApiService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
    
    // Protección de ruta: Solo usuarios normales
    if (!this.user || this.user.role !== 'usuario') {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // CARGAR DATOS DEL DASHBOARD
  loadDashboardData(): void {
    this.isLoading = true;
    
    // Datos mock temporales (después los conectaremos con el servicio)
    setTimeout(() => {
      this.estadisticas = {
        citasCompletadas: 8,
        materialReciclado: 45.5,
        puntosGanados: 890,
        impactoAmbiental: 12.3
      };

      // Estadísticas del mes anterior para comparación
      this.estadisticasMesAnterior = {
        citasCompletadas: 6,
        materialReciclado: 39.5,
        puntosGanados: 774,
        impactoAmbiental: 10.7
      };

      this.citasPendientes = [
        {
          id: 'C001',
          fecha: '2024-03-20',
          hora: '10:00 AM',
          direccion: 'Av. Larco 123, Miraflores',
          material: 'Plástico',
          cantidad: '8 kg',
          estado: 'Confirmada',
          recolector: 'Juan Pérez'
        },
        {
          id: 'C002',
          fecha: '2024-03-22',
          hora: '2:00 PM',
          direccion: 'Jr. Puno 456, San Isidro',
          material: 'Papel',
          cantidad: '5 kg',
          estado: 'Pendiente'
        }
      ];

      this.puntosReciclajeCercanos = [
        {
          id: 'P001',
          nombre: 'EcoPoint Miraflores',
          direccion: 'Av. Larco 345, Miraflores',
          distancia: '1.2 km',
          materiales: ['Plástico', 'Papel', 'Vidrio'],
          horario: 'Lun-Sáb 8:00 AM - 6:00 PM',
          estado: 'Abierto'
        },
        {
          id: 'P002',
          nombre: 'ReciclaMax San Isidro',
          direccion: 'Av. Javier Prado 1234, San Isidro',
          distancia: '2.8 km',
          materiales: ['Plástico', 'Papel', 'Electrónicos'],
          horario: 'Lun-Vie 9:00 AM - 5:00 PM',
          estado: 'Abierto'
        },
        {
          id: 'P003',
          nombre: 'Verde Surco',
          direccion: 'Av. Benavides 567, Surco',
          distancia: '4.1 km',
          materiales: ['Papel', 'Cartón', 'Vidrio'],
          horario: 'Mar-Dom 8:00 AM - 7:00 PM',
          estado: 'Cerrado'
        }
      ];

      // Datos para ranking y recompensas
      this.rankingUsuarios = [
        {
          id: 'rank-1',
          nombre: 'María González',
          titulo: 'Eco-Campeona',
          puntos: 3245,
          kilos: 67.8,
          avatar: '👑',
          posicion: 1
        },
        {
          id: 'rank-2',
          nombre: 'Carlos Ruiz',
          titulo: 'Eco-Héroe',
          puntos: 3012,
          kilos: 58.3,
          avatar: '🏆',
          posicion: 2
        },
        {
          id: 'rank-3',
          nombre: 'Alexander (Tú)',
          titulo: 'Eco-Héroe',
          puntos: 2847,
          kilos: 47.5,
          avatar: '🔥',
          posicion: 3
        }
      ];

      this.recompensasDisponibles = [
        {
          id: 'reward-1',
          nombre: 'Bolsa Ecológica',
          descripcion: 'Bolsa reutilizable de algodón orgánico',
          puntos: 500,
          categoria: 'ecologico',
          disponible: true,
          imagen: '♻️',
          colorFondo: 'bg-green-100'
        },
        {
          id: 'reward-2',
          nombre: 'Descuento 20%',
          descripcion: 'En productos sostenibles de nuestros aliados',
          puntos: 1000,
          categoria: 'descuento',
          disponible: true,
          imagen: '💰',
          colorFondo: 'bg-blue-100'
        },
        {
          id: 'reward-3',
          nombre: 'Curso Online',
          descripcion: 'Sostenibilidad y vida eco-amigable',
          puntos: 1500,
          categoria: 'curso',
          disponible: true,
          imagen: '📚',
          colorFondo: 'bg-purple-100'
        },
        {
          id: 'reward-4',
          nombre: 'Panel Solar Portátil',
          descripcion: 'Cargador solar para dispositivos móviles',
          puntos: 3000,
          categoria: 'tecnologia',
          disponible: true,
          imagen: '☀️',
          colorFondo: 'bg-yellow-100'
        },
        {
          id: 'reward-5',
          nombre: 'Kit de Jardinería',
          descripcion: 'Semillas orgánicas y herramientas básicas',
          puntos: 2000,
          categoria: 'jardineria',
          disponible: true,
          imagen: '🌱',
          colorFondo: 'bg-green-100'
        },
        {
          id: 'reward-6',
          nombre: 'Bicicleta Eléctrica',
          descripcion: 'Transporte sostenible para la ciudad',
          puntos: 10000,
          categoria: 'transporte',
          disponible: false,
          imagen: '🚲',
          colorFondo: 'bg-gray-100'
        }
      ];

      // Datos para el perfil
      this.materialesReciclados = [
        {
          tipo: 'Plastico',
          cantidad: 18.5,
          porcentaje: 40,
          color: '#3B82F6'
        },
        {
          tipo: 'Papel',
          cantidad: 12.2,
          porcentaje: 25,
          color: '#F59E0B'
        },
        {
          tipo: 'Vidrio',
          cantidad: 11.8,
          porcentaje: 25,
          color: '#10B981'
        },
        {
          tipo: 'Metal',
          cantidad: 5.0,
          porcentaje: 10,
          color: '#6B7280'
        }
      ];

      this.actividadReciente = [
        {
          id: 'act-1',
          tipo: 'recoleccion',
          descripcion: 'Recolección completada - 8kg de plástico',
          fecha: '2024-03-18',
          icono: '♻️',
          color: 'text-green-600'
        },
        {
          id: 'act-2',
          tipo: 'puntos',
          descripcion: '+150 puntos EcoCollet ganados',
          fecha: '2024-03-18',
          icono: '🏆',
          color: 'text-yellow-600'
        },
        {
          id: 'act-3',
          tipo: 'canje',
          descripcion: 'Canjeaste una bolsa ecológica',
          fecha: '2024-03-15',
          icono: '🛍️',
          color: 'text-blue-600'
        }
      ];

      // Actualizar subtítulo dinámico del dashboard
      this.titlesMap.dashboard.subtitle = `Tienes ${this.citasPendientes.length} citas programadas`;
      this.loadSection(this.currentSection);

      this.isLoading = false;
    }, 1000);
  }

  // Navegación entre secciones actualizada en la línea 355

  // Solicitar nueva cita
  solicitarNuevaCita(): void {
    this.loadSection('dashboard');
    setTimeout(() => {
      this.showAgendarForm = true;
      this.agendarStep = 1;
      this.resetAgendarForm();
    }, 100);
  }

  // Ver detalles de una cita
  verDetallesCita(cita: CitaUsuario): void {
    console.log('Ver detalles de cita:', cita);
  }

  // Cancelar cita
  cancelarCita(citaId: string): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.citasPendientes = this.citasPendientes.filter(cita => cita.id !== citaId);
      console.log('Cancelar cita:', citaId);
    }
  }

  // Formatear fecha
  formatFechaCorta(fecha: string): string {
    const fechaObj = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    };
    return fechaObj.toLocaleDateString('es-ES', opciones);
  }

  // Obtener ícono del material
  getMaterialIcon(material: string): string {
    const iconos: { [key: string]: string } = {
      'Cartón': '📦',
      'Papel': '📄',
      'Plástico': '♻️',
      'Plástico PET': '🥤',
      'Vidrio': '🍾',
      'Metal': '🔩',
      'Aluminio': '🥫',
      'Orgánico': '🍃',
      'Electrónicos': '💻'
    };
    return iconos[material] || '♻️';
  }

  // Obtener clase de ícono del material
  getMaterialIconClass(material: string): string {
    const clases: { [key: string]: string } = {
      'Cartón': 'bg-yellow-100 text-yellow-600',
      'Papel': 'bg-blue-100 text-blue-600',
      'Plástico': 'bg-green-100 text-green-600',
      'Plástico PET': 'bg-teal-100 text-teal-600',
      'Vidrio': 'bg-purple-100 text-purple-600',
      'Metal': 'bg-gray-100 text-gray-600',
      'Aluminio': 'bg-indigo-100 text-indigo-600',
      'Orgánico': 'bg-lime-100 text-lime-600',
      'Electrónicos': 'bg-red-100 text-red-600'
    };
    return clases[material] || 'bg-green-100 text-green-600';
  }

  // Obtener clase del estado de cita
  getEstadoCitaClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Confirmada': 'bg-blue-100 text-blue-800',
      'En Progreso': 'bg-orange-100 text-orange-800',
      'Completada': 'bg-green-100 text-green-800',
      'Cancelada': 'bg-red-100 text-red-800'
    };
    return clases[estado] || 'bg-gray-100 text-gray-800';
  }

  // Calcular puntos por cita
  getPuntosPorCita(cita: any): number {
    if (cita.puntos) return cita.puntos;
    
    // Calcular puntos basado en material y cantidad
    const cantidad = parseFloat(cita.cantidad);
    const factorPuntos: { [key: string]: number } = {
      'Cartón': 3,
      'Papel': 2,
      'Plástico': 4,
      'Plástico PET': 4,
      'Vidrio': 5,
      'Metal': 6,
      'Aluminio': 8,
      'Orgánico': 1,
      'Electrónicos': 10
    };
    
    return Math.floor(cantidad * (factorPuntos[cita.material] || 2));
  }

  // Ver perfil
  verPerfil(): void {
    this.loadSection('perfil');
  }

  // Cerrar sesión
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Métodos auxiliares para estilos
  getStatusBadgeClass(estado: string): string {
    const classes = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Confirmada': 'bg-blue-100 text-blue-800',
      'En proceso': 'bg-purple-100 text-purple-800',
      'Completada': 'bg-green-100 text-green-800',
      'Cancelada': 'bg-red-100 text-red-800'
    };
    return classes[estado as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getPuntoStatusClass(estado: string): string {
    const classes = {
      'Abierto': 'bg-green-100 text-green-800',
      'Cerrado': 'bg-red-100 text-red-800',
      'Mantenimiento': 'bg-yellow-100 text-yellow-800'
    };
    return classes[estado as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  // === FUNCIONALIDAD DE AGENDAMIENTO ===
  
  // Estado del formulario de agendamiento
  showAgendarForm = false;
  agendarStep = 1;
  agendarForm = {
    materiales: [] as string[],
    cantidad: 5,
    fecha: '',
    hora: '8:00 AM',
    direccion: '',
    distrito: 'Miraflores',
    referencia: ''
  };

  materialesDisponibles = [
    { tipo: 'plastico', nombre: 'Plástico', icono: '♻️', color: 'blue', seleccionado: false },
    { tipo: 'papel', nombre: 'Papel', icono: '📄', color: 'yellow', seleccionado: false },
    { tipo: 'vidrio', nombre: 'Vidrio', icono: '🍾', color: 'green', seleccionado: false },
    { tipo: 'metal', nombre: 'Metal', icono: '🔩', color: 'gray', seleccionado: false }
  ];

  horasDisponibles = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM', '5:00 PM', '6:00 PM'
  ];

  distritos = [
    'Miraflores', 'San Isidro', 'Surco', 'La Molina',
    'Barranco', 'San Borja', 'Lince', 'Magdalena',
    'Pueblo Libre', 'Jesús María', 'Breña', 'Lima'
  ];

  // Métodos del formulario de agendamiento
  resetAgendarForm(): void {
    this.agendarForm = {
      materiales: [],
      cantidad: 5,
      fecha: '',
      hora: '8:00 AM',
      direccion: '',
      distrito: 'Miraflores',
      referencia: ''
    };
    this.materialesDisponibles.forEach(m => m.seleccionado = false);
  }

  toggleMaterial(material: any): void {
    material.seleccionado = !material.seleccionado;
    this.updateSelectedMaterials();
  }

  updateSelectedMaterials(): void {
    this.agendarForm.materiales = this.materialesDisponibles
      .filter(m => m.seleccionado)
      .map(m => m.tipo);
  }

  getMaterialClass(material: any): string {
    const baseClass = 'material-card p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center';
    
    if (material.seleccionado) {
      switch (material.color) {
        case 'blue': return `${baseClass} border-blue-500 bg-blue-50 text-blue-700`;
        case 'yellow': return `${baseClass} border-yellow-500 bg-yellow-50 text-yellow-700`;
        case 'green': return `${baseClass} border-green-500 bg-green-50 text-green-700`;
        case 'gray': return `${baseClass} border-gray-500 bg-gray-50 text-gray-700`;
        default: return `${baseClass} border-eco-green bg-eco-light text-eco-dark`;
      }
    }
    
    return `${baseClass} border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50`;
  }

  nextAgendarStep(): void {
    if (this.agendarStep < 3) {
      this.agendarStep++;
    }
  }

  prevAgendarStep(): void {
    if (this.agendarStep > 1) {
      this.agendarStep--;
    }
  }

  canProceedToNext(): boolean {
    switch (this.agendarStep) {
      case 1:
        return this.agendarForm.materiales.length > 0 && this.agendarForm.cantidad > 0;
      case 2:
        return this.agendarForm.fecha !== '' && this.agendarForm.hora !== '';
      case 3:
        return this.agendarForm.direccion.length >= 10 && this.agendarForm.distrito !== '';
      default:
        return false;
    }
  }

  async confirmarRecoleccion(): Promise<void> {
    this.isLoading = true;
    
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Agregar la nueva cita al array de citas
      const nuevaCita: CitaUsuario = {
        id: Date.now().toString(),
        fecha: this.agendarForm.fecha,
        hora: this.agendarForm.hora,
        direccion: this.agendarForm.direccion,
        material: this.agendarForm.materiales.join(', '),
        cantidad: this.agendarForm.cantidad + ' kg',
        estado: 'Pendiente',
        recolector: ''
      };

      this.citasPendientes.push(nuevaCita);
      
      // Actualizar estadísticas
      this.estadisticas.citasCompletadas++;
      
      // Cerrar formulario
      this.showAgendarForm = false;
      this.loadSection('dashboard');
      
      console.log('¡Recolección agendada exitosamente!');
      
    } catch (error) {
      console.error('Error al agendar recolección:', error);
    } finally {
      this.isLoading = false;
    }
  }

  cancelarAgendamiento(): void {
    this.showAgendarForm = false;
    this.resetAgendarForm();
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('es-ES', options);
  }

  // CALCULAR PORCENTAJE DE CRECIMIENTO
  calcularPorcentajeCrecimiento(): string {
    const actual = this.estadisticas.materialReciclado;
    const anterior = this.estadisticasMesAnterior.materialReciclado;
    
    if (anterior === 0) return '+100%';
    
    const porcentaje = ((actual - anterior) / anterior) * 100;
    const signo = porcentaje > 0 ? '+' : '';
    
    return `${signo}${porcentaje.toFixed(1)}%`;
  }

  // Obtener clase CSS según el crecimiento
  getCrecimientoClass(): string {
    const actual = this.estadisticas.materialReciclado;
    const anterior = this.estadisticasMesAnterior.materialReciclado;
    
    if (actual > anterior) return 'text-white-600';
    if (actual < anterior) return 'text-red-600';
    return 'text-gray-600';
  }

  // Calcular crecimiento de citas completadas
  calcularCrecimientoCitas(): string {
    const actual = this.estadisticas.citasCompletadas;
    const anterior = this.estadisticasMesAnterior.citasCompletadas;
    
    if (anterior === 0) return '+100%';
    
    const porcentaje = ((actual - anterior) / anterior) * 100;
    const signo = porcentaje > 0 ? '+' : '';
    
    return `${signo}${porcentaje.toFixed(0)}%`;
  }

  // Calcular crecimiento de puntos
  calcularCrecimientoPuntos(): string {
    const actual = this.estadisticas.puntosGanados;
    const anterior = this.estadisticasMesAnterior.puntosGanados;
    
    if (anterior === 0) return '+100%';
    
    const porcentaje = ((actual - anterior) / anterior) * 100;
    const signo = porcentaje > 0 ? '+' : '';
    
    return `${signo}${porcentaje.toFixed(0)}%`;
  }

  // Obtener clase CSS para citas
  getCrecimientoCitasClass(): string {
    const actual = this.estadisticas.citasCompletadas;
    const anterior = this.estadisticasMesAnterior.citasCompletadas;
    
    if (actual > anterior) return 'text-green-600';
    if (actual < anterior) return 'text-red-600';
    return 'text-gray-600';
  }

  // Obtener clase CSS para puntos
  getCrecimientoPuntosClass(): string {
    const actual = this.estadisticas.puntosGanados;
    const anterior = this.estadisticasMesAnterior.puntosGanados;
    
    if (actual > anterior) return 'text-purple-600';
    if (actual < anterior) return 'text-red-600';
    return 'text-gray-600';
  }

  // MÉTODOS PARA PUNTOS DE RECICLAJE
  getPuntosFiltrados(): PuntoReciclaje[] {
    return this.puntosReciclajeCercanos.filter(punto => {
      const cumpleDistrito = this.distritoSeleccionado === 'Todos los distritos' || 
                            punto.direccion.includes(this.distritoSeleccionado);
      
      const cumpleMaterial = this.materialSeleccionado === 'Todos los materiales' ||
                            punto.materiales.includes(this.materialSeleccionado);
      
      return cumpleDistrito && cumpleMaterial;
    });
  }

  getEstadoPuntoClass(estado: string): string {
    return estado === 'Abierto' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  getTipoColor(punto: PuntoReciclaje): string {
    // Determinar color basado en el tipo de punto
    if (punto.nombre.includes('EcoPoint')) return 'bg-eco-green';
    if (punto.nombre.includes('ReciclaMax')) return 'bg-blue-500';
    if (punto.nombre.includes('Verde')) return 'bg-yellow-500';
    return 'bg-gray-500';
  }

  verRutaHacia(punto: PuntoReciclaje): void {
    // Aquí se abriría Google Maps o la aplicación de mapas
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(punto.direccion)}`;
    window.open(url, '_blank');
  }

  llamarPunto(punto: PuntoReciclaje): void {
    // Funcionalidad para llamar al punto (mock)
    alert(`Llamando a ${punto.nombre}...`);
  }

  // MÉTODOS PARA RECOMPENSAS
  puedesCanjear(recompensa: Recompensa): boolean {
    return this.puntosDisponibles >= recompensa.puntos && recompensa.disponible;
  }

  canjearRecompensa(recompensa: Recompensa): void {
    if (this.puedesCanjear(recompensa)) {
      // Aquí se realizaría la lógica real de canje
      alert(`¡Has canjeado ${recompensa.nombre} por ${recompensa.puntos} puntos!`);
      this.puntosDisponibles -= recompensa.puntos;
      
      // Opcional: marcar como no disponible temporalmente
      recompensa.disponible = false;
      setTimeout(() => {
        recompensa.disponible = true;
      }, 5000);
    } else {
      if (!recompensa.disponible) {
        alert('Esta recompensa no está disponible actualmente.');
      } else {
        alert(`Necesitas ${recompensa.puntos - this.puntosDisponibles} puntos más para canjear esta recompensa.`);
      }
    }
  }

  getRecompensaColor(categoria: string): string {
    const colores = {
      'ecologico': 'bg-green-500',
      'descuento': 'bg-blue-500',
      'curso': 'bg-purple-500',
      'tecnologia': 'bg-yellow-500',
      'jardineria': 'bg-green-600',
      'transporte': 'bg-gray-500'
    };
    return colores[categoria as keyof typeof colores] || 'bg-gray-400';
  }

  getRankingIcon(posicion: number): string {
    if (posicion === 1) return '🥇';
    if (posicion === 2) return '🥈';
    if (posicion === 3) return '🥉';
    return '🏅';
  }

  // MÉTODOS PARA PERFIL
  getProgresoMensualPorcentaje(): number {
    return Math.round((47.5 / this.metaMensual) * 100);
  }

  getFaltaParaMeta(): number {
    return Math.max(0, this.metaMensual - 47.5);
  }

  getExperienciaPorcentaje(): number {
    return Math.round((this.perfilUsuario.experiencia / this.perfilUsuario.experienciaRequerida) * 100);
  }

  getMesesDesdeRegistro(): number {
    const fechaRegistro = new Date(this.perfilUsuario.fechaRegistro);
    const ahora = new Date();
    const diffTime = Math.abs(ahora.getTime() - fechaRegistro.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30);
  }

  getTotalKilosReciclados(): number {
    return this.materialesReciclados.reduce((total, material) => total + material.cantidad, 0);
  }

  // MÉTODOS PARA PERFIL FORMULARIO
  toggleEditarPerfil(): void {
    this.editandoPerfil = !this.editandoPerfil;
    
    if (this.editandoPerfil) {
      // Cargar datos actuales al formulario
      this.perfilForm.nombre = this.perfilUsuario.nombre;
      this.perfilForm.email = this.perfilUsuario.email;
      this.perfilForm.telefono = this.perfilUsuario.telefono;
      this.perfilForm.direccion = this.perfilUsuario.direccion;
    } else {
      // Restaurar datos originales si cancela
      this.perfilForm = {
        nombre: 'Alexander',
        apellido: 'Rodriguez', 
        email: 'alexander.rodriguez@email.com',
        telefono: '+51 987 654 321',
        distrito: 'Miraflores',
        direccion: 'Av. Larco 123, Miraflores',
        tipoUsuario: 'Individual',
        notificacionesEmail: true,
        notificacionesPush: false,
        recordatorios: true
      };
    }
  }

  guardarPerfil(): void {
    // Actualizar datos del perfil
    this.perfilUsuario.nombre = this.perfilForm.nombre;
    this.perfilUsuario.email = this.perfilForm.email;
    this.perfilUsuario.telefono = this.perfilForm.telefono;
    this.perfilUsuario.direccion = this.perfilForm.direccion;
    
    // Aquí se enviarían los datos al backend
    console.log('Perfil actualizado:', this.perfilForm);
    
    // Mostrar mensaje de éxito
    alert('Perfil actualizado correctamente');
    
    // Salir del modo edición
    this.editandoPerfil = false;
  }

  cerrarSesion(): void {
    // Confirmar cierre de sesión
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      // Limpiar datos del usuario
      this.authService.logout();
      
      // Redirigir al login
      this.router.navigate(['/login']);
    }
  }

  // NAVEGACIÓN ENTRE SECCIONES
  loadSection(sectionName: keyof typeof this.titlesMap): void {
    this.currentSection = sectionName;
    const titles = this.titlesMap[sectionName];
    this.pageTitle = titles.title;
    this.pageSubtitle = titles.subtitle;
    this.showAgendarForm = false; // Cerrar formulario al cambiar sección
  }
}