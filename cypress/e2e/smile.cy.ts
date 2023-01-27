import { downloadPng } from './utils'

describe('Lego face', () => {
  it('saves canvas as an image', () => {
    cy.visit('/smile')
    cy.wait(4000)
    downloadPng('good-smile.png')
  })
})