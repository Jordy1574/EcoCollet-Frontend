import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Material } from '../../../../../core/models/admin.models';
import { AdminApiService } from '../../../../../adapters/api/admin.api.service';

@Component({
  selector: 'app-materiales-crud',
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
            (ngModelChange)="filterMateriales()"
            placeholder="Buscar materiales..." 
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
          >
        </div>
        <button 
          (click)="showAddModal()"
          class="ml-4 px-4 py-2 bg-eco-green text-white rounded-lg hover:bg-eco-dark transition-colors"
        >
          Agregar Material
        </button>
      </div>

      <!-- Grid de materiales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let material of filteredMateriales" class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
          <div class="flex items-center mb-4">
            <div [class]="getMaterialIconClass(material.tipo)" class="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {{material.nombre.charAt(0)}}
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium">{{material.nombre}}</h3>
              <p class="text-sm text-gray-500">{{material.tipo}}</p>
            </div>
          </div>
          
          <div class="space-y-2">
            <p class="text-sm"><span class="font-medium">Cantidad:</span> {{material.cantidad}}</p>
            <p class="text-sm"><span class="font-medium">Precio:</span> {{material.info?.precioPromedio}}</p>
            <p class="text-sm"><span class="font-medium">Puntos activos:</span> {{material.info?.puntosActivos}}</p>
          </div>

          <div class="mt-4 flex justify-end space-x-2">
            <button 
              (click)="editMaterial(material)"
              class="px-3 py-1 text-sm text-eco-green hover:text-eco-dark"
            >
              Editar
            </button>
            <button 
              (click)="deleteMaterial(material.id)"
              class="px-3 py-1 text-sm text-red-600 hover:text-red-800"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Agregar/Editar Material -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">{{editingMaterial ? 'Editar' : 'Agregar'}} Material</h3>
        <form (ngSubmit)="saveMaterial()" #materialForm="ngForm">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input 
                type="text" 
                [(ngModel)]="currentMaterial.nombre" 
                name="nombre"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Precio</label>
              <div class="mt-1 flex items-stretch gap-2">
                <input 
                  type="number"
                  [(ngModel)]="precioInput"
                  name="precioPorKg"
                  min="0"
                  step="0.01"
                  required
                  class="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
                >
                <span class="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600 select-none">S/. / kg</span>
              </div>
              <p class="mt-1 text-xs text-gray-500">Se entiende en soles por kilogramo.</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button 
              type="button"
              (click)="closeModal()"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              [disabled]="!materialForm.form.valid"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-eco-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
            >
              {{editingMaterial ? 'Guardar' : 'Crear'}}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .bg-eco-green { background-color: #3EB489; }
    .bg-eco-dark { background-color: #1E5631; }
    .text-eco-green { color: #3EB489; }
    .hover\\:bg-eco-dark:hover { background-color: #1E5631; }
    .focus\\:ring-eco-green:focus { --tw-ring-color: #3EB489; }
    .focus\\:border-eco-green:focus { border-color: #3EB489; }
  `]
})
export class MaterialesCrudComponent implements OnInit {
  materiales: Material[] = [];
  filteredMateriales: Material[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  editingMaterial: boolean = false;
  // Input numérico controlado para el formulario
  precioInput: number | null = null;
  currentMaterial: Partial<Material> = {
    info: {
      precioPromedio: '',
      puntosActivos: '0',
      ultimaActualizacion: new Date().toLocaleDateString()
    }
  };

  constructor(private adminService: AdminApiService) {}

  ngOnInit(): void {
    this.loadMateriales();
  }

  loadMateriales(): void {
    this.adminService.getMateriales().subscribe({
      next: (materiales: Material[]) => {
        this.materiales = materiales;
        this.filterMateriales();
      },
      error: (error: unknown) => console.error('Error cargando materiales:', error)
    });
  }

  filterMateriales(): void {
    if (!this.searchTerm) {
      this.filteredMateriales = this.materiales;
      return;
    }
    
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredMateriales = this.materiales.filter(material => 
      material.nombre.toLowerCase().includes(searchLower) ||
      material.tipo.toLowerCase().includes(searchLower)
    );
  }

  showAddModal(): void {
    this.editingMaterial = false;
    this.currentMaterial = {
      info: {
        precioPromedio: '',
        puntosActivos: '0',
        ultimaActualizacion: new Date().toLocaleDateString()
      }
    };
    this.precioInput = null;
    this.showModal = true;
  }

  editMaterial(material: Material): void {
    this.editingMaterial = true;
    this.currentMaterial = { 
      ...material,
      info: material.info ? { ...material.info } : {
        precioPromedio: '',
        puntosActivos: '0',
        ultimaActualizacion: new Date().toLocaleDateString()
      }
    };
    this.precioInput = this.parseNumber(material.info?.precioPromedio || '');
    this.showModal = true;
  }

  saveMaterial(): void {
    // Validación básica (0.0 o mayor permitido)
    const precio = typeof this.precioInput === 'number' && !isNaN(this.precioInput) ? this.precioInput : 0;
    // Preparar payload mínimo solo con nombre y precioPorKg
    const payload: any = {
      nombre: this.currentMaterial.nombre ?? '',
      precioPorKg: precio
    };

    if (this.editingMaterial) {
      this.adminService.updateMaterial(this.currentMaterial.id!, payload).subscribe({
        next: () => {
          this.loadMateriales();
          this.closeModal();
        },
        error: (error: unknown) => console.error('Error actualizando material:', error)
      });
    } else {
      this.adminService.createMaterial(payload).subscribe({
        next: () => {
          this.loadMateriales();
          this.closeModal();
        },
        error: (error: unknown) => console.error('Error creando material:', error)
      });
    }
  }

  deleteMaterial(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este material?')) {
      this.adminService.deleteMaterial(id).subscribe({
        next: () => this.loadMateriales(),
        error: (error: unknown) => console.error('Error eliminando material:', error)
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.currentMaterial = {
      info: {
        precioPromedio: '',
        puntosActivos: '0',
        ultimaActualizacion: new Date().toLocaleDateString()
      }
    };
    this.editingMaterial = false;
    this.precioInput = null;
  }

  getMaterialIconClass(tipo: string): string {
    const classes = {
      'plastico': 'bg-blue-500',
      'papel': 'bg-yellow-500',
      'vidrio': 'bg-green-500',
      'metal': 'bg-gray-600'
    };
    return classes[tipo as keyof typeof classes] || 'bg-gray-400';
  }

  // Helpers para extraer números desde etiquetas como "S/. 2.50/kg" o "55 kg"
  private parseNumber(value: string): number {
    if (!value) return 0;
    const cleaned = value.toString().replace(/[^0-9.,-]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
}