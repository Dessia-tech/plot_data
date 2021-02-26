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

import volmdlr as vm  # You can install volmdlr using pip in plot_data's package

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

# PrimitiveGroupContainers
circle1 = vm.wires.Circle2D(vm.Point2D(0, 0), 10).plot_data()

l1 = vm.edges.LineSegment2D(vm.Point2D(1, 1), vm.Point2D(1, 2))
l2 = vm.edges.LineSegment2D(vm.Point2D(1, 2), vm.Point2D(2, 2))
l3 = vm.edges.LineSegment2D(vm.Point2D(2, 2), vm.Point2D(2, 1))
l4 = vm.edges.LineSegment2D(vm.Point2D(2, 1), vm.Point2D(1, 1))
contour = vm.wires.Contour2D([l1, l2, l3, l4]).plot_data(surface_style=plot_data.SurfaceStyle(color_fill=LIGHTORANGE))

circle2 = vm.wires.Circle2D(vm.Point2D(1, 1), 5).plot_data(surface_style=plot_data.SurfaceStyle(color_fill=RED))

circle3 = vm.wires.Circle2D(vm.Point2D(1, 1), 5).plot_data(surface_style=plot_data.SurfaceStyle(color_fill=LIGHTBROWN))

primitive_group1 = plot_data.PrimitiveGroup(primitives=[circle1])
primitive_group2 = plot_data.PrimitiveGroup(primitives=[contour])
primitive_group3 = plot_data.PrimitiveGroup(primitives=[circle2])
primitive_group4 = plot_data.PrimitiveGroup(primitives=[circle3])
primitive_groups = [primitive_group1, primitive_group2, primitive_group3, primitive_group4]

primitive_group_container = plot_data.PrimitiveGroupsContainer(primitive_groups=primitive_groups,
                                                               associated_elements=[1, 2, 3, 4],
                                                               to_disp_attribute_names=['x', 'direction']
                                                               )


# Creating the multiplot
plots = [parallelplot1, parallelplot2, scatterplot1,
         scatterplot2, scatterplot3, graph2d, primitive_group_container]

# plots = [scatterplot1]

multiplot = plot_data.MultiplePlots(plots=plots, elements=elements,
                                    initial_view_on=True)

# Display
plot_data.plot_canvas(plot_data_object=multiplot, debug_mode=True)
