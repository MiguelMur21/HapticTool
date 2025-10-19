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
    ReactiveFormsModule // 🔹 importante para los formularios reactivos
  ],  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent {
  users: any[] = [];
  totalUsers = 0;
  statusMessage = '';
  loading = true;
  rowsPerPage = 5;
  first = 0;
 currentUserId: number | null = null;
  
 // 🔹 Variables para cambiar contraseña
  showPasswordDialog = false;
  newPassword = '';
  selectedUserId: number | null = null;

  // 🔹 Formulario para crear nuevos administradores
  nuevoAdminForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private authService: AuthServiceService,
    private fb: FormBuilder
  ) {
    // Inicializamos el formulario reactivo
    this.nuevoAdminForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
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
      }
    });
  }

  // 🔹 Contador de usuarios
  loadUserCount(): void {
    this.apiService.getUserCount().subscribe({
      next: (res) => (this.totalUsers = res.total_users),
      error: (err) => console.error('Error al obtener total de usuarios:', err)
    });
  }

  // 🔹 Obtener usuario actual (superadmin)
  loadCurrentUser(): void {
    const user = this.authService.getCurrentUser$();
    user.subscribe({
      next: (u) => {
        if (u) this.currentUserId = u.usuario_id;
      }
    });
  }

  // 🔹 Eliminar usuario
  deleteUser(id: number): void {
    if (id === this.currentUserId) {
      alert('No puedes eliminar tu propio usuario.');
      return;
    }

    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.apiService.deleteUser(id).subscribe({
        next: (res) => {
          alert(res.message);
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          alert('No se pudo eliminar el usuario.');
        }
      });
    }
  }

  // 🔹 Abrir diálogo para cambiar contraseña
  openPasswordDialog(id: number): void {
    this.selectedUserId = id;
    this.newPassword = '';
    this.showPasswordDialog = true;
  }

  // 🔹 Actualizar contraseña
  updatePassword(): void {
    if (!this.newPassword.trim()) {
      alert('Por favor, ingresa una nueva contraseña.');
      return;
    }

    this.apiService.updateUserPassword(this.selectedUserId!, this.newPassword).subscribe({
      next: (res) => {
        alert(res.message);
        this.showPasswordDialog = false;
        this.newPassword = '';
      },
      error: (err) => {
        console.error('Error al actualizar contraseña:', err);
        alert('No se pudo actualizar la contraseña.');
      }
    });
  }

  // 🔹 Crear nuevo administrador o investigador
  crearAdmin(): void {
    if (this.nuevoAdminForm.valid) {
      const nuevoAdmin = this.nuevoAdminForm.value;

      this.apiService.crearAdministrador(nuevoAdmin).subscribe({
        next: (response) => {
          alert('Administrador creado correctamente ✅');
          this.nuevoAdminForm.reset();
          this.loadUsers(); // refresca la tabla
        },
        error: (error) => {
          console.error('Error al crear el administrador:', error);
          alert('Error al crear el administrador ❌');
        }
      });
    }
  }

  // 🔹 Paginación
  onPageChange(event: any): void {
    this.first = event.first;
    this.rowsPerPage = event.rows;
  }
}