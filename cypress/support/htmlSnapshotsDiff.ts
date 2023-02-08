import { parseHTML } from "./parseHTML";

export const corePath = 'http://localhost:3030/libdev/plot-data.js';

export function htmlSnapshotsDiff(fileName: string) {
    parseHTML(fileName, corePath)
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.compareSnapshot(fileName, 0.0);
}