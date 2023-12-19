import { SIZE_AXIS_END } from "./constants"
import { uniqueValues } from "./functions"
import { Vertex, Shape } from "./baseShape"
import { Rect, Point } from "./primitives"
import { TextParams, Text, RubberBand } from "./shapes"
import { EventEmitter } from "events"

export class TitleSettings {
  constructor(
    public origin: Vertex = null,
    public align: string = null,
    public baseline: string = null,
    public orientation: number = null
  ) { }
}

export class Axis extends Shape {
  public ticksPoints: Point[];
  public rubberBand: RubberBand;

  public labels: string[];
  protected _ticks: number[];
  public tickPrecision: number;
  public ticksFontsize: number = 12;
  protected _isDiscrete: boolean = true;

  public drawPath: Path2D;
  public path: Path2D;
  public lineWidth: number = 1;
  public strokeStyle: string = 'hsl(0, 0%, 0%)';
  public hoverStyle: string = 'hsl(0, 100%, 48%)';
  public clickedStyle: string = 'hsl(126, 67%, 72%)';
  public rubberColor: string = 'hsl(200, 95%, 50%)';
  public rubberAlpha: number = 0.5;
  public mouseStyleON: boolean = false;

  public isHovered: boolean = false;
  public isClicked: boolean = false;
  public isInverted: boolean = false;
  public title: Text;
  public centeredTitle: boolean = false;
  public titleSettings: TitleSettings = new TitleSettings();
  public titleWidth: number;
  public font: string = 'sans-serif';

  public emitter: EventEmitter = new EventEmitter();
  public initMinValue: number;
  public initMaxValue: number;
  private _previousMin: number;
  private _previousMax: number;
  private _minValue: number;
  private _maxValue: number;

  private _marginRatio: number = 0.05;
  protected offsetTicks: number;
  public offsetTitle: number;
  protected maxTickWidth: number;
  protected maxTickHeight: number;

  readonly DRAW_START_OFFSET = 0;
  readonly SELECTION_RECT_SIZE = 10;
  readonly FONT_SIZE = 12;
  readonly isFilled = true;

  // OLD
  public is_drawing_rubberband: boolean = false;

  constructor(
    vector: any[] = null,
    public boundingBox: Rect,
    public origin: Vertex,
    public end: Vertex,
    public name: string = '',
    public initScale: Vertex,
    protected _nTicks: number = 10
  ) {
    super();
    this.discretePropertiesFromVector(vector);
    const [minValue, maxValue] = this.computeMinMax(vector);
    [this._previousMin, this._previousMax] = [this.initMinValue, this.initMaxValue] = [this.minValue, this.maxValue] = this.marginedBounds(minValue, maxValue);
    this.ticks = this.computeTicks();
    if (!this.isDiscrete) this.labels = this.numericLabels();
    this.computeEnds();
    this.adjustBoundingBox();
    this.drawPath = this.buildDrawPath();
    this.buildPath();
    this.rubberBand = new RubberBand(this.name, 0, 0, this.isVertical);
    this.updateOffsetTicks();
    this.offsetTitle = 0;
    this.title = new Text(this.titleText, new Vertex(0, 0), {});
  };

  public get drawLength(): number {
    return this.isVertical ? Math.abs(this.origin.y - this.end.y) : Math.abs(this.origin.x - this.end.x);
  }

  private get drawingColor(): string {
    let color = this.strokeStyle;
    if (this.mouseStyleON) { color = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.strokeStyle };
    return color
  }

  get interval(): number { return Math.abs(this.maxValue - this.minValue) };

  get drawScale(): number { return this.drawLength / this.interval }

  get center(): number { return (this.maxValue + this.minValue) / 2 }

  get isVertical(): boolean { return this.origin.x == this.end.x };

  get isDiscrete(): boolean { return this._isDiscrete };

  set isDiscrete(value: boolean) { this._isDiscrete = value };

  set marginRatio(value: number) { this._marginRatio = value };

  get marginRatio(): number { return this._marginRatio };

  get tickMarker(): string { return "halfLine" }

  get tickOrientation(): string { return this.isVertical ? 'right' : 'up' }

