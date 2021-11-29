import { string_to_hex } from "./color_conversion";
import { Point2D, PrimitiveGroup, Contour2D, Circle2D, Dataset, Graph2D, Scatter } from "./primitives";
import { Attribute, PointFamily, Axis, Tooltip, Sort, permutator } from "./utils";
import { EdgeStyle } from "./style";
import { Shape, List, MyMath } from "./toolbox";
import { rgb_to_hex, tint_rgb, hex_to_rgb, rgb_to_string, rgb_interpolations, rgb_strToVector } from "./color_conversion";


/** PlotData is the key class for displaying data. It contains numerous parameters and methods 
 * for that purpose. It is inherited by more specific data-visualization objects such as
 * PlotScatter, PlotContour, ParallelPlot and PrimitiveGroupContainer 
 */  
export abstract class PlotData {
  type_:string;
  context_show:any;
  context_hidden:any;
  context:any;
  minX:number=Infinity;
  maxX:number=-Infinity;
  minY:number=Infinity;
  maxY:number=-Infinity;
  init_scale:number=1;
  init_scaleX:number=1;
  init_scaleY:number=1;
  scale:number=1;
  scaleX:number=1;
  scaleY:number=1;
  scroll_x:number=0;
  scroll_y:number=0;
  initial_originX:number=0;
  initial_originY:number=0;
  initial_width:number=0;
  initial_height:number = 0;
  originX:number=0;
  originY:number=0;
  settings_on:boolean=false;
  colour_to_plot_data:any={};
  select_on_mouse:any;
  primitive_mouse_over_point:Point2D;
  select_on_click:any[]=[];
  selected_point_index:any[]=[];
  color_surface_on_mouse:string=string_to_hex('lightskyblue');
  color_surface_on_click:string=string_to_hex('blue');
  pointLength:number=0;
  tooltip_ON:boolean = false;
  axis_ON:boolean = false;
  link_object_ON:boolean = false;
  index_first_in:number;
  index_last_in:number;
  nb_points_in:number;
  graph_ON:boolean=false;
  isParallelPlot:boolean=false;
  interaction_ON:boolean = true;
  x_nb_digits:number = 0;
  y_nb_digits:number = 0;
  multiplot_manipulation:boolean=false;
  fusion_coeff:number=1.2;

  plotObject:any;
  plot_datas:object={};
  tooltip_list:any[]=[];
  button_x:number=0;
  button_w:number=0;
  button_h:number=0;
  zoom_rect_y:number=0;
  zw_bool:boolean=false;
  zw_y:number=0;
  reset_rect_y:number=0;
  select_bool:boolean=false;
  select_y:number=0;
  sort_list_points:any[]=[];
  graph_to_display:boolean[]=[];
  graph1_button_x:number=0;
  graph1_button_y:number=0;
  graph1_button_w:number=0;
  graph1_button_h:number=0;
  nb_graph:number = 0;
  mergeON:boolean=false;
  merge_y:number=0;
  permanent_window:boolean=true;
  perm_button_y:number=0;
  perm_window_x:number=0;
  perm_window_y:number=0;
  perm_window_w:number=0;
  perm_window_h:number=0;
  initial_permW:number=0;
  initial_permH:number=0;
  graph_colorlist:string[]=[];
  graph_name_list:string[]=[];
  graph_text_spacing_list:number[]=[];
  decalage_axis_x = 50;
  decalage_axis_y = 20;
  last_point_list:any[]=[];
  scatter_points:Point2D[]=[];
  scatter_init_points:Point2D[]=[];
  refresh_point_list_bool:boolean=true;
  sc_interpolation_ON: boolean=false;
  isSelectingppAxis:boolean=false;
  zoom_box_x:number=0;
  zoom_box_y:number=0;
  zoom_box_w:number=0;
  zoom_box_h:number=0;
  clear_point_button_y:number=0;

  all_attributes:Attribute[]=[];
  attribute_booleans:boolean[]=[];
  axis_list:Attribute[]=[];
  to_display_list:any[]=[];
  axis_y_start = 0
  axis_y_end = 0
  y_step:number=0;
  axis_x_start:number=0;
  axis_x_end:number=0;
  x_step:number=0;
  move_index:number = -1;
  elements:any;
  vertical:boolean=false;
  disp_x:number = 0;
  disp_y:number = 0;
  disp_w:number = 0;
  disp_h:number = 0;
  selected_axis_name:string='';
  inverted_axis_list:boolean[]=[];
  rubber_bands:any[]=[];
  rubber_last_min:number=0;
  rubber_last_max:number=0;
  edge_style:EdgeStyle;
  bandWidth:number=30;
  bandColor:string=string_to_hex('lightblue');
  bandOpacity:number=0.5;
  axisNameSize:number=12;
  gradSize:number=10;
  axisNbGrad:number=10;
  interpolation_colors:string[]=[];
  rgbs:[number, number, number][]=[];
  hexs:string[];
  pp_selected:any[]=[];
  pp_selected_index:number[]=[];
  click_on_button:boolean=false;
  vertical_axis_coords:number[][]=[];
  horizontal_axis_coords:number[][]=[];
  display_list_to_elements_dict:any;

  initial_rect_color_stroke:string=string_to_hex('grey');
  initial_rect_line_width:number=0.2;
  initial_rect_dashline:number[]=[];
  manipulation_rect_color_fill:string=string_to_hex('lightblue');
  manipulation_rect_color_stroke:string=string_to_hex('black');
  manipulation_rect_line_width:number=1;
  manipulation_rect_opacity:number=0.3;
  manipulation_rect_dashline:number[]=[15,15];

  isSelecting:boolean=false;
  selection_coords:[number, number][]=[];
  is_drawing_rubber_band:boolean=false;
  rubberbands_dep:[string, [number, number]][]=[];

  point_families:PointFamily[]=[];
  latest_selected_points:Point2D[]=[];
  latest_selected_points_index:number[]=[];

  // primitive_group_container's attributes
  manipulation_bool:boolean=false;
  button_y:number=0;
  manip_button_x:number=0;
  reset_button_x:number=0;
  display_order:number[]=[];
  shown_datas:any[]=[];
  hidden_datas:any[]=[];
  clickedPlotIndex:number=-1;
  primitive_dict:any={};
  elements_dict:any={};
  dep_mouse_over:boolean=false;

  public constructor(
    public data:any,
    public width: number,
    public height: number,
    public buttons_ON: boolean,
    public X: number,
    public Y: number,
    public canvas_id: string,
    public is_in_multiplot: boolean = false) {
      this.initial_width = width;
      this.initial_height = height;
    }


  abstract draw();

  abstract draw_from_context(hidden);

  define_canvas(canvas_id: string):void {
    var canvas:any = document.getElementById(canvas_id);
    canvas.width = this.width;
		canvas.height = this.height;
    this.context_show = canvas.getContext("2d");
    var hiddenCanvas:any = document.createElement("canvas", { is : canvas_id });
    hiddenCanvas.id = canvas_id + '_hidden';
		hiddenCanvas.width = this.width;
		hiddenCanvas.height = this.height;
    this.context_hidden = hiddenCanvas.getContext("2d");
  }

  set_canvas_size(width:number, height:number): void {
    this.width = width;
    this.height = height;
  }

  draw_initial(): void {
    this.reset_scales();
    this.draw();
    this.draw();
  }

  refresh_MinMax(point_list):void {
    this.minX = Infinity; this.maxX = -Infinity; this.minY = Infinity; this.maxY = -Infinity;
    for (var j=0; j<point_list.length; j++) {
      var point = point_list[j];
      this.minX = Math.min(this.minX, point.minX);
      this.maxX = Math.max(this.maxX, point.maxX);
      this.minY = Math.min(this.minY, point.minY);
      this.maxY = Math.max(this.maxY, point.maxY);
      this.colour_to_plot_data[point.mouse_selection_color] = point;
    }
    if (this.minX === this.maxX) {
      let val = this.minX;
      this.minX = Math.min(0, 2*val);
      this.maxX = Math.max(0, 2*val);
    }
    if (this.minY === this.maxY) {
      let val = this.minY;
      this.minY = Math.min(0, 2*val);
      this.maxY = Math.max(0, 2*val);
    }
  }


  reset_scales(): void {
    this.init_scale = Math.min(this.width/(this.maxX - this.minX), this.height/(this.maxY - this.minY));
    this.scale = this.init_scale;
    if ((this.axis_ON) && !(this.graph_ON)) { // rescale and avoid axis
      this.init_scaleX = 0.95*(this.width - this.decalage_axis_x - 2*this.pointLength)/(this.maxX - this.minX);
      this.init_scaleY = 0.95*(this.height - this.decalage_axis_y - 2*this.pointLength)/(this.maxY - this.minY);
      this.scaleX = this.init_scaleX;
      this.scaleY = this.init_scaleY;
      this.originX = this.width/2 - (this.maxX + this.minX)*this.scaleX/2 + this.decalage_axis_x/2;
      this.originY = this.height/2 - (this.maxY + this.minY)*this.scaleY/2 - this.decalage_axis_y/2 + this.pointLength/2;

    } else if ((this.axis_ON) && (this.graph_ON)) { // rescale + avoid axis and graph buttons on top of canvas
      this.init_scaleX = 0.95*(this.width-this.decalage_axis_x)/(this.maxX - this.minX);
      this.init_scaleY = 0.95*(this.height - this.decalage_axis_y - (this.graph1_button_y + this.graph1_button_h + 5))/(this.maxY - this.minY);
      this.scaleX = this.init_scaleX;
      this.scaleY = this.init_scaleY;
      this.originX = this.width/2 - (this.maxX + this.minX)*this.scaleX/2 + this.decalage_axis_x/2;
      this.originY = this.height/2 - (this.maxY + this.minY)*this.scaleY/2 - (this.decalage_axis_y - (this.graph1_button_y + this.graph1_button_h + 5))/2;

    } else if (this.type_ === 'histogram') {
      this.init_scale = 0.95*(this.width - this.decalage_axis_x)/(this['max_abs'] - this['min_abs']);
      this.scale = this.init_scale; 
      this.originX = this.decalage_axis_x - this.scale*this['min_abs'];
    } else { // only rescale
      this.scaleX = this.init_scale;
      this.scaleY = this.init_scale;
      this.init_scaleX = this.init_scale;
      this.init_scaleY = this.init_scale;
      this.originX = - this.scaleX * this.minX;
      this.originY = - this.scaleY * this.minY;
      // this.originX = (this.width/2 - (this.maxX - this.minX)*this.scaleX/2)/this.scaleX - this.minX;
      // this.originY = (this.height/2 - (this.maxY - this.minY)*this.scaleY/2)/this.scaleY - this.minY;
    }
  }

  draw_settings_rect() {
    Shape.rect(this.X + 1, this.Y + 1, this.width - 2, this.height - 2, this.context, 'white', string_to_hex('blue'), 1, 1, [10,10]);
  }

  draw_rect() {
    if (this.multiplot_manipulation === false) {
      Shape.rect(this.X, this.Y, this.width, this.height, this.context, 'white', this.initial_rect_color_stroke, this.initial_rect_line_width, 1, this.initial_rect_dashline);
    }
  }

  define_context(hidden) {
    if (hidden) {
      this.context = this.context_hidden;
    } else {
      this.context = this.context_show;
    }
  }

  draw_empty_canvas(context) {
    context.clearRect(this.X - 1, this.Y - 1, this.width + 2, this.height + 2);
  }

  draw_manipulable_rect() {
    Shape.rect(this.X, this.Y, this.width, this.height, this.context, this.manipulation_rect_color_fill, this.manipulation_rect_color_stroke, 
      this.manipulation_rect_line_width, this.manipulation_rect_opacity, this.manipulation_rect_dashline);
  }

  draw_mouse_over_rect() {
    Shape.rect(this.X, this.Y, this.width, this.height, this.context, string_to_hex('yellow'), string_to_hex('grey'),
      1, 0.5, [10,10]);
  }

  draw_primitivegroup(hidden, mvx, mvy, scaleX, scaleY, d:PrimitiveGroup) {
    var need_check = ['contour', 'arc', 'circle', 'linesegment2d'];
    if (d['type_'] == 'primitivegroup') {
      for (let i=0; i<d.primitives.length; i++) {
        this.context.beginPath();
        let pr_x=scaleX*d.primitives[i].minX + mvx; 
        let pr_y=scaleY*d.primitives[i].minY + mvy;
        let pr_w=scaleX*(d.primitives[i].maxX - d.primitives[i].minX);
        let pr_h=scaleY*(d.primitives[i].maxY - d.primitives[i].minY);
        var is_inside_canvas = (pr_x+pr_w>=0) && (pr_x<=this.width) &&
          (pr_y+pr_h>0) && (pr_y<=this.height);
        if (need_check.includes(d.primitives[i].type_) && !is_inside_canvas) continue;
        if (d.primitives[i].type_ == 'contour') {
          this.draw_contour(hidden, mvx, mvy, scaleX, scaleY, d.primitives[i]);
        } else if (d.primitives[i].type_ == 'arc') {
          d.primitives[i].init_scale = this.init_scale;
          d.primitives[i].draw(this.context, mvx, mvy, scaleX, scaleY, this.X, this.Y);
          this.context.stroke();
        } else if (d.primitives[i].type_ == 'text') {
          d.primitives[i].init_scale = this.init_scale;
          d.primitives[i].draw(this.context, mvx, mvy, scaleX, scaleY, this.X, this.Y);
        } else if (d.primitives[i].type_ == 'circle') {
          this.draw_circle(hidden, mvx, mvy, scaleX, scaleY, d.primitives[i]);
        } else if (d.primitives[i].type_ == 'linesegment2d') {
          d.primitives[i].draw(this.context, true, mvx, mvy, scaleX, scaleY, this.X, this.Y);
          this.context.stroke();
          this.context.setLineDash([]);
        } else if (d.primitives[i].type_ == 'line2d') {
          d.primitives[i].draw(this.context, mvx, mvy, scaleX, scaleY, this.X, this.Y, this.width, this.height);
        } else if (d.primitives[i].type_ === 'multiplelabels') {
          d.primitives[i].draw(this.context, this.width, this.X, this.Y);
        }
        this.context.closePath(); 
      }
    }
  }

