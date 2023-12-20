import { defineConfig } from "cypress";
import getCompareSnapshotsPlugin from "cypress-visual-regression/dist/plugin";
import fs from 'fs'
import path from 'path'
import registerCodeCoverageTasks from '@cypress/code-coverage/task'

const HEIGHT: number = 710;
const WIDTH: number = 1270;

export default defineConfig({
  viewportWidth: WIDTH,
  viewportHeight: HEIGHT,
  reporter: 'mochawesome',
  reporterOptions: {
    embeddedScreenshots: true,
    reportDir: 'cypress/results',
    overwrite: false,
    html: true,
    json: true,
  },
  env: {
    SNAPSHOT_DIFF_DIRECTORY: "./cypress/results/diff",
    screenshotsFolder: './cypress/snapshots/actual',
    trashAssetsBeforeRuns: true,
    video: false,
    failSilently: false,
    type: 'actual' //'base',
  },
  e2e: {
    specPattern: 'cypress/e2e/*',
    experimentalStudio : true,
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);

      getCompareSnapshotsPlugin(on, config);

      on('before:browser:launch', (browser, launchOptions) => {
        launchOptions.args.push(`--window-size=${WIDTH + 10},${HEIGHT + 10}`)
        return launchOptions
      })

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

      return config
    },
  }
});
