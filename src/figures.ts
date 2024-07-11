import { SIZE_AXIS_END, AXES_BLANK_SPACE, MIN_OFFSET_X, DEFAULT_SHAPE_COLOR, FREE_SPACE_FACTOR,
  DRAW_MARGIN_FACTOR, PG_CONTAINER_PLOT } from "./constants"
import { range, mapMax, sum, argMax, normalizeArray, arrayDiff, arrayIntersection } from "./functions"
import { colorHsl } from "./colors"
import { PointStyle } from "./styles"
import { Vertex, Shape } from "./baseShape"
import { Rect, Point, LineSequence } from "./primitives"
import { ScatterPoint, Bar, RubberBand, SelectionBox } from "./shapes"
import { Axis, ParallelAxis } from "./axes"
import { ShapeCollection, GroupCollection, PointSet } from "./collections"
import { RemoteFigure } from "./remoteFigure"
import { DataInterface } from "./dataInterfaces"
import { HighlightData } from "./interactions"

export class Figure extends RemoteFigure {
  constructor(
    data: DataInterface,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
  ) {
    super(data, width, height, X, Y, canvasID, is_in_multiplot);
  }

  public static fromMultiplot(data: DataInterface, width: number, height: number, canvasID: string): Figure {
    if (data.type_ == "histogram") return new Histogram(data, width, height, 0, 0, canvasID, true);
    if (data.type_ == "parallelplot")return new ParallelPlot(data, width, height, 0, 0, canvasID, true);
    if (data.type_ == "draw") return new Draw(data, width, height, 0, 0, canvasID, true);
    if (data.type_ == "graph2d") return new Graph2D(data, width, height, 0, 0, canvasID, true);
    if (data.type_ == "primitivegroupcontainer") return new PrimitiveGroupContainer(data, width, height, false, 0, 0, canvasID, true);
    if (data.type_ == "scatterplot") return new Scatter(data, width, height, 0, 0, canvasID, true);
    throw Error(`${data.type_} is not a known type of plot. Possible plots <type_> attributes are 'scatterplot', 'graph2d', 'parallelplot', 'histogram', 'draw', 'primitivegroupcontainer'.`)
  }

  public static createFromMultiplot(data: DataInterface, features: Map<string, any>, context: CanvasRenderingContext2D, canvasID: string): Figure {
    const plot = Figure.fromMultiplot(data, 500, 500, canvasID);
    plot.features = features;
    plot.context = context;
    return plot
  }

  public multiplotDraw(origin: Vertex, width: number, height: number): void {
    this.changeLocationInCanvas(origin, width, height);
    this.resetView();
  }

  public sendHoveredIndicesMultiplot(): number[] { return this.hoveredIndices }

  public receiveMultiplotMouseIndices(multiplotHovered: number[], multiplotClicked: number[], multiplotSelected: number[]): void {
    this.selectedIndices = multiplotSelected;
    this.clickedIndices = [...multiplotClicked];
    this.hoveredIndices = [...multiplotHovered];
  }

  public multiplotSelectedIntersection(multiplotSelected: number[], isSelecting: boolean): [number[], boolean] {
    this.axes.forEach(axis => {
      if (axis.rubberBand.length != 0 && axis.name != "number") {
        isSelecting = true;
        const selectedIndices = this.updateSelected(axis);
        multiplotSelected = arrayIntersection(multiplotSelected, selectedIndices);
      }
    });
    return [multiplotSelected, isSelecting]
  }

  public receivePointSets(pointSets: PointSet[]): void { this.pointSets = pointSets }

  public initRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {
    this.axes.forEach(axis => axis.sendRubberBand(multiplotRubberBands));
  }

  public updateRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {
    this.axes.forEach(axis => axis.sendRubberBandRange(multiplotRubberBands));
  }

  public sendRubberBandsMultiplot(figures: Figure[]): void {
    figures.forEach(figure => figure.receiveRubberBandFromFigure(this));
  }

  protected sendRubberBandsInFigure(figure: Figure): void {
    figure.axes.forEach(otherAxis => {
      this.axes.forEach(thisAxis => {
        if (thisAxis.name == otherAxis.name && thisAxis.name != "number") {
          otherAxis.rubberBand.minValue = thisAxis.rubberBand.minValue;
          otherAxis.rubberBand.maxValue = thisAxis.rubberBand.maxValue;
          otherAxis.emitter.emit("rubberBandChange", otherAxis.rubberBand);
        }
      })
    })
  }

  protected receiveRubberBandFromFigure(figure: Figure): void { figure.sendRubberBandsInFigure(this) }
}

export class Frame extends Figure {
  public xFeature: string;
  public yFeature: string;

  protected _nXTicks: number;
  protected _nYTicks: number;
  constructor(
    data: DataInterface,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
      this.setAxesTitleWidth();
    }

  get frameMatrix(): DOMMatrix {
    const relativeMatrix = this.axes[0].transformMatrix;
    relativeMatrix.d = this.axes[1].transformMatrix.a;
    relativeMatrix.f = this.axes[1].transformMatrix.f;
    return relativeMatrix
  }

  get relativeMatrix(): DOMMatrix { return this.canvasMatrix.multiply(this.frameMatrix) }

  get nXTicks(): number { return this._nXTicks ?? 10 }

  set nXTicks(value: number) { this._nXTicks = value }

  get nYTicks(): number { return this._nYTicks ?? 10 }

  set nYTicks(value: number) { this._nYTicks = value }

  get sampleDrawings(): ShapeCollection { return this.relativeObjects }

  public get drawingZone(): [Vertex, Vertex] {
    const origin = new Vertex();
    origin.x = this.initScale.x < 0 ? this.axes[0].end.x : this.axes[0].origin.x;
    origin.y = this.initScale.y < 0 ? this.axes[1].end.y : this.axes[1].origin.y;
    const size = new Vertex(Math.abs(this.axes[0].end.x - this.axes[0].origin.x), Math.abs(this.axes[1].end.y - this.axes[1].origin.y))
    return [origin.transform(this.canvasMatrix.inverse()), size]
  }

  protected get axesEnd() { return new Vertex(this.axes[0].end.x, this.axes[1].end.y).transform(this.canvasMatrix) }

