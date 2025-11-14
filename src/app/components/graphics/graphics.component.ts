import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
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
export class GraphicsComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('plot3d', { static: false }) plot3dElement!: ElementRef;
  
  archivos: string[] = [];
  nombreArchivo: string = '';
  fileType: string = '';
  frames: any[] = [];
  currentFrameIndex: number = 0;
  isAnimating = false;
  animationInterval: any;
  Plotly: any;
  private frameRate: number = 30;
  private initialFrame: any[] = [];

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.applyCanvasPerformancePatch();
  }

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
    console.log('✅ Plotly cargado exitosamente');
  }

  ngOnDestroy() {
    this.stopAnimation();
    console.log('🧹 Componente graphics destruido - recursos liberados');
  }

  private applyCanvasPerformancePatch() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if ((HTMLCanvasElement as any).__willReadFrequentlyPatched) {
      return;
    }

    console.log('🎯 Aplicando optimización willReadFrequently al Canvas...');

    const originalGetContext = HTMLCanvasElement.prototype.getContext as any;

    HTMLCanvasElement.prototype.getContext = function(
      contextId: string, 
      options?: any
    ): any {
      
      if (contextId === '2d') {
        const contextOptions = {
          ...options,
          willReadFrequently: true
        };
        
        console.log('✅ Canvas 2D optimizado con willReadFrequently=true');
        return originalGetContext.call(this, contextId, contextOptions);
      }

      return originalGetContext.call(this, contextId, options);
    };

    (HTMLCanvasElement as any).__willReadFrequentlyPatched = true;
    console.log('🎉 Patch de performance aplicado exitosamente');
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

    console.log(`📁 Cargando archivo: ${this.nombreArchivo}`);

    this.apiService.getData3D(this.nombreArchivo).subscribe({
      next: (data) => {
        if (!data || !data.frames || !Array.isArray(data.frames)) {
          console.error('❌ Estructura de datos inválida:', data);
          alert('Error: Estructura de datos inválida recibida del servidor');
          return;
        }

        this.frames = data.frames;
        this.fileType = data.file_type;
        
        if (this.frames.length > 0 && Array.isArray(this.frames[0]) && this.frames[0].length > 0) {
          this.initialFrame = [...this.frames[0]];
          console.log(`✅ ${this.frames.length} frames cargados, primer frame con ${this.frames[0].length} puntos`);
          
          setTimeout(() => {
            this.mostrarFrame(0);
          }, 100);
        } else {
          console.warn('⚠️ Archivo sin datos válidos de cinemática');
          alert('El archivo no contiene datos de cinemática válidos');
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar datos:', err);
        alert('Error al cargar los datos del archivo');
      }
    });
  }

  // 🎯 MÉTODO DE DIAGNÓSTICO MEJORADO
  private diagnosticarEstructuraDatos(frame: any[]) {
    console.log('🔍 DIAGNÓSTICO MEJORADO DE ESTRUCTURA:');
    console.log(`Número de puntos: ${frame.length}`);
    
    // Calcular estadísticas de posición
    const minX = Math.min(...frame.map(p => p.x));
    const maxX = Math.max(...frame.map(p => p.x));
    const minY = Math.min(...frame.map(p => p.y));
    const maxY = Math.max(...frame.map(p => p.y));
    const minZ = Math.min(...frame.map(p => p.z));
    const maxZ = Math.max(...frame.map(p => p.z));
    
    console.log(`📊 Rango X: ${minX.toFixed(1)} a ${maxX.toFixed(1)}`);
    console.log(`📊 Rango Y: ${minY.toFixed(1)} a ${maxY.toFixed(1)}`);
    console.log(`📊 Rango Z: ${minZ.toFixed(1)} a ${maxZ.toFixed(1)}`);
    
    // Centro de masa aproximado
    const centroX = frame.reduce((sum, p) => sum + p.x, 0) / frame.length;
    const centroY = frame.reduce((sum, p) => sum + p.y, 0) / frame.length;
    const centroZ = frame.reduce((sum, p) => sum + p.z, 0) / frame.length;
    
    console.log(`🎯 Centro aproximado: X=${centroX.toFixed(1)}, Y=${centroY.toFixed(1)}, Z=${centroZ.toFixed(1)}`);
    
    // Identificar lados automáticamente
    const puntosIzquierdos = frame.filter(p => p.y < centroY).length;
    const puntosDerechos = frame.filter(p => p.y > centroY).length;
    
    console.log(`🔄 Distribución: ${puntosIzquierdos} puntos izquierdos, ${puntosDerechos} puntos derechos`);
    
    // Mostrar todos los segmentos disponibles
    const segmentosUnicos = [...new Set(frame.map(p => p.segmento))];
    console.log('📋 Segmentos únicos:', segmentosUnicos);
    
    // Identificar estructura automáticamente
    if (frame.length === 12) {
      console.log('🎯 ESTRUCTURA: 12 puntos - Esqueleto básico (Teslasuit)');
    } else if (frame.length === 20) {
      console.log('🎯 ESTRUCTURA: 20 puntos - Esqueleto detallado');
      
      // Mostrar mapeo de segmentos para 20 puntos
      const mapeo = this.mapearPuntosPorSegmento(frame);
      console.log('📍 Mapeo automático:', mapeo);
    } else {
      console.log(`🎯 ESTRUCTURA: ${frame.length} puntos - Configuración personalizada`);
    }
    
    // Mostrar puntos clave identificados
    const puntosClave = this.identificarPuntosClave(frame);
    console.log('🎯 Puntos clave identificados:', puntosClave);
    
    // Mostrar primeros puntos con sus segmentos
    console.log('📋 Primeros 6 puntos con segmentos:');
    frame.slice(0, 6).forEach((punto, index) => {
      console.log(`   Punto ${index}: "${punto.segmento}" → (${punto.x.toFixed(1)}, ${punto.y.toFixed(1)}, ${punto.z.toFixed(1)})`);
    });
  }

  // 🎯 MÉTODO MOSTRAR FRAME
  mostrarFrame(frameIndex: number) {
    if (!this.Plotly || !this.plot3dElement?.nativeElement) return;

    const frame = this.frames[frameIndex];
    if (!frame || !Array.isArray(frame) || frame.length === 0) return;

    // 🎯 DIAGNÓSTICO TEMPORAL - EJECUTAR UNA VEZ
    if (frameIndex === 0) {
      this.diagnosticarEstructuraDatos(frame);
    }

    // 📊 Extraer coordenadas
    const x = frame.map((p: any) => p.x);
    const y = frame.map((p: any) => p.y);
    const z = frame.map((p: any) => p.z);

    // 🎯 TRAZADO DE PUNTOS
    const tracePuntos = {
      x, y, z,
      mode: 'markers',
      type: 'scatter3d',
      name: 'Articulaciones',
      marker: {
        size: 6,
        color: '#ff4444',
        opacity: 0.9,
        symbol: 'circle',
        line: { color: '#ffffff', width: 1 }
      }
    };

    // 🎯 CONEXIONES LÓGICAS EN CADENA
    const tracesLineas = this.crearConexionesCadena(frame);

    // 🎨 Layout
    const layout = {
      title: `Esqueleto - Frame ${frameIndex + 1}`,
      scene: {
        xaxis: { title: 'X' },
        yaxis: { title: 'Y' },
        zaxis: { title: 'Z' },
        camera: { eye: { x: 1.5, y: 1.5, z: 1.5 } }
      },
      margin: { l: 0, r: 0, b: 0, t: 50 },
      showlegend: true
    };

    const config = {
      responsive: true,
      displayModeBar: true
    };

    try {
      this.Plotly.purge(this.plot3dElement.nativeElement);
      this.Plotly.newPlot(
        this.plot3dElement.nativeElement, 
        [...tracesLineas, tracePuntos], 
        layout, 
        config
      );
    } catch (error) {
      console.error('❌ Error al renderizar gráfico:', error);
    }
  }

  // 🎯 SISTEMA DE CONEXIONES ADAPTATIVAS
  private crearConexionesCadena(frame: any[]): any[] {
    const traces: any[] = [];

    console.log(`🎯 CREANDO CONEXIONES ADAPTATIVAS PARA ${frame.length} PUNTOS`);

    // 🎯 DETECTAR ESTRUCTURA AUTOMÁTICAMENTE
    if (frame.length === 12) {
      console.log('🔍 Detectada estructura de 12 puntos - Esqueleto básico');
      return this.crearConexiones12Puntos(frame);
    } else if (frame.length === 20) {
      console.log('🔍 Detectada estructura de 20 puntos - Esqueleto detallado');
      return this.crearConexiones20Puntos(frame);
    } else {
      console.log(`🔍 Estructura con ${frame.length} puntos - Usando conexiones inteligentes`);
      return this.crearConexionesInteligentes(frame);
    }
  }

  // 🎯 CONEXIONES PARA 12 PUNTOS (Teslasuit)
  private crearConexiones12Puntos(frame: any[]): any[] {
    const traces: any[] = [];
    
    // Basado en el análisis de tus datos del Teslasuit:
    // Puntos 0,2,4,6,8,10 son izquierdos | Puntos 1,3,5,7,9,11 son derechos
    
    const conexiones = [
      // 🔵 COLUMNA VERTEBRAL (conectar puntos centrales)
      { indices: [4, 5], nombre: 'Hombros', color: '#2E86AB' },
      
      // 🟢 BRAZO IZQUIERDO 
      { indices: [4, 0, 2], nombre: 'Brazo Izquierdo', color: '#A23B72' },
      
      // 🟢 BRAZO DERECHO
      { indices: [5, 1, 3], nombre: 'Brazo Derecho', color: '#A23B72' },
      
      // 🟡 PIERNA IZQUIERDA
      { indices: [6, 8, 10], nombre: 'Pierna Izquierda', color: '#F18F01' },
      
      // 🟡 PIERNA DERECHA
      { indices: [7, 9, 11], nombre: 'Pierna Derecha', color: '#F18F01' },
      
      // 🔗 CONEXIONES TORSO
      { indices: [4, 6], nombre: 'Torso Izquierdo', color: '#888888' },
      { indices: [5, 7], nombre: 'Torso Derecho', color: '#888888' }
    ];

    // Crear todas las conexiones
    conexiones.forEach(grupo => {
      const conexionesGrupo = this.crearCadena(frame, grupo.indices, grupo.nombre);
      conexionesGrupo.forEach(trace => {
        trace.line.color = grupo.color;
      });
      traces.push(...conexionesGrupo);
    });

    console.log(`✅ ${traces.length} conexiones para 12 puntos`);
    return traces;
  }

  // 🎯 CONEXIONES PARA 20 PUNTOS (modelo_esqueleto_completo.csv)
  private crearConexiones20Puntos(frame: any[]): any[] {
    const traces: any[] = [];

    // Para el archivo modelo_esqueleto_completo.csv con segmentos nombrados
    const segmentos = frame.map(p => p.segmento);
    console.log('📋 Segmentos disponibles:', segmentos);

    // 🎯 BUSCAR PUNTOS CLAVE POR NOMBRE DE SEGMENTO
    const puntosClave = this.mapearPuntosPorSegmento(frame);

    // 🔵 COLUMNA VERTEBRAL
    if (puntosClave.head && puntosClave.neck && puntosClave.spine && puntosClave.hips) {
      const columna = this.crearCadena(frame, [
        puntosClave.head, puntosClave.neck, puntosClave.spine, puntosClave.hips
      ], 'Columna Vertebral');
      columna.forEach(trace => {
        trace.line.color = '#2E86AB';
        trace.line.width = 5;
      });
      traces.push(...columna);
    }

    // 🟢 BRAZO IZQUIERDO
    if (puntosClave.neck && puntosClave.left_shoulder && puntosClave.left_upper_arm && 
        puntosClave.left_lower_arm && puntosClave.left_hand) {
      const brazoIzq = this.crearCadena(frame, [
        puntosClave.neck, puntosClave.left_shoulder, puntosClave.left_upper_arm,
        puntosClave.left_lower_arm, puntosClave.left_hand
      ], 'Brazo Izquierdo');
      brazoIzq.forEach(trace => trace.line.color = '#A23B72');
      traces.push(...brazoIzq);
    }

    // 🟢 BRAZO DERECHO
    if (puntosClave.neck && puntosClave.right_shoulder && puntosClave.right_upper_arm && 
        puntosClave.right_lower_arm && puntosClave.right_hand) {
      const brazoDer = this.crearCadena(frame, [
        puntosClave.neck, puntosClave.right_shoulder, puntosClave.right_upper_arm,
        puntosClave.right_lower_arm, puntosClave.right_hand
      ], 'Brazo Derecho');
      brazoDer.forEach(trace => trace.line.color = '#A23B72');
      traces.push(...brazoDer);
    }

    // 🟡 PIERNA IZQUIERDA
    if (puntosClave.hips && puntosClave.left_upper_leg && puntosClave.left_lower_leg && puntosClave.left_foot) {
      const piernaIzq = this.crearCadena(frame, [
        puntosClave.hips, puntosClave.left_upper_leg, puntosClave.left_lower_leg, puntosClave.left_foot
      ], 'Pierna Izquierda');
      piernaIzq.forEach(trace => trace.line.color = '#F18F01');
      traces.push(...piernaIzq);
    }

    // 🟡 PIERNA DERECHA
    if (puntosClave.hips && puntosClave.right_upper_leg && puntosClave.right_lower_leg && puntosClave.right_foot) {
      const piernaDer = this.crearCadena(frame, [
        puntosClave.hips, puntosClave.right_upper_leg, puntosClave.right_lower_leg, puntosClave.right_foot
      ], 'Pierna Derecha');
      piernaDer.forEach(trace => trace.line.color = '#F18F01');
      traces.push(...piernaDer);
    }

    // Si no se encontraron segmentos nombrados, usar conexiones por posición
    if (traces.length === 0) {
      console.log('⚠️ No se encontraron segmentos nombrados, usando conexiones por posición');
      return this.crearConexionesInteligentes(frame);
    }

    console.log(`✅ ${traces.length} conexiones para 20 puntos`);
    return traces;
  }

  // 🎯 CONEXIONES INTELIGENTES PARA ESTRUCTURAS DESCONOCIDAS
  private crearConexionesInteligentes(frame: any[]): any[] {
    const traces: any[] = [];
    const puntosClave = this.identificarPuntosClave(frame);
    
    console.log('🧠 Puntos clave identificados:', puntosClave);

    // 🔵 COLUMNA VERTEBRAL (puntos centrales y altos)
    if (puntosClave.columna.length >= 2) {
      const columna = this.crearCadena(frame, puntosClave.columna, 'Columna Vertebral');
      columna.forEach(trace => {
        trace.line.color = '#2E86AB';
        trace.line.width = 5;
      });
      traces.push(...columna);
    }

    // 🟢 BRAZOS
    if (puntosClave.brazoIzquierdo.length >= 2) {
      const brazoIzq = this.crearCadena(frame, puntosClave.brazoIzquierdo, 'Brazo Izquierdo');
      brazoIzq.forEach(trace => trace.line.color = '#A23B72');
      traces.push(...brazoIzq);
    }

    if (puntosClave.brazoDerecho.length >= 2) {
      const brazoDer = this.crearCadena(frame, puntosClave.brazoDerecho, 'Brazo Derecho');
      brazoDer.forEach(trace => trace.line.color = '#A23B72');
      traces.push(...brazoDer);
    }

    // 🟡 PIERNAS
    if (puntosClave.piernaIzquierda.length >= 2) {
      const piernaIzq = this.crearCadena(frame, puntosClave.piernaIzquierda, 'Pierna Izquierda');
      piernaIzq.forEach(trace => trace.line.color = '#F18F01');
      traces.push(...piernaIzq);
    }

    if (puntosClave.piernaDerecha.length >= 2) {
      const piernaDer = this.crearCadena(frame, puntosClave.piernaDerecha, 'Pierna Derecha');
      piernaDer.forEach(trace => trace.line.color = '#F18F01');
      traces.push(...piernaDer);
    }

    // Si no se detectaron suficientes conexiones, agregar por proximidad
    if (traces.length < 5) {
      console.log('🔄 Agregando conexiones por proximidad');
      const conexionesProximidad = this.crearConexionesPorProximidad(frame);
      traces.push(...conexionesProximidad.slice(0, 10));
    }

    console.log(`✅ ${traces.length} conexiones inteligentes creadas`);
    return traces;
  }

  // 🎯 MAPEAR PUNTOS POR NOMBRE DE SEGMENTO
  private mapearPuntosPorSegmento(frame: any[]): any {
    const mapeo: any = {};
    
    frame.forEach((punto, index) => {
      const segmento = punto.segmento.toLowerCase();
      
      // Mapeo de nombres comunes de segmentos
      if (segmento.includes('head') || segmento === 'cabeza') mapeo.head = index;
      else if (segmento.includes('neck') || segmento.includes('cuello')) mapeo.neck = index;
      else if (segmento.includes('spine') || segmento.includes('columna')) mapeo.spine = index;
      else if (segmento.includes('hip') || segmento.includes('cadera')) mapeo.hips = index;
      
      // Brazos izquierdos
      else if (segmento.includes('left_shoulder') || segmento.includes('hombro_izq')) mapeo.left_shoulder = index;
      else if (segmento.includes('left_upper_arm') || segmento.includes('brazo_sup_izq')) mapeo.left_upper_arm = index;
      else if (segmento.includes('left_lower_arm') || segmento.includes('brazo_inf_izq')) mapeo.left_lower_arm = index;
      else if (segmento.includes('left_hand') || segmento.includes('mano_izq')) mapeo.left_hand = index;
      
      // Brazos derechos
      else if (segmento.includes('right_shoulder') || segmento.includes('hombro_der')) mapeo.right_shoulder = index;
      else if (segmento.includes('right_upper_arm') || segmento.includes('brazo_sup_der')) mapeo.right_upper_arm = index;
      else if (segmento.includes('right_lower_arm') || segmento.includes('brazo_inf_der')) mapeo.right_lower_arm = index;
      else if (segmento.includes('right_hand') || segmento.includes('mano_der')) mapeo.right_hand = index;
      
      // Piernas izquierdas
      else if (segmento.includes('left_upper_leg') || segmento.includes('pierna_sup_izq')) mapeo.left_upper_leg = index;
      else if (segmento.includes('left_lower_leg') || segmento.includes('pierna_inf_izq')) mapeo.left_lower_leg = index;
      else if (segmento.includes('left_foot') || segmento.includes('pie_izq')) mapeo.left_foot = index;
      
      // Piernas derechas
      else if (segmento.includes('right_upper_leg') || segmento.includes('pierna_sup_der')) mapeo.right_upper_leg = index;
      else if (segmento.includes('right_lower_leg') || segmento.includes('pierna_inf_der')) mapeo.right_lower_leg = index;
      else if (segmento.includes('right_foot') || segmento.includes('pie_der')) mapeo.right_foot = index;
    });

    console.log('📍 Mapeo de segmentos:', mapeo);
    return mapeo;
  }

  // 🎯 IDENTIFICAR PUNTOS CLAVE POR POSICIÓN
  private identificarPuntosClave(frame: any[]): any {
    const centroY = frame.reduce((sum, p) => sum + p.y, 0) / frame.length;
    const centroZ = frame.reduce((sum, p) => sum + p.z, 0) / frame.length;
    
    // Clasificar todos los puntos
    const puntos = frame.map((p, index) => ({
      index,
      ...p,
      esIzquierdo: p.y < centroY,
      esDerecho: p.y > centroY,
      esSuperior: p.z > centroZ,
      esCentral: Math.abs(p.y - centroY) < (Math.max(...frame.map(p => p.y)) - Math.min(...frame.map(p => p.y))) * 0.3
    }));

    // 🔵 COLUMNA: puntos centrales ordenados por altura (Z)
    const columna = puntos
      .filter(p => p.esCentral)
      .sort((a, b) => b.z - a.z)
      .map(p => p.index)
      .slice(0, 4);

    // 🟢 BRAZOS: puntos superiores de cada lado
    const brazoIzquierdo = puntos
      .filter(p => p.esIzquierdo && p.esSuperior)
      .sort((a, b) => b.z - a.z) // De arriba a abajo
      .map(p => p.index)
      .slice(0, 4);

    const brazoDerecho = puntos
      .filter(p => p.esDerecho && p.esSuperior)
      .sort((a, b) => b.z - a.z)
      .map(p => p.index)
      .slice(0, 4);

    // 🟡 PIERNAS: puntos inferiores de cada lado
    const piernaIzquierda = puntos
      .filter(p => p.esIzquierdo && !p.esSuperior)
      .sort((a, b) => a.z - b.z) // De arriba a abajo
      .map(p => p.index)
      .slice(0, 3);

    const piernaDerecha = puntos
      .filter(p => p.esDerecho && !p.esSuperior)
      .sort((a, b) => a.z - b.z)
      .map(p => p.index)
      .slice(0, 3);

    return {
      columna,
      brazoIzquierdo,
      brazoDerecho,
      piernaIzquierda,
      piernaDerecha
    };
  }

  // 🎯 MÉTODO PARA CREAR UNA CADENA DE CONEXIONES
  private crearCadena(frame: any[], indices: number[], nombre: string): any[] {
    const traces: any[] = [];
    
    for (let i = 0; i < indices.length - 1; i++) {
      const inicio = indices[i];
      const fin = indices[i + 1];
      
      if (this.esConexionValida(frame, inicio, fin)) {
        const distancia = this.calcularDistancia(frame[inicio], frame[fin]);
        const distanciaMaxima = this.calcularDistanciaMaximaPermitida(nombre);
        
        // Solo conectar puntos que estén a una distancia razonable
        if (distancia < distanciaMaxima) {
          traces.push({
            x: [frame[inicio].x, frame[fin].x],
            y: [frame[inicio].y, frame[fin].y],
            z: [frame[inicio].z, frame[fin].z],
            mode: 'lines',
            type: 'scatter3d',
            line: {
              color: this.obtenerColorSegmento(nombre, i),
              width: 4,
              opacity: 0.8
            },
            hoverinfo: 'none',
            showlegend: i === 0,
            name: i === 0 ? nombre : undefined
          });
        } else {
          console.warn(`⚠️ Conexión omitida ${inicio}-${fin}: distancia ${distancia.toFixed(1)} > ${distanciaMaxima}`);
        }
      }
    }
    
    return traces;
  }

  // 🎯 CALCULAR DISTANCIA MÁXIMA PERMITIDA POR TIPO DE SEGMENTO
  private calcularDistanciaMaximaPermitida(nombreSegmento: string): number {
    const distancias = {
      'Columna Vertebral': 300,
      'Brazo Izquierdo': 200,
      'Brazo Derecho': 200,
      'Pierna Izquierda': 250,
      'Pierna Derecha': 250,
      'default': 150
    };
    
    return distancias[nombreSegmento as keyof typeof distancias] || distancias.default;
  }

  // 🎯 MÉTODO PARA CREAR TRAZA DE LÍNEA SIMPLE
  private crearTraceLineaSimple(frame: any[], inicio: number, fin: number, nombre: string, color: string): any {
    return {
      x: [frame[inicio].x, frame[fin].x],
      y: [frame[inicio].y, frame[fin].y],
      z: [frame[inicio].z, frame[fin].z],
      mode: 'lines',
      type: 'scatter3d',
      line: {
        color: color,
        width: 3,
        opacity: 0.7
      },
      hoverinfo: 'none',
      showlegend: false
    };
  }

  // 🎯 CONEXIONES POR PROXIMIDAD (para estructuras desconocidas)
  private crearConexionesPorProximidad(frame: any[]): any[] {
    const traces: any[] = [];
    const umbralDistancia = 500; // Ajustar según la escala de tus datos

    for (let i = 0; i < frame.length; i++) {
      for (let j = i + 1; j < frame.length; j++) {
        const distancia = this.calcularDistancia(frame[i], frame[j]);
        
        if (distancia < umbralDistancia) {
          traces.push(this.crearTraceLineaSimple(
            frame, i, j, `Conexión ${i}-${j}`, '#44ff44'
          ));
        }
      }
    }

    return traces.slice(0, 30); // Limitar a 30 conexiones máximo
  }

  // 🎯 CALCULAR DISTANCIA ENTRE DOS PUNTOS
  private calcularDistancia(p1: any, p2: any): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // 🎯 VERIFICAR SI LA CONEXIÓN ES VÁLIDA
  private esConexionValida(frame: any[], inicio: number, fin: number): boolean {
    return frame[inicio] && frame[fin] && 
           typeof frame[inicio].x === 'number' && 
           typeof frame[fin].x === 'number';
  }

  // 🎯 OBTENER COLOR POR TIPO DE SEGMENTO
  private obtenerColorSegmento(nombre: string, indiceSegmento: number): string {
    const colores = {
      'Columna': ['#2E86AB', '#2E86AB', '#2E86AB', '#2E86AB'],
      'Columna Vertebral': ['#2E86AB', '#2E86AB', '#2E86AB', '#2E86AB'],
      'Brazo Izquierdo': ['#A23B72', '#A23B72', '#A23B72'],
      'Brazo Derecho': ['#A23B72', '#A23B72', '#A23B72'],
      'Pierna Izquierda': ['#F18F01', '#F18F01', '#F18F01'],
      'Pierna Derecha': ['#F18F01', '#F18F01', '#F18F01'],
      'Hombros': ['#2E86AB'],
      'Torso Izquierdo': ['#888888'],
      'Torso Derecho': ['#888888']
    };

    return colores[nombre as keyof typeof colores]?.[indiceSegmento] || '#4444ff';
  }

  // 🎯 MÉTODOS DE ANIMACIÓN (se mantienen igual)
  playAnimation() {
    if (this.isAnimating || !this.frames.length) return;
    
    this.isAnimating = true;
    console.log('▶️ Iniciando animación optimizada');

    let lastFrameTime = 0;
    const targetFrameTime = 1000 / 24;

    const animate = (currentTime: number) => {
      if (!this.isAnimating) return;

      if (currentTime - lastFrameTime >= targetFrameTime) {
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
        this.mostrarFrame(this.currentFrameIndex);
        lastFrameTime = currentTime;
      }

      if (this.isAnimating) {
        this.animationInterval = requestAnimationFrame(animate);
      }
    };

    this.animationInterval = requestAnimationFrame(animate);
  }

  stopAnimation() {
    this.isAnimating = false;
    if (this.animationInterval) {
      cancelAnimationFrame(this.animationInterval);
      this.animationInterval = null;
    }
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
      this.mostrarFrame(this.currentFrameIndex);
    }
  }

  nextFrame() {
    if (this.currentFrameIndex < this.frames.length - 1) {
      this.currentFrameIndex++;
      this.mostrarFrame(this.currentFrameIndex);
    }
  }

  resetAnimation() {
    this.currentFrameIndex = 0;
    this.stopAnimation();
    this.mostrarFrame(0);
  }

  onFrameSeek(event: any) {
    const newFrameIndex = parseInt(event.target.value);
    if (newFrameIndex >= 0 && newFrameIndex < this.frames.length) {
      this.currentFrameIndex = newFrameIndex;
      this.mostrarFrame(this.currentFrameIndex);
    }
  }

  // 🎯 MÉTODOS DE INFORMACIÓN (se mantienen igual)
  getCurrentTime(): string {
    const seconds = (this.currentFrameIndex / this.frameRate).toFixed(1);
    return `${seconds}s`;
  }

  getTotalTime(): string {
    const totalSeconds = (this.frames.length / this.frameRate).toFixed(1);
    return `${totalSeconds}s`;
  }

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
    
    return (xRange * yRange * zRange).toFixed(2);
  }

  getTotalVariation(): string {
    if (!this.frames.length || this.frames.length < 2) return '0.00';
    
    const totalMovement = this.calculateTotalDistance();
    const maxPossibleMovement = this.frames.length * 2;
    
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

  // 🆕 MÉTODOS DE CÁLCULO INTERNOS (se mantienen igual)
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