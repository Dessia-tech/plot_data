import plot_data
from plot_data import plot_data
import numpy as np
import json
import os

red = 'rgb(247, 0, 0)'
lightred = 'rgb(237, 128, 128)'
blue = 'rgb(0, 19, 254)'
lightblue = 'rgb(173, 179, 255)'
green = 'rgb(0, 193, 18)'
lightgreen = 'rgb(137, 232, 146)'
yellow = 'rgb(244, 255, 0)'
lightyellow = 'rgb(249, 255, 123)'
orange = 'rgb(255, 135, 0)'
lightorange = 'rgb(255, 175, 96)'
cyan = 'rgb(19, 240, 240)'
lightcyan = 'rgb(144, 247, 247)'
rose = 'rgb(255, 105, 180)'
lightrose = 'rgb(255, 192, 203)'
violet = 'rgb(238, 130, 238)'
lightviolet = 'rgb(234, 165, 246)'
white = 'rgb(255, 255, 255)'
black = 'rgb(0, 0, 0)'
brown = 'rgb(205, 143, 64)'
lightbrown = 'rgb(222, 184, 135)'
grey = 'rgb(169, 169, 169)'
lightgrey = 'rgb(211, 211, 211)'

# PlotDataState
plot_datas = []
surface_color = black
stroke_width = 0.5  # Points' stroke width

# Scatter plot
nb_points_x = 10
nb_points_y = 10
font_size = 12
graduation_color = grey
axis_color = grey
axis_width = 0.5
arrow_on = False
grid_on = True

# Tooltip
colorfill = black
text_color = white
font = '12px sans-serif'  # Font family : Arial, Helvetica, serif, sans-serif, Verdana, Times New Roman, Courier New
tp_radius = 5
to_plot_list = ['cx', 'cy']
opacity = 0.75

# Graph2D
point_list = []
k = 0

dashline=[]
graph_colorstroke = black
graph_linewidth = 0.5
point_colorfill = violet
point_colorstroke = grey
point_strokewidth = 0.5
graph_point_size = 2
point_shape = 'circle'
display_step = 3
shape_set = plot_data.PointShapeSet(shape=point_shape)
point_size = plot_data.PointSizeSet(size=graph_point_size)
point_color = plot_data.PointColorSet(color_fill=point_colorfill, color_stroke=point_colorstroke)
plot_data_states = [plot_data.PlotDataState(shape_set=shape_set, point_size=point_size, point_color=point_color, stroke_width=point_strokewidth)]
while k < 20 * np.pi:
    point = plot_data.PlotDataPoint2D(k, np.sin(k), size=graph_point_size, shape=point_shape, color_fill=point_colorfill, color_stroke=point_colorstroke, stroke_width=point_strokewidth)
    point_list.append(point)
    k = k + np.pi/20

graph = plot_data.PlotDataGraph2D(point_list, dashline,graph_colorstroke,graph_linewidth,display_step,name='Graph 1')
plot_datas += [graph]

point_list1 = []
k = 0
plot_data_states1 = [plot_data.PlotDataState(shape_set=plot_data.PointShapeSet(shape='square'),
                                              point_size=plot_data.PointSizeSet(size=graph_point_size),
                                              point_color=plot_data.PointColorSet(color_fill=green, color_stroke=black),
                                              stroke_width=0.5)]
while k < 20 * np.pi:
    point = plot_data.PlotDataPoint2D(k, np.sin(k + np.pi/3), size=graph_point_size, shape='square', color_fill=green, color_stroke=orange, stroke_width=point_strokewidth)
    point_list1.append(point)
    k = k + np.pi/20
graph1 = plot_data.PlotDataGraph2D(point_list=point_list1, dashline=[10,10], graph_colorstroke=red, graph_linewidth=0.5, display_step=display_step, name='Graph 2')
plot_datas += [graph1]


point_list2 = []
k = 0
plot_data_states2 = [plot_data.PlotDataState(shape_set=plot_data.PointShapeSet(shape='crux'),
                                              point_size=plot_data.PointSizeSet(size=graph_point_size),
                                              point_color=plot_data.PointColorSet(color_fill=brown, color_stroke=black),
                                              stroke_width=0.5)]
while k < 20 * np.pi:
    point = plot_data.PlotDataPoint2D(k, np.sin(k + 2*np.pi/3), size=graph_point_size, shape='crux', color_fill=brown, color_stroke=black, stroke_width=point_strokewidth)
    point_list2.append(point)
    k = k + np.pi/20
graph2 = plot_data.PlotDataGraph2D(point_list=point_list2, dashline=[5, 3, 1, 3], graph_colorstroke=blue, graph_linewidth=0.5, display_step=display_step, name='Graph 3')
plot_datas += [graph2]

axis = plot_data.PlotDataAxis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                              font_size=font_size,
                              graduation_color=graduation_color,
                              axis_color=axis_color, arrow_on=arrow_on,
                              axis_width=axis_width, grid_on=grid_on)
plot_datas += [axis]

tooltip = plot_data.PlotDataTooltip(colorfill=colorfill,text_color=text_color, font=font,
                     tp_radius=tp_radius, to_plot_list=to_plot_list, opacity=opacity)
plot_datas += [tooltip]

sol = [c.to_dict() for c in plot_datas]
# plot_data.plot_d3(sol)


os.remove("data.json")
with open('data.json', 'w') as fp:
    json.dump(sol, fp, indent=2)