import { parseHTML } from '../support/parseHTML';
import scattermatrixData from '../data_src/scattermatrix.data.json';

const fileName = "scattermatrix"

before(() => {
  parseHTML(fileName, scattermatrixData)
})

describe('PLOT SCATTER MATRIX CANVAS', () => {
  beforeEach(() => {
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.wait(500)
  })

  it("Unchanged raw canvas", () => {  
    cy.compareSnapshot(fileName + ".raw", 0.0);
  })
})