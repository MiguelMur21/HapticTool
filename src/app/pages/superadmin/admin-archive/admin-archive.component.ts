import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, TableModule],
  templateUrl: './admin-archive.component.html',
  styleUrl: './admin-archive.component.scss'
})
export class AdminArchiveComponent {
 // 📂 Variables principales
  selectedFile: File | null = null;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  files: any[] = []; // Aquí llegarán los datos del backend

  constructor(private apiService: ApiService) {}

  // 🔹 Cargar archivos al iniciar
  ngOnInit(): void {
    this.loadFiles();
  }

  // 📥 Llamada al backend para obtener los archivos
  loadFiles() {
    this.apiService.getFiles().subscribe({
      next: (data: any[]) => {
        this.files = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al cargar archivos:', error);
      }
    });
  }

  // 🖱 Simula clic en input oculto
  triggerFileInput() {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    input.click();
  }

  // ✅ Verifica tipo permitido (solo CSV y C3D)
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedExtensions = ['csv', 'c3d'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension || '')) {
      this.message = '❌ Solo se permiten archivos CSV o C3D.';
      this.messageType = 'error';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.message = '';
  }

  // 🚀 Subir archivo
  onUpload() {
    if (!this.selectedFile) {
      this.message = '⚠️ Selecciona un archivo antes de subirlo.';
      this.messageType = 'error';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const extension = this.selectedFile.name.split('.').pop()?.toLowerCase();
    const uploadObservable =
      extension === 'csv'
        ? this.apiService.uploadCSV(formData)
        : this.apiService.uploadC3D(formData);

    uploadObservable.subscribe({
      next: () => {
        this.message = `✅ Archivo "${this.selectedFile?.name}" subido con éxito.`;
        this.messageType = 'success';
        this.selectedFile = null;
        this.loadFiles(); // 🔁 Recargar lista al subir
      },
      error: (error: HttpErrorResponse) => {
        this.message =
          error.error?.detail || '❌ Error al subir el archivo.';
        this.messageType = 'error';
      }
    });
  }

  // ❌ Cancelar selección
  onCancel() {
    this.selectedFile = null;
    this.message = '';
  }
}