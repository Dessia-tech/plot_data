#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""

"""
from test_objects.primitive_group_test import \
    primitive_group as plot_data_object

import plot_data

# The primitive_group's definition has been moved to test_objects.primitive_group_test.py
# to make MultiplePlots' more convenient

# if debug mode is True, set it to False

# plot_data_object.mpl_plot()

plot_data_object.save_to_image('primitive_group.png')
plot_data.plot_canvas(plot_data_object=plot_data_object, local=True)