  protected setAxesTitleWidth(): void {
    this.axes.forEach(axis => axis.titleWidth = this.drawingZone[1].x - 5);
  }

  protected unpackAxisStyle(data: DataInterface): void {
    super.unpackAxisStyle(data);
    this.nXTicks = data.axis?.nb_points_x ?? this.nXTicks;
    this.nYTicks = data.axis?.nb_points_y ?? this.nYTicks;
  }

  public castMouseMove(canvasMouse: Vertex, absoluteMouse: Vertex, frameMouse: Vertex): void {
    super.castMouseMove(canvasMouse, absoluteMouse, frameMouse);
    this.hoveredIndices = this.sampleDrawings.updateShapeStates('isHovered');
  }

  public castMouseUp(ctrlKey: boolean): void {
    super.castMouseUp(ctrlKey);
    this.clickedIndices = this.sampleDrawings.updateShapeStates('isClicked');
  }

  protected setFeatures(data: DataInterface): [string, string] {
    [this.xFeature, this.yFeature] = super.setFeatures(data);
    if (!this.xFeature) {
      this.xFeature = "indices";
      this.features.set("indices", Array.from(Array(this.nSamples).keys()));
    }
    if (!this.yFeature) {
      for (let key of Array.from(this.features.keys())) {
        if (!["name", "indices"].includes(key)) {
          this.yFeature = key;
          break;
        }
      }
    }
    return [this.xFeature, this.yFeature]
  }

  public changeAxisFeature(name: string, index: number): void {
    if (index == 0) this.xFeature = name
    else this.yFeature = name;
    super.changeAxisFeature(name, index);
  }

  protected transformAxes(axisBoundingBoxes: Rect[]): void {
    super.transformAxes(axisBoundingBoxes);
    this.axes[0].transform(this.drawOrigin, new Vertex(this.drawEnd.x, this.drawOrigin.y));
    this.axes[1].transform(this.drawOrigin, new Vertex(this.drawOrigin.x, this.drawEnd.y));
  }

  protected buildAxes(axisBoundingBoxes: Rect[]): [Axis, Axis] {
    super.buildAxes(axisBoundingBoxes);
    return [
      this.setAxis(this.xFeature, axisBoundingBoxes[0], this.drawOrigin, new Vertex(this.drawEnd.x, this.drawOrigin.y), this.nXTicks),
      this.setAxis(this.yFeature, axisBoundingBoxes[1], this.drawOrigin, new Vertex(this.drawOrigin.x, this.drawEnd.y), this.nYTicks)
    ]
  }

  protected buildAxisBoundingBoxes(freeSpace: Vertex): Rect[] {
    const xBoundingBox = new Rect(
      new Vertex(this.drawOrigin.x, this.drawOrigin.y - freeSpace.y),
      new Vertex(this.drawEnd.x - this.drawOrigin.x, freeSpace.y)
    );
    const yBoundingBox = new Rect(
      new Vertex(this.drawOrigin.x - freeSpace.x, this.drawOrigin.y),
      new Vertex(freeSpace.x - AXES_BLANK_SPACE, this.drawEnd.y - this.drawOrigin.y)
    );
    return [xBoundingBox, yBoundingBox]
  }

  protected drawRelativeObjects(context: CanvasRenderingContext2D): void {
    super.drawRelativeObjects(context);
    if (this.isRubberBanded()) this.updateSelectionBox(...this.rubberBandsCorners);
  }

  protected updateSelectionBox(frameDown: Vertex, frameMouse: Vertex) {
    this.axes[0].rubberBand.minValue = Math.min(frameDown.x, frameMouse.x);
    this.axes[1].rubberBand.minValue = Math.min(frameDown.y, frameMouse.y);
    this.axes[0].rubberBand.maxValue = Math.max(frameDown.x, frameMouse.x);
    this.axes[1].rubberBand.maxValue = Math.max(frameDown.y, frameMouse.y);
    super.updateSelectionBox(...this.rubberBandsCorners);
  }

  public switchZoom(): void { this.isZooming = !this.isZooming }

  public updateZoomBox(frameDown: Vertex, frameMouse: Vertex): void {
    if (this.isZooming) this.zoomBox.update(frameDown, frameMouse);
  }

  public get rubberBandsCorners(): [Vertex, Vertex] {
    return [new Vertex(this.axes[0].rubberBand.minValue, this.axes[1].rubberBand.minValue), new Vertex(this.axes[0].rubberBand.maxValue, this.axes[1].rubberBand.maxValue)]
  }

  public activateSelection(emittedRubberBand: RubberBand, index: number): void {
    super.activateSelection(emittedRubberBand, index)
    this.selectionBox.rubberBandUpdate(emittedRubberBand, ["x", "y"][index]);
  }
}

export class Histogram extends Frame {
  public bars: Bar[] = [];

  public fillStyle: string = DEFAULT_SHAPE_COLOR;
  public strokeStyle: string = null;
  public dashLine: number[] = [];

  constructor(
    data: DataInterface,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
      this.unpackBarStyle(data);
    }

  get nXTicks() {return this._nXTicks ? this._nXTicks : 20}

  set nXTicks(value: number) {this._nXTicks = value}

  get nYTicks() {return this._nYTicks ? this._nYTicks : 10}

  set nYTicks(value: number) {this._nYTicks = value}

  protected unpackAxisStyle(data: DataInterface): void {
    super.unpackAxisStyle(data);
    if (data.graduation_nb) this.nXTicks = data.graduation_nb;
  }

  public unpackBarStyle(data: DataInterface): void {
    if (data.surface_style?.color_fill) this.fillStyle = data.surface_style.color_fill;
    if (data.edge_style?.line_width) this.lineWidth = data.edge_style.line_width;
    if (data.edge_style?.color_stroke) this.strokeStyle = data.edge_style.color_stroke;
    if (data.edge_style?.dashline) this.dashLine = data.edge_style.dashline;
  }

  public reset(): void {
    super.reset();
    this.bars = [];
    this.draw();
  }

  private updateNumberAxis(numberAxis: Axis, bars: Bar[]): Axis {
    this.features.set('number', this.getNumberFeature(bars));
    numberAxis.minValue = 0;
    numberAxis.maxValue = Math.max(...this.features.get(this.yFeature)) + 1;
    numberAxis.saveLocation();
    numberAxis.updateTicks();
    return numberAxis
  }

