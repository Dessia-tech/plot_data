export const BORDER_SIZE = 20;
export const SMALL_RUBBERBAND_SIZE = 10;
export const SIZE_END = 7;
export const MAX_LABEL_HEIGHT = 12;
export const BLANK_SPACE = 3;
export const MIN_FONTSIZE = 6;
export const MIN_OFFSET = 33;
export const ZOOM_FACTOR = 1.2;
export const DEFAULT_POINT_COLOR = 'hsl(203, 90%, 85%)';
export const FREE_SPACE_FACTOR = 0.95;
export const DRAW_MARGIN_FACTOR = 0.025;

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
    "type_": "primitivegroup"
  };

export const TEXT_SEPARATORS = ["_", "/", "\\", " ", ",", ";", ":", "!", "?", ")", "(", "{", "}", "[", "]", "=", "+", "-"];
export const DEFAULT_FONTSIZE = 12;
export const TOOLTIP_PRECISION = 100;
export const TOOLTIP_TEXT_OFFSET = 10;
export const TOOLTIP_TRIANGLE_SIZE = 10;

export const CIRCLES = ['o', 'circle', 'round'];
export const MARKERS = ['+', 'crux', 'mark'];
export const CROSSES = ['x', 'cross', 'oblique'];
export const SQUARES = ['square'];
export const TRIANGLES = ['^', 'triangle', 'tri'];
export const HALF_LINES = ['halfLine', 'halfline'];
export const STROKE_STYLE_OFFSET = 15;