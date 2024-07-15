import { ZOOM_FACTOR } from "../../instrumented/constants";
import { Vertex } from "../../instrumented/baseShape";
import { PointSet } from "../../instrumented/collections";
import { Scatter, Graph2D, Draw, ParallelPlot } from "../../instrumented/figures";
import { Multiplot } from "../../instrumented/multiplot";
import multiplotData from '../data_src/multiplot.data.json';
import { filterUpdate } from "../../instrumented/interactions";

const MOUSE_OFFSET = new Vertex(8, 8); // TODO: I f****** don't understand why this add (8, 8) is required for mouse to be as specified
const canvasID = "canvas";
const canvas = document.createElement(canvasID);
canvas.id = canvasID;
canvas.width = 1000;
canvas.height = 1000;
document.body.appendChild(canvas);

const multiplot = new Multiplot(multiplotData, 800, 600, canvasID);

describe('Multiplot.figures', function () {
  it('should return an array of elements to JSON format that can be handled by any Figure', function() {
    const serializedFeatures = multiplot.serializeFeatures();
    expect(serializedFeatures.length, "as many elements").to.be.equal(multiplot.nSamples);

    for (let i of [0, 2, 25, 345, 14, 64, 85, 123, 465, 51, 212, 326]) {
      const sample = serializedFeatures[i];
      expect(Object.keys(sample).length, "as many features").to.be.equal(multiplot.featureNames.length + 1);

      multiplot.featureNames.forEach(feature => {
        expect(sample[feature], `same ${feature}`).to.be.equal(multiplotData.elements[i][feature]);
        expect(sample["values"][feature], `same sample.values.${feature}`).to.be.equal(sample[feature]);
      });
    }
  });

  it("should draw figureZones when switching to resize mode", function() {
    expect(multiplot.figureZones.length, "figureZones length").to.equal(0);
    multiplot.switchResize();

    expect(multiplot.figureZones.length, "figureZones length").to.equal(8);
    expect(multiplot.figureZones.shapes[6].origin, "figureZones.shapes[6].origin").to.deep.equal(new Vertex(404, 304));
    expect(multiplot.figureZones.shapes[5].size, "figureZones.shapes[5].size").to.deep.equal(new Vertex(392, 142));
  });

  it("should resize multiplot with figures inside", function() {
    const originalFigureSizes = multiplot.figures.map(figure => { return [figure.origin, figure.size] });
    const originalZoneSizes = multiplot.figureZones.shapes.map(zone => { return [zone.origin, zone.size] });
    multiplot.resize(750, 750);
    multiplot.figures.forEach((figure, i) => {
      expect(figure.origin, `figure[${i}].origin`).to.not.deep.equal(originalFigureSizes[i][0]);
      expect(figure.size, `figure[${i}].size`).to.not.deep.equal(originalFigureSizes[i][1]);
      expect(multiplot.figureZones.shapes[i].origin, `figureZones.shapes[${i}].origin`).to.not.deep.equal(originalZoneSizes[i][0]);
      expect(multiplot.figureZones.shapes[i].size, `figureZones.shapes[${i}].size`).to.not.deep.equal(originalZoneSizes[i][1]);
    })
  });

  it("should add a ParallelPlot with 'x' and 'y' axes", function() {
    const initialNFigures = multiplot.figures.length;
    multiplot.addParallelPlot(["x", "y", "color"]);

    expect(multiplot.figures.length, "n figures").to.be.equal(initialNFigures + 1);
    expect(multiplot.figures[initialNFigures], "last figure is ParallelPlot").to.be.instanceof(ParallelPlot);
    expect(multiplot.figures[initialNFigures].drawnFeatures, "drawnFeatures").to.deep.equal(["x", "y", "color"]);
    expect(multiplot.figureZones.length, "figureZones length").to.equal(9);
 });

  it("should add a Scatter with 'color' and 'y' axes", function() {
    const initialNFigures = multiplot.figures.length;
    multiplot.addScatter("color", "y");

    expect(multiplot.figures.length, "n figures").to.be.equal(initialNFigures + 1);
    expect(multiplot.figures[initialNFigures], "last figure is Scatter").to.be.instanceof(Scatter);
    expect(multiplot.figures[initialNFigures].drawnFeatures, "drawnFeatures").to.deep.equal(["color", "y"]);
  });

  it("should delete figure at specified index", function() {
    const index = 6;
    const removedFigure = multiplot.figures[index];
    expect(multiplot.figures, "figure[6] in figures").to.include(removedFigure);

    cy.spy(multiplot, 'resetLayout');
    cy.spy(multiplot, 'draw');
    multiplot.deleteFigure(index);

    expect(multiplot.figures, "figure[6] not in figures").to.not.include(removedFigure);
    expect(multiplot.figureZones.length, "figureZones length").to.equal(9);
    cy.wrap(multiplot.resetLayout).should('have.been.calledOnce');
    cy.wrap(multiplot.draw).should('have.been.calledOnce');
  });
});

