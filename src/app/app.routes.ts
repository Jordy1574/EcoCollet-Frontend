import { Routes } from '@angular/router';
import { HomeComponent } from './adapters/ui/pages/home/home';
import { LoginComponent } from './adapters/ui/pages/login/login';
import { RegisterComponent } from './adapters/ui/pages/register/register';
import { ForgotPasswordComponent } from './adapters/ui/pages/forgot-password/forgot-password';
import { AdminDashboardComponent } from './adapters/ui/pages/admin/dasboard/admin-dashboard.component';
import { RecolectorDashboardComponent } from './adapters/ui/pages/recolector/dasboard/recolector-dashboard.component';
import { UsuarioDashboardComponent } from './adapters/ui/pages/dashboard/usuario-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'recolector/dashboard', component: RecolectorDashboardComponent },
  { path: 'usuario/dashboard', component: UsuarioDashboardComponent },
  { path: '**', redirectTo: '' }
];
