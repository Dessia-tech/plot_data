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
color_fill = LIGHTBLUE
color_stroke = GREY
stroke_width = 0.5

# Scatter plot
axis = plot_data.Axis()
to_disp_attribute_names = ['cx', 'cy']
tooltip = plot_data.Tooltip(to_disp_attribute_names=to_disp_attribute_names)

plot_datas = []
elements = []
color_fills = [VIOLET, BLUE, GREEN, RED, YELLOW, CYAN, ROSE]
for i in range(2000):
    cx = random.uniform(0, 2)
    cy = random.uniform(0, 1)
    random_color_fill = color_fills[random.randint(0, len(color_fills) - 1)]
    point = plot_data.Point2D(cx=cx, cy=cy, size=size, shape=shape,
                              color_fill=random_color_fill,
                              color_stroke=color_stroke,
                              stroke_width=stroke_width)
    elements += [point]
point_style = plot_data.PointStyle(color_fill=color_fill, color_stroke=color_stroke)
scatter_plot = plot_data.Scatter(tooltip=tooltip, to_disp_attribute_names=to_disp_attribute_names, point_style=point_style,
                                  elements=elements, axis=axis)


plot_data.plot_canvas(plot_data_object=scatter_plot, debug_mode=True)