  get minValue(): number { return this._minValue }

  set minValue(value: number) { this._minValue = value; this.emitter.emit("axisStateChange", this); }

  get maxValue(): number { return this._maxValue }

  set maxValue(value: number) { this._maxValue = value }

  set nTicks(value: number) { this._nTicks = value };

  get nTicks(): number {
    if (this.isDiscrete) return this.labels.length + 1
    return this._nTicks
  }

  get ticks(): number[] { return this._ticks }

  set ticks(value: number[]) { this._ticks = value }

  get titleText(): string { return Text.capitalize(this.name) }

  get transformMatrix(): DOMMatrix { return this.getValueToDrawMatrix() }

  get areAllLabelsDisplayed(): boolean { return this.isDiscrete && this.ticks.length > uniqueValues(this.labels).length + 2 }

  protected updateOffsetTicks(): void { this.offsetTicks = Math.abs(this.boundingBox.size[this.isVertical ? "x" : "y"]) * 0.25 }

  private horizontalPickIdx(): number { return Math.sign(1 - Math.sign(this.initScale.y)) }

  private verticalPickIdx(): number { return Math.sign(1 - Math.sign(this.initScale.x)) }

  protected computeEnds(): void { }

  public toggleView(): void { this.visible = !this.visible }

  private discretePropertiesFromVector(vector: any[]): void {
    if (vector) {
      if (vector.length != 0) this.isDiscrete = typeof vector[0] == 'string';
      if (this.isDiscrete) this.labels = vector.length != 0 ? uniqueValues(vector) : ["0", "1"];
    } else {
      this.isDiscrete = true;
      this.labels = ["0", "1"];
    }
  }

  public otherAxisScaling(otherAxis: Axis): void {
    const center = this.center;
    this.maxValue = this.minValue + otherAxis.interval * this.drawLength / otherAxis.drawLength;
    const translation = center - this.center;
    this.minValue += translation;
    this.maxValue += translation;
  }

  public transform(newOrigin: Vertex, newEnd: Vertex): void {
    this.origin = newOrigin.copy();
    this.end = newEnd.copy();
    this.rubberBand.isVertical = this.isVertical;
    this.drawPath = this.buildDrawPath();
    this.buildPath();
    this.emitter.emit("axisStateChange", this);
  }

  public resetScale(): void {
    this.minValue = this.initMinValue;
    this.maxValue = this.initMaxValue;
    this._previousMin = this.initMinValue;
    this._previousMax = this.initMaxValue;
    this.updateTicks();
  }

  public reset(): void {
    this.rubberBand.reset();
    this.resetScale();
  }

  public update(axisStyle: Map<string, any>, viewPoint: Vertex, scale: Vertex, translation: Vertex): void {
    axisStyle.forEach((value, key) => this[key] = value);
    this.updateScale(viewPoint, scale, translation);
  }

  public updateStyle(axisStyle: Map<string, any>) { axisStyle.forEach((value, key) => this[key] = value) }

  public sendRubberBand(rubberBands: Map<string, RubberBand>) { this.rubberBand.selfSend(rubberBands) }

  public sendRubberBandRange(rubberBands: Map<string, RubberBand>) { this.rubberBand.selfSendRange(rubberBands) }

  private static nearestFive(value: number): number {
    const tenPower = Math.floor(Math.log10(Math.abs(value)));
    const normedValue = Math.floor(value / Math.pow(10, tenPower - 2));
    const fiveMultiple = Math.floor(normedValue / 50);
    return (50 * fiveMultiple) * Math.pow(10, tenPower - 2);
  }

  public adjustBoundingBox(): void {
    if (this.isVertical) {
      this.boundingBox.size.x += SIZE_AXIS_END / 2;
      this.boundingBox.size.y += SIZE_AXIS_END;
    }
    else {
      this.boundingBox.size.x += SIZE_AXIS_END;
      this.boundingBox.size.y += SIZE_AXIS_END / 2;
    }
    this.boundingBox.buildPath();
  }

