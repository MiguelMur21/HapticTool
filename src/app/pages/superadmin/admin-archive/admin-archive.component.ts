import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-admin-archive',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, 
    DropdownModule, TableModule, DialogModule,
    ToastModule, TooltipModule
  ],
  templateUrl: './admin-archive.component.html',
  styleUrl: './admin-archive.component.scss',
  providers: [MessageService]
})
export class AdminArchiveComponent implements OnInit {
  @ViewChild('updateFileInput') updateFileInput!: ElementRef;

  // 📂 Variables principales
  selectedFile: File | null = null;
  updateSelectedFile: File | null = null;
  files: any[] = [];
  
  // Diálogo de actualización
  showUpdateDialog = false;
  selectedFileName: string = '';

  constructor(
    private apiService: ApiService,
    private messageService: MessageService
  ) {}

  // 🔹 Cargar archivos al iniciar
  ngOnInit(): void {
    this.loadFiles();
  }

  // 📥 Llamada al backend para obtener los archivos (CON NUEVO MÉTODO)
  loadFiles() {
    // 🔥 CAMBIO: Usar getArchivosCompletos() en lugar de getArchivos()
    this.apiService.getArchivosCompletos().subscribe({
      next: (data: string[]) => {
        console.log('📁 Archivos recibidos:', data);
        
        // Procesar archivos con tipo y fecha
        this.files = data.map(nombre => {
          const extension = nombre.split('.').pop()?.toLowerCase();
          return {
            nombre: nombre,
            tipo: extension,
            fecha: new Date().toLocaleDateString('es-ES'),
            ruta: '/archivos/' + nombre
          };
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error al cargar archivos:', error);
        this.showError('Error al cargar archivos: ' + (error.error?.detail || 'No autorizado'));
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
    this.validateAndSetFile(file, event.target);
  }

  // 🚀 Subir archivo
  onUpload() {
    if (!this.selectedFile) {
      this.showWarn('⚠️ Selecciona un archivo antes de subirlo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const extension = this.selectedFile.name.split('.').pop()?.toLowerCase();
    const uploadObservable = extension === 'csv'
      ? this.apiService.uploadCSV(formData)
      : this.apiService.uploadC3D(formData);

    uploadObservable.subscribe({
      next: () => {
        this.showSuccess(`✅ Archivo "${this.selectedFile?.name}" subido con éxito.`);
        this.selectedFile = null;
        this.loadFiles();
        
        // Limpiar input
        const input = document.getElementById('fileInput') as HTMLInputElement;
        input.value = '';
      },
      error: (error: HttpErrorResponse) => {
        this.showError(error.error?.detail || '❌ Error al subir el archivo.');
      }
    });
  }

  // ❌ Cancelar selección
  onCancel() {
    this.selectedFile = null;
    const input = document.getElementById('fileInput') as HTMLInputElement;
    input.value = '';
  }

  // 🔥 NUEVO: Abrir diálogo para actualizar archivo
  openUpdateDialog(file: any) {
    this.selectedFileName = file.nombre;
    this.updateSelectedFile = null;
    this.showUpdateDialog = true;
    
    // Limpiar input de actualización
    if (this.updateFileInput) {
      this.updateFileInput.nativeElement.value = '';
    }
  }

  // 🔥 NUEVO: Manejar selección de archivo para actualizar
  onUpdateFileSelected(event: any) {
    const file = event.target.files[0];
    this.validateAndSetFile(file, event.target, true);
  }

  // 🔥 NUEVO: Validar archivo (reutilizable)
  private validateAndSetFile(file: File, inputElement: HTMLInputElement, isUpdate: boolean = false) {
    if (!file) return;

    const allowedExtensions = ['csv', 'c3d'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension || '')) {
      this.showError('❌ Solo se permiten archivos CSV o C3D.');
      inputElement.value = '';
      return;
    }

    if (isUpdate) {
      this.updateSelectedFile = file;
    } else {
      this.selectedFile = file;
    }
  }

  // 🔥 NUEVO: Actualizar archivo
  onUpdateFile() {
    if (!this.updateSelectedFile || !this.selectedFileName) {
      this.showWarn('Selecciona un archivo para actualizar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.updateSelectedFile);

    this.apiService.actualizarArchivo(this.selectedFileName, formData).subscribe({
      next: (response: any) => {
        this.showSuccess(response.message || '✅ Archivo actualizado correctamente.');
        this.showUpdateDialog = false;
        this.loadFiles();
      },
      error: (error: HttpErrorResponse) => {
        this.showError(error.error?.detail || '❌ Error al actualizar el archivo.');
      }
    });
  }

  // 🔥 NUEVO: Eliminar archivo
  deleteFile(fileName: string) {
    if (confirm(`¿Estás seguro de eliminar el archivo "${fileName}"? Esta acción no se puede deshacer.`)) {
      this.apiService.eliminarArchivo(fileName).subscribe({
        next: (response: any) => {
          this.showSuccess(response.message || '✅ Archivo eliminado correctamente.');
          this.loadFiles();
        },
        error: (error: HttpErrorResponse) => {
          this.showError(error.error?.detail || '❌ Error al eliminar el archivo.');
        }
      });
    }
  }

  // 🔥 NUEVO: Limpiar cuando se cierra el diálogo
  onUpdateDialogHide() {
    this.selectedFileName = '';
    this.updateSelectedFile = null;
  }

  // 🔥 NUEVO: Métodos de mensajes toast (reemplazan los alerts)
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