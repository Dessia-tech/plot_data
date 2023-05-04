import { parseHTML } from '../support/parseHTML';
import { initRubberBand } from '../support/initRubberBand';
import histogramData from '../data_src/histogram.data.json';
import { newHistogram } from '../../src/subplots';
import { Vertex } from '../../src/utils';

const FEATURE_NAME = "histogram"

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

  let histogram: newHistogram;
  it("should select with rubber band", function () {
    cy.window().then(win => {
      histogram = win.eval('plot_data')
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
    [canvasMouse, frameMouse] = histogram.projectMouse({"offsetX": 256, "offsetY": 628} as MouseEvent);
    expect(frameMouse.x).to.closeTo(3461, 10);
  })

  it("should translate rubber band", function () {    
    cy.window().then(win => {
      histogram = win.eval('plot_data')
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
})
