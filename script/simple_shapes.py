#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Mar 14 15:32:37 2018

@author: Steven Masfaraud masfaraud@dessia.tech
"""
import plot_data
from plot_data.colors import *
# from test_objects.primitive_group_test import primitive_group

# The primitive_group's definition has been moved to test_objects.primitive_group_test.py
# to make MultiplePlots' more convenient

# if debug mode is True, set it to False

fill1 = plot_data.SurfaceStyle(color_fill=RED, opacity=0.5)
edge1 = plot_data.EdgeStyle(line_width=1, color_stroke=BLUE, dashline=[5,5])
text_style = plot_data.TextStyle(text_color=ORANGE, font_size=14, italic=True, bold=True)
label1 = plot_data.Label(title='label1', text_style=text_style, rectangle_surface_style=fill1,
                         rectangle_edge_style=edge1)
label2 = plot_data.Label(title='label2')
labels = plot_data.MultipleLabels(labels=[label1, label2])
primitive_group = plot_data.PrimitiveGroup(primitives=[labels])

plot_data.plot_canvas(plot_data_object=primitive_group,
                      debug_mode=True)


