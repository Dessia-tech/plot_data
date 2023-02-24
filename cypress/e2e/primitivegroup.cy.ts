import { parseHTML } from '../support/parseHTML';
import primitiveGroupData from '../data_src/primitivegroup.data.json';

const featureName = "primitivegroup"

before(() => {
  parseHTML(featureName, primitiveGroupData)
})

describe('PRIMITIVE GROUP CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + featureName + ".html");
    cy.wait(500)
  })

  it("should draw canvas", function () {  
    cy.compareSnapshot(describeTitle + this.test.title, 0.0);
  })
})