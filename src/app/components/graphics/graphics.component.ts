import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [ChartModule, FormsModule, CommonModule, ButtonModule],
  templateUrl: './graphics.component.html',
  styleUrls: ['./graphics.component.scss']
})
export class GraphicsComponent implements OnInit, AfterViewInit {
  archivos: string[] = [];
  nombreArchivo: string = '';
  fileType: string = '';
  frames: any[] = [];
  currentFrameIndex: number = 0;
  isAnimating = false;
  animationInterval: any;
  Plotly: any;

  // 🆕 PROPIEDADES NUEVAS PARA MÉTRICAS Y CONTROLES
  private frameRate: number = 30; // FPS
  private initialFrame: any[] = []; // Para calcular desplazamientos

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.apiService.getArchivos().subscribe({
      next: (data) => {
        this.archivos = data;
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
        this.initialFrame = [...this.frames[0]]; // 🆕 Guardar frame inicial

        if (this.frames.length > 0) {
          console.log(`✅ ${this.frames.length} frames cargados, primer frame con ${this.frames[0].length} puntos`);
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
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 5,
        color: z,
        colorscale: 'Viridis',
        opacity: 0.8
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

  // 🆕 MÉTODOS DE CONTROL DE ANIMACIÓN MEJORADOS
  playAnimation() {
    if (this.isAnimating || !this.frames.length) return;
    this.isAnimating = true;
    console.log('▶️ Iniciando animación');

    this.animationInterval = setInterval(() => {
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
      this.mostrarFrame(this.Plotly, this.currentFrameIndex);
    }, 100);
  }

  stopAnimation() {
    this.isAnimating = false;
    clearInterval(this.animationInterval);
    console.log('⏹️ Animación detenida');
  }

  toggleAnimation() {
    if (this.isAnimating) {
      this.stopAnimation();
    } else {
      this.playAnimation();
    }
  }

  previousFrame() {
    if (this.currentFrameIndex > 0) {
      this.currentFrameIndex--;
      this.mostrarFrame(this.Plotly, this.currentFrameIndex);
    }
  }

  nextFrame() {
    if (this.currentFrameIndex < this.frames.length - 1) {
      this.currentFrameIndex++;
      this.mostrarFrame(this.Plotly, this.currentFrameIndex);
    }
  }

  resetAnimation() {
    this.currentFrameIndex = 0;
    this.stopAnimation();
    this.mostrarFrame(this.Plotly, 0);
  }

  onFrameSeek(event: any) {
    const newFrameIndex = parseInt(event.target.value);
    if (newFrameIndex >= 0 && newFrameIndex < this.frames.length) {
      this.currentFrameIndex = newFrameIndex;
      this.mostrarFrame(this.Plotly, this.currentFrameIndex);
    }
  }

  // 🆕 MÉTODOS DE INFORMACIÓN DE TIEMPO
  getCurrentTime(): string {
    const seconds = (this.currentFrameIndex / this.frameRate).toFixed(1);
    return `${seconds}s`;
  }

  getTotalTime(): string {
    const totalSeconds = (this.frames.length / this.frameRate).toFixed(1);
    return `${totalSeconds}s`;
  }

  // 🆕 MÉTODOS DE MÉTRICAS Y DESPLAZAMIENTO
  getActivePoints(): number {
    return this.frames[0]?.length || 0;
  }

  getCurrentDisplacement(): string {
    if (!this.frames.length || !this.initialFrame.length || this.currentFrameIndex === 0) return '0.00';
    
    const currentFrame = this.frames[this.currentFrameIndex];
    let totalDisplacement = 0;
    
    for (let i = 0; i < currentFrame.length; i++) {
      const dx = currentFrame[i].x - this.initialFrame[i].x;
      const dy = currentFrame[i].y - this.initialFrame[i].y;
      const dz = currentFrame[i].z - this.initialFrame[i].z;
      totalDisplacement += Math.sqrt(dx*dx + dy*dy + dz*dz);
    }
    
    return (totalDisplacement / currentFrame.length).toFixed(2);
  }

  getAxisDisplacement(axis: 'x' | 'y' | 'z'): string {
    if (!this.frames.length || !this.initialFrame.length || this.currentFrameIndex === 0) return '0.00';
    
    const currentFrame = this.frames[this.currentFrameIndex];
    let total = 0;
    
    for (let i = 0; i < currentFrame.length; i++) {
      total += Math.abs(currentFrame[i][axis] - this.initialFrame[i][axis]);
    }
    
    return (total / currentFrame.length).toFixed(2);
  }

  getAverageSpeed(): string {
    if (this.frames.length < 2) return '0.00';
    
    const totalTime = this.frames.length / this.frameRate;
    const totalDistance = this.calculateTotalDistance();
    
    return (totalDistance / totalTime).toFixed(2);
  }

  getMaxSpeed(): string {
    if (this.frames.length < 2) return '0.00';
    
    let maxSpeed = 0;
    for (let i = 1; i < this.frames.length; i++) {
      const frameSpeed = this.calculateFrameSpeed(i);
      if (frameSpeed > maxSpeed) maxSpeed = frameSpeed;
    }
    
    return maxSpeed.toFixed(2);
  }

  getMostActivePoint(): string {
    if (!this.frames.length || this.frames.length < 2) return 'N/A';
    
    const pointActivity = this.calculatePointActivity();
    const mostActiveIndex = pointActivity.indexOf(Math.max(...pointActivity));
    
    return `Punto ${mostActiveIndex + 1}`;
  }

  getMovementRange(axis: 'x' | 'y' | 'z'): string {
    if (!this.frames.length) return '0.00';
    
    let min = Infinity, max = -Infinity;
    
    this.frames.forEach(frame => {
      frame.forEach((point: any) => {
        if (point[axis] < min) min = point[axis];
        if (point[axis] > max) max = point[axis];
      });
    });
    
    return (max - min).toFixed(2);
  }

  getCoveredArea(): string {
    if (!this.frames.length) return '0.00';
    
    const xRange = parseFloat(this.getMovementRange('x'));
    const yRange = parseFloat(this.getMovementRange('y'));
    const zRange = parseFloat(this.getMovementRange('z'));
    
    // Volumen aproximado del espacio cubierto
    return (xRange * yRange * zRange).toFixed(2);
  }

  getTotalVariation(): string {
    if (!this.frames.length || this.frames.length < 2) return '0.00';
    
    const totalMovement = this.calculateTotalDistance();
    const maxPossibleMovement = this.frames.length * 2; // Estimación conservadora
    
    return ((totalMovement / maxPossibleMovement) * 100).toFixed(1);
  }

  getMovementSmoothness(): string {
    if (this.frames.length < 3) return 'N/A';
    
    const smoothness = this.calculateSmoothness();
    if (smoothness > 0.8) return 'Muy Suave';
    if (smoothness > 0.6) return 'Suave';
    if (smoothness > 0.4) return 'Moderado';
    return 'Irregular';
  }

  getMovementConsistency(): string {
    if (this.frames.length < 3) return 'N/A';
    
    const consistency = this.calculateConsistency();
    if (consistency > 0.9) return 'Excelente';
    if (consistency > 0.7) return 'Buena';
    if (consistency > 0.5) return 'Regular';
    return 'Baja';
  }

  // 🆕 MÉTODOS DE CÁLCULO INTERNOS
  private calculateTotalDistance(): number {
    let totalDistance = 0;
    
    for (let i = 1; i < this.frames.length; i++) {
      totalDistance += this.calculateFrameDistance(i, i-1);
    }
    
    return totalDistance;
  }

  private calculateFrameDistance(frameIndex1: number, frameIndex2: number): number {
    const frame1 = this.frames[frameIndex1];
    const frame2 = this.frames[frameIndex2];
    let totalDistance = 0;
    
    for (let i = 0; i < frame1.length; i++) {
      const dx = frame1[i].x - frame2[i].x;
      const dy = frame1[i].y - frame2[i].y;
      const dz = frame1[i].z - frame2[i].z;
      totalDistance += Math.sqrt(dx*dx + dy*dy + dz*dz);
    }
    
    return totalDistance / frame1.length;
  }

  private calculateFrameSpeed(frameIndex: number): number {
    const distance = this.calculateFrameDistance(frameIndex, frameIndex - 1);
    const time = 1 / this.frameRate;
    return distance / time;
  }

  private calculatePointActivity(): number[] {
    const pointActivity = new Array(this.frames[0].length).fill(0);
    
    for (let i = 1; i < this.frames.length; i++) {
      for (let j = 0; j < this.frames[i].length; j++) {
        const dx = this.frames[i][j].x - this.frames[i-1][j].x;
        const dy = this.frames[i][j].y - this.frames[i-1][j].y;
        const dz = this.frames[i][j].z - this.frames[i-1][j].z;
        pointActivity[j] += Math.sqrt(dx*dx + dy*dy + dz*dz);
      }
    }
    
    return pointActivity;
  }

  private calculateSmoothness(): number {
    let accelerationChanges = 0;
    
    for (let i = 2; i < this.frames.length; i++) {
      const speed1 = this.calculateFrameSpeed(i-1);
      const speed2 = this.calculateFrameSpeed(i);
      accelerationChanges += Math.abs(speed2 - speed1);
    }
    
    const maxPossibleChanges = (this.frames.length - 2) * 5;
    return Math.max(0, 1 - (accelerationChanges / maxPossibleChanges));
  }

  private calculateConsistency(): number {
    const speeds = [];
    for (let i = 1; i < this.frames.length; i++) {
      speeds.push(this.calculateFrameSpeed(i));
    }
    
    const averageSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    if (averageSpeed === 0) return 1;
    
    const variance = speeds.reduce((a, b) => a + Math.pow(b - averageSpeed, 2), 0) / speeds.length;
    
    return Math.max(0, 1 - (Math.sqrt(variance) / averageSpeed));
  }
}