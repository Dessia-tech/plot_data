import { parseHTML } from '../support/parseHTML';
import piechartData from '../data_src/piechart.data.json';

const FEATURE_NAME = "piechart"

before(() => {
  parseHTML(FEATURE_NAME, piechartData)
})

describe('PIECHART CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})
