import plot_data
from test_objects.graph_test import graph2d
# The graph's definition has been moved to test_objects.graph_test.py to
# make MultiplePlots.py' imports more convenient
plot_data_object = graph2d
plot_data.plot_canvas(plot_data_object=graph2d, canvas_id='canvas', debug_mode=True)
