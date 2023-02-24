import { parseHTML } from '../support/parseHTML';
import primitiveGroupContainerData from '../data_src/primitivegroupcontainer.data.json';

const featureName = "primitivegroupcontainer"

before(() => {
  parseHTML(featureName, primitiveGroupContainerData)
})

describe('PRIMITIVEGROUP CONTAINER CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + featureName + ".html");
    cy.wait(500)
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})
