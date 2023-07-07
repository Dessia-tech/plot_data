import { PlotData, Buttons, Interactions } from "./plot-data";
import { check_package_version, Attribute, Axis, Sort, set_default_values, TypeOf, RubberBand, Vertex, newAxis, ScatterPoint, Bar, newShape, SelectionBox } from "./utils";
import { Heatmap, PrimitiveGroup } from "./primitives";
import { List, Shape, MyObject } from "./toolbox";
import { Graph2D, Scatter } from "./primitives";
import { string_to_hex, string_to_rgb, get_interpolation_colors, rgb_to_string, rgb_to_hex, color_to_string } from "./color_conversion";
import { EdgeStyle, TextStyle } from "./style";

var alert_count = 0;
/**
 * A class that inherits from PlotData and is specific for drawing PrimitiveGroups.
 */
export class PlotContour extends PlotData {
    plot_datas:any;
    selected: boolean = true;
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
            this.minX = Math.min(this.minX, primitive.minX);
            this.maxX = Math.max(this.maxX, primitive.maxX);
            this.minY = Math.min(this.minY, primitive.minY);
            this.maxY = Math.max(this.maxY, primitive.maxY);
            if (["contour", "circle", "wire", "point"].includes(primitive.type_)) {
              this.color_to_plot_data[primitive.hidden_color] = primitive;
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
        this.log_scale_x = data['log_scale_x'];
        this.log_scale_y = data['log_scale_y'];
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
            this.minX = Infinity; this.maxX = -Infinity; this.minY = Infinity; this.maxY = -Infinity;
            this.refresh_MinMax(graph.point_list, true);
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
          this.heatmap_view = data["heatmap_view"] || false;
          if (data["heatmap"]) {this.heatmap = Heatmap.deserialize(data["heatmap"])} else {this.heatmap = new Heatmap();}
          this.selected_areas = [];
          for (let i=0; i<this.heatmap.size[0]; i++) {
            let temp = [];
            for (let j=0; j<this.heatmap.size[1]; j++) {
              temp.push(0);
            }
            this.selected_areas.push(temp);
          }
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
      if (this.heatmap_view) {
        this.draw_heatmap(hidden);
      } else {
        this.draw_scatterplot(this.plotObject, hidden, this.originX, this.originY);
        if (this.permanent_window) {
          this.draw_selection_rectangle();
        }
        if (this.zw_bool || (this.isSelecting && !this.permanent_window)) {
          this.draw_zoom_rectangle();
        }
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
          Buttons.merge_button(this.button_x, this.merge_y, this.button_w, this.button_h, '10px Arial', this);
          // Draw Heatmap button
          Buttons.heatmap_button(this.button_x, this.heatmap_button_y, this.button_w, this.button_h, "10px Arial", this);
        } else if (this.plotObject.type_ === "graph2d") {
          Buttons.csv_button(this.button_x, this.csv_button_y, this.button_w, this.button_h, "12px Arial", this);
        }

        //draw permanent window button
        Buttons.perm_window_button(this.button_x, this.perm_button_y, this.button_w, this.button_h, '10px Arial', this);

        //draw clear point button
        Buttons.clear_point_button(this.button_x, this.clear_point_button_y, this.button_w, this.button_h, '10px Arial', this);

        // Draw log scale buttons
        Buttons.log_scale_buttons(this.button_x, this.xlog_button_y, this.ylog_button_y, this.button_w, this.button_h,
          "10px Arial", this);

      }
      if (this.multiplot_manipulation) {
        this.draw_manipulable_rect();
      }
      this.context.restore();
    }
}


