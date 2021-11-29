import { PlotData, Buttons, Interactions } from "./plot-data";
import { check_package_version, Attribute, Axis, Sort, set_default_values, TypeOf } from "./utils";
import { PrimitiveGroup } from "./primitives";
import { List, Shape, MyObject } from "./toolbox";
import { Graph2D, Scatter } from "./primitives";
import { string_to_hex, string_to_rgb, rgb_interpolations, rgb_to_string, rgb_to_hex, color_to_string } from "./color_conversion";
import { EdgeStyle, TextStyle, SurfaceStyle } from "./style";


var alert_count = 0;
/** 
 * A class that inherits from PlotData and is specific for drawing PrimitiveGroups.
 */
export class PlotContour extends PlotData {
    plot_datas:any;
    public constructor(public data:any,
                       public width: number,
                       public height: number,
                       public buttons_ON: boolean,
                       public X: number,
                       public Y: number,
                       public canvas_id: string,
                       public is_in_multiplot = false) {
      super(data, width, height, buttons_ON, 0, 0, canvas_id, is_in_multiplot);
      if (!is_in_multiplot) {
        var requirement = '0.6.0';
        check_package_version(data['package_version'], requirement);
      }
      this.plot_datas = [];
      this.type_ = 'primitivegroup';
      var d = this.data;
      if (d['type_'] == 'primitivegroup') { 
        var a = PrimitiveGroup.deserialize(d);
        this.plot_datas.push(a);
        let multiple_labels_index = -1;
        for (let i=0; i<a.primitives.length; i++) {
          let primitive = a.primitives[i];
          if (primitive.type_ === 'multiplelabels') {
            multiple_labels_index = i;
          } else {
            if (isNaN(this.minX)) {this.minX = primitive.minX} else {this.minX = Math.min(this.minX, primitive.minX)};
            if (isNaN(this.maxX)) {this.maxX = primitive.maxX} else {this.maxX = Math.max(this.maxX, primitive.maxX)};
            if (isNaN(this.minY)) {this.minY = primitive.minY} else {this.minY = Math.min(this.minY, primitive.minY)};
            if (isNaN(this.maxY)) {this.maxY = primitive.maxY} else {this.maxY = Math.max(this.maxY, primitive.maxY)};
            if ((primitive.type_ == 'contour') || (primitive.type_ == 'circle')) {
              this.colour_to_plot_data[primitive.mouse_selection_color] = primitive;
            }
          }
        }
        if (multiple_labels_index !== -1) { // So that labels are drawn at last
          a.primitives = List.move_elements(multiple_labels_index, a.primitives.length - 1, a.primitives);
        }
      }
  
      if (buttons_ON) this.refresh_buttons_coords();
      this.plotObject = this.plot_datas[0];
      this.isParallelPlot = false;
      this.interaction_ON = true;
    }
  
    draw() {
      this.draw_from_context(true);
      this.draw_from_context(false);
  
    }
  
    draw_from_context(hidden) {
      this.define_context(hidden);
      this.context.save();
      this.draw_empty_canvas(this.context);
      if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
      this.context.beginPath();
      this.context.rect(this.X-1, this.Y-1, this.width+2, this.height+2);
      this.context.clip();
      this.context.closePath();
      for (let i=0; i<this.plot_datas.length; i++) {
        let d = this.plot_datas[i];
        this.draw_primitivegroup(hidden, this.originX, this.originY, this.scaleX, this.scaleY, d);
      }
  
      if (this.dep_mouse_over) {
        this.draw_mouse_over_rect();
      } else if (this.multiplot_manipulation) {
        this.draw_manipulable_rect();
      }
      
      if (this.zw_bool || (this.isSelecting && !this.permanent_window)) {
        this.draw_zoom_rectangle();
      }
      this.context.restore();
  
      if ((this.buttons_ON) && (this.button_w > 20) && (this.button_h > 10)) {
  
        this.refresh_buttons_coords();
        //Drawing the zooming button
        Buttons.zoom_button(this.button_x, this.zoom_rect_y, this.button_w, this.button_h, this);
  
        //Drawing the button for zooming window selection
        Buttons.zoom_window_button(this.button_x,this.zw_y,this.button_w,this.button_h, this);
  
        //Drawing the reset button
        Buttons.reset_button(this.button_x, this.reset_rect_y, this.button_w, this.button_h, this);
      }
    }
}



/** A class that inherits from PlotData and is specific for drawing ScatterPlots and Graph2Ds 
 */
export class PlotScatter extends PlotData {
    public constructor(public data:any,
      public width: number,
      public height: number,
      public buttons_ON: boolean,
      public X: number,
      public Y: number,
      public canvas_id: string,
      public is_in_multiplot = false) {
        super(data, width, height, buttons_ON, X, Y, canvas_id, is_in_multiplot);
        if (!is_in_multiplot) {
          var requirement = '0.6.0';
          check_package_version(data['package_version'], requirement);
        }
        if (this.buttons_ON) {
          this.refresh_buttons_coords();
        }
        if (data['type_'] == 'graph2d') {
          this.type_ = 'graph2d';
          this.graph_ON = true;
          this.axis_ON = true;
          this.plotObject = Graph2D.deserialize(data);
          this.plot_datas['value'] = this.plotObject.graphs;
          for (let i=0; i<this.plotObject.graphs.length; i++) {
            let graph = this.plotObject.graphs[i];
            this.graph_colorlist.push(graph.point_list[0].point_style.color_fill);
            this.graph_to_display.push(true);
            this.graph_name_list.push(graph.name);
            graph.id = i;
            for (let j=0; j<graph.point_list.length; j++) {
              var point = graph.point_list[j];
              if (isNaN(this.minX)) {this.minX = point.minX} else {this.minX = Math.min(this.minX, point.minX)};
              if (isNaN(this.maxX)) {this.maxX = point.maxX} else {this.maxX = Math.max(this.maxX, point.maxX)};
              if (isNaN(this.minY)) {this.minY = point.minY} else {this.minY = Math.min(this.minY, point.minY)};
              if (isNaN(this.maxY)) {this.maxY = point.maxY} else {this.maxY = Math.max(this.maxY, point.maxY)};
              this.colour_to_plot_data[point.mouse_selection_color] = point;
            }
          }
          this.nb_graph = this.plotObject.graphs.length;
        } else if (data['type_'] == 'scatterplot') {
          this.type_ = 'scatterplot';
          this.axis_ON = true;
          this.mergeON = true;
          this.plotObject = Scatter.deserialize(data);
          this.plot_datas['value'] = [this.plotObject];
          this.pointLength = this.plotObject.point_list[0].size;
          this.scatter_init_points = this.plotObject.point_list;
          this.refresh_MinMax(this.plotObject.point_list);
        }
        this.isParallelPlot = false;
        if (this.mergeON && alert_count === 0) {
          // merge_alert();
        }
    }
  
    draw() {
      this.draw_from_context(false);
      this.draw_from_context(true);
    }
  
    draw_from_context(hidden) {
      this.define_context(hidden);
      this.context.save();
      this.draw_empty_canvas(this.context);
      if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
      this.context.beginPath();
      this.context.rect(this.X-1, this.Y-1, this.width+2, this.height+2);
      this.context.clip();
      this.context.closePath();
      this.draw_graph2D(this.plotObject, hidden, this.originX, this.originY);
      this.draw_scatterplot(this.plotObject, hidden, this.originX, this.originY);
      if (this.permanent_window) {
        this.draw_selection_rectangle();
      }
      if (this.zw_bool || (this.isSelecting && !this.permanent_window)) {
        this.draw_zoom_rectangle();
      }
  
      if ((this.buttons_ON) && (this.button_w > 20) && (this.button_h > 10)) {
        this.refresh_buttons_coords();
  
        //Drawing the zooming button
        Buttons.zoom_button(this.button_x, this.zoom_rect_y, this.button_w, this.button_h, this);
  
        //Drawing the button for zooming window selection
        Buttons.zoom_window_button(this.button_x,this.zw_y,this.button_w,this.button_h, this);
  
        //Drawing the reset button
        Buttons.reset_button(this.button_x, this.reset_rect_y, this.button_w, this.button_h, this);
  
        //Drawing the selection button
        Buttons.selection_button(this.button_x, this.select_y, this.button_w, this.button_h, this);
  
        //Drawing the enable/disable graph button
        Buttons.graph_buttons(this.graph1_button_y, this.graph1_button_w, this.graph1_button_h, '10px Arial', this);
  
        if (this.plotObject.type_ == 'scatterplot') {
          // TODO To check, 'this' in args is weird
          Buttons.merge_button(this.button_x, this.merge_y, this.button_w, this.button_h, '10px Arial', this);
        }
  
        //draw permanent window button
        Buttons.perm_window_button(this.button_x, this.perm_button_y, this.button_w, this.button_h, '10px Arial', this);
  
        //draw clear point button
        Buttons.clear_point_button(this.button_x, this.clear_point_button_y, this.button_w, this.button_h, '10px Arial', this);
      }
      if (this.multiplot_manipulation) {
        this.draw_manipulable_rect();
      }
      this.context.restore();
    }
}


/** A class thtat inherits from PlotData and is specific for drawing ParallelPlots  */
export class ParallelPlot extends PlotData {

