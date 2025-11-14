describe('Prueba Lineal - Usuario Normal (Robusta)', () => {
  it('Flujo completo con manejo de diferentes escenarios', () => {
    // 1. Login
    cy.loginAsNormalUser();
    
    // 2. Verificar estado básico
    cy.verifyNormalUserState();
    
    // 3. Verificar permisos RESTRINGIDOS - Solo debe ver 2 opciones
    cy.get('.nav p-button').should('have.length', 2); // Solo Sobre Nosotros y Gráficas
    cy.get('.nav p-button').should('contain', 'Sobre Nosotros');
    cy.get('.nav p-button').should('contain', 'Gráficas');
    cy.get('.nav p-button').should('not.contain', 'Cargar Archivos');
    
    // 4. Verificar que NO tiene botones de administración
    cy.get('.icon-btn .pi-id-card').should('not.exist'); // No botón de admin
    cy.get('.admin-nav').should('not.exist'); // No navegación de admin
    
    // 5. Probar acceso a gráficas
    cy.verifyGraphicsPageBasic();
    
    // 6. Intentar flujo de gráficas completo
    cy.get('#archivo').then(($select) => {
      const availableFiles = $select.find('option').length - 1;
      
      if (availableFiles > 0) {
        cy.log(`📁 Archivos disponibles: ${availableFiles}`);
        cy.testGraphicsFlowRobust(3);
        cy.testAnimationControlsRobust();
      } else {
        cy.log('⚠️ No hay archivos para probar gráficas, continuando...');
      }
    });
    
    // 7. Logout
    cy.logout();
  });
});