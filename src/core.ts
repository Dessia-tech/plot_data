import {PlotDataContour2D, PlotDataLine2D, PlotDataCircle2D, PlotDataPoint2D, PlotDataAxis, PlotDataTooltip, PlotDataGraph2D, 
  PlotDataScatter, PlotDataArc2D, PlotDataState, ColorSurfaceSet, PointShapeSet, PointSizeSet, PointColorSet, WindowSizeSet, HatchingSet} from './PlotObjects'

import {MyMath, Shape, drawLines, getCurvePoints, genColor} from "./Useful"

export class PlotData {
  context_show:any;
  context_hidden:any;
  minX:number;
  maxX:number;
  minY:number;
  maxY:number;
  init_scale:number;
  init_scaleX:number;
  init_scaleY:number;
  scale:number;
  scaleX:number;
  scaleY:number;
  scroll_x:number=0;
  scroll_y:number=0;
  last_mouse1X:number;
  last_mouse1Y:number;
  colour_to_plot_data:any={};
  select_on_mouse:any;
  select_on_click:any[]=[];
  color_surface_on_mouse:string='lightskyblue';
  color_surface_on_click:string='blue';
  context:any;
  tooltip_ON:boolean = false;
  axis_ON:boolean = false;
  link_object_ON:boolean = false;
  index_first_in:number;
  index_last_in:number;
  nb_points_in:number;
  graph_ON:boolean=false;

  plot_datas:any;
  tooltip_list:any[]=[];
  zoom_rect_x:number;
  zoom_rect_y:number;
  zoom_rect_w:number;
  zoom_rect_h:number;
  zw_bool:boolean;
  zw_x:number;
  zw_y:number;
  zw_w:number;
  zw_h:number;
  reset_rect_x:number;
  reset_rect_y:number;
  reset_rect_w:number;
  reset_rect_h:number;
  select_bool:boolean;
  select_x:number;
  select_y:number;
  select_w:number;
  select_h:number;
  sort_list_points:any[]=[];
  graph_to_display:boolean[]=[];
  graph1_button_x:number=0;
  graph1_button_y:number=0;
  graph1_button_w:number=0;
  graph1_button_h:number=0;
  nb_graph:number = 0;
  graph_colorlist:string[]=[];
  graph_name_list:string[]=[];
  graph_text_spacing_list:number[]=[];
  decalage_axis_x = 50;
  decalage_axis_y = 20;
  last_point_list:any[]=[];
  scatter_point_list:PlotDataPoint2D[]=[];
  refresh_point_list_bool:boolean=true;

  public constructor(public data:any, 
    public width: number,
    public height: number,
    public coeff_pixel: number) {}

  
  draw(hidden, show_state, mvx, mvy, scaleX, scaleY){};
  
  define_canvas() {
    var canvas : any = document.getElementById('canvas');
    canvas.width = this.width;
		canvas.height = this.height;
    this.context_show = canvas.getContext("2d");

    var hiddenCanvas = document.createElement("canvas");
		hiddenCanvas.width = this.width;
		hiddenCanvas.height = this.height;
    this.context_hidden = hiddenCanvas.getContext("2d");
  }