describe("Multiplot.mouseListener", function() {
  const fIndex = 1;
  const multiplot = new Multiplot(multiplotData, 800, 600, canvasID);
  const [axis0Min, axis0Max] = [multiplot.figures[fIndex].axes[0].minValue, multiplot.figures[fIndex].axes[0].maxValue];
  const [axis1Min, axis1Max] = [multiplot.figures[fIndex].axes[1].minValue, multiplot.figures[fIndex].axes[1].maxValue];

  const scatter1 = multiplot.figures[0] as Scatter;
  const scatter2 = multiplot.figures[1] as Scatter;

  const pointCenter1 = scatter1.points[12].center;
  const pointCenter2 = scatter2.points[25].center;
  const pointCenter3 = scatter2.points[378].center;

  const mouseMove1 = new MouseEvent('mousemove', { clientX: pointCenter1.x + MOUSE_OFFSET.x, clientY: pointCenter1.y + MOUSE_OFFSET.y });
  const mouseDown1 = new MouseEvent('mousedown', { clientX: pointCenter1.x + MOUSE_OFFSET.x, clientY: pointCenter1.y + MOUSE_OFFSET.y });
  const mouseMove2 = new MouseEvent('mousemove', { clientX: pointCenter2.x + MOUSE_OFFSET.x, clientY: pointCenter2.y + MOUSE_OFFSET.y });
  const mouseDown2 = new MouseEvent('mousedown', { clientX: pointCenter2.x + MOUSE_OFFSET.x, clientY: pointCenter2.y + MOUSE_OFFSET.y });
  const mouseMove3 = new MouseEvent('mousemove', { clientX: pointCenter3.x + MOUSE_OFFSET.x, clientY: pointCenter3.y + MOUSE_OFFSET.y });
  const mouseUp = new MouseEvent('mouseup', {});
  const ctrlKeyDown = new KeyboardEvent("keydown", { key: 'Control' });
  const shiftKeyDown = new KeyboardEvent("keydown", { key: 'Shift' });
  const ctrlKeyUp = new KeyboardEvent("keyup", { key: 'Control' });
  const shiftKeyUp = new KeyboardEvent("keyup", { key: 'Shift' });

  function countNonNullRubberBands(multiplot: Multiplot): number {
    let nonNullRubberBands = 0;
    multiplot.featureNames.forEach(feature => {
      if (feature != "name") {
        if (multiplot.rubberBands.get(feature).length != 0) nonNullRubberBands++;
      }
    });
    return nonNullRubberBands
  }

  it("should hover all figures' elements that match with current hovered point in scatter", function () {
    canvas.dispatchEvent(mouseMove1);
    expect(scatter1.points[12].isHovered, "hovered point").to.be.true;
    multiplot.figures.forEach(figure => {
      if (!(figure instanceof Draw || figure instanceof Graph2D)) {
        expect(figure.hoveredIndices, `sample is hovered in ${figure.constructor.name}`).to.include(12);
      }
    });
  });

  it("should click all figures' elements that match with current clicked elements in figures", function () {
    window.dispatchEvent(ctrlKeyDown);
    canvas.dispatchEvent(mouseMove1);
    canvas.dispatchEvent(mouseDown1);
    canvas.dispatchEvent(mouseUp);
    canvas.dispatchEvent(mouseMove2);
    canvas.dispatchEvent(mouseDown2);
    canvas.dispatchEvent(mouseUp);
    window.dispatchEvent(ctrlKeyUp);

    expect(multiplot.figures[1].clickedIndices, "samples are clicked in all figures").to.deep.equal([12, 25, 35, 142, 210, 308, 423]);
    multiplot.figures.forEach(figure => {
      if (!(figure instanceof Draw || figure instanceof Graph2D)) {
        expect(figure.clickedIndices, "samples are clicked in all figures").to.deep.equal([12, 25, 35, 142, 210, 308, 423]);
      }
    });
  });

  it("should draw a SelectionBox on .figures[1] and rubberBand on other rubberBanded axes", function () {
    cy.spy(filterUpdate, 'next');
    window.dispatchEvent(shiftKeyDown);
    canvas.dispatchEvent(mouseMove2);
    canvas.dispatchEvent(mouseDown2);
    canvas.dispatchEvent(mouseMove3);
    canvas.dispatchEvent(mouseUp);
    window.dispatchEvent(shiftKeyUp);

    expect(scatter2.axes[0].rubberBand.minValue, "rubberBand[0] minValue").to.be.equal(scatter2.selectionBox.minVertex.x);
    expect(scatter2.axes[0].rubberBand.maxValue, "rubberBand[0] maxValue").to.be.equal(scatter2.selectionBox.maxVertex.x);
    expect(scatter2.axes[1].rubberBand.minValue, "rubberBand[1] minValue").to.be.equal(scatter2.selectionBox.minVertex.y);
    expect(scatter2.axes[1].rubberBand.maxValue, "rubberBand[1] maxValue").to.be.equal(scatter2.selectionBox.maxVertex.y);

    expect(multiplot.rubberBands.get(scatter2.axes[0].name).length, "multiplot rubberBand[0] updated").to.be.closeTo(25.4, 0.1);
    expect(multiplot.rubberBands.get(scatter2.axes[1].name).length, "multiplot rubberBand[1] updated").to.be.closeTo(1.02, 0.01);

    expect(filterUpdate.next).to.have.been.calledWith({id: multiplot.canvasID, rubberbands: multiplot.rubberBands});

    const rubberBandName0 = scatter2.axes[0].name;
    const rubberBandName1 = scatter2.axes[1].name;
    multiplot.figures.forEach(figure => {
      if (!(figure instanceof Draw || figure instanceof Graph2D)) {
        figure.axes.forEach(axis => {
          let i: number;
          if (axis.name == rubberBandName0) i = 0;
          if (axis.name == rubberBandName1) i = 1;
          if (i) {
            expect(axis.rubberBand.minValue).to.be.equal(scatter2.axes[i].rubberBand.minValue);
            expect(axis.rubberBand.maxValue).to.be.equal(scatter2.axes[i].rubberBand.maxValue);
          }
        })
      }
    });
  });

  it("should add new PointSet to pointSets", function() {
    const pointSet = new PointSet(multiplot.selectedIndices, "hsl(80, 35%, 45%)");
    const initPointSetLength = multiplot.pointSets.length;
    multiplot.addPointSet(pointSet);
    multiplot.draw();
    expect(multiplot.pointSets.length, "pointSets.length").to.be.equal(initPointSetLength + 1);
    multiplot.figures.forEach((figure, i) => {
      if (figure.pointSets) expect(multiplot.figures[fIndex].pointSets, `figures[${i}].pointSets`).to.deep.equal(multiplot.pointSets);
    });
  });

  it("should add indices to pointSet[3]", function() {
    const initPointSetLength = multiplot.pointSets.length;
    const addedIndices = [0, 1, 2, 3, 4, 5];
    multiplot.addPointsToSet(addedIndices, 3);
    multiplot.draw();
    expect(multiplot.pointSets.length, "pointSets.length").to.be.equal(initPointSetLength);
    multiplot.figures.forEach((figure, i) => {
      if (figure.pointSets) expect(multiplot.figures[fIndex].pointSets, `figures[${i}].pointSets`).to.deep.equal(multiplot.pointSets);
    });
  });

  it("should remove indices to pointSet[3]", function() {
    const initPointSetLength = multiplot.pointSets.length;
    const removedIndices = [6, 17,18, 25, 27, 36, 41, 44, 62, 66, 73, 75, 76, 78, 79, 87];
    multiplot.removePointsFromSet(removedIndices, 3);
    multiplot.draw();
    expect(multiplot.pointSets.length, "pointSets.length").to.be.equal(initPointSetLength);
    multiplot.figures.forEach((figure, i) => {
      if (figure.pointSets) expect(multiplot.figures[fIndex].pointSets, `figures[${i}].pointSets`).to.deep.equal(multiplot.pointSets);
    });
  });

  it("should remove pointSet[3]", function() {
    const initPointSetLength = multiplot.pointSets.length;
    multiplot.removePointSet(3);
    multiplot.draw();
    expect(multiplot.pointSets.length, "pointSets.length").to.be.equal(initPointSetLength - 1);
    multiplot.figures.forEach((figure, i) => {
      if (figure.pointSets) expect(multiplot.figures[fIndex].pointSets, `figures[${i}].pointSets`).to.deep.equal(multiplot.pointSets);
    });
  });

  it("should zoom on hovered figure", function() {
    const figureCenter = multiplot.figures[fIndex].origin.add(multiplot.figures[fIndex].size.divide(2));
    const mouseMove = new MouseEvent('mousemove', { clientX: figureCenter.x, clientY: figureCenter.y });
    const mouseWheel = new WheelEvent('wheel', { clientX: figureCenter.x, clientY: figureCenter.y, deltaY: ZOOM_FACTOR });
    canvas.dispatchEvent(mouseMove);
    canvas.dispatchEvent(mouseWheel);
    expect(multiplot.figures[fIndex].axes[0].minValue, "axes[0].minValue").to.not.be.equal(axis0Min);
    expect(multiplot.figures[fIndex].axes[0].maxValue, "axes[0].maxValue").to.not.be.equal(axis0Max);
    expect(multiplot.figures[fIndex].axes[1].minValue, "axes[1].minValue").to.not.be.equal(axis1Min);
    expect(multiplot.figures[fIndex].axes[1].maxValue, "axes[1].maxValue").to.not.be.equal(axis1Max);
  });

  it("should reset view on hovered figure", function() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: 'Control' }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: ' ' }));
    expect(multiplot.figures[fIndex].axes[0].minValue, "axes[0].minValue").to.be.equal(axis0Min);
    expect(multiplot.figures[fIndex].axes[0].maxValue, "axes[0].maxValue").to.be.equal(axis0Max);
    expect(multiplot.figures[fIndex].axes[1].minValue, "axes[1].minValue").to.be.equal(axis1Min);
    expect(multiplot.figures[fIndex].axes[1].maxValue, "axes[1].maxValue").to.be.equal(axis1Max);
  })

  it("should reset everything", function() {
    expect(multiplot.clickedIndices.length).to.not.be.equal(0);
    expect(multiplot.selectedIndices.length).to.not.be.equal(0);
    expect(countNonNullRubberBands(multiplot)).to.not.be.equal(0);
    multiplot.reset();

    expect(multiplot.clickedIndices.length).to.be.equal(0);
    expect(multiplot.selectedIndices.length).to.be.equal(0);
    expect(countNonNullRubberBands(multiplot)).to.be.equal(0);
  });
});

