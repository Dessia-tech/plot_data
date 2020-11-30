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

triangle_points = [vm.Point2D(*npy.random.random(2)) for i in range(3)]
triangle = vm.wires.ClosedPolygon2D(triangle_points)

cog_triangle = triangle.center_of_mass()

print(triangle.area())

p0 = vm.Point2D(-1, 0)
p1 = vm.Point2D(-npy.cos(npy.pi / 4), npy.sin(npy.pi / 4))
p2 = vm.Point2D(0, 1)

a = vm.edges.Arc2D(p2, p1, p0)
l = vm.edges.LineSegment2D(p2, a.center)

c = vm.wires.Contour2D([a, l])
c2 = vm.core.CompositePrimitive2D([c])

hatching = plot_data.HatchingSet(0.5, 3)
color_surface = plot_data.ColorSurfaceSet(color='white')
plot_data_state = plot_data.Settings(name='be_sup', hatching=hatching,
                                     stroke_width=1)
plot_datas = [c.plot_data(plot_data_states=[plot_data_state])]
sol = [plt.to_dict() for plt in plot_datas]

hatching = plot_data.HatchingSet(1)
plot_data_state = plot_data.Settings(name='name', hatching=hatching,
                                     stroke_width=1)

size = 1
pt1 = vm.Point2D(0, 0)
pt2 = vm.Point2D(0, size)
pt3 = vm.Point2D(size, size)
pt4 = vm.Point2D(size, 0)
c1 = vm.wires.Contour2D([vm.edges.LineSegment2D(pt1, pt2),
                         vm.edges.LineSegment2D(pt2, pt3),
                         vm.edges.LineSegment2D(pt3, pt4),
                         vm.edges.LineSegment2D(pt4, pt1)])

d = c1.plot_data(plot_data_states=[plot_data_state])
plot_data.plot_canvas(plot_data=d.to_dict(), canvas_id='canvas',
                      debug_mode=True)
