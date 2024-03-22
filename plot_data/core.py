#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Definition of language and plots
"""

import json
import math
import os
import sys
import datetime
import tempfile
import warnings
import webbrowser
from typing import Dict, List, Tuple, Union

import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Circle, Arc
from matplotlib.patches import Rectangle as Rect

try:
    # dessia_common >= 0.12.0
    from dessia_common.serialization import serialize
except ImportError:
    # dessia_common < 0.12.0.
    from dessia_common.utils.serialization import serialize

from dessia_common.core import DessiaObject
from dessia_common.exports import ExportFormat
from dessia_common.typings import JsonSerializable

import plot_data.colors
from plot_data import templates

# CURVES_DATATYPE = Union(List[float], List[str], List[List[float]], List[Dict[str, Any]])


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


def serialize_dates_in_list(list_):
    for i, element in enumerate(list_):
        list_[i] = serialize_dates(element)
    return list_


def serialize_dates_in_dict(dict_):
    for (key, value) in dict_.items():
        dict_[key] = serialize_dates(value)
    return dict_


def serialize_dates(serializable):
    if isinstance(serializable, list):
        return serialize_dates_in_list(serializable)
    if isinstance(serializable, dict):
        return serialize_dates_in_dict(serializable)
    if isinstance(serializable, datetime.datetime):
        return f"{serializable.timestamp() * 1000}gmt+"
    return serializable


class PlotDataObject(DessiaObject):
    """ Abstract interface for DessiaObject implementation in module. """

    _plot_commands = "EMPTY_TEMPLATE"
    _plot_buttons = "EMPTY_BUTTONS"

    def __init__(self, type_: str, name: str = '', **kwargs):
        self.type_ = type_
        DessiaObject.__init__(self, name=name, **kwargs)

    def to_dict(self, **kwargs) -> JsonSerializable:
        """ Redefines DessiaObject's to_dict() in order not to use pointers and remove keys where value is None. """
        if 'use_pointers' in kwargs:
            kwargs.pop('use_pointers')
        dict_ = DessiaObject.to_dict(self, use_pointers=False, **kwargs)
        del dict_['object_class']
        dict_ = serialize_dates_in_dict(dict_)
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

    def mpl_plot(self, ax=None, **kwargs):
        """ Overloading of dessia object mpl_plot. """
        warnings.warn(f'class {self.__class__.__name__} does not implement mpl_plot, not plotting.')
        return ax


class Figure(PlotDataObject):
    """ Abstract interface for handling html exportable objects in module. """

    _standalone_in_db = True

    def __init__(self, type_: str, width: int = 750, height: int = 400, axis_on: bool = True, name: str = '', **kwargs):
        self.width = width
        self.height = height
        self.axis_on = axis_on
        PlotDataObject.__init__(self, type_=type_, name=name, **kwargs)

    @property
    def template(self):
        """ Get html template of current Figure object. """
        return templates.get_html_string(command_name=self._plot_commands, button_name=self._plot_buttons)
        # return getattr(templates, self._plot_commands)

    def _export_formats(self) -> List[ExportFormat]:
        """ Return a list of objects describing how to call generic exports (.json, .xlsx). """
        formats = super()._export_formats()
        formats.append(ExportFormat(selector="html", extension="html", method_name="to_html_stream", text=False))
        return formats

    def _to_html(self, local: bool = False, canvas_id: str = 'canvas', version: str = None):
        lib_path = plot_data_path(local=local, version=version)
        return self.template.substitute(data=json.dumps(self.to_dict()), core_path=lib_path, canvas_id=canvas_id,
                                        width=self.width, height=self.height)

    def to_html_stream(self, stream, local: bool = False, canvas_id: str = 'canvas', version: str = None):
        """ Export current Figure to its equivalent html stream file. """
        html = self._to_html(local=local, canvas_id=canvas_id, version=version)
        stream.write(html)

    def to_html(self, filepath: str = None, local: bool = False, canvas_id: str = 'canvas', version: str = None):
        """ Export current Figure to an HTML file given by the filepath. """
        filepath = make_filepath(filepath=filepath)
        with open(filepath, 'w', encoding="utf-8") as file:
            self.to_html_stream(file, local=local, canvas_id=canvas_id, version=version)
        return filepath

    def plot_data(self, **kwargs):
        return [self]

    def plot(self, filepath: str = None, **kwargs):
        filepath = self.to_html(filepath=filepath, **kwargs)
        webbrowser.open('file://' + os.path.realpath(filepath))


class ReferencedObject(PlotDataObject):
    """ PlotData object with reference_path. """

    def __init__(self, type_: str, reference_path: str = "#", name: str = ""):
        self.reference_path = reference_path
        super().__init__(type_=type_, name=name)


class Shape(ReferencedObject):
    """ Shape object. """

    def __init__(self, type_: str, reference_path: str = "#", tooltip: str = None, name: str = ""):
        self.tooltip = tooltip
        super().__init__(type_=type_, reference_path=reference_path, name=name)


