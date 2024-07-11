import { SIZE_AXIS_END, AXES_BLANK_SPACE, MIN_OFFSET_Y, MIN_OFFSET_X, ZOOM_FACTOR } from "./constants"
import { intersectArrays } from "./functions"
import { colorHsl } from "./colors"
import { PointStyle } from "./styles"
import { Vertex, Shape } from "./baseShape"
import { Rect } from "./primitives"
import { RubberBand, SelectionBox } from "./shapes"
import { Axis } from "./axes"
import { PointSet, ShapeCollection, GroupCollection } from "./collections"
import { DataInterface } from "./dataInterfaces"


export class RemoteFigure extends Rect {
  public context: CanvasRenderingContext2D;
  public axes: Axis[] = [];
  public drawOrigin: Vertex;
  public drawEnd: Vertex;
  public drawnFeatures: string[];
  public translation: Vertex = new Vertex(0, 0);

  public hoveredIndices: number[];
  public clickedIndices: number[];
  public selectedIndices: number[];

  public nSamples: number;
  public pointSets: PointSet[] = [];
  public pointStyles: PointStyle[] = null;

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
  public featureNames: string[];
  readonly MAX_PRINTED_NUMBERS = 10;
  readonly TRL_THRESHOLD = 20;

  // TODO: refactor these legacy attribute
  public scaleX: number = 1;
  public scaleY: number = 1;
  public is_drawing_rubber_band: boolean = false;

  constructor(
    data: DataInterface,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(new Vertex(X, Y), new Vertex(width, height));
      this.unpackAxisStyle(data);
      this.origin = new Vertex(X, Y);
      this.size = new Vertex(width - X, height - Y);
      this.features = this.unpackData(data);
      this.featureNames = Array.from(this.features.keys());
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
      this.setAxisVisibility(data);
    }

  get scale(): Vertex { return new Vertex(this.relativeMatrix.a, this.relativeMatrix.d)}

  set axisStyle(newAxisStyle: Map<string, any>) { newAxisStyle.forEach((value, key) => this._axisStyle.set(key, value)) }

  get axisStyle(): Map<string, any> { return this._axisStyle }

  get canvasMatrix(): DOMMatrix { return new DOMMatrix([this.initScale.x, 0, 0, this.initScale.y, 0, 0]) }

  get relativeMatrix(): DOMMatrix { return new DOMMatrix([this.initScale.x, 0, 0, this.initScale.y, 0, 0]) }

  get offsetFactor(): Vertex { return this._offsetFactor ?? new Vertex(0.027, 0.035) }

  get marginFactor(): Vertex { return this._marginFactor ?? new Vertex(0.01, 0.02) }

  public isInCanvas(vertex: Vertex): boolean {
    return vertex.x >= this.origin.x && vertex.x <= this.origin.x + this.size.x && vertex.y >= this.origin.y && vertex.y <= this.origin.y + this.size.y
  }

  protected unpackAxisStyle(data: DataInterface): void {
    if (data.axis?.axis_style?.color_stroke) this.axisStyle.set("strokeStyle", data.axis.axis_style.color_stroke);
    if (data.axis?.axis_style?.line_width) this.axisStyle.set("lineWidth", data.axis.axis_style.line_width);
    if (data.axis?.graduation_style?.font_style) this.axisStyle.set("font", data.axis.graduation_style.font_style);
    if (data.axis?.graduation_style?.font_size) this.axisStyle.set("ticksFontsize", data.axis.graduation_style.font_size);
  }

  protected unpackPointsSets(data: DataInterface): void {
    if (data.points_sets) {
      this.pointSets = data.points_sets.map((pointSet, index) => {
        const name = pointSet.name ?? `Point set ${index}`;
        return new PointSet(pointSet.indices, colorHsl(pointSet.color), name)
      })
    }
  }

  protected unpackData(data: any): Map<string, any[]> { return RemoteFigure.deserializeData(data) }

  protected setAxisVisibility(data: DataInterface): void { this.axes.forEach(axis => axis.visible = data.axis_on) }

  public serializeFeatures(): any {
    const elements = [];
    for (let i=0; i < this.nSamples; i++) {
      const newSample = { "values": {} };
      this.featureNames.forEach(feature => {
        newSample[feature] = this.features.get(feature)[i];
        if (feature != "name") newSample["values"][feature] = newSample[feature];
      });
      elements.push(newSample);
    }
    return elements
  }

  protected buildPointSets(data: any): void { this.unpackPointsSets(data) }

  public getSetColorOfIndex(index: number): string {
    for (let set of this.pointSets) { if (set.indices.includes(index)) return set.color }
    return null
  }

