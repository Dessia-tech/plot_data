#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Definition of language and plots
"""

import json
import math
import os
import sys
import tempfile
import warnings
import webbrowser
from typing import Any, Dict, List, Tuple, Union

import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
import numpy as npy

try:
    # dessia_common >= 0.12.0
    from dessia_common.serialization import serialize
except ImportError:
    # dessia_common < 0.12.0.
    from dessia_common.utils.serialization import serialize

from dessia_common.core import DessiaObject

from dessia_common.typings import JsonSerializable
from matplotlib import patches

import plot_data.colors
from plot_data import templates

npy.seterr(divide='raise')


def delete_none_from_dict(dict1):
    """ Delete input dictionary's keys where value is None. """
    dict2 = {}
    for key, value in dict1.items():
        if isinstance(value, dict):
            dict2[key] = delete_none_from_dict(value)
        else:
            if value is not None:
                dict2[key] = value
    return dict2


class PlotDataObject(DessiaObject):
    """ Abstract interface for DessiaObject implementation in module. """

    def __init__(self, type_: str, name: str = '', **kwargs):
        self.type_ = type_
        DessiaObject.__init__(self, name=name, **kwargs)

    def to_dict(self, *args, **kwargs) -> JsonSerializable:
        """ Redefines DessiaObject's to_dict() in order to not use pointers and remove keys where value is None. """
        dict_ = DessiaObject.to_dict(self, use_pointers=False)
        del dict_['object_class']
        package_name = self.__module__.split('.', maxsplit=1)[0]
        if package_name in sys.modules:
            package = sys.modules[package_name]
            if hasattr(package, '__version__'):
                dict_['package_version'] = package.__version__

        new_dict_ = delete_none_from_dict(dict_)
        return new_dict_

    # @classmethod
    # def dict_to_object(cls, dict_: JsonSerializable, force_generic: bool = False, global_dict=None,
    #                    pointers_memo: Dict[str, Any] = None, path: str = '#') -> 'DessiaObject':
    #     """ Reset object_class in order to instantiate right object. """
    #     type_ = dict_['type_']
    #     object_class = TYPE_TO_CLASS[type_]
    #     dict_["object_class"] = f"{object_class.__module__}.{object_class.__name__}"
    #     return DessiaObject.dict_to_object(dict_=dict_, force_generic=True, global_dict=global_dict,
    #                                        pointers_memo=pointers_memo, path=path)

    def plot_data(self):
        raise NotImplementedError("It is strange to call plot_data method from a plot_data object."
                                  f" Check the class '{self.__class__.__name__}' you are calling")

    def mpl_plot(self, ax=None):
        """
        Overloading of dessia object mpl_plot
        """
        warnings.warn(f'class {self.__class__.__name__} does not implement mpl_plot, not plotting.')
        return ax


class Sample(PlotDataObject):
    """
    Graph Point.
    """

    def __init__(self, values, reference_path: str = "#", name: str = ""):
        self.values = values
        self.reference_path = reference_path

        PlotDataObject.__init__(self, type_="sample", name=name)

    def to_dict(self, *args, **kwargs) -> JsonSerializable:
        """
        Overwrite generic to_dict.

        TODO Check if it can be generic (probably)
        """
        dict_ = PlotDataObject.to_dict(self, *args, **kwargs)
        dict_.update({"reference_path": self.reference_path, "name": self.name})
        dict_.update(serialize(self.values))
        # TODO Keeping values at dict_ level before refactor, should be removed after and use dict_["values"] instead
        return dict_

    @classmethod
    def dict_to_object(cls, dict_: JsonSerializable, force_generic: bool = False, global_dict=None,
                       pointers_memo: Dict[str, Any] = None, path: str = '#') -> 'Sample':
        """
        Overwrite generic dict_to_object.

        TODO Check if it can be generic (probably)
        """
        reference_path = dict_["reference_path"]
        name = dict_["name"]
        values = dict_["values"]
        return cls(values=values, reference_path=reference_path, name=name)

    def plot_data(self):
        raise NotImplementedError("Method plot_data is not defined for class Sample.")


class HatchingSet(DessiaObject):
    """
    A class for setting hatchings on a surface.

    :param stroke_width: lines' width
    :type stroke_width: float
    :param hatch_spacing: the spacing between two hatching in pixels
    :type hatch_spacing: float
    """

    def __init__(self, stroke_width: float = 1, hatch_spacing: float = 10,
                 name: str = ''):
        self.stroke_width = stroke_width
        self.hatch_spacing = hatch_spacing
        DessiaObject.__init__(self, name=name)


class Window(DessiaObject):
    def __init__(self, width: float, height: float, name: str = ''):
        self.width = width
        self.height = height
        DessiaObject.__init__(self, name=name)


class EdgeStyle(DessiaObject):
    """
    A class for customizing edges (such as lines) style.

    :param line_width: line width in pixels.
    :type line_width: float
    :param color_stroke: the edge's color (rgb255).
    :type color_stroke: plot_data.Colors.Color
    :param dashline: a list of positive floats [a1,...,an] representing \
    a pattern where a_2i is the number of solid pixels and a_2i+1 is \
    the number of empty pixels.
    :type dashline: List[float]
    """

    def __init__(self, line_width: float = None, color_stroke: plot_data.colors.Color = None,
                 dashline: List[int] = None, name: str = ''):
        self.line_width = line_width
        self.color_stroke = color_stroke
        self.dashline = dashline
        DessiaObject.__init__(self, name=name)

    def mpl_arguments(self, surface=False):
        args = {}
        if self.color_stroke:
            if surface:
                args['edgecolor'] = self.color_stroke.rgb
            else:
                args['color'] = self.color_stroke.rgb
        if self.line_width:
            args['linewidth'] = self.line_width
        if self.dashline:
            args['dashes'] = self.dashline
        return args


