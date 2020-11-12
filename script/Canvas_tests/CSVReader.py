import csv
import plot_data
from dessia_common import DessiaObject
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

with open('data.csv', newline='') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=' ', quotechar='|')
    mylist = []
    for row in spamreader:
        strData = row[0][:len(row[0])-1]
        mylist.append(strData)

attribute_names = mylist[0].split(',')
elements = [[] for k in range(len(attribute_names)-1)]
for i in range(1, len(mylist)):
    txt = mylist[i].split(',')
    for j in range(len(txt) - 1):
        elements[j].append(float(txt[j]))


class ManipulableObject(DessiaObject):
    pass

points = []
for i in range(len(elements[0])):
    obj = ManipulableObject()
    for j in range(len(attribute_names)-1):
        obj.__setattr__(attribute_names[j], elements[j][i])
    points.append(obj)

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
tl_fontsize = 12  # Font family : Arial, Helvetica, serif, sans-serif, Verdana, Times New Roman, Courier New
tl_fontstyle = 'sans-serif'
tp_radius = 5
opacity = 0.75

objects = []
#ParallelPlot
to_disp_attributes = ['batterie_x', 'bocal_x', 'calculateur_x', 'compresseur_x', 'filtre_air_x', 'filtre_air_y', 'price']
line_color = black
line_width = 0.5
disposition = 'vertical'
parallel_plot = plot_data.ParallelPlot(line_color=line_color, line_width=line_width, disposition=disposition, to_disp_attributes=to_disp_attributes)
objects.append(parallel_plot)

#Scatter
shape = 'circle'
size = 2
sc_color_fill = lightblue
sc_color_stroke = grey
sc_stroke_width = 0.5

axis = plot_data.Axis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                              font_size=font_size,
                              graduation_color=graduation_color,
                              axis_color=axis_color, arrow_on=arrow_on,
                              axis_width=axis_width, grid_on=grid_on)

to_disp_att_names = ['compresseur_x', 'price']
tooltip = plot_data.Tooltip(colorfill=tp_colorfill, text_color=text_color, fontsize=tl_fontsize, fontstyle=tl_fontstyle,
                     tp_radius=tp_radius, to_plot_list=to_disp_att_names, opacity=opacity)

ScatterPlot = plot_data.Scatter(axis=axis, tooltip=tooltip, to_display_att_names=to_disp_att_names, point_shape=shape, point_size=size, color_fill=sc_color_fill, color_stroke=sc_color_stroke, stroke_width=0.5)
objects.append(ScatterPlot)

coords = [[0,450], [0,0]]
sizes = [plot_data.Window(width=750, height=400),
         plot_data.Window(width=750, height=400)]

multipleplots = plot_data.MultiplePlots(points=points, objects=objects, sizes=sizes, coords=coords)
sol = [multipleplots.to_dict()]
os.remove("data.json")
with open('data.json', 'w') as fp:
    json.dump(sol, fp, indent=2)