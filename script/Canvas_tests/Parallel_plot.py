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

stroke_width = 1  # Points' stroke width

# ParallelPlot
attribute_list = [plot_data.Attribute(name='cx', type='float'),
                  plot_data.Attribute(name='color_fill', type='color'),
                  plot_data.Attribute(name='cy', type='float'),
                  plot_data.Attribute(name='color_stroke', type='color')]
line_color = grey
line_width = 0.5
disposition = 'vertical'
plot_datas = []
elements = []

color_fills = [violet, blue, green, red, yellow]
color_strokes = [black, brown, green, red]
for i in range(50):
    cx = random.uniform(0,2)
    cy = random.uniform(0,1)
    random_color_fill = color_fills[random.randint(0,len(color_fills)-1)]
    random_color_stroke = color_strokes[random.randint(0,len(color_strokes) - 1)]
    point = plot_data.PlotDataPoint2D(cx=cx, cy=cy, size=size, shape=shape, color_fill=random_color_fill, color_stroke=random_color_stroke, stroke_width=stroke_width)
    elements += [point]


parallel_plot = plot_data.ParallelPlot(elements=elements, attribute_list=attribute_list, line_color=line_color, line_width=line_width, disposition=disposition)

sol = [parallel_plot.to_dict()]
os.remove("data.json")
with open('data.json', 'w') as fp:
    json.dump(sol, fp, indent=2)

