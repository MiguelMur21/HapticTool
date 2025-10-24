import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button'; // ✅ Importar el módulo de botones


@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [ChartModule, FormsModule, CommonModule, ButtonModule],
  templateUrl: './graphics.component.html',
  styleUrls: ['./graphics.component.scss']
})
export class GraphicsComponent implements OnInit, AfterViewInit {
  archivos: string[] = [];
  nombreArchivo: string = ''; // 🔹 vacío hasta que el usuario seleccione
  fileType: string = '';
  frames: any[] = [];
  currentFrameIndex: number = 0;
  isAnimating = false;
  animationInterval: any;
  Plotly: any;

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

ngOnInit() {
  this.apiService.getArchivos().subscribe({
    next: (data) => {
      this.archivos = data; // 👈 data debe ser un string[]
      console.log('Archivos disponibles:', this.archivos);
    },
    error: (err) => {
      console.error('Error al obtener lista de archivos:', err);
    }
  });
}

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const module = await import('plotly.js-dist-min');
    this.Plotly = module.default;
  }

  cargarArchivo() {
    if (!this.nombreArchivo) {
      alert('Selecciona un archivo primero');
      return;
    }

    if (!this.Plotly) {
      console.warn('Plotly aún no está cargado');
      return;
    }

    this.apiService.getData3D(this.nombreArchivo).subscribe({
      next: (data) => {
        this.frames = data.frames;
        this.fileType = data.file_type;

        if (this.frames.length > 0) {
          this.mostrarFrame(this.Plotly, 0);
        } else {
          this.Plotly.newPlot('plot3d', [], {});
          console.warn('Archivo sin datos de cinemática');
        }
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
      }
    });
  }

mostrarFrame(Plotly: any, frameIndex: number) {
    const frame = this.frames[frameIndex];
    if (!frame) return;

    // Extraemos coordenadas X, Y, Z
    const x = frame.map((p: any) => p.x);
    const y = frame.map((p: any) => p.y);
    const z = frame.map((p: any) => p.z);

    // 📍 Trazado solo con marcadores (sin líneas)
    const trace = {
      x,
      y,
      z,
      mode: 'markers',   // 👈 Solo puntos
      type: 'scatter3d',
      marker: {
        size: 5,         // 🔹 Tamaño de los puntos
        color: z,        // 🔹 Color basado en eje Z
        colorscale: 'Viridis', // 🔹 Escala de color
        opacity: 0.8     // 🔹 Transparencia leve
      }
    };

    // 🎨 Configuración del gráfico
    const layout = {
      title: `Frame ${frameIndex + 1} / ${this.frames.length}`,
      scene: {
        xaxis: { title: 'X' },
        yaxis: { title: 'Y' },
        zaxis: { title: 'Z' }
      },
      margin: { l: 0, r: 0, b: 0, t: 40 },
      showlegend: false
    };

    // 📈 Renderiza el gráfico 3D
    Plotly.newPlot('plot3d', [trace], layout, { responsive: true });
  }

  playAnimation() {
    if (this.isAnimating || !this.frames.length) return;
    this.isAnimating = true;

    this.animationInterval = setInterval(() => {
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
      this.mostrarFrame(this.Plotly, this.currentFrameIndex);
    }, 100);
  }

  stopAnimation() {
    this.isAnimating = false;
    clearInterval(this.animationInterval);
  }
}