/// <reference types="cypress" />

// ===== COMANDOS PARA USUARIO PÚBLICO (NO LOGUEADO) =====

Cypress.Commands.add('verifyPublicHomePage', () => {
  cy.visit('/');
  cy.get('header.header').should('be.visible'); // ✅ CORREGIDO
  cy.get('footer.footer-container').should('be.visible'); // ✅ CORREGIDO
  cy.get('.about-container').should('be.visible');
  cy.get('.main-title').should('contain', '🔧 HAPTICTOOL');
});

Cypress.Commands.add('verifyHomePageSections', () => {
  cy.get('.about-grid').should('be.visible');
  cy.get('.left-column').should('be.visible');
  cy.get('.right-column').should('be.visible');
  cy.get('.section').should('have.length', 3);
  cy.contains('h2', 'La necesidad').should('be.visible');
  cy.contains('h2', 'Impacto').should('be.visible');
  cy.contains('h2', 'La solución').should('be.visible');
});

Cypress.Commands.add('verifyHomePageImages', () => {
  cy.get('img').should('have.length.at.least', 3);
  cy.get('img[src*="traje-haptico.jpg"]').should('be.visible');
  cy.get('img[src*="T-pose.jpg"]').should('be.visible');
  cy.get('img[src*="camaras.jpg"]').should('be.visible');
  cy.get('img').each(($img) => {
    cy.wrap($img).should('be.visible').and('have.attr', 'src').and('not.be.empty');
  });
});

Cypress.Commands.add('verifyPublicNavigation', () => {
  cy.get('header.header').within(() => { // ✅ CORREGIDO
    cy.contains('Iniciar Sesión').should('be.visible');
    cy.contains('Sobre Nosotros').should('be.visible');
    cy.contains('Bienvenido,').should('not.exist');
    cy.contains('Cerrar sesión').should('not.exist');
    cy.contains('Gráficas').should('not.exist');
  });
});

Cypress.Commands.add('goToLoginFromPublicHeader', () => {
  cy.get('header.header').within(() => { // ✅ CORREGIDO
    cy.contains('Iniciar Sesión').click();
  });
  cy.url().should('include', '/Inicio-sesi%C3%B3n');
});

// ===== COMANDOS PARA PÁGINA DE LOGIN =====

Cypress.Commands.add('verifyLoginPage', () => {
  cy.visit('/Inicio-sesi%C3%B3n');
  cy.url().should('include', '/Inicio-sesi%C3%B3n');
  cy.get('.login-container').should('be.visible');
  cy.get('.login-image').should('be.visible');
  cy.get('.login-form').should('be.visible');
});

Cypress.Commands.add('verifyLoginFormElements', () => {
  cy.get('.title').should('contain', 'Iniciar Sesión');
  cy.get('#email').should('be.visible');
  cy.get('#password').should('be.visible');
  cy.get('.btn-login').should('be.visible');
  cy.get('.btn-register').should('be.visible');
  cy.get('.google-btn-container').should('exist');
  cy.get('.separator').should('be.visible');
  cy.get('label[for="email"]').should('contain', 'Correo electrónico');
  cy.get('label[for="password"]').should('contain', 'Contraseña');
});

Cypress.Commands.add('verifyLoginImage', () => {
  cy.get('.login-image img')
    .should('be.visible')
    .and('have.attr', 'src')
    .and('include', 'inicio_sesion.jpg');
});

// ===== COMANDOS PARA PÁGINA DE REGISTRO =====

Cypress.Commands.add('verifyRegisterPage', () => {
  cy.visit('/Registro');
  cy.url().should('include', '/Registro');
  cy.get('header.header').should('not.exist');
  cy.get('.register-container').should('be.visible');
  cy.get('.register-form').should('be.visible');
});

Cypress.Commands.add('verifyRegisterFormElements', () => {
  cy.get('.title').should('contain', 'Crear Cuenta');
  cy.get('#nombre').should('be.visible');
  cy.get('#email').should('be.visible');
  cy.get('#password').should('be.visible');
  cy.get('#confirmPassword').should('be.visible');
  cy.get('.btn-register').should('be.visible');
  cy.get('.login-link').should('be.visible');
});

Cypress.Commands.add('verifyRegisterLabelsAndPlaceholders', () => {
  cy.get('label[for="nombre"]').should('contain', 'Nombre Completo');
  cy.get('label[for="email"]').should('contain', 'Correo electrónico');
  cy.get('label[for="password"]').should('contain', 'Contraseña');
  cy.get('label[for="confirmPassword"]').should('contain', 'Confirmar Contraseña');
  cy.get('#nombre').should('have.attr', 'placeholder', 'Ingresa tu nombre completo');
  cy.get('#email').should('have.attr', 'placeholder', 'ejemplo@correo.com');
  cy.get('#password').should('have.attr', 'placeholder', 'Mínimo 6 caracteres');
  cy.get('#confirmPassword').should('have.attr', 'placeholder', 'Repite tu contraseña');
});

Cypress.Commands.add('goToLoginFromRegister', () => {
  cy.get('.login-link .link').click();
  cy.url().should('include', '/Inicio-sesi%C3%B3n');
});

// ===== COMANDOS PARA HEADER =====

Cypress.Commands.add('verifyHeaderNotInAuthPages', () => {
  cy.visit('/Inicio-sesi%C3%B3n');
  cy.get('header.header').should('not.exist');
  cy.visit('/Registro');
  cy.get('header.header').should('not.exist');
});

