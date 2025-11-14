import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",  // 🎯 AGREGAR ESTA LÍNEA
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});