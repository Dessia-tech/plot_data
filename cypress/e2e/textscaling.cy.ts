import { parseHTML } from '../support/parseHTML';
import textscalingData from '../data_src/textscaling.data.json';

const FEATURE_NAME = "textscaling"

before(() => {
  parseHTML(FEATURE_NAME, textscalingData)
})

describe('TEXT CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})
