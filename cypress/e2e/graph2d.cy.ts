import { parseHTML } from '../support/parseHTML';
import graph2dData from '../data_src/graph2d.data.json';

const featureName = "graph2d"

before(() => {
  parseHTML(featureName, graph2dData)
})

describe('PLOT SCATTER MATRIX CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + featureName + ".html");
    cy.wait(500)
  })

  it("Unchanged raw canvas", function () {  
    cy.compareSnapshot(describeTitle + this.test.title, 0.0);
  })
})