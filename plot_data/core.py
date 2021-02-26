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
    """
    Delete input dictionary's keys where value is None.
    """
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
    Abstract interface for DessiaObject implementation in module
    """

    def __init__(self, type_: str, name: str = '', **kwargs):
        self.type_ = type_
        DessiaObject.__init__(self, name=name, **kwargs)

    def to_dict(self):
        """
        Redefines DessiaObject's to_dict() in order to remove keys where
        value is None.
        """
        dict_ = DessiaObject.to_dict(self)
        del dict_['object_class']
        new_dict_ = delete_none_from_dict(dict_)
        return new_dict_

    @classmethod
    def dict_to_object(cls, dict_):
        """
        :rtype: Subclass[PlotDataObject]
        """
        type_ = dict_['type_']
        object_class = TYPE_TO_CLASS[type_]

        dict_['object_class'] = full_classname(object_class)
        return DessiaObject.dict_to_object(dict_=dict_)


# class ColorMapSet(DessiaObject):
#     def __init__(self, value: float = None, tooltip: bool = False,
#                  color_range: str = None, selector: bool = True,
#                  name: str = ''):
#         self.selector = selector
#         self.color_range = color_range
#         self.tooltip = tooltip
#         self.value = value
#         DessiaObject.__init__(self, name=name)


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


# class ColorSurfaceSet(DessiaObject):
#     def __init__(self, color: str = 'white', name: str = ''):
#         self.color = color
#         DessiaObject.__init__(self, name=name)


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
    :type color_stroke: str
    :param dashline: a list of positive floats [a1,...,an] representing \
    a pattern where a_2i is the number of solid pixels and a_2i+1 is \
    the number of empty pixels.
    :type dashline: List[float]
    """

    def __init__(self, line_width: float = None, color_stroke: str = None,
                 dashline: List[int] = None, name: str = ''):
        self.line_width = line_width
        self.color_stroke = color_stroke
        self.dashline = dashline
        DessiaObject.__init__(self, name=name)


DEFAULT_EDGESTYLE = EdgeStyle(color_stroke=colors.BLACK)


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


class TextStyle(DessiaObject):
    """
    A class for customizing Text.

    :param text_color: the text's color
    :type text_color: colors.Colors
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
    """

    def __init__(self, text_color: colors.Color = None,
                 font_size: float = None,
                 font_style: str = None,
                 text_align_x: str = None, text_align_y: str = None,
                 bold: bool = None, italic: bool = None,
                 name: str = ''):
        self.text_color = text_color
        self.font_size = font_size
        self.font_style = font_style
        self.text_align_x = text_align_x
        self.text_align_y = text_align_y
        self.bold = bold
        self.italic = italic
        DessiaObject.__init__(self, name=name)


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

    def __init__(self, color_fill: str = None, opacity: float = None,
                 hatching: HatchingSet = None, name: str = ''):
        self.color_fill = color_fill
        self.opacity = opacity
        self.hatching = hatching
        DessiaObject.__init__(self, name=name)


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
    """

    def __init__(self, comment: str, position_x: float, position_y: float,
                 text_style: TextStyle = None, text_scaling: bool = None,
                 max_width: float = None, name: str = ''):
        self.comment = comment
        self.text_style = text_style
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
    """
    An infinite line. Line2D is a primitive and can be instantiated by \
    PrimitiveGroups.

    :param data: [x1, y1, x2, y2] where (x1, y1) and (x2, y2) are two \
    points that belong to the line.
    :type data: [float, float, float, float]
    :param edge_style: for customization
    :type edge_style: EdgeStyle
    """

    def __init__(self, data: List[float], edge_style: EdgeStyle = None,
                 name: str = ''):
        self.data = data
        self.edge_style = edge_style
        PlotDataObject.__init__(self, type_='line2d', name=name)

    def mpl_plot(self, ax=None):
        """
        Plots using matplotlib.
        """
        if ax is None:
            _, ax = plt.subplots()

        if not self.edge_style:
            color = DEFAULT_EDGESTYLE.color_stroke.rgb
            dashes = DEFAULT_EDGESTYLE.dashline
        else:
            color = self.edge_style.color_stroke.rgb
            dashes = self.edge_style.dashline

        ax.axline((self.data[0], self.data[1]), (self.data[2], self.data[3]),
                  color=color, dashes=dashes)


class LineSegment2D(PlotDataObject):
    """
    A line segment. This is a primitive that can be called by \
    PrimitiveGroup.

    :param data: [x1, y1, x2, y2] where (x1, y1) and (x2, y2) are two \
    points that belong to the line segment.
    :type data: [float, float, float, float]
    :param edge_style: for customization
    :type edge_style: EdgeStyle
    """

    def __init__(self, data: List[float], edge_style: EdgeStyle = None,
                 name: str = ''):
        self.data = data
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

    def mpl_plot(self, ax=None):
        """
        Plots using matplotlib.
        """
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
    """

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
                                    fill=surface_alpha > 0))
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
            self.graduation_style = TextStyle(text_color=colors.GREY)
        self.axis_style = axis_style
        if axis_style is None:
            self.axis_style = EdgeStyle(color_stroke=colors.LIGHTGREY)
        self.arrow_on = arrow_on
        self.grid_on = grid_on
        PlotDataObject.__init__(self, type_='axis', name=name)


