import {PlotData, Interactions} from './plot-data';
import {Point2D} from './primitives';
import { Attribute, PointFamily, check_package_version, Window, TypeOf, equals, Sort, export_to_txt } from './utils';
import { PlotContour, PlotScatter, ParallelPlot, PrimitiveGroupContainer, Histogram } from './subplots';
import { List, Shape, MyObject } from './toolbox';
import { string_to_hex, string_to_rgb, rgb_to_string } from './color_conversion';

var multiplot_saves:MultiplePlots[]=[];
var current_save:number=0;


/**
 * MultiplePlots takes a list of elements (dictionaries) that represent vectors and displays it throught different representations
 * such as ParallelPlot or ScatterPlot. On top of that, each element can be represented by a PrimitiveGroup or a Graph2D.
 */
export class MultiplePlots {
    context_show:any;
    context_hidden:any;
    context:any;
    objectList:PlotData[]=[];
    dataObjects:any[]=[]
    nbObjects:number=0;
    initial_coords:[number, number][];
    points:Point2D[]=[];
    sizes:Window[]=[];
    move_plot_index:number=-1;
    clicked_index_list:number[]=[];
    clickedPlotIndex:number=-1;
    last_index:number=-1;
    small_length_nb_objects: number = 0;
    big_length_nb_objects: number = 0;
    manipulation_bool:boolean=false;
    button_y:number=0; button_w:number=0; button_h:number = 0;
    transbutton_x:number=0;
    selectDependency_bool:boolean=true;
    selectDep_x:number=0;
    view_bool:boolean=false;
    view_button_x:number=0;
    export_button_x:number=0;
    initial_objectsX:number[]=[];
    initial_objectsY:number[]=[];
    initial_object_width:number[]=[];
    initial_object_height:number[]=[];
    initial_mouseX:number=0;
    initial_mouseY:number=0;
    sorted_list:number[]=[];
    display_order:number[]=[];
    all_attributes:Attribute[]=[];
    selected_point_index:number[]=[];
    dep_selected_points_index:number[]=[]; //Intersection of objectList[i]'s selected points when dependency is enabled
    point_families:PointFamily[]=[];
    to_display_plots:number[]=[];
    primitive_dict={};
    shown_datas:any[]=[];
    hidden_datas:any[]=[];
    canvas:any;
    // Subplot dimensions before redimensioning due to settings enabled
    settings_on_initial_widths:number[]=[];
    settings_on_initial_heights:number[]=[];
    obj_settings_on:number=-1;
    view_on_disposition:boolean = false; //True if layout disposition, turns false if you move the subplots

    click_on_button: boolean = false;

    public padding: number;


    constructor(public data: any[], public width:number, public height:number, public buttons_ON: boolean, public canvas_id: string) {
      var requirement = '0.6.1';
      check_package_version(data['package_version'], requirement);
      this.dataObjects = data['plots'];
      this.initial_coords = data['coords'] || Array(this.dataObjects.length).fill([0,0]);
      var elements = data['elements'];
      if (elements) {this.initialize_all_attributes();}
      this.nbObjects = this.dataObjects.length;
      this.initialize_sizes();
      this.define_canvas(canvas_id);
      for (let i=0; i<this.nbObjects; i++) {
        let object_type_ = this.dataObjects[i]['type_'];
        if ((object_type_ === 'scatterplot') || (this.dataObjects[i]['type_'] == 'graph2d')) {
          this.dataObjects[i]['elements'] = elements;
          var newObject:any = new PlotScatter(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id, true);
        } else if (object_type_ === 'parallelplot') {
          this.dataObjects[i]['elements'] = elements;
          newObject = new ParallelPlot(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id, true);
        } else if (object_type_ === 'primitivegroup') {
          newObject = new PlotContour(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id, true);
        } else if (object_type_ === 'primitivegroupcontainer') {
          newObject = new PrimitiveGroupContainer(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id, true);
          if (this.dataObjects[i]['association']) {
            this.initializeObjectContext(newObject);
            let association = this.dataObjects[i]['association'];
            newObject = this.initialize_containers_dicts(newObject, association['associated_elements']);
            newObject = this.call_layout(newObject, association['attribute_names']);
          }
        } else if (object_type_ === 'histogram') {
          this.dataObjects[i]['elements'] = elements;
          newObject = new Histogram(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id, true);
        } else {
          throw new Error('MultiplePlots constructor : invalid object type');
        }
        this.initializeObjectContext(newObject);
        this.objectList.push(newObject);
      }
      if (elements) {this.initialize_point_families();}

      for (let i=0; i<this.nbObjects; i++) {
        this.objectList[i].draw_initial();
        this.display_order.push(i);
        this.to_display_plots.push(i);
      }
      this.mouse_interaction();

      if (buttons_ON) {
        this.initializeButtons();
        this.draw_buttons();
      }
      if (data['initial_view_on']) {
        this.clean_view();
        this.store_dimensions();
      }
      // this.save_canvas();
    }


    initialize_sizes() {
      var temp_sizes = this.data['sizes'];
      if (temp_sizes) {
        for (let i=0; i<this.nbObjects; i++) {
          this.sizes.push(Window.deserialize(temp_sizes[i]));
        }
      } else {
        for (let i=0; i<this.nbObjects; i++) {
          this.sizes.push(new Window(300, 560));
        }
      }
    }

    initialize_all_attributes() {
      this.all_attributes = [];
      var attribute_names = Object.getOwnPropertyNames(this.data['elements'][0]);
      var exceptions = ['name', 'package_version', 'object_class'];
      for (let i=0; i<attribute_names.length; i++) {
        if (!(List.is_include(attribute_names[i], exceptions))) {
          let name = attribute_names[i];
          let type_ = TypeOf(this.data['elements'][0][name]);
          this.all_attributes.push(new Attribute(name, type_));
        }
      }
    }

    initialize_point_families() {
      let point_index = [];
      for (let i=0; i<this.data['elements'].length; i++) {
        point_index.push(i);
      }
      let new_point_family = new PointFamily(string_to_hex('grey'), point_index, 'Initial family');
      this.add_point_family(new_point_family);
      if (this.data['point_families'] != undefined) {
        for (let i=0; i<this.data['point_families'].length; i++) {
          let new_point_family = PointFamily.deserialize(this.data['point_families'][i]);
          this.add_point_family(new_point_family);
        }
      }
    }


    change_point_family_order(index1:number, index2:number) {
      List.switchElements(this.point_families, index1, index2);
      for (let i=0; i<this.nbObjects; i++) {
        this.objectList[i].point_families = this.point_families;
      }
    }


    resize_multiplot(new_width:number, new_height:number): void {
      var old_width = this.width;
      this.width = new_width;
      var ratio = new_width/old_width;
      this.height = new_height;
      for (let i=0; i<this.nbObjects; i++) {
        this.objectList[i].X = this.objectList[i].X * ratio;
        this.objectList[i].Y = this.objectList[i].Y * ratio;
      }
      this.define_canvas(this.canvas_id);
      // this.redrawAllObjects();
    }


    initializeButtons():void {
      this.button_y = this.height - 25;
      this.button_w = 45;
      this.button_h = 20;
      this.transbutton_x = 5;
      this.selectDep_x = this.transbutton_x + this.button_w + 5;
      this.view_button_x = this.selectDep_x + this.button_w + 5;
      this.export_button_x = this.view_button_x + this.button_w + 5;
    }

    store_dimensions() {
      this.settings_on_initial_widths = [];
      this.settings_on_initial_heights = [];
      for (let obj of this.objectList) {
        this.settings_on_initial_widths.push(obj.width);
        this.settings_on_initial_heights.push(obj.height);
      }
    }

    draw_manipulation_button():void {
        Shape.createButton(this.transbutton_x, this.button_y, this.button_w, this.button_h, this.context_show, this.manipulation_bool.toString(), '12px sans-serif');
    }

    draw_selection_dependency_button():void {
      if (this.selectDependency_bool === true) {
        Shape.createButton(this.selectDep_x, this.button_y, this.button_w, this.button_h, this.context_show, "Dep ON", '10px sans-serif');
      } else {
        Shape.createButton(this.selectDep_x, this.button_y, this.button_w, this.button_h, this.context_show, "Dep OFF", '10px sans-serif');
      }
    }

    draw_clean_view_button():void {
      if (this.view_bool) {
        Shape.createButton(this.view_button_x, this.button_y, this.button_w, this.button_h, this.context_show, 'ViewON', '10px sans-serif');
      } else {
        Shape.createButton(this.view_button_x, this.button_y, this.button_w, this.button_h, this.context_show, 'ViewOFF', '10px sans-serif');
      }
    }

    draw_export_button(): void {
      Shape.createButton(this.export_button_x, this.button_y, this.button_w, this.button_h, this.context_show,
                         'export', '10px sans-serif');
    }

    draw_buttons():void {
      this.draw_manipulation_button();
      this.draw_selection_dependency_button();
      this.draw_clean_view_button();
      this.draw_export_button();

    }

    click_on_view_action() {
      this.view_bool = !this.view_bool;
      this.manipulation_bool = this.view_bool;
      this.refreshAllManipulableBool();
      if (this.view_bool) {
        this.clean_view();
        this.store_dimensions();
      }
    }

    click_on_export_action() {
      let text = "Indices: [" + this.dep_selected_points_index.toString() + "]\n\n";
      text = text + "Points: \n";
      let keys = Object.keys(this.data["elements"][0]);
      for (let i of this.dep_selected_points_index) {
        let element = this.data["elements"][i];
        text = text + "{";
        for (let key of keys) {
          text = text + key + ":" + element[key].toString() + ", ";
        }
        text = text.slice(0, -2);
        text = text + "}\n";
      }

      export_to_txt("selected_points", text);
    }

    click_on_button_action(click_on_translation_button, click_on_selectDep_button, click_on_view,
                           click_on_export) {
      if (click_on_translation_button) {
        this.manipulation_bool_action();
      } else if (click_on_selectDep_button) {
        this.selectDep_action();
      } else if (click_on_view) {
        this.click_on_view_action();
      } else if (click_on_export) {
        this.click_on_export_action();
      }
      this.redrawAllObjects();
    }

    initializeObjectContext(object:PlotData):void {
      object.context_show = this.context_show;
      object.context_hidden = this.context_hidden;
      if (object.type_ == 'primitivegroupcontainer') {
        for (let i=0; i<object['primitive_groups'].length; i++) {
          object['primitive_groups'][i].context_show = this.context_show;
          object['primitive_groups'][i].context_hidden = this.context_hidden;
        }
      }
    }

    define_canvas(canvas_id: string):void {
      this.canvas = document.getElementById(canvas_id);
      this.canvas.width = this.width;
          this.canvas.height = this.height;
      this.context_show = this.canvas.getContext("2d");
      var hiddenCanvas:any = document.createElement("canvas", { is : canvas_id });
      hiddenCanvas.id = canvas_id + '_hidden';
          hiddenCanvas.width = this.width;
          hiddenCanvas.height = this.height;
      this.context_hidden = hiddenCanvas.getContext("2d");
    }

