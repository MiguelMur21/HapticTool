import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AuthServiceService } from '../../services/auth-service.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ButtonModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  isGoogleLoading: boolean = false;
  
  @ViewChild('googleButton') googleButton!: ElementRef;
  
  private authSubscription!: Subscription;

  constructor(
    private authService: AuthServiceService, 
    private router: Router
  ) {}

  ngOnInit() {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Escuchar cambios en el usuario actual por si se autentica con Google
    this.authSubscription = this.authService.getCurrentUser$().subscribe({
      next: (user) => {
        if (user) {
          console.log('✅ Usuario autenticado detectado, redirigiendo...');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error en suscripción de usuario:', error);
      }
    });
  }

  ngAfterViewInit() {
    // ✅ Renderizar botón Google después de que la vista esté lista
    setTimeout(() => {
      if (this.googleButton?.nativeElement) {
        this.authService.renderGoogleButton(this.googleButton.nativeElement);
      }
    }, 1000);
  }

  ngOnDestroy() {
    // Limpiar suscripción para evitar memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // 🔐 LOGIN TRADICIONAL
  login() {
    // Validaciones
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingresa tu correo y contraseña.';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Por favor ingresa un correo electrónico válido.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        console.log('✅ Login tradicional exitoso');
        this.isLoading = false;
        // La redirección se maneja automáticamente por la suscripción
      },
      error: (error) => {
        console.error('❌ Error en login tradicional:', error);
        this.isLoading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Correo o contraseña incorrectos.';
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar al servidor. Verifica tu conexión.';
        } else {
          this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
        }
      }
    });
  }

  // 🚪 NAVEGACIÓN
  goTo(path: string) {
    this.router.navigate([path]);
  }

  // 📧 VALIDACIÓN DE EMAIL
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 🔄 LIMPIAR MENSAJES DE ERROR
  clearError() {
    this.errorMessage = '';
  }

  // 🔍 DETECTAR CAMBIOS EN LOS INPUTS
  onEmailChange() {
    if (this.errorMessage && this.email) {
      this.clearError();
    }
  }

  onPasswordChange() {
    if (this.errorMessage && this.password) {
      this.clearError();
    }
  }

  // ⌨️ MANEJAR TECLA ENTER EN EL FORMULARIO
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.login();
    }
  }
}