class Tooltip(PlotDataObject):
    """
    A class that contains information for drawing a tooltip when \
    clicking on points.
    A tooltip object is instantiated by Scatter and Dataset classes.

    :param to_disp_attribute_names: a list containing the attributes \
    you want to display. Attributes must be taken from Dataset's or \
    Scatter's elements.
    :type to_disp_attribute_names: List[str]
    :param surface_style: for customizing the tooltip's interior
    :type surface_style: SurfaceStyle
    :param text_style: for customizing its text
    :type text_style: TextStyle
    :param tooltip_radius: a tooltip is rounded-rectangle-shaped. \
    This parameter defines its corners radius.
    :type tooltip_radius: float
    """

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
    :param to_disp_attribute_names: [attribute_x, attribute_y] where \
    attribute_x is the attribute displayed on x-axis and attribute_y \
    is the attribute displayed on y-axis.
    :type to_disp_attribute_names: [str, str]
    """
    to_disp_attribute_names = None

    def __init__(self, elements=None,
                 edge_style: EdgeStyle = None, tooltip: Tooltip = None,
                 point_style: PointStyle = None,
                 display_step: int = 1, name: str = ''):

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
    """
    Takes one or several Datasets as input and displays them all in \
    one canvas.

    :param graphs: a list of Datasets
    :type graphs: List[Dataset]
    :param to_disp_attribute_names: [attribute_x, attribute_y] where \
    attribute_x is the attribute displayed on x-axis and attribute_y \
    is the attribute displayed on y-axis
    :type to_disp_attribute_names: [str, str]
    :param axis: an object containing all information needed for \
    drawing axis
    :type axis: Axis
    """

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
    """
    A class for drawing scatter plots.

    :param elements: A list of vectors. Vectors must have the same \
    attributes (ie the same keys)
    :type elements: List[dict]
    :param to_disp_attribute_names: [attribute_x, attribute_y] where \
    attribute_x is the attribute displayed on x-axis and attribute_y \
    is the attribute displayed on y-axis
    :type to_disp_attribute_names: [str, str]
    :param tooltip: an object containing all information needed for \
    drawing tooltips
    :type tooltip: Tooltip
    :param point_style: for points' customization
    :type point_style: PointStyle
    :param axis: an object containing all information needed for \
    drawing axis
    :type axis: Axis
    """

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
    """
    A class for drawing arcs. Arc2D is a primitive and can be \
    instantiated by PrimitiveGroup.

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
            edgecolor = colors.BLACK.rgb

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
    """

    def __init__(self, plot_data_primitives: List[Union[Arc2D, LineSegment2D]],
                 edge_style: EdgeStyle = None,
                 surface_style: SurfaceStyle = None, name: str = ''):
        self.plot_data_primitives = plot_data_primitives
        self.edge_style = edge_style
        self.surface_style = surface_style
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
                xmin, xmax, ymin, ymax = min(xmin, bb[0]), max(xmax,
                                                               bb[1]), min(
                    ymin, bb[2]), max(ymax, bb[3])

        return xmin, xmax, ymin, ymax

    def mpl_plot(self, ax=None):
        """
        Plots using matplotlib
        """
        for primitive in self.plot_data_primitives:
            ax = primitive.mpl_plot(ax=ax)
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
    Circle2D or Line2D
    :type primitives: List[Union[Contour2D, Arc2D, LineSegment2D, \
    Circle2D, Line2D]]
    """

    def __init__(self, primitives: List[Union[Contour2D, Arc2D, LineSegment2D,
                                              Circle2D, Line2D]],
                 name: str = ''):
        self.primitives = primitives
        PlotDataObject.__init__(self, type_='primitivegroup', name=name)

    def mpl_plot(self, ax=None, equal_aspect=True):
        """
        Plots using matplotlib
        """
        ax = self.primitives[0].mpl_plot(ax=ax)
        for primitive in self.primitives[1:]:
            primitive.mpl_plot(ax=ax)
        ax.set_aspect('equal')
        return ax

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
    elements indices. associated_elements[i] is assoaciated with \
    primitive_groups[i]. It only works if this object is inside a \
    MultiplePlots.
    :type associated_elements: List[int]
    :param to_disp_attribute_names: A list containing the attribute \
    names to be displayed on axis. It may contain one or two names. ex:\
     ['mass'] or ['length', 'mass']. Set it to None for no axis.
    :type to_disp_attribute_names: List[str]
    """

    def __init__(self, primitive_groups: List[PrimitiveGroup],
                 sizes: List[Tuple[float, float]] = None,
                 coords: List[Tuple[float, float]] = None,
                 associated_elements: List[int] = None,
                 to_disp_attribute_names: List[str] = None,
                 name: str = ''):
        self.primitive_groups = primitive_groups
        self.sizes = sizes
        self.coords = coords
        if to_disp_attribute_names:
            self.association = {'associated_elements': associated_elements,
                                'to_disp_attribute_names': to_disp_attribute_names}
        PlotDataObject.__init__(self, type_='primitivegroupcontainer',
                                name=name)


class ParallelPlot(PlotDataObject):
    """
    Draws a parallel coordinates plot.

    :param elements: a list of vectors. Vectors must have the same \
    attributes (ie the same keys)
    :type elements: List[dict]
    :param edge_style: for customizing lines
    :type edge_style: EdgeStyle
    :param disposition: either 'vertical' or 'horizontal' depending on \
    how you want the initial disposition to be.
    :type disposition: str
    :param to_disp_attribute_names: a list on attribute names you want \
    to display as axis on this parallel plot.
    :type to_disp_attribute_names: List[str]
    :param rgbs: a list of rgb255 colors for color interpolation. Color\
     interpolation is enabled when clicking on an axis.
    :type rgbs: List[Tuple[int, int, int]]
    """

    def __init__(self, elements=None, edge_style: EdgeStyle = None,
                 disposition: str = None,
                 to_disp_attribute_names: List[str] = None,
                 rgbs: List[Tuple[int, int, int]] = None,
                 name: str = ''):
        self.elements = elements
        self.edge_style = edge_style
        self.disposition = disposition
        self.to_disp_attribute_names = to_disp_attribute_names
        self.rgbs = rgbs
        PlotDataObject.__init__(self, type_='parallelplot', name=name)


class Attribute(PlotDataObject):
    """
    Represents an attribute.

    :param type_: The attribute's type (in that case, values are either\
     'float', 'color' or 'string')
    :type type_: str
    :param name: The attribute's name
    :type name: str
    """

    def __init__(self, type_: str, name: str):
        PlotDataObject.__init__(self, type_=type_, name=name)


class PointFamily(PlotDataObject):
    """
    A class that defines a point family. This class can be used in \
    MultiplePlots to create families of points.

    :param point_color: a color that is proper to this family (rgb255)
    :type point_color: str
    :param point_index: a list containing the point's index from \
    MultiplePlots.elements
    :type point_index: List[int]
    """

    def __init__(self, point_color: str, point_index: List[int],
                 name: str = ''):
        self.color = point_color
        self.point_index = point_index
        PlotDataObject.__init__(self, type_=None, name=name)


class MultiplePlots(PlotDataObject):
    """
    A class for drawing multiple PlotDataObjects (except MultiplePlots)\
     in one canvas.

    :param plots: a list of plots (Scatter, ParallelPlot, \
    PrimitiveGroup, PrimitiveGroupContainer, Graph2D)
    :type plots: List[Subclass[PlotDataObject]]
    :param sizes: [size0,...,size_n] where size_i = [width_i, length_i]\
     is the size of plots[i]
    :type sizes: List[Tuple[float, float]]
    :param elements: a list of vectors. All vectors must have the same \
    attributes (ie the same keys)
    :type elements: List[dict]
    :param coords: same as sizes but for plots' coordinates.
    :type coords: List[Tuple[float, float]]
    :param point_families: a list of point families
    :type point_families: List[PointFamily]
    :param initial_view_on: True for enabling initial layout, False \
    otherwise
    :type initial_view_on: bool
    """

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
                width: int = 750, height: int = 400, page_name: str = None):
    """
    Creates a html file and plots input data in web browser

    :param plot_data_object: a PlotDataObject(ie Scatter, ParallelPlot,\
     MultiplePlots, Graph2D, PrimitiveGroup or PrimitiveGroupContainer)
    :type plot_data_object: Subclass[PlotDataObject]
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
    """
    :param filepath: the csv file's relative path, starting from the \
    script's path.
    :type filepath: str

    :return: a list of vectors (ie a list of dictionaries) that can be \
    set to multiple_plots' or parallelplot's elements for example.
    :rtype: List[dict]
    """
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


def bounding_box(plot_datas: Subclass[PlotDataObject]):
    """
    Calls input plot_datas' bounding_box method, if it has one.

    :param plot_datas: The target object the bounding_box method has to\
     be called from
    :type plot_datas: Subclass[PlotDataObject]

    :return: a bounding box
    :rtype: float, float, float, float
    """
    xmin, xmax, ymin, ymax = math.inf, -math.inf, math.inf, -math.inf
    for plot_data in plot_datas:
        if hasattr(plot_data, 'bounding_box'):
            bb = plot_data.bounding_box()
            xmin, xmax = min(xmin, bb[0]), max(xmax, bb[1])
            ymin, ymax = min(ymin, bb[2]), max(ymax, bb[3])

    return xmin, xmax, ymin, ymax
