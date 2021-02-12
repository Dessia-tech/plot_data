# This script shows how to instanciate a MultiplePlots from a csv file
# data
import plot_data
from plot_data.colors import GREY, BLACK, WHITE, LIGHTBLUE


# ParallelPlot
pp_to_disp_attribute_names = ['price_wather', 'length_wather', 'price_air']
pp_edge_style = plot_data.EdgeStyle(line_width=1, color_stroke=GREY)
parallel_plot = plot_data.ParallelPlot(edge_style=pp_edge_style,
                                       to_disp_attribute_names=pp_to_disp_attribute_names)

# Scatter
sc_to_disp_att_names = ['price_wather', 'length_wather']
tooltip = plot_data.Tooltip(to_disp_attribute_names=sc_to_disp_att_names)
scatter_plot = plot_data.Scatter(tooltip=tooltip, to_disp_attribute_names=sc_to_disp_att_names)



catalog = plot_data.get_csv_vectors('../plot_data/data/data.csv')
points = [{var: catalog.get_value_by_name(line, var)
           for var in pp_to_disp_attribute_names}
          for line in catalog.array]

plots = [parallel_plot, scatter_plot]

multipleplots = plot_data.MultiplePlots(elements=points, plots=plots,
                                        initial_view_on=True)

# If debug_mode == True, set it to False
plot_data.plot_canvas(plot_data_object=multipleplots, debug_mode=True)
