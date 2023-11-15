import { Vertex } from "../../instrumented/baseShape";
import { Rect } from "../../instrumented/primitives";
import { Axis, ParallelAxis } from "../../instrumented/axes";

describe('Axis', function() {

  const vector = [1, 2, 3, 4, 5];
  const boundingBox = new Rect(new Vertex(0, 0), new Vertex(500, 500));
  const origin = new Vertex(0, 0);
  const end = new Vertex(0, 100);
  const name = "";
  const initScale = new Vertex(1, 1);
  const nTicks = 5;

  it('should draw the axis on the canvas', function() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const axis = new Axis(vector, boundingBox, origin, end, name, initScale, nTicks);

    cy.spy(context, 'fill');
    cy.spy(context, 'stroke');

    axis.draw(context);

    cy.wrap(context.fill).should('have.been.calledWith', axis.drawPath);
    cy.wrap(context.stroke).should('have.been.calledWith', axis.drawPath);
  });

  it('should be well created without vector features', function() {
    const axis = new Axis(null, boundingBox, origin, end, name, initScale, nTicks);
    const ticks = [-1, 0, 1, 2]
    axis.ticks.forEach((tick, index) => expect(tick, `tick ${index}`).to.equal(ticks[index]));
    expect(axis.isDiscrete, `isDiscrete`).to.be.true;
});

  it('should be well created with empty vector features', function() {
      const axis = new Axis([], boundingBox, origin, end, name, initScale, nTicks);
      const ticks = [-1, 0, 1, 2]
      axis.ticks.forEach((tick, index) => expect(tick, `tick ${index}`).to.equal(ticks[index]));
      expect(axis.isDiscrete, `isDiscrete`).to.be.true;
  });

  it('should be well created without only one feature', function() {
    const axis = new Axis([1], boundingBox, origin, end, name, initScale, nTicks);
    expect(axis.ticks.length, `length ticks`).to.equal(7);
  });

  it("should scale axis with another one", function() {
    const axis = new Axis(vector, boundingBox, origin, end, name, initScale, nTicks);
    const otherVector = [10, 11, 12, 13, 14, 32.4];
    const otherAxis = new Axis(otherVector, boundingBox, origin, end, name, initScale, nTicks);
    axis.otherAxisScaling(otherAxis);
    expect(axis.minValue, "minValue").to.be.closeTo(-9.3, 0.1);
    expect(axis.maxValue, "maxValue").to.be.closeTo(15.3, 0.1);
    expect((axis.maxValue - axis.minValue) / axis.drawLength, "ratio").to.be.closeTo((otherAxis.maxValue - otherAxis.minValue) / otherAxis.drawLength, 0.01);
  })

  it('should update the origin and end points of the axis', function() {
    const axis = new Axis(vector, boundingBox, origin, end, name, initScale, nTicks);
    const newOrigin = new Vertex(100, 100);
    const newEnd = new Vertex(100, 200);
    axis.transform(newOrigin, newEnd);

    expect(axis.origin.x, "origin.x").to.equal(newOrigin.x);
    expect(axis.end.y, "end.y").to.equal(newEnd.y);
  });

  it('should change axis scale', function() {
    const axis = new Axis(vector, boundingBox, origin, end, name, initScale, nTicks);
    const viewPoint = new Vertex(20, 20);
    const scaling = new Vertex(2, 0.5);
    const translation = new Vertex();
    axis.updateScale(viewPoint, scaling, translation);
    expect(axis.minValue, "minValue").to.be.closeTo(-0.08, 0.005);
    expect(axis.maxValue, "maxValue").to.be.closeTo(8.7, 0.05);
  });

  it('should update axis with translation and style', function() {
    const axis = new Axis(vector, boundingBox, origin, end, name, initScale, nTicks);
    const viewPoint = new Vertex(0, 0);
    const scaling = new Vertex(1, 1);
    const translation = new Vertex(4 * axis.transformMatrix.a, 4 * axis.transformMatrix.a);
    const axisStyle = new Map<string, any>([
      ["lineWidth", 3],
      ["strokeStyle", "hsl(12, 45%, 80%)"]
    ])
    axis.update(axisStyle, viewPoint, scaling, translation);
    expect(axis.minValue, "minValue").to.be.closeTo(-3.2, 0.1);
    expect(axis.maxValue, "maxValue").to.be.closeTo(1.2, 0.1);
    expect(axis.lineWidth, "lineWidth").to.be.equal(3);
    expect(axis.strokeStyle, "strokeStyle").to.equal("hsl(12, 45%, 80%)")
  });

  it('should reset scale and translation', function() {
    const axis = new Axis(vector, boundingBox, origin, end, name, initScale, nTicks);
    axis.updateScale(new Vertex(20, 20), new Vertex(2, 0.5), new Vertex());
    axis.updateScale(new Vertex(), new Vertex(1, 1), new Vertex(25, 25));
    axis.resetScale();
    expect(axis.minValue, "minValue").to.be.equal(0.8);
    expect(axis.maxValue, "maxValue").to.be.equal(5.2);
  });

  it("should draw rubberBand and reset it", function() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const axis = new Axis(vector, boundingBox, origin, end, name, initScale, nTicks);
    const mouseClick = new Vertex(0, 50);
    axis.mouseMove(context, mouseClick);
    axis.mouseDown(mouseClick);
    axis.mouseMove(context, new Vertex(0, 75));
    axis.mouseUp(false);
    expect(axis.rubberBand.minValue, "rubberBand minValue").to.be.closeTo(3, 0.001);
    expect(axis.rubberBand.maxValue, "rubberBand maxValue").to.be.closeTo(4.1, 0.001);
    axis.reset();
    expect(axis.rubberBand.minValue, "reset rubberBand minValue").to.equal(0);
    expect(axis.rubberBand.maxValue, "reset rubberBand maxValue").to.equal(0);
  })

  it("should transform a string array into values array for ticks to be drawn", function() {
    const stringVector = ["z", "e", "z", "y", "o", "u", "p", "i", "p", "p"];
    const stringAxis = new Axis(stringVector, boundingBox, origin, end, name, initScale, nTicks);
    const numberVector = [1, 1, 1, 2, 3, 3, 3, 4, 5, 5, 5, 5];
    const numberAxis = new Axis(numberVector, boundingBox, origin, end, name, initScale, nTicks);
    const numericStringVector = stringAxis.stringsToValues(stringVector);
    const numericNumberVector = numberAxis.stringsToValues(numberVector);
    numericStringVector.forEach((value, index) => expect(stringAxis.labels[value], `string value ${index}`).to.equal(stringVector[index]));
    numericNumberVector.forEach((value, index) => expect(value, `number value ${index}`).to.equal(numberVector[index]));
  })
   
   
});

