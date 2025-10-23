// src/app/adapters/ui/pages/recolector/dasboard/recolector-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 

// 1. CORRECCIÓN DE IMPORTACIONES (4 NIVELES DE SALTO)
import { User } from '../../../../../core/models/user.model'; // <-- RUTA CORREGIDA
import { AuthApiService } from '../../../../api/auth.api.service'; // <-- NOMBRE Y RUTA CORREGIDA
import { RecolectorApiService } from '../../../../api/recolector.api.service'; // <-- RUTA CORREGIDA
import { RecolectorStats, AgendaItem } from '../../../../../core/models/recolector.models'; // <-- RUTA CORREGIDA 
@Component({
  selector: 'app-recolector-dashboard',
  standalone: true,
  imports: [CommonModule],
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

  /* 
    Devuelve el primer nombre del usuario separado por espacio.
    Si no hay nombre disponible, retorna el valor por defecto 'Recolector'.
  */
  get firstName(): string {
    if (this.user?.name) {
      return this.user.name.split(' ')[0];
    }
    return 'Recolector';
  }
}