  private getNumberFeature(bars: Bar[]): number[] {
    const numberFeature = this.features.get(this.xFeature).map(() => 0);
    bars.forEach(bar => bar.values.forEach(value => numberFeature[value] = bar.length));
    return numberFeature
  }

  private boundedTicks(axis: Axis): number[] {
    let fakeTicks = [axis.minValue].concat(axis.ticks);
    fakeTicks.push(axis.maxValue)
    return fakeTicks
  }

  private fakeFeatures(): void {
    if (!this.features.has(this.xFeature)) this.features.set(this.xFeature, []);
  }

  private computeBars(vector: number[]): Bar[] {
    this.fakeFeatures();
    const baseAxis = this.axes[0] ?? this.setAxis(this.xFeature, new Rect(), new Vertex(), new Vertex(), this.nXTicks);
    const numericVector = baseAxis.stringsToValues(vector ?? []);
    let fakeTicks = this.boundedTicks(baseAxis);
    let bars = Array.from(Array(fakeTicks.length - 1), () => new Bar([]));
    let barValues = Array.from(Array(fakeTicks.length - 1), () => []);
    numericVector.forEach((value, valIdx) => {
      for (let tickIdx = 0 ; tickIdx < fakeTicks.length - 1 ; tickIdx++ ) {
        if (value >= fakeTicks[tickIdx] && value < fakeTicks[tickIdx + 1]) {
          bars[tickIdx].values.push(valIdx);
          barValues[tickIdx].push(value);
          break
        }
      }
    });
    barValues.forEach((values, index) => bars[index].computeStats(values));
    return bars
  }

  protected computeRelativeObjects(): void {
    super.computeRelativeObjects();
    this.bars = this.computeBars(this.features.get(this.xFeature));
    this.axes[1] = this.updateNumberAxis(this.axes[1], this.bars);
    this.getBarsDrawing();
  }

  protected drawRelativeObjects(context: CanvasRenderingContext2D): void {
    super.drawRelativeObjects(context);
    this.bars.forEach(bar => bar.draw(this.context));
    this.relativeObjects.shapes = [...this.bars, ...this.relativeObjects.shapes];
  }

  private getBarSetColor(bar: Bar): string {
    const setMaps = new Map<number, number>();
    bar.values.forEach(pointIndex => {
      this.pointSets.forEach((pointSet, index) => {
        if (pointSet.includes(pointIndex)) setMaps.set(index, setMaps.get(index) ? setMaps.get(index) + 1 : 1);
      })
    })
    const pointsSetIndex = mapMax(setMaps)[0];
    if (pointsSetIndex !== null) return colorHsl(this.pointSets[pointsSetIndex].color);
  }

  private getBarsDrawing(): void {
    const fullTicks = this.boundedTicks(this.axes[0]);
    const minY = this.boundedTicks(this.axes[1])[0];
    this.bars.forEach((bar, index) => {
      let origin = new Vertex(fullTicks[index], minY);
      let size = new Vertex(fullTicks[index + 1] - fullTicks[index], bar.length > minY ? bar.length - minY : 0);
      if (this.axes[0].isDiscrete) origin.x = origin.x - (fullTicks[2] - fullTicks[1]) / 2;
      const color = this.getBarSetColor(bar) ?? this.fillStyle;
      bar.updateStyle(
        origin, size,
        this.hoveredIndices, this.clickedIndices, this.selectedIndices,
        color, this.strokeStyle, this.dashLine, this.lineWidth
      );
    })
  }

  protected buildAxes(axisBoundingBoxes: Rect[]): [Axis, Axis] {
    const bars = this.computeBars(this.features.get(this.xFeature));
    this.features.set('number', this.getNumberFeature(bars));
    const [xAxis, yAxis] = super.buildAxes(axisBoundingBoxes)
    return [xAxis, this.updateNumberAxis(yAxis, bars)]
  }

  protected setFeatures(data: DataInterface): [string, string] {
    data["attribute_names"] = [data.x_variable, 'number']; // legacy, will disappear
    return super.setFeatures(data);
  }

  public mouseTranslate(currentMouse: Vertex, mouseDown: Vertex): Vertex {
    const translation = super.mouseTranslate(currentMouse, mouseDown);
    return new Vertex(this.axes[0].isDiscrete ? 0 : translation.x, 0)
  }

  protected regulateAxisScale(axis: Axis): void {
    if (!axis.isDate) {
      if (axis.tickPrecision >= this.MAX_PRINTED_NUMBERS) {
        if (this.scaleX > 1) this.scaleX = 1;
      } else if (axis.tickPrecision < 1 || axis.areAllLabelsDisplayed) {
        if (this.scaleX < 1) this.scaleX = 1;
      }
    }
  }

  protected regulateScale(): void {
    this.scaleY = 1;
    super.regulateScale();
  }

  public initRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {
    this.axes[0].sendRubberBand(multiplotRubberBands);
  }

  public updateRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {
    this.axes[0].sendRubberBandRange(multiplotRubberBands);
  }

  protected sendRubberBandsInFigure(figure: Figure): void {
    figure.axes.forEach(otherAxis => {
      if (this.axes[0].name == otherAxis.name) {
        otherAxis.rubberBand.minValue = this.axes[0].rubberBand.minValue;
        otherAxis.rubberBand.maxValue = this.axes[0].rubberBand.maxValue;
        otherAxis.emitter.emit("rubberBandChange", otherAxis.rubberBand);
      }
    })
  }
}

export class Scatter extends Frame {
  public points: ScatterPoint[] = [];

  public fillStyle: string = DEFAULT_SHAPE_COLOR;
  public strokeStyle: string = null;
  public marker: string = 'circle';
  public pointSize: number = 8;

  public tooltipAttributes: string[];
  public isMerged: boolean = false;
  public clusterColors: string[];
  public previousCoords: Vertex[];
  constructor(
    data: DataInterface,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
      if (this.nSamples > 0) {
        this.tooltipAttributes = data.tooltip ? data.tooltip.attribute : Array.from(this.features.keys());
        this.unpackPointStyle(data);
        this.computePoints();
      }
    }

