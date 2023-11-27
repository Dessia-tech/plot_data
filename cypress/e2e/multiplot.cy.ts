import { Vertex } from "../../instrumented/baseShape";
import { Scatter, Graph2D, Draw, ParallelPlot } from "../../instrumented/figures";
import { Multiplot } from "../../instrumented/multiplot";
import multiplotData from '../data_src/multiplot.data.json';

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

    for (let i = 0; i < 10; i++) {
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
  const multiplot = new Multiplot(multiplotData, 800, 600, canvasID);

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

});
