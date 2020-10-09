import plot_data as vm
from plot_data import plot_data
import random
import numpy as np

# Point test ####

# PARAMETERS #
# Window size
width = 2
height = 1

# Shape set (circle, square, crux)
shape = 'circle'

# Point size (1 to 4)
size = 2

# Points' color
colorfill = 'lightblue'
colorstroke = 'grey'

# PlotDataState
surface_color = 'black'
strokewidth = 0.5  # Points' stroke width

# Scatter plot
nb_points_x = 10
nb_points_y = 10
font_size = 12
graduation_color = 'grey'
axis_color = 'grey'
axis_width = 0.5
arrow_on = False
grid_on = True

# Tooltip
tp_colorfill = 'black'
text_color = 'white'
font = '12px sans-serif'  # Font family : Arial, Helvetica, serif, sans-serif, Verdana, Times New Roman, Courier New
tp_radius = 5
to_plot_list = ['cx', 'cy']

plot_datas = []
point_list = []
window_size = plot_data.WindowSizeSet(width=width, height=height)
shape_set = plot_data.PointShapeSet(shape=shape)
point_size = plot_data.PointSizeSet(size=size)
point_color = plot_data.PointColorSet(color_fill=colorfill,
                                      color_stroke=colorstroke)
plot_data_states = [plot_data.PlotDataState(
        color_surface=plot_data.ColorSurfaceSet(color=surface_color), stroke_width=strokewidth,
        shape_set=shape_set, point_size=point_size, point_color=point_color)]
for i in range(2000):
    cx = random.uniform(0, 2)
    cy = random.uniform(0, 1)
    point = plot_data.PlotDataPoint2D(cx=cx, cy=cy, plot_data_states=plot_data_states)
    point_list += [point]

ScatterPlot = plot_data.PlotDataScatter(point_list, plot_data_states=None)
plot_datas += [ScatterPlot]

axis = plot_data.PlotDataAxis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                              font_size=font_size,
                              graduation_color=graduation_color,
                              axis_color=axis_color, arrow_on=arrow_on,
                              axis_width=axis_width, grid_on=grid_on, plot_data_states=[plot_data.PlotDataState()])
plot_datas += [axis]

tooltip = plot_data.PlotDataTooltip(colorfill=tp_colorfill, text_color=text_color, font=font,
                     tp_radius=tp_radius, to_plot_list=to_plot_list, plot_data_states=[plot_data.PlotDataState()])
plot_datas += [tooltip]

sol = [c.to_dict() for c in plot_datas]
plot_data.plot_d3(sol)