import { parseHTML } from '../support/parseHTML';
import plotScatterData from '../data_src/plotscatter.data.json';

const FEATURE_NAME = "plotscatter"

before(() => {
  parseHTML(FEATURE_NAME, plotScatterData)
})

describe('PLOT SCATTER CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.1);
  })
})
