import { htmlWriter } from "./HtmlWriter";

export function parseHTML(fileName: string, corePath: string, data: any) {
    cy.readFile('./templates/' + fileName + '.template.txt').then((str) => {
    const templateString = str;
    const htmlFile = htmlWriter(templateString, corePath, data, 'canvas');
    cy.writeFile("cypress/html_files/" + fileName + ".html", htmlFile, 'utf-8');
  })
}