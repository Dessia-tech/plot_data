import { htmlString } from '../templates/test';
import { plotScatterData } from '../data_src/plotScatterData';
import { HtmlWriter } from '../support/HtmlWriter'

describe('template spec', () => {
  it("take screenshot", () => {
    let version = plotScatterData['package_version'];
    let core_path = 'https://cdn.dessia.tech/js/plot-data/v' + version + '/plot-data.js';
    let htmlFile = HtmlWriter(htmlString, core_path, plotScatterData, 'canvas');
    cy.writeFile("cypress/templates/plotScatter.html", htmlFile, 'utf-8');
    cy.visit("cypress/templates/plotScatter.html");
    cy.compareSnapshot('plotScatter', 0.0)
  })
})