import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecoleccionApiService } from '../../../../../adapters/api/recoleccion.api.service';
import { Recoleccion } from '../../../../../core/models/recoleccion.model';

@Component({
  selector: 'app-recolecciones-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white rounded-xl shadow-sm">
      <!-- Header con búsqueda y botón agregar -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex-1 max-w-sm">
          <input 
            type="text" 
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterRecolecciones()"
            placeholder="Buscar recolecciones..." 
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
          >
        </div>
        <button 
          (click)="showAddModal()"
          class="ml-4 px-4 py-2 bg-eco-green text-white rounded-lg hover:bg-eco-dark transition-colors"
        >
          Agregar Recolección
        </button>
      </div>

      <!-- Tabla de recolecciones -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distrito</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Recojo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Material</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let recoleccion of filteredRecolecciones" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">{{recoleccion.direccion}}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{recoleccion.distrito}}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{recoleccion.fechaRecojo | date:'short'}}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{recoleccion.tipo_material}}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{recoleccion.estado}}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  (click)="editRecoleccion(recoleccion)"
                  class="text-eco-green hover:text-eco-dark mr-3"
                >Editar</button>
                <button 
                  (click)="deleteRecoleccion(recoleccion.id)"
                  class="text-red-600 hover:text-red-900"
                >Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Agregar/Editar Recolección -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">{{editingRecoleccion ? 'Editar' : 'Agregar'}} Recolección</h3>
        <form (ngSubmit)="saveRecoleccion()" #recoleccionForm="ngForm">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Dirección</label>
              <input 
                type="text" 
                [(ngModel)]="currentRecoleccion.direccion" 
                name="direccion"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Distrito</label>
              <input 
                type="text" 
                [(ngModel)]="currentRecoleccion.distrito" 
                name="distrito"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha Recojo</label>
              <input 
                type="datetime-local" 
                [(ngModel)]="currentRecoleccion.fechaRecojo" 
                name="fechaRecojo"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tipo Material</label>
              <select 
                [(ngModel)]="currentRecoleccion.tipo_material" 
                name="tipo_material"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
                <option value="Plástico">Plástico</option>
                <option value="Papel">Papel</option>
                <option value="Vidrio">Vidrio</option>
                <option value="Orgánico">Orgánico</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Estado</label>
              <select 
                [(ngModel)]="currentRecoleccion.estado" 
                name="estado"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En proceso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button 
              type="button"
              (click)="closeModal()"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >Cancelar</button>
            <button 
              type="submit"
              [disabled]="!recoleccionForm.form.valid"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-eco-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
            >{{editingRecoleccion ? 'Guardar' : 'Crear'}}</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RecoleccionesCrudComponent implements OnInit {
  recolecciones: Recoleccion[] = [];
  filteredRecolecciones: Recoleccion[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  editingRecoleccion: boolean = false;
  currentRecoleccion: Partial<Recoleccion> = {};

  constructor(private recoleccionService: RecoleccionApiService) {}

  ngOnInit(): void {
    this.loadRecolecciones();
  }

  loadRecolecciones(): void {
    this.recoleccionService.getRecolecciones().subscribe({
      next: (recolecciones: Recoleccion[]) => {
        this.recolecciones = recolecciones;
        this.filterRecolecciones();
      },
      error: (error: unknown) => console.error('Error cargando recolecciones:', error)
    });
  }

  filterRecolecciones(): void {
    if (!this.searchTerm) {
      this.filteredRecolecciones = this.recolecciones;
      return;
    }
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredRecolecciones = this.recolecciones.filter(r =>
      (r.direccion || '').toLowerCase().includes(searchLower) ||
      (r.tipo_material || '').toLowerCase().includes(searchLower)
    );
  }

  showAddModal(): void {
    this.editingRecoleccion = false;
    this.currentRecoleccion = {};
    this.showModal = true;
  }

  editRecoleccion(recoleccion: Recoleccion): void {
    this.editingRecoleccion = true;
    this.currentRecoleccion = { ...recoleccion };
    this.showModal = true;
  }

  saveRecoleccion(): void {
    if (this.editingRecoleccion) {
      this.recoleccionService.updateRecoleccion(this.currentRecoleccion.id!, this.currentRecoleccion).subscribe({
        next: () => {
          this.loadRecolecciones();
          this.closeModal();
        },
        error: (error: unknown) => console.error('Error actualizando recolección:', error)
      });
    } else {
      this.recoleccionService.createRecoleccion(this.currentRecoleccion).subscribe({
        next: () => {
          this.loadRecolecciones();
          this.closeModal();
        },
        error: (error: unknown) => console.error('Error creando recolección:', error)
      });
    }
  }

  deleteRecoleccion(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta recolección?')) {
      this.recoleccionService.deleteRecoleccion(id).subscribe({
        next: () => this.loadRecolecciones(),
        error: (error: unknown) => console.error('Error eliminando recolección:', error)
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.currentRecoleccion = {};
    this.editingRecoleccion = false;
  }
}