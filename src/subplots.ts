import { PlotData, Buttons, Interactions } from "./plot-data";
import { Attribute, Axis, Sort, set_default_values, TypeOf, RubberBand, Vertex, newAxis, ScatterPoint, Bar, DrawingCollection, SelectionBox, GroupCollection,
  LineSequence, newRect, newPointStyle } from "./utils";
import { Heatmap, PrimitiveGroup } from "./primitives";
import { List, Shape, MyObject } from "./toolbox";
import { Graph2D, Scatter } from "./primitives";
import { string_to_hex, string_to_rgb, get_interpolation_colors, rgb_to_string, colorHex, colorHsl } from "./color_conversion";
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
      var exceptions = ['name', 'object_class'];
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
        this.hexs.push(colorHex(rgb));
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


const OFFSET_MULTIPLIER: Vertex = new Vertex(0.035, 0.07);
const MARGIN_MULTIPLIER: number = 0.01;
export class Figure extends PlotData {
  public axes: newAxis[] = [];
  public drawnFeatures: string[];
  public origin: Vertex;
  public size: Vertex;
  public translation: Vertex = new Vertex(0, 0);

  public hoveredIndices: number[];
  public clickedIndices: number[];
  public selectedIndices: number[];

  public nSamples: number;
  public pointSets: number[];
  public pointSetColors: string[] = [];
  public pointStyles: newPointStyle[] = null;

  public isSelecting: boolean = false;
  public selectionBox = new SelectionBox();
  public isZooming: boolean = false;

  public viewPoint: Vertex = new Vertex(0, 0);
  public fixedObjects: DrawingCollection;
  public absoluteObjects: GroupCollection;
  public relativeObjects: GroupCollection;

  public font: string = "sans-serif";

  protected offset: Vertex;
  protected margin: Vertex;
  protected initScale: Vertex = new Vertex(1, -1);
  private _axisStyle = new Map<string, any>([['strokeStyle', 'hsl(0, 0%, 30%)']]);

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
      this.origin = new Vertex(0, 0);
      this.size = new Vertex(width - X, height - Y);
      this.features = this.unpackData(data);
      this.nSamples = this.features.entries().next().value[1].length; // a little bit cumbersome
      this.initSelectors();
      this.scaleX = this.scaleY = 1;
      this.TRL_THRESHOLD /= Math.min(Math.abs(this.initScale.x), Math.abs(this.initScale.y));
      this.refresh_MinMax();
      this.unpackAxisStyle(data);
      this.pointSets = new Array(this.nSamples).fill(-1);
      this.drawnFeatures = this.setFeatures(data);
      this.axes = this.setAxes();
      this.fixedObjects = new DrawingCollection(this.axes, this.canvasMatrix);
      this.relativeObjects = new GroupCollection();
      this.absoluteObjects = new GroupCollection();
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

  protected unpackAxisStyle(data:any): void {
    if (data.axis?.axis_style?.color_stroke) this.axisStyle.set("strokeStyle", data.axis.axis_style.color_stroke);
    if (data.axis?.axis_style?.line_width) this.axisStyle.set("lineWidth", data.axis.axis_style.line_width);
    if (data.axis?.graduation_style?.font_style) this.axisStyle.set("font", data.axis.graduation_style.font_style);
    if (data.axis?.graduation_style?.font_size) this.axisStyle.set("ticksFontsize", data.axis.graduation_style.font_size);
  }

  protected unpackData(data: any): Map<string, any[]> {
    const featuresKeys: string[] = Array.from(Object.keys(data.elements[0].values));
    const unpackedData = new Map<string, any[]>();
    featuresKeys.push("name");
    featuresKeys.forEach(feature => unpackedData.set(feature, data.elements.map(element => element[feature])));
    return unpackedData
  }

  private drawCanvas(): void {
    this.context = this.context_show;
    this.draw_empty_canvas(this.context_show);
    if (this.settings_on) this.draw_settings_rect()
    else this.draw_rect();
    this.context_show.beginPath();
    this.context_show.rect(this.X, this.Y, this.width, this.height);
    this.context_show.closePath();
  }

  public updateAxes(): void {
    const axesSelections = [];
    this.axes.forEach(axis => {
      axis.update(this.axisStyle, this.viewPoint, new Vertex(this.scaleX, this.scaleY), this.translation);
      if (axis.rubberBand.length != 0) axesSelections.push(this.updateSelected(axis));
    })
    this.updateSelection(axesSelections);
  }

  protected setFeatures(data: any): string[] { return data.attribute_names ?? Array.from(this.features.keys()) }

  protected computeOffset(): Vertex {
    const naturalOffset = new Vertex(this.width * OFFSET_MULTIPLIER.x, this.height * OFFSET_MULTIPLIER.y);
    const MIN_FONTSIZE = 6;
    const calibratedMeasure = 33;
    return new Vertex(Math.max(naturalOffset.x, calibratedMeasure), Math.max(naturalOffset.y, MIN_FONTSIZE));
  }

  protected setFrameBounds() {
    this.offset = this.computeOffset();
    this.margin = new Vertex(this.size.x * MARGIN_MULTIPLIER, this.size.y * MARGIN_MULTIPLIER).add(new Vertex(10, 10));
    return this.computeBounds()
  }

  private computeBounds(): [Vertex, Vertex, Vertex] {
    const drawOrigin = this.offset.add(new Vertex(this.X, this.Y).scale(this.initScale));
    const drawEnd = new Vertex(this.size.x - this.margin.x + this.X * this.initScale.x,  this.size.y - this.margin.y + this.Y * this.initScale.y);
    const freeSize = drawOrigin.copy();
    if (this.canvasMatrix.a < 0) this.swapDimension("x", drawOrigin, drawEnd, freeSize);
    if (this.canvasMatrix.d < 0) this.swapDimension("y", drawOrigin, drawEnd, freeSize);
    return [drawOrigin, drawEnd, freeSize]
  }

