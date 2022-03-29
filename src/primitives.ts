
import { string_to_rgb, rgb_to_string, string_to_hex } from "./color_conversion";
import { EdgeStyle, SurfaceStyle, PointStyle, TextStyle } from "./style";
import { set_default_values, genColor, drawLines, getCurvePoints, Tooltip, Axis, PointFamily, Attribute, TypeOf } from "./utils";
import { Shape, List, MyObject } from "./toolbox";


/**
 * A class for drawing Arc2Ds.
 */
export class Arc2D {
    minX:number=0;
    maxX:number=0;
    minY:number=0;
    maxY:number=0;
    init_scale:number=0;
  
    /**
     * 
     * @param cx the center x coordinate
     * @param cy the center y coordinate
     * @param r radius
     * @param start_angle in radian
     * @param end_angle in radian
     * @param data A list of relevant points for BSPline drawing (optional if the arc2D isn't inside a contour).
     It is usually generated by volmdlr.
     * @param anticlockwise true or false whether you want the arc the be drawn anticlockwise or not.
     * @param edge_style Edge customization
     */
    constructor(public cx:number,
                public cy:number,
                public r:number,
                public start_angle:number, // Warning: canvas' angles are clockwise-oriented. For example: pi/2 rad is below -pi/2 rad.
                public end_angle:number,
                public data:any[],
                public anticlockwise:boolean=true,
                public edge_style:EdgeStyle,
                public type_:string,
                public name:string) {
        this.minX = this.cx - this.r;
        this.maxX = this.cx + this.r;
        this.minY = this.cy - this.r;
        this.maxY = this.cy + this.r;
  
        this.start_angle = this.start_angle % Math.PI;
        this.end_angle = this.end_angle % Math.PI;
    }
  
    public static deserialize(serialized) {
      var default_edge_style = {color_stroke:string_to_rgb('grey'), dashline:[], line_width:0.5, name:''};
      var default_dict_ = {edge_style:default_edge_style};
      serialized = set_default_values(serialized, default_dict_);
      var edge_style = EdgeStyle.deserialize(serialized['edge_style'])
      return new Arc2D(serialized['cx'],
                       -serialized['cy'],
                       serialized['r'],
                       -serialized['start_angle'],
                       -serialized['end_angle'],
                       serialized['data'],
                       serialized['anticlockwise'],
                       edge_style,
                       serialized['type_'],
                       serialized['name']);
    }
  
    draw(context, mvx, mvy, scaleX, scaleY, X, Y) {
      context.lineWidth = this.edge_style.line_width;
      context.color_stroke = this.edge_style.color_stroke;
      context.arc(scaleX*this.cx + mvx + X, 
                  scaleY*this.cy + mvy + Y, 
                  scaleX*this.r, 
                  this.start_angle, 
                  this.end_angle, 
                  this.anticlockwise);
    }
  
  
    contour_draw(context, first_elem, mvx, mvy, scaleX, scaleY, X, Y) {
      context.lineWidth = this.edge_style.line_width;
      context.strokeStyle = this.edge_style.color_stroke;
      var ptsa = [];
      for (var l = 0; l < this.data.length; l++) {
        ptsa.push(scaleX*this.data[l]['x']+ mvx + X);
        ptsa.push(-scaleY*this.data[l]['y']+ mvy + Y);
      }
      var tension = 0.4;
      var isClosed = false;
      var numOfSegments = 16;
      drawLines(context, getCurvePoints(ptsa, tension, isClosed, numOfSegments), first_elem);
    }
}  


export class Circle2D {
    minX:number=0;
    maxX:number=0;
    minY:number=0;
    maxY:number=0;
    hidden_color:any;
  
    constructor(public data:any,
                public cx:number,
                public cy:number,
                public r:number,
                public edge_style:EdgeStyle,
                public surface_style:SurfaceStyle,
                public type_:string='circle',
                public name:string) {
        this.minX = this.cx - this.r;
        this.maxX = this.cx + this.r;
        this.minY = this.cy - this.r;
        this.maxY = this.cy + this.r;
  
      this.hidden_color = genColor();
    }
  