  get sampleDrawings(): ShapeCollection { return this.absoluteObjects }

  public unpackPointStyle(data: DataInterface): void {
    if (data.point_style?.color_fill) this.fillStyle = data.point_style.color_fill;
    if (data.point_style?.color_stroke) this.strokeStyle = data.point_style.color_stroke;
    if (data.point_style?.shape) this.marker = data.point_style.shape;
    if (data.point_style?.stroke_width) this.lineWidth = data.point_style.stroke_width;
    if (data.point_style?.size) this.pointSize = data.point_style.size;
    if (data.tooltip) this.tooltipAttributes = data.tooltip.attributes;
  }

  public resetScales(): void {
    super.resetScales();
    this.computePoints();
  }

  public reset(): void {
    super.reset();
    this.computePoints();
    this.resetClusters();
  }

  public resizeUpdate(): void {
    this.resize();
    this.computePoints();
    this.draw();
  }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D): void {
    super.drawAbsoluteObjects(context);
    this.drawPoints(context);
    this.absoluteObjects.shapes = [...this.points, ...this.absoluteObjects.shapes];
  };

  protected drawPoints(context: CanvasRenderingContext2D): void {
    const axesOrigin = this.axes[0].origin;
    const axesEnd = new Vertex(this.axes[0].end.x, this.axes[1].end.y);
    this.points.forEach(point => this.drawPoint(point, axesOrigin, axesEnd, context));
  }

  private drawPoint(point: ScatterPoint, axesOrigin: Vertex, axesEnd: Vertex, context: CanvasRenderingContext2D): void {
    const colors = point.updateDrawingState(this.clusterColors, this.hoveredIndices, this.clickedIndices, this.selectedIndices);
    const color = colors.size != 0 ? mapMax(colors)[0] : (this.getPointSetColor(point) ?? this.fillStyle);
    point.updateDrawProperties(this.pointStyles, this.clusterColors, color, this.lineWidth, this.marker);
    if (point.isInFrame(axesOrigin, axesEnd, this.initScale)) point.draw(context);
  }

  private getPointSetColor(point: ScatterPoint): string { // TODO: Code duplicate with Histogram's one
    const setMaps = new Map<number, number>();
    point.values.forEach(pointIndex => {
      this.pointSets.forEach((pointSet, index) => {
        if (pointSet.includes(pointIndex)) setMaps.set(index, setMaps.get(index) ? setMaps.get(index) + 1 : 1);
      })
    })
    const pointsSetIndex = mapMax(setMaps)[0]; // TODO: there is a refactor to do here
    if (pointsSetIndex !== null) return colorHsl(this.pointSets[pointsSetIndex].color);
    return null
  }

  public switchMerge(): void {
    this.isMerged = !this.isMerged;
    this.computePoints();
    this.draw();
  }

  protected zoomBoxUpdateAxes(zoomBox: SelectionBox): void {
    super.zoomBoxUpdateAxes(zoomBox);
    this.computePoints();
  }

  public computePoints(): void {
    const thresholdDist = 30;
    const [xCoords, yCoords, xValues, yValues] = this.projectPoints();
    const pointsData = {"xCoords": xCoords, "yCoords": yCoords, "xValues": xValues, "yValues": yValues};
    const mergedPoints = this.mergePoints(xCoords, yCoords, thresholdDist);
    this.points = mergedPoints.map(mergedIndices => {
      return ScatterPoint.fromPlottedValues(
        mergedIndices, pointsData, this.pointSize, this.marker, thresholdDist,
        this.tooltipAttributes, this.features, this.axes, this.xFeature, this.yFeature
        )
    });
  }

  private mergePoints(xCoords: number[], yCoords: number[], minDistance: number = 15): number[][] {
    if (!this.isMerged) return [...Array(xCoords.length).keys()].map(x => [x]);
    const squareDistances = this.distanceMatrix(xCoords, yCoords);
    const threshold = minDistance**2;
    const mergedPoints = [];
    const pointsGroups = new Array(squareDistances.length).fill([]);
    const closedPoints = new Array(squareDistances.length).fill(0);
    const pickedPoints = new Array(squareDistances.length).fill(false);
    squareDistances.forEach((squareDistance, pointIndex) => {
      const pointGroup = []
      let nPoints = 0;
      squareDistance.forEach((distance, otherIndex) => {
        if (distance <= threshold) {
          nPoints++;
          pointGroup.push(otherIndex);
        }
      });
      closedPoints[pointIndex] = nPoints;
      pointsGroups[pointIndex] = pointGroup;
    })

    while (sum(closedPoints) != 0) {
      const centerIndex = argMax(closedPoints)[1];
      const cluster = [];
      closedPoints[centerIndex] = 0;
      pointsGroups[centerIndex].forEach(index => {
        if (!pickedPoints[index]) {
          cluster.push(index);
          pickedPoints[index] = true
        }
        closedPoints[index] = 0;
      })
      mergedPoints.push(cluster);
    }
    return mergedPoints
  }

  private fakeFeatures(): void {
    if (!this.features.has(this.xFeature)) this.features.set(this.xFeature, []);
    if (!this.features.has(this.yFeature)) this.features.set(this.yFeature, []);
  }

  private projectPoints(): [number[], number[], number[], number[]] {
    this.fakeFeatures();
    const xValues = this.axes[0].stringsToValues(this.features.get(this.xFeature));
    const yValues = this.axes[1].stringsToValues(this.features.get(this.yFeature));
    const xCoords = [];
    const yCoords = [];
    for (let index = 0 ; index < xValues.length ; index++) {
      const [xCoord, yCoord] = this.projectPoint(xValues[index], yValues[index]);
      xCoords.push(xCoord);
      yCoords.push(yCoord);
    }
    return [xCoords, yCoords, xValues, yValues]
  }

  private projectPoint(xCoord: number, yCoord: number): [number, number] {
    return [
      this.axes[0].relativeToAbsolute(xCoord) * this.canvasMatrix.a + this.canvasMatrix.e,
      this.axes[1].relativeToAbsolute(yCoord) * this.canvasMatrix.d + this.canvasMatrix.f
    ]
  }

  private distanceMatrix(xCoords: number[], yCoords: number[]): number[][] {
    let squareDistances = new Array(xCoords.length);
    for (let i = 0; i < xCoords.length; i++) {
      if (!squareDistances[i]) squareDistances[i] = new Array(xCoords.length);
      for (let j = i; j < xCoords.length; j++) {
        squareDistances[i][j] = (xCoords[i] - xCoords[j])**2 + (yCoords[i] - yCoords[j])**2;
        if (!squareDistances[j]) squareDistances[j] = new Array(xCoords.length);
        squareDistances[j][i] = squareDistances[i][j];
      }
    }
    return squareDistances
  }

  private agglomerativeClustering(xValues: number[], yValues: number[], minDistance: number = 0.25): number[][] {
    const squareDistances = this.distanceMatrix(xValues, yValues);
    const threshold = minDistance**2;
    let pointsGroups = [];
    squareDistances.forEach(distances => {
      let pointsGroup = [];
      distances.forEach((distance, col) => { if (distance <= threshold) pointsGroup.push(col) });
      pointsGroups.push(pointsGroup);
    })

    let clusters = [];
    let nClusters = -1;
    let maxIter = 0;
    while (nClusters != clusters.length && maxIter < 100) {
      nClusters = clusters.length;
      clusters = [pointsGroups[0]];
      pointsGroups.slice(1).forEach(candidate => {
        let isCluster = true;
        clusters.forEach((cluster, clusterIndex) => {
          for (let i=0; i < candidate.length; i++) {
            if (cluster.includes(candidate[i])) {
              candidate.forEach(point => { if (!clusters[clusterIndex].includes(point)) clusters[clusterIndex].push(point) });
              isCluster = false;
              break;
            }
          }
        })
        if (isCluster) clusters.push(candidate);
      })
      pointsGroups = new Array(...clusters);
      maxIter++;
    }
    return clusters
  }


  public simpleCluster(inputValue: number): void {
    this.computeClusterColors(inputValue);
    this.draw();
  }

  public resetClusters(): void {
    this.clusterColors = null;
    this.points.forEach(point => point.setColors(DEFAULT_SHAPE_COLOR));
    this.draw();
   }

  private computeClusterColors(normedDistance: number = 0.33): void {
    const xValues = [...this.axes[0].stringsToValues(this.features.get(this.xFeature))];
    const yValues = [...this.axes[1].stringsToValues(this.features.get(this.yFeature))];
    const scaledX = normalizeArray(xValues);
    const scaledY = normalizeArray(yValues);
    const clusters = this.agglomerativeClustering(scaledX, scaledY, normedDistance);

    const colorRatio: number = 360 / clusters.length;
    this.clusterColors = new Array(xValues.length);
    let colorRadius: number = 0;
    clusters.forEach(cluster => {
      colorRadius += colorRatio;
      cluster.forEach(point => this.clusterColors[point] = `hsl(${colorRadius}, 50%, 50%, 90%)`);
    })
  }

  public setTranslation(canvas: HTMLElement, translation: Vertex): void {
    super.setTranslation(canvas, translation);
    const pointTRL = new Vertex(translation.x * this.initScale.x, translation.y * this.initScale.y);
    this.points.forEach((point, index) => {
      point.center = this.previousCoords[index].add(pointTRL);
      point.update();
    })
  }

  public castMouseDown(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, any] {
    let [superCanvasMouse, superFrameMouse, clickedObject] = super.castMouseDown(canvasMouse, frameMouse, absoluteMouse);
    this.previousCoords = this.points.map(p => p.center);
    return [superCanvasMouse, superFrameMouse, clickedObject]
  }

  public castMouseUp(ctrlKey: boolean): void {
    super.castMouseUp(ctrlKey);
    this.previousCoords = [];
  }

  public mouseLeave(): void {
    super.mouseLeave();
    this.previousCoords = [];
  }

  protected updateWithScale(): void {
    super.updateWithScale();
    if (this.nSamples > 0) this.computePoints();
  }
}

