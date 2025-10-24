// src/app/services/simulated-files.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface SimulatedFileData {
  frames: any[];
  file_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class SimulatedFilesService {
  
  private simulatedFiles: string[] = [
    'ejercicio_gato_postoperatorio.csv',
    'movimiento_cadera_simulado.c3d', 
    'rehabilitacion_cadera_rango_completo.csv'
  ];

  private simulatedData: { [key: string]: SimulatedFileData } = {
    'ejercicio_gato_postoperatorio.csv': {
      file_type: 'csv',
      frames: this.generateSkeletonFrames() // 🆕 CAMBIO: Usar esqueleto en lugar de ejercicio genérico
    },
    'movimiento_cadera_simulado.c3d': {
      file_type: 'c3d', 
      frames: this.generateSkeletonFrames() // 15 puntos - ESQUELETO
    },
    'rehabilitacion_cadera_rango_completo.csv': {
      file_type: 'csv',
      frames: this.generateHipExerciseFrames() // 12 puntos
    }
  };

  // 🆕 MÉTODO para detectar qué tipo de datos es
  getFileDataType(filename: string): 'esqueleto' | 'general' | 'cadera' {
    if (filename.includes('esqueleto') || filename.includes('skeleton') || 
        filename === 'movimiento_cadera_simulado.c3d' ||
        filename === 'ejercicio_gato_postoperatorio.csv') { // 🆕 INCLUIR el ejercicio gato
      return 'esqueleto';
    } else if (filename.includes('cadera') || filename === 'rehabilitacion_cadera_rango_completo.csv') {
      return 'cadera';
    } else {
      return 'general';
    }
  }

  // 🆕 MÉTODO PÚBLICO: Obtener conexiones del esqueleto
  getSkeletonConnections(): number[][] {
    return [
      // CABEZA Y CUELLO
      [0, 1],   // Cabeza → Cuello
      
      // BRAZOS IZQUIERDOS
      [1, 2],   // Cuello → Hombro izquierdo
      [2, 4],   // Hombro izquierdo → Codo izquierdo
      [4, 6],   // Codo izquierdo → Mano izquierda
      
      // BRAZOS DERECHOS  
      [1, 3],   // Cuello → Hombro derecho
      [3, 5],   // Hombro derecho → Codo derecho
      [5, 7],   // Codo derecho → Mano derecha
      
      // TORSO
      [1, 8],   // Cuello → Tórax
      [8, 9],   // Tórax → Cadera izquierda
      [8, 10],  // Tórax → Cadera derecha
      
      // PIERNAS IZQUIERDAS
      [9, 11],  // Cadera izquierda → Rodilla izquierda
      [11, 13], // Rodilla izquierda → Pie izquierdo
      
      // PIERNAS DERECHAS
      [10, 12], // Cadera derecha → Rodilla derecha  
      [12, 14], // Rodilla derecha → Pie derecho
      
      // CONEXIONES ADICIONALES PARA MEJOR VISUALIZACIÓN
      [2, 3],   // Hombro izquierdo → Hombro derecho (pecho)
      [9, 10]   // Cadera izquierda → Cadera derecha (pelvis)
    ];
  }

  getSimulatedFiles(): string[] {
    return this.simulatedFiles;
  }

  isSimulatedFile(filename: string): boolean {
    return this.simulatedFiles.includes(filename);
  }

  loadSimulatedFile(filename: string): Observable<SimulatedFileData> {
    const data = this.simulatedData[filename];
    
    if (!data) {
      throw new Error(`Archivo simulado no encontrado: ${filename}`);
    }

    return of(data).pipe(delay(800));
  }

  // ============================================================================
  // 🎭 GENERACIÓN DE DATOS CORREGIDA
  // ============================================================================

  /**
   * 🐱 GENERAR EJERCICIO "GATO" CON ESTRUCTURA DE ESQUELETO
   * 📌 Ahora usa la misma estructura que movimiento_cadera_simulado.c3d
   */
  private generateCatExerciseFrames(): any[] {
    return this.generateSkeletonFrames(); // 🆕 USAR LA MISMA ESTRUCTURA
  }

  /**
   * 🦴 GENERAR ESQUELETO HUMANO REALISTA EN POSICIÓN CUADRÚPEDA
   * 📌 15 puntos anatómicos en posiciones realistas
   * 📌 Movimiento coordinado para el ejercicio "gato"
   */
  private generateSkeletonFrames(): any[] {
    const frames = [];
    const frameCount = 60;

    for (let i = 0; i < frameCount; i++) {
      const progress = i / frameCount;
      
      // 🎭 MOVIMIENTO PRINCIPAL DEL EJERCICIO "GATO"
      const flexion = Math.sin(progress * Math.PI * 4) * 0.4; // Movimiento de flexión/extensión
      const movimientoLateral = Math.sin(progress * Math.PI * 2) * 0.1;

      const points = [];
      
      // 📍 15 PUNTOS ANATÓMICOS EN ORDEN ESPECÍFICO
      // [0] Cabeza
      points.push({
        x: movimientoLateral * 0.3,
        y: 1.7 + flexion * 0.1, // Cabeza se mueve poco
        z: 0.1
      });

      // [1] Cuello
      points.push({
        x: movimientoLateral * 0.2,
        y: 1.5 + flexion * 0.2,
        z: 0
      });

      // [2] Hombro izquierdo
      points.push({
        x: -0.35 + movimientoLateral,
        y: 1.4 + flexion * 0.3,
        z: 0
      });

      // [3] Hombro derecho  
      points.push({
        x: 0.35 + movimientoLateral,
        y: 1.4 + flexion * 0.3,
        z: 0
      });

      // [4] Codo izquierdo
      points.push({
        x: -0.35,
        y: 1.1,
        z: 0.1
      });

      // [5] Codo derecho
      points.push({
        x: 0.35, 
        y: 1.1,
        z: 0.1
      });

      // [6] Mano izquierda
      points.push({
        x: -0.35,
        y: 0.7,
        z: 0.2
      });

      // [7] Mano derecha
      points.push({
        x: 0.35,
        y: 0.7, 
        z: 0.2
      });

      // [8] Tórax (punto central - más afectado por flexión)
      points.push({
        x: movimientoLateral * 0.1,
        y: 1.2 + flexion * 0.5, // El tórax es el que más se mueve
        z: 0
      });

      // [9] Cadera izquierda
      points.push({
        x: -0.25,
        y: 0.9 + flexion * 0.3,
        z: 0
      });

      // [10] Cadera derecha
      points.push({
        x: 0.25,
        y: 0.9 + flexion * 0.3,
        z: 0
      });

      // [11] Rodilla izquierda
      points.push({
        x: -0.25,
        y: 0.5,
        z: 0.1
      });

      // [12] Rodilla derecha
      points.push({
        x: 0.25,
        y: 0.5,
        z: 0.1
      });

      // [13] Pie izquierdo
      points.push({
        x: -0.25,
        y: 0.1,
        z: 0.2
      });

      // [14] Pie derecho
      points.push({
        x: 0.25,
        y: 0.1, 
        z: 0.2
      });

      // 🎲 VARIACIÓN ALEATORIA PEQUEÑA
      points.forEach(point => {
        point.x += (Math.random() - 0.5) * 0.015;
        point.y += (Math.random() - 0.5) * 0.015;
        point.z += (Math.random() - 0.5) * 0.015;
      });

      frames.push(points);
    }

    return frames;
  }

  /**
   * 🏃 GENERAR EJERCICIO ESPECÍFICO DE CADERA
   * 📌 12 puntos enfocados en movimiento de cadera
   */
  private generateHipExerciseFrames(): any[] {
    const frames = [];
    const frameCount = 80;

    for (let i = 0; i < frameCount; i++) {
      const progress = i / frameCount;
      const points = [];
      
      // 🎭 MOVIMIENTO PRONUNCIADO DE CADERA
      const hipMovement = Math.sin(progress * Math.PI * 2) * 0.6;
      
      // 📍 GENERAR 12 PUNTOS PARA EJERCICIO DE CADERA
      for (let j = 0; j < 12; j++) {
        const pointProgress = j / 12;
        
        const x = Math.sin(pointProgress * Math.PI * 2) * 0.4;
        const y = 0.7 + hipMovement * (1 - pointProgress * 0.5);
        const z = pointProgress * 1.5 - 0.75;

        points.push({ 
          x: x + (Math.random() - 0.5) * 0.03,
          y: y + (Math.random() - 0.5) * 0.03,
          z: z + (Math.random() - 0.5) * 0.03
        });
      }

      frames.push(points);
    }

    return frames;
  }

  // 🗑️ ELIMINAR MÉTODOS QUE YA NO SE USAN
  private getExercisePhase(progress: number): string {
    const cycleProgress = (progress * 2) % 1;
    
    if (cycleProgress < 0.25) return 'neutral';
    if (cycleProgress < 0.5) return 'flexion';
    if (cycleProgress < 0.75) return 'neutral';
    return 'extension';
  }

  private generateExerciseFrame(progress: number, phase: string): any[] {
    // 🗑️ Este método ya no se usa, mantenerlo por compatibilidad
    return this.generateSkeletonFrames()[0]; // Devolver primer frame del esqueleto
  }
}