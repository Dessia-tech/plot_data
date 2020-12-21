import plot_data
from plot_data.colors import *
import random
import volmdlr as vm
import volmdlr.wires
import volmdlr.edges

shape = 'circle'
size = 2
stroke_width = 1  # Points' stroke width
# ParallelPlot
to_disp_attributes = ['cx', 'cy', 'color_fill', 'color_stroke']
line_color = BLACK
line_width = 0.5
disposition = 'vertical'
plot_datas = []
objects = []
elements = []

pt1 = vm.Point2D(3,0)
pt2 = vm.Point2D(1,1)
pt3 = vm.Point2D(2,1)
line_edge_style = plot_data.EdgeStyle(line_width=1, color_stroke=ORANGE, dashline=[10,5])
line1 = vm.edges.LineSegment2D(pt1, pt2).plot_data(edge_style=line_edge_style)
line2 = vm.edges.LineSegment2D(pt2, pt3).plot_data(edge_style=line_edge_style)
circle_edge_style = plot_data.EdgeStyle(line_width=0.5, color_stroke=RED)
circle_surface_style = plot_data.SurfaceStyle(color_fill=LIGHTROSE, opacity=1)
circle1 = vm.wires.Circle2D(pt1, 0.1).plot_data(edge_style=circle_edge_style, surface_style=circle_surface_style)
circle2 = vm.wires.Circle2D(pt2, 0.1).plot_data(edge_style=circle_edge_style, surface_style=circle_surface_style)
circle3 = vm.wires.Circle2D(pt3, 0.1).plot_data(edge_style=circle_edge_style, surface_style=circle_surface_style)
text_style = plot_data.TextStyle(text_color=BLACK, font_size=12, font_style='sans-serif')
text = plot_data.Text(comment='Hello Dessia', position_x=3, position_y=0.2, text_style=text_style)
primitives = [line1, line2, circle1, circle2, circle3, text]
primitive_group = plot_data.PrimitiveGroup(primitives=primitives)
objects.append(primitive_group)

# GRAPH TEST
to_disp_attribute_names = ['time', 'electric current']
tooltip = plot_data.Tooltip(to_disp_attribute_names=to_disp_attribute_names)
t = [k for k in range(20)]
I = [k**2 for k in range(20)]
point_style = plot_data.PointStyle(color_fill=RED, color_stroke=BLACK)
edge_style = plot_data.EdgeStyle(color_stroke=BLUE, dashline=[10, 5])
for k in range(len(I)):
    elements.append({'time':t[k], 'electric current':I[k]})
dataset = plot_data.Dataset(elements=elements, name='I = f(t)', tooltip=tooltip, point_style=point_style,
                            edge_style=edge_style)
graphs2d = plot_data.Graph2D(graphs=[dataset], to_disp_attribute_names=to_disp_attribute_names)
objects.append(graphs2d)
# GRAPH TEST END

color_fills = [VIOLET, BLUE, GREEN, RED, YELLOW, CYAN, ROSE]
color_strokes = [BLACK, BROWN, GREEN, RED, ORANGE, LIGHTBLUE, GREY]
for i in range(50):
    cx = random.uniform(0, 2)
    cy = random.uniform(0, 1)
    fills_index = random.randint(0, len(color_fills) - 1)
    strokes_index = random.randint(0, len(color_strokes) - 1)
    random_color_fill = color_fills[fills_index]
    random_color_stroke = color_strokes[strokes_index]
    point = plot_data.Point2D(cx=cx, cy=cy, size=size, shape=shape,
                              color_fill=random_color_fill,
                              color_stroke=random_color_stroke,
                              stroke_width=stroke_width)
    elements += [point]

rgbs = [[192, 11, 11], [14, 192, 11], [11, 11, 192]]
pp_edge_style = plot_data.EdgeStyle(line_width=0.5, color_stroke=BLACK)
parallel_plot = plot_data.ParallelPlot(edge_style=pp_edge_style,
                                       disposition=disposition,
                                       to_disp_attribute_names=to_disp_attributes,
                                       rgbs=rgbs)
objects.append(parallel_plot)
parallel_plot1 = plot_data.ParallelPlot(edge_style=pp_edge_style,
                                        disposition=disposition,
                                        to_disp_attribute_names=['color_fill',
                                                                 'cx'],
                                        rgbs=rgbs)
objects.append(parallel_plot1)

# Scatter

to_disp_attribute_names = ['cx', 'cy']
tooltip = plot_data.Tooltip(to_disp_attribute_names=to_disp_attribute_names)
point_style = plot_data.PointStyle(color_fill=LIGHTBLUE,
                                         color_stroke=GREY)
scatterPlot = plot_data.Scatter(tooltip=tooltip,
                                to_disp_attribute_names=to_disp_attribute_names,
                                point_style=point_style)
objects.append(scatterPlot)

scatterPlot1 = plot_data.Scatter(tooltip=tooltip,
                                 to_disp_attribute_names=['cx', 'color_fill'],
                                 point_style=point_style)
objects.append(scatterPlot1)

scatterPlot2 = plot_data.Scatter(tooltip=tooltip,
                                 to_disp_attribute_names=['cy',
                                                          'color_stroke'],
                                 point_style=point_style)
objects.append(scatterPlot2)

coords = [(600, 600), (300, 0), (0, 0), (300, 300), (500, 500), (1000, 0)]
sizes = [plot_data.Window(width=560, height=300),
         plot_data.Window(width=560, height=300),
         plot_data.Window(width=560, height=300),
         plot_data.Window(width=560, height=300),
         plot_data.Window(width=560, height=300),
         plot_data.Window(width=560, height=300)]

multipleplots = plot_data.MultiplePlots(elements=elements, objects=objects,
                                        sizes=sizes, coords=coords)

plot_data.plot_canvas(plot_data_object=multipleplots, debug_mode=True)
