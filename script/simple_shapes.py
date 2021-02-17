#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Mar 14 15:32:37 2018

@author: Steven Masfaraud masfaraud@dessia.tech
"""
import plot_data
from test_objects.primitive_group_test import primitive_group

# The primitive_group's definition has been moved to test_objects.primitive_group_test.py
# to make MultiplePlots' more convenient

# if debug mode is True, set it to False

plot_data.plot_canvas(plot_data_object=primitive_group,
                      debug_mode=True)

