describe('VALIDACIÓN DE FORMULARIOS - Enfocado en lo Confiable', () => {
  
  describe('Formulario de Registro - Validaciones Confiables', () => {
    beforeEach(() => {
      cy.visit('/Registro');
    });

    it('debe validar que todos los campos son obligatorios', () => {
      cy.get('.btn-register').click();
      cy.get('.alert.alert-error')
        .should('exist')
        .and('contain', 'Todos los campos son obligatorios');
    });

    it('debe validar coincidencia de contraseñas', () => {
      cy.get('#nombre').type('Usuario Test');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('123456');
      cy.get('#confirmPassword').type('654321');
      cy.get('.btn-register').click();
      
      cy.get('.alert.alert-error')
        .should('exist')
        .and('contain', 'Las contraseñas no coinciden');
    });

    it('debe validar longitud mínima de contraseña', () => {
      cy.get('#nombre').type('Usuario Test');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('123');
      cy.get('#confirmPassword').type('123');
      cy.get('.btn-register').click();
      
      cy.get('.alert.alert-error')
        .should('exist')
        .and('contain', 'La contraseña debe tener al menos 6 caracteres');
    });

    it('debe mostrar loading durante el registro', () => {
      cy.get('#nombre').type('Usuario Test');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('123456');
      cy.get('#confirmPassword').type('123456');
      
      cy.intercept('POST', '**/register**', {
        delay: 2000,
        statusCode: 200,
        body: { message: 'Usuario registrado' }
      }).as('registerRequest');
      
      cy.get('.btn-register').click();
      cy.get('.btn-register').should('contain', 'Registrando...');
      cy.get('.btn-register').should('be.disabled');
    });
  });

  describe('Formulario de Login - Validaciones Confiables', () => {
    beforeEach(() => {
      cy.visit('/Inicio-sesi%C3%B3n');
    });

    it('debe validar campos requeridos en login', () => {
      cy.get('.btn-login').should('be.disabled');
      cy.get('#email').type('test@example.com');
      cy.get('.btn-login').should('be.disabled');
      cy.get('#password').type('123456');
      cy.get('.btn-login').should('not.be.disabled');
    });

    it('debe permitir login con credenciales válidas', () => {
      cy.get('#email').type('yooo@gmail.com');
      cy.get('#password').type('654321');
      cy.get('.btn-login').click();
      
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.get('.welcome').should('be.visible');
      cy.get('.icon-btn .pi-sign-out').should('be.visible');
    });

    
  });

  describe('Formularios de Archivos - Validaciones Confiables', () => {
    beforeEach(() => {
      cy.loginAsResearcher();
      cy.visit('/cargar-archivos');
    });

    it('debe permitir archivos CSV válidos', () => {
      cy.get('input[type="file"]').selectFile('cypress/fixtures/test-file.csv', { force: true });
      cy.get('.file-label span').should('contain', 'test-file.csv');
    });

    it('debe permitir archivos C3D válidos', () => {
      cy.get('input[type="file"]').selectFile('cypress/fixtures/test-file.c3d', { force: true });
      cy.get('.file-label span').should('contain', 'test-file.c3d');
    });


  });

  describe('Flujo de Registro Exitoso - Mockeado', () => {
    it('debe mostrar flujo de registro con mocks', () => {
      cy.visit('/Registro');
      
      const timestamp = Date.now();
      const testUser = {
        nombre: `Test User ${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: '123456'
      };

      // Mock exitoso
      cy.intercept('POST', '**/register**', {
        statusCode: 200,
        body: { message: 'Usuario registrado exitosamente' }
      }).as('register');

      cy.intercept('POST', '**/login**', {
        statusCode: 200,
        body: { token: 'fake-token', user: testUser }
      }).as('login');

      cy.get('#nombre').type(testUser.nombre);
      cy.get('#email').type(testUser.email);
      cy.get('#password').type(testUser.password);
      cy.get('#confirmPassword').type(testUser.password);
      
      cy.get('.btn-register').click();

      // Verificar que muestra mensaje de éxito
      cy.get('.alert.alert-success')
        .should('exist')
        .and('contain', 'Registro exitoso');
    });
  });
});

