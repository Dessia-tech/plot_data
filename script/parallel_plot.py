import random
import datetime as dt

import plot_data
from plot_data.colors import BLUE, GREEN, ORANGE, RED, VIOLET, YELLOW

random.seed(4)

elements = []
SHAPES = ['round', 'square', 'triangle', 'ellipse']
COLORS = [RED, BLUE, GREEN, YELLOW, ORANGE, VIOLET]
for i in range(50):
    random_shape = SHAPES[random.randint(0, len(SHAPES) - 1)]
    random_color = COLORS[random.randint(0, len(COLORS) - 1)]
    date = dt.datetime(year=2000 + i, month=random.randint(1, 12), day=random.randint(1, 27),
                       hour=random.randint(0, 23), minute=random.randint(0, 59), second=random.randint(0, 59))
    elements.append({'long middle_attribute name ' * 15: random.uniform(0, 20),
                     'mass'*30: random.uniform(0, 0.05),
                     'length': random.randint(0, 100),
                     'shape': random_shape,
                     'color': random_color,
                     'long middle_attribute name ' * 10: random.uniform(-1000, -20),
                     'long right attribute name ' * 7: random.uniform(0, 35),
                     "date": date
                     })
    if i==3:
        elements[-1]['length'] = None

plot_data_object = plot_data.ParallelPlot(elements=elements,
                                          axes=['long middle_attribute name ' * 15, 'mass' * 30, 'color', 'length',
                                                'shape', 'long middle_attribute name ' * 10, 'long right attribute name ' * 7,
                                                "date"])

# The line above shows the minimum requirements for creating a
# parallel plot. However, many options are available for further customization.

# 'edge_style' option allows customization of the lines
edge_style = plot_data.EdgeStyle(line_width=1, color_stroke=VIOLET, dashline=[])

# 'disposition' = 'vertical' or 'horizontal' whether you want the axis to be
# vertical of hozizontal. This can be changed by pressing the 'disp' button on
# canvas as well.
disposition = 'horizontal'

# Next, ParallelPlots "sort" an axis when clicking on it by displaying a color
# interpolation on the lines. When the attribute 'rgbs' is not given to the ParallePlot
# it is set to [red, blue, green]. However, users are free to set as many
# colors as they want, as long as they are in rgb. A wide panel of rgb colors
# are available in plot_data/colors.py
rgbs = [BLUE, YELLOW, ORANGE]

customized_parallelplot = plot_data.ParallelPlot(elements=elements,
                                                 axes=['mass', 'length', 'shape', 'color'],
                                                 edge_style=edge_style,
                                                 disposition=disposition,
                                                 rgbs=rgbs)

# if local == True, set it to False
plot_data.plot_canvas(plot_data_object=plot_data_object, local=True)
