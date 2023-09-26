#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Sep 29 15:46:57 2022

@author: tanguy
"""

import plot_data
from plot_data.core import LineSegment2D, Contour2D


class Box:

    def __init__(self, length: float, height: float, font_size: float,
                 name: str):
        self.length = length
        self.height = height
        self.font_size = font_size
        self.name = name

    def contour(self, pos_y=0):
        edge1 = LineSegment2D([-self.length / 2, -self.height / 2 + pos_y],
                              [self.length / 2, -self.height / 2 + pos_y])
        edge2 = LineSegment2D([self.length / 2, -self.height / 2 + pos_y],
                              [self.length / 2, self.height / 2 + pos_y])
        edge3 = LineSegment2D([self.length / 2, self.height / 2 + pos_y],
                              [-self.length / 2, self.height / 2 + pos_y])
        edge4 = LineSegment2D([-self.length / 2, self.height / 2 + pos_y],
                              [-self.length / 2, -self.height / 2 + pos_y])
        return Contour2D(plot_data_primitives=[edge1, edge2, edge3, edge4])

    def plot_data(self, pos_y=0.):
        plot_data_contour = self.contour(pos_y)

        text_style = plot_data.TextStyle(text_color='rgb(0, 0, 0)',
                                         font_size=self.font_size,
                                         text_align_x='left',
                                         text_align_y='middle')
        text = plot_data.Text(comment=self.name, position_x=0.,
                              position_y=pos_y, text_style=text_style,
                              text_scaling=True, max_width=self.length,
                              height=self.height, multi_lines=True)

        return [plot_data.PrimitiveGroup(primitives=[plot_data_contour, text])]


nb_boxes = 5
length = 50
height = 30
font_size = None
primitives = []
name = ("Super ! Ce grand texte se comporte exactement comme je l'attends ! Sauf pour les cas très ambigüs pour " +
        "lesquels il a bien fallu choisir un compromis, arbitraire :)")
for i in range(1):
    primitives.extend(Box(length=length, height=height,
                      font_size=font_size, name=name).plot_data(i * 1.5 * height)[0].primitives)

text_style = plot_data.TextStyle(text_color='rgb(100, 100, 100)', font_size=20)
no_height_no_width = plot_data.Text(comment="Text_ with no height_nor /width and quite long..." * 4,
                                    position_x=250., position_y=40, text_style=text_style,
                                    multi_lines=True, text_scaling=True)
height_no_width = plot_data.Text(comment="Text_ with height_and no[ /width and quite long..." * 4,
                                 position_x=150., position_y=100, text_style=text_style,
                                 multi_lines=True, text_scaling=True, height=15)
height_width = plot_data.Text(comment="Text_ with height and ;width and, quite long..." * 4,
                              position_x=-50., position_y=150, text_style=text_style,
                              multi_lines=True, text_scaling=True, height=40, max_width=100)
no_height_width = plot_data.Text(comment="Text_ with no, height_and[ /width and quite long..." * 4,
                                 position_x=50., position_y=200, text_style=text_style,
                                 multi_lines=True, text_scaling=True, max_width=100)

ff = [no_height_no_width, height_no_width, height_width, no_height_width]
plot_data_object = plot_data.PrimitiveGroup(primitives=primitives + ff)
plot_data.plot_canvas(plot_data_object, debug_mode=True)
# plot_data.plot_canvas(plot_data.PrimitiveGroup(primitives=ff), debug_mode=True)
