"""
An example of MultiplePlots instantiation. It draws and allows interactions between
different plots in one canvas, including scatterplots, parallelplots,
primitive_groups and primitive_group_containers.
The plots are created using necessary parameters only. For more details about
customization and optional parameters, feel free read the plots' specific scripts.
"""

import plot_data
import plot_data.colors as colors
from test_objects.primitive_group_test import primitive_group
from test_objects.graph_test import graph2d
import random

"""
a list of vectors (dictionaries) that are displayed
through different representations such as parallel plots and scatter plots
"""
data_samples = []

nb_samples = 50
available_colors = [colors.VIOLET, colors.BLUE, colors.GREEN, colors.RED, colors.YELLOW, colors.CYAN, colors.ROSE]
directions = ['north', 'south', 'west', 'east']
for i in range(nb_samples):
    random_color = available_colors[random.randint(0, len(available_colors) - 1)]
    random_direction = directions[random.randint(0, len(directions) - 1)]
    data_samples.append({'x': random.uniform(0, 200),
                     'y': random.uniform(0, 100),
                     'color': random_color,
                     'direction': random_direction})

""" ParallelPlot """
parallelplot1 = plot_data.ParallelPlot(axes=['x', 'y', 'color', 'direction'])
parallelplot2 = plot_data.ParallelPlot(axes=['y', 'color'])

"""Scatterplots"""
scatterplot1 = plot_data.Scatter(x_variable='x', y_variable='y')
piechart1 = plot_data.PieChart(data_samples=data_samples,
                               slicing_variable='mass')

scatterplot2 = plot_data.Scatter(x_variable='y', y_variable='color',
                                 point_style=plot_data.PointStyle(shape='square'))  # optional argument that changes
                                                                                    # points' appearance

# scatterplot3 = plot_data.Scatter(x_variable='x', y_variable='direction')
piechart1 = plot_data.PieChart(data_samples=data_samples,
                               slicing_variable='x')


"""PrimitiveGroupContainers"""
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

"""Creating the multiplot"""
plots = [parallelplot1, parallelplot2, scatterplot1,
         scatterplot2, piechart1, graph2d, primitive_group_container,
         histogram, graph2d, primitive_group_container,
         histogram]

multiplot = plot_data.MultiplePlots(plots=plots, elements=data_samples,
                                    initial_view_on=True)

# Display
plot_data.plot_canvas(plot_data_object=multiplot, debug_mode=True)

plots2 = [piechart1, piechart1, piechart1, piechart1, piechart1, piechart1,
          piechart1, piechart1, piechart1, piechart1, piechart1, piechart1,
          piechart1, piechart1, piechart1, piechart1, piechart1]

multiplot2 = plot_data.MultiplePlots(plots=plots2, elements=data_samples,
                                    initial_view_on=True)

# Display
plot_data.plot_canvas(plot_data_object=multiplot2, debug_mode=True)


plots3 = [scatterplot2, scatterplot2, scatterplot2, scatterplot2, scatterplot2, scatterplot2,
          scatterplot2, scatterplot2, scatterplot2, scatterplot2]

multiplot3 = plot_data.MultiplePlots(plots=plots3, elements=data_samples,
                                    initial_view_on=True)

# Display
plot_data.plot_canvas(plot_data_object=multiplot3, debug_mode=True)



