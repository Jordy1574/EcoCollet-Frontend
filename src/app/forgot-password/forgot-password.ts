import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  emailForm = {
    email: ''
  };
  
  isLoading = false;
  emailSent = false;
  errorMessage = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (!this.emailForm.email) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simular envío de email (aquí conectarías con tu backend)
    setTimeout(() => {
      this.isLoading = false;
      this.emailSent = true;
    }, 2000);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.emailForm.email);
  }
}