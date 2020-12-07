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
points = []

# Defining the contour
hatching = plot_data.HatchingSet(1)
plot_data_state = plot_data.Settings(name='name', hatching=hatching, stroke_width=1)

contour_size = 1
pt1 = vm.Point2D(0, 0)
pt2 = vm.Point2D(0, contour_size)
pt3 = vm.Point2D(contour_size, contour_size)
pt4 = vm.Point2D(contour_size, 0)
c1 = vm.wires.Contour2D([vm.edges.LineSegment2D(pt1, pt2),
                         vm.edges.LineSegment2D(pt2, pt3),
                         vm.edges.LineSegment2D(pt3, pt4),
                         vm.edges.LineSegment2D(pt4, pt1)])

d = c1.plot_data(plot_data_states=[plot_data_state])
primitive_group = plot_data.PrimitiveGroup(contours=[d])
objects.append(primitive_group)
# End contour

color_fills = [VIOLET, BLUE, GREEN, RED, YELLOW, CYAN, ROSE]
color_strokes = [BLACK, BROWN, GREEN, RED, ORANGE, LIGHTBLUE, GREY]
for i in range(50):
    cx = random.uniform(0,2)
    cy = random.uniform(0,1)
    fills_index = random.randint(0, len(color_fills) - 1)
    strokes_index = random.randint(0, len(color_strokes) - 1)
    random_color_fill = color_fills[fills_index]
    random_color_stroke = color_strokes[strokes_index]
    point = plot_data.Point2D(cx=cx, cy=cy, size=size, shape=shape,
                              color_fill=random_color_fill,
                              color_stroke=random_color_stroke,
                              stroke_width=stroke_width)
    points += [point]

rgbs = [[192, 11, 11], [14, 192, 11], [11, 11, 192]]
parallel_plot = plot_data.ParallelPlot(line_color=line_color,
                                       line_width=line_width,
                                       disposition=disposition,
                                       to_disp_attributes=to_disp_attributes,
                                       rgbs=rgbs)
objects.append(parallel_plot)
parallel_plot1 = plot_data.ParallelPlot(line_color=line_color,
                                        line_width=line_width,
                                        disposition=disposition,
                                        to_disp_attributes=['color_fill', 'cx'],
                                        rgbs=rgbs)
objects.append(parallel_plot1)

# Tooltip
tp_colorfill = BLACK
text_color = WHITE
tl_fontsize = 12  # Font family : Arial, Helvetica, serif, sans-serif, Verdana, Times New Roman, Courier New
tl_fontstyle = 'sans-serif'
tp_radius = 5
opacity = 0.75

# Scatter
sc_color_fill = LIGHTBLUE
sc_color_stroke = GREY
sc_stroke_width = 0.5

to_disp_att_names = ['cx', 'cy']
tooltip = plot_data.Tooltip(to_plot_list=to_disp_att_names)

scatterPlot = plot_data.Scatter(tooltip=tooltip,
                                to_display_att_names=to_disp_att_names,
                                point_shape=shape, point_size=size,
                                color_fill=sc_color_fill,
                                color_stroke=sc_color_stroke, stroke_width=0.5)
objects.append(scatterPlot)

scatterPlot1 = plot_data.Scatter(tooltip=tooltip,
                                 to_display_att_names=['cx', 'color_fill'],
                                 point_shape=shape, point_size=size,
                                 color_fill=sc_color_fill,
                                 color_stroke=sc_color_stroke,
                                 stroke_width=0.5)
objects.append(scatterPlot1)

scatterPlot2 = plot_data.Scatter(tooltip=tooltip,
                                 to_display_att_names=['cy', 'color_stroke'],
                                 point_shape=shape, point_size=size,
                                 color_fill=sc_color_fill,
                                 color_stroke=sc_color_stroke,
                                 stroke_width=0.5)
objects.append(scatterPlot2)

coords = [(600, 600), (300, 0), (0, 0), (300, 300), (500, 500), (1000, 0)]
sizes = [plot_data.Window(width=560, height=300),
         plot_data.Window(width=560, height=300),
         plot_data.Window(width=560, height=300),
         plot_data.Window(width=560, height=300),
         plot_data.Window(width=560, height=300),
         plot_data.Window(width=560, height=300)]

multipleplots = plot_data.MultiplePlots(points=points, objects=objects,
                                        sizes=sizes, coords=coords)

plot_data.plot_canvas(plot_data_object=multipleplots, debug_mode=True)
