import { parseHTML } from '../support/parseHTML';

const corePath = 'http://localhost:3030/libdev/plot-data.js';
const fileName = "primitivegroupcontainer"

describe(fileName + ' spec', () => {
  it("take screenshot", () => {  
    parseHTML(fileName, corePath)
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.compareSnapshot(fileName, 0.1);
  })
})
