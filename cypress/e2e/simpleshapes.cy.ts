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
      cy.get(plot_data)
      .invoke('attr', 'select_on_mouse', plot_data.plot_datas[0].primitives[4])
      .then( () => {
        plot_data.draw()
        cy.compareSnapshot(describeTitle + this.test.title, 0.05);
      })
    })
  })

  it("should draw tooltip on line", function () {
    cy.window().then((win) => {
      let plot_data = win.eval('plot_data');
      cy.get(plot_data)
      .invoke('attr', 'select_on_mouse', plot_data.plot_datas[0].primitives[6])
      .then( () => {
        plot_data.draw()
        plot_data.select_on_mouse.tooltip.draw_primitive_tooltip(plot_data.context, plot_data.scale,
          plot_data.originX, plot_data.originY, plot_data.X, plot_data.Y, 595, 300, plot_data.width, plot_data.height);
        cy.compareSnapshot(describeTitle + this.test.title, 0.05);
      })
    })
  })

  it("should be hovered near line", function () {
    cy.window().then((win) => {
      let plot_data = win.eval('plot_data');
      cy.get('canvas').click(595, 300)
      .then( () => {
        expect(plot_data.select_on_click[0]).to.equal(plot_data.plot_datas[0].primitives[6]);
      })
    })
  })
})