  public static deserializeData(data: any): Map<string, any[]> {
    const unpackedData = new Map<string, any[]>();
    if (data.x_variable) unpackedData.set(data.x_variable, []);
    if (!data.elements) {
      unpackedData.set("x", []);
      unpackedData.set("y", []);
      return unpackedData
    };
    const featureKeys = data.elements.length ? Array.from(Object.keys(data.elements[0].values)) : [];
    featureKeys.push("name");
    featureKeys.forEach(feature => unpackedData.set(feature, data.elements.map(element => RemoteFigure.deserializeValue(element[feature]))));
    return unpackedData
  }

  private static deserializeValue(value: any): any {
    if (typeof value == "string") {
      if (value.includes("gmt+")) return new Date(Number(value.split("gmt+")[0]))
    }
    return value
  }

  public drawBorders() {
    const rect = new Rect(this.origin, this.size);
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

  public setFeatureFilter(feature: string, minValue: number, maxValue: number): boolean {
    for (const axe of this.axes) { 
      if (axe.name.toLowerCase() == feature.toLowerCase()) {
        axe.setRubberbandRange(minValue, maxValue);
        this.draw();
        return true
      }
    }
    return false
  }

  public setFeatureFilterDebug(feature: string, minValue: number, maxValue: number): boolean {
    return this.setFeatureFilter(feature, Number(minValue), Number(maxValue))
  }

  public changeAxisFeature(name: string, index: number): void {
    this.drawnFeatures[index] = name;
    this.axes[index] = this.setAxis(name, this.axes[index].boundingBox, this.axes[index].origin, this.axes[index].end, this.axes[index].nTicks);
    this.resetScales();
    this.draw();
  }

  protected setFeatures(data: any): string[] { return data.attribute_names ?? Array.from(this.features.keys()) }

  protected computeNaturalOffset(): Vertex { return new Vertex(this.width * this.offsetFactor.x, this.height * this.offsetFactor.y) }

  protected computeOffset(): Vertex {
    const naturalOffset = this.computeNaturalOffset();
    return new Vertex(Math.max(naturalOffset.x, MIN_OFFSET_X) + AXES_BLANK_SPACE, Math.max(naturalOffset.y, MIN_OFFSET_Y));
  }

  protected get marginOffset(): Vertex { return new Vertex(SIZE_AXIS_END, SIZE_AXIS_END) }

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

  protected setAxes(): Axis[] {
    const freeSpace = this.setBounds();
    const axisBoundingBoxes = this.buildAxisBoundingBoxes(freeSpace);
    return this.buildAxes(axisBoundingBoxes)
  }

  protected buildAxisBoundingBoxes(freeSpace: Vertex): Rect[] { return [] }

  protected buildAxes(axisBoundingBox: Rect[]): Axis[] { return [] }

  protected transformAxes(axisBoundingBoxes: Rect[]): void {
    axisBoundingBoxes.forEach((box, index) => this.axes[index].boundingBox = box);
  }

  protected setAxis(feature: string, axisBoundingBox: Rect, origin: Vertex, end: Vertex, nTicks: number = undefined): Axis {
    const axis = new Axis(this.features.get(feature), axisBoundingBox, origin, end, feature, this.initScale, nTicks);
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
    if (!this.is_in_multiplot) this.selectedIndices = intersectArrays(axesSelections);
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

  public changeLocationInCanvas(origin: Vertex, width: number, height: number): void {
    this.origin = origin;
    this.width = width;
    this.height = height;
  }

  public changeCanvasSize(width: number, height: number): void {
    const canvas = document.getElementById(this.canvasID) as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
  }

  public resizeWindow(width: number, height: number): void {
    this.changeCanvasSize(width, height);
    this.boundingBoxResize(this.origin, width, height);
  }

  public boundingBoxResize(origin: Vertex, width: number, height: number): void {
    this.changeLocationInCanvas(origin, width, height);
    this.resizeUpdate();
  }

  public resize(): void {
    this.updateDimensions();
    this.axes.forEach(axis => axis.updateTicks());
  }

  public resizeUpdate(): void {
    this.resize();
    this.draw();
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

  public resetSelection(): void {
    this.resetRubberBands();
    this.resetSelectors();
  }

  public resetRubberBands(): void {
    this.axes.forEach(axis => axis.rubberBand.reset());
    this.selectedIndices = [];
  }

  public updateSelected(axis: Axis): number[] {
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
    this.updateVisibleObjects(context);
    this.updateCuttingZone(context);
    const cutDraw = context.getImageData(this.origin.x, this.origin.y, this.size.x, this.size.y);
    context.globalCompositeOperation = "source-over";
    context.putImageData(previousCanvas, 0, 0);
    context.putImageData(cutDraw, this.origin.x, this.origin.y);
  }

  protected updateVisibleObjects(context: CanvasRenderingContext2D): void {}

  protected updateCuttingZone(context: CanvasRenderingContext2D): void {
    context.globalCompositeOperation = "destination-in";
    context.fill(this.cuttingZone.path);
  }

  protected get cuttingZone(): Rect {
    const axesOrigin = this.axes[0].origin.transform(this.canvasMatrix);
    return new Rect(axesOrigin, this.axesEnd.subtract(axesOrigin));
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

  public switchSelection(): void { this.isSelecting = !this.isSelecting; this.draw() }

  public switchMerge(): void {}

  public switchZoom(): void {}

  public switchOrientation(): void {}

  public switchLogScale(): void {
    this.axes.forEach(axis => axis.switchLogScale(this.features.get(axis.name) as number[]));
    this.resetScales();
    this.draw();
  }

  public togglePoints(): void {}

  private toggleAxesVisibility(): void { this.axes.forEach(axis => axis.toggleView()) }

  public toggleAxes(): void {
    this.toggleAxesVisibility();
    this.draw();
  }

  public htmlToggleAxes(): void { this.toggleAxes() }

  public simpleCluster(inputValue: number): void {}

  public resetClusters(): void {}

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

  public castMouseMove(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): void {
    this.fixedObjects.mouseMove(this.context, canvasMouse);
    this.absoluteObjects.mouseMove(this.context, absoluteMouse);
    this.relativeObjects.mouseMove(this.context, frameMouse);
  }

  public projectMouse(e: MouseEvent): [Vertex, Vertex, Vertex] {
    const mouseCoords = new Vertex(e.offsetX, e.offsetY);
    return [mouseCoords.scale(this.initScale), mouseCoords.transform(this.relativeMatrix.inverse()), mouseCoords]
  }

  public castMouseDown(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, Shape] {
    const fixedClickedObject = this.fixedObjects.mouseDown(canvasMouse);
    const absoluteClickedObject = this.absoluteObjects.mouseDown(absoluteMouse);
    const relativeClickedObject = this.relativeObjects.mouseDown(frameMouse);
    const clickedObject = fixedClickedObject ?? relativeClickedObject ?? absoluteClickedObject ?? null;
    return [canvasMouse, frameMouse, clickedObject]
  }

  public castMouseUp(ctrlKey: boolean): void {
    if (!this.isSelecting && !this.is_drawing_rubber_band && this.translation.normL1 < 10) {
      this.absoluteObjects.mouseUp(ctrlKey);
      this.relativeObjects.mouseUp(ctrlKey);
    }
    this.fixedObjects.mouseUp(ctrlKey);
  }

  public mouseLeave(): void {
    if (!this.isSelecting && !this.is_drawing_rubber_band && this.translation.normL1 < 10) {
      this.absoluteObjects.mouseLeave();
      this.relativeObjects.mouseLeave();
    }
    this.fixedObjects.mouseLeave();
  }

  public mouseMoveDrawer(canvas: HTMLElement, e: MouseEvent, canvasDown: Vertex, frameDown: Vertex, clickedObject: Shape): [Vertex, Vertex, Vertex] {
    const [canvasMouse, frameMouse, absoluteMouse] = this.projectMouse(e);
    this.isHovered = this.isInCanvas(absoluteMouse);
    this.castMouseMove(canvasMouse, frameMouse, absoluteMouse);
    if (canvasDown) {
      const translation = this.mouseTranslate(canvasMouse, canvasDown);
      if (!(clickedObject instanceof Axis)) {
        if ((!clickedObject || translation.normL1 >= 10) && (!this.isSelecting && !this.isZooming)) this.setTranslation(canvas, translation);
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

  public mouseDownDrawer(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, Shape]  {
    const [canvasDown, frameDown, clickedObject] = this.castMouseDown(canvasMouse, frameMouse, absoluteMouse);
    if (!(clickedObject instanceof Axis)) this.is_drawing_rubber_band = this.isSelecting;
    return [canvasDown, frameDown, clickedObject]
  }

  private updateWithZoomBox(): void {
    if (this.isZooming) {
      if (this.zoomBox.area != 0) this.zoomBoxUpdateAxes(this.zoomBox);
      this.zoomBox.update(new Vertex(0, 0), new Vertex(0, 0));
    }
  }

  private mouseDropRedraw(): [Shape, Vertex] {
    this.updateWithZoomBox();
    this.draw();
    return this.resetMouseEvents()
  }

  public mouseUpDrawer(ctrlKey: boolean): [Shape, Vertex] {
    if (this.isZooming) {
      if (this.zoomBox.area != 0) this.zoomBoxUpdateAxes(this.zoomBox);
      this.zoomBox.update(new Vertex(0, 0), new Vertex(0, 0));
    }
    this.castMouseUp(ctrlKey);
    this.draw();
    return this.resetMouseEvents()
  }

  public mouseWheelDrawer(e: WheelEvent): void {
    this.wheelFromEvent(e);
    this.updateWithScale();
  }

  public mouseLeaveDrawer(canvas: HTMLElement, shiftKey: boolean): [boolean, Vertex] {
    const isZooming = this.isZooming; // TODO: get rid of this with a mousehandler refactor
    this.mouseLeave();
    this.mouseDropRedraw();
    this.isZooming = isZooming;
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
      if (shiftKey) {
        canvas.style.cursor = "default";
        this.isSelecting = false;
      }
    }
    if (keyString == "Shift") {
      shiftKey = true;
      if (!ctrlKey) this.shiftOnAction(canvas);
      else {
        canvas.style.cursor = "default";
        this.isSelecting = false;
      }
    }
    if (keyString == " ") {
      spaceKey = true;
      if (ctrlKey && this.isHovered) this.resetView();
    }
    return [ctrlKey, shiftKey, spaceKey]
  }

  public keyUpDrawer(canvas: HTMLElement, keyString: string, ctrlKey: boolean, shiftKey: boolean, spaceKey: boolean): [boolean, boolean, boolean] {
    if (keyString == "Control") {
      ctrlKey = false;
      if (shiftKey) {
        this.isSelecting = true;
        canvas.style.cursor = "crosshair";
      }
    }
    if (keyString == " ") spaceKey = false;
    if (keyString == "Shift") {
      shiftKey = false;
      this.shiftOffAction(canvas);
    }
    return [ctrlKey, shiftKey, spaceKey]
  }

  public setTranslation(canvas: HTMLElement, translation: Vertex): void {
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

  public axisChangeUpdate(e: Axis): void {}

  public mouseListener(): void {
    // TODO: mouseListener generally suffers from a bad initial design that should be totally rethink in a specific refactor development
    let clickedObject: Shape = null;
    let canvasMouse: Vertex = null; let canvasDown: Vertex = null;
    let frameMouse: Vertex = null; let frameDown: Vertex = null;
    let absoluteMouse: Vertex = null;
    const canvas = document.getElementById(this.canvasID) as HTMLCanvasElement;
    let ctrlKey = false; let shiftKey = false; let spaceKey = false;

    this.axes.forEach((axis, index) => axis.emitter.on('rubberBandChange', e => this.activateSelection(e, index)));

    this.axes.forEach(axis => axis.emitter.on('axisStateChange', e => this.axisChangeUpdate(e)));

    window.addEventListener('keydown', e => {
      [ctrlKey, shiftKey, spaceKey] = this.keyDownDrawer(canvas, e.key, ctrlKey, shiftKey, spaceKey);
    });

    window.addEventListener('keyup', e => {
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

  protected resetMouseEvents(): [Shape, Vertex] {
    this.is_drawing_rubber_band = false;
    this.isZooming = false;
    this.axes.forEach(axis => axis.saveLocation());
    this.translation = new Vertex(0, 0);
    return [null, null]
  }

  protected regulateAxisScale(axis: Axis): void {
    if (!axis.isDate) {
      if (axis.tickPrecision >= this.MAX_PRINTED_NUMBERS) {
        if (this.scaleX > 1) this.scaleX = 1;
        if (this.scaleY > 1) this.scaleY = 1;
      } else if (axis.areAllLabelsDisplayed || axis.tickPrecision < 1) {
        if (this.scaleX < 1) this.scaleX = 1;
        if (this.scaleY < 1) this.scaleY = 1;
      }
    }
  }

  protected regulateScale(): void {
    this.axes.forEach(axis => this.regulateAxisScale(axis));
  }

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
    this.mouseWheel(center, zFactor);
    this.updateWithScale();
    this.draw();
  }

  public wheelFromEvent(e: WheelEvent): void { this.mouseWheel(new Vertex(e.offsetX, e.offsetY), -Math.sign(e.deltaY)) }

  public mouseWheel(mouseCoords: Vertex, deltaY: number): void {
    const zoomFactor = deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    this.scaleX *= zoomFactor;
    this.scaleY *= zoomFactor;
    this.viewPoint = new Vertex(mouseCoords.x, mouseCoords.y).scale(this.initScale);
  }
}
