import { INFINITE_LINE_FACTOR, CIRCLES, MARKERS, TRIANGLES, SQUARES, CROSSES, HALF_LINES } from "./constants"
import { Vertex, Shape } from "./baseShape"
import { PointStyle } from "./styles"

export class Arc extends Shape {
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
    return new Arc(new Vertex(data.cx, data.cy), data.r, data.start_angle, data.end_angle, data.clockwise ?? true);
  }

  public getBounds(): [Vertex, Vertex] {
    return [
      new Vertex(this.center.x - this.radius, this.center.y - this.radius),
      new Vertex(this.center.x + this.radius, this.center.y + this.radius)
    ]
  }
}

export class Circle extends Arc {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public radius: number = 1
  ) {
    super(center, radius, 0, 2 * Math.PI);
    this.isFilled = true;
  }

  public static deserialize(data: any, scale: Vertex): Circle {
    return new Circle(new Vertex(data.cx, data.cy), data.r);
  }
}

export class Rect extends Shape {
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public size: Vertex = new Vertex(0, 0)
  ) {
    super();
    this.buildPath();
  }

  get area(): number { return this.size.x * this.size.y }

  get center(): Vertex { return this.origin.add(this.size.divide(2)) }

  public buildPath(): void {
    this.path = new Path2D();
    this.path.rect(this.origin.x, this.origin.y, this.size.x, this.size.y);
  }

  public static deserialize(data: any, scale: Vertex): Rect {
    return new Rect(new Vertex(data.x_coord, data.y_coord), new Vertex(data.width, data.height));
  }

  public translate(translation: Vertex): void {
    this.origin = this.origin.add(translation);
    this.buildPath();
  }

  public getBounds(): [Vertex, Vertex] { return [this.origin, this.origin.add(new Vertex(Math.abs(this.size.x), Math.abs(this.size.y)))] }
}

export class RoundRect extends Rect {
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

  public static deserialize(data: any, scale: Vertex): RoundRect {
    return new RoundRect(new Vertex(data.x_coord, data.y_coord), new Vertex(data.width, data.height), data.radius);
  }
}

export class Mark extends Shape {
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

export abstract class AbstractHalfLine extends Shape {
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

export class Line extends Shape {
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

  public static deserialize(data: any, scale: Vertex): Line {
    return new Line(new Vertex(data.point1[0], data.point1[1]), new Vertex(data.point2[0], data.point2[1]));
  }

  public buildPath(): void {
    const [slope, affinity] = this.getEquation();
    if (this.end.x == this.origin.x) {
      this.path = new LineSegment(new Vertex(this.origin.x, -this.end.y * INFINITE_LINE_FACTOR), new Vertex(this.origin.x, this.end.y * INFINITE_LINE_FACTOR)).path;
    } else {
      const fakeOrigin = new Vertex(-INFINITE_LINE_FACTOR, 0);
      const fakeEnd = new Vertex(INFINITE_LINE_FACTOR, 0);
      if (this.origin.x != 0) {
        fakeOrigin.x *= this.origin.x;
        fakeEnd.x *= this.origin.x;
      }
      fakeOrigin.y = fakeOrigin.x * slope + affinity;
      fakeEnd.y = fakeEnd.x * slope + affinity;
      this.path = new LineSegment(fakeOrigin, fakeEnd).path;
    }
  }

  public getBounds(): [Vertex, Vertex] { return [null, null] }
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
    return new LineSegment(new Vertex(data.point1[0], data.point1[1]), new Vertex(data.point2[0], data.point2[1]));
  }

  public drawInContour(path: Path2D): void { path.lineTo(this.end.x, this.end.y) }

  public getBounds(): [Vertex, Vertex] {
    const minX = Math.min(this.origin.x, this.end.x);
    const minY = Math.min(this.origin.y, this.end.y);
    const maxX = Math.max(this.origin.x, this.end.x);
    const maxY = Math.max(this.origin.y, this.end.y);
    return [new Vertex(minX, minY), new Vertex(maxX, maxY)]
  }
}

export abstract class AbstractLinePoint extends Shape {
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

export class Cross extends Shape {
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

export abstract class AbstractTriangle extends Shape {
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

export class Contour extends Shape {
  constructor(
    public lines: (Arc | LineSegment)[] = [],
    public isFilled: boolean = false
    ) {
      super();
      this.buildPath();
    }

  public static deserialize(data: any, scale: Vertex): Contour {
    const lines = data.plot_data_primitives.map(primitive => {
      if (primitive.type_ == "arc") return Arc.deserialize(primitive, scale)
      if (primitive.type_ == "linesegment2d") return LineSegment.deserialize(primitive, scale);
      if (primitive.type_ == "circle") return Circle.deserialize(primitive, scale);
      if (primitive.type_ == "line2d") return Line.deserialize(primitive, scale);
      throw new Error(`Type ${primitive.type_} is unknown in Contour.`)
    });
    return new Contour(lines, data.is_filled ?? false);
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    super.setDrawingProperties(context);
    context.strokeStyle = "hsla(0, 0%, 100%, 0)";
    this.lines.forEach(line => this.setLineStyle(line));
  }

  private setLineStyle(line: Shape): void {
    line.dashLine = line.dashLine.length != 0 ? line.dashLine : this.dashLine;
    line.strokeStyle = line.strokeStyle ?? this.strokeStyle;
    line.lineWidth = line.lineWidth != 1 ? line.lineWidth : this.lineWidth;
    line.isHovered = this.isHovered;
    line.isClicked = this.isClicked;
    line.isSelected = this.isSelected;
    line.isInteractive = this.isInteractive;
  }