  protected buildDrawPath(): Path2D {
    const verticalIdx = Number(this.isVertical);
    const horizontalIdx = Number(!this.isVertical);
    const path = new Path2D();
    let endArrow: Point;
    if (this.isInverted) {
      endArrow = new Point(this.origin.x - SIZE_AXIS_END / 2 * horizontalIdx, this.origin.y - SIZE_AXIS_END / 2 * verticalIdx, SIZE_AXIS_END, 'triangle', ['left', 'down'][verticalIdx]);
    } else {
      endArrow = new Point(this.end.x + SIZE_AXIS_END / 2 * horizontalIdx, this.end.y + SIZE_AXIS_END / 2 * verticalIdx, SIZE_AXIS_END, 'triangle', ['right', 'up'][verticalIdx]);
    }
    path.moveTo(this.origin.x - this.DRAW_START_OFFSET * horizontalIdx, this.origin.y - this.DRAW_START_OFFSET * verticalIdx);
    path.lineTo(this.end.x, this.end.y);
    path.addPath(endArrow.path);
    return path
  }

  public buildPath(): void {
    this.path = new Path2D();
    const offset = new Vertex(this.SELECTION_RECT_SIZE * Number(this.isVertical), this.SELECTION_RECT_SIZE * Number(!this.isVertical));
    const origin = new Vertex(this.origin.x, this.origin.y).subtract(offset.multiply(2));
    const size = this.end.subtract(origin).add(offset);
    this.path.rect(origin.x, origin.y, size.x, size.y);
  }

  public absoluteToRelative(value: string | number): number {
    const numberedValue = this.stringToValue(value);
    return this.isVertical ? (numberedValue - this.transformMatrix.f) / this.transformMatrix.d : (numberedValue - this.transformMatrix.e) / this.transformMatrix.a
  }

  public relativeToAbsolute(value: string | number): number {
    const numberedValue = this.stringToValue(value);
    return this.isVertical ? numberedValue * this.transformMatrix.d + this.transformMatrix.f : numberedValue * this.transformMatrix.a + this.transformMatrix.e
  }

  public normedValue(value: number): number { return value / this.interval }

  private computeMinMax(vector: any[]): number[] {
    if (!vector?.length) return [0, 1];
    if (this.isDiscrete) return [0, this.labels.length - 1];
    const min = Math.min(...vector);
    const max = Math.max(...vector);
    return min != max ? [min, max] : min != 0 ? [min * (min < 0 ? 1.3 : 0.7), max * (max < 0 ? 0.7 : 1.3)] : [-1, 1]
  }

  protected getCalibratedTextWidth(context: CanvasRenderingContext2D): [Text, number] {
    const calibratedTickText = new Text("88.88e+88", new Vertex(0, 0), { fontsize: this.FONT_SIZE, font: this.font });
    context.font = calibratedTickText.fullFont;
    const calibratedMeasure = context.measureText(calibratedTickText.text).width;
    return [calibratedTickText, calibratedMeasure]
  }

  public computeTextBoxes(context: CanvasRenderingContext2D): void {
    context.save();
    const [calibratedTickText, calibratedMeasure] = this.getCalibratedTextWidth(context);
    this.maxTickWidth = Math.min(this.boundingBox.size.x - this.offsetTicks - 3, calibratedMeasure);
    this.maxTickHeight = Math.min(this.boundingBox.size.y - this.offsetTicks - 3, calibratedTickText.fontsize);
    if (this.centeredTitle) this.centeredTitleTextBoxes(calibratedMeasure);
    context.restore();
  }

  private centeredTitleTextBoxes(calibratedMeasure: number): void {
    let freeSpace: number;
    if (this.isVertical) {
      freeSpace = this.boundingBox.size.x - this.FONT_SIZE - 0.3 * this.maxTickWidth;
      this.offsetTitle = Math.min(freeSpace, calibratedMeasure);
      this.maxTickHeight -= this.offsetTitle;
    } else {
      freeSpace = this.boundingBox.size.y - this.FONT_SIZE - 0.3 * this.maxTickHeight;
      this.offsetTitle = Math.min(freeSpace, this.FONT_SIZE * 1.5 + this.offsetTicks);
      this.maxTickWidth -= this.offsetTitle;
    }
  }

