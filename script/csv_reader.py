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
pp_edge_style = plot_data.EdgeStyle(line_width=line_width, color_stroke=line_color)
parallel_plot = plot_data.ParallelPlot(disposition=disposition,
                                       rgbs=rgbs,
                                       edge_style=pp_edge_style,
                                       to_disp_attribute_names=pp_to_disp_attributes)
objects.append(parallel_plot)

# Scatter
shape = 'circle'
size = 2
sc_color_fill = LIGHTBLUE
sc_color_stroke = GREY
sc_stroke_width = 0.5

sc_to_disp_att_names = ['price_wather', 'length_wather']
tooltip = plot_data.Tooltip(to_disp_attribute_names=sc_to_disp_att_names)

scatter_plot = plot_data.Scatter(tooltip=tooltip, to_disp_attribute_names=sc_to_disp_att_names)

objects.append(scatter_plot)

coords = [(0, 450), (0, 0)]
sizes = [plot_data.Window(width=750, height=400),
         plot_data.Window(width=750, height=400)]

catalog = plot_data.get_csv_vectors('../plot_data/data/data.csv')
points = [{var: catalog.get_value_by_name(line, var)
           for var in pp_to_disp_attributes}
          for line in catalog.array]

multipleplots = plot_data.MultiplePlots(elements=points, objects=objects,
                                        sizes=sizes, coords=coords, initial_view_on=True)

plot_data.plot_canvas(plot_data_object=multipleplots, debug_mode=True)
