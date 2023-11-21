import { RubberBand, Vertex, newAxis, ScatterPoint, Bar, ShapeCollection, SelectionBox, GroupCollection,
  LineSequence, newRect, newPointStyle, ParallelAxis, newPoint2D, SIZE_END, newShape, uniqueValues, PointSet } from "./utils";
import { colorHsl } from "./color_conversion";



// All following rows are purely deleted
// var alert_count = 0;
// /**
//  * A class that inherits from PlotData and is specific for drawing PrimitiveGroups.
//  */
// export class PlotContour extends PlotData {
//     plot_datas:any;
//     public constructor(public data:any,
//                        public width: number,
//                        public height: number,
//                        public buttons_ON: boolean,
//                        public X: number,
//                        public Y: number,
//                        public canvas_id: string,
//                        public is_in_multiplot = false) {
//       super(data, width, height, buttons_ON, 0, 0, canvas_id, is_in_multiplot);
//       if (!is_in_multiplot) {
//         var requirement = '0.6.0';
//         check_package_version(data['package_version'], requirement);
//       }

//       this.plot_datas = [];
//       this.type_ = 'primitivegroup';
//       var d = this.data;
//       if (d['type_'] == 'primitivegroup') {
//         var a = PrimitiveGroup.deserialize(d);
//         this.plot_datas.push(a);
//         let multiple_labels_index = -1;
//         for (let i=0; i<a.primitives.length; i++) {
//           let primitive = a.primitives[i];
//           if (primitive.type_ === 'multiplelabels') {
//             multiple_labels_index = i;
//           } else {
//             if (isNaN(this.minX)) {this.minX = primitive.minX} else {this.minX = Math.min(this.minX, primitive.minX)};
//             if (isNaN(this.maxX)) {this.maxX = primitive.maxX} else {this.maxX = Math.max(this.maxX, primitive.maxX)};
//             if (isNaN(this.minY)) {this.minY = primitive.minY} else {this.minY = Math.min(this.minY, primitive.minY)};
//             if (isNaN(this.maxY)) {this.maxY = primitive.maxY} else {this.maxY = Math.max(this.maxY, primitive.maxY)};
//             if ((primitive.type_ == 'contour') || (primitive.type_ == 'circle')) {
//               this.colour_to_plot_data[primitive.mouse_selection_color] = primitive;
//             }
//           }
//         }
//         if (multiple_labels_index !== -1) { // So that labels are drawn at last
//           a.primitives = List.move_elements(multiple_labels_index, a.primitives.length - 1, a.primitives);
//         }
//       }

//       if (buttons_ON) this.refresh_buttons_coords();
//       this.plotObject = this.plot_datas[0];
//       this.isParallelPlot = false;
//       this.interaction_ON = true;
//     }

//     draw() {
//       this.draw_from_context(true);
//       this.draw_from_context(false);

//     }

//     draw_from_context(hidden) {
//       this.define_context(hidden);
//       this.context.save();
//       this.draw_empty_canvas(this.context);
//       if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
//       this.context.beginPath();
//       this.context.rect(this.X-1, this.Y-1, this.width+2, this.height+2);
//       this.context.clip();
//       this.context.closePath();
//       for (let i=0; i<this.plot_datas.length; i++) {
//         let d = this.plot_datas[i];
//         this.draw_primitivegroup(hidden, this.originX, this.originY, this.scaleX, this.scaleY, d);
//       }

//       if (this.dep_mouse_over) {
//         this.draw_mouse_over_rect();
//       } else if (this.multiplot_manipulation) {
//         this.draw_manipulable_rect();
//       }

//       if (this.zw_bool || (this.isSelecting && !this.permanent_window)) {
//         this.draw_zoom_rectangle();
//       }
//       this.context.restore();

//       if ((this.buttons_ON) && (this.button_w > 20) && (this.button_h > 10)) {

//         this.refresh_buttons_coords();
//         //Drawing the zooming button
//         Buttons.zoom_button(this.button_x, this.zoom_rect_y, this.button_w, this.button_h, this);

//         //Drawing the button for zooming window selection
//         Buttons.zoom_window_button(this.button_x,this.zw_y,this.button_w,this.button_h, this);

//         //Drawing the reset button
//         Buttons.reset_button(this.button_x, this.reset_rect_y, this.button_w, this.button_h, this);
//       }
//     }
// }



// /** A class that inherits from PlotData and is specific for drawing ScatterPlots and Graph2Ds
//  */
// export class PlotScatter extends PlotData {
//     public constructor(public data:any,
//       public width: number,
//       public height: number,
//       public buttons_ON: boolean,
//       public X: number,
//       public Y: number,
//       public canvas_id: string,
//       public is_in_multiplot = false) {
//         super(data, width, height, buttons_ON, X, Y, canvas_id, is_in_multiplot);
//         if (!is_in_multiplot) {
//           var requirement = '0.6.0';
//           check_package_version(data['package_version'], requirement);
//         }
//         if (this.buttons_ON) {
//           this.refresh_buttons_coords();
//         }
//         this.log_scale_x = data['log_scale_x'];
//         this.log_scale_y = data['log_scale_y'];
//         if (data['type_'] == 'graph2d') {
//           this.type_ = 'graph2d';
//           this.graph_ON = true;
//           this.axis_ON = true;
//           this.plotObject = Graph2D.deserialize(data);
//           this.plot_datas['value'] = this.plotObject.graphs;
//           for (let i=0; i<this.plotObject.graphs.length; i++) {
//             let graph = this.plotObject.graphs[i];
//             this.graph_colorlist.push(graph.point_list[0].point_style.color_fill);
//             this.graph_to_display.push(true);
//             this.graph_name_list.push(graph.name);
//             graph.id = i;
//             this.minX = Infinity; this.maxX = -Infinity; this.minY = Infinity; this.maxY = -Infinity;
//             this.refresh_MinMax(graph.point_list, true);
//           }
//           this.nb_graph = this.plotObject.graphs.length;
//         } else if (data['type_'] == 'scatterplot') {
//           this.type_ = 'scatterplot';
//           this.axis_ON = true;
//           this.mergeON = true;
//           this.plotObject = Scatter.deserialize(data);
//           this.plot_datas['value'] = [this.plotObject];
//           this.pointLength = this.plotObject.point_list[0].size;
//           this.scatter_init_points = this.plotObject.point_list;
//           this.refresh_MinMax(this.plotObject.point_list);
//         }
//         this.isParallelPlot = false;
//         if (this.mergeON && alert_count === 0) {
//           // merge_alert();
//         }
//     }

//     draw() {
//       this.draw_from_context(false);
//       this.draw_from_context(true);
//     }

//     draw_from_context(hidden) {
//       this.define_context(hidden);
//       this.context.save();
//       this.draw_empty_canvas(this.context);
//       if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
//       this.context.beginPath();
//       this.context.rect(this.X-1, this.Y-1, this.width+2, this.height+2);
//       this.context.clip();
//       this.context.closePath();
//       this.draw_graph2D(this.plotObject, hidden, this.originX, this.originY);
//       this.draw_scatterplot(this.plotObject, hidden, this.originX, this.originY);
//       if (this.permanent_window) {
//         this.draw_selection_rectangle();
//       }
//       if (this.zw_bool || (this.isSelecting && !this.permanent_window)) {
//         this.draw_zoom_rectangle();
//       }

//       if ((this.buttons_ON) && (this.button_w > 20) && (this.button_h > 10)) {
//         this.refresh_buttons_coords();

//         //Drawing the zooming button
//         Buttons.zoom_button(this.button_x, this.zoom_rect_y, this.button_w, this.button_h, this);

//         //Drawing the button for zooming window selection
//         Buttons.zoom_window_button(this.button_x,this.zw_y,this.button_w,this.button_h, this);

//         //Drawing the reset button
//         Buttons.reset_button(this.button_x, this.reset_rect_y, this.button_w, this.button_h, this);

//         //Drawing the selection button
//         Buttons.selection_button(this.button_x, this.select_y, this.button_w, this.button_h, this);

//         //Drawing the enable/disable graph button
//         Buttons.graph_buttons(this.graph1_button_y, this.graph1_button_w, this.graph1_button_h, '10px Arial', this);

//         if (this.plotObject.type_ == 'scatterplot') {
//           // TODO To check, 'this' in args is weird
//           Buttons.merge_button(this.button_x, this.merge_y, this.button_w, this.button_h, '10px Arial', this);
//         }

//         //draw permanent window button
//         Buttons.perm_window_button(this.button_x, this.perm_button_y, this.button_w, this.button_h, '10px Arial', this);

//         //draw clear point button
//         Buttons.clear_point_button(this.button_x, this.clear_point_button_y, this.button_w, this.button_h, '10px Arial', this);

//         // Draw log scale buttons
//         Buttons.log_scale_buttons(this.button_x, this.xlog_button_y, this.ylog_button_y, this.button_w, this.button_h,
//           "10px Arial", this);
//       }
//       if (this.multiplot_manipulation) {
//         this.draw_manipulable_rect();
//       }
//       this.context.restore();
//     }
// }


// /** A class thtat inherits from PlotData and is specific for drawing ParallelPlots  */
// export class ParallelPlot extends PlotData {

//     constructor(public data, public width, public height, public buttons_ON, X, Y, public canvas_id: string,
//                 public is_in_multiplot = false) {
//       super(data, width, height, buttons_ON, X, Y, canvas_id, is_in_multiplot);
//       if (!is_in_multiplot) {
//         var requirement = '0.6.1';
//         check_package_version(data['package_version'], requirement);
//       }
//       this.type_ = 'parallelplot';
//       if (this.buttons_ON) {
//         this.disp_x = this.width - 35;
//         this.disp_y = this.height - 25;
//         this.disp_w = 30;
//         this.disp_h = 20;
//       }
//       let default_edge_style = {color_stroke:string_to_rgb('black'), dashline:[], line_width:0.5, name:''};
//       let default_dict_ = {edge_style:default_edge_style, disposition: 'vertical', rgbs:[[192, 11, 11], [14, 192, 11], [11, 11, 192]]};
//       data = set_default_values(data, default_dict_);
//       this.elements = data['elements'];
//       this.edge_style = EdgeStyle.deserialize(data['edge_style']);
//       var attribute_names = data['attribute_names'];
//       if (data['disposition'] == 'vertical') {
//         this.vertical = true;
//       } else if (data['disposition'] == 'horizontal') {
//         this.vertical = false;
//       } else {
//         throw new Error('Axis disposition must be vertical or horizontal');
//       }
//       this.initialize_all_attributes();
//       this.initialize_attributes_list();
//       this.add_to_axis_list(attribute_names);
//       this.initialize_data_lists();
//       var nb_axis = this.axis_list.length;
//       if (nb_axis<=1) {throw new Error('At least 2 axis are required')};
//       this.refresh_to_display_list(this.elements);
//       this.refresh_all_attributes();
//       this.refresh_attribute_booleans();
//       this.refresh_axis_bounds(nb_axis);
//       this.refresh_axis_coords();
//       this.isParallelPlot = true;
//       this.rgbs = data['rgbs'];
//       this.interpolation_colors = rgb_interpolations(this.rgbs, this.to_display_list.length);
//       this.initialize_hexs();
//       this.initialize_display_list_to_elements_dict();
//       this.refresh_pp_selected();
//     }

//     refresh_pp_buttons_coords() {
//       this.disp_x = this.width - 35;
//       this.disp_y = this.height - 25;
//       this.disp_w = 30;
//       this.disp_h = 20;
//     }

//     initialize_display_list_to_elements_dict() {
//       this.display_list_to_elements_dict = {};
//       for (let i=0; i<this.elements.length; i++) {
//         this.display_list_to_elements_dict[i.toString()] = i;
//       }
//     }

//     initialize_all_attributes() {
//       var attribute_names = Object.getOwnPropertyNames(this.elements[0]);
//       var exceptions = ['name', 'package_version', 'object_class'];
//       for (let i=0; i<attribute_names.length; i++) {
//         if (!(List.is_include(attribute_names[i], exceptions))) {
//           let name = attribute_names[i];
//           let type_ = TypeOf(this.elements[0][name]);
//           this.all_attributes.push(new Attribute(name, type_));
//         }
//       }
//     }

//     initialize_attributes_list() { //Initialize 'list' and 'alias' of all_attributes's elements'
//       for (var i=0; i<this.all_attributes.length; i++) {
//         var attribute_name = this.all_attributes[i]['name'];
//         this.all_attributes[i]['alias'] = this.all_attributes[i]['name'];
//         var type_ = this.all_attributes[i]['type_'];
//         if (type_ == 'float') {
//           var min = this.elements[0][attribute_name];
//           var max = this.elements[0][attribute_name];
//           for (var j=0; j<this.elements.length; j++) {
//             var elt = this.elements[j][attribute_name];
//             if (elt<min) {
//               min = elt;
//             }
//             if (elt>max) {
//               max = elt;
//             }
//           }
//           this.all_attributes[i]['list'] = [min, max];
//         } else { //ie string
//           var list = [];
//           for (var j=0; j<this.elements.length; j++) {
//             if (type_ == 'color') {
//               var elt:any = rgb_to_string(this.elements[j][attribute_name]);
//             } else {
//               var elt = this.elements[j][attribute_name];
//             }
//             if (!List.is_include(elt, list)) {
//               list.push(elt);
//             }
//           }
//           this.all_attributes[i]['list'] = list;
//         }
//       }
//     }

//     draw_initial() {
//       this.init_scale = 1;
//       this.originX = 0;
//       this.draw();
//     }

//     draw() {
//       this.refresh_axis_bounds(this.axis_list.length);
//       this.context = this.context_show;
//       this.context.save();
//       this.draw_empty_canvas(this.context);
//       if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
//       this.context.beginPath();
//       this.context.rect(this.X-1, this.Y-1, this.width+2, this.height + 2);
//       this.context.clip();
//       this.context.closePath();
//       this.draw_rubber_bands(this.originX);
//       var nb_axis = this.axis_list.length;
//       this.draw_parallel_coord_lines();
//       this.draw_parallel_axis(nb_axis, this.originX);
//       if (this.buttons_ON) {
//         this.refresh_pp_buttons_coords();
//         Buttons.disp_button(this.disp_x + this.X, this.disp_y + this.Y, this.disp_w, this.disp_h, '10px Arial', this);
//       }
//       if (this.multiplot_manipulation) {
//         this.draw_manipulable_rect();
//       }
//       this.context.restore();
//     }


//     draw_from_context(hidden) {};


//     initialize_data_lists() {
//       for (let i=0; i<this.axis_list.length; i++) {
//         this.inverted_axis_list.push(false);
//         this.rubber_bands.push([]);
//       }
//     }

//     initialize_hexs() {
//       this.hexs = [];
//       this.interpolation_colors.forEach(rgb => {
//         this.hexs.push(rgb_to_hex(rgb));
//       });
//     }
// }


