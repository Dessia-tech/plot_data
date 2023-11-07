import { MAX_LABEL_HEIGHT, TEXT_SEPARATORS, DEFAULT_FONTSIZE, DEFAULT_SHAPE_COLOR, 
  HOVERED_SHAPE_COLOR, CLICKED_SHAPE_COLOR, SELECTED_SHAPE_COLOR, STROKE_STYLE_OFFSET,
  TOOLTIP_PRECISION, TOOLTIP_TRIANGLE_SIZE, TOOLTIP_TEXT_OFFSET, 
  CIRCLES, MARKERS, TRIANGLES, SQUARES, CROSSES, HALF_LINES } from "./constants";
import { hslToArray, colorHsl } from "./colors";
import { HatchingSet, newPointStyle } from "./styles";

// TODO: There is some problem of circular imports. Shapes should be divided in two or three subclasses to get light files

export class Vertex {
  constructor(public x: number = 0, public y: number = 0) { }

  get coordinates(): [number, number] { return [this.x, this.y] }

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

  public distance(other: Vertex): number { return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2) }

  public multiply(value: number): Vertex {
    let copy = this.copy();
    copy.x = this.x * value;
    copy.y = this.y * value;
    return copy
  }

  public get normL1(): number { return Math.abs(this.x) + Math.abs(this.y) }

  public get norm(): number { return (this.x ** 2 + this.y ** 2) ** 0.5 }

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

export class newShape {
  public path: Path2D = new Path2D();
  public scaledPath: Path2D = new Path2D();
  public inStrokeScale: Vertex = new Vertex(1, 1);

  public lineWidth: number = 1;
  public dashLine: number[] = [];
  public hatching: HatchingSet;
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
  public inFrame: boolean = true;

  public tooltipOrigin: Vertex;
  protected _tooltipMap = new Map<string, any>();
  public hasTooltip: boolean = true;
  constructor() { };

  get tooltipMap(): Map<string, any> { return this._tooltipMap };

  set tooltipMap(value: Map<string, any>) { this._tooltipMap = value };

  public newTooltipMap(): void { this._tooltipMap = new Map<string, any>() };

  public get drawingStyle(): { [key: string]: any } {
    const style = {};
    style["lineWidth"] = this.lineWidth;
    style["dashLine"] = this.dashLine;
    style["hatching"] = this.hatching;
    style["strokeStyle"] = this.strokeStyle;
    style["fillStyle"] = this.fillStyle;
    style["alpha"] = this.alpha;
    return style
  }

  public styleToLegend(legendOrigin: Vertex, legendSize: Vertex): LineSegment | newRect | newPoint2D {
    if (!this.isFilled) return new LineSegment(legendOrigin.copy(), legendOrigin.add(legendSize))
    return new newRect(legendOrigin.copy(), legendSize);
  }

  public static deserialize(data: { [key: string]: any }, scale: Vertex): newShape {
    let shape: newShape;
    if (data.type_ == "circle") shape = newCircle.deserialize(data, scale)
    else if (data.type_ == "contour") shape = Contour.deserialize(data, scale);
    else if (data.type_ == "line2d") shape = Line.deserialize(data, scale);
    else if (data.type_ == "linesegment2d") shape = LineSegment.deserialize(data, scale);
    else if (data.type_ == "wire") shape = LineSequence.deserialize(data, scale);
    else if (data.type_ == "point") shape = newPoint2D.deserialize(data, scale);
    else if (data.type_ == "arc") shape = Arc.deserialize(data, scale);
    else if (data.type_ == "text") return newText.deserialize(data, scale);
    else if (data.type_ == "label") shape = newLabel.deserialize(data, scale);
    else if (data.type_ == "rectangle") shape = newRect.deserialize(data, scale);
    else if (data.type_ == "roundrectangle") shape = newRoundRect.deserialize(data, scale);
    else throw new Error(`${data.type_} deserialization is not implemented.`);
    shape.deserializeStyle(data)
    return shape
  }

  public deserializeStyle(data: any): void {
    this.deserializeEdgeStyle(data);
    this.deserializeSurfaceStyle(data);
    this.deserializeTooltip(data);
  }

  public deserializeEdgeStyle(data: any): void {
    this.lineWidth = data.edge_style?.line_width ?? this.lineWidth;
    this.dashLine = data.edge_style?.dashline ?? this.dashLine;
    this.strokeStyle = data.edge_style?.color_stroke ? colorHsl(data.edge_style.color_stroke) : null;
  }

  public deserializeSurfaceStyle(data: any): void {
    this.fillStyle = colorHsl(data.surface_style?.color_fill ?? this.fillStyle);
    this.alpha = data.surface_style?.opacity ?? this.alpha;
    this.hatching = data.surface_style?.hatching ? new HatchingSet("", data.surface_style.hatching.stroke_width, data.surface_style.hatching.hatch_spacing) : null;
  }

  protected deserializeTooltip(data: any): void { if (data.tooltip) this.tooltipMap.set(data.tooltip, "") }

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
      context.fillStyle = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.isSelected ? this.selectedStyle : this.fillStyle;
      context.strokeStyle = (this.isHovered || this.isClicked || this.isSelected) ? this.setStrokeStyle(context.fillStyle) : this.strokeStyle ? colorHsl(this.strokeStyle) : this.setStrokeStyle(context.fillStyle);
      if (this.hatching) context.fillStyle = context.createPattern(this.hatching.generate_canvas(context.fillStyle), 'repeat');
    } else context.strokeStyle = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.isSelected ? this.selectedStyle : this.strokeStyle ? colorHsl(this.strokeStyle) : 'hsl(0, 0%, 0%)';
  }

  public initTooltip(context: CanvasRenderingContext2D): newTooltip { return new newTooltip(this.tooltipOrigin, this.tooltipMap, context) }

  public drawTooltip(plotOrigin: Vertex, plotSize: Vertex, context: CanvasRenderingContext2D): void {
    if (this.isClicked && this.tooltipMap.size != 0) {
      const tooltip = this.initTooltip(context);
      tooltip.draw(plotOrigin, plotSize, context);
    }
  }

  public buildPath(): void { }

  public isPointInShape(context: CanvasRenderingContext2D, point: Vertex): boolean {
    if (this.isFilled) return context.isPointInPath(this.path, point.x, point.y);
    return this.isPointInStroke(context, point)
  }

  protected isPointInStroke(context: CanvasRenderingContext2D, point: Vertex): boolean {
    let isHovered: boolean
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
  
export class Arc extends newShape {
  constructor(
    public center: Vertex,
    public radius: number,
    public startAngle: number,
    public endAngle: number,
    public clockWise: boolean = true
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }

  public buildPath(): void {
    this.path = new Path2D();
    this.drawInContour(this.path);
  }

  public drawInContour(path: Path2D): void {
    path.arc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle, this.clockWise);
  }

  public static deserialize(data: any, scale: Vertex): Arc {
    const arc = new Arc(new Vertex(data.cx, data.cy), data.r, data.start_angle, data.end_angle, data.clockwise ?? true);
    arc.deserializeEdgeStyle(data);
    return arc
  }

  public getBounds(): [Vertex, Vertex] {
    return [
      new Vertex(this.center.x - this.radius, this.center.y - this.radius),
      new Vertex(this.center.x + this.radius, this.center.y + this.radius)
    ]
  }
}