export class Graph2D extends Scatter {
  public curves: LineSequence[];
  private curvesIndices: number[][];
  public showPoints: boolean = false;
  constructor(
    data: DataInterface,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
    }

  protected unpackData(data: DataInterface): Map<string, any[]> {
    const graphSamples = [];
    this.pointStyles = [];
    this.curvesIndices = [];
    this.curves = [];
    if (data.graphs) {
      data.graphs.forEach(graph => {
        if (graph.elements.length != 0) {
          this.curves.push(LineSequence.unpackGraphProperties(graph));
          const curveIndices = range(graphSamples.length, graphSamples.length + graph.elements.length);
          const graphPointStyle = new PointStyle(graph.point_style);
          this.pointStyles.push(...new Array(curveIndices.length).fill(graphPointStyle));
          this.curvesIndices.push(curveIndices);
          graphSamples.push(...graph.elements);
        }
      })
    }
    return Figure.deserializeData({"elements": graphSamples})
  }

  public updateSelection(axesSelections: number[][]): void {
    const inMultiplot = this.is_in_multiplot;
    this.is_in_multiplot = false;
    super.updateSelection(axesSelections);
    this.is_in_multiplot = inMultiplot;
  }

  protected updateVisibleObjects(context: CanvasRenderingContext2D): void {
    this.curves.forEach((curve, curveIndex) => {
      curve.update(this.curvesIndices[curveIndex].map(index => { return this.points[index] }));
      curve.draw(context);
    })
  }

  protected buildPointSets(data: DataInterface): void { this.pointSets = []; }

