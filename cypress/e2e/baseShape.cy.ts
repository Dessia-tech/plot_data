import { DEFAULT_SHAPE_COLOR, HOVERED_SHAPE_COLOR, CLICKED_SHAPE_COLOR, SELECTED_SHAPE_COLOR } from "../../instrumented/constants"
import { Vertex, Shape } from "../../instrumented/baseShape"

describe('Vertex', function() {

  // Vertex class can be instantiated with default values for x and y.
  it('should instantiate Vertex class with default values for x and y', function() {
    const vertex = new Vertex();
    expect(vertex.x, "x coord").to.equal(0);
    expect(vertex.y, "y coord").to.equal(0);
  });

  // Vertex class can return its coordinates as an array.
  it('should return coordinates as an array', function() {
    const vertex = new Vertex(2, 3);
    expect(vertex.coordinates[0], "x coord").to.equal(2);
    expect(vertex.coordinates[1], "y coord").to.equal(3);
    expect(vertex.coordinates instanceof Array, "coordinates").to.be.true;
  });

  // Vertex class can calculate its L1 norm.
  it('should calculate L1 norm', function() {
    const vertex = new Vertex(-2, 3);
    expect(vertex.normL1, "normL1").to.equal(5);
  });

  // Vertex class can calculate its Euclidean norm.
  it('should calculate the Euclidean norm of a Vertex instance', function() {
    const vertex = new Vertex(3, 4);
    const norm = vertex.norm;
    expect(norm, "euclidean norm").to.equal(5);
  });

  // Vertex class can be deep copied.
  it("should deep copy a vertex", function () {
    const vertex = new Vertex(3, 4);
    const copy = vertex.copy();
    copy.x = 0;
    expect(copy.x, "x coord").to.not.equal(vertex.x);
    expect(copy.y, "y coord").to.equal(vertex.y);
  })

  // Vertex class can add another Vertex to itself.
  it('should add another Vertex to itself', function() {
    const vertex1 = new Vertex(2, 3);
    const vertex2 = new Vertex(4, 5);
    const result = vertex1.add(vertex2);
    expect(result.x, "x coord").to.equal(6);
    expect(result.y, "y coord").to.equal(8);
  });

  // Vertex class can divide itself by a scalar value.
  it('should divide Vertex class by value', function() {
    const vertex = new Vertex(2, 3);
    const result = vertex.divide(3);
    expect(result.x, "x coord").to.equal(2 / 3);
    expect(result.y, "y coord").to.equal(1);
  });

  // Vertex class can divide itself by zero.
  it('should divide the vertex by zero', function() {
    const vertex = new Vertex(4, 6);
    const dividedVertex = vertex.divide(0);
    expect(dividedVertex.x, "x coord").to.equal(Infinity);
    expect(dividedVertex.y, "y coord").to.equal(Infinity);
  });

  // Vertex class can multiply itself by a scalar value.
  it('should multiply the vertex by a scalar value', function() {
    const vertex = new Vertex(2, 3);
    const scalar = 2;
    const result = vertex.multiply(scalar);
    expect(result.x, "x coord").to.equal(4);
    expect(result.y, "y coord").to.equal(6);
  });

  // Vertex class can calculate its distance from itself.
  it('should calculate distance from itself', function() {
    const vertex = new Vertex(2, 3);
    const distance = vertex.distance(vertex);
    expect(distance, "distance").to.equal(0);
  });

  // Vertex class can calculate its distance from another Vertex.
  it('should calculate the distance between two vertices', function() {
    const vertex1 = new Vertex(0, 0);
    const vertex2 = new Vertex(3, 4);
    const distance = vertex1.distance(vertex2);
    expect(distance, "distance").to.equal(5);
  });

  // Vertex class can scale itself by another Vertex.
  it('should scale the vertex by another vertex', function() {
    const vertex1 = new Vertex(2, 3);
    const vertex2 = new Vertex(2, 2);
    const scaledVertex = vertex1.scale(vertex2);
    expect(scaledVertex.x, "x coord").to.equal(4);
    expect(scaledVertex.y, "y coord").to.equal(6);
  });

  // Vertex class can translate itself by another Vertex.
  it('should translate itself by another Vertex when calling the translateSelf method', function() {
    const vertex1 = new Vertex(2, 3);
    const vertex2 = new Vertex(1, 2);
    vertex1.translateSelf(vertex2);
    expect(vertex1.x, "x coord").to.equal(3);
    expect(vertex1.y, "y coord").to.equal(5);
  });

  // Vertex class can subtract another Vertex from itself.
  it('should subtract another Vertex from itself and return a new Vertex with the correct values', function() {
    const vertex1 = new Vertex(5, 10);
    const vertex2 = new Vertex(2, 3);
    const result = vertex1.subtract(vertex2);
    expect(result.x, "x coord").to.equal(3);
    expect(result.y, "y coord").to.equal(7);
  });

  // Vertex class can transform itself by a DOMMatrix.
  it('should transform the vertex itself by a DOMMatrix', function() {
    const vertex = new Vertex(2, 3);
    const matrix = new DOMMatrix();
    matrix.a = 2;
    matrix.b = 0;
    matrix.c = 0;
    matrix.d = 3;
    matrix.e = 5;
    matrix.f = -2;
    vertex.transformSelf(matrix);
    expect(vertex.x, "x coord").to.equal(9);
    expect(vertex.y, "y coord").to.equal(7);
  });

  // Vertex class can create a transformed Vertex by a DOMMatrix.
  it('should transform the vertex by a DOMMatrix', function() {
    const vertex = new Vertex(2, 3);
    const matrix = new DOMMatrix();
    matrix.a = 2;
    matrix.b = 0;
    matrix.c = 0;
    matrix.d = 3;
    matrix.e = 5;
    matrix.f = -2;
    const transformedVertex = vertex.transform(matrix);
    expect(transformedVertex.x, "x coord").to.equal(9);
    expect(transformedVertex.y, "y coord").to.equal(7);
  });
})