  protected computeTicks(): number[] {
    const increment = this.isDiscrete ? 1 : Axis.nearestFive((this.maxValue - this.minValue) / this.nTicks);
    const remainder = this.minValue % increment;
    let ticks = [this.minValue - remainder];
    while (ticks.slice(-1)[0] <= this.maxValue) ticks.push(ticks.slice(-1)[0] + increment);
    if (ticks.slice(0)[0] < this.minValue) ticks.splice(0, 1);
    if (ticks.slice(-1)[0] >= this.maxValue) ticks.splice(-1, 1);
    return ticks
  }

  public drawWhenIsVisible(context: CanvasRenderingContext2D): void {
    context.save();
    this.drawPath = this.buildDrawPath();
    this.buildPath();
    this.computeTextBoxes(context);

    const canvasHTMatrix = context.getTransform();
    const pointHTMatrix = canvasHTMatrix.multiply(this.transformMatrix);
    const color = this.drawingColor;

    context.strokeStyle = color;
    context.setLineDash([]);
    context.fillStyle = color;
    context.lineWidth = this.lineWidth;
    context.stroke(this.drawPath);
    context.fill(this.drawPath);
    context.resetTransform();

    context.setTransform(pointHTMatrix);
    const [ticksPoints, ticksTexts] = this.drawTicksPoints(context, pointHTMatrix, color);
    this.ticksPoints = ticksPoints;

    context.resetTransform();
    this.drawTickTexts(ticksTexts, color, context);
    this.drawTitle(context, canvasHTMatrix, color);

    context.setTransform(canvasHTMatrix);
    this.drawRubberBand(context);
    context.restore();
  }

  protected getTitleTextParams(color: string, align: string, baseline: string, orientation: number): TextParams {
    return {
      width: this.titleWidth,
      fontsize: this.FONT_SIZE,
      font: this.font,
      align: align,
      color: color,
      baseline: baseline,
      style: 'bold',
      orientation: orientation,
      backgroundColor: "hsla(0, 0%, 100%, 0.5)",
      scale: new Vertex(1, 1)
    }
  }

  protected formatTitle(text: Text, context: CanvasRenderingContext2D): void { text.format(context) }

  protected updateTitle(context: CanvasRenderingContext2D, text: string, origin: Vertex, textParams: TextParams): void {
    this.title.text = text;
    this.title.origin = origin;
    this.title.updateParameters(textParams);
    this.title.boundingBox.buildPath();
    this.title.boundingBox.hoverStyle = this.title.boundingBox.clickedStyle = this.title.boundingBox.selectedStyle = this.title.boundingBox.fillStyle;
    this.title.rowIndices = [];
  }

  protected drawTitle(context: CanvasRenderingContext2D, canvasHTMatrix: DOMMatrix, color: string): void {
    this.setTitleSettings();
    const textParams = this.getTitleTextParams(color, this.titleSettings.align, this.titleSettings.baseline, this.titleSettings.orientation);
    this.updateTitle(context, this.titleText, this.titleSettings.origin.transform(canvasHTMatrix), textParams);
    this.title.draw(context);
    this.path.addPath(this.title.path, new DOMMatrix([this.initScale.x, 0, 0, this.initScale.y, 0, 0]));
  }

  public setTitleSettings(): void { this.centeredTitle ? this.centeredTitleProperties() : this.topArrowTitleProperties() }

  private centeredTitleProperties(): void {
    this.titleSettings.origin = this.end.add(this.origin).divide(2);
    this.titleSettings.align = "center";
    this.titleSettings.baseline = ['bottom', 'top'][this.horizontalPickIdx()];
    if (this.isVertical) {
      this.titleSettings.origin.x -= this.offsetTitle;
      this.titleSettings.baseline = ['bottom', 'top'][this.verticalPickIdx()];
    } else this.titleSettings.origin.y -= this.offsetTitle;
    this.titleSettings.orientation = this.isVertical ? -90 : 0;
  }

