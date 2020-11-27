import plot_data.core as core
import random
from script.Canvas_tests.colors import *
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
colorfill = lightblue
colorstroke = grey

strokewidth = 0.5
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
tp_colorfill = black
text_color = white
tl_fontsize = 12  # Font family : Arial, Helvetica, serif, sans-serif, Verdana, Times New Roman, Courier New
tl_fontstyle = 'sans-serif'
tp_radius = 5
to_display_att_names = ['cx', 'cy']
opacity = 0.75

axis = core.Axis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                 font_size=font_size,
                 graduation_color=graduation_color,
                 axis_color=axis_color, arrow_on=arrow_on,
                 axis_width=axis_width, grid_on=grid_on)

tooltip = core.Tooltip(colorfill=tp_colorfill, text_color=text_color,
                       fontsize=tl_fontsize, fontstyle=tl_fontstyle,
                       tp_radius=tp_radius, to_plot_list=to_display_att_names,
                       opacity=opacity)

plot_datas = []
point_list = []
color_fills = [violet, blue, green, red, yellow, cyan, rose]
for i in range(500):
    cx = random.uniform(0, 2)
    cy = random.uniform(0, 1)
    random_color_fill = color_fills[random.randint(0, len(color_fills) - 1)]
    point = core.Point2D(cx=cx, cy=cy, size=size, shape=shape,
                         color_fill=random_color_fill,
                         color_stroke=colorstroke, stroke_width=strokewidth)
    point_list += [point]

ScatterPlot = core.Scatter(elements=point_list, axis=axis, tooltip=tooltip,
                           to_display_att_names=to_display_att_names,
                           point_shape=shape, point_size=size,
                           color_fill=colorfill, color_stroke=colorstroke,
                           stroke_width=strokewidth)
plot_datas += [ScatterPlot]

sol = [c.to_dict() for c in plot_datas]

core.plot_canvas(sol, 'scatter', 'canvas', debug_mode=True)
