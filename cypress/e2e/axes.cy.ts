import { Vertex } from "../../instrumented/baseShape";
import { Rect } from "../../instrumented/primitives";
import { Axis, ParallelAxis } from "../../instrumented/axes";

const vector = [1, 2, 3, 4, 5];
const boundingBox = new Rect(new Vertex(0, 0), new Vertex(500, 500));
const origin = new Vertex(0, 0);
const end = new Vertex(0, 100);
const name = "";
const initScale = new Vertex(1, 1);
const nTicks = 5;

describe('Axis', function() {

  // The draw() method successfully draws the axis on the canvas.
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

  it('should change translate scale', function() {
    const axis = new Axis(vector, boundingBox, origin, end, name, initScale, nTicks);
    const viewPoint = new Vertex(0, 0);
    const scaling = new Vertex(1, 1);
    const translation = new Vertex(4 * axis.transformMatrix.a, 4 * axis.transformMatrix.a);
    axis.updateScale(viewPoint, scaling, translation);
    expect(axis.minValue, "minValue").to.be.closeTo(-3.2, 0.1);
    expect(axis.maxValue, "maxValue").to.be.closeTo(1.2, 0.1);
  });

  it('should change reset scale', function() {
    const axis = new Axis(vector, boundingBox, origin, end, name, initScale, nTicks);
    axis.updateScale(new Vertex(20, 20), new Vertex(2, 0.5), new Vertex());
    axis.updateScale(new Vertex(), new Vertex(1, 1), new Vertex(25, 25));
    axis.resetScale();
    expect(axis.minValue, "minValue").to.be.equal(0.8);
    expect(axis.maxValue, "maxValue").to.be.equal(5.2);
  });

  it("should draw rubberBand", function() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const axis = new Axis(vector, boundingBox, origin, end, name, initScale, nTicks);
    const mouseClick = new Vertex(0, 50);
    axis.mouseMove(context, mouseClick);
    axis.mouseDown(mouseClick);
    axis.mouseMove(context, new Vertex(0, 75));
    axis.mouseUp(false);
    console.log(axis)
    expect(axis.rubberBand.minValue, "rubberBand minValue").to.be.closeTo(3, 0.001);
    expect(axis.rubberBand.maxValue, "rubberBand maxValue").to.be.closeTo(4.1, 0.001);
  })
   
   
});
