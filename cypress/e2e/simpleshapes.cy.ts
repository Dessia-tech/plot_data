import { parseHTML } from '../support/parseHTML';
import simpleshapesData from '../data_src/simpleshapes.data.json';
import { Draw } from '../../instrumented/figures';

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

  it("should draw tooltip on line", function () {
    cy.window().then((win) => {
      const draw = win.eval('plot_data') as Draw;
      const [canvasMouse, frameMouse, mouseCoords] = draw.projectMouse({"offsetX": 746, "offsetY": 176} as MouseEvent);
      draw.mouseMove(canvasMouse, frameMouse, mouseCoords);
      draw.mouseDown(canvasMouse, frameMouse, mouseCoords);
      draw.mouseUp(false);
      draw.draw();
      cy.compareSnapshot(describeTitle + this.test.title, 0.05);
    })
  })

  it("should hover line even if mouse is not exactly on line", function () {
    cy.window().then((win) => {
      const draw = win.eval('plot_data');
      let [canvasMouse, frameMouse, mouseCoords] = draw.projectMouse({"offsetX": 814, "offsetY": 196} as MouseEvent);
      draw.mouseMove(canvasMouse, frameMouse, mouseCoords);
      expect(draw.relativeObjects.shapes[23].isHovered).to.be.true;

      [canvasMouse, frameMouse, mouseCoords] = draw.projectMouse({"offsetX": 822, "offsetY": 196} as MouseEvent);
      draw.mouseMove(canvasMouse, frameMouse, mouseCoords);
      expect(draw.relativeObjects.shapes[23].isHovered).to.be.true;
    })
  })
})