    constructor(public data, public width, public height, public buttons_ON, X, Y, public canvas_id: string,
                public is_in_multiplot = false) {
      super(data, width, height, buttons_ON, X, Y, canvas_id, is_in_multiplot);
      if (!is_in_multiplot) {
        var requirement = '0.6.1';
        check_package_version(data['package_version'], requirement);
      }
      this.type_ = 'parallelplot';
      if (this.buttons_ON) {
        this.disp_x = this.width - 35;
        this.disp_y = this.height - 25;
        this.disp_w = 30;
        this.disp_h = 20;
      }
      let default_edge_style = {color_stroke:string_to_rgb('black'), dashline:[], line_width:0.5, name:''};
      let default_dict_ = {edge_style:default_edge_style, disposition: 'vertical', rgbs:[[192, 11, 11], [14, 192, 11], [11, 11, 192]]};
      data = set_default_values(data, default_dict_);
      this.elements = data['elements'];
      this.edge_style = EdgeStyle.deserialize(data['edge_style']);
      var attribute_names = data['attribute_names'];
      if (data['disposition'] == 'vertical') {
        this.vertical = true;
      } else if (data['disposition'] == 'horizontal') {
        this.vertical = false;
      } else {
        throw new Error('Axis disposition must be vertical or horizontal');
      }
      this.initialize_all_attributes();
      this.initialize_attributes_list();
      this.add_to_axis_list(attribute_names);
      this.initialize_data_lists();
      var nb_axis = this.axis_list.length;
      if (nb_axis<=1) {throw new Error('At least 2 axis are required')};
      this.refresh_to_display_list(this.elements);
      this.refresh_all_attributes();
      this.refresh_attribute_booleans();
      this.refresh_axis_bounds(nb_axis);
      this.refresh_axis_coords();
      this.isParallelPlot = true;
      this.rgbs = data['rgbs'];
      this.interpolation_colors = rgb_interpolations(this.rgbs, this.to_display_list.length);
      this.initialize_hexs();
      this.initialize_display_list_to_elements_dict();
      this.refresh_pp_selected();
    }
  
    refresh_pp_buttons_coords() {
      this.disp_x = this.width - 35;
      this.disp_y = this.height - 25;
      this.disp_w = 30;
      this.disp_h = 20;
    }
  
    initialize_display_list_to_elements_dict() {
      this.display_list_to_elements_dict = {};
      for (let i=0; i<this.elements.length; i++) {
        this.display_list_to_elements_dict[i.toString()] = i;
      }
    }
  
    initialize_all_attributes() {
      var attribute_names = Object.getOwnPropertyNames(this.elements[0]);
      var exceptions = ['name', 'package_version', 'object_class'];
      for (let i=0; i<attribute_names.length; i++) {
        if (!(List.is_include(attribute_names[i], exceptions))) {
          let name = attribute_names[i];
          let type_ = TypeOf(this.elements[0][name]);
          this.all_attributes.push(new Attribute(name, type_));
        }
      }
    }
  
    initialize_attributes_list() { //Initialize 'list' and 'alias' of all_attributes's elements'
      for (var i=0; i<this.all_attributes.length; i++) {
        var attribute_name = this.all_attributes[i]['name'];
        this.all_attributes[i]['alias'] = this.all_attributes[i]['name'];
        var type_ = this.all_attributes[i]['type_'];
        if (type_ == 'float') {
          var min = this.elements[0][attribute_name];
          var max = this.elements[0][attribute_name];
          for (var j=0; j<this.elements.length; j++) {
            var elt = this.elements[j][attribute_name];
            if (elt<min) {
              min = elt;
            }
            if (elt>max) {
              max = elt;
            }
          }
          this.all_attributes[i]['list'] = [min, max];
        } else { //ie string
          var list = [];
          for (var j=0; j<this.elements.length; j++) {
            if (type_ == 'color') {
              var elt:any = rgb_to_string(this.elements[j][attribute_name]);
            } else {
              var elt = this.elements[j][attribute_name];
            }
            if (!List.is_include(elt, list)) {
              list.push(elt);
            }
          }
          this.all_attributes[i]['list'] = list;
        }
      }
    }
  
    draw_initial() {
      this.init_scale = 1;
      this.originX = 0;
      this.draw();
    }
  
    draw() {
      this.refresh_axis_bounds(this.axis_list.length);
      this.context = this.context_show;
      this.context.save();
      this.draw_empty_canvas(this.context);
      if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
      this.context.beginPath();
      this.context.rect(this.X-1, this.Y-1, this.width+2, this.height + 2);
      this.context.clip();
      this.context.closePath();
      this.draw_rubber_bands(this.originX);
      var nb_axis = this.axis_list.length;
      this.draw_parallel_coord_lines();
      this.draw_parallel_axis(nb_axis, this.originX);
      if (this.buttons_ON) {
        this.refresh_pp_buttons_coords();
        Buttons.disp_button(this.disp_x + this.X, this.disp_y + this.Y, this.disp_w, this.disp_h, '10px Arial', this);
      }
      if (this.multiplot_manipulation) {
        this.draw_manipulable_rect();
      }
      this.context.restore();
    }
  
  
    draw_from_context(hidden) {};
  
  
    initialize_data_lists() {
      for (let i=0; i<this.axis_list.length; i++) {
        this.inverted_axis_list.push(false);
        this.rubber_bands.push([]);
      }
    }
  
    initialize_hexs() {
      this.hexs = [];
      this.interpolation_colors.forEach(rgb => {
        this.hexs.push(rgb_to_hex(rgb));
      });
    }
}


/** A class that inherits from PlotData and is specific for drawing PrimitiveGroupContainers.  */
export class PrimitiveGroupContainer extends PlotData {
    primitive_groups:PlotContour[]=[];
    layout_mode:string='regular';
    layout_axis:Axis;
    layout_attributes:Attribute[]=[];
    selected_primitive:number=-1;
  
    constructor(public data:any,
                public width: number,
                public height: number,
                public buttons_ON: boolean,
                public X: number,
                public Y: number,
                public canvas_id: string,
                public is_in_multiplot: boolean = false) {
      super(data, width, height, buttons_ON, X, Y, canvas_id, is_in_multiplot);
      if (!is_in_multiplot) {
        var requirement = '0.6.0';
        check_package_version(data['package_version'], requirement);
      }
      this.type_ = 'primitivegroupcontainer';
      var serialized = data['primitive_groups'];
      var initial_coords = data['coords'] || Array(serialized.length).fill([0,0]);
      var initial_sizes = data['sizes'] || Array(serialized.length).fill([560, 300]);
      for (let i=0; i<serialized.length; i++) { // Warning: is_in_multiplot is set to true for primitive groups
        this.primitive_groups.push(new PlotContour(serialized[i], initial_sizes[i][0], initial_sizes[i][1], buttons_ON, X+initial_coords[i][0], Y+initial_coords[i][1], canvas_id, true));
        this.display_order.push(i);
      }
    }
  
  
    define_canvas(canvas_id) {
      super.define_canvas(canvas_id);
      this.initialize_primitive_groups_contexts();
    }
  
    initialize_primitive_groups_contexts() {
      for (let i=0; i<this.primitive_groups.length; i++) {
        this.primitive_groups[i].context_hidden = this.context_hidden;
        this.primitive_groups[i].context_show = this.context_show;
      }
    }
  
    reinitialize_all() {
      this.elements_dict = {};
      this.primitive_dict = {};
      this.primitive_groups = [];
      this.display_order = [];
    }
  
    refresh_buttons_coords() {
      this.button_w = 40;
      this.button_h = 20;
      this.button_y = this.height - 5 - this.button_h + this.Y;
      this.manip_button_x = 5 + this.X;
      this.reset_button_x = this.manip_button_x + this.button_w + 5;
    }
  
    draw_buttons() {
      this.refresh_buttons_coords();
      this.draw_manipulation_button();
      this.draw_reset_button();
    }
  
  
    draw_manipulation_button() {
      if (this.manipulation_bool) {
        Shape.createButton(this.manip_button_x, this.button_y, this.button_w, this.button_h, this.context, 'ON', '10px sans-serif');
      } else {
        Shape.createButton(this.manip_button_x, this.button_y, this.button_w, this.button_h, this.context, 'OFF', '10px sans-serif');
      }
    }
  
    draw_reset_button() {
      Shape.createButton(this.reset_button_x, this.button_y, this.button_w, this.button_h, this.context, 'reset', '10px sans-serif');
    }
  
    click_on_button_check(mouse1X, mouse1Y) {
      if (Shape.isInRect(mouse1X, mouse1Y, this.manip_button_x, this.button_y, this.button_w, this.button_h)) {
        this.click_on_manipulation_action();
      } else if (Shape.isInRect(mouse1X, mouse1Y, this.reset_button_x, this.button_y, this.button_w, this.button_h)) {
        this.reset_action();
      }
    }
  
    click_on_manipulation_action() {
      this.manipulation_bool = !this.manipulation_bool;
      for (let i=0; i<this.primitive_groups.length; i++) {
        this.primitive_groups[i].multiplot_manipulation = this.manipulation_bool;
      }
      if (this.manipulation_bool) {
        this.setAllInteractionsToOff();
      }
    }
  
    reset_action() {
      if (this.primitive_groups.length !== 0) {
        if (this.layout_mode == 'regular') {
          this.regular_layout();
        } else {
          if (this.primitive_groups.length >= 1) this.reset_scales();
        }
      }
    }
  
