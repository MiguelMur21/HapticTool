describe('Pruebas de Humo - Flujo Completo hasta Registro', () => {
  describe('Flujo Completo - Página Principal → Login → Registro', () => {
    it('Debe navegar desde página principal al login y luego al registro', () => {
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
      
      // 6. Verificar que llegamos a la página de login (con acento en la URL)
      cy.url().should('include', '/Inicio-sesi%C3%B3n');
      
      // 7. Verificar elementos del login
      cy.get('.login-container').should('be.visible');
      cy.get('.title').should('contain', 'Iniciar Sesión');
      
      // 8. Hacer clic en "Registrarse" en el login
      cy.get('.btn-register').click();
      
      // 9. Verificar que llegamos a la página de registro
      cy.url().should('include', '/Registro');
    });
  });

  describe('Página de Registro - Elementos Críticos', () => {
    beforeEach(() => {
      // Ir directamente al registro para las pruebas específicas
      cy.visit('/Registro');
    });

    it('Debe cargar la página de registro', () => {
      cy.url().should('include', '/Registro');
    });

    it('No debe mostrar header en la página de registro', () => {
      cy.get('header.header').should('not.exist');
    });

    it('Debe mostrar todos los elementos del contenedor principal', () => {
      cy.get('.register-container').should('be.visible');
      cy.get('.register-image').should('be.visible');
      cy.get('.register-form').should('be.visible');
    });

    it('Debe tener la imagen de registro', () => {
      cy.get('.register-image img')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('include', 'register.jpg');
    });

    it('Debe mostrar el formulario con todos los elementos', () => {
      cy.get('.title').should('contain', 'Crear Cuenta');
      
      // Campos del formulario
      cy.get('#nombre').should('be.visible');
      cy.get('#email').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('#confirmPassword').should('be.visible');
      
      // Botones y enlaces
      cy.get('.btn-register').should('be.visible');
      cy.get('.login-link').should('be.visible');
    });

    it('Debe tener todas las etiquetas de los campos', () => {
      cy.get('label[for="nombre"]').should('contain', 'Nombre Completo');
      cy.get('label[for="email"]').should('contain', 'Correo electrónico');
      cy.get('label[for="password"]').should('contain', 'Contraseña');
      cy.get('label[for="confirmPassword"]').should('contain', 'Confirmar Contraseña');
    });

    it('Debe tener los placeholders correctos', () => {
      cy.get('#nombre').should('have.attr', 'placeholder', 'Ingresa tu nombre completo');
      cy.get('#email').should('have.attr', 'placeholder', 'ejemplo@correo.com');
      cy.get('#password').should('have.attr', 'placeholder', 'Mínimo 6 caracteres');
      cy.get('#confirmPassword').should('have.attr', 'placeholder', 'Repite tu contraseña');
    });

    it('Debe mostrar el enlace para volver al login', () => {
      cy.get('.login-link')
        .should('be.visible')
        .and('contain', '¿Ya tienes cuenta?');
      
      cy.get('.login-link .link')
        .should('be.visible')
        .and('contain', 'Inicia sesión aquí');
    });

    it('Debe mostrar el botón de registro con texto correcto', () => {
      cy.get('.btn-register')
        .should('be.visible')
        .and('contain', 'Crear Cuenta');
    });
  });

  describe('Footer en Página de Registro', () => {
    beforeEach(() => {
      cy.visit('/Registro');
    });

    it('Debe mostrar el footer en página de registro', () => {
      cy.get('footer.footer-container').should('be.visible');
    });

    it('Debe tener la sección superior del footer', () => {
      cy.get('.footer-top').should('be.visible');
      cy.get('.footer-left').should('be.visible');
      cy.get('.footer-right').should('be.visible');
    });

    it('Debe mostrar el logo de la universidad', () => {
      cy.get('.footer-logo').should('be.visible');
    });

    it('Debe tener enlaces sociales', () => {
      cy.get('.footer-socials').should('be.visible');
      cy.get('.footer-socials .icons a').should('have.length.at.least', 1);
    });

    it('Debe mostrar ubicaciones de campus', () => {
      cy.get('.footer-locations').should('be.visible');
      cy.get('.campus-av68').should('be.visible');
      cy.get('.bogota').should('be.visible');
      cy.get('.villavicencio').should('be.visible');
    });

    it('Debe tener certificados de calidad', () => {
      cy.get('.footer-certificates').should('be.visible');
      cy.get('.cert-images img').should('have.length.at.least', 1);
    });

    it('Debe mostrar sección inferior con enlaces importantes', () => {
      cy.get('.footer-bottom').should('be.visible');
      cy.get('.footer-links').should('be.visible');
      cy.get('.footer-links a').should('have.length.at.least', 3);
    });
  });

  describe('Navegación desde Registro', () => {
    it('Debe poder volver al login desde el registro', () => {
      cy.visit('/Registro');
      
      // Verificar que el enlace de login existe
      cy.get('.login-link .link')
        .should('be.visible')
        .and('contain', 'Inicia sesión aquí');
      
      // Hacer clic en el enlace (esto debería navegar al login)
      cy.get('.login-link .link').click();
      
      // Verificar que llegamos al login
      cy.url().should('include', '/Inicio-sesi%C3%B3n');
    });
  });

  describe('Footer en Todas las Páginas', () => {
    const pages = [
      { path: '/', name: 'página principal' },
      { path: '/Inicio-sesi%C3%B3n', name: 'login' },
      { path: '/Registro', name: 'registro' }
    ];

    pages.forEach(page => {
      it(`Debe mostrar footer en ${page.name}`, () => {
        cy.visit(page.path);
        
        // Elementos críticos del footer
        cy.get('footer.footer-container').should('be.visible');
        cy.get('.footer-logo').should('be.visible');
        cy.get('.footer-locations').should('be.visible');
        cy.get('.footer-links').should('be.visible');
        
        // Enlaces sociales
        cy.get('.footer-socials .icons a').should('have.length.at.least', 1);
        
        // Certificados
        cy.get('.cert-images img').should('have.length.at.least', 1);
      });
    });
  });

  describe('Header en Diferentes Páginas', () => {
    it('Debe mostrar header en página principal', () => {
      cy.visit('/');
      cy.get('header.header').should('be.visible');
    });

    it('No debe mostrar header en login', () => {
      cy.visit('/Inicio-sesi%C3%B3n');
      cy.get('header.header').should('not.exist');
    });

    it('No debe mostrar header en registro', () => {
      cy.visit('/Registro');
      cy.get('header.header').should('not.exist');
    });
  });
});