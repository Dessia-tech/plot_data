#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Jun  3 16:18:31 2022

@author: tanguy
"""

import plot_data
import plot_data.colors as colors
import random


elements = []
SHAPES = ['round', 'square', 'triangle', 'ellipse']
COLORS = [colors.RED, colors.BLUE, colors.GREEN, colors.YELLOW, colors.ORANGE, colors.VIOLET]
for i in range(50):
    random_shape = SHAPES[random.randint(0, len(SHAPES) - 1)]
    random_color = COLORS[random.randint(0, len(SHAPES) - 1)]
    elements.append({'mass': random.uniform(0, 50),
                     'length': random.uniform(0, 100),
                     'shape': random_shape,
                     'color': random_color
                     })


piechart1 = plot_data.PieChart(elements=elements,
                                trim_variable='mass')

piechart2 = plot_data.PieChart(elements=elements,
                                trim_variable='length')


plot_data.plot_canvas(plot_data_object=piechart1, debug_mode=True)
plot_data.plot_canvas(plot_data_object=piechart2, debug_mode=True)