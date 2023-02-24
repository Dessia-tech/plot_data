import { parseHTML } from '../support/parseHTML';
import simpleshapesData from '../data_src/simpleshapes.data.json';

const featureName = "simpleshapes"

before(() => {
  parseHTML(featureName, simpleshapesData)
})

describe('SIMPLE SHAPES CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + featureName + ".html");
    cy.wait(500)
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })

  it("should draw tooltip", function () {
    cy.window().then((win) => {
      var plot_data = win.eval('plot_data');
      var width = plot_data.width;
      var height = plot_data.height;
      var scaleX = plot_data.scaleX;
      var scaleY = plot_data.scaleY;
      cy.get('#canvas').click();
      console.log(width, height, scaleX, scaleY)
    })
  })
})
