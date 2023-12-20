from test_objects.graph_test import graph2d

import plot_data

# The graph's definition has been moved to test_objects.graph_test.py to
# make MultiplePlots.py' imports more convenient
plot_data_object = graph2d
plot_data.plot_canvas(plot_data_object=graph2d, canvas_id='canvas', local=True)
