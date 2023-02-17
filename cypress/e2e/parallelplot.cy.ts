import { parseHTML } from '../support/parseHTML';
import parallelPlotData from '../data_src/parallelplot.data.json';

const fileName = "parallelplot"

before(() => {
  parseHTML(fileName, parallelPlotData)
})

describe('PARALLEL PLOT CANVAS', () => {
  beforeEach(() => {
    cy.visit("cypress/html_files/" + fileName + ".html");
  })

  it("Unchanged raw canvas", () => {  
    cy.compareSnapshot(fileName + ".raw", 0.0);
  })
})