  private swapDimension(dimension: string, origin: Vertex, end: Vertex, freeSize: Vertex): void {
    origin[dimension] = origin[dimension] - this.size[dimension];
    end[dimension] = end[dimension] - this.size[dimension];
    freeSize[dimension] = this.size[dimension] + origin[dimension];
  }

  protected setAxes(): newAxis[] {
    const [drawOrigin, drawEnd, freeSize] = this.setFrameBounds();
    return this.buildAxes(drawOrigin, drawEnd, freeSize)
  }

  protected buildAxes(drawOrigin: Vertex, drawEnd: Vertex, freeSize: Vertex): [newAxis, newAxis] { return }

  protected transformAxes(drawOrigin: Vertex, drawEnd: Vertex): void {}

  protected setAxis(feature: string, freeSize: number, origin: Vertex, end: Vertex, nTicks: number = undefined): newAxis {
    return new newAxis(this.features.get(feature), freeSize, origin, end, feature, this.initScale, nTicks)
  }

  private relocateAxes(): void {
    const [drawOrigin, drawEnd] = this.computeBounds();
    this.transformAxes(drawOrigin, drawEnd);
  }

  public updateSelection(axesSelections: number[][]): void {
    if (!this.is_in_multiplot) this.selectedIndices = Figure.intersectArrays(axesSelections);
  }

  public static intersectArrays(arrays: any[][]): any[] {
    if (arrays.length == 1) return arrays[0]
    if (arrays.length == 0) return []
    const arraysIntersection = [...arrays[0]];
    arrays[0].forEach(value => {
      arrays.slice(1).forEach(array => {
        if (!array.includes(value)) arraysIntersection.splice(arraysIntersection.indexOf(value), 1);
      })
    })
    return arraysIntersection
  }

  protected updateSize(): void { this.size = new Vertex(this.width, this.height) }

  protected resetAxes(): void { this.axes.forEach(axis => axis.reset()) }

  public reset_scales(): void { // TODO: merge with resetView
    this.updateSize();
    this.relocateAxes();
    this.axes.forEach(axis => axis.resetScale());
  }

  public resetView(): void { this.reset_scales(); this.draw() }

  public initSelectors(): void {
    this.hoveredIndices = [];
    this.clickedIndices = [];
    this.selectedIndices = [];
  }

  protected resetSelectors(): void {
    this.selectionBox = new SelectionBox();
    this.initSelectors();
  }

  protected reset(): void {
    this.resetAxes();
    this.resetSelectors();
  }

  protected resetSelection(): void {
    this.axes.forEach(axis => axis.rubberBand.reset());
    this.resetSelectors();
  }

  public updateSelected(axis: newAxis): number[] {
    const selection = [];
    const vector = axis.stringsToValues(this.features.get(axis.name));
    vector.forEach((value, index) => { if (axis.isInRubberBand(value)) selection.push(index) });
    return selection
  }

  protected isRubberBanded(): boolean {
    let isRubberBanded = true;
    this.axes.forEach(axis => isRubberBanded = isRubberBanded && axis.rubberBand.length != 0);
    return isRubberBanded
  }

  protected drawAxes(): void { this.axes.forEach(axis => axis.draw(this.context_show)) }

  private drawZoneRectangle(context: CanvasRenderingContext2D): void {
    // TODO: change with newRect
    Shape.rect(this.X, this.Y, this.width, this.height, context, "hsl(203, 90%, 88%)", "hsl(0, 0%, 0%)", 1, 0.3, [15,15]);
  }