/** A class that inherits from PlotData and is specific for drawing realToAxiss  */
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
      this.vertical = data['disposition'] == 'vertical' ? true : false;
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
      this.interpolation_colors = get_interpolation_colors(this.rgbs, this.to_display_list.length);
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
        this.rubber_bands.push(new RubberBand(this.axis_list[i].name, 0, 0, this.vertical));
      }
    }

    initialize_hexs() {
      this.hexs = [];
      this.interpolation_colors.forEach(rgb => {
        this.hexs.push(rgb_to_hex(rgb));
      });
    }

    getObjectsInRubberBands(rubberBands: RubberBand[]): number[] {
      let selectedIndices = [];
      this.data["elements"].forEach((sample, elementIndex) => {
        var inRubberBand = 0;
        if (rubberBands.length !==0 ) {
          rubberBands.forEach((rubberBand, rubberIndex) => {
            inRubberBand += Number(rubberBand.includesValue(sample[rubberBand.attributeName], this.axis_list[rubberIndex]))
          })
          if (inRubberBand == rubberBands.length) {
            selectedIndices.push(elementIndex)
          }
        }
      })
      this.selected_point_index = selectedIndices;
      return selectedIndices
    }

    refresh_pp_selected() {
      this.pp_selected_index = this.getObjectsInRubberBands(this.rubber_bands);
      if (this.pp_selected_index.length === 0 && List.isListOfEmptyList(this.rubber_bands)) {
        this.reset_pp_selected();
      }
    }

    reset_pp_selected() {
      this.clicked_point_index = [];
      this.pp_selected_index = Array.from(Array(this.to_display_list.length).keys());
    }

    mouse_up_interaction_pp(click_on_axis, selected_axis_index, click_on_name, click_on_band, click_on_border, is_resizing, selected_name_index, mouse_moving, isDrawing, mouse1X, mouse1Y, mouse3X, mouse3Y, e) {
      var mouseX = e.offsetX;
      var mouseY = e.offsetY;
      var click_on_disp = Shape.isInRect(mouseX, mouseY, this.disp_x + this.X, this.disp_y + this.Y, this.disp_w, this.disp_h);
      if (click_on_axis && !mouse_moving) {
        this.select_axis_action(selected_axis_index, click_on_band, click_on_border);
      } else if (click_on_name && mouse_moving) {
        [mouse3X, mouse3Y, click_on_axis] = Interactions.mouse_up_axis_interversion(mouse1X, mouse1Y, e, this);
      } else if (click_on_name && !mouse_moving) {
        Interactions.select_title_action(selected_name_index, this);
      } else if (this.is_drawing_rubber_band || is_resizing) {
        this.draw()
        is_resizing = false;
      }
      if (click_on_disp) {
        Interactions.change_disposition_action(this);
      }
      this.refresh_pp_selected();
      this.is_drawing_rubber_band = false;
      mouse_moving = false;
      isDrawing = false;
      this.originX = 0;
      return [mouse3X, mouse3Y, click_on_axis, isDrawing, mouse_moving, is_resizing];
    }

    mouse_interaction() {
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
            [click_on_axis, selected_axis_index] = Interactions.initialize_click_on_axis(this.axis_list.length, mouse1X, mouse1Y, click_on_axis, this);
            [click_on_name, selected_name_index] = Interactions.initialize_click_on_name(this.axis_list.length, mouse1X, mouse1Y, this);
            [click_on_band, click_on_border, selected_band_index, selected_border] = Interactions.initialize_click_on_bands(mouse1X, mouse1Y, this);
          }
        });

        canvas.addEventListener('mousemove', e => {
          if (this.interaction_ON) {
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
          }
        });

        canvas.addEventListener('mouseup', e => {
          if (this.interaction_ON) {
            [mouse3X, mouse3Y, click_on_axis, isDrawing, mouse_moving, is_resizing] = this.mouse_up_interaction_pp(click_on_axis, selected_axis_index, click_on_name, click_on_band, click_on_border, is_resizing, selected_name_index, mouse_moving, isDrawing, mouse1X, mouse1Y, mouse3X, mouse3Y, e);
          }
        })

        canvas.addEventListener('mouseleave', e => {
          isDrawing = false;
          mouse_moving = false;
        });


        canvas.addEventListener("click", e => {
          if (this.interaction_ON) {
            if (e.ctrlKey) {
              this.reset_pp_selected();
              this.reset_rubberbands();
              this.draw();
            }
          }
        });
      }
    }

    public select_axis_action(selected_axis_index, click_on_band, click_on_border) {
      this.isSelectingppAxis = true;
      if (this.rubber_bands[selected_axis_index].length == 0) {
        var attribute_name = this.axis_list[selected_axis_index]['name'];
        if (attribute_name == this.selected_axis_name) {
          this.selected_axis_name = '';
        } else {
          this.selected_axis_name = attribute_name;
          this.sort_to_display_list(); // à modifier pour trier vertical et horizontal axis coords
          this.refresh_axis_coords();
        }
      } else if ((this.rubber_bands[selected_axis_index].length != 0) && !click_on_band && !click_on_border) {
        this.rubber_bands[selected_axis_index].reset();
        this.refresh_pp_selected();
      }
      this.draw();
    }
}