  draw_initial() {
    this.init_scale = Math.min(this.width/(this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX), this.height/(this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY));
    this.scale = this.init_scale;
    if ((this.axis_ON) && !(this.graph_ON)) {
      this.init_scaleX = (this.width-this.decalage_axis_x)/(this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX);
      this.init_scaleY = (this.height - this.decalage_axis_y)/(this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY);
      this.scaleX = this.init_scaleX;
      this.scaleY = this.init_scaleY;
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX + this.decalage_axis_x/(2*this.scaleX);
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY - this.decalage_axis_y/(2*this.scaleY);
    } else if ((this.axis_ON) && (this.graph_ON)) {
      this.init_scaleX = (this.width-this.decalage_axis_x)/(this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX);
      this.init_scaleY = (this.height - this.decalage_axis_y - (this.graph1_button_y + this.graph1_button_h + 5))/(this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY);
      this.scaleX = this.init_scaleX;
      this.scaleY = this.init_scaleY;
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX + this.decalage_axis_x/(2*this.scaleX);
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY - (this.decalage_axis_y - (this.graph1_button_y + this.graph1_button_h + 5))/(2*this.scaleY);
    } else {
      this.scaleX = this.init_scale;
      this.scaleY = this.init_scale;
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX;
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY;
    }
    this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
    this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);

  }

  draw_empty_canvas(hidden) {
    if (hidden) {
      this.context = this.context_hidden;
    } else {
      this.context = this.context_show;
    }
    this.context.clearRect(0, 0, this.width, this.height);
  }

  draw_contour(hidden, show_state, mvx, mvy, scaleX, scaleY, d) {
    if (d['type'] == 'contour') {
      this.context.beginPath();
      if (hidden) {
        this.context.fillStyle = d.mouse_selection_color;
      } else {
        this.context.strokeStyle = d.plot_data_states[show_state].color_line;
        this.context.lineWidth = d.plot_data_states[show_state].stroke_width;
        this.context.fillStyle = 'white';
        if (d.plot_data_states[show_state].hatching != null) {
          this.context.fillStyle = this.context.createPattern(d.plot_data_states[show_state].hatching.canvas_hatching,'repeat');
        }
        if (d.plot_data_states[show_state].color_surface != null) {
          this.context.fillStyle = d.plot_data_states[show_state].color_surface.color;
        }
        if (this.select_on_mouse == d) {
          this.context.fillStyle = this.color_surface_on_mouse;
        }
        for (var j = 0; j < this.select_on_click.length; j++) {
          var z = this.select_on_click[j];
          if (z == d) {
            this.context.fillStyle = this.color_surface_on_click;
          }
        }
      }
      for (var j = 0; j < d.plot_data_primitives.length; j++) {
        var elem = d.plot_data_primitives[j];
        if (j == 0) {var first_elem = true} else {var first_elem = false}
        elem.draw(this.context, first_elem,  mvx, mvy, scaleX, scaleY);
      }
      this.context.fill();
      this.context.stroke();
      this.context.closePath();
    
    }
  }

  draw_point(hidden, show_state, mvx, mvy, scaleX, scaleY, d) {
    if (d['type'] == 'point') {
      if (hidden) {
        this.context.fillStyle = d.mouse_selection_color;
      } else {
        this.context.fillStyle = d.plot_data_states[show_state].point_color.color_fill;
        this.context.lineWidth = d.plot_data_states[show_state].stroke_width;
        this.context.strokeStyle = d.plot_data_states[show_state].point_color.color_stroke;
        var shape = d.plot_data_states[show_state].shape_set.shape;

        if (shape == 'crux') {
          this.context.strokeStyle = d.plot_data_states[show_state].point_color.color_fill;
        }
        if (this.select_on_mouse == d) {
          this.context.fillStyle = this.color_surface_on_mouse;
        }
        for (var j = 0; j < this.select_on_click.length; j++) {
          var z = this.select_on_click[j];
          if (z == d) {
            if (shape == 'crux') {
              this.context.strokeStyle = this.color_surface_on_click;
            } else {
              this.context.fillStyle = this.color_surface_on_click;         
            }
          }
        }
      }
      var x = scaleX*(1000*d.cx+ mvx);
      var y = scaleY*(1000*d.cy + mvy);
      var length = 1000*d.size;

      var is_inside_canvas = ((x + length>=0) && (x - length <= this.width) && (y + length >= 0) && (y - length <= this.height));

      if (is_inside_canvas === true) {
        this.context.beginPath();
        d.draw(this.context, this.context_hidden, mvx, mvy, scaleX, scaleY);
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
      }
    }
  }

  draw_axis(mvx, mvy, scaleX, scaleY, d) {
    if (d['type'] == 'axis'){
      this.context.beginPath();
      d.draw(this.context, mvx, mvy, scaleX, scaleY, this.width, this.height, this.init_scaleX, this.init_scaleY, this.minX, this.maxX, this.minY, this.maxY, this.scroll_x, this.scroll_y, this.decalage_axis_x, this.decalage_axis_y);
      this.context.closePath();
      this.context.fill();
    }
  }
  draw_tooltip(d, mvx, mvy) {
    if (d['type'] == 'tooltip') {
      this.tooltip_ON = true;
      d.manage_tooltip(this.context, mvx, mvy, this.scaleX, this.scaleY, this.init_scale, this.width, this.height, this.tooltip_list)
    }
  }

  find_min_dist(d, mvx, mvy, step) {
    var x0 = this.scaleX*(1000*d.point_list[0].cx + mvx);
    var y0 = this.scaleY*(1000*d.point_list[0].cy + mvy);
    var x1 = this.scaleX*(1000*d.point_list[step].cx + mvx);
    var y1 = this.scaleY*(1000*d.point_list[step].cy + mvy);
    var min_dist = this.distance([x0,y0],[x1,y1]);
    for (var i=1; i<d.point_list.length-step; i=i+step) {
      x0 = this.scaleX*(1000*d.point_list[i].cx + mvx);
      y0 = this.scaleY*(1000*d.point_list[i].cy + mvy);
      x1 = this.scaleX*(1000*d.point_list[i+step].cx + mvx);
      y1 = this.scaleY*(1000*d.point_list[i+step].cy + mvy);
      var dist = this.distance([x0,y0], [x1,y1]);
      if (dist<min_dist) {
        min_dist = dist;
      }
    }
    return min_dist;
  }

  draw_graph2D(d, hidden, mvx, mvy) {
    if ((d['type'] == 'graph2D') && (this.graph_to_display[d.id] === true)) {
      this.context.beginPath();
      this.context.setLineDash(d.dashline);
      this.context.strokeStyle = d.graph_colorstroke;
      this.context.lineWidth = d.graph_linewidth;
      for (var i=0; i<d.segments.length; i++) {
        if (i==0) {
          d.segments[i].draw(this.context, true, mvx, mvy, this.scaleX, this.scaleY);
        } else {
          d.segments[i].draw(this.context, false, mvx, mvy, this.scaleX, this.scaleY);
        }
      }
      this.context.stroke();
      this.context.setLineDash([]);

      [this.index_first_in, this.nb_points_in, this.index_last_in] = this.get_nb_points_inside_canvas(d.point_list, mvx, mvy);
      var step = d.display_step;
      var min_dist = this.find_min_dist(d,mvx,mvy,step);
      while ((min_dist<20) && (step<d.point_list.length)) {
        min_dist = this.find_min_dist(d, mvx, mvy, step);
        step++;
      }
      for (var i=0; i<d.point_list.length; i=i+step) {
        var point = d.point_list[i];
        this.draw_point(hidden, 0, mvx, mvy, this.scaleX, this.scaleY, point);
      }
    } else if ((d['type'] == 'graph2D') && (this.graph_to_display[d.id] === false)) {
      this.delete_clicked_points(d.point_list);
      this.delete_tooltip(d.point_list);
    }
  }

  draw_scatterplot(d, hidden, mvx, mvy) {
    if (d['type'] == 'ScatterPlot') {
      if (((this.scroll_x%5==0) || (this.scroll_y%5==0)) && this.refresh_point_list_bool){
        this.scatter_point_list = this.refresh_point_list(d.point_list,mvx,mvy);
        this.refresh_point_list_bool = false;
      }
      if ((this.scroll_x%5 != 0) && (this.scroll_y%5 != 0)) {
        this.refresh_point_list_bool = true;
      }
      for (var i=0; i<this.scatter_point_list.length; i++) {
        var point = this.scatter_point_list[i];
        this.draw_point(hidden, 0, mvx, mvy, this.scaleX, this.scaleY, point);
      }

      for (var i=0; i<this.tooltip_list.length; i++) {
        if (!this.is_include(this.tooltip_list[i],this.scatter_point_list)) {
          this.tooltip_list = this.remove_selection(this.tooltip_list[i], this.tooltip_list);
        }
      }
    } 
  }

  zoom_button(x, y, w, h) {
    if ((x<0) || (x+h>this.width) || (y<0) || (y+2*h>this.height)) {
      throw new Error("Invalid x or y, the zoom button is out of the canvas");
    }
    this.context.strokeStyle = 'black';
    this.context.beginPath();
    this.context.lineWidth = "2";
    this.context.fillStyle = 'white';
    this.context.rect(x, y, w, h);
    this.context.rect(x, y+h, w, h);
    this.context.moveTo(x, y+h);
    this.context.lineTo(x+w, y+h);
    Shape.crux(this.context, x+w/2, y+h/2, h/3);
    this.context.moveTo(x + w/2 - h/3, y + 3*h/2);
    this.context.lineTo(x + w/2 + h/3, y + 3*h/2);
    this.context.fill();
    this.context.stroke();
    this.context.closePath();
  }

  zoom_window_button(x, y, w, h) {
    if ((x<0) || (x+h>this.width) || (y<0) || (y+h>this.height)) {
      throw new Error("Invalid x or y, the zoom window button is out of the canvas");
    }
    this.context.strokeStyle = 'black';
    if (this.zw_bool) {
      Shape.createButton(x, y, w, h, this.context, "Z ON", "12px Arial");
    } else {
      Shape.createButton(x, y, w, h, this.context, "Z OFF", "12px Arial");
    }
    
  }

  reset_button(x, y, w, h) {
    if ((x<0) || (x+h>this.width) || (y<0) || (y+h>this.height)) {
      throw new Error("Invalid x or y, the reset button is out of the canvas");
    }
    this.context.strokeStyle = 'black';
    Shape.createButton(x, y, w, h, this.context, "Reset", "12px Arial");
  }

  selection_button(x, y, w, h) {
    if ((x<0) || (x+h>this.width) || (y<0) || (y+h>this.height)) {
      throw new Error("Invalid x or y, the selection button is out of the canvas");
    }
    this.context.strokeStyle = 'black';
    if (this.select_bool) {
      Shape.createButton(x, y, w, h, this.context, "S ON", "12px Arial")
    } else {
      Shape.createButton(x, y, w, h, this.context, "S OFF", "12px Arial")
    }
  }

  graph_buttons(y, w, h, police) {
    this.context.font = police;
    this.graph1_button_x = this.width/2;
    for (var i=0; i<this.graph_name_list.length; i++) {
      var text_w = this.context.measureText(this.graph_name_list[i]).width;
      this.graph_text_spacing_list.push(text_w + 10);
      this.graph1_button_x = this.graph1_button_x - (w + text_w + 10)/2;
    }
    var text_spacing_sum_i = 0;
    for (var i=0; i<this.nb_graph; i++) {
      if (this.graph_to_display[i] === true) {
        Shape.createGraphButton(this.graph1_button_x + i*w + text_spacing_sum_i, y, w, h, this.context, this.graph_name_list[i], police, this.graph_colorlist[i], false);
      } else {
        Shape.createGraphButton(this.graph1_button_x + i*w + text_spacing_sum_i, y, w, h, this.context, this.graph_name_list[i], police, this.graph_colorlist[i], true);
      }
      text_spacing_sum_i = text_spacing_sum_i + this.graph_text_spacing_list[i];
    }
  }

  zoom_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y, scale_ceil) {
    this.context_show.setLineDash([]);
          this.context_hidden.setLineDash([]);
          var zoom_coeff_x = this.width/Math.abs(mouse2X - mouse1X);
          var zoom_coeff_y = this.height/Math.abs(mouse2Y - mouse1Y);
          if ((this.scaleX*zoom_coeff_x < scale_ceil) && (this.scaleY*zoom_coeff_y < scale_ceil)) {
            this.last_mouse1X = this.last_mouse1X - Math.min(mouse1X, mouse2X)/this.scaleX
            this.last_mouse1Y = this.last_mouse1Y - Math.min(mouse1Y,mouse2Y)/this.scaleY
            this.scaleX = this.scaleX*zoom_coeff_x;
            this.scaleY = this.scaleY*zoom_coeff_y;
            this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
            this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
          }
  }

  selection_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y) {
    this.context_show.setLineDash([]);
    this.context_hidden.setLineDash([]);
    for (var i=0; i<this.plot_datas.length; i++) {
      var d = this.plot_datas[i];
      var in_rect = Shape.Is_in_rect(this.scaleX*(1000*d.cx + this.last_mouse1X),this.scaleY*(1000*d.cy + this.last_mouse1Y), Math.min(mouse1X, mouse2X), Math.min(mouse1Y, mouse2Y), Math.abs(mouse2X - mouse1X), Math.abs(mouse2Y - mouse1Y));
      if ((d['type']=="point") && (in_rect === true) && !(this.is_include(d, this.select_on_click))) {
        this.select_on_click.push(d);
      } else if (d['type'] == 'graph2D') {
        for (var j=0; j<d.point_list.length; j++) {
          var x = this.scaleX*(1000*d.point_list[j].cx + this.last_mouse1X);
          var y = this.scaleY*(1000*d.point_list[j].cy + this.last_mouse1Y);
          in_rect = Shape.Is_in_rect(x, y, Math.min(mouse1X, mouse2X), Math.min(mouse1Y, mouse2Y), Math.abs(mouse2X - mouse1X), Math.abs(mouse2Y - mouse1Y));
          if ((in_rect===true) && !(this.is_include(d.point_list[j], this.select_on_click))) {
            this.select_on_click.push(d.point_list[j])
          }
        }
      }
    }
    this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
    this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
  }

  zoom_in_button_action() {
    var old_scaleX = this.scaleX;
    var old_scaleY = this.scaleY;
    this.scaleX = this.scaleX*1.2;
    this.scaleY = this.scaleY*1.2;
    this.last_mouse1X = this.last_mouse1X - (this.width/(2*old_scaleX) - this.width/(2*this.scaleX));
    this.last_mouse1Y = this.last_mouse1Y - (this.height/(2*old_scaleY) - this.height/(2*this.scaleY));
    this.scroll_x = 0;
    this.scroll_y = 0;
  }

  zoom_out_button_action() {
    var old_scaleX = this.scaleX;
    var old_scaleY = this.scaleY;
    this.scaleX = this.scaleX/1.2;
    this.scaleY = this.scaleY/1.2;
    this.last_mouse1X = this.last_mouse1X - (this.width/(2*old_scaleX) - this.width/(2*this.scaleX));
    this.last_mouse1Y = this.last_mouse1Y - (this.height/(2*old_scaleY) - this.height/(2*this.scaleY));
    this.scroll_x = 0;
    this.scroll_y = 0;
  }

  click_on_zoom_window_action() {
    this.zw_bool = !this.zw_bool;
    this.select_bool = false;
  }

  click_on_reset_action() {
    this.scaleX = this.init_scaleX;
    this.scaleY = this.init_scaleY;
    this.scale = this.init_scale;
    this.scroll_x = 0;
    this.scroll_y = 0;
    if ((this.axis_ON === true) && (this.graph_ON === false)) {
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX + this.decalage_axis_x/(2*this.scaleX);
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY - this.decalage_axis_y/(2*this.scaleY);
    } else if ((this.axis_ON === true) && (this.graph_ON === true)) {
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX + this.decalage_axis_x/(2*this.scaleX);
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY - (this.decalage_axis_y - (this.graph1_button_y + this.graph1_button_h + 5))/(2*this.scaleY);
    } else {
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX;
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY;
    }
  }

  click_on_selection_button_action() {
    this.zw_bool = false;
    this.select_bool = !this.select_bool;
  }

  graph_button_action(mouse1X, mouse1Y) {
    var text_spacing_sum_i = 0;
    for (var i=0; i<this.nb_graph; i++) {
      var click_on_graph_i = Shape.Is_in_rect(mouse1X, mouse1Y, this.graph1_button_x + i*this.graph1_button_w + text_spacing_sum_i, this.graph1_button_y, this.graph1_button_w, this.graph1_button_h);
      if (click_on_graph_i === true) {
        this.graph_to_display[i] = !this.graph_to_display[i];
      }
      text_spacing_sum_i = text_spacing_sum_i + this.graph_text_spacing_list[i];
    }
  }

  mouse_down_interaction(mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing, e) {
    mouse1X = e.offsetX;
    mouse1Y = e.offsetY;
    mouse2X = e.offsetX;
    mouse2Y = e.offsetY;
    isDrawing = true;
    return [mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing];
  }

  mouse_move_interaction(isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y, e) {
    if ((isDrawing === true) && !(this.zw_bool||this.select_bool)) {
      mouse_moving = true;
      mouse2X = e.offsetX;
      mouse2Y = e.offsetY;
      this.draw(false, 0, this.last_mouse1X + mouse2X/this.scaleX - mouse1X/this.scaleX, this.last_mouse1Y + mouse2Y/this.scaleY - mouse1Y/this.scaleY, this.scaleX, this.scaleY);
      this.draw(true, 0, this.last_mouse1X + mouse2X/this.scaleX - mouse1X/this.scaleX, this.last_mouse1Y + mouse2Y/this.scaleY - mouse1Y/this.scaleY, this.scaleX, this.scaleY);
      
    } else if ((isDrawing === true) && (this.zw_bool||this.select_bool)) {
      mouse_moving = true;
      mouse2X = e.offsetX;
      mouse2Y = e.offsetY;
      this.context_show.setLineDash([]);
      this.context_hidden.setLineDash([]);
      this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
      this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
      this.context_show.beginPath();
      this.context_show.lineWidth = 1;
      this.context_show.strokeStyle = 'black';
      this.context_show.setLineDash([5,5]);
      this.context_show.rect(mouse1X, mouse1Y, mouse2X - mouse1X, mouse2Y - mouse1Y);
      this.context_show.stroke();
      this.context_show.closePath();
      this.context_hidden.beginPath();
      this.context_hidden.lineWidth = 1;
      this.context_hidden.strokeStyle = 'black';
      this.context_hidden.setLineDash([5,5]);
      this.context_hidden.rect(mouse1X, mouse1Y, mouse2X - mouse1X, mouse2Y - mouse1Y);
      this.context_hidden.stroke();
      this.context_hidden.closePath();
    } else {
      var mouseX = e.offsetX;
      var mouseY = e.offsetY;
      var col = this.context_hidden.getImageData(mouseX, mouseY, 1, 1).data;
      var colKey = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
      this.select_on_mouse = this.colour_to_plot_data[colKey];
      this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
      this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
    }
    return [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y];
  }

  mouse_up_interaction(mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y) {
    var scale_ceil = 400*this.init_scale;
    var scale_floor = this.init_scale/3;

    var click_on_plus = Shape.Is_in_rect(mouse1X, mouse1Y, this.zoom_rect_x, this.zoom_rect_y, this.zoom_rect_w, this.zoom_rect_h);
    var click_on_minus = Shape.Is_in_rect(mouse1X, mouse1Y, this.zoom_rect_x, this.zoom_rect_y + this.zoom_rect_h, this.zoom_rect_w, this.zoom_rect_h);
    var click_on_zoom_window = Shape.Is_in_rect(mouse1X, mouse1Y, this.zw_x, this.zw_y, this.zw_w, this.zw_h);
    var click_on_reset = Shape.Is_in_rect(mouse1X, mouse1Y, this.reset_rect_x, this.reset_rect_y, this.reset_rect_w, this.reset_rect_h);
    var is_rect_big_enough = (Math.abs(mouse2X - mouse1X)>40) && (Math.abs(mouse2Y - mouse1Y)>30);
    var click_on_select = Shape.Is_in_rect(mouse1X, mouse1Y, this.select_x, this.select_y, this.select_w, this.select_h);
    var click_on_graph = false;
    var text_spacing_sum_i = 0;
    for (var i=0; i<this.nb_graph; i++) {
      var click_on_graph_i = Shape.Is_in_rect(mouse1X, mouse1Y, this.graph1_button_x + i*this.graph1_button_w + text_spacing_sum_i, this.graph1_button_y, this.graph1_button_w, this.graph1_button_h);
      click_on_graph = click_on_graph || click_on_graph_i;
      text_spacing_sum_i = text_spacing_sum_i + this.graph_text_spacing_list[i];
    }
    var click_on_button = click_on_plus || click_on_minus || click_on_zoom_window || click_on_reset || click_on_select || click_on_graph;

    if (mouse_moving) {
        if ((this.zw_bool && is_rect_big_enough)) {
          this.zoom_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y, scale_ceil);

        } else if (this.select_bool) {
          this.selection_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y)

        } else {
          this.last_mouse1X = this.last_mouse1X + mouse2X/this.scaleX - mouse1X/this.scaleX;
          this.last_mouse1Y = this.last_mouse1Y + mouse2Y/this.scaleY - mouse1Y/this.scaleY;
        }

    } else {
        var col = this.context_hidden.getImageData(mouse1X, mouse1Y, 1, 1).data;
        var colKey = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
        var click_plot_data = this.colour_to_plot_data[colKey];
        if (this.is_include(click_plot_data, this.select_on_click)) {
          this.select_on_click = this.remove_selection(click_plot_data, this.select_on_click);
        } else {
          this.select_on_click.push(click_plot_data);
        }
        if (this.tooltip_ON) {
            if (this.is_include(click_plot_data, this.tooltip_list) && (!this.is_include(click_plot_data, this.select_on_click))) {
              this.tooltip_list = this.remove_selection(click_plot_data, this.tooltip_list);
            } else if (!this.is_include(click_plot_data, this.tooltip_list) && this.is_include(click_plot_data, this.select_on_click)){
              this.tooltip_list.push(click_plot_data);
            }
        }
        
        if (this.contains_undefined(this.select_on_click) && !click_on_button) {
          this.select_on_click = [];
          this.tooltip_list = [];
        }

        if ((click_on_plus === true) && (this.scaleX*1.2 < scale_ceil) && (this.scaleY*1.2 < scale_ceil)) {
          this.zoom_in_button_action();

        } else if ((click_on_minus === true) && (this.scaleX/1.2 > scale_floor) && (this.scaleY/1.2 > scale_floor)) {
          this.zoom_out_button_action();

        } else if (click_on_zoom_window === true) {
          this.click_on_zoom_window_action();
          
        } else if (click_on_reset === true) {
          this.click_on_reset_action();
          
        } else if (click_on_select === true) {
          this.click_on_selection_button_action();

        } else if (click_on_graph) {
          this.graph_button_action(mouse1X, mouse1Y);
        }

        this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
      }
      var isDrawing = false;
      mouse_moving = false;
      return [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y];
  }

  wheel_interaction(mouse3X, mouse3Y, e) {
    var scale_ceil = 400*this.init_scale;
    var scale_floor = this.init_scale/100;
    var zoom_coeff = 1.1;
    var event = -e.deltaY;
    mouse3X = e.offsetX;
    mouse3Y = e.offsetY;
    if ((mouse3Y>=this.height - this.decalage_axis_y) && (mouse3X>this.decalage_axis_x) && this.axis_ON) {
        var old_scaleX = this.scaleX;
        if ((event>0) && (this.scaleX*zoom_coeff<scale_ceil)) {
          this.scaleX = this.scaleX*zoom_coeff;
          this.scroll_x = this.scroll_x - e.deltaY/Math.abs(e.deltaY);
          this.last_mouse1X = this.last_mouse1X - ((this.width/2)/old_scaleX - (this.width/2)/this.scaleX);
        } else if ((event<0) && this.scaleX/zoom_coeff>scale_floor) {
          this.scaleX = this.scaleX/zoom_coeff;
          this.scroll_x = this.scroll_x - e.deltaY/Math.abs(e.deltaY);
          this.last_mouse1X = this.last_mouse1X - ((this.width/2)/old_scaleX - (this.width/2)/this.scaleX);
        }         

    } else if ((mouse3X<=this.decalage_axis_x) && (mouse3Y<this.height - this.decalage_axis_y) && this.axis_ON) {
        var old_scaleY = this.scaleY;
        if ((event>0) && (this.scaleY*zoom_coeff<scale_ceil)) {
          this.scaleY = this.scaleY*zoom_coeff;
          this.scroll_y = this.scroll_y - e.deltaY/Math.abs(e.deltaY);
          this.last_mouse1Y = this.last_mouse1Y - ((this.height/2)/old_scaleY - (this.height/2)/this.scaleY);
        } else if ((event<0) && this.scaleY/zoom_coeff>scale_floor) {
          this.scaleY = this.scaleY/zoom_coeff;
          this.scroll_y = this.scroll_y - e.deltaY/Math.abs(e.deltaY);
          this.last_mouse1Y = this.last_mouse1Y - ((this.height/2)/old_scaleY - (this.height/2)/this.scaleY);
        }
        
    } else {
        var old_scaleY = this.scaleY;
        var old_scaleX = this.scaleX;
        if ((event>0) && (this.scaleX*zoom_coeff<scale_ceil) && (this.scaleY*zoom_coeff<scale_ceil)) {
          this.scaleX = this.scaleX*zoom_coeff;
          this.scaleY = this.scaleY*zoom_coeff;
          this.scroll_x = this.scroll_x - e.deltaY/Math.abs(e.deltaY);
          this.scroll_y = this.scroll_y - e.deltaY/Math.abs(e.deltaY);
          this.last_mouse1X = this.last_mouse1X - (mouse3X/old_scaleX - mouse3X/this.scaleX);
          this.last_mouse1Y = this.last_mouse1Y - (mouse3Y/old_scaleY - mouse3Y/this.scaleY);
        } else if ((event<0) && (this.scaleX/zoom_coeff>scale_floor) && (this.scaleY/zoom_coeff>scale_floor)) {
          this.scaleX = this.scaleX/zoom_coeff;
          this.scaleY = this.scaleY/zoom_coeff;
          this.scroll_x = this.scroll_x - e.deltaY/Math.abs(e.deltaY);
          this.scroll_y = this.scroll_y - e.deltaY/Math.abs(e.deltaY);
          this.last_mouse1X = this.last_mouse1X - (mouse3X/old_scaleX - mouse3X/this.scaleX);
          this.last_mouse1Y = this.last_mouse1Y - (mouse3Y/old_scaleY - mouse3Y/this.scaleY);
        }
      }
      this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY);
      this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY); 
      return [mouse3X, mouse3Y];
  }

  mouse_interaction() {
    var isDrawing = false;
    var mouse_moving = false;
    var mouse1X = 0;
    var mouse1Y = 0;
    var mouse2X = 0;
    var mouse2Y = 0;
    var mouse3X = 0;
    var mouse3Y = 0;

    var canvas = document.getElementById('canvas');

    canvas.addEventListener('mousedown', e => {
      [mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing] = this.mouse_down_interaction(mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing, e);
    })

    canvas.addEventListener('mousemove', e => {
      [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y] = this.mouse_move_interaction(isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y, e);
    })

    canvas.addEventListener('mouseup', e => {
      [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y] = this.mouse_up_interaction(mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y);
    })

    canvas.addEventListener('wheel', e => {
      [mouse3X, mouse3Y] = this.wheel_interaction(mouse3X, mouse3Y, e);
    })
  }

  contains_undefined(list) {
    for (var i=0; i<list.length; i++) {
      if (typeof list[i] === "undefined") {
        return true;
      }
    }
    return false;
  }

  remove_selection(val, list){
    var temp = [];
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if (val != d) {
        temp.push(d);
      }
    }
    return temp;
  }

  is_include(val, list){
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if (val == d) {
        return true;
      }
    }
    return false;
  }

  get_nb_points_inside_canvas(list_points, mvx, mvy) { //Sous hypothèse que la liste est ordonnée par ordre croissant des x
    var bool = true;
    var k = 0;
    var index_first_in = -1;
    var nb_points_in = 0;
    var index_last_in = -1;

    while ((k<list_points.length) && bool) {
      var x = this.scaleX*(1000*list_points[k].cx + mvx);
      var y = this.scaleY*(1000*list_points[k].cy + mvy);
      var is_inside_canvas = (x>=0) && (x<=this.width) && (y>=0) && (y<=this.height);
      if (is_inside_canvas === true) {
        index_first_in = k;
        bool = false;
      } else {
        k++;
      }
    }
    if (index_first_in == -1) {
      return [index_first_in, nb_points_in, index_last_in];
    }

    while (k<list_points.length) {
      var x = this.scaleX*(1000*list_points[k].cx + mvx);
      var y = this.scaleY*(1000*list_points[k].cy + mvy);
      var is_inside_canvas = (x>=0) && (x<=this.width) && (y>=0) && (y<=this.height);
      if (is_inside_canvas === true) {
        index_last_in = k;
        nb_points_in++;
      } 
      k++;
    }
    return [index_first_in, nb_points_in, index_last_in];
  }

  is_inside_canvas(point, mvx, mvy) {
    var x = this.scaleX*(1000*point.cx + mvx);
    var y = this.scaleY*(1000*point.cy + mvy);
    length = 100*point.size;
    return (x+length>=0) && (x<=this.width-length) && (y+length>=0) && (y-length<=this.height);
  }

  get_points_inside_canvas(list_points, mvx, mvy) {
    var new_list_points = [];
    for (var i=0; i<list_points.length; i++) {
      if (this.is_inside_canvas(list_points[i],mvx,mvy)) {
        new_list_points.push(list_points[i]);
      }
    }
    return new_list_points;
  }

  distance(p1,p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0],2) + Math.pow(p1[1] - p2[1], 2));
  }

  copy_list(list) {
    var new_list = [];
    for (var i=0; i<list.length; i++) {
      new_list.push(list[i]);
    }
    return new_list;
  }

  hashing_point(point, nb_x, nb_y, mvx, mvy) {
    var x_step = this.width/nb_x;
    var y_step = this.height/nb_y;
    var x = this.scaleX*(1000*point.cx + mvx);
    var y = this.scaleY*(1000*point.cy + mvy);
    var i = Math.ceil(x/x_step);
    var j = Math.ceil(y/y_step);
    var key = 100*i + j;
    return [key,point];
  }

  hashing_list(point_list, nb_x, nb_y, mvx, mvy) {
    var dict = [];
    for (var k=0; k<point_list.length; k++) {
      var point_dict = this.hashing_point(point_list[k], nb_x, nb_y, mvx, mvy);
      dict.push(point_dict);
    }
    return dict;
  }

  dehashing_list(hashed_point_list) {
    var point_list = [];
    for (var i=0; i<hashed_point_list.length; i++) {
      point_list.push(hashed_point_list[i][1]);
    }
    return point_list;
  }

  refresh_point_list1(point_list, mvx, mvy) { //methode avec hachage
    var new_point_list = this.copy_list(point_list)
    var nb_x = 10;
    var nb_y = 10;
    var dict_point_list = this.hashing_list(new_point_list, nb_x, nb_y, mvx, mvy);
    var i=0;
    var length = dict_point_list.length;
    while (i<length) {
      var point_dict_i = dict_point_list[i];
      var i_0 = Math.floor(point_dict_i[0]/100);
      var i_1 = point_dict_i[0]%100; 
      var size_i = point_dict_i[1].size;
      var xi = this.scaleX*(1000*point_dict_i[1].cx + mvx);
      var yi = this.scaleY*(1000*point_dict_i[1].cy + mvy);
      var bool = false;
      var j = i+1;
      while (j<length) {
        var point_dict_j = dict_point_list[j];
        var j_0 = Math.floor(point_dict_j[0]/100);
        var j_1 = point_dict_j[0]%100;
        var size_j = point_dict_j[1].size;
        if (size_i>=size_j) {
          var max_size_index = i
          var min_size_index = j;
        } else {
          var max_size_index = j;
          var min_size_index = i;
        }
        var xj = this.scaleX*(1000*point_dict_j[1].cx + mvx);
        var yj = this.scaleY*(1000*point_dict_j[1].cy + mvy);
        var is_touching_ij = this.distance([xi,yi], [xj,yj])<1000*(size_i + size_j);
        if ((Math.abs(i_0-j_0)<=1) && (Math.abs(i_1-j_1)<=1) && is_touching_ij) {
          var copy_point_max_index = dict_point_list[max_size_index][1].copy();
          var copy_point_min_index = dict_point_list[min_size_index][1].copy();
          var new_cx = (copy_point_max_index.cx + copy_point_min_index.cx)/2;
          var new_cy = (copy_point_max_index.cy + copy_point_min_index.cy)/2;
          var copy_plot_data_states = [copy_point_max_index.plot_data_states[0]];
          var point = new PlotDataPoint2D([],new_cx, new_cy, copy_plot_data_states, 'point', '');
          var size_coeff = 1.15;
          point.size = dict_point_list[max_size_index][1].size*size_coeff;
          var point_i = dict_point_list[i][1];
          var point_j = dict_point_list[j][1];
          this.delete_clicked_points([point_i, point_j]);
          this.delete_tooltip([point_i, point_j]);
          dict_point_list = this.remove_selection(dict_point_list[i], dict_point_list);
          dict_point_list = this.remove_selection(dict_point_list[j-1], dict_point_list);
          dict_point_list.push(this.hashing_point(point, nb_x, nb_y, mvx, mvy));
          this.colour_to_plot_data[point.mouse_selection_color] = point;
          bool = true;
          break;
        } else {
          j++;
        }
      }
      if (bool) {length--} else {i++}
    }
    return this.dehashing_list(dict_point_list);
  }

  refresh_point_list(point_list, mvx, mvy) { //methode recherche naive
    var new_point_list = this.copy_list(point_list);
    var i = 0;
    var length = new_point_list.length;
    while (i<length) {
      var size_i = new_point_list[i].size;
      var xi = this.scaleX*(1000*new_point_list[i].cx + mvx);
      var yi = this.scaleY*(1000*new_point_list[i].cy + mvy);
      var bool = false;
      var j = i+1;
      while (j<length) {
        var size_j = new_point_list[j].size;
        if (size_i>=size_j) {var max_size_index = i} else {var max_size_index = j}
        var xj = this.scaleX*(1000*new_point_list[j].cx + mvx);
        var yj = this.scaleY*(1000*new_point_list[j].cy + mvy);
        if (this.distance([xi,yi], [xj,yj])<1000*(new_point_list[i].size + new_point_list[j].size)) {
          var new_cx = (new_point_list[i].cx + new_point_list[j].cx)/2;
          var new_cy = (new_point_list[i].cy + new_point_list[j].cy)/2;
          var copy_plot_data_states = [new_point_list[max_size_index].plot_data_states[0].copy()];
          var point = new PlotDataPoint2D([],new_cx, new_cy, copy_plot_data_states, 'point', '');
          var size_coeff = 1.15;
          point.size = new_point_list[max_size_index].size*size_coeff;
          var point_i = new_point_list[i];
          var point_j = new_point_list[j];
          this.delete_clicked_points([point_i, point_j]);
          this.delete_tooltip([point_i, point_j]);
          new_point_list = this.remove_selection(new_point_list[i], new_point_list);
          new_point_list = this.remove_selection(new_point_list[j-1], new_point_list);
          new_point_list.push(point);
          this.colour_to_plot_data[point.mouse_selection_color] = point;
          bool = true;
          break;
        } else {
          j++
        }
      }
      if (bool) {
        length--;
      } else {
        i++;
      }
    }
    return new_point_list;
  }

  delete_clicked_points(point_list) {
    var i = 0;
    while (i<this.select_on_click.length) {
      if (this.is_include(this.select_on_click[i], point_list)) {
        this.select_on_click = this.remove_selection(this.select_on_click[i], this.select_on_click);
      } else {
        i++;
      }
    }
  }

  delete_tooltip(point_list) {
    var i = 0;
    while (i<this.tooltip_list.length) {
      if (this.is_include(this.tooltip_list[i], point_list)) {
        this.tooltip_list = this.remove_selection(this.tooltip_list[i], this.tooltip_list);
      } else {
        i++;
      }
    }
  }

}

