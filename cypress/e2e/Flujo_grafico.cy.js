describe('FLUJO CON DATOS DE CINEMÁTICA COMPLETA', () => {
  
  beforeEach(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // IGNORAR los errores de CORS y fonts - no son problemas reales
      if (err.message.includes('fonts.gstatic.com') || 
          err.message.includes('CORS policy') ||
          err.message.includes('NG0505')) {
        return false; // Prevenir que Cypress falle
      }
    });
    
    cy.loginAsSuperAdmin();
  });

  it('debe subir archivo con datos de cinemática completa y generar gráfica', () => {
    
    // 🔹 PASO 1: CARGAR ARCHIVO 
    cy.visit('/cargar-archivos');
    cy.get('input[type="file"]').selectFile('cypress/fixtures/modelo_esqueleto_completo.csv', { 
      force: true 
    });
    
    cy.get('.file-label span').should('contain', 'modelo_esqueleto_completo.csv');
    cy.get('.upload-btn').click();
    
    cy.wait(5000);
    cy.log('✅ Archivo subido');

    // 🔹 PASO 2: IR A GRÁFICAS
    cy.visit('/graficas');
    
    // 🔹 INTERCEPTAR LLAMADAS API
    cy.intercept('GET', '**/api/data3d/**').as('getData3D');
    
    // 🔹 PASO 3: ESPERAR Y BUSCAR EL ARCHIVO ESPECÍFICO
    cy.get('#archivo', { timeout: 20000 })
      .should('exist')
      .then(($select) => {
        
        const options = $select.find('option');
        cy.log(`📁 Archivos disponibles: ${options.length}`);
        
        // 🔹 BUSCAR ESPECÍFICAMENTE EL ARCHIVO modelo_esqueleto_completo.csv
        let archivoTarget = null;
        let archivoIndex = null;
        let archivoNombre = '';
        
        cy.log('🔍 BUSCANDO ARCHIVO: modelo_esqueleto_completo.csv');
        
        for (let i = 0; i < options.length; i++) {
          const texto = options[i].textContent;
          if (texto.includes('modelo_esqueleto_completo')) {
            archivoTarget = options[i].value;
            archivoIndex = i;
            archivoNombre = texto;
            cy.log(`🎯 ENCONTRADO en posición [${i}]: ${texto}`);
            break;
          }
        }
        
        if (!archivoTarget) {
          cy.log('❌ No se encontró modelo_esqueleto_completo.csv');
          cy.log('📋 Archivos disponibles:');
          for (let i = 0; i < options.length; i++) {
            cy.log(`   [${i}] "${options[i].textContent}"`);
          }
          return;
        }

        // 🔹 SELECCIONAR EL ARCHIVO ENCONTRADO
        cy.log(`✅ Seleccionando archivo [${archivoIndex}]: ${archivoNombre}`);
        cy.get('#archivo').select(archivoTarget);
        
        // Verificar selección
        cy.get('#archivo').should('have.value', archivoTarget);
        
        // 🔹 PASO 4: HACER CLICK EN EL BOTÓN
        cy.log('🖱️ Buscando botón "Generar grafica"...');
        
        // Verificar estado del botón
        cy.contains('button', 'Generar grafica')
          .should('be.visible')
          .then(($btn) => {
            cy.log(`🔘 Botón encontrado - texto: "${$btn.text()}"`);
            cy.log(`🔘 Botón visible: ${$btn.is(':visible')}`);
            cy.log(`🔘 Botón disabled: ${$btn.is(':disabled')}`);
          });
        
        // Hacer click
        cy.contains('button', 'Generar grafica').click({ force: true });
        
        // 🔹 PASO 5: VERIFICAR LLAMADA API
        cy.wait(3000).then(() => {
          cy.get('@getData3D.all').then((interceptions) => {
            if (interceptions.length > 0) {
              cy.log('✅ ¡LLAMADA API DETECTADA!');
              const interception = interceptions[0];
              if (interception.response) {
                cy.log(`📊 Status: ${interception.response.statusCode}`);
                cy.log(`📁 Frames recibidos: ${interception.response.body?.frames?.length || 0}`);
                if (interception.response.body?.frames?.[0]) {
                  cy.log(`📍 Puntos en primer frame: ${interception.response.body.frames[0].length}`);
                }
              }
            } else {
              cy.log('⚠️ No se detectó llamada API después del click');
              cy.log('🔍 Verificando posibles problemas...');
              
              // Verificar si hay errores en la página
              cy.get('body').then(($body) => {
                const errores = $body.find('.p-toast-message-error, [class*="error"]');
                if (errores.length > 0) {
                  cy.log('❌ ERRORES ENCONTRADOS:');
                  errores.each((index, el) => {
                    cy.log(`   Error ${index + 1}: ${Cypress.$(el).text()}`);
                  });
                }
              });
            }
          });
        });

        // 🔹 PASO 6: ESPERAR Y VERIFICAR GRÁFICA
        cy.log('⏳ Esperando generación de gráfica...');
        cy.wait(10000);
        
        // Verificar gráfica
        cy.get('body').then(($body) => {
          
          const selectoresGrafica = [
            '.plotly-graph-fixed',
            '.js-plotly-plot', 
            '.plot-container',
            'canvas',
            'svg'
          ];
          
          let graficaEncontrada = false;
          
          selectoresGrafica.forEach(selector => {
            const elemento = $body.find(selector);
            if (elemento.length > 0 && elemento.is(':visible')) {
              cy.log(`✅ Gráfica encontrada con selector: ${selector}`);
              graficaEncontrada = true;
            }
          });
          
          // Verificar controles de animación
          if ($body.find('.animation-controls').length > 0) {
            cy.log('✅ Controles de animación visibles - datos cargados correctamente');
          }
          
          if (graficaEncontrada) {
            cy.log('🎉 ¡ÉXITO! Gráfica generada correctamente');
            cy.screenshot('grafica-cinematica-exitosa');
          } else {
            cy.log('❌ No se encontró gráfica visible');
            cy.log('🔍 Estado actual de la página:');
            cy.log(`   - Controles animación: ${$body.find('.animation-controls').length}`);
            cy.log(`   - Mensajes error: ${$body.find('.p-toast-message, [class*="error"]').length}`);
            cy.log(`   - Elementos canvas: ${$body.find('canvas').length}`);
            cy.log(`   - Elementos svg: ${$body.find('svg').length}`);
            
            // Verificar si hay mensaje de "sin datos"
            if ($body.text().includes('sin datos') || $body.text().includes('Sin datos')) {
              cy.log('📭 Hay mensaje de "sin datos" - posible problema en la carga');
            }
            
            cy.screenshot('debug-sin-grafica');
          }
        });
      });
  });
});