import { MAX_LABEL_HEIGHT } from "./constants"
import { colorHsl } from "./colors";
import { Vertex, newShape, newRect, newText, LineSequence, newLabel } from "./shapes";
import { SelectionBox } from "./shapedObjects";

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
      public shapes: newShape[] = [],
    ) {
      [this.minimum, this.maximum] = this.getBounds();
    }
  
    public get length(): number { return this.shapes.length }
  
    public includes(shape: newShape) { return this.shapes.includes(shape) }
  
    public static fromPrimitives(primitives: { [key: string]: any }, scale: Vertex = new Vertex(1, 1)): ShapeCollection {
      return new ShapeCollection(primitives.map(primitive => newShape.deserialize(primitive, scale)))
    }
  
    public getBounds(): [Vertex, Vertex] {
      let minimum = new Vertex(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
      let maximum = new Vertex(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
      this.shapes.forEach(shape => {
        const [shapeMin, shapeMax] = shape.getBounds();
        if (shapeMin.x <= minimum.x) minimum.x = shapeMin.x; //for NaN reasons, must change
        if (shapeMin.y <= minimum.y) minimum.y = shapeMin.y;
        if (shapeMax.x >= maximum.x) maximum.x = shapeMax.x;
        if (shapeMax.y >= maximum.y) maximum.y = shapeMax.y;
      })
      return [minimum, maximum]
    }
  
    public drawTooltips(canvasOrigin: Vertex, canvasSize: Vertex, context: CanvasRenderingContext2D, inMultiPlot: boolean): void {
      this.shapes.forEach(shape => { if (!inMultiPlot && shape.inFrame) shape.drawTooltip(canvasOrigin, canvasSize, context) });
    }
  
    public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void {
      this.shapes.forEach(shape => shape.mouseMove(context, mouseCoords));
    }
  
    public mouseDown(mouseCoords: Vertex): newShape {
      let clickedObject: newShape = null;
      this.shapes.forEach(shape => {
        shape.mouseDown(mouseCoords);
        if (shape.isHovered) clickedObject = shape; //TODO: still insane ?
      });
      return clickedObject
    }
  
    public mouseUp(keepState: boolean): void { this.shapes.forEach(shape => shape.mouseUp(keepState)) }
  
    public draw(context: CanvasRenderingContext2D): void { this.shapes.forEach(shape => shape.draw(context)) }
  
    public removeShape(index: number): void {
      this.shapes.splice(index, 1);
      [this.minimum, this.maximum] = this.getBounds();
    }
  
    public updateBounds(context: CanvasRenderingContext2D): void {
      this.shapes.forEach(shape => {
        if (shape instanceof newText) {
          shape.format(context);
          shape.updateBoundingBox(context);
          const [textMin, textMax] = shape.getBounds();
          this.minimum.x = Math.min(this.minimum.x, textMin.x);
          this.minimum.y = Math.min(this.minimum.y, textMin.y);
          this.maximum.x = Math.max(this.maximum.x, textMax.x);
          this.maximum.y = Math.max(this.maximum.y, textMax.y);
        }
      })
      if (Number.isNaN(this.minimum.x)) this.minimum.x = this.maximum.x - 1;
      if (Number.isNaN(this.minimum.y)) this.minimum.y = this.maximum.y - 1;
      if (Number.isNaN(this.maximum.x)) this.maximum.x = this.maximum.x + 1;
      if (Number.isNaN(this.maximum.y)) this.maximum.y = this.maximum.y + 1;
    }
  
    public updateShapeStates(stateName: string): number[] {
      const newShapeStates = [];
      this.shapes.forEach((shape, index) => {
        if (shape[stateName] && !(shape instanceof SelectionBox)) newShapeStates.push(index);
      });
      return newShapeStates
    }
  
    public resetShapeStates(): void {
      this.shapes.forEach(shape => shape.isHovered = shape.isClicked = shape.isSelected = false);
    }
  
    public locateLabels(drawingZone: newRect, initScale: Vertex): void {
      const nLabels = 0.5 * initScale.y;
      const labels: newLabel[] = [];
      const others = [];
      this.shapes.forEach(shape => {
        if (shape instanceof newLabel) labels.push(shape)
        else others.push(shape);
      })
      if (labels.length != 0) {
        const labelHeight = Math.min(Math.abs(drawingZone.size.y) / (labels.length * 1.75 + 1), MAX_LABEL_HEIGHT);
        labels.forEach((label, index) => {
          label.updateHeight(labelHeight);
          label.updateOrigin(drawingZone, initScale, index - nLabels);
        });
  
      }
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
      this.shapes.forEach(shape => { if ((this.shapeIsContainer(shape) || !inMultiPlot) && shape.inFrame) shape.drawTooltip(canvasOrigin, canvasSize, context) });
    }
  
    public updateShapeStates(stateName: string): number[] {
      const newShapeStates = [];
      this.shapes.forEach((shape, index) => {
        if (shape.values) {
          if (shape[stateName]) shape.values.forEach(sample => newShapeStates.push(sample));
        } else {
          if (shape[stateName] && !(shape instanceof SelectionBox)) newShapeStates.push(index);
        }
      });
      return newShapeStates
    }
  }
  