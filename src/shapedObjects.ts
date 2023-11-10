import { PICKABLE_BORDER_SIZE, DASH_SELECTION_WINDOW } from "./constants"
import { PointStyle } from "./styles"
import { Vertex, Rect, Point, Tooltip } from "./shapes"
import { RubberBand, Axis } from "./axes"

export class ScatterPoint extends Point {
    public mean = new Vertex();
    constructor(
      public values: number[],
      x: number = 0,
      y: number = 0,
      protected _size: number = 12,
      protected _marker: string = 'circle',
      protected _markerOrientation: string = 'up',
      fillStyle: string = null,
      strokeStyle: string = null
    ) {
      super(x, y, _size, _marker, _markerOrientation, fillStyle, strokeStyle);
      this.isScaled = false;
    }

    public static fromPlottedValues(indices: number[], pointsData: { [key: string]: number[] }, pointSize: number, marker: string,
      thresholdDist: number, tooltipAttributes: string[], features: Map<string, number[]>, axes: Axis[],
      xName: string, yName: string): ScatterPoint {
      const newPoint = new ScatterPoint(indices, 0, 0, pointSize, marker);
      newPoint.computeValues(pointsData, thresholdDist);
      newPoint.updateTooltip(tooltipAttributes, features, axes, xName, yName);
      newPoint.update();
      return newPoint
    }

    protected setContextPointInStroke(context: CanvasRenderingContext2D): void {
      context.save();
      context.resetTransform();
      context.lineWidth = 10;
    }

    public updateTooltipMap() { this._tooltipMap = new Map<string, any>([["Number", this.values.length], ["X mean", this.mean.x], ["Y mean", this.mean.y],]) };
  
    public updateTooltip(tooltipAttributes: string[], features: Map<string, number[]>, axes: Axis[], xName: string, yName: string) {
      this.updateTooltipMap();
      if (this.values.length == 1) {
        this.TooltipMap();
        tooltipAttributes.forEach(attr => this.tooltipMap.set(attr, features.get(attr)[this.values[0]]));
        return;
      }
      this.tooltipMap.set(`Average ${xName}`, axes[0].isDiscrete ? axes[0].labels[Math.round(this.mean.x)] : this.mean.x);
      this.tooltipMap.set(`Average ${yName}`, axes[1].isDiscrete ? axes[1].labels[Math.round(this.mean.y)] : this.mean.y);
      this.tooltipMap.delete('X mean');
      this.tooltipMap.delete('Y mean');
    }
  
    public updateStyle(style: PointStyle): void {
      super.updateStyle(style);
      this.marker = this.values.length > 1 ? this.marker : style.marker ?? this.marker;
    }

