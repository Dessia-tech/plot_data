import * as C from './constants';
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
  isScaled?: boolean,
  scale?: Vertex
}

export class Text extends Shape {
  public scale: Vertex = new Vertex(1, 1);
  public width: number;
  public height: number;

  private words: string[];
  private writtenText: string[];

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
      isScaled = false,
      scale = new Vertex(1, 1)
    }: TextParams = {}) {
    super();
    this.initializeBoundingBox(origin, width, height, backgroundColor);
    this.initializeTextStyle(fontsize, multiLine, font, style, orientation, color, align, baseline, isScaled, scale);
    this.words = this.getWords();
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
      color: data.text_style?.text_color,
      isScaled: data.text_scaling
    } as TextParams
  }

  public static deserialize(data: any, scale: Vertex): Text {
    const textParams = Text.deserializeTextParams(data);
    const text = new Text(data.comment, new Vertex(data.position_x, data.position_y), textParams);
    text.scale = new Vertex(scale.x, scale.y);
    text.isInteractive = data.interactive;
    return text
  }

  get fullFont(): string { return Text.buildFont(this.style, this.fontsize, this.font) }

  private initializeBoundingBox(origin: Vertex, width: number, height: number, backgroundColor: string): void {
    this.boundingBox = new Rect(origin, new Vertex(width, height));
    this.boundingBox.fillStyle = backgroundColor;
    this.boundingBox.strokeStyle = backgroundColor;
    this.boundingBox.lineWidth = 1e-6;
  }

  private initializeTextStyle(
    fontsize: number, multiLine: boolean, font: string, style: string, orientation: number,
    color: string, align: string, baseline: string, isScaled: boolean, scale: Vertex): void {
      this.fontsize = fontsize;
      this.multiLine = multiLine;
      this.font = font;
      this.style = style;
      this.orientation = orientation;
      this.fillStyle = color;
      this.align = align;
      this.baseline = baseline;
      this.isScaled = isScaled;
      this.scale = scale;
  }

  public setBoundingBox(newWidth: number, newHeight: number): void {
    this.boundingBox.size.x = newWidth ? newWidth : this.boundingBox.size.x;
    this.boundingBox.size.y = newHeight;
  }

  private getXCornersUnscaled(xFirstCorner: number, xSecondCorner: number, xMinMaxFactor: number): [number, number] {
    if (this.align == "center") return [xFirstCorner * 0.99, xSecondCorner * 1.01];
    if (["right", "end"].includes(this.align)) return [xFirstCorner, xSecondCorner != 0 ? xSecondCorner * (1 - xMinMaxFactor) : -Math.sign(this.scale.x)];
    if (["left", "start"].includes(this.align)) return [xFirstCorner, xSecondCorner != 0 ? xSecondCorner * (1 + xMinMaxFactor) : Math.sign(this.scale.x)];
  }

  private getYCornersUnscaled(yFirstCorner: number, ySecondCorner: number, yMinMaxFactor: number): [number, number] {
    if (this.baseline == "middle") return [yFirstCorner * 0.99, ySecondCorner * 1.01];
    if (["bottom", "alphabetic"].includes(this.baseline)) return [yFirstCorner, ySecondCorner != 0 ? ySecondCorner * (1 - yMinMaxFactor) : -Math.sign(this.scale.y)];
    if (["top", "hanging"].includes(this.baseline)) return [yFirstCorner, ySecondCorner != 0 ? ySecondCorner * (1 + yMinMaxFactor) : Math.sign(this.scale.y)];
  }

  private getCornersUnscaled(): [Vertex, Vertex] {
    const firstCorner = this.origin.copy();
    const secondCorner = firstCorner.copy();
    const xMinMaxFactor = Math.sign(secondCorner.x) * 0.01 * Math.sign(this.scale.x);
    const yMinMaxFactor = Math.sign(secondCorner.y) * 0.01 * Math.sign(this.scale.y);
    [firstCorner.x, secondCorner.x] = this.getXCornersUnscaled(firstCorner.x, secondCorner.x, xMinMaxFactor);
    [firstCorner.y, secondCorner.y] = this.getYCornersUnscaled(firstCorner.y, secondCorner.y, yMinMaxFactor);
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

  private computeFontSize(text: string, defaultFontSize: number, context: CanvasRenderingContext2D): number {
    let defaultTextWidth = 0;
    if (defaultFontSize < 1) {
      context.font = Text.buildFont(this.style, 1, this.font);
      defaultTextWidth = context.measureText(text).width * defaultFontSize;
    } else defaultTextWidth = context.measureText(text).width;
    if (defaultTextWidth >= this.boundingBox.size.x) return defaultFontSize * this.boundingBox.size.x / defaultTextWidth;
    return defaultFontSize
  }

  private automaticFontSize(context: CanvasRenderingContext2D): number {
    let fontsize = Math.min(this.boundingBox.size.y ?? Number.POSITIVE_INFINITY, this.fontsize ?? Number.POSITIVE_INFINITY);
    if (fontsize == Number.POSITIVE_INFINITY) fontsize = C.DEFAULT_FONTSIZE;
    context.font = Text.buildFont(this.style, fontsize, this.font);
    return this.computeFontSize(this.text, fontsize, context)
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

  private setBoundingBoxGeometry(contextMatrix: DOMMatrix): void {
    this.boundingBox.origin = this.origin.copy();
    this.boundingBox.origin.x += this.setRectOffsetX() / (this.isScaled ? Math.sign(this.scale.x) : contextMatrix.a);
    this.boundingBox.origin.y += this.setRectOffsetY() / (this.isScaled ? Math.sign(this.scale.y) : contextMatrix.d);
    this.boundingBox.size.x = this.width;
    this.boundingBox.size.y = this.height;
  }

  private descaleBoundingBox(contextMatrix: DOMMatrix): void {
    const boundingBox = new Rect(
      this.boundingBox.origin.copy(),
      this.boundingBox.size.scale(new Vertex(Math.abs(1 / contextMatrix.a), Math.abs(1 / contextMatrix.d)))
    );
    boundingBox.buildPath();
    this.boundingBox.path = boundingBox.path;
  }

  public updateBoundingBox(context: CanvasRenderingContext2D): void {
    const contextMatrix = context.getTransform();
    this.setBoundingBoxGeometry(contextMatrix);
    this.isScaled ? this.boundingBox.buildPath() : this.descaleBoundingBox(contextMatrix);
  }

  public buildPath(): void { this.path = this.boundingBox.path }

  public static capitalize(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1) }

  public capitalizeSelf(): void { this.text = Text.capitalize(this.text) }

  public setDrawingProperties(context: CanvasRenderingContext2D): void {
    context.font = this.fullFont;
    context.textAlign = this.align as CanvasTextAlign;
    context.textBaseline = this.baseline as CanvasTextBaseline;
    context.fillStyle = this.fillStyle;
    context.globalAlpha = this.alpha;
  }

  protected buildDrawPath(context: CanvasRenderingContext2D): void {
    this.setBoundingBoxState();
    this.updateBoundingBox(context);
    this.buildPath();
    this.boundingBox.isInteractive = this.isInteractive;
    this.boundingBox.draw(context);
  }

  protected drawPath(context: CanvasRenderingContext2D): void {
    const contextMatrix = context.getTransform();
    const origin = this.origin.transform(contextMatrix);
    context.resetTransform();
    context.translate(origin.x, origin.y);
    context.rotate(Math.PI / 180 * this.orientation);
    if (this.isScaled) {
      if (this.fontsize < 1) {
        context.scale(Math.abs(contextMatrix.a * this.fontsize), Math.abs(contextMatrix.d * this.fontsize));
        context.font = Text.buildFont(this.style, 1, this.font);
      }
      else context.scale(Math.abs(contextMatrix.a), Math.abs(contextMatrix.d));
    }
    this.write(this.writtenText, context);
  }

  protected computeContextualAttributes(context: CanvasRenderingContext2D): void {
    this.writtenText = this.cleanStartAllRows(this.rowIndices.length == 0 ? this.format(context) : this.formatTextRows());
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
    const middleFactor = this.baseline == "middle" ? 2 : 1;
    if (writtenText.length > 1) this.multiLineWrite(writtenText, middleFactor, context);
    else context.fillText(Text.capitalize(writtenText[0]), 0, this.offset / middleFactor);
  }

  private multiLineWrite(writtenText: string[], middleFactor: number, context: CanvasRenderingContext2D): void {
    const nRows = writtenText.length - 1;
    const fontsize = Math.max(this.fontsize, 1);
    writtenText.forEach((row, index) => {
      ["top", "hanging"].includes(this.baseline)
        ? context.fillText(index == 0 ? Text.capitalize(row) : row, 0, index * fontsize + this.offset)
        : context.fillText(index == 0 ? Text.capitalize(row) : row, 0, (index - nRows / middleFactor) * fontsize + this.offset);
    });
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
    context.font = Text.buildFont(this.style, this.fontsize, this.font);
    return Math.max(...writtenText.map(row => context.measureText(row).width))
  }

  public formatTextRows(): string[] {
    const writtenText = []
    this.rowIndices.slice(0, this.rowIndices.length - 1).forEach((_, rowIndex) => {
      writtenText.push(this.text.slice(this.rowIndices[rowIndex], this.rowIndices[rowIndex + 1]));
    })
    return writtenText
  }

  private computeRowIndices(writtenText: string[]): number[] {
    const rowIndices = [0];
    writtenText.forEach((row, index) => rowIndices.push(rowIndices[index] + row.length));
    return rowIndices
  }

  private formatWithLength(writtenText: string[], fontsize: number, context: CanvasRenderingContext2D): [string[], number] {
    if (this.multiLine) return this.multiLineSplit(fontsize, context);
    return [writtenText, this.automaticFontSize(context)]
  }

  private formatInBoundingBox(context: CanvasRenderingContext2D): [string[], number] {
    const fontsize = this.fontsize ?? C.DEFAULT_FONTSIZE;
    if (this.boundingBox.size.x) return this.formatWithLength([this.text], fontsize, context);
    if (this.boundingBox.size.y) return [[this.text], this.fontsize ?? this.boundingBox.size.y];
    return [[this.text], fontsize]
  }

  public format(context: CanvasRenderingContext2D): string[] {
    const [writtenText, fontsize] = this.formatInBoundingBox(context);
    this.fontsize = Math.abs(fontsize);
    this.height = writtenText.length * this.fontsize;
    this.width = this.fontsize > 1 ? this.getLongestRow(context, writtenText) : this.boundingBox.size.x ?? this.getLongestRow(context, writtenText);
    this.rowIndices = this.computeRowIndices(writtenText);
    return writtenText
  }

  public multiLineSplit(fontsize: number, context: CanvasRenderingContext2D): [string[], number] {
    context.font = Text.buildFont(this.style, fontsize, this.font);
    const oneRowLength = context.measureText(this.text).width;
    if (oneRowLength < this.boundingBox.size.x) {
      return [[this.text.trimStart()], fontsize > this.boundingBox.size.y ? this.boundingBox.size.y ?? fontsize : fontsize];
    }
    if (!this.boundingBox.size.y) return this.fixedFontSplit(fontsize, context)
    return this.autoFontSplit(fontsize, context);
  }

  private getWords(): string[] {
    if (this.words) return this.words;
    return this.splitInWords();
  }

  private buildWord(pickedChars: number, word: string): [string, number] {
    while (pickedChars < this.text.length) {
      word += this.text[pickedChars];
      pickedChars++;
      if (C.TEXT_SEPARATORS.includes(word[word.length - 1])) break;
    }
    return [word, pickedChars]
  }

  private buildWords(): string[] {
    const words = [];
    let pickedChars = 0;
    while (pickedChars < this.text.length) {
      let word = "";
      [word, pickedChars] = this.buildWord(pickedChars, word);
      words.push(word);
    }
    return words.length > 1 ? words : this.text.split("")
  }

  private splitInWords(): string[] {
    if (this.text.length == 0) return [""];
    return this.buildWords();
  }

  private isTextTooWide(context: CanvasRenderingContext2D, text: string): boolean {
    return context.measureText(text).width > this.boundingBox.size.x
  }

  private addPickedWordToRow(row: string, pickedWords: number): [string, number] {
    return [row + this.words[pickedWords], pickedWords + 1]
  }

  private computeNewRow(context: CanvasRenderingContext2D, pickedWords: number, rows: string[], fontsize: number): [string[], number, number] {
    let newRow = '';
    while (context.measureText(newRow).width < this.boundingBox.size.x && pickedWords < this.words.length) {
      if (this.isTextTooWide(context, newRow + this.words[pickedWords])) {
         if (newRow != '') break
      }
      [newRow, pickedWords] = this.addPickedWordToRow(newRow, pickedWords);
    }
    if (newRow.length != 0) rows.push(newRow);
    return [rows, pickedWords, fontsize]
  }

  private fixedFontSplit(fontsize: number, context: CanvasRenderingContext2D): [string[], number] {
    let rows: string[] = [];
    let pickedWords = 0;
    while (pickedWords < this.words.length) {
      [rows, pickedWords, fontsize] = this.computeNewRow(context, pickedWords, rows, fontsize);
      if (this.isTextTooWide(context, rows[rows.length - 1])) {
        fontsize = this.computeFontSize(rows[rows.length - 1], fontsize, context);
        context.font = Text.buildFont(this.style, fontsize, this.font);
      }
    }
    return [rows, fontsize]
  }
  private cleanStartAllRows(rows: string[]): string[] { return rows.map(row => row.trimStart()) }

  private checkWordsLength(context: CanvasRenderingContext2D): boolean {
    for (let i = 0; i < this.words.length - 1; i++) {
      if (context.measureText(this.words[i]).width > this.boundingBox.size.x) return false;
    }
    return true
  }

  private computeTextHeight(fontsize: number, textHeight: number, rows: string[], context: CanvasRenderingContext2D): [string[], number] {
    if (this.checkWordsLength(context)) {
      rows = this.fixedFontSplit(fontsize, context)[0];
      textHeight = fontsize * rows.length;
    }
    return [rows, textHeight]
  }

  private autoFontSplit(fontsize: number, context: CanvasRenderingContext2D): [string[], number] {
    let rows = [];
    let textHeight = Number.POSITIVE_INFINITY;
    while (textHeight > this.boundingBox.size.y && fontsize > 1) {
      context.font = Text.buildFont(this.style, fontsize, this.font);
      [rows, textHeight] = this.computeTextHeight(fontsize, textHeight, rows, context);
      fontsize--; // TODO: weird, algorithm has to be re-thought. But working with no infinite loop
    }
    return [rows, fontsize + 1]
  }
}

