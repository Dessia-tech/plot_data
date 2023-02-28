# The name says it all, primitive_group_containers contain primitive_groups.
# In the same way, primitive_groups contain primitives (ie: Arc2D, Circle2D, Contour2D,
# LineSegment and Text)

from primitive_group import primitive_groups

import plot_data

plot_data_object = plot_data.PrimitiveGroupsContainer(primitive_groups=primitive_groups)

# if debug_mode is True, set it to False
plot_data.plot_canvas(plot_data_object=plot_data_object, debug_mode=True)
