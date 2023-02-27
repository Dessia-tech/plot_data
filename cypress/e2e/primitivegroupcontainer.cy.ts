import { parseHTML } from '../support/parseHTML';
import primitiveGroupContainerData from '../data_src/primitivegroupcontainer.data.json';

const FEATURE_NAME = "primitivegroupcontainer"

before(() => {
  parseHTML(FEATURE_NAME, primitiveGroupContainerData)
})

describe('PRIMITIVEGROUP CONTAINER CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})
