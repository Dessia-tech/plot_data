#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Feb 11 07:38:30 2021

@author: steven
"""

import plot_data
import plot_data.colors as colors
import random


objects = []
elements = []

to_disp_attribute_names = ['cost', 'mass', 'wiring_length']

for i in range(100):
    
    elements.append({'mass': 52+ 47*random.random(),
                     'cost': 231 + 89*random.random(),
                     'wiring_length': 8.9 + 3.1*random.random()})


parallel_plot = plot_data.ParallelPlot(disposition='vertical',
                                       to_disp_attribute_names=to_disp_attribute_names)
objects.append(parallel_plot)

# Scatter

scatter1 = plot_data.Scatter(elements=elements,
                                tooltip = plot_data.Tooltip(to_disp_attribute_names=to_disp_attribute_names),
                                to_disp_attribute_names=['cost', 'mass'])
objects.append(scatter1)

scatter2 = plot_data.Scatter(elements=elements,
                                tooltip = plot_data.Tooltip(to_disp_attribute_names=to_disp_attribute_names),
                                to_disp_attribute_names=['cost', 'wiring_length'])
objects.append(scatter2)


coords = [(0, 0), (300, 600), (600, 600)]
sizes = [plot_data.Window(width=560, height=300) for k in range(len(objects))]


multipleplots = plot_data.MultiplePlots(elements=elements, objects=objects,
                                        sizes=sizes, coords=coords,
                                        initial_view_on=True)

plot_data.plot_canvas(plot_data_object=multipleplots, debug_mode=True)
