""" Examples for drawing primitives (simple shapes). """
import math
import plot_data
import plot_data.colors as colors

# ============================================= STYLES =================================================================
# Edge styles
edge_style_dashed = plot_data.EdgeStyle(line_width=2, color_stroke=colors.BLACK, dashline=[5, 5])
edge_style_red = plot_data.EdgeStyle(line_width=3, color_stroke=colors.RED, dashline=[5, 2])
edge_style_blue = plot_data.EdgeStyle(line_width=1, color_stroke=colors.BLUE, dashline=[7, 6])
edge_style_blue_plain = plot_data.EdgeStyle(line_width=1, color_stroke=colors.BLUE)
edge_style_purple = plot_data.EdgeStyle(line_width=1, color_stroke=colors.PURPLE, dashline=[12, 6])
edge_style_purple_plain = plot_data.EdgeStyle(line_width=2, color_stroke=colors.PURPLE)
edge_style_black = plot_data.EdgeStyle(line_width=3, color_stroke=colors.BLACK)

# Surface styles
hatching = plot_data.HatchingSet(1, 10)
surface_style_empty = plot_data.SurfaceStyle(opacity=0)
surface_style_green = plot_data.SurfaceStyle(color_fill=colors.LIGHTGREEN, opacity=0.8, hatching=hatching)
surface_style_yellow = plot_data.SurfaceStyle(color_fill=colors.YELLOW, hatching=hatching)

# Text Styles
title_style = plot_data.TextStyle(font_size=2, text_align_y="bottom", bold=True)

# ============================================= POINTS =================================================================
# Symmetric shapes
points_text = plot_data.Text(comment="Points: ", text_scaling=True, position_x=50, position_y=21.2, text_style=title_style)
round_rect = plot_data.RoundRectangle(50, 0, 21, 21, 1, edge_style=edge_style_dashed, surface_style=surface_style_empty)
cross = plot_data.Point2D(53, 3, plot_data.PointStyle(color_stroke=colors.ORANGE, stroke_width=5, shape="cross", size = 20), tooltip="cross")
circle = plot_data.Point2D(58, 3, plot_data.PointStyle(color_fill=colors.ORANGE, color_stroke=colors.BLACK, stroke_width=2, shape="circle", size = 20), tooltip="circle")
square = plot_data.Point2D(63, 3, plot_data.PointStyle(color_fill=colors.PINK, color_stroke=colors.PURPLE, stroke_width=3, shape="square", size = 20), tooltip="square")
mark = plot_data.Point2D(68, 3, plot_data.PointStyle(color_stroke=colors.BLUE, stroke_width=3, shape="mark", size = 20), tooltip="mark")

## Triangles
up_triangle = plot_data.Point2D(53, 8, plot_data.PointStyle(color_fill=colors.RED, color_stroke=colors.DARK_PURPLE, stroke_width=4, shape="triangle", orientation="up", size = 20), tooltip="triangle_up")
down_triangle = plot_data.Point2D(58, 8, plot_data.PointStyle(color_fill=colors.YELLOW, color_stroke=colors.EMPIRE_YELLOW, stroke_width=4, shape="triangle", orientation="down", size = 20), tooltip="triangle_down")
left_triangle = plot_data.Point2D(63, 8, plot_data.PointStyle(color_fill=colors.GREEN, color_stroke=colors.EMERALD, stroke_width=4, shape="triangle", orientation="left", size = 20), tooltip="triangle_left")
right_triangle = plot_data.Point2D(68, 8, plot_data.PointStyle(color_fill=colors.BLUE, color_stroke=colors.DARK_BLUE, stroke_width=4, shape="triangle", orientation="right", size = 20), tooltip="triangle_right")

## Half Lines
up_halfline = plot_data.Point2D(53, 13, plot_data.PointStyle(color_stroke=colors.PINK, stroke_width=4, shape="halfline", orientation="up", size = 20), tooltip="halfline_up")
down_halfline = plot_data.Point2D(58, 13, plot_data.PointStyle(color_stroke=colors.PURPLE, stroke_width=4, shape="halfline", orientation="down", size = 20), tooltip="halfline_down")
left_halfline = plot_data.Point2D(63, 13, plot_data.PointStyle(color_stroke=colors.ORANGE, stroke_width=4, shape="halfline", orientation="left", size = 20), tooltip="halfline_left")
right_halfline = plot_data.Point2D(68, 13, plot_data.PointStyle(color_stroke=colors.BLACK, stroke_width=4, shape="halfline", orientation="right", size = 20), tooltip="halfline_right")

## Lines
vline = plot_data.Point2D(53, 18, plot_data.PointStyle(color_stroke=colors.LIGHTBLUE, stroke_width=2, shape="line", orientation="vertical", size = 20), tooltip="vertical")
hline = plot_data.Point2D(58, 18, plot_data.PointStyle(color_stroke=colors.LIGHTPURPLE, stroke_width=2, shape="line", orientation="horizontal", size = 20), tooltip="horizontal")
slash = plot_data.Point2D(63, 18, plot_data.PointStyle(color_stroke=colors.ANGEL_BLUE, stroke_width=2, shape="line", orientation="slash", size = 20), tooltip="slash")
backslash = plot_data.Point2D(68, 18, plot_data.PointStyle(color_stroke=colors.BRIGHT_LIME_GREEN, stroke_width=2, shape="line", orientation="backslash", size = 20), tooltip="backslash")

points = [cross, circle, square, mark,
          up_triangle, down_triangle, left_triangle, right_triangle,
          up_halfline, down_halfline, left_halfline, right_halfline,
          vline, hline, slash, backslash]

