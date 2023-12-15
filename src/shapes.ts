import { MAX_LABEL_HEIGHT, TEXT_SEPARATORS, DEFAULT_FONTSIZE, TOOLTIP_PRECISION, TOOLTIP_TRIANGLE_SIZE,
  TOOLTIP_TEXT_OFFSET, LEGEND_MARGIN, DASH_SELECTION_WINDOW, PICKABLE_BORDER_SIZE, RUBBERBAND_SMALL_SIZE } from "./constants"
import { PointStyle } from "./styles"
import { Vertex, Shape } from "./baseShape"
import { styleToLegend } from "./shapeFunctions"
import { Rect, RoundRect, Triangle, LineSegment, Point } from "./primitives"
import { Axis } from "./axes"

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

export class Text extends Shape {
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
  public boundingBox: Rect;
  public offset: number = 0;
  private words: string[];
  private writtenText: string[];
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
    this.boundingBox = new Rect(origin, new Vertex(width, height));
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

  public static deserialize(data: any, scale: Vertex): Text {
    const textParams = Text.deserializeTextParams(data);
    const text = new Text(data.comment, new Vertex(data.position_x, data.position_y), textParams);
    text.isScaled = data.text_scaling ?? false;
    text.scale = new Vertex(scale.x, scale.y);
    return text
  }

  get fullFont(): string { return Text.buildFont(this.style, this.fontsize, this.font) }

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
    context.font = Text.buildFont(this.style, fontsize, this.font);
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

  public capitalizeSelf(): void { this.text = Text.capitalize(this.text) }

  public updateBoundingBox(context: CanvasRenderingContext2D): void {
    const matrix = context.getTransform();
    this.boundingBox.origin = this.origin.copy();
    this.boundingBox.origin.x += this.setRectOffsetX() / (this.isScaled ? Math.sign(this.scale.x) : matrix.a);
    this.boundingBox.origin.y += this.setRectOffsetY() / (this.isScaled ? Math.sign(this.scale.y) : matrix.d);
    this.boundingBox.size.x = this.width;
    this.boundingBox.size.y = this.height;
    if (!this.isScaled) {
      const boundingBox = new Rect(this.boundingBox.origin.copy(), this.boundingBox.size.scale(new Vertex(Math.abs(1 / matrix.a), Math.abs(1 / matrix.d))));
      boundingBox.buildPath();
      this.boundingBox.path = boundingBox.path;
    } else this.boundingBox.buildPath();
  }

  public setDrawingProperties(context: CanvasRenderingContext2D): void {
    context.font = this.fullFont;
    context.textAlign = this.align as CanvasTextAlign;
    context.textBaseline = this.baseline as CanvasTextBaseline;
    context.fillStyle = this.fillStyle;
    context.globalAlpha = this.alpha;
  }

  protected buildDrawPath(context: CanvasRenderingContext2D, contextMatrix: DOMMatrix): void {
    this.setBoundingBoxState();
    this.updateBoundingBox(context);
    this.buildPath();
    this.boundingBox.draw(context);
  }

  protected drawPath(context: CanvasRenderingContext2D): void {
    const contextMatrix = context.getTransform();
    const origin = this.origin.transform(contextMatrix);
    context.resetTransform();
    context.translate(origin.x, origin.y);
    context.rotate(Math.PI / 180 * this.orientation);
    if (this.isScaled) context.scale(Math.abs(contextMatrix.a), Math.abs(contextMatrix.d));
    this.write(this.writtenText, context);
  }

  public drawWhenIsVisible(context: CanvasRenderingContext2D): void {
    if (this.text) {
      context.save();
      this.writtenText = this.cleanStartAllRows(this.rowIndices.length == 0 ? this.format(context) : this.formattedTextRows());
      super.drawWhenIsVisible(context);
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
      if (["top", "hanging"].includes(this.baseline)) context.fillText(index == 0 ? Text.capitalize(row) : row, 0, index * this.fontsize + this.offset)
      else context.fillText(index == 0 ? Text.capitalize(row) : row, 0, (index - nRows / middleFactor) * this.fontsize + this.offset);
    })
    else context.fillText(Text.capitalize(writtenText[0]), 0, this.offset / middleFactor);
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
    context.font = Text.buildFont(this.style, this.fontsize, this.font);
    this.height = writtenText.length * this.fontsize;
    this.width = this.getLongestRow(context, writtenText);
    this.rowIndices = [0];
    writtenText.forEach((row, index) => this.rowIndices.push(this.rowIndices[index] + row.length));
    return writtenText
  }

  public multiLineSplit(fontsize: number, context: CanvasRenderingContext2D): [string[], number] {
    context.font = Text.buildFont(this.style, fontsize, this.font);
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
    if (this.text.length == 0) return [""]
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
    return words.length > 1 ? words : this.text.split("")
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
      context.font = Text.buildFont(this.style, fontsize, this.font);
      if (this.checkWordsLength(context)) {
        rows = this.fixedFontSplit(context);
        criterion = fontsize * rows.length;
      }
      fontsize--;
    }
    return [rows, fontsize + 1]
  }
}

