export const PICKABLE_BORDER_SIZE = 20;
export const RUBBERBAND_SMALL_SIZE = 10;
export const RUBBERBAND_COLOR = 'hsl(200, 95%, 50%)';
export const RUBBERBAND_ALPHA = 0.5;

export const DASH_SELECTION_WINDOW = [7, 3];
export const AXIS_TAIL_SIZE = 0;

export const INFINITE_LINE_FACTOR = 1e3;
export const SIZE_AXIS_END = 7;
export const MAX_LABEL_HEIGHT = 12;
export const AXES_BLANK_SPACE = 3;
export const FIGURES_BLANK_SPACE = 4;
export const LEGEND_MARGIN = 2;
export const ZOOM_FACTOR = 1.2;

export const MIN_OFFSET_X = 33;
export const MIN_OFFSET_Y = 6;
export const DEFAULT_FONTSIZE = 12;
export const FREE_SPACE_FACTOR = 0.95;
export const DRAW_MARGIN_FACTOR = 0.025;

export const DEFAULT_SHAPE_COLOR = 'hsl(203, 90%, 85%)';
export const HOVERED_SHAPE_COLOR = 'hsl(203, 90%, 60%)';
export const CLICKED_SHAPE_COLOR = 'hsl(203, 90%, 35%)';
export const SELECTED_SHAPE_COLOR = 'hsl(140, 65%, 60%)';

export const STROKE_STYLE_OFFSET = 15;

export const TEXT_SEPARATORS = ["_", "/", "\\", " ", ",", ";", ":", "!", "?", ")", "(", "{", "}", "[", "]", "=", "+", "-"];
export const TOOLTIP_PRECISION = 100;
export const TOOLTIP_TEXT_OFFSET = 10;
export const TOOLTIP_TRIANGLE_SIZE = 10;

export const CIRCLES = ['o', 'circle', 'round'];
export const MARKERS = ['+', 'crux', 'mark'];
export const CROSSES = ['x', 'cross', 'oblique'];
export const SQUARES = ['square'];
export const TRIANGLES = ['^', 'triangle', 'tri'];
export const HALF_LINES = ['halfLine', 'halfline'];

export const LABEL_TEXT_OFFSET = 5;

export const REGEX_SAMPLES: RegExp = /^[0-9]+\ssamples/;

export const PG_CONTAINER_PLOT = {
    "name": "",
    "primitives": [
      {
        "name": "",
        "comment": "PrimitiveGroupContainer is not supported anymore in plot_data 0.19.0 and further versions.",
        "text_style": {
          "object_class": "plot_data.core.TextStyle",
          "name": "",
          "text_color": "rgb(100, 100, 100)",
          "font_size": 16,
          "text_align_x": "center",
          "text_align_y": "middle"
        },
        "position_x": 50.0,
        "position_y": 100,
        "text_scaling": false,
        "max_width": 250,
        "multi_lines": true,
        "type_": "text"
      }
    ],
    "type_": "primitivegroup",
    "axis_on": false
};

export const EMPTY_MULTIPLOT = {
    "name": "",
    "primitives": [
      {
        "name": "",
        "comment": "No plot defined in multiplot so there is nothing to draw.",
        "text_style": {
          "object_class": "plot_data.core.TextStyle",
          "name": "",
          "text_color": "rgb(100, 100, 100)",
          "font_size": 20,
          "text_align_x": "left"
        },
        "position_x": 50.0,
        "position_y": 100,
        "text_scaling": false,
        "max_width": 400,
        "multi_lines": true,
        "type_": "text"
      }
    ],
    "type_": "primitivegroup"
};
