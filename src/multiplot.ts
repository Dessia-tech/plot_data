import { FIGURES_BLANK_SPACE, EMPTY_MULTIPLOT } from "./constants"
import { equals, arrayDiff, intersectArrays, arrayIntersection, range } from './functions'
import { Vertex, Shape } from "./baseShape"
import { RubberBand, SelectionBox } from "./shapes"
import { SelectionBoxCollection, PointSet } from "./collections"
import { Figure, Scatter, Graph2D, ParallelPlot, Draw } from './figures'
import { DataInterface, MultiplotDataInterface } from "./dataInterfaces"
import { filterUpdate } from "./interactions"


export class Filter {
  constructor(
    public attribute: string,
    public minValue: number = null,
    public maxValue: number = null
  ) {}

  get isDefined(): boolean {
    return Boolean(this.minValue - this.maxValue)
  }

  public updateValues(minValue: number, maxValue: number): void {
    this.minValue = minValue;
    this.maxValue = maxValue;
  }

  public getFilteredValues(filteredArray: number[]): number[] {
    return filteredArray.filter(value => value >= this.minValue && value <= this.maxValue)
  }

  public getFilteredIndices(filteredArray: number[]): number[] {
    const indices = [];
    filteredArray.forEach((value, index) => {
      if (value >= this.minValue && value <= this.maxValue) indices.push(index);
    })
    return indices
  }

  public static fromRubberBand(rubberBand: RubberBand): Filter {
    return new Filter(rubberBand.attributeName, rubberBand.minValue, rubberBand.maxValue)
  }
}


/*
TODO: Does this inherit from RemoteFigure or the opposite or does this
inherit from InteractiveObject or from nothing ?
*/
export class Multiplot {
  public context: CanvasRenderingContext2D;
  public canvas: HTMLCanvasElement;

  public features: Map<string, any[]>;
  public featureNames: string[];
  public nSamples: number;
  public figures: Figure[];
  public rubberBands: Map<string, RubberBand>;
  public filters: Map<string, Filter>;
  public figureZones = new SelectionBoxCollection([]);

  public isSelecting: boolean = false;
  public isZooming: boolean = false;
  public isResizing: boolean = false;
  public hoveredFigureIndex: number = 0;
  public clickedFigureIndex: number = null;
  public hiddenFigureIndices: number[] = [];

  public clickedIndices: number[] = [];
  public hoveredIndices: number[] = [];
  public selectedIndices: number[] = [];

  public pointSets: PointSet[];

  constructor(
    data: MultiplotDataInterface,
    public width: number,
    public height: number,
    public canvasID: string
  ) {
    this.buildCanvas(canvasID);
    [this.features, this.figures] = this.unpackData(data);
    this.featureNames = this.getFeaturesNames();
    this.filters = new Map(this.featureNames.map(feature => [feature, new Filter(feature)]));
    this.nSamples = this.features.entries().next().value[1].length;
    this.computeTable();
    this.draw();
    this.initRubberBands();
    this.mouseListener();
  }

  private unpackData(data: MultiplotDataInterface): [Map<string, any[]>, Figure[]] {
    const features = Figure.deserializeData(data);
    const figures: Figure[] = [];
    if (data.plots.length == 0) figures.push(this.newEmptyPlot(EMPTY_MULTIPLOT));
    else {
      data.plots.forEach(plot => {
        const localData = {...plot, "elements": data.elements, "points_sets": data.points_sets};
        const newPlot = Figure.fromMultiplot(localData, this.width, this.height, this.canvasID);
        if (!(newPlot instanceof Graph2D)) this.pointSets = newPlot.pointSets;
        if (!(newPlot instanceof Graph2D || newPlot instanceof Draw)) newPlot.features = features;
        newPlot.context = this.context;
        figures.push(newPlot)
      })
    }
    return [features, figures]
  }

  private getFeaturesNames(): string[] {
    return Array.from(this.features.keys()).filter(feature => feature != "name");
  }

