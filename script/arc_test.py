import plot_data
import math

import plot_data.colors as colors


arc1 = {'name': '', 'cx': 0.0, 'cy': 0.0, 'r': 0.022500000000000003,
        'start_angle': -1.4594553124539327, 'end_angle': -1.6821373411358604,
        'data': [{'x': -0.0025, 'y': -0.0223606797749979},  {'x': 0.0025, 'y': -0.0223606797749979}],
        'anticlockwise': False}

arc2 = {'name': '', 'cx': 0.0, 'cy': 0.0, 'r': 0.022500000000000003,
        'start_angle': -1.4594553124539327, 'end_angle': -1.6821373411358604,
        'data': [{'x': -0.0025, 'y': -0.0223606797749979},  {'x': 0.0025, 'y': -0.0223606797749979}],
        'anticlockwise': True}

arc3 = {'name': '', 'cx': 0.0, 'cy': 0.0, 'r': 0.022500000000000003,
        'start_angle': -1.4594553124539327 - 2*math.pi, 'end_angle': -1.6821373411358604 - 2*math.pi,
        'data': [{'x': -0.0025, 'y': -0.0223606797749979},  {'x': 0.0025, 'y': -0.0223606797749979}],
        'anticlockwise': False}


arc_obj1 = plot_data.Arc2D(edge_style=plot_data.EdgeStyle(color_stroke=colors.BLUE, line_width=5), **arc1)
arc_obj2 = plot_data.Arc2D(edge_style=plot_data.EdgeStyle(color_stroke=colors.YELLOW, line_width=5), **arc2)
arc_obj3 = plot_data.Arc2D(edge_style=plot_data.EdgeStyle(color_stroke=colors.GREEN, line_width=5), **arc3)
primitive1 = plot_data.PrimitiveGroup(primitives=[arc_obj1])
primitive2 = plot_data.PrimitiveGroup(primitives=[arc_obj2])
primitive3 = plot_data.PrimitiveGroup(primitives=[arc_obj3])

primitives = plot_data.PrimitiveGroupsContainer(primitive_groups=[primitive1, primitive2, primitive3])

plot_data.plot_canvas(plot_data_object=primitives)