    public static deserialize(serialized) {
        var default_edge_style = {color_stroke:string_to_rgb('black'), dashline:[], line_width:1, name:''};
        var default_surface_style = {color_fill:string_to_rgb('white'), hatching:null, opacity:0};
        var default_dict_ = {edge_style:default_edge_style, surface_style:default_surface_style};
        serialized = set_default_values(serialized, default_dict_);
        var edge_style = EdgeStyle.deserialize(serialized['edge_style']);
        var surface_style = SurfaceStyle.deserialize(serialized['surface_style']);
        return new Circle2D(serialized['data'],
                                    serialized['cx'],
                                    -serialized['cy'],
                                    serialized['r'],
                                    edge_style,
                                    surface_style,
                                    serialized['type_'],
                                    serialized['name']);
    }
  
    draw(context, mvx, mvy, scaleX, scaleY, X, Y) {
      context.arc(scaleX*this.cx+ mvx + X, scaleY*this.cy + mvy + Y, scaleX*this.r, 0, 2*Math.PI);
    }
  
}


/** 
 * @param plot_data_primitives A set of primitives (LineSegment2D, Arc2D) that draw a closed polygon.
 */
export class Contour2D {
    minX:number=0;
    maxX:number=0;
    minY:number=0;
    maxY:number=0;
    hidden_color:any;
  
    constructor(public plot_data_primitives:any,
                public edge_style:EdgeStyle,
                public surface_style:SurfaceStyle,
                public tooltip: Tooltip,
                public type_:string='contour',
                public name:string) {
        for (var i = 0; i < this.plot_data_primitives.length; i++) {
          var d = plot_data_primitives[i]
          this.minX = Math.min(this.minX, d.minX);
          this.maxX = Math.max(this.maxX, d.maxX);
          this.minY = Math.min(this.minY, d.minY);
          this.maxY = Math.max(this.maxY, d.maxY);
        }
        this.hidden_color = genColor();
  
    }
  
    public static deserialize(serialized) {
      var default_edge_style = {color_stroke:string_to_rgb('black'), dashline:[], line_width:1};
      var default_surface_style = {color_fill:string_to_rgb('white'), hatching:null, opacity:1};
      var default_dict_ = {edge_style:default_edge_style, surface_style:default_surface_style};
      serialized = set_default_values(serialized, default_dict_);
      var edge_style = EdgeStyle.deserialize(serialized['edge_style']);
      var surface_style = SurfaceStyle.deserialize(serialized['surface_style']);
      var temp = serialized['plot_data_primitives'];
      var plot_data_primitives = [];
      for (var i = 0; i < temp.length; i++) {
        var d = temp[i];
        if (d['type_'] == 'linesegment2d') {
          let new_line = LineSegment2D.deserialize(d);
          new_line.edge_style = edge_style;
          plot_data_primitives.push(new_line);
        }
        if (d['type_'] == 'arc') {
          let new_arc = Arc2D.deserialize(d);
          new_arc.edge_style = edge_style;
          plot_data_primitives.push(new_arc);
        }
      }
      if (serialized["text"]) {
        let surface_style = new SurfaceStyle(string_to_hex("lightgrey"), 0.5, undefined);
        let text_style = new TextStyle(string_to_hex("black"), 14, "Calibri");
        let tooltip = new Tooltip(surface_style, text_style, undefined, serialized["text"]);
        return new Contour2D(plot_data_primitives,
          edge_style,
          surface_style,
          tooltip,
          serialized['type_'],
          serialized['name']);
      }
      return new Contour2D(plot_data_primitives,
                                    edge_style,
                                    surface_style,
                                    undefined,
                                    serialized['type_'],
                                    serialized['name']);
    }
}


export class Dataset {
    id:number=0;
    point_list:Point2D[]=[];
    segments:LineSegment2D[];
  
