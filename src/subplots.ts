import { PlotData, Buttons, Interactions } from "./plot-data";
import { Attribute, Axis, Sort, RubberBand, Vertex, newAxis, ScatterPoint, Bar, ShapeCollection, SelectionBox, GroupCollection,
  LineSequence, newRect, newPointStyle, ParallelAxis, newPoint2D, SIZE_END, newShape } from "./utils";
import { PrimitiveGroup } from "./primitives";
import { List, Shape, MyObject } from "./toolbox";
import { string_to_hex, string_to_rgb, rgb_to_string, colorHsl } from "./color_conversion";
import { EdgeStyle, TextStyle } from "./style";

var alert_count = 0;

// All following rows are purely deleted

export const PG_CONTAINER_PLOT = {
  "name": "",
  "primitives": [
    {
      "name": "",
      "comment": "PrimitiveGroupContainer is not supported anymore in plot_data 0.19.0 and further versions.",
      "text_style": {
        "object_class": "plot_data.core.TextStyle",
        "name": "",
        "text_color": "rgb(100, 100, 100)",
        "font_size": 16,
        "text_align_x": "center",
        "text_align_y": "middle"
      },
      "position_x": 50.0,
      "position_y": 100,
      "text_scaling": false,
      "max_width": 250,
      "multi_lines": true,
      "type_": "text"
    }
  ],
  "type_": "primitivegroup"
};

const MIN_FONTSIZE: number = 6;
const MIN_OFFSET: number = 33;
export class Figure extends PlotData {
  public axes: newAxis[] = [];
  public drawOrigin: Vertex;
  public drawEnd: Vertex;
  public drawnFeatures: string[];
  public origin: Vertex;
  public size: Vertex;
  public translation: Vertex = new Vertex(0, 0);

  public hoveredIndices: number[];
  public clickedIndices: number[];
  public selectedIndices: number[];

  public nSamples: number;
  public pointSets: number[];
  public pointSetColors: string[] = [];
  public pointStyles: newPointStyle[] = null;

  public isHovered: boolean = false;
  public isSelecting: boolean = false;
  public selectionBox = new SelectionBox();
  public isZooming: boolean = false;
  public zoomBox = new SelectionBox();

  public viewPoint: Vertex = new Vertex(0, 0);
  public fixedObjects: ShapeCollection;
  public absoluteObjects: ShapeCollection;
  public relativeObjects: ShapeCollection;

  public font: string = "sans-serif";

  protected offset: Vertex;
  protected margin: Vertex;
  protected _offsetFactor: Vertex;
  protected _marginFactor: Vertex;
  protected initScale: Vertex = new Vertex(1, -1);
  private _axisStyle = new Map<string, any>([['strokeStyle', 'hsl(0, 0%, 30%)']]);

