import { parseHTML } from '../support/parseHTML';
import plotScatterData from '../data_src/plotscatter.data.json';

const fileName = "plotscatter"

before(() => {
  parseHTML(fileName, plotScatterData)
})

describe('PLOT SCATTER CANVAS', () => {
  beforeEach(() => {
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.wait(500)
  })

  it("Unchanged raw canvas", () => {  
    cy.compareSnapshot(fileName + ".raw", 0.0);
  })
})