    constructor(public attribute_names:string[],
                public edge_style:EdgeStyle,
                public tooltip:Tooltip,
                public point_style:PointStyle,
                public elements:any[],
                public display_step:number,
                public type_:string,
                public name:string) {
      this.initialize_point_list();
      this.initialize_segments();
    }
  
    initialize_point_list() {
      this.point_list = [];
      for (let i=0; i<this.elements.length; i++) {
        let coord = [];
        for (let j=0; j<2; j++) {
          coord.push(Math.pow(-1, j)*this.elements[i][this.attribute_names[j]]);
        }
        this.point_list.push(new Point2D(coord[0], coord[1], this.point_style, 'point', ''));
      } 
    }
  
    initialize_segments() {
      this.segments = [];
      for (let i=0; i<this.point_list.length - 1; i++) {
        let current_point = this.point_list[i];
        let next_point = this.point_list[i+1];
        let data = [current_point.cx, current_point.cy, next_point.cx, next_point.cy];
        this.segments.push(new LineSegment2D(data, this.edge_style, 'line', ''));
      }
    }
  
    public static deserialize(serialized) {
      var default_edge_style = {color_stroke:string_to_rgb('grey'), dashline:[], line_width:0.5, name:''};
      var default_point_style = {color_fill:string_to_rgb('lightviolet'), color_stroke:string_to_rgb('grey'),
                                 shape:'circle', size:2, name:'', type_:'tooltip'};
      var tooltip_text_style = {font_size: 10, font_style: 'sans-serif', text_align_x:'center', text_color:string_to_rgb('white')};
      var default_dict_ = {tooltip:{attributes: serialized['attribute_names'], text_style: tooltip_text_style}, edge_style:default_edge_style, point_style:default_point_style,
                            display_step:1};
      serialized = set_default_values(serialized, default_dict_)
      var tooltip = Tooltip.deserialize(serialized['tooltip']);
      var edge_style = EdgeStyle.deserialize(serialized['edge_style']);
      var point_style = PointStyle.deserialize(serialized['point_style']);
      return new Dataset(serialized['attribute_names'],
                         edge_style,
                         tooltip,
                         point_style,
                         serialized['elements'],
                         serialized['display_step'],
                         serialized['type_'],
                         serialized['name']);
    }
}


export class Graph2D {
    constructor(public graphs: Dataset[],
                public attribute_names:string[],
                public axis: Axis,
                public type_: string='graph2d',
                public name: string='') {}
  
    public static deserialize(serialized) {
      var default_dict_ = {axis:{}};
      serialized = set_default_values(serialized, default_dict_);
      var graphs:Dataset[] = [];
      for (let i=0; i<serialized['graphs'].length; i++) {
        serialized['graphs'][i]['attribute_names'] = serialized['attribute_names'];
        graphs.push(Dataset.deserialize(serialized['graphs'][i]));
      }
      var axis = Axis.deserialize(serialized['axis']);
  
      return new Graph2D(graphs,
                         serialized['attribute_names'],
                         axis,
                         serialized['type_'],
                         serialized['name']);
    }
}


export class Label {
    constructor(public title:string,
                public text_style: TextStyle,
                public rectangle_surface_style: SurfaceStyle,
                public rectangle_edge_style: EdgeStyle,
                public type_:string = 'label',
                public name:string = '') {}
    
  
    public static deserialize(serialized) {
      var text_style = TextStyle.deserialize(serialized['text_style']);
      var rectangle_surface_style = SurfaceStyle.deserialize(serialized['rectangle_surface_style']);
      var rectangle_edge_style = EdgeStyle.deserialize(serialized['rectangle_edge_style']);
      return new Label(serialized['title'],
                       text_style,
                       rectangle_surface_style, rectangle_edge_style,
                       serialized['type_'],
                       serialized['name']);
    }
  
