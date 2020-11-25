#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Feb 28 14:07:37 2017

@author: steven
"""

import os
import numpy as npy
import csv

npy.seterr(divide='raise')
# from itertools import permutations
import json

from matplotlib.patches import Arc, FancyArrow
from mpl_toolkits.mplot3d import Axes3D
import pkg_resources
import tempfile
import webbrowser
from dessia_common import DessiaObject
from typing import TypeVar, List

import plot_data.templates as templates

from jinja2 import Environment, PackageLoader, select_autoescape, \
    FileSystemLoader

from string import Template


class ColorMapSet(DessiaObject):
    def __init__(self, value: float = None, tooltip: bool = False,
                 color_range: str = None, selector: bool = True,
                 name: str = ''):
        self.selector = selector
        self.color_range = color_range
        self.tooltip = tooltip
        self.value = value
        DessiaObject.__init__(self, name=name)


class HatchingSet(DessiaObject):
    def __init__(self, stroke_width: float = 1, hatch_spacing: float = 10,
                 name: str = ''):
        self.stroke_width = stroke_width
        self.hatch_spacing = hatch_spacing
        DessiaObject.__init__(self, name=name)


class ColorSurfaceSet(DessiaObject):
    def __init__(self, color: str = 'white', name: str = ''):
        self.color = color
        DessiaObject.__init__(self, name=name)


class PointShapeSet(DessiaObject):
    def __init__(self, shape: str = 'circle', name: str = ''):
        self.shape = shape
        DessiaObject.__init__(self, name=name)


class PointSizeSet(DessiaObject):
    def __init__(self, size: int, name: str = ''):
        self.size = size
        DessiaObject.__init__(self, name=name)


class PointColorSet(DessiaObject):
    def __init__(self, color_fill: str, color_stroke: str, name: str = ''):
        self.color_fill = color_fill
        self.color_stroke = color_stroke
        DessiaObject.__init__(self, name=name)


class Window(DessiaObject):
    def __init__(self, width: float, height: float, name: str = ''):
        self.width = width
        self.height = height
        DessiaObject.__init__(self, name=name)


class Settings(DessiaObject):
    def __init__(self, name: str = '', color_map: ColorMapSet = None,
                 hatching: HatchingSet = None,
                 color_surface: ColorSurfaceSet = None,
                 shape_set: PointShapeSet = None,
                 point_size: PointSizeSet = None,
                 point_color: PointColorSet = None,
                 window_size: Window = None,
                 stroke_width: float = 1, color_line: str = 'black',
                 marker: str = None,
                 dash: str = None, opacity: float = 1):
        self.color_surface = color_surface
        self.color_map = color_map
        self.hatching = hatching
        self.opacity = opacity
        self.dash = dash
        self.marker = marker
        self.color_line = color_line
        self.stroke_width = stroke_width
        self.shape_set = shape_set
        if self.shape_set is None:
            self.shape_set = PointShapeSet(shape='circle')
        self.point_size = point_size
        if self.point_size is None:
            self.point_size = PointSizeSet(size=2)
        self.point_color = point_color
        if self.point_color is None:
            self.point_color = PointColorSet(color_fill='black',
                                             color_stroke='black')
        self.window_size = window_size
        DessiaObject.__init__(self, name=name)


class Line2D(DessiaObject):
    def __init__(self, data: List[float],
                 plot_data_states: List[Settings],
                 type: str = 'line', name: str = '', ):
        self.data = data
        self.type = type
        self.plot_data_states = plot_data_states
        if plot_data_states is None:
            self.plot_data_states = [Settings()]
        DessiaObject.__init__(self, name=name)


class Circle2D(DessiaObject):
    def __init__(self, cx: float, cy: float, r: float,
                 plot_data_states: List[Settings],
                 type: str = 'circle', name: str = '', ):
        self.type = type
        self.plot_data_states = plot_data_states
        self.r = r
        self.cy = cy
        self.cx = cx
        DessiaObject.__init__(self, name=name)


class Point2D(DessiaObject):
    def __init__(self, cx: float, cy: float, shape: str, size: float,
                 color_fill: str, color_stroke: str, stroke_width: float,
                 type: str = 'point',
                 name: str = '', ):
        self.type = type
        self.cx = cx
        self.cy = cy
        self.shape = shape
        self.size = size
        self.color_fill = color_fill
        self.color_stroke = color_stroke
        self.stroke_width = stroke_width
        DessiaObject.__init__(self, name=name)


class Axis(DessiaObject):
    def __init__(self, nb_points_x: int, nb_points_y: int, font_size: int,
                 graduation_color: str, axis_color: str,
                 arrow_on: bool, axis_width: float, grid_on: bool,
                 name: str = '',
                 type: str = 'axis'):
        self.nb_points_x = nb_points_x
        self.nb_points_y = nb_points_y
        self.font_size = font_size
        self.graduation_color = graduation_color
        self.axis_color = axis_color
        self.arrow_on = arrow_on
        self.axis_width = axis_width
        self.grid_on = grid_on
        self.type = type
        DessiaObject.__init__(self, name=name)


class Tooltip(DessiaObject):
    def __init__(self, colorfill: str, text_color: str, fontsize: float,
                 fontstyle: str,
                 tp_radius: float, to_plot_list: list, opacity: float,
                 type: str = 'tooltip',
                 name: str = ''):
        self.colorfill = colorfill
        self.text_color = text_color
        self.fontsize = fontsize
        self.fontstyle = fontstyle
        self.tp_radius = tp_radius
        self.to_plot_list = to_plot_list
        self.opacity = opacity
        self.type = type
        DessiaObject.__init__(self, name=name)


class Graphs2D(DessiaObject):
    def __init__(self, graphs, axis, type: str = 'graphs2D', name: str = ''):
        self.graphs = graphs
        self.axis = axis
        self.type = type
        DessiaObject.__init__(self, name=name)


class Graph2D(DessiaObject):
    def __init__(self, dashline: List[float],
                 graph_colorstroke: str, graph_linewidth: float,
                 display_step: float, tooltip: Tooltip, point_list=[],
                 type: str = 'graph2D',
                 name: str = ''):
        self.serialized_point_list = [p.to_dict() for p in point_list]
        self.dashline = dashline
        self.graph_colorstroke = graph_colorstroke
        self.graph_linewidth = graph_linewidth
        self.display_step = display_step
        if display_step is None:
            self.display_step = 1
        self.tooltip = tooltip
        self.type = type
        DessiaObject.__init__(self, name)


class Scatter(DessiaObject):
    def __init__(self, axis: Axis, tooltip: Tooltip, to_display_att_names,
                 point_shape: str, point_size: float, color_fill: str,
                 color_stroke: str, stroke_width: float, elements=[],
                 type: str = 'scatterplot', name: str = ''):
        self.elements = elements
        self.to_display_att_names = to_display_att_names
        self.point_shape = point_shape
        self.point_size = point_size
        self.color_fill = color_fill
        self.color_stroke = color_stroke
        self.stroke_width = stroke_width
        self.axis = axis
        self.tooltip = tooltip
        self.type = type
        DessiaObject.__init__(self, name)


class Arc2D(DessiaObject):
    def __init__(self, cx: float, cy: float, r: float,
                 data: List[float], angle1: float, angle2: float,
                 plot_data_states: List[Settings],
                 type: str = 'arc', name: str = '', ):
        self.angle2 = angle2
        self.angle1 = angle1
        self.data = data
        self.type = type
        self.plot_data_states = plot_data_states
        self.r = r
        self.cy = cy
        self.cx = cx
        DessiaObject.__init__(self, name=name)


class Contour2D(DessiaObject):
    def __init__(self, plot_data_primitives: List[float],
                 plot_data_states: List[Settings],
                 type: str = 'contour', name: str = '', ):
        self.plot_data_primitives = plot_data_primitives
        self.type = type
        self.plot_data_states = plot_data_states
        DessiaObject.__init__(self, name=name)


color = {'black': 'k', 'blue': 'b', 'red': 'r', 'green': 'g'}


class ParallelPlot(DessiaObject):
    def __init__(self, line_color: str, line_width: float, disposition: str,
                 to_disp_attributes, rgbs, elements=[],
                 name: str = ''):
        self.elements = elements
        self.line_color = line_color
        self.line_width = line_width
        self.disposition = disposition
        self.to_disp_attributes = to_disp_attributes
        self.rgbs = rgbs
        self.type = 'parallelplot'
        DessiaObject.__init__(self, name=name)


class Attribute(DessiaObject):
    def __init__(self, name: str, type: str):
        self.type = type
        DessiaObject.__init__(self, name)


class MultiplePlots(DessiaObject):
    def __init__(self, points, objects, sizes, coords, name: str = ''):
        self.points = points
        self.objects = objects
        self.sizes = sizes
        self.coords = coords
        self.type = 'multiplot'
        DessiaObject.__init__(self, name)


def plot_canvas(plot_datas, plot_type, debug_mode=False):
    if plot_type == 'contour':
        template = templates.contour_template
    elif plot_type == 'scatter':
        template = templates.scatter_template
    elif plot_type == 'parallelplot':
        template = templates.parallelplot_template
    else:
        template = templates.multiplot_template

    core_path = 'https://cdn.dessia.tech/js/plot-data/sid/core.js'
    if debug_mode:
        core_path = '/home/chheang/Github/plot_data/lib/core.js'

    s = template.substitute(data=json.dumps(plot_datas), core_path=core_path)
    temp_file = tempfile.mkstemp(suffix='.html')[1]

    with open(temp_file, 'wb') as file:
        file.write(s.encode('utf-8'))

    webbrowser.open('file://' + temp_file)
    print('file://' + temp_file)


def getCSV_vectors(filename):
    with open(filename, 'r') as csvfile:
        csv_reader = csv.reader(csvfile, delimiter=',')
        for line in csv_reader:
            attribute_names = line
            nbColumns = len(line)
            break
        elements = [[] for k in range(nbColumns)]
        for line in csv_reader:
            for k in range(nbColumns):
                try:
                    value = float(line[k])
                except ValueError:
                    value = line[k]
                elements[k].append(value)

    class ManipulableObject(DessiaObject):
        pass

    nbAttributes = nbColumns
    nbPoints = len(elements[0])
    points = []
    for i in range(nbPoints):
        obj = ManipulableObject()
        for j in range(nbAttributes):
            obj.__setattr__(attribute_names[j], elements[j][i])
        points.append(obj)
    return points

# def plot(plot_datas, ax=None):
#     if ax is None:
#         fig, ax = plt.subplots()
#         ax.set_aspect('equal')
#     else:
#         fig = None
#
#     for plot_data in plot_datas:
#         if plot_data['type'] == 'line':
#             style = ''
#             if plot_data['dash']:
#                 style += '--'
#             else:
#                 style += '-'
#             style += color[plot_data['color']]
#             p1, p2 = plot_data['data'][0: 2], plot_data['data'][2:]
#             if plot_data['arrow']:
#                 ax.plot([p1[0], p2[0]], [p1[1], p2[1]], style)
#                 length = ((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2) ** 0.5
#                 if width is None:
#                     width = length / 1000.
#                     head_length = length / 20.
#                     head_width = head_length / 2.
#                 else:
#                     head_width = 2 * width
#                     head_length = head_width
#                 ax.arrow(p1[0], p1[1],
#                          (p2[0] - p1[0]) / length * (length - head_length),
#                          (p2[1] - p1[1]) / length * (length - head_length),
#                          head_width=head_width, fc='b', linewidth=0,
#                          head_length=head_length, width=width, alpha=0.3)
#             else:
#                 ax.plot([p1[0], p2[0]], [p1[1], p2[1]], style,
#                         linewidth=plot_data['size'])
#
#         elif plot_data['type'] == 'point':
#             p1 = plot_data['data']
#             style = ''
#             style += color[plot_data['color']]
#             style += plot_data['marker']
#             ax.plot(p1[0], p1[1], style, linewidth=plot_data['size'])
#
#         elif plot_data['type'] == 'contour':
#             plot(plot_data['plot_data'], ax)
#
#         elif plot_data['type'] == 'arc':
#             pc = vm.Point2D((plot_data['cx'], plot_data['cy']))
#             ax.add_patch(
#                 Arc(pc, 2 * plot_data['r'], 2 * plot_data['r'], angle=0,
#                     theta1=plot_data['angle1'] * 0.5 / math.pi * 360,
#                     theta2=plot_data['angle2'] * 0.5 / math.pi * 360,
#                     color=color[plot_data['color']],
#                     linewidth=plot_data['size']))
#
#         elif plot_data['type'] == 'circle':
#             pc = vm.Point2D((plot_data['cx'], plot_data['cy']))
#             ax.add_patch(
#                 Arc(pc, 2 * plot_data['r'], 2 * plot_data['r'], angle=0,
#                     theta1=0,
#                     theta2=360,
#                     color=color[plot_data['color']],
#                     linewidth=plot_data['size']))
#     return fig, ax
