#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Feb 28 14:07:37 2017

@author: steven
"""

import os
import numpy as npy
import math
import sys
import json
import tempfile
import webbrowser
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from dessia_common import DessiaObject, full_classname
from dessia_common.typings import Subclass
from dessia_common.vectored_objects import from_csv, Catalog, ParetoSettings
import warnings

import plot_data.templates as templates

from typing import List, Tuple, Any, Union
import plot_data.colors as colors

npy.seterr(divide='raise')


def delete_none_from_dict(dict1):
    dict2 = {}
    for key, value in dict1.items():
        if type(value) == dict:
            dict2[key] = delete_none_from_dict(value)
        else:
            if value is not None:
                dict2[key] = value
    return dict2


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
        new_dict_ = delete_none_from_dict(dict_)
        return new_dict_

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
    """
    A class for setting hatchings on a surface.
    """
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


class EdgeStyle(DessiaObject):
    """
    A class for customizing edges (such as lines) style.

    :param line_width: line width in pixels
    :param color_stroke: the edge's color (rgb255)
    :param dashline: a list of positive floats [a1,...,an] representing a pattern where a_2i is the number of solid pixels and a_2i+1 is the number of empty pixels.
    """
    def __init__(self, line_width: float = None, color_stroke: str = None,
                 dashline: List[int] = None, name: str = ''):
        self.line_width = line_width
        self.color_stroke = color_stroke
        self.dashline = dashline
        DessiaObject.__init__(self, name=name)

DEFAULT_EDGESTYLE = EdgeStyle(color_stroke=colors.BLACK)

class PointStyle(DessiaObject):
    def __init__(self, color_fill: str = None, color_stroke: str = None,
                 stroke_width: float = None,
                 size: float = None, shape: str = None, name: str = ''):
        self.color_fill = color_fill
        self.color_stroke = color_stroke
        self.stroke_width = stroke_width
        self.size = size  # 1, 2, 3 or 4
        self.shape = shape
        DessiaObject.__init__(self, name=name)


class TextStyle(DessiaObject):
    def __init__(self, text_color: colors.Color = None,
                 font_size: float = None,
                 font_style: str = None,
                 text_align_x: str = None, text_align_y: str = None,
                 bold: bool = None, italic: bool = None,
                 name: str = ''):
        self.text_color = text_color
        self.font_size = font_size
        self.font_style = font_style
        self.text_align_x = text_align_x  # options : "left", "right", "center", "start" or "end"
        # see more about text_align_x's options: https://www.w3schools.com/tags/canvas_textalign.asp
        self.text_align_y = text_align_y  # options : "top", "hanging", "middle", "alphabetic", "ideographic" or "bottom"
        # see more about text_align_y's options: https://www.w3schools.com/tags/canvas_textbaseline.asp
        self.bold = bold
        self.italic = italic
        DessiaObject.__init__(self, name=name)


class SurfaceStyle(DessiaObject):
    def __init__(self, color_fill: str = None, opacity: float = None,
                 hatching: HatchingSet = None, name: str = ''):
        self.color_fill = color_fill
        self.opacity = opacity
        self.hatching = hatching
        DessiaObject.__init__(self, name=name)


class Text(PlotDataObject):
    """
    A class for displaying texts.
    """
    def __init__(self, comment: str, position_x: float, position_y: float,
                 text_style: TextStyle = None, text_scaling: bool = None,
                 max_width: float = None, name: str = ''):
        self.text_style = text_style
        self.comment = comment
        self.position_x = position_x
        self.position_y = position_y
        self.text_scaling = text_scaling
        self.max_width = max_width
        PlotDataObject.__init__(self, type_='text', name=name)

    def mpl_plot(self, ax=None, color='k', alpha=1.):
        """
        Plots using Matplotlib.
        """
        if not ax:
            _, ax = plt.subplots()
        ax.text(self.position_x, self.position_y,
                self.comment,
                color=color,
                alpha=alpha)

        return ax


class Line2D(PlotDataObject):
    def __init__(self, data: List[float], edge_style: EdgeStyle = None,
                 name: str = ''):
        self.data = data
        self.edge_style = edge_style
        PlotDataObject.__init__(self, type_='line2d', name=name)


    def mpl_plot(self, ax=None):
        
        if ax is None:
            _, ax = plt.subplots()
        
        if not self.edge_style:
            color = DEFAULT_EDGESTYLE.color_stroke.rgb
            dashes = DEFAULT_EDGESTYLE.dashline
        else:
            color = self.edge_style.color_stroke.rgb
            dashes = self.edge_style.dashline

        ax.axline((self.data[0], self.data[1]),(self.data[2], self.data[3]),
                  color=color, dashes=dashes)

class LineSegment2D(PlotDataObject):
    def __init__(self, data: List[float], edge_style: EdgeStyle = None,
                 name: str = ''):
        self.data = data
        if edge_style is None:
            self.edge_style = EdgeStyle()
        else:
            self.edge_style = edge_style
        PlotDataObject.__init__(self, type_='linesegment2d', name=name)

    def bounding_box(self):
        return (min(self.data[0], self.data[2]),
                max(self.data[0], self.data[2]),
                min(self.data[1], self.data[3]),
                max(self.data[1], self.data[3]))

    def mpl_plot(self, ax=None):
        if not ax:
            _, ax = plt.subplots()
            
        if self.edge_style and self.edge_style.color_stroke:
            color = self.edge_style.color_stroke.rgb
        else:
            color = colors.BLACK.rgb
        ax.plot([self.data[0], self.data[2]], [self.data[1], self.data[3]],
                color=color)
        return ax


class LineSegment(LineSegment2D):
    def __init__(self, data: List[float], edge_style: EdgeStyle = None,
                 name: str = ''):
        LineSegment2D.__init__(self, data=data, edge_style=edge_style,
                               name=name)
        warnings.warn("LineSegment is deprecated, use LineSegment2D instead",
                      DeprecationWarning)


class Circle2D(PlotDataObject):
    def __init__(self, cx: float, cy: float, r: float,
                 edge_style: EdgeStyle = None,
                 surface_style: SurfaceStyle = None,
                 name: str = ''):
        self.edge_style = edge_style
        self.surface_style = surface_style
        self.r = r
        self.cy = cy
        self.cx = cx
        PlotDataObject.__init__(self, type_='circle', name=name)

    def bounding_box(self):
        return self.cx - self.r, self.cx + self.r, self.cy - self.r, self.cy + self.r

    def mpl_plot(self, ax=None):
        if not ax:
            _, ax = plt.subplots()
        if self.edge_style:
            edgecolor = self.edge_style.color_stroke.rgb
            dashes = DEFAULT_EDGESTYLE.dashline
        else:
            edgecolor = DEFAULT_EDGESTYLE.color_stroke.rgb
            dashes = DEFAULT_EDGESTYLE.dashline
        if self.surface_style:
            facecolor = self.surface_style.color_fill
            surface_alpha = self.surface_style.opacity
        else:
            facecolor = None
            surface_alpha = 0

        ax.add_patch(patches.Circle((self.cx, self.cy), self.r,
                                    edgecolor=edgecolor,
                                    facecolor=facecolor,
                                    fill=surface_alpha>0))
        return ax


class Point2D(PlotDataObject):
    def __init__(self, cx: float, cy: float, shape: str = 'circle',
                 size: float = 2,
                 color_fill: colors.Color = colors.LIGHTBLUE,
                 color_stroke: colors.Color = colors.BLACK,
                 stroke_width: float = 0.5,
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
    def __init__(self, nb_points_x: int = 10, nb_points_y: int = 10,
                 graduation_style: TextStyle = None,
                 axis_style: EdgeStyle = None, arrow_on: bool = False,
                 grid_on: bool = True, name: str = ''):
        self.nb_points_x = nb_points_x
        self.nb_points_y = nb_points_y
        self.graduation_style = graduation_style
        if graduation_style is None:
            self.graduation_style = TextStyle(text_color=colors.GREY)
        self.axis_style = axis_style
        if axis_style is None:
            self.axis_style = EdgeStyle(color_stroke=colors.LIGHTGREY)
        self.arrow_on = arrow_on
        self.grid_on = grid_on
        PlotDataObject.__init__(self, type_='axis', name=name)


class Tooltip(PlotDataObject):
    def __init__(self, to_disp_attribute_names: List[str],
                 surface_style: SurfaceStyle = None,
                 text_style: TextStyle = None, tooltip_radius: float = 5,
                 name: str = ''):
        self.to_disp_attribute_names = to_disp_attribute_names
        self.surface_style = surface_style
        if surface_style is None:
            self.surface_style = SurfaceStyle(color_fill=colors.LIGHTBLUE,
                                              opacity=0.75)
        self.text_style = text_style
        if text_style is None:
            self.text_style = TextStyle(text_color=colors.BLACK, font_size=10)
        self.tooltip_radius = tooltip_radius
        PlotDataObject.__init__(self, type_='tooltip', name=name)


class Dataset(PlotDataObject):
    to_disp_attribute_names = None

    def __init__(self, edge_style: EdgeStyle = None, tooltip: Tooltip = None,
                 point_style: PointStyle = None,
                 elements=None, display_step: float = 1, name: str = ''):

        self.edge_style = edge_style
        self.tooltip = tooltip
        self.point_style = point_style
        if elements is None:
            self.elements = []
        else:
            self.elements = elements
        self.display_step = display_step
        PlotDataObject.__init__(self, type_='dataset', name=name)


class Graph2D(PlotDataObject):
    def __init__(self, graphs: List[Dataset], to_disp_attribute_names,
                 axis: Axis = None, name: str = ''):
        self.graphs = graphs
        self.to_disp_attribute_names = to_disp_attribute_names
        if axis is None:
            self.axis = Axis()
        else:
            self.axis = axis
        PlotDataObject.__init__(self, type_='graph2d', name=name)


class Scatter(PlotDataObject):
    def __init__(self, tooltip: Tooltip,
                 to_disp_attribute_names: List[str],
                 point_style: PointStyle = None,
                 elements: List[Any] = None, axis: Axis = None,
                 name: str = ''):
        self.tooltip = tooltip
        self.to_disp_attribute_names = to_disp_attribute_names
        self.point_style = point_style
        if not elements:
            self.elements = []
        else:
            self.elements = elements
        if axis:
            self.axis = Axis()
        else:
            self.axis = axis

        PlotDataObject.__init__(self, type_='scatterplot', name=name)


class Arc2D(PlotDataObject):
    def __init__(self, cx: float, cy: float, r: float, start_angle: float,
                 end_angle: float, data=None, anticlockwise: bool = None,
                 edge_style: EdgeStyle = None,
                 name: str = ''):
        self.cx = cx
        self.cy = cy
        self.r = r
        self.start_angle = start_angle
        self.end_angle = end_angle
        self.data = data
        self.anticlockwise = anticlockwise
        self.edge_style = edge_style
        PlotDataObject.__init__(self, type_='arc', name=name)

    def bounding_box(self):
        return self.cx - self.r, self.cx + self.r, self.cy - self.r, self.cy + self.r

    def mpl_plot(self, ax=None):
        if not ax:
            _, ax = plt.subplots()
        if self.edge_style:
            edgecolor = self.edge_style.color_stroke
        else:
            edgecolor = colors.BLACK.rgb
            
        ax.add_patch(patches.Arc((self.cx, self.cy), 2 * self.r, 2 * self.r, angle=0,
                                 theta1=self.start_angle * 0.5 / math.pi * 360,
                                 theta2=self.end_angle * 0.5 / math.pi * 360,
                                 edgecolor=edgecolor))

        return ax


class Contour2D(PlotDataObject):
    def __init__(self, plot_data_primitives: List[Union[Arc2D, Line2D]],
                 edge_style: EdgeStyle = None,
                 surface_style: SurfaceStyle = None, name: str = ''):
        self.plot_data_primitives = plot_data_primitives
        self.edge_style = edge_style
        self.surface_style = surface_style
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

    def mpl_plot(self, ax=None):
        for primitive in self.plot_data_primitives:
            ax = primitive.mpl_plot(ax=ax)
        return ax


class Label(PlotDataObject):
    def __init__(self, title: str, text_style: TextStyle = None, rectangle_surface_style: SurfaceStyle = None,
                 rectangle_edge_style: EdgeStyle = None, name: str = ''):
        self.title = title
        self.text_style = text_style
        self.rectangle_surface_style = rectangle_surface_style
        self.rectangle_edge_style = rectangle_edge_style
        PlotDataObject.__init__(self, type_='label', name=name)


class MultipleLabels(PlotDataObject):
    def __init__(self, labels: List[Label], name: str = ''):
        self.labels = labels
        PlotDataObject.__init__(self, type_='multiplelabels', name=name)


class PrimitiveGroup(PlotDataObject):
    def __init__(self, primitives: List[Union[Contour2D, Arc2D, LineSegment2D,
                                              Circle2D, Line2D]],
                 name: str = ''):
        self.primitives = primitives
        PlotDataObject.__init__(self, type_='primitivegroup', name=name)

    def mpl_plot(self, ax=None, equal_aspect=True):
        ax = self.primitives[0].mpl_plot(ax=ax)
        for primitive in self.primitives[1:]:
            primitive.mpl_plot(ax=ax)
        ax.set_aspect('equal')
        return ax

    def bounding_box(self):
        xmin, xmax, ymin, ymax = math.inf, -math.inf, math.inf, -math.inf
        for primitive in self.primitives:
            if not hasattr(primitive, 'bounding_box'):
                continue
            p_xmin, p_xmax, p_ymin, p_ymax = primitive.bounding_box()
            xmin = min(xmin, p_xmin)
            xmax = max(xmax, p_xmax)
            ymin = min(ymin, p_ymin)
            ymax = max(ymax, p_ymax)
        return xmin, xmax, ymin, ymax


class PrimitiveGroupsContainer(PlotDataObject):
    def __init__(self, primitive_groups: List[PrimitiveGroup],
                 sizes: List[Tuple[float, float]] = None,
                 coords: List[Tuple[float, float]] = None,
                 name: str = ''):
        self.primitive_groups = primitive_groups
        self.sizes = sizes
        self.coords = coords
        PlotDataObject.__init__(self, type_='primitivegroupcontainer',
                                name=name)


class ParallelPlot(PlotDataObject):
    def __init__(self, edge_style: EdgeStyle = None, disposition: str = None,
                 to_disp_attribute_names: List[str] = None,
                 rgbs: List[float] = None, elements=None,
                 name: str = ''):
        self.elements = elements
        self.edge_style = edge_style
        self.disposition = disposition
        self.to_disp_attribute_names = to_disp_attribute_names
        self.rgbs = rgbs
        PlotDataObject.__init__(self, type_='parallelplot', name=name)


class Attribute(PlotDataObject):
    def __init__(self, type_: str = '', name: str = ''):
        PlotDataObject.__init__(self, type_=type_, name=name)


class PointFamily(PlotDataObject):
    def __init__(self, point_color: str, point_index: List[int],
                 name: str = ''):
        self.color = point_color
        self.point_index = point_index
        PlotDataObject.__init__(self, type_=None, name=name)


class MultiplePlots(PlotDataObject):
    def __init__(self, plots: List[Subclass[PlotDataObject]],
                 sizes: List[Window] = None, elements: List[any] = None,
                 coords: List[Tuple[float, float]] = None,
                 point_families: List[PointFamily] = None,
                 initial_view_on: bool = None,
                 name: str = ''):
        self.elements = elements
        self.plots = plots
        self.sizes = sizes
        self.coords = coords
        self.point_families = point_families
        self.initial_view_on = initial_view_on
        PlotDataObject.__init__(self, type_='multiplot', name=name)


def plot_canvas(plot_data_object: Subclass[PlotDataObject],
                debug_mode: bool = False, canvas_id: str = 'canvas',
                width: int = 750, height: int = 400, page_name=None):
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
    elif plot_type == 'primitivegroupcontainer':
        template = templates.primitive_group_container_template
    else:
        raise NotImplementedError('Type {} not implemented'.format(plot_type))

    lib_path = 'https://cdn.dessia.tech/js/plot-data/latest/core.js'
    if debug_mode:
        core_path = os.sep + os.path.join(
            *sys.modules[__name__].__file__.split(os.sep)[:-2], 'lib',
            'core.js')

        if not os.path.isfile(core_path):
            print('Local compiled core.js not found, fall back to CDN')
        else:
            lib_path = core_path

    s = template.substitute(data=json.dumps(data), core_path=lib_path,
                            canvas_id=canvas_id, width=width, height=height)
    if page_name is None:
        temp_file = tempfile.mkstemp(suffix='.html')[1]

        with open(temp_file, 'wb') as file:
            file.write(s.encode('utf-8'))

        webbrowser.open('file://' + temp_file)
        print('file://' + temp_file)
    else:
        with open(page_name + '.html', 'wb') as file:
            file.write(s.encode('utf-8'))

        # webbrowser.open('file://'+page_name+'.html')
        webbrowser.open('file://' + os.path.realpath(page_name + '.html'))
        print(page_name + '.html')


def get_csv_vectors(filepath):
    lines, variables = from_csv(filename=filepath)
    catalog = Catalog(array=lines, variables=variables,
                      pareto_settings=ParetoSettings({}, enabled=False))
    return catalog


TYPE_TO_CLASS = {'arc': Arc2D, 'axis': Axis, 'circle': Circle2D,  # Attribute
                 'contour': Contour2D, 'graph2D': Dataset,
                 'graphs2D': Graph2D, 'linesegment2d': LineSegment,
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