/** A class that inherits from PlotData and is specific for drawing PrimitiveGroupContainers.  */
export class PrimitiveGroupContainer extends PlotData {
    primitive_groups:PlotContour[]=[];
    layout_mode:string='regular';
    layout_axis:Axis;
    layout_attributes:Attribute[]=[];
    selected_primitive:number=-1;
    custom_sizes:boolean=false;

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
      if (data['sizes']) {
        this.custom_sizes = true;
      }
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
      if (!this.custom_sizes) {
        if (nb_primitives === 1) {
          var primitive_width = this.width/3;
          var primitive_height = this.height/3;
        } else {
          primitive_width = this.width/nb_primitives;
          primitive_height = this.height/nb_primitives;
        }
      }
      for (let i=0; i<nb_primitives; i++) {
        let center_x = this.primitive_groups[i].X + this.primitive_groups[i].width/2;
        let center_y = this.primitive_groups[i].Y + this.primitive_groups[i].height/2;
        if (this.custom_sizes) {
          this.primitive_groups[i].width = Math.min(this.data['sizes'][i][0], this.width);
          this.primitive_groups[i].height = Math.min(this.data['sizes'][i][1], this.height);
        } else {
          this.primitive_groups[i].width = primitive_width;
          this.primitive_groups[i].height = primitive_height;
        }
        this.primitive_groups[i].X = center_x - this.primitive_groups[i].width/2;
        this.primitive_groups[i].Y = center_y - this.primitive_groups[i].height/2;
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
          if (this.primitive_groups[index].selected) {
            this.primitive_groups[index].draw();
          }
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


    reset_selection() {
      for (let i=0; i<this.primitive_groups.length; i++) {
        this.primitive_groups[i].selected = true;
      }
    }


    select_primitive_groups() {
      let reverse_primitive_dict = Object.fromEntries(Object.entries(this.primitive_dict).map(val => [val[1], val[0]]));
      for (let i=0; i<this.primitive_groups.length; i++) {
        let index = Number(reverse_primitive_dict[i]);
        this.primitive_groups[i].selected = List.is_include(index, this.selected_point_index);
      }
    }


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
          if (!primitive.selected) continue;
          let x = primitive.X + primitive.width/2;
          let y = primitive.Y + primitive.height;
          Shape.drawLine(this.context, [[x,y], [x, this.height - this.decalage_axis_y + this.Y]]);
        }
      } else if (this.layout_mode == 'two_axis') {
        for (let primitive of this.primitive_groups) {
          if (!primitive.selected) continue;
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
              this.init_scaleX, this.layout_attributes[0].list, this.layout_attributes[0], this.scroll_x, this.decalage_axis_x,
              this.decalage_axis_y, this.X, this.Y, this.width);
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

export class BasePlot extends PlotData {
  public axes: newAxis[] = [];
  public origin: Vertex;
  public size: Vertex;
  public translation: Vertex = new Vertex(0, 0);

  public hoveredIndices: number[];
  public clickedIndices: number[];
  public selectedIndices: number[];

  public isSelecting: boolean = false;
  public selectionBox = new SelectionBox();

  public viewPoint: Vertex = new Vertex(0, 0);
  public fixedObjects: any[] = [];
  public absoluteObjects: newShape[] = [];
  public relativeObjects: newShape[] = [];

  public font: string = "sans-serif";

  protected initScale: Vertex = new Vertex(1, -1);
  private _axisStyle = new Map<string, any>([['strokeStyle', 'hsl(0, 0%, 31%)']]);
  public nSamples: number;

  readonly features: Map<string, any[]>;
  readonly MAX_PRINTED_NUMBERS = 16;
  readonly TRL_THRESHOLD = 20;
  constructor(
    data: any,
    public width: number,
    public height: number,
    public buttons_ON: boolean,
    public X: number,
    public Y: number,
    public canvas_id: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, buttons_ON, X, Y, canvas_id, is_in_multiplot);
      this.nSamples = data.elements.length;
      this.origin = new Vertex(0, 0);
      this.size = new Vertex(width - X, height - Y);
      this.features = this.unpackData(data);
      this.initSelectors();
      this.scaleX = this.scaleY = 1;
      this.TRL_THRESHOLD /= Math.min(Math.abs(this.initScale.x), Math.abs(this.initScale.y));
      this.refresh_MinMax();
    }

  refresh_MinMax(): void {
    this.minX = this.origin.x;
    this.maxX = this.origin.x + this.size.x;
    this.minY = this.origin.y;
    this.maxY = this.origin.y + this.size.y;
  }

  set axisStyle(newAxisStyle: Map<string, any>) { newAxisStyle.forEach((value, key) => this._axisStyle.set(key, value)) }

  get axisStyle(): Map<string, any> { return this._axisStyle }

  get canvasMatrix(): DOMMatrix { return new DOMMatrix([this.initScale.x, 0, 0, this.initScale.y, this.origin.x, this.origin.y]) }

  get relativeMatrix(): DOMMatrix { return new DOMMatrix([this.initScale.x, 0, 0, this.initScale.y, this.origin.x, this.origin.y]) }

  get falseIndicesArray(): boolean[] { return new Array(this.nSamples).fill(false) }

  private unpackData(data: any): Map<string, any[]> {
    const featuresKeys: string[] = Array.from(Object.keys(data.elements[0].values));
    featuresKeys.push("name");
    let unpackedData = new Map<string, any[]>();
    featuresKeys.forEach((feature) => { unpackedData.set(feature, data.elements.map(element => element[feature])) });
    return unpackedData
  }

  public drawCanvas(): void {
    this.context = this.context_show;
    this.draw_empty_canvas(this.context_show);
    if (this.settings_on) {this.draw_settings_rect()}
    else {this.draw_rect()}
    this.context_show.beginPath();
    this.context_show.rect(this.X, this.Y, this.width, this.height);
    this.context_show.closePath();
  }

  public updateAxes(): void {
    const axisSelections = [];
    this.axes.forEach(axis => {
      this.axisStyle.forEach((value, key) => axis[key] = value);
      axis.updateScale(this.viewPoint, new Vertex(this.scaleX, this.scaleY), this.translation);
      if (axis.rubberBand.length != 0) axisSelections.push(this.updateSelected(axis));
    })
    if (!this.is_in_multiplot) {
      if (axisSelections.length > 1) {
        this.selectedIndices = [...axisSelections[0]];
        axisSelections[0].forEach(valIndex => {
          axisSelections.slice(1).forEach(axisSelection => {
            if (axisSelection.indexOf(valIndex) == -1) this.selectedIndices.splice(this.selectedIndices.indexOf(valIndex), 1)
          })
        })
      } else { this.selectedIndices = axisSelections.length == 0 ? [] : axisSelections[0] }
    }
  }

  private initSelectors(): void {
    this.hoveredIndices = [];
    this.clickedIndices = [];
    this.selectedIndices = [];
  }

  public reset(): void {
    this.axes.forEach(axis => axis.reset());
    this.selectionBox = new SelectionBox();
    this.initSelectors();
  }

  public updateSelected(axis: newAxis): number[] { // TODO: Performance
    const selection = [];
    const vector = axis.stringsToValues(this.features.get(axis.name));
    vector.forEach((value, index) => { if (axis.isInRubberBand(value)) selection.push(index) });
    return selection
  }

  public isRubberBanded(): boolean {
    let isRubberBanded = true;
    this.axes.forEach(axis => isRubberBanded = isRubberBanded && axis.rubberBand.length != 0);
    return isRubberBanded
  }

  public drawAxes(): void { this.axes.forEach(axis => axis.draw(this.context_show)) }

  public drawZoneRectangle(context: CanvasRenderingContext2D): void {
    // TODO: change with newRect
    Shape.rect(this.X, this.Y, this.width, this.height, context, "hsl(203, 90%, 88%)", "hsl(0, 0%, 0%)", 1, 0.3, [15,15]);
  }

  public drawRelativeObjects() {}

  public drawAbsoluteObjects(context: CanvasRenderingContext2D) {
    this.absoluteObjects = [];
    this.drawSelectionBox(context);
  }

  public computeRelativeObjects() {}

  public draw(): void {
    this.context_show.save();
    this.drawCanvas();
    this.context_show.setTransform(this.canvasMatrix);

    this.updateAxes();
    this.computeRelativeObjects();

    this.context_show.setTransform(this.relativeMatrix);
    this.drawRelativeObjects();

    this.context_show.resetTransform();
    this.drawAbsoluteObjects(this.context_show);

    this.context_show.setTransform(this.canvasMatrix);
    this.drawAxes();
    this.drawTooltips();

    this.context_show.resetTransform();
    // if (this.buttons_ON) { this.drawButtons(this.context_show) }
    if (this.multiplot_manipulation) { this.drawZoneRectangle(this.context_show) };
    this.context_show.restore();
  }

  public draw_initial(): void { this.draw() }

  public draw_from_context(hidden: any) {}

  // protected drawButtons(context: CanvasRenderingContext2D) { // Kept for further implementation of legends
  //   const buttonsX = this.initScale.x < 0 ? 50 : this.size.x - 250;
  //   const buttonsYStart = this.initScale.y < 0 ? 50 : this.size.y - 50;
  //   const buttonRect = new newRect(new Vertex(buttonsX + this.X, buttonsYStart + this.Y), new Vertex(200, 20));
  //   buttonRect.draw(context);
  // }

  public switchSelectionMode() { this.isSelecting = !this.isSelecting ; this.draw() }

  public updateSelectionBox(frameDown: Vertex, frameLoc: Vertex) { this.selectionBox.update(frameDown, frameLoc) }

  public get drawingZone(): [Vertex, Vertex] { return [new Vertex(this.X, this.Y), this.size] }

  public drawSelectionBox(context: CanvasRenderingContext2D) {
    if ((this.isSelecting || this.is_drawing_rubber_band) && this.selectionBox.isDefined) {
      const [drawingOrigin, drawingSize] = this.drawingZone;
      this.selectionBox.buildRectFromHTMatrix(drawingOrigin, drawingSize, this.relativeMatrix);
      if (this.selectionBox.area != 0) {
        this.selectionBox.buildPath();
        this.selectionBox.draw(context);
        this.absoluteObjects.push(this.selectionBox);
      }
    }
  }

  public drawTooltips(): void {
    this.relativeObjects.forEach(object => { object.drawTooltip(new Vertex(this.X, this.Y), this.size, this.context_show) })
    this.absoluteObjects.forEach(object => { object.drawTooltip(new Vertex(this.X, this.Y), this.size, this.context_show) })
  }

  public stateUpdate(context: CanvasRenderingContext2D, objects: any[], mouseCoords: Vertex, stateName: string, keepState: boolean, invertState: boolean): void {
    objects.forEach((object, index) => { this.objectStateUpdate(context, object, index, mouseCoords, stateName, keepState, invertState) });
  }

  public objectStateUpdate(context: CanvasRenderingContext2D, object: any, index: number, mouseCoords: Vertex, stateName: string, keepState: boolean, invertState: boolean) {
    if (context.isPointInPath(object.path, mouseCoords.x, mouseCoords.y)) { object[stateName] = invertState ? !object[stateName] : true }
    else {if (!keepState) {object[stateName] = false}}
  }

  public mouseTranslate(currentMouse: Vertex, mouseDown: Vertex): Vertex {
    return new Vertex(mouseDown.x - currentMouse.x, mouseDown.y - currentMouse.y);
  }

  public mouseMove(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): void {
    this.stateUpdate(this.context_show, this.fixedObjects, canvasMouse, 'isHovered', false, false);
    this.stateUpdate(this.context_show, this.absoluteObjects, absoluteMouse, 'isHovered', false, false);
    this.stateUpdate(this.context_show, this.relativeObjects, frameMouse, 'isHovered', false, false);
  }

  public projectMouse(e: MouseEvent): [Vertex, Vertex, Vertex] {
    const mouseCoords = new Vertex(e.offsetX, e.offsetY);
    return [mouseCoords.scale(this.initScale), mouseCoords.transform(this.relativeMatrix.inverse()), mouseCoords]
  }

  public mouseDown(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, any] {
    let clickedObject: any;
    this.fixedObjects.forEach(object => {
      if (object.isHovered) {
        clickedObject = object;
        clickedObject.mouseDown(canvasMouse);
      }
    })
    this.absoluteObjects.forEach(object => {
      if (object.isHovered) {
        clickedObject = object;
        clickedObject.mouseDown(absoluteMouse);
      }
    })
    this.relativeObjects.forEach(object => {
      if (object.isHovered) {
        clickedObject = object;
        clickedObject.mouseDown(frameMouse);
      }
    })
    return [canvasMouse, frameMouse, clickedObject]
  }

  public mouseUp(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex, canvasDown: Vertex, ctrlKey: boolean): void {
    if (this.interaction_ON) {
      if (this.translation.normL1 == 0 && canvasMouse.subtract(canvasDown).normL1 <= this.TRL_THRESHOLD) {
        this.stateUpdate(this.context_show, this.fixedObjects, canvasMouse, 'isClicked', ctrlKey, true);
        this.stateUpdate(this.context_show, this.absoluteObjects, absoluteMouse, 'isClicked', ctrlKey, true);
        this.stateUpdate(this.context_show, this.relativeObjects, frameMouse, 'isClicked', ctrlKey, true);
      }
    }
  }

  public mouse_interaction(isParallelPlot: boolean): void {
    if (this.interaction_ON === true) {
      var clickedObject: any;
      var isDrawing = false;
      var canvasMouse = new Vertex(0, 0) ; var canvasDown = new Vertex(0, 0) ; var mouseWheel = new Vertex(0, 0);
      var frameMouse = new Vertex(0, 0) ; var frameDown = new Vertex(0, 0) ; var canvasWheel = new Vertex(0, 0);
      var absoluteMouse = new Vertex(0, 0); var absoluteDown = new Vertex(0, 0);
      var mouse3X = 0; var mouse3Y = 0;
      var canvas = document.getElementById(this.canvas_id);
      var ctrlKey = false;
      window.addEventListener('keydown', e => {if (e.key == "Control") {ctrlKey = true}});

      window.addEventListener('keyup', e => {if (e.key == "Control") {ctrlKey = false}});

      canvas.addEventListener('mousemove', e => {
        [canvasMouse, frameMouse, absoluteMouse] = this.projectMouse(e);
        this.mouseMove(canvasMouse, frameMouse, absoluteMouse);
        if (this.interaction_ON) {
          if (isDrawing) {
            if (clickedObject instanceof SelectionBox != true) { // TODO: BEURK !!!!
              if (!clickedObject?.mouseMove(canvasDown, canvasMouse) && !this.isSelecting) {
                canvas.style.cursor = 'move';
                this.translation = this.mouseTranslate(canvasMouse, canvasDown);
              }
            }
          }
          this.draw();
        }
        if (this.isSelecting) {
          canvas.style.cursor = 'crosshair';
          if (isDrawing) {
            if (clickedObject instanceof SelectionBox) {
              clickedObject.mouseMove(frameDown, frameMouse);
              this.updateSelectionBox(clickedObject.minVertex, clickedObject.maxVertex);
            }
            else this.updateSelectionBox(frameDown, frameMouse);
          }
        }
        const mouseInCanvas = (e.offsetX >= this.X) && (e.offsetX <= this.width + this.X) && (e.offsetY >= this.Y) && (e.offsetY <= this.height + this.Y);
        if (!mouseInCanvas) { isDrawing = false };
      });

      canvas.addEventListener('mousedown', e => {
        [canvasDown, frameDown, clickedObject] = this.mouseDown(canvasMouse, frameMouse, absoluteMouse);
        absoluteDown = absoluteMouse;
        if (clickedObject instanceof newAxis || this.isSelecting) this.is_drawing_rubber_band = true
        else this.is_drawing_rubber_band = false
        isDrawing = true;
      });

      canvas.addEventListener('mouseup', e => {
        canvas.style.cursor = 'default';
        console.log(e.offsetX, e.offsetY)
        this.mouseUp(canvasMouse, frameMouse, absoluteMouse, canvasDown, ctrlKey);
        if (clickedObject) clickedObject.mouseUp();
        if (this.isSelecting) this.selectionBox.mouseUp();
        if (clickedObject instanceof SelectionBox != true) this.isSelecting = false;
        if (!this.is_in_multiplot) this.is_drawing_rubber_band = false;
        clickedObject = undefined;
        this.draw();
        this.axes.forEach(axis => {axis.saveLocation()});
        this.translation = new Vertex(0, 0);
        isDrawing = false;
      })

      canvas.addEventListener('wheel', e => {
        if (this.interaction_ON) {
          let scale = new Vertex(this.scaleX, this.scaleY);
          [mouse3X, mouse3Y] = this.wheel_interaction(mouse3X, mouse3Y, e);
          for (let axis of this.axes) {
            if (axis.tickPrecision >= this.MAX_PRINTED_NUMBERS) {
              if (this.scaleX > scale.x) {this.scaleX = scale.x}
              if (this.scaleY > scale.y) {this.scaleY = scale.y}
            } else if (axis.tickPrecision < 1) {
              if (this.scaleX < scale.x) {this.scaleX = scale.x}
              if (this.scaleX < scale.x) {this.scaleX = scale.x}
            }
          }
          this.viewPoint = new Vertex(mouse3X, mouse3Y).scale(this.initScale);
          this.updateAxes(); // needs a refactor
          this.axes.forEach(axis => axis.saveLocation());
          [this.scaleX, this.scaleY] = [1, 1];
          this.viewPoint = new Vertex(0, 0);
          this.draw(); // needs a refactor
        }
      });

      canvas.addEventListener('mouseleave', e => {
        isDrawing = false;
        ctrlKey = false;
        this.axes.forEach(axis => {axis.saveLocation()});
        this.translation = new Vertex(0, 0);
        canvas.style.cursor = 'default';
      });
    }
  }

  public wheel_interaction(mouse3X, mouse3Y, e: WheelEvent): [number, number] { //TODO: TO REFACTOR !!!
    // e.preventDefault();
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
      return [mouse3X, mouse3Y];
  }
}

