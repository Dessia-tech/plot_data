import { RubberBand, Vertex, newShape, SelectionBox, SelectionBoxCollection } from './utils';
import { Scatter, Figure, Graph2D, Draw, range } from './subplots';
import { List } from './toolbox';

const EMPTY_MULTIPLOT = {
  "name": "",
  "primitives": [
    {
      "name": "",
      "comment": "No data to plot because workflow result is empty.",
      "text_style": {
        "object_class": "plot_data.core.TextStyle",
        "name": "",
        "text_color": "rgb(100, 100, 100)",
        "font_size": 20,
        "text_align_x": "left"
      },
      "position_x": 50.0,
      "position_y": 100,
      "text_scaling": false,
      "max_width": 400,
      "multi_lines": true,
      "type_": "text"
    }
  ],
  "type_": "primitivegroup"
};

// const EMPTY_MULTIPLOT = JSON.parse(JSON.stringify(EMPTY_PLOT));
EMPTY_MULTIPLOT.primitives[0].comment = "No plot defined in multiplot so there is nothing to draw."

const BLANK_SPACE = 4;
export class Multiplot {
  public context: CanvasRenderingContext2D;
  public canvas: HTMLCanvasElement;

  public features: Map<string, any[]>;
  public nSamples: number;
  public figures: Figure[];
  public rubberBands: Map<string, RubberBand>;
  public figureZones = new SelectionBoxCollection([]);

  public isSelecting: boolean = false;
  public isZooming: boolean = false;
  public isResizing: boolean = false;
  public hoveredIndex: number = 0;
  public clickedIndex: number = null;

  public clickedIndices: number[] = [];
  public hoveredIndices: number[] = [];
  public selectedIndices: number[] = [];

  public pointSets: number[];
  public pointSetColors: string[] = [];

  constructor(
    data: any,
    public width: number,
    public height: number,
    public canvasID: string
  ) {
    this.buildCanvas(canvasID);
    [this.features, this.figures] = this.unpackData(data);
    this.nSamples = this.features.entries().next().value[1].length;
    this.computeTable();
    this.draw();
    this.initRubberBands();
    this.mouseListener();
  }

  private unpackData(data: any): [Map<string, any[]>, Figure[]] {
    const features = Figure.deserializeData(data);
    const figures: Figure[] = [];
    if (data.plots.length == 0) figures.push(this.newEmptyPlot(EMPTY_MULTIPLOT));
    else {
      data.plots.forEach(plot => {
        const localData = {...plot, "elements": data.elements, "points_sets": data.points_sets};
        const newPlot = Figure.fromMultiplot(localData, this.width, this.height, this.canvasID);
        if (newPlot instanceof Scatter) {
          this.pointSets = newPlot.pointSets;
          this.pointSetColors = newPlot.pointSetColors;
        }
        if (!(newPlot instanceof Graph2D || newPlot instanceof Draw)) newPlot.features = features;
        newPlot.context = this.context;
        figures.push(newPlot)
      })
    }
    return [features, figures]
  }

  private newEmptyPlot(data: any): Draw {
    const figure = new Draw(data, this.width, this.height, 0, 0, this.canvasID);
    figure.context = this.context;
    return figure
  }