export class PlotContour extends PlotData {
  plot_datas:any;
  public constructor(public data:any, 
                public width: number,
                public height: number,
                public coeff_pixel: number) {
    super(data, width, height, coeff_pixel);
    this.plot_datas = [];
    for (var i = 0; i < data.length; i++) {
      var d = this.data[i];
      var a = PlotDataContour2D.deserialize(d);
      if (isNaN(this.minX)) {this.minX = a.minX} else {this.minX = Math.min(this.minX, a.minX)};
      if (isNaN(this.maxX)) {this.maxX = a.maxX} else {this.maxX = Math.max(this.maxX, a.maxX)};
      if (isNaN(this.minY)) {this.minY = a.minY} else {this.minY = Math.min(this.minY, a.minY)};
      if (isNaN(this.maxY)) {this.maxY = a.maxY} else {this.maxY = Math.max(this.maxY, a.maxY)};
      this.colour_to_plot_data[a.mouse_selection_color] = a;
      this.plot_datas.push(a);
    }
    this.define_canvas();
    this.mouse_interaction();
  }
  
  draw(hidden, show_state, mvx, mvy, scaleX, scaleY) {
    this.draw_empty_canvas(hidden);

    for (var i = 0; i < this.plot_datas.length; i++) {
      var d = this.plot_datas[i];
      this.draw_contour(hidden, show_state, mvx, mvy, scaleX, scaleY, d);
    }
  }
}

