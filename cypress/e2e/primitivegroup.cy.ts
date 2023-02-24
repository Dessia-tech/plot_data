import { parseHTML } from '../support/parseHTML';
import primitiveGroupData from '../data_src/primitivegroup.data.json';

const featureName = "primitivegroup"

before(() => {
  parseHTML(featureName, primitiveGroupData)
})

describe('PLOT SCATTER MATRIX CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + featureName + ".html");
    cy.wait(500)
  })

  it("Unchanged raw canvas", function () {  
    cy.compareSnapshot(describeTitle + this.test.title, 0.0);
  })
})