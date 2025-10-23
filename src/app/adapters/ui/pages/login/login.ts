import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationService } from '../../../../core/services/navigation.service';
import { FormsModule } from '@angular/forms';
import { AuthApiService } from '../../../api/auth.api.service';
import { firstValueFrom, timeout, race, of } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // Modelo del formulario
  loginForm = {
    email: '',
    password: '',
    rememberMe: false
  };

  // Estados del componente
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(private router: Router, private authService: AuthApiService, private navigationService: NavigationService) { }

  // Manejar envío del formulario
  onSubmit(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.authService.login({
        email: this.loginForm.email,
        password: this.loginForm.password
      }).subscribe({
        next: (result) => {
          if (result && result.success && result.user) {
            // Login exitoso - redirigir según el rol usando NavigationService
            // navigationService maneja fallback y logging centralizado
            console.log('Login result:', result);
            const userFromResult = result.user;
            if (userFromResult) {
              console.log('Usuario recibido en login, navegando por rol:', userFromResult.role);
              this.navigationService.navigateToDashboard(userFromResult.role).catch((err: any) => {
                console.error('Error navegando al dashboard:', err);
                // Fallback simple
                this.redirectBasedOnRole(userFromResult.role);
              });
            } else if (localStorage.getItem('' + 'ecollet_token') || localStorage.getItem('ecollet_token') || localStorage.getItem('user')) {
              // Token-only backend flow: wait for AuthApiService to populate currentUser$
              console.log('Login returned token-only; esperando a que currentUser$ emita...');
              firstValueFrom(this.authService.currentUser$.pipe(filter(u => !!u), take(1)))
                .then(u => {
                  console.log('currentUser$ emitió user, navegando:', u);
                  this.navigationService.navigateToDashboard(u!.role).catch((err: any) => {
                    console.error('Error navegando al dashboard tras esperar user:', err);
                    this.redirectBasedOnRole(u!.role);
                  });
                })
                .catch(err => {
                  console.warn('Timeout esperando currentUser$, haciendo fallback:', err);
                  const fallbackUser = this.authService.getCurrentUser();
                  if (fallbackUser) {
                    this.navigationService.navigateToDashboard(fallbackUser.role).catch(() => this.redirectBasedOnRole(fallbackUser.role));
                  } else {
                    this.errorMessage = result?.error || 'No se pudo obtener usuario tras login';
                  }
                });
            } else {
              this.errorMessage = result?.error || 'Error en el login';
            }
          } else {
            this.errorMessage = result?.error || 'Error en el login';
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error en login:', error);
          this.errorMessage = error?.message || 'Error de conexión. Intenta nuevamente.';
          this.isLoading = false;
        }
      });
    } catch (error: any) {
      console.error('Error en login:', error);
      this.errorMessage = 'Error de conexión. Intenta nuevamente.';
      this.isLoading = false;
    }
  }

  // Toggle para mostrar/ocultar contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Funciones para redes sociales (simuladas)
  loginWithGoogle(): void {
    alert('Login con Google próximamente');
  }

  loginWithFacebook(): void {
    alert('Login con Facebook próximamente');
  }

  // Olvidé mi contraseña
  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  // Navegar al registro
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Volver al home
  goToHome(): void {
    this.router.navigate(['/']);
  }

  // Redirigir según el rol del usuario
  private redirectBasedOnRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'recolector':
        this.router.navigate(['/recolector/dashboard']);
        break;
      case 'usuario':
        this.router.navigate(['/usuario/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }
}