import plot_data
from plot_data.colors import *
import random

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
colorfill = LIGHTBLUE
colorstroke = GREY

strokewidth = 0.5
# Scatter plot
nb_points_x = 10
nb_points_y = 10
font_size = 12
graduation_color = GREY
axis_color = GREY
axis_width = 0.5
arrow_on = False
grid_on = True

# Tooltip
tp_colorfill = GREY
text_color = WHITE
# Font family : Arial, Helvetica, serif, sans-serif,
# Verdana, Times New Roman, Courier New
tl_fontsize = 12
tl_fontstyle = 'sans-serif'
tp_radius = 5
to_display_att_names = ['cx', 'cy']
opacity = 0.75

axis = plot_data.Axis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                      font_size=font_size, graduation_color=graduation_color,
                      axis_color=axis_color, arrow_on=arrow_on,
                      axis_width=axis_width, grid_on=grid_on)

tooltip = plot_data.Tooltip(colorfill=tp_colorfill, text_color=text_color,
                            fontsize=tl_fontsize, fontstyle=tl_fontstyle,
                            tp_radius=tp_radius,
                            to_plot_list=to_display_att_names, opacity=opacity)

plot_datas = []
point_list = []
color_fills = [VIOLET, BLUE, GREEN, RED, YELLOW, CYAN, ROSE]
for i in range(500):
    cx = random.uniform(0, 2)
    cy = random.uniform(0, 1)
    random_color_fill = color_fills[random.randint(0, len(color_fills) - 1)]
    point = plot_data.Point2D(cx=cx, cy=cy, size=size, shape=shape,
                              color_fill=random_color_fill,
                              color_stroke=colorstroke,
                              stroke_width=strokewidth)
    point_list += [point]

scatter_plot = plot_data.Scatter(elements=point_list, axis=axis,
                                 tooltip=tooltip,
                                 to_display_att_names=to_display_att_names,
                                 point_shape=shape, point_size=size,
                                 color_fill=colorfill,
                                 color_stroke=colorstroke,
                                 stroke_width=strokewidth)

plot_data.plot_canvas(plot_data_object=scatter_plot, debug_mode=True)