export class Label extends Shape {
  public shapeSize: Vertex = new Vertex(30, MAX_LABEL_HEIGHT);
  public legend: Shape;
  public maxWidth: number = 150;
  public readonly textOffset = 5;
  constructor(
    shape: Shape,
    public text: Text,
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
      this.legend.origin.x = this.origin.x;
      this.legend.origin.y = this.origin.y + LEGEND_MARGIN;
      this.legend.end.x = this.origin.x + this.shapeSize.x;
      this.legend.end.y = this.origin.y + this.shapeSize.y - LEGEND_MARGIN;
    }
    else if (this.legend instanceof Point) this.legend.center = this.origin.add(this.shapeSize.divide(2));
    else this.legend = new Rect(this.origin, this.shapeSize);
  }

  public getShapeStyle(shape: Shape, origin: Vertex): void {
    this.legend = styleToLegend(shape, origin, this.shapeSize);
    Object.entries(shape.drawingStyle).map(([key, value]) => this[key] = value);
  }

  public updateHeight(height: number): void {
    const heightRatio = height / this.shapeSize.y;
    this.shapeSize.x *= heightRatio;
    this.maxWidth *= heightRatio;
    this.shapeSize.y = height;
    if (this.legend instanceof Rect) this.legend.size.y = height
    else if (this.legend instanceof LineSegment) this.legend.end.y = this.legend.origin.y + height
    else if (this.legend instanceof Point) this.legend.size = height;
    this.text.fontsize = height;
  }

  public static deserialize(data: any, scale: Vertex = new Vertex(1, 1)): Label {
    const textParams = Text.deserializeTextParams(data);
    const text = new Text(data.title, new Vertex(0, 0), textParams);
    text.isScaled = false;
    text.baseline = "middle";
    text.align = "start";
    return new Label(new Rect(), text)
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

  public updateOrigin(drawingZone: Rect, initScale: Vertex, nLabels: number): void {
    this.origin.x = drawingZone.origin.x + drawingZone.size.x - (initScale.x < 0 ? 0 : this.maxWidth);
    this.origin.y = drawingZone.origin.y + drawingZone.size.y - nLabels * this.shapeSize.y * 1.75 * initScale.y;
    this.updateLegendGeometry();
    this.text.origin = this.origin.add(new Vertex(this.shapeSize.x + this.textOffset, this.shapeSize.y / 2));
  }

  private drawText(context: CanvasRenderingContext2D): void {
    const contextMatrix = context.getTransform();
    context.resetTransform();
    this.text.draw(context);
    context.setTransform(contextMatrix);
  }

  public drawWhenIsVisible(context: CanvasRenderingContext2D): void {
    super.drawWhenIsVisible(context);
    this.drawText(context);
  }

  public isPointInShape(context: CanvasRenderingContext2D, point: Vertex): boolean {
    return this.legend.isFilled ? context.isPointInPath(this.path, point.x, point.y) : (context.isPointInPath(this.path, point.x, point.y) || context.isPointInStroke(this.path, point.x, point.y))
  }
}

export class Tooltip {// TODO: make it a Shape
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
    this.path.addPath(new RoundRect(rectOrigin, this.size, this.radius).path);
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
      const text = new Text(row, textOrigin, { fontsize: this.fontsize, baseline: "middle", style: regexSamples.test(row) ? 'bold' : '' });
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
    const drawnPath = new Path2D();
    this.squareOrigin = this.squareOrigin.scale(scaling);
    this.origin = this.origin.scale(scaling);
    this.buildPath();
    drawnPath.addPath(this.path, new DOMMatrix().scale(contextMatrix.a, contextMatrix.d));

