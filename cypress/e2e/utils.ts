export const downloadPng = (filename) => {
  expect(filename).to.be.a('string')

  // the simplest way is to grab the data url and use
  // https://on.cypress.io/writefile to save PNG file
  return cy.get('canvas').then(($canvas) => {
    const url = $canvas[0].toDataURL()
    const data = url.replace(/^data:image\/png;base64,/, '')
    cy.writeFile(filename, data, 'base64')
    cy.wrap(filename)
  })
}