// /** A class that inherits from PlotData and is specific for drawing PrimitiveGroupContainers.  */
// export class PrimitiveGroupContainer extends PlotData {
//     primitive_groups:PlotContour[]=[];
//     layout_mode:string='regular';
//     layout_axis:Axis;
//     layout_attributes:Attribute[]=[];
//     selected_primitive:number=-1;
//     custom_sizes:boolean=false;

//     constructor(public data:any,
//                 public width: number,
//                 public height: number,
//                 public buttons_ON: boolean,
//                 public X: number,
//                 public Y: number,
//                 public canvas_id: string,
//                 public is_in_multiplot: boolean = false) {
//       super(data, width, height, buttons_ON, X, Y, canvas_id, is_in_multiplot);
//       if (!is_in_multiplot) {
//         var requirement = '0.6.0';
//         check_package_version(data['package_version'], requirement);
//       }
//       this.type_ = 'primitivegroupcontainer';
//       var serialized = data['primitive_groups'];
//       var initial_coords = data['coords'] || Array(serialized.length).fill([0,0]);
//       if (data['sizes']) {
//         this.custom_sizes = true;
//       }
//       var initial_sizes = data['sizes'] || Array(serialized.length).fill([560, 300]);
//       for (let i=0; i<serialized.length; i++) { // Warning: is_in_multiplot is set to true for primitive groups
//         this.primitive_groups.push(new PlotContour(serialized[i], initial_sizes[i][0], initial_sizes[i][1], buttons_ON, X+initial_coords[i][0], Y+initial_coords[i][1], canvas_id, true));
//         this.display_order.push(i);
//       }
//     }


//     define_canvas(canvas_id) {
//       super.define_canvas(canvas_id);
//       this.initialize_primitive_groups_contexts();
//     }

//     initialize_primitive_groups_contexts() {
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         this.primitive_groups[i].context_hidden = this.context_hidden;
//         this.primitive_groups[i].context_show = this.context_show;
//       }
//     }

//     reinitialize_all() {
//       this.elements_dict = {};
//       this.primitive_dict = {};
//       this.primitive_groups = [];
//       this.display_order = [];
//     }

//     refresh_buttons_coords() {
//       this.button_w = 40;
//       this.button_h = 20;
//       this.button_y = this.height - 5 - this.button_h + this.Y;
//       this.manip_button_x = 5 + this.X;
//       this.reset_button_x = this.manip_button_x + this.button_w + 5;
//     }

//     draw_buttons() {
//       this.refresh_buttons_coords();
//       this.draw_manipulation_button();
//       this.draw_reset_button();
//     }


//     draw_manipulation_button() {
//       if (this.manipulation_bool) {
//         Shape.createButton(this.manip_button_x, this.button_y, this.button_w, this.button_h, this.context, 'ON', '10px sans-serif');
//       } else {
//         Shape.createButton(this.manip_button_x, this.button_y, this.button_w, this.button_h, this.context, 'OFF', '10px sans-serif');
//       }
//     }

//     draw_reset_button() {
//       Shape.createButton(this.reset_button_x, this.button_y, this.button_w, this.button_h, this.context, 'reset', '10px sans-serif');
//     }

//     click_on_button_check(mouse1X, mouse1Y) {
//       if (Shape.isInRect(mouse1X, mouse1Y, this.manip_button_x, this.button_y, this.button_w, this.button_h)) {
//         this.click_on_manipulation_action();
//       } else if (Shape.isInRect(mouse1X, mouse1Y, this.reset_button_x, this.button_y, this.button_w, this.button_h)) {
//         this.reset_action();
//       }
//     }

//     click_on_manipulation_action() {
//       this.manipulation_bool = !this.manipulation_bool;
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         this.primitive_groups[i].multiplot_manipulation = this.manipulation_bool;
//       }
//       if (this.manipulation_bool) {
//         this.setAllInteractionsToOff();
//       }
//     }

//     reset_action() {
//       if (this.primitive_groups.length !== 0) {
//         if (this.layout_mode == 'regular') {
//           this.regular_layout();
//         } else {
//           if (this.primitive_groups.length >= 1) this.reset_scales();
//         }
//       }
//     }

//     reset_sizes() {
//       var nb_primitives = this.primitive_groups.length;
//       if (!this.custom_sizes) {
//         if (nb_primitives === 1) {
//           var primitive_width = this.width/3;
//           var primitive_height = this.height/3;
//         } else {
//           primitive_width = this.width/nb_primitives;
//           primitive_height = this.height/nb_primitives;
//         }
//       }
//       for (let i=0; i<nb_primitives; i++) {
//         let center_x = this.primitive_groups[i].X + this.primitive_groups[i].width/2;
//         let center_y = this.primitive_groups[i].Y + this.primitive_groups[i].height/2;
//         if (this.custom_sizes) {
//           this.primitive_groups[i].width = Math.min(this.data['sizes'][i][0], this.width);
//           this.primitive_groups[i].height = Math.min(this.data['sizes'][i][1], this.height);
//         } else {
//           this.primitive_groups[i].width = primitive_width;
//           this.primitive_groups[i].height = primitive_height;
//         }
//         this.primitive_groups[i].X = center_x - this.primitive_groups[i].width/2;
//         this.primitive_groups[i].Y = center_y - this.primitive_groups[i].height/2;
//       }
//     }

//     refresh_MinMax() {
//       this.minX = Infinity; this.maxX = -Infinity; this.minY = Infinity; this.maxY = -Infinity;
//       for (let primitive of this.primitive_groups) {
//         this.minX = Math.min(this.minX, primitive.X);
//         this.maxX = Math.max(this.maxX, primitive.X + primitive.width);
//         this.minY = Math.min(this.minY, primitive.Y);
//         this.maxY = Math.max(this.maxY, primitive.Y + primitive.height);
//       }
//     }

//     refresh_spacing() {
//       var zoom_coeff_x = (this.width - this.decalage_axis_x)/(this.maxX - this.minX);
//       var container_center_x = this.X + this.width/2;
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         let primitive_center_x = this.primitive_groups[i].X + this.primitive_groups[i].width/2;
//         primitive_center_x = container_center_x + zoom_coeff_x*(primitive_center_x - container_center_x);
//         this.primitive_groups[i].X = primitive_center_x - this.primitive_groups[i].width/2;
//       }
//       this.scaleX = this.scaleX*zoom_coeff_x;
//       this.originX = this.width/2 + zoom_coeff_x * (this.originX - this.width/2);
//       this.scroll_x = 0;
//       this.refresh_MinMax();


//       if (this.layout_mode === 'two_axis') { // Then the algo does the same with the y-axis
//         let zoom_coeff_y = (this.height - this.decalage_axis_y)/(this.maxY - this.minY);
//         var container_center_y = this.Y + this.height/2;
//         for (let i=0; i<this.primitive_groups.length; i++) {
//           let primitive_center_y = this.primitive_groups[i].Y + this.primitive_groups[i].height/2;
//           primitive_center_y = container_center_y + zoom_coeff_y*(primitive_center_y - container_center_y);
//           this.primitive_groups[i].Y = primitive_center_y - this.primitive_groups[i].height/2;
//         }
//         this.scaleY = this.scaleY*zoom_coeff_y;
//         this.originY = this.height/2 + zoom_coeff_y * (this.originY - this.height/2);
//         this.scroll_y = 0;
//       }

//       this.resetAllObjects();
//     }

//     translate_inside_canvas() {
//       if (this.layout_mode == 'one_axis') {
//         this.translateAllPrimitives(-this.minX + this.X, this.height/2 - this.minY + this.Y);
//       } else if (this.layout_mode == 'two_axis') {
//         this.translateAllPrimitives(this.decalage_axis_x - this.minX + this.X, -this.minY + this.Y);
//       }
//       this.draw();
//     }

//     reset_scales() {
//       this.reset_sizes();
//       if (this.primitive_groups.length >= 2) {
//         this.refresh_MinMax();
//         for (let i=0; i<10; i++) {
//           this.refresh_spacing();
//         }
//       }
//       else if (this.primitive_groups.length === 1) Interactions.click_on_reset_action(this.primitive_groups[0]);
//       this.refresh_MinMax();
//       this.translate_inside_canvas();
//     }

//     draw_initial() {
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         this.primitive_groups[i].draw_initial();
//       }
//     }

//     draw() {
//       if (this.clickedPlotIndex != -1) {
//         let old_index = List.get_index_of_element(this.clickedPlotIndex, this.display_order);
//         this.display_order = List.move_elements(old_index, this.display_order.length - 1, this.display_order);
//       }
//       this.context = this.context_show;
//       this.context.save();
//       this.draw_empty_canvas(this.context);
//       if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
//       this.context.clip(this.context.rect(this.X-1, this.Y-1, this.width+2, this.height+2));
//       if (this.width > 100 && this.height > 100) {
//         this.draw_layout_axis();
//         if (this.layout_mode !== 'regular') {
//           this.draw_coordinate_lines();
//         }
//         for (let index of this.display_order) {
//           this.primitive_groups[index].draw();
//         }
//       }

//       if (this.multiplot_manipulation) {
//         this.draw_manipulable_rect();
//       } else {
//         this.context.strokeStyle = this.initial_rect_color_stroke;
//         this.context.lineWidth = this.initial_rect_line_width;
//         this.context.strokeRect(this.X, this.Y, this.width, this.height);
//       }
//       if (this.buttons_ON) { this.draw_buttons(); }
//       this.context.restore();
//     }


//     draw_from_context(hidden) {}


//     redraw_object() {
//       this.store_datas();
//       this.draw_empty_canvas(this.context);
//       for (let display_index of this.display_order) {
//         let obj = this.primitive_groups[display_index];
//         if (display_index == this.clickedPlotIndex) {
//           this.primitive_groups[display_index].draw();
//         } else {
//            this.context_show.putImageData(this.shown_datas[display_index], obj.X, obj.Y);
//            this.context_hidden.putImageData(this.hidden_datas[display_index], obj.X, obj.Y);
//         }
//       }
//       if (this.buttons_ON) { this.draw_buttons(); }
//     }

//     store_datas() {
//       this.shown_datas = []; this.hidden_datas = [];
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         let obj = this.primitive_groups[i];
//         this.shown_datas.push(this.context_show.getImageData(obj.X, obj.Y, obj.width, obj.height));
//         this.hidden_datas.push(this.context_hidden.getImageData(obj.X, obj.Y, obj.width, obj.height));
//       }
//     }

//     draw_coordinate_lines() {
//       this.context.lineWidth = 0.5;
//       this.context.setLineDash([5,5]);
//       this.context.strokeStyle = string_to_hex('grey');
//       if (this.layout_mode == 'one_axis') {
//         for (let primitive of this.primitive_groups) {
//           let x = primitive.X + primitive.width/2;
//           let y = primitive.Y + primitive.height;
//           Shape.drawLine(this.context, [[x,y], [x, this.height - this.decalage_axis_y + this.Y]]);
//         }
//       } else if (this.layout_mode == 'two_axis') {
//         for (let primitive of this.primitive_groups) {
//           let x = primitive.X + primitive.width/2;
//           let y = primitive.Y + primitive.height/2;
//           Shape.drawLine(this.context, [[this.decalage_axis_x + this.X, y], [x, y], [x, this.height - this.decalage_axis_y + this.Y]]);
//         }
//       }
//       this.context.stroke();
//       this.context.setLineDash([]);
//     }


//     /**
//      * Calls the layout function of a PrimitiveGroupContainer whose layout_mode and axis are already set.
//      */
//     refresh_layout() {
//       if (this.layout_mode === 'one_axis') {
//         this.multiplot_one_axis_layout(this.layout_attributes[0]);
//       } else if (this.layout_mode === 'two_axis') {
//         this.multiplot_two_axis_layout(this.layout_attributes);
//       }
//     }


//     add_primitive_group(serialized, point_index) {
//       var new_plot_data = new PlotContour(serialized, 560, 300, this.buttons_ON, this.X, this.Y, this.canvas_id);
//       new_plot_data.context_hidden = this.context_hidden;
//       new_plot_data.context_show = this.context_show;
//       this.primitive_groups.push(new_plot_data);
//       this.display_order.push(this.primitive_groups.length - 1);
//       new_plot_data.draw_initial();
//       new_plot_data.mouse_interaction(new_plot_data.isParallelPlot);
//       new_plot_data.interaction_ON = false;
//       this.primitive_dict[point_index.toString()] = this.primitive_groups.length - 1;
//       this.refresh_layout();
//       this.reset_action();
//       this.draw();
//     }


//     remove_primitive_group(point_index) {
//       var primitive_index = this.primitive_dict[point_index.toString()];
//       this.primitive_groups = List.remove_at_index(primitive_index, this.primitive_groups);
//       this.display_order = List.remove_element(primitive_index, this.display_order);
//       this.primitive_dict = MyObject.removeEntries([point_index.toString()], this.primitive_dict);
//       this.elements_dict = MyObject.removeEntries([primitive_index.toString()], this.elements_dict);
//       var keys = Object.keys(this.primitive_dict);
//       for (let key of keys) {
//         if (this.primitive_dict[key] > primitive_index) {
//           this.primitive_dict[key]--;
//         }
//       }
//       for (let i=0; i<this.display_order.length; i++) {
//         if (this.display_order[i] > primitive_index) {
//           this.display_order[i]--;
//         }
//       }
//       var elements_entries = Object.entries(this.elements_dict);
//       for (let i=0; i<elements_entries.length; i++) {
//         if (Number(elements_entries[i][0]) > primitive_index) {
//           elements_entries[i][0] = (Number(elements_entries[i][0]) - 1).toString();
//         }
//       }
//       this.elements_dict = Object.fromEntries(elements_entries);
//       this.reset_action();
//       this.draw();
//     }


//     setAllInteractionsToOff() {
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         this.primitive_groups[i].interaction_ON = false;
//       }
//     }


