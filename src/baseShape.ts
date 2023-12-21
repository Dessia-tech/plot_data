import { DEFAULT_SHAPE_COLOR, HOVERED_SHAPE_COLOR, CLICKED_SHAPE_COLOR, SELECTED_SHAPE_COLOR, STROKE_STYLE_OFFSET } from "./constants"
import { hslToArray, colorHsl } from "./colors"
import { Hatching } from "./styles"
import { DataInterface } from "./dataInterfaces"

export class Vertex {
  constructor(public x: number = 0, public y: number = 0) { }

  get coordinates(): [number, number] { return [this.x, this.y] }

  get normL1(): number { return Math.abs(this.x) + Math.abs(this.y) }

  get norm(): number { return (this.x ** 2 + this.y ** 2) ** 0.5 }

  get min(): number { return Math.min(this.x, this.y)}

  get max(): number { return Math.max(this.x, this.y)}

  public copy(): Vertex { return new Vertex(this.x, this.y) }

  public add(other: Vertex): Vertex {
    let copy = this.copy();
    copy.x = this.x + other.x;
    copy.y = this.y + other.y;
    return copy
  }

  public divide(value: number): Vertex {
    let copy = this.copy();
    copy.x = this.x / value;
    copy.y = this.y / value;
    return copy
  }

  public multiply(value: number): Vertex {
    let copy = this.copy();
    copy.x = this.x * value;
    copy.y = this.y * value;
    return copy
  }

  public distance(other: Vertex): number { return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2) }

  public scale(scale: Vertex): Vertex {
    let copy = this.copy();
    copy.x = this.x * scale.x;
    copy.y = this.y * scale.y;
    return copy
  }

  public translate(translation: Vertex): Vertex { return this.add(translation) }

  public translateSelf(translation: Vertex): void {
    this.x += translation.x;
    this.y += translation.y;
  }

  public subtract(other: Vertex): Vertex {
    let copy = this.copy();
    copy.x = this.x - other.x;
    copy.y = this.y - other.y;
    return copy
  }

  public transform(matrix: DOMMatrix): Vertex {
    let copy = this.copy();
    copy.x = matrix.a * this.x + matrix.c * this.y + matrix.e;
    copy.y = matrix.b * this.x + matrix.d * this.y + matrix.f;
    return copy
  }

  public transformSelf(matrix: DOMMatrix): void {
    this.x = matrix.a * this.x + matrix.c * this.y + matrix.e;
    this.y = matrix.b * this.x + matrix.d * this.y + matrix.f;
  }
}

export class InteractiveObject {
  public path: Path2D = new Path2D();
  public drawnPath: Path2D = new Path2D();
  public inStrokeScale: Vertex = new Vertex(1, 1);

  public mouseClick: Vertex = null;

  public isHovered: boolean = false;
  public isClicked: boolean = false;
  public isSelected: boolean = false;
  public isScaled: boolean = true;
  public isFilled: boolean = true;
  public visible: boolean = true;
  public inFrame: boolean = true; // TODO: remove it

  constructor() { };

  public getBounds(): [Vertex, Vertex] { return [new Vertex(0, 1), new Vertex(0, 1)] }

  protected updateTooltipOrigin(matrix: DOMMatrix): void { }

  public buildPath(): void { }

  protected buildScaledPath(context: CanvasRenderingContext2D, contextMatrix: DOMMatrix): void {
    this.drawnPath.addPath(this.path, new DOMMatrix().scale(contextMatrix.a, contextMatrix.d));
    context.scale(1 / contextMatrix.a, 1 / contextMatrix.d);
    this.inStrokeScale = new Vertex(1 / contextMatrix.a, 1 / contextMatrix.d);
  }

  protected buildUnscaledPath(context: CanvasRenderingContext2D): Path2D {
    context.resetTransform();
    return this.path
  }

  protected buildDrawPath(context: CanvasRenderingContext2D): void {
    const contextMatrix = context.getTransform();
    this.drawnPath = new Path2D();
    this.updateTooltipOrigin(contextMatrix);
    if (this.isScaled) this.buildScaledPath(context, contextMatrix)
    else this.drawnPath.addPath(this.buildUnscaledPath(context));
  }

  protected drawPath(context: CanvasRenderingContext2D): void {
    if (this.isFilled) context.fill(this.drawnPath);
    context.stroke(this.drawnPath);
  }

  protected drawMembers(context: CanvasRenderingContext2D): void { }

  protected computeContextualAttributes(context: CanvasRenderingContext2D): void { }

  public setDrawingProperties(context: CanvasRenderingContext2D) { }

  public draw(context: CanvasRenderingContext2D): void {
    if (this.visible) {
      context.save();
      this.computeContextualAttributes(context);
      this.buildDrawPath(context);
      this.setDrawingProperties(context);
      this.drawPath(context);
      context.restore();
      this.drawMembers(context);
    }
  }

  public isPointInShape(context: CanvasRenderingContext2D, point: Vertex): boolean {
    if (this.isFilled) return context.isPointInPath(this.path, point.x, point.y);
    return this.isPointInStroke(context, point)
  }

  protected isPointInStroke(context: CanvasRenderingContext2D, point: Vertex): boolean {
    let isHovered: boolean;
    const contextMatrix = context.getTransform();
    const contextLineWidth = context.lineWidth;
    context.lineWidth = 10;
    if (this.isScaled) {
      context.scale(this.inStrokeScale.x, this.inStrokeScale.y);
      isHovered = context.isPointInStroke(this.drawnPath, point.x, point.y);
    } else isHovered = context.isPointInStroke(this.path, point.x, point.y);
    context.setTransform(contextMatrix);
    context.lineWidth = contextLineWidth;
    return isHovered
  }

