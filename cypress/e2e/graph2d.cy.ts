import { parseHTML } from '../support/parseHTML';
import graph2dData from '../data_src/graph2d.data.json';

const featureName = "graph2d"

before(() => {
  parseHTML(featureName, graph2dData)
})

describe('GRAPH2D CANVAS', function () {
  const describeTitle = this.title
  beforeEach(() => {
    cy.viewport(1280, 720)
    cy.visit("cypress/html_files/" + featureName + ".html");
    cy.wait(500)
  })

  it("Unchanged raw canvas", function () {  
    var fileName = describeTitle + ' -- ' + this.test.title
    cy.compareSnapshot(fileName, 0.0);
  })
})
