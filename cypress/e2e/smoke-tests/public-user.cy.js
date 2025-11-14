describe('Smoke Test - Usuario Público', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debería cargar la página principal correctamente', () => {
    cy.verifyPublicHomePage();
  });

  it('Debería mostrar todas las secciones de contenido', () => {
    cy.verifyHomePageSections();
  });

  it('Debería cargar todas las imágenes correctamente', () => {
    cy.verifyHomePageImages();
  });

  it('Debería tener navegación pública correcta', () => {
    cy.verifyPublicNavigation();
  });

  it('Debería poder navegar a login desde header', () => {
    cy.goToLoginFromPublicHeader();
  });
});