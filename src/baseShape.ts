import { DEFAULT_SHAPE_COLOR, HOVERED_SHAPE_COLOR, CLICKED_SHAPE_COLOR, SELECTED_SHAPE_COLOR, STROKE_STYLE_OFFSET } from "./constants"
import { hslToArray, colorHsl } from "./colors"
import { Hatching } from "./styles"
import { DataInterface } from "./dataInterfaces"

export class Vertex {
  constructor(public x: number = 0, public y: number = 0) { }

  get coordinates(): [number, number] { return [this.x, this.y] }

  get normL1(): number { return Math.abs(this.x) + Math.abs(this.y) }

  get norm(): number { return (this.x ** 2 + this.y ** 2) ** 0.5 }

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

export class Shape {
  public path: Path2D = new Path2D();
  public scaledPath: Path2D = new Path2D();
  public inStrokeScale: Vertex = new Vertex(1, 1);

  public lineWidth: number = 1;
  public dashLine: number[] = [];
  public hatching: Hatching = null;
  public strokeStyle: string = null;
  public fillStyle: string = DEFAULT_SHAPE_COLOR;
  public hoverStyle: string = HOVERED_SHAPE_COLOR;
  public clickedStyle: string = CLICKED_SHAPE_COLOR;
  public selectedStyle: string = SELECTED_SHAPE_COLOR;
  public alpha: number = 1;

  public mouseClick: Vertex = null;
  public isHovered: boolean = false;
  public isClicked: boolean = false;
  public isSelected: boolean = false;
  public isScaled: boolean = true;
  public isFilled: boolean = true;
  public isDrawn: boolean = true;
  public inFrame: boolean = true;

  public tooltipOrigin: Vertex = null;
  protected _tooltipMap = new Map<string, any>();
  public hasTooltip: boolean = true;
  constructor() { };

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

  public newTooltipMap(): void { this._tooltipMap = new Map<string, any>() }

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

  public getBounds(): [Vertex, Vertex] { return [new Vertex(0, 1), new Vertex(0, 1)] }

  protected updateTooltipOrigin(matrix: DOMMatrix): void {
    if (this.mouseClick) this.tooltipOrigin = this.mouseClick.transform(matrix);
  }

  public draw(context: CanvasRenderingContext2D): void {
    context.save();
    const scaledPath = new Path2D();
    const contextMatrix = context.getTransform();
    this.updateTooltipOrigin(contextMatrix);
    if (this.isScaled) {
      scaledPath.addPath(this.path, new DOMMatrix().scale(contextMatrix.a, contextMatrix.d));
      context.scale(1 / contextMatrix.a, 1 / contextMatrix.d);
      this.inStrokeScale = new Vertex(1 / contextMatrix.a, 1 / contextMatrix.d);
    } else scaledPath.addPath(this.buildUnscaledPath(context));
    this.setDrawingProperties(context);
    if (this.isFilled) context.fill(scaledPath);
    context.stroke(scaledPath);
    this.scaledPath = scaledPath;
    context.restore();
  }

  protected buildUnscaledPath(context: CanvasRenderingContext2D): Path2D {
    context.resetTransform();
    const path = new Path2D();
    path.addPath(this.path);
    return path
  }

  public setStrokeStyle(fillStyle: string): string {
    const [h, s, l] = hslToArray(colorHsl(fillStyle));
    const lValue = l <= STROKE_STYLE_OFFSET ? l + STROKE_STYLE_OFFSET : l - STROKE_STYLE_OFFSET;
    return `hsl(${h}, ${s}%, ${lValue}%)`;
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    context.lineWidth = this.lineWidth;
    context.setLineDash(this.dashLine);
    if (this.alpha == 0) this.isFilled = false
    else if (this.alpha != 1) context.globalAlpha = this.alpha;
    if (this.isFilled) {
      context.fillStyle = this.isHovered
        ? this.hoverStyle
        : this.isClicked
          ? this.clickedStyle
          : this.isSelected
            ? this.selectedStyle
            : this.fillStyle;
      context.strokeStyle = (this.isHovered || this.isClicked || this.isSelected)
        ? this.setStrokeStyle(context.fillStyle)
        : this.strokeStyle
          ? colorHsl(this.strokeStyle)
          : this.setStrokeStyle(context.fillStyle);
      if (this.hatching) context.fillStyle = context.createPattern(this.hatching.buildTexture(context.fillStyle), 'repeat');
    } else {
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
  }

  public initTooltipOrigin(): void { }

  public buildPath(): void { }

  public isPointInShape(context: CanvasRenderingContext2D, point: Vertex): boolean {
    if (this.isFilled) return context.isPointInPath(this.path, point.x, point.y);
    return this.isPointInStroke(context, point)
  }

  protected isPointInStroke(context: CanvasRenderingContext2D, point: Vertex): boolean {
    let isHovered: boolean;
    context.save();
    context.resetTransform();
    context.lineWidth = 10;
    if (this.isScaled) {
      context.scale(this.inStrokeScale.x, this.inStrokeScale.y);
      isHovered = context.isPointInStroke(this.scaledPath, point.x, point.y);
    } else isHovered = context.isPointInStroke(this.path, point.x, point.y);
    context.restore();
    return isHovered
  }

  public mouseDown(mouseDown: Vertex) { if (this.isHovered) this.mouseClick = mouseDown.copy() }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void { this.isHovered = this.isPointInShape(context, mouseCoords) }

  public mouseUp(keepState: boolean): void {
    this.isClicked = this.isHovered ? !this.isClicked : (keepState ? this.isClicked : false);
  }
}
