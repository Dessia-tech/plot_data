#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Feb 28 14:07:37 2017

@author: steven
"""

import numpy as npy
import math
import sys
import json
import tempfile
import webbrowser
from dessia_common import DessiaObject, full_classname
from dessia_common.typings import Subclass
from dessia_common.vectored_objects import from_csv, Catalog, ParetoSettings

import plot_data.templates as templates

from typing import List, Tuple, Any, Type
from plot_data.colors import *

npy.seterr(divide='raise')


class PlotDataObject(DessiaObject):
    """
    Abstract interface for DessiaObject implementing in module
    """

    def __init__(self, type_: str, name: str = '', **kwargs):
        self.type_ = type_
        DessiaObject.__init__(self, name=name, **kwargs)

    def to_dict(self):
        dict_ = DessiaObject.to_dict(self)
        del dict_['object_class']
        return dict_

    @classmethod
    def dict_to_object(cls, dict_):
        type_ = dict_['type_']
        object_class = TYPE_TO_CLASS[type_]

        dict_['object_class'] = full_classname(object_class)
        return DessiaObject.dict_to_object(dict_=dict_)


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


class Window(DessiaObject):
    def __init__(self, width: float, height: float, name: str = ''):
        self.width = width
        self.height = height
        DessiaObject.__init__(self, name=name)


class ContourSettings(DessiaObject):
    def __init__(self, name: str = '', color_map: ColorMapSet = None,
                 hatching: HatchingSet = None,
                 color_surface: ColorSurfaceSet = None, stroke_width: float = 1,
                 color_line: str = 'black', marker: str = None,
                 dash: str = None, opacity: float = 1, font: str = 'Arial',
                 text_size: str = '30px', text_color: str = 'black'):
        self.text_color = text_color
        self.text_size = text_size
        self.font = font
        self.color_surface = color_surface
        self.color_map = color_map
        self.hatching = hatching
        self.opacity = opacity
        self.dash = dash
        self.marker = marker
        self.color_line = color_line
        self.stroke_width = stroke_width
        DessiaObject.__init__(self, name=name)


class LineSettings(DessiaObject):
    def __init__(self, line_width:float=0.5, color_stroke:str=BLACK, dashline=[], name:str=''):
        self.line_width = line_width
        self.color_stroke = color_stroke
        self.dashline = dashline
        DessiaObject.__init__(self, name=name)


class PointSettings(DessiaObject):
    def __init__(self, color_fill:str, color_stroke:str, stroke_width:str=0.5,
                 size:float=2, shape:str='circle', name:str=''):
        self.color_fill = color_fill
        self.color_stroke = color_stroke
        self.stroke_width = stroke_width
        self.size = size
        self.shape = shape
        DessiaObject.__init__(self, name=name)


class TextSettings(DessiaObject):
    def __init__(self, text_color:str=BLACK, font_size:float=12, font_style:str='sans-serif', name:str=''):
        self.text_color = text_color
        self.font_size = font_size
        self.font_style = font_style
        DessiaObject.__init__(self, name=name)


class SurfaceSettings(DessiaObject):
    def __init__(self, color_fill:str, opacity:float, hatching:HatchingSet=None, name:str=''):
        self.color_fill = color_fill
        self.opacity = opacity
        self.hatching = hatching
        DessiaObject.__init__(self, name=name)


class Text(PlotDataObject):
    def __init__(self, comment: str, position_x: float, position_y: float,
                 text_settings: TextSettings = None, name: str = ''):
        if text_settings is None:
            self.text_settings = TextSettings()
        else:
            self.text_settings = text_settings
        self.comment = comment
        self.position_x = position_x
        self.position_y = position_y
        PlotDataObject.__init__(self, type_='text', name=name)


class LineSegment(PlotDataObject):
    def __init__(self, data: List[float], plot_data_states: LineSettings,
                 name: str = ''):
        self.data = data
        if plot_data_states is None:
            self.plot_data_states = LineSettings()
        else:
            self.plot_data_states = plot_data_states
        PlotDataObject.__init__(self, type_='linesegment', name=name)

    def bounding_box(self):
        return (min(self.data[0], self.data[2]),
                max(self.data[0], self.data[2]),
                min(self.data[1], self.data[3]),
                max(self.data[1], self.data[3]))


class Circle2D(PlotDataObject):
    def __init__(self, cx: float, cy: float, r: float,
                 plot_data_states: PointSettings, name: str = ''):
        self.plot_data_states = plot_data_states
        self.r = r
        self.cy = cy
        self.cx = cx
        PlotDataObject.__init__(self, type_='circle', name=name)

    def bounding_box(self):
        return self.cx - self.r, self.cx + self.r, self.cy - self.r, self.cy + self.r


class Point2D(PlotDataObject):
    def __init__(self, cx: float, cy: float, shape: str='circle', size: float=2,
                 color_fill: str=LIGHTBLUE, color_stroke: str=BLACK, stroke_width: float=0.5,
                 name: str = ''):
        self.cx = cx
        self.cy = cy
        self.shape = shape
        self.size = size
        self.color_fill = color_fill
        self.color_stroke = color_stroke
        self.stroke_width = stroke_width
        PlotDataObject.__init__(self, type_='point', name=name)

    def bounding_box(self):
        return self.cx, self.cx, self.cy, self.cy


class Axis(PlotDataObject):
    def __init__(self, nb_points_x: int = 10, nb_points_y: int = 10, graduation_settings:TextSettings = None,
                 axis_settings:LineSettings = None, arrow_on: bool = False, grid_on: bool = True, name: str = ''):
        self.nb_points_x = nb_points_x
        self.nb_points_y = nb_points_y
        self.graduation_settings = graduation_settings
        if graduation_settings is None:
            self.graduation_settings = TextSettings(text_color=GREY)
        self.axis_settings = axis_settings
        if axis_settings is None:
            self.axis_settings = LineSettings(color_stroke=LIGHTGREY)
        self.arrow_on = arrow_on
        self.grid_on = grid_on
        PlotDataObject.__init__(self, type_='axis', name=name)


class Tooltip(PlotDataObject):
    def __init__(self, to_disp_attribute_names: List[str], surface_settings:SurfaceSettings=None,
                 text_settings:TextSettings=None, tooltip_radius: float=5, name: str = ''):
        self.to_disp_attribute_names = to_disp_attribute_names
        self.surface_settings = surface_settings
        if surface_settings is None:
            self.surface_settings = SurfaceSettings(color_fill=LIGHTBLUE, opacity=0.75)
        self.text_settings = text_settings
        if text_settings is None:
            self.text_settings = TextSettings(text_color=BLACK, font_size=10)
        self.tooltip_radius = tooltip_radius
        PlotDataObject.__init__(self, type_='tooltip', name=name)


class Dataset(PlotDataObject):
    to_disp_attribute_names = None

    def __init__(self, line_settings:LineSettings, tooltip: Tooltip, point_settings: PointSettings,
                 elements=None, display_step: float = 1, name: str = ''):

        self.line_settings = line_settings
        self.tooltip = tooltip
        self.point_settings = point_settings
        if elements is None:
            self.elements = []
        else:
            self.elements = elements
        self.display_step = display_step
        PlotDataObject.__init__(self, type_='dataset', name=name)


class Graph2D(PlotDataObject):
    def __init__(self, graphs: List[Dataset], to_disp_attribute_names, axis: Axis=None, name: str = ''):
        self.graphs = graphs
        self.to_disp_attribute_names = to_disp_attribute_names
        if axis is None:
            self.axis = Axis()
        else:
            self.axis = axis
        PlotDataObject.__init__(self, type_='graph2d', name=name)


class Scatter(PlotDataObject):
    def __init__(self, tooltip: Tooltip,
                 to_disp_attribute_names: List[str], point_settings:PointSettings,
                 elements: List[Any] = None, axis: Axis=None,
                 name: str = ''):
        self.tooltip = tooltip
        self.to_disp_attribute_names = to_disp_attribute_names
        self.point_settings = point_settings
        if elements is None:
            self.elements = []
        else:
            self.elements = elements
        if axis is None:
            self.axis = Axis()
        else:
            self.axis = axis

        PlotDataObject.__init__(self, type_='scatterplot', name=name)


class Arc2D(PlotDataObject):
    def __init__(self, cx: float, cy: float, r: float,
                 data: List[float], angle1: float, angle2: float,
                 line_settings: LineSettings, name: str = ''):
        self.angle2 = angle2
        self.angle1 = angle1
        self.data = data
        self.line_settings = line_settings
        self.r = r
        self.cy = cy
        self.cx = cx
        PlotDataObject.__init__(self, type_='arc', name=name)

    def bounding_box(self):
        return self.cx - self.r, self.cx + self.r, self.cy - self.r, self.cy + self.r


class Contour2D(PlotDataObject):
    def __init__(self, plot_data_primitives: List[float],
                 plot_data_states: ContourSettings, name: str = '', ):
        self.plot_data_primitives = plot_data_primitives
        self.plot_data_states = plot_data_states
        PlotDataObject.__init__(self, type_='contour', name=name)

    def bounding_box(self):
        xmin, xmax, ymin, ymax = math.inf, -math.inf, math.inf, -math.inf
        for plot_data_primitive in self.plot_data_primitives:
            if hasattr(plot_data_primitive, 'bounding_box'):
                bb = plot_data_primitive.bounding_box()
                xmin, xmax, ymin, ymax = min(xmin, bb[0]), max(xmax,
                                                               bb[1]), min(
                    ymin, bb[2]), max(ymax, bb[3])

        return xmin, xmax, ymin, ymax


class PrimitiveGroup(PlotDataObject):
    def __init__(self, primitives, name: str = ''):
        self.primitives = primitives
        PlotDataObject.__init__(self, type_='primitivegroup', name=name)


color = {'black': 'k', 'blue': 'b', 'red': 'r', 'green': 'g'}


class ParallelPlot(PlotDataObject):
    def __init__(self, line_settings:LineSettings, disposition: str,
                 to_disp_attribute_names: List[str], rgbs, elements=None,
                 name: str = ''):
        self.elements = elements
        self.line_settings = line_settings
        self.disposition = disposition
        self.to_disp_attribute_names = to_disp_attribute_names
        self.rgbs = rgbs
        PlotDataObject.__init__(self, type_='parallelplot', name=name)


class Attribute(PlotDataObject):
    def __init__(self, type_: str = '', name: str = ''):
        PlotDataObject.__init__(self, type_=type_, name=name)


class MultiplePlots(PlotDataObject):
    def __init__(self, elements: List[any],
                 objects: List[Subclass[PlotDataObject]],
                 sizes: List[Window], coords: List[Tuple[float, float]],
                 name: str = ''):
        self.elements = elements
        self.objects = objects
        self.sizes = sizes
        self.coords = coords
        PlotDataObject.__init__(self, type_='multiplot', name=name)


def plot_canvas(plot_data_object: Subclass[PlotDataObject],
                debug_mode: bool = False, canvas_id: str = 'canvas',
                width: int = 750, height: int = 400):
    """
    Plot input data in web browser

    """
    first_letter = canvas_id[0]
    if not isinstance(first_letter, str):
        raise ValueError('canvas_id argument must not start with a number')
    data = plot_data_object.to_dict()
    plot_type = data['type_']
    if plot_type == 'primitivegroup':
        template = templates.contour_template
    elif plot_type == 'scatterplot' or plot_type == 'graph2d':
        template = templates.scatter_template
    elif plot_type == 'parallelplot':
        template = templates.parallelplot_template
    elif plot_type == 'multiplot':
        template = templates.multiplot_template
    else:
        raise NotImplementedError('Type {} not implemented'.format(plot_type))

    core_path = 'https://cdn.dessia.tech/js/plot-data/sid/core.js'
    if debug_mode:
        core_path = '/'.join(
            sys.modules[__name__].__file__.split('/')[:-2] + ['lib', 'core.js'])

    s = template.substitute(data=json.dumps(data), core_path=core_path,
                            canvas_id=canvas_id, width=width, height=height)
    temp_file = tempfile.mkstemp(suffix='.html')[1]

    with open(temp_file, 'wb') as file:
        file.write(s.encode('utf-8'))

    webbrowser.open('file://' + temp_file)
    print('file://' + temp_file)


def get_csv_vectors(filename):
    lines, variables = from_csv(filename=filename)
    catalog = Catalog(array=lines, variables=variables,
                      pareto_settings=ParetoSettings({}, enabled=False))
    return catalog


TYPE_TO_CLASS = {'arc': Arc2D, 'axis': Axis, 'circle': Circle2D,  # Attribute
                 'contour': Contour2D, 'graph2D': Dataset,
                 'graphs2D': Graph2D, 'linesegment': LineSegment,
                 'multiplot': MultiplePlots, 'parallelplot': ParallelPlot,
                 'point': Point2D, 'scatterplot': Scatter, 'tooltip': Tooltip,
                 'primitivegroup': PrimitiveGroup}


def bounding_box(plot_datas):
    xmin, xmax, ymin, ymax = math.inf, -math.inf, math.inf, -math.inf
    for plot_data in plot_datas:
        if hasattr(plot_data, 'bounding_box'):
            bb = plot_data.bounding_box()
            xmin, xmax = min(xmin, bb[0]), max(xmax, bb[1])
            ymin, ymax = min(ymin, bb[2]), max(ymax, bb[3])

    return xmin, xmax, ymin, ymax