  protected get cuttingZone(): Rect {
    const axesOrigin = this.axes[0].origin.transform(this.canvasMatrix);
    const axesEnd = new Vertex(this.axes[0].end.x, this.axes[1].end.y).transform(this.canvasMatrix);
    return new Rect(axesOrigin, axesEnd.subtract(axesOrigin));
  }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D): void {
    this.drawInZone(context);
    if (this.showPoints) {
      super.drawAbsoluteObjects(context);
      this.absoluteObjects.shapes = [...this.absoluteObjects.shapes, ...this.curves];
    } else {
      this.absoluteObjects = new GroupCollection([...this.curves]);
    }
  }

  public resetScales(): void {
    const scale = new Vertex(this.frameMatrix.a, this.frameMatrix.d).scale(this.initScale);
    const translation = new Vertex(this.axes[0].maxValue - this.axes[0].initMaxValue, this.axes[1].maxValue - this.axes[1].initMaxValue).scale(scale);
    this.curves.forEach(curve => {
      if (curve.mouseClick) {
        curve.previousMouseClick = curve.previousMouseClick.add(translation);
        curve.mouseClick = curve.previousMouseClick.copy();
      }
    });
    super.resetScales();
  }

  public switchMerge(): void { this.isMerged = false }

  public togglePoints(): void {
    this.showPoints = !this.showPoints;
    this.draw();
  }

  public setTranslation(canvas: HTMLElement, translation: Vertex): void {
    super.setTranslation(canvas, translation);
    this.curves.forEach(curve => { if (curve.mouseClick) curve.mouseClick = curve.previousMouseClick.add(translation.scale(this.initScale)) });
  }

  public castMouseUp(ctrlKey: boolean): void {
    super.castMouseUp(ctrlKey);
    this.curves.forEach(curve => { if (curve.mouseClick) curve.previousMouseClick = curve.mouseClick.copy() });
  }

  public mouseLeave(): void {
    super.mouseLeave();
    this.curves.forEach(curve => { if (curve.mouseClick) curve.previousMouseClick = curve.mouseClick.copy() });
  }

  //TODO: Code duplicate, there is a middle class here between Scatter, Frame, Draw and Graph2D. Not so obvious.
  public sendHoveredIndicesMultiplot(): number[] { return [] }

  public receiveMultiplotMouseIndices(multiplotHovered: number[], multiplotClicked: number[], multiplotSelected: number[]): void {}

  public multiplotSelectedIntersection(multiplotSelected: number[], isSelecting: boolean): [number[], boolean] { return [multiplotSelected, isSelecting] }

  public receivePointSets(pointSets: PointSet[]): void {}

  public initRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public updateRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public sendRubberBandsMultiplot(figures: Figure[]): void {}

  protected receiveRubberBandFromFigure(figure: Figure): void {}
}

export class ParallelPlot extends Figure {
  public axes: ParallelAxis[];
  public curves: LineSequence[];
  public curveColor: string = DEFAULT_SHAPE_COLOR;
  public changedAxes: ParallelAxis[] = [];
  private _isVertical: boolean;
  constructor(
    data: DataInterface,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
      this.computeCurves();
    }

  get isVertical(): boolean { return this._isVertical ?? true }

  set isVertical(value: boolean) { this._isVertical = value }

  get offsetFactor(): Vertex { return this._offsetFactor ?? new Vertex(0.005, 0.015) }

  set offsetFactor(value: Vertex) { this._offsetFactor = value }

  get marginFactor(): Vertex { return this._marginFactor ?? new Vertex(0.005, 0.0025) }

  set marginFactor(value: Vertex) { this._marginFactor = value }

  public shiftOnAction(canvas: HTMLElement): void {}

  protected computeOffset(): Vertex { return this.computeNaturalOffset() }

  protected get marginOffset(): Vertex { return new Vertex(SIZE_AXIS_END, SIZE_AXIS_END) }

  public updateDimensions(): void {
    super.updateDimensions();
    this.updateAxesLocation();
  }

  public switchOrientation(): void {
    this.isVertical = !this.isVertical;
    this.updateAxesLocation();
    this.draw();
  }

  private updateAxesLocation(): void {
    const freeSpace = this.setBounds();
    const axisBoundingBoxes = this.buildAxisBoundingBoxes(freeSpace);
    const axesEnds = this.getAxesLocations();
    this.axes.forEach((axis, index) => {
      axis.updateLocation(...axesEnds[index], axisBoundingBoxes[index], index, this.drawnFeatures.length);
    });
    this.computeCurves();
  }

  protected buildAxes(axisBoundingBoxes: Rect[]): ParallelAxis[] {
    super.buildAxes(axisBoundingBoxes);
    const axesEnds = this.getAxesLocations();
    const axes: ParallelAxis[] = [];
    this.drawnFeatures.forEach((featureName, index) => {
      const axis = new ParallelAxis(this.features.get(featureName), axisBoundingBoxes[index], ...axesEnds[index], featureName, this.initScale);
      axis.updateStyle(this.axisStyle);
      axis.computeTitle(index, this.drawnFeatures.length);
      axes.push(axis);
    })
    return axes
  }

  private computeBoxesSize(): number {
    if (this.isVertical) return (this.drawEnd.x - this.drawOrigin.x) / this.drawnFeatures.length
    return (this.drawEnd.y - this.drawOrigin.y) / this.drawnFeatures.length
  }

  protected buildAxisBoundingBoxes(freeSpace: Vertex): Rect[] {
    const size = this.computeBoxesSize();
    const boundingBoxes: Rect[] = [];
    this.drawnFeatures.forEach((_, index) => {
      if (this.isVertical) boundingBoxes.push(this.verticalAxisBoundingBox(this.drawOrigin, this.drawEnd.y - this.drawOrigin.y, size, index));
      else boundingBoxes.push(this.horizontalAxisBoundingBox(this.drawOrigin, this.drawEnd.x - this.drawOrigin.x, size, index));
    });
    return boundingBoxes
  }

  private horizontalAxisBoundingBox(drawOrigin: Vertex, axisSize: number, size: number, index: number): Rect {
    const boundingBox = new Rect(drawOrigin.copy(), new Vertex(axisSize, size * FREE_SPACE_FACTOR));
    boundingBox.origin.y += (this.drawnFeatures.length - 1 - index) * size;
    return boundingBox
  }

  private verticalAxisBoundingBox(drawOrigin: Vertex, axisSize: number, size: number, index: number): Rect {
    const freeSpaceOffset = size * (1 - FREE_SPACE_FACTOR) / 2;
    const boundingBox = new Rect(new Vertex(drawOrigin.x + freeSpaceOffset, drawOrigin.y), new Vertex(size - freeSpaceOffset, axisSize));
    boundingBox.origin.x += size * index;
    return boundingBox
  }

  private getAxesLocations(): [Vertex, Vertex][] {
    return this.isVertical ? this.verticalAxesLocation() : this.horizontalAxesLocation()
  }