class PointStyle(DessiaObject):
    """
    A class for customizing Point2D.

    :param color_fill: must be in rgb255.
    :type color_fill: str
    :param color_stroke: must be in rgb255.
    :type color_stroke: str
    :param stroke_width: the point contour's width.
    :type stroke_width: float
    :param size: must be 1, 2, 3 or 4.
    :type size: float
    :param shape: 'circle', 'square' or 'crux'.
    :type shape: str
    """

    def __init__(self, color_fill: str = None, color_stroke: str = None,
                 stroke_width: float = None,
                 size: float = None, shape: str = None, name: str = ''):
        self.color_fill = color_fill
        self.color_stroke = color_stroke
        self.stroke_width = stroke_width
        self.size = size  # 1, 2, 3 or 4
        self.shape = shape
        DessiaObject.__init__(self, name=name)

    def mpl_arguments(self):
        args = {}
        if self.color_fill:
            args['color'] = self.color_fill.rgb
        if self.color_stroke:
            args['markeredgecolor'] = self.color_stroke.rgb
        return args

    @classmethod
    def dict_to_object(cls, dict_, *args, **kwargs):
        obj = DessiaObject.dict_to_object(dict_, *args, **kwargs)
        if obj.color_fill:
            obj.color_fill = plot_data.colors.Color.dict_to_object(obj.color_fill)
        if obj.color_stroke:
            obj.color_stroke = plot_data.colors.Color.dict_to_object(obj.color_stroke)
        return obj


class TextStyle(DessiaObject):
    """
    A class for customizing Text.

    :param text_color: the text's color
    :type text_color: plot_data.colors.Colors
    :param font_size: the font size
    :type font_size: float
    :param font_style: 'Arial', 'Verdana', 'Times New Roman', 'Courier \
    New', 'serif' or 'sans-serif'
    :type font_style: str
    :param text_align_x: "left", "right", "center", "start" or "end". \
    More info on https://www.w3schools.com/tags/canvas_textalign.asp
    :type text_align_x: str
    :param text_align_y: "top", "hanging", "middle", "alphabetic", \
    "ideographic" or "bottom". More info on \
    https://www.w3schools.com/tags/canvas_textbaseline.asp
    :type text_align_y: str
    :param bold:
    :type bold: bool
    :param italic:
    :type italic: bool
    :param angle: Text angle in degrees. The angle is clockwise.
    :type angle: float
    """

    def __init__(self, text_color: plot_data.colors.Color = None,
                 font_size: float = None,
                 font_style: str = None,
                 text_align_x: str = None, text_align_y: str = None,
                 bold: bool = None, italic: bool = None,
                 angle: float = None, name: str = ''):
        self.text_color = text_color
        self.font_size = font_size
        self.font_style = font_style
        self.text_align_x = text_align_x
        self.text_align_y = text_align_y
        self.bold = bold
        self.italic = italic
        self.angle = angle
        DessiaObject.__init__(self, name=name)

    @classmethod
    def dict_to_object(cls, dict_, *args, **kwargs):
        obj = DessiaObject.dict_to_object(dict_, force_generic=True, *args, **kwargs)
        if obj.text_color:
            obj.text_color = plot_data.colors.Color.dict_to_object(obj.text_color)
        return obj


class SurfaceStyle(DessiaObject):
    """
    A class for customizing surfaces.

    :param color_fill: fill color
    :type color_fill: str
    :param opacity: from 0 (transparent) to 1 (opaque).
    :type opacity: float
    :param hatching: for setting hatchings
    :type hatching: HatchingSet
    """

    def __init__(self, color_fill: str = None, opacity: float = 1.,
                 hatching: HatchingSet = None, name: str = ''):
        # TODO: migrate from str to Color object
        self.color_fill = color_fill
        self.opacity = opacity
        self.hatching = hatching
        DessiaObject.__init__(self, name=name)

    @classmethod
    def dict_to_object(cls, dict_, *args, **kwargs):
        obj = DessiaObject.dict_to_object(dict_, force_generic=True, *args, **kwargs)
        if obj.color_fill:
            obj.color_fill = plot_data.colors.Color.dict_to_object(obj.color_fill)
        return obj

    def mpl_arguments(self):
        args = {}
        if self.color_fill:
            args['facecolor'] = self.color_fill.rgb
        if self.hatching:
            args['hatch'] = "\\"
        if self.opacity and self.opacity > 0:
            args['alpha'] = self.opacity
            args['fill'] = True
        return args


DEFAULT_EDGESTYLE = EdgeStyle(color_stroke=plot_data.colors.BLACK)
DEFAULT_POINTSTYLE = PointStyle(color_stroke=plot_data.colors.BLACK, color_fill=plot_data.colors.WHITE)
DEFAULT_TEXTSTYLE = TextStyle(text_color=plot_data.colors.BLACK)
DEFAULT_SURFACESTYLE = SurfaceStyle(color_fill=plot_data.colors.WHITE, opacity=1.)  # Not sure about opacity=1 in TS


class Text(PlotDataObject):
    """
    A class for displaying texts on canvas. Text is a primitive and can be
    instantiated by PrimitiveGroup.

    :param comment: the comment you want to display
    :type comment: str
    :param position_x: the text's x position
    :type position_x: float
    :param position_y: the text's y position
    :type position_y: float
    :param text_style: for customization (optional)
    :type text_style: TextStyle
    :param text_scaling: True if you want the text the be rescaled \
    when zooming and False otherwise.
    :type text_scaling: bool
    :param max_width: Set a maximum length for the text. If the text \
    is longer than max_width, it is split into several lines.
    :type max_width: float
    :param multi_lines: This parameter is only useful when max_width parameter is set \
    In that case, you can choose between squishing the text in one line or writing on \
    multiple lines.
    :type multi_lines: bool
    """

    def __init__(self, comment: str, position_x: float, position_y: float,
                 text_style: TextStyle = None, text_scaling: bool = None,
                 max_width: float = None, multi_lines: bool = True, name: str = ''):
        self.comment = comment
        self.text_style = text_style
        self.position_x = position_x
        self.position_y = position_y
        self.text_scaling = text_scaling
        self.max_width = max_width
        self.multi_lines = multi_lines
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
    """
    An infinite line. Line2D is a primitive and can be instantiated by \
    PrimitiveGroups.

    :param point1: first endpoint of the line segment [x1, y1].
    :type point1: List[float]
    :param point2: first endpoint of the line segment [x2, y2].
    :type point2: List[float]
    :param edge_style: for customization
    :type edge_style: EdgeStyle
    """

    def __init__(self, point1: List[float], point2: List[float],
                 edge_style: EdgeStyle = None, name: str = ''):
        self.data = point1 + point2
        self.edge_style = edge_style
        PlotDataObject.__init__(self, type_='line2d', name=name)

    def mpl_plot(self, ax=None, edge_style=None):
        """
        Plots using matplotlib.
        """
        if ax is None:
            _, ax = plt.subplots()

        style = self.edge_style
        if edge_style:
            style = edge_style
        if style is None:
            style = DEFAULT_EDGESTYLE

        color = style.color_stroke.rgb
        dashes = style.dashline

        ax.axline((self.data[0], self.data[1]), (self.data[2], self.data[3]),
                  color=color, dashes=dashes)
        return ax