    initialize_new_plot_data(new_plot_data:PlotData) {
      this.initializeObjectContext(new_plot_data);
      new_plot_data.point_families = this.point_families;
      if (new_plot_data.type_ == 'scatterplot') {
        for (let family of this.point_families) {
          for (let index of family.point_index) {
              new_plot_data.plotObject.point_list[index].point_families.push(family);
          }
        }
      }
      this.objectList.push(new_plot_data);
      this.nbObjects++;
      this.display_order.push(this.nbObjects-1);
      this.to_display_plots.push(this.nbObjects-1);
      new_plot_data.draw_initial();
      new_plot_data.mouse_interaction(new_plot_data.isParallelPlot);
      new_plot_data.interaction_ON = false;
      // this.redrawAllObjects();
    }

    get_attribute(name:string) {
      for (let attribute of this.all_attributes) {
        if (attribute.name === name) {
          return attribute;
        }
      }
      throw new Error('get_attribute(): ' + name + ' is not an attribute');
    }

    add_scatterplot(attr_x:Attribute, attr_y:Attribute) {
      var graduation_style = {text_color:string_to_rgb('grey'), font_size:12, font_style:'sans-serif', text_align_x:'center', text_align_y:'alphabetic', name:''};
      var axis_style = {line_width:0.5, color_stroke:string_to_rgb('grey'), dashline:[], name:''};
      var DEFAULT_AXIS = {nb_points_x:10, nb_points_y:10, graduation_style: graduation_style, axis_style: axis_style, arrow_on: false, grid_on: true, type_:'axis', name:''};
      var surface_style = {color_fill: string_to_rgb('lightblue'), opacity:0.75, hatching:undefined};
      var text_style = {text_color: string_to_rgb('black'), font_size:10, font_style:'sans-serif', text_align_x:'start', text_align_y:'alphabetic', name:''};
      var DEFAULT_TOOLTIP = {attribute_names:[attr_x.name, attr_y.name], surface_style:surface_style, text_style:text_style, tooltip_radius:5, type_:'tooltip', name:''};
      var point_style = {color_fill:string_to_rgb('lightblue'), color_stroke:string_to_rgb('grey'), stroke_width:0.5, size:2, shape:'circle', name:''};
      var new_scatter = {tooltip:DEFAULT_TOOLTIP, attribute_names: [attr_x.name, attr_y.name], point_style: point_style,
                         elements:this.data['elements'], axis:DEFAULT_AXIS, type_:'scatterplot', name:'', package_version: this.data['package_version']};
      var DEFAULT_WIDTH = 560;
      var DEFAULT_HEIGHT = 300;
      var new_plot_data = new PlotScatter(new_scatter, DEFAULT_WIDTH, DEFAULT_HEIGHT, this.buttons_ON, 0, 0, this.canvas_id);
      this.initialize_new_plot_data(new_plot_data);
    }

    add_parallelplot(attributes:Attribute[]) {
      var attribute_names = [];
      for (let i=0; i<attributes.length; i++) {
        attribute_names.push(attributes[i].name);
      }
      var edge_style = {line_width:0.5, color_stroke:string_to_rgb('black'), dashline:[], name:''};
      var pp_data = {edge_style:edge_style, disposition: 'vertical', attribute_names:attribute_names,
                    rgbs:[[192, 11, 11], [14, 192, 11], [11, 11, 192]], elements:this.data['elements'], name:'', package_version:this.data['package_version']};
      var DEFAULT_WIDTH = 560;
      var DEFAULT_HEIGHT = 300;
      var new_plot_data = new ParallelPlot(pp_data, DEFAULT_WIDTH, DEFAULT_HEIGHT, this.buttons_ON, 0, 0, this.canvas_id);
      this.initialize_new_plot_data(new_plot_data);
    }

    add_primitivegroup(serialized:string, point_index:number): void {
      var plot_data = new PlotContour(serialized, 560, 300, this.buttons_ON, 0, 0, this.canvas_id);
      this.primitive_dict[point_index.toString()] = this.nbObjects;
      this.initialize_new_plot_data(plot_data);
    }

    remove_primitivegroup(point_index): void { // point_index can be a number as well as a string (ex: 1 or '1') since it is converted into string anyway
      var keys = Object.getOwnPropertyNames(this.primitive_dict);
      if (!List.is_include(point_index.toString(), keys)) { throw new Error('remove_primitivegroup() : input point is not associated with any primitive group');}
      var primitive_index = this.primitive_dict[point_index.toString()];
      this.remove_plot(primitive_index);
      this.primitive_dict = MyObject.removeEntries([point_index.toString()], this.primitive_dict);
      for (let key of keys) {
        if (this.primitive_dict[key]>primitive_index) {
          this.primitive_dict[key]--;
        }
      }
      this.redrawAllObjects();
    }


    remove_all_primitivegroups() {
      var points_index:string[] = Object.getOwnPropertyNames(this.primitive_dict);
      for (let index of points_index) {
        this.remove_primitivegroup(index);
      }
      this.redrawAllObjects();
    }

    initialize_containers_dicts(new_plot_data, associated_points:number[]) {
      var primitive_entries = [];
      var elements_entries = [];
      if (associated_points.length !== new_plot_data.primitive_groups.length) {
          throw new Error("initialize_containers_dicts(): container.primitive_groups and associated_points don't have the same length.");
      }
      for (let i=0; i<associated_points.length; i++) {
        let associated_point_index = associated_points[i];
        primitive_entries.push([associated_point_index, i]);
        elements_entries.push([i, this.data['elements'][associated_point_index]]);
      }
      new_plot_data.primitive_dict = Object.fromEntries(primitive_entries);
      new_plot_data.elements_dict = Object.fromEntries(elements_entries);
      return new_plot_data;
    }

    call_layout(new_plot_data, attribute_names:string[]=null) {
      if (equals(attribute_names, [])) attribute_names = null;
      if (attribute_names === null) {
        new_plot_data.regular_layout();
      } else {
        var layout = [];
        for (let name of attribute_names) {
          layout.push(this.get_attribute(name));
        }
        if (layout.length == 1) {
          new_plot_data.multiplot_one_axis_layout(layout[0]);
        } else if (layout.length == 2) {
          new_plot_data.multiplot_two_axis_layout(layout);
        }
      }
      return new_plot_data;
    }


    add_primitive_group_container(serialized=empty_container, associated_points:number[]=[], attribute_names:string[]=null): number { // layout options : 'regular', [<attribute>] or [<attribute1>, <attribute2>]
      var new_plot_data:PrimitiveGroupContainer = new PrimitiveGroupContainer(serialized, 560, 300, this.buttons_ON, 0, 0, this.canvas_id);
      if (attribute_names !== null) {
        new_plot_data = this.initialize_containers_dicts(new_plot_data, associated_points);
        let displayable_names = Array.from(this.all_attributes, attribute => attribute.name);
        for (let name of attribute_names) {
          if (!displayable_names.includes(name)) {
            throw new Error('add_primitive_group_container(): ' + name + " isn't a valid attribute");
          }
        }
      }
      this.initialize_new_plot_data(new_plot_data);
      try {
        new_plot_data = this.call_layout(new_plot_data, attribute_names);
      } catch(e) {
        console.warn('F');
      }
      if (serialized['primitive_groups'].length !== 0) {
        this.redrawAllObjects();
      } else {
        let obj = this.objectList[this.nbObjects - 1];
        obj.draw();
      }
      return this.nbObjects - 1;
    }

    add_primitive_group_to_container(serialized, container_index, point_index) {
      let obj:any = this.objectList[container_index];
      obj.elements_dict = MyObject.add_properties(obj.elements_dict, [obj.primitive_groups.length, this.data['elements'][point_index]]);
      obj.add_primitive_group(serialized, point_index); // primitive_dict updated inside this function
    }

    remove_primitive_group_from_container(point_index, container_index) {
      let obj:any = this.objectList[container_index];
      try {
        obj.remove_primitive_group(point_index);
      } catch(e) {
        console.warn('WARNING - remove_primitive_group_from_container() : point n°' + point_index + " may not be associated with any primitive_group");
      }
    }

    remove_all_primitive_groups_from_container(container_index) {
      var obj:any = this.objectList[container_index];
      obj.reinitialize_all();
      obj.draw();
    }

    remove_plot(index) {
      this.objectList = List.remove_at_index(index, this.objectList);
      this.nbObjects--;
      this.display_order = List.remove_element(index, this.display_order);
      for (let i=0; i<this.display_order.length; i++) {
        if (this.display_order[i]>index) {
          this.display_order[i]--;
        }
      }
      if (List.is_include(index, this.to_display_plots)) { this.to_display_plots = List.remove_element(index, this.to_display_plots); }
      for (let i=0; i<this.to_display_plots.length; i++) {
        if (this.to_display_plots[i]>index) {
          this.to_display_plots[i]--;
        }
      }
      this.clickedPlotIndex = -1;
      this.move_plot_index = -1;
    }

    getObjectIndex(x, y): number[] {
      var index_list = [];
      for (let i=0; i<this.nbObjects; i++) {
        let display_index = this.display_order[i];
        let isInObject = Shape.isInRect(x, y, this.objectList[display_index].X, this.objectList[display_index].Y, this.objectList[display_index].width, this.objectList[display_index].height);
        if (isInObject === true) {
          index_list.push(display_index);
        }
      }
      return index_list;
    }

    getLastObjectIndex(x, y):number { // if several plots are selected, returns the last one's index
      if (this.is_on_button(x, y)) return -1;
      var index = -1;
      for (let i=0; i<this.nbObjects; i++) {
        let display_index = this.display_order[i];
        if (List.is_include(display_index, this.to_display_plots)) {
          let isInObject = Shape.isInRect(x, y, this.objectList[display_index].X, this.objectList[display_index].Y, this.objectList[display_index].width, this.objectList[display_index].height);
          if (isInObject === true) {
            index = display_index;
          }
        }
      }
      return index;
    }

    clear_object(index) {
      var obj = this.objectList[index];
      this.context_show.beginPath();
      obj.draw_empty_canvas(this.context_show);
      this.context_show.closePath();
      this.context_hidden.beginPath();
      obj.draw_empty_canvas(this.context_hidden);
      this.context_hidden.closePath();
    }

    clearAll():void {
      this.context_show.beginPath();
      this.context_show.clearRect(0, 0, this.width, this.height);
      this.context_show.stroke();
      this.context_show.closePath();
      this.context_hidden.beginPath();
      this.context_hidden.clearRect(0, 0, this.width, this.height);
      this.context_hidden.stroke();
      this.context_hidden.closePath();
    }

    show_plot(index:number) {
      if (List.is_include(index, this.to_display_plots)) {
        throw new Error('Plot n°' + index.toString() + ' already shown');
      }
      this.to_display_plots.push(index);
      this.redrawAllObjects();
    }

    hide_plot(index:number) {
      if (!(List.is_include(index, this.to_display_plots))) {
        throw new Error('Plot n°' + index.toString() + ' already hidden');
      }
      this.to_display_plots = List.remove_element(index, this.to_display_plots);
      this.redrawAllObjects();
    }