class Sample(ReferencedObject):
    """ Graph Point. """

    def __init__(self, values, reference_path: str = "#", name: str = ""):
        self.values = values
        super().__init__(type_="sample", reference_path=reference_path, name=name)

    def to_dict(self, use_pointers: bool = True, memo=None, path: str = '#', id_method=True,
                id_memo=None) -> JsonSerializable:
        """
        Overwrite generic to_dict.

        TODO Check if it can be generic (probably)
        """
        dict_ = PlotDataObject.to_dict(self, use_pointers=use_pointers, memo=memo, path=path, id_method=id_method,
                                       id_memo=id_memo)
        dict_ = serialize_dates_in_dict(dict_)
        dict_.update({"reference_path": self.reference_path, "name": self.name})
        dict_.update(serialize(self.values))
        # TODO Keeping values at dict_ level before refactor, should be removed after and use dict_["values"] instead
        return dict_

    @classmethod
    def dict_to_object(cls, dict_: JsonSerializable, **_) -> 'Sample':
        """
        Overwrite generic dict_to_object.

        TODO Check if it can be generic (probably)
        """
        reference_path = dict_["reference_path"]
        name = dict_["name"]
        values = dict_["values"]
        return cls(values=values, reference_path=reference_path, name=name)

    def plot_data(self, reference_path: str = "#", **kwargs):
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
    """ Define a Window object. """

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
        """ Get matplotlib equivalent values of attributes. """
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

    def __init__(self, color_fill: str = None, color_stroke: str = None, stroke_width: float = None, size: float = None,
                 shape: str = None, orientation: str = None, name: str = ''):
        self.color_fill = color_fill
        self.color_stroke = color_stroke
        self.stroke_width = stroke_width
        self.size = size  # 1, 2, 3 or 4
        self.shape = shape
        self.orientation = orientation
        DessiaObject.__init__(self, name=name)

    def mpl_arguments(self):
        """ Get matplotlib equivalent values of attributes. """
        args = {}
        if self.color_fill:
            args['color'] = self.color_fill.rgb
        if self.color_stroke:
            args['markeredgecolor'] = self.color_stroke.rgb
        return args

    @classmethod
    def dict_to_object(cls, dict_, *args, **kwargs):
        """ Overwrite generic dict_to_object. """
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

    def __init__(self, text_color: plot_data.colors.Color = None, font_size: float = None, font_style: str = None,
                 text_align_x: str = None, text_align_y: str = None, bold: bool = None, italic: bool = None,
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
        """ Overwrite generic dict_to_object. """
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

    def __init__(self, color_fill: str = None, opacity: float = 1., hatching: HatchingSet = None, name: str = ''):
        # TODO: migrate from str to Color object
        self.color_fill = color_fill
        self.opacity = opacity
        self.hatching = hatching
        DessiaObject.__init__(self, name=name)

    @classmethod
    def dict_to_object(cls, dict_, *args, **kwargs):
        """ Overwrite generic dict_to_object. """
        obj = DessiaObject.dict_to_object(dict_, force_generic=True, *args, **kwargs)
        if obj.color_fill:
            obj.color_fill = plot_data.colors.Color.dict_to_object(obj.color_fill)
        return obj

    def mpl_arguments(self):
        """ Get matplotlib equivalent values of attributes. """
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

    def __init__(self, point_color: str, point_index: List[int], name: str = ''):
        self.color = point_color
        self.indices = point_index
        PlotDataObject.__init__(self, type_=None, name=name)


class Text(Shape):
    """
    A class for displaying texts on canvas. Text is a primitive and can be instantiated by PrimitiveGroup.

    :param comment: the comment you want to display
    :type comment: str
    :param position_x: the text's x position
    :type position_x: float
    :param position_y: the text's y position
    :type position_y: float
    :param text_style: for customization (optional)
    :type text_style: TextStyle
    :param text_scaling: True if you want the text the be rescaled when zooming and False otherwise.
    :type text_scaling: bool
    :param max_width: Set a maximum length for the text. If the text is longer than max_width, it is split into
    several lines.
    :type max_width: float
    :param multi_lines: This parameter is only useful when max_width parameter is set. In that case, you can choose
    between squishing the text in one line or writing on multiple lines.
    :type multi_lines: bool
    """

    def __init__(self, comment: str, position_x: float, position_y: float, text_style: TextStyle = None,
                 text_scaling: bool = None, max_width: float = None, height: float = None, multi_lines: bool = True,
                 reference_path: str = "#", tooltip: str = None, name: str = ''):
        self.comment = comment
        self.text_style = text_style
        self.position_x = position_x
        self.position_y = position_y
        self.text_scaling = text_scaling
        self.max_width = max_width
        self.height = height
        self.multi_lines = multi_lines
        super().__init__(type_='text', reference_path=reference_path, tooltip=tooltip, name=name)

    def mpl_plot(self, ax=None, color='k', alpha=1., **kwargs):
        """ Plots using Matplotlib. """
        if not ax:
            _, ax = plt.subplots()
        ax.text(self.position_x, self.position_y, self.comment, color=color, alpha=alpha, **kwargs)
        return ax


class Line2D(Shape):
    """
    An infinite line. Line2D is a primitive and can be instantiated by PrimitiveGroups.

    :param point1: first endpoint of the line segment [x1, y1].
    :type point1: List[float]
    :param point2: first endpoint of the line segment [x2, y2].
    :type point2: List[float]
    :param edge_style: for customization
    :type edge_style: EdgeStyle
    """

    def __init__(self, point1: List[float], point2: List[float], edge_style: EdgeStyle = None,
                 reference_path: str = "#", tooltip: str = None, name: str = ''):
        self.data = point1 + point2  # Retrocompatibility
        self.point1 = point1
        self.point2 = point2
        self.edge_style = edge_style
        super().__init__(type_='line2d', reference_path=reference_path, tooltip=tooltip, name=name)

    def mpl_plot(self, ax=None, edge_style=None, **kwargs):
        """ Plots using matplotlib. """
        if ax is None:
            _, ax = plt.subplots()

        if edge_style:
            style = edge_style
            color = style.color_stroke.rgb
            dashes = style.dashline
            ax.axline((self.data[0], self.data[1]), (self.data[2], self.data[3]), color=color, dashes=dashes, **kwargs)
        else:
            ax.axline((self.data[0], self.data[1]), (self.data[2], self.data[3]), **kwargs)
        return ax


class LineSegment2D(Shape):
    """
    A line segment. This is a primitive that can be called by PrimitiveGroup.

    :param point1: first endpoint of the line segment [x1, y1].
    :type point1: List[float]
    :param point2: first endpoint of the line segment [x2, y2].
    :type point2: List[float]
    :param edge_style: for customization
    :type edge_style: EdgeStyle
    """

    def __init__(self, point1: List[float], point2: List[float], edge_style: EdgeStyle = None,
                 reference_path: str = "#", tooltip: str = None, name: str = ''):
        # Data is used in typescript
        self.data = point1 + point2
        self.point1 = point1
        self.point2 = point2

        if edge_style is None:
            edge_style = EdgeStyle()
        self.edge_style = edge_style
        super().__init__(type_='linesegment2d', reference_path=reference_path, tooltip=tooltip, name=name)

    def bounding_box(self):
        """ Get 2D bounding box of current LineSegment2D. """
        return (min(self.data[0], self.data[2]),
                max(self.data[0], self.data[2]),
                min(self.data[1], self.data[3]),
                max(self.data[1], self.data[3]))

    def polygon_points(self):
        """ Get lists of points in a merged list. """
        return [self.point1, self.point2]

    def mpl_plot(self, ax=None, edge_style=None, **kwargs):
        """ Plots using matplotlib. """
        if not ax:
            _, ax = plt.subplots()

        if edge_style is None:
            if self.edge_style:
                edge_style = self.edge_style
            else:
                edge_style = DEFAULT_EDGESTYLE

        ax.plot([self.point1[0], self.point2[0]], [self.point1[1], self.point2[1]], **edge_style.mpl_arguments(),
                **kwargs)
        return ax


class Wire(Shape):
    """
    A set of connected lines. It also provides highlighting feature.

    :param lines: [(x1, y1), ..., (xn,yn)]
    :type lines: List[Tuple[float, float]]
    :param edge_style: Line settings
    :type edge_style: EdgeStyle
    :param tooltip: a message that is displayed in a tooltip
    :type tooltip: str
    """

    def __init__(self, lines: List[Tuple[float, float]], edge_style: EdgeStyle = None, tooltip: str = None,
                 reference_path: str = "#", name: str = ""):
        self.lines = lines
        self.edge_style = edge_style
        super().__init__(type_="wire", reference_path=reference_path, tooltip=tooltip, name=name)

    def mpl_plot(self, ax=None, **kwargs):
        """ Plots using matplotlib. """
        if not ax:
            _, ax = plt.subplots()
        if self.edge_style:
            edge_style = self.edge_style
        else:
            edge_style = DEFAULT_EDGESTYLE

        ax.plot([p[0] for p in self.lines], [p[1] for p in self.lines], **edge_style.mpl_arguments(), **kwargs)
        return ax


class Circle2D(Shape):
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

    def __init__(self, cx: float, cy: float, r: float, edge_style: EdgeStyle = None,
                 surface_style: SurfaceStyle = None, tooltip: str = None, reference_path: str = "#", name: str = ''):
        self.edge_style = edge_style
        self.surface_style = surface_style
        self.r = r
        self.cx = cx
        self.cy = cy
        super().__init__(type_='circle', reference_path=reference_path, tooltip=tooltip, name=name)

    def bounding_box(self):
        """ Get 2D bounding box of current Circle2D. """
        return self.cx - self.r, self.cx + self.r, self.cy - self.r, self.cy + self.r

    def mpl_plot(self, ax=None, **kwargs):
        """ Plots using matplotlib. """
        if not ax:
            _, ax = plt.subplots()
        if self.edge_style:
            edge_style = self.edge_style
        else:
            edge_style = DEFAULT_EDGESTYLE
        args = edge_style.mpl_arguments(surface=True)
        if 'dashes' in args:
            args.pop("dashes")

        if self.surface_style:
            surface_style = self.surface_style
        else:
            surface_style = DEFAULT_SURFACESTYLE

        args.update(surface_style.mpl_arguments())

        ax.add_patch(Circle((self.cx, self.cy), self.r, **args), **kwargs)
        return ax


class Rectangle(Shape):
    """ Class to draw a rectangle. """

    def __init__(self, x_coord: float, y_coord: float, width: float, height: float, edge_style: EdgeStyle = None,
                 surface_style: SurfaceStyle = None, tooltip: str = None, reference_path: str = "#", name: str = ''):
        self.x_coord = x_coord
        self.y_coord = y_coord
        self.width = width
        self.height = height
        self.surface_style = surface_style
        self.edge_style = edge_style
        super().__init__(type_='rectangle', reference_path=reference_path, tooltip=tooltip, name=name)

    def bounding_box(self):
        """ Get 2D bounding box of current Circle2D. """
        return self.x_coord, self.x_coord + self.width, self.y_coord, self.y_coord + self.height

    def mpl_plot(self, ax=None, **kwargs):
        """ Plots using matplotlib. """
        if not ax:
            _, ax = plt.subplots()
        if self.edge_style:
            edge_style = self.edge_style
        else:
            edge_style = DEFAULT_EDGESTYLE
        args = edge_style.mpl_arguments(surface=True)
        if 'dashes' in args:
            args.pop("dashes")

        if self.surface_style:
            surface_style = self.surface_style
        else:
            surface_style = DEFAULT_SURFACESTYLE

        args.update(surface_style.mpl_arguments())

        ax.add_patch(Rect([self.x_coord, self.y_coord], self.width, self.height, **args), **kwargs)
        return ax


class RoundRectangle(Rectangle):
    """ Class to draw a round rectangle. """

    def __init__(self, x_coord: float, y_coord: float, width: float, height: float, radius: float = 2,
                 edge_style: EdgeStyle = None, surface_style: SurfaceStyle = None, tooltip: str = None,
                 reference_path: str = "#", name: str = ''):
        super().__init__(x_coord, y_coord, width, height, edge_style, surface_style, tooltip,
                         reference_path=reference_path, name=name)
        self.type_ = "roundrectangle"
        self.radius = radius


class Point2D(Shape):
    """
    A class for instantiating a point.

    :param cx: the point center's x position
    :type cx: float
    :param cy: the point center's y position
    :type cy: float
    :param point_style: the point's customization.
    :type point_style: PointStyle
    """

    def __init__(self, cx: float, cy: float, point_style: PointStyle = None, reference_path: str = "#",
                 tooltip: str = None, name: str = ''):
        self.cx = cx
        self.cy = cy
        self.point_style = point_style
        super().__init__(type_='point', reference_path=reference_path, tooltip=tooltip, name=name)

    def bounding_box(self):
        """ Get 2D bounding box of current Circle2D. """
        return self.cx, self.cx, self.cy, self.cy

    def mpl_plot(self, ax=None, **kwargs):
        """ Plots using matplotlib. """
        if ax is None:
            _, ax = plt.subplots()

        if self.point_style:
            style = self.point_style
        else:
            style = DEFAULT_POINTSTYLE

        ax.plot([self.cx], [self.cy], marker='o', **style.mpl_arguments(), **kwargs)
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

    def __init__(self, nb_points_x: int = None, nb_points_y: int = None, graduation_style: TextStyle = None,
                 axis_style: EdgeStyle = None, arrow_on: bool = False, grid_on: bool = True, name: str = ''):
        self.nb_points_x = nb_points_x
        self.nb_points_y = nb_points_y
        self.graduation_style = graduation_style
        self.axis_style = axis_style
        self.arrow_on = arrow_on
        self.grid_on = grid_on
        PlotDataObject.__init__(self, type_='axis', name=name)


class Tooltip(PlotDataObject):
    """
    A class that contains information for drawing a tooltip when clicking on points.

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

    def __init__(self, attributes: List[str] = None, text: str = None, surface_style: SurfaceStyle = None,
                 text_style: TextStyle = None, tooltip_radius: float = None, name: str = ''):
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
    Numerous points are joined by line segments to display a mathematical curve.

    Datasets are instantiated by Graph2D to display multiple datasets on one canvas.

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

    def __init__(self, elements: List[Sample] = None, edge_style: EdgeStyle = None, tooltip: Tooltip = None,
                 point_style: PointStyle = None, partial_points: bool = None, display_step: int = 1, name: str = ''):

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
        self.partial_points = partial_points
        self.display_step = display_step
        PlotDataObject.__init__(self, type_='dataset', name=name)


class Graph2D(Figure):
    """
    Takes one or several Datasets as input and displays them all in one canvas.

    :param graphs: a list of Datasets
    :type graphs: List[Dataset]
    :param x_variable: variable that you want to display on x axis
    :type x_variable: str
    :param y_variable: variable that you want to display on y axis
    :type y_variable: str
    :param axis: an object containing all information needed for drawing axis
    :type axis: Axis
    :param log_scale_x: True or False
    :type log_scale_x: bool
    :param log_scale_y: True or False
    :type log_scale_y: bool
    """

    _plot_commands = "GRAPH_COMMANDS"
    _plot_buttons = "EMPTY_BUTTONS"

    def __init__(self, graphs: List[Dataset], x_variable: str, y_variable: str, axis: Axis = None,
                 log_scale_x: bool = None, log_scale_y: bool = None, width: int = 750, height: int = 400,
                 axis_on: bool = True, name: str = ''):
        self.graphs = graphs
        self.attribute_names = [x_variable, y_variable]
        if axis is None:
            self.axis = Axis()
        else:
            self.axis = axis
        self.log_scale_x = log_scale_x
        self.log_scale_y = log_scale_y
        super().__init__(width=width, height=height, type_='graph2d', axis_on=axis_on, name=name)

    def mpl_plot(self, ax=None, **kwargs):
        """ Plots using matplotlib. """
        # axs = plt.subplots(len(self.graphs))
        _, ax = plt.subplots()
        xname, yname = self.attribute_names[:2]
        for dataset in self.graphs:
            x = []
            y = []
            for element in dataset.elements:
                x.append(element[xname])
                y.append(element[yname])
            ax.plot(x, y, **kwargs)
        ax.set_xlabel(xname)
        ax.set_ylabel(yname)
        return ax
# TODO: commented code here is supposed to be used soon
    # def graphs_to_curves(self):
    #     curves = []
    #     for graph in self.graphs:
    #         x_coords = []
    #         y_coords = []
    #         for sample in graph.elements:
    #             x_coords.append(sample[self.attribute_names[0]])
    #             y_coords.append(sample[self.attribute_names[1]])
    #         line_width = graph.edge_style.line_width
    #         color = graph.edge_style.color_stroke
    #         dash_line = graph.edge_style.dashline
    #         marker = graph.point_style.shape
    #         name = graph.name
    #         curves.append(Curve(x_coords, y_coords, name, line_width=line_width, color=color, dash_line=dash_line,
    #                             marker=marker))
    #     return curves

    # def to_plot(self):
    #     return


# class Curve(PlotDataObject):

#     _KWARGS = ['line_width', 'color', 'dash_line', 'marker']

#     def __init__(self, x_coords: Union(List[str], List[float]), y_coords: Union(List[str], List[float]) = None,
#                  name: str = '', **kwargs):
#         self.x_coords, self.y_coords = self.buildCoords(x_coords, y_coords)
#         self.line_width = None
#         self.color = None
#         self.dash_line = None
#         self.marker = None
#         self.setStyle(kwargs)

#     @staticmethod
#     def buildCoords(x_coords: Union(List[str], List[float]), y_coords: Union(List[str], List[float])):
#         if y_coords is None:
#             return list(range(len(y_coords))), x_coords
#         if len(x_coords) == len(y_coords):
#             return x_coords, y_coords
#         raise ValueError("x_coords and y_coords must be the same length.")

#     def setStyle(self, kwargs: Dict[str, Any]):
#         for attribute in self._KWARGS:
#             if attribute in kwargs:
#                 setattr(self, attribute, kwargs[attribute])

#     @classmethod
#     def fromPlot(cls, x_values: CURVES_DATATYPE, y_values: CURVES_DATATYPE, x_variable: str, y_variable: str,
#                  legend: List[str], **kwargs):
#         if isinstance(x_values[0], float):
#             if len(legend) != 1 and legend is not None:
#                 raise ValueError("x_values and legend must be the same length.")
#             if legend is None:
#                 return cls(x_values, y_values, **kwargs)
#             if len(legend) == 1:
#                 return cls(x_values, y_values, legend[0], **kwargs)

#         if isinstance(x_values[0], dict):
#             if x_variable not in x_values[0]:
#                 raise ValueError(f"{x_variable} not in keys of x_values.")

#             x_coords = [];
#             y_coords = [];
#             for elements in x_values:
#                 x_coords.append(elements[x_variable])
#                 y_coords.append(elements[y_variable])
#             return cls(x_coords, y_coords, legend[0], **kwargs)

#         raise TypeError("x_values must be a list of float or dict.")


# class Plot(Figure):

#     _plot_commands = "GRAPH_COMMANDS"

#     def __init__(self, x_values: CURVES_DATATYPE, y_values: CURVES_DATATYPE = None, x_variable: str = None,
#                  y_variable: str = None, axis: Axis = None, legend: List[str] = None, width: int = 750,
#                  height: int = 400, name: str = '', **kwargs):
#         self.curves = self.buildCurves(x_values, y_values, x_variable, y_variable, legend, **kwargs)
#         if axis is None:
#             self.axis = Axis()
#         else:
#             self.axis = axis
#         super().__init__(width=width, height=height, type_='graph2d', name=name)

#     @staticmethod
#     def buildCurves(x_values: CURVES_DATATYPE, y_values: CURVES_DATATYPE, x_variable: str, y_variable: str,
#                     legend: List[str], **kwargs):
#         if isinstance(x_values[0], (str, float, dict)):
#             return [Curve.fromPlot(x_values=x_values, y_values=y_values, x_variable=x_variable, y_variable=y_variable,
#                                    legend=legend, **kwargs)]

#         if isinstance(x_values[0], list):
#             curves = []
#             for x_subvalues, y_subvalues, sub_legend in zip(x_values, y_values, legend):
#                 curves.append(Curve.fromPlot(x_values=x_subvalues, y_values=y_subvalues, x_variable=x_variable,
#                                              y_variable=y_variable, legend=sub_legend, **kwargs))
#             return curves

#         if isinstance(x_values[0], Curve):
#             return x_values


class Heatmap(DessiaObject):
    """
    Heatmap is a scatter plot's view. This class contains the Heatmap's parameters.

    :param size: A tuple of two integers corresponding to the number of squares on the horizontal and vertical sides.
    :type size: Tuple[int, int]
    :param colors: The list of colors ranging from low density to high density, e.g.
    `colors=[plot_data.colors.BLUE, plot_data.colors.RED]` so the low density areas tend to be blue while higher
    density areas tend to be red.
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


class Scatter(Figure):
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

    _plot_commands = "SCATTER_COMMANDS"
    _plot_buttons = "EMPTY_BUTTONS"

    def __init__(self, x_variable: str = None, y_variable: str = None, tooltip: Tooltip = None,
                 point_style: PointStyle = None, elements: List[Sample] = None, points_sets: List[PointFamily] = None,
                 axis: Axis = None, log_scale_x: bool = None, log_scale_y: bool = None, heatmap: Heatmap = None,
                 heatmap_view: bool = None, width: int = 750, height: int = 400, axis_on: bool = True, name: str = ''):
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
        self.points_sets = points_sets
        super().__init__(width=width, height=height, type_='scatterplot', axis_on=axis_on, name=name)


class ScatterMatrix(Figure):
    """ ScatterMatrix of a list of Samples. """

    _plot_commands = "MULTIPLOT_COMMANDS"
    _plot_buttons = "MULTIPLOT_BUTTONS"

    def __init__(self, elements: List[Sample] = None, axes: List[str] = None, point_style: PointStyle = None,
                 surface_style: SurfaceStyle = None, width: int = 750, height: int = 400, axis_on: bool = True,
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
        self.plots = self._build_multiplot()
        self.initial_view_on = True
        super().__init__(width=width, height=height, type_="multiplot", axis_on=axis_on, name=name)

    def _build_multiplot(self):
        sample_attributes = self.elements[0].values.keys()
        return [Histogram(col) if row == col else Scatter(row, col)
                for row in sample_attributes for col in sample_attributes]


class Arc2D(Shape):
    """
    A class for drawing arcs. Arc2D is a primitive and can be instantiated by PrimitiveGroup. By default,
    the arc is drawn anticlockwise.

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
    :param clockwise: True if you want the arc the be drawn clockwise, False otherwise
    :type clockwise: bool
    :param edge_style: for customization
    :type edge_style: EdgeStyle
    """

    def __init__(self, cx: float, cy: float, r: float, start_angle: float, end_angle: float, clockwise: bool = None,
                 edge_style: EdgeStyle = None, reference_path: str = "#", tooltip: str = None, name: str = ''):
        self.cx = cx
        self.cy = cy
        self.r = r
        self.start_angle = start_angle
        self.end_angle = end_angle
        self.clockwise = clockwise
        self.edge_style = edge_style
        super().__init__(type_='arc', reference_path=reference_path, tooltip=tooltip, name=name)

    def bounding_box(self):
        """ Get 2D bounding box of current Circle2D. """
        return self.cx - self.r, self.cx + self.r, self.cy - self.r, self.cy + self.r

    def polygon_points(self):
        """ Get lists of points in a merged list. """
        points = []
        # for primitive in self.plot_data_primitives:
        #     points.extend(primitive.polygon_points())
        return points

    def mpl_plot(self, ax=None, **kwargs):
        """ Plots using matplotlib. """
        if not ax:
            _, ax = plt.subplots()
        if self.edge_style:
            edgecolor = self.edge_style.mpl_arguments(surface=False)['color']
        elif "edge_style" in kwargs:
            edgecolor = kwargs['edge_style'].mpl_arguments(surface=False)["color"]
            kwargs.pop("edge_style")
        else:
            edgecolor = plot_data.colors.BLACK.rgb
        theta1, theta2 = self.start_angle, self.end_angle
        if self.clockwise:
            theta1, theta2 = self.end_angle, self.start_angle

        ax.add_patch(
            Arc((self.cx, self.cy), 2 * self.r, 2 * self.r, angle=0,
                theta1=theta1 * 0.5 / math.pi * 360,
                theta2=theta2 * 0.5 / math.pi * 360,
                edgecolor=edgecolor), **kwargs)

        return ax


class Contour2D(Shape):
    """
    A Contour2D is a closed polygon that is formed by multiple primitives.

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

    def __init__(self, plot_data_primitives: List[Union[Arc2D, LineSegment2D]], edge_style: EdgeStyle = None,
                 surface_style: SurfaceStyle = None, tooltip: str = None, reference_path: str = "#", name: str = ''):
        self.plot_data_primitives = plot_data_primitives
        self.edge_style = edge_style
        self.surface_style = surface_style
        self.is_filled = surface_style is not None
        super().__init__(type_='contour', reference_path=reference_path, tooltip=tooltip, name=name)

    def bounding_box(self):
        """ Get 2D bounding box of current Contour2D. """
        xmin, xmax, ymin, ymax = math.inf, -math.inf, math.inf, -math.inf
        for plot_data_primitive in self.plot_data_primitives:
            if hasattr(plot_data_primitive, 'bounding_box'):
                bounding_box_ = plot_data_primitive.bounding_box()
                xmin, xmax = min(xmin, bounding_box_[0]), max(xmax, bounding_box_[1])
                ymin, ymax = min(ymin, bounding_box_[2]), max(ymax, bounding_box_[3])

        return xmin, xmax, ymin, ymax

    def polygon_points(self):
        """ Get lists of points in a merged list. """
        points = []
        for primitive in self.plot_data_primitives:
            points.extend(primitive.polygon_points())
        return points

    def mpl_plot(self, ax=None, **kwargs):
        """ Plots using matplotlib. """
        for primitive in self.plot_data_primitives:
            ax = primitive.mpl_plot(ax=ax, edge_style=self.edge_style)

        if self.surface_style:
            surface_style = self.surface_style
        else:
            surface_style = DEFAULT_SURFACESTYLE

        if surface_style.color_fill:
            points = self.polygon_points()
            ax.add_patch(Polygon(points, closed=True, **surface_style.mpl_arguments()), **kwargs)

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

    def __init__(self, title: str, text_style: TextStyle = None, rectangle_surface_style: SurfaceStyle = None,
                 rectangle_edge_style: EdgeStyle = None, shape: PlotDataObject = None, name: str = ''):
        self.title = title
        self.text_style = text_style
        self.rectangle_surface_style = rectangle_surface_style
        self.rectangle_edge_style = rectangle_edge_style
        self.shape = shape
        PlotDataObject.__init__(self, type_='label', name=name)


class MultipleLabels(PlotDataObject):
    """
    Draws one or several labels. MultipleLabels can be instantiated by PrimitiveGroup.

    :param labels: a list of Labels
    :type labels: List[Label]
    """

    def __init__(self, labels: List[Label], name: str = ''):
        self.labels = labels
        PlotDataObject.__init__(self, type_='multiplelabels', name=name)


class PrimitiveGroup(Figure):
    """
    A class for drawing multiple primitives and contours inside a canvas.

    :param primitives: a list of Contour2D, Arc2D, LineSegment2D, \
    Circle2D, Line2D or MultipleLabels
    :type primitives: List[Union[Contour2D, Arc2D, LineSegment2D, \
    Circle2D, Line2D, MultipleLabels, Wire, Point2D]]
    """

    _plot_commands = "CONTOUR_COMMANDS"
    _plot_buttons = "EMPTY_BUTTONS"

    def __init__(self, primitives: List[Union[Contour2D, Arc2D, LineSegment2D, Circle2D,
                                              Line2D, MultipleLabels, Wire, Point2D]], width: int = 750,
                 height: int = 400, attribute_names: List[str] = None, axis_on: bool = False, name: str = ''):
        self.primitives = primitives
        self.attribute_names = attribute_names
        super().__init__(width=width, height=height, type_='draw', axis_on=axis_on, name=name)

    def mpl_plot(self, ax=None, equal_aspect=True, **kwargs):
        """ Plots using matplotlib. """
        for primitive in self.primitives:
            ax = primitive.mpl_plot(ax=ax, **kwargs)
        if equal_aspect and ax:
            ax.set_aspect('equal')
        return ax

    def save_to_image(self, filepath, remove_axis=True):
        """ Save PrimitiveGroup to a picture generated with matplotlib. """
        ax = self.mpl_plot()
        if remove_axis:
            ax.set_axis_off()
            ax.figure.savefig(filepath, bbox_inches='tight', pad_inches=0)
        else:
            ax.figure.savefig(filepath)
        plt.close(ax.figure)

    def bounding_box(self):
        """ Get 2D bounding box of current PrimitiveGroup. """
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


class PrimitiveGroupsContainer(Figure):
    """
    A class for drawing several PrimitiveGroups in one canvas.

    :param primitive_groups: a list of PrimitiveGroups
    :type primitive_groups: List[PrimitiveGroup]
    :param sizes: [size0,...,size_n] where size_i = [width_i, length_i] is the size of primitive_groups[i]
    :type sizes: List[Tuple[float, float]]
    :param coords: In the same way as sizes but for coordinates.
    :type coords: List[Tuple[float, float]]
    :param associated_elements: A list containing the associated elements indices. associated_elements[i] is associated
    with primitive_groups[i]. It only works if this object is inside a MultiplePlots.
    :type associated_elements: List[int]
    :param x_variable: variable that you want to display on x axis
    :type x_variable: str
    :param y_variable: variable that you want to display on y axis
    :type y_variable: str
    """

    _plot_commands = "PRIMITIVE_GROUP_CONTAINER_COMMANDS"
    _plot_buttons = "EMPTY_BUTTONS"

    def __init__(self, primitive_groups: List[PrimitiveGroup], sizes: List[Tuple[float, float]] = None,
                 coords: List[Tuple[float, float]] = None, associated_elements: List[int] = None,
                 x_variable: str = None, y_variable: str = None, width: int = 750, height: int = 400,
                 axis_on: bool = True, name: str = ''):
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
        super().__init__(width=width, height=height, type_='primitivegroupcontainer', axis_on=axis_on, name=name)


class ParallelPlot(Figure):
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

    _plot_commands = "PARALLELPLOT_COMMANDS"
    _plot_buttons = "EMPTY_BUTTONS"

    def __init__(self, elements: List[Sample] = None, edge_style: EdgeStyle = None, disposition: str = None,
                 axes: List[str] = None, rgbs: List[Tuple[int, int, int]] = None, width: int = 750, height: int = 400,
                 axis_on: bool = True, name: str = ''):
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
        super().__init__(width=width, height=height, type_='parallelplot', axis_on=axis_on, name=name)


class Histogram(Figure):
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

    _plot_commands = "HISTOGRAM_COMMANDS"
    _plot_buttons = "EMPTY_BUTTONS"

    def __init__(self, x_variable: str, elements=None, axis: Axis = None, graduation_nb: float = None,
                 edge_style: EdgeStyle = None, surface_style: SurfaceStyle = None, width: int = 750, height: int = 400,
                 axis_on: bool = True, name: str = ''):
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
        self.x_variable = x_variable
        self.elements = sampled_elements
        self.axis = axis
        self.graduation_nb = graduation_nb
        self.edge_style = edge_style
        self.surface_style = surface_style
        super().__init__(width=width, height=height, type_='histogram', axis_on=axis_on, name=name)


class MultiplePlots(Figure):
    """
    A class for drawing multiple PlotDataObjects (except MultiplePlots) in one canvas.

    :param plots: a list of plots (Scatter, ParallelPlot,  PrimitiveGroup, PrimitiveGroupContainer, Graph2D)
    :param sizes: [size0,...,size_n] where size_i = [width_i, length_i] is the size of plots[i]
    :param elements: a list of vectors. All vectors must have the same attributes (ie the same keys)
    :param coords: same as sizes but for plots' coordinates.
    :param point_families: a list of point families
    :param initial_view_on: True for enabling initial layout, False  otherwise
    """

    _plot_commands = "MULTIPLOT_COMMANDS"
    _plot_buttons = "MULTIPLOT_BUTTONS"

    def __init__(self, plots: List[PlotDataObject], sizes: List[Window] = None, elements: List[Sample] = None,
                 coords: List[Tuple[float, float]] = None, point_families: List[PointFamily] = None,
                 initial_view_on: bool = None, width: int = 750, height: int = 400, axis_on: bool = True,
                 name: str = ''):
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
        self.points_sets = point_families
        self.initial_view_on = initial_view_on
        super().__init__(width=width, height=height, type_='multiplot', axis_on=axis_on, name=name)


def plot_data_path(local: bool = False, version: str = None):
    """ Get path of plot_data package to write it in html file of Figure to draw. """
    version, folder, filename = get_current_link(version=version)
    if local:
        core_path = os.sep.join(__file__.split(os.sep)[:-2] + [folder, filename])
        if os.path.isfile(core_path):
            return core_path.replace(" ", "%20")
        print(f'Local compiled {core_path} not found, fall back to CDN')
    return f'https://cdn.dessia.tech/js/plot-data/{version}/{filename}'


def make_filepath(filepath: str = None):
    """ Build path of written html file of Figure to draw. """
    if not filepath:
        filepath = tempfile.mkstemp(suffix='.html')[1]
    if not filepath.endswith('.html'):
        filepath += '.html'
        print(f'Changing name to {filepath}')
    return filepath


def plot_canvas(plot_data_object: Figure, filepath: str = None, local: bool = False, canvas_id: str = 'canvas',
                force_version: str = None, width: float = None, height: float = None):
    """
    Creates a html file and plots input data in web browser.

    :param plot_data_object: a PlotDataObject(ie Scatter, ParallelPlot,\
      MultiplePlots, Graph2D, PrimitiveGroup or PrimitiveGroupContainer)
    :type plot_data_object: PlotDataObject
    :param local: uses local library if True, uses typescript \
    library from cdn if False
    :type local: bool
    :param canvas_id: set canvas' id, ie name
    :type canvas_id: str
    :param width: set the canvas' width:
    :type width: str
    :param height: set the canvas' height
    :type height: str
    :param page_name: set the created html file's name
    :type page_name: str
    """
    if width:
        plot_data_object.width = width
    if height:
        plot_data_object.height = height
    plot_data_object.plot(filepath=filepath, local=local, canvas_id=canvas_id, version=force_version)


def write_json_for_tests(plot_data_object: PlotDataObject, json_path: str):
    """ Write JSON file of data to be used in Cypress tests of Typescript module. """
    if not json_path.endswith(".json"):
        json_path += ".json"
        print("Added '.json' at the end of json_path variable.")
    data = plot_data_object.to_dict()
    json_data = json.dumps(data)
    with open(json_path, "wb") as file:
        file.write(json_data.encode('utf-8'))


def get_csv_vectors(filepath):
    """ Get csv vector of a VectoredObject (does not exist anymore). """
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
            bounding_box_ = plot.bounding_box()
            xmin, xmax = min(xmin, bounding_box_[0]), max(xmax, bounding_box_[1])
            ymin, ymax = min(ymin, bounding_box_[2]), max(ymax, bounding_box_[3])

    return xmin, xmax, ymin, ymax


def get_current_link(version: str = None) -> Tuple[str, str, str]:
    """ Get link of plot_data package. """
    folder = "lib"
    filename = "core.js"
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
