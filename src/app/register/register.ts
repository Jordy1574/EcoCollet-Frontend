import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  // Modelo del formulario de registro
  registerForm = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    userType: 'usuario' // 'usuario' o 'empresa'
  };

  // Estados del componente
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  passwordStrength = 0;

  constructor(private router: Router) { }

  // Manejar envío del formulario
  onSubmit(): void {
    // Validaciones básicas
    if (!this.registerForm.fullName || !this.registerForm.email || 
        !this.registerForm.password || !this.registerForm.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    // Validar email
    if (!this.isEmailValid()) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido';
      return;
    }

    // Validar contraseñas coincidentes
    if (!this.passwordsMatch()) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    // Validar fortaleza de contraseña
    if (this.passwordStrength < 3) {
      this.errorMessage = 'La contraseña debe ser más segura (mínimo: 6 caracteres, mayúsculas, minúsculas y números)';
      return;
    }

    if (!this.registerForm.acceptTerms) {
      this.errorMessage = 'Debes aceptar los términos y condiciones';
      return;
    }

    if (this.registerForm.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simular registro (aquí irá la lógica real)
    setTimeout(() => {
      this.isLoading = false;
      
      // Simulación de registro exitoso
      alert('¡Cuenta creada exitosamente! Bienvenido a EcoCollet.');
      // Redirigir al login o directamente al home
      this.router.navigate(['/login']);
    }, 2000);
  }

  // Toggle para mostrar/ocultar contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Toggle para mostrar/ocultar confirmar contraseña
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Navegar al login
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Volver al home
  goToHome(): void {
    this.router.navigate(['/']);
  }

  // Funciones para redes sociales (simuladas)
  registerWithGoogle(): void {
    alert('Registro con Google próximamente');
  }

  registerWithFacebook(): void {
    alert('Registro con Facebook próximamente');
  }

  // Calcular fortaleza de contraseña
  onPasswordChange(): void {
    const password = this.registerForm.password;
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    this.passwordStrength = strength;
  }

  // Obtener clase CSS para la barra de fortaleza
  getPasswordStrengthClass(): string {
    switch (this.passwordStrength) {
      case 0:
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4:
      case 5: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  }

  // Obtener texto de fortaleza
  getPasswordStrengthText(): string {
    switch (this.passwordStrength) {
      case 0:
      case 1: return 'Muy débil';
      case 2: return 'Débil';
      case 3: return 'Regular';
      case 4: return 'Fuerte';
      case 5: return 'Muy fuerte';
      default: return '';
    }
  }

  // Validación de email
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.registerForm.email);
  }

  // Verificar que las contraseñas coincidan
  passwordsMatch(): boolean {
    return this.registerForm.password === this.registerForm.confirmPassword;
  }

  // Ver términos y condiciones
  viewTerms(): void {
    alert('Términos y condiciones de EcoCollet próximamente');
  }

  // Ver política de privacidad
  viewPrivacyPolicy(): void {
    alert('Política de privacidad próximamente');
  }
}