export class newCircle extends Arc {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public radius: number = 1
  ) {
    super(center, radius, 0, 2 * Math.PI);
    this.isFilled = true;
  }

  public static deserialize(data: any, scale: Vertex): newCircle {
    const circle = new newCircle(new Vertex(data.cx, data.cy), data.r);
    circle.deserializeEdgeStyle(data);
    circle.deserializeSurfaceStyle(data);
    return circle
  }
}

export class newRect extends newShape {
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public size: Vertex = new Vertex(0, 0)
  ) {
    super();
    this.buildPath();
  }

  get area(): number { return this.size.x * this.size.y }

  public buildPath(): void {
    this.path = new Path2D();
    this.path.rect(this.origin.x, this.origin.y, this.size.x, this.size.y);
  }

  public static deserialize(data: any, scale: Vertex): newRect {
    const rectangle = new newRect(new Vertex(data.x_coord, data.y_coord), new Vertex(data.width, data.height));
    return rectangle
  }

  public deserializeStyle

  public translate(translation: Vertex): void {
    this.origin = this.origin.add(translation);
    this.buildPath();
  }

  public get center(): Vertex { return this.origin.add(this.size).scale(new Vertex(0.5, 0.5)) }

  public getBounds(): [Vertex, Vertex] { return [this.origin, this.origin.add(new Vertex(Math.abs(this.size.x), Math.abs(this.size.y)))] }
}

export class newRoundRect extends newRect {
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public size: Vertex = new Vertex(0, 0),
    public radius: number = 2
  ) {
    super();
    this.buildPath();
  }

  public buildPath(): void {
    this.path = new Path2D();
    const hLength = this.origin.x + this.size.x;
    const vLength = this.origin.y + this.size.y;
    this.path.moveTo(this.origin.x + this.radius, this.origin.y);
    this.path.lineTo(hLength - this.radius, this.origin.y);
    this.path.quadraticCurveTo(hLength, this.origin.y, hLength, this.origin.y + this.radius);
    this.path.lineTo(hLength, this.origin.y + this.size.y - this.radius);
    this.path.quadraticCurveTo(hLength, vLength, hLength - this.radius, vLength);
    this.path.lineTo(this.origin.x + this.radius, vLength);
    this.path.quadraticCurveTo(this.origin.x, vLength, this.origin.x, vLength - this.radius);
    this.path.lineTo(this.origin.x, this.origin.y + this.radius);
    this.path.quadraticCurveTo(this.origin.x, this.origin.y, this.origin.x + this.radius, this.origin.y);
  }

  public static deserialize(data: any, scale: Vertex): newRect {
    const roundRectangle = new newRoundRect(new Vertex(data.x_coord, data.y_coord), new Vertex(data.width, data.height), data.radius);
    return roundRectangle
  }
}

export class Mark extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }

  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y);
    this.path.lineTo(this.center.x + halfSize, this.center.y);
    this.path.moveTo(this.center.x, this.center.y - halfSize);
    this.path.lineTo(this.center.x, this.center.y + halfSize);
  }

  public getBounds(): [Vertex, Vertex] {
    const halfSize = this.size / 2;
    const halfSizeVertex = new Vertex(halfSize, halfSize);
    return [this.center.subtract(halfSizeVertex), this.center.add(halfSizeVertex)]
  }
}

export abstract class AbstractHalfLine extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }

  public get drawingStyle(): { [key: string]: any } {
    return { ...super.drawingStyle, "orientation": this.orientation }
  }

  public getBounds(): [Vertex, Vertex] {
    const halfSize = this.size / 2;
    const halfSizeVertex = new Vertex(halfSize, halfSize);
    return [this.center.subtract(halfSizeVertex), this.center.add(halfSizeVertex)]
  }
}

export class UpHalfLine extends AbstractHalfLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x, this.center.y);
    this.path.lineTo(this.center.x, this.center.y + halfSize);
  }
}

export class DownHalfLine extends AbstractHalfLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x, this.center.y);
    this.path.lineTo(this.center.x, this.center.y - halfSize);
  }
}

export class LeftHalfLine extends AbstractHalfLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x, this.center.y);
    this.path.lineTo(this.center.x - halfSize, this.center.y);
  }
}

export class RightHalfLine extends AbstractHalfLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x, this.center.y);
    this.path.lineTo(this.center.x + halfSize, this.center.y);
  }
}

export class HalfLine extends AbstractHalfLine {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super(center, size, orientation);
    this.buildPath();
  }

  public buildPath(): void {
    if (this.orientation == 'up') this.path = new UpHalfLine(this.center, this.size).path;
    if (this.orientation == 'down') this.path = new DownHalfLine(this.center, this.size).path;
    if (this.orientation == 'left') this.path = new LeftHalfLine(this.center, this.size).path;
    if (this.orientation == 'right') this.path = new RightHalfLine(this.center, this.size).path;
    if (!['up', 'down', 'left', 'right'].includes(this.orientation)) throw new Error(`Orientation halfline ${this.orientation} is unknown.`);
  }
}

export class Line extends newShape {
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public end: Vertex = new Vertex(0, 0)
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }

  private computeSlope(): number {
    return (this.end.y - this.origin.y) / (this.end.x - this.origin.x);
  }

  private computeAffinity(slope: number): number {
    return this.origin.y - slope * this.origin.x
  }

  public getEquation(): [number, number] {
    const slope = this.computeSlope();
    const affinity = this.computeAffinity(slope);
    return [slope, affinity]
  }

  public static deserialize(data: any, scale: Vertex): Line { // TODO: Don't know how to factor this and the LineSegment one
    const line = new Line(new Vertex(data.point1[0], data.point1[1]), new Vertex(data.point2[0], data.point2[1]));
    return line
  }

  public buildPath(): void {
    const infiniteFactor = 1e3;
    const [slope, affinity] = this.getEquation();
    if (this.end.x == this.origin.x) {
      this.path = new LineSegment(new Vertex(this.origin.x, -this.end.y * infiniteFactor), new Vertex(this.origin.x, this.end.y * infiniteFactor)).path;
    } else {
      const fakeOrigin = new Vertex(-infiniteFactor, 0);
      const fakeEnd = new Vertex(infiniteFactor, 0);
      if (this.origin.x != 0) {
        fakeOrigin.x *= this.origin.x;
        fakeEnd.x *= this.origin.x;
      }
      fakeOrigin.y = fakeOrigin.x * slope + affinity;
      fakeEnd.y = fakeEnd.x * slope + affinity;
      this.path = new LineSegment(fakeOrigin, fakeEnd).path;
    }
  }

  public getBounds(): [Vertex, Vertex] {
    const minX = Math.min(this.origin.x, this.end.x);
    const minY = Math.min(this.origin.y, this.end.y);
    const maxX = Math.max(this.origin.x, this.end.x);
    const maxY = Math.max(this.origin.y, this.end.y);
    return [new Vertex(minX, minY), new Vertex(maxX, maxY)]
  }
}