describe('Shape', function() {

  // Shape can be initialized without any arguments
  it('should initialize Shape without any arguments', function() {
    const shape = new Shape();
    expect(shape.path instanceof Path2D, "path").to.be.true;
    expect(shape.drawnPath instanceof Path2D, "drawnPath").to.be.true;
    expect(shape.inStrokeScale.y, "inStrokeScale").to.equal(1);
    expect(shape.lineWidth, "lineWidth").to.equal(1);
    expect(shape.dashLine.length, "dashLine").to.equal(0);
    expect(shape.hatching, "hatching").to.be.null;
    expect(shape.strokeStyle, "strokeStyle").to.be.null;
    expect(shape.fillStyle, "fillStyle").to.equal(DEFAULT_SHAPE_COLOR);
    expect(shape.hoverStyle, "hoverStyle").to.equal(HOVERED_SHAPE_COLOR);
    expect(shape.clickedStyle, "clickedStyle").to.equal(CLICKED_SHAPE_COLOR);
    expect(shape.selectedStyle, "selectedStyle").to.equal(SELECTED_SHAPE_COLOR);
    expect(shape.alpha, "alpha").to.equal(1);
    expect(shape.mouseClick, "mouseClick").to.be.null;
    expect(shape.isHovered, "isHovered").to.be.false;
    expect(shape.isClicked, "isClicked").to.be.false;
    expect(shape.isSelected, "isSelected").to.be.false;
    expect(shape.isScaled, "isScaled").to.be.true;
    expect(shape.isFilled, "isFilled").to.be.true;
    expect(shape.inFrame, "inFrame").to.be.true;
    expect(shape.tooltipOrigin, "tooltipOrigin").to.be.null;
    expect(shape.tooltipMap.size, "tooltipMap").to.be.equal(0);
    expect(shape.hasTooltip, "hasTooltip").to.be.true;
  });

  // Shape can be drawn on a canvas context
  it('should draw the shape on a canvas context', function() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const shape = new Shape();

    cy.spy(context, 'fill');
    cy.spy(context, 'stroke');

    shape.draw(context);

    cy.wrap(context.fill).should('have.been.calledWith', shape.drawnPath);
    cy.wrap(context.stroke).should('have.been.calledWith', shape.drawnPath);
  });

  // Shape can be hovered over
  it('should hover shape when mouse is moved over it', function() {
    const shape = new Shape();
    const context = document.createElement('canvas').getContext('2d');
    const mouseCoords = new Vertex(10, 10);
    shape.path.rect(8, 8, 3, 3);
    shape.mouseMove(context, mouseCoords);
    expect(shape.isHovered, "isHovered").to.be.true;
  });

  // Shape can be clicked over
  it('should click shape when mouse is clicked over it', function() {
    const shape = new Shape();
    const context = document.createElement('canvas').getContext('2d');
    const mouseCoords = new Vertex(10, 10);
    shape.path.rect(8, 8, 3, 3);
    shape.mouseMove(context, mouseCoords);
    shape.mouseDown(mouseCoords);
    shape.mouseUp(false);
    expect(shape.isClicked, "isClicked").to.be.true;
    expect(shape.mouseClick.x, "mouseClick").to.equal(10);
  });
});