  private verticalAxesLocation(): [Vertex, Vertex][] {
    const boxSize = (this.drawEnd.x - this.drawOrigin.x) / this.drawnFeatures.length;
    const freeSpace = (this.drawEnd.x - this.drawOrigin.x) / this.drawnFeatures.length * (1 - FREE_SPACE_FACTOR) / 4;
    const axesEnds: [Vertex, Vertex][] = [];
    this.drawnFeatures.forEach((_, index) => {
      const verticalX = this.drawOrigin.x + (index + 0.5) * boxSize + freeSpace;
      axesEnds.push([new Vertex(verticalX, this.drawOrigin.y), new Vertex(verticalX, this.drawEnd.y)])
    })
    return axesEnds
  }

  private horizontalAxesLocation(): [Vertex, Vertex][] {
    const drawHeight = this.drawEnd.y - this.drawOrigin.y;
    const LOCAL_MIN_OFFSET_X = drawHeight - MIN_OFFSET_X * 1.2;
    const firstEnds: [Vertex, Vertex] = [
      new Vertex(this.drawOrigin.x, this.drawEnd.y - 0.015 * drawHeight),
      new Vertex(this.drawEnd.x, this.drawEnd.y - 0.015 * drawHeight)
    ];
    const lastEnds: [Vertex, Vertex] = [
      new Vertex(this.drawOrigin.x, this.drawEnd.y - Math.min(0.9 * drawHeight, LOCAL_MIN_OFFSET_X)),
      new Vertex(this.drawEnd.x, this.drawEnd.y - Math.min(0.9 * drawHeight, LOCAL_MIN_OFFSET_X))
    ];
    const yStep = (lastEnds[0].y - firstEnds[0].y) / (this.drawnFeatures.length - 1);
    const axesEnds: [Vertex, Vertex][] = [firstEnds];
    this.drawnFeatures.slice(1, this.drawnFeatures.length - 1).forEach((_, index) => {
      axesEnds.push([
        new Vertex(firstEnds[0].x, firstEnds[0].y + (index + 1) * yStep),
        new Vertex(firstEnds[1].x, firstEnds[1].y + (index + 1) * yStep)
      ]);
    });
    axesEnds.push(lastEnds);
    return axesEnds
  }

  public computePoint(axis: Axis, featureValue: number): Point {
    const xCoord = this.isVertical ? axis.origin.x : axis.relativeToAbsolute(featureValue);
    const yCoord = this.isVertical ? axis.relativeToAbsolute(featureValue) : axis.origin.y;
    return new Point(xCoord, yCoord).scale(this.initScale);
  }

  public computeCurves(): void {
    this.curves = [];
    for (let i=0; i < this.nSamples; i++) {
      const curve = new LineSequence([], String(i));
      this.drawnFeatures.forEach((feature, j) => curve.points.push(this.computePoint(this.axes[j], this.features.get(feature)[i])));
      curve.hoveredThickener = curve.clickedThickener = 0;
      curve.selectedThickener = 1;
      this.curves.push(curve);
    }
  }

  public updateCurves(): void {
    this.curves.forEach((curve, i) => {
      this.changedAxes.forEach(axis => {
        const featureIndex = this.drawnFeatures.indexOf(axis.name);
        curve.points[featureIndex] = this.computePoint(axis, this.features.get(axis.name)[i]);
      })
      curve.buildPath();
      curve.isHovered = this.hoveredIndices.includes(i) && !this.isSelecting && !this.is_drawing_rubber_band;
      curve.isClicked = this.clickedIndices.includes(i);
      curve.isSelected = this.selectedIndices.includes(i);
      curve.lineWidth = this.lineWidth;
      curve.strokeStyle = this.getSetColorOfIndex(i) ?? this.curveColor;
    })
  }

  protected drawSelectionBox(context: CanvasRenderingContext2D): void {}

  public switchZoom(): void {}

  private drawCurves(context: CanvasRenderingContext2D): void {
    const unpickedIndices = arrayDiff(Array.from(Array(this.nSamples).keys()), [...this.hoveredIndices, ...this.clickedIndices, ...this.selectedIndices]);
    unpickedIndices.forEach(i => this.curves[i].draw(context));
    this.pointSets.forEach(pointSet => pointSet.indices.forEach(i => this.curves[i].draw(context)));
    [this.selectedIndices, this.clickedIndices, this.hoveredIndices].forEach(indices => { for (let i of indices) this.curves[i].draw(context) });
  }

  protected updateVisibleObjects(context: CanvasRenderingContext2D): void {
    this.updateCurves();
    this.drawCurves(context);
  }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D): void {
    this.drawInZone(context);
    this.absoluteObjects = new GroupCollection([...this.curves]);
  }

  protected drawTooltips(): void {}

  public castMouseMove(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): void {
    this.fixedObjects.mouseMove(this.context, canvasMouse);
    if (!this.is_drawing_rubber_band) {
      this.absoluteObjects.mouseMove(this.context, absoluteMouse);
      this.relativeObjects.mouseMove(this.context, frameMouse);
    };
    this.changeDisplayOrder();
    this.hoveredIndices = this.absoluteObjects.updateShapeStates('isHovered');
  }

  private changeDisplayOrder(): void {
    if (this.isVertical) this.axes.sort((a, b) => a.origin.x - b.origin.x)
    else this.axes.sort((a, b) => b.origin.y - a.origin.y);
    this.drawnFeatures = this.axes.map((axis, i) => {
      if (this.drawnFeatures[i] != axis.name) axis.hasMoved = true;
      return axis.name;
    });
  }

  public castMouseUp(ctrlKey: boolean): void {
    if (this.changedAxes.length != 0) this.updateAxesLocation();
    super.castMouseUp(ctrlKey);
    if (this.changedAxes.length == 0) this.clickedIndices = this.absoluteObjects.updateShapeStates('isClicked');
  }

  public mouseLeave(): void {
    if (this.changedAxes.length != 0) this.updateAxesLocation();
    super.mouseLeave();
    if (this.changedAxes.length == 0) this.clickedIndices = this.absoluteObjects.updateShapeStates('isClicked');
  }

  protected regulateScale(): void {
    for (const axis of this.axes) {
      if (axis.boundingBox.isHovered) {
        this.regulateAxisScale(axis);
        axis.update(this.axisStyle, this.viewPoint, new Vertex(this.scaleX, this.scaleY), this.translation);
        axis.saveLocation();
        break;
      }
    }
    this.scaleX = this.scaleY = 1;
    this.viewPoint = new Vertex(0, 0);
  }

  public updateAxes(): void {
    const axesSelections = [];
    this.axes.forEach(axis => {
      if (axis.boundingBox.isClicked && !axis.isClicked) axis.update(this.axisStyle, this.viewPoint, new Vertex(this.scaleX, this.scaleY), this.translation);
      if (axis.rubberBand.length != 0) axesSelections.push(this.updateSelected(axis));
    })
    this.updateSelection(axesSelections);
  }

  public axisChangeUpdate(e: ParallelAxis) { if (!this.changedAxes.includes(e)) this.changedAxes.push(e); }

  protected resetMouseEvents(): [Shape, Vertex] {
    this.changedAxes = [];
    return super.resetMouseEvents()
  }
}