export class PlotScatter extends PlotData {
  public constructor(public data:any, 
    public width: number,
    public height: number,
    public coeff_pixel: number) {
      super(data, width, height, coeff_pixel);
      this.zoom_rect_x = this.width - 45;
      this.zoom_rect_y = 10;
      this.zoom_rect_w = 35;
      this.zoom_rect_h = 25;
      this.zw_x = this.width - 45;
      this.zw_y = 70;
      this.zw_w = 35;
      this.zw_h = 30;
      this.reset_rect_x = this.width - 45;
      this.reset_rect_y = 110;
      this.reset_rect_w = 35;
      this.reset_rect_h = 30;
      this.select_x = this.width - 45;
      this.select_y = 150;
      this.select_w = 35;
      this.select_h = 30;
      this.graph1_button_y = 10;
      this.graph1_button_w = 30;
      this.graph1_button_h = 15;
      this.plot_datas = [];
      var graphID = 0;
      for (var i = 0; i < data.length; i++) {
        var d = data[i]; 
        var a;
        if (d['type'] == 'point') {
          a = PlotDataPoint2D.deserialize(d)
          if (isNaN(this.minX)) {this.minX = a.minX} else {this.minX = Math.min(this.minX, a.minX)};
          if (isNaN(this.maxX)) {this.maxX = a.maxX} else {this.maxX = Math.max(this.maxX, a.maxX)};
          if (isNaN(this.minY)) {this.minY = a.minY} else {this.minY = Math.min(this.minY, a.minY)};
          if (isNaN(this.maxY)) {this.maxY = a.maxY} else {this.maxY = Math.max(this.maxY, a.maxY)};
          this.colour_to_plot_data[a.mouse_selection_color] = a;
          this.plot_datas.push(a);
        
        } else if (d['type'] == 'axis') {
          this.axis_ON = true;
          a = PlotDataAxis.deserialize(d);
          this.plot_datas.push(a);
        } else if (d['type'] == 'tooltip') {
          a = PlotDataTooltip.deserialize(d);
          this.plot_datas.push(a);
        } else if (d['type'] == 'graph2D') {
          this.graph_ON = true;
          a = PlotDataGraph2D.deserialize(d);
          a.id = graphID;
          graphID++;
          this.graph_colorlist.push(a.point_list[0].plot_data_states[0].point_color.color_fill);
          this.graph_to_display.push(true);
          this.graph_name_list.push(a.name)
          for (var j=0; j<a.point_list.length; j++) {
            var point = a.point_list[j];
            if (isNaN(this.minX)) {this.minX = point.minX} else {this.minX = Math.min(this.minX, point.minX)};
            if (isNaN(this.maxX)) {this.maxX = point.maxX} else {this.maxX = Math.max(this.maxX, point.maxX)};
            if (isNaN(this.minY)) {this.minY = point.minY} else {this.minY = Math.min(this.minY, point.minY)};
            if (isNaN(this.maxY)) {this.maxY = point.maxY} else {this.maxY = Math.max(this.maxY, point.maxY)};
            this.colour_to_plot_data[point.mouse_selection_color] = point;
          }
          this.plot_datas.push(a);
        } else if (d['type'] == 'ScatterPlot') {
          a = PlotDataScatter.deserialize(d);
          for (var j=0; j<a.point_list.length; j++) {
            var point = a.point_list[j];
            if (isNaN(this.minX)) {this.minX = point.minX} else {this.minX = Math.min(this.minX, point.minX)};
            if (isNaN(this.maxX)) {this.maxX = point.maxX} else {this.maxX = Math.max(this.maxX, point.maxX)};
            if (isNaN(this.minY)) {this.minY = point.minY} else {this.minY = Math.min(this.minY, point.minY)};
            if (isNaN(this.maxY)) {this.maxY = point.maxY} else {this.maxY = Math.max(this.maxY, point.maxY)};
            this.colour_to_plot_data[point.mouse_selection_color] = point;
          }
          this.plot_datas.push(a);
        }
      }
      this.nb_graph = graphID;
      // this.graph1_button_x = width/2 - this.nb_graph*(this.graph1_button_w + this.graph_text_spacing)/2;
      this.define_canvas();
      this.mouse_interaction();
  }

