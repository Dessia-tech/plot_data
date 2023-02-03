import { parseHTML } from '../support/parseHTML';
import { plotScatterData } from '../data_src/plotScatter.data';

const corePath = 'http://localhost:3030/libdev/plot-data.js';
const fileName = "plotScatter"

describe('template spec', () => {
  it("take screenshot", () => {  
    parseHTML(fileName, corePath, plotScatterData)
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.compareSnapshot(fileName, 0.0);
  })
})