export class LineSegment extends Line {
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public end: Vertex = new Vertex(0, 0)
  ) {
    super(origin, end);
  }

  public buildPath(): void {
    this.path = new Path2D();
    this.path.moveTo(this.origin.x, this.origin.y);
    this.drawInContour(this.path);
  }

  public static deserialize(data: any, scale: Vertex): LineSegment {
    const line = new LineSegment(new Vertex(data.point1[0], data.point1[1]), new Vertex(data.point2[0], data.point2[1]));
    line.deserializeEdgeStyle(data);
    return line
  }

  public drawInContour(path: Path2D): void { path.lineTo(this.end.x, this.end.y) }
}

export abstract class AbstractLinePoint extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }

  public get drawingStyle(): { [key: string]: any } {
    return { ...super.drawingStyle, "orientation": this.orientation }
  }

  public getBounds(): [Vertex, Vertex] {
    const halfSize = this.size / 2;
    const halfSizeVertex = new Vertex(halfSize, halfSize);
    return [this.center.subtract(halfSizeVertex), this.center.add(halfSizeVertex)]
  }
}

export class VerticalLinePoint extends AbstractLinePoint {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x, this.center.y - halfSize);
    this.path.lineTo(this.center.x, this.center.y + halfSize);
  }
}

export class HorizontalLinePoint extends AbstractLinePoint {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y);
    this.path.lineTo(this.center.x + halfSize, this.center.y);
  }
}

export class PositiveLinePoint extends AbstractLinePoint {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y + halfSize);
  }
}

export class NegativeLinePoint extends AbstractLinePoint {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y + halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y - halfSize);
  }
}

export class LinePoint extends AbstractLinePoint {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'vertical'
  ) {
    super(center, size, orientation);
    this.buildPath();
  }

  public buildPath(): void {
    if (this.orientation == 'vertical') this.path = new VerticalLinePoint(this.center, this.size).path;
    if (this.orientation == 'horizontal') this.path = new HorizontalLinePoint(this.center, this.size).path;
    if (['slash', 'positive'].includes(this.orientation)) this.path = new PositiveLinePoint(this.center, this.size).path;
    if (['backslash', 'negative'].includes(this.orientation)) this.path = new NegativeLinePoint(this.center, this.size).path;
    if (!['vertical', 'horizontal', 'slash', 'backslash', 'positive', 'negative'].includes(this.orientation)) throw new Error(`Orientation ${this.orientation} is unknown.`);
  }
}

export class Cross extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }

  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y + halfSize);
    this.path.moveTo(this.center.x - halfSize, this.center.y + halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y - halfSize);
  }

  public getBounds(): [Vertex, Vertex] {
    const halfSize = this.size / 2;
    const halfSizeVertex = new Vertex(halfSize, halfSize);
    return [this.center.subtract(halfSizeVertex), this.center.add(halfSizeVertex)]
  }
}

export abstract class AbstractTriangle extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super();
    this.buildPath();
  }

  public get drawingStyle(): { [key: string]: any } {
    return { ...super.drawingStyle, "orientation": this.orientation }
  }

  public abstract buildPath(): void;

  public getBounds(): [Vertex, Vertex] {
    const halfSize = this.size / 2;
    const halfSizeVertex = new Vertex(halfSize, halfSize);
    return [this.center.subtract(halfSizeVertex), this.center.add(halfSizeVertex)]
  }
}

export class UpTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x, this.center.y + halfSize);
    this.path.closePath();
  }
}

export class DownTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x + halfSize, this.center.y + halfSize);
    this.path.lineTo(this.center.x, this.center.y - halfSize);
    this.path.lineTo(this.center.x - halfSize, this.center.y + halfSize);
    this.path.closePath();
  }
}

export class LeftTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x + halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x - halfSize, this.center.y);
    this.path.lineTo(this.center.x + halfSize, this.center.y + halfSize);
    this.path.closePath();
  }
}

export class RightTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y);
    this.path.lineTo(this.center.x - halfSize, this.center.y + halfSize);
    this.path.closePath();
  }
}

export class Triangle extends AbstractTriangle {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super();
    this.buildPath();
  }

  public buildPath(): void {
    if (this.orientation == 'up') this.path = new UpTriangle(this.center, this.size).path
    if (this.orientation == 'down') this.path = new DownTriangle(this.center, this.size).path
    if (this.orientation == 'right') this.path = new RightTriangle(this.center, this.size).path
    if (this.orientation == 'left') this.path = new LeftTriangle(this.center, this.size).path
    if (!['up', 'down', 'left', 'right'].includes(this.orientation)) throw new Error(`Orientation ${this.orientation} is unknown.`);
  }
}

export class Contour extends newShape {
  constructor(
    public lines: (Arc | LineSegment)[] = [],
    public isFilled: boolean = false
  ) {
    super();
    this.buildPath();
  }

  public static deserialize(data: any, scale: Vertex): Contour {
    const lines = data.plot_data_primitives.map(primitive => newShape.deserialize(primitive, scale));
    const contour = new Contour(lines, data.is_filled ?? false);
    contour.deserializeEdgeStyle(data);
    if (contour.isFilled) contour.deserializeSurfaceStyle(data);
    return contour
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    super.setDrawingProperties(context);
    context.strokeStyle = "hsla(0, 0%, 100%, 0)";
  }

  private setLineStyle(context: CanvasRenderingContext2D, line: newShape): void {
    line.dashLine = line.dashLine.length != 0 ? line.dashLine : this.dashLine;
    line.strokeStyle = line.strokeStyle ?? this.strokeStyle;
    line.lineWidth = line.lineWidth != 1 ? line.lineWidth : this.lineWidth;
    line.isHovered = this.isHovered;
    line.isClicked = this.isClicked;
    line.isSelected = this.isSelected;
  }

  public draw(context: CanvasRenderingContext2D): void {
    super.draw(context);
    context.save();
    super.setDrawingProperties(context);
    this.lines.forEach(line => {
      this.setLineStyle(context, line);
      line.draw(context)
    });
    context.restore();
  }

  public buildPath(): void {
    this.path = new Path2D();
    if (this.lines[0] instanceof LineSegment) this.path.moveTo(this.lines[0].origin.x, this.lines[0].origin.y);
    this.lines.forEach(line => line.drawInContour(this.path));
    if (this.isFilled) this.path.closePath();
  }

