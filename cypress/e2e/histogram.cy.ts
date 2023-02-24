import { parseHTML } from '../support/parseHTML';
import histogramData from '../data_src/histogram.data.json';

const featureName = "histogram"

before(() => {
  parseHTML(featureName, histogramData)
})

describe('HISTOGRAM CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + featureName + ".html");
    cy.wait(500)
  })

  it("should draw canvas", function () {  
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})
