export declare abstract class PlotData {
    data: any;
    width: number;
    height: number;
    coeff_pixel: number;
    context_show: any;
    context_hidden: any;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    init_scale: number;
    init_scaleX: number;
    init_scaleY: number;
    scale: number;
    scaleX: number;
    scaleY: number;
    scroll_x: number;
    scroll_y: number;
    last_mouse1X: number;
    last_mouse1Y: number;
    colour_to_plot_data: any;
    select_on_mouse: any;
    select_on_click: any[];
    color_surface_on_mouse: string;
    color_surface_on_click: string;
    context: any;
    tooltip_ON: boolean;
    axis_ON: boolean;
    link_object_ON: boolean;
    index_first_in: number;
    index_last_in: number;
    nb_points_in: number;
    graph_ON: boolean;
    plot_datas: any;
    tooltip_list: any[];
    zoom_rect_x: number;
    zoom_rect_y: number;
    zoom_rect_w: number;
    zoom_rect_h: number;
    zw_bool: boolean;
    zw_x: number;
    zw_y: number;
    zw_w: number;
    zw_h: number;
    reset_rect_x: number;
    reset_rect_y: number;
    reset_rect_w: number;
    reset_rect_h: number;
    select_bool: boolean;
    select_x: number;
    select_y: number;
    select_w: number;
    select_h: number;
    sort_list_points: any[];
    graph_to_display: boolean[];
    graph1_button_x: number;
    graph1_button_y: number;
    graph1_button_w: number;
    graph1_button_h: number;
    nb_graph: number;
    graph_colorlist: string[];
    graph_name_list: string[];
    graph_text_spacing_list: number[];
    decalage_axis_x: number;
    decalage_axis_y: number;
    last_point_list: any[];
    scatter_point_list: PlotDataPoint2D[];
    refresh_point_list_bool: boolean;
    buttons_ON: boolean;
    attribute_list: any[];
    value_list: any[];
    to_display_list: any[];
    parallel_plot_lineColor: string;
    parallel_plot_linewidth: string;
    axis_y_start: number;
    axis_y_end: number;
    y_step: number;
    axis_x_start: number;
    axis_x_end: number;
    x_step: number;
    move_index: number;
    elements: any;
    vertical: boolean;
    disp_x: number;
    disp_y: number;
    disp_w: number;
    disp_h: number;
    selected_axis_name: string;
    inverted_axis_list: boolean[];
    rubber_bands: any[];
    rubber_last_min: number;
    rubber_last_max: number;
    constructor(data: any, width: number, height: number, coeff_pixel: number);
    abstract draw(hidden: any, show_state: any, mvx: any, mvy: any, scaleX: any, scaleY: any): any;
    define_canvas(): void;
    set_canvas_size(height: number, width: number): void;
    draw_initial(): void;
    draw_empty_canvas(hidden: any): void;
    draw_contour(hidden: any, show_state: any, mvx: any, mvy: any, scaleX: any, scaleY: any, d: any): void;
    draw_point(hidden: any, show_state: any, mvx: any, mvy: any, scaleX: any, scaleY: any, d: any): void;
    draw_axis(mvx: any, mvy: any, scaleX: any, scaleY: any, d: any): void;
    draw_tooltip(d: any, mvx: any, mvy: any): void;
    find_min_dist(d: any, mvx: any, mvy: any, step: any): number;
    draw_graph2D(d: any, hidden: any, mvx: any, mvy: any): void;
    draw_scatterplot(d: any, hidden: any, mvx: any, mvy: any): void;
    draw_vertical_parallel_axis(nb_axis: number, mvx: number): void;
    draw_horizontal_parallel_axis(nb_axis: number, mvy: number): void;
    draw_parallel_axis(nb_axis: number, mv: number): void;
    get_index_of_element(val: any, list: any): number;
    get_coord_on_parallel_plot(attribute_type: any, current_list: any, elt: any, axis_coord_start: any, axis_coord_end: any, inverted: any): number;
    is_inside_band(real_x: any, real_y: any, axis_index: any): boolean;
    draw_parallel_coord_lines(nb_axis: number): void;
    draw_rubber_bands(mvx: any): void;
    refresh_to_display_list(elements: any): void;
    refresh_axis(nb_axis: any): void;
    add_to_value_list(to_disp_attributes: any): void;
    add_axis_to_parallelplot(name: string): void;
    remove_axis_from_parallelplot(name: string): void;
    zoom_button(x: any, y: any, w: any, h: any): void;
    zoom_window_button(x: any, y: any, w: any, h: any): void;
    reset_button(x: any, y: any, w: any, h: any): void;
    selection_button(x: any, y: any, w: any, h: any): void;
    graph_buttons(y: any, w: any, h: any, police: any): void;
    disp_button(x: any, y: any, w: any, h: any, police: any): void;
    zoom_window_action(mouse1X: any, mouse1Y: any, mouse2X: any, mouse2Y: any, scale_ceil: any): void;
    selection_window_action(mouse1X: any, mouse1Y: any, mouse2X: any, mouse2Y: any): void;
    zoom_in_button_action(): void;
    zoom_out_button_action(): void;
    click_on_zoom_window_action(): void;
    click_on_reset_action(): void;
    click_on_selection_button_action(): void;
    graph_button_action(mouse1X: any, mouse1Y: any): void;
    invert_rubber_bands(index_list: any): void;
    change_disposition_action(): void;
    create_rubber_band(mouse1X: any, mouse1Y: any, selected_axis_index: any, e: any): any[];
    rubber_band_translation(mouse1X: any, mouse1Y: any, selected_band_index: any, e: any): any[];
    rubber_band_resize(mouse1X: any, mouse1Y: any, selected_border: any, e: any): any[];
    mouse_down_interaction(mouse1X: any, mouse1Y: any, mouse2X: any, mouse2Y: any, isDrawing: any, e: any): any[];
    mouse_move_interaction(isDrawing: any, mouse_moving: any, mouse1X: any, mouse1Y: any, mouse2X: any, mouse2Y: any, e: any): any[];
    mouse_up_interaction(mouse_moving: any, mouse1X: any, mouse1Y: any, mouse2X: any, mouse2Y: any): any[];
    wheel_interaction(mouse3X: any, mouse3Y: any, e: any): any[];
    mouse_move_axis_inversion(isDrawing: any, e: any, selected_name_index: any): any[];
    initialize_click_on_axis(nb_axis: number, mouse1X: number, mouse1Y: number, click_on_axis: any): any[];
    initialize_click_on_name(nb_axis: number, mouse1X: number, mouse1Y: number): any[];
    initialize_click_on_bands(mouse1X: any, mouse1Y: any): any[];
    mouse_up_axis_interversion(mouse1X: any, mouse1Y: any, e: any): any[];
    select_title_action(selected_name_index: any): void;
    select_axis_action(selected_axis_index: any, click_on_band: any, click_on_border: any): void;
    rubber_band_size_check(selected_axis_index: any): boolean[];
    mouse_up_interaction_pp(click_on_axis: any, selected_axis_index: any, click_on_name: any, click_on_band: any, click_on_border: any, isDrawing_rubber_band: any, is_resizing: any, selected_name_index: any, mouse_moving: any, isDrawing: any, mouse1X: any, mouse1Y: any, mouse3X: any, mouse3Y: any, e: any): any[];
    mouse_interaction(parallelplot: boolean): void;
    contains_undefined(list: any): boolean;
    remove_selection(val: any, list: any): any[];
    is_include(val: any, list: any): boolean;
    get_nb_points_inside_canvas(list_points: any, mvx: any, mvy: any): number[];
    is_inside_canvas(point: any, mvx: any, mvy: any): boolean;
    get_points_inside_canvas(list_points: any, mvx: any, mvy: any): any[];
    distance(p1: any, p2: any): number;
    copy_list(list: any): any[];
    hashing_point(point: any, nb_x: any, nb_y: any, mvx: any, mvy: any): any[];
    hashing_list(point_list: any, nb_x: any, nb_y: any, mvx: any, mvy: any): any[];
    dehashing_list(hashed_point_list: any): any[];
    refresh_point_list(point_list: any, mvx: any, mvy: any): any[];
    delete_clicked_points(point_list: any): void;
    delete_tooltip(point_list: any): void;
}
export declare class PlotContour extends PlotData {
    data: any;
    width: number;
    height: number;
    coeff_pixel: number;
    plot_datas: any;
    constructor(data: any, width: number, height: number, coeff_pixel: number);
    draw(hidden: any, show_state: any, mvx: any, mvy: any, scaleX: any, scaleY: any): void;
}
export declare class PlotScatter extends PlotData {
    data: any;
    width: number;
    height: number;
    coeff_pixel: number;
    constructor(data: any, width: number, height: number, coeff_pixel: number);
    draw(hidden: any, show_state: any, mvx: any, mvy: any, scaleX: any, scaleY: any): void;
}
export declare class ParallelPlot extends PlotData {
    data: any;
    width: any;
    height: any;
    coeff_pixel: any;
    constructor(data: any, width: any, height: any, coeff_pixel: any);
    draw_initial(): void;
    draw(hidden: any, show_state: any, mvx: any, mvy: any, scaleX: any, scaleY: any): void;
    initialize_data_lists(): void;
}
export declare class PlotDataContour2D {
    plot_data_primitives: any;
    plot_data_states: any;
    type: string;
    name: string;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    mouse_selection_color: any;
    constructor(plot_data_primitives: any, plot_data_states: any, type: string, name: string);
    static deserialize(serialized: any): PlotDataContour2D;
}
export declare class PlotDataLine2D {
    data: any;
    plot_data_states: any;
    type: string;
    name: string;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    constructor(data: any, plot_data_states: any, type: string, name: string);
    static deserialize(serialized: any): PlotDataLine2D;
    draw(context: any, first_elem: any, mvx: any, mvy: any, scaleX: any, scaleY: any): void;
}
export declare class PlotDataCircle2D {
    data: any;
    cx: number;
    cy: number;
    r: number;
    plot_data_states: PlotDataState[];
    type: string;
    name: string;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    constructor(data: any, cx: number, cy: number, r: number, plot_data_states: PlotDataState[], type: string, name: string);
    static deserialize(serialized: any): PlotDataCircle2D;
    draw(context: any, first_elem: any, mvx: any, mvy: any, scaleX: any, scaleY: any): void;
}
export declare class PlotDataPoint2D {
    cx: number;
    cy: number;
    shape: string;
    point_size: number;
    color_fill: string;
    color_stroke: string;
    stroke_width: number;
    type: string;
    name: string;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    mouse_selection_color: any;
    size: number;
    k: number;
    constructor(cx: number, cy: number, shape: string, point_size: number, color_fill: string, color_stroke: string, stroke_width: number, type: string, name: string);
    static deserialize(serialized: any): PlotDataPoint2D;
    draw(context: any, context_hidden: any, mvx: any, mvy: any, scaleX: any, scaleY: any): void;
    copy(): PlotDataPoint2D;
}
export declare class PlotDataAxis {
    nb_points_x: number;
    nb_points_y: number;
    font_size: number;
    graduation_color: string;
    axis_color: string;
    name: string;
    arrow_on: boolean;
    axis_width: string;
    grid_on: boolean;
    type: string;
    colorStroke: any;
    x_step: number;
    y_step: number;
    constructor(nb_points_x: number, nb_points_y: number, font_size: number, graduation_color: string, axis_color: string, name: string, arrow_on: boolean, axis_width: string, grid_on: boolean, type: string);
    static deserialize(serialized: any): PlotDataAxis;
    draw_graduations(context: any, mvx: any, mvy: any, scaleX: any, scaleY: any, axis_x_start: any, axis_x_end: any, axis_y_start: any, axis_y_end: any, minX: any, maxX: any, minY: any, maxY: any, x_step: any, y_step: any, font_size: any): void;
    draw(context: any, mvx: any, mvy: any, scaleX: any, scaleY: any, width: any, height: any, init_scaleX: any, init_scaleY: any, minX: any, maxX: any, minY: any, maxY: any, scroll_x: any, scroll_y: any, decalage_axis_x: any, decalage_axis_y: any): void;
}
export declare class PlotDataTooltip {
    colorfill: string;
    text_color: string;
    font: string;
    tp_radius: any;
    to_plot_list: any;
    opacity: number;
    type: string;
    name: string;
    constructor(colorfill: string, text_color: string, font: string, tp_radius: any, to_plot_list: any, opacity: number, type: string, name: string);
    static deserialize(serialized: any): PlotDataTooltip;
    draw(context: any, object: any, mvx: any, mvy: any, scaleX: any, scaleY: any, canvas_width: any, canvas_height: any): void;
    manage_tooltip(context: any, mvx: any, mvy: any, scaleX: any, scaleY: any, canvas_width: any, canvas_height: any, tooltip_list: any): void;
}
export declare class PlotDataGraph2D {
    point_list: PlotDataPoint2D[];
    dashline: number[];
    graph_colorstroke: string;
    graph_linewidth: number;
    segments: PlotDataLine2D[];
    display_step: number;
    type: string;
    name: string;
    id: number;
    constructor(point_list: PlotDataPoint2D[], dashline: number[], graph_colorstroke: string, graph_linewidth: number, segments: PlotDataLine2D[], display_step: number, type: string, name: string);
    static deserialize(serialized: any): PlotDataGraph2D;
}
export declare class PlotDataScatter {
    point_list: PlotDataPoint2D[];
    type: string;
    name: string;
    constructor(point_list: PlotDataPoint2D[], type: string, name: string);
    static deserialize(serialized: any): PlotDataScatter;
}
export declare class PlotDataArc2D {
    cx: number;
    cy: number;
    r: number;
    data: any;
    angle1: number;
    angle2: number;
    plot_data_states: PlotDataState[];
    type: string;
    name: string;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    constructor(cx: number, cy: number, r: number, data: any, angle1: number, angle2: number, plot_data_states: PlotDataState[], type: string, name: string);
    static deserialize(serialized: any): PlotDataArc2D;
    draw(context: any, first_elem: any, mvx: any, mvy: any, scaleX: any, scaleY: any): void;
}
export declare class Attribute {
    name: string;
    type: string;
    constructor(name: string, type: string);
    static deserialize(serialized: any): Attribute;
}
export declare class PlotDataState {
    color_surface: ColorSurfaceSet;
    color_map: any;
    hatching: HatchingSet;
    opacity: number;
    dash: any;
    marker: any;
    color_line: any;
    shape_set: PointShapeSet;
    point_size: PointSizeSet;
    point_color: PointColorSet;
    window_size: WindowSizeSet;
    stroke_width: any;
    name: any;
    constructor(color_surface: ColorSurfaceSet, color_map: any, hatching: HatchingSet, opacity: number, dash: any, marker: any, color_line: any, shape_set: PointShapeSet, point_size: PointSizeSet, point_color: PointColorSet, window_size: WindowSizeSet, stroke_width: any, name: any);
    static deserialize(serialized: any): PlotDataState;
    copy(): PlotDataState;
}
export declare class ColorSurfaceSet {
    name: string;
    color: any;
    constructor(name: string, color: any);
    static deserialize(serialized: any): ColorSurfaceSet;
}
export declare class PointShapeSet {
    name: string;
    shape: any;
    constructor(name: string, shape: any);
    static deserialize(serialized: any): PointShapeSet;
}
export declare class PointSizeSet {
    name: string;
    size: number;
    constructor(name: string, size: number);
    static deserialize(serialized: any): PointSizeSet;
}
export declare class PointColorSet {
    name: string;
    color_fill: string;
    color_stroke: string;
    constructor(name: string, color_fill: string, color_stroke: string);
    static deserialize(serialized: any): PointColorSet;
}
export declare class WindowSizeSet {
    name: string;
    height: number;
    width: number;
    constructor(name: string, height: number, width: number);
    static deserialize(serialized: any): WindowSizeSet;
}
export declare class HatchingSet {
    name: string;
    stroke_width: number;
    hatch_spacing: number;
    canvas_hatching: any;
    constructor(name: string, stroke_width: number, hatch_spacing: number);
    static deserialize(serialized: any): HatchingSet;
    generate_canvas(): HTMLCanvasElement;
}
export declare class MyMath {
    static round(x: number, n: number): number;
    static log10(x: any): number;
}
export declare class Shape {
    static drawLine(context: any, list: any): void;
    static crux(context: any, cx: number, cy: number, length: number): void;
    static roundRect(x: any, y: any, w: any, h: any, radius: any, context: any): void;
    static Is_in_rect(x: any, y: any, rect_x: any, rect_y: any, rect_w: any, rect_h: any): boolean;
    static createButton(x: any, y: any, w: any, h: any, context: any, text: any, police: any): void;
    static createGraphButton(x: any, y: any, w: any, h: any, context: any, text: any, police: any, colorfill: any, strikeout: any): void;
    static rect(x: any, y: any, w: any, h: any, context: any, colorfill: any, colorstroke: any, linewidth: any, opacity: any): void;
}
export declare function drawLines(ctx: any, pts: any): void;
export declare function getCurvePoints(pts: any, tension: any, isClosed: any, numOfSegments: any): any[];
export declare function genColor(): string;
export declare function componentToHex(c: any): any;
export declare function rgb_to_hex(rgb: string): string;
export declare function hex_to_string(hexa: string): string;
export declare function string_to_hex(str: string): string;
export declare function rgb_to_string(rgb: string): string;
export declare function rgb_interpolation([r1, g1, b1]: [any, any, any], [r2, g2, b2]: [any, any, any], n: number): any[];
export declare function rgb_interpolations(rgbs: any, nb_pts: number): any[];
