import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-register',
 imports: [FormsModule, ButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
 nombre: string = '';
  email: string = '';
  password: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onRegister() {
    // Validaciones simples antes de enviar
    if (!this.nombre || !this.email || !this.password) {
      alert('Por favor completa todos los campos');
      return;
    }

    const userData = {
      nombre: this.nombre,
      email: this.email,
      password: this.password
    };

    this.apiService.registerUser(userData).subscribe({
      next: (response) => {
        console.log('Usuario registrado:', response);
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']); // Redirige al login tras registrarse
      },
      error: (error) => {
        console.error('Error al registrar:', error);
        if (error.status === 400) {
          alert('El correo ya está registrado.');
        } else {
          alert('Ocurrió un error al registrar. Inténtalo nuevamente.');
        }
      }
    });
  }
}
