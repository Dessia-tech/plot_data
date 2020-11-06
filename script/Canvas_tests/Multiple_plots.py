import plot_data
import random
import json
import os

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
lightskyblue = 'rgb(135,206,250)'

shape = 'circle'
size = 2
stroke_width = 1  # Points' stroke width
# ParallelPlot
to_disp_attributes = ['cx', 'cy', 'color_fill', 'color_stroke']
line_color = black
line_width = 0.5
disposition = 'vertical'
plot_datas = []
objects = []
points = []

color_fills = [violet, blue, green, red, yellow, cyan, rose]
color_strokes = [black, brown, green, red, orange, lightblue, grey]
for i in range(50):
    cx = random.uniform(0,2)
    cy = random.uniform(0,1)
    random_color_fill = color_fills[random.randint(0,len(color_fills)-1)]
    random_color_stroke = color_strokes[random.randint(0,len(color_strokes) - 1)]
    point = plot_data.Point2D(cx=cx, cy=cy, size=size, shape=shape, color_fill=random_color_fill, color_stroke=random_color_stroke, stroke_width=stroke_width)
    points += [point]

parallel_plot = plot_data.ParallelPlot(line_color=line_color, line_width=line_width, disposition=disposition, to_disp_attributes=to_disp_attributes)
objects.append(parallel_plot)

#Axis data
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
font = '12px sans-serif'  # Font family : Arial, Helvetica, serif, sans-serif, Verdana, Times New Roman, Courier New
tp_radius = 5
opacity = 0.75

#Scatter
sc_color_fill = lightblue
sc_color_stroke = grey
sc_stroke_width = 0.5

axis = plot_data.Axis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                              font_size=font_size,
                              graduation_color=graduation_color,
                              axis_color=axis_color, arrow_on=arrow_on,
                              axis_width=axis_width, grid_on=grid_on)

to_disp_att_names = ['cx', 'cy']
tooltip = plot_data.Tooltip(colorfill=tp_colorfill, text_color=text_color, font=font,
                     tp_radius=tp_radius, to_plot_list=to_disp_att_names, opacity=opacity)

ScatterPlot = plot_data.Scatter(axis=axis, tooltip=tooltip, to_display_att_names=to_disp_att_names, point_shape=shape, point_size=size, color_fill=sc_color_fill, color_stroke=sc_color_stroke, stroke_width=0.5)
objects.append(ScatterPlot)

coords = [[0,450], [0,0]]
sizes = [plot_data.Window(width=750, height=400),
         plot_data.Window(width=750, height=400)]

multipleplots = plot_data.MultiplePlots(points=points, objects=objects, sizes=sizes, coords=coords)
plot_datas.append(multipleplots)
sol = [multipleplots.to_dict()]
os.remove("data.json")
with open('data.json', 'w') as fp:
    json.dump(sol, fp, indent=2)