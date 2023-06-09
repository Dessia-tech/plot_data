import { parseHTML } from '../support/parseHTML';
import parallelPlotData from '../data_src/parallelplot.data.json';
import { Interactions } from '../../src/plot-data';

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

  it("should draw a nice horizontal parallel plot", function () {
    cy.window().then((win) => {
      let parallelPlot = win.eval('plot_data')
      Interactions.change_disposition_action(parallelPlot);
      cy.compareSnapshot(describeTitle + this.test.title, 0.05);
    })
  })
})