class LineSegment2D(PlotDataObject):
    """
    A line segment. This is a primitive that can be called by \
    PrimitiveGroup.

    :param point1: first endpoint of the line segment [x1, y1].
    :type point1: List[float]
    :param point2: first endpoint of the line segment [x2, y2].
    :type point2: List[float]
    :param edge_style: for customization
    :type edge_style: EdgeStyle
    """

    def __init__(self, point1: List[float], point2: List[float],
                 edge_style: EdgeStyle = None,
                 name: str = ''):
        # Data is used in typescript
        self.data = point1 + point2
        self.point1 = point1
        self.point2 = point2

        if edge_style is None:
            self.edge_style = EdgeStyle()
        else:
            self.edge_style = edge_style
        PlotDataObject.__init__(self, type_='linesegment2d', name=name)

    def bounding_box(self):
        """
        :return: the line segment's bounding box.
        :rtype: float, float, float, float
        """
        return (min(self.data[0], self.data[2]),
                max(self.data[0], self.data[2]),
                min(self.data[1], self.data[3]),
                max(self.data[1], self.data[3]))

    def to_dict(self):
        dict_ = DessiaObject.to_dict(self)
        dict_['object_class'] = 'plot_data.core.LineSegment2D'  # To force migration to linesegment -> linesegment2d
        return dict_

    def polygon_points(self):
        return [self.point1, self.point2]

    def mpl_plot(self, ax=None, edge_style=None):
        """
        Plots using matplotlib.
        """
        if not ax:
            _, ax = plt.subplots()

        if edge_style:
            edge_style = self.edge_style
        else:
            edge_style = DEFAULT_EDGESTYLE

        ax.plot([self.point1[0], self.point2[0]], [self.point1[1], self.point2[1]],
                **edge_style.mpl_arguments())
        return ax


class LineSegment(LineSegment2D):
    def __init__(self, data: List[float], edge_style: EdgeStyle = None,
                 name: str = ''):
        # When to remove support?
        warnings.warn("LineSegment is deprecated, use LineSegment2D instead",
                      DeprecationWarning)

        self.data = data
        LineSegment2D.__init__(self, point1=self.data[:2], point2=self.data[2:], edge_style=edge_style,
                               name=name)

    def to_dict(self, *args, **kwargs):
        ls2d = LineSegment2D(point1=self.data[:2], point2=self.data[2:], edge_style=self.edge_style,
                             name=self.name)
        return ls2d.to_dict()


class Wire(PlotDataObject):
    """
    A set of connected lines. It also provides highlighting feature.
    :param lines: [(x1, y1), ..., (xn,yn)]
    :type lines: List[Tuple[float, float]]
    :param edge_style: Line settings
    :type edge_style: EdgeStyle
    :param tooltip: a message that is displayed in a tooltip
    :type tooltip: str
    """

    def __init__(self, lines: List[Tuple[float, float]], edge_style: EdgeStyle = None,
                 tooltip: str = None, name: str = ""):
        self.lines = lines
        self.edge_style = edge_style
        self.tooltip = tooltip
        PlotDataObject.__init__(self, type_="wire", name=name)

    def mpl_plot(self, ax=None):
        """
        Plots using matplotlib
        """
        if self.edge_style:
            edge_style = self.edge_style
        else:
            edge_style = DEFAULT_EDGESTYLE

        ax.plot([p[0] for p in self.lines], [p[1] for p in self.lines], **edge_style.mpl_arguments())
        return ax


class Circle2D(PlotDataObject):
    """
    A circle. It is a primitive and can be instantiated by PrimitiveGroup.

    :param cx: the center's x position.
    :type cx: float
    :param cy: the center's y position
    :type cy: float
    :param r: radius
    :type r: float
    :param edge_style: customization of the circle's contour
    :type edge_style: EdgeStyle
    :param surface_style: customization of the circle's interior
    :type surface_style: SurfaceStyle
    :param tooltip: tooltip message
    :type tooltip: str
    """

    def __init__(self, cx: float, cy: float, r: float,
                 edge_style: EdgeStyle = None,
                 surface_style: SurfaceStyle = None,
                 tooltip: str = None,
                 name: str = ''):
        self.edge_style = edge_style
        self.surface_style = surface_style
        self.r = r
        self.cx = cx
        self.cy = cy
        self.tooltip = tooltip
        PlotDataObject.__init__(self, type_='circle', name=name)

    def bounding_box(self):
        """
        :return: the circle's bounding box
        :rtype: float, float, float, float
        """
        return self.cx - self.r, self.cx + self.r, self.cy - self.r, self.cy + self.r

    def mpl_plot(self, ax=None):
        """
        Plots using matplotlib
        """
        if not ax:
            _, ax = plt.subplots()
        if self.edge_style:
            edge_style = self.edge_style
        else:
            edge_style = DEFAULT_EDGESTYLE
            # dashes = DEFAULT_EDGESTYLE.dashline
        args = edge_style.mpl_arguments(surface=True)

        if self.surface_style:
            surface_style = self.surface_style
        else:
            surface_style = DEFAULT_SURFACESTYLE

        args.update(surface_style.mpl_arguments())

        ax.add_patch(patches.Circle((self.cx, self.cy), self.r,
                                    **args))
        return ax