  protected drawRelativeObjects() {}

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D) {
    this.absoluteObjects = new GroupCollection();
    this.drawSelectionBox(context);
  }

  protected computeRelativeObjects() {}

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

  public switchSelection(): void { this.isSelecting = !this.isSelecting; this.draw() }

  public switchMerge(): void {}

  public switchZoom(): void { this.isZooming = !this.isZooming }

  public togglePoints(): void {}

  protected updateSelectionBox(frameDown: Vertex, frameMouse: Vertex): void { this.selectionBox.update(frameDown, frameMouse) }

  public get drawingZone(): [Vertex, Vertex] { return [new Vertex(this.X, this.Y), this.size] }

  protected drawSelectionBox(context: CanvasRenderingContext2D) {
    if ((this.isSelecting || this.is_drawing_rubber_band) && this.selectionBox.isDefined) {
      const [drawingOrigin, drawingSize] = this.drawingZone;
      this.selectionBox.buildRectFromHTMatrix(drawingOrigin, drawingSize, this.relativeMatrix);
      if (this.selectionBox.area != 0) {
        this.selectionBox.buildPath();
        this.selectionBox.draw(context);
        this.absoluteObjects.drawings.push(this.selectionBox);
      }
    }
  }

  private drawZoomBox(zoomBox: SelectionBox, frameDown: Vertex, frameMouse: Vertex, context: CanvasRenderingContext2D): void {
    zoomBox.update(frameDown, frameMouse);
    const [drawingOrigin, drawingSize] = this.drawingZone;
    zoomBox.buildRectFromHTMatrix(drawingOrigin, drawingSize, this.relativeMatrix);
    zoomBox.buildPath();
    zoomBox.draw(context);
  }

  protected zoomBoxUpdateAxes(zoomBox: SelectionBox): void { // TODO: will not work for a 3+ axes plot
    this.axes[0].minValue = Math.min(zoomBox.minVertex.x, zoomBox.maxVertex.x);
    this.axes[0].maxValue = Math.max(zoomBox.minVertex.x, zoomBox.maxVertex.x);
    this.axes[1].minValue = Math.min(zoomBox.minVertex.y, zoomBox.maxVertex.y);
    this.axes[1].maxValue = Math.max(zoomBox.minVertex.y, zoomBox.maxVertex.y);
    this.axes.forEach(axis => axis.saveLocation());
    this.updateAxes();
  }

  private drawTooltips(): void {
    this.relativeObjects.drawTooltips(new Vertex(this.X, this.Y), this.size, this.context_show, this.is_in_multiplot);
    this.absoluteObjects.drawTooltips(new Vertex(this.X, this.Y), this.size, this.context_show, this.is_in_multiplot);
  }

  protected stateUpdate(context: CanvasRenderingContext2D, canvasMouse: Vertex, absoluteMouse: Vertex,
    frameMouse: Vertex, stateName: string, keepState: boolean, invertState: boolean): void {
      this.fixedObjects.updateMouseState(context, canvasMouse, stateName, keepState, invertState);
      this.absoluteObjects.updateMouseState(context, absoluteMouse, stateName, keepState, invertState);
      this.relativeObjects.updateMouseState(context, frameMouse, stateName, keepState, invertState);
    }

  public mouseTranslate(currentMouse: Vertex, mouseDown: Vertex): Vertex {
    return currentMouse.subtract(mouseDown)
  }

  public mouseMove(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): void {
    this.stateUpdate(this.context_show, canvasMouse, absoluteMouse, frameMouse, 'isHovered', false, false);
  }

  public projectMouse(e: MouseEvent): [Vertex, Vertex, Vertex] {
    const mouseCoords = new Vertex(e.offsetX, e.offsetY);
    return [mouseCoords.scale(this.initScale), mouseCoords.transform(this.relativeMatrix.inverse()), mouseCoords]
  }

  public mouseDown(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, any] {
    const fixedClickedObject = this.fixedObjects.mouseDown(canvasMouse);
    const absoluteClickedObject = this.absoluteObjects.mouseDown(absoluteMouse);
    const relativeClickedObject = this.relativeObjects.mouseDown(frameMouse);
    const clickedObject = fixedClickedObject ? fixedClickedObject : absoluteClickedObject ? absoluteClickedObject : relativeClickedObject ? relativeClickedObject : null
    return [canvasMouse, frameMouse, clickedObject]
  }

  public mouseUp(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex, canvasDown: Vertex, ctrlKey: boolean): void {
    if (this.interaction_ON) {
      if (this.translation.normL1 == 0 && canvasMouse.subtract(canvasDown).normL1 <= this.TRL_THRESHOLD) {
        this.stateUpdate(this.context_show, canvasMouse, absoluteMouse, frameMouse, 'isClicked', ctrlKey, true);
      }
    }
  }

  public mouse_interaction(isParallelPlot: boolean): void {
    if (this.interaction_ON === true) {
      var clickedObject: any = null;
      var isDrawing = false;
      var canvasMouse = new Vertex(0, 0); var canvasDown = new Vertex(0, 0);
      var frameMouse = new Vertex(0, 0); var frameDown = new Vertex(0, 0);
      var absoluteMouse = new Vertex(0, 0);
      var mouse3X = 0; var mouse3Y = 0;
      var canvas = document.getElementById(this.canvas_id);
      var ctrlKey = false; var shiftKey = false;
      var zoomBox = new SelectionBox();
      window.addEventListener('keydown', e => {
        if (e.key == "Control") ctrlKey = true;
        if (e.key == "Shift") {
          shiftKey = true;
          if (!ctrlKey) { this.isSelecting = true; canvas.style.cursor = 'crosshair'; this.draw() };
        }
      });

      window.addEventListener('keyup', e => {
        if (e.key == "Control") ctrlKey = false;
        if (e.key == "Shift") { shiftKey = false; this.isSelecting = false; canvas.style.cursor = 'default'; this.draw() };
      });

      canvas.addEventListener('mousemove', e => {
        [canvasMouse, frameMouse, absoluteMouse] = this.projectMouse(e);
        this.mouseMove(canvasMouse, frameMouse, absoluteMouse);
        if (this.isZooming) canvas.style.cursor = 'crosshair';
        if (this.interaction_ON) {
          if (isDrawing) {
            if ( !(clickedObject instanceof SelectionBox) ) {
              if (!clickedObject?.mouseMove(canvasDown, canvasMouse) && !this.isSelecting && !this.isZooming) {
                canvas.style.cursor = 'move';
                this.translation = this.mouseTranslate(canvasMouse, canvasDown);
              }
            }
          }
          this.draw();
        }
        if (isDrawing) {
          if (this.isSelecting) {
            if (clickedObject instanceof SelectionBox) {
              clickedObject.mouseMove(frameDown, frameMouse);
              this.updateSelectionBox(clickedObject.minVertex, clickedObject.maxVertex);
            }
            else this.updateSelectionBox(frameDown, frameMouse);
          }
          if (this.isZooming) this.drawZoomBox(zoomBox, frameDown, frameMouse, this.context_show);
        }
        const mouseInCanvas = (e.offsetX >= this.X) && (e.offsetX <= this.width + this.X) && (e.offsetY >= this.Y) && (e.offsetY <= this.height + this.Y);
        if (!mouseInCanvas) { isDrawing = false };
      });

      canvas.addEventListener('mousedown', e => {
        [canvasDown, frameDown, clickedObject] = this.mouseDown(canvasMouse, frameMouse, absoluteMouse);
        this.is_drawing_rubber_band = clickedObject instanceof newAxis || this.isSelecting;
        if (ctrlKey && shiftKey) this.reset();
        isDrawing = true;
      });

      canvas.addEventListener('mouseup', e => {
        if (!shiftKey) canvas.style.cursor = 'default';
        if (this.isZooming) {
          this.switchZoom();
          this.zoomBoxUpdateAxes(zoomBox);
        }
        this.mouseUp(canvasMouse, frameMouse, absoluteMouse, canvasDown, ctrlKey);
        if (clickedObject) clickedObject.mouseUp();
        if (this.isSelecting) this.selectionBox.mouseUp();
        if ( !(clickedObject instanceof SelectionBox || shiftKey) ) this.isSelecting = false;
        if (!this.is_in_multiplot) this.is_drawing_rubber_band = false;
        clickedObject = null;
        this.draw();
        this.axes.forEach(axis => axis.saveLocation());
        this.translation = new Vertex(0, 0);
        isDrawing = false;
      })

      canvas.addEventListener('wheel', e => {
        if (this.interaction_ON) {
          let scale = new Vertex(this.scaleX, this.scaleY);
          [mouse3X, mouse3Y] = this.wheelFromEvent(e);
          this.drawAfterRescale(mouse3X, mouse3Y, scale);
        }
      });

      canvas.addEventListener('mouseleave', e => {
        isDrawing = false;
        ctrlKey = false;
        this.axes.forEach(axis => axis.saveLocation());
        this.translation = new Vertex(0, 0);
        canvas.style.cursor = 'default';
      });
    }
  }

  private drawAfterRescale(mouse3X: number, mouse3Y: number, scale: Vertex): void {
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

  public zoomIn(): void { this.zoom(new Vertex(this.X + this.size.x / 2, this.Y + this.size.y / 2), 342) }

  public zoomOut(): void { this.zoom(new Vertex(this.X + this.size.x / 2, this.Y + this.size.y / 2), -342) }

  private zoom(center: Vertex, zFactor: number): void {
    const [mouse3X, mouse3Y] = this.wheel_interaction(center.x, center.y, zFactor);
    this.drawAfterRescale(mouse3X, mouse3Y, new Vertex(1, 1));
  }

  public wheelFromEvent(e: WheelEvent): [number, number] { return this.wheel_interaction(e.offsetX, e.offsetY, -Math.sign(e.deltaY)) }

  public wheel_interaction(mouse3X: number, mouse3Y: number, deltaY: number): [number, number] { //TODO: TO REFACTOR !!!
    // e.preventDefault();
    this.fusion_coeff = 1.2;
    if ((mouse3Y>=this.height - this.decalage_axis_y + this.Y) && (mouse3X>this.decalage_axis_x + this.X) && this.axis_ON) {
        if (deltaY>0) {
          this.scaleX = this.scaleX*this.fusion_coeff;
          this.scroll_x++;
          this.originX = this.width/2 + this.fusion_coeff * (this.originX - this.width/2);
        } else if (deltaY<0) {
          this.scaleX = this.scaleX/this.fusion_coeff;
          this.scroll_x--;
          this.originX = this.width/2 + 1/this.fusion_coeff * (this.originX - this.width/2);
        }

    } else if ((mouse3X<=this.decalage_axis_x + this.X) && (mouse3Y<this.height - this.decalage_axis_y + this.Y) && this.axis_ON) {
        if (deltaY>0) {
          this.scaleY = this.scaleY*this.fusion_coeff;
          this.scroll_y++;
          this.originY = this.height/2 + this.fusion_coeff * (this.originY - this.height/2);
        } else if (deltaY<0) {
          this.scaleY = this.scaleY/this.fusion_coeff;
          this.scroll_y--;
          this.originY = this.height/2 + 1/this.fusion_coeff * (this.originY - this.height/2);
        }

    } else {
        if (deltaY>0)  var coeff = this.fusion_coeff; else coeff = 1/this.fusion_coeff;
        this.scaleX = this.scaleX*coeff;
        this.scaleY = this.scaleY*coeff;
        this.scroll_x = this.scroll_x + deltaY;
        this.scroll_y = this.scroll_y + deltaY;
        this.originX = mouse3X - this.X + coeff * (this.originX - mouse3X + this.X);
        this.originY = mouse3Y - this.Y + coeff * (this.originY - mouse3Y + this.Y);
      }
      if (isNaN(this.scroll_x)) this.scroll_x = 0;
      if (isNaN(this.scroll_y)) this.scroll_y = 0;
      return [mouse3X, mouse3Y];
  }
}


