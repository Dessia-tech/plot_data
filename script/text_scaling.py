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
        self.x_coord = -1200
        self.length = length
        self.height = height
        self.font_size = font_size
        self.name = name

    def contour(self, pos_y=0):
        edge1 = LineSegment2D([-self.length / 2 + self.x_coord, -self.height / 2 + pos_y],
                              [self.length / 2 + self.x_coord, -self.height / 2 + pos_y])
        edge2 = LineSegment2D([self.length / 2 + self.x_coord, -self.height / 2 + pos_y],
                              [self.length / 2 + self.x_coord, self.height / 2 + pos_y])
        edge3 = LineSegment2D([self.length / 2 + self.x_coord, self.height / 2 + pos_y],
                              [-self.length / 2 + self.x_coord, self.height / 2 + pos_y])
        edge4 = LineSegment2D([-self.length / 2 + self.x_coord, self.height / 2 + pos_y],
                              [-self.length / 2 + self.x_coord, -self.height / 2 + pos_y])
        return Contour2D(plot_data_primitives=[edge1, edge2, edge3, edge4])

    def plot_data(self, pos_y=0.):
        plot_data_contour = self.contour(pos_y)

        text_style = plot_data.TextStyle(text_color='rgb(0, 0, 0)',
                                         font_size=self.font_size,
                                         text_align_x='center',
                                         text_align_y='middle', italic=True, bold=True)
        text = plot_data.Text(comment=self.name, position_x=self.x_coord,
                              position_y=pos_y, text_style=text_style,
                              text_scaling=True, max_width=self.length,
                              height=self.height, multi_lines=True)

        return [plot_data.PrimitiveGroup(primitives=[plot_data_contour, text])]


nb_boxes = 3
length = 200
height = 100
y_coord = 300
font_size = None
primitives = []
name = ("This text has to be written centered in the box in a middle vertical alignement. " * 3)
for i in range(nb_boxes):
    primitives.extend(Box(length=length, height=height,
                      font_size=font_size, name=name).plot_data(i * 1.5 * height + y_coord)[0].primitives)

texts = []
texts.append(plot_data.Text(comment="Top left ; (0, 0) ; monoline ; no scale ; fontsize = None ; size (400, 40)" * 2,
                            position_x=0, position_y=0, text_style=plot_data.TextStyle(text_align_x="left", text_align_y="top"),
                            multi_lines=False, text_scaling=False, height=40, max_width=1000))

texts.append(plot_data.Text(comment="Bottom left ; (0, 0) ; monoline ; no scale ; fontsize = 30 ; size (400, 40)" * 2,
                            position_x=0, position_y=0, text_style=plot_data.TextStyle(text_align_x="left", text_align_y="bottom", font_size=30),
                            multi_lines=False, text_scaling=False, height=40, max_width=1000))

texts.append(plot_data.Text(comment="Top right ; (0, 100) ; multiline ; no scale ; fontsize = 12 ; size (400, 100)" * 4,
                            position_x=0, position_y=100, text_style=plot_data.TextStyle(text_align_x="right", text_align_y="top", font_size=12),
                            multi_lines=True, text_scaling=False, height=100, max_width=400))

texts.append(plot_data.Text(comment="Middle right ; (0, 0) ; multiline ; scale ; fontsize = 12 ; size (400, 100)" * 4,
                            position_x=0, position_y=210, text_style=plot_data.TextStyle(text_align_x="right", text_align_y="middle", font_size=12),
                            multi_lines=True, text_scaling=True, height=100, max_width=400))

texts.append(plot_data.Text(comment="Middle center ; (500, 210) ; multiline ; scale ; fontsize = 12 ; size (400, None)" * 4,
                            position_x=500, position_y=210, text_style=plot_data.TextStyle(text_align_x="center", text_align_y="middle", font_size=12),
                            multi_lines=True, text_scaling=True, max_width=400))

texts.append(plot_data.Text(comment="Bottom center ; (500, -210) ; multiline ; scale ; fontsize = 12 ; size (None, 100)" * 4,
                            position_x=500, position_y=-210, text_style=plot_data.TextStyle(text_align_x="center", text_align_y="bottom", font_size=12),
                            multi_lines=True, text_scaling=True, height=100))

texts.append(plot_data.Text(comment="Bottom right ; (0, 0) ; multiline ; scale ; fontsize = 12 ; size (None, None)" * 4,
                            position_x=0, position_y=150, text_style=plot_data.TextStyle(text_align_x="right", text_align_y="middle", font_size=12),
                            multi_lines=True, text_scaling=True))

texts.append(plot_data.Text(comment="Bottom right ; (0, 0) ; monoline ; scale ; fontsize = 12 ; size (None, None)" * 4,
                            position_x=0, position_y=-120, text_style=plot_data.TextStyle(text_align_x="right", text_align_y="middle", font_size=12),
                            multi_lines=False, text_scaling=True))

texts.append(plot_data.Text(comment="Bottom right ; (0, 0) ; multiline ; no scale ; fontsize = 12 ; size (None, None)" * 4,
                            position_x=0, position_y=-140, text_style=plot_data.TextStyle(text_align_x="right", text_align_y="middle", font_size=12),
                            multi_lines=True, text_scaling=False))

texts.append(plot_data.Text(comment="Bottom right ; (0, 0) ; monoline ; no scale ; fontsize = 12 ; size (None, None)" * 4,
                            position_x=0, position_y=-170, text_style=plot_data.TextStyle(text_align_x="right", text_align_y="middle", font_size=12),
                            multi_lines=False, text_scaling=False))

texts.append(plot_data.Text(comment="Middle right ; (0, 0) ; multiline ; scale ; fontsize = 12 ; size (400, 100)" * 4,
                            position_x=0, position_y=210, text_style=plot_data.TextStyle(text_align_x="right", text_align_y="middle", font_size=12),
                            multi_lines=True, text_scaling=True, height=100, max_width=400))


middle_right_scale = plot_data.TextStyle(text_align_x="right", text_align_y="middle", font_size=12)
middle_center_no_scale = plot_data.TextStyle(text_align_x="center", text_align_y="middle")

texts.append(plot_data.Text(comment="Middle right ; (-300, -30) ; multiline ; no scale ; fontsize = None ; size (400, 40)" * 4,
                            position_x=-300, position_y=-30, text_style=middle_right_scale,
                            multi_lines=True, text_scaling=False, height=40, max_width=400))
texts.append(plot_data.Text(comment="Middle right ; (0,0) ; multiline ; no scale ; fontsize = 12 ; height and width" * 4,
                            position_x=320, position_y=50, text_style=middle_right_scale,
                            multi_lines=True, text_scaling=False, height=40, max_width=180))
texts.append(plot_data.Text(comment="Middle center ; (0,0) ; monoline ; scale ; fontsize = 12 ; height and width" * 4,
                            position_x=320, position_y=100, text_style=middle_center_no_scale,
                            multi_lines=False, text_scaling=True, height=40, max_width=180))
texts.append(plot_data.Text(comment="Middle center ; (0,0) ; multiline ; scale ; fontsize = 12 ; height and width" * 4,
                            position_x=320, position_y=150, text_style=middle_center_no_scale,
                            multi_lines=True, text_scaling=True, height=40, max_width=180))

ff = primitives + texts
plot_data_object = plot_data.PrimitiveGroup(primitives=ff)
plot_data.plot_canvas(plot_data_object, local=True)