export class Frame extends BasePlot {
  public xFeature: string;
  public yFeature: string;

  private offset;
  private margin;

  protected _nXTicks: number;
  protected _nYTicks: number;

  readonly OFFSET_MULTIPLIER: Vertex = new Vertex(0.035, 0.07);
  readonly MARGIN_MULTIPLIER: number = 0.01;

  constructor(
    public data: any,
    public width: number,
    public height: number,
    public buttons_ON: boolean,
    public X: number,
    public Y: number,
    public canvas_id: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, buttons_ON, X, Y, canvas_id, is_in_multiplot);
      this.offset = this.computeOffset();
      this.margin = new Vertex(width * this.MARGIN_MULTIPLIER, height * this.MARGIN_MULTIPLIER).add(new Vertex(10, 10));
      [this.xFeature, this.yFeature] = this.setFeatures(data);
      this.axes = this.setAxes();
      this.fixedObjects.push(...this.axes);
      this.type_ = "frame";
    }

  get frameMatrix(): DOMMatrix {
    const relativeMatrix = this.axes[0].transformMatrix;
    relativeMatrix.d = this.axes[1].transformMatrix.a;
    relativeMatrix.f = this.axes[1].transformMatrix.f;
    return relativeMatrix
  }

  get relativeMatrix(): DOMMatrix { return this.canvasMatrix.multiply(this.frameMatrix) }

  get nXTicks(): number { return this._nXTicks ? this._nXTicks : 7 }

  set nXTicks(value: number) { this._nXTicks = value }

  get nYTicks(): number { return this._nYTicks ? this._nYTicks : 7 }

  set nYTicks(value: number) { this._nYTicks = value }

  public get drawingZone(): [Vertex, Vertex] {
    const origin = new Vertex();
    origin.x = this.initScale.x < 0 ? this.axes[0].end.x : this.axes[0].origin.x;
    origin.y = this.initScale.y < 0 ? this.axes[1].end.y : this.axes[1].origin.y;
    const size = new Vertex(Math.abs(this.axes[0].end.x - this.axes[0].origin.x), Math.abs(this.axes[1].end.y - this.axes[1].origin.y))
    return [origin.transform(this.canvasMatrix.inverse()), size]
  }


  private computeOffset(): Vertex {
    const naturalOffset = new Vertex(this.width * this.OFFSET_MULTIPLIER.x, this.height * this.OFFSET_MULTIPLIER.y);
    const MIN_FONTSIZE = 6;
    const calibratedMeasure = 33;
    return new Vertex(Math.max(naturalOffset.x, calibratedMeasure), Math.max(naturalOffset.y, MIN_FONTSIZE));
  }

  public reset_scales(): void {
    this.size = new Vertex(this.width, this.height);
    this.resetAxes();
  }

  private resetAxes(): void {
    const [frameOrigin, xEnd, yEnd] = this.setFrameBounds();
    this.axes[0].transform(frameOrigin, xEnd);
    this.axes[1].transform(frameOrigin, yEnd);
  }

  public setFeatures(data: any): [string, string] {
    return [data.attribute_names[0], data.attribute_names[1]];
  }

  public setAxes(): newAxis[] {
    const [frameOrigin, xEnd, yEnd, freeSize] = this.setFrameBounds()
    return [
      this.setAxis(this.xFeature, freeSize.y, frameOrigin, xEnd, this.nXTicks),
      this.setAxis(this.yFeature, freeSize.x, frameOrigin, yEnd, this.nYTicks)]
  }

  public setAxis(feature: string, freeSize: number, origin: Vertex, end: Vertex, nTicks: number = undefined): newAxis {
    return new newAxis(this.features.get(feature), freeSize, origin, end, feature, this.initScale, nTicks)
  }

  public drawAxes() {
    super.drawAxes();
    if (this.isRubberBanded()) this.updateSelectionBox(...this.rubberBandsCorners);
  }

  public plottedObjectStateUpdate(context: CanvasRenderingContext2D, object: any, mouseCoords: Vertex, stateName: string, keepState: boolean, invertState: boolean) {
    if (object.values) {
      let stateIndices = [this.hoveredIndices, this.clickedIndices][stateName == "isHovered" ? 0 : 1];
      if (context.isPointInPath(object.path, mouseCoords.x, mouseCoords.y)) {
        object.values.forEach(value => {
          const valIndex = stateIndices.indexOf(value);
          if (valIndex == -1) stateIndices.push(value)
          else { if (invertState) stateIndices.splice(valIndex, 1) }
        })
      } else {
        if (!keepState) {
          object.values.forEach(value => {
            const valIndex = stateIndices.indexOf(value);
            if (valIndex != -1) stateIndices.splice(valIndex, 1);
          })
        }
      }
    }
  }

  public setFrameBounds(): [Vertex, Vertex, Vertex, Vertex] {
    let frameOrigin = this.offset.add(new Vertex(this.X, this.Y).scale(this.initScale));
    let xEnd = new Vertex(this.size.x - this.margin.x + this.X * this.initScale.x, frameOrigin.y);
    let yEnd = new Vertex(frameOrigin.x, this.size.y - this.margin.y + this.Y * this.initScale.y);
    let freeSize = frameOrigin.copy();
    if (this.canvasMatrix.a < 0) {
      freeSize.x = frameOrigin.x;
      frameOrigin.x = -(this.size.x - frameOrigin.x);
      xEnd.x = -(this.size.x - xEnd.x);
      yEnd.x = frameOrigin.x;
    }
    if (this.canvasMatrix.d < 0) {
      frameOrigin.y = -(this.size.y - frameOrigin.y);
      yEnd.y = -(this.size.y - yEnd.y);
      xEnd.y = frameOrigin.y;
      freeSize.y = this.size.y + frameOrigin.y;
    }
    return [frameOrigin, xEnd, yEnd, freeSize]
  }

  public updateSelectionBox(frameDown: Vertex, frameMouse: Vertex) {
    this.axes[0].rubberBand.minValue = Math.min(frameDown.x, frameMouse.x);
    this.axes[1].rubberBand.minValue = Math.min(frameDown.y, frameMouse.y);
    this.axes[0].rubberBand.maxValue = Math.max(frameDown.x, frameMouse.x);
    this.axes[1].rubberBand.maxValue = Math.max(frameDown.y, frameMouse.y);
    super.updateSelectionBox(...this.rubberBandsCorners);
  }

  public get rubberBandsCorners(): [Vertex, Vertex] {
    return [new Vertex(this.axes[0].rubberBand.minValue, this.axes[1].rubberBand.minValue), new Vertex(this.axes[0].rubberBand.maxValue, this.axes[1].rubberBand.maxValue)]
  }

  public mouse_interaction(isParallelPlot: boolean): void {
    this.axes.forEach((axis, index) => axis.on('rubberBandChange', e => {
      this.is_drawing_rubber_band = true;
      this.selectionBox.rubberBandUpdate(e, ["x", "y"][index]);
    }));

    super.mouse_interaction(isParallelPlot);
  }
}