  private drawLines(context: CanvasRenderingContext2D): void {
    this.lines.forEach(line => line.draw(context));
  }

  protected drawMembers(context: CanvasRenderingContext2D): void { this.drawLines(context) }

  public buildPath(): void {
    this.path = new Path2D();
    if (this.lines[0] instanceof LineSegment) this.path.moveTo(this.lines[0].origin.x, this.lines[0].origin.y);
    this.lines.forEach(line => line.drawInContour(this.path));
    if (this.isFilled) this.path.closePath();
  }

  public getBounds(): [Vertex, Vertex] {
    // TODO: this seems like a collection method. Are Contour a collection ?
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

export class Point extends Shape {
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
    this.isScaled = false;
    this.center = new Vertex(x, y);
    this.buildPath();
    this.fillStyle = fillStyle || this.fillStyle;
    this.strokeStyle = strokeStyle || this.setStrokeStyle(this.fillStyle);
    this.lineWidth = 1;
  };

  get tooltipFlip(): boolean { return true }

  public get drawingStyle(): { [key: string]: any } {
    const style = super.drawingStyle;
    style["markerOrientation"] = this.markerOrientation;
    style["marker"] = this.marker;
    style["size"] = this.size;
    return style
  }

  public getBounds(): [Vertex, Vertex] { //TODO: not perfect when distance is large between points, should use point size, which is not so easy to get unscaled here (cf Text)
    const factor = 0.025;
    const minX = this.center.x != 0 ? this.center.x - Math.abs(this.center.x) * factor : -1;
    const minY = this.center.y != 0 ? this.center.y - Math.abs(this.center.y) * factor : -1;
    const maxX = this.center.x != 0 ? this.center.x + Math.abs(this.center.x) * factor : 1;
    const maxY = this.center.y != 0 ? this.center.y + Math.abs(this.center.y) * factor : 1;
    return [new Vertex(minX, minY), new Vertex(maxX, maxY)]
  }

  public static deserialize(data: any, scale: Vertex): Point {
    return new Point(data.cx, data.cy);
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

  public updateStyle(style: PointStyle): void {
    this.size = style.size ?? this.size;
    this.fillStyle = style.fillStyle ?? this.fillStyle;
    this.strokeStyle = style.strokeStyle ?? this.strokeStyle;
    this.lineWidth = style.lineWidth ?? this.lineWidth;
    this.marker = style.marker ?? this.marker;
    this.markerOrientation = style.orientation ?? this.markerOrientation;
  }

  public copy(): Point {
    const copy = new Point();
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

  public scale(scale: Vertex): Point {
    this.center = this.center.scale(scale);
    this.buildPath();
    return this
  }

  public setColors(color: string) {
    this.fillStyle = this.isFilled ? color : null;
    this.strokeStyle = this.isFilled ? this.setStrokeStyle(this.fillStyle) : color;
  }

  get drawnShape(): Shape {
    let marker = new Shape();
    if (CIRCLES.includes(this.marker)) marker = new Circle(this.center, this.size / 2);
    if (MARKERS.includes(this.marker)) marker = new Mark(this.center, this.size);
    if (CROSSES.includes(this.marker)) marker = new Cross(this.center, this.size);
    if (SQUARES.includes(this.marker)) {
      const halfSize = this.size * 0.5;
      const origin = new Vertex(this.center.x - halfSize, this.center.y - halfSize);
      marker = new Rect(origin, new Vertex(this.size, this.size));
    };
    if (TRIANGLES.includes(this.marker)) marker = new Triangle(this.center, this.size, this.markerOrientation);
    if (HALF_LINES.includes(this.marker)) marker = new HalfLine(this.center, this.size, this.markerOrientation);
    if (this.marker == 'line') marker = new LinePoint(this.center, this.size, this.markerOrientation);
    marker.lineWidth = this.lineWidth;
    this.isFilled = marker.isFilled;
    return marker
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
    const contextMatrix = context.getTransform();
    this.setContextPointInStroke(context);
    const isHovered = context.isPointInStroke(this.path, point.x, point.y);
    context.setTransform(contextMatrix);
    return isHovered
  }

  protected setContextPointInStroke(context: CanvasRenderingContext2D): void { context.resetTransform() }
}

export class LineSequence extends Shape {
  public previousMouseClick: Vertex;
  public hoveredThickener: number = 2;
  public clickedThickener: number = 2;
  public selectedThickener: number = 2;
  constructor(
    public points: Point[] = [],
    public name: string = ""
  ) {
    super();
    this.isFilled = false;
    this.isScaled = true;
    this.updateTooltipMap();
    this.buildPath();
  }

  public static deserialize(data: { [key: string]: any }, scale: Vertex): LineSequence {
    const points = data.lines.map(line => new Point(line[0], line[1]));
    return new LineSequence(points, data.name ?? "");
  }

  public initTooltipOrigin(): void {
    if (!this.tooltipOrigin) this.tooltipOrigin = this.points[Math.floor(this.points.length / 2)].center;
  }

  public getBounds(): [Vertex, Vertex] { //TODO: not perfect when distance is large between points, should use point size, which is not so easy to get unscaled here (cf Text)
    // TODO: is this also a Collection ?
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
    if (this.points.length > 0) {
      this.path = new Path2D();
      this.path.moveTo(this.points[0].center.x, this.points[0].center.y);
      this.points.slice(1).forEach(point => this.path.lineTo(point.center.x, point.center.y));
    }
  }

  public update(points: Point[]): void {
    this.points = points;
    this.buildPath();
  }
}