class Point2D(PlotDataObject):
    """
    A class for instantiating a point.

    :param cx: the point center's x position
    :type cx: float
    :param cy: the point center's y position
    :type cy: float
    :param point_style: the point's customization.
    :type point_style: PointStyle
    """

    def __init__(self, cx: float, cy: float,
                 point_style: PointStyle = None,
                 name: str = ''):
        self.cx = cx
        self.cy = cy
        self.point_style = point_style
        PlotDataObject.__init__(self, type_='point', name=name)

    def bounding_box(self):
        """
        :return: the point's bounding box.
        :rtype: float, float, float, float
        """
        return self.cx, self.cx, self.cy, self.cy

    def mpl_plot(self, ax=None):
        if ax is None:
            _, ax = plt.subplots()

        if self.point_style:
            style = self.point_style
        else:
            style = DEFAULT_POINTSTYLE

        ax.plot([self.cx], [self.cy], marker='o', **style.mpl_arguments())
        return ax


class Axis(PlotDataObject):
    """
    A class that contains information for drawing axis.

    :param nb_points_x: the average number of points displayed on the \
    x-axis.
    :type nb_points_x: int
    :param nb_points_y: the average number of points displayed on the \
    y-axis.
    :type nb_points_y: int
    :param graduation_style: for graduation customization
    :type graduation_style: TextStyle
    :param axis_style: for customizing the axis itself.
    :type axis_style: EdgeStyle
    :param arrow_on: True if you want an arrow to be displayed on axis,\
     False otherwise.
    :type arrow_on: bool
    :param grid_on: True if you want the display a grid, False otherwise
    :type grid_on: bool
    """

    def __init__(self, nb_points_x: int = 10, nb_points_y: int = 10,
                 graduation_style: TextStyle = None,
                 axis_style: EdgeStyle = None, arrow_on: bool = False,
                 grid_on: bool = True, name: str = ''):
        self.nb_points_x = nb_points_x
        self.nb_points_y = nb_points_y
        self.graduation_style = graduation_style
        if graduation_style is None:
            self.graduation_style = TextStyle(text_color=plot_data.colors.GREY)
        self.axis_style = axis_style
        if axis_style is None:
            self.axis_style = EdgeStyle(color_stroke=plot_data.colors.LIGHTGREY)
        self.arrow_on = arrow_on
        self.grid_on = grid_on
        PlotDataObject.__init__(self, type_='axis', name=name)


class Tooltip(PlotDataObject):
    """
    A class that contains information for drawing a tooltip when \
    clicking on points.
    A tooltip object is instantiated by Scatter and Dataset classes.

    :param attributes: a list containing the attributes \
    you want to display. Attributes must be taken from Dataset's or \
    Scatter's elements.
    :type attributes: List[str]
    :param surface_style: for customizing the tooltip's interior
    :type surface_style: SurfaceStyle
    :param text_style: for customizing its text
    :type text_style: TextStyle
    :param tooltip_radius: a tooltip is rounded-rectangle-shaped. \
    This parameter defines its corners radius.
    :type tooltip_radius: float
    """

    def __init__(self, attributes: List[str] = None,
                 text: str = None,
                 surface_style: SurfaceStyle = None,
                 text_style: TextStyle = None, tooltip_radius: float = None,
                 name: str = ''):
        self.attributes = attributes
        self.text = text
        self.surface_style = surface_style
        if surface_style is None:
            self.surface_style = SurfaceStyle(color_fill=plot_data.colors.LIGHTBLUE,
                                              opacity=0.75)
        self.text_style = text_style
        if text_style is None:
            self.text_style = TextStyle(text_color=plot_data.colors.BLACK, font_size=10)
        self.tooltip_radius = tooltip_radius
        PlotDataObject.__init__(self, type_='tooltip', name=name)


class Dataset(PlotDataObject):
    """
    Numerous points are joined by line segments to display a \
    mathematical curve.
    Datasets are instantiated by Graph2D to display multiple datasets \
    on one canvas.

    :param elements: A list of vectors. Vectors must have the same \
    attributes (ie the same keys)
    :type elements: List[dict]
    :param edge_style: for customizing line segments.
    :type edge_style: EdgeStyle
    :param point_style: for customizing points
    :type point_style: PointStyle
    :param tooltip: an object containing all information for drawing \
    tooltips
    :type tooltip: Tooltip
    :param display_step: a value that limits the number of points \
    displayed.
    :type display_step: int
    :param attribute_names: [attribute_x, attribute_y] where \
    attribute_x is the attribute displayed on x-axis and attribute_y \
    is the attribute displayed on y-axis.
    :type attribute_names: [str, str]
    """
    attribute_names = None

    def __init__(self, elements: List[Sample] = None,
                 edge_style: EdgeStyle = None, tooltip: Tooltip = None,
                 point_style: PointStyle = None,
                 display_step: int = 1, name: str = ''):

        self.edge_style = edge_style
        self.tooltip = tooltip
        self.point_style = point_style
        if elements is None:
            elements = []
        sampled_elements = []
        for element in elements:
            # RetroCompat' < 0.11.0
            if not isinstance(element, Sample) and isinstance(element, Dict):
                reference_path = element.pop("reference_path", "#")
                element_name = element.pop("name", "")
                sampled_elements.append(Sample(values=element, reference_path=reference_path, name=element_name))
            elif isinstance(element, Sample):
                sampled_elements.append(element)
            else:
                raise ValueError(f"Element of type {type(element)} cannot be used as a Dataset data element.")
        self.elements = sampled_elements
        self.display_step = display_step
        PlotDataObject.__init__(self, type_='dataset', name=name)


