import { htmlString } from '../templates/plotScatter.template';
import { plotScatterData } from '../data_src/plotScatter.data';
import { HtmlWriter } from '../support/HtmlWriter'

describe('template spec', () => {
  it("take screenshot", () => {
    let fileName = "plotScatter"
    let version = plotScatterData['package_version'];
    let core_path = 'https://cdn.dessia.tech/js/plot-data/v' + version + '/plot-data.js';
    let htmlFile = HtmlWriter(htmlString, core_path, plotScatterData, 'canvas');
    cy.writeFile("cypress/html_files/" + fileName + ".html", htmlFile, 'utf-8');
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.wait(2000);
    cy.compareSnapshot(fileName, 0.0);
  })
})