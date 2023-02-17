import plot_data
import plot_data.colors as colors
import random
# A script showing scatter plots instantiations.

elements = []
SHAPES = ['round', 'square', 'triangle', 'ellipse']
COLORS = [colors.RED, colors.BLUE, colors.GREEN, colors.YELLOW, colors.ORANGE, colors.VIOLET]
for i in range(50):
    random_shape = SHAPES[random.randint(0, len(SHAPES) - 1)]
    random_color = COLORS[random.randint(0, len(SHAPES) - 1)]
    elements.append({'mass': random.uniform(0, 50),
                     'length': random.uniform(0, 100),
                     'shape': random_shape,
                     'color': random_color})


plot_data_object = plot_data.Scatter(elements=elements,
                                x_variable='mass', y_variable='length')

# The previous scripts shows the simplest way of creating a scatterplot.
# However, many options are available for further customization

# First of all, apart from tooltips' information, the user can customize
# the style. 'text_style' modifies the text while 'surface_style'
# changes the tooltip's interior. Tooltips are rounded-rectangle-shaped and the radius of the
# vertices can also be changed.
text_style = plot_data.TextStyle(text_color=colors.GREY,
                                 font_size=10,
                                 font_style='sans-serif')
surface_style = plot_data.SurfaceStyle(color_fill=colors.LIGHTVIOLET, opacity=0.3)
custom_tooltip = plot_data.Tooltip(attributes=['mass', 'length'],
                                   surface_style=surface_style,
                                   text_style=text_style,
                                   tooltip_radius=10)


# Then, points' appearance can be modified through point_style attribute
point_style = plot_data.PointStyle(color_fill=colors.LIGHTGREEN,
                                   color_stroke=colors.VIOLET,
                                   stroke_width=0.5,
                                   size=2,  # 1, 2, 3 or 4
                                   shape='square')  # 'circle', 'square' or 'crux'

# Finally, axis can be personalized too
graduation_style = plot_data.TextStyle(text_color=colors.BLUE, font_size=10,
                                       font_style='Arial')

axis_style = plot_data.EdgeStyle(line_width=0.5, color_stroke=colors.ROSE,
                                 dashline=[])

axis = plot_data.Axis(nb_points_x=7, nb_points_y=5,
                      graduation_style=graduation_style,
                      axis_style=axis_style
                      )

# a tooltip is drawn when clicking on a point. Users can choose what information
# they want to be displayed.
tooltip = plot_data.Tooltip(attributes=['mass', 'length', 'shape', 'color'])

# Heatmap settings
heatmap = plot_data.Heatmap([4,2], colors=[colors.YELLOW, colors.ORANGE, colors.RED])

# Now, here is the new scatterplot
customized_scatterplot = plot_data.Scatter(x_variable='mass', y_variable='shape',
                                           point_style=point_style,
                                           elements=elements,
                                           axis=axis,
                                           tooltip=tooltip,
                                           heatmap=heatmap)

# if debug_mode is True, set it to False
plot_data.plot_canvas(plot_data_object=plot_data_object, debug_mode=True)


