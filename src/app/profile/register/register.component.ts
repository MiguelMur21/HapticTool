import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthServiceService } from '../../services/auth-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  nombre: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private apiService: ApiService, 
    private authService: AuthServiceService,
    private router: Router
  ) {}

  onRegister() {
    // Limpiar mensajes anteriores
    this.errorMessage = '';
    this.successMessage = '';

    // Validaciones básicas
    if (!this.nombre || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.loading = true;

    const userData = {
      nombre: this.nombre.trim(),
      email: this.email.toLowerCase().trim(),
      password: this.password
    };

    // 1. Primero registrar al usuario
    this.apiService.registerUser(userData).subscribe({
      next: (response: any) => {
        this.successMessage = 'Registro exitoso! Iniciando sesión automáticamente...';
        
        // 2. Hacer login automáticamente con las mismas credenciales
        this.authService.login(this.email, this.password).subscribe({
          next: (loginResponse) => {
            console.log('✅ Login automático exitoso');
            this.loading = false;
            
            // 3. Redirigir a la página principal
            this.router.navigate(['/dashboard']);
          },
          error: (loginError) => {
            console.error('❌ Error en login automático:', loginError);
            this.loading = false;
            
            // Si falla el login automático, mostrar mensaje y redirigir al login
            this.successMessage = 'Registro exitoso. Por favor inicia sesión manualmente.';
            
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          }
        });
      },
      error: (error: any) => {
        console.error('Error en registro:', error);
        
        if (error.status === 400) {
          this.errorMessage = 'Este correo ya está registrado';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica tu internet.';
        } else {
          this.errorMessage = 'Error al registrar. Intenta nuevamente.';
        }
        
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}