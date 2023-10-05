""" Examples for drawing primitives (simple shapes). """
import math
import plot_data
import plot_data.colors as colors

# ============================================= STYLES =================================================================
# Edge styles
edge_style_red = plot_data.EdgeStyle(line_width=3, color_stroke=colors.RED, dashline=[5, 2])
edge_style_blue = plot_data.EdgeStyle(line_width=1, color_stroke=colors.BLUE, dashline=[20, 10])
edge_style_purple = plot_data.EdgeStyle(line_width=2, color_stroke=colors.PURPLE)

# Surface styles
hatching = plot_data.HatchingSet(1, 10)
surface_style_green = plot_data.SurfaceStyle(color_fill=colors.LIGHTGREEN, opacity=0.8, hatching=hatching)
surface_style_yellow = plot_data.SurfaceStyle(color_fill=colors.YELLOW, hatching=hatching)


# ============================================= POINTS =================================================================
# Symmetric shapes
cross = plot_data.Point2D(0, 0, plot_data.PointStyle(color_stroke=colors.ORANGE, stroke_width=5, shape="cross", size = 20))
circle = plot_data.Point2D(5, 0, plot_data.PointStyle(color_fill=colors.ORANGE, color_stroke=colors.BLACK, stroke_width=2, shape="circle", size = 20))
square = plot_data.Point2D(10, 0, plot_data.PointStyle(color_fill=colors.PINK, color_stroke=colors.PURPLE, stroke_width=3, shape="square", size = 20))
mark = plot_data.Point2D(15, 0, plot_data.PointStyle(color_stroke=colors.BLUE, stroke_width=3, shape="mark", size = 20))

## Triangles
up_triangle = plot_data.Point2D(0, 5, plot_data.PointStyle(color_fill=colors.RED, color_stroke=colors.DARK_PURPLE, stroke_width=4, shape="triangle", orientation="up", size = 20))
down_triangle = plot_data.Point2D(5, 5, plot_data.PointStyle(color_fill=colors.YELLOW, color_stroke=colors.EMPIRE_YELLOW, stroke_width=4, shape="triangle", orientation="down", size = 20))
left_triangle = plot_data.Point2D(10, 5, plot_data.PointStyle(color_fill=colors.GREEN, color_stroke=colors.EMERALD, stroke_width=4, shape="triangle", orientation="left", size = 20))
right_triangle = plot_data.Point2D(15, 5, plot_data.PointStyle(color_fill=colors.BLUE, color_stroke=colors.DARK_BLUE, stroke_width=4, shape="triangle", orientation="right", size = 20))

## Half Lines
up_halfline = plot_data.Point2D(0, 10, plot_data.PointStyle(color_stroke=colors.PINK, stroke_width=4, shape="halfline", orientation="up", size = 20))
down_halfline = plot_data.Point2D(5, 10, plot_data.PointStyle(color_stroke=colors.PURPLE, stroke_width=4, shape="halfline", orientation="down", size = 20))
left_halfline = plot_data.Point2D(10, 10, plot_data.PointStyle(color_stroke=colors.ORANGE, stroke_width=4, shape="halfline", orientation="left", size = 20))
right_halfline = plot_data.Point2D(15, 10, plot_data.PointStyle(color_stroke=colors.BLACK, stroke_width=4, shape="halfline", orientation="right", size = 20))

## Lines
vline = plot_data.Point2D(0, 15, plot_data.PointStyle(color_stroke=colors.LIGHTBLUE, stroke_width=2, shape="line", orientation="vertical", size = 20))
hline = plot_data.Point2D(5, 15, plot_data.PointStyle(color_stroke=colors.LIGHTPURPLE, stroke_width=2, shape="line", orientation="horizontal", size = 20))
slash = plot_data.Point2D(10, 15, plot_data.PointStyle(color_stroke=colors.ANGEL_BLUE, stroke_width=2, shape="line", orientation="slash", size = 20))
backslash = plot_data.Point2D(15, 15, plot_data.PointStyle(color_stroke=colors.BRIGHT_LIME_GREEN, stroke_width=2, shape="line", orientation="backslash", size = 20))

points = [cross, circle, square, mark,
          up_triangle, down_triangle, left_triangle, right_triangle,
          up_halfline, down_halfline, left_halfline, right_halfline,
          vline, hline, slash, backslash]

