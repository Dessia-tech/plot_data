# The name says it all, primitive_group_containers contain primitive_groups.
# In the same way, primitive_groups contain primitives (ie: Arc2D, Circle2D, Contour2D,
# LineSegment and Text)

import plot_data
import plot_data.colors as colors

contour = plot_data.Contour2D(plot_data_primitives=[plot_data.LineSegment2D([1, 1], [1, 2]),
                                                    plot_data.LineSegment2D([1, 2], [2, 2]),
                                                    plot_data.LineSegment2D([2, 2], [2, 1]),
                                                    plot_data.LineSegment2D([2, 1], [1, 1])],
                              surface_style=plot_data.SurfaceStyle(colors.LIGHTORANGE))

circle1 = plot_data.Circle2D(cx=0, cy=0, r=10)
circle2 = plot_data.Circle2D(cx=1, cy=1, r=5, surface_style=plot_data.SurfaceStyle(colors.RED))
circle3 = plot_data.Circle2D(cx=1, cy=1, r=5, surface_style=plot_data.SurfaceStyle(colors.LIGHTBROWN))

primitive_group1 = plot_data.PrimitiveGroup(primitives=[circle1])
primitive_group2 = plot_data.PrimitiveGroup(primitives=[contour])
primitive_group3 = plot_data.PrimitiveGroup(primitives=[circle2])
primitive_group4 = plot_data.PrimitiveGroup(primitives=[circle3])
primitive_groups = [primitive_group1, primitive_group2, primitive_group3, primitive_group4]

primitive_group_container = plot_data.PrimitiveGroupsContainer(primitive_groups=primitive_groups)

# if debug_mode is True, set it to False
plot_data.plot_canvas(plot_data_object=primitive_group_container, debug_mode=True)