class Graph2D(PlotDataObject):
    """
    Takes one or several Datasets as input and displays them all in \
    one canvas.

    :param graphs: a list of Datasets
    :type graphs: List[Dataset]
    :param x_variable: variable that you want to display on x axis
    :type x_variable: str
    :param y_variable: variable that you want to display on y axis
    :type y_variable: str
    :param axis: an object containing all information needed for \
    drawing axis
    :type axis: Axis
    :param log_scale_x: True or False
    :type log_scale_x: bool
    :param log_scale_y: True or False
    :type log_scale_y: bool
    """

    def __init__(self, graphs: List[Dataset], x_variable: str, y_variable: str,
                 axis: Axis = None, log_scale_x: bool = None,
                 log_scale_y: bool = None, name: str = ''):
        self.graphs = graphs
        self.attribute_names = [x_variable, y_variable]
        if axis is None:
            self.axis = Axis()
        else:
            self.axis = axis
        self.log_scale_x = log_scale_x
        self.log_scale_y = log_scale_y
        PlotDataObject.__init__(self, type_='graph2d', name=name)

    def mpl_plot(self):
        # axs = plt.subplots(len(self.graphs))
        _, ax = plt.subplots()
        xname, yname = self.attribute_names[:2]
        for dataset in self.graphs:
            x = []
            y = []
            for element in dataset.elements:
                x.append(element[xname])
                y.append(element[yname])
            ax.plot(x, y)
        ax.set_xlabel(xname)
        ax.set_ylabel(yname)
        return ax


class Heatmap(DessiaObject):
    """
    Heatmap is a scatter plot's view. This class contains the Heatmap's parameters.
    :param size: A tuple of two integers corresponding to the number of squares on the horizontal and vertical sides.
    :type size: Tuple[int, int]
    :param colors: The list of colors ranging from low density to high density, \
    e.g. colors=[plot_data.colors.BLUE, plot_data.colors.RED] \
    so the low density areas tend to be blue while higher density areas tend to be red.
    :type colors: List[Colors]
    :param edge_style: The areas separating lines settings
    :type edge_style: EdgeStyle
    """

    def __init__(self, size: Tuple[int, int] = None, colors: List[plot_data.colors.Color] = None,
                 edge_style: EdgeStyle = None, name: str = ''):
        self.size = size
        self.colors = colors
        self.edge_style = edge_style
        DessiaObject.__init__(self, name=name)


class Scatter(PlotDataObject):
    """
    A class for drawing scatter plots.

    :param elements: A list of vectors. Vectors must have the same attributes (ie the same keys)
    :param x_variable: variable that you want to display on x axis
    :param y_variable: variable that you want to display on y axis
    :param tooltip: an object containing all information needed for drawing tooltips
    :param point_style: for points' customization
    :param axis: an object containing all information needed for drawing axis
    :param log_scale_x: True or False
    :param log_scale_y: True or False
    :param heatmap: Heatmap view settings
    :param heatmap_view: Heatmap view when loading the object.
        If set to False, you'd still be able to enable it using the button.
    """

    def __init__(self, x_variable: str, y_variable: str, tooltip: Tooltip = None, point_style: PointStyle = None,
                 elements: List[Sample] = None, axis: Axis = None, log_scale_x: bool = None, log_scale_y: bool = None,
                 heatmap: Heatmap = None, heatmap_view: bool = None, name: str = ''):
        self.tooltip = tooltip
        self.attribute_names = [x_variable, y_variable]
        self.point_style = point_style
        if elements is None:
            elements = []
        sampled_elements = []
        for element in elements:
            # RetroCompat' < 0.11.0
            if not isinstance(element, Sample) and isinstance(element, Dict):
                reference_path = element.pop("reference_path", "#")
                element_name = element.pop("name", "")
                sampled_elements.append(Sample(values=element, reference_path=reference_path, name=element_name))
            elif isinstance(element, Sample):
                sampled_elements.append(element)
            else:
                raise ValueError(f"Element of type {type(element)} cannot be used as a ScatterPlot data element.")
        self.elements = sampled_elements
        if not axis:
            self.axis = Axis()
        else:
            self.axis = axis
        self.log_scale_x = log_scale_x
        self.log_scale_y = log_scale_y
        self.heatmap = heatmap
        self.heatmap_view = heatmap_view
        PlotDataObject.__init__(self, type_='scatterplot', name=name)


class ScatterMatrix(PlotDataObject):
    def __init__(self, elements: List[Sample] = None, axes: List[str] = None,
                 point_style: PointStyle = None, surface_style: SurfaceStyle = None,
                 name: str = ""):
        if elements is None:
            elements = []
        sampled_elements = []
        for element in elements:
            # RetroCompat' < 0.11.0
            if not isinstance(element, Sample) and isinstance(element, Dict):
                reference_path = element.pop("reference_path", "#")
                element_name = element.pop("name", "")
                sampled_elements.append(Sample(values=element, reference_path=reference_path, name=element_name))
            elif isinstance(element, Sample):
                sampled_elements.append(element)
            else:
                raise ValueError(f"Element of type {type(element)} cannot be used as a ScatterMatrix data element.")
        self.elements = sampled_elements
        self.axes = axes
        self.point_style = point_style
        self.surface_style = surface_style
        PlotDataObject.__init__(self, type_="scattermatrix", name=name)


class Arc2D(PlotDataObject):
    """
    A class for drawing arcs. Arc2D is a primitive and can be \
    instantiated by PrimitiveGroup. By default, the arc is drawn anticlockwise.

    :param cx: the arc center's x position
    :type cx: float
    :param cy: the arc center's y position
    :type cy: float
    :param r: radius
    :type r: float
    :param start_angle: the start angle in radian
    :type start_angle: float
    :param end_angle: the end angle in radian
    :type end_angle: float
    :param data: a list of relevant points for drawing an arc using \
    BSPline method. This argument is useless unless the arc2D is part of\
     a Contour2D. In such case, the arc must be instantiated by volmdlr.
    :type data: List[dict]
    :param anticlockwise: True if you want the arc the be drawn \
    anticlockwise, False otherwise
    :type anticlockwise: bool
    :param edge_style: for customization
    :type edge_style: EdgeStyle
    """

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
        """
        :return: the arc's bounding box
        :rtype: float, float, float, float
        """
        return self.cx - self.r, self.cx + self.r, self.cy - self.r, self.cy + self.r

    def mpl_plot(self, ax=None):
        """
        Plots using matplotlib
        """
        if not ax:
            _, ax = plt.subplots()
        if self.edge_style:
            edgecolor = self.edge_style.color_stroke
        else:
            edgecolor = plot_data.colors.BLACK.rgb

        ax.add_patch(
            patches.Arc((self.cx, self.cy), 2 * self.r, 2 * self.r, angle=0,
                        theta1=self.start_angle * 0.5 / math.pi * 360,
                        theta2=self.end_angle * 0.5 / math.pi * 360,
                        edgecolor=edgecolor))

        return ax


