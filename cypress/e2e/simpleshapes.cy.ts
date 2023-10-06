import { parseHTML } from '../support/parseHTML';
import simpleshapesData from '../data_src/simpleshapes.data.json';

const FEATURE_NAME = "simpleshapes"

before(() => {
  parseHTML(FEATURE_NAME, simpleshapesData)
})

describe('SIMPLE SHAPES CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })

  it("should color hovered circle", function () {
    cy.window().then((win) => {
      let plot_data = win.eval('plot_data');
      cy.get('canvas').click(544, 376)
      .then( () => {
        expect(plot_data.relativeObjects.shapes[21].isClicked).to.be.true;
      })
    })
  })

  // it("should draw tooltip on line", function () {
  //   cy.window().then((win) => {
  //     let plot_data = win.eval('plot_data');
  //     plot_data.relativeObjects.shapes[23].isClicked = true;
  //     plot_data.draw();
  //     cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  //   })
  // })

  // it("should be hovered near line", function () {
  //   cy.window().then((win) => {
  //     let plot_data = win.eval('plot_data');
  //     cy.get('canvas').click(572, 275)
  //     .then( () => {
  //       expect(plot_data.select_on_click[0]).to.equal(plot_data.plot_datas[0].primitives[6]);
  //     })
  //   })
  // })
})
