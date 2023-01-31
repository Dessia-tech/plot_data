import { htmlString } from '../templates/plotScatter.template';
import { HtmlWriter } from '../support/HtmlWriter';
import { plotScatterData } from '../data_src/plotScatter.data';
import { PlotData } from '../../libdev/plot-data';

describe('template spec', () => {
  const fileName = "plotScatter"
  it("take screenshot", () => {  
    // const loc = 'https://localhost:' + Cypress.config('port') + '/plot_data'; //Cypress.config('fileServerFolder');
    const loc = Cypress.config('projectRoot');
    const corePath = loc + '/libdev/plot-data.js';
    // const corePath = "/__cypress/tests?p=libdev/plot-data.js"
    const htmlFile = HtmlWriter(htmlString, corePath, plotScatterData, 'canvas');
    cy.writeFile("cypress/html_files/" + fileName + ".html", htmlFile, 'utf-8');
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.compareSnapshot(fileName, 0.0);
  })
})