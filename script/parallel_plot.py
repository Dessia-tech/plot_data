import random

import plot_data
from plot_data.colors import BLUE, GREEN, ORANGE, RED, VIOLET, YELLOW

random.seed(4)

elements = []
SHAPES = ['round', 'square', 'triangle', 'ellipse']
COLORS = [RED, BLUE, GREEN, YELLOW, ORANGE, VIOLET]
for i in range(50):
    random_shape = SHAPES[random.randint(0, len(SHAPES) - 1)]
    random_color = COLORS[random.randint(0, len(SHAPES) - 1)]
    elements.append({'TTT a d a a a a a a a a a a a a d f e e fzsf v r  e f z z  f fr g h ht r f  dz  s a  d f r g b t g g v e d z s d v g r g y h u j t  r e  e RRR': random.uniform(0, 0.05),
                     'TTT a d a a a a a a a a a a a a d f e e fzsf v r  e f z z  f fr g h ht r f  dz  s a  d f r g b t g g v e d z s d v g r g y h u j t  r e  e RRRTTT a d a a a a a a a a a a a a d f e e fzsf v r  e f z z  f fr g h ht r f  dz  s a  d f r g b t g g v e d z s d v g r g y h u j t  r e  e RRR': random.uniform(0, 100),
                     'shape': random_shape,
                     'TTTcolor color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color RRRTTTcolor color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color RRR': random_color
                     })

plot_data_object = plot_data.ParallelPlot(elements=elements,
                                          axes=['TTT a d a a a a a a a a a a a a d f e e fzsf v r  e f z z  f fr g h ht r f  dz  s a  d f r g b t g g v e d z s d v g r g y h u j t  r e  e RRR', 'TTT a d a a a a a a a a a a a a d f e e fzsf v r  e f z z  f fr g h ht r f  dz  s a  d f r g b t g g v e d z s d v g r g y h u j t  r e  e RRRTTT a d a a a a a a a a a a a a d f e e fzsf v r  e f z z  f fr g h ht r f  dz  s a  d f r g b t g g v e d z s d v g r g y h u j t  r e  e RRR', 'shape', 'TTTcolor color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color RRRTTTcolor color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color color RRR'])

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

# if debug_mode == True, set it to False
plot_data.plot_canvas(plot_data_object=plot_data_object, debug_mode=True)
