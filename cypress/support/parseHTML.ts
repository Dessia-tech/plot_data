import { htmlWriter } from "./htmlWriter";

export function parseHTML(fileName: string, corePath: string) {
    cy.readFile('./cypress/html_templates/' + fileName.toLowerCase() + '.template.html').then((str) => {
    const templateString = str;
    const htmlFile = htmlWriter(templateString, corePath);
    cy.writeFile("cypress/html_files/" + fileName + ".html", htmlFile, 'utf-8');
  })
}