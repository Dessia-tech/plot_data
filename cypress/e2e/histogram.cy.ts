import { parseHTML } from '../support/parseHTML';
import histogramData from '../data_src/histogram.data.json';
import { Frame, newHistogram } from '../../src/subplots';
import { Vertex, newPoint2D } from '../../src/utils';

const FEATURE_NAME = "histogram"

function initRubberBand(frame: Frame) {
  frame.axes[0].rubberBand.minValue = 600;
  frame.axes[0].rubberBand.maxValue = 6500;
  frame.axes[1].rubberBand.minValue = 0.9;
  frame.axes[1].rubberBand.maxValue = 5.1;
  frame.draw();
}

before(() => {
  parseHTML(FEATURE_NAME, histogramData)
})

describe('HISTOGRAM CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })

  it("should select with rubber band", function () {
    cy.window().then(win => {
      const histogram = win.eval('plot_data') as newHistogram;
      initRubberBand(histogram)
      const nSelected = histogram.selectedIndex.reduce((sum, current) => sum + (current ? 1 : 0), 0);
      const selectedBars = histogram.bars.reduce((sum, current) => sum + (current.isSelected ? 1 : 0), 0);
      expect(nSelected).to.equal(9);
      expect(selectedBars).to.equal(6);
      cy.compareSnapshot(describeTitle + this.test.title, 0.05);
    })
  })

  let canvasMouse: Vertex ; let frameMouse: Vertex ; let canvasDown: Vertex ; let frameDown: Vertex ; let clickedObject: any;
  it("should project mouse", function () {
    cy.window().then(win => {
      const histogram = win.eval('plot_data') as newHistogram;
      [canvasMouse, frameMouse] = histogram.projectMouse({"offsetX": 256, "offsetY": 628} as MouseEvent);
      expect(frameMouse.x).to.closeTo(3461, 10);
    })
  })

  it("should translate rubber band", function () {
    cy.window().then(win => {
      const histogram = win.eval('plot_data') as newHistogram;
      initRubberBand(histogram);

      histogram.mouseMove(canvasMouse, frameMouse);
      [canvasDown, frameDown, clickedObject] = histogram.mouseDown(canvasMouse, frameMouse);
      clickedObject.mouseMove(frameDown, frameDown.add(new Vertex(200, 200)));
      histogram.draw()
      const selectedBars = histogram.bars.reduce((sum, current) => sum + (current.isSelected ? 1 : 0), 0);

      expect(histogram.axes[0].rubberBand.minValue).to.closeTo(4444, 10);
      expect(histogram.axes[0].rubberBand.maxValue).to.closeTo(10344, 10);
      expect(selectedBars).to.equal(5);
    })
  })

  it("should hover/click on bar", function () {
    cy.window().then(win => {
      const histogram = win.eval('plot_data') as newHistogram;
      [canvasMouse, frameMouse] = histogram.projectMouse({"offsetX": 319, "offsetY": 426} as MouseEvent);
      histogram.mouseMove(canvasMouse, frameMouse);
      expect(histogram.movingObjects[4].isHovered).to.be.true;

      [canvasDown, frameDown, clickedObject] = histogram.mouseDown(canvasMouse, frameMouse);
      histogram.mouseUp(canvasMouse, frameMouse, canvasDown, false)
      expect(histogram.movingObjects[4].isClicked).to.be.true;
    })
  })

  it("should scale and translate axes limits", function () {
    cy.window().then(win => {
      const histogram = win.eval('plot_data') as newHistogram;
      const e = {"offsetX": 572, "offsetY": 144, "deltaY": 3} as WheelEvent;
      histogram.wheel_interaction(e.offsetX, e.offsetY, e);
      histogram.viewPoint = new newPoint2D(e.offsetX, e.offsetY);
      histogram.viewPoint.transformSelf(histogram.canvasMatrix);
      histogram.draw();
      [canvasDown, frameMouse] = histogram.projectMouse({"offsetX": 572, "offsetY": 144} as MouseEvent);
      [canvasMouse, frameMouse] = histogram.projectMouse({"offsetX": 114, "offsetY": 191} as MouseEvent);
      histogram.translation = histogram.mouseTranslate(canvasMouse, canvasDown);
      histogram.draw();
      histogram.axes.forEach(axis => {axis.saveLocation()});
      histogram.translation = new Vertex(0, 0);
      [histogram.scaleX, histogram.scaleY] = [1, 1];
      histogram.viewPoint = new Vertex(0, 0);
      cy.compareSnapshot(describeTitle + this.test.title, 0.05);
    })
  })
})