  draw(hidden, show_state, mvx, mvy, scaleX, scaleY) {
    this.draw_empty_canvas(hidden);
    for (var i = 0; i < this.plot_datas.length; i++) {
      var d = this.plot_datas[i];
      this.draw_graph2D(d, hidden, mvx, mvy);
      this.draw_scatterplot(d, hidden, mvx, mvy);
      this.draw_point(hidden, show_state, mvx, mvy, scaleX, scaleY, d);
      this.draw_axis(mvx, mvy, scaleX, scaleY, d);
      this.draw_tooltip(d, mvx, mvy);
    }
      //Drawing the zooming button 
      this.zoom_button(this.zoom_rect_x, this.zoom_rect_y, this.zoom_rect_w, this.zoom_rect_h);
      
      //Drawing the button for zooming window selection
      this.zoom_window_button(this.zw_x,this.zw_y,this.zw_w,this.zw_h);
  
      //Drawing the reset button
      this.reset_button(this.reset_rect_x, this.reset_rect_y, this.reset_rect_w, this.reset_rect_h);
      
      //Drawing the selection button
      this.selection_button(this.select_x, this.select_y, this.select_w, this.select_h);

      //Drawing the enable/disable graph button
      this.graph_buttons(this.graph1_button_y, this.graph1_button_w, this.graph1_button_h, '10px Arial');
    
  }
}

