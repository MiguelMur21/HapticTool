import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-log',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    PaginatorModule, 
    TagModule,
    TooltipModule,
    ButtonModule
  ],
  templateUrl: './admin-log.component.html',
  styleUrl: './admin-log.component.scss'
})
export class AdminLogComponent {
  logs: any[] = [];
  loading: boolean = true;
  statusMessage: string = '';
  rowsPerPage: number = 10;
  first: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.statusMessage = 'Cargando historial...';
    this.loading = true;

    this.apiService.getSessionLogs().subscribe({
      next: (data) => {
        this.logs = this.procesarLogs(data);
        this.statusMessage = '';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.statusMessage = 'Error al cargar historial.';
        this.loading = false;
      }
    });
  }

  // 🔥 PROCESAR LOGS EN EL FRONTEND - SIN TOCAR BACKEND
  private procesarLogs(logs: any[]): any[] {
    const ahora = new Date();
    
    return logs.map(log => {
      const loginTime = new Date(log.login_time);
      const horasDesdeLogin = (ahora.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
      
      let estado = 'Activa';
      let severidad = 'success';
      let tooltip = 'Sesión activa en este momento';

      // Si ya tiene logout_time, sesión finalizada
      if (log.logout_time) {
        const logoutTime = new Date(log.logout_time);
        const duracionHoras = (logoutTime.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        estado = 'Finalizada';
        severidad = 'info';
        tooltip = `Duración: ${duracionHoras.toFixed(1)} horas`;
      } 
      // Si no tiene logout_time pero tiene más de 24 horas
      else if (horasDesdeLogin > 24) {
        estado = 'Probablemente finalizada';
        severidad = 'warning';
        tooltip = 'Sesión con más de 24 horas sin cierre registrado';
      }
      // Si no tiene logout_time pero tiene más de 2 horas
      else if (horasDesdeLogin > 2) {
        estado = 'Posiblemente inactiva';
        severidad = 'warning';
        tooltip = 'Sesión con más de 2 horas sin actividad registrada';
      }
      // Sesión reciente sin logout_time
      else {
        estado = 'Activa';
        severidad = 'success';
        tooltip = `Activa desde hace ${horasDesdeLogin.toFixed(1)} horas`;
      }

      return {
        ...log,
        estado: estado,
        severidad: severidad,
        tooltip: tooltip,
        horasDesdeLogin: horasDesdeLogin,
        // Para mostrar en la tabla
        login_time_display: loginTime.toLocaleString('es-ES'),
        logout_time_display: log.logout_time 
          ? new Date(log.logout_time).toLocaleString('es-ES') 
          : 'No registrado'
      };
    }).sort((a, b) => {
      // Ordenar por fecha de login (más reciente primero)
      return new Date(b.login_time).getTime() - new Date(a.login_time).getTime();
    });
  }

  // 🔥 NUEVO: Forzar recarga del historial
  recargarHistorial(): void {
    this.cargarHistorial();
  }

  // 🔥 NUEVO: Limpiar sesiones muy antiguas (solo en frontend)
  limpiarVistaSesionesAntiguas(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 días atrás
    
    this.logs = this.logs.filter(log => {
      const loginDate = new Date(log.login_time);
      return loginDate > cutoffDate;
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rowsPerPage = event.rows;
  }

  // 🔥 NUEVO: Obtener estadísticas
  getEstadisticas(): any {
    const total = this.logs.length;
    const activas = this.logs.filter(log => log.estado === 'Activa').length;
    const finalizadas = this.logs.filter(log => log.estado === 'Finalizada').length;
    const problematicas = this.logs.filter(log => 
      log.estado === 'Probablemente finalizada' || log.estado === 'Posiblemente inactiva'
    ).length;

    return { total, activas, finalizadas, problematicas };
  }

    // 🔥 NUEVO: Método helper para calcular duración (agrega al componente)
  calcularDuracion(loginTime: string, logoutTime: string): string {
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diffMs = logout.getTime() - login.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `${diffHours.toFixed(1)} h`;
    } else {
      const diffDays = (diffHours / 24).toFixed(1);
      return `${diffDays} días`;
    }
  }
}