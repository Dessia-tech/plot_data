import plot_data.core as core
from script.Canvas_tests.colors import *

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
pp_to_disp_attributes = ['Country', 'Level of development', 'European Union Membership', 'Currency', 'Women Entrepreneurship Index', 'Entrepreneurship Index', 'Inflation rate', 'Female Labor Force Participation Rate']
line_color = black
line_width = 0.5
disposition = 'vertical'
rgbs = [[192, 11, 11], [14, 192, 11], [11, 11, 192]]
parallel_plot = core.ParallelPlot(line_color=line_color, line_width=line_width, disposition=disposition, to_disp_attributes=pp_to_disp_attributes, rgbs=rgbs)
objects.append(parallel_plot)

#Scatter
shape = 'circle'
size = 2
sc_color_fill = lightblue
sc_color_stroke = grey
sc_stroke_width = 0.5

axis = core.Axis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                              font_size=font_size,
                              graduation_color=graduation_color,
                              axis_color=axis_color, arrow_on=arrow_on,
                              axis_width=axis_width, grid_on=grid_on)

sc_to_disp_att_names = ['Women Entrepreneurship Index', 'Inflation rate']
tooltip = core.Tooltip(colorfill=tp_colorfill, text_color=text_color, fontsize=tl_fontsize, fontstyle=tl_fontstyle,
                     tp_radius=tp_radius, to_plot_list=sc_to_disp_att_names, opacity=opacity)

ScatterPlot = core.Scatter(axis=axis, tooltip=tooltip, to_display_att_names=sc_to_disp_att_names, point_shape=shape, point_size=size, color_fill=sc_color_fill, color_stroke=sc_color_stroke, stroke_width=0.5)
objects.append(ScatterPlot)

coords = [[0,450], [0,0]]
sizes = [core.Window(width=750, height=400),
         core.Window(width=750, height=400)]

points = core.getCSV_vectors('women_entrepreneurship.csv')
multipleplots = core.MultiplePlots(points=points, objects=objects, sizes=sizes, coords=coords)
sol = [multipleplots.to_dict()]
# os.remove("data.json")
# with open('data.json', 'w') as fp:
#     json.dump(sol, fp, indent=2)

core.plot_canvas(sol, 'multiplot', debug_mode=True)