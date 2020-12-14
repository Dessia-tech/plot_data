import plot_data
from plot_data.colors import *
import numpy as np

# PlotDataState
graphs = []
surface_color = BLACK
stroke_width = 0.5  # Points' stroke width

# Tooltip
colorfill = BLACK
text_color = WHITE
tl_fontsize = 12  # Font family : Arial, Helvetica, serif, sans-serif, Verdana, Times New Roman, Courier New
tl_fontstyle = 'sans-serif'
tp_radius = 5
to_disp_attribute_names = ['cx', 'cy']
opacity = 0.75

# Graph2D
elements = []
k = 0

tooltip = plot_data.Tooltip(to_disp_attribute_names=to_disp_attribute_names)

# Test1
while k < 20 * np.pi:
    point = plot_data.Point2D(k, np.sin(k), color_fill=ROSE)
    elements.append(point)
    k = k + np.pi/20


point_style = plot_data.PointStyle(color_fill=ROSE, color_stroke='BLACK')
line_style = plot_data.EdgeStyle(color_stroke=BLUE)
graph = plot_data.Dataset(elements=elements, point_style=point_style, line_style=line_style,
                          tooltip=tooltip, name='Graph 1')
graphs += [graph]

elements1 = []
k = 0

while k < 20 * np.pi:
    point = plot_data.Point2D(k, np.sin(k + np.pi/3), shape='square')
    elements1.append(point)
    k = k + np.pi/20

point_style1 = plot_data.PointStyle(color_fill=GREEN, color_stroke=ORANGE, shape='square')
line_style1 = plot_data.EdgeStyle(color_stroke=RED, dashline=[10,10])
graph1 = plot_data.Dataset(elements=elements1,line_style=line_style1,
                           point_style=point_style1,
                           tooltip=tooltip, name='Graph 2')
graphs += [graph1]


elements2 = []
k = 0

while k < 20 * np.pi:
    point = plot_data.Point2D(k, np.sin(k + 2*np.pi/3), shape='crux')
    elements2.append(point)
    k = k + np.pi/20
line_style2 = plot_data.EdgeStyle(color_stroke=BLUE, dashline=[5,3,1,3])
point_style2 = plot_data.PointStyle(color_fill=BLACK, color_stroke=BLACK, shape='crux')
graph2 = plot_data.Dataset(elements=elements2, line_style=line_style2,
                           point_style=point_style2,
                           tooltip=tooltip, name='Graph 3')
graphs += [graph2]

graphs2d = plot_data.Graph2D(graphs=graphs, to_disp_attribute_names=to_disp_attribute_names)

# Test 2
# to_disp_attribute_names = ['time', 'electric current']
# tooltip = plot_data.Tooltip(to_disp_attribute_names=to_disp_attribute_names)
# t = [k for k in range(20)]
# I = [k**2 for k in range(20)]
# point_style = plot_data.PointStyle(color_fill=RED, color_stroke=BLACK)
# line_style = plot_data.EdgeStyle(color_stroke=BLUE, dashline=[10, 5])
# for k in range(len(I)):
#     elements.append({'time':t[k], 'electric current':I[k]})
# dataset = plot_data.Dataset(elements=elements, name='I = f(t)', tooltip=tooltip, point_style=point_style,
#                             line_style=line_style)
# graphs2d = plot_data.Graph2D(graphs=[dataset], to_disp_attribute_names=to_disp_attribute_names)

plot_data.plot_canvas(plot_data_object=graphs2d, canvas_id='canvas',
                      debug_mode=True)