export class Frame extends Figure {
  public xFeature: string;
  public yFeature: string;
  
  protected _nXTicks: number;
  protected _nYTicks: number;
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
      this.type_ = "frame";
    }

  get frameMatrix(): DOMMatrix {
    const relativeMatrix = this.axes[0].transformMatrix;
    relativeMatrix.d = this.axes[1].transformMatrix.a;
    relativeMatrix.f = this.axes[1].transformMatrix.f;
    return relativeMatrix
  }

  get relativeMatrix(): DOMMatrix { return this.canvasMatrix.multiply(this.frameMatrix) }

  get nXTicks(): number { return this._nXTicks ?? 10 }

  set nXTicks(value: number) { this._nXTicks = value }

  get nYTicks(): number { return this._nYTicks ?? 10 }

  set nYTicks(value: number) { this._nYTicks = value }

  get sampleDrawings(): GroupCollection { return this.relativeObjects }

  public get drawingZone(): [Vertex, Vertex] {
    const origin = new Vertex();
    origin.x = this.initScale.x < 0 ? this.axes[0].end.x : this.axes[0].origin.x;
    origin.y = this.initScale.y < 0 ? this.axes[1].end.y : this.axes[1].origin.y;
    const size = new Vertex(Math.abs(this.axes[0].end.x - this.axes[0].origin.x), Math.abs(this.axes[1].end.y - this.axes[1].origin.y))
    return [origin.transform(this.canvasMatrix.inverse()), size]
  }

  protected unpackAxisStyle(data: any): void {
    super.unpackAxisStyle(data);
    if (data.axis?.nb_points_x) this.nXTicks = data.axis.nb_points_x;
    if (data.axis?.nb_points_y) this.nYTicks = data.axis.nb_points_y;
  }

  protected stateUpdate(context: CanvasRenderingContext2D, canvasMouse: Vertex, absoluteMouse: Vertex,
    frameMouse: Vertex, stateName: string, keepState: boolean, invertState: boolean): void {
      super.stateUpdate(context, canvasMouse, absoluteMouse, frameMouse, stateName, keepState, invertState);
      if (stateName == "isHovered") this.hoveredIndices = this.sampleDrawings.updateSampleStates(stateName);
      if (stateName == 'isClicked') this.clickedIndices = this.sampleDrawings.updateSampleStates(stateName);
    }

  protected setFeatures(data: any): [string, string] {
    [this.xFeature, this.yFeature] = super.setFeatures(data);
    if (!this.xFeature) {
      this.xFeature = "indices";
      this.features.set("indices", Array.from(Array(this.nSamples).keys()));
    }
    if (!this.yFeature) {
      for (let key of Array.from(this.features.keys())) {
        if (!["name", "indices"].includes(key)) {
          this.yFeature = key;
          break;
        }
      }
    }
    return [this.xFeature, this.yFeature]
  }

  protected transformAxes(drawOrigin: Vertex, drawEnd: Vertex): void {
    super.transformAxes(drawOrigin, drawEnd);
    this.axes[0].transform(drawOrigin, new Vertex(drawEnd.x, drawOrigin.y));
    this.axes[1].transform(drawOrigin, new Vertex(drawOrigin.x, drawEnd.y));
  }

  protected buildAxes(drawOrigin: Vertex, drawEnd: Vertex, freeSize: Vertex): [newAxis, newAxis] {
    super.buildAxes(drawOrigin, drawEnd, freeSize);
    return [
      this.setAxis(this.xFeature, freeSize.y, drawOrigin, new Vertex(drawEnd.x, drawOrigin.y), this.nXTicks),
      this.setAxis(this.yFeature, freeSize.x, drawOrigin, new Vertex(drawOrigin.x, drawEnd.y), this.nYTicks)
    ]
  }

  protected drawAxes() {
    super.drawAxes();
    if (this.isRubberBanded()) this.updateSelectionBox(...this.rubberBandsCorners);
  }

  protected updateSelectionBox(frameDown: Vertex, frameMouse: Vertex) {
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

  public fillStyle: string = 'hsl(203, 90%, 85%)';
  public strokeStyle: string = 'hsl(0, 0%, 0%)';
  public lineWidth: number = 1;
  public dashLine: number[] = [];

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
      this.unpackBarStyle(data);
    }

  get nXTicks() {return this._nXTicks ? this._nXTicks : 20}

  set nXTicks(value: number) {this._nXTicks = value}

  get nYTicks() {return this._nYTicks ? this._nYTicks : 10}

  set nYTicks(value: number) {this._nYTicks = value}

  protected unpackAxisStyle(data: any): void {
    super.unpackAxisStyle(data);
    if (data.graduation_nb) this.nXTicks = data.graduation_nb;
  }

  public unpackBarStyle(data: any): void {
    if (data.surface_style?.color_fill) this.fillStyle = data.surface_style.color_fill;
    if (data.edge_style?.line_width) this.lineWidth = data.edge_style.line_width;
    if (data.edge_style?.color_stroke) this.strokeStyle = data.edge_style.color_stroke;
    if (data.edge_style?.dashline) this.dashLine = data.edge_style.dashline;
  }

  protected reset(): void {
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
    bars.forEach(bar => bar.values.forEach(value => numberFeature[value] = bar.length));
    return numberFeature
  }

  private boundedTicks(axis: newAxis): number[] {
    let fakeTicks = [axis.minValue].concat(axis.ticks);
    fakeTicks.push(axis.maxValue)
    return fakeTicks
  }

  private computeBars(vector: number[]): Bar[] {
    const baseAxis = this.axes[0] ?? this.setAxis(this.xFeature, 0, new Vertex(), new Vertex(), this.nXTicks);
    const numericVector = baseAxis.stringsToValues(vector);
    let fakeTicks = this.boundedTicks(baseAxis);
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
    barValues.forEach((values, index) => bars[index].computeStats(values));
    return bars
  }

  protected computeRelativeObjects(): void {
    super.computeRelativeObjects();
    this.bars = this.computeBars(this.features.get(this.xFeature));
    this.axes[1] = this.updateNumberAxis(this.axes[1], this.bars);
    this.getBarsDrawing();
  }

  protected drawRelativeObjects(): void {
    super.drawRelativeObjects();
    this.bars.forEach(bar => {
      bar.buildPath();
      bar.draw(this.context_show);
    });
    this.relativeObjects = new GroupCollection([...this.bars], this.relativeMatrix);
  }

  private getBarsDrawing(): void {
    const fullTicks = this.boundedTicks(this.axes[0]);
    const minY = this.boundedTicks(this.axes[1])[0];
    this.bars.forEach((bar, index) => {
      let origin = new Vertex(fullTicks[index], minY);
      let size = new Vertex(fullTicks[index + 1] - fullTicks[index], bar.length > minY ? bar.length - minY : 0);
      if (this.axes[0].isDiscrete) {origin.x = origin.x - size.x / 2};

      bar.setGeometry(origin, size);
      bar.fillStyle = this.fillStyle;
      bar.strokeStyle = this.strokeStyle;
      bar.dashLine = this.dashLine;
      bar.lineWidth = this.lineWidth;
      if (bar.values.some(valIdx => this.hoveredIndices.includes(valIdx))) bar.isHovered = true;
      if (bar.values.some(valIdx => this.clickedIndices.includes(valIdx))) bar.isClicked = true;
      if (bar.values.some(valIdx => this.selectedIndices.includes(valIdx))) bar.isSelected = true;
    })
  }

  protected buildAxes(drawOrigin: Vertex, drawEnd: Vertex, freeSize: Vertex): [newAxis, newAxis] {
    const bars = this.computeBars(this.features.get(this.xFeature));
    this.features.set('number', this.getNumberFeature(bars));
    let [xAxis, yAxis] = super.buildAxes(drawOrigin, drawEnd, freeSize);
    yAxis = this.buildNumberAxis(freeSize.x, drawOrigin, new Vertex(drawOrigin.x, drawEnd.y));
    return [xAxis, yAxis]
  }

  protected setFeatures(data: any): [string, string] {
    data["attribute_names"] = [data.x_variable, 'number']; // legacy, will disappear
    return super.setFeatures(data);
  }

  public mouseTranslate(currentMouse: Vertex, mouseDown: Vertex): Vertex {
    const translation = super.mouseTranslate(currentMouse, mouseDown);
    return new Vertex(this.axes[0].isDiscrete ? 0 : translation.x, 0)
  }

  public wheel_interaction(mouse3X: number, mouse3Y: number, deltaY: number): [number, number] { // TODO: REALLY NEEDS A REFACTOR
    // e.preventDefault();
    this.fusion_coeff = 1.2;
    if (!this.axes[0].isDiscrete) {
      if ((mouse3Y >= this.height - this.decalage_axis_y + this.Y) && (mouse3X > this.decalage_axis_x + this.X) && this.axis_ON) {
        if (deltaY>0) {
          this.scaleX = this.scaleX * this.fusion_coeff;
          this.scroll_x++;
          this.originX = this.width/2 + this.fusion_coeff * (this.originX - this.width/2);
        } else if (deltaY<0) {
          this.scaleX = this.scaleX/this.fusion_coeff;
          this.scroll_x--;
          this.originX = this.width/2 + 1/this.fusion_coeff * (this.originX - this.width/2);
        }
      } else {
          if (deltaY>0)  var coeff = this.fusion_coeff; else coeff = 1/this.fusion_coeff;
          this.scaleX = this.scaleX*coeff;
          this.scroll_x = this.scroll_x + deltaY;
          this.originX = mouse3X - this.X + coeff * (this.originX - mouse3X + this.X);
      }
      if (isNaN(this.scroll_x)) this.scroll_x = 0;
      if (isNaN(this.scroll_y)) this.scroll_y = 0;
    }
    return [mouse3X, mouse3Y];
  }
}

