import { parseHTML } from '../support/parseHTML';
import scattermatrixData from '../data_src/scattermatrix.data.json';

const featureName = "scattermatrix"

before(() => {
  parseHTML(featureName, scattermatrixData)
})

describe('PLOT SCATTER MATRIX CANVAS', function () {
  const describeTitle = this.title
  beforeEach(() => {
    cy.visit("cypress/html_files/" + featureName + ".html");
    cy.wait(500)
  })

  it("Unchanged raw canvas", function () {  
    var fileName = describeTitle + ' -- ' + this.test.title
    cy.compareSnapshot(fileName, 0.0);
  })
})