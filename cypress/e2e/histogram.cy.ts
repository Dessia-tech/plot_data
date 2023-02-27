import { parseHTML } from '../support/parseHTML';
import histogramData from '../data_src/histogram.data.json';

const FEATURE_NAME = "histogram"

before(() => {
  parseHTML(FEATURE_NAME, histogramData)
})

describe('HISTOGRAM CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})
