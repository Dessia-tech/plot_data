# The name says it all, primitive_group_containers contain primitive_groups.
# In the same way, primitive_groups contain primitives (ie: Arc2D, Circle2D, Contour2D,
# LineSegment and Text)

import math
import plot_data
from plot_data import colors

contour = plot_data.Contour2D(plot_data_primitives=[plot_data.LineSegment2D([1, 1], [1, 2]),
                                                    plot_data.Arc2D(cx=1.25, cy=2, r=0.25, start_angle=math.pi, end_angle=math.pi/2),
                                                    plot_data.LineSegment2D([1.25, 2.25], [1.75, 2.25]),
                                                    plot_data.Arc2D(cx=1.75, cy=2, r=0.25, start_angle=math.pi/2, end_angle=0),
                                                    plot_data.LineSegment2D([2, 2], [2, 1]),
                                                    plot_data.LineSegment2D([2, 1], [1, 1])],
                              surface_style=plot_data.SurfaceStyle(colors.LIGHTORANGE))

circle1 = plot_data.Circle2D(cx=8, cy=4, r=1)
line1 = plot_data.Line2D(point1=[-3,-1], point2=[-2, 5])
circle4 = plot_data.Circle2D(cx=12, cy=4, r=1)
circle2 = plot_data.Circle2D(cx=9, cy=1.5, r=2, surface_style=plot_data.SurfaceStyle(colors.RED))
circle3 = plot_data.Circle2D(cx=10, cy=6, r=5, surface_style=plot_data.SurfaceStyle(colors.LIGHTBROWN))
wire = plot_data.Wire([[15, 0], [15,10], [20,10]], tooltip="It is a wire")


primitive_group1 = plot_data.PrimitiveGroup(primitives=[circle1])
primitive_group2 = plot_data.PrimitiveGroup(primitives=[contour])
primitive_group3 = plot_data.PrimitiveGroup(primitives=[circle2])
primitive_group4 = plot_data.PrimitiveGroup(primitives=[circle3])
primitive_groups = [primitive_group1, primitive_group2, primitive_group3, primitive_group4]

plot_data_object = plot_data.PrimitiveGroupsContainer(primitive_groups=primitive_groups)

# if local is True, set it to False
plot_data.plot_canvas(plot_data_object=plot_data_object, local=True)
