import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cita } from '../../../../../core/models/admin.models';
import { AdminApiService } from '../../../../../adapters/api/admin.api.service';
import { RecoleccionApiService } from '../../../../../adapters/api/recoleccion.api.service';

@Component({
  selector: 'app-citas-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white rounded-xl shadow-sm">
      <!-- Header con búsqueda -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex-1 max-w-sm">
          <input 
            type="text" 
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterCitas()"
            placeholder="Buscar citas..." 
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
          >
        </div>
        <div class="ml-4 flex items-center space-x-2">
          <select 
            [(ngModel)]="filterEstado"
            (ngModelChange)="filterCitas()"
            class="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eco-green"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Asignada">Asignada</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <!-- Tabs para ver Citas o Recolecciones -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            (click)="currentTab = 'citas'; loadCitas()"
            [class]="currentTab === 'citas' ? 'border-eco-green text-eco-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Citas Admin ({{ citas.length }})
          </button>
          <button
            (click)="currentTab = 'recolecciones'; loadRecolecciones()"
            [class]="currentTab === 'recolecciones' ? 'border-eco-green text-eco-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          >
            Recolecciones Usuario ({{ recolecciones.length }})
          </button>
        </nav>
      </div>

      <!-- Tabla de Citas Admin -->
      @if (currentTab === 'citas') {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (cita of filteredCitas; track cita.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm">{{ cita.id }}</td>
                  <td class="px-4 py-3 text-sm">
                    <div class="font-medium text-gray-900">{{ cita.usuario?.nombre || 'N/A' }}</div>
                    <div class="text-gray-500 text-xs">{{ cita.usuario?.direccion || '' }}</div>
                  </td>
                  <td class="px-4 py-3 text-sm">{{ cita.material?.tipo || 'N/A' }}</td>
                  <td class="px-4 py-3 text-sm">{{ cita.material?.cantidad || '0' }}</td>
                  <td class="px-4 py-3 text-sm">
                    <div>{{ cita.fecha?.dia || '' }}</div>
                    <div class="text-xs text-gray-500">{{ cita.fecha?.hora || '' }}</div>
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <span [class]="getEstadoClass(cita.estado)">
                      {{ cita.estado }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <button 
                      (click)="editCita(cita)"
                      class="text-eco-green hover:text-eco-dark mr-3"
                    >
                      Editar
                    </button>
                    <button 
                      (click)="deleteCita(cita.id)"
                      class="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    No hay citas disponibles
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Tabla de Recolecciones Usuario -->
      @if (currentTab === 'recolecciones') {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad (kg)</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Solicitud</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (rec of filteredRecolecciones; track rec.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm">{{ rec.id }}</td>
                  <td class="px-4 py-3 text-sm">Cliente #{{ rec.clienteId || 'N/A' }}</td>
                  <td class="px-4 py-3 text-sm">{{ rec.direccionRecojo || 'Sin dirección' }}</td>
                  <td class="px-4 py-3 text-sm">{{ rec.tipoMaterial || 'N/A' }}</td>
                  <td class="px-4 py-3 text-sm">{{ rec.cantidadKg || '0' }} kg</td>
                  <td class="px-4 py-3 text-sm">
                    <span [class]="getEstadoClass(rec.estado)">
                      {{ rec.estado }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm">{{ formatDate(rec.fechaSolicitud) }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    No hay recolecciones de usuarios disponibles
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal de Editar Cita -->
    @if (showEditModal && selectedCita) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-medium mb-4">Editar Cita #{{ selectedCita.id }}</h3>
          <form (ngSubmit)="saveCita()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Estado</label>
                <select 
                  [(ngModel)]="selectedCita.estado" 
                  name="estado"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Asignada">Asignada</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Notas</label>
                <textarea 
                  [(ngModel)]="editNotas" 
                  name="notas"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
                ></textarea>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button 
                type="button"
                (click)="closeEditModal()"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                class="px-4 py-2 bg-eco-green text-white rounded-md hover:bg-eco-dark"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: []
})
export class CitasCrudComponent implements OnInit {
  citas: any[] = [];
  recolecciones: any[] = [];
  filteredCitas: any[] = [];
  filteredRecolecciones: any[] = [];
  searchTerm: string = '';
  filterEstado: string = '';
  currentTab: 'citas' | 'recolecciones' = 'recolecciones'; // Por defecto mostrar recolecciones
  
  showEditModal = false;
  selectedCita: any | null = null;
  editNotas: string = '';

  constructor(
    private adminService: AdminApiService,
    private recoleccionService: RecoleccionApiService
  ) {}

  ngOnInit(): void {
    this.loadRecolecciones(); // Cargar recolecciones por defecto
  }

  loadCitas(): void {
    console.log('🔍 Cargando citas desde /api/admin/citas...');
    this.adminService.getCitasFromBackend().subscribe({
      next: (citas) => {
        console.log('✅ Citas cargadas:', citas);
        this.citas = citas;
        this.filterCitas();
      },
      error: (err) => console.error('❌ Error cargando citas:', err)
    });
  }

  loadRecolecciones(): void {
    console.log('🔍 Cargando recolecciones desde /api/recolecciones...');
    this.recoleccionService.getRecolecciones().subscribe({
      next: (recolecciones) => {
        console.log('✅ Recolecciones cargadas:', recolecciones);
        this.recolecciones = recolecciones;
        this.filterCitas();
      },
      error: (err) => console.error('❌ Error cargando recolecciones:', err)
    });
  }

  filterCitas(): void {
    if (this.currentTab === 'citas') {
      let filtered = this.citas;
      
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(c => 
          c.usuario?.nombre?.toLowerCase().includes(term) ||
          c.material?.tipo?.toLowerCase().includes(term) ||
          c.id?.toString().includes(term)
        );
      }
      
      if (this.filterEstado) {
        filtered = filtered.filter(c => c.estado === this.filterEstado);
      }
      
      this.filteredCitas = filtered;
    } else {
      let filtered = this.recolecciones;
      
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(r => 
          r.direccionRecojo?.toLowerCase().includes(term) ||
          r.tipoMaterial?.toLowerCase().includes(term) ||
          r.id?.toString().includes(term)
        );
      }
      
      if (this.filterEstado) {
        filtered = filtered.filter(r => r.estado === this.filterEstado);
      }
      
      this.filteredRecolecciones = filtered;
    }
  }

  editCita(cita: Cita): void {
    this.selectedCita = { ...cita } as any;
    this.editNotas = '';
    this.showEditModal = true;
  }

  saveCita(): void {
    if (!this.selectedCita) return;
    
    console.log('💾 Guardando cambios en cita:', this.selectedCita);
    this.adminService.updateCita(this.selectedCita.id, {
      estado: this.selectedCita.estado,
      notas: this.editNotas || undefined
    }).subscribe({
      next: () => {
        console.log('✅ Cita actualizada');
        this.loadCitas();
        this.closeEditModal();
      },
      error: (err) => console.error('❌ Error actualizando cita:', err)
    });
  }

  deleteCita(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      this.adminService.deleteCita(id).subscribe({
        next: () => {
          console.log('✅ Cita eliminada');
          this.loadCitas();
        },
        error: (err) => console.error('❌ Error eliminando cita:', err)
      });
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedCita = null;
  }

  getEstadoClass(estado?: string): string {
    const estadoMap: { [key: string]: string } = {
      'Pendiente': 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
      'Asignada': 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
      'En Proceso': 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800',
      'Completada': 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
      'Cancelada': 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
    };
    return estadoMap[estado || 'Pendiente'] || estadoMap['Pendiente'];
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PE', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}