describe('ParallelAxis', function() {

  const vector = [1, 2, 3, 4, 5];
  const boundingBox = new Rect(new Vertex(-50, 0), new Vertex(50, 150));
  const origin = new Vertex(0, 0);
  const end = new Vertex(0, 100);
  const name = "parallel axis";
  const initScale = new Vertex(1, 1);
  const nTicks = 5;

  it('should draw a vertical axis on the canvas', function() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const parallelAxis = new ParallelAxis(vector, boundingBox, origin, end, name, initScale, nTicks);

    parallelAxis.computeTitle(0, 1);
    expect(parallelAxis.titleSettings.baseline, "default baseline").to.be.null;
    expect(parallelAxis.titleSettings.orientation, "default orientation").to.be.null;
    parallelAxis.draw(context);
    expect(parallelAxis.titleSettings.baseline, "updated baseline").to.be.equal("top");
    expect(parallelAxis.titleSettings.orientation, "updated orientation").to.be.equal(0);
  });

  it('should draw a horizontal axis on the canvas', function() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const parallelAxis = new ParallelAxis(vector, boundingBox, new Vertex(0, 0), new Vertex(100, 0), name, initScale, nTicks);

    parallelAxis.computeTitle(0, 1);
    expect(parallelAxis.titleSettings.baseline, "default baseline").to.be.null;
    parallelAxis.draw(context);
    expect(parallelAxis.titleSettings.baseline, "updated baseline").to.be.equal("bottom");
  });

});