    draw(context, decalage_x, decalage_y, rect_w) {
      var rect_h = this.text_style.font_size;
      Shape.rect(decalage_x, decalage_y, rect_w, rect_h, context, this.rectangle_surface_style.color_fill,
        this.rectangle_edge_style.color_stroke, this.rectangle_edge_style.line_width, this.rectangle_surface_style.opacity,
        this.rectangle_edge_style.dashline);
      context.font = this.text_style.font;
      context.textAlign = 'start';
      context.textBaseline = 'middle';
      context.fillStyle = this.text_style.text_color;
      context.fillText(this.title, decalage_x + rect_w + 5, decalage_y + 2*rect_h/3);
    }
}


export class Line2D {
    minX:number=0;
    maxX:number=0;
    minY:number=0;
    maxY:number=0;
  
    constructor(public data:number[],
                public edge_style:EdgeStyle,
                public type_:string='line2d',
                public name:string='') {
      this.minX = Math.min(this.data[0], this.data[2]);
      this.maxX = Math.max(this.data[0], this.data[2]);
      this.minY = Math.min(-this.data[1], -this.data[3]);
      this.maxY = Math.max(-this.data[1], -this.data[3]);
    }
  
    public static deserialize(serialized) {
      var default_edge_style = {color_stroke:string_to_rgb('black'), dashline:[], line_width:1, name:''};
      var default_dict_ = {edge_style:default_edge_style};
      serialized = set_default_values(serialized, default_dict_);
      var edge_style = EdgeStyle.deserialize(serialized['edge_style']);
      return new Line2D(serialized['data'],
                        edge_style,
                        serialized['type_'],
                        serialized['name']);
    }
  
    draw(context, mvx, mvy, scaleX, scaleY, X, Y, canvas_width, canvas_height) {
      context.lineWidth = this.edge_style.line_width;
      context.strokeStyle = this.edge_style.color_stroke;
      context.setLineDash(this.edge_style.dashline);
      var xi, yi, xf, yf;
      [xi, yi, xf, yf] = this.get_side_points(mvx, mvy, scaleX, scaleY, X, Y, canvas_width, canvas_height);
      context.moveTo(xi, yi);
      context.lineTo(xf, yf);
      context.stroke();
      context.setLineDash([]);
    }
  
    get_side_points(mvx, mvy, scaleX, scaleY, X, Y, canvas_width, canvas_height) {
      var x1 = scaleX*this.data[0] + mvx + X;
      var y1 = -scaleY*this.data[1] + mvy + Y;
      var x2 = scaleX*this.data[2] + mvx + X;
      var y2 = -scaleY*this.data[3] + mvy + Y;
  
      if (y1 === y2) {
        return [X, y1, canvas_width + X, y2];
      } else if (x1 === x2) {
        return [x1, Y, x2, canvas_height + Y];
      } 
      let canvas_angle = Math.atan(canvas_height/canvas_width);
      let angle = Math.abs(Math.atan((y2 - y1)/(x2 - x1)));
      let a = (y2 - y1)/(x2 - x1);
      if (angle <= canvas_angle) {
        let y_left = y1 + a*(X - x1);
        let y_right = a*(canvas_width + X - x1) + y1;
        return [0, y_left, canvas_width, y_right];
      }
      let x_top = x1 + (Y - y1)/a;
      let x_bottom = x1 + (canvas_height + Y - y1)/a;
      return [x_top, 0, x_bottom, canvas_height];
    }
  
}


export class LineSegment2D {
    minX:number=0;
    maxX:number=0;
    minY:number=0;
    maxY:number=0;
  
    constructor(public data:any,
                public edge_style:EdgeStyle,
                public type_:string='linesegment2d',
                public name:string) {
        this.minX = Math.min(this.data[0], this.data[2]);
        this.maxX = Math.max(this.data[0], this.data[2]);
        this.minY = Math.min(this.data[1], this.data[3]);
        this.maxY = Math.max(this.data[1], this.data[3]);
    }
  
