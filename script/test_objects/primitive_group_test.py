# An example of primitive_group instantiation.
# primitive_group: an object that contains multiple primitives. A primitive
# is either a Circle2D, a LineSegment, a Contour2D, an Arc2D or a Text

import plot_data
import numpy as npy
import volmdlr as vm  # You can install volmdlr using pip in plot_data's package
import volmdlr.edges
import volmdlr.wires
from plot_data.colors import *


# defining a couple style objects
    # edges customization
edge_style = plot_data.EdgeStyle(line_width=1, color_stroke=RED, dashline=[])
    # surfaces customization
hatching = plot_data.HatchingSet(0.5, 3)
surface_style = plot_data.SurfaceStyle(color_fill=WHITE, opacity=1,
                                       hatching=hatching)


# Creating several primitives. plot_data() functions are used to convert
# a volmdlr object into a plot_data object

# arc
p0 = vm.Point2D(-1, 0)
p1 = vm.Point2D(-npy.cos(npy.pi / 4), npy.sin(npy.pi / 4))
p2 = vm.Point2D(0, 1)

arc = vm.edges.Arc2D(p2, p1, p0)
plot_data_arc = arc.plot_data(edge_style=edge_style)


# square contour
rectangle_size = 1
pt1 = vm.Point2D(0, 0)
pt2 = vm.Point2D(0, rectangle_size)
pt3 = vm.Point2D(rectangle_size, rectangle_size)
pt4 = vm.Point2D(rectangle_size, 0)
contour1 = vm.wires.Contour2D([vm.edges.LineSegment2D(pt1, pt2),
                               vm.edges.LineSegment2D(pt2, pt3),
                               vm.edges.LineSegment2D(pt3, pt4),
                               vm.edges.LineSegment2D(pt4, pt1)])

plot_data_contour = contour1.plot_data(edge_style=edge_style,
                                       surface_style=surface_style)


# LineSegment2D
plot_data_line = vm.edges.LineSegment2D(vm.Point2D(2, 2),
                                        vm.Point2D(3, 3)).plot_data(edge_style)


# Circle
circle_edge_style = plot_data.EdgeStyle(1, RED)
circle_surface_style = plot_data.SurfaceStyle(color_fill=YELLOW, opacity=0.5,
                                              hatching=plot_data.HatchingSet())

circle = vm.wires.Circle2D(vm.Point2D(5, 9), 5)
plot_data_circle = circle.plot_data(edge_style=circle_edge_style,
                                    surface_style=circle_surface_style)


# Text
text = plot_data.Text(comment='Hello', position_x=6, position_y=9,
                      text_style=plot_data.TextStyle(text_color=RED,
                                                     font_size=12,
                                                     font_style='sans-serif')
                      )

# Label
  # This label is created with minimum information
label1 = plot_data.Label(title='label1')

  # This label is created using all customizations
fill1 = plot_data.SurfaceStyle(color_fill=RED, opacity=0.5)
edge1 = plot_data.EdgeStyle(line_width=1, color_stroke=BLUE, dashline=[5, 5])
text_style = plot_data.TextStyle(text_color=ORANGE, font_size=14, italic=True, bold=True)
label2 = plot_data.Label(title='label2', text_style=text_style, rectangle_surface_style=fill1,
                         rectangle_edge_style=edge1)

labels = plot_data.MultipleLabels(labels=[label1, label2])

primitives = [plot_data_contour, plot_data_line, plot_data_arc,
              plot_data_circle, text, labels]
primitive_group = plot_data.PrimitiveGroup(primitives=primitives)