const DEFAULT_POINT_COLOR: string = 'hsl(203, 90%, 85%)';
export class newScatter extends Frame {
  public points: ScatterPoint[] = [];

  public fillStyle: string = DEFAULT_POINT_COLOR;
  public strokeStyle: string = null;
  public marker: string = 'circle';
  public pointSize: number = 8;
  public lineWidth: number = 1;

  public tooltipAttributes: string[];
  public isMerged: boolean = false;
  public clusterColors: string[];
  public previousCoords: Vertex[];
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
      if (!data.tooltip) this.tooltipAttributes = Array.from(this.features.keys());
      else this.tooltipAttributes = data.tooltip.attribute;
      this.unpackPointStyle(data);
      this.computePoints();
    }

  get sampleDrawings(): GroupCollection { return this.absoluteObjects }

  public unpackPointStyle(data: any): void {
    if (data.point_style?.color_fill) this.fillStyle = data.point_style.color_fill;
    if (data.point_style?.color_stroke) this.strokeStyle = data.point_style.color_stroke;
    if (data.point_style?.shape) this.marker = data.point_style.shape;
    if (data.point_style?.stroke_width) this.lineWidth = data.point_style.stroke_width;
    if (data.point_style?.size) this.pointSize = data.point_style.size;
    if (data.tooltip) this.tooltipAttributes = data.tooltip.attributes;
    if (data.points_sets) this.unpackPointsSets(data);
  }

  private unpackPointsSets(data: any): void {
    data.points_sets.forEach((pointSet, setIndex) => {
      pointSet.point_index.forEach(pointIndex => {
        this.pointSets[pointIndex] = setIndex;
      })
      this.pointSetColors.push(pointSet.color);
    })
  }

  public reset_scales(): void {
    super.reset_scales();
    this.computePoints();
  }

  protected reset(): void {
    super.reset();
    this.computePoints();
    this.resetClusters();
  }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D): void {
    this.drawPoints(context);
    super.drawAbsoluteObjects(context);
    this.absoluteObjects.drawings.unshift(...this.points);
  };

  protected drawPoints(context: CanvasRenderingContext2D): void {
    const axesOrigin = this.axes[0].origin;
    const axesEnd = new Vertex(this.axes[0].end.x, this.axes[1].end.y);
    this.points.forEach(point => {
      let color = this.fillStyle;
      const colors = new Map<string, number>();
      point.isHovered = point.isClicked = point.isSelected = false;
      point.values.forEach(index => {
        if (this.clusterColors) {
          const currentColorCounter = this.clusterColors[index];
          colors.set(currentColorCounter, colors.get(currentColorCounter) ? colors.get(currentColorCounter) + 1 : 1);
        }
        if (this.hoveredIndices.includes(index)) point.isHovered = true;
        if (this.clickedIndices.includes(index)) point.isClicked = true;
        if (this.selectedIndices.includes(index)) point.isSelected = true;
      });
      if (colors.size != 0) color = mapMax(colors)[0]
      else {
        const pointsSetIndex = this.getPointSet(point);
        if (pointsSetIndex != -1) color = colorHsl(this.pointSetColors[pointsSetIndex]);
      };
      point.lineWidth = this.lineWidth;
      point.setColors(color);
      if (this.pointStyles) {
        if (!this.clusterColors) point.updateStyle(this.pointStyles[point.values[0]])
        else {
          let clusterPointStyle = Object.assign({}, this.pointStyles[point.values[0]], { strokeStyle: null });
          point.updateStyle(clusterPointStyle);
        }
      } else point.marker = this.marker;
      point.update();
      if (point.isInFrame(axesOrigin, axesEnd, this.initScale)) point.draw(context);
    })
  }

  private getPointSet(point: ScatterPoint): number {
    const pointSets = new Map<number, number>();
    point.values.forEach(pointIndex => {
      const currentPoint = this.pointSets[pointIndex];
      pointSets.set(currentPoint, pointSets.get(currentPoint) ? pointSets.get(currentPoint) + 1 : 1);
    })
    if (pointSets.size > 1) pointSets.delete(-1);
    return mapMax(pointSets)[0]
  }

  public switchMerge(): void {
    this.isMerged = !this.isMerged;
    this.computePoints();
    this.draw();
  }

  protected zoomBoxUpdateAxes(zoomBox: SelectionBox): void { // TODO: will not work for a 3+ axes plot
    super.zoomBoxUpdateAxes(zoomBox);
    this.computePoints();
  }

  public computePoints(): void {
    const thresholdDist = 30;
    const [xCoords, yCoords, xValues, yValues] = this.projectPoints();
    const pointsData = {"xCoords": xCoords, "yCoords": yCoords, "xValues": xValues, "yValues": yValues};
    const mergedPoints = this.mergePoints(xCoords, yCoords, thresholdDist);
    this.points = mergedPoints.map(mergedIndices => {
      return ScatterPoint.fromPlottedValues(
        mergedIndices, pointsData, this.pointSize, this.marker, thresholdDist,
        this.tooltipAttributes, this.features, this.axes, this.xFeature, this.yFeature
        )
    });
  }

  private mergePoints(xCoords: number[], yCoords: number[], minDistance: number = 15): number[][] {
    if (!this.isMerged) return [...Array(xCoords.length).keys()].map(x => [x]);
    const squareDistances = this.distanceMatrix(xCoords, yCoords);
    const threshold = minDistance**2;
    const mergedPoints = [];
    const pointsGroups = new Array(squareDistances.length).fill([]);
    const closedPoints = new Array(squareDistances.length).fill(0);
    const pickedPoints = new Array(squareDistances.length).fill(false);
    squareDistances.forEach((squareDistance, pointIndex) => {
      const pointGroup = []
      let nPoints = 0;
      squareDistance.forEach((distance, otherIndex) => {
        if (distance <= threshold) {
          nPoints++;
          pointGroup.push(otherIndex);
        }
      });
      closedPoints[pointIndex] = nPoints;
      pointsGroups[pointIndex] = pointGroup;
    })

    while (sum(closedPoints) != 0) {
      const centerIndex = argMax(closedPoints)[1];
      const cluster = [];
      closedPoints[centerIndex] = 0;
      pointsGroups[centerIndex].forEach(index => {
        if (!pickedPoints[index]) {
          cluster.push(index);
          pickedPoints[index] = true
        }
        closedPoints[index] = 0;
      })
      mergedPoints.push(cluster);
    }
    return mergedPoints
  }

  private projectPoints(): [number[], number[], number[], number[]] {
    const xValues = this.axes[0].stringsToValues(this.features.get(this.xFeature));
    const yValues = this.axes[1].stringsToValues(this.features.get(this.yFeature));
    const xCoords = [];
    const yCoords = [];
    for (let index = 0 ; index < xValues.length ; index++) {
      const [xCoord, yCoord] = this.projectPoint(xValues[index], yValues[index]);
      xCoords.push(xCoord);
      yCoords.push(yCoord);
    }
    return [xCoords, yCoords, xValues, yValues]
  }

  private projectPoint(xCoord: number, yCoord: number): [number, number] {
    return [xCoord * this.relativeMatrix.a + this.relativeMatrix.e, yCoord * this.relativeMatrix.d + this.relativeMatrix.f]
  }

  private distanceMatrix(xCoords: number[], yCoords: number[]): number[][] {
    let squareDistances = new Array(xCoords.length);
    for (let i = 0; i < xCoords.length; i++) {
      if (!squareDistances[i]) squareDistances[i] = new Array(xCoords.length);
      for (let j = i; j < xCoords.length; j++) {
        squareDistances[i][j] = (xCoords[i] - xCoords[j])**2 + (yCoords[i] - yCoords[j])**2;
        if (!squareDistances[j]) squareDistances[j] = new Array(xCoords.length);
        squareDistances[j][i] = squareDistances[i][j];
      }
    }
    return squareDistances
  }

  private agglomerativeClustering(xValues: number[], yValues: number[], minDistance: number = 0.25): number[][] {
    const squareDistances = this.distanceMatrix(xValues, yValues);
    const threshold = minDistance**2;
    let pointsGroups = [];
    squareDistances.forEach(distances => {
      let pointsGroup = [];
      distances.forEach((distance, col) => { if (distance <= threshold) pointsGroup.push(col) });
      pointsGroups.push(pointsGroup);
    })

    let clusters = [];
    let nClusters = -1;
    let maxIter = 0;
    while (nClusters != clusters.length && maxIter < 100) {
      nClusters = clusters.length;
      clusters = [pointsGroups[0]];
      pointsGroups.slice(1).forEach(candidate => {
        let isCluster = true;
        clusters.forEach((cluster, clusterIndex) => {
          for (let i=0; i < candidate.length; i++) {
            if (cluster.includes(candidate[i])) {
              candidate.forEach(point => { if (!clusters[clusterIndex].includes(point)) clusters[clusterIndex].push(point) });
              isCluster = false;
              break;
            }
          }
        })
        if (isCluster) clusters.push(candidate);
      })
      pointsGroups = new Array(...clusters);
      maxIter++;
    }
    return clusters
  }

  public simpleCluster(inputValue: number): void { this.computeClusterColors(inputValue); this.draw() }

  public resetClusters(): void {
    this.clusterColors = null;
    this.points.forEach(point => point.setColors(DEFAULT_POINT_COLOR));
    this.draw();
   }

  private computeClusterColors(normedDistance: number = 0.33): void {
    const xValues = [...this.axes[0].stringsToValues(this.features.get(this.xFeature))];
    const yValues = [...this.axes[1].stringsToValues(this.features.get(this.yFeature))];
    const scaledX = normalizeArray(xValues);
    const scaledY = normalizeArray(yValues);
    const clusters = this.agglomerativeClustering(scaledX, scaledY, normedDistance);

    const colorRatio: number = 360 / clusters.length;
    this.clusterColors = new Array(xValues.length);
    let colorRadius: number = 0;
    clusters.forEach(cluster => {
      colorRadius += colorRatio;
      cluster.forEach(point => this.clusterColors[point] = `hsl(${colorRadius}, 50%, 50%, 90%)`);
    })
  }

  public mouseTranslate(currentMouse: Vertex, mouseDown: Vertex): Vertex {
    const translation = super.mouseTranslate(currentMouse, mouseDown);
    const pointTRL = new Vertex(translation.x * this.initScale.x, translation.y * this.initScale.y);
    this.points.forEach((point, index) => { point.center = this.previousCoords[index].add(pointTRL); point.update() })
    return translation
  }

  public mouseDown(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, any] {
    let [superCanvasMouse, superFrameMouse, clickedObject] = super.mouseDown(canvasMouse, frameMouse, absoluteMouse);
    this.previousCoords = this.points.map(p => p.center);
    return [superCanvasMouse, superFrameMouse, clickedObject]
  }

  public mouseUp(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex, canvasDown: Vertex, ctrlKey: boolean): void {
    super.mouseUp(canvasMouse, frameMouse, absoluteMouse, canvasDown, ctrlKey);
    this.previousCoords = [];
  }

  public wheel_interaction(mouse3X: number, mouse3Y: number, deltaY: number): [number, number] {
    const scale = new Vertex(this.scaleX, this.scaleY);
    [mouse3X, mouse3Y] = super.wheel_interaction(mouse3X, mouse3Y, deltaY);
    for (const axis of this.axes) {
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
    this.computePoints();
    return [mouse3X, mouse3Y];
  }
}

