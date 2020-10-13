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

# PlotDataState
surface_color = 'black'
stroke_width = 0.5  # Points' stroke width

plot_datas = []
elements = []
to_display_type = 'point'

for i in range(50):
    cx = random.uniform(0,2)
    cy = random.uniform(0,1)
    point = plot_data.PlotDataPoint2D(cx=cx, cy=cy, size=size, shape=shape, color_fill=color_fill, color_stroke=color_stroke, stroke_width=stroke_width)
    elements += [point]

cx = random.uniform(0,2)
cy = random.uniform(0,1)
point = plot_data.PlotDataPoint2D(cx=cx, cy=cy, size=size, shape=shape, color_fill='red', color_stroke=color_stroke, stroke_width=stroke_width)
elements += [point]
cx = random.uniform(0,2)
cy = random.uniform(0,1)
point = plot_data.PlotDataPoint2D(cx=cx, cy=cy, size=size, shape=shape, color_fill='blue', color_stroke=color_stroke, stroke_width=stroke_width)
elements += [point]

attribute_list = [['cx','float'], ['cy', 'float'], ['color_fill', 'string']]
line_color = 'blue'
parallel_plot = plot_data.ParallelPlot(elements=elements,to_display_type=to_display_type, attribute_list=attribute_list, line_color=line_color)

sol = [parallel_plot.to_dict()]
os.remove("data.json")
with open('data.json', 'w') as fp:
    json.dump(sol, fp, indent=2)