  public features: Map<string, any[]>;
  readonly MAX_PRINTED_NUMBERS = 6;
  readonly TRL_THRESHOLD = 20;
  constructor(
    data: any,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, false, X, Y, canvasID, is_in_multiplot);
      this.unpackAxisStyle(data);
      this.origin = new Vertex(X, Y);
      this.size = new Vertex(width - X, height - Y);
      this.features = this.unpackData(data);
      this.nSamples = this.features.entries().next().value[1].length;
      this.initSelectors();
      this.scaleX = this.scaleY = 1;
      this.TRL_THRESHOLD /= Math.min(Math.abs(this.initScale.x), Math.abs(this.initScale.y));
      this.buildPointSets(data);
      this.drawnFeatures = this.setFeatures(data);
      this.axes = this.setAxes();
      this.fixedObjects = new ShapeCollection(this.axes);
      this.relativeObjects = new GroupCollection();
      this.absoluteObjects = new GroupCollection();
    }

  get scale(): Vertex { return new Vertex(this.relativeMatrix.a, this.relativeMatrix.d)}

  set axisStyle(newAxisStyle: Map<string, any>) { newAxisStyle.forEach((value, key) => this._axisStyle.set(key, value)) }

  get axisStyle(): Map<string, any> { return this._axisStyle }

  get canvasMatrix(): DOMMatrix { return new DOMMatrix([this.initScale.x, 0, 0, this.initScale.y, 0, 0]) }

  get relativeMatrix(): DOMMatrix { return new DOMMatrix([this.initScale.x, 0, 0, this.initScale.y, 0, 0]) }

  get falseIndicesArray(): boolean[] { return new Array(this.nSamples).fill(false) }

  get offsetFactor(): Vertex { return this._offsetFactor ?? new Vertex(0.025, 0.035) }

  set offsetFactor(value: Vertex) { this._offsetFactor = value }

  get marginFactor(): Vertex { return this._marginFactor ?? new Vertex(0.01, 0.02) }

  set marginFactor(value: Vertex) { this._marginFactor = value }

  public static fromMultiplot(data: any, width: number, height: number, canvasID: string): Figure {
    if (data.type_ == "histogram") return new Histogram(data, width, height, 0, 0, canvasID, true);
    else if (data.type_ == "parallelplot")return new ParallelPlot(data, width, height, 0, 0, canvasID, true);
    else if (data.type_ == "draw") return new Draw(data, width, height, 0, 0, canvasID, true);
    else if (data.type_ == "graph2d") return new Graph2D(data, width, height, 0, 0, canvasID, true);
    else if (data.type_ == "primitivegroupcontainer") return new PrimitiveGroupContainer(data, width, height, false, 0, 0, canvasID, true);
    else if (data.type_ == "scatterplot") return new Scatter(data, width, height, 0, 0, canvasID, true);
  }

  public isInCanvas(vertex: Vertex): boolean {
    return vertex.x >= this.origin.x && vertex.x <= this.origin.x + this.size.x && vertex.y >= this.origin.y && vertex.y <= this.origin.y + this.size.y
  }

  protected unpackAxisStyle(data:any): void {
    if (data.axis?.axis_style?.color_stroke) this.axisStyle.set("strokeStyle", data.axis.axis_style.color_stroke);
    if (data.axis?.axis_style?.line_width) this.axisStyle.set("lineWidth", data.axis.axis_style.line_width);
    if (data.axis?.graduation_style?.font_style) this.axisStyle.set("font", data.axis.graduation_style.font_style);
    if (data.axis?.graduation_style?.font_size) this.axisStyle.set("ticksFontsize", data.axis.graduation_style.font_size);
  }

  protected unpackPointsSets(data: any): void {
    data.points_sets.forEach((pointSet, setIndex) => {
      pointSet.point_index.forEach(pointIndex => this.pointSets[pointIndex] = setIndex);
      this.pointSetColors.push(pointSet.color);
    })
  }

  protected unpackData(data: any): Map<string, any[]> { return Figure.deserializeData(data) }

  protected buildPointSets(data: any): void {
    this.pointSets = new Array(this.nSamples).fill(-1);
    if (data.points_sets) this.unpackPointsSets(data);
  }

  public static deserializeData(data: any): Map<string, any[]> {
    const unpackedData = new Map<string, any[]>();
    if (data.x_variable) unpackedData.set(data.x_variable, []);
    if (data.y_variable) unpackedData.set(data.y_variable, []);
    if (!data.elements) return unpackedData;
    const featureKeys = data.elements.length ? Array.from(Object.keys(data.elements[0].values)) : [];
    featureKeys.push("name");
    featureKeys.forEach(feature => unpackedData.set(feature, data.elements.map(element => element[feature])));
    return unpackedData
  }

  public drawBorders() {
    const rect = new newRect(this.origin, this.size);
    rect.lineWidth = 0.5;
    rect.strokeStyle = "hsl(0, 0%, 83%)";
    rect.isFilled = false;
    rect.draw(this.context);
  }

  private drawCanvas(): void {
    this.context.clearRect(this.origin.x - 1, this.origin.y - 1, this.width + 2, this.height + 2);
  }

  public setCanvas(canvasID: string):void {
    const canvas = document.getElementById(canvasID) as HTMLCanvasElement;
    canvas.width = this.width;
		canvas.height = this.height;
    this.context = canvas.getContext("2d");
  }

  public updateAxes(): void {
    const axesSelections = [];
    this.axes.forEach(axis => {
      axis.update(this.axisStyle, this.viewPoint, new Vertex(this.scaleX, this.scaleY), this.translation);
      if (axis.rubberBand.length != 0) axesSelections.push(this.updateSelected(axis));
    })
    this.updateSelection(axesSelections);
  }

  protected setFeatures(data: any): string[] { return data.attribute_names ?? Array.from(this.features.keys()) }

  protected computeNaturalOffset(): Vertex { return new Vertex(this.width * this.offsetFactor.x, this.height * this.offsetFactor.y) }

  protected computeOffset(): Vertex {
    const naturalOffset = this.computeNaturalOffset();
    return new Vertex(Math.max(naturalOffset.x, MIN_OFFSET), Math.max(naturalOffset.y, MIN_FONTSIZE));
  }

  protected get marginOffset(): Vertex { return new Vertex(SIZE_END, SIZE_END) }

  protected setBounds(): Vertex {
    this.offset = this.computeOffset();
    this.margin = new Vertex(this.size.x * this.marginFactor.x, this.size.y * this.marginFactor.y).add(this.marginOffset);
    return this.computeBounds()
  }

  protected computeBounds(): Vertex {
    const canvasOrigin = this.origin.scale(this.initScale);
    this.drawOrigin = this.offset.add(canvasOrigin);
    this.drawEnd = canvasOrigin.add(this.size.subtract(this.margin));
    const freeSpace = new Vertex(Math.abs(this.drawOrigin.x - this.origin.x), Math.abs(this.drawOrigin.y - this.origin.y));
    if (this.canvasMatrix.a < 0) this.swapDimension("x", this.drawOrigin, this.drawEnd, freeSpace);
    if (this.canvasMatrix.d < 0) this.swapDimension("y", this.drawOrigin, this.drawEnd, freeSpace);
    return freeSpace
  }

  protected swapDimension(dimension: string, origin: Vertex, end: Vertex, freeSpace: Vertex): void {
    origin[dimension] = origin[dimension] - this.size[dimension];
    end[dimension] = end[dimension] - this.size[dimension];
    freeSpace[dimension] = Math.abs(this.origin[dimension] - origin[dimension] * this.initScale[dimension] + this.size[dimension]);
  }

  protected setAxes(): newAxis[] {
    const freeSpace = this.setBounds();
    const axisBoundingBoxes = this.buildAxisBoundingBoxes(freeSpace);
    return this.buildAxes(axisBoundingBoxes)
  }

  protected buildAxisBoundingBoxes(freeSpace: Vertex): newRect[] { return }

  protected buildAxes(axisBoundingBox: newRect[]): newAxis[] { return [] }

  protected transformAxes(axisBoundingBoxes: newRect[]): void {
    axisBoundingBoxes.forEach((box, index) => this.axes[index].boundingBox = box);
  }

  protected setAxis(feature: string, axisBoundingBox: newRect, origin: Vertex, end: Vertex, nTicks: number = undefined): newAxis {
    const axis = new newAxis(this.features.get(feature), axisBoundingBox, origin, end, feature, this.initScale, nTicks);
    axis.updateStyle(this.axisStyle);
    return axis
  }

  protected setAxesTitleWidth(): void {}

  private relocateAxes(): void {
    const freeSpace = this.computeBounds();
    const axisBoundingBoxes = this.buildAxisBoundingBoxes(freeSpace);
    this.transformAxes(axisBoundingBoxes);
  }

  public updateSelection(axesSelections: number[][]): void {
    if (!this.is_in_multiplot) this.selectedIndices = Figure.intersectArrays(axesSelections);
  }

  public static intersectArrays(arrays: any[][]): any[] {
    if (arrays.length == 1) return arrays[0]
    if (arrays.length == 0) return []
    const arraysIntersection = [];
    const allValues = arrays.concat(...arrays)
    allValues.forEach(value => {
      let inAllArrays = true;
      for (let i=0; i < arrays.length; i++) {
        if (!arrays[i].includes(value)) { inAllArrays = false; break }
      }
      if (inAllArrays) arraysIntersection.push(value);
    })
    return newAxis.uniqueValues(arraysIntersection)
  }

  protected updateSize(): void { this.size = new Vertex(this.width, this.height) }

  protected resetAxes(): void { this.axes.forEach(axis => axis.reset()) }

  public updateDimensions(): void {
    this.updateSize();
    this.computeOffset();
    this.relocateAxes();
    this.setAxesTitleWidth();
  }

  public resetScales(): void {
    this.updateDimensions();
    this.axes.forEach(axis => axis.resetScale());
  }

  public resetView(): void {
    this.resetScales();
    this.draw();
  }

  public resize(): void {
    this.updateDimensions();
    this.axes.forEach(axis => axis.updateTicks());
  }

  public resizeUpdate(): void {
    this.resize();
    this.draw();
  }

  public multiplotInstantiation(origin: Vertex, width: number, height: number): void {
    this.origin = origin;
    this.width = width;
    this.height = height;
  }

  public multiplotDraw(origin: Vertex, width: number, height: number): void {
    this.multiplotInstantiation(origin, width, height);
    this.resetView();
  }

  public multiplotResize(origin: Vertex, width: number, height: number): void {
    this.multiplotInstantiation(origin, width, height);
    this.resizeUpdate();
  }

  public initSelectors(): void {
    this.hoveredIndices = [];
    this.clickedIndices = [];
    this.selectedIndices = [];
    this.fixedObjects?.resetShapeStates();
    this.absoluteObjects?.resetShapeStates();
    this.relativeObjects?.resetShapeStates();
  }

  protected resetSelectors(): void {
    this.selectionBox = new SelectionBox();
    this.initSelectors();
  }

  public reset(): void {
    this.resetAxes();
    this.resetSelectors();
  }

  protected resetSelection(): void {
    this.axes.forEach(axis => axis.rubberBand.reset());
    this.resetSelectors();
  }

  public updateSelected(axis: newAxis): number[] {
    const selection = [];
    const vector = axis.stringsToValues(this.features.get(axis.name));
    vector.forEach((value, index) => axis.isInRubberBand(value) ? selection.push(index) : {});
    return selection
  }

  protected isRubberBanded(): boolean {
    let isRubberBanded = true;
    this.axes.forEach(axis => isRubberBanded = isRubberBanded && axis.rubberBand.length != 0);
    return isRubberBanded
  }

  public drawInZone(context: CanvasRenderingContext2D): void {
    const previousCanvas = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    this.updateDrawnObjects(context);
    this.updateCuttingZone(context);
    const cutDraw = context.getImageData(this.origin.x, this.origin.y, this.size.x, this.size.y);
    context.globalCompositeOperation = "source-over";
    context.putImageData(previousCanvas, 0, 0);
    context.putImageData(cutDraw, this.origin.x, this.origin.y);
  }

  protected updateDrawnObjects(context: CanvasRenderingContext2D): void {}

  protected updateCuttingZone(context: CanvasRenderingContext2D): void {
    context.globalCompositeOperation = "destination-in";
    context.fill(this.cuttingZone.path);
  }

  protected get cuttingZone(): newRect {
    const axesOrigin = this.axes[0].origin.transform(this.canvasMatrix);
    return new newRect(axesOrigin, this.axesEnd.subtract(axesOrigin));
  }

  protected get axesEnd() { return new Vertex(this.axes[this.axes.length - 1].end.x, this.axes[this.axes.length - 1].end.y).transform(this.canvasMatrix) }

  protected drawFixedObjects(context: CanvasRenderingContext2D): void { this.fixedObjects.draw(context) }

  public drawZoneRectangle(context: CanvasRenderingContext2D): SelectionBox {
    const zoneRect = new SelectionBox(this.origin, this.size);
    zoneRect.fillStyle = "hsl(203, 90%, 88%)";
    zoneRect.hoverStyle = zoneRect.clickedStyle = zoneRect.strokeStyle = "hsl(203, 90%, 73%)";
    zoneRect.alpha = 0.3;
    zoneRect.lineWidth = 1;
    zoneRect.dashLine = [7, 7];
    zoneRect.draw(context);
    return zoneRect
  }

  protected drawRelativeObjects(context: CanvasRenderingContext2D) { this.relativeObjects = new GroupCollection([]) }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D) { this.absoluteObjects = new GroupCollection() }

  protected computeRelativeObjects() {}

  public draw(): void {
    this.context.save();
    this.drawCanvas();
    this.context.setTransform(this.canvasMatrix);

    this.updateAxes();
    this.computeRelativeObjects();

    this.context.setTransform(this.relativeMatrix);
    this.drawRelativeObjects(this.context);

    this.context.resetTransform();
    this.drawAbsoluteObjects(this.context);

    this.context.setTransform(this.relativeMatrix);
    this.drawSelectionBox(this.context);
    this.drawZoomBox(this.context);

    this.context.setTransform(this.canvasMatrix);
    this.drawFixedObjects(this.context);
    this.drawTooltips();

    this.context.resetTransform();
    this.drawBorders();
    this.context.restore();
  }

  public draw_initial(): void { this.draw() }

  public switchSelection(): void { this.isSelecting = !this.isSelecting; this.draw() }

  public switchMerge(): void {}

  public switchZoom(): void {}

  public switchOrientation(): void {}

  public togglePoints(): void {}

  protected updateSelectionBox(frameDown: Vertex, frameMouse: Vertex): void { this.selectionBox.update(frameDown, frameMouse) }

  public get drawingZone(): [Vertex, Vertex] { return [this.origin, this.size] }

  protected drawSelectionBox(context: CanvasRenderingContext2D) {
    if ((this.isSelecting || this.is_drawing_rubber_band) && this.selectionBox.isDefined) {
      this.selectionBox.updateScale(this.axes[0].transformMatrix.a, this.axes[1].transformMatrix.d);
      this.selectionBox.buildRectangle(
        new Vertex(this.axes[0].minValue, this.axes[1].minValue),
        new Vertex(this.axes[0].interval, this.axes[1].interval)
      );
      if (this.selectionBox.area != 0) {
        this.selectionBox.buildPath();
        this.selectionBox.draw(context);
      }
      this.relativeObjects.shapes.push(this.selectionBox);
    }
  }

  private drawZoomBox(context: CanvasRenderingContext2D): void {
    if (this.isZooming && this.zoomBox.isDefined) {
      this.zoomBox.buildRectangle(
        new Vertex(this.axes[0].minValue, this.axes[1].minValue),
        new Vertex(this.axes[0].interval, this.axes[1].interval)
      );
      this.zoomBox.draw(context);
    }
  }

  public updateZoomBox(frameDown: Vertex, frameMouse: Vertex): void {}

  protected zoomBoxUpdateAxes(zoomBox: SelectionBox): void { // TODO: will not work for a 3+ axes plot
    this.axes[0].minValue = Math.min(zoomBox.minVertex.x, zoomBox.maxVertex.x);
    this.axes[0].maxValue = Math.max(zoomBox.minVertex.x, zoomBox.maxVertex.x);
    this.axes[1].minValue = Math.min(zoomBox.minVertex.y, zoomBox.maxVertex.y);
    this.axes[1].maxValue = Math.max(zoomBox.minVertex.y, zoomBox.maxVertex.y);
    this.axes.forEach(axis => axis.saveLocation());
    this.updateAxes();
  }

  protected drawTooltips(): void {
    this.relativeObjects.drawTooltips(this.origin, this.size, this.context, this.is_in_multiplot);
    this.absoluteObjects.drawTooltips(this.origin, this.size, this.context, this.is_in_multiplot);
  }

  public mouseTranslate(currentMouse: Vertex, mouseDown: Vertex): Vertex {
    return currentMouse.subtract(mouseDown)
  }

  public mouseMove(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): void {
    this.fixedObjects.mouseMove(this.context, canvasMouse);
    this.absoluteObjects.mouseMove(this.context, absoluteMouse);
    this.relativeObjects.mouseMove(this.context, frameMouse);
  }

  public projectMouse(e: MouseEvent): [Vertex, Vertex, Vertex] {
    const mouseCoords = new Vertex(e.offsetX, e.offsetY);
    return [mouseCoords.scale(this.initScale), mouseCoords.transform(this.relativeMatrix.inverse()), mouseCoords]
  }

  public mouseDown(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, newShape] {
    const fixedClickedObject = this.fixedObjects.mouseDown(canvasMouse);
    const absoluteClickedObject = this.absoluteObjects.mouseDown(absoluteMouse);
    const relativeClickedObject = this.relativeObjects.mouseDown(frameMouse);
    const clickedObject = fixedClickedObject ?? relativeClickedObject ?? absoluteClickedObject ?? null;
    return [canvasMouse, frameMouse, clickedObject]
  }

  public mouseUp(ctrlKey: boolean): void {
    if (!this.isSelecting && !this.is_drawing_rubber_band && this.translation.normL1 < 10) {
      this.absoluteObjects.mouseUp(ctrlKey);
      this.relativeObjects.mouseUp(ctrlKey);
    }
    this.fixedObjects.mouseUp(ctrlKey);
  }

  public mouseMoveDrawer(canvas: HTMLElement, e: MouseEvent, canvasDown: Vertex, frameDown: Vertex, clickedObject: newShape): [Vertex, Vertex, Vertex] {
    const [canvasMouse, frameMouse, absoluteMouse] = this.projectMouse(e);
    this.isHovered = this.isInCanvas(absoluteMouse);
    this.mouseMove(canvasMouse, frameMouse, absoluteMouse);
    if (canvasDown) {
      const translation = this.mouseTranslate(canvasMouse, canvasDown);
      if (!(clickedObject instanceof newAxis)) {
        if ((!clickedObject || translation.normL1 >= 10) && (!this.isSelecting && !this.isZooming)) this.translate(canvas, translation);
      }
      if (this.isSelecting) {
        if (clickedObject instanceof SelectionBox) this.updateSelectionBox(clickedObject.minVertex, clickedObject.maxVertex)
        else this.updateSelectionBox(frameDown, frameMouse);
      }
      this.updateZoomBox(frameDown, frameMouse);
    }
    if (this.isZooming || this.isSelecting) canvas.style.cursor = 'crosshair';
    return [canvasMouse, frameMouse, absoluteMouse]
  }

  public mouseDownDrawer(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, newShape]  {
    const [canvasDown, frameDown, clickedObject] = this.mouseDown(canvasMouse, frameMouse, absoluteMouse);
    if (!(clickedObject instanceof newAxis)) this.is_drawing_rubber_band = this.isSelecting;
    return [canvasDown, frameDown, clickedObject]
  }

  public mouseUpDrawer(ctrlKey: boolean): [newShape, Vertex] {
    if (this.isZooming) {
      this.switchZoom();
      if (this.zoomBox.area != 0) this.zoomBoxUpdateAxes(this.zoomBox);
      this.zoomBox.update(new Vertex(0, 0), new Vertex(0, 0));
    }
    this.mouseUp(ctrlKey);
    this.draw();
    return this.resetMouseEvents()
  }

  public mouseWheelDrawer(e: WheelEvent): void {
    this.wheelFromEvent(e);
    this.updateWithScale();
  }

  public mouseLeaveDrawer(canvas: HTMLElement, shiftKey: boolean): [boolean, Vertex] {
    this.mouseUpDrawer(true);
    this.axes.forEach(axis => {
      axis.saveLocation();
      axis.isClicked = axis.isHovered = false;
    });
    this.translation = new Vertex(0, 0);
    if (!shiftKey) canvas.style.cursor = 'default';
    return [false, null]
  }

  public keyDownDrawer(canvas: HTMLElement, keyString: string, ctrlKey: boolean, shiftKey: boolean, spaceKey: boolean): [boolean, boolean, boolean] {
    if (keyString == "Control") {
      ctrlKey = true;
      if (spaceKey && this.isHovered) this.resetView();
    }
    if (keyString == "Shift") {
      shiftKey = true;
      if (!ctrlKey) this.shiftOnAction(canvas);
    }
    if (keyString == " ") {
      spaceKey = true;
      if (ctrlKey && this.isHovered) this.resetView();
    }
    return [ctrlKey, shiftKey, spaceKey]
  }

  public keyUpDrawer(canvas: HTMLElement, keyString: string, ctrlKey: boolean, shiftKey: boolean, spaceKey: boolean): [boolean, boolean, boolean] {
    if (keyString == "Control") ctrlKey = false;
    if (keyString == " ") spaceKey = false;
    if (keyString == "Shift") {
      shiftKey = false;
      this.shiftOffAction(canvas);
    }
    return [ctrlKey, shiftKey, spaceKey]
  }

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

  public translate(canvas: HTMLElement, translation: Vertex): void {
    canvas.style.cursor = 'move';
    this.translation = translation;
  }

  public activateSelection(emittedRubberBand: RubberBand, index: number): void { this.is_drawing_rubber_band = true }

  public shiftOnAction(canvas: HTMLElement): void {
    this.isSelecting = true;
    canvas.style.cursor = 'crosshair';
    this.draw();
  }

  public shiftOffAction(canvas: HTMLElement): void {
    this.isSelecting = false;
    this.is_drawing_rubber_band = false;
    canvas.style.cursor = 'default';
    this.draw();
  }

  public axisChangeUpdate(e: newAxis): void {}

  public mouseListener(): void {
    // TODO: mouseListener generally suffers from a bad initial design that should be totally rethink in a specific refactor development
    let clickedObject: newShape = null;
    let canvasMouse: Vertex = null; let canvasDown: Vertex = null;
    let frameMouse: Vertex = null; let frameDown: Vertex = null;
    let absoluteMouse: Vertex = null;
    const canvas = document.getElementById(this.canvasID) as HTMLCanvasElement;
    let ctrlKey = false; let shiftKey = false; let spaceKey = false;

    this.axes.forEach((axis, index) => axis.emitter.on('rubberBandChange', e => this.activateSelection(e, index)));

    this.axes.forEach(axis => axis.emitter.on('axisStateChange', e => this.axisChangeUpdate(e)));

    window.addEventListener('keydown', e => {
      e.preventDefault();
      [ctrlKey, shiftKey, spaceKey] = this.keyDownDrawer(canvas, e.key, ctrlKey, shiftKey, spaceKey);
    });

    window.addEventListener('keyup', e => {
      e.preventDefault();
      [ctrlKey, shiftKey, spaceKey] = this.keyUpDrawer(canvas, e.key, ctrlKey, shiftKey, spaceKey);
    });

    canvas.addEventListener('mousemove', e => {
      e.preventDefault();
      [canvasMouse, frameMouse, absoluteMouse] = this.mouseMoveDrawer(canvas, e, canvasDown, frameDown, clickedObject);
      this.draw();
      if (!this.isInCanvas(absoluteMouse)) canvasDown = null;
    });

    canvas.addEventListener('mousedown', () => {
      [canvasDown, frameDown, clickedObject] = this.mouseDownDrawer(canvasMouse, frameMouse, absoluteMouse);
      if (ctrlKey && shiftKey) this.reset();
    });

    canvas.addEventListener('mouseup', () => {
      if (canvasDown) [clickedObject, canvasDown] = this.mouseUpDrawer(ctrlKey);
      if (!shiftKey) canvas.style.cursor = 'default';
    })

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.mouseWheelDrawer(e);
      this.draw();
    });

    canvas.addEventListener('mouseleave', () => [ctrlKey, canvasDown] = this.mouseLeaveDrawer(canvas, shiftKey));
  }

  protected resetMouseEvents(): [newShape, Vertex] {
    this.is_drawing_rubber_band = false;
    this.axes.forEach(axis => axis.saveLocation());
    this.translation = new Vertex(0, 0);
    return [null, null]
  }

  protected regulateScale(): void {}

  protected updateWithScale(): void {
    this.regulateScale();
    this.updateAxes(); // needs a refactor
    this.axes.forEach(axis => axis.saveLocation());
    [this.scaleX, this.scaleY] = [1, 1];
    this.viewPoint = new Vertex(0, 0);
  }

  public zoomIn(): void { this.zoom(new Vertex(this.origin.x + this.size.x / 2, this.origin.y + this.size.y / 2), 342) }

  public zoomOut(): void { this.zoom(new Vertex(this.origin.x + this.size.x / 2, this.origin.y + this.size.y / 2), -342) }

  private zoom(center: Vertex, zFactor: number): void {
    this.mouseWheel(center.x, center.y, zFactor);
    this.updateWithScale();
    this.draw();
  }

  public wheelFromEvent(e: WheelEvent): void { this.mouseWheel(e.offsetX, e.offsetY, -Math.sign(e.deltaY)) }

  public mouseWheel(mouse3X: number, mouse3Y: number, deltaY: number): void { //TODO: This is still not a refactor
    this.fusion_coeff = 1.2;
    const zoomFactor = deltaY > 0 ? this.fusion_coeff : 1 / this.fusion_coeff;
    this.scaleX = this.scaleX * zoomFactor;
    this.scaleY = this.scaleY * zoomFactor;
    this.scroll_x = this.scroll_x + deltaY;
    this.scroll_y = this.scroll_y + deltaY;
    this.originX = mouse3X - this.origin.x + zoomFactor * (this.originX - mouse3X + this.origin.x);
    this.originY = mouse3Y - this.origin.y + zoomFactor * (this.originY - mouse3Y + this.origin.y);
    if (isNaN(this.scroll_x)) this.scroll_x = 0;
    if (isNaN(this.scroll_y)) this.scroll_y = 0;
    this.viewPoint = new Vertex(mouse3X, mouse3Y).scale(this.initScale);
  }
}