  private topArrowTitleProperties(): void {
    this.titleSettings.origin = this.end.copy();
    if (this.isVertical) {
      this.titleSettings.origin.x += this.FONT_SIZE;
      this.titleSettings.align = ["start", "end"][this.verticalPickIdx()];
      this.titleSettings.baseline = ['bottom', 'top'][this.horizontalPickIdx()];
    }
    else {
      this.titleSettings.origin.y += this.FONT_SIZE;
      this.titleSettings.align = ["end", "start"][this.verticalPickIdx()];
      this.titleSettings.baseline = ['top', 'bottom'][this.horizontalPickIdx()];
    }
    this.titleSettings.orientation = 0;
  }

  private drawTicksPoints(context: CanvasRenderingContext2D, pointHTMatrix: DOMMatrix, color: string): [Point[], Text[]] {
    const ticksPoints = [];
    const ticksText: Text[] = [];
    const tickTextParams = this.computeTickTextParams();
    let count = Math.max(0, this.ticks[0]);
    while (this.labels[count] == '') count++;
    this.ticks.forEach((tick, idx) => {
      let point = this.drawTickPoint(context, tick, this.isVertical, pointHTMatrix, color);
      let text = this.labels[idx];
      ticksPoints.push(point);
      if (this.isDiscrete) {
        if (count == tick && this.labels[count]) {
          text = this.labels[count];
          count++;
        }
        else text = '';
      }
      ticksText.push(this.computeTickText(context, text, tickTextParams, point, pointHTMatrix));
    })
    return [ticksPoints, ticksText]
  }

  private drawTickTexts(ticksTexts: Text[], color: string, context: CanvasRenderingContext2D): void {
    this.ticksFontsize = Math.min(...ticksTexts.map(tickText => tickText.fontsize));
    ticksTexts.forEach(tickText => this.drawTickText(tickText, color, context));
  }

  private drawTickText(tickText: Text, color: string, context: CanvasRenderingContext2D): void {
    tickText.fillStyle = color;
    tickText.fontsize = this.ticksFontsize;
    tickText.draw(context);
  }

  private computeTickTextParams(): TextParams {
    const [textAlign, baseline] = this.textAlignments();
    let textWidth = null;
    let textHeight = null;
    const standardOffset = this.drawLength * 0.95 / this.ticks.length;
    if (['start', 'end'].includes(textAlign)) {
      textWidth = this.maxTickWidth;
      textHeight = standardOffset;
    }
    if (textAlign == 'center') {
      textWidth = standardOffset;
      textHeight = this.maxTickHeight;
    }
    return {
      width: textWidth, height: textHeight, fontsize: this.FONT_SIZE, font: this.font, scale: new Vertex(1, 1),
      align: textAlign, baseline: baseline, color: this.strokeStyle, backgroundColor: "hsl(0, 0%, 100%, 0.5)"
    }
  }

  protected drawTickPoint(context: CanvasRenderingContext2D, tick: number, vertical: boolean, HTMatrix: DOMMatrix, color: string): Point {
    const point = new Point(tick * Number(!vertical), tick * Number(vertical), SIZE_AXIS_END / Math.abs(HTMatrix.a), this.tickMarker, this.tickOrientation, color);
    point.draw(context);
    return point
  }

  private computeTickText(context: CanvasRenderingContext2D, text: string, tickTextParams: TextParams, point: Point, HTMatrix: DOMMatrix): Text {
    const textOrigin = this.tickTextPositions(point, HTMatrix);
    const tickText = new Text(Text.capitalize(text), textOrigin, tickTextParams);
    tickText.removeEndZeros();
    tickText.format(context);
    return tickText
  }

  private getValueToDrawMatrix(): DOMMatrix {
    const scale = this.drawLength / this.interval;
    if (this.isInverted) {
      return new DOMMatrix([
        -scale, 0, 0, -scale,
        this.end.x + this.minValue * Number(!this.isVertical) * scale,
        this.end.y + this.minValue * Number(this.isVertical) * scale
      ]);
    }
    return new DOMMatrix([
      scale, 0, 0, scale,
      this.origin.x - this.minValue * Number(!this.isVertical) * scale,
      this.origin.y - this.minValue * Number(this.isVertical) * scale
    ]);
  }

  private marginedBounds(minValue: number, maxValue: number): [number, number] {
    const valueRange = Math.abs(maxValue - minValue);
    if (this.isDiscrete) return [minValue - 1, maxValue + 1]
    return [
      minValue - valueRange * this.marginRatio,
      maxValue + valueRange * this.marginRatio];
  }