    public static deserialize(serialized) {
      var default_edge_style = {color_stroke:string_to_rgb('grey'), dashline:[], line_width:0.5, name:''};
      var default_dict_ = {edge_style:default_edge_style};
      serialized = set_default_values(serialized, default_dict_);
      var edge_style = EdgeStyle.deserialize(serialized['edge_style']);
      var data = serialized['data'];
      [data[1], data[3]] = [-data[1], -data[3]];
      return new LineSegment2D(data,
                               edge_style,
                               serialized['type_'],
                               serialized['name']);
    }
  
    draw(context, first_elem, mvx, mvy, scaleX, scaleY, X, Y, log_scale_x=false, log_scale_y=false) {
      context.lineWidth = this.edge_style.line_width;
      context.strokeStyle = this.edge_style.color_stroke;
      context.setLineDash(this.edge_style.dashline);

      let x1 = this.data[0], y1 = this.data[1];
      let x2 = this.data[2], y2 = this.data[3];
      if (log_scale_x) {
        x1 = Math.log10(x1);
        x2 = Math.log10(x2);
      } 
      if (log_scale_y) {
        y1 = -Math.log10(-y1);
        y2 = -Math.log10(-y2);
      } 
      if (first_elem) {
        context.moveTo(scaleX*x1 + mvx + X, scaleY*y1 + mvy + Y);
      }
      context.lineTo(scaleX*x2 + mvx + X, scaleY*y2 + mvy + Y);
    }
}


export class MultipleLabels {
    constructor(public labels:Label[],
                public type_:string='multiplelabels',
                public name:string='') {}
        
    public static deserialize(serialized) {
      let labels = [];
      for (let serialized_label of serialized['labels']) {
        labels.push(Label.deserialize(serialized_label));
      }
      return new MultipleLabels(labels,
                                serialized['type_'],
                                serialized['name']);
    }
  
    draw(context, canvas_width, X, Y) {
      var rect_w = canvas_width*0.04;
      var decalage_x = 5 + X, decalage_y = 5 + Y;
      for (let label of this.labels) {
        label.draw(context, decalage_x, decalage_y, rect_w);
        decalage_y += label.text_style.font_size + 5;
      }
    }
}


export class Point2D {
    /**
     * minX, maxX, minY, maxY define the bouding box.
     * size is the real size of the point (depends on point_size which value is 1, 2, 3 or 4).
     */
    minX:number=0;
    maxX:number=0;
    minY:number=0;
    maxY:number=0;
    hidden_color:any;
    size:number;
    k:number=1;
    points_inside:Point2D[] = [this];
    point_families:PointFamily[]=[];
    selected:boolean=false;
  
    constructor(public cx:number,
                public cy:number,
                public point_style: PointStyle,
                public type_:string='point',
                public name:string='') {
        if (point_style.size<1) {
          throw new Error('Invalid point_size');
        }
        this.size = this.k*point_style.size/4;
        this.minX = this.cx;
        this.maxX = this.cx;
        this.minY = this.cy;
        this.maxY = this.cy;
  
        this.hidden_color = genColor();
      }
  
      public static deserialize(serialized) {
        var point_style = PointStyle.deserialize(serialized['point_style']);
        return new Point2D(serialized['cx'],
                           -serialized['cy'],
                           point_style,
                           serialized['type_'],
                           serialized['name']);
      }
  
      draw(context, mvx, mvy, scaleX, scaleY, X, Y, log_scale_x, log_scale_y) {
        let cx = this.cx;
        let cy = this.cy;
        if (log_scale_x) {
          cx = Math.log10(cx);
        }
        if (log_scale_y) {
          cy = -Math.log10(-cy);
        }
          if (this.point_style.shape == 'circle') {
            context.arc(scaleX*cx + mvx + X, scaleY*cy + mvy + Y, 10*this.size, 0, 2*Math.PI);
            context.stroke();
          } else if (this.point_style.shape == 'square') {
            context.rect(scaleX*cx + mvx - this.size + X, scaleY*cy + mvy - 10*this.size + Y, 10*this.size*2, 10* this.size*2);
            context.stroke();
          } else if (this.point_style.shape == 'crux') {
            context.rect(scaleX*cx + mvx + X, scaleY*cy + mvy + Y, 10*this.size, this.size);
            context.rect(scaleX*this.cx + mvx + X, scaleY*this.cy + mvy + Y, -10*this.size, this.size);
            context.rect(scaleX*this.cx + mvx + X, scaleY*this.cy + mvy + Y, this.size, 10*this.size);
            context.rect(scaleX*this.cx + mvx + X, scaleY*this.cy + mvy + Y, this.size, -10* this.size);
            context.fillStyle = context.strokeStyle;
            context.stroke();
          } else {
            throw new Error(this.point_style.shape + ' is not a valid point shape.');
          }
  
      }
  