    reset_sizes() {
      var nb_primitives = this.primitive_groups.length;
      if (nb_primitives === 1) {
        var primitive_width = this.width/3;
        var primitive_height = this.height/3;
      } else {
        var primitive_width = this.width/(1.2*nb_primitives);
        var primitive_height = this.height/(1.2*nb_primitives);
      }
      for (let i=0; i<nb_primitives; i++) {
        let center_x = this.primitive_groups[i].X + this.primitive_groups[i].width/2;
        let center_y = this.primitive_groups[i].Y + this.primitive_groups[i].height/2;
        this.primitive_groups[i].width = primitive_width;
        this.primitive_groups[i].height = primitive_height;
        this.primitive_groups[i].X = center_x - primitive_width/2;
        this.primitive_groups[i].Y = center_y - primitive_height/2;
      }
    }
  
    refresh_MinMax() {
      this.minX = Infinity; this.maxX = -Infinity; this.minY = Infinity; this.maxY = -Infinity;
      for (let primitive of this.primitive_groups) {
        this.minX = Math.min(this.minX, primitive.X);
        this.maxX = Math.max(this.maxX, primitive.X + primitive.width);
        this.minY = Math.min(this.minY, primitive.Y);
        this.maxY = Math.max(this.maxY, primitive.Y + primitive.height);
      }
    }
  
    refresh_spacing() {
      var zoom_coeff_x = (this.width - this.decalage_axis_x)/(this.maxX - this.minX);
      var container_center_x = this.X + this.width/2;
      for (let i=0; i<this.primitive_groups.length; i++) {
        let primitive_center_x = this.primitive_groups[i].X + this.primitive_groups[i].width/2;
        primitive_center_x = container_center_x + zoom_coeff_x*(primitive_center_x - container_center_x);
        this.primitive_groups[i].X = primitive_center_x - this.primitive_groups[i].width/2;
      }
      this.scaleX = this.scaleX*zoom_coeff_x;
      this.originX = this.width/2 + zoom_coeff_x * (this.originX - this.width/2);
      this.scroll_x = 0;
      this.refresh_MinMax();
      
  
      if (this.layout_mode === 'two_axis') { // Then the algo does the same with the y-axis
        let zoom_coeff_y = (this.height - this.decalage_axis_y)/(this.maxY - this.minY);
        var container_center_y = this.Y + this.height/2;
        for (let i=0; i<this.primitive_groups.length; i++) {
          let primitive_center_y = this.primitive_groups[i].Y + this.primitive_groups[i].height/2;
          primitive_center_y = container_center_y + zoom_coeff_y*(primitive_center_y - container_center_y);
          this.primitive_groups[i].Y = primitive_center_y - this.primitive_groups[i].height/2;
        }
        this.scaleY = this.scaleY*zoom_coeff_y;
        this.originY = this.height/2 + zoom_coeff_y * (this.originY - this.height/2);
        this.scroll_y = 0;
      }
      
      this.resetAllObjects();
    }
  
    translate_inside_canvas() {
      if (this.layout_mode == 'one_axis') {
        this.translateAllPrimitives(-this.minX + this.X, this.height/2 - this.minY + this.Y);
      } else if (this.layout_mode == 'two_axis') {
        this.translateAllPrimitives(this.decalage_axis_x - this.minX + this.X, -this.minY + this.Y);
      }
      this.draw();
    }
  
    reset_scales() {
      this.reset_sizes();
      if (this.primitive_groups.length >= 2) {
        this.refresh_MinMax();
        for (let i=0; i<10; i++) {
          this.refresh_spacing();
        }
      }
      else if (this.primitive_groups.length === 1) Interactions.click_on_reset_action(this.primitive_groups[0]);
      this.refresh_MinMax();
      this.translate_inside_canvas();
    }
  
    draw_initial() {
      for (let i=0; i<this.primitive_groups.length; i++) {
        this.primitive_groups[i].draw_initial();
      }
    }
  
    draw() {
      if (this.clickedPlotIndex != -1) {
        let old_index = List.get_index_of_element(this.clickedPlotIndex, this.display_order);
        this.display_order = List.move_elements(old_index, this.display_order.length - 1, this.display_order);
      }
      this.context = this.context_show;
      this.context.save();
      this.draw_empty_canvas(this.context);
      if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
      this.context.clip(this.context.rect(this.X-1, this.Y-1, this.width+2, this.height+2));
      if (this.width > 100 && this.height > 100) {
        this.draw_layout_axis();
        if (this.layout_mode !== 'regular') {
          this.draw_coordinate_lines();
        }
        for (let index of this.display_order) {
          this.primitive_groups[index].draw();
        }
      }
  
      if (this.multiplot_manipulation) { 
        this.draw_manipulable_rect(); 
      } else { 
        this.context.strokeStyle = this.initial_rect_color_stroke;
        this.context.lineWidth = this.initial_rect_line_width;
        this.context.strokeRect(this.X, this.Y, this.width, this.height); 
      }
      if (this.buttons_ON) { this.draw_buttons(); }
      this.context.restore();
    }
  
  
    draw_from_context(hidden) {}
  
  
    redraw_object() {
      this.store_datas();
      this.draw_empty_canvas(this.context);
      for (let display_index of this.display_order) {
        let obj = this.primitive_groups[display_index];
        if (display_index == this.clickedPlotIndex) {
          this.primitive_groups[display_index].draw();
        } else {
           this.context_show.putImageData(this.shown_datas[display_index], obj.X, obj.Y);
           this.context_hidden.putImageData(this.hidden_datas[display_index], obj.X, obj.Y);
        }
      }
      if (this.buttons_ON) { this.draw_buttons(); }
    }
  
    store_datas() {
      this.shown_datas = []; this.hidden_datas = [];
      for (let i=0; i<this.primitive_groups.length; i++) {
        let obj = this.primitive_groups[i];
        this.shown_datas.push(this.context_show.getImageData(obj.X, obj.Y, obj.width, obj.height));
        this.hidden_datas.push(this.context_hidden.getImageData(obj.X, obj.Y, obj.width, obj.height));
      }
    }
  
