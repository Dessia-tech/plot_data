import { parseHTML } from '../support/parseHTML';
import primitiveGroupContainerData from '../data_src/primitivegroupcontainer.data.json';

const fileName = "primitivegroupcontainer"

before(() => {
  parseHTML(fileName, primitiveGroupContainerData)
})

describe('PLOT PRIMITIVE GROUP CONTAINER CANVAS', () => {
  beforeEach(() => {
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.wait(500)
  })

  it("Unchanged raw canvas", () => {  
    cy.compareSnapshot(fileName + ".raw", 0.0);
  })
})