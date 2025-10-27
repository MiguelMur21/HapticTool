import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ApiService } from '../../../services/api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthServiceService } from '../../../services/auth-service.service';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast'; // 🔹 NUEVO: Importar ToastModule

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ToastModule // 🔹 NUEVO: Agregar ToastModule a los imports
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
  providers: [MessageService]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  totalUsers = 0;
  statusMessage = '';
  loading = true;
  rowsPerPage = 5;
  first = 0;
  currentUserId: number | null = null;
  
  // Variables para cambiar contraseña
  showPasswordDialog = false;
  selectedUserId: number | null = null;
  selectedUserName: string = '';

  // Formulario para crear nuevos administradores
  nuevoAdminForm: FormGroup;

  // Formulario reactivo para cambiar contraseña
  passwordForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private authService: AuthServiceService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    // Inicializamos el formulario reactivo para crear usuarios
    this.nuevoAdminForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Inicializar formulario para cambiar contraseña
    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadUserCount();
    this.loadCurrentUser();
  }

  // 🔹 Cargar usuarios existentes
  loadUsers(): void {
    this.statusMessage = 'Cargando usuarios...';
    this.loading = true;

    this.apiService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
        this.statusMessage = '';
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.statusMessage = 'Error al cargar usuarios.';
        this.loading = false;
        this.showError('Error al cargar usuarios');
      }
    });
  }

  // 🔹 Contador de usuarios
  loadUserCount(): void {
    this.apiService.getUserCount().subscribe({
      next: (res) => (this.totalUsers = res.total_users),
      error: (err) => {
        console.error('Error al obtener total de usuarios:', err);
        this.showError('Error al obtener contador de usuarios');
      }
    });
  }

  // 🔹 Obtener usuario actual (superadmin)
  loadCurrentUser(): void {
    this.authService.getCurrentUser$().subscribe({
      next: (u) => {
        if (u) this.currentUserId = u.usuario_id;
      },
      error: (err) => {
        console.error('Error al obtener usuario actual:', err);
      }
    });
  }

  // 🔹 Eliminar usuario
  deleteUser(id: number): void {
    if (id === this.currentUserId) {
      this.showWarn('No puedes eliminar tu propio usuario.');
      return;
    }

    const userToDelete = this.users.find(u => u.usuario_id === id);
    const userName = userToDelete ? userToDelete.nombre : 'este usuario';

    if (confirm(`¿Estás seguro de eliminar a ${userName}?`)) {
      this.apiService.deleteUser(id).subscribe({
        next: (res: any) => {
          this.showSuccess(res.message || 'Usuario eliminado correctamente');
          this.loadUsers();
          this.loadUserCount();
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          this.showError('No se pudo eliminar el usuario.');
        }
      });
    }
  }

  // 🔹 Abrir diálogo para cambiar contraseña
  openPasswordDialog(user: any): void {
    this.selectedUserId = user.usuario_id;
    this.selectedUserName = user.nombre;
    this.passwordForm.reset();
    this.showPasswordDialog = true;
  }

  // 🔹 Actualizar contraseña
  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.showWarn('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!this.selectedUserId) {
      this.showError('No se ha seleccionado un usuario.');
      return;
    }

    const newPassword = this.passwordForm.get('newPassword')?.value;

    console.log('🔧 DEBUG - Iniciando actualización de contraseña:');
    console.log('🔧 User ID:', this.selectedUserId);
    console.log('🔧 Nueva contraseña:', newPassword);
    console.log('🔧 Token disponible:', !!this.authService.getToken());

    this.apiService.updateUserPassword(this.selectedUserId, newPassword).subscribe({
      next: (res: any) => {
        console.log('✅ DEBUG - Respuesta exitosa del servidor:', res);
        this.showSuccess(res.message || `Contraseña actualizada para ${this.selectedUserName}`);
        this.showPasswordDialog = false;
        this.passwordForm.reset();
        this.selectedUserId = null;
        this.selectedUserName = '';
      },
      error: (err) => {
        console.error('❌ DEBUG - Error completo:', err);
        console.log('❌ DEBUG - Status:', err.status);
        console.log('❌ DEBUG - Error message:', err.message);
        
        let errorMessage = 'No se pudo actualizar la contraseña.';
        
        if (err.status === 400) {
          errorMessage = 'Error: Datos inválidos en la solicitud.';
        } else if (err.status === 401) {
          errorMessage = 'No autorizado. Tu sesión puede haber expirado.';
        } else if (err.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción.';
        } else if (err.status === 404) {
          errorMessage = 'Usuario no encontrado.';
        } else if (err.status === 500) {
          errorMessage = 'Error interno del servidor.';
        } else if (err.status === 0) {
          errorMessage = 'Error de conexión. Verifica tu internet.';
        }
        
        this.showError(errorMessage);
      }
    });
  }

  // 🔹 Método para limpiar cuando se cierra el diálogo
  onPasswordDialogHide(): void {
    this.selectedUserId = null;
    this.selectedUserName = '';
    this.passwordForm.reset();
  }

  // 🔹 Crear nuevo administrador o investigador
  crearAdmin(): void {
    if (this.nuevoAdminForm.valid) {
      const nuevoAdmin = this.nuevoAdminForm.value;

      this.apiService.crearAdministrador(nuevoAdmin).subscribe({
        next: (response) => {
          this.showSuccess('Usuario creado correctamente ✅');
          this.nuevoAdminForm.reset();
          this.loadUsers();
          this.loadUserCount();
        },
        error: (error) => {
          console.error('Error al crear el usuario:', error);
          
          let errorMessage = 'Error al crear el usuario ❌';
          if (error.status === 400) {
            errorMessage = 'El correo ya está registrado.';
          } else if (error.status === 401) {
            errorMessage = 'No tienes permisos para crear usuarios.';
          }
          
          this.showError(errorMessage);
        }
      });
    } else {
      this.showWarn('Por favor, completa todos los campos correctamente.');
    }
  }

  // 🔹 Paginación
  onPageChange(event: any): void {
    this.first = event.first;
    this.rowsPerPage = event.rows;
  }

  // 🔹 Métodos auxiliares para mostrar mensajes toast
  private showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: 3000
    });
  }

  private showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }

  private showWarn(message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: message,
      life: 4000
    });
  }
}