  public mouseDown(mouseDown: Vertex) { if (this.isHovered) this.mouseClick = mouseDown.copy() }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void { this.isHovered = this.isPointInShape(context, mouseCoords) }

  public mouseUp(keepState: boolean): void {
    this.isClicked = this.isHovered ? !this.isClicked : (keepState ? this.isClicked : false);
  }
}


export class Shape extends InteractiveObject {
  public lineWidth: number = 1;
  public dashLine: number[] = [];
  public hatching: Hatching = null;
  public strokeStyle: string = null;
  public fillStyle: string = DEFAULT_SHAPE_COLOR;
  public hoverStyle: string = HOVERED_SHAPE_COLOR;
  public clickedStyle: string = CLICKED_SHAPE_COLOR;
  public selectedStyle: string = SELECTED_SHAPE_COLOR;
  public alpha: number = 1;

  public tooltipOrigin: Vertex = null;
  protected _tooltipMap = new Map<string, any>();
  public hasTooltip: boolean = true;

  constructor() { super() };

  get tooltipMap(): Map<string, any> { return this._tooltipMap }

  set tooltipMap(value: Map<string, any>) { this._tooltipMap = value }

  get tooltipFlip(): boolean { return false }

  get drawingStyle(): { [key: string]: any } {
    const style = {};
    style["lineWidth"] = this.lineWidth;
    style["dashLine"] = this.dashLine;
    style["hatching"] = this.hatching;
    style["strokeStyle"] = this.strokeStyle;
    style["fillStyle"] = this.fillStyle;
    style["alpha"] = this.alpha;
    return style
  }

  public deserializeStyle(data: DataInterface): void {
    this.deserializeEdgeStyle(data);
    this.deserializeSurfaceStyle(data);
    this.deserializeTooltip(data);
  }

  public deserializeEdgeStyle(data: DataInterface): void {
    this.lineWidth = data.edge_style?.line_width ?? this.lineWidth;
    this.dashLine = data.edge_style?.dashline ?? this.dashLine;
    this.strokeStyle = data.edge_style?.color_stroke ? colorHsl(data.edge_style.color_stroke) : null;
  }

  public deserializeSurfaceStyle(data: DataInterface): void {
    this.fillStyle = colorHsl(data.surface_style?.color_fill ?? this.fillStyle);
    this.alpha = data.surface_style?.opacity ?? this.alpha;
    this.hatching = data.surface_style?.hatching ? new Hatching("", data.surface_style.hatching.stroke_width, data.surface_style.hatching.hatch_spacing) : null;
  }

  protected deserializeTooltip(data: DataInterface): void { if (data.tooltip) this.tooltipMap.set(data.tooltip, "") }

  public newTooltipMap(): void { this._tooltipMap = new Map<string, any>() }

  public initTooltipOrigin(): void { }

  protected updateTooltipOrigin(matrix: DOMMatrix): void {
    if (this.mouseClick) this.tooltipOrigin = this.mouseClick.transform(matrix);
  }

  public setStrokeStyle(fillStyle: string): string {
    const [h, s, l] = hslToArray(colorHsl(fillStyle));
    const lValue = l <= STROKE_STYLE_OFFSET ? l + STROKE_STYLE_OFFSET : l - STROKE_STYLE_OFFSET;
    return `hsl(${h}, ${s}%, ${lValue}%)`;
  }

  private setContextFillStyle(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.isHovered
        ? this.hoverStyle
        : this.isClicked
          ? this.clickedStyle
          : this.isSelected
            ? this.selectedStyle
            : this.fillStyle;
  }

  private setContextFilledStrokeStyle(context: CanvasRenderingContext2D): void {
    const fillStyle = context.fillStyle.toString();
    context.strokeStyle = (this.isHovered || this.isClicked || this.isSelected)
    ? this.setStrokeStyle(fillStyle)
    : this.strokeStyle
      ? colorHsl(this.strokeStyle)
      : this.setStrokeStyle(fillStyle);
  }

  private setContextEmptyStyle(context: CanvasRenderingContext2D): void {
    context.strokeStyle = this.isHovered
    ? this.hoverStyle
    : this.isClicked
      ? this.clickedStyle
      : this.isSelected
        ? this.selectedStyle
        : this.strokeStyle
          ? colorHsl(this.strokeStyle)
          : 'hsl(0, 0%, 0%)';
  }

  private setContextHatch(context: CanvasRenderingContext2D): void {
    if (this.hatching) context.fillStyle = context.createPattern(this.hatching.buildTexture(context.fillStyle.toString()), 'repeat');
  }

  private setContextFilledStyle(context: CanvasRenderingContext2D): void {
    this.setContextFillStyle(context);
    this.setContextFilledStrokeStyle(context);
    this.setContextHatch(context);
  }

  private setContextStyle(context: CanvasRenderingContext2D): void {
    if (this.isFilled) this.setContextFilledStyle(context)
    else this.setContextEmptyStyle(context);
  }

  private alphaConfiguration(context: CanvasRenderingContext2D): void {
    if (this.alpha == 0) this.isFilled = false
    else if (this.alpha != 1) context.globalAlpha = this.alpha;
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    context.lineWidth = this.lineWidth;
    context.setLineDash(this.dashLine);
    this.alphaConfiguration(context);
    this.setContextStyle(context);
  }
}
