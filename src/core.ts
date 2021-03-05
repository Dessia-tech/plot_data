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
  manipulation_bool:boolean=false;
  transbutton_x:number=0; transbutton_y:number=0; transbutton_w:number=0; transbutton_h:number=0;
  selectDependency_bool:boolean=false;
  selectDep_x:number=0; selectDep_y:number=0; selectDep_w:number=0; selectDep_h:number=0;
  view_bool:boolean=false;
  view_button_x:number=0; view_button_y:number=0; view_button_w:number=0; view_button_h:number=0;
  initial_objectsX:number[]=[];
  initial_objectsY:number[]=[];
  initial_object_width:number[]=[];
  initial_object_height:number[]=[];
  initial_mouseX:number=0;
  initial_mouseY:number=0;
  sorted_list:number[]=[];
  display_order:number[]=[];
  displayable_attributes:Attribute[]=[];
  selected_point_index:number[]=[];
  dep_selected_points_index:number[]=[]; //Intersection of objectList[i]'s selected points when dependency is enabled
  point_families:PointFamily[]=[];
  to_display_plots:number[]=[];
  primitive_dict={};
  shown_datas:any[]=[];
  hidden_datas:any[]=[];
  canvas:any;


  constructor(public data: any[], public width:number, public height:number, coeff_pixel: number, public buttons_ON: boolean, public canvas_id: string) {
    var requirement = '0.4.10';
    check_package_version(data['package_version'], requirement);
    this.dataObjects = data['plots'];
    this.initial_coords = data['coords'] || Array(this.dataObjects.length).fill([0,0]);
    var elements = data['elements'];
    if (elements) {this.initialize_displayable_attributes();}
    this.nbObjects = this.dataObjects.length;
    this.initialize_sizes();
    this.define_canvas(canvas_id);
    for (let i=0; i<this.nbObjects; i++) {
      if ((this.dataObjects[i]['type_'] == 'scatterplot') || (this.dataObjects[i]['type_'] == 'graph2d')) {
        this.dataObjects[i]['elements'] = elements;
        var newObject:any = new PlotScatter(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], coeff_pixel, buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id);
      } else if (this.dataObjects[i]['type_'] == 'parallelplot') {
        this.dataObjects[i]['elements'] = elements;
        newObject = new ParallelPlot(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], coeff_pixel, buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id);
      } else if (this.dataObjects[i]['type_'] == 'primitivegroup') {
        newObject = new PlotContour(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], coeff_pixel, buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id);
      } else if (this.dataObjects[i]['type_'] == 'primitivegroupcontainer') {
        newObject = new PrimitiveGroupContainer(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], coeff_pixel, buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id);
        if (this.dataObjects[i]['association']) {
          this.initializeObjectContext(newObject);
          let association = this.dataObjects[i]['association'];
          newObject = this.initialize_containers_dicts(newObject, association['associated_elements']);
          newObject = this.call_layout(newObject, association['to_disp_attribute_names']);
        }
      } else {
        throw new Error('MultiplePlots constructor : invalid object type');
      }
      this.initializeObjectContext(newObject);
      this.objectList.push(newObject);
    }

    for (let i=0; i<this.nbObjects; i++) {
      this.objectList[i].draw_initial();
      this.display_order.push(i);
      this.to_display_plots.push(i);
    }
    if (elements) {this.initialize_point_families();}
    this.mouse_interaction();

    if (buttons_ON) {
      this.initializeButtons();
      this.draw_buttons();
    }
    if (data['initial_view_on']) {
      this.clean_view();
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

  initialize_displayable_attributes() {
    this.displayable_attributes = [];
    var attribute_names = Object.getOwnPropertyNames(this.data['elements'][0]);
    var exceptions = ['name', 'package_version', 'object_class'];
    for (let i=0; i<attribute_names.length; i++) {
      if (!(List.is_include(attribute_names[i], exceptions))) {
        let name = attribute_names[i];
        let type_ = TypeOf(this.data['elements'][0][name]);
        this.displayable_attributes.push(new Attribute(name, type_));
      }
    }
  }

  initialize_point_families() {
    let point_index = [];
    for (let i=0; i<this.data['elements'].length; i++) {
      point_index.push(i);
    }
    let new_point_family = new PointFamily(string_to_hex('red'), point_index, 'Initial family');
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
    this.transbutton_x = 5;
    this.transbutton_y = this.height - 25;
    this.transbutton_w = 35;
    this.transbutton_h = 20;
    this.selectDep_x = 45;
    this.selectDep_y = this.height - 25;
    this.selectDep_w = 40;
    this.selectDep_h = 20;
    this.view_button_x = 90;
    this.view_button_y = this.height - 25;
    this.view_button_w = 35;
    this.view_button_h = 20;
  }

  draw_manipulation_button():void {
      Shape.createButton(this.transbutton_x, this.transbutton_y, this.transbutton_w, this.transbutton_h, this.context_show, this.manipulation_bool.toString(), '12px sans-serif');
  }

  draw_selection_dependency_button():void {
    if (this.selectDependency_bool === true) {
      Shape.createButton(this.selectDep_x, this.selectDep_y, this.selectDep_w, this.selectDep_h, this.context_show, "Dep ON", '10px sans-serif');
    } else {
      Shape.createButton(this.selectDep_x, this.selectDep_y, this.selectDep_w, this.selectDep_h, this.context_show, "Dep OFF", '10px sans-serif');
    }
  }

  draw_clean_view_button():void {
    if (this.view_bool) {
      Shape.createButton(this.view_button_x, this.view_button_y, this.view_button_w, this.view_button_h, this.context_show, 'ViewON', '10px sans-serif');
    } else {
      Shape.createButton(this.view_button_x, this.view_button_y, this.view_button_w, this.view_button_h, this.context_show, 'ViewOFF', '10px sans-serif');
    }
  }

  draw_buttons():void {
    this.draw_manipulation_button();
    this.draw_selection_dependency_button();
    this.draw_clean_view_button();
  }

  click_on_view_action() {
    this.view_bool = !this.view_bool;
    this.manipulation_bool = this.view_bool;
    this.refreshAllManipulableBool();
    if (this.view_bool) {
      this.clean_view();
    }
  }

  click_on_button_action(click_on_translation_button, click_on_selectDep_button, click_on_view) {
    if (click_on_translation_button) {
      this.manipulation_bool_action();
    } else if (click_on_selectDep_button) {
      this.selectDep_action();
    } else if (click_on_view) {
      this.click_on_view_action();
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
    new_plot_data.point_families.push(this.point_families[0]);
    if (new_plot_data.type_ == 'scatterplot') {
      for (let i=0; i<new_plot_data.plotObject.point_list.length; i++) {
        new_plot_data.plotObject.point_list[i].point_families.push(this.point_families[0]);
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
    for (let attribute of this.displayable_attributes) {
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
    var DEFAULT_TOOLTIP = {to_disp_attribute_names:[attr_x.name, attr_y.name], surface_style:surface_style, text_style:text_style, tooltip_radius:5, type_:'tooltip', name:''};
    var point_style = {color_fill:string_to_rgb('lightblue'), color_stroke:string_to_rgb('grey'), stroke_width:0.5, size:2, shape:'circle', name:''};
    var new_scatter = {tooltip:DEFAULT_TOOLTIP, to_disp_attribute_names: [attr_x.name, attr_y.name], point_style: point_style,
                       elements:this.data['elements'], axis:DEFAULT_AXIS, type_:'scatterplot', name:'', package_version: this.data['package_version']};
    var DEFAULT_WIDTH = 560;
    var DEFAULT_HEIGHT = 300;
    var new_plot_data = new PlotScatter(new_scatter, DEFAULT_WIDTH, DEFAULT_HEIGHT, 1000, this.buttons_ON, 0, 0, this.canvas_id);
    this.initialize_new_plot_data(new_plot_data);
  }

  add_parallelplot(attributes:Attribute[]) {
    var to_disp_attribute_names = [];
    for (let i=0; i<attributes.length; i++) {
      to_disp_attribute_names.push(attributes[i].name);
    }
    var edge_style = {line_width:0.5, color_stroke:string_to_rgb('black'), dashline:[], name:''};
    var pp_data = {edge_style:edge_style, disposition: 'vertical', to_disp_attribute_names:to_disp_attribute_names,
                  rgbs:[[192, 11, 11], [14, 192, 11], [11, 11, 192]], elements:this.data['elements'], name:'', package_version:this.data['package_version']};
    var DEFAULT_WIDTH = 560;
    var DEFAULT_HEIGHT = 300;
    var new_plot_data = new ParallelPlot(pp_data, DEFAULT_WIDTH, DEFAULT_HEIGHT, 1000, this.buttons_ON, 0, 0, this.canvas_id);
    this.initialize_new_plot_data(new_plot_data);
  }

  add_primitivegroup(serialized:string, point_index:number): void {
    var plot_data = new PlotContour(serialized, 560, 300, 1000, this.buttons_ON, 0, 0, this.canvas_id);
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
    var new_plot_data:PrimitiveGroupContainer = new PrimitiveGroupContainer(serialized, 560, 300, 1000, this.buttons_ON, 0, 0, this.canvas_id);
    if (attribute_names !== null) {
      new_plot_data = this.initialize_containers_dicts(new_plot_data, associated_points);
      let displayable_names = Array.from(this.displayable_attributes, attribute => attribute.name);
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
      obj.draw(true, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
      obj.draw(false, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
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
    obj.draw(true, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
    obj.draw(false, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
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

  getLastObjectIndex(x,y):number { // if several plots are selected, returns the last one's index
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
        this.objectList[display_index].draw(false, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
        this.objectList[display_index].draw(true, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
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
        this.objectList[display_index].draw(false, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
        this.objectList[display_index].draw(true, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
      } else {
         this.context_show.putImageData(this.shown_datas[display_index], obj.X, obj.Y);
         this.context_hidden.putImageData(this.hidden_datas[display_index], obj.X, obj.Y);
      }
    }
    if (this.buttons_ON) { this.draw_buttons(); }
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
      this.objectList[i].multiplot_manipulation = this.manipulation_bool;
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
      if ((obj.type_ == 'scatterplot') && !equals([obj.perm_window_x, obj.perm_window_y, obj.perm_window_w, obj.perm_window_h], [0,0,0,0])) {
        bool = true;
        this.dep_selected_points_index = List.listIntersection(this.dep_selected_points_index, obj.selected_point_index);
      } else if ((obj.type_ == 'parallelplot') && !List.isListOfEmptyList(obj.rubber_bands)) {
        bool = true;
        this.dep_selected_points_index = List.listIntersection(this.dep_selected_points_index, obj.pp_selected_index);
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
    for (let i=0; i<this.nbObjects; i++) {
      if (this.objectList[i].type_ == 'scatterplot') {
        Interactions.click_on_reset_action(this.objectList[i]);
      } else if (this.objectList[i].type_ == 'contour') {
        this.objectList[i].reset_scales();
      } else if (this.objectList[i].type_ == 'primitivegroupcontainer') {
        let obj:any = this.objectList[i];
        obj.reset_action();
      }
    }
  }

  reset_all_selected_points() {
    this.dep_selected_points_index = [];
    this.selected_point_index = [];
    for (let i=0; i<this.nbObjects; i++) {
      let obj = this.objectList[i];
      if (obj.type_ == 'scatterplot') {
        this.objectList[i].reset_select_on_click();
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

  reset_selected_points_except(list:number[]) {
    this.dep_selected_points_index = [];
    this.selected_point_index = [];
    for (let i=0; i<this.nbObjects; i++) {
      if (list.includes(i)) continue;
      let obj = this.objectList[i];
      if (obj.type_ == 'scatterplot') {
        this.objectList[i].reset_select_on_click();
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
    while (j<sorted_list.length - 1) {
      if (sortedDisplayedObjectList[j+1][small_coord] < sortedDisplayedObjectList[j][small_coord]) {
        List.switchElements(sorted_list, j, j+1);
      }
      j = j+2;
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
    var big_coord = 'X';
    var small_coord = 'Y';
    var big_length = 'width';
    var small_length = 'height';
    if (this.width < this.height) {
      [big_coord, small_coord, big_length, small_length] = [small_coord, big_coord, small_length, big_length];
    }
    this.sorted_list = this.getSortedList();
    var nbObjectsDisplayed = this.to_display_plots.length;
    let small_length_nbObjects = Math.min(Math.ceil(nbObjectsDisplayed/2), Math.floor(Math.sqrt(nbObjectsDisplayed)));
    let big_length_nbObjects = Math.ceil(nbObjectsDisplayed/small_length_nbObjects);
    let big_length_step = this[big_length]/big_length_nbObjects;
    let small_length_step = this[small_length]/small_length_nbObjects;
    for (let i=0; i<big_length_nbObjects - 1; i++) {
      for (let j=0; j<small_length_nbObjects; j++) {
        var current_index = i*small_length_nbObjects + j; //current_index in sorted_list

        // The three following lines are useful for primitive group containers only
        let obj:any = this.objectList[this.sorted_list[current_index]];
        let old_small_coord = obj[small_coord];
        let old_big_coord = obj[big_coord];

        this.objectList[this.sorted_list[current_index]][big_coord] = i*big_length_step;
        this.objectList[this.sorted_list[current_index]][small_coord] = j*small_length_step;
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
    let last_small_length_step = this[small_length]/remaining_obj;
    for (let j=0; j<remaining_obj; j++) {

      // The three following lines are useful for primitive group containers only
      let obj:any = this.objectList[this.sorted_list[last_index + j]];
      let old_small_coord = obj[small_coord];
      let old_big_coord = obj[big_coord];

      this.objectList[this.sorted_list[last_index + j]][big_coord] = (big_length_nbObjects - 1)*big_length_step;
      this.objectList[this.sorted_list[last_index + j]][small_coord] = j*last_small_length_step;
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
    this.objectList[obj_index].isDrawing_rubber_band = true;
    this.mouse_move_pp_communication();
    this.objectList[obj_index].isDrawing_rubber_band = false;
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
      if ((this.objectList[i]['type_'] == 'scatterplot') && (i != isSelectingObjIndex)) {
        MultiplotCom.sc_to_sc_communication(selection_coords, to_display_attributes, this.objectList[i]);
      }
    }
    this.refresh_dep_selected_points_index();
    this.refresh_selected_object_from_index();
  }


  mouse_move_pp_communication() {
    let isDrawingRubberObjIndex = this.get_drawing_rubberbands_obj_index();
    if (isDrawingRubberObjIndex != -1) {
      let isDrawingPP = this.objectList[isDrawingRubberObjIndex];
      let rubberbands_dep = isDrawingPP.rubberbands_dep;
      this.pp_communication(rubberbands_dep);
    }
  }

  pp_communication(rubberbands_dep:[string, [number, number]][]):void { //process received data from a parallelplot and send it to the other objects
    for (let i=0; i<this.nbObjects; i++) {
      var obj:PlotData = this.objectList[i];
      var axis_numbers:number[] = [];
      if (obj.type_ == 'scatterplot') {
        var to_select:[string, [number, number]][] = [];
        for (let j=0; j<rubberbands_dep.length; j++) {
          for (let k=0; k<obj.plotObject.to_display_attributes.length; k++) {
            if (rubberbands_dep[j][0] == obj.plotObject.to_display_attributes[k]['name']) {
              to_select.push(rubberbands_dep[j]);
              axis_numbers.push(k);
            }
          }
        }
        MultiplotCom.pp_to_sc_communication(to_select, axis_numbers, this.objectList[i]);
      } else if (obj.type_ == 'parallelplot') {
        MultiplotCom.pp_to_pp_communication(rubberbands_dep, this.objectList[i]);
      }
    }
    this.refresh_dep_selected_points_index();
    this.refresh_selected_object_from_index();
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
      var obj = this.objectList[i];
      if (obj.type_ == 'scatterplot') {
        let temp_select_on_click = List.getListEltFromIndex(this.dep_selected_points_index, obj.plotObject.point_list);
        this.objectList[i].select_on_click = [];
        for (let j=0; j<obj.scatter_point_list.length; j++) {
          let scatter_point_list_j = obj.scatter_point_list[j];
          let is_inside = false;
          for (let k=0; k<scatter_point_list_j.points_inside.length; k++) {
            if (List.is_include(scatter_point_list_j.points_inside[k], temp_select_on_click)) {
              is_inside = true;
              if (!scatter_point_list_j.selected) {
                this.objectList[i].select_on_click.push(obj.scatter_point_list[j]);
                this.objectList[i].scatter_point_list[j].selected = true;
                break;
              } 
            }
          }
          if (!is_inside && this.objectList[i].scatter_point_list[j].selected) {
            this.objectList[i].scatter_point_list[j].selected = false;
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

  get_drawing_rubberbands_obj_index():number {
    for (let i=0; i<this.nbObjects; i++) {
      if (this.objectList[i].isDrawing_rubber_band === true) {
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
    var obj_settings_on = -1;
    for (let i=0; i<this.nbObjects; i++) {
      if (this.objectList[i].settings_on) {
        obj_settings_on = i;
        break;
      }
    }
    return obj_settings_on;
  }

  dbl_click_manage_settings_on(object_index:number): void {
    var obj_settings_on = this.get_settings_on_object();
    if (obj_settings_on == -1) {
      this.objectList[object_index].settings_on = true;
    } else if (obj_settings_on == object_index) {
      this.objectList[object_index].settings_on = false;
    }
  }

  single_click_manage_settings_on(object_index:number): void {
    var obj_settings_on = this.get_settings_on_object();
    if ((obj_settings_on !== -1) && (obj_settings_on !== object_index)) {
      this.objectList[obj_settings_on].settings_on = false;
      this.objectList[object_index].settings_on = true;
    }
  }


  manage_selected_point_index_changes(old_selected_index:number[]) {
    if (!equals(old_selected_index, this.selected_point_index)) {
      var evt = new CustomEvent('selectionchange', { detail: { 'selected_point_indices': this.selected_point_index } });
      this.canvas.dispatchEvent(evt);
    }
  }

  color_associated_scatter_point(point_index) { // used by mouse_over_primitive_group() to select points inside scatterplots
    for (let i=0; i<this.nbObjects; i++) {
      if (this.objectList[i].type_ === 'scatterplot') {
        let obj = this.objectList[i];
        let selected_point = obj.plotObject.point_list[point_index];
        let sc_point_list = obj.scatter_point_list;
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
        obj.draw(false, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
        obj.draw(true, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);      
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
          obj.draw(false, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
          obj.draw(true, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y); 
        }
      }
    }
  }

  mouse_over_scatter_plot() {
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
            container.draw(false, container.last_mouse1X, container.last_mouse1Y, container.scaleX, container.scaleY, container.X, container.Y);
            container.draw(true, container.last_mouse1X, container.last_mouse1Y, container.scaleX, container.scaleY, container.X, container.Y);        
          }
        } else {
          for (let i=0; i<this.nbObjects; i++) {
            if (this.objectList[i].type_ !== 'primitivegroupcontainer') continue;
            let container:any = this.objectList[i];
            for (let j=0; j<container.primitive_groups.length; j++) {
              container.primitive_groups[j].dep_mouse_over = false;
              container.draw(false, container.last_mouse1X, container.last_mouse1Y, container.scaleX, container.scaleY, container.X, container.Y);
              container.draw(true, container.last_mouse1X, container.last_mouse1Y, container.scaleX, container.scaleY, container.X, container.Y);  
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
          container.draw(false, container.last_mouse1X, container.last_mouse1Y, container.scaleX, container.scaleY, container.X, container.Y);
          container.draw(true, container.last_mouse1X, container.last_mouse1Y, container.scaleX, container.scaleY, container.X, container.Y);  
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


  mouse_interaction(): void {
    var mouse1X:number = 0; var mouse1Y:number = 0; var mouse2X:number = 0; var mouse2Y:number = 0; var mouse3X:number = 0; var mouse3Y:number = 0;
    var isDrawing = false;
    var mouse_moving:boolean = false;
    var vertex_infos:Object;
    var clickOnVertex:boolean = false;
    var old_selected_index;

    // For canvas to read keyboard inputs.
    this.canvas.setAttribute('tabindex', '0');
    this.canvas.focus(); 

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
            this.redrawAllObjects();
          }
          this.refresh_selected_point_index();
          this.redraw_object();
        } else {
          if (this.selectDependency_bool) {
            this.mouse_over_primitive_group();
            this.mouse_over_scatter_plot();
          }
        }
      }
    });

    this.canvas.addEventListener('mouseup', e => {
      mouse3X = e.offsetX;
      mouse3Y = e.offsetY;
      var click_on_manip_button = Shape.isInRect(mouse3X, mouse3Y, this.transbutton_x, this.transbutton_y, this.transbutton_w, this.transbutton_h);
      var click_on_selectDep_button = Shape.isInRect(mouse3X, mouse3Y, this.selectDep_x, this.selectDep_y, this.selectDep_w, this.selectDep_h);
      var click_on_view = Shape.isInRect(mouse3X, mouse3Y, this.view_button_x, this.view_button_y, this.view_button_w, this.view_button_h);
      var click_on_multi_button = click_on_manip_button || click_on_selectDep_button || click_on_view;
      if (click_on_multi_button) {
        this.click_on_button_action(click_on_manip_button, click_on_selectDep_button, click_on_view);
      }

      if (mouse_moving === false) {
        if (this.selectDependency_bool) {
          if (this.clickedPlotIndex !== -1 && this.objectList[this.clickedPlotIndex].type_ === 'parallelplot') {
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
              this.pp_communication(this.objectList[this.clickedPlotIndex].rubberbands_dep);
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
    });

    this.canvas.addEventListener('click', e => {
      if (this.clickedPlotIndex !== -1) {
        this.single_click_manage_settings_on(this.clickedPlotIndex);
        // this.redrawAllObjects();
      }
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
  initial_last_mouse1X:number=0;
  initial_last_mouse1Y:number=0;
  last_mouse1X:number=0;
  last_mouse1Y:number=0;
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
  scatter_point_list:Point2D[]=[];
  scatter_init_points:Point2D[]=[];
  refresh_point_list_bool:boolean=true;
  sc_interpolation_ON: boolean=false;
  isSelectingppAxis:boolean=false;
  zoom_box_x:number=0;
  zoom_box_y:number=0;
  zoom_box_w:number=0;
  zoom_box_h:number=0;
  clear_point_button_y:number=0;

  displayable_attributes:Attribute[]=[];
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
  isDrawing_rubber_band:boolean=false;
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
    public coeff_pixel: number,
    public buttons_ON: boolean,
    public X: number,
    public Y: number,
    public canvas_id: string) {
    }


  abstract draw(hidden, mvx, mvy, scaleX, scaleY, X, Y);

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
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
  }

  reset_scales(): void {
    this.init_scale = Math.min(this.width/(this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX), this.height/(this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY));
    this.scale = this.init_scale;
    if ((this.axis_ON) && !(this.graph_ON)) { // rescale and avoid axis
      this.init_scaleX = (this.width - this.decalage_axis_x - 2*this.pointLength)/(this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX);
      this.init_scaleY = (this.height - this.decalage_axis_y - 2*this.pointLength)/(this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY);
      this.scaleX = this.init_scaleX;
      this.scaleY = this.init_scaleY;
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX + this.decalage_axis_x/(2*this.scaleX);
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY - this.decalage_axis_y/(2*this.scaleY) + this.pointLength/(2*this.scaleY);
    } else if ((this.axis_ON) && (this.graph_ON)) { // rescale + avoid axis and graph buttons on top of canvas
      this.init_scaleX = (this.width-this.decalage_axis_x)/(this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX);
      this.init_scaleY = (this.height - this.decalage_axis_y - (this.graph1_button_y + this.graph1_button_h + 5))/(this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY);
      this.scaleX = this.init_scaleX;
      this.scaleY = this.init_scaleY;
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX + this.decalage_axis_x/(2*this.scaleX);
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY - (this.decalage_axis_y - (this.graph1_button_y + this.graph1_button_h + 5))/(2*this.scaleY);
    } else { // only rescale
      this.scaleX = this.init_scale;
      this.scaleY = this.init_scale;
      this.init_scaleX = this.init_scale;
      this.init_scaleY = this.init_scale;
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX;
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY;
    }
  }

  draw_settings_rect() {
    Shape.rect(this.X, this.Y, this.width, this.height, this.context, 'white', string_to_hex('blue'), 1, 1, [10,10]);
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

  draw_empty_canvas() {
    this.context.clearRect(this.X - 1, this.Y - 1, this.width + 2, this.height + 2);
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
    if (d['type_'] == 'primitivegroup') {
      for (let i=0; i<d.primitives.length; i++) {
        this.context.beginPath();
        // let pr_x=this.scale*1000*d.primitives[i].minX + mvx; let pr_y=this.scale*1000*d.primitives[i].minY + mvy;
        // let pr_w=this.scale*1000*(d.primitives[i].maxX - d.primitives[i].minX);
        // let pr_h=this.scale*1000*(d.primitives[i].maxY - d.primitives[i].minY);
        // let is_inside_canvas = (pr_x+pr_w>=0) && (pr_x<=this.width) &&
        //   (pr_y+pr_h>=0) && (pr_y<=this.height);
        let is_inside_canvas = true;
        if ((d.primitives[i].type_ == 'contour') && is_inside_canvas) {
          this.draw_contour(hidden, mvx, mvy, scaleX, scaleY, d.primitives[i]);
        } else if ((d.primitives[i].type_ == 'arc') && is_inside_canvas) {
          d.primitives[i].init_scale = this.init_scale;
          d.primitives[i].draw(this.context, mvx, mvy, scaleX, scaleY, this.X, this.Y);
          this.context.stroke();
        } else if (d.primitives[i].type_ == 'text') {
          d.primitives[i].init_scale = this.init_scale;
          d.primitives[i].draw(this.context, mvx, mvy, scaleX, scaleY, this.X, this.Y);
          this.context.stroke();
          this.context.fill();
        } else if ((d.primitives[i].type_ == 'circle') && is_inside_canvas) {
          this.draw_circle(hidden, mvx, mvy, scaleX, scaleY, d.primitives[i]);
        } else if ((d.primitives[i].type_ == 'linesegment2d') && is_inside_canvas) {
          d.primitives[i].draw(this.context, true, mvx, mvy, scaleX, scaleY, this.X, this.Y);
          this.context.stroke();
          this.context.fill();
          this.context.setLineDash([]);
        } else if ((d.primitives[i].type_ == 'line2d') && is_inside_canvas) {
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
        this.context.fillStyle = d.surface_style.color_fill;
        this.context.setLineDash(d.edge_style.dashline);
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
      this.context.fill();
      this.context.stroke();
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
        this.context.lineWidth = d.edge_style.line_width;
        this.context.fillStyle = d.surface_style.color_fill;
        this.context.setLineDash(d.edge_style.dashline);
        this.context.fill();
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
      this.context.stroke();
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
      var x = scaleX*(1000*d.cx+ mvx);
      var y = scaleY*(1000*d.cy + mvy);
      this.pointLength = 1000*d.size;

      var is_inside_canvas = ((x + this.pointLength>=0) && (x - this.pointLength <= this.width) && (y + this.pointLength >= 0) && (y - this.pointLength <= this.height));
      if (is_inside_canvas === true) {
        this.context.beginPath();
        d.draw(this.context, this.context_hidden, mvx, mvy, scaleX, scaleY, this.X, this.Y);
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
      }
    }
  }

  draw_axis(mvx, mvy, scaleX, scaleY, d:Axis) { // Only used by graph2D
    if (d['type_'] == 'axis'){
      d.draw_horizontal_axis(this.context, mvx, scaleX, this.width, this.height, this.init_scaleX, this.minX, this.maxX, this.scroll_x, 
        this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.plotObject['to_disp_attribute_names'][0], this.width);
      d.draw_vertical_axis(this.context, mvy, scaleY, this.width, this.height, this.init_scaleY, this.minY, this.maxY, this.scroll_y,
        this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.plotObject['to_disp_attribute_names'][1], this.height);
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

  draw_tooltip(d:Tooltip, mvx, mvy, point_list, elements, mergeON) {
    if (d['type_'] == 'tooltip') {
      this.tooltip_ON = true;
      d.manage_tooltip(this.context, mvx, mvy, this.scaleX, this.scaleY, this.width, this.height, this.tooltip_list, this.X, this.Y, this.x_nb_digits, this.y_nb_digits, point_list, elements, mergeON);
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
        let graph = d.graphs[i];
        this.draw_tooltip(graph.tooltip, mvx, mvy, graph.point_list, graph.elements, false);
      }
    }
  }

  draw_scatterplot(d:Scatter, hidden, mvx, mvy) {
    if (d['type_'] == 'scatterplot') {
      this.draw_scatterplot_axis(mvx, mvy, this.scaleX, this.scaleY, d.axis, d.lists, d.to_display_attributes);
      if (((this.scroll_x%5==0) || (this.scroll_y%5==0)) && this.refresh_point_list_bool && this.mergeON){
        let refreshed_points = this.refresh_point_list(d.point_list,mvx,mvy);
        if (!this.point_list_equals(refreshed_points, this.scatter_point_list)) {
          this.scatter_point_list = refreshed_points;
          //refresh_point_families
        }

        this.refresh_point_list_bool = false;
      } else if (this.mergeON === false) {
        if (!this.point_list_equals(this.scatter_point_list, d.point_list)) {
          this.scatter_point_list = d.point_list;
        }
      }
      if ((this.scroll_x%5 != 0) && (this.scroll_y%5 != 0)) {
        this.refresh_point_list_bool = true;
      }
      if (this.point_families.length == 0) {
        for (var i=0; i<this.scatter_point_list.length; i++) {
          var point:Point2D = this.scatter_point_list[i];
          this.draw_point(hidden, mvx, mvy, this.scaleX, this.scaleY, point);
        }
      } else {
        var point_order = this.get_point_order();
        for (let i=0; i<point_order.length; i++) {
          for (let j=0; j<point_order[i].length; j++) {
            let index = point_order[i][j];
            let point:Point2D = this.scatter_point_list[index];
            this.draw_point(hidden, mvx, mvy, this.scaleX, this.scaleY, point);
          }
        }
      }

      for (var i=0; i<this.tooltip_list.length; i++) {
        if (!List.is_include(this.tooltip_list[i],this.scatter_point_list)) {
          this.tooltip_list = List.remove_element(this.tooltip_list[i], this.tooltip_list);
        }
      }
      this.draw_tooltip(d.tooltip, mvx, mvy, this.scatter_point_list, d.elements, this.mergeON);
    }
  }

  get_point_order() {
    var point_order = [];
    for (let i=0; i<this.point_families.length; i++) {
      point_order.push([]);
    }
    for (let i=0; i<this.scatter_point_list.length; i++) {
      let point_point_families = this.scatter_point_list[i].point_families;
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

  real_to_axis_coord(real_coord, type_, list, inverted) {
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
        this.pp_selected_index.push(this.from_to_display_list_to_elements(i, this.elements));
      }
    }
    if (this.pp_selected_index.length === 0 && List.isListOfEmptyList(this.rubber_bands)) {
      this.reset_pp_selected();
    }
  }



  from_to_display_list_to_elements(i, elements) {
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
    for (let i=0; i<this.displayable_attributes.length; i++) {
      let isDisplayed = false;
      for (let j=0; j<this.axis_list.length; j++) {
        if (this.displayable_attributes[i].name == this.axis_list[j].name) {
          isDisplayed = true;
          break;
        }
      }
      this.attribute_booleans.push(isDisplayed);
    }
  }

  refresh_displayable_attributes():void { //Orders displayable_attributes so that displayed axis are placed on top of the list
    var new_displayable_attributes:Attribute[] = [];
    for (let i=0; i<this.axis_list.length; i++) {
      for (let j=0; j<this.displayable_attributes.length; j++) {
        if (this.axis_list[i].name == this.displayable_attributes[j].name) {
          new_displayable_attributes.push(this.displayable_attributes[j]);
          this.displayable_attributes = List.remove_at_index(j, this.displayable_attributes);
        }
      }
    }
    for (let i=0; i<this.displayable_attributes.length; i++) {
      new_displayable_attributes.push(this.displayable_attributes[i]);
    }
    this.displayable_attributes = new_displayable_attributes;
  }

  add_to_axis_list(to_disp_attribute_names:string[]) {
    for (let i=0; i<to_disp_attribute_names.length; i++) {
      for (let j=0; j<this.displayable_attributes.length; j++) {
        if (to_disp_attribute_names[i] == this.displayable_attributes[j]['name']) {
          this.axis_list.push(this.displayable_attributes[j]);
        }
      }
    }
  }

  add_points_to_selection(index_list:number[]) {
    for (let index of index_list) {
      let point = this.plotObject.point_list[index];
      for (let i=0; i<this.scatter_point_list.length; i++) {
        if (List.is_include(point, this.scatter_point_list[i].points_inside) && !List.is_include(point, this.select_on_click)) {
          this.select_on_click.push(point);
          this.plotObject.point_list[index].selected = true;
          this.latest_selected_points.push(point);
        }
      }
    }
    this.refresh_selected_point_index();
    this.refresh_latest_selected_points_index();
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }

  add_axis_to_parallelplot(name:string):void { //Adding a new axis to the plot and redraw the canvas
    for (let i=0; i<this.axis_list.length; i++) {
      if (name == this.axis_list[i]['name']) {
        throw new Error('Cannot add an attribute that is already displayed');
      }
    }
    this.add_to_axis_list([name]);
    this.refresh_axis_bounds(this.axis_list.length);
    this.refresh_displayable_attributes();
    this.refresh_attribute_booleans();
    this.rubber_bands.push([]);
    this.refresh_to_display_list(this.elements);
    this.draw(false, 0, 0, 0, 0, this.X, this.Y);
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
    this.refresh_displayable_attributes();
    this.refresh_attribute_booleans();
    this.draw(false, 0 ,0 ,0 ,0, this.X, this.Y);
  }

  get_scatterplot_displayed_axis():Attribute[] {
    return this.plotObject.to_display_attributes;
  }

  get_scatterplot_displayable_axis():Attribute[] {
    return this.plotObject.displayable_attributes;
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
    for (let i=0; i<this.plotObject.displayable_attributes.length; i++) {
      if (this.plotObject.displayable_attributes[i].name == attribute_name) {
        isAttributeInList = true;
        attribute = this.plotObject.displayable_attributes[i];
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
    if (this.mergeON) {this.scatter_point_list = this.refresh_point_list(this.plotObject.point_list, this.last_mouse1X, this.last_mouse1Y);}
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }

  set_scatterplot_y_axis(attribute_name:string):void {
    var isAttributeInList:boolean = false;
    var attribute:Attribute;
    for (let i=0; i<this.plotObject.displayable_attributes.length; i++) {
      if (this.plotObject.displayable_attributes[i].name == attribute_name) {
        isAttributeInList = true;
        attribute = this.plotObject.displayable_attributes[i];
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
    if (this.mergeON) {this.scatter_point_list = this.refresh_point_list(this.plotObject.point_list, this.last_mouse1X, this.last_mouse1Y);}
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }

  add_to_tooltip(tooltip:Tooltip, str:string): Tooltip {
    tooltip.to_disp_attribute_names.push(str);
    return tooltip;
  }

  remove_from_tooltip(tooltip:Tooltip, str:string): Tooltip {
    tooltip.to_disp_attribute_names = List.remove_element(str, tooltip.to_disp_attribute_names);
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
      return sc_length/(1000*this.scaleX);
    }
    return sc_length/(1000*this.scaleY);
  }

  real_to_scatter_length(real_length:number, coord_type:string) {
    if (coord_type == 'x') {
      return this.scaleX*1000*real_length;
    }
    return this.scaleY*1000*real_length;
  }

  scatter_to_real_coords(sc_coord:number, coord_type:string) {
    if (coord_type == 'x') {
      return 1/1000 * ((sc_coord - this.X)/this.scaleX - this.last_mouse1X);
    } else {
      return -1/1000 * ((sc_coord - this.Y)/this.scaleY - this.last_mouse1Y);
    }
  }

  real_to_scatter_coords(real_coord:number, coord_type:string):number { //coord_type : 'x' or 'y'
    if (coord_type == 'x') {
      return this.scaleX*(1000*real_coord + this.last_mouse1X) + this.X;
    } else {
      return this.scaleY*(-1000*real_coord + this.last_mouse1Y) + this.Y;
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
    this.refresh_displayable_attributes();
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
    } else { 
      // this.select_on_click.push(click_plot_data); // used to add undefined to select_on_click
    }
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
        if (this.scatter_point_list[i]) {this.scatter_point_list[i].selected = false;}
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
    this.initial_last_mouse1X = this.last_mouse1X;
    this.initial_last_mouse1Y = this.last_mouse1Y;
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

        this.last_mouse1X = this.initial_last_mouse1X + mouse2X/this.scaleX - mouse1X/this.scaleX;
        this.last_mouse1Y = this.initial_last_mouse1Y + mouse2Y/this.scaleY - mouse1Y/this.scaleY;
        this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
        this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
        this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
        this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
        
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
        this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
        this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
      this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
      this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
      var isDrawing = false;
      mouse_moving = false;
      this.isSelecting = false;
      this.isDrawing_rubber_band = false;
      return [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y];
  }

  wheel_interaction(mouse3X, mouse3Y, e) {
    e.preventDefault();
    this.fusion_coeff = 1.2;
    var event = -e.deltaY/Math.abs(e.deltaY);
    mouse3X = e.offsetX;
    mouse3Y = e.offsetY;
    if ((mouse3Y>=this.height - this.decalage_axis_y + this.Y) && (mouse3X>this.decalage_axis_x + this.X) && this.axis_ON) {
        var old_scaleX = this.scaleX;
        if (event>0) {
          this.scaleX = this.scaleX*this.fusion_coeff;
          this.scroll_x++;
          this.last_mouse1X = this.last_mouse1X - ((this.width/2)/old_scaleX - (this.width/2)/this.scaleX);
        } else if (event<0) {
          this.scaleX = this.scaleX/this.fusion_coeff;
          this.scroll_x--;
          this.last_mouse1X = this.last_mouse1X - ((this.width/2)/old_scaleX - (this.width/2)/this.scaleX);
        }

    } else if ((mouse3X<=this.decalage_axis_x + this.X) && (mouse3Y<this.height - this.decalage_axis_y + this.Y) && this.axis_ON) {
        var old_scaleY = this.scaleY;
        if (event>0) {
          this.scaleY = this.scaleY*this.fusion_coeff;
          this.scroll_y++;
          this.last_mouse1Y = this.last_mouse1Y - ((this.height/2)/old_scaleY - (this.height/2)/this.scaleY);
        } else if (event<0) {
          this.scaleY = this.scaleY/this.fusion_coeff;
          this.scroll_y--;
          this.last_mouse1Y = this.last_mouse1Y - ((this.height/2)/old_scaleY - (this.height/2)/this.scaleY);
        }

    } else {
        var old_scaleY = this.scaleY;
        var old_scaleX = this.scaleX;
        if (event>0) {
          this.scaleX = this.scaleX*this.fusion_coeff;
          this.scaleY = this.scaleY*this.fusion_coeff;
        } else if (event<0) {
          this.scaleX = this.scaleX/this.fusion_coeff;
          this.scaleY = this.scaleY/this.fusion_coeff;
        }
        this.scroll_x = this.scroll_x + event;
        this.scroll_y = this.scroll_y + event;
        this.last_mouse1X = this.last_mouse1X - ((mouse3X - this.X)/old_scaleX - (mouse3X - this.X)/this.scaleX);
        this.last_mouse1Y = this.last_mouse1Y - ((mouse3Y - this.Y)/old_scaleY - (mouse3Y - this.Y)/this.scaleY);
      }
      this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
      this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
    } else if (this.isDrawing_rubber_band || is_resizing) {
      is_resizing = Interactions.rubber_band_size_check(selected_axis_index, this);
    }
    if (click_on_disp) {
      Interactions.change_disposition_action(this);
    }
    this.isDrawing_rubber_band = false;
    mouse_moving = false;
    isDrawing = false;
    this.last_mouse1X = 0;
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
    length = 1000*point.size;
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

  refresh_point_list(point_list:Point2D[], mvx:number, mvy:number): Point2D[] { //Naive search method
    var point_list_copy:Point2D[] = List.copy(point_list); // Array.from(point_list);
    var i = 0;
    var length = point_list_copy.length;
    while (i<length - 1) {
      var size_i = point_list_copy[i].size;
      var xi = this.scaleX*(1000*point_list_copy[i].cx + mvx);
      var yi = this.scaleY*(1000*point_list_copy[i].cy + mvy);
      var bool = false;
      var j = i+1;
      while (j<length) {
        var size_j = point_list_copy[j].size;
        if (size_i>=size_j) {var max_size_index = i;} else {var max_size_index = j;}
        var xj = this.scaleX*(1000*point_list_copy[j].cx + mvx);
        var yj = this.scaleY*(1000*point_list_copy[j].cy + mvy);
        if (this.distance([xi,yi], [xj,yj])<1000*(point_list_copy[i].size + point_list_copy[j].size)) {
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

/** 
 * A class that inherits from PlotData and is specific for drawing PrimitiveGroups.
 */
export class PlotContour extends PlotData {
  plot_datas:any;
  public constructor(public data:any,
                     public width: number,
                     public height: number,
                     public coeff_pixel: number,
                     public buttons_ON: boolean,
                     public X: number,
                     public Y: number,
                     public canvas_id: string) {
    super(data, width, height, coeff_pixel, buttons_ON, 0, 0, canvas_id);
    var requirement = '0.5.2';
    check_package_version(data['package_version'], requirement);
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

    this.plotObject = this.plot_datas[0];
    this.isParallelPlot = false;
    this.interaction_ON = true;
  }

  draw(hidden, mvx, mvy, scaleX, scaleY, X, Y) {
    this.define_context(hidden);
    this.context.save();
    this.draw_empty_canvas();
    if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
    this.context.beginPath();
    this.context.rect(X-1, Y-1, this.width+2, this.height+2);
    this.context.clip();
    this.context.closePath();
    for (let i=0; i<this.plot_datas.length; i++) {
      let d = this.plot_datas[i];
      this.draw_primitivegroup(hidden, mvx, mvy, scaleX, scaleY, d);
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

    this.refresh_buttons_coords();
    if ((this.buttons_ON) && (this.button_w > 20) && (this.button_h > 10)) {
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
    public coeff_pixel: number,
    public buttons_ON: boolean,
    public X: number,
    public Y: number,
    public canvas_id: string) {
      super(data, width, height, coeff_pixel, buttons_ON, X, Y, canvas_id);
      var requirement = '0.4.10';
      check_package_version(data['package_version'], requirement);
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
        this.pointLength = 1000*this.plotObject.point_list[0].size;
        this.scatter_init_points = this.plotObject.point_list;
        this.refresh_MinMax(this.plotObject.point_list);
      }
      this.isParallelPlot = false;
  }

  draw(hidden, mvx, mvy, scaleX, scaleY, X, Y) {
    this.define_context(hidden);
    this.context.save();
    this.draw_empty_canvas();
    if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
    this.context.beginPath();
    this.context.rect(X-1, Y-1, this.width+2, this.height+2);
    this.context.clip();
    this.context.closePath();
    this.draw_graph2D(this.plotObject, hidden, mvx, mvy);
    this.draw_scatterplot(this.plotObject, hidden, mvx, mvy);
    if (this.permanent_window) {
      this.draw_selection_rectangle();
    }
    if (this.zw_bool || (this.isSelecting && !this.permanent_window)) {
      this.draw_zoom_rectangle();
    }

    this.refresh_buttons_coords();

    if ((this.buttons_ON) && (this.button_w > 20) && (this.button_h > 10)) {
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
        // TODO To check, this in args is weird
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

  constructor(public data, public width, public height, public coeff_pixel, public buttons_ON, X, Y, public canvas_id: string) {
    super(data, width, height, coeff_pixel, buttons_ON, X, Y, canvas_id);
    var requirement = '0.4.10';
    check_package_version(data['package_version'], requirement);
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
    var to_disp_attribute_names = data['to_disp_attribute_names'];
    if (data['disposition'] == 'vertical') {
      this.vertical = true;
    } else if (data['disposition'] == 'horizontal') {
      this.vertical = false;
    } else {
      throw new Error('Axis disposition must be vertical or horizontal');
    }
    this.initialize_displayable_attributes();
    this.initialize_attributes_list();
    this.add_to_axis_list(to_disp_attribute_names);
    this.initialize_data_lists();
    var nb_axis = this.axis_list.length;
    if (nb_axis<=1) {throw new Error('At least 2 axis are required')};
    this.refresh_to_display_list(this.elements);
    this.refresh_displayable_attributes();
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

  initialize_displayable_attributes() {
    var attribute_names = Object.getOwnPropertyNames(this.elements[0]);
    var exceptions = ['name', 'package_version', 'object_class'];
    for (let i=0; i<attribute_names.length; i++) {
      if (!(List.is_include(attribute_names[i], exceptions))) {
        let name = attribute_names[i];
        let type_ = TypeOf(this.elements[0][name]);
        this.displayable_attributes.push(new Attribute(name, type_));
      }
    }
  }

  initialize_attributes_list() { //Initialize 'list' and 'alias' of displayable_attributes's elements'
    for (var i=0; i<this.displayable_attributes.length; i++) {
      var attribute_name = this.displayable_attributes[i]['name'];
      this.displayable_attributes[i]['alias'] = this.displayable_attributes[i]['name'];
      var type_ = this.displayable_attributes[i]['type_'];
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
        this.displayable_attributes[i]['list'] = [min, max];
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
        this.displayable_attributes[i]['list'] = list;
      }
    }
  }

  draw_initial() {
    this.init_scale = 1;
    this.scale = 1;
    this.scaleX = 1;
    this.scaleY = 1;
    this.last_mouse1X = 0;
    this.last_mouse1Y = 0;
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }

  draw(hidden, mvx, mvy, scaleX, scaleY, X, Y) {
    this.refresh_axis_bounds(this.axis_list.length);
    this.define_context(hidden);
    this.context.save();
    this.draw_empty_canvas();
    if (this.settings_on) {this.draw_settings_rect();} else {this.draw_rect();}
    this.context.beginPath();
    this.context.rect(X-1, Y-1, this.width+2, this.height + 2);
    this.context.clip();
    this.context.closePath();
    this.draw_rubber_bands(mvx);
    var nb_axis = this.axis_list.length;
    this.draw_parallel_coord_lines();
    this.draw_parallel_axis(nb_axis, mvx);
    if (this.buttons_ON) {
      this.refresh_pp_buttons_coords();
      Buttons.disp_button(this.disp_x + this.X, this.disp_y + this.Y, this.disp_w, this.disp_h, '10px Arial', this);
    }
    if (this.multiplot_manipulation) {
      this.draw_manipulable_rect();
    }
    this.context.restore();
  }

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
              public coeff_pixel: number,
              public buttons_ON: boolean,
              public X: number,
              public Y: number,
              public canvas_id: string) {
    super(data, width, height, coeff_pixel, buttons_ON, X, Y, canvas_id);
    var requirement = '0.5.2';
    check_package_version(data['package_version'], requirement);
    this.type_ = 'primitivegroupcontainer';
    var serialized = data['primitive_groups'];
    var initial_coords = data['coords'] || Array(serialized.length).fill([0,0]);
    var initial_sizes = data['sizes'] || Array(serialized.length).fill([560, 300]);
    for (let i=0; i<serialized.length; i++) {
      this.primitive_groups.push(new PlotContour(serialized[i], initial_sizes[i][0], initial_sizes[i][1], coeff_pixel, buttons_ON, X+initial_coords[i][0], Y+initial_coords[i][1], canvas_id));
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
    // var count = 0;
    // var max_count = 50;
    // if (this.maxX - this.minX > this.width) {
    //   while ((this.maxX - this.minX > this.width - this.decalage_axis_x) && (count < max_count)) {
    //     this.x_zoom_elements(-1);
    //     this.refresh_MinMax();
    //     count++;
    //   } 
    // } else {
    //   while ((this.maxX - this.minX < (this.width - this.decalage_axis_x)/1.1) && (count < max_count)) {
    //     this.x_zoom_elements(1);
    //     this.refresh_MinMax();
    //     count++;
    //   } 
    // }
    // count = 0;
    // if (this.layout_mode == 'two_axis') {
    //   if (this.maxY - this.minY > this.height) {
    //     while ((this.maxY - this.minY > this.height - this.decalage_axis_y) && (count < max_count)) {
    //       this.y_zoom_elements(-1);
    //       this.refresh_MinMax();
    //       count++;
    //     } 
    //   } else {
    //     while ((this.maxY - this.minY < (this.height - this.decalage_axis_y)/1.1) && (count < max_count)) {
    //       this.y_zoom_elements(1);
    //       this.refresh_MinMax();
    //       count++;
    //     }
    //   }
    // }
    // if (count === max_count) {
    //   console.warn("WARNING: Primitive_group_container -> refresh_spacing(): max count reached. Autoscaling won't be optimal.");
    // }
    var zoom_coeff_x = (this.width - this.decalage_axis_x)/(this.maxX - this.minX);
    var container_center_x = this.X + this.width/2;
    for (let i=0; i<this.primitive_groups.length; i++) {
      let primitive_center_x = this.primitive_groups[i].X + this.primitive_groups[i].width/2;
      primitive_center_x = container_center_x + zoom_coeff_x*(primitive_center_x - container_center_x);
      this.primitive_groups[i].X = primitive_center_x - this.primitive_groups[i].width/2;
    }
    var old_scaleX = this.scaleX;
    this.scaleX = this.scaleX*zoom_coeff_x;
    this.last_mouse1X = this.last_mouse1X - ((container_center_x - this.X)/old_scaleX - (container_center_x - this.X)/this.scaleX);
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
      var old_scaleY = this.scaleY;
      this.scaleY = this.scaleY*zoom_coeff_y;
      this.last_mouse1Y = this.last_mouse1Y - ((container_center_y - this.Y)/old_scaleY - (container_center_y - this.Y)/this.scaleY);
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
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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

  draw(hidden, mvx, mvy, scaleX, scaleY, X, Y) {
    if (this.clickedPlotIndex != -1) {
      let old_index = List.get_index_of_element(this.clickedPlotIndex, this.display_order);
      this.display_order = List.move_elements(old_index, this.display_order.length - 1, this.display_order);
    }
    this.define_context(hidden);
    this.context.save();
    this.draw_empty_canvas();

    this.context.clip(this.context.rect(X-1, Y-1, this.width+2, this.height+2));
    if (this.width > 100 && this.height > 100) {
      this.draw_layout_axis();
      if (this.layout_mode !== 'regular') {
        this.draw_coordinate_lines();
      }
      for (let index of this.display_order) {
        let prim = this.primitive_groups[index];
        this.primitive_groups[index].draw(hidden, prim.last_mouse1X, prim.last_mouse1Y, prim.scaleX, prim.scaleY, prim.X, prim.Y);
      }
    }

    if (this.multiplot_manipulation) { 
      this.draw_manipulable_rect(); 
    } else { 
      this.context.strokeStyle = this.initial_rect_color_stroke;
      this.context.lineWidth = this.initial_rect_line_width;
      this.context.strokeRect(X, Y, this.width, this.height); 
    }
    if (this.buttons_ON) { this.draw_buttons(); }
    this.context.restore();
  }


  redraw_object() {
    this.store_datas();
    this.draw_empty_canvas();
    for (let display_index of this.display_order) {
      let obj = this.primitive_groups[display_index];
      if (display_index == this.clickedPlotIndex) {
        this.primitive_groups[display_index].draw(false, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
        this.primitive_groups[display_index].draw(true, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
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
    var new_plot_data = new PlotContour(serialized, 560, 300, 1000, this.buttons_ON, this.X, this.Y, this.canvas_id);
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
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
        this.layout_axis.draw_sc_horizontal_axis(this.context, this.last_mouse1X, this.scaleX, this.width, this.height,
            this.init_scaleX, this.layout_attributes[0].list, this.layout_attributes[0], this.scroll_x, this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.width);
      } else if (this.layout_mode == 'two_axis') {
        this.layout_axis.draw_sc_horizontal_axis(this.context, this.last_mouse1X, this.scaleX, this.width, this.height,
          this.init_scaleX, this.layout_attributes[0].list, this.layout_attributes[0], this.scroll_x, this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y, this.width);

        this.layout_axis.draw_sc_vertical_axis(this.context, this.last_mouse1Y, this.scaleY, this.width, this.height, this.init_scaleY, this.layout_attributes[1].list,
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
    let small_length_nbObjects = Math.min(Math.ceil(nb_primitives/2), Math.floor(Math.sqrt(nb_primitives)));
    let big_length_nbObjects = Math.ceil(nb_primitives/small_length_nbObjects);
    let big_length_step = this[big_length]/big_length_nbObjects;
    let small_length_step = this[small_length]/small_length_nbObjects;
    for (let i=0; i<big_length_nbObjects - 1; i++) {
      for (let j=0; j<small_length_nbObjects; j++) {
        var current_index = i*small_length_nbObjects + j; //current_index in sorted_list
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
      this.primitive_groups[sorted_list[last_index + j]][big_coord] = (big_length_nbObjects - 1)*big_length_step + this[big_coord];
      this.primitive_groups[sorted_list[last_index + j]][small_coord] = j*last_small_length_step + this[small_coord];
      this.primitive_groups[sorted_list[last_index + j]][big_length] = big_length_step;
      this.primitive_groups[sorted_list[last_index + j]][small_length] = last_small_length_step;
    }
    this.resetAllObjects();
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
    this.last_mouse1X = 0; this.last_mouse1Y = 0;
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
      var center_x = this.scaleX*1000*real_x + this.last_mouse1X;
      this.primitive_groups[i].X = this.X + center_x - this.primitive_groups[i].width/2;
      this.primitive_groups[i].Y = this.Y + this.height/2 - this.primitive_groups[i].height/2;
      if (type_ !== 'float') this.primitive_groups[i].Y += y_incs[i];
    }
    if (this.primitive_groups.length >= 1) this.reset_scales();
    this.resetAllObjects();
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
    this.last_mouse1X = 0; this.last_mouse1Y = 0;
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
      var center_x = this.scaleX*1000*real_x + this.last_mouse1X;
      this.primitive_groups[i].X = this.X + center_x - this.primitive_groups[i].width/2;

      if (this.layout_attributes[1].type_ == 'float') {
        var real_y = this.elements_dict[i.toString()][this.layout_attributes[1].name];
      } else if (this.layout_attributes[1].type_ == 'color') {
        let value = rgb_to_string(this.elements_dict[i.toString()][this.layout_attributes[1].name]);
        real_y = List.get_index_of_element(value, this.layout_attributes[1].list);
      } else {
        real_y = List.get_index_of_element(this.elements_dict[i.toString()][this.layout_attributes[1].name], this.layout_attributes[1].list);
      }
      var center_y = -this.scaleX*1000*real_y + this.last_mouse1Y;
      this.primitive_groups[i].Y = this.Y + center_y - this.primitive_groups[i].height/2;
    }
    if (this.primitive_groups.length >= 2) this.reset_scales();
    this.resetAllObjects();
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }

  translatePrimitive(index, tx, ty) {
    this.primitive_groups[index].X = this.primitive_groups[index].X + tx;
    this.primitive_groups[index].Y = this.primitive_groups[index].Y + ty;
  }

  translateAllPrimitives(tx, ty) {
    for (let i=0; i<this.primitive_groups.length; i++) {
      this.translatePrimitive(i, tx, ty);
    }
    this.last_mouse1X = this.last_mouse1X + tx/this.scaleX;
    this.last_mouse1Y = this.last_mouse1Y + ty/this.scaleY;
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
    var old_scaleX = this.scaleX; var old_scaleY = this.scaleY;
    this.scaleX = this.scaleX*zoom_coeff; this.scaleY = this.scaleY*zoom_coeff;
    this.last_mouse1X = this.last_mouse1X - ((mouse3X - this.X)/old_scaleX - (mouse3X - this.X)/this.scaleX);
    this.last_mouse1Y = this.last_mouse1Y - ((mouse3Y - this.Y)/old_scaleY - (mouse3Y - this.Y)/this.scaleY);
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
    var old_scaleX = this.scaleX;
    this.scaleX = this.scaleX*zoom_coeff;
    this.last_mouse1X = this.last_mouse1X - ((container_center_x - this.X)/old_scaleX - (container_center_x - this.X)/this.scaleX);
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
    var old_scaleY = this.scaleY;
    this.scaleY = this.scaleY*zoom_coeff;
    this.last_mouse1Y = this.last_mouse1Y - ((container_center_y - this.Y)/old_scaleY - (container_center_y - this.Y)/this.scaleY);
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
    this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }


  mouse_interaction(isParallelPlot:boolean=false) {
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
              this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
              this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
            } else {
              if (clickOnVertex) {
                this.resizeObject(vertex_infos, mouse2X - old_mouse2X, mouse2Y - old_mouse2Y);
              } else {
                this.translatePrimitive(this.clickedPlotIndex, mouse2X - old_mouse2X, mouse2Y - old_mouse2Y);
                this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
                this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
        this.draw(true, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
        this.draw(false, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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

export class Interactions {
  public static initialize_select_win_bool(mouseX, mouseY, plot_data:PlotScatter): [boolean, boolean, boolean, boolean, boolean] {
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

  public static initialize_permWH(plot_data:PlotScatter) {
    plot_data.initial_permW = plot_data.perm_window_w;
    plot_data.initial_permH = plot_data.perm_window_h;
  }

  public static selection_window_resize(mouse1X, mouse1Y, mouse2X, mouse2Y, up, down, left, right, plot_data:PlotScatter) {
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

  public static mouse_move_select_win_action(mouse1X, mouse1Y, mouse2X, mouse2Y, plot_data:PlotScatter) {
    var temp_w = Math.abs(mouse2X - mouse1X);
    var temp_h = Math.abs(mouse2Y - mouse1Y);
    if ((temp_w <= 5) || (temp_h <= 5)) return;
    plot_data.perm_window_x = plot_data.scatter_to_real_coords(Math.min(mouse1X, mouse2X), 'x');
    plot_data.perm_window_y = plot_data.scatter_to_real_coords(Math.min(mouse1Y, mouse2Y), 'y');
    plot_data.perm_window_w = plot_data.scatter_to_real_length(temp_w, 'x');
    plot_data.perm_window_h = plot_data.scatter_to_real_length(temp_h, 'y');
  }


  public static selection_window_action(plot_data:PlotScatter) {

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
          var x = plot_data.scaleX*(1000*point.cx + plot_data.last_mouse1X) + plot_data.X;
          var y = plot_data.scaleY*(1000*point.cy + plot_data.last_mouse1Y) + plot_data.Y;
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
      for (var j=0; j<plot_data.scatter_point_list.length; j++) {
        var x = plot_data.scaleX*(1000*plot_data.scatter_point_list[j].cx + plot_data.last_mouse1X) + plot_data.X;
        var y = plot_data.scaleY*(1000*plot_data.scatter_point_list[j].cy + plot_data.last_mouse1Y) + plot_data.Y;
        in_rect = Shape.isInRect(x, y, sc_perm_window_x, sc_perm_window_y, sc_perm_window_w, sc_perm_window_h);
        if ((in_rect===true) && !List.is_include(plot_data.scatter_point_list[j], plot_data.select_on_click)) {
          plot_data.select_on_click.push(plot_data.scatter_point_list[j]);
          plot_data.scatter_point_list[j].selected = true;
          plot_data.latest_selected_points.push(plot_data.scatter_point_list[j]);
        } else if (!in_rect) {
          plot_data.scatter_point_list[j].selected = false;
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
      plot_data.last_mouse1X = plot_data.last_mouse1X - Math.min(mouse1X - plot_data.X, mouse2X - plot_data.X)/plot_data.scaleX;
      plot_data.last_mouse1Y = plot_data.last_mouse1Y - Math.min(mouse1Y - plot_data.Y,mouse2Y - plot_data.Y)/plot_data.scaleY;
      plot_data.scaleX = plot_data.scaleX*zoom_coeff_x;
      plot_data.scaleY = plot_data.scaleY*zoom_coeff_y;
    }
  }

  public static refresh_permanent_rect(plot_data:PlotScatter) {
    if (plot_data.perm_window_w < 0) {
      plot_data.perm_window_x = plot_data.perm_window_x + plot_data.perm_window_w;
      plot_data.perm_window_w = -plot_data.perm_window_w;
    }
    if (plot_data.perm_window_h < 0) {
      plot_data.perm_window_y = plot_data.perm_window_y - plot_data.perm_window_h;
      plot_data.perm_window_h = -plot_data.perm_window_h;
    }
  }

  public static click_on_zoom_window_action(plot_data:PlotScatter) {
    plot_data.zw_bool = !plot_data.zw_bool;
    plot_data.select_bool = false;
  }

  public static click_on_selection_button_action(plot_data:PlotScatter) {
    plot_data.zw_bool = false;
    plot_data.select_bool = !plot_data.select_bool;
  }

  public static graph_button_action(mouse1X, mouse1Y, plot_data:PlotScatter) {
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

  public static click_on_merge_action(plot_data:PlotScatter) {
    plot_data.mergeON = !plot_data.mergeON;
    plot_data.refresh_point_list_bool = true;
    plot_data.reset_scroll();
    plot_data.select_on_click = [];
  }

  public static reset_zoom_box(plot_data: PlotScatter) {
    plot_data.zoom_box_x = 0;
    plot_data.zoom_box_y = 0;
    plot_data.zoom_box_w = 0;
    plot_data.zoom_box_h = 0;
  }

  public static reset_permanent_window(plot_data:PlotScatter) {
    plot_data.perm_window_x = 0;
    plot_data.perm_window_y = 0;
    plot_data.perm_window_w = 0;
    plot_data.perm_window_h = 0;
  }

  public static click_on_perm_action(plot_data:PlotScatter) {
    plot_data.permanent_window = !plot_data.permanent_window;
    this.reset_permanent_window(plot_data);
  }

  public static click_on_clear_action(plot_data:PlotScatter) {
    this.reset_permanent_window(plot_data);
    plot_data.reset_select_on_click();
  }

  public static zoom_in_button_action(plot_data:PlotScatter) {
    var old_scaleX = plot_data.scaleX;
    var old_scaleY = plot_data.scaleY;
    plot_data.scaleX = plot_data.scaleX*1.2;
    plot_data.scaleY = plot_data.scaleY*1.2;
    plot_data.last_mouse1X = plot_data.last_mouse1X - (plot_data.width/(2*old_scaleX) - plot_data.width/(2*plot_data.scaleX));
    plot_data.last_mouse1Y = plot_data.last_mouse1Y - (plot_data.height/(2*old_scaleY) - plot_data.height/(2*plot_data.scaleY));
    plot_data.reset_scroll();
  }

  public static zoom_out_button_action(plot_data:PlotScatter) {
    var old_scaleX = plot_data.scaleX;
    var old_scaleY = plot_data.scaleY;
    plot_data.scaleX = plot_data.scaleX/1.2;
    plot_data.scaleY = plot_data.scaleY/1.2;
    plot_data.last_mouse1X = plot_data.last_mouse1X - (plot_data.width/(2*old_scaleX) - plot_data.width/(2*plot_data.scaleX));
    plot_data.last_mouse1Y = plot_data.last_mouse1Y - (plot_data.height/(2*old_scaleY) - plot_data.height/(2*plot_data.scaleY));
    plot_data.reset_scroll();
  }

  public static mouse_move_axis_inversion(isDrawing, e, selected_name_index, plot_data:any) {
    isDrawing = true;
    plot_data.move_index = selected_name_index;
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    if (plot_data.vertical === true) {
      var axis_x = plot_data.axis_x_start + plot_data.move_index*plot_data.x_step;
      plot_data.last_mouse1X = mouse2X - axis_x
    } else {
      var axis_y = plot_data.axis_y_start + plot_data.move_index*plot_data.y_step;
      plot_data.last_mouse1X = mouse2Y - axis_y;
    }
    plot_data.draw(false, plot_data.last_mouse1X, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, plot_data.last_mouse1X, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
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
    plot_data.isDrawing_rubber_band = true;
    if (plot_data.vertical) {
      var min = Math.max(Math.min((mouse1Y - plot_data.axis_y_end)/(plot_data.axis_y_start - plot_data.axis_y_end), (mouse2Y - plot_data.axis_y_end)/(plot_data.axis_y_start - plot_data.axis_y_end)), 0);
      var max = Math.min(Math.max((mouse1Y - plot_data.axis_y_end)/(plot_data.axis_y_start - plot_data.axis_y_end), (mouse2Y - plot_data.axis_y_end)/(plot_data.axis_y_start - plot_data.axis_y_end)), 1);
    } else {
      var min = Math.max(Math.min((mouse1X - plot_data.axis_x_start)/(plot_data.axis_x_end - plot_data.axis_x_start), (mouse2X - plot_data.axis_x_start)/(plot_data.axis_x_end - plot_data.axis_x_start)), 0);
      var max = Math.min(Math.max((mouse1X - plot_data.axis_x_start)/(plot_data.axis_x_end - plot_data.axis_x_start), (mouse2X - plot_data.axis_x_start)/(plot_data.axis_x_end - plot_data.axis_x_start)), 1);
    }
    plot_data.rubber_bands[selected_axis_index] = [min, max];
    var realCoord_min = plot_data.axis_to_real_coords(min, plot_data.axis_list[selected_axis_index]['type_'], plot_data.axis_list[selected_axis_index]['list'], plot_data.inverted_axis_list[selected_axis_index]);
    var realCoord_max = plot_data.axis_to_real_coords(max, plot_data.axis_list[selected_axis_index]['type_'], plot_data.axis_list[selected_axis_index]['list'], plot_data.inverted_axis_list[selected_axis_index]);
    var real_min = Math.min(realCoord_min, realCoord_max);
    var real_max = Math.max(realCoord_min, realCoord_max);

    plot_data.add_to_rubberbands_dep([plot_data.axis_list[selected_axis_index]['name'], [real_min, real_max]]);
    plot_data.draw(false, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    return [mouse2X, mouse2Y];
  }

  public static rubber_band_translation(mouse1X, mouse1Y, selected_band_index, e, plot_data:any) {
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    plot_data.isDrawing_rubber_band = true;
    if (plot_data.vertical) {
      var deltaY = (mouse2Y - mouse1Y)/(plot_data.axis_y_start - plot_data.axis_y_end);
      var new_min = Math.max(plot_data.rubber_last_min + deltaY, 0);
      var new_max = Math.min(plot_data.rubber_last_max + deltaY, 1);
    } else {
      var deltaX = (mouse2X - mouse1X)/(plot_data.axis_x_end - plot_data.axis_x_start);
      var new_min = Math.max(plot_data.rubber_last_min + deltaX, 0);
      var new_max = Math.min(plot_data.rubber_last_max + deltaX, 1);
    }
    plot_data.rubber_bands[selected_band_index] = [new_min, new_max];
    let real_new_min = plot_data.axis_to_real_coords(new_min, plot_data.axis_list[selected_band_index]['type_'], plot_data.axis_list[selected_band_index]['list'], plot_data.inverted_axis_list[selected_band_index]);
    let real_new_max = plot_data.axis_to_real_coords(new_max, plot_data.axis_list[selected_band_index]['type_'], plot_data.axis_list[selected_band_index]['list'], plot_data.inverted_axis_list[selected_band_index]);
    let to_add_min = Math.min(real_new_min, real_new_max);
    let to_add_max = Math.max(real_new_min, real_new_max);
    plot_data.add_to_rubberbands_dep([plot_data.axis_list[selected_band_index]['name'], [to_add_min, to_add_max]]);
    plot_data.draw(false, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    return [mouse2X, mouse2Y];
  }

  public static rubber_band_resize(mouse1X, mouse1Y, selected_border, e, plot_data:any) {
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    var axis_index = selected_border[0];
    var border_number = selected_border[1];
    plot_data.isDrawing_rubber_band = true;
    if (plot_data.vertical) {
      var deltaY = (mouse2Y - mouse1Y)/(plot_data.axis_y_start - plot_data.axis_y_end);
      if (border_number == 0) {
        var new_min = Math.min(Math.max(plot_data.rubber_last_min + deltaY, 0), 1);
        plot_data.rubber_bands[axis_index][0] = new_min;
      } else {
        var new_max = Math.min(Math.max(plot_data.rubber_last_max + deltaY, 0), 1);
        plot_data.rubber_bands[axis_index][1] = new_max;
      }
    } else {
      var deltaX = (mouse2X - mouse1X)/(plot_data.axis_x_end - plot_data.axis_x_start);
      if (border_number == 0) {
        var new_min = Math.min(Math.max(plot_data.rubber_last_min + deltaX, 0), 1);
        plot_data.rubber_bands[axis_index][0] = new_min;
      } else {
        var new_max = Math.min(Math.max(plot_data.rubber_last_max + deltaX, 0), 1);
        plot_data.rubber_bands[axis_index][1] = new_max;
      }
    }
    if (plot_data.rubber_bands[axis_index][0]>plot_data.rubber_bands[axis_index][1]) {
      [plot_data.rubber_bands[axis_index][0],plot_data.rubber_bands[axis_index][1]] = [plot_data.rubber_bands[axis_index][1],plot_data.rubber_bands[axis_index][0]];
      border_number = 1 - border_number;
      [plot_data.rubber_last_min, plot_data.rubber_last_max] = [plot_data.rubber_last_max, plot_data.rubber_last_min];
    }
    var real_new_min = plot_data.axis_to_real_coords(plot_data.rubber_bands[axis_index][0], plot_data.axis_list[axis_index]['type_'], plot_data.axis_list[axis_index]['list'], plot_data.inverted_axis_list[axis_index]);
    var real_new_max = plot_data.axis_to_real_coords(plot_data.rubber_bands[axis_index][1], plot_data.axis_list[axis_index]['type_'], plot_data.axis_list[axis_index]['list'], plot_data.inverted_axis_list[axis_index]);
    var to_add_min = Math.min(real_new_min, real_new_max);
    var to_add_max = Math.max(real_new_min, real_new_max);
    plot_data.add_to_rubberbands_dep([plot_data.axis_list[axis_index]['name'], [to_add_min, to_add_max]]);
    plot_data.draw(false, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
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
    plot_data.draw(false, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
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
    return [mouse3X, mouse3Y, click_on_axis];
  }

  public static select_title_action(selected_name_index, plot_data:any) {
    plot_data.inverted_axis_list[selected_name_index] = !plot_data.inverted_axis_list[selected_name_index];
    if (plot_data.rubber_bands[selected_name_index].length != 0) {
      plot_data.invert_rubber_bands([selected_name_index]);
    }
    plot_data.refresh_axis_coords();
    plot_data.draw(false, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
  }

  public static change_disposition_action(plot_data:any) {
    plot_data.vertical = !plot_data.vertical;
    plot_data.refresh_axis_bounds(plot_data.axis_list.length);
    plot_data.invert_rubber_bands('all');

    plot_data.draw(false, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
  }

  public static rubber_band_size_check(selected_band_index, plot_data:any) {
    if (plot_data.rubber_bands[selected_band_index].length != 0 && Math.abs(plot_data.rubber_bands[selected_band_index][0] - plot_data.rubber_bands[selected_band_index][1])<=0.02) {
      plot_data.rubber_bands[selected_band_index] = [];
    }
    plot_data.draw(false, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    var is_resizing = false;
    return is_resizing;
  }

  public static move_axis(old_index, new_index, plot_data:any) {
    plot_data.axis_list = List.move_elements(old_index, new_index, plot_data.axis_list);
    plot_data.rubber_bands = List.move_elements(old_index, new_index, plot_data.rubber_bands);
    plot_data.inverted_axis_list = List.move_elements(old_index, new_index, plot_data.inverted_axis_list);
    plot_data.refresh_to_display_list(plot_data.elements);
    plot_data.refresh_displayable_attributes(); //No need to refresh attribute_booleans as inverting axis doesn't affect its values
    plot_data.refresh_axis_coords();
    var mvx = 0;
    var mvy = 0;
    plot_data.draw(false, mvx, mvy, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, mvx, mvy, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
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

  public static pp_to_sc_communication(to_select:[string, [number, number]][], axis_numbers:number[], plot_data:PlotData):void {
    if (to_select.length == 1) {
      var new_select_on_click = [];
      let min = to_select[0][1][0];
      let max = to_select[0][1][1];
      for (let i=0; i<plot_data.scatter_point_list.length; i++) {
        plot_data.scatter_point_list[i].selected = false;
        if (axis_numbers[0] == 0) {
          plot_data.perm_window_x = Math.max(min, plot_data.minX);
          plot_data.perm_window_w = Math.min(max, plot_data.maxX) - plot_data.perm_window_x;
          plot_data.perm_window_y = Math.abs(plot_data.minY);
          plot_data.perm_window_h = Math.abs(plot_data.maxY - plot_data.perm_window_y);
          var bool = (plot_data.scatter_point_list[i].cx >= min) && (plot_data.scatter_point_list[i].cx <= max);
        } else {
          plot_data.perm_window_x = plot_data.minX;
          plot_data.perm_window_w = plot_data.maxX - plot_data.perm_window_x;
          plot_data.perm_window_y = max;
          plot_data.perm_window_h = max - min;
          var bool = (-plot_data.scatter_point_list[i].cy >= min) && (-plot_data.scatter_point_list[i].cy <= max);
        }
        if (bool === true) {
          new_select_on_click.push(plot_data.scatter_point_list[i]);
          plot_data.scatter_point_list[i].selected = true;
        } else {
          plot_data.scatter_point_list[i].selected = false;
        }
      }
      plot_data.select_on_click = new_select_on_click;
      plot_data.refresh_selected_point_index();

    } else if (to_select.length == 2) {
      var new_select_on_click = [];
      let min1 = to_select[0][1][0];
      let max1 = to_select[0][1][1];
      let min2 = to_select[1][1][0];
      let max2 = to_select[1][1][1];
      for (let i=0; i<plot_data.scatter_point_list.length; i++) {
        plot_data.scatter_point_list[i].selected = false;
        let point = plot_data.scatter_point_list[i];
        if (axis_numbers[0] == 0) {
          plot_data.perm_window_x = Math.max(min1, plot_data.minX);
          plot_data.perm_window_w = Math.min(max1, plot_data.maxX) - plot_data.perm_window_x;
          var bool1 = (point.cx >= min1) && (point.cx <= max1);
        } else {
          plot_data.perm_window_y = max1;
          plot_data.perm_window_h = max1 - min1;
          var bool1 = (-point.cy >= min1) && (-point.cy <= max1);
        }
        if (axis_numbers[1] == 0) {
          plot_data.perm_window_x = Math.max(min2, plot_data.minX);
          plot_data.perm_window_w = Math.min(max2, plot_data.maxX) - plot_data.perm_window_x;
          var bool2 = (point.cx >= min2) && (point.cx <= max2);
        } else {
          plot_data.perm_window_y = max2;
          plot_data.perm_window_h = max2 - min2;
          var bool2 = (-point.cy >= min2) && (-point.cy <= max2);
        }
        if (bool1 && bool2) {
          plot_data.scatter_point_list[i].selected = true;
          new_select_on_click.push(plot_data.scatter_point_list[i]);
        }
      }
      plot_data.select_on_click = new_select_on_click;
      plot_data.refresh_selected_point_index();

    }

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
    plot_data.refresh_pp_selected();
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

/** 
 * A class that allows you to draw multiple primitives in one canvas.
 * @param primitives A list of primitives, ie. Contour2D, Text, LineSegment2D, Arc2D, Circle2D or Line2D
 */
export class PrimitiveGroup {
  constructor(public primitives: any[],
              public type_: string,
              public name:string) {}

  public static deserialize(serialized) {
    var primitives:any[] = [];
    var temp = serialized['primitives'];
    for (let i=0; i<temp.length; i++) {
      if (temp[i]['type_'] == 'contour') {
        primitives.push(Contour2D.deserialize(temp[i]));
      } else if (temp[i]['type_'] == 'text') {
        primitives.push(Text.deserialize(temp[i]));
      } else if (temp[i]['type_'] == 'linesegment2d') {
        primitives.push(LineSegment2D.deserialize(temp[i]));
      } else if (temp[i]['type_'] == 'arc') {
        primitives.push(Arc2D.deserialize(temp[i]));
      } else if (temp[i]['type_'] == 'circle') {
        primitives.push(Circle2D.deserialize(temp[i]));
      } else if (temp[i]['type_'] == 'line2d') {
        primitives.push(Line2D.deserialize(temp[i]));
      } else if (temp[i]['type_'] == 'multiplelabels') {
        primitives.push(MultipleLabels.deserialize(temp[i]));
      }
    }
    return new PrimitiveGroup(primitives,
                            serialized['type_'],
                            serialized['name']);
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
  mouse_selection_color:any;

  constructor(public plot_data_primitives:any,
              public edge_style:EdgeStyle,
              public surface_style:SurfaceStyle,
              public type_:string='contour',
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
      // if (d['type_'] == 'circle') {
      //   let new_circle = Circle2D.deserialize(d);
      //   new_circle.edge_style = edge_style;
      //   new_circle.surface_style = surface_style;
      //   plot_data_primitives.push(new_circle);
      // }
      if (d['type_'] == 'arc') {
        let new_arc = Arc2D.deserialize(d);
        new_arc.edge_style = edge_style;
        plot_data_primitives.push(new_arc);
      }

    }
    return new Contour2D(plot_data_primitives,
                                  edge_style,
                                  surface_style,
                                  serialized['type_'],
                                  serialized['name']);
  }
}

export class Text {
  minX:number=Infinity;
  maxX:number=-Infinity;
  minY:number=Infinity;
  maxY:number=-Infinity;
  mouse_selection_color:any;
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
                              text_align_x:'start', text_align_y:'alphabetic', name:''};
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

    context.font = font_size.toString() + 'px ' + this.text_style.font_style;
    context.fillStyle = this.text_style.text_color;
    context.textAlign = this.text_style.text_align_x,
    context.textBaseline = this.text_style.text_align_y;
    if (this.max_width) {
      var cut_texts = this.cutting_text(context, scaleX*1000*this.max_width);
      for (let i=0; i<cut_texts.length; i++) {
        context.fillText(cut_texts[i], scaleX*(1000*this.position_x + mvx) + X, scaleY*(1000*this.position_y + mvy) + i*font_size + Y);
      }
    } else {
      context.fillText(this.comment, scaleX*(1000*this.position_x + mvx) + X, scaleY*(1000*this.position_y + mvy) + Y);
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
    var x1 = scaleX*(1000*this.data[0] + mvx) + X;
    var y1 = scaleY*(-1000*this.data[1] + mvy) + Y;
    var x2 = scaleX*(1000*this.data[2] + mvx) + X;
    var y2 = scaleY*(-1000*this.data[3] + mvy) + Y;

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
      this.minY = Math.min(-this.data[1], -this.data[3]);
      this.maxY = Math.max(-this.data[1], -this.data[3]);
  }

  public static deserialize(serialized) {
    var default_edge_style = {color_stroke:string_to_rgb('grey'), dashline:[], line_width:0.5, name:''};
    var default_dict_ = {edge_style:default_edge_style};
    serialized = set_default_values(serialized, default_dict_);
    var edge_style = EdgeStyle.deserialize(serialized['edge_style']);
    return new LineSegment2D(serialized['data'],
                             edge_style,
                             serialized['type_'],
                             serialized['name']);
  }

  draw(context, first_elem, mvx, mvy, scaleX, scaleY, X, Y) {
    context.lineWidth = this.edge_style.line_width;
    context.strokeStyle = this.edge_style.color_stroke;
    context.setLineDash(this.edge_style.dashline);
    if (first_elem) {
      context.moveTo(scaleX*(1000*this.data[0]+ mvx) + X, scaleY*(-1000*this.data[1]+ mvy) + Y);
    }
    context.lineTo(scaleX*(1000*this.data[2]+ mvx) + X, scaleY*(-1000*this.data[3]+ mvy) + Y);
  }
}

export class Circle2D {
  minX:number=0;
  maxX:number=0;
  minY:number=0;
  maxY:number=0;
  mouse_selection_color:any;

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

    this.mouse_selection_color = genColor();
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
    context.arc(scaleX*(1000*this.cx+ mvx) + X, scaleY*(1000*this.cy+ mvy) + Y, scaleX*1000*this.r, 0, 2*Math.PI);
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
  mouse_selection_color:any;
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
      this.size = this.k*point_style.size/400;
      this.minX = this.cx;
      this.maxX = this.cx;
      this.minY = this.cy;
      this.maxY = this.cy;

      this.mouse_selection_color = genColor();
    }

    public static deserialize(serialized) {
      var point_style = PointStyle.deserialize(serialized['point_style']);
      return new Point2D(serialized['cx'],
                         -serialized['cy'],
                         point_style,
                         serialized['type_'],
                         serialized['name']);
    }

    draw(context, context_hidden, mvx, mvy, scaleX, scaleY, X, Y) {
        if (this.point_style.shape == 'circle') {
          context.arc(scaleX*(1000*this.cx+ mvx) + X, scaleY*(1000*this.cy+ mvy) + Y, 1000*this.size, 0, 2*Math.PI);
          context.stroke();
        } else if (this.point_style.shape == 'square') {
          context.rect(scaleX*(1000*this.cx + mvx) - 1000*this.size + X, scaleY*(1000*this.cy + mvy) - 1000*this.size + Y, 1000*this.size*2, 1000*this.size*2);
          context.stroke();
        } else if (this.point_style.shape == 'crux') {
          context.rect(scaleX*(1000*this.cx + mvx) + X, scaleY*(1000*this.cy + mvy) + Y, 1000*this.size, 100*this.size);
          context.rect(scaleX*(1000*this.cx + mvx) + X, scaleY*(1000*this.cy + mvy) + Y, -1000*this.size, 100*this.size);
          context.rect(scaleX*(1000*this.cx + mvx) + X, scaleY*(1000*this.cy + mvy) + Y, 100*this.size, 1000*this.size);
          context.rect(scaleX*(1000*this.cx + mvx) + X, scaleY*(1000*this.cy + mvy) + Y, 100*this.size, -1000*this.size);
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

export class Axis {
  color_stroke:any;
  x_step:number;
  y_step:number;

  constructor(public nb_points_x:number=10,
              public nb_points_y:number=10,
              public graduation_style:TextStyle,
              public axis_style:EdgeStyle,
              public arrow_on:boolean=false,
              public grid_on:boolean=true,
              public type_:string='axis',
              public name='') {
  }

  public static deserialize(serialized) {
    let default_axis_style = {line_width:0.5, color_stroke:string_to_rgb('grey'), dashline:[], name:''};
    let default_graduation_style = {text_color:string_to_rgb('grey'), font_size:12, font_style:'sans-serif', name:''};
    let default_dict_ = {nb_points_x:10, nb_points_y:10, graduation_style:default_graduation_style, 
                        axis_style:default_axis_style, arrow_on:false, grid_on:true, name:''};
    serialized = set_default_values(serialized, default_dict_);
    var graduation_style = TextStyle.deserialize(serialized['graduation_style']);
    var axis_style = EdgeStyle.deserialize(serialized['axis_style']);
    return new Axis(serialized['nb_points_x'],
                    serialized['nb_points_y'],
                    graduation_style,
                    axis_style,
                    serialized['arrow_on'],
                    serialized['grid_on'],
                    serialized['type_'],
                    serialized['name']);
  }


  draw_horizontal_graduations(context, mvx, scaleX, axis_x_start, axis_x_end, axis_y_start, axis_y_end, minX, maxX, x_step, font_size, X) {
    var i=0;
    context.textAlign = 'center';
    var x_nb_digits = Math.max(0, 1-Math.floor(Math.log10(x_step)));
    var delta_x = maxX - minX;
    var grad_beg_x = minX - 10*delta_x;
    var grad_end_x = maxX + 10*delta_x;
    while(grad_beg_x + i*x_step < grad_end_x) {
      if ((scaleX*(1000*(grad_beg_x + i*x_step) + mvx) + X > axis_x_start) && (scaleX*(1000*(grad_beg_x + i*x_step) + mvx) + X < axis_x_end - 9)) {
        if (this.grid_on === true) {
          context.strokeStyle = 'lightgrey';
          Shape.drawLine(context, [[scaleX*(1000*(grad_beg_x + i*x_step) + mvx) + X, axis_y_start], [scaleX*(1000*(grad_beg_x + i*x_step) + mvx) + X, axis_y_end + 3]]);
        } else {
          Shape.drawLine(context, [[scaleX*(1000*(grad_beg_x + i*x_step) + mvx) + X, axis_y_end - 3], [scaleX*(1000*(grad_beg_x + i*x_step) + mvx) + X, axis_y_end + 3]]);
        }
        context.fillText(MyMath.round(grad_beg_x + i*x_step, x_nb_digits), scaleX*(1000*(grad_beg_x + i*x_step) + mvx) + X, axis_y_end + font_size );
      }
      i++
    }
    context.stroke();
  }

  draw_vertical_graduations(context, mvy, scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, minY, maxY, y_step, Y) {
    var i=0;
    var real_minY = -maxY;
    var real_maxY = -minY;
    var delta_y = maxY - minY;
    var grad_beg_y = real_minY - 10*delta_y;
    var grad_end_y = real_maxY + 10*delta_y;
    context.textAlign = 'end';
    context.textBaseline = 'middle';
    var y_nb_digits = Math.max(0, 1-Math.floor(Math.log10(y_step)));
    while (grad_beg_y + (i-1)*y_step < grad_end_y) {
      if ((scaleY*(-1000*(grad_beg_y + i*y_step) + mvy) + Y > axis_y_start + 5) && (scaleY*(-1000*(grad_beg_y + i*y_step) + mvy) + Y < axis_y_end)) {
        if (this.grid_on === true) {
          context.strokeStyle = 'lightgrey';
          Shape.drawLine(context,[[axis_x_start - 3, scaleY*(-1000*(grad_beg_y + i*y_step) + mvy) + Y], [axis_x_end, scaleY*(-1000*(grad_beg_y + i*y_step) + mvy) + Y]]);
        } else {
          Shape.drawLine(context, [[axis_x_start - 3, scaleY*(-1000*(grad_beg_y + i*y_step) + mvy) + Y], [axis_x_start + 3, scaleY*(-1000*(grad_beg_y + i*y_step) + mvy) + Y]]);
        }
        context.fillText(MyMath.round(grad_beg_y + i*y_step, y_nb_digits), axis_x_start - 5, scaleY*(-1000*(grad_beg_y + i*y_step) + mvy) + Y);
      }
      i++;
    }

    context.stroke();
  }


  draw_horizontal_axis(context, mvx, scaleX, width, height, init_scaleX, minX, maxX, scroll_x, decalage_axis_x, decalage_axis_y, X, Y, to_disp_attribute_name, canvas_width) {
    context.beginPath();
    context.strokeStyle = this.axis_style.color_stroke;
    context.lineWidth = this.axis_style.line_width;
    var axis_x_start = decalage_axis_x + X;
    var axis_x_end = width + X;
    var axis_y_start = Y;
    var axis_y_end = height - decalage_axis_y + Y;
    //Arrow
    if (this.arrow_on) {
      Shape.drawLine(context, [[axis_x_end - 20, axis_y_end - 10], [axis_x_end, axis_y_end]]);
      Shape.drawLine(context, [[axis_x_end, axis_y_end], [axis_x_end - 20, axis_y_end + 10]]);
    }
    //Axis
    Shape.drawLine(context, [[axis_x_start, axis_y_end], [axis_x_end, axis_y_end]]);
    //Graduations
    if (scroll_x % 5 == 0) {
      let kx = 1.1*scaleX/init_scaleX;
      let num = Math.max(maxX - minX, 1);
      this.x_step = Math.min(num/(kx*(this.nb_points_x-1)), canvas_width/(scaleX*1000*(this.nb_points_x - 1)));
    }
    context.font = 'bold 20px Arial';
    context.textAlign = 'end';
    context.fillStyle = this.graduation_style.text_color;
    context.fillText(to_disp_attribute_name, axis_x_end - 5, axis_y_end - 10);
    // draw_horizontal_graduations
    context.font = this.graduation_style.font_size.toString() + 'px Arial';
    this.draw_horizontal_graduations(context, mvx, scaleX, axis_x_start, axis_x_end, axis_y_start, axis_y_end, minX, maxX, this.x_step, this.graduation_style.font_size, X);
    context.closePath();
  }


  draw_vertical_axis(context, mvy, scaleY, width, height, init_scaleY, minY, maxY, scroll_y, decalage_axis_x, decalage_axis_y, X, Y, to_disp_attribute_name, canvas_height) {
    context.beginPath();
    context.strokeStyle = this.axis_style.color_stroke;
    context.lineWidth = this.axis_style.line_width;
    var axis_x_start = decalage_axis_x + X;
    var axis_x_end = width + X;
    var axis_y_start = Y;
    var axis_y_end = height - decalage_axis_y + Y;
    //Arrows
    if (this.arrow_on === true) {
      Shape.drawLine(context, [[axis_x_start - 10, axis_y_start + 20], [axis_x_start, axis_y_start]]);
      Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start + 10, axis_y_start + 20]]);
    }
    //Axis
    Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start, axis_y_end]]);
    // Graduations
    if (scroll_y % 5 == 0) {
      let ky = 1.1*scaleY/init_scaleY;
      let num = Math.max(maxY - minY, 1);
      this.y_step = Math.min(num/(ky*(this.nb_points_y-1)), canvas_height/(1000*scaleY*(this.nb_points_y - 1)));
    }
    context.font = 'bold 20px Arial';
    context.textAlign = 'start';
    context.fillStyle = this.graduation_style.text_color;
    context.fillText(to_disp_attribute_name, axis_x_start + 5, axis_y_start + 20);
    //draw vertical graduations
    context.font = this.graduation_style.font_size.toString() + 'px Arial';
    this.draw_vertical_graduations(context, mvy, scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, minY, maxY, this.y_step, Y);
    context.closePath();
  }

  draw_scatter_axis(context, mvx, mvy, scaleX, scaleY, width, height, init_scaleX, init_scaleY, lists, to_display_attributes, scroll_x, scroll_y, decalage_axis_x, decalage_axis_y, X, Y, canvas_width, canvas_height) {
    this.draw_sc_horizontal_axis(context, mvx, scaleX, width, height, init_scaleX, lists[0], to_display_attributes[0], scroll_x, decalage_axis_x, decalage_axis_y, X, Y, canvas_width);
    this.draw_sc_vertical_axis(context, mvy, scaleY, width, height, init_scaleY, lists[1], to_display_attributes[1], scroll_y, decalage_axis_x, decalage_axis_y, X, Y, canvas_height);
  }

  draw_sc_horizontal_axis(context, mvx, scaleX, width, height, init_scaleX, list, to_display_attribute:Attribute, scroll_x, decalage_axis_x, decalage_axis_y, X, Y, canvas_width) {
    // Drawing the coordinate system
    context.beginPath();
    context.strokeStyle = this.axis_style.color_stroke;
    context.lineWidth = this.axis_style.line_width;
    var axis_x_start = decalage_axis_x + X;
    var axis_x_end = width + X;
    var axis_y_start = Y;
    var axis_y_end = height - decalage_axis_y + Y;

    //Arrows
    if (this.arrow_on) {
      Shape.drawLine(context, [[axis_x_end - 20, axis_y_end - 10], [axis_x_end, axis_y_end]]);
      Shape.drawLine(context, [[axis_x_end, axis_y_end], [axis_x_end - 20, axis_y_end + 10]]);
    }

    //Axis
    Shape.drawLine(context, [[axis_x_start, axis_y_end], [axis_x_end, axis_y_end]]);
    context.fillStyle = this.graduation_style.text_color;
    context.strokeStyle = this.axis_style.color_stroke;    
    context.font = 'bold 20px Arial';
    context.textAlign = 'end';
    context.fillText(to_display_attribute['name'], axis_x_end - 5, axis_y_end - 10);
    context.stroke();
    //Graduations
    context.font = this.graduation_style.font_size.toString() + 'px Arial';
    this.draw_sc_horizontal_graduations(context, mvx, scaleX, init_scaleX, axis_x_start, axis_x_end, axis_y_start, axis_y_end, list, to_display_attribute, scroll_x, X, canvas_width);  
    context.stroke();
    context.closePath();  
  }

  draw_sc_vertical_axis(context, mvy, scaleY, width, height, init_scaleY, list, to_display_attribute, scroll_y, decalage_axis_x, decalage_axis_y, X, Y, canvas_height) {
    // Drawing the coordinate system
    context.beginPath();
    context.strokeStyle = this.axis_style.color_stroke;
    context.lineWidth = this.axis_style.line_width;
    var axis_x_start = decalage_axis_x + X;
    var axis_x_end = width + X;
    var axis_y_start = Y;
    var axis_y_end = height - decalage_axis_y + Y;

    if (this.arrow_on === true) {
      Shape.drawLine(context, [[axis_x_start - 10, axis_y_start + 20], [axis_x_start, axis_y_start]]);
      Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start + 10, axis_y_start + 20]]);
    }
    //Axis
    Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start, axis_y_end]]);

    context.fillStyle = this.graduation_style.text_color;
    context.strokeStyle = this.axis_style.color_stroke;    context.font = 'bold 20px Arial';
    context.textAlign = 'start';
    context.fillText(to_display_attribute['name'], axis_x_start + 5, axis_y_start + 20);
    context.stroke();

    //Graduations
    context.font = this.graduation_style.font_size.toString() + 'px Arial';
    this.draw_sc_vertical_graduations(context, mvy, scaleY, init_scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, list, to_display_attribute, scroll_y, Y, canvas_height);
    context.stroke();
    context.closePath();
  }

  draw_sc_horizontal_graduations(context, mvx, scaleX, init_scaleX, axis_x_start, axis_x_end, axis_y_start, axis_y_end, list, attribute, scroll_x, X, canvas_width) {
    context.textAlign = 'center';

    if (attribute['type_'] == 'float') {
      var minX = list[0];
      var maxX = list[1];
      if (scroll_x % 5 == 0) {
        let kx = 1.1*scaleX/init_scaleX;
        let num = Math.max(maxX - minX, 1);
        this.x_step = Math.min(num/(kx*(this.nb_points_x-1)), canvas_width/(scaleX*1000*(this.nb_points_x - 1)));
      }
      var i=0;
      var x_nb_digits = Math.max(0, 1-Math.floor(Math.log10(this.x_step)));
      var delta_x = maxX - minX;
      var grad_beg_x = minX - 10*delta_x;
      var grad_end_x = maxX + 10*delta_x;
      while(grad_beg_x + i*this.x_step < grad_end_x) {
        if ((scaleX*(1000*(grad_beg_x + i*this.x_step) + mvx) + X > axis_x_start) && (scaleX*(1000*(grad_beg_x + i*this.x_step) + mvx) + X < axis_x_end - 9)) {
          if (this.grid_on === true) {
            Shape.drawLine(context, [[scaleX*(1000*(grad_beg_x + i*this.x_step) + mvx) + X, axis_y_start], [scaleX*(1000*(grad_beg_x + i*this.x_step) + mvx) + X, axis_y_end + 3]]);
          } else {
            Shape.drawLine(context, [[scaleX*(1000*(grad_beg_x + i*this.x_step) + mvx) + X, axis_y_end - 3], [scaleX*(1000*(grad_beg_x + i*this.x_step) + mvx) + X, axis_y_end + 3]]);
          }
          context.fillText(MyMath.round(grad_beg_x + i*this.x_step, x_nb_digits), scaleX*(1000*(grad_beg_x + i*this.x_step) + mvx) + X, axis_y_end + this.graduation_style.font_size);
        }
        i++;
      }
    } else {
      for (let i=0; i<list.length; i++) {
        if ((scaleX*(1000*i + mvx) + X > axis_x_start) && (scaleX*(1000*i + mvx) + X < axis_x_end - 9)) {
          if (this.grid_on === true) {
            Shape.drawLine(context, [[scaleX*(1000*i + mvx) + X, axis_y_start], [scaleX*(1000*i + mvx) + X, axis_y_end + 3]]);
          } else {
            Shape.drawLine(context, [[scaleX*(1000*i + mvx) + X, axis_y_end - 3], [scaleX*(1000*i + mvx) + X, axis_y_end + 3]]);
          }
          context.fillText(list[i], scaleX*(1000*i + mvx) + X, axis_y_end + this.graduation_style.font_size);
        }
      }
    }
  }

  draw_sc_vertical_graduations(context, mvy, scaleY, init_scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, list, attribute, scroll_y, Y, canvas_height) {
    context.textAlign = 'end';
    context.textBaseline = 'middle';
    if (attribute['type_'] == 'float') {
      var minY = list[0];
      var maxY = list[1];
      if (scroll_y % 5 == 0) {
        let ky = 1.1*scaleY/init_scaleY;
        let num = Math.max(maxY - minY, 1);
        this.y_step = Math.min(num/(ky*(this.nb_points_y-1)), canvas_height/(1000*scaleY*(this.nb_points_y - 1)));
      }
      var i=0;
      var delta_y = maxY - minY;
      var grad_beg_y = minY - 10*delta_y;
      var grad_end_y = maxY + 10*delta_y;
      var y_nb_digits = Math.max(0, 1-Math.floor(Math.log10(this.y_step)));
      while (grad_beg_y + (i-1)*this.y_step < grad_end_y) {
        if ((scaleY*(-1000*(grad_beg_y + i*this.y_step) + mvy) + Y > axis_y_start + 5) && (scaleY*(-1000*(grad_beg_y + i*this.y_step) + mvy) + Y < axis_y_end)) {
          if (this.grid_on === true) {
            Shape.drawLine(context,[[axis_x_start - 3, scaleY*(-1000*(grad_beg_y + i*this.y_step) + mvy) + Y], [axis_x_end, scaleY*(-1000*(grad_beg_y + i*this.y_step) + mvy) + Y]]);
          } else {
            Shape.drawLine(context, [[axis_x_start - 3, scaleY*(-1000*(grad_beg_y + i*this.y_step) + mvy) + Y], [axis_x_start + 3, scaleY*(-1000*(grad_beg_y + i*this.y_step) + mvy) + Y]]);
          }
          context.fillText(MyMath.round(grad_beg_y + i*this.y_step, y_nb_digits), axis_x_start - 5, scaleY*(-1000*(grad_beg_y + i*this.y_step) + mvy) + Y);
        }
        i++;
      }
    } else {
      for (let i=0; i<list.length; i++) {
        if ((scaleY*(-1000*i + mvy) + Y > axis_y_start + 5) && (scaleY*(-1000*i + mvy) + Y < axis_y_end)) {
          if (this.grid_on === true) {
            Shape.drawLine(context,[[axis_x_start - 3, scaleY*(-1000*i + mvy) + Y], [axis_x_end, scaleY*(-1000*i + mvy) + Y]]);
          } else {
              Shape.drawLine(context, [[axis_x_start - 3, scaleY*(-1000*i + mvy) + Y], [axis_x_start + 3, scaleY*(-1000*i + mvy) + Y]]);
          }
          context.fillText(list[i], axis_x_start - 5, scaleY*(-1000*i + mvy) + Y);
        }
      }
    }
  }
}

export class Tooltip {
  constructor(public to_disp_attribute_names:string[],
              public surface_style:SurfaceStyle,
              public text_style:TextStyle,
              public tooltip_radius:number=5,
              public type_:string='tooltip',
              public name:string='') {
              }

  public static deserialize(serialized) {
    let default_surface_style = {color_fill:string_to_rgb('lightblue'), opacity:0.75, hatching:undefined};
    let default_text_style = {text_color:string_to_rgb('black'), font_size:12, font_style:'sans-serif', 
                              text_align_x:'start', text_align_y:'alphabetic', name:''};
    let default_dict_ = {surface_style:default_surface_style, text_style:default_text_style, tooltip_radius:5};
    serialized = set_default_values(serialized, default_dict_);
    var surface_style = SurfaceStyle.deserialize(serialized['surface_style']);
    var text_style = TextStyle.deserialize(serialized['text_style']);
    return new Tooltip(serialized['to_disp_attribute_names'],
                       surface_style,
                       text_style,
                       serialized['tooltip_radius'],
                       serialized['type_'],
                       serialized['name']);
  }

  isTooltipInsideCanvas(point, mvx, mvy, scaleX, scaleY, canvasWidth, canvasHeight) {
    var x = scaleX*(1000*point.cx + mvx);
    var y = scaleY*(1000*point.cy + mvy);
    var length = 100*point.size;
    return (x+length>=0) && (x-length<=canvasWidth) && (y+length>=0) && (y-length<=canvasHeight);
  }

  refresh_nb_digits(x_nb_digits, y_nb_digits): [number, number] {
    var new_x_digits = x_nb_digits;
    var new_y_digit = y_nb_digits;
    if (isNaN(new_x_digits)) {
      new_x_digits = 3;
    }
    if (isNaN(new_y_digit)) {
      new_y_digit = 3;
    }
    return [new_x_digits, new_y_digit];
  }

  initialize_text_mergeOFF(context, x_nb_digits, y_nb_digits, elt): [string[], number] {
    var textfills = [];
    var text_max_length = 0;
    for (let i=0; i<this.to_disp_attribute_names.length; i++) {
      let attribute_name = this.to_disp_attribute_names[i];
      let attribute_type = TypeOf(elt[attribute_name]);
      if (attribute_type == 'float') {
        var text = attribute_name + ' : ' + MyMath.round(elt[attribute_name], Math.max(x_nb_digits, y_nb_digits,2)); //x_nb_digit évidemment pas définie lorsque l'axe des x est un string...
      } else if (attribute_type == 'color') {
        text = attribute_name + ' : ' + color_to_string(elt[attribute_name]);
      } else {
        text = attribute_name + ' : ' + elt[attribute_name];
      }
      var text_w = context.measureText(text).width;
      textfills.push(text);
      if (text_w > text_max_length) {
        text_max_length = text_w;
      }
    }
    return [textfills, text_max_length];
  }

  initialize_text_mergeON(context, x_nb_digits, y_nb_digits, elt, point): [string[], number] {
    var textfills = [];
    var text_max_length = 0;
    for (let i=0; i<this.to_disp_attribute_names.length; i++) {
      let attribute_name = this.to_disp_attribute_names[i];
      let attribute_type = TypeOf(elt[attribute_name]);
      if (attribute_type == 'float') {
        if (i==0) {
          var text = attribute_name + ' : ' + MyMath.round(point.cx, Math.max(x_nb_digits, y_nb_digits,2));
        } else {
          var text = attribute_name + ' : ' + MyMath.round(-point.cy, Math.max(x_nb_digits, y_nb_digits,2));
        }
      }
      var text_w = context.measureText(text).width;
      textfills.push(text);
      if (text_w > text_max_length) {
        text_max_length = text_w;
      }
    }
    return [textfills, text_max_length];
  }

  draw(context, point, mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, X, Y, x_nb_digits, y_nb_digits, point_list, elements, mergeON) {
    var textfills = [];
    var text_max_length = 0;
    [x_nb_digits, y_nb_digits] = this.refresh_nb_digits(x_nb_digits, y_nb_digits);
    if (point.isPointInList(point_list)) {
      var index = point.getPointIndex(point_list);
      var elt = elements[index];
      if (mergeON === true) {
        [textfills, text_max_length] = this.initialize_text_mergeON(context, x_nb_digits, y_nb_digits, elt, point);
      } else {
        [textfills, text_max_length] = this.initialize_text_mergeOFF(context, x_nb_digits, y_nb_digits, elt);
      }
    }

    if (textfills.length > 0) {
      var tp_height = (textfills.length + 0.25)*this.text_style.font_size ;
      var cx = point.cx;
      var cy = point.cy;
      var point_size = point.point_style.size;
      var decalage = 2.5*point_size + 5
      var tp_x = scaleX*(1000*cx + mvx) + decalage + X;
      var tp_y = scaleY*(1000*cy + mvy) - 1/2*tp_height + Y;
      var tp_width = text_max_length + 25;

      if (tp_x + tp_width  > canvas_width + X) {
        tp_x = scaleX*(1000*cx + mvx) - decalage - tp_width + X;
      }
      if (tp_y < Y) {
        tp_y = scaleY*(1000*cy + mvy) + Y;
      }
      if (tp_y + tp_height > canvas_height + Y) {
        tp_y = scaleY*(1000*cy + mvy) - tp_height + Y;
      }
      context.beginPath();
      Shape.roundRect(tp_x, tp_y, tp_width, tp_height, this.tooltip_radius, context, this.surface_style.color_fill, string_to_hex('black'), 0.5,
      this.surface_style.opacity, []);
      context.fillStyle = this.text_style.text_color;
      context.textAlign = 'start';
      context.textBaseline = 'middle';

      var x_start = tp_x + 1/10*tp_width;
      context.font = this.text_style.font;

      var current_y = tp_y + 0.75*this.text_style.font_size;
      for (var i=0; i<textfills.length; i++) {
        context.fillText(textfills[i], x_start, current_y);
        current_y = current_y + this.text_style.font_size;
      }

      context.globalAlpha = 1;
      context.stroke();
      context.closePath();
    }

  }

  manage_tooltip(context, mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, tooltip_list, X, Y, x_nb_digits, y_nb_digits, point_list, elements, mergeON) {
    for (var i=0; i<tooltip_list.length; i++) {
      if (tooltip_list[i] && this.isTooltipInsideCanvas(tooltip_list[i], mvx, mvy, scaleX, scaleY, canvas_width, canvas_height)) {
        this.draw(context, tooltip_list[i], mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, X, Y, x_nb_digits, y_nb_digits, point_list, elements, mergeON);
      }
    }
  }
}

export class Dataset {
  id:number=0;
  point_list:Point2D[]=[];
  segments:LineSegment2D[];

  constructor(public to_disp_attribute_names:string[],
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
        coord.push(Math.pow(-1, j)*this.elements[i][this.to_disp_attribute_names[j]]);
      }
      this.point_list.push(new Point2D(coord[0], coord[1], this.point_style, 'point', ''));
    } 
  }

  initialize_segments() {
    this.segments = [];
    for (let i=0; i<this.point_list.length - 1; i++) {
      let current_point = this.point_list[i];
      let next_point = this.point_list[i+1];
      let data = [current_point.cx, -current_point.cy, next_point.cx, -next_point.cy];
      this.segments.push(new LineSegment2D(data, this.edge_style, 'line', ''));
    }
  }

  public static deserialize(serialized) {
    var default_edge_style = {color_stroke:string_to_rgb('grey'), dashline:[], line_width:0.5, name:''};
    var default_point_style = {color_fill:string_to_rgb('lightviolet'), color_stroke:string_to_rgb('grey'),
                               shape:'circle', size:2, name:'', type_:'tooltip'};
    var tooltip_text_style = {font_size: 10, font_style: 'sans-serif', text_align_x:'center', text_color:string_to_rgb('black')};
    var default_dict_ = {tooltip:{to_disp_attribute_names : serialized['to_disp_attribute_names'], text_style: tooltip_text_style}, edge_style:default_edge_style, point_style:default_point_style,
                          display_step:1};
    serialized = set_default_values(serialized, default_dict_)
    var tooltip = Tooltip.deserialize(serialized['tooltip']);
    var edge_style = EdgeStyle.deserialize(serialized['edge_style']);
    var point_style = PointStyle.deserialize(serialized['point_style']);
    return new Dataset(serialized['to_disp_attribute_names'],
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
              public to_disp_attribute_names:string[],
              public axis: Axis,
              public type_: string='graph2d',
              public name: string='') {}

  public static deserialize(serialized) {
    var default_dict_ = {axis:{}};
    serialized = set_default_values(serialized, default_dict_);
    var graphs:Dataset[] = [];
    for (let i=0; i<serialized['graphs'].length; i++) {
      serialized['graphs'][i]['to_disp_attribute_names'] = serialized['to_disp_attribute_names'];
      graphs.push(Dataset.deserialize(serialized['graphs'][i]));
    }
    var axis = Axis.deserialize(serialized['axis']);

    return new Graph2D(graphs,
                       serialized['to_disp_attribute_names'],
                       axis,
                       serialized['type_'],
                       serialized['name']);
  }
}


export class Scatter {

  point_list:Point2D[]=[];
  displayable_attributes:Attribute[]=[];
  lists:any[]=[];
  to_display_attributes:Attribute[]=[];

  constructor(public tooltip:Tooltip,
              public to_disp_attribute_names:string[],
              public point_style:PointStyle,
              public elements: any[],
              public axis:Axis,
              public type_:string,
              public name:string) {
    this.initialize_displayable_attributes();
    this.initialize_to_display_attributes();
    this.initialize_lists();
    this.initialize_point_list(elements);

  }

  public static deserialize(serialized) {
    let default_point_style = {color_fill: string_to_rgb('lightviolet'), color_stroke: string_to_rgb('lightgrey')}
    var default_dict_ = {point_style:default_point_style}
    serialized = set_default_values(serialized, default_dict_);
    var axis = Axis.deserialize(serialized['axis']);
    var tooltip = Tooltip.deserialize(serialized['tooltip']);
    var point_style = PointStyle.deserialize(serialized['point_style']);
    return new Scatter(tooltip,
                       serialized['to_disp_attribute_names'],
                       point_style,
                       serialized['elements'],
                       axis,
                       serialized['type_'],
                       serialized['name']);
  }

  initialize_displayable_attributes() {
    var attribute_names = Object.getOwnPropertyNames(this.elements[0]);
    var exceptions = ['name', 'package_version', 'object_class'];
    for (let i=0; i<attribute_names.length; i++) {
      let name = attribute_names[i];
      if (!List.is_include(name, exceptions)) {
        let type_ = TypeOf(this.elements[0][name]);
        this.displayable_attributes.push(new Attribute(name, type_)); 
      }
    }
  }

  initialize_to_display_attributes() {
    for (let i=0; i<this.to_disp_attribute_names.length; i++) {
      var name = this.to_disp_attribute_names[i];
      for (let j=0; j<this.displayable_attributes.length; j++) {
        if (name == this.displayable_attributes[j]['name']) {
          this.to_display_attributes.push(this.displayable_attributes[j]);
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
    context.arc(scaleX*(1000*this.cx + mvx) + X, 
                scaleY*(1000*this.cy + mvy) + Y, 
                scaleX*1000*this.r, 
                this.start_angle, 
                this.end_angle, 
                this.anticlockwise);
  }


  contour_draw(context, first_elem, mvx, mvy, scaleX, scaleY, X, Y) {
    context.lineWidth = this.edge_style.line_width;
    context.strokeStyle = this.edge_style.color_stroke;
    var ptsa = [];
    for (var l = 0; l < this.data.length; l++) {
      ptsa.push(scaleX*(1000*this.data[l]['x']+ mvx) + X);
      ptsa.push(scaleY*(-1000*this.data[l]['y']+ mvy) + Y);
    }
    var tension = 0.4;
    var isClosed = false;
    var numOfSegments = 16;
    drawLines(context, getCurvePoints(ptsa, tension, isClosed, numOfSegments), first_elem);
  }

  // contour_draw(context, first_elem, mvx, mvy, scaleX, scaleY, X, Y) {
  //   context.lineWidth = this.edge_style.line_width;
  //   context.color_stroke = this.edge_style.color_stroke;
  //   this.manage_angles();
  //   var nb_points = 100;
  //   var points = this.get_points_on_arc(context, mvx, mvy, scaleX, scaleY, X, Y, nb_points);
  //   drawLines(context, points, first_elem);
  // }

  // manage_angles() {
  //   this.start_angle = this.start_angle % (2*Math.PI);
  //   if (this.start_angle < 0) this.start_angle += 2*Math.PI;

  //   this.end_angle = this.end_angle % (2*Math.PI);
  //   if (this.end_angle < 0) this.end_angle += 2*Math.PI;

  //   if (this.anticlockwise && this.end_angle>this.start_angle) {
  //     this.start_angle = this.start_angle + 2*Math.PI;
  //   } else if (!this.anticlockwise && this.start_angle>this.end_angle) {
  //     this.end_angle = this.end_angle + 2*Math.PI;
  //   }
  // }


  // get_points_on_arc(context, mvx, mvy, scaleX, scaleY, X, Y, nb_points) {
  //   var step = Math.abs(this.end_angle - this.start_angle)/nb_points;
  //   if (!this.anticlockwise) {
  //     var theta_i = this.start_angle;
  //     var theta_f = this.end_angle;
  //   } else {
  //     theta_i = this.end_angle;
  //     theta_f = this.start_angle;
  //   }
  //   var theta = theta_i;
  //   var points = [];
  //   var cx_d = scaleX*(1000*this.cx + mvx) + X;
  //   var cy_d = scaleY*(1000*this.cy + mvy) + Y;
  //   var r_d = scaleX*1000*this.r;
  //   while (theta <= theta_f) {
  //     let x = cx_d + r_d * Math.cos(theta);
  //     let y = cy_d + r_d * Math.sin(theta);
  //     points.push(x, y);
  //     theta += step;
  //   }
  //   return points;
  // }
}


export class Attribute {
  list:any[];
  alias:string;
  constructor(public name:string,
              public type_:string) {}

  public static deserialize(serialized) {
    return new Attribute(serialized['name'],
                         serialized['type_']);
  }

  copy() {
    var attribute_copy = new Attribute(this.name, this.type_);
    attribute_copy['list'] = this.list;
    return attribute_copy;
  }
}


/**
 * A settings class for the customizing objects that have edges such as lines and contours.
 */
export class EdgeStyle {
  constructor(public line_width:number,
              public color_stroke:string,
              public dashline:number[],
              public name: string) {
    if (line_width === undefined) {
      line_width = 0.5;
    }
    if (color_stroke === undefined) {
      color_stroke = string_to_hex('black');
    }
    if (dashline === undefined) {
      dashline = [];
    }
  }
  
  public static deserialize(serialized) {
    var default_dict_ = {line_width: 0.5, color_stroke:string_to_rgb('black'), dashline:[],
                          name:''};
    serialized = set_default_values(serialized, default_dict_);
    return new EdgeStyle(serialized['line_width'],
                         rgb_to_hex(serialized['color_stroke']),
                         serialized['dashline'],
                         serialized['name']);
  }
}


/**
 * A settings class for points customization.
 */
export class PointStyle {
  constructor(public color_fill: string,
              public color_stroke: string, 
              public stroke_width: number,
              public size: number,
              public shape: string,
              public name: string) {
    if ((color_fill === undefined) || (color_fill === null)) {
      color_fill = string_to_hex('rose');
    }
    if ((color_stroke === undefined)) {
      color_stroke = string_to_hex('black');
    }
    if (stroke_width === undefined) {
      stroke_width = 0.5;
    }
    if (size === undefined) {
      size = 2;
    }
    if (shape === undefined) {
      shape = 'circle';
    }
   }

  public static deserialize(serialized) {
    let default_dict_ = {color_fill:string_to_hex('lightviolet'), color_stroke:string_to_hex('lightgrey'),
                               stroke_width:0.5, size:2, shape:'circle', name:''};
    serialized = set_default_values(serialized, default_dict_);
    return new PointStyle(rgb_to_hex(serialized['color_fill']),
                          rgb_to_hex(serialized['color_stroke']),
                          serialized['stroke_width'],
                          serialized['size'],
                          serialized['shape'],
                          serialized['name']);
  }
}

/**
 * A settings class for text customization.
 */
export class TextStyle {
  font:string;
  option:string = '';
  constructor(public text_color:string,
              public font_size:number,
              public font_style:string,
              public text_align_x:string='start',
              public text_align_y:string='alphabetic',
              public bold:boolean=false,
              public italic:boolean=false,
              public name:string='') {
    if (text_color === undefined) {
      text_color = string_to_hex('black');
    }
    if (font_size === undefined) {
      font_size = 12;
    }
    if (font_style === undefined) {
      font_style = 'sans-serif';
    }
    this.option = '';
    if (bold && !italic) this.option = 'bold ';
    else if (italic && !bold) this.option = 'italic ';
    else if (italic && bold) this.option = 'bold italic ';
    this.font = this.option + font_size.toString() + 'px ' + font_style;
  }

  public static deserialize(serialized) {
    let default_dict_ = {text_color:string_to_rgb('black'), font_size:12, 
                         font_style:'sans-serif', text_align_x:'start',
                         text_align_y: 'alphabetic', name:''};
    serialized = set_default_values(serialized,default_dict_);
    return new TextStyle(rgb_to_hex(serialized['text_color']),
                            serialized['font_size'],
                            serialized['font_style'],
                            serialized['text_align_x'],
                            serialized['text_align_y'],
                            serialized['bold'],
                            serialized['italic'],
                            serialized['name']);
  }

  get_font_from_size(font_size:number): string {
    return this.font = this.option + font_size.toString() + 'px ' + this.font_style;
  }
}

/**
 * A setting object for customizing objects that have a surface.
 */
export class SurfaceStyle {
  constructor(public color_fill:string,
              public opacity:number,
              public hatching:HatchingSet) {
    if (color_fill === undefined) {
      color_fill = string_to_hex('black');
    } 
    if (opacity === undefined) {
      opacity = 1;
    }
  }
            
  public static deserialize(serialized) {
    let default_dict_ = {color_fill:string_to_rgb('white'), opacity:1, hatching:null};
    serialized = set_default_values(serialized, default_dict_);
    if (serialized['hatching'] != null) {
      var hatching = HatchingSet.deserialize(serialized['hatching']);
    }
    return new SurfaceStyle(rgb_to_hex(serialized['color_fill']),
                               serialized['opacity'],
                               hatching);
  }
}


export class Window {
  constructor(public height:number,public width:number, public name?:string){
  }

  public static deserialize(serialized) {
    return new Window(serialized['height'],
                      serialized['width'],
                      serialized['name']);
  }
}

export class HatchingSet {
  canvas_hatching:any;

  constructor(public name:string,
              public stroke_width:number,
              public hatch_spacing:number) {
      this.canvas_hatching = this.generate_canvas();
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

export class PointFamily {
  constructor (public color: string,
               public point_index: number[],
               public name:string) {}

  public static deserialize(serialized) {
    return new PointFamily(rgb_to_hex(serialized['color']),
                           serialized['point_index'],
                           serialized['name']);
  }
}

/**
 * A toolbox class that contains useful functions that don't exist in typescript API.
 */
export class MyMath {

  /**
   * ex: round(1.12345, 2) = 1.12 
   */
  public static round(x:number, n:number) {
    return Math.round(x*Math.pow(10,n)) / Math.pow(10,n);
  }
}

/** 
 * A generic toolbox class that contains numerous geometrical static functions.
 * The functions often require a context, which is got from a canvas element.
 */
export class Shape {

  /**
   * Draws lines that join each point of the list parameter
   * @param list A list of points: [[x1, y1], [x2, y2],..., [xn, yn]]
   */
  public static drawLine(context, list) {
    context.moveTo(list[0][0], list[0][1]);
    for (var i=1; i<list.length; i++) {
      context.lineTo(list[i][0], list[i][1]);
    }
  }

  /**
   * Draws a crux 
   * @param cx center x coordinate of the crux
   * @param cy center y coordinate of the crux
   * @param length half the lengh of the crux
   */
  public static crux(context:any, cx:number, cy:number, length:number) {
    this.drawLine(context, [[cx, cy], [cx - length, cy]]);
    this.drawLine(context, [[cx, cy], [cx + length, cy]]);
    this.drawLine(context, [[cx, cy], [cx, cy - length]]);
    this.drawLine(context, [[cx, cy], [cx, cy + length]]);
  }


  /**
   * 
   * @param x x coordinate of the top-left corner
   * @param y y coordinate od the top_left corner
   * @param w width
   * @param h height
   * @param radius radius of the corners
   * @param context canvas' context element
   * @param opacity between 0 and 1
   * @param dashline a pattern list [a_0,..., a_n] where a_i represents the number of filled pixels is i%2 == 0
   and the number of empty pixels if i%2 != 0. [] for no dashline.
   */
  public static roundRect(x, y, w, h, radius, context, color_fill='No', color_stroke=string_to_hex('black'), line_width=1, opacity=1, dashline=[]) {
    var r = x + w;
    var b = y + h;
    context.setLineDash(dashline);
    context.fillStyle = color_fill;
    context.strokeStyle = color_stroke;
    context.lineWidth = line_width;
    context.globalAlpha = opacity;

    context.moveTo(x+radius, y);
    context.lineTo(r-radius, y);
    context.quadraticCurveTo(r, y, r, y+radius);
    context.lineTo(r, y+h-radius);
    context.quadraticCurveTo(r, b, r-radius, b);
    context.lineTo(x+radius, b);
    context.quadraticCurveTo(x, b, x, b-radius);
    context.lineTo(x, y+radius);
    context.quadraticCurveTo(x, y, x+radius, y);

    if (color_fill != 'No') { context.fill(); }
    if (color_stroke != 'No') { context.stroke(); }
    context.globalAlpha = 1;
    context.setLineDash([]);
  }


  /**
   * @returns true if (x, y) is in the rectangle, false otherwise
   * @param x the point's x coordinate
   * @param y the point's y coordinate
   * @param rect_x the rectangle's top_left x coordinate
   * @param rect_y the rectangle's top-left y coordinate
   * @param rect_w the rectangle's width
   * @param rect_h the rectangle's height
   */
  public static isInRect(x, y, rect_x, rect_y, rect_w, rect_h) {
    if (rect_w>=0 && rect_h>=0) {
      return ((x>=rect_x) && (x<= rect_x + rect_w) && (y>=rect_y) && (y<=rect_y + rect_h));
    } else if (rect_w<0 && rect_h>0) {
      return ((x >= rect_x + rect_w) && (x <= rect_x) && (y >= rect_y) && (y <= rect_y + rect_h));
    } else if (rect_w>0 && rect_h<0) {
      return ((x>=rect_x) && (x<=rect_x + rect_w) && (y>=rect_y + rect_h) && (y<=rect_y));
    } else {
      return ((x>=rect_x + rect_w) && (x<=rect_x) && (y>=rect_y + rect_h) && (y<=rect_y));
    }
  }

  public static createButton(x, y, w, h, context, text, police) {
    context.beginPath();
    context.fillStyle = 'white';
    context.lineWidth = "3";
    context.rect(x,y,w,h);
    context.stroke();
    context.fill();
    context.closePath();
    context.beginPath();
    context.fillStyle = "black"
    context.textAlign = "center";
    context.textBaseline = 'middle';
    context.font = police;
    context.fillText(text, x+w/2, y+h/2);
    context.fill();
    context.closePath();
  }

  public static createGraphButton(x, y, w, h, context, text, police, color_fill, strikeout) {
    context.beginPath();
    context.fillStyle = color_fill;
    context.rect(x,y,w,h);
    context.fill();
    context.closePath();
    context.beginPath();
    context.fillStyle = 'grey';
    context.textAlign = 'start';
    context.textBaseline = 'middle';
    context.font = police;
    context.fillText(text, x+w + 5, y+h/1.8);
    context.fill();
    if (strikeout === true) {
      var text_w = context.measureText(text).width;
      context.lineWidth = 1.5;
      context.strokeStyle = 'grey';
      Shape.drawLine(context, [[x+w + 5, y+h/1.8], [x+w+5+text_w, y+h/2]]);
      context.stroke();
    }
    context.closePath();
  }

  /**
   * Draws a rectangle on canvas.
   * @param x the rectangle's top-left x coordinate
   * @param y the rectangle's top-left y coordinate
   * @param w the rectangle's width
   * @param h the rectangle's height
   * @param context canvas' context
   * @param color_fill the rectangle's fill color. Can be set to 'No' if the rectangle
   doesn't have to be filled.
   * @param color_stroke its stroke color. It can be set to 'No' if a contour isn't needed.
   * @param line_width its contour's line width.
   * @param opacity The opacity inside (from 0 to 1).
   * @param dashline contour's dashline ([] for no dashline). A pattern list [a_0,..., a_n] where a_i represents the number of filled pixels is i%2 == 0
   and the number of empty pixels if i%2 != 0. 
   */
  public static rect(x, y, w, h, context, color_fill='No', color_stroke=string_to_hex('black'), line_width=1, opacity=1, dashline=[]) {
    context.beginPath();
    context.setLineDash(dashline);
    context.fillStyle = color_fill;
    context.strokeStyle = color_stroke;
    context.lineWidth = line_width;
    context.globalAlpha = opacity;
    context.rect(x,y,w,h);
    if (color_fill != 'No') { context.fill(); }
    if (color_stroke != 'No') { context.stroke(); }
    context.closePath();
    context.globalAlpha = 1;
    context.setLineDash([]);
  }

  /**
   * 
   * @param x The point's x coordinate
   * @param y The point's y coordinate
   * @param cx The circle's center x-coordinate
   * @param cy Thre circle's center y-coordinate
   * @param r The circle's radius
   */
  public static isInCircle(x, y, cx, cy, r) {
    var delta_x2 = Math.pow(x - cx, 2);
    var delta_y2 = Math.pow(y - cy, 2);
    var distance = Math.sqrt(delta_x2 + delta_y2);
    return distance <= r;
  }
}

export function drawLines(ctx, pts, first_elem) {
  if (first_elem) ctx.moveTo(pts[0], pts[1]);
  for(var i=2; i<pts.length-1; i+=2) ctx.lineTo(pts[i], pts[i+1]);
}


export function getCurvePoints(pts, tension, isClosed, numOfSegments) {

  // use input value if provided, or use a default value
  tension = (typeof tension != 'undefined') ? tension : 0.5;
  isClosed = isClosed ? isClosed : false;
  numOfSegments = numOfSegments ? numOfSegments : 16;

  var _pts = [], res = [],    // clone array
      x, y,           // our x,y coords
      t1x, t2x, t1y, t2y, // tension vectors
      c1, c2, c3, c4,     // cardinal points
      st, t, i;       // steps based on num. of segments

  // clone array so we don't change the original
  //
  _pts = pts.slice(0);

  // The algorithm require a previous and next point to the actual point array.
  // Check if we will draw closed or open curve.
  // If closed, copy end points to beginning and first points to end
  // If open, duplicate first points to befinning, end points to end
  if (isClosed) {
      _pts.unshift(pts[pts.length - 1]);
      _pts.unshift(pts[pts.length - 2]);
      _pts.unshift(pts[pts.length - 1]);
      _pts.unshift(pts[pts.length - 2]);
      _pts.push(pts[0]);
      _pts.push(pts[1]);
  }
  else {
      _pts.unshift(pts[1]);   //copy 1. point and insert at beginning
      _pts.unshift(pts[0]);
      _pts.push(pts[pts.length - 2]); //copy last point and append
      _pts.push(pts[pts.length - 1]);
  }

  // ok, lets start..

  // 1. loop goes through point array
  // 2. loop goes through each segment between the 2 pts + 1e point before and after
  for (i=2; i < (_pts.length - 4); i+=2) {
      for (t=0; t <= numOfSegments; t++) {

          // calc tension vectors
          t1x = (_pts[i+2] - _pts[i-2]) * tension;
          t2x = (_pts[i+4] - _pts[i]) * tension;

          t1y = (_pts[i+3] - _pts[i-1]) * tension;
          t2y = (_pts[i+5] - _pts[i+1]) * tension;

          // calc step
          st = t / numOfSegments;

          // calc cardinals
          c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1;
          c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
          c3 =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st;
          c4 =       Math.pow(st, 3)  -     Math.pow(st, 2);

          // calc x and y cords with common control vectors
          x = c1 * _pts[i]    + c2 * _pts[i+2] + c3 * t1x + c4 * t2x;
          y = c1 * _pts[i+1]  + c2 * _pts[i+3] + c3 * t1y + c4 * t2y;

          //store points in array
          res.push(x);
          res.push(y);

      }
  }

  return res;
}

var nextCol = 1;
export function genColor(){
  var ret = [];
  // via http://stackoverflow.com/a/15804183
  if(nextCol < 16777215){
    ret.push(nextCol & 0xff); // R
    ret.push((nextCol & 0xff00) >> 8); // G
    ret.push((nextCol & 0xff0000) >> 16); // B

    nextCol += 20;
  }
  var col = "rgb(" + ret.join(',') + ")";
  return col;
}


export const string_to_hex_dict = {red:'#f70000', lightred:'#ed8080', blue:'#0013fe', lightblue:'#c3e6fc', lightskyblue:'#87cefa', green:'#00c112', lightgreen:'#89e892', yellow:'#f4ff00', lightyellow:'#f9ff7b', orange:'#ff8700',
  lightorange:'#ff8700', cyan:'#13f0f0', lightcyan:'#90f7f7', rose:'#ff69b4', lightrose:'#ffc0cb', violet:'#ee82ee', lightviolet:'#eaa5f6', white:'#ffffff', black:'#000000', brown:'#cd8f40',
  lightbrown:'#deb887', grey:'#a9a9a9', lightgrey:'#d3d3d3'};

function reverse_string_to_hex_dict() {
  var entries = Object.entries(string_to_hex_dict);
  for (let i=0; i<entries.length; i++) {
    entries[i].reverse();
  }
  return Object.fromEntries(entries);
}

export const hex_to_string_dict = reverse_string_to_hex_dict();

function get_rgb_to_string_dict() {
  var entries = Object.entries(hex_to_string_dict);
  for (let i=0; i<entries.length; i++) {
    entries[i][0] = hex_to_rgb(entries[i][0]);
  }
  return Object.fromEntries(entries);
}
export const rgb_to_string_dict = get_rgb_to_string_dict();

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgb_to_hex(rgb:string): string {
  var tokens = rgb.slice(4, rgb.length - 1).split(',');
  var r = parseInt(tokens[0],10);
  var g = parseInt(tokens[1],10);
  var b = parseInt(tokens[2],10);
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function isColorInDict(str:string): boolean {
  var colors = Object.keys(string_to_hex_dict);
  return colors.includes(str);
}

export function hex_to_string(hexa:string): string {
  if (!Object.keys(hex_to_string_dict).includes(hexa)) { throw new Error('hex_to_string -> Invalid color : ' + hexa + ' is not in list'); }
  return hex_to_string_dict[hexa];
}

export function hexToRgbObj(hex):Object { // Returns an object {r: ..., g: ..., b: ...}
  // var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var result = [hex[1]+hex[2], hex[3]+hex[4], hex[5]+hex[6]];
  return result ? {
    r: parseInt(result[0], 16),
    g: parseInt(result[1], 16),
    b: parseInt(result[2], 16)
  } : null;
}

export function hex_to_rgb(hex:string): string {
  // var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var result = [hex[1]+hex[2], hex[3]+hex[4], hex[5]+hex[6]];
  var r = parseInt(result[0], 16);
  var g = parseInt(result[1], 16);
  var b = parseInt(result[2], 16);
  return rgb_vectorToStr(r, g, b);
}

export function string_to_hex(str:string): string {
  if (!Object.keys(string_to_hex_dict).includes(str)) {throw new Error('string_to_hex -> Invalid color : ' + str + ' not in list');}
  return string_to_hex_dict[str];
}

export function rgb_to_string(rgb:string): string {
  if (rgb_to_string_dict[rgb]) return rgb_to_string_dict[rgb];
  // otherwise, returns the closest color
  var min_dist = Infinity;
  var closest_string = '';
  var rgb_vect = rgb_strToVector(rgb);
  for (let dict_rgb of Object.keys(rgb_to_string_dict)) {
    let dict_rgb_vect = rgb_strToVector(dict_rgb);
    let distance = Math.sqrt(Math.pow(rgb_vect[0] - dict_rgb_vect[0], 2) +
                             Math.pow(rgb_vect[1] - dict_rgb_vect[1], 2) +
                             Math.pow(rgb_vect[2] - dict_rgb_vect[2], 2));
    if (distance < min_dist) {
      closest_string = rgb_to_string_dict[dict_rgb];
      min_dist = distance;
    }
  }
  return closest_string;
}

export function string_to_rgb(str:string) {
  return hex_to_rgb(string_to_hex(str));
}

export function color_to_string(color:string): string {
  if (isHex(color)) {
    return hex_to_string(color);
  } else if (isRGB(color)) {
    return rgb_to_string(color);
  } else {
    return color;
  }
  // else if (isColorInDict(color)) {
  //   return color;
  // }
  throw new Error('color_to_string : ' + color + ' is not in hex neither in rgb');
}

export function average_color(rgb1:string, rgb2:string): string {
  var rgb_vect1 = rgb_strToVector(rgb1);
  var rgb_vect2 = rgb_strToVector(rgb2);
  var new_r = (rgb_vect1[0] + rgb_vect2[0])/2;
  var new_g = (rgb_vect1[1] + rgb_vect2[1])/2;
  var new_b = (rgb_vect1[2] + rgb_vect2[2])/2;
  return rgb_vectorToStr(new_r, new_g, new_b);
}

export function rgb_interpolation([r1, g1, b1], [r2, g2, b2], n:number): string[] {
  var color_list = [];
  for (var k=0; k<n; k++) {
    var r = Math.floor(r1*(1-k/n) + r2*k/n);
    var g = Math.floor(g1*(1-k/n) + g2*k/n);
    var b = Math.floor(b1*(1-k/n) + b2*k/n);
    color_list.push(rgb_vectorToStr(r,g,b));
  }
  return color_list;
}

export function rgb_interpolations(rgbs:[number, number, number][], nb_pts:number): string[] {
  var nb_seg = rgbs.length - 1;
  var arr = [];
  var color_list = [];
  for (var i=0; i<nb_seg; i++) {arr.push(0);}
  for (var i=0; i<nb_pts; i++) {
    arr[i%nb_seg]++;
  }
  for (let i=0; i<nb_seg; i++) {
    var interpolation_colors = rgb_interpolation(rgbs[i], rgbs[i+1], arr[i]);
    for (let j=0; j<interpolation_colors.length; j++) {
      color_list.push(interpolation_colors[j]);
    }
  }
  return color_list;
}

export function rgb_strToVector(rgb:string): [number, number, number] {
  var tokens = rgb.slice(4, rgb.length - 1).split(',');
  var r = parseInt(tokens[0],10);
  var g = parseInt(tokens[1],10);
  var b = parseInt(tokens[2],10);
  return [r,g,b];
}

export function rgb_vectorToStr(r:number, g:number, b:number): string {
  return 'rgb(' + r.toString() + ',' + g.toString() + ',' + b.toString() + ')';
}

export function tint_rgb(rgb:string, coeff:number): string { //coeff must be between 0 and 1. The higher coeff, the lighter the color
  var result = rgb_strToVector(rgb);
  var r = result[0] + (255 - result[0])*coeff;
  var g = result[1] + (255 - result[1])*coeff;
  var b = result[2] + (255 - result[2])*coeff;
  return rgb_vectorToStr(r,g,b);
}

export function darken_rgb(rgb: string, coeff:number) { //coeff must be between 0 ans 1. The higher the coeff, the darker the color
  var result = rgb_strToVector(rgb);
  var r = result[0]*(1 - coeff);
  var g = result[1]*(1 - coeff);
  var b = result[2]*(1 - coeff);
  return rgb_vectorToStr(r,g,b);
}


/**
 * A class for sorting lists.
 */
export class Sort {
  nbPermutations:number = 0;
  constructor(){};

  MergeSort(items: number[]): number[] {
    return this.divide(items);
  }

  divide(items: number[]): number[] {
    var halfLength = Math.ceil(items.length / 2);
    var low = items.slice(0, halfLength);
    var high = items.slice(halfLength);
    if (halfLength > 1) {
        low = this.divide(low);
        high = this.divide(high);
    }
    return this.combine(low, high);
  }

  combine(low: number[], high: number[]): number[] {
    var indexLow = 0;
    var indexHigh = 0;
    var lengthLow = low.length;
    var lengthHigh = high.length;
    var combined = [];
    while (indexLow < lengthLow || indexHigh < lengthHigh) {
        var lowItem = low[indexLow];
        var highItem = high[indexHigh];
        if (lowItem !== undefined) {
            if (highItem === undefined) {
                combined.push(lowItem);
                indexLow++;
            } else {
                if (lowItem <= highItem) {
                    combined.push(lowItem);
                    indexLow++;
                } else {
                    combined.push(highItem);
                    this.nbPermutations = this.nbPermutations + lengthLow - indexLow;
                    indexHigh++;
                }
            }
        } else {
            if (highItem !== undefined) {
                combined.push(highItem);
                indexHigh++;
            }
        }
    }
    return combined;
  }

  sortObjsByAttribute(list:any[], attribute_name:string): any[] {
    if (!List.is_include(attribute_name, Object.getOwnPropertyNames(list[0]))) {
      throw new Error('sortObjsByAttribute : ' + attribute_name + ' is not a property of the object')
    }
    var attribute_type = TypeOf(list[0][attribute_name]);
    var list_copy = Array.from(list);
    if (attribute_type == 'float') {
      for (let i=0; i<list_copy.length-1; i++) {
        let min = i;
        let min_value = list_copy[i][attribute_name];
        for (let j=i+1; j<list_copy.length; j++) {
          let current_value = list_copy[j][attribute_name];
          if (current_value < min_value) {
            min = j;
            min_value = current_value;
          }
        }
        if (min != i) {
          list_copy = List.move_elements(min, i, list_copy);
        }
      }
      return list_copy;
    } else { // ie color or string
      let strings = [];
      for (let i=0; i<list_copy.length; i++) {
        if (!List.is_include(list_copy[i][attribute_name], strings)) {
          strings.push(list_copy[i][attribute_name]);
        }
      }
      let sorted_list = [];
      for (let i=0; i<strings.length; i++) {
        for (let j=0; j<list_copy.length; j++) {
          if (strings[i] === list_copy[j][attribute_name]) {
            sorted_list.push(list_copy[j]);
          }
        }
      }
      return sorted_list;
    }
  }

}

export function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    var cur, memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr, undefined);
}

export function TypeOf(element:any):string {
  var type_ = typeof element;
  if (type_ == 'number') {
    return 'float';
  } else if (type_ == 'string') {
    if (isHex(element) || isRGB(element)) {
      return 'color';
    }
  }
  return 'string';
}

export function isRGB(str:string):boolean {
  return str.substring(0,4) == 'rgb(';
}

export function isHex(str:string):boolean {
  return str.substring(0,1) == '#';
}


/**
 * A toolbox with useful functions that manipulate arrays.
 */
export class List {
  // public static sort_without_duplicates(list:number[]) {
  //   if (list.length == 0) return list;
  //   var sort = new Sort();
  //   var sorted = sort.MergeSort(list);
  //   var no_duplicates = [list[0]];
  //   var current_elt = sorted[0];
  //   for (let val of sorted) {
  //     if (val>current_elt) {
  //       current_elt = val;
  //       no_duplicates.push(val);
  //     }
  //   }
  //   return no_duplicates
  // }

  /**
   * @returns the input list without its duplicates.
   */
  public static remove_duplicates(list:any[]) {
    var seen = {};
    var out = [];
    var len = list.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
      var item = list[i];
      if(seen[item] !== 1) {
            seen[item] = 1;
            out[j++] = item;
      }
    }
    return out;
  }

  /**
   * @returns true if the list contains a undefined element, false otherwise.
   */
  public static contains_undefined(list:any[]):boolean {
    for (var i=0; i<list.length; i++) {
      if (typeof list[i] === "undefined") {
        return true;
      }
    }
    return false;
  }


  public static copy(list:any[]): any[] {
    var new_list = [];
    for (var i=0; i<list.length; i++) {
      new_list.push(list[i]);
    }
    return new_list;
    // return Array.from(list);
  }


  /**
   * @returns a the input list without the first element equal to val.
   */
  public static remove_first_selection(val:any, list:any[]): any[] { //remove the first occurrence of val in list
    var temp = [];
    var bool = true;
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if ((val != d) && bool) {
        temp.push(d);
        bool = false;
      }
    }
    return temp;
  }


  /**
   * Compares two lists by comparing their elements using ===
   */
  public static equals(list1, list2) {
    if (list1.length != list2.length) { return false; }
    for (let i=0; i<list1.length; i++) {
      if (list1[i] !== list2[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * @returns The input list without all instances of val.
   */
  public static remove_element(val:any, list:any[]): any[] { //remove every element=val from list
    return list.filter(elt => elt !== val);
  }

  /**
   * @returns true or false whether val is inside list or not. It uses a generic equals function
   */
  public static is_include(val:any, list:any[]): boolean {
    return list.findIndex(elt => equals(elt, val)) !== -1;
  }

  /**
   * @returns true or false whether a list is inside an array of list. It uses a generic equals function.
   */
  public static is_list_include(list:any[], listArray:any[][]) { //check if a list is inside a list of lists
    for (let i=0; i<listArray.length; i++) {
        if (this.equals(listArray[i], list)) {
            return true;
        }
    }
    return false;
  }

  /**
   * Provided that obj_list is a list of objects (ie. dictionary is TS), it returns true if a element
   of obj_list has an attribute 'name' equal to the input name, and false otherwise.
   */
  public static is_name_include(name:string, obj_list:any[]): boolean {
    for (let i=0; i<obj_list.length; i++) {
      if (name === obj_list[i].name) {
        return true;
      }
    }
    return false;
  }


  /**
   * @returns [min, max] of the input list
   * @param list a list of real numbers
   */
  public static getExtremum(list:number[]): [number, number] { //Get the extremas of the list
    var min = list[0];
    var max = list[0];
    for (let i=0; i<list.length; i++) {
      if (list[i]>max) {
        max = list[i];
      }
      if (list[i]<min) {
        min = list[i];
      }
    }
    return [min, max];
  }


  /**
   * @returns a list where value is inserted at index inside list
   */
  public static insert(value:any, index:number, list:any[]): void {
    list.splice(index, 0, value);
  }


  /**
   * @returns the index of val in list
   */
  public static get_index_of_element(val:any, list:any[]):number {
    var elt_index = list.findIndex(obj => Object.is(obj, val));
    if (elt_index !== -1) {
      return elt_index;
    }
    throw new Error('cannot get index of element')
  }

  /**
   * @returns The input list after removing its element at index i
   */
  public static remove_at_index(i:number, list:any[]):any[] {
    return list.slice(0, i).concat(list.slice(i + 1, list.length));
  }

  public static remove_at_indices(start_index:number, end_index:number, list:any[]):any[] {
    if (start_index > end_index) throw new Error('remove_indices(): start_index must be <= end_index');
    if (start_index<0 || end_index>=list.length) throw new Error('remove_indices(): index out of range');
    for (let i=0; i<=end_index-start_index; i++) {
      list = this.remove_at_index(start_index, list);
    }
    return list;
  }

  /**
   * @returns the input list after removing its element at index old_index and
   * inserting it at new_index
   */
  public static move_elements(old_index:number, new_index:number, list:any[]):any[] {
    var elt = list[old_index];
    if (old_index<new_index) {
      list.splice(new_index+1, 0, elt);
      list = this.remove_at_index(old_index, list);
    } else {
      list.splice(new_index, 0, elt);
      list = this.remove_at_index(old_index + 1, list);
    }
    return list;
  }


  /**
   * Exchanges list's elements at index1 and index2.
   */
  public static switchElements(list:any[], index1:number, index2:number): void {
    [list[index1], list[index2]] = [list[index2], list[index1]];
  }


  public static reverse(list:any[]): any[] {
    return Array.from(list).reverse();
  }

  /**
   * Checks whether list is a list of empty list, ie [[], [],..., []]
   */
  public static isListOfEmptyList(list:any[]): boolean { 
    for (let i=0; i<list.length; i++) {
      if (list[i].length !== 0) {
        return false;
      }
    }
    return true;
  }



  /**
   * @returns A list that contains all elements that are inside both list1 and list2
   */
  public static listIntersection(list1:any[], list2:any[]): any[] {
    // var intersection = [];
    // for (let i=0; i<list1.length; i++) {
    //   if (this.is_include(list1[i], list2)) {
    //     intersection.push(list1[i]);
    //   }
    // }
    // return intersection;
    return list1.filter(value => list2.includes(value));
  }

  /**
   * @returns A list that contains all elements that are inside both list1 and list2. If one list is empty, then it returns the other list.
   */
  public static listIntersectionExceptEmpty(list1:any[], list2:any[]) {
    if (list1.length === 0) return list2;
    if (list2.length === 0) return list1;
    return list1.filter(value => list2.includes(value));
  }


  /**
   * @returns a list that contains list's elements at index <list_index[i].
   ex: getListEltFromIndex([1,2], ['a', 'b', 'c', 'd']) = ['b', 'c']
   */
  public static getListEltFromIndex(list_index:number[], list:any[]): any[] {
    var new_list = [];
    for (let i=0; i<list_index.length; i++) {
      new_list.push(list[list_index[i]]);
    }
    return new_list;
  }


  /**
   * @returns the union of list1 and list2, ie a list that contains elements that are
   inside list1 or list2
   */
  public static union(list1:any[], list2:any[]): any[] {
    var union_list = this.copy(list1);
    for (let i=0; i<list2.length; i++) {
      if (!this.is_include(list2[i], union_list)) {
        union_list.push(list2[i]);
      }
    }
    return union_list;
  } 


  /**
   * @param to_remove a list that contains elements to be removed from list
   */
  public static remove_selection(to_remove:any[], list:any[]): any[] {
    var new_list = Array.from(list);
    for (let val of to_remove) {
      new_list = List.remove_element(val, new_list);
    }
    return new_list;
  }
} //end class List


/**
 * Returns a dictionary containing dict_ + every default_dict_'s keys that dict_ doesn't have.
 * ex: dict_ = {color: red}; default_dict_ = {color: blue, shape: circle}
 * set_default_values(dict_, default_dict_) = {color: red, shape: circle} 
 * @param dict_ the current dictionary
 * @param default_dict_ a list with all default value
 * 
 * @returns the input dictionaries with potential new values
 */
export function set_default_values(dict_, default_dict_) {
  if (dict_ === undefined) {
    dict_ = {};
  }
  var properties_names = Object.getOwnPropertyNames(default_dict_);
  var entries = Object.entries(dict_);
  for (let i=0; i<properties_names.length; i++) {
    let property = properties_names[i];
    if (!dict_.hasOwnProperty(property)) {
      entries.push([property, default_dict_[property]]);
    }
  }
  return Object.fromEntries(entries);
}



export function check_package_version(package_version:string, requirement:string) {
  var version_array = package_version.split('.');
  var requirement_array = requirement.split('.');
  var package_version_num = Number(version_array[0])*Math.pow(10, 4) + Number(version_array[1])*Math.pow(10,2) +
    Number(version_array[2]);
  var requirement_num = Number(requirement_array[0])*Math.pow(10, 4) + Number(requirement_array[1])*Math.pow(10,2) +
    Number(requirement_array[2]);
  if (package_version_num < requirement_num) {
    alert("plot_data's version must be updated. Current version: " + package_version + ", minimum requirement: " + requirement);
  }
}


export class MyObject {

  /**
   * Returns the input dictionary without keys that are in input.
   */
  public static removeEntries(keys:string[], dict_) {
    var entries = Object.entries(dict_);
    var i=0;
    while (i<entries.length) {
      if (List.is_include(entries[i][0], keys)) {
        entries = List.remove_at_index(i, entries);
      } else {
        i++;
      }
    }
    return Object.fromEntries(entries);
  }

  /**
   * A shallow copy.
   */
  public static copy(obj) {
    return Object.assign({}, obj);
  }

  /**
   * A function that clones without references. It handles circular references.
   */
  public static deepClone(obj, hash = new WeakMap()) {
    // Do not try to clone primitives or functions
    if (Object(obj) !== obj || obj instanceof Function) return obj;
    if (hash.has(obj)) return hash.get(obj); // Cyclic reference
    try { // Try to run constructor (without arguments, as we don't know them)
        var result = new obj.constructor();
    } catch(e) { // Constructor failed, create object without running the constructor
        result = Object.create(Object.getPrototypeOf(obj));
    }
    // Optional: support for some standard constructors (extend as desired)
    if (obj instanceof Map)
        Array.from(obj, ([key, val]) => result.set(this.deepClone(key, hash), 
        this.deepClone(val, hash)) );
    else if (obj instanceof Set)
        Array.from(obj, (key) => result.add(this.deepClone(key, hash)) );
    // Register in hash    
    hash.set(obj, result);
    // Clone and assign enumerable own properties recursively
    return Object.assign(result, ...Object.keys(obj).map (
        key => ({ [key]: this.deepClone(obj[key], hash) }) ));
  }

  public static add_properties(obj:Object, ...entries:[string, any][]): Object {
    var obj_entries = Object.entries(obj);
    for (let entry of entries) {
      obj_entries.push(entry);
    }
    return Object.fromEntries(obj_entries);
  }

}

/**
 * A generic equals function that compares values and not references.
 */
export function equals(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equals(a[i], b[i])) return false;
      return true;
    }

    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      var key = keys[i];

      if (!equals(a[key], b[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a!==a && b!==b;
}


const empty_container = {'name': '',
'package_version': '0.5.8',
'primitive_groups': [],
'type_': 'primitivegroupcontainer'};

