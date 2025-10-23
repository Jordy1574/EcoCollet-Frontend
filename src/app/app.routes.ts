import { Routes } from '@angular/router';
import { HomeComponent } from './adapters/ui/pages/home/home';
import { LoginComponent } from './adapters/ui/pages/login/login';
import { RegisterComponent } from './adapters/ui/pages/register/register';
import { ForgotPasswordComponent } from './adapters/ui/pages/forgot-password/forgot-password';
import { AdminDashboardComponent } from './adapters/ui/pages/admin/dasboard/admin-dashboard.component';
import { RecolectorDashboardComponent } from './adapters/ui/pages/recolector/dasboard/recolector-dashboard.component';
import { UsuarioDashboardComponent } from './adapters/ui/pages/usuario/dashboard/usuario-dashboard.component';
import { TestBackendComponent } from './test-backend.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'recolector/dashboard', component: RecolectorDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['recolector'] } },
  { path: 'usuario/dashboard', component: UsuarioDashboardComponent, canActivate: [AuthGuard], data: { roles: ['usuario', 'recolector', 'admin'] } },
  { path: 'test-backend', component: TestBackendComponent }, // Página de testing
  { path: '**', redirectTo: '' }
];
