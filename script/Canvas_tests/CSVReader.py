import plot_data
from plot_data.colors import GREY, BLACK, WHITE, LIGHTBLUE

# Axis data
nb_points_x = 10
nb_points_y = 10
font_size = 12
graduation_color = GREY
axis_color = GREY
axis_width = 0.5
arrow_on = False
grid_on = True

# Tooltip
tp_colorfill = BLACK
text_color = WHITE
tl_fontsize = 12
tl_fontstyle = 'sans-serif'
tp_radius = 5
opacity = 0.75

objects = []

# ParallelPlot
pp_to_disp_attributes = ['price_wather', 'length_wather', 'price_air']
line_color = BLACK
line_width = 0.5
disposition = 'vertical'
rgbs = [[192, 11, 11], [14, 192, 11], [11, 11, 192]]
parallel_plot = plot_data.ParallelPlot(line_color=line_color,
                                       line_width=line_width,
                                       disposition=disposition,
                                       to_disp_attributes=pp_to_disp_attributes,
                                       rgbs=rgbs)
objects.append(parallel_plot)

# Scatter
shape = 'circle'
size = 2
sc_color_fill = LIGHTBLUE
sc_color_stroke = GREY
sc_stroke_width = 0.5

axis = plot_data.Axis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                      font_size=font_size, graduation_color=graduation_color,
                      axis_color=axis_color, arrow_on=arrow_on,
                      axis_width=axis_width, grid_on=grid_on)

sc_to_disp_att_names = ['price_wather', 'length_wather']
tooltip = plot_data.Tooltip(colorfill=tp_colorfill, text_color=text_color,
                            fontsize=tl_fontsize, fontstyle=tl_fontstyle,
                            tp_radius=tp_radius,
                            to_plot_list=sc_to_disp_att_names, opacity=opacity)

ScatterPlot = plot_data.Scatter(axis=axis, tooltip=tooltip,
                                to_display_att_names=sc_to_disp_att_names,
                                point_shape=shape, point_size=size,
                                color_fill=sc_color_fill,
                                color_stroke=sc_color_stroke, stroke_width=0.5)

objects.append(ScatterPlot)

coords = [(0, 450), (0, 0)]
sizes = [plot_data.Window(width=750, height=400),
         plot_data.Window(width=750, height=400)]

points = plot_data.getCSV_vectors('data.csv')
multipleplots = plot_data.MultiplePlots(points=points, objects=objects,
                                        sizes=sizes, coords=coords)
sol = [multipleplots.to_dict()]

plot_data.plot_canvas(sol, 'multiplot', debug_mode=True)