  public serializeFeatures(): any {
    const elements = [];
    for (let i=0; i < this.nSamples; i++) {
      const newSample = {};
      this.featureNames.forEach(feature => newSample[feature] = this.features.get(feature)[i]);
      newSample["values"] = {...newSample};
      elements.push(newSample);
    }
    return elements
  }

  private newEmptyPlot(data: DataInterface): Draw {
    const figure = new Draw(data, this.width, this.height, 0, 0, this.canvasID);
    figure.context = this.context;
    return figure
  }

  private buildCanvas(canvasID: string): void {
    this.canvas = document.getElementById(canvasID) as HTMLCanvasElement;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext("2d");
  }

  private computeTable(): void {
    const sqrtNPlots = this.figures.length ** 0.5;
    const ratio = Number.isInteger(sqrtNPlots) ? sqrtNPlots : Math.ceil(this.width > this.height ? this.width / this.height : this.height / this.width);
    const nRows = Math.ceil(this.figures.length / ratio);
    const nCols = Math.ceil(this.figures.length / nRows);
    const height = this.height / nRows;
    const width = this.width / nCols;

    let k = 0;
    for (let j=0; j < nCols; j++) {
      const xCoord = j * width;
      for (let i=0; i < nRows; i++) {
        const yCoord = i * height;
        this.figures[k].multiplotDraw(new Vertex(xCoord + FIGURES_BLANK_SPACE, yCoord + FIGURES_BLANK_SPACE), width - FIGURES_BLANK_SPACE * 2, height - FIGURES_BLANK_SPACE * 2);
        k++;
        if (k == this.figures.length) break;
      }
    }
  }

  public draw(): void {
    this.context.clearRect(0, 0, this.width, this.height);
    this.figures.forEach((figure, index) => {
      figure.receiveMultiplotMouseIndices(this.hoveredIndices, this.clickedIndices, this.selectedIndices);
      figure.receivePointSets(this.pointSets);
      if (!this.hiddenFigureIndices.includes(index)) figure.draw();
    });
    this.drawZoneRectangles();
  }

  public addParallelPlot(featureNames: string[]): void {
    const data = {type_: "parallelplot", attribute_names: featureNames, elements: this.serializeFeatures()};
    this.addFigure(ParallelPlot.createFromMultiplot(data, this.features, this.context, this.canvasID));
  }

  public addScatter(xFeature: string, yFeature: string): void {
    const data = {type_: "scatterplot", attribute_names: [xFeature, yFeature], elements: this.serializeFeatures()};
    this.addFigure(Scatter.createFromMultiplot(data, this.features, this.context, this.canvasID));
  }

  public addFigure(figure: Figure): void {
    this.figures.push(figure);
    this.figureZones.shapes = [];
    this.activateAxisEvents(figure);
    this.resetLayout();
  }

  public deleteFigure(index: number): void {
    this.figures.splice(index, 1);
    this.figureZones.removeShape(index);
    this.resetLayout();
  }

  public hideFigure(index: number): void { this.hiddenFigureIndices.push(index) }

  public showFigure(index: number): void { this.hiddenFigureIndices.splice(this.hiddenFigureIndices.indexOf(index), 1) }

  public toggleFigure(index: number): void {
    this.hiddenFigureIndices.includes(index)
      ? this.showFigure(index)
      : this.hideFigure(index);
    this.draw();
  }

  public toggleAxes(index: number): void {
    this.figures[index].toggleAxes();
    this.draw();
  }

  public htmlToggleAxes(): void { this.toggleAxes(this.clickedFigureIndex ?? this.hoveredFigureIndex) }

  public resetLayout(): void {
    this.computeTable();
    if (this.figureZones.shapes.length != 0) {
      this.figures.forEach((figure, index) => this.figureZones.shapes[index].updateRectangle(figure.origin, figure.size));
    }
    this.draw();
  }

  private activateAxisEvents(figure: Figure): void {
    figure.axes.forEach(axis => axis.emitter.on('axisStateChange', e => figure.axisChangeUpdate(e)));
    figure.axes.forEach((axis, index) => {
      axis.emitter.on('rubberBandChange', e => {
        figure.activateSelection(e, index);
        this.isSelecting = true;
      })
    })
  }

