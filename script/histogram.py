import random

import plot_data
# import plot_data.colors as colors

random.seed(8003)

elements = []
SHAPES = ['round', 'square', 'triangle', 'ellipse']
COLORS = ["Red", "blue", "green", "Yellow", "orange", "purple"]
# COLORS = [colors.RED, colors.BLUE, colors.GREEN, colors.YELLOW, colors.ORANGE, colors.VIOLET]
for i in range(1500):
    random_shape = SHAPES[random.randint(0, len(SHAPES) - 1)]
    random_color = COLORS[random.randint(0, len(SHAPES) - 1)]
    elements.append({'mass': random.uniform(0, 20000),
                     'length': random.uniform(0, 100),
                     'shape': random_shape,
                     'color': random_color
                     })

custom_tooltip = plot_data.Tooltip(attributes=['mass', 'length', 'shape', 'color'])

plot_data_object = plot_data.Histogram(x_variable='shape', elements=elements, tooltip=custom_tooltip)

plot_data.plot_canvas(plot_data_object=plot_data_object, debug_mode=True)