    public computeValues(pointsData: { [key: string]: number[] }, thresholdDist: number): void {
      let centerX = 0;
      let centerY = 0;
      let meanX = 0;
      let meanY = 0;
      this.values.forEach(index => {
        centerX += pointsData.xCoords[index];
        centerY += pointsData.yCoords[index];
        meanX += pointsData.xValues[index];
        meanY += pointsData.yValues[index];
      });
      this.center.x = centerX / this.values.length;
      this.center.y = centerY / this.values.length;
      this.size = Math.min(this.size * 1.15 ** (this.values.length - 1), thresholdDist);
      this.mean.x = meanX / this.values.length;
      this.mean.y = meanY / this.values.length;
    }
  }
  
  export class Bar extends Rect {
    public min: number;
    public max: number;
    public mean: number;
    constructor(
      public values: any[] = [],
      public origin: Vertex = new Vertex(0, 0),
      public size: Vertex = new Vertex(0, 0)
    ) {
      super(origin, size);
    }

    get length(): number { return this.values.length };

    get tooltipMap(): Map<string, any> {
      return new Map<string, any>([["Number", this.length], ["Min", this.min], ["Max", this.max], ["Mean", this.mean]])
    }

    protected computeTooltipOrigin(contextMatrix: DOMMatrix): Vertex {
      return new Vertex(this.origin.x + this.size.x / 2, this.origin.y + this.size.y).transform(contextMatrix)
    }
  
    public initTooltip(context: CanvasRenderingContext2D): Tooltip {
      const tooltip = new Tooltip(this.tooltipOrigin, this.tooltipMap, context);
      tooltip.isFlipper = false;
      return tooltip
    }

    public setGeometry(origin: Vertex, size: Vertex): void {
      this.origin = origin;
      this.size = size;
    }

    public draw(context: CanvasRenderingContext2D): void {
      if (this.size.x != 0 && this.size.y != 0) {
        super.draw(context);
        this.tooltipOrigin = this.computeTooltipOrigin(context.getTransform());
      }
    }

    public computeStats(values: number[]): void {
      this.min = Math.min(...values);
      this.max = Math.max(...values);
      this.mean = values.reduce((a, b) => a + b, 0) / values.length;
    }

    public updateStyle(origin: Vertex, size: Vertex, hoveredIndices: number[], clickedIndices: number[], selectedIndices: number[],
      fillStyle: string, strokeStyle: string, dashLine: number[], lineWidth: number): void {
      this.setGeometry(origin, size);
      this.fillStyle = fillStyle;
      this.strokeStyle = strokeStyle;
      this.dashLine = dashLine;
      this.lineWidth = lineWidth;
      if (this.values.some(valIdx => hoveredIndices.includes(valIdx))) this.isHovered = true;
      if (this.values.some(valIdx => clickedIndices.includes(valIdx))) this.isClicked = true;
      if (this.values.some(valIdx => selectedIndices.includes(valIdx))) this.isSelected = true;
      this.buildPath();
    }
  }
  
  export class SelectionBox extends Rect {
    public minVertex: Vertex = null;
    public maxVertex: Vertex = null;
    private _previousMin: Vertex;
    private _previousMax: Vertex;
    private _scale: Vertex = new Vertex(1, 1);

    public leftUpdate: boolean = false;
    public rightUpdate: boolean = false;
    public upUpdate: boolean = false;
    public downUpdate: boolean = false;
    constructor(
      public origin: Vertex = new Vertex(0, 0),
      public size: Vertex = new Vertex(0, 0)
    ) {
      super(origin, size);
      this.mouseClick = this.origin.copy();
      this.initBoundariesVertex();
      this.dashLine = DASH_SELECTION_WINDOW;
      this.selectedStyle = this.clickedStyle = this.hoverStyle = this.fillStyle = "hsla(0, 0%, 100%, 0)";
      this.lineWidth = 0.5
    }

    get isDefined(): boolean { return (this.minVertex != null && this.maxVertex != null) }

    public setDrawingProperties(context: CanvasRenderingContext2D): void {
      super.setDrawingProperties(context);
      context.lineWidth = (this.isHovered || this.isClicked) ? this.lineWidth * 2 : this.lineWidth;
    }

    private initBoundariesVertex(): void {
      this.minVertex = this.origin.copy();
      this.maxVertex = this.origin.add(this.size);
      this.saveState();
    }

    public update(minVertex: Vertex, maxVertex: Vertex): void {
      this.minVertex = minVertex;
      this.maxVertex = maxVertex;
    }

    public updateRectangle(origin: Vertex, size: Vertex): void {
      this.origin = origin;
      this.size = size;
      this.initBoundariesVertex();
      this.buildPath();
    }

    public rubberBandUpdate(rubberBand: RubberBand, coordName: string): void {
      if (this.isDefined) {
        if (rubberBand.minValue != rubberBand.maxValue) {
          this.minVertex[coordName] = rubberBand.minValue;
          this.maxVertex[coordName] = rubberBand.maxValue;
        } else this.minVertex = this.maxVertex = null;
      }
    }

    public buildRectangle(frameOrigin: Vertex, frameSize: Vertex): void {
      this.origin = this.minVertex.copy();
      this.size = this.maxVertex.subtract(this.origin);
      this.insideCanvas(frameOrigin, frameSize);
      this.buildPath();
    }

    private insideCanvas(drawOrigin: Vertex, drawSize: Vertex): void {
      const downLeftCorner = this.origin;
      const upRightCorner = downLeftCorner.add(this.size);
      const upRightDiff = drawOrigin.add(drawSize).subtract(upRightCorner);
      const downLeftDiff = downLeftCorner.subtract(drawOrigin);

      if (upRightDiff.x < 0) this.size.x += upRightDiff.x
      else if (upRightDiff.x > drawSize.x) this.size.x += upRightDiff.x - drawSize.x;

      if (upRightDiff.y < 0) this.size.y += upRightDiff.y
      else if (upRightDiff.y > drawSize.y) this.size.y += upRightDiff.y - drawSize.y;

      if (downLeftDiff.x < 0) {
        this.origin.x -= downLeftDiff.x;
        this.size.x += downLeftDiff.x;
      } else if (downLeftDiff.x > drawSize.x) {
        this.origin.x -= downLeftDiff.x - drawSize.x;
        this.size.x += downLeftDiff.x - drawSize.x;
      }
      if (downLeftDiff.y < 0) {
        this.origin.y -= downLeftDiff.y;
        this.size.y += downLeftDiff.y;
      } else if (downLeftDiff.y > drawSize.y) {
        this.origin.y -= downLeftDiff.y - drawSize.y;
        this.size.y += downLeftDiff.y - drawSize.y;
      }
    }

    private get borderSizeX() { return Math.min(PICKABLE_BORDER_SIZE / Math.abs(this._scale.x), Math.abs(this.size.x) / 3) }

    private get borderSizeY() { return Math.min(PICKABLE_BORDER_SIZE / Math.abs(this._scale.y), Math.abs(this.size.y) / 3) }

    private saveState() {
      this._previousMin = this.minVertex.copy();
      this._previousMax = this.maxVertex.copy();
    }

    public updateScale(scaleX: number, scaleY: number): void {
      this._scale.x = scaleX;
      this._scale.y = scaleY;
    }

    public mouseDown(mouseDown: Vertex): void {
      super.mouseDown(mouseDown);
      if (this.isHovered) {
        this.isClicked = true;
        this.saveState();
        this.leftUpdate = Math.abs(this.mouseClick.x - this.minVertex.x) <= this.borderSizeX;
        this.rightUpdate = Math.abs(this.mouseClick.x - this.maxVertex.x) <= this.borderSizeX;
        this.downUpdate = Math.abs(this.mouseClick.y - this.minVertex.y) <= this.borderSizeY;
        this.upUpdate = Math.abs(this.mouseClick.y - this.maxVertex.y) <= this.borderSizeY;
      }
    }

    mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void {
      super.mouseMove(context, mouseCoords);
      if (!(this.leftUpdate || this.rightUpdate || this.downUpdate || this.upUpdate) && this.isClicked) {
        const translation = mouseCoords.subtract(this.mouseClick);
        this.minVertex = this._previousMin.add(translation);
        this.maxVertex = this._previousMax.add(translation);
      }
      if (this.leftUpdate) this.minVertex.x = Math.min(this._previousMax.x, mouseCoords.x);
      if (this.rightUpdate) this.maxVertex.x = Math.max(this._previousMin.x, mouseCoords.x);
      if (this.downUpdate) this.minVertex.y = Math.min(this._previousMax.y, mouseCoords.y);
      if (this.upUpdate) this.maxVertex.y = Math.max(this._previousMin.y, mouseCoords.y);
      if (this.isClicked) {
        if (this.minVertex.x == this._previousMax.x) this.maxVertex.x = mouseCoords.x;
        if (this.maxVertex.x == this._previousMin.x) this.minVertex.x = mouseCoords.x;
        if (this.minVertex.y == this._previousMax.y) this.maxVertex.y = mouseCoords.y;
        if (this.maxVertex.y == this._previousMin.y) this.minVertex.y = mouseCoords.y;
      }
    }

    public mouseUp(keepState: boolean) {
      super.mouseUp(keepState);
      this.isClicked = this.leftUpdate = this.rightUpdate = this.upUpdate = this.downUpdate = false;
    }
  }
