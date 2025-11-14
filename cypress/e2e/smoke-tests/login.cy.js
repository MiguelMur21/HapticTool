describe('Pruebas de Humo - Login y Header', () => {
  describe('Flujo Completo - Página Principal a Login', () => {
    it('Debe navegar desde página principal al login mediante el header', () => {
      // 1. Ir a la página principal
      cy.visit('/');
      
      // 2. Verificar que estamos en la página principal
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // 3. Verificar header en página principal
      cy.get('header.header').should('be.visible');
      cy.get('.logo-container').should('be.visible');
      cy.get('.logo').should('contain', '🔧 HapticTool');
      
      // 4. Verificar navegación para usuario no logueado
      cy.get('.nav p-button').should('contain', 'Sobre Nosotros');
      cy.get('.actions p-button').should('contain', 'Iniciar Sesión');
      
      // 5. Hacer clic en "Iniciar Sesión" del header
      cy.get('.actions p-button').click();
      
        // 🎯 SOLUCIÓN: Usar la URL codificada que Cypress ve
        cy.url().should('include', '/Inicio-sesi%C3%B3n');
    });
  });

  describe('Página de Login - Elementos Críticos', () => {
    beforeEach(() => {
      // Ir directamente al login para las pruebas específicas
      cy.visit('/Inicio-sesi%C3%B3n');
    });

    it('Debe cargar la página de login', () => {
      cy.url().should('include', '/Inicio-sesi%C3%B3n');
    });

    it('Debe mostrar todos los elementos del contenedor principal', () => {
      cy.get('.login-container').should('be.visible');
      cy.get('.login-image').should('be.visible');
      cy.get('.login-form').should('be.visible');
    });

    it('Debe tener la imagen de login', () => {
      cy.get('.login-image img')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('include', 'inicio_sesion.jpg');
    });

    it('Debe mostrar el formulario con todos los elementos', () => {
      cy.get('.title').should('contain', 'Iniciar Sesión');
      cy.get('#email').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('.btn-login').should('be.visible');
      cy.get('.btn-register').should('be.visible');
      cy.get('.google-btn-container').should('exist');
      cy.get('.separator').should('be.visible');
    });

    it('Debe tener las etiquetas de los campos', () => {
      cy.get('label[for="email"]').should('contain', 'Correo electrónico');
      cy.get('label[for="password"]').should('contain', 'Contraseña');
    });
  });

  describe('Header - Elementos Críticos', () => {
    it('No debe mostrar header en la página de login', () => {
      cy.visit('/Inicio-sesi%C3%B3n');
      cy.get('header.header').should('not.exist');
    });

    it('Debe mostrar header básico en página principal sin login', () => {
      cy.visit('/');
      cy.get('header.header').should('be.visible');
      cy.get('.logo-container').should('be.visible');
      cy.get('.nav').should('be.visible');
      cy.get('.actions').should('be.visible');
    });

    it('Debe mostrar elementos del logo', () => {
      cy.visit('/');
      cy.get('.logo-container img').should('be.visible');
      cy.get('.logo').should('contain', '🔧 HapticTool');
    });

    it('Debe mostrar navegación básica para usuarios no logueados', () => {
      cy.visit('/');
      cy.get('.nav p-button').should('contain', 'Sobre Nosotros');
      cy.get('.actions p-button').should('contain', 'Iniciar Sesión');
    });
  });

  describe('Footer - Elementos Críticos', () => {
    it('Debe mostrar el footer en el login', () => {
      cy.visit('/');
      cy.get('footer.footer-container').should('be.visible');
    });

    it('Debe mostrar el footer en página de login', () => {
      cy.visit('/Inicio-sesi%C3%B3n');
      cy.get('footer.footer-container').should('be.visible');
    });

    it('Debe tener la sección superior del footer', () => {
      cy.visit('/Inicio-sesi%C3%B3n');
      cy.get('.footer-top').should('be.visible');
      cy.get('.footer-left').should('be.visible');
      cy.get('.footer-right').should('be.visible');
    });

    it('Debe mostrar el logo de la universidad', () => {
    cy.visit('/Inicio-sesi%C3%B3n');
      cy.get('.footer-logo').should('be.visible');
    });

    it('Debe tener enlaces sociales', () => {
      cy.visit('/Inicio-sesi%C3%B3n');
      cy.get('.footer-socials').should('be.visible');
      cy.get('.footer-socials .icons a').should('have.length.at.least', 1);
    });

    it('Debe mostrar ubicaciones de campus', () => {
      cy.visit('/Inicio-sesi%C3%B3n');
      cy.get('.footer-locations').should('be.visible');
      cy.get('.campus-av68').should('be.visible');
      cy.get('.bogota').should('be.visible');
      cy.get('.villavicencio').should('be.visible');
    });

    it('Debe tener certificados de calidad', () => {
      cy.visit('/Inicio-sesi%C3%B3n');
      cy.get('.footer-certificates').should('be.visible');
      cy.get('.cert-images img').should('have.length.at.least', 1);
    });

    it('Debe mostrar sección inferior con enlaces importantes', () => {
      cy.visit('/Inicio-sesi%C3%B3n');
      cy.get('.footer-bottom').should('be.visible');
      cy.get('.footer-links').should('be.visible');
      cy.get('.footer-links a').should('have.length.at.least', 3);
    });
  });

  describe('Elementos de Navegación Básica', () => {
    it('Debe poder navegar a registro desde login', () => {
      cy.visit('/Inicio-sesi%C3%B3n');
      cy.get('.btn-register').should('be.visible');
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
});