  public selectionOn(): void {
    this.isSelecting = true;
    this.figures.forEach(figure => figure.isSelecting = true);
    this.canvas.style.cursor = 'crosshair';
  }

  public selectionOff(): void {
    if (this.isSelecting) this.canvas.style.cursor = 'default';
    this.isSelecting = false;
    this.figures.forEach(figure => {
      figure.isSelecting = false;
      figure.is_drawing_rubber_band = false;
    });
  }

  public switchSelection(): void {
    this.isSelecting ? this.selectionOff() : this.selectionOn();
  }

  public switchMerge(): void { this.figures.forEach(figure => figure.switchMerge()) }

  public switchResize(): void {
    this.isResizing = !this.isResizing;
    this.canvas.style.cursor = 'default';
    this.draw();
  }

  public drawZoneRectangles(): void {
    if (this.isResizing) {
      if (this.figureZones.shapes.length == 0) {
        const figureZones = this.figures.map(figure => figure.drawZoneRectangle(this.context));
        this.figureZones = new SelectionBoxCollection(figureZones);
      }
      else this.figureZones.draw(this.context);
    }
  }

  public togglePoints(): void { this.figures.forEach(figure => figure.togglePoints()) }

  public zoomOn(): void {
    this.isZooming = true;
    this.figures.forEach(figure => figure.isZooming = true);
    this.canvas.style.cursor = 'crosshair';
  }

  public zoomOff(): void {
    if (this.isZooming) this.canvas.style.cursor = 'default';
    this.isZooming = false;
    this.figures.forEach(figure => figure.isZooming = false);
  }

  public switchZoom(): void {
    this.isZooming ? this.zoomOff() : this.zoomOn();
  }

  public zoomIn(): void { (this.figures[this.clickedFigureIndex ?? this.hoveredFigureIndex]).zoomIn() }

  public zoomOut(): void { (this.figures[this.clickedFigureIndex ?? this.hoveredFigureIndex]).zoomOut() }

  public simpleCluster(inputValue: number): void { this.figures.forEach(figure => figure.simpleCluster(inputValue)) };

  public resetClusters(): void { this.figures.forEach(figure => figure.resetClusters()) };

  public resetView(): void {
    this.figures.forEach(figure => figure.resetView());
    this.draw();
  }

  public reset(): void {
    this.clickedIndices = [];
    this.hoveredIndices = [];
    this.resetSelection();
    this.figures.forEach(figure => figure.reset());
    this.draw();
  }

  public resetSelection(): void {
    this.resetRubberBands();
    this.selectedIndices = [];
    this.draw();
  }

  public switchOrientation(): void { this.figures.forEach(figure => figure.switchOrientation()) }

  public resize(width: number, height: number): void {
    const widthRatio = width / this.width;
    const heightRatio = height / this.height;
    this.figures.forEach((figure, index) => {
      figure.boundingBoxResize(figure.origin.scale(new Vertex(widthRatio, heightRatio)), figure.size.x * widthRatio, figure.size.y * heightRatio);
      if (this.figureZones.shapes.length != 0) this.figureZones.shapes[index].updateRectangle(figure.origin, figure.size);
    })
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.draw();
  }

  public addPointSet(pointSet: PointSet): void { this.pointSets.push(pointSet) }

  public removePointSet(index: number): void { this.pointSets.splice(index, 1) }

  public addPointsToSet(pointIndices: number[], setIndex: number): void {
    this.pointSets[setIndex].indices.push(...pointIndices);
    this.pointSets[setIndex].indices = Array.from(new Set(this.pointSets[setIndex].indices));
  }

  public removePointsFromSet(pointIndices: number[], setIndex: number): void {
    this.pointSets[setIndex].indices = arrayDiff(this.pointSets[setIndex].indices, pointIndices);
  }