    draw_coordinate_lines() {
      this.context.lineWidth = 0.5;
      this.context.setLineDash([5,5]);
      this.context.strokeStyle = string_to_hex('grey');
      if (this.layout_mode == 'one_axis') {
        for (let primitive of this.primitive_groups) {
          let x = primitive.X + primitive.width/2;
          let y = primitive.Y + primitive.height;
          Shape.drawLine(this.context, [[x,y], [x, this.height - this.decalage_axis_y + this.Y]]);
        }
      } else if (this.layout_mode == 'two_axis') {
        for (let primitive of this.primitive_groups) {
          let x = primitive.X + primitive.width/2;
          let y = primitive.Y + primitive.height/2;
          Shape.drawLine(this.context, [[this.decalage_axis_x + this.X, y], [x, y], [x, this.height - this.decalage_axis_y + this.Y]]);
        }
      }
      this.context.stroke();
      this.context.setLineDash([]);
    }
  
  
    /**
     * Calls the layout function of a PrimitiveGroupContainer whose layout_mode and axis are already set.
     */
    refresh_layout() { 
      if (this.layout_mode === 'one_axis') {
        this.multiplot_one_axis_layout(this.layout_attributes[0]);
      } else if (this.layout_mode === 'two_axis') {
        this.multiplot_two_axis_layout(this.layout_attributes);
      }
    }
  
  
    add_primitive_group(serialized, point_index) {
      var new_plot_data = new PlotContour(serialized, 560, 300, this.buttons_ON, this.X, this.Y, this.canvas_id);
      new_plot_data.context_hidden = this.context_hidden; 
      new_plot_data.context_show = this.context_show;
      this.primitive_groups.push(new_plot_data);
      this.display_order.push(this.primitive_groups.length - 1);
      new_plot_data.draw_initial();
      new_plot_data.mouse_interaction(new_plot_data.isParallelPlot);
      new_plot_data.interaction_ON = false;
      this.primitive_dict[point_index.toString()] = this.primitive_groups.length - 1;
      this.refresh_layout();
      this.reset_action();
      this.draw();
    } 
  
  
    remove_primitive_group(point_index) {
      var primitive_index = this.primitive_dict[point_index.toString()];
      this.primitive_groups = List.remove_at_index(primitive_index, this.primitive_groups);
      this.display_order = List.remove_element(primitive_index, this.display_order);
      this.primitive_dict = MyObject.removeEntries([point_index.toString()], this.primitive_dict);
      this.elements_dict = MyObject.removeEntries([primitive_index.toString()], this.elements_dict);
      var keys = Object.keys(this.primitive_dict);
      for (let key of keys) {
        if (this.primitive_dict[key] > primitive_index) {
          this.primitive_dict[key]--;
        }
      }
      for (let i=0; i<this.display_order.length; i++) {
        if (this.display_order[i] > primitive_index) {
          this.display_order[i]--;
        }
      }
      var elements_entries = Object.entries(this.elements_dict);
      for (let i=0; i<elements_entries.length; i++) {
        if (Number(elements_entries[i][0]) > primitive_index) {
          elements_entries[i][0] = (Number(elements_entries[i][0]) - 1).toString();
        }
      }
      this.elements_dict = Object.fromEntries(elements_entries);
      this.reset_action();
      this.draw();
    }
  
  
    setAllInteractionsToOff() {
      for (let i=0; i<this.primitive_groups.length; i++) {
        this.primitive_groups[i].interaction_ON = false;
      }
    }
  
  
    manage_mouse_interactions(selected_primitive:number):void {
      for (let i=0; i<this.primitive_groups.length; i++) {
        if (i == selected_primitive) {
          this.primitive_groups[i].interaction_ON = true;
        } else {
          this.primitive_groups[i].interaction_ON = false;
        }
      }
    }
  
  
    get_selected_primitive(mouse2X, mouse2Y) {
      var selected_index = -1;
      for (let index of this.display_order) {
        let prim = this.primitive_groups[index];
        if (Shape.isInRect(mouse2X, mouse2Y, prim.X, prim.Y, prim.width, prim.height)) {
          selected_index = index;
        }
      }
      return selected_index;
    }
  
  
    draw_layout_axis() {
      if (this.primitive_groups.length !== 0) {
        if (this.layout_mode == 'one_axis') {
          this.layout_axis.draw_sc_horizontal_axis(this.context, this.originX, this.scaleX, this.width, this.height,
              this.init_scaleX, this.layout_attributes[0].list, this.layout_attributes[0], this.scroll_x, this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.width);
        } else if (this.layout_mode == 'two_axis') {
          this.layout_axis.draw_sc_horizontal_axis(this.context, this.originX, this.scaleX, this.width, this.height,
            this.init_scaleX, this.layout_attributes[0].list, this.layout_attributes[0], this.scroll_x, this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.width);
  
          this.layout_axis.draw_sc_vertical_axis(this.context, this.originY, this.scaleY, this.width, this.height, this.init_scaleY, this.layout_attributes[1].list,
            this.layout_attributes[1], this.scroll_y, this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.height);
  
        }
      }
    }
  
  
    regular_layout():void {
      var big_coord = 'X';
      var small_coord = 'Y';
      var big_length = 'width';
      var small_length = 'height';
      if (this.width < this.height) {
        [big_coord, small_coord, big_length, small_length] = [small_coord, big_coord, small_length, big_length];
      }
      var sorted_list = this.getSortedList();
      var nb_primitives = this.primitive_groups.length;
      let small_length_nb_objects = Math.min(Math.ceil(nb_primitives/2), Math.floor(Math.sqrt(nb_primitives)));
      let big_length_nb_objects = Math.ceil(nb_primitives/small_length_nb_objects);
      let big_length_step = this[big_length]/big_length_nb_objects;
      let small_length_step = this[small_length]/small_length_nb_objects;
      for (let i=0; i<big_length_nb_objects - 1; i++) {
        for (let j=0; j<small_length_nb_objects; j++) {
          var current_index = i*small_length_nb_objects + j; //current_index in sorted_list
          this.primitive_groups[sorted_list[current_index]][big_coord] = i*big_length_step + this[big_coord];
          this.primitive_groups[sorted_list[current_index]][small_coord] = j*small_length_step + this[small_coord];
          this.primitive_groups[sorted_list[current_index]][big_length] = big_length_step;
          this.primitive_groups[sorted_list[current_index]][small_length] = small_length_step;
        }
      }
      let last_index = current_index + 1;
      let remaining_obj = nb_primitives - last_index;
      let last_small_length_step = this[small_length]/remaining_obj;
      for (let j=0; j<remaining_obj; j++) {
        this.primitive_groups[sorted_list[last_index + j]][big_coord] = (big_length_nb_objects - 1)*big_length_step + this[big_coord];
        this.primitive_groups[sorted_list[last_index + j]][small_coord] = j*last_small_length_step + this[small_coord];
        this.primitive_groups[sorted_list[last_index + j]][big_length] = big_length_step;
        this.primitive_groups[sorted_list[last_index + j]][small_length] = last_small_length_step;
      }
      this.resetAllObjects();
      this.draw();
    }
  
  
    getSortedList() {
      var big_coord = 'X';
      var small_coord = 'Y';
      if (this.width < this.height) {[big_coord, small_coord] = [small_coord, big_coord];}
      var sort = new Sort();
      var sortedObjectList = sort.sortObjsByAttribute(this.primitive_groups, big_coord);
      var sorted_list = [];
      var nb_primitives = this.primitive_groups.length;
      for (let i=0; i<nb_primitives; i++) {
        let sorted_index = List.get_index_of_element(sortedObjectList[i], this.primitive_groups);
        sorted_list.push(sorted_index); 
      }
      var sortedDisplayedObjectList = [];
      for (let i=0; i<sorted_list.length; i++) {
        sortedDisplayedObjectList.push(this.primitive_groups[sorted_list[i]]);
      }
      var j = 0;
      while (j<sorted_list.length - 1) {
        if (sortedDisplayedObjectList[j+1][small_coord] < sortedDisplayedObjectList[j][small_coord]) {
          List.switchElements(sorted_list, j, j+1);
        }
        j = j+2;
      }
      return sorted_list;
    }
  
    initialize_list(attribute:Attribute) {
      var elements_dict_values = Object.values(this.elements_dict);
      var value = [];
      var name = attribute.name;
      let type_ = attribute.type_;
      if (type_ == 'float') {
        let min = elements_dict_values[0][name];
        let max = elements_dict_values[0][name];
        for (let j=0; j<elements_dict_values.length; j++) {
          let elt = elements_dict_values[j][name];
          if (elt>max) {
            max = elt;
          }
          if (elt<min) {
            min = elt;
          }
        }
        if (min === max) {
          if (min < 0) return [2*min, 0];
          else if (min === 0) return [-1, 1];
          else return [0, 2*min];
        }
        return [min, max];
      } else if (type_ == 'color') {
        var list = []
        for (let j=0; j<elements_dict_values.length; j++) {
          let elt_color = rgb_to_string(elements_dict_values[j][name]);
          if (!List.is_include(elt_color, value)) {
            value.push(elt_color);
          }
        }
        return value;
      } else {
        for (let j=0; j<elements_dict_values.length; j++) {
          let elt = elements_dict_values[j][name].toString();
          if (!List.is_include(elt, value)) {
            value.push(elt);
          }
        }
        return value;
      } 
    }
  
    is_element_dict_empty() {
      return Object.keys(this.elements_dict).length === 0;
    }
  
    multiplot_one_axis_layout(attribute:Attribute) {
      this.refresh_one_axis_layout_list(attribute);
      this.one_axis_layout();
    }
  
    refresh_one_axis_layout_list(attribute:Attribute) {
      this.layout_mode = 'one_axis';
      if (!this.is_element_dict_empty()) {
        attribute.list = this.initialize_list(attribute);
      }
      this.layout_attributes = [attribute];
    }
  
  
    one_axis_layout() {
      var graduation_style = new TextStyle(string_to_rgb('grey'), 12, 'sans-serif', 'center', 'alphabetic');
      var axis_style = new EdgeStyle(0.5, string_to_rgb('lightgrey'), [], '');
      var serialized_axis = {graduation_style: graduation_style, axis_style: axis_style, grid_on: false};
      this.layout_axis = Axis.deserialize(serialized_axis);
      var nb_primitive_groups = this.primitive_groups.length;
      var name = this.layout_attributes[0].name;
      var type_ = this.layout_attributes[0].type_;
      this.scaleX = 1; this.scaleY = 1;
      this.originX = 0; this.originY = 0;
      if (type_ !== 'float') {
        var real_xs = [];
        var y_incs = Array(nb_primitive_groups).fill(0);
      }
      for (let i=0; i<nb_primitive_groups; i++) {
        this.primitive_groups[i].width = this.width/(1.2*nb_primitive_groups);
        this.primitive_groups[i].height = this.height/(1.2*nb_primitive_groups);
        if (this.layout_attributes[0].type_ == 'float') {
          var real_x = this.elements_dict[i.toString()][name];
        } else if (this.layout_attributes[0].type_ == 'color') {
          real_x = List.get_index_of_element(rgb_to_string(this.elements_dict[i.toString()][name]), this.layout_attributes[0].list);
          if (List.is_include(real_x, real_xs)) { y_incs[i] += - this.primitive_groups[i].height; } else {real_xs.push(real_x);}
  
        } else {
          real_x = List.get_index_of_element(this.elements_dict[i.toString()][name], this.layout_attributes[0].list);
          if (List.is_include(real_x, real_xs)) {y_incs[i] += - this.primitive_groups[i].height;} else {real_xs.push(real_x);}
        }
        var center_x = this.scaleX*real_x + this.originX;
        this.primitive_groups[i].X = this.X + center_x - this.primitive_groups[i].width/2;
        this.primitive_groups[i].Y = this.Y + this.height/2 - this.primitive_groups[i].height/2;
        if (type_ !== 'float') this.primitive_groups[i].Y += y_incs[i];
      }
      if (this.primitive_groups.length >= 1) this.reset_scales();
      this.resetAllObjects();
      this.draw();
    }
  
    refresh_two_axis_layout_list(attributes:Attribute[]) {
      this.layout_mode = 'two_axis';
      if (!this.is_element_dict_empty()) {
        attributes[0].list = this.initialize_list(attributes[0]);
        attributes[1].list = this.initialize_list(attributes[1]);
      }
      this.layout_attributes = attributes;
    }
  