describe("Multiplot.diverse", function() {

  const multiplot = new Multiplot(multiplotData, 800, 600, canvasID);

  it("should hide figure", function() {
    cy.spy(multiplot.figures[3], 'draw');
    multiplot.toggleFigure(3);
    expect(multiplot.hiddenFigureIndices, "3 is in hiddenIndices").to.include(3);
    cy.wrap(multiplot.figures[3].draw).should('have.not.been.called');

    cy.spy(multiplot.figures[4], 'draw');
    multiplot.toggleFigure(4);
    expect(multiplot.hiddenFigureIndices, "4 is in hiddenIndices").to.include(4);
    cy.wrap(multiplot.figures[4].draw).should('have.not.been.called');
  });

  it("should show figure", function() {
    cy.spy(multiplot.figures[3], 'draw');
    cy.spy(multiplot.figures[4], 'draw');
    multiplot.toggleFigure(3);

    expect(multiplot.hiddenFigureIndices, "3 is not in hiddenIndices").to.not.include(3);
    expect(multiplot.hiddenFigureIndices, "4 is not in hiddenIndices").to.include(4);
    cy.wrap(multiplot.figures[3].draw).should('have.been.calledOnce');
    cy.wrap(multiplot.figures[4].draw).should('have.not.been.called');
  });

  it("should enable selection properly", function() {
    multiplot.switchSelection();
    expect(multiplot.isSelecting, "isSelecting").to.be.true;
    expect(canvas.style.cursor, "cursor").to.be.equal("crosshair");
    multiplot.figures.forEach((figure, i) => {
      expect(figure.isSelecting, `figure[${i}].isSelecting`).to.be.true;
      expect(figure.is_drawing_rubber_band, `figure[${i}].is_drawing_rubber_band`).to.be.false;
    });
  });

  it("should disable selection properly", function() {
    multiplot.switchSelection();
    expect(multiplot.isSelecting, "isSelecting").to.be.false;
    expect(canvas.style.cursor, "cursor").to.be.equal("default");
    multiplot.figures.forEach((figure, i) => {
      expect(figure.isSelecting, `figure[${i}].isSelecting`).to.be.false;
      expect(figure.is_drawing_rubber_band, `figure[${i}].is_drawing_rubber_band`).to.be.false;
    });
  });

  it("should enable zoom properly", function() {
    multiplot.switchZoom();
    expect(multiplot.isZooming, "isZooming").to.be.true;
    expect(canvas.style.cursor, "cursor").to.be.equal("crosshair");
    multiplot.figures.forEach((figure, i) => {
      expect(figure.isZooming, `figure[${i}].isZooming`).to.be.true;
    });
  });

  it("should disable zoom properly", function() {
    multiplot.switchZoom();
    expect(multiplot.isZooming, "isZooming").to.be.false;
    expect(canvas.style.cursor, "cursor").to.be.equal("default");
    multiplot.figures.forEach((figure, i) => {
      expect(figure.isZooming, `figure[${i}].isZooming`).to.be.false;
    });
  });

  it('should write values in axes[0].rubberBand', function() {
    multiplot.setFeatureFilter("x", -1, 25);
    expect(multiplot.selectedIndices.length, "multiplot.selectedIndices.length").to.be.equal(61);
  });
});
