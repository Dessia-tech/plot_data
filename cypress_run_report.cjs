const cypress = require('cypress')
const fse = require('fs-extra')
const { merge } = require('mochawesome-merge')
const generator = require('mochawesome-report-generator')

async function runTests() {
  await fse.remove('cypress/results') // remove the report folder
  await cypress.run({
    browser:"firefox"
  })
  const jsonReport = await merge({
    files: ['cypress/results/*.json'],
  })
  await generator.create(
    jsonReport, 
    options = {
      reportFilename: "report", 
      reportDir: 'cypress/results'
    }
    )
  process.exit()
}

runTests()
