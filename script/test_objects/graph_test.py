# An example of Graph2D instantiation. It draws one or several datasets on
# one canvas and is useful for displaying numerical functions

import numpy as np

import plot_data
from plot_data.colors import BLACK, BLUE, RED

k = 0

T1 = np.linspace(1, 20, 20)
I1 = [t ** 2 for t in T1]
elements1 = []
for k in range(len(T1)):
    elements1.append({'time': T1[k], 'electric current': I1[k]})
dataset1 = plot_data.Dataset(elements=elements1, name='I1 = f(t)')


# The previous line instantiates a dataset with limited arguments but
# several customizations are available
point_style = plot_data.PointStyle(color_fill=RED, color_stroke=BLACK, shape='crux')
edge_style = plot_data.EdgeStyle(color_stroke=BLUE, dashline=[10, 5])

custom_dataset = plot_data.Dataset(elements=elements1, name='I = f(t)',
                                   point_style=point_style,
                                   edge_style=edge_style)


# Now let's create another dataset for the purpose of this exercice
T2 = np.linspace(1, 20, 100)
I2 = [100*(2+np.cos(t)) for t in T2]
elements2 = []
for k in range(1, len(T2)):
    elements2.append({'time': T2[k], 'electric current': I2[k]})

dataset2 = plot_data.Dataset(elements=elements2, name='I2 = f(t)')
graph2d = plot_data.Graph2D(graphs=[dataset1, dataset2], x_variable='time', y_variable='electric current')
