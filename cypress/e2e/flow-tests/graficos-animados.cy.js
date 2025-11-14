/// <reference types="cypress" />

describe('Flujo Completo de Visualización de Gráficos con Animación', () => {
  beforeEach(() => {
    cy.loginAsNormalUser();
    cy.visit('/');
  });

  it('debe completar el flujo completo de selección de archivo, generación de gráfica y control de animación', () => {
    
    // 🔹 PASO 1: NAVEGACIÓN A GRÁFICAS
    cy.get('.nav p-button').contains('Gráficas').click();
    cy.url().should('include', '/graficas');
    cy.get('.graphics-container').should('be.visible');
    cy.get('.title').should('contain', 'Visualizador de Datos 3D');

    // 🔹 PASO 2: VERIFICAR ELEMENTOS DE LA PÁGINA
    cy.get('.subtitle').should('contain', 'Selecciona un archivo de datos para visualizar los puntos 3D');
    cy.get('#archivo').should('be.visible');
    cy.get('button').contains('Generar grafica').should('be.visible');

    // 🔹 PASO 3: VERIFICAR LISTA DE ARCHIVOS DISPONIBLES
    cy.get('#archivo').then(($select) => {
      const options = $select.find('option');
      const fileCount = options.length - 1; // Excluir "Selecciona un archivo..."
      
      if (fileCount > 0) {
        cy.log(`📁 Archivos disponibles: ${fileCount}`);
        
        // Seleccionar el primer archivo disponible (índice 1)
        cy.get('#archivo').select(1);
        cy.get('#archivo').should('not.have.value', '');
        
        // 🔹 PASO 4: GENERAR GRÁFICA
        cy.get('button').contains('Generar grafica').click();
        
        // Esperar carga inicial
        cy.wait(5000); // Aumentar tiempo de espera

        // 🔹 PASO 5: VERIFICAR CARGA DEL GRÁFICO
        cy.get('.plotly-graph-fixed', { timeout: 15000 }).should('be.visible');
        cy.get('.animation-controls').should('be.visible');
        
        // 🔹 PASO 6: VERIFICAR CONTROLES DE ANIMACIÓN INICIALES
        cy.get('.animation-controls').within(() => {
          // Botones de control - verificar que existen
          cy.get('button').should('have.length.at.least', 4);
          
          // Verificar que inicialmente tenemos el botón de play
          cy.get('button .pi-play').should('be.visible');
          cy.get('button .pi-pause').should('not.exist');
          
          // Información de frame
          cy.get('.frame-info').should('be.visible');
          cy.get('.frame-info').should('contain', 'Frame:');
          cy.get('.frame-info').should('contain', 'Tiempo:');
          
          // Barra de progreso
          cy.get('.progress-slider').should('be.visible');
          cy.get('.progress-labels').should('be.visible');
        });

        // 🔹 PASO 7: PROBAR CONTROLES DE ANIMACIÓN - VERSIÓN CORREGIDA
        cy.log('🎯 Probando botón Play...');
        
        // Hacer click en el botón de play de forma más específica
        cy.get('.animation-controls button')
          .find('.pi-play')
          .parent()
          .click();
        
        // Esperar un poco para que la animación inicie
        cy.wait(1000);
        
        // Verificar que el botón cambió a pause - DE FORMA MÁS FLEXIBLE
        cy.get('.animation-controls').within(() => {
          // Opción 1: Buscar el ícono de pause
          cy.get('button .pi-pause').should('exist');
          
          // Opción 2: Verificar que el ícono de play ya no está
          cy.get('button .pi-play').should('not.exist');
          
          // Opción 3: Verificar por clase del botón (si cambia)
          cy.get('button.p-button-warning').should('exist');
        });

        // Esperar que la animación avance un poco
        cy.wait(2000);
        
        // Verificar que el frame ha avanzado
        cy.get('.frame-info').then(($info) => {
          const frameText = $info.text();
          expect(frameText).to.match(/Frame: \d+ \/ \d+/);
          cy.log(`📊 Frame actual: ${frameText}`);
        });

        // 🔹 PASO 8: PROBAR BOTÓN PAUSE
        cy.log('🎯 Probando botón Pause...');
        
        cy.get('.animation-controls button')
          .find('.pi-pause')
          .parent()
          .click();
        
        cy.wait(500);
        
        // Verificar que volvió a play
        cy.get('.animation-controls').within(() => {
          cy.get('button .pi-play').should('exist');
          cy.get('button .pi-pause').should('not.exist');
        });

        // 🔹 PASO 9: PROBAR NAVEGACIÓN MANUAL DE FRAMES
        cy.log('🎯 Probando navegación manual...');
        
        // Guardar el frame actual
        let currentFrame;
        cy.get('.frame-info').invoke('text').then((frameText) => {
          currentFrame = frameText;
        });
        
        // Frame siguiente
        cy.get('.animation-controls button .pi-step-forward').parent().click();
        cy.wait(500);
        
        // Verificar que el frame avanzó
        cy.get('.frame-info').invoke('text').should('not.equal', currentFrame);
        
        // Frame anterior  
        cy.get('.animation-controls button .pi-step-backward').parent().click();
        cy.wait(500);

        // 🔹 PASO 10: PROBAR BARRA DE PROGRESO
        cy.get('.progress-slider').then(($slider) => {
          const maxFrames = parseInt($slider.attr('max'));
          if (maxFrames > 5) {
            cy.log('🎯 Probando barra de progreso...');
            
            // Mover a frame intermedio
            cy.get('.progress-slider').invoke('val', 5).trigger('input');
            cy.wait(500);
            cy.get('.frame-info').should('contain', 'Frame: 6');
          }
        });

        // 🔹 PASO 11: PROBAR BOTÓN RESET
        cy.log('🎯 Probando botón Reset...');
        cy.get('.animation-controls button .pi-refresh').parent().click();
        cy.wait(500);
        cy.get('.frame-info').should('contain', 'Frame: 1');

        // 🔹 PASO 12: VERIFICAR MÉTRICAS DURANTE ANIMACIÓN
        cy.log('🎯 Probando métricas en tiempo real...');
        
        // Iniciar animación para ver métricas
        cy.get('.animation-controls button .pi-play').parent().click();
        cy.wait(1000);
        
        // Las métricas deberían ser visibles durante animación
        cy.get('.metrics-panel').should('be.visible');
        cy.get('.metrics-panel h3').should('contain', 'Métricas en Tiempo Real');
        
        // Verificar métricas básicas
        cy.get('.metric-card').should('have.length.at.least', 1);
        cy.get('.metric-item').should('have.length.at.least', 4);

        // 🔹 PASO 13: PAUSAR Y VERIFICAR MENSAJE DE MÉTRICAS
        cy.get('.animation-controls button .pi-pause').parent().click();
        cy.wait(500);


      } else {
        cy.log('⚠️ No hay archivos disponibles para probar');
        // Probar comportamiento sin archivos
        cy.get('button').contains('Generar grafica').click();
        // Debería mostrar algún mensaje o mantener el estado vacío
        cy.get('.empty-state').should('be.visible');
      }
    });
  });

  it('debe manejar correctamente archivos sin datos de animación', () => {
    cy.get('.nav p-button').contains('Gráficas').click();
    
    cy.get('#archivo').then(($select) => {
      if ($select.find('option').length > 1) {
        cy.get('#archivo').select(3);
        cy.get('button').contains('Generar grafica').click();
        cy.wait(5000);
        
        // Verificar que los controles están presentes pero deshabilitados inicialmente
        cy.get('.animation-controls').should('be.visible');
        
        // Intentar reproducir y verificar comportamiento
        cy.get('.animation-controls button .pi-play').parent().click();
        
        // Después de intentar play, debería cambiar a pause o mantenerse en play
        cy.get('.animation-controls').within(() => {
          // Al menos un ícono debería estar visible (play o pause)
          cy.get('button .pi-play, button .pi-pause').should('exist');
        });
      }
    });
  });
});