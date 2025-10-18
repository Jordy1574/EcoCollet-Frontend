import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../api/auth.api.service';

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

  constructor(private router: Router, private authService: AuthService) { }

  // Manejar envío del formulario
  async onSubmit(): Promise<void> {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.authService.login(this.loginForm.email, this.loginForm.password);
      
      if (result.success && result.user) {
        // Login exitoso - redirigir según el rol
        this.authService.redirectBasedOnRole(result.user.role);
      } else {
        this.errorMessage = result.error || 'Error en el login';
      }
    } catch (error) {
      this.errorMessage = 'Error de conexión. Intenta nuevamente.';
    } finally {
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
}