  public getBounds(): [Vertex, Vertex] {
    let minimum = new Vertex(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    let maximum = new Vertex(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
    this.lines.forEach(line => {
      const [shapeMin, shapeMax] = line.getBounds();
      if (shapeMin.x <= minimum.x) minimum.x = shapeMin.x;
      if (shapeMin.y <= minimum.y) minimum.y = shapeMin.y;
      if (shapeMax.x >= maximum.x) maximum.x = shapeMax.x;
      if (shapeMax.y >= maximum.y) maximum.y = shapeMax.y;
    })
    return [minimum, maximum]
  }
}

export interface TextParams {
  width?: number,
  height?: number,
  fontsize?: number,
  multiLine?: boolean,
  font?: string,
  align?: string,
  baseline?: string,
  style?: string,
  orientation?: number,
  backgroundColor?: string,
  color?: string,
  scale?: Vertex
}

export class newText extends newShape {
  public scale: Vertex = new Vertex(1, 1);
  public fillStyle: string = 'hsl(0, 0%, 0%)';
  public width: number;
  public height: number;
  public fontsize: number;
  public font: string;
  public align: string;
  public baseline: string;
  public style: string;
  public orientation: number;
  public multiLine: boolean;
  public rowIndices: number[] = [];
  public boundingBox: newRect;
  public offset: number = 0;
  private words: string[];
  constructor(
    public text: string,
    public origin: Vertex,
    { width = null,
      height = null,
      fontsize = null,
      multiLine = false,
      font = 'sans-serif',
      align = 'left',
      baseline = 'top',
      style = '',
      orientation = 0,
      color = "hsl(0, 0%, 0%)",
      backgroundColor = "hsla(0, 0%, 100%, 0)",
      scale = new Vertex(1, 1)
    }: TextParams = {}) {
    super();
    this.boundingBox = new newRect(origin, new Vertex(width, height));
    this.boundingBox.fillStyle = backgroundColor;
    this.boundingBox.strokeStyle = backgroundColor;
    this.boundingBox.lineWidth = 1e-6; //TODO: this is a HOT FIX
    this.fontsize = fontsize;
    this.multiLine = multiLine;
    this.font = font;
    this.style = style;
    this.orientation = orientation;
    this.fillStyle = color;
    this.words = this.getWords();
    this.align = align;
    this.baseline = baseline;
    this.scale = scale;
  }

  private static buildFont(style: string, fontsize: number, font: string): string { return `${style} ${fontsize}px ${font}` }

  public static deserializeTextParams(data: any): TextParams {
    const style = `${data.text_style?.bold ? "bold" : ""}${data.text_style?.bold || data.text_style?.italic ? " " : ""}${data.text_style?.italic ? "italic" : ""}`;
    return {
      width: data.max_width,
      height: data.height,
      fontsize: data.text_style?.font_size,
      multiLine: data.multi_lines,
      font: data.text_style?.font,
      align: data.text_style?.text_align_x,
      baseline: data.text_style?.text_align_y,
      style: style,
      orientation: data.text_style?.angle,
      color: data.text_style?.text_color
    } as TextParams
  }

  public static deserialize(data: any, scale: Vertex): newText {
    const textParams = newText.deserializeTextParams(data);
    const text = new newText(data.comment, new Vertex(data.position_x, data.position_y), textParams);
    text.isScaled = data.text_scaling ?? false;
    text.scale = new Vertex(scale.x, scale.y);
    return text
  }

  get fullFont(): string { return newText.buildFont(this.style, this.fontsize, this.font) }

  private getCornersUnscaled(): [Vertex, Vertex] {
    const firstCorner = this.origin.copy();
    const secondCorner = firstCorner.copy();
    const xMinMaxFactor = Math.sign(secondCorner.x) * 0.01 * Math.sign(this.scale.x);
    const yMinMaxFactor = Math.sign(secondCorner.y) * 0.01 * Math.sign(this.scale.y);
    if (this.align == "center") {
      firstCorner.x *= 0.99;
      secondCorner.x *= 1.01;
    } else if (["right", "end"].includes(this.align)) {
      if (secondCorner.x != 0) secondCorner.x *= 1 - xMinMaxFactor;
      else secondCorner.x = -Math.sign(this.scale.x);
    } else if (["left", "start"].includes(this.align)) {
      if (secondCorner.x != 0) secondCorner.x *= 1 + xMinMaxFactor;
      else secondCorner.x = Math.sign(this.scale.x);
    }
    if (this.baseline == "middle") {
      firstCorner.y *= 0.99;
      secondCorner.y *= 1.01;
    } else if (["top", "hanging"].includes(this.baseline)) {
      if (secondCorner.y != 0) secondCorner.y *= 1 + yMinMaxFactor;
      else secondCorner.y = Math.sign(this.scale.y);
    } else if (["bottom", "alphabetic"].includes(this.baseline)) {
      if (secondCorner.y != 0) secondCorner.y *= 1 - yMinMaxFactor;
      else secondCorner.y = -Math.sign(this.scale.y);
    }
    return [firstCorner, secondCorner]
  }

  private getCornersScaled(): [Vertex, Vertex] {
    const firstCorner = this.boundingBox.origin.copy();
    const diagonalVector = this.boundingBox.size.copy();
    const secondCorner = firstCorner.add(diagonalVector);
    return [firstCorner, secondCorner]
  }

  public getBounds(): [Vertex, Vertex] {
    const [firstCorner, secondCorner] = this.isScaled ? this.getCornersScaled() : this.getCornersUnscaled();
    return [
      new Vertex(Math.min(firstCorner.x, secondCorner.x), Math.min(firstCorner.y, secondCorner.y)),
      new Vertex(Math.max(firstCorner.x, secondCorner.x), Math.max(firstCorner.y, secondCorner.y))
    ]
  }

  private automaticFontSize(context: CanvasRenderingContext2D): number {
    let fontsize = Math.min(this.boundingBox.size.y ?? Number.POSITIVE_INFINITY, this.fontsize ?? Number.POSITIVE_INFINITY);
    if (fontsize == Number.POSITIVE_INFINITY) fontsize = DEFAULT_FONTSIZE;
    context.font = newText.buildFont(this.style, fontsize, this.font);
    if (context.measureText(this.text).width >= this.boundingBox.size.x) fontsize = fontsize * this.boundingBox.size.x / context.measureText(this.text).width;
    return fontsize
  }

  private setRectOffsetX(): number {
    if (this.align == "center") return -Math.sign(this.scale.x) * this.width / 2;
    if (["left", "start"].includes(this.align) && this.scale.x < 0) return this.width;
    if ((["right", "end"].includes(this.align) && this.scale.x > 0) || (["left", "start"].includes(this.align) && this.scale.x < 0)) return -this.width;
    return 0;
  }

  private setRectOffsetY(): number {
    if (this.baseline == "middle") return -Math.sign(this.scale.y) * this.height / 2;
    if (["top", "hanging"].includes(this.baseline) && this.scale.y < 0) return this.height;
    if (["bottom", "alphabetic"].includes(this.baseline) && this.scale.y > 0) return -this.fontsize * (this.rowIndices.length - 1);
    return 0;
  }

  public buildPath(): void { this.path = this.boundingBox.path }

  public static capitalize(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1) }

  public capitalizeSelf(): void { this.text = newText.capitalize(this.text) }

  public updateBoundingBox(context: CanvasRenderingContext2D): void {
    const matrix = context.getTransform();
    this.boundingBox.origin = this.origin.copy();
    this.boundingBox.origin.x += this.setRectOffsetX() / (this.isScaled ? Math.sign(this.scale.x) : matrix.a);
    this.boundingBox.origin.y += this.setRectOffsetY() / (this.isScaled ? Math.sign(this.scale.y) : matrix.d);
    this.boundingBox.size.x = this.width;
    this.boundingBox.size.y = this.height;
    if (!this.isScaled) {
      const boundingBox = new newRect(this.boundingBox.origin.copy(), this.boundingBox.size.scale(new Vertex(Math.abs(1 / matrix.a), Math.abs(1 / matrix.d))));
      boundingBox.buildPath();
      this.boundingBox.path = boundingBox.path;
    } else this.boundingBox.buildPath();
  }

  public draw(context: CanvasRenderingContext2D): void {
    if (this.text) {
      const contextMatrix = context.getTransform();
      const origin = this.origin.transform(contextMatrix);
      context.save();
      this.setBoundingBoxState();
      const writtenText = this.cleanStartAllRows(this.rowIndices.length == 0 ? this.format(context) : this.formattedTextRows());
      this.updateBoundingBox(context);
      this.buildPath();
      this.boundingBox.draw(context);

      context.font = this.fullFont;
      context.textAlign = this.align as CanvasTextAlign;
      context.textBaseline = this.baseline as CanvasTextBaseline;
      context.fillStyle = this.fillStyle;
      context.globalAlpha = this.alpha;

      context.resetTransform();
      context.translate(origin.x, origin.y);
      context.rotate(Math.PI / 180 * this.orientation);
      if (this.isScaled) context.scale(Math.abs(contextMatrix.a), Math.abs(contextMatrix.d));
      this.write(writtenText, context);
      context.restore();
    }
  }

  private setBoundingBoxState(): void {
    this.boundingBox.isHovered = this.isHovered;
    this.boundingBox.isClicked = this.isClicked;
    this.boundingBox.isSelected = this.isSelected;
  }

  public updateParameters(textParams: TextParams): void {
    this.boundingBox.size.x = textParams.width ?? null;
    this.boundingBox.size.y = textParams.height ?? null;
    this.fontsize = textParams.fontsize ?? 12;
    this.multiLine = textParams.multiLine ?? false;
    this.font = textParams.font ?? "sans-serif";
    this.align = textParams.align ?? null;
    this.baseline = textParams.baseline ?? null;
    this.style = textParams.style ?? "";
    this.orientation = textParams.orientation ?? 0;
    this.boundingBox.fillStyle = textParams.backgroundColor ?? "hsla(0, 0%, 100%, 0)";
    this.fillStyle = textParams.color ?? "hsl(0, 0%, 0%)";
    this.scale = textParams.scale;
  }

  private write(writtenText: string[], context: CanvasRenderingContext2D): void {
    context.fillStyle = this.fillStyle;
    const nRows = writtenText.length - 1;
    const middleFactor = this.baseline == "middle" ? 2 : 1;
    if (nRows != 0) writtenText.forEach((row, index) => {
      if (["top", "hanging"].includes(this.baseline)) context.fillText(index == 0 ? newText.capitalize(row) : row, 0, index * this.fontsize + this.offset)
      else context.fillText(index == 0 ? newText.capitalize(row) : row, 0, (index - nRows / middleFactor) * this.fontsize + this.offset);
    })
    else context.fillText(newText.capitalize(writtenText[0]), 0, this.offset / middleFactor);
  }

  public removeEndZeros(): void {
    let splitText = this.text.split(".");
    if (splitText.length > 1) {
      let splitDecimal = splitText[1].split("e");
      let decimal = splitDecimal[0];
      if (decimal) {
        while (decimal[decimal.length - 1] == "0") decimal = decimal.slice(0, -1);
        if (decimal.length != 0) this.text = `${splitText[0]}.${decimal}`
        else this.text = splitText[0];
        if (splitDecimal.length > 1) this.text = `${this.text}e${splitDecimal[1]}`;
      }
    }
  }

  private getLongestRow(context: CanvasRenderingContext2D, writtenText: string[]): number {
    return Math.max(...writtenText.map(row => context.measureText(row).width))
  }

  public formattedTextRows(): string[] {
    const writtenText = []
    this.rowIndices.slice(0, this.rowIndices.length - 1).forEach((_, rowIndex) => {
      writtenText.push(this.text.slice(this.rowIndices[rowIndex], this.rowIndices[rowIndex + 1]));
    })
    return writtenText
  }

  public format(context: CanvasRenderingContext2D): string[] {
    let writtenText = [this.text];
    let fontsize = this.fontsize ?? DEFAULT_FONTSIZE;
    if (this.boundingBox.size.x) {
      if (this.multiLine) [writtenText, fontsize] = this.multiLineSplit(fontsize, context)
      else fontsize = this.automaticFontSize(context);
    } else if (this.boundingBox.size.y) fontsize = this.fontsize ?? this.boundingBox.size.y;
    this.fontsize = Math.abs(fontsize);
    context.font = newText.buildFont(this.style, this.fontsize, this.font);
    this.height = writtenText.length * this.fontsize;
    this.width = this.getLongestRow(context, writtenText);
    this.rowIndices = [0];
    writtenText.forEach((row, index) => this.rowIndices.push(this.rowIndices[index] + row.length));
    return writtenText
  }

  public multiLineSplit(fontsize: number, context: CanvasRenderingContext2D): [string[], number] {
    context.font = newText.buildFont(this.style, fontsize, this.font);
    const oneRowLength = context.measureText(this.text).width;
    if (oneRowLength < this.boundingBox.size.x) {
      return [[this.text.trimStart()], fontsize > this.boundingBox.size.y ? this.boundingBox.size.y ?? fontsize : fontsize];
    }
    if (!this.boundingBox.size.y) return [this.fixedFontSplit(context), fontsize];
    return this.autoFontSplit(fontsize, context);
  }

  private getWords(): string[] {
    if (this.words) return this.words;
    return this.splitInWords();
  }

  private splitInWords(): string[] {
    const words = [];
    let pickedChars = 0;
    while (pickedChars < this.text.length) {
      let word = "";
      if (TEXT_SEPARATORS.includes(this.text[pickedChars])) {
        word = this.text[pickedChars];
        pickedChars++;
      }
      else {
        while (!TEXT_SEPARATORS.includes(this.text[pickedChars]) && pickedChars < this.text.length) {
          word += this.text[pickedChars];
          pickedChars++;
        }
      }
      words.push(word);
    }
    return words
  }

  private fixedFontSplit(context: CanvasRenderingContext2D): string[] {
    const rows: string[] = [];
    let pickedWords = 0;
    while (pickedWords < this.words.length) {
      let newRow = '';
      while (context.measureText(newRow).width < this.boundingBox.size.x && pickedWords < this.words.length) {
        if (context.measureText(newRow + this.words[pickedWords]).width > this.boundingBox.size.x && newRow != '') break
        else {
          newRow += this.words[pickedWords];
          pickedWords++;
        }
      }
      if (newRow.length != 0) rows.push(newRow);
    }
    return rows
  }

  private cleanStartAllRows(rows: string[]): string[] { return rows.map(row => row.trimStart()) }

  private checkWordsLength(context: CanvasRenderingContext2D): boolean {
    for (let i = 0; i < this.words.length - 1; i++) {
      if (context.measureText(this.words[i]).width > this.boundingBox.size.x) return false;
    }
    return true
  }

  private autoFontSplit(fontsize: number, context: CanvasRenderingContext2D): [string[], number] {
    let rows = [];
    let criterion = Number.POSITIVE_INFINITY;
    while (criterion > this.boundingBox.size.y && fontsize > 1) {
      context.font = newText.buildFont(this.style, fontsize, this.font);
      if (this.checkWordsLength(context)) {
        rows = this.fixedFontSplit(context);
        criterion = fontsize * rows.length;
      }
      fontsize--;
    }
    return [rows, fontsize + 1]
  }
}

export class newPoint2D extends newShape {
  public path: Path2D;
  public center: Vertex;