    multiplot_two_axis_layout(attributes:Attribute[]) {
      this.refresh_two_axis_layout_list(attributes);
      this.two_axis_layout();
    }
  
  
    two_axis_layout() {
      var graduation_style = new TextStyle(string_to_rgb('grey'), 12, 'sans-serif', 'center', 'alphabetic');
      var axis_style = new EdgeStyle(0.5, string_to_rgb('lightgrey'), [], '');
      var serialized_axis = {graduation_style: graduation_style, axis_style: axis_style, grid_on: false};
      this.layout_axis = Axis.deserialize(serialized_axis);
      var nb_primitive_groups = this.primitive_groups.length;
      this.scaleX = 1; this.scaleY = 1;
      this.originX = 0; this.originY = 0;
      for (let i=0; i<nb_primitive_groups; i++) {
        this.primitive_groups[i].width = this.width/(1.2*nb_primitive_groups);
        this.primitive_groups[i].height = this.height/(1.2*nb_primitive_groups);
        if (this.layout_attributes[0].type_ == 'float') {
          var real_x = this.elements_dict[i.toString()][this.layout_attributes[0].name];
        } else if (this.layout_attributes[0].type_ == 'color') {
          let value = rgb_to_string(this.elements_dict[i.toString()][this.layout_attributes[0].name]);
          real_x = List.get_index_of_element(value, this.layout_attributes[0].list);
        } else {
          real_x = List.get_index_of_element(this.elements_dict[i.toString()][this.layout_attributes[0].name], this.layout_attributes[0].list);
        }
        var center_x = this.scaleX*real_x + this.originX;
        this.primitive_groups[i].X = this.X + center_x - this.primitive_groups[i].width/2;
  
        if (this.layout_attributes[1].type_ == 'float') {
          var real_y = this.elements_dict[i.toString()][this.layout_attributes[1].name];
        } else if (this.layout_attributes[1].type_ == 'color') {
          let value = rgb_to_string(this.elements_dict[i.toString()][this.layout_attributes[1].name]);
          real_y = List.get_index_of_element(value, this.layout_attributes[1].list);
        } else {
          real_y = List.get_index_of_element(this.elements_dict[i.toString()][this.layout_attributes[1].name], this.layout_attributes[1].list);
        }
        var center_y = -this.scaleX*real_y + this.originY;
        this.primitive_groups[i].Y = this.Y + center_y - this.primitive_groups[i].height/2;
      }
      if (this.primitive_groups.length >= 2) this.reset_scales();
      this.resetAllObjects();
      this.draw();
    }
  
    translatePrimitive(index, tx, ty) {
      this.primitive_groups[index].X = this.primitive_groups[index].X + tx;
      this.primitive_groups[index].Y = this.primitive_groups[index].Y + ty;
    }
  
    translateAllPrimitives(tx, ty) {
      for (let i=0; i<this.primitive_groups.length; i++) {
        this.translatePrimitive(i, tx, ty);
      }
      this.originX = this.originX + tx;
      this.originY = this.originY + ty;
    }
  
  
    resetAllObjects() {
      for (let i=0; i<this.primitive_groups.length; i++) {
        this.primitive_groups[i].reset_scales();
      }
    }
  
    zoom_elements(mouse3X:number, mouse3Y:number, event:number) {
      if ((this.layout_mode !== 'regular') && (Shape.isInRect(mouse3X, mouse3Y, this.X + this.decalage_axis_x,
        this.height - this.decalage_axis_y + this.Y, this.width - this.decalage_axis_x, this.height - this.decalage_axis_y))) {
          this.x_zoom_elements(event);
      } else if ((this.layout_mode == 'two_axis') && (Shape.isInRect(mouse3X, mouse3Y, this.X, this.Y, this.decalage_axis_x,
        this.height - this.decalage_axis_y))) {
          this.y_zoom_elements(event);
      } else {
        this.regular_zoom_elements(mouse3X, mouse3Y, event);
      }
    }
  
    regular_zoom_elements(mouse3X, mouse3Y, event) {
      if (event > 0) {
        var zoom_coeff = 1.1;
      } else {
        var zoom_coeff = 1/1.1;
      }
      for (let i=0; i<this.primitive_groups.length; i++) {
        this.primitive_groups[i].X = mouse3X + zoom_coeff*(this.primitive_groups[i].X - mouse3X);
        this.primitive_groups[i].Y = mouse3Y + zoom_coeff*(this.primitive_groups[i].Y - mouse3Y);
        this.primitive_groups[i].width = this.primitive_groups[i].width*zoom_coeff;
        this.primitive_groups[i].height = this.primitive_groups[i].height*zoom_coeff;
      }
      this.resetAllObjects();
      this.scaleX = this.scaleX*zoom_coeff; this.scaleY = this.scaleY*zoom_coeff;
      this.originX = mouse3X - this.X + zoom_coeff * (this.originX - mouse3X + this.X);
      this.originY = mouse3Y - this.Y + zoom_coeff * (this.originY - mouse3Y + this.Y);
      this.draw();
    }
  
    x_zoom_elements(event) {
      if (event > 0) {
        var zoom_coeff = 1.1;
      } else {
        zoom_coeff = 1/1.1;
      }
      var container_center_x = this.X + this.width/2;
      for (let i=0; i<this.primitive_groups.length; i++) {
        let primitive_center_x = this.primitive_groups[i].X + this.primitive_groups[i].width/2;
        primitive_center_x = container_center_x + zoom_coeff*(primitive_center_x - container_center_x);
        this.primitive_groups[i].X = primitive_center_x - this.primitive_groups[i].width/2;
      }
      this.resetAllObjects();
      this.scaleX = this.scaleX*zoom_coeff;
      this.originX = this.width/2 + zoom_coeff * (this.originX - this.width/2);
      this.draw();
    }
  
    y_zoom_elements(event) {
      if (event > 0) {
        var zoom_coeff = 1.1;
      } else {
        zoom_coeff = 1/1.1;
      }
      var container_center_y = this.Y + this.height/2;
      for (let i=0; i<this.primitive_groups.length; i++) {
        let primitive_center_y = this.primitive_groups[i].Y + this.primitive_groups[i].height/2;
        primitive_center_y = container_center_y + zoom_coeff*(primitive_center_y - container_center_y);
        this.primitive_groups[i].Y = primitive_center_y - this.primitive_groups[i].height/2;
      }
      this.resetAllObjects();
      this.scaleY = this.scaleY*zoom_coeff;
      this.originY = this.height/2 + zoom_coeff * (this.originY - this.height/2);
      this.draw();
    }
  
    manage_scroll(mouse3X, mouse3Y, event) {
      if ((this.layout_mode !== 'regular') && (Shape.isInRect(mouse3X, mouse3Y, this.X + this.decalage_axis_x,
        this.height - this.decalage_axis_y + this.Y, this.width - this.decalage_axis_x, this.height - this.decalage_axis_y))) {
          this.scroll_x = this.scroll_x + event;
      } else if ((this.layout_mode == 'two_axis') && (Shape.isInRect(mouse3X, mouse3Y, this.X, this.Y, this.decalage_axis_x,
        this.height - this.decalage_axis_y))) {
          this.scroll_y = this.scroll_y + event;
      } else {
        this.scroll_x = this.scroll_x + event;
        this.scroll_y = this.scroll_y + event;
      }
      if (isNaN(this.scroll_x)) this.scroll_x = 0;
      if (isNaN(this.scroll_y)) this.scroll_y = 0;
    }
  
    delete_unwanted_vertex(vertex_infos) {
      var i = 0;
      while (i < vertex_infos.length) {
        let to_delete = false;
        if (this.clickedPlotIndex != vertex_infos[i].index) {
          let j = 0;
          let cpi_vertex = false;
          while (j<vertex_infos.length) {
            if ((vertex_infos[j].index == this.clickedPlotIndex)) {
              cpi_vertex = true;
              break;
            }
            j++;
          }
          to_delete = !cpi_vertex;
        }
        if (to_delete) {
          vertex_infos = List.remove_at_index(i, vertex_infos);
        } else {
          i++;
        }
      }
      return vertex_infos;
    }
  
    initialize_clickOnVertex(mouse1X, mouse1Y):[boolean, Object] {
      var thickness = 15;
      var vertex_infos = [];
      for (let i=0; i<this.primitive_groups.length; i++) {
        let obj:PlotData = this.primitive_groups[this.display_order[i]];
        let up = Shape.isInRect(mouse1X, mouse1Y, obj.X - thickness*1/3, obj.Y - thickness*1/3, obj.width + thickness*2/3, thickness);
        let down = Shape.isInRect(mouse1X, mouse1Y, obj.X - thickness*1/3, obj.Y + obj.height - thickness*2/3, obj.width + thickness*2/3, thickness);
        let left = Shape.isInRect(mouse1X, mouse1Y, obj.X - thickness*1/3, obj.Y - thickness*1/3, thickness, obj.height + thickness*2/3);
        let right = Shape.isInRect(mouse1X, mouse1Y, obj.X + obj.width - thickness*2/3, obj.Y - thickness*1/3, thickness, obj.height + thickness*2/3);
        var clickOnVertex_i = up || down || left || right;
        if (clickOnVertex_i) {
          vertex_infos.push({'index': this.display_order[i], 'up': up, 'down': down, 'left':left, 'right': right});
        }
      }
      vertex_infos = this.delete_unwanted_vertex(vertex_infos);
      var clickOnVertex = !(vertex_infos.length == 0);
      return [clickOnVertex, vertex_infos];
    }
  