export class Histogram extends Frame {
  public bars: Bar[] = [];
  readonly barsColorFill: string = 'hsl(203, 90%, 85%)';
  readonly barsColorStroke: string = 'hsl(0, 0%, 0%)';
  constructor(
    public data: any,
    public width: number,
    public height: number,
    public buttons_ON: boolean,
    public X: number,
    public Y: number,
    public canvas_id: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, buttons_ON, X, Y, canvas_id, is_in_multiplot);
    }

  get nXTicks() {return this._nXTicks ? this._nXTicks : 20}

  set nXTicks(value: number) {this._nXTicks = value}

  get nYTicks() {return this._nYTicks ? this._nYTicks : 10}

  set nYTicks(value: number) {this._nYTicks = value}

  public reset(): void {
    super.reset();
    this.bars = [];
  }

  private buildNumberAxis(freeSize: number, frameOrigin: Vertex, yEnd: Vertex): newAxis {
    const numberAxis = this.setAxis('number', freeSize, frameOrigin, yEnd, this.nYTicks);
    numberAxis.initMaxValue = numberAxis.maxValue = Math.max(...this.features.get(this.yFeature)) + 1;
    numberAxis.initMinValue = numberAxis.minValue = 0;
    numberAxis.nTicks = this.nYTicks;
    numberAxis.saveLocation();
    return numberAxis
  }

  private updateNumberAxis(numberAxis: newAxis, bars: Bar[]): newAxis {
    this.features.set('number', this.getNumberFeature(bars));
    numberAxis.maxValue = Math.max(...this.features.get(this.yFeature)) + 1;
    numberAxis.saveLocation();
    return numberAxis
  }

  private getNumberFeature(bars: Bar[]): number[] {
    const numberFeature = this.features.get(this.xFeature).map(() => 0);
    bars.forEach(bar => {bar.values.forEach(value => numberFeature[value] = bar.length)});
    return numberFeature
  }

  private boundedTicks(axis: newAxis): number[] {
    let fakeTicks = [axis.minValue].concat(axis.ticks);
    fakeTicks.push(axis.maxValue)
    return fakeTicks
  }

  private computeBars(axis: newAxis, vector: number[]): Bar[] {
    const numericVector = axis.stringsToValues(vector);
    let fakeTicks = this.boundedTicks(axis);
    let bars = Array.from(Array(fakeTicks.length - 1), () => new Bar([]));
    let barValues = Array.from(Array(fakeTicks.length - 1), () => []);
    numericVector.forEach((value, valIdx) => {
      for (let tickIdx = 0 ; tickIdx < fakeTicks.length - 1 ; tickIdx++ ) {
        if (value >= fakeTicks[tickIdx] && value < fakeTicks[tickIdx + 1]) {
          bars[tickIdx].values.push(valIdx);
          barValues[tickIdx].push(value);
          break
        }
      }
    });
    barValues.forEach((values, index) => { bars[index].computeStats(values) });
    return bars
  }

  public computeRelativeObjects(): void {
    this.bars = this.computeBars(this.axes[0], this.features.get(this.xFeature));
    this.axes[1] = this.updateNumberAxis(this.axes[1], this.bars);
    this.getBarsDrawing();
  }

  public drawRelativeObjects(): void {
    this.bars.forEach(bar => { bar.buildPath() ; bar.draw(this.context_show) });
    this.relativeObjects = this.bars;
  }

  public objectStateUpdate(context: CanvasRenderingContext2D, object: any, index: number, mouseCoords: Vertex, stateName: string, keepState: boolean, invertState: boolean): void {
    if (object instanceof Bar) this.plottedObjectStateUpdate(context, object, mouseCoords, stateName, keepState, invertState)
    else super.objectStateUpdate(context, object, index, mouseCoords, stateName, keepState, invertState);
  }

  public getBarsDrawing(): void {
    const fullTicks = this.boundedTicks(this.axes[0]);
    this.bars.forEach((bar, index) => {
      let origin = new Vertex(fullTicks[index], 0);
      let size = new Vertex(fullTicks[index + 1] - fullTicks[index], bar.length);
      if (this.axes[0].isDiscrete) {origin.x = origin.x - size.x / 2};

      bar.setGeometry(origin, size);
      bar.fillStyle = this.barsColorFill;
      bar.strokeStyle = this.barsColorStroke;
      if (bar.values.some(valIdx => this.hoveredIndices.indexOf(valIdx) != -1)) {bar.isHovered = true}
      if (bar.values.some(valIdx => this.clickedIndices.indexOf(valIdx) != -1)) {bar.isClicked = true}
      if (bar.values.some(valIdx => this.selectedIndices.indexOf(valIdx) != -1)) {bar.isSelected = true}
    })
  }

  public setAxes(): newAxis[] {
    const [frameOrigin, xEnd, yEnd, freeSize] = this.setFrameBounds();
    const xAxis = this.setAxis(this.xFeature, freeSize.y, frameOrigin, xEnd, this.nXTicks);
    const bars = this.computeBars(xAxis, this.features.get(this.xFeature));
    this.features.set('number', this.getNumberFeature(bars));
    const yAxis = this.buildNumberAxis(freeSize.x, frameOrigin, yEnd);
    return [xAxis, yAxis];
  }

  public setFeatures(data: any): [string, string] { return [data.x_variable, 'number'] }

  mouseTranslate(currentMouse: Vertex, mouseDown: Vertex): Vertex {
    return new Vertex(this.axes[0].isDiscrete ? 0 : mouseDown.x - currentMouse.x, 0)
  }

  wheel_interaction(mouse3X, mouse3Y, e): [number, number] { // TODO: REALLY NEEDS A REFACTOR
    // e.preventDefault();
    this.fusion_coeff = 1.2;
    var event = -Math.sign(e.deltaY);
    mouse3X = e.offsetX;
    mouse3Y = e.offsetY;
    if (!this.axes[0].isDiscrete) {
      if ((mouse3Y >= this.height - this.decalage_axis_y + this.Y) && (mouse3X > this.decalage_axis_x + this.X) && this.axis_ON) {
        if (event>0) {
          this.scaleX = this.scaleX * this.fusion_coeff;
          this.scroll_x++;
          this.originX = this.width/2 + this.fusion_coeff * (this.originX - this.width/2);
        } else if (event<0) {
          this.scaleX = this.scaleX/this.fusion_coeff;
          this.scroll_x--;
          this.originX = this.width/2 + 1/this.fusion_coeff * (this.originX - this.width/2);
        }
      } else {
          if (event>0)  var coeff = this.fusion_coeff; else coeff = 1/this.fusion_coeff;
          this.scaleX = this.scaleX*coeff;
          this.scroll_x = this.scroll_x + event;
          this.originX = mouse3X - this.X + coeff * (this.originX - mouse3X + this.X);
      }
      if (isNaN(this.scroll_x)) this.scroll_x = 0;
      if (isNaN(this.scroll_y)) this.scroll_y = 0;
    }
    return [mouse3X, mouse3Y];
  }
}