  constructor(
    x: number = 0,
    y: number = 0,
    protected _size: number = 12,
    protected _marker: string = 'circle',
    protected _markerOrientation: string = 'up',
    fillStyle: string = null,
    strokeStyle: string = null
  ) {
    super();
    this.center = new Vertex(x, y);
    this.buildPath();
    this.fillStyle = fillStyle || this.fillStyle;
    this.strokeStyle = strokeStyle || this.setStrokeStyle(this.fillStyle);
    this.lineWidth = 1;
  };

  public get drawingStyle(): { [key: string]: any } {
    const style = super.drawingStyle;
    style["markerOrientation"] = this.markerOrientation;
    style["marker"] = this.marker;
    style["size"] = this.size;
    return style
  }

  public getBounds(): [Vertex, Vertex] { //TODO: not perfect when distance is large between points, should use point size, which is not so easy to get unscaled here (cf newText)
    const factor = 0.025;
    const minX = this.center.x != 0 ? this.center.x - Math.abs(this.center.x) * factor : -1;
    const minY = this.center.y != 0 ? this.center.y - Math.abs(this.center.y) * factor : -1;
    const maxX = this.center.x != 0 ? this.center.x + Math.abs(this.center.x) * factor : 1;
    const maxY = this.center.y != 0 ? this.center.y + Math.abs(this.center.y) * factor : 1;
    return [new Vertex(minX, minY), new Vertex(maxX, maxY)]
  }

