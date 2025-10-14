import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { AdminDashboardComponent } from './pages/admin/dashboard/admin-dashboard.component';
import { RecolectorDashboardComponent } from './pages/recolector/dashboard/recolector-dashboard.component';
import { UsuarioDashboardComponent } from './pages/usuario/dashboard/usuario-dashboard.component';

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
