import plot_data
import math

from plot_data.colors import *

arc1 = {'name': '', 'package_version': '0.10.2', 'cx': 0.0, 'cy': 0.0, 'r': 0.022500000000000003,
        'start_angle': -1.4594553124539327, 'end_angle': -1.6821373411358604,
        'data': [{'x': -0.0025, 'y': -0.0223606797749979},  {'x': 0.0025, 'y': -0.0223606797749979}],
        'anticlockwise': False, 'type_': 'arc'}

arc2 = {'name': '', 'package_version': '0.10.2', 'cx': 0.0, 'cy': 0.0, 'r': 0.022500000000000003,
        'start_angle': -1.4594553124539327, 'end_angle': -1.6821373411358604,
        'data': [{'x': -0.0025, 'y': -0.0223606797749979},  {'x': 0.0025, 'y': -0.0223606797749979}],
        'anticlockwise': True, 'type_': 'arc'}

arc3 = {'name': '', 'package_version': '0.10.2', 'cx': 0.0, 'cy': 0.0, 'r': 0.022500000000000003,
        'start_angle': -1.4594553124539327, 'end_angle': -1.6821373411358604 - 2*math.pi,
        'data': [{'x': -0.0025, 'y': -0.0223606797749979},  {'x': 0.0025, 'y': -0.0223606797749979}],
        'anticlockwise': False, 'type_': 'arc'}


arc_obj1 = plot_data.Arc2D.dict_to_object(arc1)
arc_obj1.edge_style = plot_data.EdgeStyle(color_stroke=BLUE, dashline=[10, 5])  # How does this work??
arc_obj2 = plot_data.Arc2D.dict_to_object(arc2)
arc_obj2.edge_style = plot_data.EdgeStyle(color_stroke=RED, dashline=[10, 5])
arc_obj3 = plot_data.Arc2D.dict_to_object(arc3)
arc_obj3.edge_style = plot_data.EdgeStyle(color_stroke=GREEN, dashline=[10, 5])
primitives = plot_data.PrimitiveGroup(primitives=[arc_obj2])

plot_data.plot_canvas(plot_data_object=primitives)
