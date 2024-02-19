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

plot_data_object = plot_data.Histogram(x_variable='mass', elements=elements, graduation_nb=20,
                                       surface_style=plot_data.SurfaceStyle("rgb(50, 50, 220)"),
                                       edge_style=plot_data.EdgeStyle(1, "rgb(0, 255, 0)", [5, 3]))

plot_data.plot_canvas(plot_data_object=plot_data_object, local=True)
