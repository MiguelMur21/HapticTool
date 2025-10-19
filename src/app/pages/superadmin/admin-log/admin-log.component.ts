import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
@Component({
  selector: 'app-admin-log',
  standalone: true,
  imports: [CommonModule, TableModule, PaginatorModule],
  templateUrl: './admin-log.component.html',
  styleUrl: './admin-log.component.scss'
})
export class AdminLogComponent {

  logs: any[] = [];
  loading: boolean = true;
  statusMessage: string = '';
  rowsPerPage: number = 10;
  first: number = 0; // Índice del primer registro visible


  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.statusMessage = 'Cargando historial...';
    this.loading = true;

    this.apiService.getSessionLogs().subscribe({
      next: (data) => {
        this.logs = data;
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
   // ✅ Este método controla el cambio de página
  onPageChange(event: any): void {
    this.first = event.first;
    this.rowsPerPage = event.rows;
  }
}