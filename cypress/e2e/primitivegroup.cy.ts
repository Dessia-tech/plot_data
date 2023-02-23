import { parseHTML } from '../support/parseHTML';
import primitiveGroupData from '../data_src/primitivegroup.data.json';

const fileName = "primitivegroup"

before(() => {
  parseHTML(fileName, primitiveGroupData)
})

describe('PLOT PRIMITIVE GROUP CANVAS', () => {
  beforeEach(() => {
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.wait(500)
  })

  it("Unchanged raw canvas", () => {  
    cy.compareSnapshot(fileName + ".raw", 0.0);
  })
})