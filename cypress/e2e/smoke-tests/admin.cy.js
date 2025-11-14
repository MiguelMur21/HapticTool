describe('Smoke Test - Investigador/Admin (Simplificado)', () => {
  it('Flujo completo usando comandos', () => {
    cy.completeResearcherFlow();
  });

  it('Solo prueba de carga de archivos', () => {
    cy.loginAsResearcher();
    cy.testFileUploadPage();
    cy.testFileSelection();
    cy.testUploadCancel();
    cy.logout();
  });
});