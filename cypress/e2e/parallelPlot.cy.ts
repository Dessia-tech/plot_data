import { parseHTML } from '../support/parseHTML';
import { parallelPlotData } from '../data_src/parallelPlot.data';

const corePath = 'http://localhost:3030/libdev/plot-data.js';
const fileName = "parallelPlot"

describe('template spec', () => {
  it("take screenshot", () => {  
    parseHTML(fileName, corePath, parallelPlotData)
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.compareSnapshot(fileName, 0.1);
  })
})