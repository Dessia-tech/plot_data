#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Mar  3 10:43:19 2023

@author: masfaraud
"""

import plot_data

for file in ['plot_1.json', 'plot_2.json', 'plot_3.json']:
    plot1 = plot_data.PlotDataObject.load_from_file(file)
    plot_data.plot_canvas(plot1)
    plot1.save_to_image(file[:-5])
    plot1.mpl_plot()