    redrawAllObjects():void {
      this.clearAll();
      if (this.clickedPlotIndex != -1) {
        let old_index = List.get_index_of_element(this.clickedPlotIndex, this.display_order);
        this.display_order = List.move_elements(old_index, this.display_order.length - 1, this.display_order);
      }
      for (let i=0; i<this.nbObjects; i++) {
        let display_index = this.display_order[i];
        if (List.is_include(display_index, this.to_display_plots)) {
          let obj = this.objectList[display_index];
          if (obj.type_ == 'parallelplot') { this.objectList[display_index].refresh_axis_coords(); }
          this.objectList[display_index].draw();
        }
      }
      if (this.buttons_ON) {
        this.draw_buttons();
      }
    }

    redraw_object() {
      this.store_datas();
      this.clearAll();
      for (let display_index of this.display_order) {
        let obj = this.objectList[display_index];
        if (display_index == this.clickedPlotIndex) {
          this.objectList[display_index].draw();
        } else {
           this.context_show.putImageData(this.shown_datas[display_index], obj.X, obj.Y);
           this.context_hidden.putImageData(this.hidden_datas[display_index], obj.X, obj.Y);
        }
      }
      if (this.buttons_ON) {
        this.draw_buttons();
      }
    }

    store_datas() {
      this.shown_datas = []; this.hidden_datas = [];
      for (let i=0; i<this.nbObjects; i++) {
        let obj = this.objectList[i];
        this.shown_datas.push(this.context_show.getImageData(obj.X, obj.Y, obj.width, obj.height));
        this.hidden_datas.push(this.context_hidden.getImageData(obj.X, obj.Y, obj.width, obj.height));
      }
    }

    isZwSelectBoolOn():boolean {
      for (let i=0; i<this.nbObjects; i++) {
        if ((this.objectList[i].zw_bool === true) || (this.objectList[i].select_bool === true)) {
          return true;
        }
      }
      return false;
    }

    translateSelectedObject(move_plot_index, tx, ty):void {
      var obj:any = this.objectList[move_plot_index]
      obj.X = obj.X + tx;
      obj.Y = obj.Y + ty;
      if (obj.type_ == 'parallelplot') { this.objectList[move_plot_index].refresh_axis_coords(); }
      // this.redraw_object();
      if (obj.type_ == 'primitivegroupcontainer') {
        for (let i=0; i<obj['primitive_groups'].length; i++) {
          obj['primitive_groups'][i].X = obj['primitive_groups'][i].X + tx;
          obj['primitive_groups'][i].Y = obj['primitive_groups'][i].Y + ty;
        }
      }
    }

    translateAllObjects(tx, ty) {
      for (let i=0; i<this.nbObjects; i++) {
        this.translateSelectedObject(i, tx, ty);
      }
      this.redrawAllObjects();
    }

    setAllInteractionsToOff():void {
      for (let i=0; i<this.nbObjects; i++) {
        this.objectList[i].interaction_ON = false;
        if (this.objectList[i].type_ == 'primitivegroupcontainer') {
          for (let j=0; j<this.objectList[i]['primitive_groups'].length; j++) {
            this.objectList[i]['primitive_groups'][j].interaction_ON = false;
          }
        }
      }
    }

    setAllInterpolationToOFF(): void {
      for (let i=0; i<this.nbObjects; i++) {
        this.objectList[i].sc_interpolation_ON = false;
      }
    }

    refreshAllManipulableBool() {
      for (let i=0; i<this.nbObjects; i++) {
        this.objectList[i].multiplot_manipulation = this.manipulation_bool;
      }
    }

    manipulation_bool_action():void {
      this.manipulation_bool = !this.manipulation_bool;
      this.refreshAllManipulableBool();
      this.selectDependency_bool = false;
      if (this.manipulation_bool === false) {
        this.view_bool = false;
      }
    }

    refresh_objects_point_families() {
      for (let i=0; i<this.nbObjects; i++) {
        this.objectList[i].point_families = this.point_families;
      }
    }

    add_point_family(point_family:PointFamily): void {
      this.point_families.push(point_family);
      var point_index = point_family.point_index;
      for (let i=0; i<this.nbObjects; i++) {
        if (this.objectList[i].type_ == 'scatterplot') {
          for (let j=0; j<point_index.length; j++) {
            this.objectList[i].plotObject.point_list[point_index[j]].point_families.push(point_family);
          }
        }
      }
      this.refresh_objects_point_families();
      this.redrawAllObjects();
    }

    remove_point_family(index:number): void {
      for (let i=0; i<this.nbObjects; i++) {
        let obj = this.objectList[i];
        if (obj.type_ == 'scatterplot') {
          for (let j=0; j<obj.plotObject.point_list.length; j++) {
            if (List.is_include(this.point_families[index], obj.plotObject.point_list[j].point_families)) {
              this.objectList[i].plotObject.point_list[j].point_families = List.remove_element(this.point_families[index],
                                                          this.objectList[i].plotObject.point_list[j].point_families);
            }
          }
        }
      }
      this.point_families = List.remove_at_index(index, this.point_families);
      this.refresh_objects_point_families();
      this.redrawAllObjects();
    }

    add_points_to_family(points_index_to_add:number[], family_index:number): void {
      for (let i=0; i<points_index_to_add.length; i++) {
        if (points_index_to_add[i] !== undefined) {
          this.point_families[family_index].point_index.push(points_index_to_add[i]);
          for (let j=0; j<this.nbObjects; j++) {
            if (this.objectList[j].type_ == 'scatterplot') {
              if (!(List.is_include(this.point_families[family_index],
                this.objectList[j].plotObject.point_list[points_index_to_add[i]].point_families))) {
                  this.objectList[j].plotObject.point_list[points_index_to_add[i]].point_families.push(this.point_families[family_index]);
                }
            }
          }
        }
      }
      this.refresh_objects_point_families();
      this.redrawAllObjects();
    }

    remove_points_from_family(points_index_to_remove:number[], family_index:number): void {
      this.point_families[family_index].point_index = List.remove_selection(points_index_to_remove, this.point_families[family_index].point_index);
      for (let i=0; i<points_index_to_remove.length; i++) {
        if (points_index_to_remove[i] !== undefined) {
          for (let j=0; j<this.nbObjects; j++) {
            this.objectList[j].point_families = this.point_families;
            if (this.objectList[j].type_ == 'scatterplot') {
              if (List.is_include(this.point_families[family_index], this.objectList[j].plotObject.point_list[points_index_to_remove[i]].point_families)) {
                this.objectList[j].plotObject.point_list[points_index_to_remove[i]].point_families = List.remove_element(this.point_families[family_index],
                  this.objectList[j].plotObject.point_list[points_index_to_remove[i]].point_families);
              }
            }
          }
        }
      }
      this.redrawAllObjects();
    }

