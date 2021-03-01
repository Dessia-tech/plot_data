# The name says it all, primitive_group_containers contain primitive_groups.
# In the same way, primitive_groups contain primitives (ie: Arc2D, Circle2D, Contour2D,
# LineSegment and Text)

import plot_data
from plot_data.colors import *
import volmdlr as vm  # you can install volmdlr using pip in plot_data's package
import volmdlr.wires
import volmdlr.edges


circle1 = vm.wires.Circle2D(vm.Point2D(0, 0), 10).plot_data()

l1 = vm.edges.LineSegment2D(vm.Point2D(1, 1), vm.Point2D(1, 2))
l2 = vm.edges.LineSegment2D(vm.Point2D(1, 2), vm.Point2D(2, 2))
l3 = vm.edges.LineSegment2D(vm.Point2D(2, 2), vm.Point2D(2, 1))
l4 = vm.edges.LineSegment2D(vm.Point2D(2, 1), vm.Point2D(1, 1))
contour = vm.wires.Contour2D([l1, l2, l3, l4]).plot_data(surface_style=plot_data.SurfaceStyle(color_fill=LIGHTORANGE))

circle2 = vm.wires.Circle2D(vm.Point2D(1, 1), 5).plot_data(surface_style=plot_data.SurfaceStyle(color_fill=RED))

circle3 = vm.wires.Circle2D(vm.Point2D(1, 1), 5).plot_data(surface_style=plot_data.SurfaceStyle(color_fill=LIGHTBROWN))

primitive_group1 = plot_data.PrimitiveGroup(primitives=[circle1])
primitive_group2 = plot_data.PrimitiveGroup(primitives=[contour])
primitive_group3 = plot_data.PrimitiveGroup(primitives=[circle2])
primitive_group4 = plot_data.PrimitiveGroup(primitives=[circle3])
primitive_groups = [primitive_group1, primitive_group2, primitive_group3, primitive_group4]

primitive_group_container = plot_data.PrimitiveGroupsContainer(primitive_groups=primitive_groups)

# if debug_mode is True, set it to False
plot_data.plot_canvas(plot_data_object=primitive_group_container, debug_mode=True)