      copy() {
        return new Point2D(this.cx, this.cy, this.point_style, this.type_, this.name);
      }
  
      equals(point:Point2D): boolean {
        return (this.cx == point.cx) && (this.cy == point.cy) && (this.point_style.shape == point.point_style.shape)
                && (this.size == point.size) && (this.point_style.color_fill == point.point_style.color_fill) && (this.point_style.color_stroke == point.point_style.color_stroke)
                && (this.point_style.stroke_width == point.point_style.stroke_width);
      }
  
      getPointIndex(point_list:Point2D[]) {
        for (let i=0; i<point_list.length; i++) {
          if (this.equals(point_list[i])) {
            return i;
          }
        }
        throw new Error('Point2D.getPointIndex() : not in list');
      }
  
      isPointInList(point_list:Point2D[]) {
        for (let i=0; i<point_list.length; i++) {
          if (this.equals(point_list[i])) {
            return true;
          }
        }
        return false;
      }
}


/** 
 * A class that allows you to draw multiple primitives in one canvas.
 * @param primitives A list of primitives, ie. Contour2D, Text, LineSegment2D, Arc2D, Circle2D or Line2D
 */
export class PrimitiveGroup {
    constructor(public primitives: any[],
                public type_: string,
                public name:string) {
                }
  
    public static deserialize(serialized) {
      var primitives:any[] = [];
      var temp = serialized['primitives'];
      let classes = {"contour": Contour2D, "text": Text, "linesegment2d": LineSegment2D,
                    "arc": Arc2D, "circle": Circle2D, "line2d": Line2D, 
                    "multiplelabels": MultipleLabels, "wire": Wire};
      for (let i=0; i<temp.length; i++) {
        primitives.push(classes[temp[i]["type_"]].deserialize(temp[i]));
      }
      return new PrimitiveGroup(primitives,
                              serialized['type_'],
                              serialized['name']);
    }
}


export class Scatter {

  point_list:Point2D[]=[];
  all_attributes:Attribute[]=[];
  lists:any[]=[];
  to_display_attributes:Attribute[]=[];

  constructor(public tooltip:Tooltip,
              public attribute_names:string[],
              public point_style:PointStyle,
              public elements: any[],
              public axis:Axis,
              public type_:string,
              public name:string) {
    this.initialize_all_attributes();
    this.initialize_to_display_attributes();
    this.initialize_lists();
    this.initialize_point_list(elements);
  }

  public static deserialize(serialized) {
    let default_point_style = {color_fill: string_to_rgb('lightviolet'), color_stroke: string_to_rgb('lightgrey')};
    let default_tooltip = {attributes: serialized['attribute_names']};
    var default_dict_ = {point_style:default_point_style, tooltip: default_tooltip};
    serialized = set_default_values(serialized, default_dict_);
    var axis = Axis.deserialize(serialized['axis']);
    var tooltip = Tooltip.deserialize(serialized['tooltip']);
    var point_style = PointStyle.deserialize(serialized['point_style']);
    return new Scatter(tooltip,
                       serialized['attribute_names'],
                       point_style,
                       serialized['elements'],
                       axis,
                       serialized['type_'],
                       serialized['name']);
  }

