import plot_data
from plot_data.colors import *
import numpy as np

# PlotDataState
graphs = []
surface_color = BLACK
stroke_width = 0.5  # Points' stroke width

# Scatter plot
nb_points_x = 10
nb_points_y = 10
font_size = 12
graduation_color = GREY
axis_color = GREY
axis_width = 0.5
arrow_on = False
grid_on = True

# Tooltip
colorfill = BLACK
text_color = WHITE
tl_fontsize = 12  # Font family : Arial, Helvetica, serif, sans-serif, Verdana, Times New Roman, Courier New
tl_fontstyle = 'sans-serif'
tp_radius = 5
to_plot_list = ['cx', 'cy']
opacity = 0.75

# Graph2D
points = []
k = 0

dashline=[]
graph_colorstroke = BLACK
graph_linewidth = 0.5
point_colorfill = VIOLET
point_colorstroke = GREY
point_strokewidth = 0.5
graph_point_size = 2
point_shape = 'circle'
display_step = 3

axis = plot_data.Axis(nb_points_x=nb_points_x, nb_points_y=nb_points_y,
                      font_size=font_size, graduation_color=graduation_color,
                      axis_color=axis_color, arrow_on=arrow_on,
                      axis_width=axis_width, grid_on=grid_on)

tooltip = plot_data.Tooltip(colorfill=colorfill,text_color=text_color,
                            fontsize=tl_fontsize, fontstyle=tl_fontstyle,
                            tp_radius=tp_radius, to_plot_list=to_plot_list,
                            opacity=opacity)

while k < 20 * np.pi:
    point = plot_data.Point2D(k, np.sin(k), size=graph_point_size,
                              shape=point_shape, color_fill=point_colorfill,
                              color_stroke=point_colorstroke,
                              stroke_width=point_strokewidth)
    points.append(point)
    k = k + np.pi/20

graph = plot_data.Dataset(points=points, dashline=dashline,
                          graph_colorstroke=graph_colorstroke,
                          graph_linewidth=graph_linewidth,
                          display_step=display_step,
                          tooltip=tooltip, name='Graph 1')
graphs += [graph]

points1 = []
k = 0

while k < 20 * np.pi:
    point = plot_data.Point2D(k, np.sin(k + np.pi/3), size=graph_point_size,
                              shape='square', color_fill=GREEN,
                              color_stroke=ORANGE,
                              stroke_width=point_strokewidth)
    points1.append(point)
    k = k + np.pi/20
graph1 = plot_data.Dataset(points=points1, dashline=[10, 10],
                           graph_colorstroke=RED, graph_linewidth=0.5,
                           display_step=display_step,
                           tooltip=tooltip, name='Graph 2')
graphs += [graph1]


points2 = []
k = 0

while k < 20 * np.pi:
    point = plot_data.Point2D(k, np.sin(k + 2*np.pi/3), size=graph_point_size,
                              shape='crux', color_fill=BROWN,
                              color_stroke=BLACK,
                              stroke_width=point_strokewidth)
    points2.append(point)
    k = k + np.pi/20
graph2 = plot_data.Dataset(points=points2, dashline=[5, 3, 1, 3],
                           graph_colorstroke=BLUE, graph_linewidth=0.5,
                           display_step=display_step,
                           tooltip=tooltip, name='Graph 3')
graphs += [graph2]

graphs2d = plot_data.Graph2D(graphs=graphs, axis=axis)

plot_data.plot_canvas(plot_data_object=graphs2d, canvas_id='canvas',
                      debug_mode=True)