  private buildCanvas(canvasID: string):void {
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
        this.figures[k].multiplotDraw(new Vertex(xCoord + BLANK_SPACE, yCoord + BLANK_SPACE), width - BLANK_SPACE * 2, height - BLANK_SPACE * 2);
        k++;
        if (k == this.figures.length) break;
      }
    }
  }

  public draw(): void {
    this.context.clearRect(0, 0, this.width, this.height);
    this.figures.forEach(figure => {
      if ( !(figure instanceof Graph2D) && !(figure instanceof Draw)) {
        figure.selectedIndices = this.selectedIndices;
        figure.clickedIndices = [...this.clickedIndices];
        figure.hoveredIndices = [...this.hoveredIndices];
      }
        // if (figure instanceof Frame) { // TODO: Kept for future devs
        //   if (this.pointSets.length != 0) {
        //     figure.pointSetColors = this.pointSets.map((pointFamily, familyIdx) => {
        //       pointFamily.pointIndices.forEach(pointIdx => figure.pointSets[pointIdx] = familyIdx);
        //       return pointFamily.color
        //     })
        //   }
        // }
      figure.draw();
    });
    this.drawZoneRectangles();
  }

  public switchSelection() {
    this.isSelecting = !this.isSelecting;
    this.figures.forEach(figure => figure.switchSelection());
  }

  public switchMerge() { this.figures.forEach(figure => figure.switchMerge()) }

  public switchResize() {
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

  public togglePoints() { this.figures.forEach(figure => figure.togglePoints()) }

  public switchZoom() {
    this.isZooming = !this.isZooming;
    this.figures.forEach(figure => figure.switchZoom());
  }

  public zoomIn() { (this.figures[this.clickedIndex ?? this.hoveredIndex]).zoomIn() }

  public zoomOut() { (this.figures[this.clickedIndex ?? this.hoveredIndex]).zoomOut() }

  public simpleCluster(inputValue: number) { this.figures.forEach(figure => { if (figure instanceof Scatter) figure.simpleCluster(inputValue) })};

  public resetClusters(): void { this.figures.forEach(figure => { if (figure instanceof Scatter) figure.resetClusters() })};

  public resetView(): void {
    this.figures.forEach(figure => figure.resetView());
    this.draw();
  }
  
  public reset(): void {
    this.selectedIndices = [];
    this.clickedIndices = [];
    this.hoveredIndices = [];
    this.rubberBands.forEach(rubberBand => rubberBand.reset());
    this.figures.forEach(figure => figure.reset());
    this.draw();
  }

  public switchOrientation(): void { this.figures.forEach(figure => figure.switchOrientation()) }

  public resize(width: number, height: number): void {
    const widthRatio = width / this.width;
    const heightRatio = height / this.height;    
    this.figures.forEach((figure, index) => {
      figure.multiplotResize(figure.origin.scale(new Vertex(widthRatio, heightRatio)), figure.size.x * widthRatio, figure.size.y * heightRatio);
      if (this.figureZones.length != 0) {
        this.figureZones.shapes[index].origin = figure.origin.copy();
        this.figureZones.shapes[index].size = figure.size.copy();
        this.figureZones.shapes[index].buildPath();
      }
    })
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.draw();
  }

  private updateSelectedIndices() {
    this.selectedIndices = range(0, this.nSamples);
    let isSelecting = false;
    for (let figure of this.figures) {
      figure.axes.forEach(axis => {
        if (!(figure instanceof Graph2D || figure instanceof Draw)) {
          if (axis.rubberBand.length != 0 && axis.name != "number") {
            isSelecting = true;
            const selectedIndices = figure.updateSelected(axis);
            this.selectedIndices = List.listIntersection(this.selectedIndices, selectedIndices);
          }
        }
      })
    }
    if (this.selectedIndices.length == this.nSamples && !isSelecting) this.selectedIndices = [];
  }

  public updateHoveredIndices(figure: Figure): void {
    if (!(figure instanceof Graph2D || figure instanceof Draw)) this.hoveredIndices = figure.hoveredIndices;
    else this.hoveredIndices = [];
  }

  public initRubberBands(): void {
    this.rubberBands = new Map<string, RubberBand>();
    this.figures.forEach(figure => figure.initRubberBandMultiplot(this.rubberBands));
  }

  public updateRubberBands(currentFigure: Figure): void {
    if (this.isSelecting) {
      if (!this.rubberBands) this.initRubberBands();
      currentFigure.sendRubberBandsMultiplot(this.figures);
      this.figures.forEach(figure => figure.updateRubberBandMultiplot(this.rubberBands));
    }
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
      e.preventDefault();
      spaceKey = true;
    }
    this.figures[this.hoveredIndex].keyDownDrawer(this.canvas, e.key, ctrlKey, shiftKey, spaceKey);
    return [ctrlKey, shiftKey, spaceKey]
  }

  private keyUpDrawer(e: KeyboardEvent, ctrlKey: boolean, shiftKey: boolean, spaceKey: boolean): [boolean, boolean, boolean] {
    e.preventDefault();
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
        this.hoveredIndex = index;
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
      if (figureZone === clickedZone) this.clickedIndex = i;
    }
    clickedZone.mouseMove(this.context, mouseCoords);
    clickedZone.buildRectangle(new Vertex(0, 0), new Vertex(this.width, this.height));
    this.figures[this.clickedIndex].multiplotResize(clickedZone.origin, clickedZone.size.x, clickedZone.size.y);
  }

  private resizeWithMouse(mouseCoords: Vertex, clickedObject: newShape): void {
    if (clickedObject instanceof SelectionBox) this.zoneToFigure(mouseCoords, clickedObject)
    else this.figureZones.mouseMove(this.context, mouseCoords);
  }

  private mouseMoveDrawer(e: MouseEvent, hasLeftFigure: boolean, canvasMouse: Vertex, frameMouse: Vertex, 
    canvasDown: Vertex, frameDown: Vertex, clickedObject: newShape, shiftKey: boolean): [Vertex, Vertex, Vertex, Vertex, boolean] { // TODO: ill conditioned method
      e.preventDefault();
      let absoluteMouse = new Vertex(e.offsetX, e.offsetY);
      this.getHoveredIndex(absoluteMouse);
      
      if (!this.isResizing) {
        if (this.clickedIndex != null && canvasDown) {
          if (!this.figures[this.clickedIndex].isInCanvas(absoluteMouse)) [canvasDown, hasLeftFigure] = this.mouseLeaveFigure(this.figures[this.clickedIndex], shiftKey);
        }
        if (!hasLeftFigure) [canvasMouse, frameMouse, absoluteMouse] = this.figures[this.hoveredIndex].mouseMoveDrawer(this.canvas, e, canvasDown, frameDown, clickedObject);
      } else this.resizeWithMouse(absoluteMouse, clickedObject);

      this.updateHoveredIndices(this.figures[this.hoveredIndex]);
      this.updateRubberBands(this.figures[this.hoveredIndex]);
      this.updateSelectedIndices();
      return [canvasMouse, frameMouse, absoluteMouse, canvasDown, hasLeftFigure]
    }

  private mouseDownDrawer(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, newShape] {
    this.clickedIndex = this.hoveredIndex;
    if (this.isResizing) return [null, null, this.figureZones.mouseDown(absoluteMouse.copy())];
    return this.figures[this.hoveredIndex].mouseDownDrawer(canvasMouse, frameMouse, absoluteMouse);
  }

  private mouseUpDrawer(canvasDown: Vertex, clickedObject: newShape, ctrlKey: boolean, shiftKey: boolean, hasLeftFigure: boolean): [Vertex, newShape, boolean] {
    if (this.isResizing && clickedObject instanceof SelectionBox) clickedObject.mouseUp(ctrlKey);
    if (!hasLeftFigure && !this.isResizing) [clickedObject, canvasDown] = this.figures[this.hoveredIndex].mouseUpDrawer(ctrlKey);
    if (!(this.figures[this.hoveredIndex] instanceof Graph2D || this.figures[this.hoveredIndex] instanceof Draw)) {
      this.clickedIndices = this.figures[this.hoveredIndex].clickedIndices;
    }
    this.updateRubberBands(this.figures[this.hoveredIndex]);
    hasLeftFigure = this.resetStateAttributes(shiftKey, ctrlKey);
    clickedObject = null;
    this.updateSelectedIndices();
    return [canvasDown, clickedObject, hasLeftFigure]
  }

  private mouseWheelDrawer(e: WheelEvent): void {
    e.preventDefault();
    this.figures[this.hoveredIndex].mouseWheelDrawer(e);
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
    let clickedObject: newShape = null;
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
    if (!shiftKey) {
      this.canvas.style.cursor = 'default';
      this.isSelecting = false;
    }
    this.figures.forEach(figure => {
      if (!shiftKey) {
        figure.is_drawing_rubber_band = false;
        figure.isSelecting = false;
      }
      figure.isZooming = false;
    })
    return false
  }
}

// All the following rows are purely deleted.
