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
window_size = plot_data.WindowSizeSet(width=width, height=height)
shape_set = plot_data.PointShapeSet(shape=shape)
point_size = plot_data.PointSizeSet(size=size)
point_color = plot_data.PointColorSet(color_fill=color_fill,
                                      color_stroke=color_stroke)
plot_data_states = [plot_data.PlotDataState(
        color_surface=plot_data.ColorSurfaceSet(color=surface_color),
        window_size=window_size, stroke_width=stroke_width,
        shape_set=shape_set, point_size=point_size, point_color=point_color)]
for i in range(50):
    cx = random.uniform(0,window_size.width)
    cy = random.uniform(0,window_size.height)
    point = plot_data.PlotDataPoint2D(cx=cx, cy=cy, plot_data_states=plot_data_states)
    elements += [point]

attribute_list = [['cx','float'], ['cy', 'float'], ['cx', 'float']]
line_color = 'blue'
parallel_plot = plot_data.ParallelPlot(elements=elements,to_display_type=to_display_type, attribute_list=attribute_list, line_color=line_color)

sol = [parallel_plot.to_dict()]
os.remove("data.json")
with open('data.json', 'w') as fp:
    json.dump(sol, fp, indent=2)