  public static deserialize(data: any, scale: Vertex): newPoint2D {
    const point = new newPoint2D(data.cx, data.cy);
    point.isScaled = false;
    return point
  }

  public deserializeStyle(data: any): void {
    this.deserializeTooltip(data);
    this.deserializePointStyle(data.point_style ?? {});
  }

  protected deserializePointStyle(data: any): void {
    this.size = data.size ?? this.size;
    this.fillStyle = data.color_fill ?? this.fillStyle;
    this.strokeStyle = data.color_stroke ?? this.strokeStyle;
    this.lineWidth = data.stroke_width ?? this.lineWidth;
    this.marker = data.shape ?? this.marker;
    this.markerOrientation = data.orientation ?? this.markerOrientation;
  }

  public updateStyle(style: newPointStyle): void {
    this.size = style.size ?? this.size;
    this.fillStyle = style.fillStyle ?? this.fillStyle;
    this.strokeStyle = style.strokeStyle ?? this.strokeStyle;
    this.lineWidth = style.lineWidth ?? this.lineWidth;
    this.marker = style.marker ?? this.marker;
    this.markerOrientation = style.orientation ?? this.markerOrientation;
  }

  public styleToLegend(legendOrigin: Vertex, legendSize: Vertex): newPoint2D {
    const legend = new newPoint2D(legendOrigin.x, legendOrigin.y);
    legend.size = legendSize.y * 0.9;
    legend.marker = this.marker;
    legend.markerOrientation = this.markerOrientation;
    return legend
  }

  public copy(): newPoint2D {
    const copy = new newPoint2D();
    copy.center = this.center.copy();
    copy.size = this.size;
    copy.marker = this.marker;
    copy.markerOrientation = this.markerOrientation;
    copy.fillStyle = this.fillStyle;
    copy.strokeStyle = this.strokeStyle;
    copy.lineWidth = this.lineWidth;
    return copy
  }

  public update() { this.buildPath() }

  public scale(scale: Vertex): newPoint2D {
    this.center = this.center.scale(scale);
    this.buildPath();
    return this
  }

  public setColors(color: string) {
    this.fillStyle = this.isFilled ? color : null;
    this.strokeStyle = this.isFilled ? this.setStrokeStyle(this.fillStyle) : color;
  }

  get drawnShape(): newShape {
    let marker = new newShape();
    if (CIRCLES.includes(this.marker)) marker = new newCircle(this.center, this.size / 2);
    if (MARKERS.includes(this.marker)) marker = new Mark(this.center, this.size);
    if (CROSSES.includes(this.marker)) marker = new Cross(this.center, this.size);
    if (SQUARES.includes(this.marker)) {
      const halfSize = this.size * 0.5;
      const origin = new Vertex(this.center.x - halfSize, this.center.y - halfSize);
      marker = new newRect(origin, new Vertex(this.size, this.size));
    };
    if (TRIANGLES.includes(this.marker)) marker = new Triangle(this.center, this.size, this.markerOrientation);
    if (HALF_LINES.includes(this.marker)) marker = new HalfLine(this.center, this.size, this.markerOrientation);
    if (this.marker == 'line') marker = new LinePoint(this.center, this.size, this.markerOrientation);
    marker.lineWidth = this.lineWidth;
    this.isFilled = marker.isFilled;
    return marker
  }

  protected updateTooltipOrigin(matrix: DOMMatrix): void { this.tooltipOrigin = this.center.copy() }

  public initTooltip(context: CanvasRenderingContext2D): newTooltip {
    const tooltip = super.initTooltip(context);
    tooltip.isFlipper = true;
    return tooltip
  }

  get markerOrientation(): string { return this._markerOrientation };

  set markerOrientation(value: string) { this._markerOrientation = value };

  get size(): number { return this._size };

  set size(value: number) { this._size = value };

  get marker(): string { return this._marker };

  set marker(value: string) { this._marker = value };

  public buildPath(): void { this.path = this.drawnShape.path }

  protected buildUnscaledPath(context: CanvasRenderingContext2D) {
    const matrix = context.getTransform();
    context.resetTransform();
    const center = new Vertex(matrix.e, matrix.f).add(this.center.scale(new Vertex(matrix.a, matrix.d))).subtract(this.center);
    const path = new Path2D();
    path.addPath(this.drawnShape.path, new DOMMatrix([1, 0, 0, 1, center.x, center.y]));
    this.path = new Path2D();
    this.path.addPath(path, matrix.inverse());
    return path
  }

