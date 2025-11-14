/// <reference types="cypress" />

describe('Gestión de Archivos - SuperAdmin', () => {
  beforeEach(() => {
    cy.loginAsSuperAdmin();
    cy.visit('/administrador/archivos');
  });

  describe('Estructura de la página', () => {
    it('debe cargar correctamente la página de gestión de archivos', () => {
      cy.url().should('include', '/administrador/archivos');
      cy.get('.admin-upload-container h2').should('contain', '📁 Gestión de Archivos');
      cy.get('.upload-area').should('be.visible');
    });

    it('debe mostrar todos los elementos de la interfaz', () => {
      // Botones principales
      cy.get('.select-btn').should('be.visible').and('contain', 'Seleccionar archivo');
      cy.get('.upload-btn').should('be.visible').and('contain', 'Subir Archivo');
      cy.get('.upload-btn').should('be.disabled'); // Debe estar deshabilitado inicialmente

      // Input file oculto
      cy.get('input[type="file"]').should('exist').and('have.attr', 'hidden');
      cy.get('input[type="file"]').should('have.attr', 'accept', '.csv,.c3d');

      // Tabla
      cy.get('p-table').should('be.visible');
      cy.get('th').should('have.length', 4);
      cy.contains('th', 'Nombre del archivo');
      cy.contains('th', 'Tipo');
      cy.contains('th', 'Fecha de subida');
      cy.contains('th', 'Acciones');
    });
  });

  describe('Selección de archivos', () => {
    it('debe permitir seleccionar archivos CSV válidos', () => {
      cy.get('input[type="file"]').selectFile('cypress/fixtures/archivo-ejemplo.csv', { force: true });
      
      cy.get('.select-btn').should('contain', 'archivo-ejemplo.csv');
      cy.get('.upload-btn').should('not.be.disabled');
      cy.get('.cancel-btn').should('be.visible');
    });

      it('debe permitir seleccionar archivos C3D válidos', () => {
      cy.get('input[type="file"][hidden]').selectFile('cypress/fixtures/test-file.c3d', { force: true });
      
      cy.get('.select-btn').should('contain', 'test-file.c3d');
      cy.get('.upload-btn').should('not.be.disabled');
      cy.get('.cancel-btn').should('be.visible');
    });

    it('debe rechazar archivos con extensiones no permitidas', () => {
      cy.get('input[type="file"][hidden]').selectFile('cypress/fixtures/invalid-file.txt', { force: true });
      
      // Verificar que se muestra mensaje de error
      cy.get('.p-toast-message-error').should('be.visible')
        .and('contain', '❌ Solo se permiten archivos CSV o C3D');
      
      cy.get('.select-btn').should('contain', 'Seleccionar archivo');
      cy.get('.upload-btn').should('be.disabled');
    });

    it('debe permitir cancelar la selección de archivo', () => {
      cy.get('input[type="file"][hidden]').selectFile('cypress/fixtures/test-file.csv', { force: true });
      
      cy.get('.select-btn').should('contain', 'test-file.csv');
      cy.get('.cancel-btn').click();
      
      cy.get('.select-btn').should('contain', 'Seleccionar archivo');
      cy.get('.upload-btn').should('be.disabled');
      cy.get('.cancel-btn').should('not.exist');
    });
  });

  describe('Gestión de la tabla de archivos existentes', () => {
    it('debe mostrar los archivos existentes en la tabla', () => {
      // Solo verificar que la tabla tiene datos sin interactuar con archivos reales
      cy.get('p-table').should('be.visible');
      cy.get('.p-datatable-tbody tr').should('exist');
      
      // Verificar estructura de las filas sin asumir contenido específico
      cy.get('.p-datatable-tbody tr').first().within(() => {
        cy.get('td').should('have.length', 4);
        cy.get('td').eq(0).should('not.be.empty'); // Nombre
        cy.get('td').eq(3).find('button').should('have.length', 2); // Acciones
      });
    });

        it('debe mostrar badges de tipo correctamente para archivos existentes', () => {
        cy.get('.file-type-badge').should('exist');
        cy.get('.file-type-badge').first().invoke('text').then((text) => {
            // Limpiar espacios en blanco
            const cleanedText = text.trim();
            expect(cleanedText).to.match(/^(CSV|C3D)$/);
        });
        });
    });

  describe('Diálogo de actualización de archivos', () => {
  it('debe abrir el diálogo de actualización al hacer clic en el botón', () => {
    // Abrir diálogo
    cy.get('.p-datatable-tbody tr').first().within(() => {
      cy.get('button.p-button-warning').click();
    });

    // Verificar que está abierto
    cy.get('p-dialog').should('be.visible');
    cy.contains('Actualizar Archivo').should('be.visible');
    
    // Cerrar con el botón Cancelar específico
    cy.get('p-dialog button').contains('Cancelar').click();
    
    // Verificar que se cerró
    cy.contains('Actualizar Archivo').should('not.exist');
  });

  it('debe permitir seleccionar archivo en el diálogo sin actualizar', () => {
    cy.get('.p-datatable-tbody tr').first().within(() => {
      cy.get('button.p-button-warning').click();
    });

    // Seleccionar archivo
    cy.get('p-dialog input[type="file"]').selectFile('cypress/fixtures/test-updated.csv', { force: true });
    
    // Verificar que el botón Actualizar se habilita
    cy.get('p-dialog button').contains('Actualizar').should('not.be.disabled');
    
    // Cancelar sin actualizar
    cy.get('p-dialog button').contains('Cancelar').click();
    
    // Verificar que se cerró
    cy.contains('Actualizar Archivo').should('not.exist');
  });
});

  describe('Eliminación de archivos (solo verificación de confirmación)', () => {
    it('debe mostrar confirmación al intentar eliminar', () => {
      let fileName = '';
      
      // Obtener el nombre del primer archivo para la confirmación
      cy.get('.p-datatable-tbody tr').first().within(() => {
        cy.get('td').first().then($td => {
          fileName = $td.text();
        });
      }).then(() => {
        // Hacer clic en eliminar pero cancelar
        cy.get('.p-datatable-tbody tr').first().within(() => {
          cy.get('button.p-button-danger').click();
        });

        cy.on('window:confirm', (text) => {
          expect(text).to.include(`¿Estás seguro de eliminar el archivo "${fileName}"`);
          expect(text).to.include('Esta acción no se puede deshacer');
          return false; // Cancelar eliminación
        });

        // Verificar que el archivo sigue en la tabla
        cy.get('.p-datatable-tbody tr').first().within(() => {
          cy.get('td').first().should('have.text', fileName);
        });
      });
    });
  });

  describe('Subida de archivos de prueba (NUEVOS archivos)', () => {
    it('debe subir un archivo CSV de prueba correctamente', () => {
      // Interceptar la llamada de subida para evitar modificar datos reales
      cy.intercept('POST', '/api/upload_csv', {
        statusCode: 200,
        body: { message: 'Archivo subido exitosamente' }
      }).as('uploadCSV');

      cy.get('input[type="file"][hidden]').selectFile('cypress/fixtures/test-file.csv', { force: true });
      cy.get('.upload-btn').click();


    });

    it('debe subir un archivo C3D de prueba correctamente', () => {
      cy.intercept('POST', '/api/upload_c3d', {
        statusCode: 200,
        body: { message: 'Archivo subido exitosamente' }
      }).as('uploadC3D');

      cy.get('input[type="file"][hidden]').selectFile('cypress/fixtures/test-file.c3d', { force: true });
      cy.get('.upload-btn').click();


    });
  });
});

