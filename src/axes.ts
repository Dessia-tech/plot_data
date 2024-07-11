import { SIZE_AXIS_END, AXIS_TAIL_SIZE, RUBBERBAND_SMALL_SIZE, DEFAULT_FONTSIZE } from "./constants"
import { uniqueValues, isIntegerArray, getTenPower, formatDateTicks } from "./functions"
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
  public path: Path2D;
  public emitter: EventEmitter = new EventEmitter();
  public rubberBand: RubberBand;
  public mouseStyleON: boolean = false;

  public initMinValue: number;
  public initMaxValue: number;
  private _previousMin: number;
  private _previousMax: number;
  private _minValue: number;
  private _maxValue: number;
  private _marginRatio: number = 0.05;

  public labels: string[];
  public ticksPoints: Point[];
  protected _ticks: number[];
  public tickPrecision: number;
  public ticksFontsize: number = 12;
  protected offsetTicks: number;
  protected maxTickWidth: number;
  protected maxTickHeight: number;

  public isDiscrete: boolean = true;
  public isInteger: boolean = false;
  public logScale: boolean = false;
  public isDate: boolean = false;
  public isInverted: boolean = false;

  public title: Text;
  public centeredTitle: boolean = false;
  public titleSettings: TitleSettings = new TitleSettings();
  public titleWidth: number;
  public font: string = 'sans-serif';
  public offsetTitle: number;

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
    this.drawnPath = this.buildArrowPath();
    this.buildPath();
    this.buildRubberBand();
    this.updateOffsetTicks();
    this.offsetTitle = 0;
    this.title = new Text(this.titleText, new Vertex(0, 0), {});
  };

  public get drawLength(): number {
    return this.isVertical ? Math.abs(this.origin.y - this.end.y) : Math.abs(this.origin.x - this.end.x);
  }

  private get drawingColor(): string {
    return this.mouseStyleON
      ? this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.strokeStyle
      : this.strokeStyle
  }

  get interval(): number { return Math.abs(this.maxValue - this.minValue) };

  get drawScale(): number { return this.drawLength / this.interval }

  get center(): number { return (this.maxValue + this.minValue) / 2 }

  get isVertical(): boolean { return this.origin.x == this.end.x };

  set marginRatio(value: number) { this._marginRatio = value };

  get marginRatio(): number { return this._marginRatio };

  get tickMarker(): string { return "halfLine" }

  get tickOrientation(): string {
    return this.isVertical
      ? this.initScale.x > 0 ? 'right' : 'left'
      : this.initScale.y > 0 ? 'up' : 'down';
    }

  get minValue(): number { return this._minValue }

  set minValue(value: number) { this._minValue = value; this.emitter.emit("axisStateChange", this); }

  get maxValue(): number { return this._maxValue }

  set maxValue(value: number) { this._maxValue = value }

  set nTicks(value: number) { this._nTicks = value };

  get nTicks(): number { return this.isDiscrete ? this.labels.length + 1 : this._nTicks }

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

  private getLogBoundaries(vector: number[]): [number, number] {
    const positiveVector = vector.filter(value => value > 0);
    const min = Math.min(...positiveVector);
    const max = Math.max(...positiveVector);
    if (max <= 0) {
      this.logScale = false;
      return [this.initMinValue, this.initMaxValue]
    }
    if (this.logScale) {
      return [
        this.initMinValue > 0 ? Math.log10(this.initMinValue) : Math.log10(min),
        this.initMaxValue > 0 ? Math.log10(this.initMaxValue) : Math.log10(max)
      ]
    } else return [10 ** this.initMinValue, 10 ** this.initMaxValue]
  }

  public switchLogScale(vector: number[]): void {
    if (!this.isDiscrete) {
      this.logScale = !this.logScale;
      [this.initMinValue, this.initMaxValue] = this.getLogBoundaries(vector);
      this.updateTicks();
    }
  }

  private emptyVectorTypeAndLabels(): void {
    this.isDiscrete = true;
    this.labels = ["0", "1"];
  }

  private getDiscreteLabels(vector: string[]): void {
    this.labels = vector.length != 0 ? uniqueValues(vector) : ["0", "1"];
  }

  private getVectorType(vector: any[]): void {
    if (vector.length != 0) {
      this.isDate = vector[0] instanceof Date;
      this.isDiscrete = !this.isDate && typeof vector[0] == 'string';
    }
    this.isInteger = isIntegerArray(vector) && !this.isDate && !this.isDiscrete;
  }

  private filledVectorTypeAndLabels(vector: any[]): void {
    this.getVectorType(vector);
    if (this.isDiscrete) this.getDiscreteLabels(vector);
  }

  private discretePropertiesFromVector(vector: any[]): void {
    if (vector) this.filledVectorTypeAndLabels(vector)
    else this.emptyVectorTypeAndLabels();
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
    this.drawnPath = this.buildArrowPath();
    this.buildPath();
    this.emitter.emit("axisStateChange", this);
  }

  public resetScale(): void {
    this.minValue = this.initMinValue;
    this.maxValue = this.initMaxValue;
    this._previousMin = this.minValue;
    this._previousMax = this.maxValue;
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

  private buildRubberBand(): void {
    this.rubberBand = new RubberBand(this.name, 0, 0, this.isVertical);
    this.rubberBand.defaultStyle();
  }

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

  public absoluteToRelative(value: string | number): number {
    let numberedValue = this.stringToValue(value);
    const projectedValue = this.isVertical
      ? (numberedValue - this.transformMatrix.f) / this.transformMatrix.a
      : (numberedValue - this.transformMatrix.e) / this.transformMatrix.a;
    return this.logScale ? 10 ** projectedValue : projectedValue;
  }

  public relativeToAbsolute(value: string | number): number {
    let numberedValue = this.stringToValue(value);
    if (this.logScale) numberedValue = Math.log10(numberedValue);
    return this.isVertical
      ? numberedValue * this.transformMatrix.d + this.transformMatrix.f
      : numberedValue * this.transformMatrix.a + this.transformMatrix.e;
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
    const calibratedTickText = new Text("88.88e+88", new Vertex(0, 0), { fontsize: DEFAULT_FONTSIZE, font: this.font });
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
      freeSpace = this.boundingBox.size.x - DEFAULT_FONTSIZE - 0.3 * this.maxTickWidth;
      this.offsetTitle = Math.min(freeSpace, calibratedMeasure);
      this.maxTickHeight -= this.offsetTitle;
    } else {
      freeSpace = this.boundingBox.size.y - DEFAULT_FONTSIZE - 0.3 * this.maxTickHeight;
      this.offsetTitle = Math.min(freeSpace, DEFAULT_FONTSIZE * 1.5 + this.offsetTicks);
      this.maxTickWidth -= this.offsetTitle;
    }
  }

  private integerTickIncrement(rawIncrement: number, logExponent: number): number {
    return rawIncrement >= 1 ? Math.floor(rawIncrement / 10 ** logExponent) * 10 ** logExponent : 1;
  }

  private floatTickIncrement(rawIncrement: number, logExponent: number): number {
    const tenPower = logExponent > 0 ? 1 : 15;
    return Math.round(rawIncrement * 10 ** tenPower) / 10 ** tenPower;
  }

  private getTickIncrement(): number {
    const rawIncrement = this.isDiscrete ? 1 : Axis.nearestFive((this.maxValue - this.minValue) / this.nTicks);
    const logExponent = Math.floor(Math.log10(rawIncrement));
    if (this.isInteger && !this.logScale) return this.integerTickIncrement(rawIncrement, logExponent);
    return this.floatTickIncrement(rawIncrement, logExponent);
  }

  private ticksTenPower(ticks: number[]): number {
    const tenPower = Math.max(...ticks.map(tick => { return getTenPower(tick) }));
    return tenPower > 0 ? tenPower : 0
  }

  private incrementPrecision(increment: number, ticks: number[]): number {
    const tickTenPower = getTenPower(ticks[ticks.length - 1] - ticks[0]);
    const incrementTenPower = getTenPower(increment);
    const unitIncrement = increment / 10 ** incrementTenPower;
    const splitUnitIncrement = unitIncrement.toString().split('.');
    return tickTenPower - incrementTenPower + (splitUnitIncrement.length > 1 ? 2 : 1)
  }

  private getTicksPrecisionFromTickGaps(ticks: number[]): void {
    for (let index = 0; index < ticks.length - 1; index++) {
      const rightTick = ticks[index + 1];
      const leftTick = ticks[index];
      while (Number(rightTick.toPrecision(this.tickPrecision)) / Number(leftTick.toPrecision(this.tickPrecision)) == 1) {
        this.tickPrecision++;
      };
    }
  }

  private updateTickPrecision(increment: number, ticks: number[]): void {
    const splitNumber = increment.toString().split('.');
    const tickTenPower = splitNumber.length > 1 ? this.ticksTenPower(ticks) : 0;
    const decimalLength = splitNumber.length > 1 ? splitNumber[1].length + 1 : this.incrementPrecision(increment, ticks)
    this.tickPrecision = tickTenPower + decimalLength;
    if (ticks.length > 1) this.getTicksPrecisionFromTickGaps(ticks);
    else if (this.isInteger && ticks.length > 0) this.tickPrecision = ticks[0].toString().length;
  };

  protected computeTicks(): number[] {
    const increment = this.getTickIncrement();
    const remainder = this.minValue % increment;
    let ticks = [this.minValue - remainder];
    while (ticks.slice(-1)[0] <= this.maxValue) ticks.push(ticks.slice(-1)[0] + increment);
    if (ticks.slice(0)[0] < this.minValue) ticks.splice(0, 1);
    if (ticks.slice(-1)[0] >= this.maxValue) ticks.splice(-1, 1);
    this.updateTickPrecision(increment, ticks);
    return this.logScale ? ticks.map(tick => 10 ** tick) : ticks
  }

  private buildEndPoint(isVerticalBin: number, isHorizontalBin: number): Point {
    if (this.isInverted) {
      return new Point(
        this.origin.x - SIZE_AXIS_END / 2 * isHorizontalBin,
        this.origin.y - SIZE_AXIS_END / 2 * isVerticalBin,
        SIZE_AXIS_END,
        'triangle',
        ['left', 'down'][isVerticalBin]
      )
    }
    return new Point(
      this.end.x + SIZE_AXIS_END / 2 * isHorizontalBin,
      this.end.y + SIZE_AXIS_END / 2 * isVerticalBin,
      SIZE_AXIS_END,
      'triangle',
      ['right', 'up'][isVerticalBin]
    )
  }

  protected buildArrowPath(): Path2D {
    const isVerticalBin = Number(this.isVertical);
    const isHorizontalBin = Number(!this.isVertical);
    const path = new Path2D();
    const endArrow = this.buildEndPoint(isVerticalBin, isHorizontalBin);
    path.moveTo(this.origin.x - AXIS_TAIL_SIZE * isHorizontalBin, this.origin.y - AXIS_TAIL_SIZE * isVerticalBin);
    path.lineTo(this.end.x, this.end.y);
    path.addPath(endArrow.path);
    return path
  }

  public buildPath(): void {
    this.path = new Path2D();
    const offset = new Vertex(RUBBERBAND_SMALL_SIZE * Number(this.isVertical), RUBBERBAND_SMALL_SIZE * Number(!this.isVertical));
    const origin = new Vertex(this.origin.x, this.origin.y).subtract(offset.multiply(2));
    const size = this.end.subtract(origin).add(offset);
    this.path.rect(origin.x, origin.y, size.x, size.y);
  }

  protected buildDrawPath(context: CanvasRenderingContext2D): void {
    this.drawnPath = this.buildArrowPath();
    this.buildPath();
    this.computeTextBoxes(context);
  }

  public setDrawingProperties(context: CanvasRenderingContext2D): void {
    context.strokeStyle = this.drawingColor;
    context.setLineDash([]);
    context.fillStyle = this.drawingColor;
    context.lineWidth = this.lineWidth;
  }

  private drawTicks(context: CanvasRenderingContext2D, canvasMatrix: DOMMatrix): void {
    const pointHTMatrix = canvasMatrix.multiply(this.transformMatrix);
    const [ticksPoints, ticksTexts] = this.drawTicksPoints(context, pointHTMatrix, this.drawingColor);
    this.ticksPoints = ticksPoints;
    this.drawTickTexts(ticksTexts, this.drawingColor, context);
  }

  private drawTexts(context: CanvasRenderingContext2D, canvasMatrix: DOMMatrix): void {
    context.resetTransform();
    this.drawTicks(context, canvasMatrix)
    this.drawTitle(context, canvasMatrix, this.drawingColor);
  }

  protected drawMembers(context: CanvasRenderingContext2D): void {
    context.save();
    const canvasMatrix = context.getTransform();
    this.drawTexts(context, canvasMatrix);
    this.drawRubberBand(context, canvasMatrix);
    context.restore();
  }

  protected getTitleTextParams(color: string, align: string, baseline: string, orientation: number): TextParams {
    return {
      width: this.titleWidth,
      fontsize: DEFAULT_FONTSIZE,
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
      this.titleSettings.origin.x += DEFAULT_FONTSIZE;
      this.titleSettings.align = ["start", "end"][this.verticalPickIdx()];
      this.titleSettings.baseline = ['bottom', 'top'][this.horizontalPickIdx()];
    }
    else {
      this.titleSettings.origin.y += DEFAULT_FONTSIZE;
      this.titleSettings.align = ["end", "start"][this.verticalPickIdx()];
      this.titleSettings.baseline = ['top', 'bottom'][this.horizontalPickIdx()];
    }
    this.titleSettings.orientation = 0;
  }

  private getFirstNonEmptyLabel(): number {
    let count = Math.max(0, this.ticks[0]);
    while (this.labels[count] == '') count++;
    return count;
  }

  private getDiscreteTickText(count: number, tick: number): [string, number] {
    return count === tick && this.labels[count]
      ? [this.labels[count], count + 1]
      : ['', count];
  }

  private getTickText(tickIndex: number, count: number, tick: number): [string, number] {
    if (this.isDiscrete) return this.getDiscreteTickText(count, tick);
    return [this.labels[tickIndex], count];
  }

  private drawTicksPoints(context: CanvasRenderingContext2D, pointHTMatrix: DOMMatrix, color: string): [Point[], Text[]] {
    const ticksPoints: Point[] = [];
    const ticksText: Text[] = [];
    const tickTextParams = this.computeTickTextParams();
    let count = this.getFirstNonEmptyLabel();
    let text: string;
    this.ticks.forEach((tick, idx) => {
      const point = this.drawTickPoint(context, tick, this.isVertical, pointHTMatrix, color);
      ticksPoints.push(point);
      [text, count] = this.getTickText(idx, count, tick);
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
      width: textWidth, height: textHeight, fontsize: DEFAULT_FONTSIZE, font: this.font, scale: new Vertex(1, 1),
      align: textAlign, baseline: baseline, color: this.strokeStyle, backgroundColor: "hsl(0, 0%, 100%, 0.5)"
    }
  }

  protected drawTickPoint(context: CanvasRenderingContext2D, tick: number, vertical: boolean, HTMatrix: DOMMatrix, color: string): Point {
    const center = this.logScale ?
      new Vertex(Math.log10(tick) * Number(!vertical), Math.log10(tick) * Number(vertical)).transform(HTMatrix) :
      new Vertex(tick * Number(!vertical), tick * Number(vertical)).transform(HTMatrix);
    const point = new Point(center.x, center.y, SIZE_AXIS_END, this.tickMarker, this.tickOrientation, color);
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
    let scale = this.drawLength / this.interval;
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

  public setRubberbandRange(minValue: number, maxValue: number): void {
    this.rubberBand.minValue = Math.min(minValue, maxValue);
    this.rubberBand.maxValue = Math.max(minValue, maxValue);
  }

  public setRubberBandRangeDebug(minValue: string, maxValue: string): void {
    this.setRubberbandRange(Number(minValue), Number(maxValue));
  }

  private updateRubberBand(): void {
    const canvasCoords = new Vertex(
      this.relativeToAbsolute(this.rubberBand.minValue),
      this.relativeToAbsolute(this.rubberBand.maxValue)
    );
    this.rubberBand.updateCoords(canvasCoords, this.origin, this.end);
  }

  public drawRubberBand(context: CanvasRenderingContext2D, canvasMatrix: DOMMatrix): void {
    this.updateRubberBand();
    context.setTransform(canvasMatrix);
    this.rubberBand.draw(context);
    if (this.rubberBand.isClicked) this.emitter.emit("rubberBandChange", this.rubberBand);
  }

  protected mouseTranslate(mouseDown: Vertex, mouseCoords: Vertex): void { }

  public mouseMoveClickedArrow(mouseCoords: Vertex): void {
    const mouseDownCoord = this.isVertical ? this.mouseClick.y : this.mouseClick.x;
    const mouseCurrentCoord = this.isVertical ? mouseCoords.y : mouseCoords.x;
    if (!this.rubberBand.isClicked) {
      this.rubberBand.updateCoords(new Vertex(mouseDownCoord, mouseCurrentCoord), this.origin, this.end);
    }
  }

  public mouseMoveClickedTitle(mouseCoords: Vertex): void { }

  private clickOnArrow(mouseDown: Vertex): void {
    this.is_drawing_rubberband = true; // OLD
    this.rubberBand.isHovered ? this.rubberBand.mouseDown(mouseDown) : this.rubberBand.reset();
    this.emitter.emit("rubberBandChange", this.rubberBand);
  }

  private clickOnDrawnPath(mouseDown: Vertex): void {
    this.isClicked = true;
    this.title.isHovered ? this.clickOnTitle(mouseDown) : this.clickOnArrow(mouseDown);
  }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void {
    super.mouseMove(context, mouseCoords);
    this.boundingBox.mouseMove(context, mouseCoords);
    this.title.mouseMove(context, mouseCoords.scale(this.initScale));
    this.rubberBand.mouseMove(context, mouseCoords);
    if (this.isClicked) {
      if (this.title.isClicked) this.mouseMoveClickedTitle(mouseCoords)
      else this.mouseMoveClickedArrow(mouseCoords);
      this.rubberBand.updateMinMaxValueOnMouseMove(
        this.absoluteToRelative(this.rubberBand.canvasMin),
        this.absoluteToRelative(this.rubberBand.canvasMax)
      );
    }
  }

  public mouseDown(mouseDown: Vertex): void {
    super.mouseDown(mouseDown);
    if (this.isHovered) this.clickOnDrawnPath(mouseDown);
    if (this.boundingBox.isHovered) this.boundingBox.isClicked = true;
    this.saveLocation();
  }

  public mouseUp(keepState: boolean): void {
    super.mouseUp(keepState);
    this.isClicked = false;
    this.boundingBox.isClicked = false;
    this.title.mouseUp(false);
    this.title.isClicked = false;
    this.rubberBand.mouseUp(keepState);
    if (this.is_drawing_rubberband) this.emitter.emit("rubberBandChange", this.rubberBand);
    this.is_drawing_rubberband = false;
  }

  protected clickOnTitle(mouseDown: Vertex): void { this.title.mouseDown(mouseDown); this.title.isClicked = true }

  public isInRubberBand(value: number): boolean {
    return (value >= this.rubberBand.minValue && value <= this.rubberBand.maxValue)
  }

  public numericLabels(): string[] {
    return this.isDate
      ? formatDateTicks(this.ticks)
      : this.ticks.map(tick => tick.toPrecision(this.tickPrecision));
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
    const origin = point.center;
    const inversionFactor = this.isInverted ? 1 : -1
    if (this.isVertical) origin.x += inversionFactor * Math.sign(HTMatrix.a) * this.offsetTicks
    else origin.y += inversionFactor * Math.sign(HTMatrix.d) * this.offsetTicks;
    return origin
  }

  public updateScale(viewPoint: Vertex, scaling: Vertex, translation: Vertex): void {
    const HTMatrix = this.transformMatrix;
    let center = (viewPoint.x - HTMatrix.e) / HTMatrix.a;;
    let offset = translation.x;
    let scale = this.logScale ? 10 ** (scaling.x - 1) : scaling.x;
    if (this.isVertical) {
      center = (viewPoint.y - HTMatrix.f) / HTMatrix.d;
      offset = translation.y;
      scale = this.logScale ? 10 ** (scaling.y - 1) : scaling.y;
    }
    this.minValue = (this._previousMin - center) / scale + center - offset / HTMatrix.a;
    this.maxValue = (this._previousMax - center) / scale + center - offset / HTMatrix.a;
    this.updateTicks();
  }

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
    this.isVertical ? this.verticalTitleProperties() : this.horizontalTitleProperties();
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
      offset = this.offsetTicks + DEFAULT_FONTSIZE + SIZE_AXIS_END;
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
    this.rubberBand.flip(this.isInverted);
    this.emitter.emit("axisStateChange", this);
  }

  public updateLocation(newOrigin: Vertex, newEnd: Vertex, boundingBox: Rect, index: number, nAxis: number): void {
    this.boundingBox = boundingBox;
    this.transform(newOrigin, newEnd);
    this.computeEnds();
    this.adjustBoundingBox();
    this.updateEnds();
    this.drawnPath = this.buildArrowPath();
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