export class newScatter extends Frame {
  public points: ScatterPoint[] = [];
  public tooltipAttr: string[];
  readonly pointsColorFill: string = 'hsl(203, 90%, 85%)';
  readonly pointsColorStroke: string = 'hsl(0, 0%, 0%)';
  constructor(
    public data: any,
    public width: number,
    public height: number,
    public buttons_ON: boolean,
    public X: number,
    public Y: number,
    public canvas_id: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, buttons_ON, X, Y, canvas_id, is_in_multiplot);
      if (!data.tooltip) {this.tooltipAttr = Array.from(this.features.keys()) }
      else this.tooltipAttr = data.tooltip.attribute;
    }

  private computePoints(context: CanvasRenderingContext2D): ScatterPoint[] {
    const numericVectorX = this.axes[0].stringsToValues(this.features.get(this.xFeature));
    const numericVectorY = this.axes[1].stringsToValues(this.features.get(this.yFeature));
    const xCoords = [];
    const yCoords = [];
    for (let index = 0 ; index < numericVectorX.length ; index++) {
      const inCanvasX = numericVectorX[index] < this.axes[0].maxValue && numericVectorX[index] > this.axes[0].minValue;
      const inCanvasY = numericVectorY[index] < this.axes[1].maxValue && numericVectorY[index] > this.axes[1].minValue;
      if (inCanvasX && inCanvasY) {
        const [xCoord, yCoord] = this.projectPoint(numericVectorX[index], numericVectorY[index]);
        xCoords.push(xCoord);
        yCoords.push(yCoord);
      }
    }

    const mergedPoints = this.mergePoints(xCoords, yCoords);
    const points: ScatterPoint[] = [];
    mergedPoints.forEach(indexList => {
      let centerX = 0;
      let centerY = 0;
      let meanX = 0;
      let meanY = 0;
      let newPoint = new ScatterPoint(indexList, 0, 0, 4, "circle", undefined, "hsl(203, 90%, 85%)");
      indexList.forEach(index => {
        centerX += xCoords[index];
        centerY += yCoords[index];
        meanX += numericVectorX[index];
        meanY += numericVectorY[index];
        if (!newPoint.isHovered) { if (this.hoveredIndices.indexOf(index) != -1) newPoint.isHovered = true };
        if (!newPoint.isClicked) { if (this.clickedIndices.indexOf(index) != -1) newPoint.isClicked = true };
        if (!newPoint.isSelected) { if (this.selectedIndices.indexOf(index) != -1) newPoint.isSelected = true };
      });
      newPoint.center.x = centerX / indexList.length;
      newPoint.center.y = centerY / indexList.length;
      newPoint.mean.x = meanX / indexList.length;
      newPoint.mean.y = meanY / indexList.length;
      newPoint.update();
      newPoint.draw(context);
      points.push(newPoint);
    })
    return points
  }

  private projectPoint(xCoord: number, yCoord: number) {
    return [xCoord * this.relativeMatrix.a + this.relativeMatrix.e, yCoord * this.relativeMatrix.d + this.relativeMatrix.f]
  }

  public objectStateUpdate(context: CanvasRenderingContext2D, object: any, index:number, mouseCoords: Vertex, stateName: string, keepState: boolean, invertState: boolean): void {
    if (object instanceof ScatterPoint) this.plottedObjectStateUpdate(context, object, mouseCoords, stateName, keepState, invertState)
    else super.objectStateUpdate(context, object, index, mouseCoords, stateName, keepState, invertState)
  }

  public drawAbsoluteObjects(context: CanvasRenderingContext2D): void {
    this.points = this.computePoints(context);
    this.absoluteObjects = this.points;
    this.drawSelectionBox(context);
  };

  public distanceMatrix(xCoords: number[], yCoords: number[]): number[][] {
    let squareDistances = new Array(xCoords.length);
    for (let i = 0; i < xCoords.length; i++) {
      if (squareDistances[i] == undefined) squareDistances[i] = new Array(xCoords.length);
      for (let j = i; j < xCoords.length; j++) {
        squareDistances[i][j] = (xCoords[i] - xCoords[j])**2 + (yCoords[i] - yCoords[j])**2;
        if (squareDistances[j] == undefined) squareDistances[j] = new Array(xCoords.length);
        squareDistances[j][i] = squareDistances[i][j];
      }
    }
    return squareDistances
  }

  public agglomerativeClustering(xCoords: number[], yCoords: number[], minDistance: number = 15): number[][] {
    const squareDistances = this.distanceMatrix(xCoords, yCoords);
    const pickedPoints = new Array(squareDistances.length).fill(false);
    const squaredDist = minDistance**2;
    const clusteredPoints = [];
    squareDistances.forEach((distances, row) => {
      if (!pickedPoints[row]) {
        clusteredPoints.push([]);
        distances.forEach((distance, col) => {
          if (distance <= squaredDist && !pickedPoints[col]) {
            clusteredPoints[clusteredPoints.length - 1].push(col);
            pickedPoints[col] = true;
          }
        })
      }
    })
    return clusteredPoints
  }

  public mergePoints(xCoords: number[], yCoords: number[], minDistance: number = 15): number[][] {
    const squareDistances = this.distanceMatrix(xCoords, yCoords);
    const pickedPoints = new Array(squareDistances.length).fill(false);
    const squaredDist = minDistance**2;
    const mergedPoints = [];
    const indexLists = new Array(squareDistances.length).fill([]);
    const closedPoints = new Array(squareDistances.length).fill(0);
    squareDistances.forEach((squareDistance, pIndex) => {
      const newList = []
      let nPoints = 0;
      squareDistance.forEach((distance, dIndex) => { if (distance <= squaredDist) { nPoints++ ; newList.push(dIndex) }});
      closedPoints[pIndex] = nPoints;
      indexLists[pIndex] = newList;
    })
    let count = 0;
    while (sum(closedPoints) != 0) {
      const centerIndex = argMax(closedPoints)[1];
      const newCluster = [];
      closedPoints[centerIndex] = 0;
      indexLists[centerIndex].forEach(index => {
        if (!pickedPoints[index]) newCluster.push(index);
        closedPoints[index] = 0;
        pickedPoints[index] = true;
      })
      mergedPoints.push(newCluster);
      count++;
    }
    return mergedPoints
  }
}

function argMin(array: number[]): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let argMin = -1;
  array.forEach((value, index) => {
    if (value < min) {
      min = value;
      argMin = index;
    }
  })
  return [min, argMin]
}

function argMax(array: number[]): [number, number] {
  let max = Number.NEGATIVE_INFINITY;
  let argMax = -1;
  array.forEach((value, index) => {
    if (value > max) {
      max = value;
      argMax = index;
    }
  })
  return [max, argMax]
}

function sum(array: number[]): number {
  let sum = 0;
  array.forEach(value => sum += value);
  return sum
}
