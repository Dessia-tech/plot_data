"""
An example of MultiplePlots instantiation. It draws and allows interactions between
different plots in one canvas, including scatterplots, parallelplots,
primitive_groups and primitive_group_containers.
The plots are created using necessary parameters only. For more details about
customization and optional parameters, feel free read the plots' specific scripts.
"""

import random

from test_objects.graph_test import graph2d

import plot_data
import plot_data.colors as colors

# a list of vectors (dictionaries) that are displayed
# through different representations such as parallel plots and scatter plots
random.seed(0)

elements = []
nb_elements = 50
available_colors = ["purple", "Blue", "green", "red", "Yellow", "Cyan", "rose"]
directions = ['north', 'south', 'west', 'east']
for i in range(nb_elements):
    random_color = available_colors[random.randint(0, len(available_colors) - 1)]
    random_direction = directions[random.randint(0, len(directions) - 1)]
    elements.append({'x': random.uniform(0, 200),
                     'y': random.uniform(0, 100),
                     'color': random_color,
                     'direction': random_direction})

# ParallelPlot
parallelplot1 = plot_data.ParallelPlot(axes=['x', 'y', 'color', 'direction'])
parallelplot2 = plot_data.ParallelPlot(axes=['y', 'color'])

# Scatterplots
scatterplot1 = plot_data.Scatter(x_variable='x', y_variable='y')

scatterplot2 = plot_data.Scatter(x_variable='y', y_variable='color',
                                 point_style=plot_data.PointStyle(shape='square'))  # optional argument that changes
                                                                                    # points' appearance

scatterplot3 = plot_data.Scatter(x_variable='x', y_variable='direction')

# PrimitiveGroupContainers
contour = plot_data.Contour2D(plot_data_primitives=[plot_data.LineSegment2D([1, 1], [1, 2]),
                                                    plot_data.LineSegment2D([1, 2], [2, 2]),
                                                    plot_data.LineSegment2D([2, 2], [2, 1]),
                                                    plot_data.LineSegment2D([2, 1], [1, 1])],
                              surface_style=plot_data.SurfaceStyle(colors.LIGHTORANGE))

circle1 = plot_data.Circle2D(cx=0, cy=0, r=10)
circle2 = plot_data.Circle2D(cx=1, cy=1, r=5, surface_style=plot_data.SurfaceStyle(colors.RED))
circle3 = plot_data.Circle2D(cx=1, cy=1, r=5, surface_style=plot_data.SurfaceStyle(colors.LIGHTBROWN))

primitive_group1 = [circle1]
primitive_group2 = [contour]
primitive_group3 = [circle2]
primitive_group4 = [circle3]
primitive_groups = [primitive_group1, primitive_group2, primitive_group3, primitive_group4]

primitive_group_container = plot_data.PrimitiveGroupsContainer(primitive_groups=primitive_groups,
                                                               associated_elements=[1, 2, 3, 4],
                                                               x_variable='x', y_variable='y')

histogram = plot_data.Histogram(x_variable='x')
histogram2 = plot_data.Histogram(x_variable='direction')
histogram3 = plot_data.Histogram(x_variable='color')

# Creating the multiplot
plots = [parallelplot1, scatterplot1]
plots2 = [parallelplot1, parallelplot2, scatterplot1, scatterplot2, scatterplot3, graph2d, primitive_group_container,
          histogram]

multiplot = plot_data.MultiplePlots(plots=plots, elements=elements, initial_view_on=True)
plot_data_object = plot_data.MultiplePlots(plots=plots2, elements=elements, initial_view_on=True)

# Display
plot_data.plot_canvas(plot_data_object=plot_data_object, debug_mode=True)
plot_data.plot_canvas(plot_data_object=multiplot, debug_mode=True)