# ============================================= SHAPES =================================================================
# Lines
line_2d = plot_data.Line2D(point1=[-40, 24.5], point2=[72, 24.5], edge_style=edge_style_purple, tooltip="line2d")
round_rect_shapes = plot_data.RoundRectangle(74, 0, 60, 37, 1, edge_style=edge_style_dashed, surface_style=surface_style_empty, tooltip="round_rect")
points_text_shapes = plot_data.Text(comment="Shapes: ", text_scaling=True, position_x=74, position_y=37.2, text_style=title_style)

# Arcs
circle = plot_data.Circle2D(cx=81, cy=10.5, r=5, edge_style=edge_style_red, surface_style=surface_style_yellow, tooltip="It's a circle", interactive=False)
arc = plot_data.Arc2D(cx=93, cy=10.5, r=5, start_angle=math.pi/4, end_angle=2*math.pi/3, edge_style=edge_style_red, clockwise=True, tooltip="arc2d")
arc_anti = plot_data.Arc2D(cx=93, cy=10.5, r=5, start_angle=math.pi/4, end_angle=2*math.pi/3, edge_style=edge_style_blue, clockwise=False, tooltip="arc2d_anticlockwise")
line_segment_1 = plot_data.LineSegment2D(point1=[100, 1], point2=[103, 20], edge_style=edge_style_black, tooltip="linesegment", interactive=False)
line_segment_2 = plot_data.LineSegment2D(point1=[125, 20], point2=[128, 1], edge_style=edge_style_black, tooltip="linesegment")
rectangle = plot_data.Rectangle(107, 26, 25, 9, surface_style=surface_style_green, edge_style=edge_style_red, tooltip="rectangle", interactive=False)

# Contours
star_lines_closed = [plot_data.LineSegment2D([107, 1.5], [110, 8.5]),
                        plot_data.LineSegment2D([110, 8.5], [105, 11.5]),
                        plot_data.LineSegment2D([105, 11.5], [112, 11.5]),
                        plot_data.LineSegment2D([112, 11.5], [114, 18.5]),
                        plot_data.LineSegment2D([114, 18.5], [116, 11.5]),
                        plot_data.LineSegment2D([116, 11.5], [123, 11.5]),
                        plot_data.LineSegment2D([123, 11.5], [118, 8.5]),
                        plot_data.LineSegment2D([118, 8.5], [121, 1.5]),
                        plot_data.LineSegment2D([121, 1.5], [114, 5.5]),
                        plot_data.LineSegment2D([114, 5.5], [107, 1.5])]

polygon_lines_open = [plot_data.LineSegment2D([101, 26], [97, 33]),
                      plot_data.Arc2D(cx=99, cy=33, r=2, start_angle=math.pi, end_angle=0, clockwise=True),
                      plot_data.Arc2D(cx=103, cy=33, r=2, start_angle=math.pi, end_angle=0, clockwise=True),
                      plot_data.LineSegment2D([105, 33], [101, 26])]

contour_filled = plot_data.Contour2D(plot_data_primitives=star_lines_closed, edge_style=edge_style_blue,
                                     surface_style=surface_style_green,
                                     tooltip="It looks like a green star but it is a contour.",
                                     interactive=False)
contour_empty = plot_data.Contour2D(plot_data_primitives=polygon_lines_open, edge_style=edge_style_purple_plain,
                                     tooltip="It is a Contour with no filling.")

# Wire
wire = plot_data.Wire([[75, 35], [78, 26], [79, 30], [80, 26], [83, 35], [84, 35], [84, 26], [85, 26],
                       [85, 35], [90, 35], [85, 30], [90, 26], [94, 26], [91, 26], [91, 30.5], [93, 30.5],
                       [91, 30.5], [91, 35], [94, 35]], tooltip="It is a wire",
                      edge_style=edge_style_blue_plain)

shapes = [line_segment_1, line_segment_2, line_2d, arc, arc_anti, circle, contour_filled, contour_empty, wire,
          round_rect, points_text, round_rect_shapes, points_text_shapes, rectangle]


# ============================================= LABELS =================================================================
primitives = points + shapes
labels = []
for primitive in primitives:
    labels.append(plot_data.Label(title=type(primitive).__name__, shape=primitive))
primitives += labels

# ============================================= TEXTS =================================================================
text_unscaled = plot_data.Text(comment='This text never changes its size because text_scaling is False.', position_x=36,
                               position_y=28, text_scaling=False, text_style=plot_data.TextStyle(font_size=16, text_align_y="top"))
text_scaled = plot_data.Text(comment='Dessia', position_x=36, position_y=29, text_scaling=True, max_width=30, multi_lines=False,
                             text_style=plot_data.TextStyle(text_color=colors.LIGHTBLUE, text_align_y="bottom", bold=True))
texts = [text_scaled, text_unscaled]
primitives += texts

# This label is created with minimum information

# This label is created using all customizations
edge1 = plot_data.EdgeStyle(line_width=1, color_stroke=colors.BLUE, dashline=[5, 5])
text_style = plot_data.TextStyle(text_color=colors.ORANGE, italic=True, bold=True)
label_custo_1 = plot_data.Label(title='Extra Label 1', text_style=text_style, rectangle_surface_style=surface_style_green,
                         rectangle_edge_style=edge1)
label_custo_2 = plot_data.Label(title='Extra Label 2 with quite long text that should totally be written ',
                                shape=contour_empty)

# labels = plot_data.MultipleLabels(labels=[label_custo_1, label_custo_2])
primitives += [label_custo_1, label_custo_2]
primitive_group = plot_data.PrimitiveGroup(primitives=primitives)
# plot_data.plot_canvas(primitive_group, local=True)
