import plot_data
from plot_data.colors import *
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

# Points' color
color_fill = VIOLET
color_stroke = GREY

# PlotDataState
surface_color = BLACK
stroke_width = 0.5  # Points' stroke width

# Axis
nb_points_x = 10
nb_points_y = 10
font_size = 12
graduation_color = GREY
axis_color = GREY
axis_width = 0.5
arrow_on = False
grid_on = True

# Tooltip
colorfill = BLACK
text_color = WHITE
font = '12px sans-serif'  # Font family : Arial, Helvetica, serif, sans-serif, Verdana, Times New Roman, Courier New
tp_radius = 5
to_plot_list = ['cx', 'cy']
opacity = 0.75

plot_datas = []
window_size = plot_data.Window(width=width, height=height)
shape_set = plot_data.PointShapeSet(shape=shape)
point_size = plot_data.PointSizeSet(size=size)
point_color = plot_data.PointColorSet(color_fill=color_fill,
                                      color_stroke=color_stroke)
for i in range(500):
    cx = random.uniform(0,window_size.width)
    cy = random.uniform(0,window_size.height)
    point = plot_data.Point2D(cx=cx, cy=cy, shape=shape, size=size,
                              color_fill=VIOLET, color_stroke=color_stroke,
                              stroke_width=stroke_width)
    plot_datas += [point]

axis = plot_data.Axis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                      font_size=font_size, graduation_color=graduation_color,
                      axis_color=axis_color, arrow_on=arrow_on,
                      axis_width=axis_width, grid_on=grid_on)
plot_datas += [axis]

tooltip = plot_data.Tooltip(colorfill, text_color=text_color, font=font,
                            tp_radius=tp_radius,to_plot_list=to_plot_list,
                            opacity=opacity)
plot_datas += [tooltip]

sol = [c.to_dict() for c in plot_datas]

os.remove("data.json")
with open('data.json', 'w') as fp:
    json.dump(sol, fp, indent=2)