# ============================================= SHAPES =================================================================
# Lines
line_segment = plot_data.LineSegment2D(point1=[-22, -5], point2=[-12, 15], edge_style=edge_style_blue)
line_2d = plot_data.Line2D(point1=[-30, -10], point2=[-25, 10], edge_style=edge_style_red)

# Arcs
circle = plot_data.Circle2D(cx=25, cy=10, r=5, edge_style=edge_style_red, surface_style=surface_style_yellow, tooltip="It's a circle")
arc = plot_data.Arc2D(cx=36, cy=10, r=5, start_angle=math.pi/4, end_angle=2*math.pi/3, edge_style=edge_style_red, clockwise=True)
arc_anti = plot_data.Arc2D(cx=36, cy=10, r=5, start_angle=math.pi/4, end_angle=2*math.pi/3, edge_style=edge_style_blue, clockwise=False)

# Contours
polygon_lines_closed = [plot_data.LineSegment2D([0, 20], [5, 21]),
                        plot_data.LineSegment2D([5, 21], [7, 23]),
                        plot_data.LineSegment2D([7, 23], [15, 25]),
                        plot_data.LineSegment2D([15, 25], [30, 30]),
                        plot_data.LineSegment2D([30, 30], [20, 27]),
                        plot_data.LineSegment2D([20, 27], [10, 30]),
                        plot_data.LineSegment2D([10, 30], [5, 22]),
                        plot_data.LineSegment2D([5, 22], [0, 20])]

polygon_lines_open = [plot_data.LineSegment2D([0, 32], [5, 33]),
                      plot_data.Arc2D(cx=6, cy=33, r=1, start_angle=math.pi, end_angle=math.pi/2, clockwise=True),
                      plot_data.LineSegment2D([6, 34], [7, 40]),
                      plot_data.LineSegment2D([7, 40], [15, 43]),
                      plot_data.LineSegment2D([15, 43], [30, 40]),
                      plot_data.LineSegment2D([30, 40], [20, 38]),
                      plot_data.LineSegment2D([20, 38], [10, 32]),
                      plot_data.LineSegment2D([10, 32], [5, 31]),
                      plot_data.LineSegment2D([5, 31], [0, 30])]

contour_filled = plot_data.Contour2D(plot_data_primitives=polygon_lines_closed, edge_style=edge_style_blue,
                                     surface_style=surface_style_green, tooltip="It's not a square but it is filled.")

contour_empty = plot_data.Contour2D(plot_data_primitives=polygon_lines_open, edge_style=edge_style_purple,
                                     tooltip="It's not a square and it is open so it is not filled.")

# Wire
wire = plot_data.Wire([[-2, -5], [-1, 37], [15, 45], [40, 45], [42, -5]], tooltip="It is a wire",
                      edge_style=edge_style_blue)

shapes = [line_segment, line_2d, arc, arc_anti, circle, contour_filled, contour_empty, wire]

# rectangle
# triangle



# Creating several primitives. plot_data() functions are used to convert
# a volmdlr object into a plot_data object



# Circle


text_unscaled = plot_data.Text(comment='Dessia', position_x=20, position_y=0, text_scaling=False,
                               text_style=plot_data.TextStyle(text_color=colors.RED, font_size=12, font_style='sans-serif'))
text_scaled = plot_data.Text(comment='Dessia', position_x=23, position_y=20, text_scaling=True, max_width=25, height=5,
                             text_style=plot_data.TextStyle(text_color=colors.YELLOW, font_size=12, text_align_y="bottom"))
texts = [text_scaled, text_unscaled]

# Label
# This label is created with minimum information
label1 = plot_data.Label(title='label1')

# This label is created using all customizations
fill1 = plot_data.SurfaceStyle(color_fill=colors.RED, opacity=0.5)
edge1 = plot_data.EdgeStyle(line_width=5, color_stroke=colors.BLUE, dashline=[5, 5])
text_style = plot_data.TextStyle(text_color=colors.ORANGE, font_size=14, italic=True, bold=True)
label2 = plot_data.Label(title='label2', text_style=text_style, rectangle_surface_style=fill1,
                         rectangle_edge_style=edge1)

labels = plot_data.MultipleLabels(labels=[label1, label2])


primitives = points + shapes + texts + [label1]

primitive_group = plot_data.PrimitiveGroup(primitives=primitives)
# plot_data.plot_canvas(primitive_group, debug_mode=True)