class Contour2D(PlotDataObject):
    """
    A Contour2D is a closed polygon that is formed by multiple \
    primitives. Contour2D can be instantiated by PrimitiveGroup.

    :param plot_data_primitives: a list of primitives \
    (Arc2D, LineSegment2D)
    :type plot_data_primitives: List[Union[Arc2D, LineSegment2D]]
    :param edge_style: for contour's customization
    :type edge_style: EdgeStyle
    :param surface_style: for customizing the interior of the contour
    :type surface_style: SurfaceStyle
    :param tooltip: A message that is displayed in a tooltip
    :type tooltip: str
    """

    def __init__(self, plot_data_primitives: List[Union[Arc2D, LineSegment2D]],
                 edge_style: EdgeStyle = None,
                 surface_style: SurfaceStyle = None, tooltip: str = None, name: str = ''):
        self.plot_data_primitives = plot_data_primitives
        self.edge_style = edge_style
        self.surface_style = surface_style
        self.tooltip = tooltip
        PlotDataObject.__init__(self, type_='contour', name=name)

    def bounding_box(self):
        """
        :return: the contour's bounding box
        :rtype: float, float, float, float
        """
        xmin, xmax, ymin, ymax = math.inf, -math.inf, math.inf, -math.inf
        for plot_data_primitive in self.plot_data_primitives:
            if hasattr(plot_data_primitive, 'bounding_box'):
                bb = plot_data_primitive.bounding_box()
                xmin, xmax, ymin, ymax = min(xmin, bb[0]), max(xmax, bb[1]), \
                    min(ymin, bb[2]), max(ymax, bb[3])

        return xmin, xmax, ymin, ymax

    def polygon_points(self):
        points = []
        for primitive in self.plot_data_primitives:
            points.extend(primitive.polygon_points())
        return points

    def mpl_plot(self, ax=None):
        """
        Plots using matplotlib
        """
        for primitive in self.plot_data_primitives:
            ax = primitive.mpl_plot(ax=ax, edge_style=self.edge_style)

        if self.surface_style:
            surface_style = self.surface_style
        else:
            surface_style = DEFAULT_SURFACESTYLE

        if surface_style.color_fill:
            points = self.polygon_points()
            ax.add_patch(Polygon(points, closed=True, **surface_style.mpl_arguments()))
        return ax


class Label(PlotDataObject):
    """
    An object that adds a label to PrimitiveGroups.

    :param title: the text displayed in the label
    :type title: str
    :param text_style: customizing the text
    :type text_style: TextStyle
    :param rectangle_surface_style: the label's rectangle interior \
    customization
    :type rectangle_surface_style: SurfaceStyle
    :param rectangle_edge_style: the label's rectangle edge customization
    :type rectangle_edge_style: EdgeStyle
    """

    def __init__(self, title: str, text_style: TextStyle = None,
                 rectangle_surface_style: SurfaceStyle = None,
                 rectangle_edge_style: EdgeStyle = None, name: str = ''):
        self.title = title
        self.text_style = text_style
        self.rectangle_surface_style = rectangle_surface_style
        self.rectangle_edge_style = rectangle_edge_style
        PlotDataObject.__init__(self, type_='label', name=name)


class MultipleLabels(PlotDataObject):
    """
    Draws one or several labels. MultipleLabels can be instantiated \
    by PrimitiveGroup.

    :param labels: a list of Labels
    :type labels: List[Label]
    """

    def __init__(self, labels: List[Label], name: str = ''):
        self.labels = labels
        PlotDataObject.__init__(self, type_='multiplelabels', name=name)


class PrimitiveGroup(PlotDataObject):
    """
    A class for drawing multiple primitives and contours inside a canvas.

    :param primitives: a list of Contour2D, Arc2D, LineSegment2D, \
    Circle2D, Line2D or MultipleLabels
    :type primitives: List[Union[Contour2D, Arc2D, LineSegment2D, \
    Circle2D, Line2D, MultipleLabels, Wire, Point2D]]
    """

    def __init__(self, primitives: List[Union[Contour2D, Arc2D, LineSegment2D,
                                              Circle2D, Line2D, MultipleLabels, Wire, Point2D]],
                 name: str = ''):
        self.primitives = primitives
        PlotDataObject.__init__(self, type_='primitivegroup', name=name)

    def mpl_plot(self, ax=None, equal_aspect=True):
        """
        Plots using matplotlib
        """
        for primitive in self.primitives:
            ax = primitive.mpl_plot(ax=ax)
        if equal_aspect and ax:
            ax.set_aspect('equal')
        return ax

    def save_to_image(self, filepath, remove_axis=True):
        ax = self.mpl_plot()
        if remove_axis:
            ax.set_axis_off()
            ax.figure.savefig(filepath, bbox_inches='tight', pad_inches=0)
        else:
            ax.figure.savefig(filepath)
        plt.close(ax.figure)

    def bounding_box(self):
        """
        :return: the primitive group's bounding box
        :rtype: float, flaot, float, float
        """
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
    """
    A class for drawing several PrimitiveGroups in one canvas.

    :param primitive_groups: a list of PrimitiveGroups
    :type primitive_groups: List[PrimitiveGroup]
    :param sizes: [size0,...,size_n] where size_i = [width_i, length_i]\
     is the size of primitive_groups[i]
    :type sizes: List[Tuple[float, float]]
    :param coords: In the same way as sizes but for coordinates.
    :type coords: List[Tuple[float, float]]
    :param associated_elements: A list containing the associated \
    elements indices. associated_elements[i] is associated with \
    primitive_groups[i]. It only works if this object is inside a \
    MultiplePlots.
    :type associated_elements: List[int]
    :param x_variable: variable that you want to display on x axis
    :type x_variable: str
    :param y_variable: variable that you want to display on y axis
    :type y_variable: str
    """

    def __init__(self, primitive_groups: List[PrimitiveGroup],
                 sizes: List[Tuple[float, float]] = None,
                 coords: List[Tuple[float, float]] = None,
                 associated_elements: List[int] = None,
                 x_variable: str = None, y_variable: str = None,
                 name: str = ''):
        for i, value in enumerate(primitive_groups):
            if not isinstance(value, PrimitiveGroup):
                primitive_groups[i] = PrimitiveGroup(primitives=value)
        self.primitive_groups = primitive_groups
        if sizes is not None and isinstance(sizes[0], int):
            sizes = [sizes] * len(primitive_groups)
        self.sizes = sizes
        self.coords = coords
        if associated_elements:
            self.association = {'associated_elements': associated_elements}
            if x_variable or y_variable:
                attribute_names = []
                if x_variable:
                    attribute_names.append(x_variable)
                if y_variable:
                    attribute_names.append(y_variable)
                self.association['attribute_names'] = attribute_names
        PlotDataObject.__init__(self, type_='primitivegroupcontainer',
                                name=name)


