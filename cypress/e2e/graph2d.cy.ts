import { parseHTML } from '../support/parseHTML';
import graph2dData from '../data_src/graph2d.data.json';

const fileName = "graph2d"

before(() => {
  parseHTML(fileName, graph2dData)
})

describe('GRAPH2D CANVAS', () => {
  beforeEach(() => {
    cy.visit("cypress/html_files/" + fileName + ".html");
  })

  it("Unchanged raw canvas", () => {  
    cy.compareSnapshot(fileName + ".raw", 0.0);
  })
})