export class Draw extends Frame {
  constructor(
    data: DataInterface,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
      this.is_in_multiplot = false;
      this.relativeObjects = ShapeCollection.fromPrimitives(data.primitives, this.scale);
    }

  public shiftOnAction(canvas: HTMLElement): void {}

  public setCanvas(canvasID: string):void {
    super.setCanvas(canvasID);
    this.computeTextBorders(this.context);
  }

  public resetScales(): void {
    super.resetScales();
    this.updateBounds();
  }

  public reset(): void {
    super.reset();
    this.updateBounds();
    this.draw();
  }

  public resizeUpdate(): void {
    this.resize();
    this.axisEqual();
    this.resetScales();
    this.draw();
  }

  protected unpackData(data: DataInterface): Map<string, any[]> {
    const drawing = ShapeCollection.fromPrimitives(data.primitives);
    const [minX, minY, maxX, maxY] = Draw.boundsDilatation(...drawing.getBounds());
    const [xName, yName] = Draw.unpackAxesNames(data);
    return new Map<string, any[]>([[xName, [minX, maxX]], [yName, [minY, maxY]], ["shapes", drawing.shapes]])
  }

  private static unpackAxesNames(data: DataInterface): string[] { return data.attribute_names ?? ["x", "y"] }

  private static boundsDilatation(minimum: Vertex, maximum: Vertex): [number, number, number, number] {
    const minX = minimum.x * (1 - Math.sign(minimum.x) * DRAW_MARGIN_FACTOR);
    const minY = minimum.y * (1 - Math.sign(minimum.y) * DRAW_MARGIN_FACTOR);
    const maxX = maximum.x * (1 + Math.sign(maximum.x) * DRAW_MARGIN_FACTOR);
    const maxY = maximum.y * (1 + Math.sign(maximum.y) * DRAW_MARGIN_FACTOR);
    return [minX, minY, maxX, maxY]
  }

  protected computeTextBorders(context: CanvasRenderingContext2D) {
    this.relativeObjects.updateBounds(context);
    this.updateBounds();
  }

  public updateBounds(): void {
    const [minX, minY, maxX, maxY] = Draw.boundsDilatation(this.relativeObjects.minimum, this.relativeObjects.maximum);
    this.axes[0].minValue = this.features.get(this.drawnFeatures[0])[0] = Math.min(this.features.get(this.drawnFeatures[0])[0], minX);
    this.axes[1].minValue = this.features.get(this.drawnFeatures[1])[0] = Math.min(this.features.get(this.drawnFeatures[1])[1], minY);
    this.axes[0].maxValue = this.features.get(this.drawnFeatures[0])[1] = Math.max(this.features.get(this.drawnFeatures[0])[0], maxX);
    this.axes[1].maxValue = this.features.get(this.drawnFeatures[1])[1] = Math.max(this.features.get(this.drawnFeatures[1])[1], maxY);
    this.axes.forEach(axis => axis.saveLocation());
    this.axisEqual();
  }

  protected drawRelativeObjects(context: CanvasRenderingContext2D) { this.drawInZone(context) }

  protected updateVisibleObjects(context: CanvasRenderingContext2D): void {
    this.relativeObjects.locateLabels(super.cuttingZone, this.initScale);
    this.relativeObjects.draw(context);
  }

  protected get cuttingZone(): Rect {
    const axesOrigin = this.axes[0].origin.transform(this.frameMatrix.inverse());
    const axesEnd = new Vertex(this.axes[0].end.x, this.axes[1].end.y).transform(this.frameMatrix.inverse());
    return new Rect(axesOrigin, axesEnd.subtract(axesOrigin));
  }

  protected axisEqual(): void {
    if (this.axes[0].drawScale > this.axes[1].drawScale) this.axes[0].otherAxisScaling(this.axes[1])
    else this.axes[1].otherAxisScaling(this.axes[0]);
    this.axes.forEach(axis => axis.saveLocation());
    this.updateAxes();
  }

  public sendHoveredIndicesMultiplot(): number[] { return [] }

  public receiveMultiplotMouseIndices(multiplotHovered: number[], multiplotClicked: number[], multiplotSelected: number[]): void {}

  public multiplotSelectedIntersection(multiplotSelected: number[], isSelecting: boolean): [number[], boolean] { return [multiplotSelected, isSelecting] }

  public receivePointSets(pointSets: PointSet[]): void {}

  public initRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public updateRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public sendRubberBandsMultiplot(figures: Figure[]): void {}

  protected receiveRubberBandFromFigure(figure: Figure): void {}

  public highlightFromReferencePath(highlightData: HighlightData) {
    const highlight = highlightData.highlight;
    const shapes = this.getShapesFromPath(highlightData.referencePath);
    shapes.forEach((shape) => {
      highlightData.select ?
        shape.isClicked = highlight :
        shape.isHovered = highlight;
    });
    this.draw();
  }

  private getShapesFromPath(referencePath: string): Shape[] {
    return this.relativeObjects.shapes.filter((s) => s.referencePath === referencePath);
  }
}

export class PrimitiveGroupContainer extends Draw {
  constructor(
    data: DataInterface,
    public width: number,
    public height: number,
    public buttons_ON: boolean,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(PG_CONTAINER_PLOT as DataInterface, width, height, X, Y, canvasID, is_in_multiplot);
    }
}
