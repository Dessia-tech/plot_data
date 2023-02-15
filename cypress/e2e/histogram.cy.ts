import { parseHTML } from '../support/parseHTML';
import histogramData from '../data_src/histogram.data.json';

const fileName = "histogram"

before(() => {
  parseHTML(fileName, histogramData)
})

describe('HISTOGRAM CANVAS', () => {
  beforeEach(() => {
    cy.visit("cypress/html_files/" + fileName + ".html");
  })

  it("Unchanged raw canvas", () => {  
    cy.compareSnapshot(fileName + ".raw", 0.0);
  })
})