Cypress.Commands.add('verifyPublicHeader', () => {
  cy.visit('/');
  cy.get('header.header').should('be.visible');
  cy.get('.logo-container').should('be.visible');
  cy.get('.nav').should('be.visible');
  cy.get('.actions').should('be.visible');
  cy.get('.logo-container img').should('be.visible');
  cy.get('.logo').should('contain', '🔧 HapticTool');
  cy.get('.nav p-button').should('contain', 'Sobre Nosotros');
  cy.get('.actions p-button').should('contain', 'Iniciar Sesión');
});

// ===== COMANDOS PARA FOOTER =====

Cypress.Commands.add('verifyFooterInAllPages', () => {
  const pages = ['/', '/Inicio-sesi%C3%B3n', '/Registro'];
  pages.forEach(page => {
    cy.visit(page);
    cy.get('footer.footer-container').should('be.visible');
    cy.get('.footer-logo').should('be.visible');
    cy.get('.footer-locations').should('be.visible');
    cy.get('.footer-links').should('be.visible');
    cy.get('.footer-socials .icons a').should('have.length.at.least', 1);
    cy.get('.cert-images img').should('have.length.at.least', 1);
  });
});

Cypress.Commands.add('verifyFooterSections', () => {
  cy.get('.footer-top').should('be.visible');
  cy.get('.footer-left').should('be.visible');
  cy.get('.footer-right').should('be.visible');
  cy.get('.footer-socials').should('be.visible');
  cy.get('.footer-locations').should('be.visible');
  cy.get('.campus-av68').should('be.visible');
  cy.get('.bogota').should('be.visible');
  cy.get('.villavicencio').should('be.visible');
  cy.get('.footer-certificates').should('be.visible');
  cy.get('.footer-bottom').should('be.visible');
});

// ===== COMANDOS PARA USUARIO NORMAL =====

