import { htmlString } from '../templates/plotScatter.template';
import { HtmlWriter } from '../support/HtmlWriter';
import { plotScatterData } from '../data_src/plotScatter.data';

describe('template spec', () => {
  const fileName = "plotScatter"
  it("take screenshot", () => {  
    const corePath = 'http://localhost:3030/libdev/plot-data.js';
    const htmlFile = HtmlWriter(htmlString, corePath, plotScatterData, 'canvas');
    cy.writeFile("cypress/html_files/" + fileName + ".html", htmlFile, 'utf-8');
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.compareSnapshot(fileName, 0.0);
  })
})