class ParallelPlot(PlotDataObject):
    """
    Draws a parallel coordinates plot.

    :param elements: a list of vectors. Vectors must have the same attributes (ie the same keys)
    :param edge_style: for customizing lines
    :param disposition: either 'vertical' or 'horizontal'
        depending on how you want the initial disposition to be.
    :param axes: a list on attribute names you want to display as axis on this parallel plot.
    :param rgbs: a list of rgb255 colors for color interpolation.
        Color interpolation is enabled when clicking on an axis.
    """

    def __init__(self, elements: List[Sample] = None, edge_style: EdgeStyle = None, disposition: str = None,
                 axes: List[str] = None, rgbs: List[Tuple[int, int, int]] = None, name: str = ''):
        if elements is None:
            elements = []
        sampled_elements = []
        for element in elements:
            # RetroCompat' < 0.11.0
            if not isinstance(element, Sample) and isinstance(element, Dict):
                reference_path = element.pop("reference_path", "#")
                element_name = element.pop("name", "")
                sampled_elements.append(Sample(values=element, reference_path=reference_path, name=element_name))
            elif isinstance(element, Sample):
                sampled_elements.append(element)
            else:
                raise ValueError(f"Element of type {type(element)} cannot be used as a ParrallelPlot data element.")
        self.elements = sampled_elements
        self.edge_style = edge_style
        self.disposition = disposition
        self.attribute_names = axes
        self.rgbs = rgbs
        PlotDataObject.__init__(self, type_='parallelplot', name=name)


class Attribute(PlotDataObject):
    """
    Represents an attribute.

    :param type_: The attribute's type (in that case, values are either 'float', 'color' or 'string')
    :param name: The attribute's name
    """

    def __init__(self, type_: str, name: str):
        PlotDataObject.__init__(self, type_=type_, name=name)


class PointFamily(PlotDataObject):
    """
    A class that defines a point family. This class can be used in MultiplePlots to create families of points.

    :param point_color: a color that is proper to this family (rgb255)
    :param point_index: a list containing the point's index from MultiplePlots.elements
    """

    def __init__(self, point_color: str, point_index: List[int],
                 name: str = ''):
        self.color = point_color
        self.point_index = point_index
        PlotDataObject.__init__(self, type_=None, name=name)


class Histogram(PlotDataObject):
    """
    The Histogram object. This class can be instantiated in Multiplot.

    :param x_variable: The name of x variable
    :type x_variable: str
    :param elements: A list of vectors.
    :type elements: list(dict)
    :param axis: axis style customization. The number of points cannot\
    be changed for a histogram
    :type axis: Axis
    :param graduation_nb: the number of graduations on the x axis. Default = 6.\
    This parameter doesn't make sense for a non float x axis.
    :type graduation_nb: float
    :param edge_style: histogram rectangles edge style
    :type edge_style: EdgeStyle
    :param surface_style: histogram rectangle surface style
    :type surface_style: SurfaceStyle
    """

    def __init__(self, x_variable: str, elements=None, axis: Axis = None, graduation_nb: float = None,
                 edge_style: EdgeStyle = None, surface_style: SurfaceStyle = None, name: str = ''):
        self.x_variable = x_variable
        self.elements = elements
        self.axis = axis
        self.graduation_nb = graduation_nb
        self.edge_style = edge_style
        self.surface_style = surface_style
        PlotDataObject.__init__(self, type_='histogram', name=name)


class MultiplePlots(PlotDataObject):
    """
    A class for drawing multiple PlotDataObjects (except MultiplePlots) in one canvas.

    :param plots: a list of plots (Scatter, ParallelPlot,  PrimitiveGroup, PrimitiveGroupContainer, Graph2D)
    :param sizes: [size0,...,size_n] where size_i = [width_i, length_i] is the size of plots[i]
    :param elements: a list of vectors. All vectors must have the same attributes (ie the same keys)
    :param coords: same as sizes but for plots' coordinates.
    :param point_families: a list of point families
    :param initial_view_on: True for enabling initial layout, False  otherwise
    """

    def __init__(self, plots: List[PlotDataObject], sizes: List[Window] = None, elements: List[Sample] = None,
                 coords: List[Tuple[float, float]] = None, point_families: List[PointFamily] = None,
                 initial_view_on: bool = None, name: str = ''):
        if elements is None:
            elements = []
        sampled_elements = []
        for element in elements:
            # RetroCompat' < 0.11.0
            if not isinstance(element, Sample) and isinstance(element, Dict):
                reference_path = element.pop("reference_path", "#")
                element_name = element.pop("name", "")
                sampled_elements.append(Sample(values=element, reference_path=reference_path, name=element_name))
            elif isinstance(element, Sample):
                sampled_elements.append(element)
            else:
                raise ValueError(f"Element of type '{type(element)}' cannot be used as a MultiPlot data element.")
        self.elements = sampled_elements
        self.plots = plots
        self.sizes = sizes
        self.coords = coords
        self.point_families = point_families
        self.initial_view_on = initial_view_on
        PlotDataObject.__init__(self, type_='multiplot', name=name)


