# This script shows how to instantiate a MultiplePlots from a csv file
import plot_data

# ParallelPlot
axes = ['price_wather', 'length_wather', 'price_air']
parallel_plot = plot_data.ParallelPlot(axes=axes)

# Scatter
scatter_plot = plot_data.Scatter(x_variable='price_wather', y_variable='length_wather')
vectors = plot_data.get_csv_vectors('../plot_data/data/data.csv')

# Create Multiplot
plots = [parallel_plot, scatter_plot]
multipleplots = plot_data.MultiplePlots(elements=vectors, plots=plots, initial_view_on=True)

# If debug_mode == True, set it to False
plot_data.plot_canvas(plot_data_object=multipleplots, debug_mode=False)
