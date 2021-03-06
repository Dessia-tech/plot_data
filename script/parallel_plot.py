import plot_data
from plot_data.colors import *
import random

elements = []
SHAPES = ['round', 'square', 'triangle', 'ellipse']
COLORS = [RED, BLUE, GREEN, YELLOW, ORANGE, VIOLET]
for i in range(50):
    random_shape = SHAPES[random.randint(0, len(SHAPES) - 1)]
    random_color = COLORS[random.randint(0, len(SHAPES) - 1)]
    elements.append({'mass': random.uniform(0, 50),
                     'length': random.uniform(0, 100),
                     'shape': random_shape,
                     'color': random_color
                     })

parallelplot = plot_data.ParallelPlot(elements=elements,
                                      to_disp_attribute_names=['mass',
                                                               'length',
                                                               'shape',
                                                               'color'])

# The previous script is actually the minimum requirement for creating a
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
                                                 to_disp_attribute_names=['mass',
                                                                          'length',
                                                                          'shape',
                                                                          'color'],
                                                 edge_style=edge_style,
                                                 disposition=disposition,
                                                 rgbs=rgbs)

# if debug_mode == True, set it to False
plot_data.plot_canvas(plot_data_object=parallelplot, debug_mode=True)

