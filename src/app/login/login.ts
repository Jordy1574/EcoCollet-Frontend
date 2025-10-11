import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router) { }

  // Manejar envío del formulario
  onSubmit(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simular autenticación (aquí irá la lógica real)
    setTimeout(() => {
      this.isLoading = false;
      
      // Simulación de login exitoso
      if (this.loginForm.email && this.loginForm.password) {
        alert('¡Bienvenido a EcoCollet! Redirigiendo al dashboard...');
        // Aquí puedes redirigir a donde necesites, por ejemplo:
        this.router.navigate(['/']); // Vuelve al home por ahora
      } else {
        this.errorMessage = 'Credenciales incorrectas';
      }
    }, 1500);
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