describe('Flujo Lineal - SuperAdministrador', () => {
  it('Flujo completo de administración sin volver a login', () => {
    // 1. Login una sola vez
    cy.visit('/Inicio-sesi%C3%B3n');
    cy.get('#email').type('superadmin@tudominio.com');
    cy.get('#password').type('Admin_1234');
    cy.get('.btn-login').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('.welcome').should('be.visible');

    // 2. Verificar permisos en header principal
    cy.get('header.header').should('be.visible');
    cy.get('.nav p-button').should('contain', 'Sobre Nosotros');
    cy.get('.nav p-button').should('contain', 'Gráficas');
    cy.get('.nav p-button').should('contain', 'Cargar Archivos');
    cy.get('.icon-btn .pi-id-card').should('be.visible');

    // 3. Acceder al panel de administración
    cy.get('.icon-btn .pi-id-card').click();
    cy.url().should('include', '/administrador');
    cy.get('.admin-nav').should('be.visible');
    cy.get('.admin-nav p-button').should('contain', 'Usuarios');
    cy.get('.admin-nav p-button').should('contain', 'Archivos');
    cy.get('.admin-nav p-button').should('contain', 'Logs');
    cy.get('.icon-btn .pi-chevron-circle-left').should('be.visible');

    // 4. Gestionar Usuarios
    cy.get('.admin-nav p-button').contains('Usuarios').click();
    cy.url().should('include', '/administrador/usuarios');
    cy.get('.header h2').should('contain', 'Usuarios Registrados');
    cy.get('.create-user-section').should('be.visible');
    cy.get('input[placeholder="Nombre completo"]').should('be.visible');
    cy.get('input[placeholder="Correo electrónico"]').should('be.visible');
    cy.get('input[placeholder="Contraseña (mín. 6 caracteres)"]').should('be.visible');
    cy.get('p-table').should('be.visible');
    cy.contains('button', 'Cambiar contraseña').should('be.visible');

    // 5. Gestionar Archivos
    cy.get('.admin-nav p-button').contains('Archivos').click();
    cy.url().should('include', '/administrador/archivos');
    cy.get('.admin-upload-container h2').should('contain', 'Gestión de Archivos');
    cy.get('.upload-area').should('be.visible');
    cy.get('.select-btn').should('be.visible');
    cy.get('.upload-btn').should('be.visible');
    cy.get('p-table').should('be.visible');
    cy.get('.p-button-warning').should('exist');
    cy.get('.p-button-danger').should('exist');

    // 6. Verificar Logs
    cy.get('.admin-nav p-button').contains('Logs').click();
    cy.url().should('include', '/administrador/logs');
    cy.get('.header h2').should('contain', 'Historial de Sesiones');
    cy.get('.controls-panel').should('be.visible');
    cy.get('.stats-container').should('be.visible');
    cy.get('.stat-card').should('have.length.at.least', 1);
    cy.contains('button', 'Actualizar').should('be.visible');
    cy.get('p-table').should('be.visible');

    // 7. Volver al sitio principal
    cy.get('.icon-btn .pi-chevron-circle-left').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('.nav p-button').should('contain', 'Sobre Nosotros');
    cy.get('.nav p-button').should('contain', 'Gráficas');

    // 8. Probar visualización de gráficas
    cy.get('.nav p-button').contains('Gráficas').click();
    cy.url().should('include', '/graficas');
    cy.get('.graphics-container').should('be.visible');
    
    // Solo probar si hay archivos disponibles
    cy.get('#archivo').then(($select) => {
      if ($select.find('option').length > 1) {
        cy.get('#archivo').select(3);
        cy.get('button').contains('Generar grafica').click();
        cy.wait(5000);
        
        // Verificar si se cargó la gráfica
        cy.get('body').then(($body) => {
          if ($body.find('.plotly-graph-fixed, .animation-controls').length > 0) {
            cy.log('✅ Gráfica cargada - probando controles básicos');
            // Probar play/pause si están disponibles
            if ($body.find('.pi-play').length > 0) {
              cy.get('.pi-play').first().click();
              cy.wait(1000);
              cy.get('.pi-pause').first().click();
            }
          }
        });
      }
    });

    // 9. Logout final
    cy.visit('/');
    cy.get('.icon-btn .pi-sign-out').click();
    cy.url().should('include', '/Inicio-sesi%C3%B3n');
  });
});