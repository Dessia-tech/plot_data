#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Sep 29 15:46:57 2022

@author: tanguy
"""

import plot_data
from volmdlr import Point2D
from volmdlr.edges import LineSegment2D
from volmdlr.wires import Contour2D


class Box:

    def __init__(self, length: float, height: float, font_size: float,
                  name: str):
        self.length = length
        self.height = height
        self.font_size = font_size
        self.name = name

    def contour(self):
        edge1 = LineSegment2D(Point2D(-self.length/2, -self.height/2),
                              Point2D(self.length/2, -self.height/2))
        edge2 = LineSegment2D(Point2D(self.length / 2, -self.height / 2),
                              Point2D(self.length / 2, self.height / 2))
        edge3 = LineSegment2D(Point2D(self.length / 2, self.height / 2),
                              Point2D(-self.length / 2, self.height / 2))
        edge4 = LineSegment2D(Point2D(-self.length / 2, self.height / 2),
                              Point2D(-self.length / 2, -self.height / 2))
        return Contour2D([edge1, edge2, edge3, edge4])

    def plot_data(self, pos_y=0.):
        contour = self.contour()
        contour.translation_inplace(Point2D(0, pos_y))
        plot_data_contour = contour.plot_data()

        text_style = plot_data.TextStyle(text_color='rgb(0, 0, 0)',
                                         font_size=self.font_size,
                                         text_align_x='center',
                                         text_align_y='middle')
        text = plot_data.Text(comment=self.name, position_x=0.,
                              position_y=pos_y, text_style=text_style,
                              text_scaling=True, max_width=self.length,
                              multi_lines=True)

        return [plot_data.PrimitiveGroup(primitives=[plot_data_contour, text])]


nb_boxes = 5
length = 50
height = 30
font_size = None
primitives = []
name = ("Super ! Ce grand texte se comporte exactement comme je l'attends ! Sauf pour les cas très ambigüs pour " +
        "lesquels il a bien fallu choisir un compromis, arbitraire :)")
for i in range(nb_boxes):
    primitives.extend(Box(length=length, height=height,
                      font_size=font_size, name=name).plot_data(i*1.5*height)[0].primitives)

text_style = plot_data.TextStyle(text_color='rgb(100, 100, 100)', font_size=20)
text = plot_data.Text(comment="Ce texte doit s'afficher dans le canvas, pas nécessairement centré sur le canvas",
                      position_x=50., position_y=100, text_style=text_style,
                      multi_lines=True, text_scaling=False, max_width=20)

ff=[text,text]
plot_data.plot_canvas(plot_data.PrimitiveGroup(primitives=primitives + ff), debug_mode=True)
plot_data.plot_canvas(plot_data.PrimitiveGroup(primitives=ff), debug_mode=True)