  initialize_all_attributes() {
    var attribute_names = Object.getOwnPropertyNames(this.elements[0]);
    var exceptions = ['package_version', 'object_class'];
    for (let i=0; i<attribute_names.length; i++) {
      let name = attribute_names[i];
      if (!List.is_include(name, exceptions)) {
        let type_ = TypeOf(this.elements[0][name]);
        this.all_attributes.push(new Attribute(name, type_)); 
      }
    }
  }

  initialize_to_display_attributes() {
    for (let i=0; i<this.attribute_names.length; i++) {
      var name = this.attribute_names[i];
      for (let j=0; j<this.all_attributes.length; j++) {
        if (name == this.all_attributes[j]['name']) {
          this.to_display_attributes.push(this.all_attributes[j]);
          break;
        }
      }
    }
  }

  initialize_lists() {
    this.lists = [];
    for (let i=0; i<this.to_display_attributes.length; i++) {
      var value = [];
      var name = this.to_display_attributes[i].name;
      let type_ = this.to_display_attributes[i].type_;
      if (type_ == 'float') {
        let min = this.elements[0][name];
        let max = this.elements[0][name];
        for (let j=0; j<this.elements.length; j++) {
          let elt = this.elements[j][name];
          if (elt>max) {
            max = elt;
          }
          if (elt<min) {
            min = elt;
          }
        }
        this.lists.push([min, max]);
      } else if (type_ == 'color') {
        for (let j=0; j<this.elements.length; j++) {
          let elt_color = rgb_to_string(this.elements[j][name]);
          if (!List.is_include(elt_color, value)) {
            value.push(elt_color);
          }
        }
        this.lists.push(value);
      } else {
        for (let j=0; j<this.elements.length; j++) {
          let elt = this.elements[j][name].toString();
          if (!List.is_include(elt, value)) {
            value.push(elt);
          }
        }
        this.lists.push(value);
      }
    }
  }

  initialize_point_list(elements) {
    this.point_list = [];
    for (let i=0; i<this.elements.length; i++) {
      var elt0 = elements[i][this.to_display_attributes[0]['name']];
      var elt1 = elements[i][this.to_display_attributes[1]['name']];
      if (this.to_display_attributes[0]['type_'] == 'float') {
        var cx = elt0;
      } else if (this.to_display_attributes[0]['type_'] == 'color') {
        cx = List.get_index_of_element(rgb_to_string(elt0), this.lists[0]);
      } else {
        cx = List.get_index_of_element(elt0.toString(), this.lists[0]);
      }
      if (this.to_display_attributes[1]['type_'] == 'float') {
        var cy = -elt1;
      } else if (this.to_display_attributes[1]['type_'] == 'color') {
        cy = - List.get_index_of_element(rgb_to_string(elt1), this.lists[1]);
      } else {
        cy = - List.get_index_of_element(elt1.toString(), this.lists[1]);
      }
      this.point_list.push(new Point2D(cx, cy, MyObject.copy(this.point_style)));
    }
  }

}


export class Text {
  minX:number=Infinity;
  maxX:number=-Infinity;
  minY:number=Infinity;
  maxY:number=-Infinity;
  hidden_color:any;
  init_scale:number=0;

  constructor(public comment:string,
              public position_x:number,
              public position_y:number,
              public text_style:TextStyle,
              public text_scaling:boolean=true,
              public max_width,
              public type_:string='text',
              public name:string='') {
                this.minX = position_x;
                this.maxX = position_x;
                this.minY = position_y;
                this.maxY = position_y;
  }

  public static deserialize(serialized) {
    var default_text_style = {font_size:12, font_style:'sans-serif', text_color:string_to_rgb('black'),
                              text_align_x:'start', text_align_y:'alphabetic', angle:0, name:''};
    var default_dict_ = {text_style:default_text_style};
    serialized = set_default_values(serialized, default_dict_);
    var text_style = TextStyle.deserialize(serialized['text_style']);
    return new Text(serialized['comment'],
                    serialized['position_x'],
                    -serialized['position_y'],
                    text_style,
                    serialized['text_scaling'],
                    serialized['max_width'],
                    serialized['type_'],
                    serialized['name']);
  }