    resizeObject(vertex_infos, deltaX, deltaY):void {
      var widthSizeLimit = 100;
      var heightSizeLimit = 100;
      for (let i=0; i<vertex_infos.length; i++) {
        let vertex_object_index = vertex_infos[i].index;
        if (vertex_infos[i].up === true) {
          if (this.primitive_groups[vertex_object_index].height - deltaY > heightSizeLimit) {
            this.primitive_groups[vertex_object_index].Y = this.primitive_groups[vertex_object_index].Y + deltaY;
            this.primitive_groups[vertex_object_index].height = this.primitive_groups[vertex_object_index].height - deltaY;
          } else {
            this.primitive_groups[vertex_object_index].height = heightSizeLimit;
          }
        }
        if (vertex_infos[i].down === true) {
          if (this.primitive_groups[vertex_object_index].height + deltaY > heightSizeLimit) {
            this.primitive_groups[vertex_object_index].height = this.primitive_groups[vertex_object_index].height + deltaY;
          } else {
            this.primitive_groups[vertex_object_index].height = heightSizeLimit;
          }
        }
        if (vertex_infos[i].left === true) {
          if (this.primitive_groups[vertex_object_index].width - deltaX > widthSizeLimit) {
            this.primitive_groups[vertex_object_index].X = this.primitive_groups[vertex_object_index].X + deltaX;
            this.primitive_groups[vertex_object_index].width = this.primitive_groups[vertex_object_index].width - deltaX;
          } else {
            this.primitive_groups[vertex_object_index].width = widthSizeLimit;
          }
        }
        if (vertex_infos[i].right === true) {
          if (this.primitive_groups[vertex_object_index].width + deltaX > widthSizeLimit) {
            this.primitive_groups[vertex_object_index].width = this.primitive_groups[vertex_object_index].width + deltaX;
          } else {
            this.primitive_groups[vertex_object_index].width = widthSizeLimit;
          }
        }
      }
      this.draw();
    }
  
    reorder_resize_style(resize_style) {
      var resize_dict = ['n', 'ns', 'ne', 'nwse', 'nw', 'e', 'ew', 's', 'se', 'sw', 'w'];
      for (let i=0; i<resize_dict.length; i++) {
        if (resize_style.split('').sort().join() === resize_dict[i].split('').sort().join()) {
          resize_style = resize_dict[i];
          break;
        }
      }
      return resize_style;
    }
  
    setCursorStyle(mouse2X, mouse2Y, canvas, selected_primitive):void {
      if (selected_primitive != -1) {
        var thickness = 15;
        var resize_style:any = '';
        for (let i=0; i<this.primitive_groups.length; i++) {
          let obj:PlotData = this.primitive_groups[i];
          let up = Shape.isInRect(mouse2X, mouse2Y, obj.X - thickness*1/3, obj.Y - thickness*1/3, obj.width + thickness*2/3, thickness);
          let down = Shape.isInRect(mouse2X, mouse2Y, obj.X - thickness*1/3, obj.Y + obj.height - thickness*2/3, obj.width + thickness*2/3, thickness);
          let left = Shape.isInRect(mouse2X, mouse2Y, obj.X - thickness*1/3, obj.Y - thickness*1/3, thickness, obj.height + thickness*2/3);
          let right = Shape.isInRect(mouse2X, mouse2Y, obj.X + obj.width - thickness*2/3, obj.Y - thickness*1/3, thickness, obj.height + thickness*2/3);
          if (up && !resize_style.includes('n')) {resize_style = resize_style + 'n';}
          if (down && !resize_style.includes('s')) {resize_style = resize_style + 's';}
          if (left && !resize_style.includes('w')) {resize_style = resize_style + 'w';}
          if (right && !resize_style.includes('e')) {resize_style = resize_style + 'e';}
        }
        if (resize_style == '') {
          canvas.style.cursor = 'default';
        } else {
          resize_style = this.reorder_resize_style(resize_style);
          canvas.style.cursor = resize_style + '-resize';
        }
      } else {
        canvas.style.cursor = 'default';
      }
      this.draw();
    }
  
  
    mouse_interaction() {
      var mouse1X=0; var mouse1Y=0; var mouse2X=0; var mouse2Y=0; var mouse3X=0; var mouse3Y=0;
      var nbObjects:number = this.primitive_groups.length;
      var canvas = document.getElementById(this.canvas_id);
      // var selected_primitive:number = -1;
      var last_selected_primitive = -1;
      var isDrawing = false;
      var vertex_infos:Object;
      var clickOnVertex:boolean = false;
  
      for (let i=0; i<nbObjects; i++) {
        this.primitive_groups[i].mouse_interaction(this.primitive_groups[i].isParallelPlot);
      }
      this.setAllInteractionsToOff();
  
      canvas.addEventListener('mousedown', e => {
        isDrawing = true;
        if (this.interaction_ON) {
          mouse1X = e.offsetX; mouse1Y = e.offsetY;
          this.click_on_button_check(mouse1X, mouse1Y);
          this.clickedPlotIndex = this.get_selected_primitive(mouse1X, mouse1Y);
          if (this.manipulation_bool) {
            if (this.clickedPlotIndex != -1) {
              [clickOnVertex, vertex_infos] = this.initialize_clickOnVertex(mouse1X, mouse1Y);
            } else {
              clickOnVertex = false;
            }
          }
        }
      });
  
      canvas.addEventListener('mousemove', e => {
        if (this.interaction_ON) {
          var old_mouse2X = mouse2X; var old_mouse2Y = mouse2Y;
          mouse2X = e.offsetX, mouse2Y = e.offsetY;
          this.selected_primitive = this.get_selected_primitive(mouse2X, mouse2Y);
          if (this.manipulation_bool) {
            if (isDrawing) {
              if ((this.clickedPlotIndex == -1) || (this.layout_mode !== 'regular')) {
                this.translateAllPrimitives(mouse2X - old_mouse2X, mouse2Y - old_mouse2Y);
                this.draw();
              } else {
                if (clickOnVertex) {
                  this.resizeObject(vertex_infos, mouse2X - old_mouse2X, mouse2Y - old_mouse2Y);
                } else {
                  this.translatePrimitive(this.clickedPlotIndex, mouse2X - old_mouse2X, mouse2Y - old_mouse2Y);
                  this.draw();
                }
              }
            } else {
              if (this.layout_mode === 'regular') {
                this.setCursorStyle(mouse2X, mouse2Y, canvas, this.selected_primitive);
              }
            }
          } else {
            if (this.selected_primitive !== last_selected_primitive) {
              this.manage_mouse_interactions(this.selected_primitive);
            }
            last_selected_primitive = this.selected_primitive;
          }
        } else {
          isDrawing = false;
        }
      });
  
      canvas.addEventListener('mouseup', e => {
        if (this.interaction_ON) {
          isDrawing = false;
          this.draw();
        }
      });
  
      canvas.addEventListener('wheel', e => {
        if (this.interaction_ON) {
          e.preventDefault();
          mouse3X = e.offsetX; mouse3Y = e.offsetY;
          if (this.manipulation_bool) {
            var event = -e.deltaY/Math.abs(e.deltaY);
            this.manage_scroll(mouse3X, mouse3Y, event);
            this.zoom_elements(mouse3X, mouse3Y, event);
          }
        }
      });
  
      canvas.addEventListener('mouseleave', e => {
        this.clickedPlotIndex = -1;
        this.selected_primitive = -1;
        this.setAllInteractionsToOff();
      })
    }
}


export class Histogram extends PlotData {
    edge_style: EdgeStyle;
    surface_style: SurfaceStyle;
    x_variable: Attribute;
    axis: Axis;
    graduation_nb: number;
    initial_graduation_nb: number;
    infos = {};
    min_abs: number = 0;
    max_abs: number = 0;
    max_frequency: number = 0;
    discrete: boolean = false;
    x_rubberband:number[]=[];
    y_rubberband:number[]=[];
    coeff:number=0.88;
    y_step: number = 0;
    selected_keys = [];
  
    constructor(public data:any,
                public width: number,
                public height: number,
                public buttons_ON: boolean,
                public X: number,
                public Y: number,
                public canvas_id: string,
                public is_in_multiplot: boolean = false) {
      super(data, width, height, buttons_ON, X, Y, canvas_id, is_in_multiplot);
      if (!is_in_multiplot) {
        var requirement = '0.6.1';
        check_package_version(data['package_version'], requirement);
      }
      this.type_ = data['type_'];
      this.elements = data['elements'];
      this.graduation_nb = data['graduation_nb'] || 6;
      this.initial_graduation_nb = this.graduation_nb;
      let name = data['x_variable'];
      let type_ = TypeOf(this.elements[0][name]);
  
      this.discrete = false;
      if (type_ !== 'float') this.discrete = true;
  
      this.x_variable = new Attribute(name, type_);
      const axis = data['axis'] || {grid_on: false};
      this.axis = Axis.deserialize(axis);
      let temp_surface_style = data['surface_style'] || {};
      temp_surface_style = set_default_values(temp_surface_style, {color_fill: string_to_rgb('lightblue'), opacity: 1});
      this.surface_style = SurfaceStyle.deserialize(temp_surface_style);
      this.edge_style = EdgeStyle.deserialize(data['edge_style']);
      if (type_ === 'float') {
        for (let element of this.elements) {
          this.minX = Math.min(this.minX, element[name]);
          this.maxX = Math.max(this.maxX, element[name]);
        }
        this.x_variable.list = [this.minX, this.maxX];
      } else {
        let list = [];
        for (let element of this.elements) {
          let graduation = element[name];
          if (type_ === 'color') graduation = color_to_string(graduation);
          if (!list.includes(graduation)) list.push(graduation);
        }
        this.minX = 0;
        this.maxX = list.length;
        this.min_abs = this.minX;
        this.max_abs = this.maxX;
        this.x_variable.list = list;
      }
      this.infos = this.get_infos();
      this.refresh_max_frequency();
      if (buttons_ON) this.refresh_buttons_coords();
    }
  
  
    draw_initial() {
      this.reset_scales();
      this.draw();
    }
  
  
    draw() {
      this.refresh_graduation_nb();
      this.context = this.context_show;
      this.context.save();
      this.draw_empty_canvas(this.context);
      if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
      this.context.beginPath();
      this.context.rect(this.X-1, this.Y-1, this.width+2, this.height + 2);
      this.context.clip();
      this.context.closePath();
  
      this.infos = this.get_infos();
      this.draw_axis();
      this.draw_histogram();
      this.draw_rubberbands();
  
      if ((this.buttons_ON) && (this.button_w > 20) && (this.button_h > 10)) {
        this.refresh_buttons_coords();
        this.draw_buttons();
      }
  
      if (this.multiplot_manipulation) {
        this.draw_manipulable_rect();
      }
      this.context.restore();
    };
  
  
    draw_from_context(hidden) {};
  
  
    draw_buttons() {
      this.reset_rect_y = 10;
      Buttons.reset_button(this.button_x, this.reset_rect_y, this.button_w, this.button_h, this);
    }
  
  
    draw_rubberbands() {
      this.context.beginPath();
      if (this.x_rubberband.length !== 0) {
        this.draw_x_rubberband();
      }
      if (this.y_rubberband.length !== 0) {
        this.draw_y_rubberband();
      }
      this.context.closePath();
    }
  
  
    draw_x_rubberband() {
      let grad_beg_y = this.height - this.decalage_axis_y;
      let h = 20;
      let x1d = this.real_to_display(this.x_rubberband[0], 'x');
      let x2d = this.real_to_display(this.x_rubberband[1], 'x');
      let w = x2d - x1d;
      Shape.rect(x1d, grad_beg_y - h/2 + this.Y, w, h, this.context, string_to_hex('lightrose'), 
                 string_to_hex('lightgrey'), 0.5, 0.6);
    }
  