export class Frame extends Figure {
  public xFeature: string;
  public yFeature: string;

  protected _nXTicks: number;
  protected _nYTicks: number;
  constructor(
    data: any,
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

  protected unpackAxisStyle(data: any): void {
    super.unpackAxisStyle(data);
    this.nXTicks = data.axis?.nb_points_x ?? this.nXTicks;
    this.nYTicks = data.axis?.nb_points_y ?? this.nYTicks;
  }

  public mouseMove(canvasMouse: Vertex, absoluteMouse: Vertex, frameMouse: Vertex): void {
    super.mouseMove(canvasMouse, absoluteMouse, frameMouse);
    this.hoveredIndices = this.sampleDrawings.updateShapeStates('isHovered');
  }

  public mouseUp(ctrlKey: boolean): void {
    super.mouseUp(ctrlKey);
    this.clickedIndices = this.sampleDrawings.updateShapeStates('isClicked');
  }

  protected setFeatures(data: any): [string, string] {
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

  protected transformAxes(axisBoundingBoxes: newRect[]): void {
    super.transformAxes(axisBoundingBoxes);
    this.axes[0].transform(this.drawOrigin, new Vertex(this.drawEnd.x, this.drawOrigin.y));
    this.axes[1].transform(this.drawOrigin, new Vertex(this.drawOrigin.x, this.drawEnd.y));
  }

  protected buildAxes(axisBoundingBoxes: newRect[]): [newAxis, newAxis] {
    super.buildAxes(axisBoundingBoxes);
    return [
      this.setAxis(this.xFeature, axisBoundingBoxes[0], this.drawOrigin, new Vertex(this.drawEnd.x, this.drawOrigin.y), this.nXTicks),
      this.setAxis(this.yFeature, axisBoundingBoxes[1], this.drawOrigin, new Vertex(this.drawOrigin.x, this.drawEnd.y), this.nYTicks)
    ]
  }

  protected buildAxisBoundingBoxes(freeSpace: Vertex): newRect[] {
    const xBoundingBox = new newRect(
      new Vertex(this.drawOrigin.x, this.drawOrigin.y - freeSpace.y),
      new Vertex(this.drawEnd.x - this.drawOrigin.x, freeSpace.y)
    );
    const yBoundingBox = new newRect(
      new Vertex(this.drawOrigin.x - freeSpace.x, this.drawOrigin.y),
      new Vertex(freeSpace.x, this.drawEnd.y - this.drawOrigin.y)
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

  protected regulateScale(): void {
    for (const axis of this.axes) {
      if (axis.tickPrecision >= this.MAX_PRINTED_NUMBERS) {
        if (this.scaleX > 1) this.scaleX = 1;
        if (this.scaleY > 1) this.scaleY = 1;
      } else if (axis.tickPrecision < 1) {
        if (this.scaleX < 1) this.scaleX = 1;
        if (this.scaleY < 1) this.scaleY = 1;
      } else if (axis.isDiscrete && axis.ticks.length > newAxis.uniqueValues(axis.labels).length + 2) {
        if (this.scaleX < 1) this.scaleX = 1;
        if (this.scaleY < 1) this.scaleY = 1;
      }
    }
  }
}

export class Histogram extends Frame {
  public bars: Bar[] = [];

  public fillStyle: string = 'hsl(203, 90%, 85%)';
  public strokeStyle: string = null;
  public lineWidth: number = 1;
  public dashLine: number[] = [];

  constructor(
    data: any,
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

  protected unpackAxisStyle(data: any): void {
    super.unpackAxisStyle(data);
    if (data.graduation_nb) this.nXTicks = data.graduation_nb;
  }

  public unpackBarStyle(data: any): void {
    if (data.surface_style?.color_fill) this.fillStyle = data.surface_style.color_fill;
    if (data.edge_style?.line_width) this.lineWidth = data.edge_style.line_width;
    if (data.edge_style?.color_stroke) this.strokeStyle = data.edge_style.color_stroke;
    if (data.edge_style?.dashline) this.dashLine = data.edge_style.dashline;
  }

  public reset(): void {
    super.reset();
    this.bars = [];
  }

  private updateNumberAxis(numberAxis: newAxis, bars: Bar[]): newAxis {
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

  private boundedTicks(axis: newAxis): number[] {
    let fakeTicks = [axis.minValue].concat(axis.ticks);
    fakeTicks.push(axis.maxValue)
    return fakeTicks
  }

  private fakeFeatures(): void {
    if (!this.features.has(this.xFeature)) this.features.set(this.xFeature, []);
  }

  private computeBars(vector: number[]): Bar[] {
    this.fakeFeatures();
    const baseAxis = this.axes[0] ?? this.setAxis(this.xFeature, new newRect(), new Vertex(), new Vertex(), this.nXTicks);
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

  private getBarsDrawing(): void {
    const fullTicks = this.boundedTicks(this.axes[0]);
    const minY = this.boundedTicks(this.axes[1])[0];
    this.bars.forEach((bar, index) => {
      let origin = new Vertex(fullTicks[index], minY);
      let size = new Vertex(fullTicks[index + 1] - fullTicks[index], bar.length > minY ? bar.length - minY : 0);
      if (this.axes[0].isDiscrete) origin.x = origin.x - (fullTicks[2] - fullTicks[1]) / 2;
      bar.updateStyle(
        origin, size,
        this.hoveredIndices, this.clickedIndices, this.selectedIndices,
        this.fillStyle, this.strokeStyle, this.dashLine, this.lineWidth
      );
    })
  }

  protected buildAxes(axisBoundingBoxes: newRect[]): [newAxis, newAxis] {
    const bars = this.computeBars(this.features.get(this.xFeature));
    this.features.set('number', this.getNumberFeature(bars));
    const [xAxis, yAxis] = super.buildAxes(axisBoundingBoxes)
    return [xAxis, this.updateNumberAxis(yAxis, bars)]
  }

  protected setFeatures(data: any): [string, string] {
    data["attribute_names"] = [data.x_variable, 'number']; // legacy, will disappear
    return super.setFeatures(data);
  }

  public mouseTranslate(currentMouse: Vertex, mouseDown: Vertex): Vertex {
    const translation = super.mouseTranslate(currentMouse, mouseDown);
    return new Vertex(this.axes[0].isDiscrete ? 0 : translation.x, 0)
  }

  protected regulateScale(): void {
    this.scaleY = 1;
    for (const axis of this.axes) {
      if (axis.tickPrecision >= this.MAX_PRINTED_NUMBERS) {
        if (this.scaleX > 1) this.scaleX = 1;
      } else if (axis.tickPrecision < 1) {
        if (this.scaleX < 1) this.scaleX = 1;
      } else if (axis.isDiscrete && axis.ticks.length > newAxis.uniqueValues(axis.labels).length + 2) {
        if (this.scaleX < 1) this.scaleX = 1;
      }
    }
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

const DEFAULT_POINT_COLOR: string = 'hsl(203, 90%, 85%)';
export class Scatter extends Frame {
  public points: ScatterPoint[] = [];

  public fillStyle: string = DEFAULT_POINT_COLOR;
  public strokeStyle: string = null;
  public marker: string = 'circle';
  public pointSize: number = 8;
  public lineWidth: number = 1;

  public tooltipAttributes: string[];
  public isMerged: boolean = false;
  public clusterColors: string[];
  public previousCoords: Vertex[];
  constructor(
    data: any,
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

  public unpackPointStyle(data: any): void {
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

  public multiplotResize(origin: Vertex, width: number, height: number): void {
    super.multiplotResize(origin, width, height);
    this.computePoints();
  }

  public reset(): void {
    super.reset();
    this.computePoints();
    this.resetClusters();
  }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D): void {
    super.drawAbsoluteObjects(context);
    this.drawPoints(context);
    this.absoluteObjects.shapes = [...this.points, ...this.absoluteObjects.shapes];
  };

  protected drawPoints(context: CanvasRenderingContext2D): void {
    const axesOrigin = this.axes[0].origin;
    const axesEnd = new Vertex(this.axes[0].end.x, this.axes[1].end.y);
    this.points.forEach(point => {
      let color = this.fillStyle;
      const colors = new Map<string, number>();
      point.isHovered = point.isClicked = point.isSelected = false;
      point.values.forEach(index => {
        if (this.clusterColors) {
          const currentColorCounter = this.clusterColors[index];
          colors.set(currentColorCounter, colors.get(currentColorCounter) ? colors.get(currentColorCounter) + 1 : 1);
        }
        if (this.hoveredIndices.includes(index)) point.isHovered = true;
        if (this.clickedIndices.includes(index)) point.isClicked = true;
        if (this.selectedIndices.includes(index)) point.isSelected = true;
      });
      if (colors.size != 0) color = mapMax(colors)[0]
      else {
        const pointsSetIndex = this.getPointSet(point);
        if (pointsSetIndex != -1) color = colorHsl(this.pointSetColors[pointsSetIndex]);
      };
      point.lineWidth = this.lineWidth;
      point.setColors(color);
      if (this.pointStyles) {
        if (!this.clusterColors) point.updateStyle(this.pointStyles[point.values[0]])
        else {
          let clusterPointStyle = Object.assign({}, this.pointStyles[point.values[0]], { strokeStyle: null });
          point.updateStyle(clusterPointStyle);
        }
      } else point.marker = this.marker;
      point.update();
      if (point.isInFrame(axesOrigin, axesEnd, this.initScale)) point.draw(context);
    })
  }

  private getPointSet(point: ScatterPoint): number {
    const pointSets = new Map<number, number>();
    point.values.forEach(pointIndex => {
      const currentPoint = this.pointSets[pointIndex];
      pointSets.set(currentPoint, pointSets.get(currentPoint) ? pointSets.get(currentPoint) + 1 : 1);
    })
    if (pointSets.size > 1) pointSets.delete(-1);
    return mapMax(pointSets)[0]
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
    return [xCoord * this.relativeMatrix.a + this.relativeMatrix.e, yCoord * this.relativeMatrix.d + this.relativeMatrix.f]
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
    this.points.forEach(point => point.setColors(DEFAULT_POINT_COLOR));
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

  public translate(canvas: HTMLElement, translation: Vertex): void {
    super.translate(canvas, translation);
    const pointTRL = new Vertex(translation.x * this.initScale.x, translation.y * this.initScale.y);
    this.points.forEach((point, index) => {
      point.center = this.previousCoords[index].add(pointTRL);
      point.update();
    })
  }

  public mouseDown(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, any] {
    let [superCanvasMouse, superFrameMouse, clickedObject] = super.mouseDown(canvasMouse, frameMouse, absoluteMouse);
    this.previousCoords = this.points.map(p => p.center);
    return [superCanvasMouse, superFrameMouse, clickedObject]
  }

  public mouseUp(ctrlKey: boolean): void {
    super.mouseUp(ctrlKey);
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
    data: any,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
    }

  protected unpackData(data: any): Map<string, any[]> {
    const graphSamples = [];
    this.pointStyles = [];
    this.curvesIndices = [];
    this.curves = [];
    if (data.graphs) {
      data.graphs.forEach(graph => {
        if (graph.elements.length != 0) {
          this.curves.push(LineSequence.unpackGraphProperties(graph));
          const curveIndices = range(graphSamples.length, graphSamples.length + graph.elements.length);
          const graphPointStyle = new newPointStyle(graph.point_style);
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

  protected updateDrawnObjects(context: CanvasRenderingContext2D): void {
    this.curves.forEach((curve, curveIndex) => {
      curve.update(this.curvesIndices[curveIndex].map(index => { return this.points[index] }));
      curve.draw(context);
    })
  }

  protected buildPointSets(data: any): void { this.pointSets = new Array(this.nSamples).fill(-1) }

  protected get cuttingZone(): newRect {
    const axesOrigin = this.axes[0].origin.transform(this.canvasMatrix);
    const axesEnd = new Vertex(this.axes[0].end.x, this.axes[1].end.y).transform(this.canvasMatrix);
    return new newRect(axesOrigin, axesEnd.subtract(axesOrigin));
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

  public translate(canvas: HTMLElement, translation: Vertex): void {
    super.translate(canvas, translation);
    this.curves.forEach(curve => { if (curve.mouseClick) curve.mouseClick = curve.previousMouseClick.add(translation.scale(this.initScale)) });
  }

  public mouseUp(ctrlKey: boolean): void {
    super.mouseUp(ctrlKey);
    this.curves.forEach(curve => { if (curve.mouseClick) curve.previousMouseClick = curve.mouseClick.copy() });
  }

  public initRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public updateRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public sendRubberBandsMultiplot(figures: Figure[]): void {}

  protected receiveRubberBandFromFigure(figure: Figure): void {}
}

const FREE_SPACE_FACTOR = 0.95;
export class ParallelPlot extends Figure {
  public axes: ParallelAxis[];
  public curves: LineSequence[];
  public curveColor: string = 'hsl(203, 90%, 85%)';
  public changedAxes: ParallelAxis[] = [];
  private _isVertical: boolean;
  constructor(
    data: any,
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

  protected get marginOffset(): Vertex { return new Vertex(SIZE_END, SIZE_END) }

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
    const boxSize = this.computeBoxesSize();
    this.axes.forEach((axis, index) => {
      const [axisOrigin, axisEnd] = this.getAxisLocation(boxSize, index);
      axis.updateLocation(axisOrigin, axisEnd, axisBoundingBoxes[index], index, this.drawnFeatures.length);
    });
    this.computeCurves();
  }

  private computeBoxesSize(): number {
    if (this.isVertical) return (this.drawEnd.x - this.drawOrigin.x) / this.drawnFeatures.length
    return (this.drawEnd.y - this.drawOrigin.y) / this.drawnFeatures.length
  }

  protected buildAxisBoundingBoxes(freeSpace: Vertex): newRect[] {
    const size = this.computeBoxesSize();
    const boundingBoxes: newRect[] = [];
    this.drawnFeatures.forEach((_, index) => {
      if (this.isVertical) boundingBoxes.push(this.verticalAxisBoundingBox(this.drawOrigin, this.drawEnd.y - this.drawOrigin.y, size, index));
      else boundingBoxes.push(this.horizontalAxisBoundingBox(this.drawOrigin, this.drawEnd.x - this.drawOrigin.x, size, index));
    });
    return boundingBoxes
  }

  private horizontalAxisBoundingBox(drawOrigin: Vertex, axisSize: number, size: number, index: number): newRect {
    const boundingBox = new newRect(drawOrigin.copy(), new Vertex(axisSize, size * FREE_SPACE_FACTOR));
    boundingBox.origin.y += (this.drawnFeatures.length - 1 - index) * size;
    return boundingBox
  }

  private verticalAxisBoundingBox(drawOrigin: Vertex, axisSize: number, size: number, index: number): newRect {
    const boundingBox = new newRect(drawOrigin.copy(), new Vertex(size * FREE_SPACE_FACTOR, axisSize));
    boundingBox.origin.x += size * index;
    return boundingBox
  }

  private getAxisLocation(boxSize: number, axisIndex: number): [Vertex, Vertex] {
    if (this.isVertical) {
      const verticalX = this.drawOrigin.x + (axisIndex + 0.5) * boxSize;
      return [new Vertex(verticalX, this.drawOrigin.y), new Vertex(verticalX, this.drawEnd.y)]
    }
    const horizontalY = this.drawOrigin.y + ((this.drawnFeatures.length - axisIndex) * boxSize - SIZE_END);
    return [new Vertex(this.drawOrigin.x, horizontalY), new Vertex(this.drawEnd.x, horizontalY)]
  }

  protected buildAxes(axisBoundingBoxes: newRect[]): ParallelAxis[] {
    super.buildAxes(axisBoundingBoxes);
    const boxSize = this.computeBoxesSize();
    const axes: ParallelAxis[] = [];
    this.drawnFeatures.forEach((featureName, index) => {
      const [axisOrigin, axisEnd] = this.getAxisLocation(boxSize, index);
      const axis = new ParallelAxis(this.features.get(featureName), axisBoundingBoxes[index], axisOrigin, axisEnd, featureName, this.initScale);
      axis.updateStyle(this.axisStyle);
      axis.computeTitle(index, this.drawnFeatures.length);
      axes.push(axis);
    })
    return axes
  }

  public computePoint(axis: newAxis, featureValue: number): newPoint2D {
    const xCoord = this.isVertical ? axis.origin.x : axis.relativeToAbsolute(featureValue);
    const yCoord = this.isVertical ? axis.relativeToAbsolute(featureValue) : axis.origin.y;
    return new newPoint2D(xCoord, yCoord).scale(this.initScale);
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
      curve.strokeStyle = this.curveColor;
    })
  }

  protected drawSelectionBox(context: CanvasRenderingContext2D): void {}

  public switchZoom(): void {}

  private drawCurves(context: CanvasRenderingContext2D): void {
    const unpickedIndices = ParallelPlot.arraySetDiff(Array.from(Array(this.nSamples).keys()), [...this.hoveredIndices, ...this.clickedIndices, ...this.selectedIndices]);
    [unpickedIndices, this.selectedIndices, this.clickedIndices, this.hoveredIndices].forEach(indices => { for (let i of indices) this.curves[i].draw(context) });
  }

  public static arraySetDiff(A: any[], B: any[]): any[] {
    if (B.length == 0) return A
    return A.filter(x => !B.includes(x))
  }

  protected updateDrawnObjects(context: CanvasRenderingContext2D): void {
    this.updateCurves();
    this.drawCurves(context);
  }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D): void {
    this.drawInZone(context);
    this.absoluteObjects = new GroupCollection([...this.curves]);
  }

  protected drawTooltips(): void {}

  public mouseMove(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): void {
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

  public mouseUp(ctrlKey: boolean): void {
    if (this.changedAxes.length != 0) this.updateAxesLocation();
    super.mouseUp(ctrlKey);
    if (this.changedAxes.length == 0) this.clickedIndices = this.absoluteObjects.updateShapeStates('isClicked');
  }

  protected regulateScale(): void {
    for (const axis of this.axes) {
      if (axis.boundingBox.isHovered) {
        if (axis.tickPrecision >= this.MAX_PRINTED_NUMBERS) {
          if (this.scaleX > 1) this.scaleX = 1;
          if (this.scaleY > 1) this.scaleY = 1;
        } else if (axis.tickPrecision < 1) {
          if (this.scaleX < 1) this.scaleX = 1;
          if (this.scaleY < 1) this.scaleY = 1;
        } else if (axis.isDiscrete && axis.ticks.length > newAxis.uniqueValues(axis.labels).length + 2) {
          if (this.scaleX < 1) this.scaleX = 1;
          if (this.scaleY < 1) this.scaleY = 1;
        }
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

  protected resetMouseEvents(): [newShape, Vertex] {
    this.changedAxes = [];
    return super.resetMouseEvents()
  }
}

const DRAW_MARGIN_FACTOR = 0.025;
export class Draw extends Frame {
  constructor(
    data: any,
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

  protected unpackData(data: any): Map<string, any[]> {
    const drawing = ShapeCollection.fromPrimitives(data.primitives);
    const [minX, minY, maxX, maxY] = Draw.boundsDilatation(...drawing.getBounds());
    return new Map<string, any[]>([["x", [minX, maxX]], ["y", [minY, maxY]], ["shapes", drawing.shapes]])
  }

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
    this.axes[0].minValue = this.features.get("x")[0] = Math.min(this.features.get("x")[0], minX);
    this.axes[1].minValue = this.features.get("y")[0] = Math.min(this.features.get("y")[0], minY);
    this.axes[0].maxValue = this.features.get("x")[1] = Math.max(this.features.get("x")[1], maxX);
    this.axes[1].maxValue = this.features.get("y")[1] = Math.max(this.features.get("y")[1], maxY);
    this.axes.forEach(axis => axis.saveLocation());
    this.axisEqual();
  }

  protected drawRelativeObjects(context: CanvasRenderingContext2D) { this.drawInZone(context) }

  protected updateDrawnObjects(context: CanvasRenderingContext2D): void {
    this.relativeObjects.locateLabels(super.cuttingZone, this.initScale);
    this.relativeObjects.draw(context);
  }

  protected get cuttingZone(): newRect {
    const axesOrigin = this.axes[0].origin.transform(this.frameMatrix.inverse());
    const axesEnd = new Vertex(this.axes[0].end.x, this.axes[1].end.y).transform(this.frameMatrix.inverse());
    return new newRect(axesOrigin, axesEnd.subtract(axesOrigin));
  }

  protected axisEqual(): void {
    if (this.axes[0].drawScale > this.axes[1].drawScale) this.axes[0].otherAxisScaling(this.axes[1])
    else this.axes[1].otherAxisScaling(this.axes[0]);
    this.axes.forEach(axis => axis.saveLocation());
    this.updateAxes();
  }

  public initRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public updateRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public sendRubberBandsMultiplot(figures: Figure[]): void {}

  protected receiveRubberBandFromFigure(figure: Figure): void {}
}

export class PrimitiveGroupContainer extends Draw {
  constructor(
    data: any,
    public width: number,
    public height: number,
    public buttons_ON: boolean,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(PG_CONTAINER_PLOT, width, height, X, Y, canvasID, is_in_multiplot);
    }
}

export function range(start: number, end: number, step: number = 1): number[] {
  let array = [];
  for (let i = start; i < end; i = i + step) array.push(i);
  return array
}

function mean(array: number[]): number {
  let sum = 0;
  array.forEach(value => sum += value);
  return sum / array.length
}

function standardDeviation(array: number[]): [number, number] {
  const arrayMean = mean(array);
  let sum = 0;
  array.forEach(value => sum += (value - arrayMean)**2);
  return [Math.sqrt(sum / array.length), arrayMean]
}

function scaleArray(array: number[]): number[] {
  const [std, mean] = standardDeviation(array);
  return Array.from(array, x => (x - mean) / std)
}

function normalizeArray(array: number[]): number[] {
  const maxAbs = Math.max(...array.map(x => Math.abs(x)));
  return array.map(x => x / maxAbs)
}

function argMin(array: number[]): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let argMin = -1;
  array.forEach((value, index) => {
    if (value < min) {
      min = value;
      argMin = index;
    }
  })
  return [min, argMin]
}

function argMax(array: number[]): [number, number] {
  let max = Number.NEGATIVE_INFINITY;
  let argMax = -1;
  array.forEach((value, index) => {
    if (value > max) {
      max = value;
      argMax = index;
    }
  })
  return [max, argMax]
}

function mapMin(map: Map<any, number>): [any, number] {
  let min = Number.NEGATIVE_INFINITY;
  let keyMin: string;
  map.forEach((value, key) => {
    if (value >= min) {
      min = value;
      keyMin = key;
    }
  })
  return [keyMin, min]
}

function mapMax(map: Map<any, number>): [any, number] {
  let max = Number.NEGATIVE_INFINITY;
  let keyMax: string;
  map.forEach((value, key) => {
    if (value >= max) {
      max = value;
      keyMax = key;
    }
  })
  return [keyMax, max]
}

function sum(array: number[]): number {
  let sum = 0;
  array.forEach(value => sum += value);
  return sum
}
