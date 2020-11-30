import plot_data.core as core
import random
import volmdlr as vm
import volmdlr.wires
import volmdlr.edges
import numpy as npy
from script.Canvas_tests.colors import *

shape = 'circle'
size = 2
stroke_width = 1  # Points' stroke width
# ParallelPlot
to_disp_attributes = ['cx', 'cy', 'color_fill', 'color_stroke']
line_color = black
line_width = 0.5
disposition = 'vertical'
plot_datas = []
objects = []
points = []

color_fills = [violet, blue, green, red, yellow, cyan, rose]
color_strokes = [black, brown, green, red, orange, lightblue, grey]
for i in range(50):
    cx = random.uniform(0,2)
    cy = random.uniform(0,1)
    random_color_fill = color_fills[random.randint(0,len(color_fills)-1)]
    random_color_stroke = color_strokes[random.randint(0,len(color_strokes) - 1)]
    point = core.Point2D(cx=cx, cy=cy, size=size, shape=shape, color_fill=random_color_fill, color_stroke=random_color_stroke, stroke_width=stroke_width)
    points += [point]

rgbs = [[42, 45, 227], [188, 255, 153], [148, 213, 243]]
parallel_plot = core.ParallelPlot(line_color=line_color, line_width=line_width, disposition=disposition, to_disp_attributes=to_disp_attributes, rgbs=rgbs)
objects.append(parallel_plot)
parallel_plot1 = core.ParallelPlot(line_color=line_color, line_width=line_width, disposition=disposition, to_disp_attributes=['color_fill', 'cx'], rgbs=rgbs)
objects.append(parallel_plot1)

#Axis data
nb_points_x = 10
nb_points_y = 10
font_size = 12
graduation_color = grey
axis_color = grey
axis_width = 0.5
arrow_on = False
grid_on = True

# Tooltip
tp_colorfill = black
text_color = white
tl_fontsize = 12  # Font family : Arial, Helvetica, serif, sans-serif, Verdana, Times New Roman, Courier New
tl_fontstyle = 'sans-serif'
tp_radius = 5
opacity = 0.75

#Scatter
sc_color_fill = lightblue
sc_color_stroke = grey
sc_stroke_width = 0.5

axis = core.Axis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                              font_size=font_size,
                              graduation_color=graduation_color,
                              axis_color=axis_color, arrow_on=arrow_on,
                              axis_width=axis_width, grid_on=grid_on)

to_disp_att_names = ['cx', 'cy']
tooltip = core.Tooltip(colorfill=tp_colorfill, text_color=text_color, fontstyle=tl_fontstyle, fontsize=tl_fontsize,
                     tp_radius=tp_radius, to_plot_list=to_disp_att_names, opacity=opacity)

ScatterPlot = core.Scatter(axis=axis, tooltip=tooltip, to_display_att_names=to_disp_att_names, point_shape=shape, point_size=size, color_fill=sc_color_fill, color_stroke=sc_color_stroke, stroke_width=0.5)
objects.append(ScatterPlot)

ScatterPlot1 = core.Scatter(axis=axis, tooltip=tooltip, to_display_att_names=['cx', 'color_fill'], point_shape=shape, point_size=size, color_fill=sc_color_fill, color_stroke=sc_color_stroke, stroke_width=0.5)
objects.append(ScatterPlot1)

ScatterPlot2 = core.Scatter(axis=axis, tooltip=tooltip, to_display_att_names=['cy', 'color_stroke'], point_shape=shape, point_size=size, color_fill=sc_color_fill, color_stroke=sc_color_stroke, stroke_width=0.5)
objects.append(ScatterPlot2)

hatching = core.HatchingSet(1)
plot_data_state = core.Settings(name='name', hatching=hatching, stroke_width=1)

#Contour
size = 1
pt1 = vm.Point2D(0, 0)
pt2 = vm.Point2D(0, size)
pt3 = vm.Point2D(size, size)
pt4 = vm.Point2D(size, 0)
c1 = vm.wires.Contour2D([vm.edges.LineSegment2D(pt1, pt2),
                         vm.edges.LineSegment2D(pt2, pt3),
                         vm.edges.LineSegment2D(pt3, pt4),
                         vm.edges.LineSegment2D(pt4, pt1)])
d = c1.plot_data(plot_data_states=[plot_data_state])
objects.append(d)

coords = [[0, 600], [300, 0], [0,0], [300, 300], [500, 500], [1000,0]]
sizes = [core.Window(width=560, height=300),
         core.Window(width=560, height=300),
         core.Window(width=560, height=300),
         core.Window(width=560, height=300),
         core.Window(width=560, height=300),
         core.Window(width=560, height=300)]

multipleplots = core.MultiplePlots(points=points, objects=objects, sizes=sizes, coords=coords)


sol = [multipleplots.to_dict()]

core.plot_canvas(sol, 'multiplot', 'canvas', debug_mode=True)