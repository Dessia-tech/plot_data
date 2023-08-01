import random

import plot_data
# import plot_data.colors as colors

random.seed(8003)

elements = []
SHAPES = ['round', 'square', 'triangle', 'ellipse']
COLORS = ["Red", "blue", "green", "Yellow", "orange", "purple"]
# COLORS = [colors.RED, colors.BLUE, colors.GREEN, colors.YELLOW, colors.ORANGE, colors.VIOLET]
for i in range(50):
    random_shape = SHAPES[random.randint(0, len(SHAPES) - 1)]
    random_color = COLORS[random.randint(0, len(SHAPES) - 1)]
    elements.append({'mass': random.uniform(0, 20000),
                     'length': random.uniform(0, 100),
                     'shape': random_shape,
                     'color': random_color
                     })

plot_data_object = plot_data.Histogram(x_variable='mass', elements=elements)
                                       #  , graduation_nb = 50,
                                       # surface_style=plot_data.SurfaceStyle("rgb(120, 150, 250)"),
                                       # edge_style=plot_data.EdgeStyle(3, "rgb(120, 20, 250)", [5, 3]))

plot_data.plot_canvas(plot_data_object=plot_data_object, debug_mode=True)
