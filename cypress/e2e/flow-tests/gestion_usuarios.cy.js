/// <reference types="cypress" />

describe('Diagnóstico del Problema del Diálogo', () => {
  beforeEach(() => {
    cy.loginAsSuperAdmin();
    cy.visit('/administrador/usuarios');
    cy.get('input[formControlName="nombre"]', { timeout: 10000 }).should('be.visible');
  });

  it('diagnóstico completo del problema del diálogo', () => {
    // 🔹 CREAR USUARIO
    cy.createTestUser().then((userData) => {
      const { userName } = userData;

      // 🔹 BUSCAR USUARIO
      cy.findUserInAllPages(userName).then((found) => {
        if (found) {
          cy.log(`🔍 Iniciando diagnóstico con usuario: ${userName}`);

          // 🔹 PASO 1: ABRIR DIÁLOGO
          cy.get('.p-datatable-tbody tr').contains(userName)
            .parents('tr')
            .within(() => {
              cy.contains('button', 'Cambiar contraseña').click();
            });

          cy.get('p-dialog', { timeout: 10000 }).should('be.visible');
          
          // 🔹 PASO 2: DIAGNÓSTICO ANTES DE LLENAR
          cy.log('=== DIAGNÓSTICO INICIAL ===');
          cy.debugPasswordDialogIssue();
          
          // 🔹 PASO 3: PROBAR DIFERENTES CONTRASEÑAS
          const testPasswords = [
            'test321',           // contraseña simple
            'Test321!',          // con mayúscula y símbolo
            'Test123!',          // diferente combinación
            '123456',            // solo números
            'abcdef'             // solo letras
          ];
          
          testPasswords.forEach((password, index) => {
            cy.log(`🔄 Probando contraseña ${index + 1}: ${password}`);
            

            
            // Diagnóstico después de cada contraseña
            cy.log(`=== DIAGNÓSTICO CON CONTRASEÑA: ${password} ===`);
            cy.debugPasswordDialogIssue();
            
            // Verificar estado del botón
            cy.get('p-dialog button:contains("Actualizar")').then(($btn) => {
              console.log(`Estado botón con "${password}":`, $btn.prop('disabled') ? 'DESHABILITADO' : 'HABILITADO');
            });
            
            // Solo intentar hacer click si el botón está habilitado
            cy.get('p-dialog button:contains("Actualizar")').then(($btn) => {
              if (!$btn.prop('disabled')) {
                cy.log(`🎯 Intentando enviar con contraseña: ${password}`);
                cy.wrap($btn).click();
                cy.wait(3000);
                
                // Verificar si el diálogo se cerró
                cy.get('body').then(($body) => {
                  if ($body.find('p-dialog').length === 0) {
                    cy.log(`✅ ¡ÉXITO! Diálogo se cerró con contraseña: ${password}`);
                    return;
                  } else {
                    cy.log(`❌ Diálogo sigue abierto con: ${password}`);
                  }
                });
              }
            });
            
            // Si el diálogo sigue abierto, continuar con la siguiente contraseña
            cy.get('p-dialog').should('exist');
          });
          
          // 🔹 LIMPIAR: Cerrar diálogo y eliminar usuario
          cy.log('🧹 Limpiando...');
          cy.get('p-dialog button:contains("Cancelar")').click();
          
          cy.get('.p-datatable-tbody tr').contains(userName)
            .parents('tr')
            .within(() => {
              cy.contains('button', 'Eliminar').click();
            });
          
          cy.on('window:confirm', () => true);
          cy.wait(2000);

        }
      });
    });
  });
});