  private updateSelectedIndices(): void {
    const previousIndices = [...this.selectedIndices];
    const filteredIndices = this.getFilteredIndices();
    this.selectedIndices = range(0, this.nSamples);
    if (filteredIndices.length != 0) this.selectedIndices = arrayIntersection(this.selectedIndices, this.getFilteredIndices());
    let isSelecting = false;
    this.figures.forEach(figure => [this.selectedIndices, isSelecting] = figure.multiplotSelectedIntersection(this.selectedIndices, isSelecting));
    if (this.selectedIndices.length == this.nSamples && !isSelecting) this.selectedIndices = [];
    if (!equals(previousIndices, this.selectedIndices)) this.emitSelectionChange();
  }

  private emitSelectionChange(): void {
    this.canvas.dispatchEvent(new CustomEvent('selectionchange', { detail: { 'selectedIndices': this.selectedIndices } }));
  }

  public updateHoveredIndices(figure: Figure): void { this.hoveredIndices = figure.sendHoveredIndicesMultiplot() }

  public initRubberBands(): void {
    this.rubberBands = new Map<string, RubberBand>();
    this.figures.forEach(figure => figure.initRubberBandMultiplot(this.rubberBands));
  }

  public updateRubberBands(currentFigure: Figure): void {
    if (this.isSelecting) {
      if (!this.rubberBands) this.initRubberBands();
      filterUpdate.next(this.rubberBands);
      currentFigure.sendRubberBandsMultiplot(this.figures);
      this.figures.forEach(figure => figure.updateRubberBandMultiplot(this.rubberBands));
    }
  }

  public resetRubberBands(): void {
    this.rubberBands.forEach(rubberBand => rubberBand.reset());
    this.figures.forEach(figure => figure.resetRubberBands());
  }

  public setFeatureFilter(feature: string, minValue: string, maxValue: string): void {
    const loweredFeatureName = feature.toLowerCase();
    const filter = new Filter(loweredFeatureName, Number(minValue), Number(maxValue));
    if (this.filters.has(loweredFeatureName)) this.filters.set(feature, filter);
    this.setRubberBandsFromFilters(loweredFeatureName, minValue, maxValue);
    this.updateSelectedIndices();
    this.draw();
  }

  private getFilteredIndices(): number[] {
    const filteredIndices = [];
    this.filters.forEach(filter => {
      if (filter.isDefined) filteredIndices.push(filter.getFilteredIndices(this.features.get(filter.attribute)));
    })
    return intersectArrays(filteredIndices)
  }

  private setRubberBandsFromFilters(feature: string, minValue: string, maxValue: string): void {
    if (!this.rubberBands) this.initRubberBands();
    for (const figure of this.figures) {
      if (figure.setFeatureFilter(feature, minValue, maxValue)) break;
    }
  }

  private setFiltersFromRubberBands(rubberBand: RubberBand): void {
    this.filters.set(rubberBand.attributeName, Filter.fromRubberBand(rubberBand));
  }

  private listenAxisStateChange(): void {
    this.figures.forEach(figure => figure.axes.forEach(axis => axis.emitter.on('axisStateChange', e => figure.axisChangeUpdate(e))));
  }

  private listenRubberBandChange(): void {
    this.figures.forEach(figure => {
      figure.axes.forEach((axis, index) => {
        axis.emitter.on('rubberBandChange', e => {
          figure.activateSelection(e, index);
          this.isSelecting = true;
          this.setFiltersFromRubberBands(axis.rubberBand);
        })
      })
    })
  }

  private keyDownDrawer(e: KeyboardEvent, ctrlKey: boolean, shiftKey: boolean, spaceKey: boolean): [boolean, boolean, boolean] {
    if (e.key == "Control") {
      ctrlKey = true;
      this.canvas.style.cursor = 'default';
      if (shiftKey) this.figures.forEach(figure => figure.keyUpDrawer(this.canvas, "Shift", ctrlKey, shiftKey, spaceKey));
    }
    if (e.key == "Shift") {
      shiftKey = true;
      if (!ctrlKey) {
        this.canvas.style.cursor = 'crosshair';
        this.isSelecting = true;
        this.figures.forEach(figure => figure.keyDownDrawer(this.canvas, e.key, ctrlKey, shiftKey, spaceKey));
      }
    }
    if (e.key == " ") {
      spaceKey = true;
    }
    this.figures[this.hoveredFigureIndex].keyDownDrawer(this.canvas, e.key, ctrlKey, shiftKey, spaceKey);
    return [ctrlKey, shiftKey, spaceKey]
  }