  public drawRubberBand(context: CanvasRenderingContext2D): void {
    const canvasMin = this.relativeToAbsolute(this.rubberBand.minValue);
    const canvasMax = this.relativeToAbsolute(this.rubberBand.maxValue);
    const coord = this.isVertical ? "y" : "x";
    this.rubberBand.canvasMin = Math.max(Math.min(canvasMin, canvasMax), this.origin[coord]);
    this.rubberBand.canvasMax = Math.min(Math.max(canvasMin, canvasMax), this.end[coord]);
    this.rubberBand.canvasMin = Math.min(this.rubberBand.canvasMin, this.rubberBand.canvasMax);
    this.rubberBand.canvasMax = Math.max(this.rubberBand.canvasMin, this.rubberBand.canvasMax);
    this.rubberBand.draw(this.isVertical ? this.origin.x : this.origin.y, context, this.rubberColor, this.rubberColor, 0.1, this.rubberAlpha);
    if (this.rubberBand.isClicked) this.emitter.emit("rubberBandChange", this.rubberBand);
  }

  protected mouseTranslate(mouseDown: Vertex, mouseCoords: Vertex): void { }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void {
    super.mouseMove(context, mouseCoords);
    this.boundingBox.mouseMove(context, mouseCoords);
    this.title.mouseMove(context, mouseCoords.scale(this.initScale));
    if (this.isClicked) {
      if (this.title.isClicked) this.mouseMoveClickedTitle(mouseCoords)
      else this.mouseMoveClickedArrow(mouseCoords);
    }
  }

  public mouseMoveClickedArrow(mouseCoords: Vertex): void {
    const downValue = this.absoluteToRelative(this.isVertical ? this.mouseClick.y : this.mouseClick.x);
    const currentValue = this.absoluteToRelative(this.isVertical ? mouseCoords.y : mouseCoords.x);
    if (!this.rubberBand.isClicked) {
      this.rubberBand.minValue = Math.min(downValue, currentValue);
      this.rubberBand.maxValue = Math.max(downValue, currentValue);
    } else this.rubberBand.mouseMove(downValue, currentValue);
  }

  public mouseMoveClickedTitle(mouseCoords: Vertex): void { }

  public mouseDown(mouseDown: Vertex): void {
    super.mouseDown(mouseDown);
    if (this.isHovered) {
      this.isClicked = true;
      if (this.title.isHovered) this.clickOnTitle(mouseDown)
      else {
        this.is_drawing_rubberband = true; // OLD
        const mouseUniCoord = this.isVertical ? mouseDown.y : mouseDown.x;
        if (!this.isInRubberBand(this.absoluteToRelative(mouseUniCoord))) this.rubberBand.reset()
        else this.rubberBand.mouseDown(mouseUniCoord);
        this.emitter.emit("rubberBandChange", this.rubberBand);
      }
    }
    if (this.boundingBox.isHovered) this.boundingBox.isClicked = true;
    this.saveLocation();
  }

  public mouseUp(keepState: boolean): void {
    super.mouseUp(keepState);
    this.isClicked = false;
    this.boundingBox.isClicked = false;
    this.title.mouseUp(false);
    this.title.isClicked = false;
    this.rubberBand.mouseUp();
    if (this.is_drawing_rubberband) this.emitter.emit("rubberBandChange", this.rubberBand);
    this.is_drawing_rubberband = false;
  }

  protected clickOnTitle(mouseDown: Vertex): void { this.title.mouseDown(mouseDown); this.title.isClicked = true }

  public isInRubberBand(value: number): boolean {
    return (value >= this.rubberBand.minValue && value <= this.rubberBand.maxValue)
  }

  public numericLabels(): string[] {
    this.updateTickPrecision();
    return this.ticks.map(tick => tick.toPrecision(this.tickPrecision))
  }

  public saveLocation(): void {
    this._previousMin = this.minValue;
    this._previousMax = this.maxValue;
  }

  public stringsToValues(vector: any[]): number[] {
    if (this.isDiscrete) return vector.map(value => this.labels.indexOf(value))
    return vector
  }