  public isInFrame(origin: Vertex, end: Vertex, scale: Vertex): boolean {
    const inCanvasX = this.center.x * scale.x < end.x && this.center.x * scale.x > origin.x;
    const inCanvasY = this.center.y * scale.y < end.y && this.center.y * scale.y > origin.y;
    this.inFrame = inCanvasX && inCanvasY;
    return this.inFrame
  }

  protected isPointInStroke(context: CanvasRenderingContext2D, point: Vertex): boolean {
    this.setContextPointInStroke(context);
    const isHovered = context.isPointInStroke(this.path, point.x, point.y);
    context.restore();
    return isHovered
  }

  protected setContextPointInStroke(context: CanvasRenderingContext2D): void {
    context.save();
    context.resetTransform();
  }
}

export class LineSequence extends newShape {
  public previousMouseClick: Vertex;
  public hoveredThickener: number = 2;
  public clickedThickener: number = 2;
  public selectedThickener: number = 2;
  constructor(
    public points: newPoint2D[] = [],
    public name: string = ""
  ) {
    super();
    this.isScaled = false;
    this.isFilled = false;
    this.updateTooltipMap();
  }

  public static deserialize(data: { [key: string]: any }, scale: Vertex): LineSequence {
    const points = [];
    data.lines.forEach(line => points.push(new newPoint2D(line[0], line[1])));
    const line = new LineSequence(points, data.name ?? "");
    line.deserializeEdgeStyle(data);
    line.isScaled = true;
    line.buildPath();
    return line
  }

  public initTooltip(context: CanvasRenderingContext2D): newTooltip {
    if (!this.tooltipOrigin) this.tooltipOrigin = this.points[Math.floor(this.points.length / 2)].center;
    return super.initTooltip(context);
  }

  public getBounds(): [Vertex, Vertex] { //TODO: not perfect when distance is large between points, should use point size, which is not so easy to get unscaled here (cf newText)
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    this.points.forEach(point => {
      if (point.center.x < minX) minX = point.center.x;
      if (point.center.y < minY) minY = point.center.y;
      if (point.center.x > maxX) maxX = point.center.x;
      if (point.center.y > maxY) maxY = point.center.y;
    })
    return [new Vertex(minX, minY), new Vertex(maxX, maxY)]
  }

  public mouseDown(mouseDown: Vertex) {
    super.mouseDown(mouseDown);
    if (this.isHovered) this.previousMouseClick = mouseDown.copy();
  }

  public updateTooltipMap() { this._tooltipMap = new Map<string, any>(this.name ? [["Name", this.name]] : []) }

  public static unpackGraphProperties(graph: { [key: string]: any }): LineSequence {
    const emptyLineSequence = new LineSequence([], graph.name);
    emptyLineSequence.deserializeEdgeStyle(graph);
    return emptyLineSequence
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    super.setDrawingProperties(context);
    const thickener = this.isSelected ? this.selectedThickener : this.isClicked ? this.clickedThickener : this.isHovered ? this.hoveredThickener : 0;
    context.lineWidth = this.lineWidth + thickener;
  }

  public buildPath(): void {
    this.path = new Path2D();
    this.path.moveTo(this.points[0].center.x, this.points[0].center.y);
    this.points.slice(1).forEach(point => this.path.lineTo(point.center.x, point.center.y));
  }

  public update(points: newPoint2D[]): void {
    this.points = points;
    this.buildPath();
  }
}

export class newLabel extends newShape {
  public shapeSize: Vertex = new Vertex(30, MAX_LABEL_HEIGHT);
  public legend: newRect | LineSegment | newPoint2D;
  public maxWidth: number = 150;
  public readonly textOffset = 5;
  constructor(
    shape: newShape,
    public text: newText,
    public origin: Vertex = new Vertex(0, 0)
  ) {
    super();
    this.isScaled = false;
    this.text.width = this.maxWidth - this.shapeSize.x;
    this.getShapeStyle(shape, this.origin);
    this.buildPath();
  }

  public buildPath(): void {
    this.legend.buildPath();
    this.path = this.legend.path;
  }

  protected buildUnscaledPath(context: CanvasRenderingContext2D) {
    const matrix = context.getTransform();
    context.resetTransform();
    const origin = this.origin.transform(matrix);
    this.buildPath();
    const path = new Path2D();
    path.addPath(this.path);
    this.path = new Path2D();
    this.path.addPath(path, matrix.inverse());
    this.path.addPath(this.text.path, matrix.inverse());
    return path
  }

  private updateLegendGeometry(): void {
    if (this.legend instanceof LineSegment) {
      const margin = 2;
      this.legend.origin.x = this.origin.x;
      this.legend.origin.y = this.origin.y + margin;
      this.legend.end.x = this.origin.x + this.shapeSize.x;
      this.legend.end.y = this.origin.y + this.shapeSize.y - margin;
    }
    else if (this.legend instanceof newPoint2D) this.legend.center = this.origin.add(this.shapeSize.divide(2));
    else this.legend = new newRect(this.origin, this.shapeSize);
  }

  public getShapeStyle(shape: newShape, origin: Vertex): void {
    this.legend = shape.styleToLegend(origin, this.shapeSize);
    Object.entries(shape.drawingStyle).map(([key, value]) => this[key] = value);
  }

  public updateHeight(height: number): void {
    const heightRatio = height / this.shapeSize.y;
    this.shapeSize.x *= heightRatio;
    this.maxWidth *= heightRatio;
    this.shapeSize.y = height;
    if (this.legend instanceof newRect) this.legend.size.y = height
    else if (this.legend instanceof LineSegment) this.legend.end.y = this.legend.origin.y + height
    else this.legend.size = height;
    this.text.fontsize = height;
  }

  public static deserialize(data: any, scale: Vertex = new Vertex(1, 1)): newLabel {
    const textParams = newText.deserializeTextParams(data);
    const shape = data.shape ? newShape.deserialize(data.shape, scale) : new newRect();
    const text = new newText(data.title, new Vertex(0, 0), textParams);
    text.isScaled = false;
    text.baseline = "middle";
    text.align = "start";
    return new newLabel(shape, text)
  }

  public deserializeStyle(data): void {
    if (data.rectangle_edge_style) {
      data.edge_style = data.rectangle_edge_style;
      this.deserializeEdgeStyle(data);
    }
    if (data.rectangle_surface_style) {
      data.surface_style = data.rectangle_surface_style;
      this.deserializeSurfaceStyle(data);
    }
  }

  public updateOrigin(drawingZone: newRect, initScale: Vertex, nLabels: number): void {
    this.origin.x = drawingZone.origin.x + drawingZone.size.x - (initScale.x < 0 ? 0 : this.maxWidth);
    this.origin.y = drawingZone.origin.y + drawingZone.size.y - nLabels * this.shapeSize.y * 1.75 * initScale.y;
    this.updateLegendGeometry();
    this.text.origin = this.origin.add(new Vertex(this.shapeSize.x + this.textOffset, this.shapeSize.y / 2));
  }

