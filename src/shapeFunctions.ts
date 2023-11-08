import { Vertex, Shape } from "./baseShape"
import { Arc, Circle, Rect, RoundRect, LineSegment, Line, Contour, LineSequence, Point } from "./primitives"
import { Text, Label, Tooltip } from "./shapes"

export function deserialize(data: { [key: string]: any }, scale: Vertex): Shape {
  let shape: Shape;
  if (data.type_ == "circle") shape = Circle.deserialize(data, scale)
  else if (data.type_ == "contour") shape = Contour.deserialize(data, scale);
  else if (data.type_ == "line2d") shape = Line.deserialize(data, scale);
  else if (data.type_ == "linesegment2d") shape = LineSegment.deserialize(data, scale);
  else if (data.type_ == "wire") shape = LineSequence.deserialize(data, scale);
  else if (data.type_ == "point") shape = Point.deserialize(data, scale);
  else if (data.type_ == "arc") shape = Arc.deserialize(data, scale);
  else if (data.type_ == "text") return Text.deserialize(data, scale);
  else if (data.type_ == "label") {
    const labelShape = data.shape ? deserialize(data.shape, scale) : new Rect();
    const fakeLegend = Label.deserialize(data, scale);
    shape = new Label(labelShape, fakeLegend.text);
  }
  else if (data.type_ == "rectangle") shape = Rect.deserialize(data, scale);
  else if (data.type_ == "roundrectangle") shape = RoundRect.deserialize(data, scale);
  else throw new Error(`${data.type_} deserialization is not implemented.`);
  shape.deserializeStyle(data)
  return shape
}

export function initializeTooltip(shape: Shape, context: CanvasRenderingContext2D): Tooltip {
  shape.initTooltipOrigin();
  const tooltip = new Tooltip(shape.tooltipOrigin, shape.tooltipMap, context);
  tooltip.setFlip(shape);
  return tooltip
}

export function styleToLegend(shape: Shape, legendOrigin: Vertex, legendSize: Vertex): Shape {
  if (!shape) return new Rect();
  if (shape instanceof Point) {
    const legend = new Point(legendOrigin.x, legendOrigin.y);
    legend.size = legendSize.y * 0.9;
    legend.marker = shape.marker;
    legend.markerOrientation = shape.markerOrientation;
    return legend
  }
  if (!shape.isFilled) return new LineSegment(legendOrigin.copy(), legendOrigin.add(legendSize))
  return new Rect(legendOrigin.copy(), legendSize);
}