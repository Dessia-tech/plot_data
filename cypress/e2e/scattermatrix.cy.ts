import { parseHTML } from '../support/parseHTML';
import scattermatrixData from '../data_src/scattermatrix.data.json';

const FEATURE_NAME = "scattermatrix"

before(() => {
  parseHTML(FEATURE_NAME, scattermatrixData)
})

describe('PLOT SCATTER MATRIX CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})