  private keyUpDrawer(e: KeyboardEvent, ctrlKey: boolean, shiftKey: boolean, spaceKey: boolean): [boolean, boolean, boolean] {
    if (e.key == "Shift") {
      shiftKey = false;
      this.isSelecting = false;
    }
    if (e.key == "Control") {
      ctrlKey = false;
      if (shiftKey) {
        this.canvas.style.cursor = 'crosshair';
        this.figures.forEach(figure => figure.keyDownDrawer(this.canvas, "Shift", ctrlKey, shiftKey, spaceKey));
      }
    }
    if (e.key == " ") spaceKey = false;
    this.figures.forEach(figure => figure.keyUpDrawer(this.canvas, e.key, ctrlKey, shiftKey, spaceKey));
    return [ctrlKey, shiftKey, spaceKey]
  }

  private getHoveredIndex(mouseCoords: Vertex): void {
    for (const [index, figure] of this.figures.entries()) {
      if (figure.isInCanvas(mouseCoords)) {
        this.hoveredFigureIndex = index;
        break
      }
    }
  }

  private mouseLeaveFigure(figure: Figure, shiftKey: boolean): [Vertex, boolean] {
    figure.mouseLeaveDrawer(this.canvas, shiftKey);
    return [null, true]
  }

  private zoneToFigure(mouseCoords: Vertex, clickedZone: SelectionBox): void {
    for (let [i, figureZone] of this.figureZones.shapes.entries()) {
      if (figureZone === clickedZone) this.clickedFigureIndex = i;
    }
    clickedZone.mouseMove(this.context, mouseCoords);
    clickedZone.buildRectangle(new Vertex(0, 0), new Vertex(this.width, this.height));
    this.figures[this.clickedFigureIndex].boundingBoxResize(clickedZone.origin, clickedZone.size.x, clickedZone.size.y);
  }

  private resizeWithMouse(mouseCoords: Vertex, clickedObject: Shape): void {
    if (clickedObject instanceof SelectionBox) this.zoneToFigure(mouseCoords, clickedObject)
    else this.figureZones.mouseMove(this.context, mouseCoords);
  }

  private mouseMoveDrawer(e: MouseEvent, hasLeftFigure: boolean, canvasMouse: Vertex, frameMouse: Vertex,
    canvasDown: Vertex, frameDown: Vertex, clickedObject: Shape, shiftKey: boolean): [Vertex, Vertex, Vertex, Vertex, boolean] { // TODO: ill conditioned method
      e.preventDefault();
      let absoluteMouse = new Vertex(e.offsetX, e.offsetY);
      this.getHoveredIndex(absoluteMouse);

      if (!this.isResizing) {
        if (this.clickedFigureIndex != null && canvasDown) {
          if (!this.figures[this.clickedFigureIndex].isInCanvas(absoluteMouse)) [canvasDown, hasLeftFigure] = this.mouseLeaveFigure(this.figures[this.clickedFigureIndex], shiftKey);
        }
        if (!hasLeftFigure) [canvasMouse, frameMouse, absoluteMouse] = this.figures[this.hoveredFigureIndex].mouseMoveDrawer(this.canvas, e, canvasDown, frameDown, clickedObject);
      } else this.resizeWithMouse(absoluteMouse, clickedObject);

      this.updateHoveredIndices(this.figures[this.hoveredFigureIndex]);
      this.updateRubberBands(this.figures[this.hoveredFigureIndex]);
      this.updateSelectedIndices();
      return [canvasMouse, frameMouse, absoluteMouse, canvasDown, hasLeftFigure]
    }

  private mouseDownDrawer(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, Shape] {
    this.clickedFigureIndex = this.hoveredFigureIndex;
    if (this.isResizing) return [null, null, this.figureZones.mouseDown(absoluteMouse.copy())];
    return this.figures[this.hoveredFigureIndex].mouseDownDrawer(canvasMouse, frameMouse, absoluteMouse);
  }

