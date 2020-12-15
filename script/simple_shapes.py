#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Mar 14 15:32:37 2018

@author: Steven Masfaraud masfaraud@dessia.tech
"""
import plot_data
import numpy as npy
import volmdlr as vm
import volmdlr.wires
import volmdlr.edges
from plot_data.colors import *

primitives = []
triangle_points = [vm.Point2D(*npy.random.random(2)) for i in range(3)]
triangle = vm.wires.ClosedPolygon2D(triangle_points)

cog_triangle = triangle.center_of_mass()

# print(triangle.area())

p0 = vm.Point2D(-1, 0)
p1 = vm.Point2D(-npy.cos(npy.pi / 4), npy.sin(npy.pi / 4))
p2 = vm.Point2D(0, 1)

arc = vm.edges.Arc2D(p2, p1, p0)
l = vm.edges.LineSegment2D(p2, arc.center)

c = vm.wires.Contour2D([arc, l])
c2 = vm.core.CompositePrimitive2D([c])

hatching = plot_data.HatchingSet(0.5, 3)
edge_style = plot_data.EdgeStyle(line_width=1, color_stroke=BLUE, dashline=[])
surface_style = plot_data.SurfaceStyle(color_fill=WHITE, opacity=1, hatching=hatching)

size = 1
pt1 = vm.Point2D(0, 0)
pt2 = vm.Point2D(0, size)
pt3 = vm.Point2D(size, size)
pt4 = vm.Point2D(size, 0)
contour1 = vm.wires.Contour2D([vm.edges.LineSegment2D(pt1, pt2),
                         vm.edges.LineSegment2D(pt2, pt3),
                         vm.edges.LineSegment2D(pt3, pt4),
                         vm.edges.LineSegment2D(pt4, pt1)])

plot_data_line = vm.edges.LineSegment2D(vm.Point2D(2,2), vm.Point2D(3,3)).plot_data(edge_style)
primitives.append(plot_data_line)
primitives.append(arc.plot_data(edge_style=edge_style))


plot_data_contour = contour1.plot_data(edge_style=edge_style, surface_style=surface_style)
primitives.append(plot_data_contour)

circle_edge_style = plot_data.EdgeStyle(1,RED)
circle_surface_style = plot_data.SurfaceStyle(color_fill=YELLOW, opacity=0.5, hatching=plot_data.HatchingSet())
circle = vm.wires.Circle2D(vm.Point2D(6,9), 5).plot_data(edge_style=circle_edge_style, surface_style=circle_surface_style)
primitives.append(circle)
primitive_group = plot_data.PrimitiveGroup(primitives=primitives)

plot_data.plot_canvas(plot_data_object=primitive_group, canvas_id='canvas',
                      debug_mode=True)
