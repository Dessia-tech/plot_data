import {MyMath, Shape, drawLines, getCurvePoints, genColor} from "./Useful"

export class PlotDataContour2D {
    minX:number=0;
    maxX:number=0;
    minY:number=0;
    maxY:number=0;
    mouse_selection_color:any;
  
    constructor(public plot_data_primitives:any,
                public plot_data_states:any,
                public type:string,
                public name:string) {
        for (var i = 0; i < this.plot_data_primitives.length; i++) {
          var d = plot_data_primitives[i]
          this.minX = Math.min(this.minX, d.minX);
          this.maxX = Math.max(this.maxX, d.maxX);
          this.minY = Math.min(this.minY, d.minY);
          this.maxY = Math.max(this.maxY, d.maxY);
        }
        this.mouse_selection_color = genColor();
  
    }
  
    public static deserialize(serialized) {
        var temp = serialized['plot_data_states'];
        var plot_data_states = [];
        for (var i = 0; i < temp.length; i++) {
          var d = temp[i];
          plot_data_states.push(PlotDataState.deserialize(d));
        }
        var temp = serialized['plot_data_primitives'];
        var plot_data_primitives = [];
        for (var i = 0; i < temp.length; i++) {
          var d = temp[i];
          if (d['type'] == 'line') {
            plot_data_primitives.push(PlotDataLine2D.deserialize(d));
          }
          if (d['type'] == 'circle') {
            plot_data_primitives.push(PlotDataCircle2D.deserialize(d));
          }
          if (d['type'] == 'arc') {
            plot_data_primitives.push(PlotDataArc2D.deserialize(d));
          }
  
        }
        return new PlotDataContour2D(plot_data_primitives,
                                     plot_data_states,
                                     serialized['type'],
                                     serialized['name']);
    }
  }
  
  export class PlotDataLine2D {
    minX:number=0;
    maxX:number=0;
    minY:number=0;
    maxY:number=0;
  
    constructor(public data:any,
                public plot_data_states:any,
                public type:string,
                public name:string) {
        this.minX = Math.min(this.data[0], this.data[2]);
        this.maxX = Math.max(this.data[0], this.data[2]);
        this.minY = Math.min(this.data[1], this.data[3]);
        this.maxY = Math.max(this.data[1], this.data[3]);
    }
  
    public static deserialize(serialized) {
        var temp = serialized['plot_data_states'];
        var plot_data_states = [];
        for (var i = 0; i < temp.length; i++) {
          var d = temp[i];
          plot_data_states.push(PlotDataState.deserialize(d));
        }
        return new PlotDataLine2D(serialized['data'],
                                 plot_data_states,
                                 serialized['type'],
                                 serialized['name']);
    }
  
    draw(context, first_elem, mvx, mvy, scaleX, scaleY) {
      if (first_elem) {
        context.moveTo(scaleX*(1000*this.data[0]+ mvx), scaleY*(1000*this.data[1]+ mvy));
      }
      context.lineTo(scaleX*(1000*this.data[2]+ mvx), scaleY*(1000*this.data[3]+ mvy));
    }
  }
  
  export class PlotDataCircle2D {
    minX:number=0;
    maxX:number=0;
    minY:number=0;
    maxY:number=0;
  
    constructor(public data:any,
                public cx:number,
                public cy:number,
                public r:number,
                public plot_data_states:PlotDataState[],
                public type:string,
                public name:string) {
        this.minX = this.cx - this.r;
        this.maxX = this.cx + this.r;
        this.minY = this.cy - this.r;
        this.maxY = this.cy + this.r;
                }
  
    public static deserialize(serialized) {
        var temp = serialized['plot_data_states']
        var plot_data_states = []
        for (var i = 0; i < temp.length; i++) {
          var d = temp[i]
          plot_data_states.push(PlotDataState.deserialize(d))
        }
        return new PlotDataCircle2D(serialized['data'],
                                    serialized['cx'],
                                    serialized['cy'],
                                    serialized['r'],
                                    plot_data_states,
                                    serialized['type'],
                                    serialized['name']);
    }
  
    draw(context, first_elem, mvx, mvy, scaleX, scaleY) {
      context.arc(scaleX*(1000*this.cx+ mvx), scaleY*(1000*this.cy+ mvy), scaleX*1000*this.r, 0, 2*Math.PI);
    }
  
  }
  
  export class PlotDataPoint2D {
    minX:number=0;
    maxX:number=0;
    minY:number=0;
    maxY:number=0;
    mouse_selection_color:any;
    size:number;
    k:number=1;
  
    constructor(public data:any,
                public cx:number,
                public cy:number,
                public plot_data_states:PlotDataState[],
                public type:string,
                public name:string) {
      
      var plot = plot_data_states[0];
      var point_size = plot.point_size.size;
      if (point_size<1) {
        throw new Error('Invalid point_size');
      }
      this.size = this.k*point_size/400;
      this.minX = this.cx - 2.5*this.size;
      this.maxX = this.cx + 2.5*this.size;
      this.minY = this.cy - 5*this.size;
      this.maxY = this.cy + 5*this.size;
      
      this.mouse_selection_color = genColor();
      }
  
      public static deserialize(serialized) {
        var temp = serialized['plot_data_states'];
        var plot_data_states = [];
        for (var i = 0; i < temp.length; i++) {
          var d = temp[i];
          plot_data_states.push(PlotDataState.deserialize(d));
        }
        return new PlotDataPoint2D(serialized['data'],
                                    serialized['cx'],
                                    serialized['cy'],
                                    plot_data_states,
                                    serialized['type'],
                                    serialized['name']);
      }
  
      draw(context, context_hidden, mvx, mvy, scaleX, scaleY) {
        var show_states = 0;
          var shape = this.plot_data_states[show_states].shape_set.shape;
          if (shape == 'circle') {
            context.arc(scaleX*(1000*this.cx+ mvx), scaleY*(1000*this.cy+ mvy), 1000*this.size, 0, 2*Math.PI);
            context.stroke();
          } else if (shape == 'square') {
            context.rect(scaleX*(1000*this.cx + mvx) - 1000*this.size,scaleY*(1000*this.cy + mvy) - 1000*this.size,1000*this.size*2, 1000*this.size*2);
            context.stroke();
          } else if (shape == 'crux') {
            context.rect(scaleX*(1000*this.cx + mvx), scaleY*(1000*this.cy + mvy),1000*this.size, 100*this.size);
            context.rect(scaleX*(1000*this.cx + mvx), scaleY*(1000*this.cy + mvy),-1000*this.size, 100*this.size);
            context.rect(scaleX*(1000*this.cx + mvx), scaleY*(1000*this.cy + mvy),100*this.size, 1000*this.size);
            context.rect(scaleX*(1000*this.cx + mvx), scaleY*(1000*this.cy + mvy),100*this.size, -1000*this.size);
            context.fillStyle = context.strokeStyle;
            context.stroke();
  
            context_hidden.beginPath()
            context_hidden.arc(scaleX*(1000*this.cx+ mvx), scaleY*(1000*this.cy+ mvy), 1000*this.size, 0, 2*Math.PI);
            context_hidden.stroke();
            context_hidden.closePath();
          } else {
            throw new Error('Invalid shape for point');
          }
          
      }
  
      copy() {
        return new PlotDataPoint2D(this.data, this.cx, this.cy, this.plot_data_states, this.type, this.name);
      }
  }
  
  export class PlotDataAxis {
    colorStroke:any;
    x_step:number;
    y_step:number;
    constructor(public nb_points_x:number,
                       public nb_points_y:number,
                       public font_size:number,
                       public graduation_color:string,
                       public axis_color:string,
                       public name:string, 
                       public arrow_on:boolean,
                       public axis_width:string,
                       public grid_on:boolean,
                       public type:string, 
                       public plot_data_states:PlotDataState[]) {
  
      for (var i=0; i<this.plot_data_states.length; i++) {
        var plot = this.plot_data_states[i];
        this.colorStroke = plot.color_line;
      }
    }
  
    public static deserialize(serialized) {
      var temp = serialized['plot_data_states'];
      var plot_data_states = [];
      for (var i = 0; i < temp.length; i++) {
        var d = temp[i];
        plot_data_states.push(PlotDataState.deserialize(d));
      }
      return new PlotDataAxis(serialized['nb_points_x'],
                                    serialized['nb_points_y'],
                                    serialized['font_size'],
                                    serialized['graduation_color'],
                                    serialized['axis_color'],
                                    serialized['name'],
                                    serialized['arrow_on'],
                                    serialized['axis_width'],
                                    serialized['grid_on'], 
                                    serialized['type'],
                                    plot_data_states);
    }
  
    draw_graduations(context, mvx, mvy, scaleX, scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, minX, maxX, minY, maxY, x_step, y_step, font_size) {
      //pour l'axe des x
      var i=0;
      context.textAlign = 'center';
      var x_nb_digits = Math.max(0, 1-Math.floor(MyMath.log10(x_step)));
      var delta_x = maxX - minX;
      var grad_beg_x = minX - 10*delta_x;
      var grad_end_x = maxX + 10*delta_x;
      while(grad_beg_x + i*x_step < grad_end_x) {
        if ((scaleX*(1000*(grad_beg_x + i*x_step) + mvx) >axis_x_start) && (scaleX*(1000*(grad_beg_x + i*x_step) + mvx)<axis_x_end)) {
          
          if (this.grid_on === true) {
            context.strokeStyle = 'lightgrey';
            Shape.drawLine(context, [scaleX*(1000*(grad_beg_x + i*x_step) + mvx), axis_y_start], [scaleX*(1000*(grad_beg_x + i*x_step) + mvx), axis_y_end + 3]);
          } else {
            Shape.drawLine(context, [scaleX*(1000*(grad_beg_x + i*x_step) + mvx), axis_y_end - 3], [scaleX*(1000*(grad_beg_x + i*x_step) + mvx), axis_y_end + 3]);
          }
          context.fillText(MyMath.round(grad_beg_x + i*x_step, x_nb_digits), scaleX*(1000*(grad_beg_x + i*x_step) + mvx), axis_y_end + font_size );
        } 
        i++
      }
      
        //pour l'axe des y
      i=0
      var real_minY = -maxY;
      var real_maxY = -minY;
      var delta_y = maxY - minY;
      var grad_beg_y = real_minY - 10*delta_y;
      var grad_end_y = real_maxY + 10*delta_y;
      context.textAlign = 'end';
      context.textBaseline = 'middle';
      var y_nb_digits = Math.max(0, 1-Math.floor(MyMath.log10(y_step)));
      while (grad_beg_y + (i-1)*y_step < grad_end_y) {
        if ((scaleY*(-1000*(grad_beg_y + i*y_step) + mvy) > axis_y_start) && (scaleY*(-1000*(grad_beg_y + i*y_step) + mvy) < axis_y_end)) {
          if (this.grid_on === true) {
            context.strokeStyle = 'lightgrey';
            Shape.drawLine(context,[axis_x_start - 3, scaleY*(-1000*(grad_beg_y + i*y_step) + mvy)], [axis_x_end, scaleY*(-1000*(grad_beg_y + i*y_step) + mvy)]);
          } else {
            Shape.drawLine(context, [axis_x_start - 3, scaleY*(-1000*(grad_beg_y + i*y_step) + mvy)], [axis_x_start + 3, scaleY*(-1000*(grad_beg_y + i*y_step) + mvy)]);
          }   
          context.fillText(MyMath.round(grad_beg_y + i*y_step, y_nb_digits), axis_x_start - 5, scaleY*(-1000*(grad_beg_y + i*y_step) + mvy));
        }
        i++;
      }
  
      context.stroke();
    }
  
    draw(context, mvx, mvy, scaleX, scaleY, width, height, init_scaleX, init_scaleY, minX, maxX, minY, maxY, scroll_x, scroll_y, decalage_axis_x, decalage_axis_y) {
      // Dessin du repère
      context.beginPath();
      context.strokeStyle = this.axis_color;
      context.lineWidth = this.axis_width;
      var axis_x_start = decalage_axis_x;
      var axis_x_end = width;
      var axis_y_start = 0;
      var axis_y_end = height - decalage_axis_y;
      //Flèches
      if (this.arrow_on === true) {
        Shape.drawLine(context, [axis_x_start - 10, axis_y_start + 20], [axis_x_start, axis_y_start]);
        Shape.drawLine(context, [axis_x_start, axis_y_start], [axis_x_start + 10, axis_y_start + 20]);
        
        Shape.drawLine(context, [axis_x_end - 20, axis_y_end - 10], [axis_x_end, axis_y_end]);
        Shape.drawLine(context, [axis_x_end, axis_y_end], [axis_x_end - 20, axis_y_end + 10]);
      }
      
      //Axes
      Shape.drawLine(context, [axis_x_start, axis_y_start], [axis_x_start, axis_y_end]);
      Shape.drawLine(context, [axis_x_start, axis_y_end], [axis_x_end, axis_y_end]);
  
      context.stroke();
  
      //Graduations
      if (scroll_x % 5 == 0) {
        var kx = 1.1*scaleX/init_scaleX;
        this.x_step = (maxX - minX)/(kx*(this.nb_points_x-1));
      } 
      if (scroll_y % 5 == 0) {
        var ky = 1.1*scaleY/init_scaleY;
        this.y_step = (maxY - minY)/(ky*(this.nb_points_y-1));
      }
      
      context.font = this.font_size.toString() + 'px Arial';
      context.fillStyle = this.graduation_color;
      context.strokeStyle = this.axis_color;
      
      this.draw_graduations(context, mvx, mvy, scaleX, scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, minX, maxX, minY, maxY, this.x_step, this.y_step, this.font_size);
      context.closePath();
      
    }
  }
  
  export class PlotDataTooltip {
    constructor(public colorfill:string, public text_color: string, public font:string, public tp_radius:any, public to_plot_list:any, public plot_data_states:PlotDataState[],public type:string, public name:string) {}
  
    public static deserialize(serialized) {
      var temp = serialized['plot_data_states']
        var plot_data_states = [];
        for (var i = 0; i < temp.length; i++) {
          var d = temp[i];
          plot_data_states.push(PlotDataState.deserialize(d));
        }
        return new PlotDataTooltip(serialized['colorfill'],
                                    serialized['text_color'],
                                    serialized['font'],
                                    serialized['tp_radius'],
                                    serialized['to_plot_list'],
                                    plot_data_states,
                                    serialized['type'],
                                    serialized['name']);
    }
  
    draw(context, object, mvx, mvy, scaleX, scaleY, canvas_width, canvas_height) {
      context.beginPath();
      var textfills = [];
      var text_max_length = 0;
      for (var i=0; i<this.to_plot_list.length; i++) {
        if (this.to_plot_list[i] == 'cx') {
          var text = 'x : ' + MyMath.round(object.cx,4).toString();
          var text_w = context.measureText(text).width;
        } else if (this.to_plot_list[i] == 'cy') {
          var text = 'y : ' + MyMath.round(-object.cy, 4).toString();
          var text_w = context.measureText(text).width;
        } else if (this.to_plot_list[i] == 'shape') {
          var text = 'shape : ' + object.plot_data_states[0]['shape_set']['shape'];
          var text_w = context.measureText(text).width;
        }
        textfills.push(text);
        if (text_w>text_max_length) {
          text_max_length = text_w;
        }
      }
  
      var font_size = Number(this.font.split('px')[0]);
      var tp_height = (textfills.length + 0.25)*font_size ;
      var cx = object.cx;
      var cy = object.cy;
      var point_size = object.plot_data_states[0].point_size.size;
      var decalage = 2.5*point_size + 5
      var tp_x = scaleX*(1000*cx + mvx) + decalage;
      var tp_y = scaleY*(1000*cy + mvy) - 1/2*tp_height;
      var tp_width = text_max_length + 25;
  
      if (tp_x + tp_width  > canvas_width) {
        tp_x = scaleX*(1000*cx + mvx) - decalage - tp_width;
      }
      if (tp_y < 0) {
        tp_y = scaleY*(1000*cy + mvy);
      }
      if (tp_y + tp_height > canvas_height) {
        tp_y = scaleY*(1000*cy + mvy) - tp_height;
      }
      console.log(tp_x, tp_y, tp_width, tp_height)
  
      Shape.roundRect(tp_x, tp_y, tp_width, tp_height, this.tp_radius, context);
      context.strokeStyle = 'black';
      context.globalAlpha = 0.75;
      context.fillStyle = this.colorfill;
      context.stroke();
      context.fill();
      context.fillStyle = this.text_color;
      context.textAlign = 'start';
      context.textBaseline = 'Alphabetic';
  
      var x_start = tp_x + 1/10*tp_width;
      context.font = this.font;
  
      var current_y = tp_y + 0.75*font_size;
      for (var i=0; i<textfills.length; i++) {
        context.fillText(textfills[i], x_start, current_y);
        current_y = current_y + font_size;
      }
      context.closePath();
      context.globalAlpha = 1;
    }
  
    manage_tooltip(context, mvx, mvy, scaleX, scaleY, init_scale, canvas_width, canvas_height, tooltip_list) {
      for (var i=0; i<tooltip_list.length; i++) {
        if (!(typeof tooltip_list[i] === "undefined")) {
          this.draw(context, tooltip_list[i], mvx, mvy, scaleX, scaleY, canvas_width, canvas_height);
        }
      }
    }
  }
  
  export class PlotDataGraph2D {
    id:number=0;
    constructor(public point_list:PlotDataPoint2D[],
                public dashline: number[],
                public graph_colorstroke: string,
                public graph_linewidth: number,
                public segments:PlotDataLine2D[],
                public display_step:number,
                public plot_data_states: PlotDataState[],
                public type: string,
                public name:string) {}
    
    public static deserialize(serialized) {
      var temp = serialized['plot_data_states'];
      var plot_data_states = [];
      for (var i = 0; i < temp.length; i++) {
        var d = temp[i];
        plot_data_states.push(PlotDataState.deserialize(d));
      }
      var point_list = [];
      temp = serialized['serialized_point_list'];
      for (var i=0; i<temp.length; i++) {
        var d = temp[i];
        point_list.push(PlotDataPoint2D.deserialize(d));
      }
  
      var segments = [];
      temp = serialized['serialized_segments'];
      for (i=0; i<temp.length; i++) {
        var d = temp[i];
        segments.push(PlotDataLine2D.deserialize(d));
      }
      return new PlotDataGraph2D(point_list,
                             serialized['dashline'],
                             serialized['graph_colorstroke'],
                             serialized['graph_linewidth'],
                             segments,
                             serialized['display_step'],
                             plot_data_states,
                             serialized['type'],
                             serialized['name']);
    }
  }
  
  export class PlotDataScatter {
    constructor(public point_list:PlotDataPoint2D[],
                public plot_data_states:PlotDataState[],
                public type:string,
                public name:string) {}
    
    public static deserialize(serialized) {
      var temp = serialized['plot_data_states'];
      var plot_data_states = [];
      for (var i = 0; i < temp.length; i++) {
        var d = temp[i];
        plot_data_states.push(PlotDataState.deserialize(d));
      }
      var point_list = [];
      temp = serialized['serialized_point_list'];
      for (var i=0; i<temp.length; i++) {
        var d = temp[i];
        point_list.push(PlotDataPoint2D.deserialize(d));
      }
      return new PlotDataScatter(point_list,
                                 plot_data_states,
                                 serialized['type'],
                                 serialized['name']);
    }
  }
  
  export class PlotDataArc2D {
    minX:number=0;
    maxX:number=0;
    minY:number=0;
    maxY:number=0;
  
    constructor(public cx:number,
                public cy:number,
                public r:number,
                public data:any,
                public angle1:number,
                public angle2:number,
                public plot_data_states:PlotDataState[],
                public type:string,
                public name:string) {
        if((this.cx - this.r) < this.minX){
          this.minX = this.cx - this.r;
        }
        if((this.cx - this.r) > this.maxX){
          this.maxX = this.cx + this.r;
        }
        if((this.cy - this.r) < this.minY){
          this.minY = this.cy - this.r;
        }
        if((this.cy + this.r) > this.maxY){
          this.maxY = this.cy + this.r;
        }
    }
  
    public static deserialize(serialized) {
        var temp = serialized['plot_data_states']
        var plot_data_states = [];
        for (var i = 0; i < temp.length; i++) {
          var d = temp[i];
          plot_data_states.push(PlotDataState.deserialize(d));
        }
        return new PlotDataArc2D(serialized['cx'],
                                    serialized['cy'],
                                    serialized['r'],
                                    serialized['data'],
                                    serialized['angle1'],
                                    serialized['angle2'],
                                    plot_data_states,
                                    serialized['type'],
                                    serialized['name']);
    }
  
    draw(context, first_elem, mvx, mvy, scaleX, scaleY) {
      var ptsa = [];
      for (var l = 0; l < this.data.length; l++) {
        ptsa.push(scaleX*(1000*this.data[l]['x']+ mvx));
        ptsa.push(scaleY*(1000*this.data[l]['y']+ mvy));
      }
      var tension = 0.4;
      var isClosed = false;
      var numOfSegments = 16;
      drawLines(context, getCurvePoints(ptsa, tension, isClosed, numOfSegments));
    }
  }
  
  export class PlotDataState {
  
    constructor(public color_surface:ColorSurfaceSet,
                public color_map:any,
                public hatching:HatchingSet,
                public opacity:number,
                public dash:any,
                public marker:any,
                public color_line:any,
                public shape_set:PointShapeSet,
                public point_size:PointSizeSet,
                public point_color:PointColorSet,
                public window_size:WindowSizeSet,
                public stroke_width:any,
                public name:any,) {}
  
    public static deserialize(serialized) {
        var color_surface = null
        if (serialized['color_surface'] != null) {
          color_surface = ColorSurfaceSet.deserialize(serialized['color_surface']);
        }
        var hatching = null;
        if (serialized['hatching'] != null) {
          hatching = HatchingSet.deserialize(serialized['hatching']);
        }
        var shape_set = null;
        if (serialized['shape_set'] != null) {
          shape_set = PointShapeSet.deserialize(serialized['shape_set']);
        }
        var window_size = null;
        if(serialized['window_size'] != null) {
          window_size = WindowSizeSet.deserialize(serialized['window_size']);
        }
        var point_size = null;
        if (serialized['point_size'] != null) {
          point_size = PointSizeSet.deserialize(serialized['point_size']);
        }
        var point_color = null;
        if (serialized['point_color'] != null) {
          point_color = PointColorSet.deserialize(serialized['point_color']);
        }
        return new PlotDataState(color_surface,
                                 serialized['color_map'],
                                 hatching,
                                 serialized['opacity'],
                                 serialized['dash'],
                                 serialized['marker'],
                                 serialized['color_line'],
                                 shape_set,
                                 point_size,
                                 point_color,
                                 window_size,
                                 serialized['stroke_width'],
                                 serialized['name']);
    }
    copy() {
      return new PlotDataState(this.color_surface, this.color_map, this.hatching, this.opacity, this.dash, this.marker, this.color_line, this.shape_set, this.point_size, this.point_color, this.window_size, this.stroke_width, this.name);
    }
  }
  
  export class ColorSurfaceSet {
  
    constructor(public name:string,
                public color:any) {}
  
    public static deserialize(serialized) {
        return new ColorSurfaceSet(serialized['name'],
                                 serialized['color']);
    }
  }
  
  export class PointShapeSet {
    constructor(public name:string, public shape:any){}
  
    public static deserialize(serialized) {
      return new PointShapeSet(serialized['name'],
                               serialized['shape']);
    }
  }
  
  export class PointSizeSet {
    constructor(public name:string, public size:number) {}
  
    public static deserialize(serialized) {
      return new PointSizeSet(serialized['name'],
                              serialized['size'])
    }
  }
  
  export class PointColorSet {
    constructor(public name:string, public color_fill:string, public color_stroke:string) {}
  
    public static deserialize(serialized) {
      return new PointColorSet(serialized['name'],
                               serialized['color_fill'],
                               serialized['color_stroke'])
    }
  }
  
  export class WindowSizeSet {
    constructor(public name:string, public height:number,public width:number){
    }
  
    public static deserialize(serialized) {
      return new WindowSizeSet(serialized['name'],
                               serialized['height'],
                               serialized['width']);
    }
  }
  
  export class HatchingSet {
    canvas_hatching:any;
  
    constructor(public name:string,
                public stroke_width:number,
                public hatch_spacing:number) {
        this.canvas_hatching = this.generate_canvas()
    }
  
    public static deserialize(serialized) {
        return new HatchingSet(serialized['name'],
                               serialized['stroke_width'],
                               serialized['hatch_spacing']);
    }
  
    generate_canvas() {
      var nb_hatch = 20;
      var max_size = nb_hatch*this.hatch_spacing;
  
      var p_hatch = document.createElement("canvas");
      p_hatch.width = max_size;
      p_hatch.height = max_size;
      var pctx = p_hatch.getContext("2d");
      pctx.lineCap = 'square';
      pctx.strokeStyle = 'black';
      pctx.lineWidth = this.stroke_width;
      pctx.beginPath();
      var pos_x = - Math.pow(Math.pow(max_size,2)/2, 0.5);
      var pos_y = Math.pow(Math.pow(max_size,2)/2, 0.5);
      for (var i = 0; i <= 2*nb_hatch; i++) {
        pos_x = pos_x + this.hatch_spacing;
        pos_y = pos_y - this.hatch_spacing;
        pctx.moveTo(pos_x, pos_y);
        pctx.lineTo(pos_x + max_size, pos_y + max_size);
      }
      pctx.stroke();
      return p_hatch;
    }
  }