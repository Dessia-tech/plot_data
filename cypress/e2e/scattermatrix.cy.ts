import { parseHTML } from '../support/parseHTML';
import scattermatrixData from '../data_src/scattermatrix.data.json';

const featureName = "scattermatrix"

before(() => {
  parseHTML(featureName, scattermatrixData)
})

describe('PLOT SCATTER MATRIX CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + featureName + ".html");
    cy.wait(500)
  })

  it("should draw canvas", function () {  
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})