  public draw(context: CanvasRenderingContext2D): void {
    super.draw(context);
    context.save();
    context.resetTransform();
    this.text.draw(context);
    context.restore();
  }

  public isPointInShape(context: CanvasRenderingContext2D, point: Vertex): boolean {
    return this.legend.isFilled ? context.isPointInPath(this.path, point.x, point.y) : (context.isPointInPath(this.path, point.x, point.y) || context.isPointInStroke(this.path, point.x, point.y))
  }
}

export class newTooltip {// TODO: make it a newShape
  public path: Path2D;

  public lineWidth: number = 1;
  public strokeStyle: string = "hsl(210, 90%, 20%)";
  public textColor: string = "hsl(0, 0%, 100%)";
  public fillStyle: string = "hsl(210, 90%, 20%)";
  public alpha: number = 0.8;
  public fontsize: number = 10;
  public radius: number = 10;

  private printedRows: string[];
  private squareOrigin: Vertex;
  private size: Vertex;
  private isUp = true;
  public isFlipper = true;
  constructor(
    public origin,
    public dataToPrint: Map<string, any>,
    context: CanvasRenderingContext2D
  ) {
    [this.printedRows, this.size] = this.buildText(context);
    this.squareOrigin = new Vertex(this.origin.x, this.origin.y);
  }

  private buildText(context: CanvasRenderingContext2D): [string[], Vertex] {
    context.save();
    context.font = `${this.fontsize}px sans-serif`;
    const printedRows = [];
    let textLength = 0;
    this.dataToPrint.forEach((value, key) => {
      let text: string = null;
      if (key == "Number") {
        if (value != 1) text = `${value} samples`;
      } else {
        if (key != "name") {
          if (value != '') text = `${key}: ${this.formatValue(value)}`
          else text = key;
        }
      };
      const textWidth = context.measureText(text).width;
      if (textWidth > textLength) textLength = textWidth;
      if (text) printedRows.push(text);
    })
    context.restore();
    return [printedRows, new Vertex(textLength + TOOLTIP_TEXT_OFFSET * 2, (printedRows.length + 1.5) * this.fontsize)]
  }

  private formatValue(value: number | string): number | string {
    if (typeof value == "number") return Math.round(value * TOOLTIP_PRECISION) / TOOLTIP_PRECISION;
    return value
  };

  public buildPath(): void {
    this.path = new Path2D();
    const rectOrigin = this.squareOrigin.add(new Vertex(-this.size.x / 2, TOOLTIP_TRIANGLE_SIZE));
    const triangleCenter = this.origin;
    triangleCenter.y += TOOLTIP_TRIANGLE_SIZE / 2 * (this.isUp ? 1 : -1);
    this.path.addPath(new newRoundRect(rectOrigin, this.size, this.radius).path);
    this.path.addPath(new Triangle(triangleCenter, TOOLTIP_TRIANGLE_SIZE, this.isUp ? 'down' : 'up').path);
  }

  private computeTextOrigin(scaling: Vertex): Vertex {
    let textOrigin = this.squareOrigin;
    let textOffsetX = -this.size.x / 2 + TOOLTIP_TEXT_OFFSET;
    let textOffsetY = (scaling.y < 0 ? -this.size.y - TOOLTIP_TRIANGLE_SIZE : TOOLTIP_TRIANGLE_SIZE) + this.fontsize * 1.25;
    return textOrigin.add(new Vertex(textOffsetX, textOffsetY));
  }

  private writeText(textOrigin: Vertex, context: CanvasRenderingContext2D): void {
    const regexSamples: RegExp = /^[0-9]+\ssamples/;
    this.printedRows.forEach((row, index) => {
      textOrigin.y += index == 0 ? 0 : this.fontsize;
      const text = new newText(row, textOrigin, { fontsize: this.fontsize, baseline: "middle", style: regexSamples.test(row) ? 'bold' : '' });
      text.fillStyle = this.textColor;
      text.draw(context)
    })
  }

  public insideCanvas(plotOrigin: Vertex, plotSize: Vertex, scaling: Vertex): void {
    const downLeftCorner = this.squareOrigin.add(new Vertex(-this.size.x / 2, TOOLTIP_TRIANGLE_SIZE).scale(scaling));
    const upRightCorner = downLeftCorner.add(this.size.scale(scaling));
    const upRightDiff = plotOrigin.add(plotSize).subtract(upRightCorner);
    const downLeftDiff = downLeftCorner.subtract(plotOrigin);

    if (upRightDiff.x < 0) this.squareOrigin.x += upRightDiff.x
    else if (upRightDiff.x > plotSize.x) this.squareOrigin.x += upRightDiff.x - plotSize.x;

    if (upRightDiff.y < 0) {
      if (this.isFlipper) {
        this.squareOrigin.y += -this.size.y - TOOLTIP_TRIANGLE_SIZE * 2;
        this.flip();
      } else {
        this.squareOrigin.y += upRightDiff.y;
        this.origin.y += upRightDiff.y;
      }

    } else if (upRightDiff.y > plotSize.y) {
      if (this.isFlipper) {
        this.squareOrigin.y += this.size.y + TOOLTIP_TRIANGLE_SIZE * 2;
        this.flip();
      } else {
        this.squareOrigin.y += upRightDiff.y - plotSize.y;
        this.origin.y += upRightDiff.y - plotSize.y;
      }
    }

    if (downLeftDiff.x < 0) this.squareOrigin.x -= downLeftDiff.x
    else if (downLeftDiff.x > plotSize.x) this.squareOrigin.x -= downLeftDiff.x - plotSize.x;

    if (downLeftDiff.y < 0) { // Maybe wrong, did not meet the case
      this.squareOrigin.y -= downLeftDiff.y;
      this.origin.y -= downLeftDiff.y;
    } else if (downLeftDiff.y > plotSize.y) {
      this.squareOrigin.y += downLeftDiff.y - plotSize.y;
      this.origin.y += downLeftDiff.y - plotSize.y;
    }
  }

  public flip(): void { this.isUp = !this.isUp }

  public draw(plotOrigin: Vertex, plotSize: Vertex, context: CanvasRenderingContext2D): void {
    const contextMatrix = context.getTransform();
    const scaling = new Vertex(1 / contextMatrix.a, 1 / contextMatrix.d);
    this.insideCanvas(plotOrigin, plotSize, scaling);
    const textOrigin = this.computeTextOrigin(scaling);
    const scaledPath = new Path2D();
    this.squareOrigin = this.squareOrigin.scale(scaling);
    this.origin = this.origin.scale(scaling);
    this.buildPath();
    scaledPath.addPath(this.path, new DOMMatrix().scale(contextMatrix.a, contextMatrix.d));

    context.save();
    context.scale(scaling.x, scaling.y);
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.strokeStyle;
    context.fillStyle = this.fillStyle;
    context.globalAlpha = this.alpha;
    context.fill(scaledPath);
    context.stroke(scaledPath);
    this.writeText(textOrigin, context);
    context.restore()
  }
}
