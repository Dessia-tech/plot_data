# This script shows how to instantiate a MultiplePlots from a csv file
import plot_data

# ParallelPlot
axes = ['price_wather', 'length_wather', 'price_air']
parallel_plot = plot_data.ParallelPlot(axes=axes)

# Scatter
scatter_plot = plot_data.Scatter(x_variable='price_wather', y_variable='length_wather')

catalog = plot_data.get_csv_vectors('../plot_data/data/data.csv')
points = [{var: catalog.get_value_by_name(line, var) for var in axes} for line in catalog.array]

plots = [parallel_plot, scatter_plot]

multipleplots = plot_data.MultiplePlots(elements=points, plots=plots,
                                        initial_view_on=True)

# If debug_mode == True, set it to False
plot_data.plot_canvas(plot_data_object=multipleplots, debug_mode=True)
