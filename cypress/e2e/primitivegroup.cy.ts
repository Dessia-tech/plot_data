import { parseHTML } from '../support/parseHTML';
import primitiveGroupData from '../data_src/primitivegroup.data.json';

const FEATURE_NAME = "primitivegroup"

before(() => {
  parseHTML(FEATURE_NAME, primitiveGroupData)
})

describe('PRIMITIVE GROUP CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})