  public stringToValue(value: string | number): number {
    if (typeof value == 'string') return this.labels.indexOf(value)
    return value
  }

  protected textAlignments(): [string, string] {
    const forVertical = this.initScale.x > 0 ? 'end' : 'start';
    const forHorizontal = this.initScale.y > 0 ? 'bottom' : 'top';
    return this.isVertical ? [forVertical, 'middle'] : ['center', forHorizontal]
  }

  private tickTextPositions(point: Point, HTMatrix: DOMMatrix): Vertex {
    const origin = point.center.transform(HTMatrix);
    const inversionFactor = this.isInverted ? 1 : -1
    if (this.isVertical) origin.x += inversionFactor * Math.sign(HTMatrix.a) * this.offsetTicks
    else origin.y += inversionFactor * Math.sign(HTMatrix.d) * this.offsetTicks;
    return origin
  }

  public updateScale(viewPoint: Vertex, scaling: Vertex, translation: Vertex): void {
    const HTMatrix = this.transformMatrix;
    let center = (viewPoint.x - HTMatrix.e) / HTMatrix.a;
    let offset = translation.x;
    let scale = scaling.x;
    if (this.isVertical) {
      center = (viewPoint.y - HTMatrix.f) / HTMatrix.d;
      offset = translation.y;
      scale = scaling.y;
    }
    this.minValue = (this._previousMin - center) / scale + center - offset / HTMatrix.a;
    this.maxValue = (this._previousMax - center) / scale + center - offset / HTMatrix.a;
    this.updateTicks();
  }

  private updateTickPrecision(): number {
    this.tickPrecision = 1;
    for (let index = 0; index < this.ticks.length - 1; index++) {
      const rightTick = this.ticks[index + 1];
      const leftTick = this.ticks[index];
      while (Number(rightTick.toPrecision(this.tickPrecision)) / Number(leftTick.toPrecision(this.tickPrecision)) == 1) {
        this.tickPrecision++;
      };
    }
    return
  };

  public updateTicks(): void {
    this.ticks = this.computeTicks();
    if (!this.isDiscrete) this.labels = this.numericLabels();
  }
}

export class ParallelAxis extends Axis {
  public titleZone: Rect = new Rect();
  private _hasMoved: boolean = false;
  private _previousOrigin: Vertex;
  private _previousEnd: Vertex;

  constructor(
    vector: any[],
    public boundingBox: Rect,
    public origin: Vertex,
    public end: Vertex,
    public name: string = '',
    public initScale: Vertex,
    protected _nTicks: number = 10
  ) {
    super(vector, boundingBox, origin, end, name, initScale, _nTicks);
    this.centeredTitle = false;
    this.updateEnds();
  }

  get tickMarker(): string { return "line" }

  get tickOrientation(): string { return this.isVertical ? "horizontal" : "vertical" }

  get hasMoved(): boolean { return this._hasMoved }

  set hasMoved(value: boolean) { this._hasMoved = value; if (this._hasMoved) this.emitter.emit("axisStateChange", this) }

  protected updateOffsetTicks(): void { this.offsetTicks = 10 } // TODO: make it responsive

  public resetScale(): void {
    this.isInverted = false;
    super.resetScale();
  }

  public setTitleSettings(): void {
    this.isVertical ? this.verticalTitleProperties() : this.horizontalTitleProperties()
  }

  private horizontalTitleProperties(): void {
    this.titleSettings.origin.y = this.titleZone.origin.y + this.titleZone.size.y;
    this.titleSettings.baseline = this.initScale.y > 0 ? "bottom" : "top";
    this.titleSettings.orientation = 0;
  }

  private verticalTitleProperties(): void {
    this.titleSettings.baseline = this.initScale.y > 0 ? "top" : "bottom";
    this.titleSettings.orientation = 0;
  }

