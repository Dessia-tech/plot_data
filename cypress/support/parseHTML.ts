import { htmlWriter } from "./HtmlWriter";

const corePath = 'http://localhost:3030/libtest/plot-data.js';

export function parseHTML(fileName: string, data: any) {
  cy.readFile('./cypress/templates/' + fileName + '.template.html').then((str) => {
    const templateString = str;
    const htmlFile = htmlWriter(templateString, corePath, data);
    cy.writeFile("cypress/html_files/" + fileName + ".html", htmlFile, 'utf-8');
  })
}
