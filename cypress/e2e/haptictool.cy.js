// cypress/e2e/haptictool.cy.js

describe('Mi aplicación HapticTool', () => {
  
  it('Debería cargar la página principal', () => {
    // Visitar tu aplicación - AHORA CON baseUrl
    cy.visit('/');
    
    // Verificar que cargó correctamente
    cy.contains('HapticTool').should('be.visible');
    cy.contains('Iniciar Sesión').should('be.visible');
  });

  it('Debería navegar a la página de login', () => {
    cy.visit('/');
    
    // Hacer clic en el botón de login
    cy.contains('Iniciar Sesión').click();
    
    // 🎯 SOLUCIÓN: Usar la URL codificada que Cypress ve
    cy.url().should('include', '/Inicio-sesi%C3%B3n');
    
    // Verificar elementos de la página de login
    cy.contains('Correo electrónico').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('Debería ocultar el header en login', () => {
    // 🎯 SOLUCIÓN: Usar la URL completa con baseUrl
    cy.visit('/Inicio-sesi%C3%B3n');
    
    // Verificar que el header NO está visible
    cy.get('app-header').should('not.exist');
    
    // Verificar que estamos en la página correcta
    cy.contains('Iniciar Sesión').should('be.visible');
  });

    it('Debería mostrar el botón de Google', () => {
    cy.visit('/Inicio-sesi%C3%B3n');
    
    // ✅ Esperar explícitamente a que Google cargue
    cy.get('.google-btn-container', { timeout: 10000 }) // 10 segundos
        .should('be.visible');
        
    // El texto "Iniciar con Google" puede estar dentro del iframe de Google
    // por eso no lo encuentra directamente
    });
});