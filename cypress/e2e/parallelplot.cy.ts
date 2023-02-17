import { parseHTML } from '../support/parseHTML';
import parallelPlotData from '../data_src/parallelPlot.data.json';

const fileName = "parallelPlot"

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