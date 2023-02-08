import { htmlSnapshotsDiff } from '../support/htmlSnapshotsDiff';

const fileName = "scatterplot"

describe(fileName + ' spec', () => {
  it("should be the same image as from snapshots/base", () => {
    htmlSnapshotsDiff(fileName);
  })
  it("should select a point", () => {
    cy.visit("cypress/html_files/" + fileName + ".html");
    cy.get("canvas").then(($canvas) => {
      // for (let attr in $canvas[0].attributes) {
      //   console.log(attr)
      // }
      console.log($canvas["0"])
    })
    
  });
})
