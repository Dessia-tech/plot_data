import { parseHTML } from '../support/parseHTML';
import parallelPlotData from '../data_src/parallelplot.data.json';

const FEATURE_NAME = "parallelplot"

before(() => {
  parseHTML(FEATURE_NAME, parallelPlotData)
})

describe('PARALLEL PLOT CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})