  draw(context, mvx, mvy, scaleX, scaleY, X, Y) {
    if (this.text_scaling) var font_size = this.text_style.font_size * scaleX/this.init_scale;
    else font_size = this.text_style.font_size;

    context.font = this.text_style.font;
    context.fillStyle = this.text_style.text_color;
    context.textAlign = this.text_style.text_align_x,
    context.textBaseline = this.text_style.text_align_y;
    let angle = this.text_style.angle;
    if (angle === 0) {
      this.write(context, scaleX*this.position_x + mvx + X, scaleY*this.position_y + mvy + Y, scaleX, font_size);
    } else {
      context.translate(scaleX*this.position_x + mvx + X, scaleY*this.position_y + mvy + Y);
      context.rotate(Math.PI/180 * angle);
      this.write(context, 0, 0, scaleX, font_size);
      context.rotate(-Math.PI/180 * angle);
      context.translate(-scaleX*this.position_x - mvx - X, -scaleY*this.position_y - mvy - Y);
    }
  }

  write(context, x, y, scaleX, font_size) {
    if (this.max_width) {
      var cut_texts = this.cutting_text(context, scaleX*this.max_width);
      for (let i=0; i<cut_texts.length; i++) {
        context.fillText(cut_texts[i], x, y + i * font_size);
      }
    } else {
      context.fillText(this.comment, x, y);
    }
  }

  cutting_text(context, display_max_width) {
    var words = this.comment.split(' ');
    var space_length = context.measureText(' ').width;
    var cut_texts = [];
    var i=0;
    var line_length = 0;
    var line_text = '';
    while (i<words.length) {
      let word = words[i];
      let word_length = context.measureText(word).width;
      if (word_length >= display_max_width) {
        if (line_text !== '') cut_texts.push(line_text);
        line_length = 0;
        line_text = '';
        cut_texts.push(word);
        i++;
      } else {
        if (line_length + word_length <= display_max_width) {
          if (line_length !== 0) {
            line_length = line_length + space_length;
            line_text = line_text + ' ';
          }
          line_text = line_text + word;
          line_length = line_length + word_length;
          i++;
        } else {
          cut_texts.push(line_text);
          line_length = 0;
          line_text = '';
        }
      }
    }
    if (line_text !== '') cut_texts.push(line_text);
    return cut_texts;
  }

}


export class Wire {
  hidden_color: string;
  minX: number = Infinity;
  maxX: number = -Infinity;
  minY: number = Infinity;
  maxY: number = -Infinity;
  constructor(public lines: number[][],
              public edge_style: EdgeStyle,
              public tooltip?: Tooltip,
              public type_: string = "wire",
              public name: string = "" ) {
                this.hidden_color = genColor();
              }
      
  
  public static deserialize(serialized) {
    let lines = serialized["lines"].map(l => [l[0], -l[1]]);
    let default_edge_style = {line_width: 1, color_stroke: string_to_rgb("grey"), dashline: []};
    let default_dict_ = {edge_style: default_edge_style};
    serialized = set_default_values(serialized, default_dict_);
    let edge_style = EdgeStyle.deserialize(serialized["edge_style"]);

    if (serialized["text"]) {
      let surface_style = new SurfaceStyle(string_to_hex("lightgrey"), 0.5, undefined);
      let text_style = new TextStyle(string_to_hex("black"), 14, "Calibri");
      let tooltip = new Tooltip(surface_style, text_style, undefined, serialized["text"]);
      return new Wire(lines, edge_style, tooltip, "wire", serialized["name"]);
    }
    return new Wire(lines, edge_style, undefined, "wire", serialized["name"]);
  }
            

  draw(context, scaleX, scaleY, mvx, mvy, X, Y) {
    context.moveTo(scaleX*this.lines[0][0] + mvx + X, scaleY*this.lines[0][1] + mvy + Y);
    for (let line of this.lines) {
      context.lineTo(scaleX*line[0] + mvx + X, scaleY*line[1] + mvy + Y);
    }
    context.stroke();
  }
}