  public computeTitle(index: number, nAxis: number): ParallelAxis {
    this.titleZone = new Rect(this.origin.copy(), this.boundingBox.size.copy());
    const SIZE_FACTOR = 0.35;
    let offset = 0;
    if (this.isVertical) {
      offset = this.drawLength + Math.min(SIZE_AXIS_END * 2, this.drawLength * 0.05);
      this.titleZone.origin.y += offset;
    } else {
      offset = this.offsetTicks + this.FONT_SIZE + SIZE_AXIS_END;
      if (index != nAxis - 1) this.titleZone.size.x *= SIZE_FACTOR;
      this.titleZone.size.y = Math.abs(this.boundingBox.origin.y) - Math.abs(this.origin.y);
      this.titleZone.origin.y -= this.titleZone.size.y;
    }
    this.titleZone.size.y -= offset;
    this.titleZone.buildPath();
    this.titleSettings.origin = this.titleZone.origin.copy();
    this.titleSettings.align = this.initScale.x > 0 ? "left" : "right";

    if (this.isVertical) this.titleSettings.align = "center";
    return this
  }

  protected getTitleTextParams(color: string, align: string, baseline: string, orientation: number): TextParams {
    const titleTextParams = super.getTitleTextParams(color, align, baseline, orientation);
    titleTextParams.multiLine = true;
    titleTextParams.width = this.titleZone.size.x;
    titleTextParams.height = this.titleZone.size.y;
    return titleTextParams
  }

  protected computeEnds(): void {
    super.computeEnds();
    if (this.isVertical) {
      this.end.y -= this.drawLength * 0.1;
      this.boundingBox.size.x -= SIZE_AXIS_END / 2;
    }
    else this.boundingBox.size.y -= SIZE_AXIS_END / 2;
  }

  public mouseMoveClickedTitle(mouseCoords: Vertex): void {
    const translation = mouseCoords.subtract(this.mouseClick);
    this.translate(this._previousOrigin.add(translation), this._previousEnd.add(translation));
    if (translation.norm > 10) this.hasMoved = true;
  }

  public mouseUp(keepState: boolean): void {
    if (this.title.isClicked && this.title.isHovered && !this.hasMoved) {
      this.title.isClicked = false;
      this.flip();
    }
    if (this.hasMoved) this.updateEnds();
    this.hasMoved = false;
    super.mouseUp(keepState);
  }

  private updateEnds(): void {
    this._previousOrigin = this.origin.copy();
    this._previousEnd = this.end.copy();
  }

  protected flip(): void {
    this.isInverted = !this.isInverted;
    this.rubberBand.isInverted = this.isInverted;
    this.emitter.emit("axisStateChange", this);
  }

  public updateLocation(newOrigin: Vertex, newEnd: Vertex, boundingBox: Rect, index: number, nAxis: number): void {
    this.boundingBox = boundingBox;
    this.transform(newOrigin, newEnd);
    this.computeEnds();
    this.adjustBoundingBox();
    this.updateEnds();
    this.drawPath = this.buildDrawPath();
    this.buildPath();
    this.computeTitle(index, nAxis);
  }

  public translate(newOrigin: Vertex, newEnd: Vertex): void {
    const translation = newOrigin.subtract(this.origin);
    this.boundingBox.translate(translation);
    this.titleSettings.origin = this.titleSettings.origin.add(translation);
    this.titleZone.origin = this.titleZone.origin.add(translation);
    this.transform(newOrigin, newEnd);
  }

  protected updateTitle(context: CanvasRenderingContext2D, text: string, origin: Vertex, textParams: TextParams): void {
    super.updateTitle(context, text, origin, textParams);
    const writtenText = this.title.format(context);
    if (this.isVertical && writtenText.length == 1) {
      this.titleSettings.align = "center";
      this.titleSettings.origin.x = this.origin.x * this.initScale.x;
      this.title.origin.x = this.titleSettings.origin.x;
      this.title.align = "center";
    }
  }

  public computeTextBoxes(context: CanvasRenderingContext2D): void {
    context.save();
    const [calibratedTickText, calibratedMeasure] = this.getCalibratedTextWidth(context);
    this.maxTickWidth = this.origin.x - this.boundingBox.origin.x - this.offsetTicks - 3;
    this.maxTickHeight = Math.min(this.boundingBox.size.y - this.offsetTicks - 3 - SIZE_AXIS_END / 2, calibratedTickText.fontsize);
    context.restore();
  }
}
