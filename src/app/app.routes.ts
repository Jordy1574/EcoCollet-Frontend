import { Routes } from '@angular/router';
import { DashboardComponent } from './recolector/dashboard/dashboard.component';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // ← esta será tu página principal
  { path: 'login', component: LoginComponent }, // ← nueva ruta para login
  { path: 'register', component: RegisterComponent }, // ← nueva ruta para registro
  { path: 'forgot-password', component: ForgotPasswordComponent }, // ← nueva ruta para restablecer contraseña
  { path: 'recolector', component: DashboardComponent },
  { path: '**', redirectTo: '' } // ← cualquier ruta desconocida vuelve al inicio
];
