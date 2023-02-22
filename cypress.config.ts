import { defineConfig } from "cypress";
import getCompareSnapshotsPlugin from "cypress-visual-regression/dist/plugin";
import fs from 'fs'
import path from 'path'

export default defineConfig({
  viewportWidth: 1000,
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

      on('after:screenshot', (details) => {
        var newPath =  details.path
        const basePath = './cypress/results/screenshots/'
        if (!fs.existsSync(path.resolve(basePath))){
          if (!fs.existsSync(path.resolve('./cypress/results/'))) {
            fs.mkdirSync(path.resolve('./cypress/results/'));
          }
          fs.mkdirSync(path.resolve(basePath));
        }
        if (details.testFailure) {
          newPath =  path.resolve(basePath + path.parse(details.path).base)
        }
        return new Promise((resolve, reject) => {
          // fs.rename moves the file to the existing directory 'new/path/to'
          // and renames the image to 'screenshot.png'
          fs.rename(details.path, newPath, (err) => {
            if (err) return reject(err)

            // because we renamed and moved the image, resolve with the new path
            // so it is accurate in the test results
            resolve({ path: newPath })
          })
        })
      });
    },
  }
});