export class Label extends Shape {
  public shapeSize: Vertex = new Vertex(30, C.MAX_LABEL_HEIGHT);
  public legend: LineSegment | Point | Rect;
  public maxWidth: number = 150;
  constructor(
    shape: Shape,
    public text: Text,
    public origin: Vertex = new Vertex(0, 0)
  ) {
    super();
    this.isScaled = false;
    this.getShapeStyle(shape, this.origin);
    this.buildPath();
  }

  public buildPath(): void {
    this.legend.buildPath();
    this.path = this.legend.path;
  }

  public getBounds(): [Vertex, Vertex] { return [null, null] }

  public buildUnscaledPath(context: CanvasRenderingContext2D): Path2D {
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

  private setLineSegmentLegendGeometry(legend: LineSegment): LineSegment {
    legend.origin.x = this.origin.x;
    legend.origin.y = this.origin.y + C.LEGEND_MARGIN;
    legend.end.x = this.origin.x + this.shapeSize.x;
    legend.end.y = this.origin.y + this.shapeSize.y - C.LEGEND_MARGIN;
    return legend
  }

  private setPointLegendGeometry(legend: Point): Point {
    legend.center = this.origin.add(this.shapeSize.divide(2));
    return legend
  }

  private updateLegendGeometry(): LineSegment | Point | Rect {
    if (this.legend instanceof LineSegment) return this.setLineSegmentLegendGeometry(this.legend)
    if (this.legend instanceof Point) return this.setPointLegendGeometry(this.legend)
    return new Rect(this.origin, this.shapeSize);
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
    this.text.setBoundingBox(this.maxWidth - this.shapeSize.x - C.LABEL_TEXT_OFFSET, height);
  }

  public static deserialize(data: any, scale: Vertex = new Vertex(1, 1)): Label {
    const textParams = Text.deserializeTextParams(data);
    const text = new Text(data.title, new Vertex(0, 0), textParams);
    text.isScaled = false;
    text.baseline = "middle";
    text.align = "start";
    text.multiLine = true;
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

  public updateOrigin(drawingZone: Rect, initScale: Vertex, offsetLabels: number): void {
    this.origin.x = drawingZone.origin.x + drawingZone.size.x - (initScale.x < 0 ? 0 : this.maxWidth);
    this.origin.y = drawingZone.origin.y + drawingZone.size.y - offsetLabels * this.shapeSize.y * 1.75 * initScale.y;
    this.legend = this.updateLegendGeometry();
    this.text.origin = this.origin.add(new Vertex(this.shapeSize.x + C.LABEL_TEXT_OFFSET, this.shapeSize.y / 2));
  }

  private drawText(context: CanvasRenderingContext2D): void {
    const contextMatrix = context.getTransform();
    context.resetTransform();
    this.text.fontsize = null;
    this.text.rowIndices = [];
    try { 
      this.text.draw(context);
    } catch (TypeError) {}  // This is to avoid a bug when sizes of Label's objects is too small
    context.setTransform(contextMatrix);
  }

  protected drawMembers(context: CanvasRenderingContext2D): void { this.drawText(context) }

  public isPointInShape(context: CanvasRenderingContext2D, point: Vertex): boolean {
    return context.isPointInPath(this.path, point.x, point.y)  // TODO: fix this to include legend shape
  }
}

export class Tooltip extends Shape {
  public textColor: string = "hsl(0, 0%, 100%)";
  public fontsize: number = 10;
  public radius: number = 10;

  private printedRows: string[];
  private squareOrigin: Vertex;
  private textOrigin: Vertex;
  private size: Vertex;

  private isUp = true;
  public isFlipper = true;

  constructor(
    public origin,
    public dataToPrint: Map<string, any>,
    context: CanvasRenderingContext2D
  ) {
    super();
    this.setStyle();
    [this.printedRows, this.size] = this.buildText(context);
    this.squareOrigin = new Vertex(this.origin.x, this.origin.y);
  }

  private setStyle(): void {
    this.strokeStyle = "hsl(210, 90%, 20%)";
    this.fillStyle = "hsl(210, 90%, 20%)";
    this.alpha = 0.8;
  }

  private featureValueToTextRow(featureValue: any, featureKey: string): string {
    if (featureKey == "Number" && featureValue != 1) return `${featureValue} samples`;
    if (featureKey != "name") return featureValue != '' ? `${featureKey}: ${this.formatValue(featureValue)}` : featureKey
    return null
  }

  private dataToText(context: CanvasRenderingContext2D): [string[], number] {
    const printedRows = [];
    let textLength = 0;
    this.dataToPrint.forEach((value, key) => {
      const text = this.featureValueToTextRow(value, key);
      const textWidth = context.measureText(text).width;
      if (textWidth > textLength) textLength = textWidth;
      if (text) printedRows.push(text);
    })
    return [printedRows, textLength]
  }

  private buildText(context: CanvasRenderingContext2D): [string[], Vertex] {
    context.save();
    context.font = `${this.fontsize}px sans-serif`;
    const [printedRows, textLength] = this.dataToText(context);
    context.restore();
    return [printedRows, new Vertex(textLength + C.TOOLTIP_TEXT_OFFSET * 2, (printedRows.length + 1.5) * this.fontsize)]
  }

  private formatValue(value: number | string): number | string {
    if (typeof value == "number") return Math.round(value * C.TOOLTIP_PRECISION) / C.TOOLTIP_PRECISION;
    return value
  };

  public buildPath(): void {
    this.path = new Path2D();
    const rectOrigin = this.squareOrigin.add(new Vertex(-this.size.x / 2, C.TOOLTIP_TRIANGLE_SIZE));
    const triangleCenter = this.origin;
    triangleCenter.y += C.TOOLTIP_TRIANGLE_SIZE / 2 * (this.isUp ? 1 : -1);
    this.path.addPath(new RoundRect(rectOrigin, this.size, this.radius).path);
    this.path.addPath(new Triangle(triangleCenter, C.TOOLTIP_TRIANGLE_SIZE, this.isUp ? 'down' : 'up').path);
  }

  private computeTextOrigin(scaling: Vertex): Vertex {
    let textOrigin = this.squareOrigin;
    let textOffsetX = -this.size.x / 2 + C.TOOLTIP_TEXT_OFFSET;
    let textOffsetY = (scaling.y < 0 ? -this.size.y - C.TOOLTIP_TRIANGLE_SIZE : C.TOOLTIP_TRIANGLE_SIZE) + this.fontsize * 1.25;
    return textOrigin.add(new Vertex(textOffsetX, textOffsetY));
  }

  private writeRow(textOrigin: Vertex, row: string, rowIndex: number, context: CanvasRenderingContext2D): void {
    textOrigin.y += rowIndex == 0 ? 0 : this.fontsize;
    const text = new Text(row, textOrigin, { fontsize: this.fontsize, baseline: "middle", style: C.REGEX_SAMPLES.test(row) ? 'bold' : '' });
    text.fillStyle = this.textColor;
    text.draw(context);
  }

  private writeText(textOrigin: Vertex, context: CanvasRenderingContext2D): void {
    this.printedRows.forEach((row, index) => this.writeRow(textOrigin, row, index, context));
  }

  private updateSquareXOrigin(upRightDiff: Vertex, downLeftDiff: Vertex, plotSize: Vertex): number {
    if (upRightDiff.x < 0) return upRightDiff.x;
    if (upRightDiff.x > plotSize.x) return upRightDiff.x - plotSize.x;
    if (downLeftDiff.x < 0) return -downLeftDiff.x
    if (downLeftDiff.x > plotSize.x) return plotSize.x - downLeftDiff.x;
    return 0
  }

  private computeYOffset(upRightDiff: Vertex, downLeftDiff: Vertex, plotSize: Vertex): [number, number] {
    if (upRightDiff.y < 0) {
      if (!this.isFlipper) return [upRightDiff.y, upRightDiff.y]
      this.flip();
      return [0, -this.size.y - C.TOOLTIP_TRIANGLE_SIZE * 2];
    }
    if (upRightDiff.y > plotSize.y) {
      if (!this.isFlipper) return [upRightDiff.y - plotSize.y, upRightDiff.y - plotSize.y]
      this.flip();
      return [0, this.size.y + C.TOOLTIP_TRIANGLE_SIZE * 2]
    }
    if (downLeftDiff.y < 0) return [-downLeftDiff.y, -downLeftDiff.y]
    if (downLeftDiff.y > plotSize.y) return [downLeftDiff.y - plotSize.y, downLeftDiff.y - plotSize.y]
    return [0, 0]
  }

  public insideCanvas(plotOrigin: Vertex, plotSize: Vertex, scaling: Vertex): void {
    const downLeftCorner = this.squareOrigin.add(new Vertex(-this.size.x / 2, C.TOOLTIP_TRIANGLE_SIZE).scale(scaling));
    const upRightCorner = downLeftCorner.add(this.size.scale(scaling));
    const upRightDiff = plotOrigin.add(plotSize).subtract(upRightCorner);
    const downLeftDiff = downLeftCorner.subtract(plotOrigin);
    const [offsetOrigin, offsetSquareOrigin] = this.computeYOffset(upRightDiff, downLeftDiff, plotSize)
    this.squareOrigin.x += this.updateSquareXOrigin(upRightDiff, downLeftDiff, plotSize);
    this.origin.y += offsetOrigin;
    this.squareOrigin.y += offsetSquareOrigin;
  }

  public flip(): void { this.isUp = !this.isUp }

  protected computeContextualAttributes(context: CanvasRenderingContext2D): void {
    const contextMatrix = context.getTransform();
    this.inStrokeScale = new Vertex(1 / contextMatrix.a, 1 / contextMatrix.d);
    this.textOrigin = this.computeTextOrigin(this.inStrokeScale);
    this.squareOrigin = this.squareOrigin.scale(this.inStrokeScale);
    this.origin = this.origin.scale(this.inStrokeScale);
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.strokeStyle;
    context.fillStyle = this.fillStyle;
    context.globalAlpha = this.alpha;
  }

  protected buildDrawPath(context: CanvasRenderingContext2D): void {
    const contextMatrix = context.getTransform();
    this.drawnPath = new Path2D();
    this.buildPath();
    this.drawnPath.addPath(this.path, new DOMMatrix().scale(contextMatrix.a, contextMatrix.d));
  }

  protected drawPath(context: CanvasRenderingContext2D): void {
    context.scale(this.inStrokeScale.x, this.inStrokeScale.y);
    super.drawPath(context);
    this.writeText(this.textOrigin, context);
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

  private mapClusterColor(index: number, clusterColors: string[], colors: Map<string, number>): void {
    const currentColorCounter = clusterColors[index];
    colors.set(currentColorCounter, colors.get(currentColorCounter) ? colors.get(currentColorCounter) + 1 : 1);
  }

  private updateMouseState(index: number, hoveredIndices: number[], clickedIndices: number[], selectedIndices: number[]): void {
    if (hoveredIndices.includes(index)) this.isHovered = true;
    if (clickedIndices.includes(index)) this.isClicked = true;
    if (selectedIndices.includes(index)) this.isSelected = true;
  }

  public updateDrawingState(clusterColors: string[], hoveredIndices: number[], clickedIndices: number[], selectedIndices: number[]): Map<string, number> {
    const colors = new Map<string, number>();
    this.isHovered = this.isClicked = this.isSelected = false;
    this.values.forEach(index => {
      if (clusterColors) this.mapClusterColor(index, clusterColors, colors);
      this.updateMouseState(index, hoveredIndices, clickedIndices, selectedIndices);
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

  protected updateTooltipOrigin(matrix: DOMMatrix): void { this.tooltipOrigin = this.center.copy() }

  public updateTooltipMap() { this._tooltipMap = new Map<string, any>([["Number", this.values.length], ["X mean", this.mean.x], ["Y mean", this.mean.y],]) };

  private monoValueTooltip(tooltipAttributes: string[], features: Map<string, number[]>): void {
    this.newTooltipMap();
    tooltipAttributes.forEach(attr => this.tooltipMap.set(attr, features.get(attr)[this.values[0]]));
  }

  private multiValueTooltip(axes: Axis[], xName: string, yName: string): void {
    this.tooltipMap.set(`Average ${xName}`, axes[0].isDiscrete ? axes[0].labels[Math.round(this.mean.x)] : this.mean.x);
    this.tooltipMap.set(`Average ${yName}`, axes[1].isDiscrete ? axes[1].labels[Math.round(this.mean.y)] : this.mean.y);
    this.tooltipMap.delete('X mean');
    this.tooltipMap.delete('Y mean');
  }

  public updateTooltip(tooltipAttributes: string[], features: Map<string, number[]>, axes: Axis[], xName: string, yName: string) {
    this.updateTooltipMap();
    if (this.values.length == 1) this.monoValueTooltip(tooltipAttributes, features);
    else this.multiValueTooltip(axes, xName, yName);
  }

  public updateStyle(style: PointStyle): void {
    super.updateStyle(style);
    this.marker = this.values.length > 1 ? this.marker : style.marker ?? this.marker;
  }

  private sumCoordsAndValues(pointsData: { [key: string]: number[] }): [number, number, number, number] {
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
    return [centerX, centerY, meanX, meanY]
  }

  public computeValues(pointsData: { [key: string]: number[] }, thresholdDist: number): void {
    const [centerX, centerY, meanX, meanY] = this.sumCoordsAndValues(pointsData);
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

  protected computeContextualAttributes(context: CanvasRenderingContext2D): void {
    this.tooltipOrigin = this.computeTooltipOrigin(context.getTransform());
  }

  public draw(context: CanvasRenderingContext2D): void {
    if (this.length != 0) super.draw(context);
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

export class RubberBand extends Rect {
  public canvasMin: number = 0;
  public canvasMax: number = 0;

  public isInverted: boolean = false;
  public minUpdate: boolean = false;
  public maxUpdate: boolean = false;

  public lastCanvasValues: Vertex = new Vertex(null, null);
  constructor(
    public attributeName: string,
    private _minValue: number,
    private _maxValue: number,
    public isVertical: boolean) { super() }

  public get canvasLength(): number { return Math.abs(this.canvasMax - this.canvasMin) }

  public get length(): number { return Math.abs(this.maxValue - this.minValue) }

  public set minValue(value: number) { this._minValue = value }

  public get minValue(): number { return this._minValue }

  public set maxValue(value: number) { this._maxValue = value }

  public get maxValue(): number { return this._maxValue }

  public get isTranslating(): boolean { return !this.minUpdate && !this.maxUpdate && this.isClicked}

  public selfSend(rubberBands: Map<string, RubberBand>): void { rubberBands.set(this.attributeName, new RubberBand(this.attributeName, 0, 0, this.isVertical)) }

  public defaultStyle(): void {
    this.lineWidth = 0.1;
    this.fillStyle = C.RUBBERBAND_COLOR;
    this.strokeStyle = C.RUBBERBAND_COLOR;
    this.alpha = C.RUBBERBAND_ALPHA;
  }

  public selfSendRange(rubberBands: Map<string, RubberBand>): void {
    rubberBands.get(this.attributeName).minValue = this.minValue;
    rubberBands.get(this.attributeName).maxValue = this.maxValue;
  }

  public updateCoords(canvasCoords: Vertex, axisOrigin: Vertex, axisEnd: Vertex): void {
    const coord = this.isVertical ? "y" : "x";
    this.canvasMin = Math.max(canvasCoords.min, axisOrigin[coord]);
    this.canvasMax = Math.min(canvasCoords.max, axisEnd[coord]);
    this.canvasMin = Math.min(this.canvasMin, this.canvasMax);
    this.canvasMax = Math.max(this.canvasMin, this.canvasMax);
    [this.origin, this.size] = this.computeRectProperties(axisOrigin);
    this.buildPath();
  }

  private getVerticalRectProperties(axisOrigin: Vertex): [Vertex, Vertex] {
    return [
      new Vertex(axisOrigin.x - C.RUBBERBAND_SMALL_SIZE / 2, this.canvasMin),
      new Vertex(C.RUBBERBAND_SMALL_SIZE, this.canvasLength)
    ]
  }

  private getHorizontalRectProperties(axisOrigin: Vertex): [Vertex, Vertex] {
    return [
      new Vertex(this.canvasMin, axisOrigin.y - C.RUBBERBAND_SMALL_SIZE / 2),
      new Vertex(this.canvasLength, C.RUBBERBAND_SMALL_SIZE)
    ]
  }

  public computeRectProperties(axisOrigin: Vertex): [Vertex, Vertex] {
    return this.isVertical ? this.getVerticalRectProperties(axisOrigin) : this.getHorizontalRectProperties(axisOrigin);
  }

  public reset(): void {
    this.minValue = 0;
    this.maxValue = 0;
    this.canvasMin = 0;
    this.canvasMax = 0;
  }

  public flip(axisInverted: boolean): void {
    this.isInverted = axisInverted;
  }

  public flipMinMax(): void {
    if (this.minValue >= this.maxValue) {
      [this.minValue, this.maxValue] = [this.maxValue, this.minValue];
      [this.minUpdate, this.maxUpdate] = [this.maxUpdate, this.minUpdate];
    }
  }

  public updateMinMaxValueOnMouseMove(relativeCanvasMin: number, relativeCanvasMax: number): void {
    this.minValue = this.isInverted ? relativeCanvasMax : relativeCanvasMin;
    this.maxValue = this.isInverted ? relativeCanvasMin : relativeCanvasMax;
    this.flipMinMax();
  }

  private get borderSize(): number { return Math.min(C.PICKABLE_BORDER_SIZE, this.canvasLength / 3) }

  private translateOnAxis(translation: number): void {
    this.canvasMin = this.lastCanvasValues.x + translation;
    this.canvasMax = this.lastCanvasValues.y + translation;
  }

  public mouseDown(mouseDown: Vertex): void {
    super.mouseDown(mouseDown);
    const mouseAxis = this.isVertical ? mouseDown.y : mouseDown.x;
    this.isClicked = true;
    if (Math.abs(mouseAxis - this.canvasMin) <= this.borderSize) this.minUpdate = true;
    else if (Math.abs(mouseAxis - this.canvasMax) <= this.borderSize) this.maxUpdate = true;
    else this.lastCanvasValues = new Vertex(this.canvasMin, this.canvasMax);
  }

  private mouseMoveWhileClicked(mouseCoords: Vertex): void {
    const currentCoord = this.isVertical ? mouseCoords.y : mouseCoords.x;
    const downCoord = this.isVertical ? this.mouseClick.y : this.mouseClick.x;
    if (this.minUpdate) this.canvasMin = currentCoord;
    else if (this.maxUpdate) this.canvasMax = currentCoord;
    else this.translateOnAxis(currentCoord - downCoord);
  }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex) {
    super.mouseMove(context, mouseCoords);
    if (this.isClicked) this.mouseMoveWhileClicked(mouseCoords);
  }

  public mouseUp(keepState: boolean): void {
    super.mouseUp(false);
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
    this.dashLine = C.DASH_SELECTION_WINDOW;
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
    this.saveMinMaxVertices();
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

  private get borderSizeX(): number { return Math.min(C.PICKABLE_BORDER_SIZE / Math.abs(this._scale.x), Math.abs(this.size.x) / 3) }

  private get borderSizeY(): number { return Math.min(C.PICKABLE_BORDER_SIZE / Math.abs(this._scale.y), Math.abs(this.size.y) / 3) }

  private saveMinMaxVertices(): void {
    this._previousMin = this.minVertex.copy();
    this._previousMax = this.maxVertex.copy();
  }

  public updateScale(scaleX: number, scaleY: number): void {
    this._scale.x = scaleX;
    this._scale.y = scaleY;
  }

  private setUpdateState(): void {
    this.isClicked = true;
    this.leftUpdate = Math.abs(this.mouseClick.x - this.minVertex.x) <= this.borderSizeX;
    this.rightUpdate = Math.abs(this.mouseClick.x - this.maxVertex.x) <= this.borderSizeX;
    this.downUpdate = Math.abs(this.mouseClick.y - this.minVertex.y) <= this.borderSizeY;
    this.upUpdate = Math.abs(this.mouseClick.y - this.maxVertex.y) <= this.borderSizeY;
  }

  public mouseDown(mouseDown: Vertex): void {
    super.mouseDown(mouseDown);
    if (this.isHovered) {
      this.saveMinMaxVertices();
      this.setUpdateState();
    }
  }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void {
    super.mouseMove(context, mouseCoords);
    if (!(this.leftUpdate || this.rightUpdate || this.downUpdate || this.upUpdate) && this.isClicked) {
      const translation = mouseCoords.subtract(this.mouseClick);
      this.minVertex = this._previousMin.add(translation);
      this.maxVertex = this._previousMax.add(translation);
    }
    this.mouseUpdate(mouseCoords);
  }

  private mouseUpdate(mouseCoords: Vertex): void {
    if (this.leftUpdate) this.minVertex.x = Math.min(this._previousMax.x, mouseCoords.x);
    if (this.rightUpdate) this.maxVertex.x = Math.max(this._previousMin.x, mouseCoords.x);
    if (this.downUpdate) this.minVertex.y = Math.min(this._previousMax.y, mouseCoords.y);
    if (this.upUpdate) this.maxVertex.y = Math.max(this._previousMin.y, mouseCoords.y);
    if (this.isClicked) this.mouseFlip(mouseCoords);
  }

  private mouseFlip(mouseCoords: Vertex): void {
    if (this.minVertex.x == this._previousMax.x) this.maxVertex.x = mouseCoords.x;
    if (this.maxVertex.x == this._previousMin.x) this.minVertex.x = mouseCoords.x;
    if (this.minVertex.y == this._previousMax.y) this.maxVertex.y = mouseCoords.y;
    if (this.maxVertex.y == this._previousMin.y) this.minVertex.y = mouseCoords.y;
  }

  public mouseUp(keepState: boolean) {
    super.mouseUp(keepState);
    this.isClicked = this.leftUpdate = this.rightUpdate = this.upUpdate = this.downUpdate = false;
  }
}
