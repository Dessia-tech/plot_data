import random

import plot_data
from plot_data.colors import (BLUE, GREEN, GREY, LIGHTBLUE, LIGHTVIOLET,
                              ORANGE, RED, ROSE, VIOLET, YELLOW)

# A script showing scatter plots instantiations.

random.seed(2)
elements = []
SHAPES = ['1-2-3-4-5-6-7-8-9round', 'square', 'triangle', 'ellipse']
COLORS = [RED, BLUE, GREEN, YELLOW, ORANGE, VIOLET]
for i in range(500):
    random_shape = SHAPES[random.randint(0, len(SHAPES) - 1)]
    random_color = COLORS[random.randint(0, len(SHAPES) - 1)]
    elements.append({'mass': random.uniform(0, 50),
                     'length': random.uniform(0, 100),
                     'shape': random_shape,
                     'color': random_color})

points_sets = [plot_data.PointFamily(plot_data.colors.RED, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
               plot_data.PointFamily(plot_data.colors.YELLOW, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]),
               plot_data.PointFamily(plot_data.colors.GREEN, [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]),
               plot_data.PointFamily(plot_data.colors.PINK, [30, 31, 32, 33, 34, 35, 36, 37, 38, 39])]

plot_data_object = plot_data.Scatter(elements=elements, points_sets=points_sets,
                                     x_variable='mass', y_variable='length')

# The previous scripts shows the simplest way of creating a scatterplot.
# However, many options are available for further customization

# First of all, apart from tooltips' information, the user can customize
# the style. 'text_style' modifies the text while 'surface_style'
# changes the tooltip's interior. Tooltips are rounded-rectangle-shaped and the radius of the
# vertices can also be changed.
text_style = plot_data.TextStyle(text_color=GREY,
                                 font_size=10,
                                 font_style='sans-serif')
surface_style = plot_data.SurfaceStyle(color_fill=LIGHTVIOLET, opacity=0.3)
custom_tooltip = plot_data.Tooltip(attributes=['mass', 'length'],
                                   surface_style=surface_style,
                                   text_style=text_style,
                                   tooltip_radius=10)


# Then, points' appearance can be modified through point_style attribute
point_style = plot_data.PointStyle(color_fill=LIGHTBLUE,
                                   color_stroke=VIOLET,
                                   stroke_width=2,
                                   size=8,  # 1, 2, 3 or 4
                                   shape='cross')  # 'circle', 'square' or 'crux'

# Finally, axis can be personalized too
graduation_style = plot_data.TextStyle(text_color=BLUE, font_size=10, font_style='Arial')

axis_style = plot_data.EdgeStyle(line_width=0.5, color_stroke=ROSE, dashline=[])

axis = plot_data.Axis(nb_points_x=7, nb_points_y=5, graduation_style=graduation_style, axis_style=axis_style)

# a tooltip is drawn when clicking on a point. Users can choose what information
# they want to be displayed.
tooltip = plot_data.Tooltip(attributes=['mass', 'length', 'shape'])

# Heatmap settings
heatmap = plot_data.Heatmap([4, 2], colors=[YELLOW, ORANGE, RED])

# Now, here is the new scatterplot
plot_data_object = plot_data.Scatter(x_variable='mass', y_variable='length',
                                     point_style=point_style,
                                     elements=elements,
                                     points_sets=points_sets,
                                     axis=axis,
                                     tooltip=tooltip,
                                     heatmap=heatmap)

# if local is True, set it to False
plot_data.plot_canvas(plot_data_object=plot_data_object, local=True)
