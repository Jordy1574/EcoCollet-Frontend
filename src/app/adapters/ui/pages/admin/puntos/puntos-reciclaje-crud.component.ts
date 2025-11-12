import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PuntoReciclaje } from '../../../../../core/models/admin.models';
import { AdminApiService } from '../../../../../adapters/api/admin.api.service';

@Component({
  selector: 'app-puntos-reciclaje-crud',
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
            (ngModelChange)="filterPuntos()"
            placeholder="Buscar puntos de reciclaje..." 
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
          >
        </div>
        <button 
          (click)="showAddModal()"
          class="ml-4 px-4 py-2 bg-eco-green text-white rounded-lg hover:bg-eco-dark transition-colors"
        >
          Agregar Punto
        </button>
      </div>

      <!-- Grid de puntos de reciclaje -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let punto of filteredPuntos" class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div [class]="getPointTypeIconClass(punto.tipo)" class="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {{punto.nombre.charAt(0)}}
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium">{{punto.nombre}}</h3>
                <p class="text-sm text-gray-500">{{punto.tipoTexto}}</p>
              </div>
            </div>
            <span [class]="getPointStatusClass(punto.estado)">
              {{punto.estado}}
            </span>
          </div>
          
          <div class="space-y-2">
            <p class="text-sm"><span class="font-medium">Dirección:</span> {{punto.direccion}}</p>
            <p class="text-sm"><span class="font-medium">Horario:</span> {{punto.horario}}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <span 
                *ngFor="let material of punto.materiales" 
                class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
              >
                {{material}}
              </span>
            </div>
          </div>

          <div class="mt-4 flex justify-end space-x-2">
            <button 
              (click)="editPunto(punto)"
              class="px-3 py-1 text-sm text-eco-green hover:text-eco-dark"
            >
              Editar
            </button>
            <button 
              (click)="deletePunto(punto.id)"
              class="px-3 py-1 text-sm text-red-600 hover:text-red-800"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Agregar/Editar Punto -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">{{editingPunto ? 'Editar' : 'Agregar'}} Punto de Reciclaje</h3>
        <form (ngSubmit)="savePunto()" #puntoForm="ngForm">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input 
                type="text" 
                [(ngModel)]="currentPunto.nombre" 
                name="nombre"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tipo</label>
              <select 
                [(ngModel)]="currentPunto.tipo" 
                name="tipo"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
                (change)="updateTipoTexto($event)"
              >
                <option value="principal">Centro Principal</option>
                <option value="empresarial">Centro Empresarial</option>
                <option value="comunitario">Centro Comunitario</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Dirección</label>
              <input 
                type="text" 
                [(ngModel)]="currentPunto.direccion" 
                name="direccion"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Horario</label>
              <!-- Builder de horario: días y horas -->
              <div class="mt-2 space-y-3">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" [checked]="isDaySelected('Lun')" (change)="toggleDay('Lun')" class="rounded border-gray-300 text-eco-green focus:ring-eco-green"> Lun
                  </label>
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" [checked]="isDaySelected('Mar')" (change)="toggleDay('Mar')" class="rounded border-gray-300 text-eco-green focus:ring-eco-green"> Mar
                  </label>
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" [checked]="isDaySelected('Mié')" (change)="toggleDay('Mié')" class="rounded border-gray-300 text-eco-green focus:ring-eco-green"> Mié
                  </label>
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" [checked]="isDaySelected('Jue')" (change)="toggleDay('Jue')" class="rounded border-gray-300 text-eco-green focus:ring-eco-green"> Jue
                  </label>
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" [checked]="isDaySelected('Vie')" (change)="toggleDay('Vie')" class="rounded border-gray-300 text-eco-green focus:ring-eco-green"> Vie
                  </label>
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" [checked]="isDaySelected('Sáb')" (change)="toggleDay('Sáb')" class="rounded border-gray-300 text-eco-green focus:ring-eco-green"> Sáb
                  </label>
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" [checked]="isDaySelected('Dom')" (change)="toggleDay('Dom')" class="rounded border-gray-300 text-eco-green focus:ring-eco-green"> Dom
                  </label>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500">Apertura</label>
                    <input type="time" [(ngModel)]="openTime" name="openTime" (change)="updateHorarioPreview()" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50">
                  </div>
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500">Cierre</label>
                    <input type="time" [(ngModel)]="closeTime" name="closeTime" (change)="updateHorarioPreview()" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50">
                  </div>
                </div>
                <p class="text-xs text-gray-500">Vista previa: <span class="font-medium text-gray-700">{{ horarioPreview || '—' }}</span></p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Estado</label>
              <select 
                [(ngModel)]="currentPunto.estado" 
                name="estado"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
                <option value="Activo">Activo</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Materiales Aceptados</label>
              <div class="mt-2 space-y-2">
                <div *ngFor="let material of availableMateriales" class="flex items-center">
                  <input
                    type="checkbox"
                    [id]="material"
                    [checked]="currentPunto.materiales?.includes(material)"
                    (change)="toggleMaterial(material)"
                    class="h-4 w-4 text-eco-green focus:ring-eco-green border-gray-300 rounded"
                  >
                  <label [for]="material" class="ml-2 block text-sm text-gray-900">
                    {{material}}
                  </label>
                </div>
              </div>
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
              [disabled]="!puntoForm.form.valid"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-eco-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
            >
              {{editingPunto ? 'Guardar' : 'Crear'}}
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
export class PuntosReciclajeCrudComponent implements OnInit {
  puntos: PuntoReciclaje[] = [];
  filteredPuntos: PuntoReciclaje[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  editingPunto: boolean = false;
  currentPunto: Partial<PuntoReciclaje> = {
    estado: 'Activo',
    materiales: []
  };

  availableMateriales: string[] = ['Plástico', 'Papel', 'Vidrio', 'Metal', 'Electrónicos', 'Cartón'];
  // Builder de horario
  selectedDays: string[] = ['Lun','Mar','Mié','Jue','Vie'];
  openTime: string = '08:00';
  closeTime: string = '18:00';
  horarioPreview: string = '';

  constructor(private adminService: AdminApiService) {}

  ngOnInit(): void {
    this.loadPuntos();
    // Cargar materiales desde backend para poblar las opciones
    this.adminService.getMateriales().subscribe({
      next: mats => {
        const nombres = mats.map(m => m.nombre).filter(Boolean);
        if (nombres.length) this.availableMateriales = nombres;
      },
      error: () => {}
    });
    this.updateHorarioPreview();
  }

  loadPuntos(): void {
    this.adminService.getPuntosReciclaje().subscribe({
      next: (puntos: PuntoReciclaje[]) => {
        this.puntos = puntos;
        this.filterPuntos();
      },
      error: (error: unknown) => console.error('Error cargando puntos:', error)
    });
  }

  filterPuntos(): void {
    if (!this.searchTerm) {
      this.filteredPuntos = this.puntos;
      return;
    }
    
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredPuntos = this.puntos.filter(punto => 
      punto.nombre.toLowerCase().includes(searchLower) ||
      punto.direccion.toLowerCase().includes(searchLower) ||
      punto.tipoTexto.toLowerCase().includes(searchLower)
    );
  }

  showAddModal(): void {
    this.editingPunto = false;
    this.currentPunto = {
      estado: 'Activo',
      materiales: [],
      tipo: 'principal',
      tipoTexto: 'Centro Principal',
      horario: 'Lun-Vie 8:00 AM - 6:00 PM'
    };
    // reset horario builder a valores por defecto
    this.selectedDays = ['Lun','Mar','Mié','Jue','Vie'];
    this.openTime = '08:00';
    this.closeTime = '18:00';
    this.updateHorarioPreview();
    this.showModal = true;
  }

  editPunto(punto: PuntoReciclaje): void {
    this.editingPunto = true;
    this.currentPunto = { 
      ...punto,
      materiales: punto.materiales ? [...punto.materiales] : []
    };
    // intentar parsear horario existente a builder (simple)
    this.tryParseExistingHorario(punto.horario);
    this.updateHorarioPreview();
    this.showModal = true;
  }

  savePunto(): void {
    // Construir horario final antes de guardar
    this.currentPunto.horario = this.buildHorario();
    if (this.editingPunto) {
      this.adminService.updatePuntoReciclaje(this.currentPunto.id!, this.currentPunto).subscribe({
        next: () => {
          this.loadPuntos();
          this.closeModal();
        },
  error: (error: unknown) => console.error('Error actualizando punto:', error)
      });
    } else {
      this.adminService.createPuntoReciclaje(this.currentPunto).subscribe({
        next: () => {
          this.loadPuntos();
          this.closeModal();
        },
  error: (error: unknown) => console.error('Error creando punto:', error)
      });
    }
  }

  deletePunto(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este punto de reciclaje?')) {
      this.adminService.deletePuntoReciclaje(id).subscribe({
        next: () => this.loadPuntos(),
  error: (error: unknown) => console.error('Error eliminando punto:', error)
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.currentPunto = {
      estado: 'Activo',
      materiales: []
    };
    this.editingPunto = false;
  }

  toggleMaterial(material: string): void {
    if (!this.currentPunto.materiales) {
      this.currentPunto.materiales = [];
    }
    
    const index = this.currentPunto.materiales.indexOf(material);
    if (index === -1) {
      this.currentPunto.materiales.push(material);
    } else {
      this.currentPunto.materiales.splice(index, 1);
    }
  }

  updateTipoTexto(event: Event): void {
    const tipo = (event.target as HTMLSelectElement).value;
    const tiposTexto: { [key: string]: string } = {
      'principal': 'Centro Principal',
      'empresarial': 'Centro Empresarial',
      'comunitario': 'Centro Comunitario'
    };
    this.currentPunto.tipoTexto = tiposTexto[tipo];
  }

  getPointTypeIconClass(tipo: string): string {
    const classes = {
      'principal': 'bg-[#5EA362]',
      'empresarial': 'bg-[#FFD60A]',
      'comunitario': 'bg-[#1E5631]'
    };
    return classes[tipo as keyof typeof classes] || 'bg-gray-500';
  }

  getPointStatusClass(estado: string): string {
    const classes = {
      'Activo': 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
      'Mantenimiento': 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
      'Inactivo': 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'
    };
    return classes[estado as keyof typeof classes] || 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800';
  }

  // ==== Horario helpers ====
  private daysOrder: string[] = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  isDaySelected(d: string): boolean { return this.selectedDays.includes(d); }
  toggleDay(d: string): void {
    const i = this.selectedDays.indexOf(d);
    if (i === -1) this.selectedDays.push(d); else this.selectedDays.splice(i,1);
    // ordenar por el orden definido
    this.selectedDays.sort((a,b) => this.daysOrder.indexOf(a) - this.daysOrder.indexOf(b));
    this.updateHorarioPreview();
  }
  private condenseDays(days: string[]): string {
    const full = this.daysOrder;
    if (days.length === 7) return 'Lun-Dom';
    const work = ['Lun','Mar','Mié','Jue','Vie'];
    if (days.join(',') === work.join(',')) return 'Lun-Vie';
    const weekend = ['Sáb','Dom'];
    if (days.join(',') === weekend.join(',')) return 'Sáb-Dom';
    return days.join(', ');
  }
  buildHorario(): string {
    if (!this.selectedDays.length || !this.openTime || !this.closeTime) return this.currentPunto.horario || '';
    return `${this.condenseDays(this.selectedDays)} ${this.openTime}-${this.closeTime}`;
  }
  updateHorarioPreview(): void {
    this.horarioPreview = this.buildHorario();
  }
  private tryParseExistingHorario(h: string|undefined): void {
    if (!h) return;
    // Formatos soportados: "Lun-Vie 08:00-18:00" o "Lun, Mié 09:00-12:00"
    const [daysPart, timePart] = h.split(' ');
    if (timePart && timePart.includes('-')) {
      const [op, cl] = timePart.split('-');
      if (op) this.openTime = op; if (cl) this.closeTime = cl;
    }
    if (daysPart) {
      if (daysPart.includes('-')) {
        const [start, end] = daysPart.split('-');
        const startIdx = this.daysOrder.indexOf(start);
        const endIdx = this.daysOrder.indexOf(end);
        if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
          this.selectedDays = this.daysOrder.slice(startIdx, endIdx+1);
        }
      } else {
        this.selectedDays = daysPart.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
  }
}