    draw_y_rubberband() {
      let w = 20;
      let y1d = this.real_to_display(this.y_rubberband[0], 'y');
      let y2d = this.real_to_display(this.y_rubberband[1], 'y');
      let h = y2d - y1d;
      Shape.rect(this.decalage_axis_x - w/2 + this.X, y1d, w, h, this.context, string_to_hex('lightrose'),
                 string_to_hex('lightgrey'), 0.5, 0.6);
    }
  
  
    coordinate_to_string(x1, x2?) {
      if (this.discrete) {
        return this.x_variable.list[x1];
      }
      return x1.toString() + '_' + x2.toString();
    }
  
    string_to_coordinate(str) {
      if (this.discrete) {
        return {x1: List.get_index_of_element(str, this.x_variable.list)};
      }
      let l = str.split('_');
      return {x1: Number(l[0]), x2: Number(l[1])};
    }
  
  
    refresh_max_frequency() {
      let keys = Object.keys(this.infos);
      for (let key of keys) {
        this.max_frequency = Math.max(this.infos[key].length, this.max_frequency);
      }
    }
  
    
    get_infos() {
      let infos = {}, temp_infos = [];
      if (this.x_variable.type_ === 'float') {
        let min = this.x_variable.list[0], max = this.x_variable.list[1];
        let delta = max - min;
        let d = Math.pow(10, Math.floor(Math.log10(delta)));
        this.min_abs = Math.floor(min / d) * d;
        this.max_abs = Math.ceil(max / d) * d;
        let step;
        if (this.graduation_nb !== 1) {
          step = (this.max_abs - this.min_abs) / (this.graduation_nb - 1);
          let current_x = this.min_abs;
          while (current_x < this.max_abs) {
            let next_x = current_x + step;
            let selected_elts = [];
            for (let i=0;i<this.elements.length; i++) {
              let nb = this.elements[i][this.x_variable.name];
              if ((nb >= current_x && nb < next_x) || (next_x === this.max_abs && nb === next_x)) {
                selected_elts.push(i);
              }
            }
            let key = this.coordinate_to_string(current_x, next_x);
            temp_infos.push([key, selected_elts]);
            current_x = next_x;
          }
        } else {
          step = this.width / 3;
          let key = this.coordinate_to_string(this.minX, this.maxX);
          temp_infos = [[key, this.elements]];
        }
        infos = Object.fromEntries(temp_infos);
      } else {
        for (let graduation of this.x_variable.list) {
          temp_infos.push([graduation, []]);
        }
        infos = Object.fromEntries(temp_infos);
        for (let i=0; i<this.elements.length; i++) {
          let graduation;
          if (this.x_variable.type_ === 'color') {
            graduation = color_to_string(this.elements[i][this.x_variable.name]);
          } else {
            graduation = this.elements[i][this.x_variable.name];
          }
          infos[graduation].push(i);
        }
      }
      return infos;
    }
  
  
    draw_axis() {
      let keys = Object.keys(this.infos);
      this.y_step = this.get_y_step();
      if (this.discrete) {
        this.axis.draw_histogram_x_axis(this.context, this.scale, this.init_scale, this.originX, this.width,
                                        this.height, this.x_variable.list, this.decalage_axis_x, this.decalage_axis_y,
                                        this.scroll_x, this.X, this.Y, this.x_variable.name);
      } else {
        let {x1, x2} = this.string_to_coordinate(keys[0]);
        let x_step = x2 - x1;
        this.axis.draw_horizontal_axis(this.context, this.originX, this.scale,
                                       this.width, this.height, this.init_scale, this.minX, this.maxX,
                                       this.scroll_x, this.decalage_axis_x, this.decalage_axis_y,
                                       this.X, this.Y, this.x_variable.name, x_step);
      }
      this.axis.draw_histogram_y_axis(this.context, this.width, this.height, this.max_frequency, this.decalage_axis_x, 
        this.decalage_axis_y, this.X, this.Y, 'Frequency', this.y_step, this.coeff);
    }
  
  
    refresh_graduation_nb() {
      this.graduation_nb = Math.ceil(this.scale/this.init_scale * this.initial_graduation_nb);
    }
  
  
    get_y_step() {
      if (this.max_frequency <= 10) {
        return 1;
      } else if (this.max_frequency <= 20) {
        return 2;
      } else if (this.max_frequency <= 50) {
        return 5;
      }
      return Math.floor(this.max_frequency / 10);
    }
  
  
    draw_histogram() {
      let grad_beg_y = this.height - this.decalage_axis_y + this.Y;
      let keys = Object.keys(this.infos);
      let scaleY = (0.88*this.height - this.decalage_axis_y) / this.max_frequency;
      let color_stroke = this.edge_style.color_stroke;
      let line_width = this.edge_style.line_width;
      let opacity = this.surface_style.opacity;
      let dashline = this.edge_style.dashline;
  
      if (this.discrete) {
        // var grad_beg_x = this.decalage_axis_x/this.scale + 1/4;
        let w = 1/2;
        for (let i=0; i<keys.length; i++) {
          this.context.beginPath();
          let color_fill = this.surface_style.color_fill; 
          if (this.selected_keys.includes(keys[i])) {
            color_fill = string_to_hex('lightyellow');
          }
          let f = this.infos[keys[i]].length;
          let current_x = this.real_to_display(i, 'x');
          Shape.rect(current_x, grad_beg_y, this.scale*w, -scaleY*f, this.context, 
                     color_fill, color_stroke, line_width, opacity, dashline);
          this.context.closePath();
        }
      } else {
        let {x1, x2} = this.string_to_coordinate(keys[0]);
        let w = x2 - x1;
        for (let key of keys) {
          this.context.beginPath();
          let color_fill = this.surface_style.color_fill;
          if (this.selected_keys.includes(key)) {
            color_fill = string_to_hex('lightyellow');
          }
          let {x1} = this.string_to_coordinate(key);
          let current_x = this.real_to_display(x1, 'x'); 
          let f = this.infos[key].length;
          Shape.rect(current_x, grad_beg_y, this.scale*w,
                     -scaleY*f, this.context, color_fill, color_stroke, line_width, opacity, dashline);
          this.context.closePath();
        }
      }
    }
  
