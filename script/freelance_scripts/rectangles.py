# Plots 5000 rectangles
import plot_data
from plot_data.colors import *
primitives = []
for i in range(100):
    for j in range(50):
        l1 = plot_data.LineSegment2D([2*i, 2*j, 2*i+1, 2*j])
        l2 = plot_data.LineSegment2D([2*i+1, 2*j, 2*i+1, 2*j+1])
        l3 = plot_data.LineSegment2D([2*i+1, 2*j+1, 2*i, 2*j+1])
        l4 = plot_data.LineSegment2D([2*i, 2*j+1, 2*i, 2*j])
        surface_style = plot_data.SurfaceStyle(color_fill=RED)
        contour = plot_data.Contour2D(plot_data_primitives=[l1,l2,l3,l4], surface_style=surface_style)
        primitives.append(contour)

primitive_group = plot_data.PrimitiveGroup(primitives=primitives)
plot_data.plot_canvas(plot_data_object=primitive_group, debug_mode=True)
