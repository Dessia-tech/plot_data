import plot_data
import random
import json
import os

# Point test ####

# PARAMETERS #
# Window size
width = 2
height = 1

# Shape set (circle, square, crux)
shape = 'circle'

# Point size (1 to 4)
size = 2

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

# Points' color
color_fill = violet
color_stroke = grey

# PlotDataState
surface_color = black
stroke_width = 0.5  # Points' stroke width

# Axis
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

plot_datas = []
window_size = plot_data.WindowSizeSet(width=width, height=height)
shape_set = plot_data.PointShapeSet(shape=shape)
point_size = plot_data.PointSizeSet(size=size)
point_color = plot_data.PointColorSet(color_fill=color_fill,
                                      color_stroke=color_stroke)
for i in range(50):
    cx = random.uniform(0,window_size.width)
    cy = random.uniform(0,window_size.height)
    point = plot_data.Point2D(cx=cx, cy=cy, shape=shape, size=size, color_fill=violet, color_stroke=color_stroke, stroke_width=stroke_width)
    plot_datas += [point]

axis = plot_data.Axis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                              font_size=font_size, graduation_color=graduation_color,
                              axis_color=axis_color, arrow_on=arrow_on, axis_width=axis_width, grid_on=grid_on)
plot_datas += [axis]

tooltip = plot_data.Tooltip(colorfill,text_color=text_color,font=font,tp_radius=tp_radius,to_plot_list=to_plot_list, opacity=opacity)
plot_datas += [tooltip]

sol = [c.to_dict() for c in plot_datas]

os.remove("data.json")
with open('data.json', 'w') as fp:
    json.dump(sol, fp, indent=2)