def plot_canvas(plot_data_object: PlotDataObject,
                debug_mode: bool = False, canvas_id: str = 'canvas',
                force_version: str = None,
                width: int = 750, height: int = 400, page_name: str = None,
                display: bool = True):
    """
    Creates a html file and plots input data in web browser

    :param plot_data_object: a PlotDataObject(ie Scatter, ParallelPlot,\
      MultiplePlots, Graph2D, PrimitiveGroup or PrimitiveGroupContainer)
    :type plot_data_object: PlotDataObject
    :param debug_mode: uses local library if True, uses typescript \
    library from cdn if False
    :type debug_mode: bool
    :param canvas_id: set canvas' id, ie name
    :type canvas_id: str
    :param width: set the canvas' width:
    :type width: str
    :param height: set the canvas' height
    :type height: str
    :param page_name: set the created html file's name
    :type page_name: str
    """
    first_letter = canvas_id[0]
    if not isinstance(first_letter, str):
        raise ValueError('canvas_id argument must not start with a number')
    data = plot_data_object.to_dict()
    plot_type = data['type_']
    if plot_type == 'primitivegroup':
        template = templates.contour_template
    elif plot_type in ('scatterplot', 'graph2d'):
        template = templates.scatter_template
    elif plot_type == 'parallelplot':
        template = templates.parallelplot_template
    elif plot_type == 'multiplot':
        template = templates.multiplot_template
    elif plot_type == 'primitivegroupcontainer':
        template = templates.primitive_group_container_template
    elif plot_type == 'histogram':
        template = templates.histogram_template
    elif plot_type == "scattermatrix":
        template = templates.scatter_matrix_template
    else:
        raise NotImplementedError('Type {} not implemented'.format(plot_type))

    if force_version is not None:
        version, folder, filename = get_current_link(version=force_version)
    else:
        version, folder, filename = get_current_link()
    cdn_url = 'https://cdn.dessia.tech/js/plot-data/{}/{}'
    lib_path = cdn_url.format(version, filename)
    if debug_mode:
        core_path = os.sep.join(os.getcwd().split(os.sep)[:-1] + [folder, filename])

        if not os.path.isfile(core_path):
            msg = 'Local compiled {} not found, fall back to CDN'
            print(msg.format(core_path))
        else:
            lib_path = core_path

    s = template.substitute(data=json.dumps(data), core_path=lib_path,
                            canvas_id=canvas_id, width=width, height=height)
    if page_name is None:
        temp_file = tempfile.mkstemp(suffix='.html')[1]

        with open(temp_file, 'wb') as file:
            file.write(s.encode('utf-8'))

        if display:
            webbrowser.open('file://' + temp_file)
        print('file://' + temp_file)
    else:
        with open(page_name + '.html', 'wb') as file:
            file.write(s.encode('utf-8'))
        if display:
            webbrowser.open('file://' + os.path.realpath(page_name + '.html'))
        print(page_name + '.html')


def write_json_for_tests(plot_data_object: PlotDataObject, json_path: str):
    if not json_path.endswith(".json"):
        json_path += ".json"
        print("Added '.json' at the end of json_path variable.")
    data = plot_data_object.to_dict()
    json_data = json.dumps(data)
    with open(json_path, "wb") as file:
        file.write(json_data.encode('utf-8'))


def get_csv_vectors(filepath):
    """
    :param filepath: the csv file's relative path, starting from the \
    script's path.
    :type filepath: str

    :return: a list of vectors (ie a list of dictionaries) that can be \
    set to multiple_plots' or parallelplot's elements for example.
    :rtype: List[dict]
    """
    raise NotImplementedError("get_csv_vectors function is not implemented anymore"
                              "as dessia_common's vectored_objects as been removed")


def bounding_box(plot_datas: List[PlotDataObject]):
    """
    Calls input plot_datas' bounding_box method, if it has one.

    :param plot_datas: The target object the bounding_box method has to\
     be called from
    :type plot_datas: List[PlotDataObject]

    :return: a bounding box
    :rtype: float, float, float, float
    """
    xmin, xmax, ymin, ymax = math.inf, -math.inf, math.inf, -math.inf
    for plot in plot_datas:
        if hasattr(plot, 'bounding_box'):
            bb = plot.bounding_box()
            xmin, xmax = min(xmin, bb[0]), max(xmax, bb[1])
            ymin, ymax = min(ymin, bb[2]), max(ymax, bb[3])

    return xmin, xmax, ymin, ymax


def get_current_link(version: str = None) -> Tuple[str, str, str]:
    folder = "lib"
    filename = "core.js"
    try:
        package = sys.modules[sys.modules[__name__].__package__]
        if version is None:
            version = package.__version__

        splitted_version = version.split(".")
        if len(splitted_version) > 3:
            splitted_version.pop()
            splitted_version[2] = str(int(splitted_version[2]) - 1)
        formatted_version = "v" + ".".join(splitted_version)
        if formatted_version == 'v0.6.2':
            folder = "dist"
            filename = "plot-data.js"
        if formatted_version == "v0.7.0":
            folder = "lib"
            filename = "plot-data.js"
        if int(splitted_version[0]) >= 0\
                and int(splitted_version[1]) >= 7\
                and int(splitted_version[1]) >= 1:
            folder = "libdev"
            filename = "plot-data.js"
        return formatted_version, folder, filename
    except Exception:
        return 'latest', folder, filename
