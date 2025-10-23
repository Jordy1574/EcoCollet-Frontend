import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../../../adapters/api/admin.api.service';
import { Usuario } from '../../../../../core/models/admin.models';

@Component({
  selector: 'app-usuarios-crud',
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
            (ngModelChange)="filterUsuarios()"
            placeholder="Buscar usuarios..." 
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
          >
        </div>
        <button 
          (click)="showAddModal()"
          class="ml-4 px-4 py-2 bg-eco-green text-white rounded-lg hover:bg-eco-dark transition-colors"
        >
          Agregar Usuario
        </button>
      </div>

      <!-- Tabla de usuarios -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let usuario of filteredUsuarios" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-eco-green flex items-center justify-center text-white font-medium">
                    {{getInitials(usuario.nombre)}}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{usuario.nombre}}</div>
                    <div class="text-sm text-gray-500">{{usuario.distrito}}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{usuario.email}}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getRoleBadgeClass(usuario.rol)">
                  {{usuario.rol}}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getStatusBadgeClass(usuario.estado)">
                  {{usuario.estado}}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  (click)="editUsuario(usuario)"
                  class="text-eco-green hover:text-eco-dark mr-3"
                >
                  Editar
                </button>
                <button 
                  (click)="deleteUsuario(usuario.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Agregar/Editar Usuario -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium mb-4">{{editingUsuario ? 'Editar' : 'Agregar'}} Usuario</h3>
        <form (ngSubmit)="saveUsuario()" #usuarioForm="ngForm">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input 
                type="text" 
                [(ngModel)]="currentUsuario.nombre" 
                name="nombre"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                [(ngModel)]="currentUsuario.email" 
                name="email"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Rol</label>
              <select 
                [(ngModel)]="currentUsuario.rol" 
                name="rol"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
                <option value="Usuario">Usuario</option>
                <option value="Recolector">Recolector</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Distrito</label>
              <input 
                type="text" 
                [(ngModel)]="currentUsuario.distrito" 
                name="distrito"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Estado</label>
              <select 
                [(ngModel)]="currentUsuario.estado" 
                name="estado"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-green focus:ring focus:ring-eco-green focus:ring-opacity-50"
              >
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
                <option value="Inactivo">Inactivo</option>
              </select>
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
              [disabled]="!usuarioForm.form.valid"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-eco-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
            >
              {{editingUsuario ? 'Guardar' : 'Crear'}}
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
export class UsuariosCrudComponent implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  editingUsuario: boolean = false;
  currentUsuario: Partial<Usuario> = {};

  constructor(private adminService: AdminApiService) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.adminService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
        this.filterUsuarios();
      },
      error: (error: unknown) => console.error('Error cargando usuarios:', error)
    });
  }

  filterUsuarios(): void {
    if (!this.searchTerm) {
      this.filteredUsuarios = this.usuarios;
      return;
    }
    
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredUsuarios = this.usuarios.filter(usuario => 
      usuario.nombre.toLowerCase().includes(searchLower) ||
      usuario.email.toLowerCase().includes(searchLower) ||
      usuario.distrito.toLowerCase().includes(searchLower)
    );
  }

  showAddModal(): void {
    this.editingUsuario = false;
    this.currentUsuario = {
      estado: 'Activo',
      rol: 'Usuario'
    };
    this.showModal = true;
  }

  editUsuario(usuario: Usuario): void {
    this.editingUsuario = true;
    this.currentUsuario = { ...usuario };
    this.showModal = true;
  }

  saveUsuario(): void {
    if (this.editingUsuario) {
      this.adminService.updateUsuario(this.currentUsuario.id!, this.currentUsuario).subscribe({
        next: () => {
          this.loadUsuarios();
          this.closeModal();
        },
        error: (error: unknown) => console.error('Error actualizando usuario:', error)
      });
    } else {
      this.adminService.createUsuario(this.currentUsuario).subscribe({
        next: () => {
          this.loadUsuarios();
          this.closeModal();
        },
        error: (error: unknown) => console.error('Error creando usuario:', error)
      });
    }
  }

  deleteUsuario(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.adminService.deleteUsuario(id).subscribe({
        next: () => this.loadUsuarios(),
        error: (error: unknown) => console.error('Error eliminando usuario:', error)
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.currentUsuario = {};
    this.editingUsuario = false;
  }

  getInitials(nombre: string): string {
    return nombre
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getRoleBadgeClass(rol: string): string {
    const classes = {
      'Usuario': 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
      'Recolector': 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
      'Admin': 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800'
    };
    return classes[rol as keyof typeof classes] || 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800';
  }

  getStatusBadgeClass(estado: string): string {
    const classes = {
      'Activo': 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
      'Suspendido': 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
      'Inactivo': 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'
    };
    return classes[estado as keyof typeof classes] || 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800';
  }
}