    mouse_interaction() {
      var mouse1X=0, mouse1Y=0, mouse2X=0, mouse2Y=0;
      var isDrawing=false, mouse_moving=false;
      var canvas = document.getElementById(this.canvas_id);
      var click_on_x_axis = false;
      var click_on_y_axis = false;
      var click_on_x_band = false;
      var click_on_y_band = false;
      var up = false, down = false;
      var left = false, right = false; 
  
      canvas.addEventListener('mousedown', e => {
        if (!this.interaction_ON) return;
        isDrawing = true;
        mouse_moving = false;
        mouse1X = e.offsetX;
        mouse1Y = e.offsetY;
        click_on_x_axis = Shape.isInRect(mouse1X, mouse2Y, this.decalage_axis_x + this.X, this.height - this.decalage_axis_y - 10 + this.Y,
                          this.width - this.decalage_axis_x, 20);
        click_on_y_axis = Shape.isInRect(mouse1X, mouse1Y, this.decalage_axis_x - 10 + this.X, this.Y, 20, this.height - this.decalage_axis_y);
        let click_on_reset = Shape.isInRect(mouse1X, mouse1Y, this.button_x + this.X, this.reset_rect_y + this.Y,
                                        this.button_w, this.button_h);
        if (click_on_x_axis) {
          [click_on_x_band, left, right] = this.is_in_x_rubberband(mouse1X, mouse1Y);
        }
        if (click_on_y_axis) {
          [click_on_y_band, up, down] = this.is_in_y_rubberband(mouse1X, mouse1Y);
        }
        if (click_on_reset) this.reset_scales();
      });
  
      canvas.addEventListener('mousemove', e => {
        if (!this.interaction_ON) return;
        let old_mouse2X = mouse2X, old_mouse2Y = mouse2Y;
        mouse_moving = true;
        mouse2X = e.offsetX;
        mouse2Y = e.offsetY;
        if (isDrawing) {
          if (click_on_x_axis) {
            this.is_drawing_rubber_band = true;
            if (click_on_x_band) {
              let tx = this.display_to_real_length(mouse2X - old_mouse2X, 'x')
              if (left || right) {
                this.resize_rubberband(tx, false, false, left, right);
              } else {
                this.translate_rubberband(tx, 'x');
              }
            } else {
              this.set_x_rubberband(mouse1X, mouse2X);
            }
            this.get_selected_keys();
          } else if (click_on_y_axis) {
            if (click_on_y_band) {
              let ty = this.display_to_real_length(mouse2Y - old_mouse2Y, 'y');
              if (up || down) {
                this.resize_rubberband(ty, up, down, false, false);
              } else {
                this.translate_rubberband(ty, 'y');
              }
            } else {
              this.set_y_rubberband(mouse1Y, mouse2Y);
            }
            this.get_selected_keys();
          } else {
            this.originX += mouse2X - old_mouse2X;
          }
        }
        this.draw();
      });
  
      canvas.addEventListener('mouseup', e => {
        if (!this.interaction_ON) return;
        if (mouse_moving) {
          if (up || down || left || right) {
            this.reorder_rubberbands();
          }
        } else {
          if (click_on_x_axis) {
            this.reset_x_rubberband();
          } else if (click_on_y_axis) {
            this.y_rubberband = [];
          }
          this.get_selected_keys();
        }
        reset_parameters();
        this.is_drawing_rubber_band = false;
        this.draw();
      });
  
  
      canvas.addEventListener('wheel', e => {
        if (!this.interaction_ON) return;
        e.preventDefault();
        let zoom_coeff;
        let event = -Math.sign(e.deltaY);
        if (event >= 0) zoom_coeff = 1.2; else zoom_coeff = 1/1.2;
        this.scale = this.scale * zoom_coeff;
        this.originX = mouse2X - this.X + zoom_coeff * (this.originX - mouse2X + this.X);
        this.draw();
      });
  
  
      function reset_parameters() {
        isDrawing = false;
        mouse_moving = false;
        click_on_x_axis = false;
        click_on_y_axis = false;
        click_on_x_band = false;
        click_on_y_band = false;
        up = false;
        down = false;
        left = false;
        right = false;
      }
    }
  
  
    set_x_rubberband(mouse1X, mouse2X) {
      let x1 = this.display_to_real(mouse1X, 'x');
      let x2 = this.display_to_real(mouse2X, 'x');
      this.x_rubberband = [Math.min(x1, x2), Math.max(x1, x2)];
    }
  
    set_y_rubberband(mouse1Y, mouse2Y) {
      let y1 = this.display_to_real(mouse1Y, 'y');
      let y2 = this.display_to_real(mouse2Y, 'y');
      this.y_rubberband = [Math.min(y1, y2), Math.max(y1, y2)];
    }
  
  
    is_in_x_rubberband(x, y) {
      let h = 20;
      let grad_beg_y = this.height - this.decalage_axis_y + this.Y;
      let y1 = grad_beg_y - h/2;
      let x1 = this.real_to_display(this.x_rubberband[0], 'x');
      let x2 = this.real_to_display(this.x_rubberband[1], 'x');
      let w = x2 - x1;
      let click_on_x_band = Shape.isInRect(x, y, x1, y1, w, h);
  
      let vertex_w = 5;
      let left = Shape.isInRect(x, y, x1, y1, vertex_w, h);
      let right = Shape.isInRect(x, y, x2, y1, -vertex_w, h);
      return [click_on_x_band, left, right];
    }
  
  
    is_in_y_rubberband(x, y) {
      let w = 20;
      let x1 = this.X + this.decalage_axis_x - w/2;
      let y1 = this.real_to_display(this.y_rubberband[0], 'y');
      let y2 = this.real_to_display(this.y_rubberband[1], 'y');
      let h = y2 - y1;
      let click_on_y_band = Shape.isInRect(x, y, x1, y1, w, h);
  
      let vertex_h = 5;
      let down = Shape.isInRect(x, y, x1, y1, w, -vertex_h);
      let up = Shape.isInRect(x, y, x1, y2, w, vertex_h);
      return [click_on_y_band, up, down];
    }
  
  
    translate_rubberband(t, type_) {
      if (type_ === 'x') {
        this.x_rubberband = [this.x_rubberband[0] + t, this.x_rubberband[1] + t];
      } else if (type_ === 'y') {
        this.y_rubberband = [this.y_rubberband[0] + t, this.y_rubberband[1] + t];
      } else {
        throw new Error("translate_rubberband(): type_ must be 'x' or 'y'");
      }
    }
  
  
    resize_rubberband(t, up, down, left, right) {
      if (up) {
        this.y_rubberband[1] += t;
      } else if (down) {
        this.y_rubberband[0] += t;
      } else if (left) {
        this.x_rubberband[0] += t;
      } else if (right) {
        this.x_rubberband[1] += t;
      }
    }
  
  
    reorder_rubberbands() {
      if (this.x_rubberband.length !== 0) {
        this.x_rubberband = [Math.min(this.x_rubberband[0], this.x_rubberband[1]),
        Math.max(this.x_rubberband[0], this.x_rubberband[1])];
      }
      if (this.y_rubberband.length !== 0) {
        this.y_rubberband = [Math.min(this.y_rubberband[0], this.y_rubberband[1]), 
        Math.max(this.y_rubberband[0], this.y_rubberband[1])];
      }
    }
  
  
    reset_x_rubberband() {
      this.x_rubberband = [];
      this.selected_keys = [];
      this.selected_point_index = [];
    }
  
  
    get_selected_keys() {
      this.selected_keys = [];
      this.selected_point_index = [];
      let keys = Object.keys(this.infos);
      if (this.x_rubberband.length === 0 && this.y_rubberband.length === 0) return;
      for (let key of keys) {
        let {x1, x2} = this.string_to_coordinate(key);
        let x_rubberband_0 = Math.min(this.x_rubberband[0], this.x_rubberband[1]);
        let x_rubberband_1 = Math.max(this.x_rubberband[0], this.x_rubberband[1]);
        let y_rubberband_0 = Math.min(this.y_rubberband[0], this.y_rubberband[1]);
        let y_rubberband_1 = Math.max(this.y_rubberband[0], this.y_rubberband[1]);
        let f = this.infos[key].length;
        let bool = true;
        if (this.x_rubberband.length !== 0) {
          if (this.discrete) {
            let middle = x1 + 1/4;
            bool = bool && x_rubberband_0 <= middle && middle <= x_rubberband_1;
            // bool = bool && x_rubberband_0 <= x1 && x1 + 1/2 <= x_rubberband_1;
          } else {
            let middle = (x1 + x2) / 2;
            bool = bool && x_rubberband_0 <= middle && middle <= x_rubberband_1;
            // bool = bool && x_rubberband_0 <= x1 && x2 <= x_rubberband_1;
          }
        }
        if (this.y_rubberband.length !== 0) {
          bool = bool && y_rubberband_0 <= f && f <= y_rubberband_1;
        }
        if (bool) {
          this.selected_keys.push(key);
          this.selected_point_index = this.selected_point_index.concat(this.infos[key]);
        }
      }
      let sort = new Sort();
      this.selected_point_index = sort.MergeSort(this.selected_point_index);
    }
  
  
    real_to_display(real: number, type_) { // type_ = 'x' or 'y'
      if (type_ === 'x') {
        if (this.discrete) {
          let grad_beg_x = this.decalage_axis_x / this.scale;
          return this.scale * (grad_beg_x + real) + this.originX + this.X;
        } else {
          return this.scale * real + this.originX + this.X;
        }
      } else if (type_ === 'y') {
        let grad_beg_y = this.height - this.decalage_axis_y;
        let scale_y = (this.coeff*this.height - this.decalage_axis_y) / this.max_frequency;
        return grad_beg_y - scale_y * real + this.Y;
      } else {
        throw new Error("real_to_display(): type_ must be 'x' or 'y'");
      }
    }
  
  
    real_to_display_length(real: number, type_) {
      if (type_ === 'x') {
        return this.scale * real;
      } else if (type_ === 'y') {
        let scale_y = (this.coeff*this.height - this.decalage_axis_y) / this.max_frequency;
        return -scale_y * real;
      } else {
        throw new Error("real_to_display_length(): type_ must be 'x' or 'y'");
      }
    }
  
  
    display_to_real(display: number, type_) {
      if (type_ === 'x') {
        if (this.discrete) {
          let grad_beg_x = this.decalage_axis_x / this.scale;
          return (display - this.originX - this.X) / this.scale - grad_beg_x;
        } else {
          return (display - this.originX - this.X) / this.scale;
        }
      } else if (type_ === 'y') {
        let grad_beg_y = this.height - this.decalage_axis_y;
        let scale_y = (this.coeff*this.height - this.decalage_axis_y) / this.max_frequency;
        return (grad_beg_y + this.Y - display) / scale_y;
      } else {
        throw new Error("display_to_real(): type_ must be 'x' or 'y'");
      }
    }
  
  
    display_to_real_length(display: number, type_) {
      if (type_ === 'x') {
        return display / this.scale;
      } else if (type_ === 'y') {
        let scale_y = (this.coeff*this.height - this.decalage_axis_y) / this.max_frequency;
        return -display / scale_y;
      } else {
        throw new Error("display_to_real_length(): type_ must be 'x' or 'y'")
      }
    }
  
}