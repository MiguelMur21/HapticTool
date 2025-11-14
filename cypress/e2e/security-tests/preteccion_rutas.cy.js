describe('SEGURIDAD BÁSICA - Con Rutas Corregidas', () => {
  
  describe('Protección CORRECTA de rutas', () => {
    
    it('usuario normal NO puede acceder a cargar-archivos', () => {
      cy.loginAsNormalUser();
      
      // Debe ser REDIRIGIDO por el AuthGuard
      cy.visit('/cargar-archivos');
      cy.url().should('not.include', '/cargar-archivos');
      cy.log('✅ AuthGuard protege cargar-archivos de usuario normal');
    });

    it('investigador (admin) SÍ puede acceder a cargar-archivos', () => {
      cy.loginAsResearcher();
      
      cy.visit('/cargar-archivos');
      cy.url().should('include', '/cargar-archivos');
      cy.get('.upload-container').should('be.visible');
      cy.log('✅ Investigador puede cargar archivos');
    });

    it('superadmin SÍ puede acceder a cargar-archivos', () => {
      cy.loginAsSuperAdmin();
      
      cy.visit('/cargar-archivos');
      cy.url().should('include', '/cargar-archivos');
      cy.get('.upload-container').should('be.visible');
      cy.log('✅ SuperAdmin puede cargar archivos');
    });

    it('usuario normal NO puede acceder a panel superadmin', () => {
      cy.loginAsNormalUser();
      
      cy.visit('/administrador/usuarios');
      cy.url().should('not.include', '/administrador');
      cy.log('✅ Usuario normal bloqueado en panel superadmin');
    });

    it('investigador NO puede acceder a panel superadmin', () => {
      cy.loginAsResearcher();
      
      cy.visit('/administrador/usuarios');
      cy.url().should('not.include', '/administrador');
      cy.log('✅ Investigador bloqueado en panel superadmin');
    });

    it('superadmin SÍ puede acceder a panel completo', () => {
      cy.loginAsSuperAdmin();
      
      const adminRoutes = [
        '/administrador/usuarios',
        '/administrador/archivos',
        '/administrador/logs'
      ];
      
      adminRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', route);
        cy.log(`✅ SuperAdmin accede a: ${route}`);
      });
    });
  });

  describe('Navegación UI consistente', () => {
    
    it('usuario normal solo ve "Gráficas"', () => {
      cy.loginAsNormalUser();
      cy.visit('/');
      
      cy.get('.nav').should('contain', 'Gráficas');
      cy.get('.nav').should('not.contain', 'Cargar Archivos');
      cy.get('.icon-btn .pi-id-card').should('not.exist');
    });

    it('investigador ve "Gráficas" y "Cargar Archivos"', () => {
      cy.loginAsResearcher();
      cy.visit('/');
      
      cy.get('.nav').should('contain', 'Gráficas');
      cy.get('.nav').should('contain', 'Cargar Archivos');
      cy.get('.icon-btn .pi-id-card').should('not.exist');
    });

    it('superadmin ve TODAS las opciones', () => {
      cy.loginAsSuperAdmin();
      cy.visit('/');
      
      cy.get('.nav').should('contain', 'Gráficas');
      cy.get('.nav').should('contain', 'Cargar Archivos');
      cy.get('.icon-btn .pi-id-card').should('be.visible');
    });
  });
});