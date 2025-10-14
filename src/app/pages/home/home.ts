import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  // Estado de los modales
  showLoginModal = false;
  showRegisterModal = false;

  // Estadísticas
  stats = {
    usuarios: 15420,
    toneladas: 2847,
    puntos: 156,
    co2Evitado: 89340
  };

  // Beneficios
  beneficios = [
    {
      icono: 'calendar',
      color: 'bg-eco-green',
      titulo: 'Recolección Programada',
      descripcion: 'Agenda la recolección de tus materiales reciclables desde casa. Nosotros nos encargamos del resto.'
    },
    {
      icono: 'money',
      color: 'bg-eco-yellow',
      titulo: 'Gana Recompensas',
      descripcion: 'Acumula puntos por cada kilogramo reciclado y canjéalos por productos ecológicos y descuentos.'
    },
    {
      icono: 'location',
      color: 'bg-eco-dark',
      titulo: 'Puntos Cercanos',
      descripcion: 'Encuentra centros de acopio cerca de ti con nuestro mapa interactivo y filtros por tipo de material.'
    },
    {
      icono: 'chart',
      color: 'bg-eco-green',
      titulo: 'Seguimiento Completo',
      descripcion: 'Monitorea tu impacto ambiental con estadísticas detalladas de tus actividades de reciclaje.'
    },
    {
      icono: 'users',
      color: 'bg-eco-yellow',
      titulo: 'Comunidad Activa',
      descripcion: 'Únete a una comunidad comprometida con el medio ambiente y compite en rankings de reciclaje.'
    },
    {
      icono: 'mobile',
      color: 'bg-eco-dark',
      titulo: 'Fácil de Usar',
      descripcion: 'Interfaz intuitiva y moderna que hace que reciclar sea tan fácil como pedir comida a domicilio.'
    }
  ];

  // Puntos de reciclaje
  puntosReciclaje = [
    { nombre: 'Miraflores', color: 'bg-eco-green' },
    { nombre: 'San Isidro', color: 'bg-eco-yellow' },
    { nombre: 'Surco', color: 'bg-eco-dark' },
    { nombre: 'La Molina', color: 'bg-eco-green' },
    { nombre: 'Barranco', color: 'bg-eco-yellow' },
    { nombre: 'Pueblo Libre', color: 'bg-eco-dark' }
  ];

  // Filtros de material
  filtrosMaterial = [
    { nombre: 'Plástico', activo: true, icono: 'box' },
    { nombre: 'Papel', activo: false, icono: 'document' },
    { nombre: 'Vidrio', activo: false, icono: 'cube' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Configurar navegación suave
    this.setupSmoothScroll();
  }

  // Funciones para navegación
  openLoginModal(): void {
    // Navegar a la página de login en lugar de abrir modal
    this.router.navigate(['/login']);
  }

  openRegisterModal(): void {
    // Navegar a la página de registro
    this.router.navigate(['/register']);
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }

  // Manejar login
  handleLogin(event: Event): void {
    event.preventDefault();
    alert('¡Bienvenido a EcoCollet! Redirigiendo al dashboard...');
    this.closeLoginModal();
  }

  // Manejar registro
  handleRegister(event: Event): void {
    event.preventDefault();
    alert('¡Cuenta creada exitosamente! Bienvenido a EcoCollet.');
    this.closeRegisterModal();
  }

  // Scroll suave al mapa
  scrollToMap(): void {
    const element = document.getElementById('puntos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Mostrar información de punto
  showPointInfo(distrito: string): void {
    alert(`Centro de Reciclaje en ${distrito}\n\nMateriales aceptados: Plástico, Papel, Vidrio\nHorario: Lunes a Sábado 8:00 AM - 6:00 PM\nTeléfono: +51 1 234-5678`);
  }

  // Toggle filtro de material
  toggleFiltro(index: number): void {
    this.filtrosMaterial[index].activo = !this.filtrosMaterial[index].activo;
  }

  // Navegación suave
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Configurar scroll suave para todos los enlaces
  private setupSmoothScroll(): void {
    setTimeout(() => {
      const anchors = document.querySelectorAll('a[href^="#"]');
      anchors.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const href = anchor.getAttribute('href');
          if (href) {
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      });
    }, 0);
  }

  // Método auxiliar para obtener paths de SVG de beneficios
  getSvgPath(icon: string): string {
    const paths: { [key: string]: string } = {
      'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'money': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      'location': 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
      'chart': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'users': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'mobile': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
    };
    return paths[icon] || '';
  }

  // Método auxiliar para obtener paths de SVG de filtros
  getFilterSvgPath(icon: string): string {
    const paths: { [key: string]: string } = {
      'box': 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      'document': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'cube': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    };
    return paths[icon] || '';
  }
}