    context.save();
    context.scale(scaling.x, scaling.y);
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.strokeStyle;
    context.fillStyle = this.fillStyle;
    context.globalAlpha = this.alpha;
    context.fill(drawnPath);
    context.stroke(drawnPath);
    this.writeText(textOrigin, context);
    context.restore()
  }

  public setFlip(shape: Shape): void { this.isFlipper = shape.tooltipFlip }
}

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
    super.setContextPointInStroke(context);
    context.lineWidth = 10;
  }

  public updateMouseState(clusterColors: string[], hoveredIndices: number[], clickedIndices: number[], selectedIndices: number[]): Map<string, number> {
    const colors = new Map<string, number>();
    this.isHovered = this.isClicked = this.isSelected = false;
    this.values.forEach(index => {
      if (clusterColors) {
        const currentColorCounter = clusterColors[index];
        colors.set(currentColorCounter, colors.get(currentColorCounter) ? colors.get(currentColorCounter) + 1 : 1);
      }
      if (hoveredIndices.includes(index)) this.isHovered = true;
      if (clickedIndices.includes(index)) this.isClicked = true;
      if (selectedIndices.includes(index)) this.isSelected = true;
    });
    return colors
  }

  public updateDrawProperties(pointStyles: PointStyle[], clusterColors: string[], color: string, lineWidth: number, marker: string): void {
    this.lineWidth = lineWidth;
    this.setColors(color);
    if (pointStyles) {
      const clusterPointStyle = clusterColors ? Object.assign({}, pointStyles[this.values[0]], { strokeStyle: null }) : pointStyles[this.values[0]];
      this.updateStyle(clusterPointStyle);
    } else this.marker = marker;
    this.update();
  }

  public updateTooltipMap() { this._tooltipMap = new Map<string, any>([["Number", this.values.length], ["X mean", this.mean.x], ["Y mean", this.mean.y],]) };

  public updateTooltip(tooltipAttributes: string[], features: Map<string, number[]>, axes: Axis[], xName: string, yName: string) {
    this.updateTooltipMap();
    if (this.values.length == 1) {
      this.newTooltipMap();
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

  get tooltipFlip(): boolean { return false }

  public setGeometry(origin: Vertex, size: Vertex): void {
    this.origin = origin;
    this.size = size;
  }

  public drawWhenIsVisible(context: CanvasRenderingContext2D): void {
    if (this.length != 0) {
      super.drawWhenIsVisible(context);
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

// TODO: make rubberband a Shape ?
export class RubberBand {
  public canvasMin: number = 0;
  public canvasMax: number = 0;

  public isHovered: boolean = false;
  public isClicked: boolean = false;
  public isSelected: boolean = false;

  public path: Path2D;
  public isInverted: boolean = false;

  public minUpdate: boolean = false;
  public maxUpdate: boolean = false;
  public lastValues: Vertex = new Vertex(null, null);
  constructor(
    public attributeName: string,
    private _minValue: number,
    private _maxValue: number,
    public isVertical: boolean) { }

  public get canvasLength() { return Math.abs(this.canvasMax - this.canvasMin) }

  public get length() { return Math.abs(this.maxValue - this.minValue) }

  public set minValue(value: number) { this._minValue = value }

  public get minValue() { return this._minValue }

  public set maxValue(value: number) { this._maxValue = value }

  public get maxValue() { return this._maxValue }

  public get isTranslating(): boolean { return !this.minUpdate && !this.maxUpdate && this.isClicked}

  public selfSend(rubberBands: Map<string, RubberBand>) { rubberBands.set(this.attributeName, new RubberBand(this.attributeName, 0, 0, this.isVertical)) }

  public selfSendRange(rubberBands: Map<string, RubberBand>) {
    rubberBands.get(this.attributeName).minValue = this.minValue;
    rubberBands.get(this.attributeName).maxValue = this.maxValue;
  }

  public draw(origin: number, context: CanvasRenderingContext2D, colorFill: string, colorStroke: string, lineWidth: number, alpha: number) {
    let rectOrigin: Vertex;
    let rectSize: Vertex;
    if (this.isVertical) {
      rectOrigin = new Vertex(origin - RUBBERBAND_SMALL_SIZE / 2, this.canvasMin);
      rectSize = new Vertex(RUBBERBAND_SMALL_SIZE, this.canvasLength);
    } else {
      rectOrigin = new Vertex(this.canvasMin, origin - RUBBERBAND_SMALL_SIZE / 2);
      rectSize = new Vertex(this.canvasLength, RUBBERBAND_SMALL_SIZE)
    }
    const draw = new Rect(rectOrigin, rectSize);
    draw.lineWidth = lineWidth;
    draw.fillStyle = colorFill;
    draw.strokeStyle = colorStroke;
    draw.alpha = alpha;
    draw.draw(context);
  }

  public reset() {
    this.minValue = 0;
    this.maxValue = 0;
    this.canvasMin = 0;
    this.canvasMax = 0;
  }

  public flipMinMax() {
    if (this.minValue >= this.maxValue) {
      [this.minValue, this.maxValue] = [this.maxValue, this.minValue];
      [this.minUpdate, this.maxUpdate] = [this.maxUpdate, this.minUpdate];
    }
  }

  private get borderSize() { return Math.min(PICKABLE_BORDER_SIZE, this.canvasLength / 3) }

  public mouseDown(mouseAxis: number) {
    this.isClicked = true;
    if (Math.abs(mouseAxis - this.canvasMin) <= this.borderSize) this.isInverted ? this.maxUpdate = true : this.minUpdate = true
    else if (Math.abs(mouseAxis - this.canvasMax) <= this.borderSize) this.isInverted ? this.minUpdate = true : this.maxUpdate = true
    else this.lastValues = new Vertex(this.minValue, this.maxValue);
  }

  public mouseMove(downValue: number, currentValue: number) {
    if (this.isClicked) {
      if (this.minUpdate) this.minValue = currentValue
      else if (this.maxUpdate) this.maxValue = currentValue
      else {
        const translation = currentValue - downValue;
        this.minValue = this.lastValues.x + translation;
        this.maxValue = this.lastValues.y + translation;
      }
      this.flipMinMax();
    }
  }

  public mouseUp() {
    this.minUpdate = false;
    this.maxUpdate = false;
    this.isClicked = false;
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
