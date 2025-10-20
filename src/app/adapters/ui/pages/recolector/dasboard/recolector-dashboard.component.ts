// src/app/adapters/ui/pages/recolector/dasboard/recolector-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 

// 1. CORRECCIÓN DE IMPORTACIONES (4 NIVELES DE SALTO)
import { User } from '../../../../../core/models/user.model'; // <-- RUTA CORREGIDA
import { AuthApiService } from '../../../../api/auth.api.service'; // <-- NOMBRE Y RUTA CORREGIDA
import { RecolectorApiService } from '../../../../api/recolector.api.service'; // <-- RUTA CORREGIDA
import { RecolectorStats, AgendaItem } from '../../../../../core/models/recolector.models'; // <-- RUTA CORREGIDA 
@Component({
  selector: 'app-recolector-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recolector-dashboard.component.html', 
  styleUrls: [], 
})
export class RecolectorDashboardComponent implements OnInit {
  user: User | null = null;
  stats: RecolectorStats | null = null;
  agendaHoy: AgendaItem[] = [];

  activeSection: 'dashboard' | 'collections' | 'route-map' | 'history' | 'wallet' = 'dashboard';
  pageTitle: string = 'EcoCollet - Recolector';
  pageSubtitle: string = 'Inicio';
  
  // Propiedades para detalles de cita
  mostrarDetallesCita: boolean = false;
  citaSeleccionada: any = null;
  pesoRecolectado: number = 0;
  calidadMaterial: string = 'Excelente';
  observaciones: string = '';
  clientePresente: boolean = false;
  notasRecolector: string = '';

  private titlesMap = {
    'dashboard': { title: '¡Buenos días, Recolector! 🚛', subtitle: 'Revisa tu agenda de hoy.' },
    'collections': { title: 'Mis Recolecciones', subtitle: 'Gestiona todas tus citas de recolección.' },
    'route-map': { title: 'Mapa de Ruta', subtitle: 'Ruta optimizada para máxima eficiencia.' },
    'history': { title: 'Historial', subtitle: 'Registro completo de recolecciones anteriores.' },
    'wallet': { title: 'Cartera Digital', subtitle: 'Gestiona tus métodos de pago y retiros.' }
  };

  constructor(
    private authService: AuthApiService, // <--- CLASE CORRECTA
    private recolectorApi: RecolectorApiService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.recolectorApi.getStats().subscribe((stats: RecolectorStats) => { 
      this.stats = stats;
      this.titlesMap.dashboard.subtitle = `Tienes ${stats.pendientes} recolecciones programadas para hoy`;
      this.loadSection(this.activeSection); 
    });

    this.recolectorApi.getAgendaHoy().subscribe((agenda: AgendaItem[]) => { 
      this.agendaHoy = agenda;
    });
  }

  loadSection(sectionName: keyof typeof this.titlesMap): void {
    this.activeSection = sectionName;
    const titles = this.titlesMap[sectionName];
    this.pageTitle = titles.title;
    this.pageSubtitle = titles.subtitle;
  }

  aceptarRecoleccion(id: string): void {
    this.recolectorApi.aceptarRecoleccion(id).subscribe({
        next: (rec: AgendaItem) => {
            alert(`Recolección ${rec.id} aceptada.`);
            this.loadDashboardData(); 
        },
        error: (err: any) => { 
            console.error(err.message);
            alert(`Error: ${err.message}`);
        }
    });
  }

  emergencyAlert(): void {
    if (confirm('¿Confirmas que deseas enviar una alerta de emergencia?')) {
        alert('🚨 ALERTA DE EMERGENCIA ENVIADA. Contactando a soporte.');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); 
  }

  // Métodos para detalles de cita
  verDetallesCita(cita: any): void {
    this.citaSeleccionada = {
      id: cita.id || '1',
      cliente: {
        nombre: cita.cliente || 'María González',
        tipo: 'Cliente Premium',
        telefono: '987-654-321',
        email: 'maria.gonzalez@email.com',
        direccion: cita.direccion || 'Jr. Colón 456, Miraflores, Lima',
        recoleccionesAnteriores: 23,
        puntuacion: 4.5
      },
      fecha: cita.fecha || 'Hoy, 25 de Marzo 2024',
      hora: cita.hora || '10:00 AM - 10:30 AM',
      estado: cita.estado || 'En Curso',
      tiempoInicio: 'Iniciada hace 15 minutos',
      materiales: [{
        tipo: cita.material || 'Papel',
        peso: cita.peso || '8 kg aproximadamente',
        descripcion: 'Periódicos, revistas, cartón'
      }],
      instrucciones: 'Los materiales están en el garaje. Tocar el timbre y preguntar por María. Hay una caja adicional de cartón en el segundo piso que también necesita ser recolectada.',
      fechaCompleta: '25 de Marzo 2024'
    };
    
    this.pesoRecolectado = 0;
    this.calidadMaterial = 'Excelente';
    this.observaciones = '';
    this.clientePresente = false;
    this.notasRecolector = '';
    this.mostrarDetallesCita = true;
  }

  cerrarDetallesCita(): void {
    this.mostrarDetallesCita = false;
    this.citaSeleccionada = null;
  }

  llamarCliente(): void {
    if (this.citaSeleccionada?.cliente?.telefono) {
      alert(`Llamando a ${this.citaSeleccionada.cliente.nombre} al ${this.citaSeleccionada.cliente.telefono}`);
    }
  }

  marcarCompletada(): void {
    if (this.pesoRecolectado <= 0) {
      alert('Por favor, ingresa el peso real recolectado.');
      return;
    }
    
    if (confirm('¿Confirmas que deseas marcar esta recolección como completada?')) {
      // Aquí iría la lógica para completar la recolección
      alert('Recolección marcada como completada exitosamente.');
      this.cerrarDetallesCita();
      this.loadDashboardData(); // Recargar datos
    }
  }

  reportarProblema(): void {
    alert('Función de reportar problema en desarrollo.');
  }

  iniciarRecoleccion(cita: any): void {
    if (confirm('¿Deseas iniciar esta recolección?')) {
      // Aquí iría la lógica para iniciar la recolección
      alert('Recolección iniciada exitosamente.');
      this.loadDashboardData(); // Recargar datos
    }
  }

  completarRecoleccion(cita: any): void {
    this.verDetallesCita(cita);
  }
}