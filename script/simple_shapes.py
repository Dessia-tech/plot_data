#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""

"""
from test_objects.primitive_group_test import primitive_group

import plot_data

# The primitive_group's definition has been moved to test_objects.primitive_group_test.py
# to make MultiplePlots' more convenient

# if debug mode is True, set it to False
plot_data.plot_canvas(plot_data_object=primitive_group,
                      debug_mode=True)

primitive_group.mpl_plot()

primitive_group.save_to_image('primitive_group.png')