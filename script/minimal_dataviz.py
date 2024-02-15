#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Feb 11 07:38:30 2021

@author: steven
"""

import random
import plot_data

random.seed(7)

elements = []

axes = ['cost', 'mass', 'wiring_length']

for i in range(100):

    elements.append({'mass': 52 + 47 * random.random(),
                     'cost': 231 + 89 * random.random(),
                     'wiring_length': 8.9 + 3.1 * random.random()})


parallel_plot = plot_data.ParallelPlot(disposition='vertical',
                                       axes=axes)

# Scatter

scatter1 = plot_data.Scatter(elements=elements,
                             x_variable='cost', y_variable='mass')

scatter2 = plot_data.Scatter(elements=elements,
                             x_variable='cost', y_variable='wiring_length')

plots = [parallel_plot, scatter1, scatter2]

multipleplots = plot_data.MultiplePlots(elements=elements, plots=plots,
                                        initial_view_on=True)

plot_data.plot_canvas(plot_data_object=multipleplots, local=True)
