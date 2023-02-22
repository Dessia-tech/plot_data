import { defineConfig } from "cypress";
import getCompareSnapshotsPlugin from "cypress-visual-regression/dist/plugin";

export default defineConfig({
  viewportWidth: 1100,
  viewportHeight: 720,
  reporter: 'mochawesome',
  reporterOptions: {
    embeddedScreenshots: true,
    reportDir: 'cypress/results',
    overwrite: false,
    html: true,
    json: true,
  },
  env: {
    screenshotsFolder: './cypress/snapshots/actual',
    trashAssetsBeforeRuns: true,
    video: false,
    failSilently: false,
    type: 'actual' //'base',
  },
  e2e: {
    experimentalStudio : true,
    setupNodeEvents(on, config) {
      getCompareSnapshotsPlugin(on, config);
    },
  }
});
