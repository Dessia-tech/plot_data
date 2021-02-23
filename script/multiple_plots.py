# An example of MultiplePlots instantiation. It draws and allows interactions between
# different plots in one canvas, including scatterplots, parallelplots,
# primitive_groups and primitive_group_containers.
# The plots are created using necessary parameters only. For more details about
# customization an optional parameters, feel free read the plots' specific scripts.

import plot_data
from plot_data.colors import *
from test_objects.primitive_group_test import primitive_group
from test_objects.graph_test import graph2d
import random

elements = []  # a list of vectors (dictionaries) that are displayed
# through different representations such as parallel plots and scatter plots

nb_elements = 50
colors = [VIOLET, BLUE, GREEN, RED, YELLOW, CYAN, ROSE]
directions = ['north', 'south', 'west', 'east']
for i in range(nb_elements):
    random_color = colors[random.randint(0, len(colors) - 1)]
    random_direction = directions[random.randint(0, len(directions) - 1)]
    elements.append({'x': random.uniform(0, 2),
                     'y': random.uniform(0, 1),
                     'color': random_color,
                     'direction': random_direction})

# ParallelPlot
parallelplot1 = plot_data.ParallelPlot(
    to_disp_attribute_names=['x', 'y', 'color', 'direction'])
parallelplot2 = plot_data.ParallelPlot(to_disp_attribute_names=['x', 'color'])

# Scatterplots
scatterplot1 = plot_data.Scatter(
    tooltip=plot_data.Tooltip(to_disp_attribute_names=['x', 'direction']),
    to_disp_attribute_names=['x', 'y'])

scatterplot2 = plot_data.Scatter(
    tooltip=plot_data.Tooltip(to_disp_attribute_names=['y', 'color']),
    to_disp_attribute_names=['y', 'color'],
    point_style=plot_data.PointStyle(
        shape='square'))  # optional argument that changes points' appearance

scatterplot3 = plot_data.Scatter(
    tooltip=plot_data.Tooltip(to_disp_attribute_names=['x', 'direction']),
    to_disp_attribute_names=['x', 'direction'])

# Creating the multiplot
plots = [primitive_group, parallelplot1, parallelplot2, scatterplot1, graph2d]

multiplot = plot_data.MultiplePlots(plots=plots, elements=elements,
                                    initial_view_on=True)

# Display
plot_data.plot_canvas(plot_data_object=multiplot, debug_mode=True)
