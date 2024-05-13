import { PointSet } from "./collections"
import { PointStyleInterface } from "./styles"

export interface AxisStyleInterface {
    color_stroke?: string,
    dashline?: number[],
    line_width?: number,
    name?: string,
    object_class?: string,
}

export interface GraduationStyleInterface {
    font_size?: number,
    font_style?: string,
    name?: string,
    object_class?: string,
    text_color?: string
}

export interface AxisInterface {
    arrow_on?: boolean,
    axis_style?: AxisStyleInterface,
    graduation_style?: GraduationStyleInterface,
    grid_on?: boolean,
    name?: string,
    nb_points_x?: number,
    nb_points_y?: number,
    type_: string
}

export interface EdgeStyleInterface {
    line_width?: number,
    dashline?: number[],
    color_stroke?: string
}

export interface HatchingInterface {
    stroke_width?: number,
    hatch_spacing?: number
}

export interface SurfaceStyleInterface {
    line_width?: number,
    hatching?: HatchingInterface,
    color_fill?: string,
    opacity?: number
}

export interface GraphInterface {
    elements?: Object[],
    point_style?: PointStyleInterface,
    edge_style?: EdgeStyleInterface,
    tooltip?: any,
    display_step?: number,
    partial_points?: boolean,
    name?: string
}

// This interface will be reworked when designing a new Python language
export interface DataInterface {
    attribute_names?: string[],
    x_variable?: string,
    axis?: AxisInterface,
    elements?: Object[],
    points_sets?: PointSet[],
    point_style?: PointStyleInterface,
    edge_style?: EdgeStyleInterface,
    surface_style?: SurfaceStyleInterface,
    name?: string,
    width?: number,
    height?: number,
    heatmap?: any, //for now
    graphs?: GraphInterface[],
    primitives?: any, //for now, needs a specific interface
    tooltip?: any, //for now: tooltip can be Tooltip Object or string,
    graduation_nb?: number,
    type_?: string,
    axis_on?: boolean,
    interactive?: boolean
}

export interface MultiplotDataInterface {
    plots?: DataInterface[],
    elements?: Object[],
    sizes?: any[], // for nom, cause in Python it is a Window type
    coords?: [number, number][]
    points_sets?: PointSet[],
    initial_view_on?: boolean,
    width?: number,
    height?: number,
    name?: string,
}
