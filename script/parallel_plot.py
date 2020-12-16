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
color_fill = VIOLET
color_stroke = GREY

stroke_width = 1  # Points' stroke width

# ParallelPlot
to_disp_attribute_names = ['cx', 'cy', 'color_fill', 'color_stroke']
line_color = BLACK
line_width = 0.5
disposition = 'vertical'
plot_datas = []
elements = []

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
edge_style = plot_data.EdgeStyle()
parallel_plot = plot_data.ParallelPlot(elements=elements,
                                       edge_style=edge_style,
                                       disposition=disposition,
                                       to_disp_attribute_names=to_disp_attribute_names,
                                       rgbs=rgbs)

plot_data.plot_canvas(plot_data_object=parallel_plot, debug_mode=True)

