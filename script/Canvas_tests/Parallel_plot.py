from plot_data import plot_data
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
color_fill = 'violet'
color_stroke = 'grey'

stroke_width = 1  # Points' stroke width

# ParallelPlot
attribute_list = [plot_data.Attribute(name='cx', type='float'),
                  plot_data.Attribute(name='color_fill', type='string'),
                  plot_data.Attribute(name='cy', type='float'),
                  plot_data.Attribute(name='color_stroke', type='string')]
# attribute_list = [['cx','float'], ['cy', 'float'], ['color_fill', 'string'], ['color_stroke', 'string']]
line_color = 'grey'
line_width = 0.5
disposition = 'vertical'
plot_datas = []
elements = []

color_fills = ['violet', 'blue', 'green', 'red', 'yellow']
color_strokes = ['black', 'brown', 'green', 'red']
for i in range(50):
    cx = random.uniform(0,2)
    cy = random.uniform(0,1)
    random_color_fill = color_fills[random.randint(0,len(color_fills)-1)]
    random_color_stroke = color_strokes[random.randint(0,len(color_strokes) - 1)]
    point = plot_data.PlotDataPoint2D(cx=cx, cy=cy, size=size, shape=shape, color_fill=random_color_fill, color_stroke=random_color_stroke, stroke_width=stroke_width)
    elements += [point]

cx = random.uniform(0,2)
cy = random.uniform(0,1)
point = plot_data.PlotDataPoint2D(cx=cx, cy=cy, size=size, shape=shape, color_fill='red', color_stroke='brown', stroke_width=stroke_width)
elements += [point]
cx = random.uniform(0,2)
cy = random.uniform(0,1)
point = plot_data.PlotDataPoint2D(cx=cx, cy=cy, size=size, shape=shape, color_fill='blue', color_stroke='green', stroke_width=stroke_width)
elements += [point]


parallel_plot = plot_data.ParallelPlot(elements=elements, attribute_list=attribute_list, line_color=line_color, line_width=line_width, disposition=disposition)

sol = [parallel_plot.to_dict()]
os.remove("data.json")
with open('data.json', 'w') as fp:
    json.dump(sol, fp, indent=2)

