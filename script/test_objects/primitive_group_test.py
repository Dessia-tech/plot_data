# An example of primitive_group instantiation.
# primitive_group: an object that contains multiple primitives. A primitive
# is either a Circle2D, a LineSegment, a Contour2D, an Arc2D or a Text

import numpy as npy

import plot_data
import plot_data.colors as colors

# defining a couple style objects
# edges customization
edge_style = plot_data.EdgeStyle(line_width=1, color_stroke=colors.RED, dashline=[])
# surfaces customization
hatching = plot_data.HatchingSet(0.5, 3)
surface_style = plot_data.SurfaceStyle(color_fill=colors.WHITE, opacity=1,
                                       hatching=hatching)

# Creating several primitives. plot_data() functions are used to convert
# a volmdlr object into a plot_data object

# Point2D
point1 = plot_data.Point2D(0.1, 0.2)

# arc
arc = plot_data.Arc2D(cx=8, cy=0, r=2, start_angle=0, end_angle=npy.pi / 2)

# square contour
rectangle_size = 2
contour = plot_data.Contour2D(plot_data_primitives=[plot_data.LineSegment2D([0, 0], [0, rectangle_size]),
                                                    plot_data.LineSegment2D([0, rectangle_size],
                                                                            [rectangle_size, rectangle_size]),
                                                    plot_data.LineSegment2D([rectangle_size, rectangle_size],
                                                                            [rectangle_size, 0]),
                                                    plot_data.LineSegment2D([rectangle_size, 0], [0, 0])],
                              edge_style=edge_style,
                              surface_style=surface_style,
                              tooltip="It's a square")

# LineSegment2D
line = plot_data.LineSegment2D(point1=[4, 0], point2=[6, 2], edge_style=edge_style)

# Circle
circle_edge_style = plot_data.EdgeStyle(1, colors.RED)
circle_surface_style = plot_data.SurfaceStyle(color_fill=colors.YELLOW, opacity=0.5,
                                              hatching=plot_data.HatchingSet())

circle = plot_data.Circle2D(cx=5, cy=10, r=5, edge_style=circle_edge_style,
                            surface_style=circle_surface_style, tooltip="Circle")

# Text
text = plot_data.Text(comment='Hello', position_x=6, position_y=9, text_scaling=True,
                      text_style=plot_data.TextStyle(text_color=colors.RED,
                                                     font_size=12,
                                                     font_style='sans-serif')
                      )

# Label
# This label is created with minimum information
label1 = plot_data.Label(title='label1')

# This label is created using all customizations
fill1 = plot_data.SurfaceStyle(color_fill=colors.RED, opacity=0.5)
edge1 = plot_data.EdgeStyle(line_width=1, color_stroke=colors.BLUE, dashline=[5, 5])
text_style = plot_data.TextStyle(text_color=colors.ORANGE, font_size=14, italic=True, bold=True)
label2 = plot_data.Label(title='label2', text_style=text_style, rectangle_surface_style=fill1,
                         rectangle_edge_style=edge1)

labels = plot_data.MultipleLabels(labels=[label1, label2])

wire = plot_data.Wire([[15, 0], [15,10], [20,10]], tooltip="It is a wire")

point2 = plot_data.Point2D(15, 10, plot_data.PointStyle(color_fill=colors.ORANGE))

primitives = [point1, contour, line, arc, circle, text, labels, wire, point2]

primitive_group = plot_data.PrimitiveGroup(primitives=primitives)
# plot_data.plot_canvas(primitive_group, debug_mode=True)
