import { parseHTML } from '../support/parseHTML';
import parallelPlotData from '../data_src/parallelplot.data.json';

const featureName = "parallelplot"

before(() => {
  parseHTML(featureName, parallelPlotData)
})

describe('PARALLEL PLOT CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + featureName + ".html");
    cy.wait(500)
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})