export class newGraph2D extends newScatter {
  public curves: LineSequence[];
  private curvesIndices: number[][];
  public showPoints: boolean = false;
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
    }

  protected unpackData(data: any): Map<string, any[]> {
    const graphSamples = [];
    this.pointStyles = [];
    this.curvesIndices = [];
    this.curves = [];
    if (data.graphs) {
      data.graphs.forEach(graph => {
        if (graph.elements.length != 0) {
          this.curves.push(LineSequence.getGraphProperties(graph));
          const curveIndices = range(graphSamples.length, graphSamples.length + graph.elements.length);
          const graphPointStyle = new newPointStyle(graph.point_style);
          this.pointStyles.push(...new Array(curveIndices.length).fill(graphPointStyle));
          this.curvesIndices.push(curveIndices);
          graphSamples.push(...graph.elements);
        }
      })
    }
    return super.unpackData({"elements": graphSamples})
  }

  public updateSelection(axesSelections: number[][]): void { this.selectedIndices = Figure.intersectArrays(axesSelections) }

  public drawCurves(context: CanvasRenderingContext2D): void {
    const axesOrigin = this.axes[0].origin.transform(this.canvasMatrix);
    const axesEnd = new Vertex(this.axes[0].end.x, this.axes[1].end.y).transform(this.canvasMatrix);
    const drawingZone = new newRect(axesOrigin, axesEnd.subtract(axesOrigin));
    const previousCanvas = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    this.curves.forEach((curve, curveIndex) => {
      curve.update(this.curvesIndices[curveIndex].map(index => { return this.points[index] }));
      curve.draw(context);
    })
    context.globalCompositeOperation = "destination-in";
    context.fill(drawingZone.path);
    const cutGraph = context.getImageData(this.X, this.Y, this.size.x, this.size.y);
    context.globalCompositeOperation = "source-over";
    context.putImageData(previousCanvas, 0, 0);
    context.putImageData(cutGraph, this.X, this.Y);
  }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D): void {
    this.drawCurves(context);
    this.absoluteObjects = new GroupCollection([...this.curves]);
    if (this.showPoints) {
      this.drawPoints(context);
      this.absoluteObjects.drawings = [...this.points, ...this.absoluteObjects.drawings];
    }
    this.drawSelectionBox(context);
  };

  public reset_scales(): void {
    const scale = new Vertex(this.frameMatrix.a, this.frameMatrix.d).scale(this.initScale);
    const translation = new Vertex(this.axes[0].maxValue - this.axes[0].initMaxValue, this.axes[1].maxValue - this.axes[1].initMaxValue).scale(scale);
    this.curves.forEach(curve => curve.translateTooltip(translation));
    super.reset_scales();
  }

  public switchMerge(): void { this.isMerged = false }

  public togglePoints(): void { this.showPoints = !this.showPoints; this.draw() }

  public mouseUp(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex, canvasDown: Vertex, ctrlKey: boolean): void {
    super.mouseUp(canvasMouse, frameMouse, absoluteMouse, canvasDown, ctrlKey);
    this.curves.forEach(curve => curve.previousTooltipOrigin = curve.tooltipOrigin);
  }

  public mouseTranslate(currentMouse: Vertex, mouseDown: Vertex): Vertex {
    const translation = super.mouseTranslate(currentMouse, mouseDown);
    this.curves.forEach(curve => { if (curve.previousTooltipOrigin) curve.tooltipOrigin = curve.previousTooltipOrigin.add(translation.scale(this.initScale)) });
    return translation
  }
}