    selectDep_action():void {
      this.selectDependency_bool = !this.selectDependency_bool;
      this.manipulation_bool = false;
      this.view_bool = false;
      for (let i=0; i<this.nbObjects; i++) {
        let obj: any = this.objectList[i];
        obj.multiplot_manipulation = this.manipulation_bool;
        if (!this.selectDependency_bool && obj.type_ === "primitivegroupcontainer") {
          obj.reset_selection();
        }
      }
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
      for (let i=0; i<this.nbObjects; i++) {
        let obj:PlotData = this.objectList[this.display_order[i]];
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

    reorder_resize_style(resize_style) {
      var resize_dict = ['n', 'ns', 'ne', 'nwse', 'nw', 'e', 'ew', 's', 'se', 'sw', 'w'];
      for (let i=0; i<resize_dict.length; i++) {
        if (resize_style.split('').sort() === resize_dict[i].split('').sort()) {
          resize_style = resize_dict[i];
          break;
        }
      }
      return resize_style;
    }

    setCursorStyle(mouse2X, mouse2Y):void {
      if (this.move_plot_index != -1) {
        var thickness = 15;
        var resize_style:any = '';
        for (let i=0; i<this.nbObjects; i++) {
          let obj:PlotData = this.objectList[i];
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
          this.canvas.style.cursor = 'default';
        } else {
          resize_style = this.reorder_resize_style(resize_style);
          this.canvas.style.cursor = resize_style + '-resize';
        }
      } else {
        this.canvas.style.cursor = 'default';
      }
    }

    refresh_dep_selected_points_index() {
      var all_index = [];
      this.dep_selected_points_index = [];
      for (let i=0; i<this.data['elements'].length; i++) {
        all_index.push(i);
        this.dep_selected_points_index.push(i);
      }
      var bool = false;
      for (let i=0; i<this.nbObjects; i++) {
        let obj = this.objectList[i];
        if ((obj.type_ === 'scatterplot') && !equals([obj.perm_window_x, obj.perm_window_y, obj.perm_window_w, obj.perm_window_h], [0,0,0,0])) {
          bool = true;
          this.dep_selected_points_index = List.listIntersection(this.dep_selected_points_index, obj.selected_point_index);
        } else if ((obj.type_ === 'parallelplot') && !List.isListOfEmptyList(obj.rubber_bands)) {
          bool = true;
          this.dep_selected_points_index = List.listIntersection(this.dep_selected_points_index, obj.pp_selected_index);
        } else if ((obj.type_ === 'histogram') && !equals(obj.selected_point_index, [])) {
          bool = true;
          this.dep_selected_points_index = List.listIntersection(this.dep_selected_points_index, obj.selected_point_index);
        }
      }

      if (equals(all_index, this.dep_selected_points_index) && !bool) {
        this.dep_selected_points_index = [];
      }
    }

    initializeMouseXY(mouse1X, mouse1Y):void {
      this.initial_mouseX = mouse1X;
      this.initial_mouseY = mouse1Y;
    }

    initializeObjectXY():void {
      this.initial_objectsX = [];
      this.initial_objectsY = [];
      for (let i=0; i<this.nbObjects; i++) {
        this.initial_objectsX.push(this.objectList[i].X);
        this.initial_objectsY.push(this.objectList[i].Y);
      }
    }

    initialize_objects_hw():void {
      this.initial_object_width = [];
      this.initial_object_height = [];
      for (let i=0; i<this.nbObjects; i++) {
        this.initial_object_width[i] = this.objectList[i].width;
        this.initial_object_height[i] = this.objectList[i].height;
      }
    }

    resetAllObjects():void {
      this.dep_selected_points_index = [];
      this.selected_point_index = [];
      for (let i=0; i<this.nbObjects; i++) {
        let type_ = this.objectList[i].type_;
        if (type_ === 'scatterplot' || type_ === 'graph2d') {
          Interactions.click_on_reset_action(this.objectList[i]);
        } else if (type_ === 'contour' || type_ === 'histogram') {
          this.objectList[i].reset_scales();
        } else if (type_ == 'primitivegroupcontainer') {
          let obj:any = this.objectList[i];
          obj.reset_action();
        } else if (type_ === 'histogram') {
          let obj: any = this.objectList[i];
          obj.reset_x_rubberband();
        }
      }
    }

    reset_all_selected_points() {
      this.dep_selected_points_index = [];
      this.selected_point_index = [];
      for (let i=0; i<this.nbObjects; i++) {
        let obj: any = this.objectList[i];
        if (obj.type_ == 'scatterplot') {
          obj.reset_select_on_click();
          Interactions.reset_permanent_window(this.objectList[i])
        } else if (obj.type_ == 'parallelplot') {
          obj.reset_pp_selected();
          obj.reset_rubberbands();
        } else if (obj.type_ === 'histogram') {
          obj.reset_x_rubberband();
        } else if (obj.type_ === "primitivegroupcontainer") {
          obj.reset_selection();
        }
      }
      this.redrawAllObjects();
    }

    reset_selected_points_except(list:number[]) {
      this.dep_selected_points_index = [];
      this.selected_point_index = [];
      for (let i=0; i<this.nbObjects; i++) {
        if (list.includes(i)) continue;
        let obj = this.objectList[i];
        if (obj.type_ == 'scatterplot') {
          this.objectList[i].reset_select_on_click(false);
          Interactions.reset_permanent_window(this.objectList[i])
        } else if (obj.type_ == 'parallelplot') {
          this.objectList[i].reset_pp_selected();
          this.objectList[i].rubber_bands = [];
          this.objectList[i].rubberbands_dep = [];
          for (let j=0; j<obj.axis_list.length; j++) {
            this.objectList[i].rubber_bands.push([]);
          }
        }
      }
      this.redrawAllObjects();
    }


    refresh_selected_point_index() {
      this.selected_point_index = [];
      for (let i=0; i<this.nbObjects; i++) {
        if (this.objectList[i].type_ == "scatterplot") {
          let selected_point_index_i = this.objectList[i].selected_point_index;
          for (let j=0; j<selected_point_index_i.length; j++) {
            this.selected_point_index.push(selected_point_index_i[j]);
          }
        }
      }
      this.selected_point_index = List.remove_duplicates(this.selected_point_index);
    }

    getSortedList() {
      var big_coord = 'X';
      var small_coord = 'Y';
      if (this.width < this.height) {[big_coord, small_coord] = [small_coord, big_coord];}
      var sort = new Sort();
      var sortedObjectList = sort.sortObjsByAttribute(this.objectList, big_coord);
      var sorted_list = [];
      for (let i=0; i<this.nbObjects; i++) {
        let sorted_index = List.get_index_of_element(sortedObjectList[i], this.objectList);
        if (List.is_include(sorted_index, this.to_display_plots)) {
          sorted_list.push(sorted_index);
        }
      }
      var sortedDisplayedObjectList = [];
      for (let i=0; i<sorted_list.length; i++) {
        sortedDisplayedObjectList.push(this.objectList[sorted_list[i]]);
      }
      var j = 0;
      while (j < sorted_list.length - this.small_length_nb_objects + 1) {
        let sub = List.subarray(sortedDisplayedObjectList, j, j + this.small_length_nb_objects);
        sub = sort.sortObjsByAttribute(sub, small_coord);
        let permutations = sort.permutations;
        let permuted = [];
        for (let k=0; k<this.small_length_nb_objects; k++) {
          permuted.push(sorted_list[j + permutations[k]]);
        }
        for (let k=0; k<this.small_length_nb_objects; k++) {
          sorted_list[j + k] = permuted[k];
        }
        j = j + this.small_length_nb_objects;
      }
      return sorted_list;
    }

    clear_objects_selected_points(object_index:number) {
      if (this.selectDependency_bool) {
        for (let i=0; i<this.nbObjects; i++) {
          if (this.objectList[i].type_ == 'scatterplot') {
            this.objectList[i].select_on_click = [];
            this.objectList[i].selected_point_index = [];
            this.objectList[i].latest_selected_points_index = [];
          }
        }
      } else {
        this.objectList[object_index].select_on_click = [];
        this.objectList[object_index].selected_point_index = [];
        this.objectList[object_index].latest_selected_points_index = [];
      }
    }


    select_points_manually(index_list:number[], object_index:number): void {
      if (this.objectList[object_index].type_ != 'scatterplot') {throw new Error('selected object must be a scatterplot');}
      this.clear_objects_selected_points(object_index);
      for (let index of index_list) {
        if (index >= this.data['elements'].length) {throw new Error('Point index out of range');}
        if (this.selectDependency_bool) {
          for (let i=0; i<this.nbObjects; i++) {
            if (this.objectList[i].type_ == 'scatterplot') {
              if (!List.is_include(index, this.objectList[i].selected_point_index)) {
                this.objectList[i].select_on_click.push(this.objectList[i].plotObject.point_list[index]);
                this.objectList[i].plotObject.point_list[index].selected = true;
                this.objectList[i].selected_point_index.push(index);
                this.objectList[i].latest_selected_points_index.push(index);
              }
            }
          }
        } else {
          if (!List.is_include(index, this.objectList[object_index].selected_point_index)) {
            this.objectList[object_index].select_on_click.push(this.objectList[object_index].plotObject.point_list[index]);
            this.objectList[object_index].plotObject.point_list[index].selected = true;
            this.objectList[object_index].selected_point_index.push(index);
            this.objectList[object_index].latest_selected_points_index.push(index);
          }
        }
      }
      this.redrawAllObjects();
    }

    clean_view():void {
      if (this.nbObjects === 1) {
        let obj = this.objectList[0];
        obj.X = 0;
        obj.Y = 0;
        obj.width = this.width;
        obj.height = this.height;
        return;
      }
      var big_coord = 'X';
      var small_coord = 'Y';
      var big_length = 'width';
      var small_length = 'height';
      if (this.width < this.height) {
        [big_coord, small_coord, big_length, small_length] = [small_coord, big_coord, small_length, big_length];
      }
      var nbObjectsDisplayed = this.to_display_plots.length;
      this.small_length_nb_objects = Math.min(Math.ceil(nbObjectsDisplayed/2), Math.floor(Math.sqrt(nbObjectsDisplayed)));
      this.big_length_nb_objects = Math.ceil(nbObjectsDisplayed/this.small_length_nb_objects);
      this.sorted_list = this.getSortedList();
      // let big_length_step = this[big_length]/big_length_nb_objects;
      // let small_length_step = this[small_length]/small_length_nb_objects;
      let blank_space = this.padding || 0.01*this[small_length];
      let big_length_step = (this[big_length] - (this.big_length_nb_objects + 1)*blank_space)/this.big_length_nb_objects;
      let small_length_step = (this[small_length] - (this.small_length_nb_objects + 1)*blank_space)/this.small_length_nb_objects;

      for (let i=0; i<this.big_length_nb_objects - 1; i++) {
        for (let j=0; j<this.small_length_nb_objects; j++) {
          var current_index = i*this.small_length_nb_objects + j; //current_index in sorted_list

          // The three following lines are useful for primitive group containers only
          let obj:any = this.objectList[this.sorted_list[current_index]];
          let old_small_coord = obj[small_coord];
          let old_big_coord = obj[big_coord];

          this.objectList[this.sorted_list[current_index]][big_coord] = i*big_length_step + (i+1)*blank_space;
          this.objectList[this.sorted_list[current_index]][small_coord] = j*small_length_step + (j+1)*blank_space;

          this.objectList[this.sorted_list[current_index]][big_length] = big_length_step;
          this.objectList[this.sorted_list[current_index]][small_length] = small_length_step;

          if (obj.type_ === 'primitivegroupcontainer') {
            for (let k=0; k<obj.primitive_groups.length; k++) {
              obj.primitive_groups[k][big_coord] += obj[big_coord] - old_big_coord;
              obj.primitive_groups[k][small_coord] += obj[small_coord] - old_small_coord;
            }
          }

        }
      }
      let last_index = current_index + 1;
      let remaining_obj = nbObjectsDisplayed - last_index;
      // let last_small_length_step = this[small_length]/remaining_obj;
      let last_small_length_step = (this[small_length] - (remaining_obj + 1)*blank_space)/remaining_obj;
      for (let j=0; j<remaining_obj; j++) {

        // The three following lines are useful for primitive group containers only
        let obj:any = this.objectList[this.sorted_list[last_index + j]];
        let old_small_coord = obj[small_coord];
        let old_big_coord = obj[big_coord];

        this.objectList[this.sorted_list[last_index + j]][big_coord] = (this.big_length_nb_objects - 1)*big_length_step
                                                                       + this.big_length_nb_objects*blank_space;
        this.objectList[this.sorted_list[last_index + j]][small_coord] = j*last_small_length_step + (j+1)*blank_space;
        this.objectList[this.sorted_list[last_index + j]][big_length] = big_length_step;
        this.objectList[this.sorted_list[last_index + j]][small_length] = last_small_length_step;

        if (obj.type_ === 'primitivegroupcontainer') {
          for (let k=0; k<obj.primitive_groups.length; k++) {
            obj.primitive_groups[k][big_coord] += obj[big_coord] - old_big_coord;
            obj.primitive_groups[k][small_coord] += obj[small_coord] - old_small_coord;
          }
        }

      }
      this.resetAllObjects();
      this.redrawAllObjects();
      this.view_on_disposition = true;
    }

    resizeObject(vertex_infos, tx, ty):void {
      var widthSizeLimit = 100;
      var heightSizeLimit = 100;
      for (let i=0; i<vertex_infos.length; i++) {
        let vertex_object_index = vertex_infos[i].index;
        let obj:any = this.objectList[vertex_object_index];
        if (vertex_infos[i].up === true) {
          if (obj.height - ty > heightSizeLimit) {
            this.objectList[vertex_object_index].Y = obj.Y + ty;
            this.objectList[vertex_object_index].height = obj.height - ty;
          } else {
            this.objectList[vertex_object_index].height = heightSizeLimit;
          }
        }
        if (vertex_infos[i].down === true) {
          if (obj.height + ty > heightSizeLimit) {
            this.objectList[vertex_object_index].height = obj.height + ty;
          } else {
            this.objectList[vertex_object_index].height = heightSizeLimit;
          }
        }
        if (vertex_infos[i].left === true) {
          if (obj.width - tx > widthSizeLimit) {
            this.objectList[vertex_object_index].X = obj.X + tx;
            this.objectList[vertex_object_index].width = obj.width - tx;
          } else {
            this.objectList[vertex_object_index].width = widthSizeLimit;
          }
        }
        if (vertex_infos[i].right === true) {
          if (obj.width + tx > widthSizeLimit) {
            this.objectList[vertex_object_index].width = obj.width + tx;
          } else {
            this.objectList[vertex_object_index].width = widthSizeLimit;
          }
        }

        if (this.objectList[vertex_object_index].type_ == 'primitivegroupcontainer') {
          let obj:any = this.objectList[vertex_object_index];
          if (vertex_infos[i].left) {
            for (let j=0; j<obj.primitive_groups.length; j++) {
              obj.primitive_groups[j].X = obj.primitive_groups[j].X + tx;
            }
          }
          if (vertex_infos[i].up) {
            for (let j=0; j<obj.primitive_groups.length; j++) {
              obj.primitive_groups[j].Y = obj.primitive_groups[j].Y + ty;
            }
          }
        }
      }
      this.redrawAllObjects();
    }

    getSelectionONObject():number {
      for (let i=0; i<this.nbObjects; i++) {
        let obj = this.objectList[i];
        if ((obj.type_ === 'scatterplot') && (obj.isSelecting === true)) {
          return i;
        }
      }
      return -1;
    }

    add_to_rubberbands_manual(obj_index, rubber_index:number, min:number, max:number): void {
      var obj = this.objectList[obj_index];
      this.objectList[obj_index].rubber_bands[rubber_index] = [min, max];
      var realCoord_min = obj.axis_to_real_coords(min, obj.axis_list[rubber_index]['type'], obj.axis_list[rubber_index]['list'], obj.inverted_axis_list[rubber_index]);
      var realCoord_max = obj.axis_to_real_coords(max, obj.axis_list[rubber_index]['type'], obj.axis_list[rubber_index]['list'], obj.inverted_axis_list[rubber_index]);
      var real_min = Math.min(realCoord_min, realCoord_max);
      var real_max = Math.max(realCoord_min, realCoord_max);
      this.objectList[obj_index].add_to_rubberbands_dep([obj.axis_list[rubber_index]['name'], [real_min, real_max]]);
      this.objectList[obj_index].is_drawing_rubber_band = true;
      this.mouse_move_pp_communication();
      this.objectList[obj_index].is_drawing_rubber_band = false;
    }

    mouse_move_scatter_communication() {
      let isSelectingObjIndex = this.getSelectionONObject();
      if (isSelectingObjIndex != -1) {
        let isSelectingScatter = this.objectList[isSelectingObjIndex];
        let selection_coords = isSelectingScatter.selection_coords;
        let to_display_attributes:Attribute[] = isSelectingScatter.plotObject.to_display_attributes;
        this.scatter_communication(selection_coords, to_display_attributes, isSelectingObjIndex);
      }
    }

    mouse_up_scatter_communication() {
      if (this.objectList[this.clickedPlotIndex].heatmap_view) {
        let clicked_object = this.objectList[this.clickedPlotIndex];
        for (let i=0; i<this.nbObjects; i++) {
          let obj = this.objectList[i];
          if (i === this.clickedPlotIndex) continue;
          if (obj.type_ === "scatterplot") {
            obj.heatmap_selected_points_indices = clicked_object.heatmap_selected_points_indices;
            obj.refresh_selected_by_heatmap();
          } else if (obj.type_ === "parallelplot") {
            obj.heatmap_selected_points_indices = clicked_object.heatmap_selected_points_indices;
          }
        }
      } else {
        let clicked_point_index = [];
        for (let i=0; i<this.nbObjects; i++) {
          let obj = this.objectList[i];
          if (obj.type_ === "scatterplot") {
            clicked_point_index = List.union(clicked_point_index, obj.clicked_point_index);
          }
        }
        for (let i=0; i<this.nbObjects; i++) {
          let obj = this.objectList[i];
          if (obj.type_ === "parallelplot") {
            obj.clicked_point_index = clicked_point_index;
          }
        }
      }
    }

    scatter_communication(selection_coords:[number, number][], to_display_attributes:Attribute[], isSelectingObjIndex:number):void { //process received data from a scatterplot and send it to the other objects
      for (let i=0; i<selection_coords.length; i++) {
        for (let j=0; j<this.nbObjects; j++) {
          if (this.objectList[j]['type_'] == 'parallelplot') {
            let obj = this.objectList[j];
            for (let k=0; k<obj.axis_list.length; k++) {
              if (to_display_attributes[i]['name'] == obj.axis_list[k]['name']) {
                MultiplotCom.sc_to_pp_communication(selection_coords[i], to_display_attributes[i], k, this.objectList[j]);
              }
            }
          }
        }
      }

      for (let i=0; i<this.nbObjects; i++) {
        let obj: any = this.objectList[i];
        if ((obj.type_ === 'scatterplot') && (i != isSelectingObjIndex)) {
          MultiplotCom.sc_to_sc_communication(selection_coords, to_display_attributes, this.objectList[i]);
        } else if (obj.type_ === "primitivegroupcontainer") {
          obj.selected_point_index = this.objectList[isSelectingObjIndex].selected_point_index;
          obj.select_primitive_groups();
        }
      }
      this.refresh_dep_selected_points_index();
      this.refresh_selected_object_from_index();
    }


    mouse_move_pp_communication() {
      let isDrawingRubberObjIndex = this.get_drawing_rubberbands_obj_index('parallelplot');
      if (isDrawingRubberObjIndex != -1) {
        let isDrawingPP = this.objectList[isDrawingRubberObjIndex];
        let rubberbands_dep = isDrawingPP.rubberbands_dep;
        this.pp_communication(rubberbands_dep, isDrawingPP);
      }
    }

    pp_communication(rubberbands_dep:[string, [number, number]][], actualPP: PlotData):void { //process received data from a parallelplot and send it to the other objects
      let primitive_indices = [];
      let selectedSamples = [];
      let selectedIndices = [];
      let axisNumbers = [];
      console.log(this.data["elements"])
      this.data["elements"].forEach((sample, elementIndex) => {
        var inRubberBand = 0;
        if (rubberbands_dep.length !==0 ) {
          rubberbands_dep.forEach((rubberBand) => {
            var nameBand = rubberBand[0]
            // Because values can be string or number
            if (typeof sample[nameBand] !== 'number') {
              actualPP.axis_list.forEach((axis) => {
                if (axis["name"] == nameBand) {
                  var realValue = sample[nameBand]
                  // Because there is a color conversion from rgb to string name
                  if (realValue.includes('rgb') && !axis["list"].includes('rgb')) {
                    realValue = rgb_to_string(sample[nameBand]);
                  }
                  // Check value
                  if (axis["list"].indexOf(realValue) >= rubberBand[1][0] &&
                  axis["list"].indexOf(realValue) <= rubberBand[1][1]) {
                    inRubberBand += 1;
                  }
                }
              })
            } else {
              // Check value
              if (sample[nameBand] >= rubberBand[1][0] && sample[nameBand] <= rubberBand[1][1]) {
                inRubberBand += 1;
              }
            }
          })
          if (inRubberBand == rubberbands_dep.length) {
            selectedSamples.push(sample)
            selectedIndices.push(elementIndex)
          }
        }
      })

      this.objectList.forEach((subplot) => {
        const WAS_MERGE_ON = subplot.mergeON;
        var subplotData = subplot.data
        var rubberBandsInPlot = [];
        rubberbands_dep.forEach((rubberBand) => {
          if (["scatterplot", "parallelplot", "graph2d"].includes(subplotData.type_)) {
            if (subplotData.attribute_names.includes(rubberBand[0])) {
              rubberBandsInPlot.push(rubberBand);
            }
          } else if (subplotData.type_ === "histogram") {
            if (subplotData.x_variable === rubberBand[0]) {
              rubberBandsInPlot.push(rubberBand);
            }
          } else if (subplotData.type_ === "primitivegroupcontainer") {
            if (subplotData.association.attribute_names.includes(rubberBand[0])) {
              rubberBandsInPlot.push(rubberBand);
            }
          }
        })
        if (subplot.type_ === "scatterplot") {
          if (WAS_MERGE_ON == true) {
            Interactions.click_on_merge_action(subplot)
            subplot.draw();
          }
          let completedAxis = [];
          rubberBandsInPlot.forEach((rubberBand) => {
            var axisIndex = subplotData.attribute_names.indexOf(rubberBand[0]);
            completedAxis.push(axisIndex)
            if (axisIndex == 0) {
              subplot.perm_window_x = rubberBand[1][0];
              subplot.perm_window_w = rubberBand[1][1] - subplot.perm_window_x;
            } else if (axisIndex == 1) {
              subplot.perm_window_y = rubberBand[1][1];
              subplot.perm_window_h = subplot.perm_window_y - rubberBand[1][0];
            }
          })
          if (completedAxis.length < 2 && rubberbands_dep.length !== 0) {
            if (!completedAxis.includes(0)) {
              subplot.perm_window_x = subplot.minX;
              subplot.perm_window_w = subplot.maxX - subplot.perm_window_x;
            }
            if (!completedAxis.includes(1)) {
              subplot.perm_window_y = subplot.maxY;
              subplot.perm_window_h = subplot.minY - subplot.perm_window_y;
            }
          }
          subplot.scatter_points.forEach((scatterPoint, pointIndex) => {
            scatterPoint.selected = false;
            if (selectedIndices.includes(pointIndex)) {
              scatterPoint.selected = true;
              subplot.select_on_click.push(scatterPoint)
            }
          })
          subplot.refresh_selected_point_index();
          if (WAS_MERGE_ON == true) {
            Interactions.click_on_merge_action(subplot)
            subplot.draw()
          }
        } else if (subplot.type_ === "parallelplot") {
          // rubberBandsInPlot.forEach((rubberBand) => {
          //   var axisIndex = subplotData.attribute_names.indexOf(rubberBand[0]);
          //   if (axisIndex == 0) {
          //     subplot.perm_window_x = rubberBand[1][0];
          //     subplot.perm_window_w = rubberBand[1][1] - subplot.perm_window_x;
          //   } else if (axisIndex == 1) {
          //     subplot.perm_window_y = rubberBand[1][1];
          //     subplot.perm_window_h = subplot.perm_window_y - rubberBand[1][0];
          //   }
          // })

        } else if (subplot.type_ === "histogram") {

        } else if (subplot.type_ === "primitivegroupcontainer") {

        }
      })




      // for (let i=0; i<this.nbObjects; i++) {
      //   var obj:PlotData = this.objectList[i];
      //   var axis_numbers:number[] = [];
        // if (obj.type_ === 'scatterplot') {
        //   var to_select:[string, [number, number]][] = [];
        //   for (let j=0; j<rubberbands_dep.length; j++) {
        //     for (let k=0; k<obj.plotObject.to_display_attributes.length; k++) {
        //       if (rubberbands_dep[j][0] == obj.plotObject.to_display_attributes[k]['name']) {
        //         to_select.push(rubberbands_dep[j]);
        //         axis_numbers.push(k);
        //       }
        //     }
        //   }
        //   MultiplotCom.pp_to_sc_communication(to_select, axis_numbers, this.objectList[i]); //, selectedSamples);
        // } 
      //   if (obj.type_ === 'parallelplot') {
      //     MultiplotCom.pp_to_pp_communication(rubberbands_dep, this.objectList[i]);
      //   } else if (obj.type_ === 'histogram') {
      //     if (rubberbands_dep.length === 0) {
      //       let histogram: any = obj;
      //       histogram.reset_x_rubberband();
      //     } else {
      //       for (let rubberband_dep of rubberbands_dep) {
      //         MultiplotCom.pp_to_histogram_communication(rubberband_dep, obj);
      //       }
      //     }
      //   } else if (obj.type_ === "primitivegroupcontainer") {
      //     // console.log(obj)
      //     primitive_indices.push(i);
      //   }
      // }
      // this.refresh_dep_selected_points_index();
      // this.refresh_selected_object_from_index();

      // for (let index of primitive_indices) {
      //   let obj: any = this.objectList[index];
      //   obj.selected_point_index = this.dep_selected_points_index;
      //   obj.select_primitive_groups();
      //   // console.log(obj.selected_point_index)
      // }
    }


    mouse_move_histogram_communication() {
      let index = this.get_drawing_rubberbands_obj_index('histogram');
      if (index === -1) return;
      this.histogram_communication(index);
    }


    histogram_communication(index) {
      let histogram = this.objectList[index];
      let primitive_indices = [];
      for (let i=0; i<this.nbObjects; i++) {
        let obj = this.objectList[i];
        if (obj.type_ === 'scatterplot') {
          MultiplotCom.histogram_to_scatter_communication(histogram, obj);
        } else if (obj.type_ === 'parallelplot') {
          MultiplotCom.histogram_to_pp_communication(histogram, obj);
        } else if (obj.type_ === 'histogram') {
          MultiplotCom.histogram_to_histogram_communication(histogram, obj);
        } else if (obj.type_ === "primitivegroupcontainer") {
          primitive_indices.push(i);
        }
      }
      this.refresh_dep_selected_points_index();
      this.refresh_selected_object_from_index();

      for (let index of primitive_indices) {
        let obj: any = this.objectList[index];
        obj.selected_point_index = this.dep_selected_points_index;
        obj.select_primitive_groups();
      }
    }


    dependency_color_propagation(selected_axis_name:string, vertical:boolean, inverted:boolean, hexs: string[]):void {
      for (let i=0; i<this.nbObjects; i++) {
        let obj = this.objectList[i];
        if (obj.type_ == 'scatterplot') {
          let to_display_attributes = obj.plotObject.to_display_attributes;
          let attribute_index = -1;
          for (let j=0; j<to_display_attributes.length; j++) {
            if (to_display_attributes[j].name == selected_axis_name) {
              attribute_index = j;
            }
          }
          obj.dep_color_propagation(vertical, inverted, hexs, selected_axis_name);
          obj.sc_interpolation_ON = true;
        }
      }
    }

    refresh_selected_object_from_index(): void {
      for (let i=0; i<this.nbObjects; i++) {
        if (i === this.clickedPlotIndex) continue;
        var obj = this.objectList[i];
        if (obj.type_ == 'scatterplot') {
          let temp_select_on_click = List.getListEltFromIndex(this.dep_selected_points_index, obj.plotObject.point_list);
          this.objectList[i].select_on_click = [];
          for (let j=0; j<obj.scatter_points.length; j++) {
            let scatter_points_j = obj.scatter_points[j];
            let is_inside = false;
            for (let k=0; k<scatter_points_j.points_inside.length; k++) {
              if (List.is_include(scatter_points_j.points_inside[k], temp_select_on_click)) {
                is_inside = true;
                if (!scatter_points_j.selected) {
                  this.objectList[i].select_on_click.push(obj.scatter_points[j]);
                  this.objectList[i].scatter_points[j].selected = true;
                  break;
                }
              }
            }
            if (!is_inside && this.objectList[i].scatter_points[j].selected) {
              this.objectList[i].scatter_points[j].selected = false;
            }
          }
        } else if (obj.type_ == 'parallelplot') {
          this.objectList[i].pp_selected = [];
          for (let j=0; j<this.dep_selected_points_index.length; j++) {
            var to_display = [];
            for (let k=0; k<obj.axis_list.length; k++) {
              let attribute_name = obj.axis_list[k].name;
              let type_ = obj.axis_list[k].type_;
              if (type_ == 'color') {
                var elt = rgb_to_string(obj.elements[this.dep_selected_points_index[j]][attribute_name]);
              } else {
                elt = obj.elements[this.dep_selected_points_index[j]][attribute_name];
              }
              to_display.push(elt);
            }
            this.objectList[i].pp_selected.push(to_display);
          }
        }
      }
    }


    manage_mouse_interactions(mouse2X:number, mouse2Y:number):void {
      this.move_plot_index = this.getLastObjectIndex(mouse2X, mouse2Y);
      var l = []
      if (this.move_plot_index != this.last_index) {
        for (let i=0; i<this.nbObjects; i++) {
          if (i == this.move_plot_index) {
            this.objectList[i].interaction_ON = true;
          } else {
            this.objectList[i].interaction_ON = false;
            if (this.objectList[i].type_ == 'primitivegroupcontainer') {
              let obj:any = this.objectList[i];
              obj.setAllInteractionsToOff();
            }
          }
        }
        this.last_index = this.move_plot_index;
      }
    }

    get_drawing_rubberbands_obj_index(type_):number {
      for (let i=0; i<this.nbObjects; i++) {
        let obj = this.objectList[i];
        if (obj.is_drawing_rubber_band === true && obj.type_ === type_) {
          return i;
        }
      }
      return -1;
    }

    get_selected_axis_info(): [string, boolean, boolean, string[], boolean] {
      var isSelectingppAxis = false;
      var selected_axis_name = '';
      var vertical = true;
      var inverted = false;
      var hexs = [];
      for (let i=0; i<this.nbObjects; i++) {
        let obj = this.objectList[i];
        if ((obj.type_ == 'parallelplot') && (obj.isSelectingppAxis)) {
          isSelectingppAxis = true;
          selected_axis_name = obj.selected_axis_name;
          let att_index = 0;
          for (let j=0; j<obj.axis_list.length; j++) {
            if (obj.axis_list[j].name == selected_axis_name) {
              att_index = j;
              break;
            }
          }
          vertical = obj.vertical;
          inverted = obj.inverted_axis_list[att_index];
          hexs = obj.hexs;
        }
      }
      return [selected_axis_name, vertical, inverted, hexs, isSelectingppAxis];
    }

    zoom_elements(mouse3X:number, mouse3Y:number, event:number) {
      if (event > 0) {var zoom_coeff = 1.1} else {var zoom_coeff = 1/1.1}
      for (let i=0; i<this.nbObjects; i++) {
        let old_X = this.objectList[i].X; let old_Y = this.objectList[i].Y;
        this.objectList[i].X = mouse3X + zoom_coeff*(this.objectList[i].X - mouse3X);
        this.objectList[i].Y = mouse3Y + zoom_coeff*(this.objectList[i].Y - mouse3Y);
        this.objectList[i].width = this.objectList[i].width*zoom_coeff;
        this.objectList[i].height = this.objectList[i].height*zoom_coeff;
        if (this.objectList[i].type_ == 'primitivegroupcontainer') {
          let obj:any = this.objectList[i];
          let tx = obj.X - old_X;
          let ty = obj.Y - old_Y;
          for (let i=0; i<obj.primitive_groups.length; i++) {
            obj.primitive_groups[i].X = obj.primitive_groups[i].X + tx;
            obj.primitive_groups[i].Y = obj.primitive_groups[i].Y + ty;
          }
        }
      }
      this.resetAllObjects();
    }


    get_settings_on_object() {
      for (let i=0; i<this.nbObjects; i++) {
        if (this.objectList[i].settings_on) {
          return i;
        }
      }
      return -1;
    }

    settings_padding(index, coef=1) {
      if (!this.view_bool) return;
      var obj = this.objectList[index];
      this.clear_object(index);
      var center_x = obj.X + obj.width/2;
      var center_y = obj.Y + obj.height/2;
      obj.width = coef*this.settings_on_initial_widths[index];
      obj.height = coef*this.settings_on_initial_heights[index];
      obj.X = center_x - obj.width/2;
      obj.Y = center_y - obj.height/2;
      if (obj.type_ === 'parallelplot') obj.refresh_axis_coords();
    }


    dbl_click_manage_settings_on(object_index:number): void {
      this.obj_settings_on = this.get_settings_on_object();
      var obj = this.objectList[this.clickedPlotIndex];
      if (this.obj_settings_on === -1) {
        obj.settings_on = true;
        if (this.view_on_disposition) this.settings_padding(this.clickedPlotIndex);
      } else if (this.obj_settings_on === object_index) {
        obj.settings_on = false;
        this.settings_padding(this.clickedPlotIndex);
      }
      obj.draw();
      this.draw_buttons();
    }

    single_click_manage_settings_on(object_index:number): void {
      var obj_settings_on = this.get_settings_on_object();
      if ((obj_settings_on !== -1) && (obj_settings_on !== object_index)) {
        this.objectList[obj_settings_on].settings_on = false;
        this.objectList[object_index].settings_on = true;
        let obj = this.objectList[obj_settings_on];
        this.settings_padding(obj_settings_on);
        obj.draw();
        let obj1 = this.objectList[object_index];
        if (this.view_on_disposition) this.settings_padding(object_index);
        obj1.draw();
      }
      this.draw_buttons();
    }


    manage_selected_point_index_changes(old_selected_index:number[]) {
      if (!equals(old_selected_index, this.selected_point_index)) {
        var evt = new CustomEvent('selectionchange', { detail: { 'selected_point_indices': this.dep_selected_points_index } });
        this.canvas.dispatchEvent(evt);
      }
    }

    color_associated_scatter_point(point_index) { // used by mouse_over_primitive_group() to select points inside scatterplots
      for (let i=0; i<this.nbObjects; i++) {
        if (this.objectList[i].type_ === 'scatterplot') {
          let obj = this.objectList[i];
          let selected_point = obj.plotObject.point_list[point_index];
          let sc_point_list = obj.scatter_points;
          if (obj.mergeON) {
            for (let j=0; j<sc_point_list.length; j++) {
              let point = sc_point_list[j];
              let bool = false;
              for (let k=0; k<point.points_inside.length; k++) {
                if (point.points_inside[k] === selected_point) {
                  obj.primitive_mouse_over_point = point;
                  bool = true;
                  break;
                }
              }
              if (bool) break;
            }
          } else {
            obj.primitive_mouse_over_point = obj.plotObject.point_list[point_index];
          }
          obj.draw();
        }
      }
    }


    mouse_over_primitive_group() {
      var bool = false;
      if (this.move_plot_index !== -1) {
        if (this.objectList[this.move_plot_index].type_ === 'primitivegroupcontainer') {
          let obj:any = this.objectList[this.move_plot_index];
          if (obj.selected_primitive !== -1) {
            bool = true;
            let primitive_to_point_index = Object.fromEntries(Array.from(Object.entries(obj.primitive_dict), list => list.reverse()));
            let point_index = Number(primitive_to_point_index[obj.selected_primitive]);
            this.color_associated_scatter_point(point_index);
          }
        }
      }
      if (!bool) {
        for (let i=0; i<this.nbObjects; i++) {
          if (this.objectList[i].type_ === 'scatterplot') {
            let obj = this.objectList[i];
            obj.primitive_mouse_over_point = undefined;
            obj.draw();
          }
        }
      }
    }

    mouse_over_scatter_plot() {
      if (this.move_plot_index !== -1 && this.objectList[this.move_plot_index].type_ === "scatterplot") {
        for (let i=0; i<this.nbObjects; i++) {
          let obj = this.objectList[i];
          if (obj.type_ === "parallelplot") {
            obj.select_on_mouse_indices = this.objectList[this.move_plot_index].select_on_mouse_indices;
            obj.draw();
          }
        }
      }

      if (!this.has_primitive_group_container) return;
      var bool = false;
      if (this.move_plot_index !== -1) {
        if (this.objectList[this.move_plot_index].type_ === 'scatterplot') {
          let obj = this.objectList[this.move_plot_index];
          if (obj.select_on_mouse) {
            bool = true;
            var element_index_list = [];
            let points_inside = obj.select_on_mouse.points_inside;
            for (let i=0; i<points_inside.length; i++) {
              let index = List.get_index_of_element(points_inside[i], obj.plotObject.point_list);
              element_index_list.push(index);
            }
            for (let i=0; i<this.nbObjects; i++) {
              if (this.objectList[i].type_ !== 'primitivegroupcontainer') continue;
              let container:any = this.objectList[i];
              let primitive_to_point_index = Object.fromEntries(Array.from(Object.entries(container.primitive_dict), list => list.reverse()));
              for (let j=0; j<container.primitive_groups.length; j++) {
                  container.primitive_groups[j].dep_mouse_over = element_index_list.includes(Number(primitive_to_point_index[j]));
              }
              container.draw();
            }
          } else {
            for (let i=0; i<this.nbObjects; i++) {
              if (this.objectList[i].type_ !== 'primitivegroupcontainer') continue;
              let container:any = this.objectList[i];
              for (let j=0; j<container.primitive_groups.length; j++) {
                container.primitive_groups[j].dep_mouse_over = false;
                container.draw();
              }
            }
          }
        }
      }
      if (!bool) {
        for (let i=0; i<this.nbObjects; i++) {
          if (this.objectList[i].type_ !== 'primitivegroupcontainer') continue;
          let container:any = this.objectList[i];
          for (let j=0; j<container.primitive_groups.length; j++) {
            container.primitive_groups[j].dep_mouse_over = false;
            container.draw();
          }
        }
      }

    }


    has_primitive_group_container() {
      for (let i=0; i<this.objectList.length; i++) {
        let obj:any = this.objectList[i];
        if (obj.type_ === 'primitivegroupcontainer') {
          if (obj.primitive_groups.length !== 0) {
            return true;
          }
        }
      }
      return false;
    }


    save_canvas() {
      if (current_save <= multiplot_saves.length - 2) {
        multiplot_saves = List.remove_at_indices(current_save + 1, multiplot_saves.length - 1, multiplot_saves);
      }
      multiplot_saves.push(MyObject.deepClone(this));
      if (multiplot_saves.length === 11) {
        multiplot_saves = List.remove_at_index(0, multiplot_saves);
      }
      current_save = multiplot_saves.length - 1;
    }


    restore_previous_canvas() {
      if (current_save === 0) return;
      current_save--;
      Object.assign(this, multiplot_saves[current_save]);
      this.define_canvas(this.canvas_id);
      for (let i=0; i<this.nbObjects; i++) {
        this.initializeObjectContext(this.objectList[i]);
      }
      this.redrawAllObjects();
    }

    restore_next_canvas() {
      if (current_save === multiplot_saves.length - 1) return;
      current_save++;
      Object.assign(this, multiplot_saves[current_save]);
      this.define_canvas(this.canvas_id);
      for (let i=0; i<this.nbObjects; i++) {
        this.initializeObjectContext(this.objectList[i]);
      }
      this.redrawAllObjects();
    }


    is_on_button(mouseX, mouseY) {
      var click_on_manip_button = Shape.isInRect(mouseX, mouseY, this.transbutton_x, this.button_y, this.button_w, this.button_h);
      var click_on_selectDep_button = Shape.isInRect(mouseX, mouseY, this.selectDep_x, this.button_y, this.button_w, this.button_h);
      var click_on_view = Shape.isInRect(mouseX, mouseY, this.view_button_x, this.button_y, this.button_w, this.button_h);
      var click_on_export = Shape.isInRect(mouseX, mouseY, this.export_button_x, this.button_y, this.button_w, this.button_h);
      return click_on_manip_button || click_on_selectDep_button || click_on_view || click_on_export;
    }


    mouse_interaction(): void {
      var mouse1X:number = 0; var mouse1Y:number = 0; var mouse2X:number = 0; var mouse2Y:number = 0; var mouse3X:number = 0; var mouse3Y:number = 0;
      var isDrawing = false;
      var mouse_moving:boolean = false;
      var vertex_infos:Object;
      var clickOnVertex:boolean = false;
      var old_selected_index;
      var double_click = false;


      // For canvas to read keyboard inputs.
      // this.canvas.setAttribute('tabindex', '0');
      // this.canvas.focus();

      for (let i=0; i<this.nbObjects; i++) {
        this.objectList[i].mouse_interaction(this.objectList[i].isParallelPlot);
      }
      this.setAllInteractionsToOff();

      this.canvas.addEventListener('mousedown', e => {
        isDrawing = true;
        mouse1X = e.offsetX;
        mouse1Y = e.offsetY;
        old_selected_index = this.selected_point_index;
        if (e.ctrlKey) {
          this.reset_all_selected_points();
        } else {
          this.clickedPlotIndex = this.getLastObjectIndex(mouse1X, mouse1Y);
          this.clicked_index_list = this.getObjectIndex(mouse1X, mouse1Y);
          if (this.manipulation_bool) {
            this.setAllInteractionsToOff();
            if (this.clickedPlotIndex != -1) {
              this.initializeObjectXY();
              [clickOnVertex, vertex_infos] = this.initialize_clickOnVertex(mouse1X, mouse1Y);
            } else {
              clickOnVertex = false;
            }
            this.initializeObjectXY();
            if (clickOnVertex) {
              this.initializeMouseXY(mouse1X, mouse1Y);
              this.initialize_objects_hw();
            }
          }
        }
      });

      this.canvas.addEventListener('mousemove', e => {
        var old_mouse2X = mouse2X; var old_mouse2Y = mouse2Y;
        mouse2X = e.offsetX; mouse2Y = e.offsetY;
        if (this.manipulation_bool) {
          if (isDrawing) {
            this.view_on_disposition = false;
            mouse_moving = true;
            if ((this.clickedPlotIndex != -1) && !(clickOnVertex)) {
              this.setAllInteractionsToOff();
              this.canvas.style.cursor = 'move';
              this.translateSelectedObject(this.clickedPlotIndex, mouse2X - old_mouse2X, mouse2Y - old_mouse2Y);
              this.redrawAllObjects();
            } else if (this.clickedPlotIndex == -1) {
              this.translateAllObjects(mouse2X - old_mouse2X, mouse2Y - old_mouse2Y);
            } else if (clickOnVertex) {
              this.resizeObject(vertex_infos, mouse2X - old_mouse2X, mouse2Y - old_mouse2Y);
            }
            if (this.view_bool === true) {
              let refreshed_sorted_list = this.getSortedList();
              if (!equals(this.sorted_list, refreshed_sorted_list)) {
                this.clean_view();
              }
            }
          } else {
            this.move_plot_index = this.getLastObjectIndex(mouse2X, mouse2Y);
            this.setCursorStyle(mouse2X, mouse2Y);
            this.redrawAllObjects();
          }
        } else {
          this.manage_mouse_interactions(mouse2X, mouse2Y);
          if (isDrawing) {
            mouse_moving = true;
            if (this.selectDependency_bool) {
              this.mouse_move_scatter_communication();
              this.mouse_move_pp_communication();
              this.mouse_move_histogram_communication();
              this.redrawAllObjects();
            }
            this.refresh_selected_point_index();
            this.redraw_object();
          } else {
            if (this.selectDependency_bool) {
              this.mouse_over_primitive_group();
              this.mouse_over_scatter_plot();
            }
            this.draw_buttons();
          }
        }
      });

      this.canvas.addEventListener('mouseup', e => {
        mouse3X = e.offsetX;
        mouse3Y = e.offsetY;
        var click_on_manip_button = Shape.isInRect(mouse3X, mouse3Y, this.transbutton_x, this.button_y, this.button_w, this.button_h);
        var click_on_selectDep_button = Shape.isInRect(mouse3X, mouse3Y, this.selectDep_x, this.button_y, this.button_w, this.button_h);
        var click_on_view = Shape.isInRect(mouse3X, mouse3Y, this.view_button_x, this.button_y, this.button_w, this.button_h);
        var click_on_export = Shape.isInRect(mouse3X, mouse3Y, this.export_button_x, this.button_y, this.button_w, this.button_h);
        this.click_on_button = click_on_manip_button || click_on_selectDep_button || click_on_view || click_on_export;
        if (this.click_on_button) {
          this.click_on_button_action(click_on_manip_button, click_on_selectDep_button, click_on_view, click_on_export);
        }

        if (mouse_moving === false) {
          if (this.selectDependency_bool) {
            if (this.clickedPlotIndex !== -1) {
              let type_ = this.objectList[this.clickedPlotIndex].type_
              if (type_ === 'parallelplot') {
                var selected_axis_name: string, vertical: boolean, inverted: boolean;
                var hexs: string[], isSelectingppAxis: boolean;
                [selected_axis_name, vertical, inverted, hexs, isSelectingppAxis] = this.get_selected_axis_info();
                if (isSelectingppAxis) {
                  for (let i=0; i<this.nbObjects; i++) {
                    if (this.objectList[i].type_ == 'parallelplot') {
                      this.objectList[i].selected_axis_name = selected_axis_name;
                    }
                  }
                  if (selected_axis_name != '') {
                    this.dependency_color_propagation(selected_axis_name, vertical, inverted, hexs);
                  } else {
                    this.setAllInterpolationToOFF();
                  }
                  this.reset_selected_points_except([this.clickedPlotIndex]);
                  this.pp_communication(this.objectList[this.clickedPlotIndex].rubberbands_dep, this.objectList[this.clickedPlotIndex]);
                }
              } else if (type_ === 'histogram') {
                let obj: any = this.objectList[this.clickedPlotIndex];
                if (obj.x_rubberband.length === 0) {
                  this.reset_all_selected_points();
                }
              } else if (type_ === "scatterplot") {
                this.mouse_up_scatter_communication();
              }
            }
          }
          this.refresh_selected_point_index();
        } else {
          if (this.view_bool) {
            this.clean_view();
          }
        }
        this.manage_selected_point_index_changes(old_selected_index);
        this.redrawAllObjects();
        isDrawing = false;
        mouse_moving = false;
        // this.save_canvas();
      });


      this.canvas.addEventListener('wheel', e => {
        e.preventDefault();
        var mouse3X = e.offsetX;
        var mouse3Y = e.offsetY;
        var event = -e.deltaY/Math.abs(e.deltaY);
        if (this.manipulation_bool && !this.view_bool) {
          this.view_on_disposition = false;
          this.zoom_elements(mouse3X, mouse3Y, event);
          this.redrawAllObjects();
        } else {
          this.redraw_object();
        }
      });

      this.canvas.addEventListener('mouseleave', e => {
        isDrawing = false;
        mouse_moving = false;
      });


      this.canvas.addEventListener('dblclick', e => {
        if (this.clickedPlotIndex !== -1) {
          this.dbl_click_manage_settings_on(this.clickedPlotIndex);
          // this.redrawAllObjects();
        }
        double_click = true;
      });

      this.canvas.addEventListener('click', e => {
        setTimeout(() => {
          if (this.clickedPlotIndex !== -1 && !double_click) {
            this.single_click_manage_settings_on(this.clickedPlotIndex);
            // this.redrawAllObjects();
          }
        }, 100);
        double_click = false;
      });

      this.canvas.addEventListener('selectionchange', (e:any) => {
      });


    // Not working well actually, but I let it here in case somebody wants to give it a try
      // canvas.addEventListener('keydown', e => {
      //   if (e.ctrlKey) {
      //     e.preventDefault();
      //     if (e.key === 'z') {
      //       this.restore_previous_canvas();
      //     } else if (e.key === 'y') {
      //       this.restore_next_canvas();
      //     }
      //   }
      // });
    }
}


export class MultiplotCom {
    public static sc_to_pp_communication(coordinates:[number, number], attribute, index, plot_data:PlotData):void {
      var attribute_type = attribute['type_'];
      var axis_coord0 = plot_data.real_to_axis_coord(coordinates[0], attribute_type, plot_data.axis_list[index]['list'], plot_data.inverted_axis_list[index]);
      var axis_coord1 = plot_data.real_to_axis_coord(coordinates[1], attribute_type, plot_data.axis_list[index]['list'], plot_data.inverted_axis_list[index]);
      var axis_min = Math.min(axis_coord0, axis_coord1);
      var axis_max = Math.max(axis_coord0, axis_coord1);
      var min = Math.max(axis_min, 0);
      var max = Math.min(axis_max, 1);
      plot_data.rubber_bands[index] = [min, max];
      plot_data.add_to_rubberbands_dep([attribute['name'], [coordinates[0], coordinates[1]]]);
      plot_data.refresh_pp_selected();
    }

    public static sc_to_sc_communication(selection_coords:[number, number][], to_display_attributes:Attribute[], plot_data:PlotData) {
      let obj_to_display_attributes = plot_data.plotObject.to_display_attributes;
      if (equals(obj_to_display_attributes, to_display_attributes) || equals(obj_to_display_attributes, List.reverse(to_display_attributes))) {
        if (equals(obj_to_display_attributes, List.reverse(to_display_attributes))) {
          selection_coords = selection_coords.reverse();
        }
        var abs_min = selection_coords[0][0];
        var abs_max = selection_coords[0][1];
        var ord_min = selection_coords[1][0];
        var ord_max = selection_coords[1][1];
        plot_data.perm_window_x = abs_min;
        plot_data.perm_window_w = abs_max - abs_min;
        plot_data.perm_window_y = ord_min;
        plot_data.perm_window_h = ord_min - ord_max;
      } else {
        for (let i=0; i<to_display_attributes.length; i++) {
          for (let j=0; j<obj_to_display_attributes.length; j++) {
            if (to_display_attributes[i]['name'] == obj_to_display_attributes[j]['name']) {
              if (j == 0) {
                var abs_min = selection_coords[i][0];
                var abs_max = selection_coords[i][1];
                ord_min = -plot_data.maxY;
                ord_max = -plot_data.minY;
              } else {
                var ord_min = selection_coords[i][0];
                var ord_max = selection_coords[i][1];
                abs_min = plot_data.minX;
                abs_max = plot_data.maxX;
              }
              plot_data.perm_window_x = abs_min;
              plot_data.perm_window_w = abs_max - abs_min;
              plot_data.perm_window_y = ord_min;
              plot_data.perm_window_h = ord_min - ord_max;
            }
          }
        }
      }
      Interactions.selection_window_action(plot_data);
    }

    public static pp_to_pp_communication(rubberbands_dep:[string, [number, number]][], plot_data:PlotData) {
      for (let i=0; i<rubberbands_dep.length; i++) {
        let received_rubber = rubberbands_dep[i];
        let received_name = received_rubber[0];
        for (let j=0; j<plot_data.axis_list.length; j++) {
          if (received_name == plot_data.axis_list[j]['name']) {
            let received_real_min = received_rubber[1][0];
            let received_real_max = received_rubber[1][1];
            let temp_received_axis_min = plot_data.real_to_axis_coord(received_real_min, plot_data.axis_list[j]['type_'], plot_data.axis_list[j]['list'], plot_data.inverted_axis_list[j]);
            let temp_received_axis_max = plot_data.real_to_axis_coord(received_real_max, plot_data.axis_list[j]['type_'], plot_data.axis_list[j]['list'], plot_data.inverted_axis_list[j]);
            let received_axis_min = Math.min(temp_received_axis_min, temp_received_axis_max);
            let received_axis_max = Math.max(temp_received_axis_min, temp_received_axis_max);
            plot_data.rubber_bands[j] = [received_axis_min, received_axis_max];
            plot_data.add_to_rubberbands_dep(rubberbands_dep[i]);
            break;
          }
        }
      }
    }


    public static histogram_to_histogram_communication(histogram1, histogram2) {
      if (histogram1.x_variable.name !== histogram2.x_variable.name) return;
      histogram2.x_rubberband = histogram1.x_rubberband;
      histogram2.get_selected_keys();
    }


    public static histogram_to_pp_communication(histogram, parallel_plot) {
      let index = -1;
      for (let i=0; i<parallel_plot.axis_list.length; i++) {
        if (histogram.x_variable.name === parallel_plot.axis_list[i].name) {
          index = i;
          break;
        }
      }
      if (index === -1) return;
      let x_variable = histogram.x_variable;
      let x_rubberband = histogram.x_rubberband;
      let axis_coord1 = parallel_plot.real_to_axis_coord(x_rubberband[0], x_variable.type_, x_variable.list,
                                                          parallel_plot.inverted_axis_list[index]);
      axis_coord1 = Math.max(Math.min(axis_coord1, 1), 0);
      let axis_coord2 = parallel_plot.real_to_axis_coord(x_rubberband[1], x_variable.type_, x_variable.list,
                                                          parallel_plot.inverted_axis_list[index]);
      axis_coord2 = Math.max(Math.min(axis_coord2, 1), 0);
      parallel_plot.rubber_bands[index] = [Math.min(axis_coord1, axis_coord2), Math.max(axis_coord1, axis_coord2)];
      parallel_plot.add_to_rubberbands_dep([x_variable.name, [x_rubberband[0], x_rubberband[1]]]);
    }


    public static histogram_to_scatter_communication(histogram, scatter) {
      let scatter_x = scatter.plotObject.attribute_names[0];
      let scatter_y = scatter.plotObject.attribute_names[1];
      if (histogram.x_variable.name === scatter_x) {
        scatter.perm_window_x = histogram.x_rubberband[0];
        scatter.perm_window_y = -scatter.minY;
        scatter.perm_window_w = histogram.x_rubberband[1] - histogram.x_rubberband[0];
        scatter.perm_window_h = scatter.maxY - scatter.minY;
      } else if (histogram.x_variable.name === scatter_y) {
        scatter.perm_window_x = scatter.minX;
        scatter.perm_window_y = histogram.x_rubberband[1];
        scatter.perm_window_w = scatter.maxX - scatter.minX;
        scatter.perm_window_h = histogram.x_rubberband[1] - histogram.x_rubberband[0];
      }
      Interactions.selection_window_action(scatter)
    }


    public static pp_to_histogram_communication(rubberband_dep: [string, [number, number]], histogram) {
      if (histogram.x_variable.name === rubberband_dep[0]) {
        histogram.x_rubberband = rubberband_dep[1];
        histogram.get_selected_keys();
      }
    }
}


export function save_multiplot(multiplot: MultiplePlots) {
  let temp_objs = [], sizes = [], coords = [];
  for (let obj of multiplot.objectList) {
    coords.push([obj.X, obj.Y]);
    sizes.push([obj.width, obj.height]);

    let obj_to_dict = [];
    obj_to_dict.push(["name", obj.name],
                     ["type_", obj.type_]);
    if (obj.type_ === "scatterplot") {
      obj_to_dict.push(["scaleX", obj.scaleX],
                      ["scaleY", obj.scaleY],
                      ["originX", obj.originX],
                      ["originY", obj.originY],
                      ["selected_point_index", obj.selected_point_index],
                      ["selection_window", [obj.perm_window_x, obj.perm_window_y, obj.perm_window_w, obj.perm_window_h]],
                      ["interpolation_colors", obj.interpolation_colors]);
    } else if (obj.type_ === "parallelplot") {
      let names = [];
      for (let axis of obj.axis_list) names.push(axis.name);
      obj_to_dict.push(["attribute_names", names],
                     ["rubber_bands", obj.rubber_bands],
                     ["inversions", obj.inverted_axis_list],
                     ["interpolation_colors", obj.interpolation_colors],
                     ["vertical", obj.vertical]);
    } else if (obj.type_ === "histogram") {
      obj_to_dict.push(["graduation_nb", obj["graduation_nb"]],
                        ["x_variable", obj["x_variable"]],
                        ["x_rubberband", obj["x_rubberband"]],
                        ["y_rubberband", obj["y_rubberband"]],
                        ["scale", obj.scale],
                        ["originX", obj.originX]);
    }
    temp_objs.push(Object.fromEntries(obj_to_dict));
  }

  let dict_ = {"data": multiplot.data,
               "coords": coords,
               "sizes": sizes,
               "dep_selected_point_index": multiplot.dep_selected_points_index,
               "plots": temp_objs,
               "canvas_id": multiplot.canvas_id};
  return dict_;
}


export function load_multiplot(dict_, elements, width, height, buttons_ON, canvas_id?) {
  MyObject.add_properties(dict_, ["elements", elements]);
  var multiplot = new MultiplePlots(dict_["data"], width, height, buttons_ON, canvas_id || dict_["canvas_id"]);
  let temp_objs = dict_["plots"];
  let nbObjects = temp_objs.length;
  let coords = dict_["coords"];
  let sizes = dict_["sizes"];
  for (let i=0; i<nbObjects; i++) {
    let obj = multiplot.objectList[i];
    obj.X = coords[i][0];
    obj.Y = coords[i][1];
    obj.width = sizes[i][0];
    obj.height = sizes[i][1];
    if (obj.type_ === "scatterplot") {
      obj.scaleX = temp_objs[i]["scaleX"];
      obj.scaleY = temp_objs[i]["scaleY"];
      obj.originX = temp_objs[i]["originX"];
      obj.originY = temp_objs[i]["originY"];
      obj.selected_point_index = temp_objs[i]["selected_point_index"];
      obj.perm_window_x = temp_objs[i]["selection_window"][0];
      obj.perm_window_y = temp_objs[i]["selection_window"][1];
      obj.perm_window_w = temp_objs[i]["selection_window"][2];
      obj.perm_window_h = temp_objs[i]["selection_window"][3];
      obj.interpolation_colors = temp_objs[i]["interpolation_colors"];

      obj.refresh_selected_points_from_indices();

    } else if (obj.type_ === "parallelplot") {
      obj.rubber_bands = temp_objs[i]["rubber_bands"];
      obj.inverted_axis_list = temp_objs[i]["inversions"];
      obj.interpolation_colors = temp_objs[i]["interpolation_colors"];
      obj.vertical = temp_objs[i]["vertical"];

    } else if (obj.type_ === "histogram") {
      obj["graduation_nb"] = temp_objs[i]["graduation_nb"];
      obj["x_variable"] = temp_objs[i]["x_variable"];
      obj["x_rubberband"] = temp_objs[i]["x_rubberband"];
      obj["y_rubberband"] = temp_objs[i]["y_rubberband"];
      obj.scale = temp_objs[i]["scale"];
      obj.originX = temp_objs[i]["originX"];
    }
  }
  multiplot.dep_selected_points_index = dict_["dep_selected_points_index"];
  multiplot.redrawAllObjects();
  return multiplot;
}


const empty_container = {'name': '',
'package_version': '0.6.2',
'primitive_groups': [],
'type_': 'primitivegroupcontainer'};
