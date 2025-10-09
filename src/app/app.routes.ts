import { Routes } from '@angular/router';
import { DashboardComponent } from './recolector/dashboard/dashboard.component';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', component: Home }, // ← esta será tu página principal
  { path: 'recolector', component: DashboardComponent },
  { path: '**', redirectTo: '' } // ← cualquier ruta desconocida vuelve al inicio
];
