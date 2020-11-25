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
color_fill = violet
color_stroke = grey

stroke_width = 1  # Points' stroke width

# ParallelPlot
attribute_list = [core.Attribute(name='cx', type='float'),
                  core.Attribute(name='cy', type='float'),
                  core.Attribute(name='size', type='float'),
                  core.Attribute(name='color_fill', type='color'),
                  core.Attribute(name='color_stroke', type='color'),
                  core.Attribute(name='stroke_width', type='float')]
to_disp_attributes = ['cx', 'cy', 'color_fill', 'color_stroke']
line_color = black
line_width = 0.5
disposition = 'vertical'
plot_datas = []
elements = []

color_fills = [violet, blue, green, red, yellow, cyan, rose]
color_strokes = [black, brown, green, red, orange, lightblue, grey]
for i in range(50):
    cx = random.uniform(0,2)
    cy = random.uniform(0,1)
    random_color_fill = color_fills[random.randint(0,len(color_fills)-1)]
    random_color_stroke = color_strokes[random.randint(0,len(color_strokes) - 1)]
    point = core.Point2D(cx=cx, cy=cy, size=size, shape=shape, color_fill=random_color_fill, color_stroke=random_color_stroke, stroke_width=stroke_width)
    elements += [point]

rgbs = [[192, 11, 11], [14, 192, 11], [11, 11, 192]]
parallel_plot = core.ParallelPlot(elements=elements, line_color=line_color, line_width=line_width, disposition=disposition, to_disp_attributes=to_disp_attributes, rgbs=rgbs)

sol = [parallel_plot.to_dict()]

core.plot_canvas(sol, 'parallelplot', debug_mode=True)

