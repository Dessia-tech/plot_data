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
to_plot_list = ['cx', 'cy']
opacity = 0.75

# Graph2D
elements = []
k = 0

dashline=[]
seg_colorstroke = BLACK
seg_linewidth = 0.5
point_colorfill = VIOLET
point_colorstroke = GREY
point_strokewidth = 0.5
graph_point_size = 2
point_shape = 'circle'
display_step = 3


tooltip = plot_data.Tooltip(colorfill=colorfill,text_color=text_color,
                            font_size=tl_fontsize, font_style=tl_fontstyle,
                            tp_radius=tp_radius, to_plot_list=to_plot_list,
                            opacity=opacity)

# while k < 20 * np.pi:
#     point = plot_data.Point2D(k, np.sin(k), size=graph_point_size,
#                               shape=point_shape, color_fill=point_colorfill,
#                               color_stroke=point_colorstroke,
#                               stroke_width=point_strokewidth)
#     elements.append(point)
#     k = k + np.pi/20
#
#
#
# graph = plot_data.Dataset(elements=elements, dashline=dashline,
#                           seg_colorstroke=seg_colorstroke,
#                           seg_linewidth=seg_linewidth, pt_colorfill=point_colorfill,
#                           pt_colorstroke=point_colorstroke,
#                           display_step=display_step,
#                           tooltip=tooltip, name='Graph 1')
# graphs += [graph]
#
# elements1 = []
# k = 0
#
# while k < 20 * np.pi:
#     point = plot_data.Point2D(k, np.sin(k + np.pi/3), size=graph_point_size,
#                               shape='square', color_fill=GREEN,
#                               color_stroke=ORANGE,
#                               stroke_width=point_strokewidth)
#     elements1.append(point)
#     k = k + np.pi/20
# graph1 = plot_data.Dataset(elements=elements1, dashline=[10, 10],
#                            seg_colorstroke=RED, seg_linewidth=0.5, point_shape='square',
#                             pt_colorfill=GREEN,
#                           pt_colorstroke=ORANGE,
#                            display_step=display_step,
#                            tooltip=tooltip, name='Graph 2')
# graphs += [graph1]
#
#
# elements2 = []
# k = 0
#
# while k < 20 * np.pi:
#     point = plot_data.Point2D(k, np.sin(k + 2*np.pi/3), size=graph_point_size,
#                               shape='crux', color_fill=BROWN,
#                               color_stroke=BLACK,
#                               stroke_width=point_strokewidth)
#     elements2.append(point)
#     k = k + np.pi/20
# graph2 = plot_data.Dataset(elements=elements2, dashline=[5, 3, 1, 3],
#                            seg_colorstroke=BLUE, seg_linewidth=0.5, point_shape='crux',
#                            pt_colorfill=BROWN,
#                            pt_colorstroke=BLACK,
#                            display_step=display_step,
#                            tooltip=tooltip, name='Graph 3')
# graphs += [graph2]
#
# graphs2d = plot_data.Graph2D(graphs=graphs, to_disp_att_names=['cx', 'cy'])

t = [k for k in range(20)]
I = [k**2 for k in range(20)]
elements = []
for k in range(len(I)):
    elements.append({'time':t[k], 'electric current':I[k]})
dataset = plot_data.Dataset([], BLUE, 1, tooltip, RED, GREEN, elements=elements, name='I = f(t)')
graphs2d = plot_data.Graph2D(graphs=[dataset], to_disp_att_names=['time', 'electric current'])

plot_data.plot_canvas(plot_data_object=graphs2d, canvas_id='canvas',
                      debug_mode=True)