  private mouseUpDrawer(canvasDown: Vertex, clickedObject: Shape, ctrlKey: boolean, shiftKey: boolean, hasLeftFigure: boolean): [Vertex, Shape, boolean] {
    if (this.isResizing && clickedObject instanceof SelectionBox) clickedObject.mouseUp(ctrlKey);
    if (!hasLeftFigure && !this.isResizing) [clickedObject, canvasDown] = this.figures[this.hoveredFigureIndex].mouseUpDrawer(ctrlKey);
    if (!(this.figures[this.hoveredFigureIndex] instanceof Graph2D || this.figures[this.hoveredFigureIndex] instanceof Draw)) {
      this.clickedIndices = this.figures[this.hoveredFigureIndex].clickedIndices;
    }
    this.updateRubberBands(this.figures[this.hoveredFigureIndex]);
    hasLeftFigure = this.resetStateAttributes(shiftKey, ctrlKey);
    clickedObject = null;
    this.updateSelectedIndices();
    return [canvasDown, clickedObject, hasLeftFigure]
  }

  private mouseWheelDrawer(e: WheelEvent): void {
    e.preventDefault();
    this.figures[this.hoveredFigureIndex].mouseWheelDrawer(e);
  }

  private mouseLeaveDrawer(): [Vertex, boolean] {
    this.resetStateAttributes(false, false);
    return [null, true]
  }

  private mouseEnterDrawer(): [Vertex, boolean] { return [null, false] }

  public mouseListener(): void {
    // TODO: mouseListener generally suffers from a bad initial design that should be totally rethink in a specific refactor development
    let ctrlKey = false;
    let shiftKey = false;
    let spaceKey = false;
    let clickedObject: Shape = null;
    let canvasMouse: Vertex = null;
    let frameMouse: Vertex = null;
    let absoluteMouse: Vertex = null;
    let canvasDown: Vertex = null;
    let frameDown: Vertex = null;
    let hasLeftFigure = false;

    this.listenAxisStateChange();

    this.listenRubberBandChange();

    window.addEventListener('keydown', e => [ctrlKey, shiftKey, spaceKey] = this.keyDownDrawer(e, ctrlKey, shiftKey, spaceKey));

    window.addEventListener('keyup', e => [ctrlKey, shiftKey, spaceKey] = this.keyUpDrawer(e, ctrlKey, shiftKey, spaceKey));

    this.canvas.addEventListener('mousemove', e => {
      [canvasMouse, frameMouse, absoluteMouse, canvasDown, hasLeftFigure] = this.mouseMoveDrawer(e, hasLeftFigure, canvasMouse, frameMouse, canvasDown, frameDown, clickedObject, shiftKey);
      this.draw();
    });

    this.canvas.addEventListener('mousedown', () => [canvasDown, frameDown, clickedObject] = this.mouseDownDrawer(canvasMouse, frameMouse, absoluteMouse));

    this.canvas.addEventListener('mouseup', () => {
      [canvasDown, clickedObject, hasLeftFigure] = this.mouseUpDrawer(canvasDown, clickedObject, ctrlKey, shiftKey, hasLeftFigure);
      this.draw();
      this.zoomOff();
    })

    this.canvas.addEventListener('wheel', e => {
      this.mouseWheelDrawer(e);
      this.draw();
    });

    this.canvas.addEventListener("mouseleave", () => [canvasDown, hasLeftFigure] = this.mouseLeaveDrawer());

    this.canvas.addEventListener("mouseenter", () => [canvasDown, hasLeftFigure] = this.mouseEnterDrawer());
  }

  private resetStateAttributes(shiftKey: boolean, ctrlKey: boolean): boolean {
    if (ctrlKey && shiftKey) this.reset();
    if (!this.isZooming && !this.isSelecting) this.canvas.style.cursor = 'default';
    if (!shiftKey) this.selectionOff();
    return false
  }
}