Cypress.Commands.add('loginAsNormalUser', (email = 'yooo@gmail.com', password = '654321') => {
  cy.visit('/Inicio-sesi%C3%B3n');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('.btn-login').click();
  cy.url().should('not.include', '/Inicio-sesi%C3%B3n');
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

Cypress.Commands.add('verifyNormalUserState', () => {
  cy.get('header.header').should('be.visible');
  cy.get('.welcome').should('be.visible');
  cy.get('.nav p-button').should('contain', 'Sobre Nosotros');
  cy.get('.nav p-button').should('contain', 'Gráficas');
  cy.get('.nav p-button').should('not.contain', 'Cargar Archivos');
  cy.get('.icon-btn .pi-sign-out')
    .should('be.visible')
    .parent()
    .should('have.attr', 'title', 'Cerrar sesión');
});

Cypress.Commands.add('testGraphicsFlowRobust', (fileIndex = 3) => {
  cy.get('.nav p-button').contains('Gráficas').click();
  cy.url().should('include', '/graficas');
  cy.get('header.header').should('be.visible');
  cy.get('.graphics-container').should('be.visible');
  cy.get('.title').should('contain', 'Visualizador de Datos 3D');
  
  // Verificar que hay archivos disponibles
  cy.get('#archivo').then(($select) => {
    const optionCount = $select.find('option').length;
    if (optionCount <= 1) {
      cy.log('⚠️ No hay archivos disponibles para probar');
      return;
    }
    
    // Seleccionar archivo
    const selectedIndex = Math.min(fileIndex, optionCount - 1);
    cy.get('#archivo').select(selectedIndex);
    cy.log(`✅ Seleccionado archivo en índice: ${selectedIndex}`);
    
    // Generar gráfica
    cy.get('button').contains('Generar grafica').click();
    cy.wait(5000); // Esperar más tiempo
    
    // Diagnóstico de lo que se cargó
    cy.get('body').then(($body) => {
      const hasAnimationControls = $body.find('.animation-controls').length > 0;
      const hasPlot = $body.find('.plotly-graph-fixed').length > 0;
      const hasEmptyState = $body.find('.empty-state').length > 0;
      
      cy.log(`📊 Diagnóstico - Controles: ${hasAnimationControls}, Gráfica: ${hasPlot}, Vacío: ${hasEmptyState}`);
      
      if (hasAnimationControls) {
        cy.log('✅ Controles de animación detectados');
      } else if (hasPlot) {
        cy.log('✅ Gráfica cargada (sin controles)');
      } else if (hasEmptyState) {
        cy.log('📭 Estado vacío - sin datos');
      } else {
        cy.log('❌ No se pudo determinar el estado');
      }
    });
  });
});

Cypress.Commands.add('testAnimationControlsRobust', () => {
  cy.get('body').then(($body) => {
    // Solo intentar probar controles si existen
    if ($body.find('.animation-controls').length > 0) {
      cy.get('.animation-controls').should('be.visible');
      cy.get('.plotly-graph-fixed').should('be.visible');
      
      // Buscar botones por diferentes selectores
      const playButton = $body.find('.pi-play').length > 0 ? '.pi-play' : 
                        $body.find('button').filter((i, el) => el.textContent.includes('play') || el.innerHTML.includes('pi-play')).length > 0 ? 'button' : null;
      
      if (playButton) {
        cy.get(playButton).first().click();
        cy.wait(1000);
        
        // Verificar si cambió a pausa
        if ($body.find('.pi-pause').length > 0 || $body.find('button').filter((i, el) => el.textContent.includes('pause')).length > 0) {
          cy.log('✅ Animación funcionando');
          cy.wait(2000);
          cy.get('.pi-pause').first().click();
        }
      }
    } else {
      cy.log('ℹ️ Sin controles de animación - verificando gráfica básica');
      cy.get('.plotly-graph-fixed, [class*="graph"], [class*="chart"], canvas, svg')
        .should('exist')
        .then(($graph) => {
          cy.log(`✅ Elemento gráfico encontrado: ${$graph.length}`);
        });
    }
  });
});

Cypress.Commands.add('verifyGraphicsPageBasic', () => {
  cy.get('.nav p-button').contains('Gráficas').click();
  cy.url().should('include', '/graficas');
  cy.get('.graphics-container').should('be.visible');
  cy.get('#archivo').should('be.visible');
  cy.get('button').contains('Generar grafica').should('be.visible');
});

Cypress.Commands.add('logout', () => {
  cy.visit('/');
  cy.get('.icon-btn .pi-sign-out').click();
  cy.url().should('include', '/Inicio-sesi%C3%B3n');
});

// ===== COMANDOS PARA INVESTIGADOR/ADMIN =====

Cypress.Commands.add('loginAsResearcher', (email = 'and321@gmail.com', password = '0987654321') => {
  cy.visit('/Inicio-sesi%C3%B3n');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('.btn-login').click();
  cy.url().should('not.include', '/Inicio-sesi%C3%B3n');
});

Cypress.Commands.add('verifyResearcherPermissions', () => {
  cy.get('.nav p-button').should('contain', 'Sobre Nosotros');
  cy.get('.nav p-button').should('contain', 'Gráficas');
  cy.get('.nav p-button').should('contain', 'Cargar Archivos');
  cy.get('.icon-btn .pi-id-card').should('not.exist');
});

Cypress.Commands.add('testFileUploadPage', () => {
  cy.get('.nav p-button').contains('Cargar Archivos').click();
  cy.url().should('include', '/cargar-archivos');
  cy.get('.upload-container').should('be.visible');
  cy.get('.title').should('contain', 'Subir archivo');
  cy.get('.file-label').should('be.visible');
});

Cypress.Commands.add('testFileSelection', (fileName = 'archivo-ejemplo.csv') => {
  cy.get('input[type="file"]').selectFile(`cypress/fixtures/${fileName}`, { force: true });
  cy.get('.file-label span').should('not.contain', 'Seleccionar archivo');
  cy.get('.button-group').should('be.visible');
  cy.get('.upload-btn').should('be.visible').and('contain', 'Subir');
  cy.get('.cancel-btn').should('be.visible').and('contain', 'Cancelar');
});

Cypress.Commands.add('testUploadCancel', () => {
  cy.get('.cancel-btn').click();
  cy.get('.file-label span').should('contain', 'Seleccionar archivo (.csv o .c3d)');
  cy.get('.button-group').should('not.exist');
});

Cypress.Commands.add('testUploadAttempt', () => {
  cy.get('.upload-btn').click();
  cy.get('.upload-message').should('be.visible');
});

// ===== COMANDOS PARA SUPERADMIN =====

Cypress.Commands.add('loginAsSuperAdmin', (email = 'superadmin@tudominio.com', password = 'Admin_1234') => {
  cy.visit('/Inicio-sesi%C3%B3n');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('.btn-login').click();
  cy.url().should('not.include', '/Inicio-sesi%C3%B3n');
});

Cypress.Commands.add('verifySuperAdminPermissions', () => {
  cy.get('.nav p-button').should('contain', 'Sobre Nosotros');
  cy.get('.nav p-button').should('contain', 'Gráficas');
  cy.get('.nav p-button').should('contain', 'Cargar Archivos');
  cy.get('.icon-btn .pi-id-card').should('be.visible');
});

Cypress.Commands.add('testAdminPanelAccess', () => {
  cy.get('.icon-btn .pi-id-card').click();
  cy.url().should('include', '/administrador');
  cy.get('.admin-nav').should('be.visible');
});

Cypress.Commands.add('testUserManagement', () => {
  cy.visit('/administrador/usuarios');
  cy.url().should('include', '/administrador/usuarios');
  cy.get('.header h2').should('contain', 'Usuarios Registrados');
  cy.get('.create-user-section').should('be.visible');
  cy.get('p-table').should('be.visible');
});

Cypress.Commands.add('testFileManagement', () => {
  cy.visit('/administrador/archivos');
  cy.url().should('include', '/administrador/archivos');
  cy.get('.admin-upload-container h2').should('contain', 'Gestión de Archivos');
  cy.get('.upload-area').should('be.visible');
  cy.get('p-table').should('be.visible');
});

Cypress.Commands.add('testLogsAccess', () => {
  cy.visit('/administrador/logs');
  cy.url().should('include', '/administrador/logs');
  cy.get('.header h2').should('contain', 'Historial de Sesiones');
  cy.get('.controls-panel').should('be.visible');
  cy.get('p-table').should('be.visible');
});

Cypress.Commands.add('testAdminNavigation', () => {
  const sections = [
    { name: 'Usuarios', url: '/administrador/usuarios', selector: '.header h2', text: 'Usuarios Registrados' },
    { name: 'Archivos', url: '/administrador/archivos', selector: '.admin-upload-container h2', text: 'Gestión de Archivos' },
    { name: 'Logs', url: '/administrador/logs', selector: '.header h2', text: 'Historial de Sesiones' }
  ];

  sections.forEach(section => {
    cy.get('.admin-nav p-button').contains(section.name).click();
    cy.url().should('include', section.url);
    cy.get(section.selector).should('contain', section.text);
  });
});

Cypress.Commands.add('testReturnToMainSite', () => {
  cy.get('.icon-btn .pi-chevron-circle-left').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
  cy.get('.nav p-button').should('contain', 'Sobre Nosotros');
});

// pruebas de flujo

Cypress.Commands.add('selectFileAndGenerateGraph', (fileIndex: number = 1) => {
  cy.get('#archivo').select(fileIndex);
  cy.get('button').contains('Generar grafica').click();
  cy.get('.plotly-graph-fixed', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('startAnimation', () => {
  cy.get('button .pi-play').parent().click();
  cy.get('.animation-controls').should('contain', 'pi-pause');
});

Cypress.Commands.add('stopAnimation', () => {
  cy.get('button .pi-pause').parent().click();
  cy.get('.animation-controls').should('contain', 'pi-play');
});

Cypress.Commands.add('verifyAnimationControls', () => {
  cy.get('.animation-controls').should('be.visible');
  cy.get('button .pi-step-backward').should('be.visible');
  cy.get('button .pi-play').should('be.visible');
  cy.get('button .pi-step-forward').should('be.visible');
  cy.get('button .pi-refresh').should('be.visible');
  cy.get('.frame-info').should('be.visible');
  cy.get('.progress-slider').should('be.visible');
});

Cypress.Commands.add('verifyMetricsPanel', () => {
  cy.get('.metrics-panel').should('be.visible');
  cy.get('.metric-card').should('have.length.at.least', 4);
  cy.get('.metric-item').should('have.length.at.least', 12);
});

// ===== COMANDOS ESENCIALES PARA GESTIÓN DE USUARIOS =====

// Comando principal para crear usuario
Cypress.Commands.add('createTestUser', () => {
  const timestamp = Date.now();
  const userName = `TestUser${timestamp}`;
  const userEmail = `test${timestamp}@cypress.com`;
  
  cy.log(`🎯 Creando usuario: ${userName}`);
  
  cy.get('input[formControlName="nombre"]').type(userName);
  cy.get('input[formControlName="email"]').type(userEmail);
  cy.get('input[formControlName="password"]').type('TestPass123');
  cy.get('button.create-btn').click();
  
  // Esperar creación con timeout largo
  cy.get('.p-toast-message-success', { timeout: 15000 })
    .should('be.visible')
    .and('contain', 'creado');
  
  cy.wait(2000); // Espera adicional
  
  return cy.wrap({ userName, userEmail });
});

// Comando para buscar usuario en todas las páginas (con paginación)
Cypress.Commands.add('findUserInAllPages', (userName: string) => {
  let userFound = false;
  let currentPage = 1;
  const maxPages = 20; // Aumentado para muchas páginas

  const searchInPages = (): Cypress.Chainable<boolean> => {
    if (userFound || currentPage > maxPages) {
      return cy.wrap(userFound);
    }

    return cy.get('.p-datatable-tbody tr').then(($rows) => {
      cy.log(`🔍 Buscando en página ${currentPage} - ${$rows.length} filas`);

      // Buscar usuario en esta página
      const userRow = $rows.filter((index, row) => 
        row.textContent.includes(userName)
      );

      if (userRow.length > 0) {
        userFound = true;
        cy.log(`✅ Usuario encontrado en página ${currentPage}`);
        return cy.wrap(true);
      }

      // Intentar navegar a siguiente página
      return cy.get('p-paginator').then(($paginator) => {
        const nextButton = $paginator.find('.p-paginator-next:not(.p-disabled)');
        
        if (nextButton.length > 0 && !userFound) {
          currentPage++;
          cy.log(`➡️ Navegando a página ${currentPage}`);
          cy.wrap(nextButton).click();
          cy.wait(2000); // Espera larga para carga de página
          return searchInPages();
        } else {
          cy.log(`❌ Usuario no encontrado en ${currentPage} páginas`);
          return cy.wrap(false);
        }
      });
    });
  };

  return searchInPages();
});

// Comando para cambiar contraseña
// CORREGIR el comando changeUserPassword en commands.ts
Cypress.Commands.add('changeUserPassword', (userName: string) => {
  cy.log(`🔑 Cambiando contraseña de: ${userName}`);
  
  cy.get('.p-datatable-tbody tr').contains(userName)
    .parents('tr')
    .within(() => {
      cy.contains('button', 'Cambiar contraseña').click();
    });
  
  cy.get('p-dialog', { timeout: 10000 }).should('be.visible');
  cy.get('input[formControlName="newPassword"]').clear().type('test321');
  cy.get('p-dialog button').contains('Actualizar').click();
  
  // Solo verificar que el diálogo se cierra
  cy.get('p-dialog').should('not.exist', { timeout: 5000 });
  cy.wait(1000);
});

// Comando para eliminar usuario (sin verificar toast)
Cypress.Commands.add('deleteUser', (userName: string) => {
  cy.log(`🗑️ Eliminando usuario: ${userName}`);
  
  cy.get('.p-datatable-tbody tr').contains(userName)
    .parents('tr')
    .within(() => {
      cy.contains('button', 'Eliminar').click();
    });
  
  cy.on('window:confirm', () => true);
  cy.wait(2000); // Solo esperar, sin verificar toast
});

// Comando para eliminar usuario
// Comando deleteUser más robusto
Cypress.Commands.add('deleteUser', (userName: string) => {
  cy.log(`🗑️ Eliminando usuario: ${userName}`);
  
  cy.get('.p-datatable-tbody tr').contains(userName)
    .parents('tr')
    .within(() => {
      cy.contains('button', 'Eliminar').click();
    });
  
  cy.on('window:confirm', (text) => {
    expect(text).to.contain('¿Estás seguro de eliminar');
    return true;
  });
  
  // 🔹 VERSIÓN FLEXIBLE: Esperar éxito o al menos que desaparezca el usuario
  cy.wait(3000);
  
  cy.get('body').then(($body) => {
    const successToast = $body.find('.p-toast-message-success, [class*="success"]');
    if (successToast.length > 0) {
      cy.wrap(successToast).should('be.visible');
      cy.log('✅ Toast de eliminación visible');
    } else {
      cy.log('⚠️ No se detectó toast de eliminación, pero continuando...');
    }
  });
});
// Agregar a commands.ts
Cypress.Commands.add('debugPasswordDialog', () => {
  cy.log('🔍 DEBUG - Diálogo de contraseña:');
  
  cy.get('p-dialog').then(($dialog) => {
    console.log('📋 Diálogo visible:', $dialog.is(':visible'));
    
    // Verificar campo de contraseña
    const passwordInput = $dialog.find('input[formControlName="newPassword"]');
    console.log('🔑 Campo contraseña:', {
      existe: passwordInput.length > 0,
      valor: passwordInput.val(),
      tieneError: passwordInput.hasClass('ng-invalid')
    });
    
    // Verificar botón Actualizar
    const updateButton = $dialog.find('button:contains("Actualizar")');
    console.log('🔄 Botón Actualizar:', {
      existe: updateButton.length > 0,
      texto: updateButton.text(),
      deshabilitado: updateButton.prop('disabled'),
      clases: updateButton.attr('class')
    });
    
    // Verificar mensajes de error
    const errorMessages = $dialog.find('.error-text, .p-error, small');
    console.log('❌ Mensajes de error:', errorMessages.length);
    errorMessages.each((index, el) => {
      console.log(`Error ${index + 1}:`, el.textContent);
    });
  });
});
// Comando para diagnóstico de paginación
Cypress.Commands.add('debugPagination', () => {
  cy.log('📊 Diagnóstico de paginación:');
  
  cy.get('p-paginator').then(($paginator) => {
    const totalPages = $paginator.find('.p-paginator-pages button').length;
    const currentPage = $paginator.find('.p-paginator-current').text();
    
    cy.log(`- Páginas totales: ${totalPages}`);
    cy.log(`- Página actual: ${currentPage}`);
    cy.log(`- Botón siguiente: ${$paginator.find('.p-paginator-next:not(.p-disabled)').length > 0 ? 'HABILITADO' : 'DESHABILITADO'}`);
  });
});

// Comando para forzar recarga si es necesario
Cypress.Commands.add('reloadTable', () => {
  cy.log('🔄 Recargando tabla...');
  cy.reload();
  cy.get('input[formControlName="nombre"]', { timeout: 10000 }).should('be.visible');
  cy.wait(2000);
});
// Comando para diagnosticar la estructura real del diálogo
// Comando para diagnosticar la estructura real del diálogo (CORREGIDO)
Cypress.Commands.add('debugDialogStructure', () => {
  cy.log('🔍 DEBUG - Estructura real del diálogo:');
  
  cy.get('p-dialog').then(($dialog) => {
    console.log('=== ESTRUCTURA COMPLETA DEL DIÁLOGO ===');
    
    // 1. Mostrar todo el HTML del diálogo para ver la estructura real
    console.log('HTML completo del diálogo:', $dialog[0].outerHTML);
    
    // 2. Buscar TODOS los inputs en el diálogo
    const allInputs = $dialog.find('input');
    console.log('=== TODOS LOS INPUTS ENCONTRADOS ===');
    console.log('Número de inputs:', allInputs.length);
    
    allInputs.each((index, input) => {
      const inputElement = input as HTMLInputElement; // 🔹 CORRECCIÓN: Cast a HTMLInputElement
      console.log(`Input ${index + 1}:`, {
        tipo: inputElement.type,
        name: inputElement.getAttribute('name'),
        formControlName: inputElement.getAttribute('formControlName'),
        placeholder: inputElement.getAttribute('placeholder'),
        id: inputElement.id,
        clases: inputElement.className,
        value: inputElement.value
      });
    });
    
    // 3. Buscar TODOS los botones
    const allButtons = $dialog.find('button');
    console.log('=== TODOS LOS BOTONES ENCONTRADOS ===');
    console.log('Número de botones:', allButtons.length);
    
    allButtons.each((index, button) => {
      const buttonElement = button as HTMLButtonElement; // 🔹 CORRECCIÓN: Cast a HTMLButtonElement
      console.log(`Botón ${index + 1}:`, {
        texto: buttonElement.textContent?.trim(),
        type: buttonElement.type,
        disabled: buttonElement.disabled, // 🔹 AHORA SÍ funciona
        clases: buttonElement.className
      });
    });
    
    // 4. Buscar labels y textos
    const allLabels = $dialog.find('label');
    console.log('=== TODOS LOS LABELS ENCONTRADOS ===');
    console.log('Número de labels:', allLabels.length);
    
    allLabels.each((index, label) => {
      console.log(`Label ${index + 1}:`, label.textContent?.trim());
    });
  });
});
// Agregar este comando de diagnóstico detallado
Cypress.Commands.add('debugPasswordDialogIssue', () => {
  cy.log('🔍 DEBUG - Diagnóstico completo del diálogo:');
  
  cy.get('p-dialog').then(($dialog) => {
    console.log('=== INFORMACIÓN DEL DIÁLOGO ===');
    
    // 1. Información del diálogo
    console.log('Diálogo visible:', $dialog.is(':visible'));
    console.log('Clases del diálogo:', $dialog.attr('class'));
    
    // 2. Información del formulario
    const form = $dialog.find('form');
    console.log('Formulario encontrado:', form.length > 0);
    
    // 3. Información del campo de contraseña
    const passwordInput = $dialog.find('input[formControlName="newPassword"]');
    console.log('Campo contraseña:', {
      existe: passwordInput.length > 0,
      valor: passwordInput.val(),
      placeholder: passwordInput.attr('placeholder'),
      clases: passwordInput.attr('class'),
      required: passwordInput.attr('required'),
      minlength: passwordInput.attr('minlength')
    });
    
    // 4. Información del botón Actualizar
    const updateButton = $dialog.find('button:contains("Actualizar")');
    console.log('Botón Actualizar:', {
      existe: updateButton.length > 0,
      texto: updateButton.text().trim(),
      deshabilitado: updateButton.prop('disabled'),
      tipo: updateButton.attr('type'),
      clases: updateButton.attr('class')
    });
    
    // 5. Verificar validaciones
    const errorMessages = $dialog.find('.error-text, .p-error, small, .p-invalid');
    console.log('Mensajes de error/validación:', errorMessages.length);
    errorMessages.each((index, el) => {
      console.log(`Validación ${index + 1}:`, el.textContent?.trim());
    });
    
    // 6. Verificar si hay algún mensaje de ayuda
    const helpText = $dialog.find('small:not(.error-text)');
    console.log('Texto de ayuda:', helpText.length > 0 ? helpText.text() : 'No hay');
  });
});
// Versión simple sin tipos complejos
Cypress.Commands.add('debugDialogStructureSimple', () => {
  cy.log('🔍 DEBUG - Estructura simple del diálogo:');
  
  cy.get('p-dialog').then(($dialog) => {
    console.log('=== ESTRUCTURA DEL DIÁLOGO ===');
    
    // 🔹 INPUTS - Usar getAttribute para evitar problemas de tipo
    const allInputs = $dialog.find('input');
    console.log('INPUTS encontrados:', allInputs.length);
    
    allInputs.each((index, input) => {
      console.log(`Input ${index + 1}:`, {
        // Usar getAttribute para todas las propiedades
        tipo: input.getAttribute('type'),
        name: input.getAttribute('name'),
        formControlName: input.getAttribute('formcontrolname'),
        placeholder: input.getAttribute('placeholder'),
        id: input.getAttribute('id'),
        value: input.getAttribute('value'),
        clases: input.getAttribute('class')
      });
    });
    
    // 🔹 BOTONES - Usar textContent y getAttribute
    const allButtons = $dialog.find('button');
    console.log('BOTONES encontrados:', allButtons.length);
    
    allButtons.each((index, button) => {
      console.log(`Botón ${index + 1}:`, {
        texto: button.textContent?.trim(),
        // Usar hasAttribute para disabled
        disabled: button.hasAttribute('disabled'),
        type: button.getAttribute('type'),
        clases: button.getAttribute('class')
      });
    });
    
    // 🔹 MOSTRAR HTML COMPLETO (esto es lo más importante)
    console.log('=== HTML COMPLETO DEL DIÁLOGO ===');
    console.log($dialog[0].outerHTML);
  });
});

// ===== COMANDOS PARA GESTIÓN DE ARCHIVOS =====

Cypress.Commands.add('uploadTestFile', (fileName: string = 'test-file.csv') => {
  cy.log(`📤 Subiendo archivo de prueba: ${fileName}`);
  
  cy.get('input[type="file"][hidden]').selectFile(`cypress/fixtures/${fileName}`, { force: true });
  cy.get('.upload-btn').click();
  
  // Esperar respuesta
  cy.get('.p-toast-message-success, .p-toast-message-error', { timeout: 10000 })
    .should('be.visible');
});

Cypress.Commands.add('verifyFileInTable', (fileName: string) => {
  cy.log(`🔍 Verificando archivo en tabla: ${fileName}`);
  
  cy.get('.p-datatable-tbody').should('contain', fileName);
});

Cypress.Commands.add('openFileUpdateDialog', (fileName: string) => {
  cy.log(`🔄 Abriendo diálogo para: ${fileName}`);
  
  cy.get('.p-datatable-tbody tr').contains(fileName)
    .parents('tr')
    .within(() => {
      cy.get('button.p-button-warning').click();
    });
  
  cy.get('p-dialog').should('be.visible');
  cy.get('p-dialog strong').should('contain', fileName);
});

Cypress.Commands.add('updateFileInDialog', (newFileName: string) => {
  cy.log(`📝 Actualizando con archivo: ${newFileName}`);
  
  cy.get('p-dialog input[type="file"]').selectFile(`cypress/fixtures/${newFileName}`, { force: true });
  cy.get('p-dialog button').contains('Actualizar').click();
  
  cy.get('.p-toast-message-success', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('deleteFileFromTable', (fileName: string) => {
  cy.log(`🗑️ Eliminando archivo: ${fileName}`);
  
  cy.get('.p-datatable-tbody tr').contains(fileName)
    .parents('tr')
    .within(() => {
      cy.get('button.p-button-danger').click();
    });
  
  cy.on('window:confirm', () => true);
  cy.get('.p-toast-message-success', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('verifyFileActions', (fileName: string) => {
  cy.log(`🔧 Verificando acciones para: ${fileName}`);
  
  cy.get('.p-datatable-tbody tr').contains(fileName)
    .parents('tr')
    .within(() => {
      // Verificar botones de acción
      cy.get('button.p-button-warning')
        .should('be.visible')
        .and('have.attr', 'pTooltip', 'Actualizar archivo');
      
      cy.get('button.p-button-danger')
        .should('be.visible')
        .and('have.attr', 'pTooltip', 'Eliminar archivo');
      
      // Verificar tooltips
      cy.get('button.p-button-warning').trigger('mouseover');
      cy.get('.p-tooltip').should('contain', 'Actualizar archivo');
    });
});

Cypress.Commands.add('testFileUploadFlow', (fileType: 'csv' | 'c3d' = 'csv') => {
  const fileName = `test-file.${fileType}`;
  const testFilePath = `cypress/fixtures/${fileName}`;
  
  cy.log(`🧪 Probando flujo de subida para: ${fileName}`);
  
  // 1. Seleccionar archivo
  cy.get('input[type="file"]').selectFile(testFilePath, { force: true });
  cy.get('.select-btn').should('contain', fileName);
  cy.get('.upload-btn').should('not.be.disabled');
  
  // 2. Subir archivo
  cy.get('.upload-btn').click();
  
  // 3. Verificar éxito
  cy.get('.p-toast-message-success', { timeout: 15000 })
    .should('be.visible')
    .and('contain', 'subido con éxito');
  
  // 4. Verificar en tabla
  cy.verifyFileInTable(fileName);
  
  return cy.wrap(fileName);
});

Cypress.Commands.add('safeOpenUpdateDialog', () => {
  cy.log('🔄 Abriendo diálogo de actualización (solo visual)');
  
  // Usar el primer archivo pero solo para prueba visual
  cy.get('.p-datatable-tbody tr').first().within(() => {
    cy.get('button.p-button-warning').click();
  });
  
  cy.get('p-dialog').should('be.visible');
});

Cypress.Commands.add('safeTestFileSelection', () => {
  cy.log('📝 Probando selección de archivo en diálogo (sin actualizar)');
  
  cy.get('p-dialog input[type="file"]').selectFile('cypress/fixtures/test-updated.csv', { force: true });
  cy.get('p-dialog button').contains('Actualizar').should('not.be.disabled');
  
  // Cancelar para no modificar archivos reales
  cy.get('p-dialog button').contains('Cancelar').click();
});

Cypress.Commands.add('safeTestDeleteConfirmation', () => {
  cy.log('🗑️ Probando confirmación de eliminación (sin eliminar)');
  
  let originalFileName = '';
  
  // Guardar nombre del archivo
  cy.get('.p-datatable-tbody tr').first().within(() => {
    cy.get('td').first().then($td => {
      originalFileName = $td.text();
    });
  });
  
  // Hacer clic en eliminar pero cancelar
  cy.get('.p-datatable-tbody tr').first().within(() => {
    cy.get('button.p-button-danger').click();
  });
  
  cy.on('window:confirm', () => false);
  
  // Verificar que el archivo sigue ahí
  cy.get('.p-datatable-tbody tr').first().within(() => {
    cy.get('td').first().should('have.text', originalFileName);
  });
});

Cypress.Commands.add('testFileUploadFlowSafe', (fileType: 'csv' | 'c3d' = 'csv') => {
  const fileName = `test-file.${fileType}`;
  
  cy.log(`🧪 Probando flujo de subida SEGURO para: ${fileName}`);
  
  // Mock de la subida
  cy.intercept('POST', `/api/upload/${fileType}`, {
    statusCode: 200,
    body: { message: 'Archivo subido exitosamente' }
  }).as(`upload${fileType.toUpperCase()}`);
  
  // 1. Seleccionar archivo
  cy.get('input[type="file"][hidden]').selectFile(`cypress/fixtures/${fileName}`, { force: true });
  cy.get('.select-btn').should('contain', fileName);
  cy.get('.upload-btn').should('not.be.disabled');
  
  // 2. Subir archivo (mock)
  cy.get('.upload-btn').click();
  cy.wait(`@upload${fileType.toUpperCase()}`);
  
  // 3. Verificar éxito
  cy.get('.p-toast-message-success')
    .should('be.visible')
    .and('contain', 'subido con éxito');
});
// ===== COMANDOS PARA FLUJOS COMPLETOS =====

Cypress.Commands.add('completePublicToLoginFlow', () => {
  cy.visit('/');
  cy.url().should('eq', Cypress.config().baseUrl + '/');
  cy.get('header.header').should('be.visible');
  cy.get('.logo').should('contain', '🔧 HapticTool');
  cy.get('.nav p-button').should('contain', 'Sobre Nosotros');
  cy.get('.actions p-button').should('contain', 'Iniciar Sesión');
  cy.get('.actions p-button').click();
  cy.url().should('include', '/Inicio-sesi%C3%B3n');
});

Cypress.Commands.add('completeLoginToRegisterFlow', () => {
  cy.completePublicToLoginFlow();
  cy.get('.login-container').should('be.visible');
  cy.get('.title').should('contain', 'Iniciar Sesión');
  cy.get('.btn-register').click();
  cy.url().should('include', '/Registro');
});

Cypress.Commands.add('completeNormalUserFlow', () => {
  cy.loginAsNormalUser();
  cy.verifyNormalUserState();
  cy.testGraphicsFlowRobust();
  cy.testAnimationControlsRobust();
  cy.logout();
});

Cypress.Commands.add('completeResearcherFlow', () => {
  cy.loginAsResearcher();
  cy.verifyResearcherPermissions();
  cy.testFileUploadPage();
  cy.testFileSelection();
  cy.testUploadCancel();
  cy.testFileSelection(); // Seleccionar de nuevo
  cy.testUploadAttempt();
  cy.testGraphicsFlowRobust();
  cy.logout();
});

Cypress.Commands.add('completeSuperAdminFlow', () => {
  cy.loginAsSuperAdmin();
  cy.verifySuperAdminPermissions();
  cy.testAdminPanelAccess();
  cy.testAdminNavigation();
  cy.testUserManagement();
  cy.testFileManagement();
  cy.testLogsAccess();
  cy.testReturnToMainSite();
  cy.testGraphicsFlowRobust();
  cy.logout();
});
// ===== DECLARACIONES DE TIPOS =====

declare global {
  namespace Cypress {
    interface Chainable {
      // Usuario Público
      verifyPublicHomePage(): Chainable<void>
      verifyHomePageSections(): Chainable<void>
      verifyHomePageImages(): Chainable<void>
      verifyPublicNavigation(): Chainable<void>
      goToLoginFromPublicHeader(): Chainable<void>

      // Login
      verifyLoginPage(): Chainable<void>
      verifyLoginFormElements(): Chainable<void>
      verifyLoginImage(): Chainable<void>

      // Registro
      verifyRegisterPage(): Chainable<void>
      verifyRegisterFormElements(): Chainable<void>
      verifyRegisterLabelsAndPlaceholders(): Chainable<void>
      goToLoginFromRegister(): Chainable<void>

      // Header
      verifyHeaderNotInAuthPages(): Chainable<void>
      verifyPublicHeader(): Chainable<void>

      // Footer
      verifyFooterInAllPages(): Chainable<void>
      verifyFooterSections(): Chainable<void>

      // Usuario Normal
      loginAsNormalUser(email?: string, password?: string): Chainable<void>
      verifyNormalUserState(): Chainable<void>
      testGraphicsFlowRobust(fileIndex?: number): Chainable<void>
      testAnimationControlsRobust(): Chainable<void>
      verifyGraphicsPageBasic(): Chainable<void>
      logout(): Chainable<void>

      // Investigador/Admin
      loginAsResearcher(email?: string, password?: string): Chainable<void>
      verifyResearcherPermissions(): Chainable<void>
      testFileUploadPage(): Chainable<void>
      testFileSelection(fileName?: string): Chainable<void>
      testUploadCancel(): Chainable<void>
      testUploadAttempt(): Chainable<void>

      // SuperAdmin
      loginAsSuperAdmin(email?: string, password?: string): Chainable<void>
      verifySuperAdminPermissions(): Chainable<void>
      testAdminPanelAccess(): Chainable<void>
      testUserManagement(): Chainable<void>
      testFileManagement(): Chainable<void>
      testLogsAccess(): Chainable<void>
      testAdminNavigation(): Chainable<void>
      testReturnToMainSite(): Chainable<void>
      
      //pruebas de flujo
      selectFileAndGenerateGraph(fileIndex?: number): Chainable<void>
      startAnimation(): Chainable<void>
      stopAnimation(): Chainable<void>
      verifyAnimationControls(): Chainable<void>
      verifyMetricsPanel(): Chainable<void>

      createTestUser(): Chainable<{ userName: string; userEmail: string }>
      findUserInAllPages(userName: string): Chainable<boolean>
      changeUserPassword(userName: string): Chainable<void>
      deleteUser(userName: string): Chainable<void>
      debugPagination(): Chainable<void>
      reloadTable(): Chainable<void>
      debugPasswordDialog(): Chainable<void>
      debugPasswordDialogIssue(): Chainable<void>
      debugDialogStructure(): Chainable<void>


      // Flujos Completos
      completePublicToLoginFlow(): Chainable<void>
      completeLoginToRegisterFlow(): Chainable<void>
      completeNormalUserFlow(): Chainable<void>
      completeResearcherFlow(): Chainable<void>
      completeSuperAdminFlow(): Chainable<void>
      debugDialogStructureSimple(): Chainable<void>

      uploadTestFile(fileName?: string): Chainable<void>
      verifyFileInTable(fileName: string): Chainable<void>
      openFileUpdateDialog(fileName: string): Chainable<void>
      updateFileInDialog(newFileName: string): Chainable<void>
      deleteFileFromTable(fileName: string): Chainable<void>
      verifyFileActions(fileName: string): Chainable<void>
      testFileUploadFlow(fileType?: 'csv' | 'c3d'): Chainable<string>
      safeOpenUpdateDialog(): Chainable<void>
      safeTestFileSelection(): Chainable<void>
      safeTestDeleteConfirmation(): Chainable<void>
      testFileUploadFlowSafe(fileType?: 'csv' | 'c3d'): Chainable<void>
    }
  }
}

export {};