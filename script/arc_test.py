import plot_data
import math

arc = {'name': '', 'package_version': '0.10.2', 'cx': 0.0, 'cy': 0.0, 'r': 0.022500000000000003,
       'start_angle': -1.4594553124539327, 'end_angle': -1.6821373411358604 + 2*math.pi,
       'data': [{'x': -0.0025, 'y': -0.0223606797749979},  {'x': 0.0025, 'y': -0.0223606797749979}],
       'anticlockwise': False, 'type_': 'arc'}


arc_obj = plot_data.Arc2D.dict_to_object(arc)
primitives = plot_data.PrimitiveGroup(primitives=[arc_obj])

plot_data.plot_canvas(plot_data_object=primitives)
