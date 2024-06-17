import { MAX_LABEL_HEIGHT } from "./constants"
import { colorHsl } from "./colors"
import { Vertex, Shape } from "./baseShape"
import { Rect, LineSequence } from "./primitives"
import { Label, Text, SelectionBox } from "./shapes"
import { deserialize, drawTooltip } from "./shapeFunctions"

export class PointSet {
  public color: string;
  constructor(
    public indices: number[] = [],
    color: string = "hsl(32, 100%, 50%)",
    public name: string = ""
  ) {
    this.color = colorHsl(color);
  }

  public includes(pointIndex: number): boolean { return this.indices.includes(pointIndex) }

  public indexOf(pointIndex: number): number { return this.indices.indexOf(pointIndex) }
}

export class ShapeCollection {
  public minimum: Vertex;
  public maximum: Vertex;
  constructor(
    public shapes: Shape[] = [],
  ) {
    [this.minimum, this.maximum] = this.getBounds();
  }

  public get length(): number { return this.shapes.length }

  public includes(shape: Shape) { return this.shapes.includes(shape) }

  public static fromPrimitives(primitives: { [key: string]: any }, scale: Vertex = new Vertex(1, 1)): ShapeCollection {
    return new ShapeCollection(primitives.map(primitive => deserialize(primitive, scale)))
  }

  public getBounds(): [Vertex, Vertex] {
    let minimum = new Vertex(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    let maximum = new Vertex(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
    this.shapes.forEach(shape => {
      const [shapeMin, shapeMax] = shape.getBounds();
      if (shapeMin) {
        if (shapeMin.x <= minimum.x) minimum.x = shapeMin.x;
        if (shapeMin.y <= minimum.y) minimum.y = shapeMin.y;
      }
      if (shapeMax) {
        if (shapeMax.x >= maximum.x) maximum.x = shapeMax.x;
        if (shapeMax.y >= maximum.y) maximum.y = shapeMax.y;
      }
    });
    if (minimum.x == Number.POSITIVE_INFINITY) minimum.x = 0;
    if (minimum.y == Number.POSITIVE_INFINITY) minimum.y = 0;
    if (maximum.x == Number.NEGATIVE_INFINITY) maximum.x = 1;
    if (maximum.y == Number.NEGATIVE_INFINITY) maximum.y = 1;
    return [minimum, maximum]
  }

  public drawTooltips(canvasOrigin: Vertex, canvasSize: Vertex, context: CanvasRenderingContext2D, inMultiPlot: boolean): void {
    this.shapes.forEach(shape => { if (!inMultiPlot && shape.inFrame) drawTooltip(shape, canvasOrigin, canvasSize, context) });
  }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void {
    this.shapes.forEach(shape => shape.mouseMove(context, mouseCoords));
  }

  public mouseDown(mouseCoords: Vertex): Shape {
    let clickedObject: Shape = null;
    this.shapes.forEach(shape => {
      shape.mouseDown(mouseCoords);
      if (shape.isHovered) clickedObject = shape;
    });
    return clickedObject
  }

  public mouseUp(keepState: boolean): void { this.shapes.forEach(shape => shape.mouseUp(keepState)) }

  public mouseLeave(): void { this.shapes.forEach(shape => shape.mouseLeave()) }

  public draw(context: CanvasRenderingContext2D): void { this.shapes.forEach(shape => shape.draw(context)) }

  public removeShape(index: number): void {
    this.shapes.splice(index, 1);
    [this.minimum, this.maximum] = this.getBounds();
  }

  private updateBoundsWithText(text: Text, context: CanvasRenderingContext2D): void {
    text.format(context);
    text.updateBoundingBox(context);
    this.updateBoundsWithNewBounds(...text.getBounds());
  }

  private updateBoundsWithNewBounds(minBound: Vertex, maxBound: Vertex): void {
    this.minimum.x = Math.min(this.minimum.x, minBound.x);
    this.minimum.y = Math.min(this.minimum.y, minBound.y);
    this.maximum.x = Math.max(this.maximum.x, maxBound.x);
    this.maximum.y = Math.max(this.maximum.y, maxBound.y);
  }

  private handleNanBounds(): void {
    if (Number.isNaN(this.minimum.x)) this.minimum.x = this.maximum.x - 1;
    if (Number.isNaN(this.minimum.y)) this.minimum.y = this.maximum.y - 1;
    if (Number.isNaN(this.maximum.x)) this.maximum.x = this.maximum.x + 1;
    if (Number.isNaN(this.maximum.y)) this.maximum.y = this.maximum.y + 1;
  }

  public updateBounds(context: CanvasRenderingContext2D): void {
    this.shapes.forEach(shape => { if (shape instanceof Text) this.updateBoundsWithText(shape, context) })
    this.handleNanBounds();
  }

  public updateShapeStates(stateName: string): number[] {
    const newStates = [];
    this.shapes.forEach((shape, index) => {
      if (shape[stateName] && !(shape instanceof SelectionBox)) newStates.push(index);
    });
    return newStates
  }

  public resetShapeStates(): void {
    this.shapes.forEach(shape => shape.isHovered = shape.isClicked = shape.isSelected = false);
  }

  private extractLabelsFromShapes(): [Shape[], Label[]] {
    const labels: Label[] = [];
    const others = [];
    this.shapes.forEach(shape => {
      if (shape instanceof Label) labels.push(shape)
      else others.push(shape);
    });
    return [others, labels]
  }

  private updateLabelsGeometry(labels: Label[], drawingZone: Rect, initScale: Vertex): void {
    const offsetLabels = 0.5 * initScale.y;
    const labelHeight = Math.min(Math.abs(drawingZone.size.y) / (labels.length * 1.75 + 1), MAX_LABEL_HEIGHT);
    labels.forEach((label, index) => {
      label.updateHeight(labelHeight);
      label.updateOrigin(drawingZone, initScale, index - offsetLabels);
    });
  }

  public locateLabels(drawingZone: Rect, initScale: Vertex): void {
    const [others, labels] = this.extractLabelsFromShapes();
    if (labels.length != 0) this.updateLabelsGeometry(labels, drawingZone, initScale);
    this.shapes = [...others, ...labels];
  }
}

export class SelectionBoxCollection extends ShapeCollection {
  constructor(public shapes: SelectionBox[] = []) { super(shapes) }
}

export class GroupCollection extends ShapeCollection {
  constructor(
    public shapes: any[] = [],
  ) {
    super(shapes);
  }

  public shapeIsContainer(shape: any): boolean { return shape.values?.length > 1 || shape instanceof LineSequence }

  public drawTooltips(canvasOrigin: Vertex, canvasSize: Vertex, context: CanvasRenderingContext2D, inMultiPlot: boolean): void {
    this.shapes.forEach(shape => { if ((this.shapeIsContainer(shape) || !inMultiPlot) && shape.inFrame) drawTooltip(shape, canvasOrigin, canvasSize, context) });
  }

  public updateShapeStates(stateName: string): number[] {
    const ShapeStates = [];
    this.shapes.forEach((shape, index) => {
      if (shape.values) {
        if (shape[stateName]) shape.values.forEach(sample => ShapeStates.push(sample));
      } else {
        if (shape[stateName] && !(shape instanceof SelectionBox)) ShapeStates.push(index);
      }
    });
    return ShapeStates
  }
}