//     manage_mouse_interactions(selected_primitive:number):void {
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         if (i == selected_primitive) {
//           this.primitive_groups[i].interaction_ON = true;
//         } else {
//           this.primitive_groups[i].interaction_ON = false;
//         }
//       }
//     }


//     get_selected_primitive(mouse2X, mouse2Y) {
//       var selected_index = -1;
//       for (let index of this.display_order) {
//         let prim = this.primitive_groups[index];
//         if (Shape.isInRect(mouse2X, mouse2Y, prim.X, prim.Y, prim.width, prim.height)) {
//           selected_index = index;
//         }
//       }
//       return selected_index;
//     }


//     draw_layout_axis() {
//       if (this.primitive_groups.length !== 0) {
//         if (this.layout_mode == 'one_axis') {
//           this.layout_axis.draw_sc_horizontal_axis(this.context, this.originX, this.scaleX, this.width, this.height,
//               this.init_scaleX, this.layout_attributes[0].list, this.layout_attributes[0], this.scroll_x, this.decalage_axis_x,
//               this.decalage_axis_y, this.X, this.Y, this.width);
//         } else if (this.layout_mode == 'two_axis') {
//           this.layout_axis.draw_sc_horizontal_axis(this.context, this.originX, this.scaleX, this.width, this.height,
//             this.init_scaleX, this.layout_attributes[0].list, this.layout_attributes[0], this.scroll_x, this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.width);

//           this.layout_axis.draw_sc_vertical_axis(this.context, this.originY, this.scaleY, this.width, this.height, this.init_scaleY, this.layout_attributes[1].list,
//             this.layout_attributes[1], this.scroll_y, this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.height);

//         }
//       }
//     }


//     regular_layout():void {
//       var big_coord = 'X';
//       var small_coord = 'Y';
//       var big_length = 'width';
//       var small_length = 'height';
//       if (this.width < this.height) {
//         [big_coord, small_coord, big_length, small_length] = [small_coord, big_coord, small_length, big_length];
//       }
//       var sorted_list = this.getSortedList();
//       var nb_primitives = this.primitive_groups.length;
//       let small_length_nb_objects = Math.min(Math.ceil(nb_primitives/2), Math.floor(Math.sqrt(nb_primitives)));
//       let big_length_nb_objects = Math.ceil(nb_primitives/small_length_nb_objects);
//       let big_length_step = this[big_length]/big_length_nb_objects;
//       let small_length_step = this[small_length]/small_length_nb_objects;
//       for (let i=0; i<big_length_nb_objects - 1; i++) {
//         for (let j=0; j<small_length_nb_objects; j++) {
//           var current_index = i*small_length_nb_objects + j; //current_index in sorted_list
//           this.primitive_groups[sorted_list[current_index]][big_coord] = i*big_length_step + this[big_coord];
//           this.primitive_groups[sorted_list[current_index]][small_coord] = j*small_length_step + this[small_coord];
//           this.primitive_groups[sorted_list[current_index]][big_length] = big_length_step;
//           this.primitive_groups[sorted_list[current_index]][small_length] = small_length_step;
//         }
//       }
//       let last_index = current_index + 1;
//       let remaining_obj = nb_primitives - last_index;
//       let last_small_length_step = this[small_length]/remaining_obj;
//       for (let j=0; j<remaining_obj; j++) {
//         this.primitive_groups[sorted_list[last_index + j]][big_coord] = (big_length_nb_objects - 1)*big_length_step + this[big_coord];
//         this.primitive_groups[sorted_list[last_index + j]][small_coord] = j*last_small_length_step + this[small_coord];
//         this.primitive_groups[sorted_list[last_index + j]][big_length] = big_length_step;
//         this.primitive_groups[sorted_list[last_index + j]][small_length] = last_small_length_step;
//       }
//       this.resetAllObjects();
//       this.draw();
//     }


//     getSortedList() {
//       var big_coord = 'X';
//       var small_coord = 'Y';
//       if (this.width < this.height) {[big_coord, small_coord] = [small_coord, big_coord];}
//       var sort = new Sort();
//       var sortedObjectList = sort.sortObjsByAttribute(this.primitive_groups, big_coord);
//       var sorted_list = [];
//       var nb_primitives = this.primitive_groups.length;
//       for (let i=0; i<nb_primitives; i++) {
//         let sorted_index = List.get_index_of_element(sortedObjectList[i], this.primitive_groups);
//         sorted_list.push(sorted_index);
//       }
//       var sortedDisplayedObjectList = [];
//       for (let i=0; i<sorted_list.length; i++) {
//         sortedDisplayedObjectList.push(this.primitive_groups[sorted_list[i]]);
//       }
//       var j = 0;
//       while (j<sorted_list.length - 1) {
//         if (sortedDisplayedObjectList[j+1][small_coord] < sortedDisplayedObjectList[j][small_coord]) {
//           List.switchElements(sorted_list, j, j+1);
//         }
//         j = j+2;
//       }
//       return sorted_list;
//     }

//     initialize_list(attribute:Attribute) {
//       var elements_dict_values = Object.values(this.elements_dict);
//       var value = [];
//       var name = attribute.name;
//       let type_ = attribute.type_;
//       if (type_ == 'float') {
//         let min = elements_dict_values[0][name];
//         let max = elements_dict_values[0][name];
//         for (let j=0; j<elements_dict_values.length; j++) {
//           let elt = elements_dict_values[j][name];
//           if (elt>max) {
//             max = elt;
//           }
//           if (elt<min) {
//             min = elt;
//           }
//         }
//         if (min === max) {
//           if (min < 0) return [2*min, 0];
//           else if (min === 0) return [-1, 1];
//           else return [0, 2*min];
//         }
//         return [min, max];
//       } else if (type_ == 'color') {
//         var list = []
//         for (let j=0; j<elements_dict_values.length; j++) {
//           let elt_color = rgb_to_string(elements_dict_values[j][name]);
//           if (!List.is_include(elt_color, value)) {
//             value.push(elt_color);
//           }
//         }
//         return value;
//       } else {
//         for (let j=0; j<elements_dict_values.length; j++) {
//           let elt = elements_dict_values[j][name].toString();
//           if (!List.is_include(elt, value)) {
//             value.push(elt);
//           }
//         }
//         return value;
//       }
//     }

//     is_element_dict_empty() {
//       return Object.keys(this.elements_dict).length === 0;
//     }

//     multiplot_one_axis_layout(attribute:Attribute) {
//       this.refresh_one_axis_layout_list(attribute);
//       this.one_axis_layout();
//     }

//     refresh_one_axis_layout_list(attribute:Attribute) {
//       this.layout_mode = 'one_axis';
//       if (!this.is_element_dict_empty()) {
//         attribute.list = this.initialize_list(attribute);
//       }
//       this.layout_attributes = [attribute];
//     }


//     one_axis_layout() {
//       var graduation_style = new TextStyle(string_to_rgb('grey'), 12, 'sans-serif', 'center', 'alphabetic');
//       var axis_style = new EdgeStyle(0.5, string_to_rgb('lightgrey'), [], '');
//       var serialized_axis = {graduation_style: graduation_style, axis_style: axis_style, grid_on: false};
//       this.layout_axis = Axis.deserialize(serialized_axis);
//       var nb_primitive_groups = this.primitive_groups.length;
//       var name = this.layout_attributes[0].name;
//       var type_ = this.layout_attributes[0].type_;
//       this.scaleX = 1; this.scaleY = 1;
//       this.originX = 0; this.originY = 0;
//       if (type_ !== 'float') {
//         var real_xs = [];
//         var y_incs = Array(nb_primitive_groups).fill(0);
//       }
//       for (let i=0; i<nb_primitive_groups; i++) {
//         this.primitive_groups[i].width = this.width/(1.2*nb_primitive_groups);
//         this.primitive_groups[i].height = this.height/(1.2*nb_primitive_groups);
//         if (this.layout_attributes[0].type_ == 'float') {
//           var real_x = this.elements_dict[i.toString()][name];
//         } else if (this.layout_attributes[0].type_ == 'color') {
//           real_x = List.get_index_of_element(rgb_to_string(this.elements_dict[i.toString()][name]), this.layout_attributes[0].list);
//           if (List.is_include(real_x, real_xs)) { y_incs[i] += - this.primitive_groups[i].height; } else {real_xs.push(real_x);}

//         } else {
//           real_x = List.get_index_of_element(this.elements_dict[i.toString()][name], this.layout_attributes[0].list);
//           if (List.is_include(real_x, real_xs)) {y_incs[i] += - this.primitive_groups[i].height;} else {real_xs.push(real_x);}
//         }
//         var center_x = this.scaleX*real_x + this.originX;
//         this.primitive_groups[i].X = this.X + center_x - this.primitive_groups[i].width/2;
//         this.primitive_groups[i].Y = this.Y + this.height/2 - this.primitive_groups[i].height/2;
//         if (type_ !== 'float') this.primitive_groups[i].Y += y_incs[i];
//       }
//       if (this.primitive_groups.length >= 1) this.reset_scales();
//       this.resetAllObjects();
//       this.draw();
//     }

//     refresh_two_axis_layout_list(attributes:Attribute[]) {
//       this.layout_mode = 'two_axis';
//       if (!this.is_element_dict_empty()) {
//         attributes[0].list = this.initialize_list(attributes[0]);
//         attributes[1].list = this.initialize_list(attributes[1]);
//       }
//       this.layout_attributes = attributes;
//     }

//     multiplot_two_axis_layout(attributes:Attribute[]) {
//       this.refresh_two_axis_layout_list(attributes);
//       this.two_axis_layout();
//     }


//     two_axis_layout() {
//       var graduation_style = new TextStyle(string_to_rgb('grey'), 12, 'sans-serif', 'center', 'alphabetic');
//       var axis_style = new EdgeStyle(0.5, string_to_rgb('lightgrey'), [], '');
//       var serialized_axis = {graduation_style: graduation_style, axis_style: axis_style, grid_on: false};
//       this.layout_axis = Axis.deserialize(serialized_axis);
//       var nb_primitive_groups = this.primitive_groups.length;
//       this.scaleX = 1; this.scaleY = 1;
//       this.originX = 0; this.originY = 0;
//       for (let i=0; i<nb_primitive_groups; i++) {
//         this.primitive_groups[i].width = this.width/(1.2*nb_primitive_groups);
//         this.primitive_groups[i].height = this.height/(1.2*nb_primitive_groups);
//         if (this.layout_attributes[0].type_ == 'float') {
//           var real_x = this.elements_dict[i.toString()][this.layout_attributes[0].name];
//         } else if (this.layout_attributes[0].type_ == 'color') {
//           let value = rgb_to_string(this.elements_dict[i.toString()][this.layout_attributes[0].name]);
//           real_x = List.get_index_of_element(value, this.layout_attributes[0].list);
//         } else {
//           real_x = List.get_index_of_element(this.elements_dict[i.toString()][this.layout_attributes[0].name], this.layout_attributes[0].list);
//         }
//         var center_x = this.scaleX*real_x + this.originX;
//         this.primitive_groups[i].X = this.X + center_x - this.primitive_groups[i].width/2;

//         if (this.layout_attributes[1].type_ == 'float') {
//           var real_y = this.elements_dict[i.toString()][this.layout_attributes[1].name];
//         } else if (this.layout_attributes[1].type_ == 'color') {
//           let value = rgb_to_string(this.elements_dict[i.toString()][this.layout_attributes[1].name]);
//           real_y = List.get_index_of_element(value, this.layout_attributes[1].list);
//         } else {
//           real_y = List.get_index_of_element(this.elements_dict[i.toString()][this.layout_attributes[1].name], this.layout_attributes[1].list);
//         }
//         var center_y = -this.scaleX*real_y + this.originY;
//         this.primitive_groups[i].Y = this.Y + center_y - this.primitive_groups[i].height/2;
//       }
//       if (this.primitive_groups.length >= 2) this.reset_scales();
//       this.resetAllObjects();
//       this.draw();
//     }

//     translatePrimitive(index, tx, ty) {
//       this.primitive_groups[index].X = this.primitive_groups[index].X + tx;
//       this.primitive_groups[index].Y = this.primitive_groups[index].Y + ty;
//     }

//     translateAllPrimitives(tx, ty) {
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         this.translatePrimitive(i, tx, ty);
//       }
//       this.originX = this.originX + tx;
//       this.originY = this.originY + ty;
//     }


//     resetAllObjects() {
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         this.primitive_groups[i].reset_scales();
//       }
//     }

//     zoom_elements(mouse3X:number, mouse3Y:number, event:number) {
//       if ((this.layout_mode !== 'regular') && (Shape.isInRect(mouse3X, mouse3Y, this.X + this.decalage_axis_x,
//         this.height - this.decalage_axis_y + this.Y, this.width - this.decalage_axis_x, this.height - this.decalage_axis_y))) {
//           this.x_zoom_elements(event);
//       } else if ((this.layout_mode == 'two_axis') && (Shape.isInRect(mouse3X, mouse3Y, this.X, this.Y, this.decalage_axis_x,
//         this.height - this.decalage_axis_y))) {
//           this.y_zoom_elements(event);
//       } else {
//         this.regular_zoom_elements(mouse3X, mouse3Y, event);
//       }
//     }

//     regular_zoom_elements(mouse3X, mouse3Y, event) {
//       if (event > 0) {
//         var zoom_coeff = 1.1;
//       } else {
//         var zoom_coeff = 1/1.1;
//       }
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         this.primitive_groups[i].X = mouse3X + zoom_coeff*(this.primitive_groups[i].X - mouse3X);
//         this.primitive_groups[i].Y = mouse3Y + zoom_coeff*(this.primitive_groups[i].Y - mouse3Y);
//         this.primitive_groups[i].width = this.primitive_groups[i].width*zoom_coeff;
//         this.primitive_groups[i].height = this.primitive_groups[i].height*zoom_coeff;
//       }
//       this.resetAllObjects();
//       this.scaleX = this.scaleX*zoom_coeff; this.scaleY = this.scaleY*zoom_coeff;
//       this.originX = mouse3X - this.X + zoom_coeff * (this.originX - mouse3X + this.X);
//       this.originY = mouse3Y - this.Y + zoom_coeff * (this.originY - mouse3Y + this.Y);
//       this.draw();
//     }

//     x_zoom_elements(event) {
//       if (event > 0) {
//         var zoom_coeff = 1.1;
//       } else {
//         zoom_coeff = 1/1.1;
//       }
//       var container_center_x = this.X + this.width/2;
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         let primitive_center_x = this.primitive_groups[i].X + this.primitive_groups[i].width/2;
//         primitive_center_x = container_center_x + zoom_coeff*(primitive_center_x - container_center_x);
//         this.primitive_groups[i].X = primitive_center_x - this.primitive_groups[i].width/2;
//       }
//       this.resetAllObjects();
//       this.scaleX = this.scaleX*zoom_coeff;
//       this.originX = this.width/2 + zoom_coeff * (this.originX - this.width/2);
//       this.draw();
//     }

//     y_zoom_elements(event) {
//       if (event > 0) {
//         var zoom_coeff = 1.1;
//       } else {
//         zoom_coeff = 1/1.1;
//       }
//       var container_center_y = this.Y + this.height/2;
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         let primitive_center_y = this.primitive_groups[i].Y + this.primitive_groups[i].height/2;
//         primitive_center_y = container_center_y + zoom_coeff*(primitive_center_y - container_center_y);
//         this.primitive_groups[i].Y = primitive_center_y - this.primitive_groups[i].height/2;
//       }
//       this.resetAllObjects();
//       this.scaleY = this.scaleY*zoom_coeff;
//       this.originY = this.height/2 + zoom_coeff * (this.originY - this.height/2);
//       this.draw();
//     }

//     manage_scroll(mouse3X, mouse3Y, event) {
//       if ((this.layout_mode !== 'regular') && (Shape.isInRect(mouse3X, mouse3Y, this.X + this.decalage_axis_x,
//         this.height - this.decalage_axis_y + this.Y, this.width - this.decalage_axis_x, this.height - this.decalage_axis_y))) {
//           this.scroll_x = this.scroll_x + event;
//       } else if ((this.layout_mode == 'two_axis') && (Shape.isInRect(mouse3X, mouse3Y, this.X, this.Y, this.decalage_axis_x,
//         this.height - this.decalage_axis_y))) {
//           this.scroll_y = this.scroll_y + event;
//       } else {
//         this.scroll_x = this.scroll_x + event;
//         this.scroll_y = this.scroll_y + event;
//       }
//       if (isNaN(this.scroll_x)) this.scroll_x = 0;
//       if (isNaN(this.scroll_y)) this.scroll_y = 0;
//     }

//     delete_unwanted_vertex(vertex_infos) {
//       var i = 0;
//       while (i < vertex_infos.length) {
//         let to_delete = false;
//         if (this.clickedPlotIndex != vertex_infos[i].index) {
//           let j = 0;
//           let cpi_vertex = false;
//           while (j<vertex_infos.length) {
//             if ((vertex_infos[j].index == this.clickedPlotIndex)) {
//               cpi_vertex = true;
//               break;
//             }
//             j++;
//           }
//           to_delete = !cpi_vertex;
//         }
//         if (to_delete) {
//           vertex_infos = List.remove_at_index(i, vertex_infos);
//         } else {
//           i++;
//         }
//       }
//       return vertex_infos;
//     }

//     initialize_clickOnVertex(mouse1X, mouse1Y):[boolean, Object] {
//       var thickness = 15;
//       var vertex_infos = [];
//       for (let i=0; i<this.primitive_groups.length; i++) {
//         let obj:PlotData = this.primitive_groups[this.display_order[i]];
//         let up = Shape.isInRect(mouse1X, mouse1Y, obj.X - thickness*1/3, obj.Y - thickness*1/3, obj.width + thickness*2/3, thickness);
//         let down = Shape.isInRect(mouse1X, mouse1Y, obj.X - thickness*1/3, obj.Y + obj.height - thickness*2/3, obj.width + thickness*2/3, thickness);
//         let left = Shape.isInRect(mouse1X, mouse1Y, obj.X - thickness*1/3, obj.Y - thickness*1/3, thickness, obj.height + thickness*2/3);
//         let right = Shape.isInRect(mouse1X, mouse1Y, obj.X + obj.width - thickness*2/3, obj.Y - thickness*1/3, thickness, obj.height + thickness*2/3);
//         var clickOnVertex_i = up || down || left || right;
//         if (clickOnVertex_i) {
//           vertex_infos.push({'index': this.display_order[i], 'up': up, 'down': down, 'left':left, 'right': right});
//         }
//       }
//       vertex_infos = this.delete_unwanted_vertex(vertex_infos);
//       var clickOnVertex = !(vertex_infos.length == 0);
//       return [clickOnVertex, vertex_infos];
//     }

//     resizeObject(vertex_infos, deltaX, deltaY):void {
//       var widthSizeLimit = 100;
//       var heightSizeLimit = 100;
//       for (let i=0; i<vertex_infos.length; i++) {
//         let vertex_object_index = vertex_infos[i].index;
//         if (vertex_infos[i].up === true) {
//           if (this.primitive_groups[vertex_object_index].height - deltaY > heightSizeLimit) {
//             this.primitive_groups[vertex_object_index].Y = this.primitive_groups[vertex_object_index].Y + deltaY;
//             this.primitive_groups[vertex_object_index].height = this.primitive_groups[vertex_object_index].height - deltaY;
//           } else {
//             this.primitive_groups[vertex_object_index].height = heightSizeLimit;
//           }
//         }
//         if (vertex_infos[i].down === true) {
//           if (this.primitive_groups[vertex_object_index].height + deltaY > heightSizeLimit) {
//             this.primitive_groups[vertex_object_index].height = this.primitive_groups[vertex_object_index].height + deltaY;
//           } else {
//             this.primitive_groups[vertex_object_index].height = heightSizeLimit;
//           }
//         }
//         if (vertex_infos[i].left === true) {
//           if (this.primitive_groups[vertex_object_index].width - deltaX > widthSizeLimit) {
//             this.primitive_groups[vertex_object_index].X = this.primitive_groups[vertex_object_index].X + deltaX;
//             this.primitive_groups[vertex_object_index].width = this.primitive_groups[vertex_object_index].width - deltaX;
//           } else {
//             this.primitive_groups[vertex_object_index].width = widthSizeLimit;
//           }
//         }
//         if (vertex_infos[i].right === true) {
//           if (this.primitive_groups[vertex_object_index].width + deltaX > widthSizeLimit) {
//             this.primitive_groups[vertex_object_index].width = this.primitive_groups[vertex_object_index].width + deltaX;
//           } else {
//             this.primitive_groups[vertex_object_index].width = widthSizeLimit;
//           }
//         }
//       }
//       this.draw();
//     }

//     reorder_resize_style(resize_style) {
//       var resize_dict = ['n', 'ns', 'ne', 'nwse', 'nw', 'e', 'ew', 's', 'se', 'sw', 'w'];
//       for (let i=0; i<resize_dict.length; i++) {
//         if (resize_style.split('').sort().join() === resize_dict[i].split('').sort().join()) {
//           resize_style = resize_dict[i];
//           break;
//         }
//       }
//       return resize_style;
//     }

//     setCursorStyle(mouse2X, mouse2Y, canvas, selected_primitive):void {
//       if (selected_primitive != -1) {
//         var thickness = 15;
//         var resize_style:any = '';
//         for (let i=0; i<this.primitive_groups.length; i++) {
//           let obj:PlotData = this.primitive_groups[i];
//           let up = Shape.isInRect(mouse2X, mouse2Y, obj.X - thickness*1/3, obj.Y - thickness*1/3, obj.width + thickness*2/3, thickness);
//           let down = Shape.isInRect(mouse2X, mouse2Y, obj.X - thickness*1/3, obj.Y + obj.height - thickness*2/3, obj.width + thickness*2/3, thickness);
//           let left = Shape.isInRect(mouse2X, mouse2Y, obj.X - thickness*1/3, obj.Y - thickness*1/3, thickness, obj.height + thickness*2/3);
//           let right = Shape.isInRect(mouse2X, mouse2Y, obj.X + obj.width - thickness*2/3, obj.Y - thickness*1/3, thickness, obj.height + thickness*2/3);
//           if (up && !resize_style.includes('n')) {resize_style = resize_style + 'n';}
//           if (down && !resize_style.includes('s')) {resize_style = resize_style + 's';}
//           if (left && !resize_style.includes('w')) {resize_style = resize_style + 'w';}
//           if (right && !resize_style.includes('e')) {resize_style = resize_style + 'e';}
//         }
//         if (resize_style == '') {
//           canvas.style.cursor = 'default';
//         } else {
//           resize_style = this.reorder_resize_style(resize_style);
//           canvas.style.cursor = resize_style + '-resize';
//         }
//       } else {
//         canvas.style.cursor = 'default';
//       }
//       this.draw();
//     }


//     mouse_interaction() {
//       var mouse1X=0; var mouse1Y=0; var mouse2X=0; var mouse2Y=0; var mouse3X=0; var mouse3Y=0;
//       var nbObjects:number = this.primitive_groups.length;
//       var canvas = document.getElementById(this.canvas_id);
//       // var selected_primitive:number = -1;
//       var last_selected_primitive = -1;
//       var isDrawing = false;
//       var vertex_infos:Object;
//       var clickOnVertex:boolean = false;

//       for (let i=0; i<nbObjects; i++) {
//         this.primitive_groups[i].mouse_interaction(this.primitive_groups[i].isParallelPlot);
//       }
//       this.setAllInteractionsToOff();

//       canvas.addEventListener('mousedown', e => {
//         isDrawing = true;
//         if (this.interaction_ON) {
//           mouse1X = e.offsetX; mouse1Y = e.offsetY;
//           this.click_on_button_check(mouse1X, mouse1Y);
//           this.clickedPlotIndex = this.get_selected_primitive(mouse1X, mouse1Y);
//           if (this.manipulation_bool) {
//             if (this.clickedPlotIndex != -1) {
//               [clickOnVertex, vertex_infos] = this.initialize_clickOnVertex(mouse1X, mouse1Y);
//             } else {
//               clickOnVertex = false;
//             }
//           }
//         }
//       });

//       canvas.addEventListener('mousemove', e => {
//         if (this.interaction_ON) {
//           var old_mouse2X = mouse2X; var old_mouse2Y = mouse2Y;
//           mouse2X = e.offsetX, mouse2Y = e.offsetY;
//           this.selected_primitive = this.get_selected_primitive(mouse2X, mouse2Y);
//           if (this.manipulation_bool) {
//             if (isDrawing) {
//               if ((this.clickedPlotIndex == -1) || (this.layout_mode !== 'regular')) {
//                 this.translateAllPrimitives(mouse2X - old_mouse2X, mouse2Y - old_mouse2Y);
//                 this.draw();
//               } else {
//                 if (clickOnVertex) {
//                   this.resizeObject(vertex_infos, mouse2X - old_mouse2X, mouse2Y - old_mouse2Y);
//                 } else {
//                   this.translatePrimitive(this.clickedPlotIndex, mouse2X - old_mouse2X, mouse2Y - old_mouse2Y);
//                   this.draw();
//                 }
//               }
//             } else {
//               if (this.layout_mode === 'regular') {
//                 this.setCursorStyle(mouse2X, mouse2Y, canvas, this.selected_primitive);
//               }
//             }
//           } else {
//             if (this.selected_primitive !== last_selected_primitive) {
//               this.manage_mouse_interactions(this.selected_primitive);
//             }
//             last_selected_primitive = this.selected_primitive;
//           }
//         } else {
//           isDrawing = false;
//         }
//       });

//       canvas.addEventListener('mouseup', e => {
//         if (this.interaction_ON) {
//           isDrawing = false;
//           this.draw();
//         }
//       });

//       canvas.addEventListener('wheel', e => {
//         if (this.interaction_ON) {
//           e.preventDefault();
//           mouse3X = e.offsetX; mouse3Y = e.offsetY;
//           if (this.manipulation_bool) {
//             var event = -e.deltaY/Math.abs(e.deltaY);
//             this.manage_scroll(mouse3X, mouse3Y, event);
//             this.zoom_elements(mouse3X, mouse3Y, event);
//           }
//         }
//       });

//       canvas.addEventListener('mouseleave', e => {
//         this.clickedPlotIndex = -1;
//         this.selected_primitive = -1;
//         this.setAllInteractionsToOff();
//       })
//     }
// }
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

export function computeCanvasSize(buttonContainerName: string): [number, number] {
  const buttonsContainer = document.querySelector(buttonContainerName);
  return [0.95 * window.innerWidth, 0.95 * window.innerHeight - buttonsContainer.scrollHeight]
}

const BLANK_SPACE = 3;
const MIN_FONTSIZE: number = 6;
const MIN_OFFSET: number = 33;
const ZOOM_FACTOR: number = 1.2;
export class Figure {
  public context: CanvasRenderingContext2D;
  public axes: newAxis[] = [];
  public drawOrigin: Vertex;
  public drawEnd: Vertex;
  public drawnFeatures: string[];
  public origin: Vertex;
  public size: Vertex;
  public translation: Vertex = new Vertex(0, 0);

  public hoveredIndices: number[];
  public clickedIndices: number[];
  public selectedIndices: number[];

  public nSamples: number;
  public pointSets: PointSet[];
  public pointStyles: newPointStyle[] = null;

  public lineWidth: number = 1;

  public isHovered: boolean = false;
  public isSelecting: boolean = false;
  public selectionBox = new SelectionBox();
  public isZooming: boolean = false;
  public zoomBox = new SelectionBox();

  public viewPoint: Vertex = new Vertex(0, 0);
  public fixedObjects: ShapeCollection;
  public absoluteObjects: ShapeCollection;
  public relativeObjects: ShapeCollection;

  public font: string = "sans-serif";

  protected offset: Vertex;
  protected margin: Vertex;
  protected _offsetFactor: Vertex;
  protected _marginFactor: Vertex;
  protected initScale: Vertex = new Vertex(1, -1);
  private _axisStyle = new Map<string, any>([['strokeStyle', 'hsl(0, 0%, 30%)']]);

  public features: Map<string, any[]>;
  public featureNames: string[];
  readonly MAX_PRINTED_NUMBERS = 6;
  readonly TRL_THRESHOLD = 20;

  // TODO: refactor these legacy attribute
  public scaleX: number = 1;
  public scaleY: number = 1;
  public is_drawing_rubber_band: boolean = false;

  constructor(
    data: any,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      this.unpackAxisStyle(data);
      this.origin = new Vertex(X, Y);
      this.size = new Vertex(width - X, height - Y);
      this.features = this.unpackData(data);
      this.featureNames = Array.from(this.features.keys());
      this.nSamples = this.features.entries().next().value[1].length;
      this.initSelectors();
      this.scaleX = this.scaleY = 1;
      this.TRL_THRESHOLD /= Math.min(Math.abs(this.initScale.x), Math.abs(this.initScale.y));
      this.buildPointSets(data);
      this.drawnFeatures = this.setFeatures(data);
      this.axes = this.setAxes();
      this.fixedObjects = new ShapeCollection(this.axes);
      this.relativeObjects = new GroupCollection();
      this.absoluteObjects = new GroupCollection();
    }

  get scale(): Vertex { return new Vertex(this.relativeMatrix.a, this.relativeMatrix.d)}

  set axisStyle(newAxisStyle: Map<string, any>) { newAxisStyle.forEach((value, key) => this._axisStyle.set(key, value)) }

  get axisStyle(): Map<string, any> { return this._axisStyle }

  get canvasMatrix(): DOMMatrix { return new DOMMatrix([this.initScale.x, 0, 0, this.initScale.y, 0, 0]) }

  get relativeMatrix(): DOMMatrix { return new DOMMatrix([this.initScale.x, 0, 0, this.initScale.y, 0, 0]) }

  get falseIndicesArray(): boolean[] { return new Array(this.nSamples).fill(false) }

  get offsetFactor(): Vertex { return this._offsetFactor ?? new Vertex(0.027, 0.035) }

  set offsetFactor(value: Vertex) { this._offsetFactor = value }

  get marginFactor(): Vertex { return this._marginFactor ?? new Vertex(0.01, 0.02) }

  set marginFactor(value: Vertex) { this._marginFactor = value }

  public static fromMultiplot(data: any, width: number, height: number, canvasID: string): Figure {
    if (data.type_ == "histogram") return new Histogram(data, width, height, 0, 0, canvasID, true);
    else if (data.type_ == "parallelplot")return new ParallelPlot(data, width, height, 0, 0, canvasID, true);
    else if (data.type_ == "draw") return new Draw(data, width, height, 0, 0, canvasID, true);
    else if (data.type_ == "graph2d") return new Graph2D(data, width, height, 0, 0, canvasID, true);
    else if (data.type_ == "primitivegroupcontainer") return new PrimitiveGroupContainer(data, width, height, false, 0, 0, canvasID, true);
    else if (data.type_ == "scatterplot") return new Scatter(data, width, height, 0, 0, canvasID, true);
  }

  public isInCanvas(vertex: Vertex): boolean {
    return vertex.x >= this.origin.x && vertex.x <= this.origin.x + this.size.x && vertex.y >= this.origin.y && vertex.y <= this.origin.y + this.size.y
  }

  protected unpackAxisStyle(data:any): void {
    if (data.axis?.axis_style?.color_stroke) this.axisStyle.set("strokeStyle", data.axis.axis_style.color_stroke);
    if (data.axis?.axis_style?.line_width) this.axisStyle.set("lineWidth", data.axis.axis_style.line_width);
    if (data.axis?.graduation_style?.font_style) this.axisStyle.set("font", data.axis.graduation_style.font_style);
    if (data.axis?.graduation_style?.font_size) this.axisStyle.set("ticksFontsize", data.axis.graduation_style.font_size);
  }

  protected unpackPointsSets(data: any): void {
    data.points_sets.forEach((pointSet, index) => {
      this.pointSets.push(new PointSet(pointSet.point_index, colorHsl(pointSet.color), pointSet.name ?? `Point set ${index}`));
    });
  }

  protected unpackData(data: any): Map<string, any[]> { return Figure.deserializeData(data) }

  public serializeFeatures(): any {
    const elements = [];
    for (let i=0; i < this.nSamples; i++) {
      const newSample = {};
      this.featureNames.forEach(feature => newSample[feature] = this.features.get(feature)[i]);
      elements.push(newSample);
    }
    return elements
  }

  protected buildPointSets(data: any): void {
    this.pointSets = [];
    if (data.points_sets) this.unpackPointsSets(data);
  }

  public getSetColorOfIndex(index: number): string {
    for (let set of this.pointSets) { if (set.indices.includes(index)) return set.color }
    return null
  }

  public static deserializeData(data: any): Map<string, any[]> {
    const unpackedData = new Map<string, any[]>();
    if (data.x_variable) unpackedData.set(data.x_variable, []);
    if (data.y_variable) unpackedData.set(data.y_variable, []);
    if (!data.elements) return unpackedData;
    const featureKeys = data.elements.length ? Array.from(Object.keys(data.elements[0].values)) : [];
    featureKeys.push("name");
    featureKeys.forEach(feature => unpackedData.set(feature, data.elements.map(element => element[feature])));
    return unpackedData
  }

  public drawBorders() {
    const rect = new newRect(this.origin, this.size);
    rect.lineWidth = 0.5;
    rect.strokeStyle = "hsl(0, 0%, 83%)";
    rect.isFilled = false;
    rect.draw(this.context);
  }

  private drawCanvas(): void {
    this.context.clearRect(this.origin.x - 1, this.origin.y - 1, this.width + 2, this.height + 2);
  }

  public setCanvas(canvasID: string):void {
    const canvas = document.getElementById(canvasID) as HTMLCanvasElement;
    canvas.width = this.width;
		canvas.height = this.height;
    this.context = canvas.getContext("2d");
  }

  public updateAxes(): void {
    const axesSelections = [];
    this.axes.forEach(axis => {
      axis.update(this.axisStyle, this.viewPoint, new Vertex(this.scaleX, this.scaleY), this.translation);
      if (axis.rubberBand.length != 0) axesSelections.push(this.updateSelected(axis));
    })
    this.updateSelection(axesSelections);
  }

  public changeAxisFeature(name: string, index: number): void {
    this.drawnFeatures[index] = name;
    this.axes[index] = this.setAxis(name, this.axes[index].boundingBox, this.axes[index].origin, this.axes[index].end, this.axes[index].nTicks);
    this.resetScales();
    this.draw();
  }

  protected setFeatures(data: any): string[] { return data.attribute_names ?? Array.from(this.features.keys()) }

  protected computeNaturalOffset(): Vertex { return new Vertex(this.width * this.offsetFactor.x, this.height * this.offsetFactor.y) }

  protected computeOffset(): Vertex {
    const naturalOffset = this.computeNaturalOffset();
    return new Vertex(Math.max(naturalOffset.x, MIN_OFFSET) + BLANK_SPACE, Math.max(naturalOffset.y, MIN_FONTSIZE));
  }

  protected get marginOffset(): Vertex { return new Vertex(SIZE_END, SIZE_END) }

  protected setBounds(): Vertex {
    this.offset = this.computeOffset();
    this.margin = new Vertex(this.size.x * this.marginFactor.x, this.size.y * this.marginFactor.y).add(this.marginOffset);
    return this.computeBounds()
  }

  protected computeBounds(): Vertex {
    const canvasOrigin = this.origin.scale(this.initScale);
    this.drawOrigin = this.offset.add(canvasOrigin);
    this.drawEnd = canvasOrigin.add(this.size.subtract(this.margin));
    const freeSpace = new Vertex(Math.abs(this.drawOrigin.x - this.origin.x), Math.abs(this.drawOrigin.y - this.origin.y));
    if (this.canvasMatrix.a < 0) this.swapDimension("x", this.drawOrigin, this.drawEnd, freeSpace);
    if (this.canvasMatrix.d < 0) this.swapDimension("y", this.drawOrigin, this.drawEnd, freeSpace);
    return freeSpace
  }

  protected swapDimension(dimension: string, origin: Vertex, end: Vertex, freeSpace: Vertex): void {
    origin[dimension] = origin[dimension] - this.size[dimension];
    end[dimension] = end[dimension] - this.size[dimension];
    freeSpace[dimension] = Math.abs(this.origin[dimension] - origin[dimension] * this.initScale[dimension] + this.size[dimension]);
  }

  protected setAxes(): newAxis[] {
    const freeSpace = this.setBounds();
    const axisBoundingBoxes = this.buildAxisBoundingBoxes(freeSpace);
    return this.buildAxes(axisBoundingBoxes)
  }

  protected buildAxisBoundingBoxes(freeSpace: Vertex): newRect[] { return }

  protected buildAxes(axisBoundingBox: newRect[]): newAxis[] { return [] }

  protected transformAxes(axisBoundingBoxes: newRect[]): void {
    axisBoundingBoxes.forEach((box, index) => this.axes[index].boundingBox = box);
  }

  protected setAxis(feature: string, axisBoundingBox: newRect, origin: Vertex, end: Vertex, nTicks: number = undefined): newAxis {
    const axis = new newAxis(this.features.get(feature), axisBoundingBox, origin, end, feature, this.initScale, nTicks);
    axis.updateStyle(this.axisStyle);
    return axis
  }

  protected setAxesTitleWidth(): void {}

  private relocateAxes(): void {
    const freeSpace = this.computeBounds();
    const axisBoundingBoxes = this.buildAxisBoundingBoxes(freeSpace);
    this.transformAxes(axisBoundingBoxes);
  }

  public updateSelection(axesSelections: number[][]): void {
    if (!this.is_in_multiplot) this.selectedIndices = Figure.intersectArrays(axesSelections);
  }

  public static intersectArrays(arrays: any[][]): any[] {
    if (arrays.length == 1) return arrays[0]
    if (arrays.length == 0) return []
    const arraysIntersection = [];
    const allValues = arrays.concat(...arrays)
    allValues.forEach(value => {
      let inAllArrays = true;
      for (let i=0; i < arrays.length; i++) {
        if (!arrays[i].includes(value)) { inAllArrays = false; break }
      }
      if (inAllArrays) arraysIntersection.push(value);
    })
    return uniqueValues(arraysIntersection)
  }

  protected updateSize(): void { this.size = new Vertex(this.width, this.height) }

  protected resetAxes(): void { this.axes.forEach(axis => axis.reset()) }

  public updateDimensions(): void {
    this.updateSize();
    this.computeOffset();
    this.relocateAxes();
    this.setAxesTitleWidth();
  }

  public resetScales(): void {
    this.updateDimensions();
    this.axes.forEach(axis => axis.resetScale());
  }

  public resetView(): void {
    this.resetScales();
    this.draw();
  }

  public resize(): void {
    this.updateDimensions();
    this.axes.forEach(axis => axis.updateTicks());
  }

  public resizeUpdate(): void {
    this.resize();
    this.draw();
  }

  public multiplotInstantiation(origin: Vertex, width: number, height: number): void {
    this.origin = origin;
    this.width = width;
    this.height = height;
  }

  public multiplotDraw(origin: Vertex, width: number, height: number): void {
    this.multiplotInstantiation(origin, width, height);
    this.resetView();
  }

  public multiplotResize(origin: Vertex, width: number, height: number): void {
    this.multiplotInstantiation(origin, width, height);
    this.resizeUpdate();
  }

  public static createFromMultiplot(data: any, features: Map<string, any>, context: CanvasRenderingContext2D, canvasID: string): Figure {
    const plot = Figure.fromMultiplot(data, 500, 500, canvasID);
    plot.features = features;
    plot.context = context;
    return plot
  }

  public initSelectors(): void {
    this.hoveredIndices = [];
    this.clickedIndices = [];
    this.selectedIndices = [];
    this.fixedObjects?.resetShapeStates();
    this.absoluteObjects?.resetShapeStates();
    this.relativeObjects?.resetShapeStates();
  }

  protected resetSelectors(): void {
    this.selectionBox = new SelectionBox();
    this.initSelectors();
  }

  public reset(): void {
    this.resetAxes();
    this.resetSelectors();
  }

  protected resetSelection(): void {
    this.resetRubberBands();
    this.resetSelectors();
  }

  public resetRubberBands(): void {
    this.axes.forEach(axis => axis.rubberBand.reset());
    this.selectedIndices = [];
  }

  public updateSelected(axis: newAxis): number[] {
    const selection = [];
    const vector = axis.stringsToValues(this.features.get(axis.name));
    vector.forEach((value, index) => axis.isInRubberBand(value) ? selection.push(index) : {});
    return selection
  }

  protected isRubberBanded(): boolean {
    let isRubberBanded = true;
    this.axes.forEach(axis => isRubberBanded = isRubberBanded && axis.rubberBand.length != 0);
    return isRubberBanded
  }

  public drawInZone(context: CanvasRenderingContext2D): void {
    const previousCanvas = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    this.updateDrawnObjects(context);
    this.updateCuttingZone(context);
    const cutDraw = context.getImageData(this.origin.x, this.origin.y, this.size.x, this.size.y);
    context.globalCompositeOperation = "source-over";
    context.putImageData(previousCanvas, 0, 0);
    context.putImageData(cutDraw, this.origin.x, this.origin.y);
  }

  protected updateDrawnObjects(context: CanvasRenderingContext2D): void {}

  protected updateCuttingZone(context: CanvasRenderingContext2D): void {
    context.globalCompositeOperation = "destination-in";
    context.fill(this.cuttingZone.path);
  }

  protected get cuttingZone(): newRect {
    const axesOrigin = this.axes[0].origin.transform(this.canvasMatrix);
    return new newRect(axesOrigin, this.axesEnd.subtract(axesOrigin));
  }

  protected get axesEnd() { return new Vertex(this.axes[this.axes.length - 1].end.x, this.axes[this.axes.length - 1].end.y).transform(this.canvasMatrix) }

  protected drawFixedObjects(context: CanvasRenderingContext2D): void { this.fixedObjects.draw(context) }

  public drawZoneRectangle(context: CanvasRenderingContext2D): SelectionBox {
    const zoneRect = new SelectionBox(this.origin, this.size);
    zoneRect.fillStyle = "hsl(203, 90%, 88%)";
    zoneRect.hoverStyle = zoneRect.clickedStyle = zoneRect.strokeStyle = "hsl(203, 90%, 73%)";
    zoneRect.alpha = 0.3;
    zoneRect.lineWidth = 1;
    zoneRect.dashLine = [7, 7];
    zoneRect.draw(context);
    return zoneRect
  }

  protected drawRelativeObjects(context: CanvasRenderingContext2D) { this.relativeObjects = new GroupCollection([]) }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D) { this.absoluteObjects = new GroupCollection() }

  protected computeRelativeObjects() {}

  public draw(): void {
    this.context.save();
    this.drawCanvas();
    this.context.setTransform(this.canvasMatrix);

    this.updateAxes();
    this.computeRelativeObjects();

    this.context.setTransform(this.relativeMatrix);
    this.drawRelativeObjects(this.context);

    this.context.resetTransform();
    this.drawAbsoluteObjects(this.context);

    this.context.setTransform(this.relativeMatrix);
    this.drawSelectionBox(this.context);
    this.drawZoomBox(this.context);

    this.context.setTransform(this.canvasMatrix);
    this.drawFixedObjects(this.context);
    this.drawTooltips();

    this.context.resetTransform();
    this.drawBorders();
    this.context.restore();
  }

  public switchSelection(): void { this.isSelecting = !this.isSelecting; this.draw() }

  public switchMerge(): void {}

  public switchZoom(): void {}

  public switchOrientation(): void {}

  public togglePoints(): void {}

  protected updateSelectionBox(frameDown: Vertex, frameMouse: Vertex): void { this.selectionBox.update(frameDown, frameMouse) }

  public get drawingZone(): [Vertex, Vertex] { return [this.origin, this.size] }

  protected drawSelectionBox(context: CanvasRenderingContext2D) {
    if ((this.isSelecting || this.is_drawing_rubber_band) && this.selectionBox.isDefined) {
      this.selectionBox.updateScale(this.axes[0].transformMatrix.a, this.axes[1].transformMatrix.d);
      this.selectionBox.buildRectangle(
        new Vertex(this.axes[0].minValue, this.axes[1].minValue),
        new Vertex(this.axes[0].interval, this.axes[1].interval)
      );
      if (this.selectionBox.area != 0) {
        this.selectionBox.buildPath();
        this.selectionBox.draw(context);
      }
      this.relativeObjects.shapes.push(this.selectionBox);
    }
  }

  private drawZoomBox(context: CanvasRenderingContext2D): void {
    if (this.isZooming && this.zoomBox.isDefined) {
      this.zoomBox.buildRectangle(
        new Vertex(this.axes[0].minValue, this.axes[1].minValue),
        new Vertex(this.axes[0].interval, this.axes[1].interval)
      );
      this.zoomBox.draw(context);
    }
  }

  public updateZoomBox(frameDown: Vertex, frameMouse: Vertex): void {}

  protected zoomBoxUpdateAxes(zoomBox: SelectionBox): void { // TODO: will not work for a 3+ axes plot
    this.axes[0].minValue = Math.min(zoomBox.minVertex.x, zoomBox.maxVertex.x);
    this.axes[0].maxValue = Math.max(zoomBox.minVertex.x, zoomBox.maxVertex.x);
    this.axes[1].minValue = Math.min(zoomBox.minVertex.y, zoomBox.maxVertex.y);
    this.axes[1].maxValue = Math.max(zoomBox.minVertex.y, zoomBox.maxVertex.y);
    this.axes.forEach(axis => axis.saveLocation());
    this.updateAxes();
  }

  protected drawTooltips(): void {
    this.relativeObjects.drawTooltips(this.origin, this.size, this.context, this.is_in_multiplot);
    this.absoluteObjects.drawTooltips(this.origin, this.size, this.context, this.is_in_multiplot);
  }

  public mouseTranslate(currentMouse: Vertex, mouseDown: Vertex): Vertex {
    return currentMouse.subtract(mouseDown)
  }

  public mouseMove(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): void {
    this.fixedObjects.mouseMove(this.context, canvasMouse);
    this.absoluteObjects.mouseMove(this.context, absoluteMouse);
    this.relativeObjects.mouseMove(this.context, frameMouse);
  }

  public projectMouse(e: MouseEvent): [Vertex, Vertex, Vertex] {
    const mouseCoords = new Vertex(e.offsetX, e.offsetY);
    return [mouseCoords.scale(this.initScale), mouseCoords.transform(this.relativeMatrix.inverse()), mouseCoords]
  }

  public mouseDown(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, newShape] {
    const fixedClickedObject = this.fixedObjects.mouseDown(canvasMouse);
    const absoluteClickedObject = this.absoluteObjects.mouseDown(absoluteMouse);
    const relativeClickedObject = this.relativeObjects.mouseDown(frameMouse);
    const clickedObject = fixedClickedObject ?? relativeClickedObject ?? absoluteClickedObject ?? null;
    return [canvasMouse, frameMouse, clickedObject]
  }

  public mouseUp(ctrlKey: boolean): void {
    if (!this.isSelecting && !this.is_drawing_rubber_band && this.translation.normL1 < 10) {
      this.absoluteObjects.mouseUp(ctrlKey);
      this.relativeObjects.mouseUp(ctrlKey);
    }
    this.fixedObjects.mouseUp(ctrlKey);
  }

  public mouseMoveDrawer(canvas: HTMLElement, e: MouseEvent, canvasDown: Vertex, frameDown: Vertex, clickedObject: newShape): [Vertex, Vertex, Vertex] {
    const [canvasMouse, frameMouse, absoluteMouse] = this.projectMouse(e);
    this.isHovered = this.isInCanvas(absoluteMouse);
    this.mouseMove(canvasMouse, frameMouse, absoluteMouse);
    if (canvasDown) {
      const translation = this.mouseTranslate(canvasMouse, canvasDown);
      if (!(clickedObject instanceof newAxis)) {
        if ((!clickedObject || translation.normL1 >= 10) && (!this.isSelecting && !this.isZooming)) this.translate(canvas, translation);
      }
      if (this.isSelecting) {
        if (clickedObject instanceof SelectionBox) this.updateSelectionBox(clickedObject.minVertex, clickedObject.maxVertex)
        else this.updateSelectionBox(frameDown, frameMouse);
      }
      this.updateZoomBox(frameDown, frameMouse);
    }
    if (this.isZooming || this.isSelecting) canvas.style.cursor = 'crosshair';
    return [canvasMouse, frameMouse, absoluteMouse]
  }

  public mouseDownDrawer(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, newShape]  {
    const [canvasDown, frameDown, clickedObject] = this.mouseDown(canvasMouse, frameMouse, absoluteMouse);
    if (!(clickedObject instanceof newAxis)) this.is_drawing_rubber_band = this.isSelecting;
    return [canvasDown, frameDown, clickedObject]
  }

  public mouseUpDrawer(ctrlKey: boolean): [newShape, Vertex] {
    if (this.isZooming) {
      if (this.zoomBox.area != 0) this.zoomBoxUpdateAxes(this.zoomBox);
      this.zoomBox.update(new Vertex(0, 0), new Vertex(0, 0));
    }
    this.mouseUp(ctrlKey);
    this.draw();
    return this.resetMouseEvents()
  }

  public mouseWheelDrawer(e: WheelEvent): void {
    this.wheelFromEvent(e);
    this.updateWithScale();
  }

  public mouseLeaveDrawer(canvas: HTMLElement, shiftKey: boolean): [boolean, Vertex] {
    const isZooming = this.isZooming; // TODO: get rid of this with a mousehandler refactor
    this.mouseUpDrawer(true);
    this.isZooming = isZooming;
    this.axes.forEach(axis => {
      axis.saveLocation();
      axis.isClicked = axis.isHovered = false;
    });
    this.translation = new Vertex(0, 0);
    if (!shiftKey) canvas.style.cursor = 'default';
    return [false, null]
  }

  public keyDownDrawer(canvas: HTMLElement, keyString: string, ctrlKey: boolean, shiftKey: boolean, spaceKey: boolean): [boolean, boolean, boolean] {
    if (keyString == "Control") {
      ctrlKey = true;
      if (spaceKey && this.isHovered) this.resetView();
    }
    if (keyString == "Shift") {
      shiftKey = true;
      if (!ctrlKey) this.shiftOnAction(canvas);
    }
    if (keyString == " ") {
      spaceKey = true;
      if (ctrlKey && this.isHovered) this.resetView();
    }
    return [ctrlKey, shiftKey, spaceKey]
  }

  public keyUpDrawer(canvas: HTMLElement, keyString: string, ctrlKey: boolean, shiftKey: boolean, spaceKey: boolean): [boolean, boolean, boolean] {
    if (keyString == "Control") ctrlKey = false;
    if (keyString == " ") spaceKey = false;
    if (keyString == "Shift") {
      shiftKey = false;
      this.shiftOffAction(canvas);
    }
    return [ctrlKey, shiftKey, spaceKey]
  }

  public initRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {
    this.axes.forEach(axis => axis.sendRubberBand(multiplotRubberBands));
  }

  public updateRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {
    this.axes.forEach(axis => axis.sendRubberBandRange(multiplotRubberBands));
  }

  public sendRubberBandsMultiplot(figures: Figure[]): void {
    figures.forEach(figure => figure.receiveRubberBandFromFigure(this));
  }

  protected sendRubberBandsInFigure(figure: Figure): void {
    figure.axes.forEach(otherAxis => {
      this.axes.forEach(thisAxis => {
        if (thisAxis.name == otherAxis.name && thisAxis.name != "number") {
          otherAxis.rubberBand.minValue = thisAxis.rubberBand.minValue;
          otherAxis.rubberBand.maxValue = thisAxis.rubberBand.maxValue;
          otherAxis.emitter.emit("rubberBandChange", otherAxis.rubberBand);
        }
      })
    })
  }

  protected receiveRubberBandFromFigure(figure: Figure): void { figure.sendRubberBandsInFigure(this) }

  public translate(canvas: HTMLElement, translation: Vertex): void {
    canvas.style.cursor = 'move';
    this.translation = translation;
  }

  public activateSelection(emittedRubberBand: RubberBand, index: number): void { this.is_drawing_rubber_band = true }

  public shiftOnAction(canvas: HTMLElement): void {
    this.isSelecting = true;
    canvas.style.cursor = 'crosshair';
    this.draw();
  }

  public shiftOffAction(canvas: HTMLElement): void {
    this.isSelecting = false;
    this.is_drawing_rubber_band = false;
    canvas.style.cursor = 'default';
    this.draw();
  }

  public axisChangeUpdate(e: newAxis): void {}

  public mouseListener(): void {
    // TODO: mouseListener generally suffers from a bad initial design that should be totally rethink in a specific refactor development
    let clickedObject: newShape = null;
    let canvasMouse: Vertex = null; let canvasDown: Vertex = null;
    let frameMouse: Vertex = null; let frameDown: Vertex = null;
    let absoluteMouse: Vertex = null;
    const canvas = document.getElementById(this.canvasID) as HTMLCanvasElement;
    let ctrlKey = false; let shiftKey = false; let spaceKey = false;

    this.axes.forEach((axis, index) => axis.emitter.on('rubberBandChange', e => this.activateSelection(e, index)));

    this.axes.forEach(axis => axis.emitter.on('axisStateChange', e => this.axisChangeUpdate(e)));

    window.addEventListener('keydown', e => {
      if (e.key == " ") e.preventDefault();
      [ctrlKey, shiftKey, spaceKey] = this.keyDownDrawer(canvas, e.key, ctrlKey, shiftKey, spaceKey);
    });

    window.addEventListener('keyup', e => {
      [ctrlKey, shiftKey, spaceKey] = this.keyUpDrawer(canvas, e.key, ctrlKey, shiftKey, spaceKey);
    });

    canvas.addEventListener('mousemove', e => {
      e.preventDefault();
      [canvasMouse, frameMouse, absoluteMouse] = this.mouseMoveDrawer(canvas, e, canvasDown, frameDown, clickedObject);
      this.draw();
      if (!this.isInCanvas(absoluteMouse)) canvasDown = null;
    });

    canvas.addEventListener('mousedown', () => {
      [canvasDown, frameDown, clickedObject] = this.mouseDownDrawer(canvasMouse, frameMouse, absoluteMouse);
      if (ctrlKey && shiftKey) this.reset();
    });

    canvas.addEventListener('mouseup', () => {
      if (canvasDown) [clickedObject, canvasDown] = this.mouseUpDrawer(ctrlKey);
      if (!shiftKey) canvas.style.cursor = 'default';
    })

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.mouseWheelDrawer(e);
      this.draw();
    });

    canvas.addEventListener('mouseleave', () => [ctrlKey, canvasDown] = this.mouseLeaveDrawer(canvas, shiftKey));
  }

  protected resetMouseEvents(): [newShape, Vertex] {
    this.is_drawing_rubber_band = false;
    this.isZooming = false;
    this.axes.forEach(axis => axis.saveLocation());
    this.translation = new Vertex(0, 0);
    return [null, null]
  }

  protected regulateScale(): void {}

  protected updateWithScale(): void {
    this.regulateScale();
    this.updateAxes(); // needs a refactor
    this.axes.forEach(axis => axis.saveLocation());
    [this.scaleX, this.scaleY] = [1, 1];
    this.viewPoint = new Vertex(0, 0);
  }

  public zoomIn(): void { this.zoom(new Vertex(this.origin.x + this.size.x / 2, this.origin.y + this.size.y / 2), 342) }

  public zoomOut(): void { this.zoom(new Vertex(this.origin.x + this.size.x / 2, this.origin.y + this.size.y / 2), -342) }

  private zoom(center: Vertex, zFactor: number): void {
    this.mouseWheel(center, zFactor);
    this.updateWithScale();
    this.draw();
  }

  public wheelFromEvent(e: WheelEvent): void { this.mouseWheel(new Vertex(e.offsetX, e.offsetY), -Math.sign(e.deltaY)) }

  public mouseWheel(mouseCoords: Vertex, deltaY: number): void {
    const zoomFactor = deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    this.scaleX *= zoomFactor;
    this.scaleY *= zoomFactor;
    this.viewPoint = new Vertex(mouseCoords.x, mouseCoords.y).scale(this.initScale);
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
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
      this.setAxesTitleWidth();
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

  get sampleDrawings(): ShapeCollection { return this.relativeObjects }

  public get drawingZone(): [Vertex, Vertex] {
    const origin = new Vertex();
    origin.x = this.initScale.x < 0 ? this.axes[0].end.x : this.axes[0].origin.x;
    origin.y = this.initScale.y < 0 ? this.axes[1].end.y : this.axes[1].origin.y;
    const size = new Vertex(Math.abs(this.axes[0].end.x - this.axes[0].origin.x), Math.abs(this.axes[1].end.y - this.axes[1].origin.y))
    return [origin.transform(this.canvasMatrix.inverse()), size]
  }

  protected get axesEnd() { return new Vertex(this.axes[0].end.x, this.axes[1].end.y).transform(this.canvasMatrix) }

  protected setAxesTitleWidth(): void {
    this.axes.forEach(axis => axis.titleWidth = this.drawingZone[1].x - 5);
  }

  protected unpackAxisStyle(data: any): void {
    super.unpackAxisStyle(data);
    this.nXTicks = data.axis?.nb_points_x ?? this.nXTicks;
    this.nYTicks = data.axis?.nb_points_y ?? this.nYTicks;
  }

  public mouseMove(canvasMouse: Vertex, absoluteMouse: Vertex, frameMouse: Vertex): void {
    super.mouseMove(canvasMouse, absoluteMouse, frameMouse);
    this.hoveredIndices = this.sampleDrawings.updateShapeStates('isHovered');
  }

  public mouseUp(ctrlKey: boolean): void {
    super.mouseUp(ctrlKey);
    this.clickedIndices = this.sampleDrawings.updateShapeStates('isClicked');
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

  public changeAxisFeature(name: string, index: number): void {
    if (index == 0) this.xFeature = name
    else this.yFeature = name;
    super.changeAxisFeature(name, index);
  }

  protected transformAxes(axisBoundingBoxes: newRect[]): void {
    super.transformAxes(axisBoundingBoxes);
    this.axes[0].transform(this.drawOrigin, new Vertex(this.drawEnd.x, this.drawOrigin.y));
    this.axes[1].transform(this.drawOrigin, new Vertex(this.drawOrigin.x, this.drawEnd.y));
  }

  protected buildAxes(axisBoundingBoxes: newRect[]): [newAxis, newAxis] {
    super.buildAxes(axisBoundingBoxes);
    return [
      this.setAxis(this.xFeature, axisBoundingBoxes[0], this.drawOrigin, new Vertex(this.drawEnd.x, this.drawOrigin.y), this.nXTicks),
      this.setAxis(this.yFeature, axisBoundingBoxes[1], this.drawOrigin, new Vertex(this.drawOrigin.x, this.drawEnd.y), this.nYTicks)
    ]
  }

  protected buildAxisBoundingBoxes(freeSpace: Vertex): newRect[] {
    const xBoundingBox = new newRect(
      new Vertex(this.drawOrigin.x, this.drawOrigin.y - freeSpace.y),
      new Vertex(this.drawEnd.x - this.drawOrigin.x, freeSpace.y)
    );
    const yBoundingBox = new newRect(
      new Vertex(this.drawOrigin.x - freeSpace.x, this.drawOrigin.y),
      new Vertex(freeSpace.x - BLANK_SPACE, this.drawEnd.y - this.drawOrigin.y)
    );
    return [xBoundingBox, yBoundingBox]
  }

  protected drawRelativeObjects(context: CanvasRenderingContext2D): void {
    super.drawRelativeObjects(context);
    if (this.isRubberBanded()) this.updateSelectionBox(...this.rubberBandsCorners);
  }

  protected updateSelectionBox(frameDown: Vertex, frameMouse: Vertex) {
    this.axes[0].rubberBand.minValue = Math.min(frameDown.x, frameMouse.x);
    this.axes[1].rubberBand.minValue = Math.min(frameDown.y, frameMouse.y);
    this.axes[0].rubberBand.maxValue = Math.max(frameDown.x, frameMouse.x);
    this.axes[1].rubberBand.maxValue = Math.max(frameDown.y, frameMouse.y);
    super.updateSelectionBox(...this.rubberBandsCorners);
  }

  public switchZoom(): void { this.isZooming = !this.isZooming }

  public updateZoomBox(frameDown: Vertex, frameMouse: Vertex): void {
    if (this.isZooming) this.zoomBox.update(frameDown, frameMouse);
  }

  public get rubberBandsCorners(): [Vertex, Vertex] {
    return [new Vertex(this.axes[0].rubberBand.minValue, this.axes[1].rubberBand.minValue), new Vertex(this.axes[0].rubberBand.maxValue, this.axes[1].rubberBand.maxValue)]
  }

  public activateSelection(emittedRubberBand: RubberBand, index: number): void {
    super.activateSelection(emittedRubberBand, index)
    this.selectionBox.rubberBandUpdate(emittedRubberBand, ["x", "y"][index]);
  }

  protected regulateScale(): void {
    for (const axis of this.axes) {
      if (axis.tickPrecision >= this.MAX_PRINTED_NUMBERS) {
        if (this.scaleX > 1) this.scaleX = 1;
        if (this.scaleY > 1) this.scaleY = 1;
      } else if (axis.tickPrecision < 1) {
        if (this.scaleX < 1) this.scaleX = 1;
        if (this.scaleY < 1) this.scaleY = 1;
      } else if (axis.isDiscrete && axis.ticks.length > uniqueValues(axis.labels).length + 2) {
        if (this.scaleX < 1) this.scaleX = 1;
        if (this.scaleY < 1) this.scaleY = 1;
      }
    }
  }
}

export class Histogram extends Frame {
  public bars: Bar[] = [];

  public fillStyle: string = 'hsl(203, 90%, 85%)';
  public strokeStyle: string = null;
  public dashLine: number[] = [];

  constructor(
    data: any,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
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

  public reset(): void {
    super.reset();
    this.bars = [];
  }

  private updateNumberAxis(numberAxis: newAxis, bars: Bar[]): newAxis {
    this.features.set('number', this.getNumberFeature(bars));
    numberAxis.minValue = 0;
    numberAxis.maxValue = Math.max(...this.features.get(this.yFeature)) + 1;
    numberAxis.saveLocation();
    numberAxis.updateTicks();
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

  private fakeFeatures(): void {
    if (!this.features.has(this.xFeature)) this.features.set(this.xFeature, []);
  }

  private computeBars(vector: number[]): Bar[] {
    this.fakeFeatures();
    const baseAxis = this.axes[0] ?? this.setAxis(this.xFeature, new newRect(), new Vertex(), new Vertex(), this.nXTicks);
    const numericVector = baseAxis.stringsToValues(vector ?? []);
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

  protected drawRelativeObjects(context: CanvasRenderingContext2D): void {
    super.drawRelativeObjects(context);
    this.bars.forEach(bar => bar.draw(this.context));
    this.relativeObjects.shapes = [...this.bars, ...this.relativeObjects.shapes];
  }

  private getBarSetColor(bar: Bar): string {
    const setMaps = new Map<number, number>();
    bar.values.forEach(pointIndex => {
      this.pointSets.forEach((pointSet, index) => {
        if (pointSet.includes(pointIndex)) setMaps.set(index, setMaps.get(index) ? setMaps.get(index) + 1 : 1);
      })
    })
    const pointsSetIndex = mapMax(setMaps)[0];
    if (pointsSetIndex !== null) return colorHsl(this.pointSets[pointsSetIndex].color);
  }

  private getBarsDrawing(): void {
    const fullTicks = this.boundedTicks(this.axes[0]);
    const minY = this.boundedTicks(this.axes[1])[0];
    this.bars.forEach((bar, index) => {
      let origin = new Vertex(fullTicks[index], minY);
      let size = new Vertex(fullTicks[index + 1] - fullTicks[index], bar.length > minY ? bar.length - minY : 0);
      if (this.axes[0].isDiscrete) origin.x = origin.x - (fullTicks[2] - fullTicks[1]) / 2;
      const color = this.getBarSetColor(bar) ?? this.fillStyle;
      bar.updateStyle(
        origin, size,
        this.hoveredIndices, this.clickedIndices, this.selectedIndices,
        color, this.strokeStyle, this.dashLine, this.lineWidth
      );
    })
  }

  protected buildAxes(axisBoundingBoxes: newRect[]): [newAxis, newAxis] {
    const bars = this.computeBars(this.features.get(this.xFeature));
    this.features.set('number', this.getNumberFeature(bars));
    const [xAxis, yAxis] = super.buildAxes(axisBoundingBoxes)
    return [xAxis, this.updateNumberAxis(yAxis, bars)]
  }

  protected setFeatures(data: any): [string, string] {
    data["attribute_names"] = [data.x_variable, 'number']; // legacy, will disappear
    return super.setFeatures(data);
  }

  public mouseTranslate(currentMouse: Vertex, mouseDown: Vertex): Vertex {
    const translation = super.mouseTranslate(currentMouse, mouseDown);
    return new Vertex(this.axes[0].isDiscrete ? 0 : translation.x, 0)
  }

  protected regulateScale(): void {
    this.scaleY = 1;
    for (const axis of this.axes) {
      if (axis.tickPrecision >= this.MAX_PRINTED_NUMBERS) {
        if (this.scaleX > 1) this.scaleX = 1;
      } else if (axis.tickPrecision < 1) {
        if (this.scaleX < 1) this.scaleX = 1;
      } else if (axis.isDiscrete && axis.ticks.length > uniqueValues(axis.labels).length + 2) {
        if (this.scaleX < 1) this.scaleX = 1;
      }
    }
  }

  public initRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {
    this.axes[0].sendRubberBand(multiplotRubberBands);
  }

  public updateRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {
    this.axes[0].sendRubberBandRange(multiplotRubberBands);
  }

  protected sendRubberBandsInFigure(figure: Figure): void {
    figure.axes.forEach(otherAxis => {
      if (this.axes[0].name == otherAxis.name) {
        otherAxis.rubberBand.minValue = this.axes[0].rubberBand.minValue;
        otherAxis.rubberBand.maxValue = this.axes[0].rubberBand.maxValue;
        otherAxis.emitter.emit("rubberBandChange", otherAxis.rubberBand);
      }
    })
  }
}

const DEFAULT_POINT_COLOR: string = 'hsl(203, 90%, 85%)';
export class Scatter extends Frame {
  public points: ScatterPoint[] = [];

  public fillStyle: string = DEFAULT_POINT_COLOR;
  public strokeStyle: string = null;
  public marker: string = 'circle';
  public pointSize: number = 8;

  public tooltipAttributes: string[];
  public isMerged: boolean = false;
  public clusterColors: string[];
  public previousCoords: Vertex[];
  constructor(
    data: any,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
      if (this.nSamples > 0) {
        this.tooltipAttributes = data.tooltip ? data.tooltip.attribute : Array.from(this.features.keys());
        this.unpackPointStyle(data);
        this.computePoints();
      }
    }

  get sampleDrawings(): ShapeCollection { return this.absoluteObjects }

  public unpackPointStyle(data: any): void {
    if (data.point_style?.color_fill) this.fillStyle = data.point_style.color_fill;
    if (data.point_style?.color_stroke) this.strokeStyle = data.point_style.color_stroke;
    if (data.point_style?.shape) this.marker = data.point_style.shape;
    if (data.point_style?.stroke_width) this.lineWidth = data.point_style.stroke_width;
    if (data.point_style?.size) this.pointSize = data.point_style.size;
    if (data.tooltip) this.tooltipAttributes = data.tooltip.attributes;
  }

  public resetScales(): void {
    super.resetScales();
    this.computePoints();
  }

  public multiplotResize(origin: Vertex, width: number, height: number): void {
    super.multiplotResize(origin, width, height);
    this.computePoints();
  }

  public reset(): void {
    super.reset();
    this.computePoints();
    this.resetClusters();
  }

  public resize(): void {
    super.resize();
    this.computePoints();
  }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D): void {
    super.drawAbsoluteObjects(context);
    this.drawPoints(context);
    this.absoluteObjects.shapes = [...this.points, ...this.absoluteObjects.shapes];
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
      else color = this.getPointSetColor(point) ?? color;

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

  private getPointSetColor(point: ScatterPoint): string {
    const setMaps = new Map<number, number>();
    point.values.forEach(pointIndex => {
      this.pointSets.forEach((pointSet, index) => {
        if (pointSet.includes(pointIndex)) setMaps.set(index, setMaps.get(index) ? setMaps.get(index) + 1 : 1);
      })
    })
    const pointsSetIndex = mapMax(setMaps)[0];
    if (pointsSetIndex !== null) return colorHsl(this.pointSets[pointsSetIndex].color);
  }

  public switchMerge(): void {
    this.isMerged = !this.isMerged;
    this.computePoints();
    this.draw();
  }

  protected zoomBoxUpdateAxes(zoomBox: SelectionBox): void {
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

  private fakeFeatures(): void {
    if (!this.features.has(this.xFeature)) this.features.set(this.xFeature, []);
    if (!this.features.has(this.yFeature)) this.features.set(this.yFeature, []);
  }

  private projectPoints(): [number[], number[], number[], number[]] {
    this.fakeFeatures();
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

  public simpleCluster(inputValue: number): void {
    this.computeClusterColors(inputValue);
    this.draw();
  }

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

  public translate(canvas: HTMLElement, translation: Vertex): void {
    super.translate(canvas, translation);
    const pointTRL = new Vertex(translation.x * this.initScale.x, translation.y * this.initScale.y);
    this.points.forEach((point, index) => {
      point.center = this.previousCoords[index].add(pointTRL);
      point.update();
    })
  }

  public mouseDown(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): [Vertex, Vertex, any] {
    let [superCanvasMouse, superFrameMouse, clickedObject] = super.mouseDown(canvasMouse, frameMouse, absoluteMouse);
    this.previousCoords = this.points.map(p => p.center);
    return [superCanvasMouse, superFrameMouse, clickedObject]
  }

  public mouseUp(ctrlKey: boolean): void {
    super.mouseUp(ctrlKey);
    this.previousCoords = [];
  }

  protected updateWithScale(): void {
    super.updateWithScale();
    if (this.nSamples > 0) this.computePoints();
  }
}

export class Graph2D extends Scatter {
  public curves: LineSequence[];
  private curvesIndices: number[][];
  public showPoints: boolean = false;
  constructor(
    data: any,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
    }

  protected unpackData(data: any): Map<string, any[]> {
    const graphSamples = [];
    this.pointStyles = [];
    this.curvesIndices = [];
    this.curves = [];
    if (data.graphs) {
      data.graphs.forEach(graph => {
        if (graph.elements.length != 0) {
          this.curves.push(LineSequence.unpackGraphProperties(graph));
          const curveIndices = range(graphSamples.length, graphSamples.length + graph.elements.length);
          const graphPointStyle = new newPointStyle(graph.point_style);
          this.pointStyles.push(...new Array(curveIndices.length).fill(graphPointStyle));
          this.curvesIndices.push(curveIndices);
          graphSamples.push(...graph.elements);
        }
      })
    }
    return Figure.deserializeData({"elements": graphSamples})
  }

  public updateSelection(axesSelections: number[][]): void {
    const inMultiplot = this.is_in_multiplot;
    this.is_in_multiplot = false;
    super.updateSelection(axesSelections);
    this.is_in_multiplot = inMultiplot;
  }

  protected updateDrawnObjects(context: CanvasRenderingContext2D): void {
    this.curves.forEach((curve, curveIndex) => {
      curve.update(this.curvesIndices[curveIndex].map(index => { return this.points[index] }));
      curve.draw(context);
    })
  }

  protected buildPointSets(data: any): void { this.pointSets = []; }

  protected get cuttingZone(): newRect {
    const axesOrigin = this.axes[0].origin.transform(this.canvasMatrix);
    const axesEnd = new Vertex(this.axes[0].end.x, this.axes[1].end.y).transform(this.canvasMatrix);
    return new newRect(axesOrigin, axesEnd.subtract(axesOrigin));
  }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D): void {
    this.drawInZone(context);
    if (this.showPoints) {
      super.drawAbsoluteObjects(context);
      this.absoluteObjects.shapes = [...this.absoluteObjects.shapes, ...this.curves];
    } else {
      this.absoluteObjects = new GroupCollection([...this.curves]);
    }
  }

  public resetScales(): void {
    const scale = new Vertex(this.frameMatrix.a, this.frameMatrix.d).scale(this.initScale);
    const translation = new Vertex(this.axes[0].maxValue - this.axes[0].initMaxValue, this.axes[1].maxValue - this.axes[1].initMaxValue).scale(scale);
    this.curves.forEach(curve => {
      if (curve.mouseClick) {
        curve.previousMouseClick = curve.previousMouseClick.add(translation);
        curve.mouseClick = curve.previousMouseClick.copy();
      }
    });
    super.resetScales();
  }

  public switchMerge(): void { this.isMerged = false }

  public togglePoints(): void {
    this.showPoints = !this.showPoints;
    this.draw();
  }

  public translate(canvas: HTMLElement, translation: Vertex): void {
    super.translate(canvas, translation);
    this.curves.forEach(curve => { if (curve.mouseClick) curve.mouseClick = curve.previousMouseClick.add(translation.scale(this.initScale)) });
  }

  public mouseUp(ctrlKey: boolean): void {
    super.mouseUp(ctrlKey);
    this.curves.forEach(curve => { if (curve.mouseClick) curve.previousMouseClick = curve.mouseClick.copy() });
  }

  public initRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public updateRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public sendRubberBandsMultiplot(figures: Figure[]): void {}

  protected receiveRubberBandFromFigure(figure: Figure): void {}
}

const FREE_SPACE_FACTOR = 0.95;
export class ParallelPlot extends Figure {
  public axes: ParallelAxis[];
  public curves: LineSequence[];
  public curveColor: string = 'hsl(203, 90%, 85%)';
  public changedAxes: ParallelAxis[] = [];
  private _isVertical: boolean;
  constructor(
    data: any,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
      this.computeCurves();
    }

  get isVertical(): boolean { return this._isVertical ?? true }

  set isVertical(value: boolean) { this._isVertical = value }

  get offsetFactor(): Vertex { return this._offsetFactor ?? new Vertex(0.005, 0.015) }

  set offsetFactor(value: Vertex) { this._offsetFactor = value }

  get marginFactor(): Vertex { return this._marginFactor ?? new Vertex(0.005, 0.0025) }

  set marginFactor(value: Vertex) { this._marginFactor = value }

  public shiftOnAction(canvas: HTMLElement): void {}

  protected computeOffset(): Vertex { return this.computeNaturalOffset() }

  protected get marginOffset(): Vertex { return new Vertex(SIZE_END, SIZE_END) }

  public updateDimensions(): void {
    super.updateDimensions();
    this.updateAxesLocation();
  }

  public switchOrientation(): void {
    this.isVertical = !this.isVertical;
    this.updateAxesLocation();
    this.draw();
  }

  private updateAxesLocation(): void {
    const freeSpace = this.setBounds();
    const axisBoundingBoxes = this.buildAxisBoundingBoxes(freeSpace);
    const axesEnds = this.getAxesLocations();
    this.axes.forEach((axis, index) => {
      axis.updateLocation(...axesEnds[index], axisBoundingBoxes[index], index, this.drawnFeatures.length);
    });
    this.computeCurves();
  }

  protected buildAxes(axisBoundingBoxes: newRect[]): ParallelAxis[] {
    super.buildAxes(axisBoundingBoxes);
    const axesEnds = this.getAxesLocations();
    const axes: ParallelAxis[] = [];
    this.drawnFeatures.forEach((featureName, index) => {
      const axis = new ParallelAxis(this.features.get(featureName), axisBoundingBoxes[index], ...axesEnds[index], featureName, this.initScale);
      axis.updateStyle(this.axisStyle);
      axis.computeTitle(index, this.drawnFeatures.length);
      axes.push(axis);
    })
    return axes
  }

  private computeBoxesSize(): number {
    if (this.isVertical) return (this.drawEnd.x - this.drawOrigin.x) / this.drawnFeatures.length
    return (this.drawEnd.y - this.drawOrigin.y) / this.drawnFeatures.length
  }

  protected buildAxisBoundingBoxes(freeSpace: Vertex): newRect[] {
    const size = this.computeBoxesSize();
    const boundingBoxes: newRect[] = [];
    this.drawnFeatures.forEach((_, index) => {
      if (this.isVertical) boundingBoxes.push(this.verticalAxisBoundingBox(this.drawOrigin, this.drawEnd.y - this.drawOrigin.y, size, index));
      else boundingBoxes.push(this.horizontalAxisBoundingBox(this.drawOrigin, this.drawEnd.x - this.drawOrigin.x, size, index));
    });
    return boundingBoxes
  }

  private horizontalAxisBoundingBox(drawOrigin: Vertex, axisSize: number, size: number, index: number): newRect {
    const boundingBox = new newRect(drawOrigin.copy(), new Vertex(axisSize, size * FREE_SPACE_FACTOR));
    boundingBox.origin.y += (this.drawnFeatures.length - 1 - index) * size;
    return boundingBox
  }

  private verticalAxisBoundingBox(drawOrigin: Vertex, axisSize: number, size: number, index: number): newRect {
    const freeSpaceOffset = size * (1 - FREE_SPACE_FACTOR) / 2;
    const boundingBox = new newRect(new Vertex(drawOrigin.x + freeSpaceOffset, drawOrigin.y), new Vertex(size - freeSpaceOffset, axisSize));
    boundingBox.origin.x += size * index;
    return boundingBox
  }

  private getAxesLocations(): [Vertex, Vertex][] {
    return this.isVertical ? this.verticalAxesLocation() : this.horizontalAxesLocation()
  }

  private verticalAxesLocation(): [Vertex, Vertex][] {
    const boxSize = (this.drawEnd.x - this.drawOrigin.x) / this.drawnFeatures.length;
    const freeSpace = (this.drawEnd.x - this.drawOrigin.x) / this.drawnFeatures.length * (1 - FREE_SPACE_FACTOR) / 4;
    const axesEnds: [Vertex, Vertex][] = [];
    this.drawnFeatures.forEach((_, index) => {
      const verticalX = this.drawOrigin.x + (index + 0.5) * boxSize + freeSpace;
      axesEnds.push([new Vertex(verticalX, this.drawOrigin.y), new Vertex(verticalX, this.drawEnd.y)])
    })
    return axesEnds
  }

  private horizontalAxesLocation(): [Vertex, Vertex][] {
    const drawHeight = this.drawEnd.y - this.drawOrigin.y;
    const LOCAL_MIN_OFFSET = drawHeight - MIN_OFFSET * 1.2;
    const firstEnds: [Vertex, Vertex] = [
      new Vertex(this.drawOrigin.x, this.drawEnd.y - 0.015 * drawHeight),
      new Vertex(this.drawEnd.x, this.drawEnd.y - 0.015 * drawHeight)
    ];
    const lastEnds: [Vertex, Vertex] = [
      new Vertex(this.drawOrigin.x, this.drawEnd.y - Math.min(0.9 * drawHeight, LOCAL_MIN_OFFSET)),
      new Vertex(this.drawEnd.x, this.drawEnd.y - Math.min(0.9 * drawHeight, LOCAL_MIN_OFFSET))
    ];
    const yStep = (lastEnds[0].y - firstEnds[0].y) / (this.drawnFeatures.length - 1);
    const axesEnds: [Vertex, Vertex][] = [firstEnds];
    this.drawnFeatures.slice(1, this.drawnFeatures.length - 1).forEach((_, index) => {
      axesEnds.push([
        new Vertex(firstEnds[0].x, firstEnds[0].y + (index + 1) * yStep),
        new Vertex(firstEnds[1].x, firstEnds[1].y + (index + 1) * yStep)
      ]);
    });
    axesEnds.push(lastEnds);
    return axesEnds
  }

  public computePoint(axis: newAxis, featureValue: number): newPoint2D {
    const xCoord = this.isVertical ? axis.origin.x : axis.relativeToAbsolute(featureValue);
    const yCoord = this.isVertical ? axis.relativeToAbsolute(featureValue) : axis.origin.y;
    return new newPoint2D(xCoord, yCoord).scale(this.initScale);
  }

  public computeCurves(): void {
    this.curves = [];
    for (let i=0; i < this.nSamples; i++) {
      const curve = new LineSequence([], String(i));
      this.drawnFeatures.forEach((feature, j) => curve.points.push(this.computePoint(this.axes[j], this.features.get(feature)[i])));
      curve.hoveredThickener = curve.clickedThickener = 0;
      curve.selectedThickener = 1;
      this.curves.push(curve);
    }
  }

  public updateCurves(): void {
    this.curves.forEach((curve, i) => {
      this.changedAxes.forEach(axis => {
        const featureIndex = this.drawnFeatures.indexOf(axis.name);
        curve.points[featureIndex] = this.computePoint(axis, this.features.get(axis.name)[i]);
      })
      curve.buildPath();
      curve.isHovered = this.hoveredIndices.includes(i) && !this.isSelecting && !this.is_drawing_rubber_band;
      curve.isClicked = this.clickedIndices.includes(i);
      curve.isSelected = this.selectedIndices.includes(i);
      curve.lineWidth = this.lineWidth;
      curve.strokeStyle = this.getSetColorOfIndex(i) ?? this.curveColor;
    })
  }

  protected drawSelectionBox(context: CanvasRenderingContext2D): void {}

  public switchZoom(): void {}

  private drawCurves(context: CanvasRenderingContext2D): void {
    const unpickedIndices = ParallelPlot.arraySetDiff(Array.from(Array(this.nSamples).keys()), [...this.hoveredIndices, ...this.clickedIndices, ...this.selectedIndices]);
    unpickedIndices.forEach(i => this.curves[i].draw(context));
    this.pointSets.forEach(pointSet => pointSet.indices.forEach(i => this.curves[i].draw(context)));
    [this.selectedIndices, this.clickedIndices, this.hoveredIndices].forEach(indices => { for (let i of indices) this.curves[i].draw(context) });
  }

  public static arraySetDiff(A: any[], B: any[]): any[] {
    if (B.length == 0) return A
    return A.filter(x => !B.includes(x))
  }

  protected updateDrawnObjects(context: CanvasRenderingContext2D): void {
    this.updateCurves();
    this.drawCurves(context);
  }

  protected drawAbsoluteObjects(context: CanvasRenderingContext2D): void {
    this.drawInZone(context);
    this.absoluteObjects = new GroupCollection([...this.curves]);
  }

  protected drawTooltips(): void {}

  public mouseMove(canvasMouse: Vertex, frameMouse: Vertex, absoluteMouse: Vertex): void {
    this.fixedObjects.mouseMove(this.context, canvasMouse);
    if (!this.is_drawing_rubber_band) {
      this.absoluteObjects.mouseMove(this.context, absoluteMouse);
      this.relativeObjects.mouseMove(this.context, frameMouse);
    };
    this.changeDisplayOrder();
    this.hoveredIndices = this.absoluteObjects.updateShapeStates('isHovered');
  }

  private changeDisplayOrder(): void {
    if (this.isVertical) this.axes.sort((a, b) => a.origin.x - b.origin.x)
    else this.axes.sort((a, b) => b.origin.y - a.origin.y);
    this.drawnFeatures = this.axes.map((axis, i) => {
      if (this.drawnFeatures[i] != axis.name) axis.hasMoved = true;
      return axis.name;
    });
  }

  public mouseUp(ctrlKey: boolean): void {
    if (this.changedAxes.length != 0) this.updateAxesLocation();
    super.mouseUp(ctrlKey);
    if (this.changedAxes.length == 0) this.clickedIndices = this.absoluteObjects.updateShapeStates('isClicked');
  }

  protected regulateScale(): void {
    for (const axis of this.axes) {
      if (axis.boundingBox.isHovered) {
        if (axis.tickPrecision >= this.MAX_PRINTED_NUMBERS) {
          if (this.scaleX > 1) this.scaleX = 1;
          if (this.scaleY > 1) this.scaleY = 1;
        } else if (axis.tickPrecision < 1) {
          if (this.scaleX < 1) this.scaleX = 1;
          if (this.scaleY < 1) this.scaleY = 1;
        } else if (axis.isDiscrete && axis.ticks.length > uniqueValues(axis.labels).length + 2) {
          if (this.scaleX < 1) this.scaleX = 1;
          if (this.scaleY < 1) this.scaleY = 1;
        }
        axis.update(this.axisStyle, this.viewPoint, new Vertex(this.scaleX, this.scaleY), this.translation);
        axis.saveLocation();
        break;
      }
    }
    this.scaleX = this.scaleY = 1;
    this.viewPoint = new Vertex(0, 0);
  }

  public updateAxes(): void {
    const axesSelections = [];
    this.axes.forEach(axis => {
      if (axis.boundingBox.isClicked && !axis.isClicked) axis.update(this.axisStyle, this.viewPoint, new Vertex(this.scaleX, this.scaleY), this.translation);
      if (axis.rubberBand.length != 0) axesSelections.push(this.updateSelected(axis));
    })
    this.updateSelection(axesSelections);
  }

  public axisChangeUpdate(e: ParallelAxis) { if (!this.changedAxes.includes(e)) this.changedAxes.push(e); }

  protected resetMouseEvents(): [newShape, Vertex] {
    this.changedAxes = [];
    return super.resetMouseEvents()
  }
}

const DRAW_MARGIN_FACTOR = 0.025;
export class Draw extends Frame {
  constructor(
    data: any,
    public width: number,
    public height: number,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(data, width, height, X, Y, canvasID, is_in_multiplot);
      this.is_in_multiplot = false;
      this.relativeObjects = ShapeCollection.fromPrimitives(data.primitives, this.scale);
    }

  public shiftOnAction(canvas: HTMLElement): void {}

  public setCanvas(canvasID: string):void {
    super.setCanvas(canvasID);
    this.computeTextBorders(this.context);
  }

  public resetScales(): void {
    super.resetScales();
    this.updateBounds();
  }

  public reset(): void {
    super.reset();
    this.updateBounds();
    this.draw();
  }

  public resize(): void {
    super.resize();
    this.updateBounds();
    this.axisEqual();
  }

  protected unpackData(data: any): Map<string, any[]> {
    const drawing = ShapeCollection.fromPrimitives(data.primitives);
    const [minX, minY, maxX, maxY] = Draw.boundsDilatation(...drawing.getBounds());
    return new Map<string, any[]>([["x", [minX, maxX]], ["y", [minY, maxY]], ["shapes", drawing.shapes]])
  }

  private static boundsDilatation(minimum: Vertex, maximum: Vertex): [number, number, number, number] {
    const minX = minimum.x * (1 - Math.sign(minimum.x) * DRAW_MARGIN_FACTOR);
    const minY = minimum.y * (1 - Math.sign(minimum.y) * DRAW_MARGIN_FACTOR);
    const maxX = maximum.x * (1 + Math.sign(maximum.x) * DRAW_MARGIN_FACTOR);
    const maxY = maximum.y * (1 + Math.sign(maximum.y) * DRAW_MARGIN_FACTOR);
    return [minX, minY, maxX, maxY]
  }

  protected computeTextBorders(context: CanvasRenderingContext2D) {
    this.relativeObjects.updateBounds(context);
    this.updateBounds();
  }

  public updateBounds(): void {
    const [minX, minY, maxX, maxY] = Draw.boundsDilatation(this.relativeObjects.minimum, this.relativeObjects.maximum);
    this.axes[0].minValue = this.features.get("x")[0] = Math.min(this.features.get("x")[0], minX);
    this.axes[1].minValue = this.features.get("y")[0] = Math.min(this.features.get("y")[0], minY);
    this.axes[0].maxValue = this.features.get("x")[1] = Math.max(this.features.get("x")[1], maxX);
    this.axes[1].maxValue = this.features.get("y")[1] = Math.max(this.features.get("y")[1], maxY);
    this.axes.forEach(axis => axis.saveLocation());
    this.axisEqual();
  }

  protected drawRelativeObjects(context: CanvasRenderingContext2D) { this.drawInZone(context) }

  protected updateDrawnObjects(context: CanvasRenderingContext2D): void {
    this.relativeObjects.locateLabels(super.cuttingZone, this.initScale);
    this.relativeObjects.draw(context);
  }

  protected get cuttingZone(): newRect {
    const axesOrigin = this.axes[0].origin.transform(this.frameMatrix.inverse());
    const axesEnd = new Vertex(this.axes[0].end.x, this.axes[1].end.y).transform(this.frameMatrix.inverse());
    return new newRect(axesOrigin, axesEnd.subtract(axesOrigin));
  }

  protected axisEqual(): void {
    if (this.axes[0].drawScale > this.axes[1].drawScale) this.axes[0].otherAxisScaling(this.axes[1])
    else this.axes[1].otherAxisScaling(this.axes[0]);
    this.axes.forEach(axis => axis.saveLocation());
    this.updateAxes();
  }

  public initRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public updateRubberBandMultiplot(multiplotRubberBands: Map<string, RubberBand>): void {}

  public sendRubberBandsMultiplot(figures: Figure[]): void {}

  protected receiveRubberBandFromFigure(figure: Figure): void {}
}

export class PrimitiveGroupContainer extends Draw {
  constructor(
    data: any,
    public width: number,
    public height: number,
    public buttons_ON: boolean,
    X: number,
    Y: number,
    public canvasID: string,
    public is_in_multiplot: boolean = false
    ) {
      super(PG_CONTAINER_PLOT, width, height, X, Y, canvasID, is_in_multiplot);
    }
}

export function range(start: number, end: number, step: number = 1): number[] {
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
  let keyMax: string = null;
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
