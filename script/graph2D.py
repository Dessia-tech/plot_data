import plot_data
from test_objects.graph_test import graph2d

# The graph's definition has been moved to test_objects.graph_test.py to make MultiplePlots.py' imports more convenient

graph1 = plot_data.Graph2D(graphs=[graph2d.graphs[0]], x_variable='time', y_variable='electric current')
graph2 = plot_data.Graph2D(graphs=[graph2d.graphs[1]], x_variable='time', y_variable='electric current')

plot_data.plot_canvas(plot_data_object=graph1, canvas_id='canvas', debug_mode=True)
plot_data.plot_canvas(plot_data_object=graph2, canvas_id='canvas', debug_mode=True)
plot_data.plot_canvas(plot_data_object=graph2d, canvas_id='canvas', debug_mode=True)
