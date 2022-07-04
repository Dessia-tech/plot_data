import plot_data
import plot_data.colors as colors
import random
import pkg_resources
from dessia_common import tests, cluster

csv_cars = pkg_resources.resource_stream('dessia_common', 'models/data/cars.csv')
all_cars = [c.to_dict() for c in tests.Car.from_csv(csv_cars)]
# A script showing scatter plots instantiations.

# elements = []
# SHAPES = ['round', 'square', 'triangle', 'ellipse']
# COLORS = [colors.RED, colors.BLUE, colors.GREEN, colors.YELLOW, colors.ORANGE, colors.VIOLET]
# for i in range(50):
#     random_shape = SHAPES[random.randint(0, len(SHAPES) - 1)]
#     random_color = COLORS[random.randint(0, len(SHAPES) - 1)]
#     elements.append({'mass': random.uniform(0, 50),
#                      'length': random.uniform(0, 100),
#                      'shape': random_shape,
#                      'color': random_color
#                      })
    



scatter_matrix = plot_data.ScatterMatrix(elements=all_cars, axes = ['cylinders', 'displacement', 'mpg'])
plot_data.plot_canvas(scatter_matrix, True)