export class newParallelPlot extends Figure {
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
      // console.log(this.features, this.drawnFeatures)
    }
}


function range(start: number, end: number, step: number = 1): number[] {
  let array = [];
  for (let i = start; i < end; i = i + step) array.push(i);
  return array
}

function mean(array: number[]): number {
  let sum = 0;
  array.forEach(value => sum += value);
  return sum / array.length
}

function standardDeviation(array: number[]): [number, number] {
  const arrayMean = mean(array);
  let sum = 0;
  array.forEach(value => sum += (value - arrayMean)**2);
  return [Math.sqrt(sum / array.length), arrayMean]
}

function scaleArray(array: number[]): number[] {
  const [std, mean] = standardDeviation(array);
  return Array.from(array, x => (x - mean) / std)
}

function normalizeArray(array: number[]): number[] {
  const maxAbs = Math.max(...array.map(x => Math.abs(x)));
  return array.map(x => x / maxAbs)
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

function mapMin(map: Map<any, number>): [any, number] {
  let min = Number.NEGATIVE_INFINITY;
  let keyMin: string;
  map.forEach((value, key) => {
    if (value >= min) {
      min = value;
      keyMin = key;
    }
  })
  return [keyMin, min]
}

function mapMax(map: Map<any, number>): [any, number] {
  let max = Number.NEGATIVE_INFINITY;
  let keyMax: string;
  map.forEach((value, key) => {
    if (value >= max) {
      max = value;
      keyMax = key;
    }
  })
  return [keyMax, max]
}

function sum(array: number[]): number {
  let sum = 0;
  array.forEach(value => sum += value);
  return sum
}