  draw_contour(hidden, mvx, mvy, scaleX, scaleY, d:Contour2D) {
    if (d['type_'] == 'contour') {
      if (hidden) {
        this.context.fillStyle = d.mouse_selection_color;
      } else {
        this.context.strokeStyle = d.edge_style.color_stroke;
        this.context.lineWidth = d.edge_style.line_width;
        this.context.setLineDash(d.edge_style.dashline);
        this.context.fillStyle = d.surface_style.color_fill;
        this.context.globalAlpha = d.surface_style.opacity;
        this.context.fill();
        this.context.globalAlpha = 1;
        if (d.surface_style.hatching != null) {
          this.context.fillStyle = this.context.createPattern(d.surface_style.hatching.canvas_hatching,'repeat');
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
        let elem = d.plot_data_primitives[j];
        if (j == 0) var first_elem = true; else first_elem = false;
        if (elem.type_ == 'linesegment2d') elem.draw(this.context, first_elem,  mvx, mvy, scaleX, scaleY, this.X, this.Y);
        else elem.contour_draw(this.context, first_elem,  mvx, mvy, scaleX, scaleY, this.X, this.Y);
      }
      this.context.stroke();
      this.context.fill();
      this.context.setLineDash([]);
    }
  }

  draw_circle(hidden, mvx, mvy, scaleX, scaleY, d:Circle2D) {
    if (d['type_'] == 'circle') {
      if (hidden) {
        this.context.fillStyle = d.mouse_selection_color;
        d.draw(this.context, mvx, mvy, scaleX, scaleY, this.X, this.Y);
      } else {
        d.draw(this.context, mvx, mvy, scaleX, scaleY, this.X, this.Y);
        this.context.strokeStyle = d.edge_style.color_stroke;
        this.context.setLineDash(d.edge_style.dashline);
        this.context.lineWidth = d.edge_style.line_width;
        this.context.stroke();
        this.context.fillStyle = d.surface_style.color_fill;
        this.context.globalAlpha = d.surface_style.opacity;
        this.context.fill();
        this.context.globalAlpha = 1;
        if (d.surface_style.hatching != null) {
          this.context.fillStyle = this.context.createPattern(d.surface_style.hatching.canvas_hatching,'repeat');
          this.context.fill();
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
      this.context.fill();
      this.context.setLineDash([]);
    }
  }

  draw_point(hidden, mvx, mvy, scaleX, scaleY, d:Point2D) {
    if (d['type_'] == 'point') {
      if (hidden) {
        this.context.fillStyle = d.mouse_selection_color;
      } else {
        if (this.plotObject.type_ == 'scatterplot') {
          if (this.sc_interpolation_ON) {
            if (d.selected || List.contains_undefined(this.select_on_click)) {
              this.context.fillStyle = d.point_style.color_fill;
            } else {
              this.context.fillStyle = rgb_to_hex(tint_rgb(hex_to_rgb(d.point_style.color_fill), 0.75));
            }
          } else {
            this.context.fillStyle = this.plotObject.point_style.color_fill;
            if (d.point_families.length != 0) {
              this.context.fillStyle = d.point_families[d.point_families.length - 1].color;
            }
          }
        } else { // graph2d
          this.context.fillStyle = d.point_style.color_fill;
        }
        this.context.lineWidth = d.point_style.stroke_width;
        this.context.strokeStyle = d.point_style.color_stroke;
        var shape = d.point_style.shape;

        if (shape == 'crux') {
          this.context.strokeStyle = d.point_style.color_fill;
        }
        if (d.selected) {
          if (shape == 'crux') {
            this.context.strokeStyle = this.color_surface_on_click;
          } else {
            if (this.sc_interpolation_ON) {
              this.context.fillStyle = d.point_style.color_fill;
            } else {
              this.context.fillStyle = this.color_surface_on_click;
            }
          }
        }
        if ((this.select_on_mouse === d) || (this.primitive_mouse_over_point === d)) {
          this.context.fillStyle = this.color_surface_on_mouse;
        }
      }
      var x = scaleX*d.cx+ mvx;
      var y = scaleY*d.cy + mvy;
      this.pointLength = d.size;

      var is_inside_canvas = ((x + this.pointLength>=0) && (x - this.pointLength <= this.width) && (y + this.pointLength >= 0) && (y - this.pointLength <= this.height));
      if (is_inside_canvas === true) {
        this.context.beginPath();
        d.draw(this.context, mvx, mvy, scaleX, scaleY, this.X, this.Y);
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
      }
    }
  }

  draw_axis(mvx, mvy, scaleX, scaleY, d:Axis) { // Only used by graph2D
    if (d['type_'] == 'axis'){
      d.draw_horizontal_axis(this.context, mvx, scaleX, this.width, this.height, this.init_scaleX, this.minX, this.maxX, this.scroll_x, 
        this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.plotObject['attribute_names'][0]);
      d.draw_vertical_axis(this.context, mvy, scaleY, this.width, this.height, this.init_scaleY, this.minY, this.maxY, this.scroll_y,
        this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.plotObject['attribute_names'][1]);
      this.x_nb_digits = Math.max(0, 1-Math.floor(Math.log10(d.x_step)));
      this.y_nb_digits = Math.max(0, 1-Math.floor(Math.log10(d.y_step)));
    }
  }

  draw_scatterplot_axis(mvx, mvy, scaleX, scaleY, d:Axis, lists, to_display_attributes) {
    d.draw_scatter_axis(this.context, mvx, mvy, scaleX, scaleY, this.width, this.height, this.init_scaleX, this.init_scaleY, lists, 
      to_display_attributes, this.scroll_x, this.scroll_y, this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.width, this.height);
    this.x_nb_digits = Math.max(0, 1-Math.floor(Math.log10(d.x_step)));
    this.y_nb_digits = Math.max(0, 1-Math.floor(Math.log10(d.y_step)));
    this.context.closePath();
    this.context.fill();
  }

  draw_tooltip(d:Tooltip, mvx, mvy, point_list, initial_point_list, elements, mergeON, axes:any[]) {
    if (d['type_'] == 'tooltip') {
      this.tooltip_ON = true;
      d.manage_tooltip(this.context, mvx, mvy, this.scaleX, this.scaleY, this.width, this.height, this.tooltip_list, this.X, this.Y, this.x_nb_digits, this.y_nb_digits, point_list, initial_point_list, elements, mergeON, axes);
    }
  }

  find_min_dist(d, mvx, mvy, step) {
    var x0 = this.scaleX*d.point_list[0].cx + mvx;
    var y0 = this.scaleY*d.point_list[0].cy + mvy;
    var x1 = this.scaleX*d.point_list[step].cx + mvx;
    var y1 = this.scaleY*d.point_list[step].cy + mvy;
    var min_dist = this.distance([x0,y0],[x1,y1]);
    for (var i=1; i<d.point_list.length-step; i=i+step) {
      x0 = this.scaleX*d.point_list[i].cx + mvx;
      y0 = this.scaleY*d.point_list[i].cy + mvy;
      x1 = this.scaleX*d.point_list[i+step].cx + mvx;
      y1 = this.scaleY*d.point_list[i+step].cy + mvy;
      var dist = this.distance([x0,y0], [x1,y1]);
      if (dist<min_dist) {
        min_dist = dist;
      }
    }
    return min_dist;
  }

  draw_dataset(d:Dataset, hidden, mvx, mvy) {
    if ((d['type_'] == 'dataset') && (this.graph_to_display[d.id] === true)) {
      this.context.beginPath();
      this.context.setLineDash(d.edge_style.dashline);
      this.context.strokeStyle = d.edge_style.color_stroke;
      this.context.lineWidth = d.edge_style.line_width;
      for (var i=0; i<d.segments.length; i++) {
        if (i==0) {
          d.segments[i].draw(this.context, true, mvx, mvy, this.scaleX, this.scaleY, this.X, this.Y);
        } else {
          d.segments[i].draw(this.context, false, mvx, mvy, this.scaleX, this.scaleY, this.X, this.Y);
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
        this.draw_point(hidden, mvx, mvy, this.scaleX, this.scaleY, point);
      }
    } else if ((d['type_'] == 'dataset') && (this.graph_to_display[d.id] === false)) {
      this.delete_clicked_points(d.point_list);
      this.delete_tooltip(d.point_list);
    }
  }

  draw_graph2D(d:Graph2D, hidden, mvx, mvy) {
    if (d['type_'] == 'graph2d') {
      this.draw_axis(mvx, mvy, this.scaleX, this.scaleY, d.axis);
      for (let i=0; i<d.graphs.length; i++) {
        let graph = d.graphs[i];
        this.draw_dataset(graph, hidden, mvx, mvy);
      }
      for (let i=0; i<d.graphs.length; i++) {
        let graph: Dataset = d.graphs[i];
        this.draw_tooltip(graph.tooltip, mvx, mvy, graph.point_list, graph.point_list, graph.elements, false, d.attribute_names);
      }
    }
  }

  draw_scatterplot(d:Scatter, hidden, mvx, mvy) {
    if (d['type_'] == 'scatterplot') {
      this.draw_scatterplot_axis(mvx, mvy, this.scaleX, this.scaleY, d.axis, d.lists, d.to_display_attributes);
      if (((this.scroll_x%5==0) || (this.scroll_y%5==0)) && this.refresh_point_list_bool && this.mergeON){
        let refreshed_points = this.refresh_point_list(d.point_list,mvx,mvy);
        if (!this.point_list_equals(refreshed_points, this.scatter_points)) {
          this.scatter_points = refreshed_points;
          //refresh_point_families
        }
        this.refresh_point_list_bool = false;
      } else if (this.mergeON === false) {
        if (!this.point_list_equals(this.scatter_points, d.point_list)) {
          this.scatter_points = d.point_list;
        }
      }
      if ((this.scroll_x % 5 != 0) && (this.scroll_y % 5 != 0)) {
        this.refresh_point_list_bool = true;
      }
      if (this.point_families.length == 0) {
        for (var i=0; i<this.scatter_points.length; i++) {
          var point:Point2D = this.scatter_points[i];
          this.draw_point(hidden, mvx, mvy, this.scaleX, this.scaleY, point);
        }
      } else {
        var point_order = this.get_point_order();
        for (let i=0; i<point_order.length; i++) {
          for (let j=0; j<point_order[i].length; j++) {
            let index = point_order[i][j];
            let point:Point2D = this.scatter_points[index];
            this.draw_point(hidden, mvx, mvy, this.scaleX, this.scaleY, point);
          }
        }
      }

      for (var i=0; i<this.tooltip_list.length; i++) {
        if (!List.is_include(this.tooltip_list[i],this.scatter_points)) {
          this.tooltip_list = List.remove_element(this.tooltip_list[i], this.tooltip_list);
        }
      }
      this.draw_tooltip(d.tooltip, mvx, mvy, this.scatter_points, d.point_list, d.elements, this.mergeON, d.attribute_names);
    }
  }

  get_point_order() {
    var point_order = [];
    for (let i=0; i<this.point_families.length; i++) {
      point_order.push([]);
    }
    for (let i=0; i<this.scatter_points.length; i++) {
      let point_point_families = this.scatter_points[i].point_families;
      for (let j=0; j<point_point_families.length; j++) {
        let point_family_index_in_list = List.get_index_of_element(point_point_families[j], this.point_families);
        point_order[point_family_index_in_list].push(i);
      }
    }
    return point_order;
  }

  draw_vertical_parallel_axis(nb_axis:number, mvx:number) {
    for (var i=0; i<nb_axis; i++) {
      if (i == this.move_index) {
        var current_x = Math.min(Math.max(this.axis_x_start + i*this.x_step + mvx, this.X), this.X + this.width);
      } else {
        var current_x = this.axis_x_start + i*this.x_step;
      }
      this.context.beginPath();
      this.context.lineWidth = 2;
      Shape.drawLine(this.context, [[current_x, this.axis_y_start], [current_x, this.axis_y_end]]);
      var attribute_name = this.axis_list[i]['name'];
      this.context.font = this.axisNameSize.toString() + 'px sans-serif';
      this.context.textAlign = 'center';
      if (attribute_name == this.selected_axis_name) {
        this.context.strokeStyle = 'blue';
      } else {
        this.context.strokeStyle = 'lightgrey';
      }
      var attribute_alias = this.axis_list[i]['alias'];
      this.context.fillStyle = 'black';
      this.context.fillText(attribute_alias, current_x, this.axis_y_end - 20);
      this.context.stroke();
      var attribute_type = this.axis_list[i]['type_'];
      var list = this.axis_list[i]['list'];
      this.context.font = this.gradSize.toString() + 'px sans-serif';
      if (attribute_type == 'float') {
        var min = list[0];
        var max = list[1];
        if (min == max) {
          let current_y = (this.axis_y_start + this.axis_y_end)/2;
          Shape.drawLine(this.context, [[current_x - 3, current_y], [current_x + 3, current_y]]);
          let current_grad = MyMath.round(min,3);
          this.context.textAlign = 'end';
          this.context.textBaseline = 'middle';
          this.context.fillText(current_grad, current_x - 5, current_y);
        } else {
          var grad_step = (max - min)/(this.axisNbGrad - 1);
          var y_step = (this.axis_y_end - this.axis_y_start)/(this.axisNbGrad - 1);
          for (var j=0; j<this.axisNbGrad; j++) {
            var current_y = this.axis_y_start + j*y_step;
            if (this.inverted_axis_list[i] === true) {
              var current_grad:any = MyMath.round(max - j*grad_step, 3);
            } else {
              current_grad = MyMath.round(min + j*grad_step, 3);
            }
            Shape.drawLine(this.context, [[current_x - 3, current_y], [current_x + 3, current_y]]);
            this.context.textAlign = 'end';
            this.context.textBaseline = 'middle';
            this.context.fillText(current_grad, current_x - 5, current_y);
          }
        }
      } else { //ie string
        var nb_attribute = list.length;
        if (nb_attribute == 1) {
          var current_y = (this.axis_y_end + this.axis_y_start)/2;
          current_grad = list[0].toString();
          Shape.drawLine(this.context, [[current_x - 3, current_y], [current_x + 3, current_y]]);
          this.context.textAlign = 'end';
          this.context.textBaseline = 'middle';
          this.context.fillText(current_grad, current_x - 5, current_y);
        } else {
          y_step = (this.axis_y_end - this.axis_y_start)/(nb_attribute - 1);
          for (var j=0; j<nb_attribute; j++) {
            var current_y = this.axis_y_start + j*y_step;
            if (this.inverted_axis_list[i] === true) {
              current_grad = list[nb_attribute-j-1].toString();
            } else {
              current_grad = list[j].toString();
            }
            Shape.drawLine(this.context, [[current_x - 3, current_y], [current_x + 3, current_y]]);
            this.context.textAlign = 'end';
            this.context.textBaseline = 'middle';
            this.context.fillText(current_grad, current_x - 5, current_y);
          }
        }
      }
      this.context.stroke();
      this.context.fill();
      this.context.closePath();
    }
  }

  draw_horizontal_parallel_axis(nb_axis:number, mvy:number) {
    for (var i=0; i<nb_axis; i++) {
      if (i == this.move_index) {
        var current_y = Math.min(Math.max(this.axis_y_start + i*this.y_step + mvy, this.Y), this.Y + this.height);
      } else {
        var current_y = this.axis_y_start + i*this.y_step;
      }
      this.context.beginPath();
      this.context.lineWidth = 2;
      Shape.drawLine(this.context, [[this.axis_x_start, current_y], [this.axis_x_end, current_y]]);
      var attribute_name = this.axis_list[i]['name'];
      this.context.font = this.axisNameSize.toString() + 'px sans-serif';
      this.context.textAlign = 'center';
      if (attribute_name == this.selected_axis_name) {
        this.context.strokeStyle = 'blue';
      } else {
        this.context.strokeStyle = 'black';
      }
      this.context.fillStyle = 'black';
      var attribute_alias = this.axis_list[i]['alias'];
      this.context.fillText(attribute_alias, this.axis_x_start, current_y + 15);
      this.context.stroke();
      var attribute_type = this.axis_list[i]['type_'];
      var list = this.axis_list[i]['list'];
      this.context.font = this.gradSize.toString() + 'px sans-serif';
      if (attribute_type == 'float') {
        var min = list[0];
        var max = list[1];
        if (max == min) {
          let current_x = (this.axis_x_start + this.axis_x_end)/2;
          Shape.drawLine(this.context, [[current_x, current_y - 3], [current_x, current_y + 3]]);
          let current_grad = min;
          this.context.fillText(current_grad, current_x, current_y - 5);
        } else {
          var grad_step = (max - min)/(this.axisNbGrad - 1);
          var x_step = (this.axis_x_end - this.axis_x_start)/(this.axisNbGrad - 1);
          for (var j=0; j<this.axisNbGrad; j++) {
            var current_x = this.axis_x_start + j*x_step;
            if (this.inverted_axis_list[i] === true) {
              var current_grad:any = MyMath.round(max - j*grad_step, 3);
            } else {
              current_grad = MyMath.round(min + j*grad_step, 3);
            }
            Shape.drawLine(this.context, [[current_x, current_y - 3], [current_x, current_y + 3]]);
            this.context.textAlign = 'center';
            this.context.fillText(current_grad, current_x, current_y - 5);
          }
        }

      } else {
        var nb_attribute = list.length;
        if (nb_attribute == 1) {
          var current_x = (this.axis_x_end + this.axis_x_start)/2;
          current_grad = list[0].toString();
          Shape.drawLine(this.context, [[current_x, current_y - 3], [current_x, current_y + 3]]);
          this.context.textAlign = 'middle';
          this.context.fillText(current_grad, current_x, current_y - 5);
        } else {
          x_step = (this.axis_x_end - this.axis_x_start)/(nb_attribute - 1);
          for (var j=0; j<nb_attribute; j++) {
            var current_x = this.axis_x_start + j*x_step;
            if (this.inverted_axis_list[i] === true) {
              current_grad = list[nb_attribute-j-1].toString();
            } else {
              current_grad = list[j].toString();
            }
            Shape.drawLine(this.context, [[current_x, current_y - 3], [current_x, current_y + 3]]);
            this.context.textAlign = 'middle';
            this.context.fillText(current_grad, current_x, current_y - 5);
          }
        }
      }
      this.context.stroke();
      this.context.fill();
      this.context.closePath();
    }
  }

  draw_parallel_axis(nb_axis:number, mv:number) {
    if (this.vertical === true) {
      this.draw_vertical_parallel_axis(nb_axis, mv);
    } else {
      this.draw_horizontal_parallel_axis(nb_axis, mv);
    }
  }

  point_list_equals(p_list1:Point2D[], p_list2:Point2D[]): boolean {
    if (p_list1.length != p_list2.length) {
      return false;
    }
    for (let i=0; i<p_list1.length; i++) {
      if (!p_list1[i].equals(p_list2[i])) {
        return false;
      }
    }
    return true;
  }

  real_to_axis_coord(real_coord, type_, list, inverted) { // axis coordinate belongs to [0,1]
    if (type_ == 'float') {
      if (this.vertical) {
        var axis_coord_start = this.axis_y_start;
        var axis_coord_end = this.axis_y_end;
      } else {
        var axis_coord_start = this.axis_x_start;
        var axis_coord_end = this.axis_x_end;
      }
      let pp_coord = this.get_coord_on_parallel_plot(type_, list, real_coord, axis_coord_start, axis_coord_end, inverted);
      if (this.vertical) {
        var axis_coord = Math.min(Math.max((pp_coord - this.axis_y_end)/(this.axis_y_start - this.axis_y_end), 0), 1);
      } else {
        var axis_coord = Math.min(Math.max((pp_coord - this.axis_x_start)/(this.axis_x_end - this.axis_x_start), 0), 1);
      }
      return axis_coord;
    } else {
      var nb_values = list.length;
      if (nb_values == 1) {
        return 0.5;
      } else {
        if ((inverted && this.vertical) || (!inverted && !this.vertical)) {
          return real_coord/(nb_values-1);
        } else {
          return 1 - real_coord/(nb_values-1);
        }
      }
    }
  }

  get_coord_on_parallel_plot(attribute_type, current_list, elt, axis_coord_start, axis_coord_end, inverted) { // From [0,1] to axis display coords 
    if (attribute_type == 'float') {
      var min = current_list[0];
      var max = current_list[1];
      if (min == max) {
        var current_axis_coord = (axis_coord_start + axis_coord_end)/2;
      } else {
        var delta_y = elt - min;
        var delta_axis_coord = (axis_coord_end - axis_coord_start) * delta_y/(max - min);
        if (inverted === true) {
          var current_axis_coord = axis_coord_end - delta_axis_coord;
        } else {
          current_axis_coord = axis_coord_start + delta_axis_coord;
        }
      }
    } else {
      var color = elt;
      if (current_list.length == 1) {
        current_axis_coord = (axis_coord_start + axis_coord_end)/2;
      } else {
        var color_index = List.get_index_of_element(color, current_list);
        var axis_coord_step = (axis_coord_end - axis_coord_start)/(current_list.length - 1);
        if (inverted === true) {
          current_axis_coord = axis_coord_end - color_index*axis_coord_step;
        } else {
          current_axis_coord = axis_coord_start + color_index*axis_coord_step;
        }
      }
    }
    return current_axis_coord;
  }

  refresh_axis_coords() {
    var old_vertical = this.vertical;
    this.vertical = true;
    this.refresh_axis_bounds(this.axis_list.length);
    this.vertical_axis_coords=this.get_axis_coords(true);

    this.vertical = false;
    this.refresh_axis_bounds(this.axis_list.length);
    this.horizontal_axis_coords=this.get_axis_coords(false);
    this.vertical = old_vertical;
    this.refresh_axis_bounds(this.axis_list.length);
  }

  get_axis_coords(vertical:boolean) {
    var axis_coords = [];
    for (var i=0; i<this.to_display_list.length; i++) {
      var to_display_list_i = this.to_display_list[i];
      var current_attribute_type = this.axis_list[0]['type_'];
      var current_list = this.axis_list[0]['list'];
      var seg_list = [];
      for (var j=0; j<this.axis_list.length; j++) {
        var current_attribute_type = this.axis_list[j]['type_'];
        var current_list = this.axis_list[j]['list'];
        if (vertical) {
          var current_x = this.axis_x_start + j*this.x_step;
          var current_axis_y = this.get_coord_on_parallel_plot(current_attribute_type, current_list, to_display_list_i[j], this.axis_y_start, this.axis_y_end, this.inverted_axis_list[j]);
        } else {
          var current_x = this.get_coord_on_parallel_plot(current_attribute_type, current_list, to_display_list_i[j], this.axis_x_start, this.axis_x_end, this.inverted_axis_list[j]);
          var current_axis_y = this.axis_y_start + j*this.y_step;
        }
        seg_list.push([current_x, current_axis_y]);
      }
      axis_coords.push(seg_list);
    }
    return axis_coords;
  }

  is_inside_band(real_x, real_y, axis_index) {
    if (this.rubber_bands[axis_index].length == 0) {
      return true;
    }
    var rubber_min = this.rubber_bands[axis_index][0];
    var rubber_max = this.rubber_bands[axis_index][1];
    if (this.vertical === true) {
      var coord_ax = (real_y - this.axis_y_end)/(this.axis_y_start - this.axis_y_end);
    } else {
      coord_ax = (real_x - this.axis_x_start)/(this.axis_x_end - this.axis_x_start);
    }
    if ((coord_ax>=rubber_min) && (coord_ax<=rubber_max)) {
      return true;
    }
    return false;
  }

  sort_to_display_list() {
    if (List.is_name_include(this.selected_axis_name, this.axis_list)) {
      for (var i=0; i<this.axis_list.length; i++) {
        if (this.axis_list[i].name == this.selected_axis_name) {
          break;
        }
      }
      var attribute = this.axis_list[i];
      for (let j=0; j<this.to_display_list.length - 1; j++) {
        let current_minElt = this.get_coord_on_parallel_plot(attribute['type_'], attribute['list'], this.to_display_list[j][i], this.axis_y_start, this.axis_y_end, this.inverted_axis_list[i]);
        let current_min = j;
        for (let k=j+1; k<this.to_display_list.length; k++) {
          let current_eltCoord = this.get_coord_on_parallel_plot(attribute['type_'], attribute['list'], this.to_display_list[k][i], this.axis_y_start, this.axis_y_end, this.inverted_axis_list[i]);
          if (current_eltCoord < current_minElt) {
            current_minElt = current_eltCoord;
            current_min = k;
          }
        }
        if (current_min != j) {
          this.to_display_list = List.move_elements(current_min, j, this.to_display_list);
        }
      }
    } else {
      let sort = new Sort();
      let sorted_elements = sort.sortObjsByAttribute(Array.from(this.elements), this.selected_axis_name);
      this.refresh_to_display_list(sorted_elements);
    }
    this.refresh_display_to_elements_dict();
  }


  refresh_display_to_elements_dict() {
    var entries = [];
    for (let i=0; i<this.to_display_list.length; i++) {
      for (let j=0; j<this.elements.length; j++) {
        let bool = true;
        for (let k=0; k<this.axis_list.length; k++) {
          if (this.axis_list[k].type_ == 'color') {
            var is_equal = this.to_display_list[i][k] === rgb_to_string(this.elements[j][this.axis_list[k].name]);
          } else {
            is_equal = this.to_display_list[i][k] === this.elements[j][this.axis_list[k].name];
          }
          if (!is_equal) {
            bool = false;
            break;
          }
        }
        if (bool) {
          entries.push([i, j]);
          break;
        }
      }
    }
    this.display_list_to_elements_dict = Object.fromEntries(entries);
  }

  pp_color_management(index:number, selected:boolean) {
    if (List.isListOfEmptyList(this.rubber_bands)) {
      selected = true;
    }
    if (this.selected_axis_name == '') {
      if (selected === true) {
        this.context.strokeStyle = this.edge_style.color_stroke;
      } else {
        this.context.strokeStyle = string_to_hex('lightgrey');
      }
    } else {
      if (selected === true) {
        this.context.strokeStyle = rgb_to_hex(this.interpolation_colors[index]);
      } else {
        this.context.strokeStyle = rgb_to_hex(tint_rgb(this.interpolation_colors[index], 0.8));
      }
    }
  }


  draw_parallel_coord_lines() {
    var selected_seg_lists = [];
    this.context.lineWidth = this.edge_style.line_width;
    for (let i=0; i<this.to_display_list.length; i++) {
      if (this.vertical) { var seg_list = this.vertical_axis_coords[i]; } else { var seg_list = this.horizontal_axis_coords[i]; }
      let selected = List.is_include(this.to_display_list[i], this.pp_selected);
      if (!selected) {
        this.context.beginPath();
        this.pp_color_management(i, selected);
        Shape.drawLine(this.context, seg_list);
        this.context.stroke();
        this.context.closePath();
      } else {
        selected_seg_lists.push({seg_list:seg_list, index:i});
      }
    }
    for (let seg_dict of selected_seg_lists) {
      this.context.beginPath();
      this.pp_color_management(seg_dict.index, true);
      Shape.drawLine(this.context, seg_dict.seg_list);
      this.context.stroke();
      this.context.closePath();
    }
  }

  reset_pp_selected() {
    this.pp_selected = this.to_display_list;
    this.pp_selected_index = Array.from(Array(this.to_display_list.length).keys());
  }

  refresh_pp_selected() {
    this.pp_selected = [];
    this.pp_selected_index = [];
    if (this.vertical) { var axis_coords = this.vertical_axis_coords; } else { axis_coords = this.horizontal_axis_coords; }
    for (let i=0; i<this.to_display_list.length; i++) {
      var selected:boolean = true;
      var seg_list = axis_coords[i];
      for (let j=0; j<this.axis_list.length; j++) {
        var inside_band = this.is_inside_band(seg_list[j][0], seg_list[j][1], j);
        if (!inside_band) {
          selected = false;
          break;
        }
      }
      if (selected) {
        this.pp_selected.push(this.to_display_list[i]);
        this.pp_selected_index.push(this.from_to_display_list_to_elements(i));
      }
    }
    if (this.pp_selected_index.length === 0 && List.isListOfEmptyList(this.rubber_bands)) {
      this.reset_pp_selected();
    }
  }



  from_to_display_list_to_elements(i) {
    return this.display_list_to_elements_dict[i.toString()];
  }


  draw_rubber_bands(mvx) {
    var color_stroke = string_to_hex('white');
    var line_width = 0.1;
    for (var i=0; i<this.rubber_bands.length; i++) {
      if (this.rubber_bands[i].length != 0) {
        if (this.vertical) {
          var minY = this.rubber_bands[i][0];
          var maxY = this.rubber_bands[i][1];
          var real_minY = this.axis_y_end + minY*(this.axis_y_start - this.axis_y_end);
          var real_maxY = this.axis_y_end + maxY*(this.axis_y_start - this.axis_y_end);
          var current_x = this.axis_x_start + i*this.x_step;
          if (i == this.move_index) {
            Shape.rect(current_x - this.bandWidth/2 + mvx, real_minY, this.bandWidth, real_maxY - real_minY, this.context, this.bandColor, color_stroke, line_width, this.bandOpacity, []);
          } else {
            Shape.rect(current_x - this.bandWidth/2, real_minY, this.bandWidth, real_maxY - real_minY, this.context, this.bandColor, color_stroke, line_width, this.bandOpacity, []);
          }
        } else {
          var minX = this.rubber_bands[i][0];
          var maxX = this.rubber_bands[i][1];
          var real_minX = this.axis_x_start + minX*(this.axis_x_end - this.axis_x_start);
          var real_maxX = this.axis_x_start + maxX*(this.axis_x_end - this.axis_x_start);
          var current_y = this.axis_y_start + i*this.y_step;
          if (i == this.move_index) {
            Shape.rect(real_minX, current_y - this.bandWidth/2 + mvx, real_maxX - real_minX, this.bandWidth, this.context, this.bandColor, color_stroke, line_width, this.bandOpacity, []);
          } else {
            Shape.rect(real_minX, current_y - this.bandWidth/2, real_maxX - real_minX, this.bandWidth, this.context, this.bandColor, color_stroke, line_width, this.bandOpacity, []);
          }
        }
      }
    }
  }

  refresh_interpolation_colors(): void {
    this.interpolation_colors = [];
    this.interpolation_colors = rgb_interpolations(this.rgbs, this.to_display_list.length);
  }

  add_to_hexs(hex:string): void {
    this.hexs.push(hex);
    this.rgbs.push(rgb_strToVector(hex_to_rgb(hex)));
    this.refresh_interpolation_colors();
  }

  remove_from_hexs(index:number): void {
    this.hexs = List.remove_at_index(index, this.hexs);
    this.rgbs = List.remove_at_index(index, this.rgbs);
    this.refresh_interpolation_colors();
  }


  dep_color_propagation(vertical:boolean, inverted:boolean, hexs:string[], attribute_name:string): void {
    var sort: Sort = new Sort();
    var sorted_elements = sort.sortObjsByAttribute(List.copy(this.plotObject.elements), attribute_name);
    var nb_points = this.plotObject.point_list.length;
    for (let i=0; i<nb_points; i++) {
      let j = List.get_index_of_element(sorted_elements[i], this.plotObject.elements);
      if ((vertical && inverted) || (!vertical && !inverted)) {
        this.plotObject.point_list[j].point_style.color_fill = hexs[i];
      } else {
        this.plotObject.point_list[j].point_style.color_fill = hexs[nb_points - 1 - i];
      }
    }
    this.refresh_point_list_bool = true;
  }


  refresh_to_display_list(elements) {
    this.to_display_list = [];
    for (var i=0; i<elements.length; i++) {
      var to_display = [];
      for (var j=0; j<this.axis_list.length; j++) {
        var attribute_name = this.axis_list[j]['name'];
        var type_ = this.axis_list[j]['type_'];
        if (type_ == 'color') {
          var elt = rgb_to_string(elements[i][attribute_name]);
        } else {
          elt = elements[i][attribute_name];
        }
        to_display.push(elt);
      }
      this.to_display_list.push(to_display);
    }
  }


  refresh_axis_bounds(nb_axis) {
    if (this.vertical === true) {
      this.axis_x_start = 50 + this.X;
      this.axis_x_end = this.width - 50 + this.X;
      this.x_step = (this.axis_x_end - this.axis_x_start)/(nb_axis-1);
      this.axis_y_start = this.height - 25 + this.Y;
      this.axis_y_end = 50 + this.Y;
    } else {
      this.axis_x_start = 40 + this.X;
      this.axis_x_end = this.width - 50 + this.X;
      this.axis_y_start = 25 + this.Y;
      this.axis_y_end = this.height - 25 + this.Y;
      this.y_step = (this.axis_y_end - this.axis_y_start)/(nb_axis - 1);
    }
  }

  refresh_buttons_coords() {
    this.button_x = Math.max(this.width*0.9, this.width - 45);
    this.button_w = Math.min(this.width*0.09, 35);
    this.button_h = Math.min(this.height*0.05, 20);
    this.zoom_rect_y = 10;
    this.zw_y = this.zoom_rect_y + 2*this.button_h + 5;
    this.reset_rect_y = this.zw_y + this.button_h + 5;
    this.select_y = this.reset_rect_y + this.button_h + 5;
    this.graph1_button_y = 10;
    this.graph1_button_w = Math.min(this.width*0.05, 30);
    this.graph1_button_h = Math.min(this.height*0.04, 15);
    this.merge_y = this.select_y + this.button_h + 5;
    this.perm_button_y = this.merge_y + this.button_h + 5;
    this.clear_point_button_y = this.perm_button_y + this.button_h + 5;
  }

  refresh_attribute_booleans() {
    this.attribute_booleans = [];
    for (let i=0; i<this.all_attributes.length; i++) {
      let isDisplayed = false;
      for (let j=0; j<this.axis_list.length; j++) {
        if (this.all_attributes[i].name == this.axis_list[j].name) {
          isDisplayed = true;
          break;
        }
      }
      this.attribute_booleans.push(isDisplayed);
    }
  }

  refresh_all_attributes():void { //Orders all_attributes so that displayed axis are placed on top of the list
    var new_all_attributes:Attribute[] = [];
    for (let i=0; i<this.axis_list.length; i++) {
      for (let j=0; j<this.all_attributes.length; j++) {
        if (this.axis_list[i].name == this.all_attributes[j].name) {
          new_all_attributes.push(this.all_attributes[j]);
          this.all_attributes = List.remove_at_index(j, this.all_attributes);
        }
      }
    }
    for (let i=0; i<this.all_attributes.length; i++) {
      new_all_attributes.push(this.all_attributes[i]);
    }
    this.all_attributes = new_all_attributes;
  }

  add_to_axis_list(attribute_names:string[]) {
    for (let i=0; i<attribute_names.length; i++) {
      for (let j=0; j<this.all_attributes.length; j++) {
        if (attribute_names[i] == this.all_attributes[j]['name']) {
          this.axis_list.push(this.all_attributes[j]);
        }
      }
    }
  }

  add_points_to_selection(index_list:number[]) {
    for (let index of index_list) {
      let point = this.plotObject.point_list[index];
      for (let i=0; i<this.scatter_points.length; i++) {
        if (List.is_include(point, this.scatter_points[i].points_inside) && !List.is_include(point, this.select_on_click)) {
          this.select_on_click.push(point);
          this.plotObject.point_list[index].selected = true;
          this.latest_selected_points.push(point);
        }
      }
    }
    this.refresh_selected_point_index();
    this.refresh_latest_selected_points_index();
    this.draw();
  }

  add_axis_to_parallelplot(name:string):void { //Adding a new axis to the plot and redraw the canvas
    for (let i=0; i<this.axis_list.length; i++) {
      if (name == this.axis_list[i]['name']) {
        throw new Error('Cannot add an attribute that is already displayed');
      }
    }
    this.add_to_axis_list([name]);
    this.refresh_axis_bounds(this.axis_list.length);
    this.refresh_all_attributes();
    this.refresh_attribute_booleans();
    this.rubber_bands.push([]);
    this.refresh_to_display_list(this.elements);
    this.draw();
  }

  remove_axis_from_parallelplot(name:string) { //Remove an existing axis and redraw the whole canvas
    var is_in_axislist = false;
    for (var i=0; i<this.axis_list.length; i++) {
      if (this.axis_list[i]['name'] == name) {
        is_in_axislist = true;
        this.axis_list = List.remove_element(this.axis_list[i], this.axis_list);
        break;
      }
    }
    if (is_in_axislist === false) {
      throw new Error('Cannot remove axis that is not displayed');
    }
    this.refresh_attribute_booleans();
    this.refresh_to_display_list(this.elements);
    this.rubber_bands = List.remove_at_index(i, this.rubber_bands);
    this.refresh_axis_bounds(this.axis_list.length);
    this.refresh_all_attributes();
    this.refresh_attribute_booleans();
    this.draw();
  }

  get_scatterplot_displayed_axis():Attribute[] {
    return this.plotObject.to_display_attributes;
  }

  get_scatterplot_displayable_axis():Attribute[] {
    return this.plotObject.all_attributes;
  }

  reset_scatter_point_families() {
    for (let i=0; i<this.plotObject.point_list.length; i++) {
      this.plotObject.point_list[i].point_families = [];
    }
  }

  refresh_scatter_point_family() {
    this.reset_scatter_point_families();
    for (let i=0; i<this.point_families.length; i++) {
      let point_index = this.point_families[i].point_index;
      for (let index of point_index) {
        this.plotObject.point_list[index].point_families.push(this.point_families[i]);
      }
    }
  }

  set_scatterplot_x_axis(attribute_name:string):void {
    var isAttributeInList:boolean = false;
    var attribute:Attribute;
    for (let i=0; i<this.plotObject.all_attributes.length; i++) {
      if (this.plotObject.all_attributes[i].name == attribute_name) {
        isAttributeInList = true;
        attribute = this.plotObject.all_attributes[i];
      }
    }
    if (isAttributeInList === false) {
      throw new Error('Attribute not found');
    }
    this.plotObject.to_display_attributes[0] = attribute;
    this.plotObject.initialize_lists();
    this.plotObject.initialize_point_list(this.plotObject.elements);
    this.refresh_scatter_point_family();
    this.refresh_MinMax(this.plotObject.point_list);
    this.reset_scales();
    if (this.mergeON) {this.scatter_points = this.refresh_point_list(this.plotObject.point_list, this.originX, this.originY);}
    this.draw();
  }

  set_scatterplot_y_axis(attribute_name:string):void {
    var isAttributeInList:boolean = false;
    var attribute:Attribute;
    for (let i=0; i<this.plotObject.all_attributes.length; i++) {
      if (this.plotObject.all_attributes[i].name == attribute_name) {
        isAttributeInList = true;
        attribute = this.plotObject.all_attributes[i];
      }
    }
    if (isAttributeInList === false) {
      throw new Error('Attribute not found');
    }
    this.plotObject.to_display_attributes[1] = attribute;
    this.plotObject.initialize_lists();
    this.plotObject.initialize_point_list(this.plotObject.elements);
    this.refresh_scatter_point_family();
    this.refresh_MinMax(this.plotObject.point_list);
    this.reset_scales();
    if (this.mergeON) {this.scatter_points = this.refresh_point_list(this.plotObject.point_list, this.originX, this.originY);}
    this.draw();
  }

  add_to_tooltip(tooltip:Tooltip, str:string): Tooltip {
    tooltip.attribute_names.push(str);
    return tooltip;
  }

  remove_from_tooltip(tooltip:Tooltip, str:string): Tooltip {
    tooltip.attribute_names = List.remove_element(str, tooltip.attribute_names);
    return tooltip;
  }

  draw_selection_rectangle() {
      var sc_perm_window_x = Math.min(Math.max(this.real_to_scatter_coords(this.perm_window_x, 'x'), this.X), this.width + this.X);
      var sc_perm_window_y = Math.min(Math.max(this.real_to_scatter_coords(this.perm_window_y, 'y'), this.Y), this.height + this.Y);
      var sc_perm_window_w = Math.min(this.real_to_scatter_length(this.perm_window_w, 'x'), this.width + this.X - sc_perm_window_x);
      var sc_perm_window_h = Math.min(this.real_to_scatter_length(this.perm_window_h, 'y'), this.height + this.Y - sc_perm_window_y);
      if (this.real_to_scatter_coords(this.perm_window_x, 'x') < this.X) {
        sc_perm_window_w = Math.min(Math.max(this.real_to_scatter_length(this.perm_window_w, 'x') - this.real_to_scatter_length(this.scatter_to_real_coords(this.X, 'x') - this.perm_window_x, 'x'), 0), this.width);
      }
      if (this.real_to_scatter_coords(this.perm_window_y, 'y') < this.Y) {
        sc_perm_window_h = Math.min(Math.max(this.real_to_scatter_length(this.perm_window_h, 'y') + this.real_to_scatter_length(this.scatter_to_real_coords(this.Y, 'y') - this.perm_window_y, 'y'), 0), this.height);
      }
      Shape.rect(sc_perm_window_x, sc_perm_window_y, sc_perm_window_w, sc_perm_window_h, this.context_show, 'No', 'black', 1, 1, [5,5]);
      Shape.rect(sc_perm_window_x, sc_perm_window_y, sc_perm_window_w, sc_perm_window_h, this.context_hidden, 'No', 'black', 1, 1, [5,5]);
  }

  draw_zoom_rectangle() {
    Shape.rect(this.zoom_box_x, this.zoom_box_y, this.zoom_box_w, this.zoom_box_h, this.context_show, 'No', 'black', 1, 1, [5,5]);
    Shape.rect(this.zoom_box_x, this.zoom_box_y, this.zoom_box_w, this.zoom_box_h, this.context_hidden, 'No', 'black', 1, 1, [5,5]);
  }

  reset_scroll() {
    this.scroll_x = 0;
    this.scroll_y = 0;
    this.refresh_point_list_bool = true;
  }

  invert_rubber_bands(index_list) {
    if (index_list == 'all') {
      for (var i=0; i<this.rubber_bands.length; i++) {
        if (this.rubber_bands[i].length != 0) {
          [this.rubber_bands[i][0], this.rubber_bands[i][1]] = [1-this.rubber_bands[i][1], 1-this.rubber_bands[i][0]];
        }
      }
    } else {
      for (var i=0; i<index_list.length; i++) {
        if (this.rubber_bands[index_list[i]].length != 0) {
          [this.rubber_bands[index_list[i]][0], this.rubber_bands[index_list[i]][1]] = [1-this.rubber_bands[index_list[i]][1], 1-this.rubber_bands[index_list[i]][0]];
        } else {
          throw new Error('invert_rubber_bands() : asking to inverted empty array');
        }
      }
    }
  }

  scatter_to_real_length(sc_length:number, coord_type:string) {
    if (coord_type == 'x') {
      return sc_length/this.scaleX;
    }
    return sc_length/this.scaleY;
  }

  real_to_scatter_length(real_length:number, coord_type:string) {
    if (coord_type == 'x') {
      return this.scaleX*real_length;
    }
    return this.scaleY*real_length;
  }

  scatter_to_real_coords(sc_coord:number, coord_type:string) {
    if (coord_type == 'x') {
      return (sc_coord - this.originX - this.X)/this.scaleX;
    } else {
      return - ((sc_coord - this.originY - this.Y)/this.scaleY);
    }
  }

  real_to_scatter_coords(real_coord:number, coord_type:string):number { //coord_type : 'x' or 'y'
    if (coord_type == 'x') {
      return this.scaleX*real_coord + this.originX + this.X;
    } else {
      return -this.scaleY*real_coord + this.originY + this.Y;
    }
  }

  axis_to_real_coords(x:number, type_:string,  list, inverted):number { //from parallel plot axis coord (between 0 and 1) to real coord (between min_coord and max_coord)
    if (type_ == 'float') {
      let real_min = list[0];
      let real_max = list[1];
      if ((this.vertical && !inverted) || (!this.vertical && inverted)) {
        return (1-x)*real_max + x*real_min; //x must be between 0 and 1
      } else {
        return x*real_max + (1-x)*real_min;
      }
    } else {
      let nb_values = list.length;
      if ((this.vertical && !inverted) || (!this.vertical && inverted)) {
        return (1-x)*(nb_values - 1);
      } else {
        return x*(nb_values - 1);
      }

    }
  }

  add_to_rubberbands_dep(selection:[string, [number, number]]):void {
    for (let i=0; i<this.rubberbands_dep.length; i++) {
      if (this.rubberbands_dep[i][0] == selection[0]) {
        this.rubberbands_dep[i] = selection;
        return;
      }
    }
    this.rubberbands_dep.push(selection);
  }

  get_nb_intersections(attrNum1, attrNum2) { //get the number of segment intersections given two axis index from the initial axis_list
    var compareList = [];
    var firstElts = []
    for (let i=0; i<this.to_display_list.length; i++) {
      let elt1 = this.get_coord_on_parallel_plot(this.axis_list[attrNum1]['type_'], this.axis_list[attrNum1]['list'], this.to_display_list[i][attrNum1], this.axis_y_start, this.axis_y_end, false);
      let elt2 = this.get_coord_on_parallel_plot(this.axis_list[attrNum2]['type_'], this.axis_list[attrNum2]['list'], this.to_display_list[i][attrNum2], this.axis_y_start, this.axis_y_end, false);
      let elts = [elt1, elt2]
      compareList.push(elts);
      firstElts.push(elt1);
    }
    var sort = new Sort();
    firstElts = sort.MergeSort(firstElts);
    var sortedCompareList = [];
    for (let i=0; i<firstElts.length; i++) {
      var firstElement = firstElts[i];
      for (let j=0; j<compareList.length; j++) {
        if (compareList[j][0] == firstElement) {
          sortedCompareList.push(compareList[j]);
          compareList = List.remove_at_index(j, compareList);
          break;
        }
      }
    }
    var secondElts = [];
    for (let i=0; i<sortedCompareList.length; i++) {
      secondElts.push(sortedCompareList[i][1]);
    }
    var sort1 = new Sort();
    secondElts = sort1.MergeSort(secondElts);
    return sort1.nbPermutations;

  }

  delete_inverted_list(lists) { //Delete all inverted lists (ex : [3,2,1] if [1,2,3] already exist in the parameter lists) as the inverted list has the same number of intersections
    var new_list = [];
    for (let i=0; i<lists.length; i++) {
      var inverted_list_i = [];
      for (let j=0; j<lists[i].length; j++) {
        inverted_list_i.push(lists[i][lists[i].length-j-1]);
      }
      if (List.is_list_include(inverted_list_i, new_list) === false) {
        new_list.push(lists[i]);
      }
    }
    return new_list;
  }

  getOptimalAxisDisposition() { //gives the optimal disposition for axis in order to minimize segment intersections
    var list = [];
    for (let i=0; i<this.axis_list.length; i++) {
      list.push(i);
    }
    var permutations = permutator(list);
    permutations = this.delete_inverted_list(permutations);
    var optimal = permutations[0];
    var optiNbPermu = 0;
    for (let k=0; k<permutations[0].length - 1; k++) {
      optiNbPermu = optiNbPermu + this.get_nb_intersections(permutations[0][k], permutations[0][k+1]);
    }

    for (let i=0; i<permutations.length; i++) {
      var currentNbPermu = 0;
      for (let j=0; j<permutations[i].length - 1; j++) {
        currentNbPermu = currentNbPermu + this.get_nb_intersections(permutations[i][j], permutations[i][j+1]);
        if (currentNbPermu >= optiNbPermu) {
          break;
        }
      }
      if (currentNbPermu<optiNbPermu) {
        optiNbPermu = currentNbPermu;
        optimal = permutations[i];
      }
    }
    return optimal;
  }

  OptimizeAxisList() {
    var optimal = this.getOptimalAxisDisposition();
    var new_axis_list = [];
    optimal.forEach(element => {
      new_axis_list.push(this.axis_list[element]);
    });
    this.axis_list = new_axis_list;
    this.refresh_to_display_list(this.elements);
    this.refresh_all_attributes();
    this.refresh_attribute_booleans();
  }


  refresh_selected_point_index() {  //selected_point_index : index of selected points in the initial point list
    this.selected_point_index = [];
    for (let i=0; i<this.select_on_click.length; i++) {
      if (this.select_on_click[i] === undefined) continue;
      if ((this.plotObject['type_'] == 'scatterplot') && this.select_on_click[i]) {
        let clicked_points = this.select_on_click[i].points_inside;
        for (let j=0; j<clicked_points.length; j++) {
          this.selected_point_index.push(List.get_index_of_element(clicked_points[j], this.plotObject.point_list));
        }
      } else if (this.plotObject['type_'] == 'graph2D') {
        for (let j=0; j<this.plotObject.graphs.length; j++) {
          if ((List.is_include(this.select_on_click[i], this.plotObject.graphs[j].point_list)) && this.select_on_click[i]) {
            this.selected_point_index.push([List.get_index_of_element(this.select_on_click[i], this.plotObject.graphs[j].point_list), j]);
          }
        }
      }
    }
  }


  refresh_latest_selected_points_index() {
    this.latest_selected_points_index = [];
    for (let i=0; i<this.latest_selected_points.length; i++) {
      let selected_point = this.latest_selected_points[i];
      if (selected_point != undefined) {
        for (let j=0; j<selected_point.points_inside.length; j++) {
          let point_index = List.get_index_of_element(selected_point.points_inside[j], this.plotObject.point_list);
          this.latest_selected_points_index.push(point_index); 
        }
      }
    }
  }

  selecting_point_action(mouse1X, mouse1Y) {
    var col = this.context_hidden.getImageData(mouse1X, mouse1Y, 1, 1).data;
    var colKey = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
    var click_plot_data = this.colour_to_plot_data[colKey];
    if (click_plot_data) {
      if (click_plot_data.selected) {
        this.select_on_click = List.remove_element(click_plot_data, this.select_on_click);
        click_plot_data.selected = false;
        this.latest_selected_points = [];
      } else {
        this.select_on_click.push(click_plot_data);
        click_plot_data.selected = true;
        this.latest_selected_points = [click_plot_data];
      }
    } 
    // else { 
      // this.select_on_click.push(click_plot_data); // used to add undefined to select_on_click
    // }
    if (this.tooltip_ON && click_plot_data) {
      let is_in_tooltip_list = List.is_include(click_plot_data, this.tooltip_list);
      if (is_in_tooltip_list && !click_plot_data.selected) {
        this.tooltip_list = List.remove_element(click_plot_data, this.tooltip_list);
      } else if (!is_in_tooltip_list && click_plot_data.selected) {
        this.tooltip_list.push(click_plot_data);
      }
    }

    // The following commented lines add a feature that unselect all points when the user is not clicking on a point (in such case,
    // an undefined element is pushed into this.select_on_click).
    // It has been removed but I let it here in case it'd be useful someday.

    // if (List.contains_undefined(this.select_on_click) && !this.click_on_button) {
    //   this.reset_select_on_click();
    //   this.tooltip_list = [];
    //   this.latest_selected_points = [];
    //   Interactions.reset_permanent_window(this);
    // }
    this.refresh_selected_point_index();
    if (this.type_ == 'scatterplot') {this.refresh_latest_selected_points_index();}
  }

  reset_select_on_click() {
    this.select_on_click = [];
    this.selected_point_index = [];
    this.tooltip_list = [];
    if (this.type_ == 'scatterplot') {
      for (let i=0; i<this.plotObject.point_list.length; i++) {
        this.plotObject.point_list[i].selected = false;
        if (this.scatter_points[i]) {this.scatter_points[i].selected = false;}
      }
    } else if (this.type_ == 'graph2d') {
      for (let i=0; i<this.plotObject.graphs.length; i++) {
        for (let j=0; j<this.plotObject.graphs[i].point_list.length; j++) {
          this.plotObject.graphs[i].point_list[j].selected = false;
        }
      }
    }
  }


  mouse_down_interaction(mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing, e) {
    mouse1X = e.offsetX;
    mouse1Y = e.offsetY;
    mouse2X = e.offsetX;
    mouse2Y = e.offsetY;
    isDrawing = true;
    this.initial_originX = this.originX;
    this.initial_originY = this.originY;
    var click_on_selectw_border = false; var up=false; var down=false; var left=false; var right=false;
    if (e.ctrlKey) Interactions.click_on_clear_action(this);
    if (this.select_bool) {
      if (this.permanent_window) {
        [click_on_selectw_border, up, down, left, right] = Interactions.initialize_select_win_bool(mouse1X, mouse1Y, this);
        Interactions.initialize_permWH(this);
      }
    }
    return [mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing, click_on_selectw_border, up, down, left, right];
  }

  mouse_move_interaction(isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y, e, canvas, click_on_selectw_border, up, down, left, right) {
    if (isDrawing === true) {
      mouse2X = e.offsetX;
      mouse2Y = e.offsetY;
      if (!(this.zw_bool||this.select_bool)) {
        canvas.style.cursor = 'move';
        mouse_moving = true;

        this.originX = this.initial_originX + mouse2X - mouse1X;
        this.originY = this.initial_originY + mouse2Y - mouse1Y;
        this.draw();
      } else {
        if (this.select_bool) {
          this.isSelecting = true;
          if (click_on_selectw_border) {
            Interactions.selection_window_resize(mouse1X, mouse1Y, mouse2X, mouse2Y, up, down, left, right, this);

          } else {
            Interactions.mouse_move_select_win_action(mouse1X, mouse1Y, mouse2X, mouse2Y, this);
          }
          Interactions.selection_window_action(this);
          this.refresh_selected_point_index();
          let abs_min = this.scatter_to_real_coords(Math.min(this.real_to_scatter_coords(this.perm_window_x, 'x'), this.real_to_scatter_coords(this.perm_window_x + this.perm_window_w, 'x')), 'x');
          let abs_max = this.scatter_to_real_coords(Math.max(this.real_to_scatter_coords(this.perm_window_x, 'x'), this.real_to_scatter_coords(this.perm_window_x + this.perm_window_w, 'x')), 'x');
          let ord_min = this.scatter_to_real_coords(Math.max(this.real_to_scatter_coords(this.perm_window_y, 'y'), this.real_to_scatter_coords(this.perm_window_y, 'y') + this.real_to_scatter_length(this.perm_window_h, 'y')), 'y');
          let ord_max = this.scatter_to_real_coords(Math.min(this.real_to_scatter_coords(this.perm_window_y, 'y'), this.real_to_scatter_coords(this.perm_window_y, 'y') + this.real_to_scatter_length(this.perm_window_h, 'y')), 'y');
          this.selection_coords = [[abs_min, abs_max], [ord_min, ord_max]];
        } 
        this.zoom_box_x = Math.min(mouse1X, mouse2X);
        this.zoom_box_y = Math.min(mouse1Y, mouse2Y);
        this.zoom_box_w = Math.abs(mouse2X - mouse1X);
        this.zoom_box_h = Math.abs(mouse2Y - mouse1Y);
        this.draw();
        
        canvas.style.cursor = 'crosshair';
        mouse_moving = true;
      }
    } else {
      if (this.zw_bool||this.select_bool) {
        canvas.style.cursor = 'crosshair';
      } else {
        canvas.style.cursor = 'default';
      }
      var mouseX = e.offsetX;
      var mouseY = e.offsetY;
      var col = this.context_hidden.getImageData(mouseX, mouseY, 1, 1).data;
      var colKey = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
      var old_select_on_mouse = this.select_on_mouse;
      this.select_on_mouse = this.colour_to_plot_data[colKey];
      if (this.select_on_mouse !== old_select_on_mouse) {
        this.draw();
      }
    }
    var is_inside_canvas = (mouse2X>=this.X) && (mouse2X<=this.width + this.X) && (mouse2Y>=this.Y) && (mouse2Y<=this.height + this.Y);
    if (!is_inside_canvas) {
      isDrawing = false;
      mouse_moving = false;
      canvas.style.cursor = 'default';
    }
    return [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y];
  }

  mouse_up_interaction(mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y) {
    var scale_ceil = 400*Math.max(this.init_scaleX, this.init_scaleY);
    var scale_floor = Math.min(this.init_scaleX, this.init_scaleY)/3;

    var click_on_plus = Shape.isInRect(mouse1X, mouse1Y, this.button_x + this.X, this.zoom_rect_y + this.Y, this.button_w, this.button_h);
    var click_on_minus = Shape.isInRect(mouse1X, mouse1Y, this.button_x + this.X, this.zoom_rect_y + this.button_h + this.Y, this.button_w, this.button_h);
    var click_on_zoom_window = Shape.isInRect(mouse1X, mouse1Y, this.button_x + this.X, this.zw_y + this.Y, this.button_w, this.button_h);
    var click_on_reset = Shape.isInRect(mouse1X, mouse1Y, this.button_x + this.X, this.reset_rect_y + this.Y, this.button_w, this.button_h);
    var click_on_select = Shape.isInRect(mouse1X, mouse1Y, this.button_x + this.X, this.select_y + this.Y, this.button_w, this.button_h);
    var click_on_graph = false;
    var click_on_merge = Shape.isInRect(mouse1X, mouse1Y, this.button_x + this.X, this.merge_y + this.Y, this.button_w, this.button_h);
    var click_on_perm = Shape.isInRect(mouse1X, mouse1Y, this.button_x + this.X, this.perm_button_y + this.Y, this.button_w, this.button_h);
    var click_on_clear = Shape.isInRect(mouse1X, mouse1Y, this.button_x + this.X, this.clear_point_button_y + this.Y, this.button_w, this.button_h);

    var text_spacing_sum_i = 0;
    for (var i=0; i<this.nb_graph; i++) {
      var click_on_graph_i = Shape.isInRect(mouse1X, mouse1Y, this.graph1_button_x + i*this.graph1_button_w + text_spacing_sum_i + this.X, this.graph1_button_y + this.Y, this.graph1_button_w, this.graph1_button_h);
      click_on_graph = click_on_graph || click_on_graph_i;
      text_spacing_sum_i = text_spacing_sum_i + this.graph_text_spacing_list[i];
    }
    this.click_on_button = false;
    this.click_on_button = click_on_plus || click_on_minus || click_on_zoom_window || click_on_reset || click_on_select 
    || click_on_graph || click_on_merge || click_on_perm || click_on_clear;

    if (mouse_moving) {
      if (this.zw_bool) {
        Interactions.zoom_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y, scale_ceil, this);

      } else if ((this.select_bool) && (this.permanent_window)) {
        Interactions.refresh_permanent_rect(this);
      }
    } else {
        this.selecting_point_action(mouse1X, mouse1Y);
        if ((click_on_plus === true) && (this.scaleX*1.2 < scale_ceil) && (this.scaleY*1.2 < scale_ceil)) {
          Interactions.zoom_in_button_action(this);

        } else if ((click_on_minus === true) && (this.scaleX/1.2 > scale_floor) && (this.scaleY/1.2 > scale_floor)) {
          Interactions.zoom_out_button_action(this);

        } else if (click_on_zoom_window === true) {
          Interactions.click_on_zoom_window_action(this);

        } else if (click_on_reset === true) {
          Interactions.click_on_reset_action(this);

        } else if (click_on_select === true) {
          Interactions.click_on_selection_button_action(this);

        } else if (click_on_graph) {
          Interactions.graph_button_action(mouse1X, mouse1Y, this);

        } else if (click_on_merge) {
          Interactions.click_on_merge_action(this);
        } else if (click_on_perm) {
          Interactions.click_on_perm_action(this);
        } else if (click_on_clear) {
          Interactions.click_on_clear_action(this);
        }
      }
      Interactions.reset_zoom_box(this);
      this.draw();
      var isDrawing = false;
      mouse_moving = false;
      this.isSelecting = false;
      this.is_drawing_rubber_band = false;
      return [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y];
  }

  wheel_interaction(mouse3X, mouse3Y, e) {
    e.preventDefault();
    this.fusion_coeff = 1.2;
    var event = -Math.sign(e.deltaY);
    mouse3X = e.offsetX;
    mouse3Y = e.offsetY;
    if ((mouse3Y>=this.height - this.decalage_axis_y + this.Y) && (mouse3X>this.decalage_axis_x + this.X) && this.axis_ON) {
        if (event>0) {
          this.scaleX = this.scaleX*this.fusion_coeff;
          this.scroll_x++;
          this.originX = this.width/2 + this.fusion_coeff * (this.originX - this.width/2);
        } else if (event<0) {
          this.scaleX = this.scaleX/this.fusion_coeff;
          this.scroll_x--;
          this.originX = this.width/2 + 1/this.fusion_coeff * (this.originX - this.width/2);
        }

    } else if ((mouse3X<=this.decalage_axis_x + this.X) && (mouse3Y<this.height - this.decalage_axis_y + this.Y) && this.axis_ON) {
        if (event>0) {
          this.scaleY = this.scaleY*this.fusion_coeff;
          this.scroll_y++;
          this.originY = this.height/2 + this.fusion_coeff * (this.originY - this.height/2);
        } else if (event<0) {
          this.scaleY = this.scaleY/this.fusion_coeff;
          this.scroll_y--;
          this.originY = this.height/2 + 1/this.fusion_coeff * (this.originY - this.height/2);
        }

    } else {
        if (event>0)  var coeff = this.fusion_coeff; else coeff = 1/this.fusion_coeff;
        this.scaleX = this.scaleX*coeff;
        this.scaleY = this.scaleY*coeff;
        this.scroll_x = this.scroll_x + event;
        this.scroll_y = this.scroll_y + event;
        this.originX = mouse3X - this.X + coeff * (this.originX - mouse3X + this.X);
        this.originY = mouse3Y - this.Y + coeff * (this.originY - mouse3Y + this.Y);
      }
      if (isNaN(this.scroll_x)) this.scroll_x = 0;
      if (isNaN(this.scroll_y)) this.scroll_y = 0;
      this.draw();
      return [mouse3X, mouse3Y];
  }

  mouse_up_interaction_pp(click_on_axis, selected_axis_index, click_on_name, click_on_band, click_on_border, is_resizing, selected_name_index, mouse_moving, isDrawing, mouse1X, mouse1Y, mouse3X, mouse3Y, e) {
    var mouseX = e.offsetX;
    var mouseY = e.offsetY;
    var click_on_disp = Shape.isInRect(mouseX, mouseY, this.disp_x + this.X, this.disp_y + this.Y, this.disp_w, this.disp_h);
    if (click_on_axis && !mouse_moving) {
      Interactions.select_axis_action(selected_axis_index, click_on_band, click_on_border, this);
    } else if (click_on_name && mouse_moving) {
      [mouse3X, mouse3Y, click_on_axis] = Interactions.mouse_up_axis_interversion(mouse1X, mouse1Y, e, this);
    } else if (click_on_name && !mouse_moving) {
      Interactions.select_title_action(selected_name_index, this);
    } else if (this.is_drawing_rubber_band || is_resizing) {
      is_resizing = Interactions.rubber_band_size_check(selected_axis_index, this);
    }
    if (click_on_disp) {
      Interactions.change_disposition_action(this);
    }
    this.is_drawing_rubber_band = false;
    mouse_moving = false;
    isDrawing = false;
    this.originX = 0;
    return [mouse3X, mouse3Y, click_on_axis, isDrawing, mouse_moving, is_resizing];
  }

  mouse_interaction(is_parallelplot:boolean) {
    if (this.interaction_ON === true) {
      var isDrawing = false;
      var mouse_moving = false;
      var mouse1X = 0; var mouse1Y = 0; var mouse2X = 0; var mouse2Y = 0; var mouse3X = 0; var mouse3Y = 0;
      var click_on_axis:boolean=false;
      var selected_axis_index:number = -1;
      var click_on_name:boolean = false;
      var selected_name_index:number = -1;
      var click_on_band:boolean = false;
      var click_on_border:boolean = false;
      var selected_band_index:number = -1;
      var selected_border:number[]=[];
      var is_resizing:boolean=false;
      var click_on_selectw_border:boolean = false;
      var up:boolean = false; var down:boolean = false; var left:boolean = false; var right:boolean = false;

      var canvas = document.getElementById(this.canvas_id);

      canvas.addEventListener('mousedown', e => {
        if (this.interaction_ON) {
          [mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing, click_on_selectw_border, up, down, left, right] = this.mouse_down_interaction(mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing, e);
          if (is_parallelplot) {
            [click_on_axis, selected_axis_index] = Interactions.initialize_click_on_axis(this.axis_list.length, mouse1X, mouse1Y, click_on_axis, this);
            [click_on_name, selected_name_index] = Interactions.initialize_click_on_name(this.axis_list.length, mouse1X, mouse1Y, this);
            [click_on_band, click_on_border, selected_band_index, selected_border] = Interactions.initialize_click_on_bands(mouse1X, mouse1Y, this);
          }
        }
      });

      canvas.addEventListener('mousemove', e => {
        if (this.interaction_ON) {
          if (is_parallelplot) {
            this.isSelectingppAxis = false;
            if (isDrawing) {
              mouse_moving = true;
              if (click_on_name) {
                [mouse2X, mouse2Y, isDrawing, mouse_moving] = Interactions.mouse_move_axis_inversion(isDrawing, e, selected_name_index, this);
              } else if (click_on_axis && !click_on_band && !click_on_border) {
                [mouse2X, mouse2Y] = Interactions.create_rubber_band(mouse1X, mouse1Y, selected_axis_index, e, this);
              } else if (click_on_band) {
                [mouse2X, mouse2Y] = Interactions.rubber_band_translation(mouse1X, mouse1Y, selected_band_index, e, this);
              } else if (click_on_border) {
                [selected_border[1], mouse2X, mouse2Y, is_resizing] = Interactions.rubber_band_resize(mouse1X, mouse1Y, selected_border, e, this);
              }
              this.refresh_pp_selected();
            }
          } else {
            [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y] = this.mouse_move_interaction(isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y, e, canvas, click_on_selectw_border, up, down, left, right);
          }
        }   
      });

      canvas.addEventListener('mouseup', e => {
        if (this.interaction_ON) {
          if (is_parallelplot) {
            [mouse3X, mouse3Y, click_on_axis, isDrawing, mouse_moving, is_resizing] = this.mouse_up_interaction_pp(click_on_axis, selected_axis_index, click_on_name, click_on_band, click_on_border, is_resizing, selected_name_index, mouse_moving, isDrawing, mouse1X, mouse1Y, mouse3X, mouse3Y, e);
          } else {
            [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y] = this.mouse_up_interaction(mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y);
          }
        }
      })

      canvas.addEventListener('wheel', e => {
        if (!is_parallelplot && this.interaction_ON) {
          [mouse3X, mouse3Y] = this.wheel_interaction(mouse3X, mouse3Y, e);
        }
      });

      canvas.addEventListener('mouseleave', e => {
        isDrawing = false;
        mouse_moving = false;
      });

    }

  }

  get_nb_points_inside_canvas(list_points, mvx, mvy) { //given the fact that list_point ([[x0,y0],...,[xn,yn]]) x is in an increasing order
    var bool = true;
    var k = 0;
    var index_first_in = -1;
    var nb_points_in = 0;
    var index_last_in = -1;

    while ((k<list_points.length) && bool) {
      var x = this.scaleX*(list_points[k].cx + mvx);
      var y = this.scaleY*(list_points[k].cy + mvy);
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
      var x = this.scaleX*(list_points[k].cx + mvx);
      var y = this.scaleY*(list_points[k].cy + mvy);
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
    var x = this.scaleX*(point.cx + mvx);
    var y = this.scaleY*(point.cy + mvy);
    length = point.size;
    return (x+length>=0) && (x-length<=this.width) && (y+length>=0) && (y-length<=this.height);
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

  hashing_point(point, nb_x, nb_y, mvx, mvy) {
    var x_step = this.width/nb_x;
    var y_step = this.height/nb_y;
    var x = this.scaleX*(point.cx + mvx);
    var y = this.scaleY*(point.cy + mvy);
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

  refresh_point_list(point_list:Point2D[], mvx:number, mvy:number): Point2D[] { //Naive search method
    var point_list_copy:Point2D[] = List.copy(point_list); // Array.from(point_list);
    var i = 0;
    var length = point_list_copy.length;
    while (i<length - 1) {
      var size_i = point_list_copy[i].size;
      var xi = this.scaleX*point_list_copy[i].cx + mvx;
      var yi = this.scaleY*point_list_copy[i].cy + mvy;
      var bool = false;
      var j = i+1;
      while (j<length) {
        var size_j = point_list_copy[j].size;
        if (size_i>=size_j) {var max_size_index = i;} else {var max_size_index = j;}
        var xj = this.scaleX*point_list_copy[j].cx + mvx;
        var yj = this.scaleY*point_list_copy[j].cy + mvy;
        if (this.distance([xi,yi], [xj,yj])< 10*(point_list_copy[i].size + point_list_copy[j].size)) {
          var new_cx = (point_list_copy[i].cx + point_list_copy[j].cx)/2;
          var new_cy = (point_list_copy[i].cy + point_list_copy[j].cy)/2;
          var point = new Point2D(new_cx, new_cy, point_list_copy[i].point_style, 'point', '');
          point.points_inside = point_list_copy[i].points_inside.concat(point_list_copy[j].points_inside);
          point.point_families = List.union(point_list_copy[i].point_families, point_list_copy[j].point_families);
          point.selected = point_list_copy[i].selected || point_list_copy[j].selected;
          var size_coeff = 1.15;
          point.size = point_list_copy[max_size_index].size*size_coeff;
          var point_i = point_list_copy[i];
          var point_j = point_list_copy[j];
          this.delete_clicked_points([point_i, point_j]);
          this.delete_tooltip([point_i, point_j]);
          point_list_copy = List.remove_element(point_list_copy[i], point_list_copy);
          point_list_copy = List.remove_element(point_list_copy[j-1], point_list_copy);
          point_list_copy.push(point);
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
    return point_list_copy;
  }

  delete_clicked_points(point_list) {
    var i = 0;
    while (i<this.select_on_click.length) {
      if (List.is_include(this.select_on_click[i], point_list)) {
        this.select_on_click[i].selected = false;
        this.select_on_click = List.remove_at_index(i, this.select_on_click);
      } else {
        i++;
      }
    }
  }

  delete_tooltip(point_list) {
    var i = 0;
    while (i<this.tooltip_list.length) {
      if (List.is_include(this.tooltip_list[i], point_list)) {
        this.tooltip_list = List.remove_at_index(i, this.tooltip_list);
      } else {
        i++;
      }
    }
  }

  is_intersecting(seg1:[[number, number], [number, number]], seg2:[[number, number], [number, number]]) { //only works for parallel plot
    var p0 = seg1[0];
    var p1 = seg1[1];
    var q0 = seg2[0];
    var q1 = seg2[1];
    if (this.vertical===true && ((p0[1]<q0[1] && p1[1]>q1[1]) || (p0[1]>q0[1] && p1[1]<q1[1]))) {
      return true;
    } else if (this.vertical===false && ((p0[0]<q0[0] && p1[0]>q1[0]) || (p0[0]>q0[0] && p1[0]<q1[0]))) {
      return true;
    }
    return false;
  }

  counting_intersections(segments) {
    if (segments.length<2) {
      return 0;
    }
    var nb = 0;
    for (let i=1; i<segments.length; i++) {
      for (let j=0; j<i; j++) {
        if (this.is_intersecting(segments[i], segments[j])) {
          nb++;
        }
      }
    }
    return nb;
  }
}


export class Interactions {
// In all the following functions, argument "plot_data" is a PlotScatter object
  public static initialize_select_win_bool(mouseX, mouseY, plot_data): [boolean, boolean, boolean, boolean, boolean] {
    var thickness = 15;
    var sc_perm_window_x = plot_data.real_to_scatter_coords(plot_data.perm_window_x, 'x');
    var sc_perm_window_y = plot_data.real_to_scatter_coords(plot_data.perm_window_y, 'y');
    var sc_perm_window_w = plot_data.real_to_scatter_length(plot_data.perm_window_w, 'x');
    var sc_perm_window_h = plot_data.real_to_scatter_length(plot_data.perm_window_h, 'y');
    var up:boolean = Shape.isInRect(mouseX, mouseY, sc_perm_window_x - thickness/2, sc_perm_window_y - thickness/2, sc_perm_window_w + thickness, thickness);
    var down:boolean =  Shape.isInRect(mouseX, mouseY, sc_perm_window_x - thickness/2, sc_perm_window_y + sc_perm_window_h - thickness/2, sc_perm_window_w + thickness, thickness);
    var left:boolean = Shape.isInRect(mouseX, mouseY, sc_perm_window_x - thickness/2, sc_perm_window_y - thickness/2, thickness, sc_perm_window_h + thickness);
    var right:boolean = Shape.isInRect(mouseX, mouseY, sc_perm_window_x + sc_perm_window_w - thickness/2, sc_perm_window_y - thickness/2, thickness, sc_perm_window_h + thickness);
    var mouse_on_border = up || down || left || right;
    return [mouse_on_border, up, down, left, right];
  }

  public static initialize_permWH(plot_data) {
    plot_data.initial_permW = plot_data.perm_window_w;
    plot_data.initial_permH = plot_data.perm_window_h;
  }

  public static selection_window_resize(mouse1X, mouse1Y, mouse2X, mouse2Y, up, down, left, right, plot_data) {
    var deltaX = plot_data.scatter_to_real_length(mouse2X - mouse1X, 'x');
    var deltaY = plot_data.scatter_to_real_length(mouse2Y - mouse1Y, 'y');
    if (up) {
      plot_data.perm_window_y = plot_data.scatter_to_real_coords(mouse2Y, 'y');
      plot_data.perm_window_h = plot_data.initial_permH - deltaY;
    }
    if (down) {
      plot_data.perm_window_h = plot_data.initial_permH + deltaY;
    }
    if (left) {
      plot_data.perm_window_x = plot_data.scatter_to_real_coords(mouse2X, 'x');
      plot_data.perm_window_w = plot_data.initial_permW - deltaX;
    }
    if (right) {
      plot_data.perm_window_w = plot_data.initial_permW + deltaX;
    }
  }

  public static mouse_move_select_win_action(mouse1X, mouse1Y, mouse2X, mouse2Y, plot_data) {
    var temp_w = Math.abs(mouse2X - mouse1X);
    var temp_h = Math.abs(mouse2Y - mouse1Y);
    if ((temp_w <= 5) || (temp_h <= 5)) return;
    plot_data.perm_window_x = plot_data.scatter_to_real_coords(Math.min(mouse1X, mouse2X), 'x');
    plot_data.perm_window_y = plot_data.scatter_to_real_coords(Math.min(mouse1Y, mouse2Y), 'y');
    plot_data.perm_window_w = plot_data.scatter_to_real_length(temp_w, 'x');
    plot_data.perm_window_h = plot_data.scatter_to_real_length(temp_h, 'y');
  }


  public static selection_window_action(plot_data) {

    var sc_perm_window_x = plot_data.real_to_scatter_coords(plot_data.perm_window_x, 'x');
    var sc_perm_window_y = plot_data.real_to_scatter_coords(plot_data.perm_window_y, 'y');
    var sc_perm_window_w = plot_data.real_to_scatter_length(plot_data.perm_window_w, 'x');
    var sc_perm_window_h = plot_data.real_to_scatter_length(plot_data.perm_window_h, 'y');
    
    if (Math.abs(sc_perm_window_w) <= 5 || Math.abs(sc_perm_window_h) <= 5) return;

    plot_data.latest_selected_points = [];
    plot_data.select_on_click = [];
    plot_data.tooltip_list = [];
    plot_data.context_show.setLineDash([]);
    plot_data.context_hidden.setLineDash([]);

    if (plot_data.plotObject['type_'] == 'graph2d') {
      for (let i=0; i<plot_data.plotObject.graphs.length; i++) {
        let graph = plot_data.plotObject.graphs[i];
        for (let j=0; j<graph.point_list.length; j++) {
          let point = graph.point_list[j];
          var x = plot_data.scaleX*point.cx + plot_data.originX + plot_data.X;
          var y = plot_data.scaleY*point.cy + plot_data.originY + plot_data.Y;
          var in_rect = Shape.isInRect(x, y, sc_perm_window_x, sc_perm_window_y, sc_perm_window_w, sc_perm_window_h);
          if ((in_rect===true) && !List.is_include(point, plot_data.select_on_click)) {
            plot_data.select_on_click.push(point);
            graph.point_list[j].selected = true;
            plot_data.latest_selected_points.push(point);
          } else if (!in_rect) {
            point.selected = false;
          }
        }
      }

    } else if (plot_data.plotObject['type_'] == 'scatterplot') {
      for (var j=0; j<plot_data.scatter_points.length; j++) {
        var x = plot_data.scaleX*plot_data.scatter_points[j].cx + plot_data.originX + plot_data.X;
        var y = plot_data.scaleY*plot_data.scatter_points[j].cy + plot_data.originY + plot_data.Y;
        in_rect = Shape.isInRect(x, y, sc_perm_window_x, sc_perm_window_y, sc_perm_window_w, sc_perm_window_h);
        if ((in_rect===true) && !List.is_include(plot_data.scatter_points[j], plot_data.select_on_click)) {
          plot_data.select_on_click.push(plot_data.scatter_points[j]);
          plot_data.scatter_points[j].selected = true;
          plot_data.latest_selected_points.push(plot_data.scatter_points[j]);
        } else if (!in_rect) {
          plot_data.scatter_points[j].selected = false;
        }
      }
    }
    plot_data.refresh_selected_point_index();
    if (plot_data.type_ == 'scatterplot') {plot_data.refresh_latest_selected_points_index();}
  }

  public static zoom_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y, scale_ceil, plot_data:PlotData) {
    plot_data.context_show.setLineDash([]);
    plot_data.context_hidden.setLineDash([]);
    var zoom_coeff_x = plot_data.width/Math.abs(mouse2X - mouse1X);
    var zoom_coeff_y = plot_data.height/Math.abs(mouse2Y - mouse1Y);
    if ((plot_data.scaleX*zoom_coeff_x < scale_ceil) && (plot_data.scaleY*zoom_coeff_y < scale_ceil)) {
      plot_data.scaleX = plot_data.scaleX*zoom_coeff_x;
      plot_data.scaleY = plot_data.scaleY*zoom_coeff_y;

      let mouseX = Math.min(mouse1X, mouse2X);
      plot_data.originX = zoom_coeff_x * (plot_data.X + plot_data.originX - mouseX);
      let mouseY = Math.min(mouse1Y, mouse2Y);
      plot_data.originY = zoom_coeff_y * (plot_data.Y + plot_data.originY - mouseY);
    }
  }

  public static refresh_permanent_rect(plot_data) {
    if (plot_data.perm_window_w < 0) {
      plot_data.perm_window_x = plot_data.perm_window_x + plot_data.perm_window_w;
      plot_data.perm_window_w = -plot_data.perm_window_w;
    }
    if (plot_data.perm_window_h < 0) {
      plot_data.perm_window_y = plot_data.perm_window_y - plot_data.perm_window_h;
      plot_data.perm_window_h = -plot_data.perm_window_h;
    }
  }

  public static click_on_zoom_window_action(plot_data) {
    plot_data.zw_bool = !plot_data.zw_bool;
    plot_data.select_bool = false;
  }

  public static click_on_selection_button_action(plot_data) {
    plot_data.zw_bool = false;
    plot_data.select_bool = !plot_data.select_bool;
  }

  public static graph_button_action(mouse1X, mouse1Y, plot_data) {
    var text_spacing_sum_i = 0;
    for (var i=0; i<plot_data.nb_graph; i++) {
      var click_on_graph_i = Shape.isInRect(mouse1X, mouse1Y, plot_data.graph1_button_x + i*plot_data.graph1_button_w + text_spacing_sum_i + plot_data.X, 
                             plot_data.graph1_button_y + plot_data.Y, plot_data.graph1_button_w, plot_data.graph1_button_h);
      if (click_on_graph_i === true) {
        plot_data.graph_to_display[i] = !plot_data.graph_to_display[i];
      }
      text_spacing_sum_i = text_spacing_sum_i + plot_data.graph_text_spacing_list[i];
    }
  }

  public static click_on_merge_action(plot_data) {
    plot_data.mergeON = !plot_data.mergeON;
    plot_data.refresh_point_list_bool = true;
    plot_data.reset_scroll();
    plot_data.select_on_click = [];
  }

  public static reset_zoom_box(plot_data) {
    plot_data.zoom_box_x = 0;
    plot_data.zoom_box_y = 0;
    plot_data.zoom_box_w = 0;
    plot_data.zoom_box_h = 0;
  }

  public static reset_permanent_window(plot_data) {
    plot_data.perm_window_x = 0;
    plot_data.perm_window_y = 0;
    plot_data.perm_window_w = 0;
    plot_data.perm_window_h = 0;
  }

  public static click_on_perm_action(plot_data) {
    plot_data.permanent_window = !plot_data.permanent_window;
    this.reset_permanent_window(plot_data);
  }

  public static click_on_clear_action(plot_data) {
    this.reset_permanent_window(plot_data);
    plot_data.reset_select_on_click();
  }

  public static zoom_in_button_action(plot_data) {
    let zoom_coeff = 1.2;
    plot_data.scaleX = plot_data.scaleX*zoom_coeff;
    plot_data.scaleY = plot_data.scaleY*zoom_coeff;
    plot_data.originX = plot_data.width/2 + zoom_coeff * (plot_data.originX - plot_data.width/2);
    plot_data.originY = plot_data.height/2 + zoom_coeff * (plot_data.originY - plot_data.height/2);
    plot_data.reset_scroll();
  }

  public static zoom_out_button_action(plot_data) {
    var zoom_coeff = 1/1.2;
    plot_data.scaleX = plot_data.scaleX*zoom_coeff;
    plot_data.scaleY = plot_data.scaleY*zoom_coeff;
    plot_data.originX = plot_data.width/2 + zoom_coeff * (plot_data.originX - plot_data.width/2);
    plot_data.originY = plot_data.height/2 + zoom_coeff * (plot_data.originY - plot_data.height/2);
    plot_data.reset_scroll();
  }

  public static mouse_move_axis_inversion(isDrawing, e, selected_name_index, plot_data:any) {
    isDrawing = true;
    plot_data.move_index = selected_name_index;
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    if (plot_data.vertical === true) {
      var axis_x = plot_data.axis_x_start + plot_data.move_index*plot_data.x_step;
      plot_data.originX = mouse2X - axis_x
    } else {
      var axis_y = plot_data.axis_y_start + plot_data.move_index*plot_data.y_step;
      plot_data.originX = mouse2Y - axis_y;
    }
    plot_data.draw();
    var is_inside_canvas = (mouse2X>=plot_data.X) && (mouse2X<=plot_data.width + plot_data.X) && (mouse2Y>=plot_data.Y) && (mouse2Y<=plot_data.height + plot_data.Y);
    var mouse_move = true;
    if (!is_inside_canvas) {
      isDrawing = false;
      mouse_move = false;
    }

    return [mouse2X, mouse2Y, isDrawing, mouse_move];
  }

  public static create_rubber_band(mouse1X, mouse1Y, selected_axis_index, e, plot_data:any) {
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    plot_data.is_drawing_rubber_band = true;
    if (plot_data.vertical) {
      var min = Math.max(Math.min((mouse1Y - plot_data.axis_y_end)/(plot_data.axis_y_start - plot_data.axis_y_end), (mouse2Y - plot_data.axis_y_end)/(plot_data.axis_y_start - plot_data.axis_y_end)), -0.01);
      var max = Math.min(Math.max((mouse1Y - plot_data.axis_y_end)/(plot_data.axis_y_start - plot_data.axis_y_end), (mouse2Y - plot_data.axis_y_end)/(plot_data.axis_y_start - plot_data.axis_y_end)), 1);
    } else {
      var min = Math.max(Math.min((mouse1X - plot_data.axis_x_start)/(plot_data.axis_x_end - plot_data.axis_x_start), (mouse2X - plot_data.axis_x_start)/(plot_data.axis_x_end - plot_data.axis_x_start)), -0.01);
      var max = Math.min(Math.max((mouse1X - plot_data.axis_x_start)/(plot_data.axis_x_end - plot_data.axis_x_start), (mouse2X - plot_data.axis_x_start)/(plot_data.axis_x_end - plot_data.axis_x_start)), 1);
    }
    plot_data.rubber_bands[selected_axis_index] = [min, max];
    var realCoord_min = plot_data.axis_to_real_coords(min, plot_data.axis_list[selected_axis_index]['type_'], plot_data.axis_list[selected_axis_index]['list'], plot_data.inverted_axis_list[selected_axis_index]);
    var realCoord_max = plot_data.axis_to_real_coords(max, plot_data.axis_list[selected_axis_index]['type_'], plot_data.axis_list[selected_axis_index]['list'], plot_data.inverted_axis_list[selected_axis_index]);
    var real_min = Math.min(realCoord_min, realCoord_max);
    var real_max = Math.max(realCoord_min, realCoord_max);

    plot_data.add_to_rubberbands_dep([plot_data.axis_list[selected_axis_index]['name'], [real_min, real_max]]);
    plot_data.draw();
    return [mouse2X, mouse2Y];
  }

  public static rubber_band_translation(mouse1X, mouse1Y, selected_band_index, e, plot_data:any) {
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    plot_data.is_drawing_rubber_band = true;
    if (plot_data.vertical) {
      var deltaY = (mouse2Y - mouse1Y)/(plot_data.axis_y_start - plot_data.axis_y_end);
      var new_min = Math.max(plot_data.rubber_last_min + deltaY, -0.01);
      var new_max = Math.min(plot_data.rubber_last_max + deltaY, 1);
    } else {
      var deltaX = (mouse2X - mouse1X)/(plot_data.axis_x_end - plot_data.axis_x_start);
      var new_min = Math.max(plot_data.rubber_last_min + deltaX, -0.01);
      var new_max = Math.min(plot_data.rubber_last_max + deltaX, 1);
    }
    plot_data.rubber_bands[selected_band_index] = [new_min, new_max];
    let real_new_min = plot_data.axis_to_real_coords(new_min, plot_data.axis_list[selected_band_index]['type_'], 
                                                     plot_data.axis_list[selected_band_index]['list'], 
                                                     plot_data.inverted_axis_list[selected_band_index]);
    let real_new_max = plot_data.axis_to_real_coords(new_max, plot_data.axis_list[selected_band_index]['type_'], 
                                                     plot_data.axis_list[selected_band_index]['list'], 
                                                     plot_data.inverted_axis_list[selected_band_index]);
    let to_add_min = Math.min(real_new_min, real_new_max);
    let to_add_max = Math.max(real_new_min, real_new_max);
    plot_data.add_to_rubberbands_dep([plot_data.axis_list[selected_band_index]['name'], [to_add_min, to_add_max]]);
    plot_data.draw();
    return [mouse2X, mouse2Y];
  }

  public static rubber_band_resize(mouse1X, mouse1Y, selected_border, e, plot_data:any) {
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    var axis_index = selected_border[0];
    var border_number = selected_border[1];
    plot_data.is_drawing_rubber_band = true;
    if (plot_data.vertical) {
      var deltaY = (mouse2Y - mouse1Y)/(plot_data.axis_y_start - plot_data.axis_y_end);
      if (border_number == 0) {
        var new_min = Math.min(Math.max(plot_data.rubber_last_min + deltaY, -0.01), 1);
        plot_data.rubber_bands[axis_index][0] = new_min;
      } else {
        var new_max = Math.min(Math.max(plot_data.rubber_last_max + deltaY, -0.01), 1);
        plot_data.rubber_bands[axis_index][1] = new_max;
      }
    } else {
      var deltaX = (mouse2X - mouse1X)/(plot_data.axis_x_end - plot_data.axis_x_start);
      if (border_number == 0) {
        var new_min = Math.min(Math.max(plot_data.rubber_last_min + deltaX, -0.01), 1);
        plot_data.rubber_bands[axis_index][0] = new_min;
      } else {
        var new_max = Math.min(Math.max(plot_data.rubber_last_max + deltaX, -0.01), 1);
        plot_data.rubber_bands[axis_index][1] = new_max;
      }
    }
    if (plot_data.rubber_bands[axis_index][0]>plot_data.rubber_bands[axis_index][1]) {
      [plot_data.rubber_bands[axis_index][0],plot_data.rubber_bands[axis_index][1]] = [plot_data.rubber_bands[axis_index][1],plot_data.rubber_bands[axis_index][0]];
      border_number = 1 - border_number;
      [plot_data.rubber_last_min, plot_data.rubber_last_max] = [plot_data.rubber_last_max, plot_data.rubber_last_min];
    }
    var real_new_min = plot_data.axis_to_real_coords(plot_data.rubber_bands[axis_index][0], 
                                                     plot_data.axis_list[axis_index]['type_'], 
                                                     plot_data.axis_list[axis_index]['list'], 
                                                     plot_data.inverted_axis_list[axis_index]);
    var real_new_max = plot_data.axis_to_real_coords(plot_data.rubber_bands[axis_index][1], 
                                                     plot_data.axis_list[axis_index]['type_'], 
                                                     plot_data.axis_list[axis_index]['list'], 
                                                     plot_data.inverted_axis_list[axis_index]);
    var to_add_min = Math.min(real_new_min, real_new_max);
    var to_add_max = Math.max(real_new_min, real_new_max);
    plot_data.add_to_rubberbands_dep([plot_data.axis_list[axis_index]['name'], [to_add_min, to_add_max]]);
    plot_data.draw();
    var is_resizing = true;
    return [border_number, mouse2X, mouse2Y, is_resizing];
  }

  public static select_axis_action(selected_axis_index, click_on_band, click_on_border, plot_data:PlotData) {
    plot_data.isSelectingppAxis = true;
    if (plot_data.rubber_bands[selected_axis_index].length == 0) {
      var attribute_name = plot_data.axis_list[selected_axis_index]['name'];
      if (attribute_name == plot_data.selected_axis_name) {
        plot_data.selected_axis_name = '';
      } else {
        plot_data.selected_axis_name = attribute_name;
        plot_data.sort_to_display_list(); // à modifier pour trier vertical et horizontal axis coords
        plot_data.refresh_axis_coords();
      }
    } else if ((plot_data.rubber_bands[selected_axis_index].length != 0) && !click_on_band && !click_on_border) {
      plot_data.rubber_bands[selected_axis_index] = [];
      for (let i=0; i<plot_data.rubberbands_dep.length; i++) {
        if (plot_data.rubberbands_dep[i][0] == plot_data.axis_list[selected_axis_index]['name']) {
          plot_data.rubberbands_dep = List.remove_at_index(i, plot_data.rubberbands_dep);
        }
      }
      plot_data.refresh_pp_selected();
    }
    plot_data.draw();
  }

  public static mouse_up_axis_interversion(mouse1X, mouse1Y, e, plot_data:any) {
    var mouse3X = e.offsetX;
    var mouse3Y = e.offsetY;
    if (plot_data.vertical === true) {
      if (mouse3X>mouse1X) {
        var new_index = Math.floor((mouse3X - plot_data.axis_x_start)/plot_data.x_step);
      } else {
        var new_index = Math.ceil((mouse3X - plot_data.axis_x_start)/plot_data.x_step);
      }
    } else {
      if (mouse3Y>mouse1Y) {
        var new_index = Math.floor((mouse3Y - plot_data.axis_y_start)/plot_data.y_step);
      } else {
        var new_index = Math.ceil((mouse3Y - plot_data.axis_y_start)/plot_data.y_step);
      }
    }
    this.move_axis(plot_data.move_index, new_index, plot_data);
    plot_data.move_index = -1;
    var click_on_axis = false;
    plot_data.draw();
    return [mouse3X, mouse3Y, click_on_axis];
  }

  public static select_title_action(selected_name_index, plot_data:any) {
    plot_data.inverted_axis_list[selected_name_index] = !plot_data.inverted_axis_list[selected_name_index];
    if (plot_data.rubber_bands[selected_name_index].length != 0) {
      plot_data.invert_rubber_bands([selected_name_index]);
    }
    plot_data.refresh_axis_coords();
    plot_data.draw();
  }

  public static change_disposition_action(plot_data:any) {
    plot_data.vertical = !plot_data.vertical;
    plot_data.refresh_axis_bounds(plot_data.axis_list.length);
    plot_data.invert_rubber_bands('all');

    plot_data.draw();
  }

  public static rubber_band_size_check(selected_band_index, plot_data:any) {
    if (plot_data.rubber_bands[selected_band_index].length != 0 && Math.abs(plot_data.rubber_bands[selected_band_index][0] - plot_data.rubber_bands[selected_band_index][1])<=0.02) {
      plot_data.rubber_bands[selected_band_index] = [];
    }
    plot_data.draw();
    var is_resizing = false;
    return is_resizing;
  }

  public static move_axis(old_index, new_index, plot_data:any) {
    plot_data.axis_list = List.move_elements(old_index, new_index, plot_data.axis_list);
    plot_data.rubber_bands = List.move_elements(old_index, new_index, plot_data.rubber_bands);
    plot_data.inverted_axis_list = List.move_elements(old_index, new_index, plot_data.inverted_axis_list);
    plot_data.refresh_to_display_list(plot_data.elements);
    plot_data.refresh_all_attributes(); //No need to refresh attribute_booleans as inverting axis doesn't affect its values
    plot_data.refresh_axis_coords();
    plot_data.draw();
  }

  public static initialize_click_on_bands(mouse1X, mouse1Y, plot_data:any) {
    var border_size = 10;
    var click_on_band:any = false;
    var click_on_border:any = false;
    var selected_band_index:any = -1;
    var selected_border:any = [];
    for (var i=0; i<plot_data.rubber_bands.length; i++) {
      if (plot_data.rubber_bands[i].length != 0) {
        var min = plot_data.rubber_bands[i][0];
        var max = plot_data.rubber_bands[i][1];
        plot_data.rubber_last_min = min;
        plot_data.rubber_last_max = max;
        if (plot_data.vertical) {
          var real_minY = plot_data.axis_y_end + min*(plot_data.axis_y_start - plot_data.axis_y_end);
          var real_maxY = plot_data.axis_y_end + max*(plot_data.axis_y_start - plot_data.axis_y_end);
          var current_x = plot_data.axis_x_start + i*plot_data.x_step;
          var is_in_upper_border = Shape.isInRect(mouse1X, mouse1Y, current_x - plot_data.bandWidth/2, real_minY - border_size/2, plot_data.bandWidth, border_size);
          var is_in_lower_border = Shape.isInRect(mouse1X, mouse1Y, current_x - plot_data.bandWidth/2, real_maxY - border_size/2, plot_data.bandWidth, border_size);
          var is_in_rubber_band = Shape.isInRect(mouse1X, mouse1Y, current_x - plot_data.bandWidth/2, real_minY, plot_data.bandWidth, real_maxY - real_minY);
        } else {
          var real_minX = plot_data.axis_x_start + min*(plot_data.axis_x_end - plot_data.axis_x_start);
          var real_maxX = plot_data.axis_x_start + max*(plot_data.axis_x_end - plot_data.axis_x_start);
          var current_y = plot_data.axis_y_start + i*plot_data.y_step;
          is_in_upper_border = Shape.isInRect(mouse1X, mouse1Y, real_minX - border_size/2, current_y - plot_data.bandWidth/2, border_size, plot_data.bandWidth);
          is_in_lower_border = Shape.isInRect(mouse1X, mouse1Y, real_maxX - border_size/2, current_y - plot_data.bandWidth/2, border_size, plot_data.bandWidth);
          is_in_rubber_band = Shape.isInRect(mouse1X, mouse1Y, real_minX, current_y - plot_data.bandWidth/2, real_maxX - real_minX, plot_data.bandWidth);
        }
      }
      if (is_in_upper_border) {
        click_on_border = true;
        selected_border = [i, 0];
        break;
      } else if (is_in_lower_border)  {
        click_on_border = true;
        selected_border = [i, 1];
        break;
      } else if (is_in_rubber_band && !is_in_upper_border && !is_in_lower_border) {
        click_on_band = true;
        selected_band_index = i;
        break;
      }
    }
    return [click_on_band, click_on_border, selected_band_index, selected_border];
  }

  public static initialize_click_on_axis(nb_axis:number, mouse1X:number, mouse1Y:number, click_on_axis, plot_data:any) {
    click_on_axis = false;
    var selected_axis_index = -1;
    for (var i=0; i<nb_axis; i++) {
      if (plot_data.vertical === true) {
        var current_x = plot_data.axis_x_start + i*plot_data.x_step;
        var bool = Shape.isInRect(mouse1X, mouse1Y, current_x - plot_data.bandWidth/2, plot_data.axis_y_end, plot_data.bandWidth, plot_data.axis_y_start - plot_data.axis_y_end);
      } else {
        var current_y = plot_data.axis_y_start + i*plot_data.y_step;
        var bool = Shape.isInRect(mouse1X, mouse1Y, plot_data.axis_x_start, current_y - plot_data.bandWidth/2, plot_data.axis_x_end - plot_data.axis_x_start, plot_data.bandWidth);
      }
      click_on_axis = click_on_axis || bool;
      if (bool) {
        click_on_axis = true;
        selected_axis_index = i;
        break;
      }
    }
    return [click_on_axis, selected_axis_index];
  }

  public static initialize_click_on_name(nb_axis:number, mouse1X:number, mouse1Y:number, plot_data:any) {
    var click_on_name:any = false;
    var selected_name_index:any = -1;
    for (var i=0; i<nb_axis; i++) {
      var attribute_alias = plot_data.axis_list[i]['alias'];
      var text_w = plot_data.context.measureText(attribute_alias).width;
      var text_h = parseInt(plot_data.context.font.split('px')[0], 10);
      if (plot_data.vertical === true) {
        var current_x = plot_data.axis_x_start + i*plot_data.x_step;
        click_on_name = click_on_name || Shape.isInRect(mouse1X, mouse1Y, current_x - text_w/2, plot_data.axis_y_end - 20 - text_h/2, text_w, text_h);

      } else {
        var current_y = plot_data.axis_y_start + i*plot_data.y_step;
        click_on_name = click_on_name || Shape.isInRect(mouse1X, mouse1Y, plot_data.axis_x_start - text_w/2, current_y + 15 - text_h/2, text_w, text_h);
      }
      if (click_on_name === true) {
        selected_name_index = i;
        break;
      }
    }
    return [click_on_name, selected_name_index];
  }

  public static click_on_reset_action(plot_data:PlotData) {
    plot_data.reset_scales();
    plot_data.reset_scroll();
  }
}


export class Buttons {
  public static zoom_button(x, y, w, h, plot_data:PlotData) {
    var actualX = x + plot_data.X;
    var actualY = y + plot_data.Y;
    plot_data.context.strokeStyle = 'black';
    plot_data.context.beginPath();
    plot_data.context.lineWidth = 2;
    plot_data.context.fillStyle = 'white';
    plot_data.context.rect(actualX, actualY, w, h);
    plot_data.context.rect(actualX, actualY + h, w, h);
    plot_data.context.moveTo(actualX, actualY+h);
    plot_data.context.lineTo(actualX+w, actualY+h);
    Shape.crux(plot_data.context, actualX+w/2, actualY+h/2, h/3);
    plot_data.context.moveTo(actualX + w/2 - h/3, actualY + 3*h/2);
    plot_data.context.lineTo(actualX + w/2 + h/3, actualY + 3*h/2);
    plot_data.context.fill();
    plot_data.context.stroke();
    plot_data.context.closePath();
  }

  public static zoom_window_button(x, y, w, h, plot_data:PlotData) {
    plot_data.context.strokeStyle = 'black';
    if (plot_data.zw_bool) {
      Shape.createButton(x + plot_data.X, y + plot_data.Y, w, h, plot_data.context, "Z ON", "12px Arial");
    } else {
      Shape.createButton(x + plot_data.X, y + plot_data.Y, w, h, plot_data.context, "Z OFF", "12px Arial");
    }
  }

  public static reset_button(x, y, w, h, plot_data:PlotData) {
    plot_data.context.strokeStyle = 'black';
    Shape.createButton(x + plot_data.X, y + plot_data.Y, w, h, plot_data.context, "Reset", "12px Arial");
  }

  public static selection_button(x, y, w, h, plot_data:PlotData) {
    plot_data.context.strokeStyle = 'black';
    if (plot_data.select_bool) {
      Shape.createButton(x + plot_data.X, y + plot_data.Y, w, h, plot_data.context, "S ON", "12px Arial")
    } else {
      Shape.createButton(x + plot_data.X, y + plot_data.Y, w, h, plot_data.context, "S OFF", "12px Arial")
    }
  }

  public static graph_buttons(y, w, h, police, plot_data:PlotData) {
    plot_data.context.font = police;
    plot_data.graph1_button_x = plot_data.width/2;
    for (var i=0; i<plot_data.graph_name_list.length; i++) {
      var text_w = plot_data.context.measureText(plot_data.graph_name_list[i]).width;
      plot_data.graph_text_spacing_list.push(text_w + 10);
      plot_data.graph1_button_x = plot_data.graph1_button_x - (w + text_w + 10)/2;
    }
    var text_spacing_sum_i = 0;
    for (var i=0; i<plot_data.nb_graph; i++) {
      if (plot_data.graph_to_display[i] === true) {
        Shape.createGraphButton(plot_data.graph1_button_x + i*w + text_spacing_sum_i + plot_data.X, y + plot_data.Y, w, h, plot_data.context, plot_data.graph_name_list[i], police, plot_data.graph_colorlist[i], false);
      } else {
        Shape.createGraphButton(plot_data.graph1_button_x + i*w + text_spacing_sum_i + plot_data.X, y + plot_data.Y, w, h, plot_data.context, plot_data.graph_name_list[i], police, plot_data.graph_colorlist[i], true);
      }
      text_spacing_sum_i = text_spacing_sum_i + plot_data.graph_text_spacing_list[i];
    }
  }

  public static disp_button(x, y, w, h, police, plot_data:PlotData) {
    Shape.createButton(x, y, w, h, plot_data.context, 'Disp', police);
  }

  public static merge_button(x, y, w, h, police, plot_data:PlotData) {
    if (plot_data.mergeON) {
      Shape.createButton(x + plot_data.X, y + plot_data.Y, w, h, plot_data.context, 'mergeON', police);
    } else {
      Shape.createButton(x + plot_data.X, y + plot_data.Y, w, h, plot_data.context, 'mergeOFF', police);
    }
  }

  public static perm_window_button(x, y, w, h, police, plot_data:PlotData) {
    if (plot_data.permanent_window) {
      Shape.createButton(x + plot_data.X, y + plot_data.Y, w, h, plot_data.context, 'PermON', police);
    } else {
      Shape.createButton(x + plot_data.X, y + plot_data.Y, w, h, plot_data.context, 'PermOFF', police);
    }
  }

  public static clear_point_button(x, y, w, h, police, plot_data:PlotData) {
    Shape.createButton(x + plot_data.X, y + plot_data.Y, w, h, plot_data.context, 'Clear', police);
  }
}

