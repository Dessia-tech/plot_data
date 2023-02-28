const cypress = require('cypress')
const fse = require('fs-extra')
const { merge } = require('mochawesome-merge')
const generator = require('mochawesome-report-generator')


async function runTests() {
  let failures = null
  let totalFailed = null
  let message = null

  await fse.remove('cypress/results') // remove the report folder

  await cypress.run({
    browser:"firefox"
  }).then(result => {
    failures = result.failures
    message = result.message
    totalFailed = result.totalFailed
  }).catch(err => {
    console.error(err.message)
    process.exit(1)
  })

  const jsonReport = await merge({
    files: ['cypress/results/*.json'],
  })

  await generator.create(
    jsonReport,
    options = {
      reportFilename: "index",
      reportDir: 'cypress/results'
    }
    )

  if (failures) {
    console.error('Could not execute tests')
    console.error(message)
    process.exit(failures)
  }
  process.exit(totalFailed)
}

runTests()
