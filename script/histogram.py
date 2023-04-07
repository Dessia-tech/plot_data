import random

import plot_data
import plot_data.colors as colors

random.seed(8003)

elements = []
SHAPES = ['round', 'square', 'triangle', 'ellipse']
COLORS = [colors.RED, colors.BLUE, colors.GREEN, colors.YELLOW, colors.ORANGE, colors.VIOLET]
for i in range(50):
    random_shape = SHAPES[random.randint(0, len(SHAPES) - 1)]
    random_color = COLORS[random.randint(0, len(SHAPES) - 1)]
    elements.append({'mass': random.uniform(0, 50),
                     'length': random.uniform(0, 100),
                     'shape': random_shape,
                     'color': random_color
                     })


plot_data_object = plot_data.Histogram(x_variable='mass', elements=elements)

plot_data.plot_canvas(plot_data_object=plot_data_object, debug_mode=True)
