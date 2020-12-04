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
  selected_index:number=-1;
  clicked_index_list:number[]=[];
  clickedPlotIndex:number=-1;
  last_index:number=-1;
  manipulation_bool:boolean=false;
  transbutton_x:number=0;
  transbutton_y:number=0;
  transbutton_w:number=0;
  transbutton_h:number=0;
  selectDependency_bool:boolean=false;
  selectDep_x:number=0;
  selectDep_y:number=0;
  selectDep_w:number=0;
  selectDep_h:number=0;
  view_bool:boolean=false;
  view_button_x:number=0;
  view_button_y:number=0;
  view_button_w:number=0;
  view_button_h:number=0;
  initial_objectsX:number[]=[];
  initial_objectsY:number[]=[];
  initial_object_width:number[]=[];
  initial_object_height:number[]=[];
  initial_mouseX:number=0;
  initial_mouseY:number=0;
  sorted_list:number[]=[];
  display_order:number[]=[];


  constructor(public data: any[], public width:number, public height:number, coeff_pixel: number, public buttons_ON: boolean, public canvas_id: string) {
    this.initial_coords = data['coords'];
    this.dataObjects = data['objects'];
    var points = data['points'];
    var temp_sizes = data['sizes'];
    for (let i=0; i<temp_sizes.length; i++) {
      this.sizes.push(Window.deserialize(temp_sizes[i]));
    }

    this.nbObjects = this.dataObjects.length;
    this.define_canvas(canvas_id);
    for (let i=0; i<this.nbObjects; i++) {
      if (this.dataObjects[i]['type_'] == 'scatterplot') {
        this.dataObjects[i]['elements'] = points;
        var newObject:any = new PlotScatter(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], coeff_pixel, buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id, true);
      } else if (this.dataObjects[i]['type_'] == 'parallelplot') {
        this.dataObjects[i]['elements'] = points;
        newObject = new ParallelPlot(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], coeff_pixel, buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id);
      } else if (this.dataObjects[i]['type_'] == 'contourgroup') {
        newObject = new PlotContour(this.dataObjects[i], this.sizes[i]['width'], this.sizes[i]['height'], coeff_pixel, buttons_ON, this.initial_coords[i][0], this.initial_coords[i][1], canvas_id);
      } else {
        throw new Error('MultiplePlots constructor : invalid object type');
      }
      this.initializeObjectContext(newObject);
      this.objectList.push(newObject);
    }
    for (let i=0; i<this.nbObjects; i++) {
      this.objectList[i].draw_initial();
      this.display_order.push(i);
    }
    this.mouse_interaction();

    if (buttons_ON) {
      this.initializeButtons();
      this.draw_buttons();
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
    this.redrawAllObjects();
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
    if (this.view_bool) {
      this.clean_view();
      if (this.manipulation_bool === false) {
        this.manipulation_bool_action();
      }
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
  }

  initializeObjectContext(object:PlotData):void {
    object.context_show = this.context_show;
    object.context_hidden = this.context_hidden;
  }

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

  add_scatterplot(attr_x:Attribute, attr_y:Attribute) {
    var to_disp_attr_name = [attr_x.name, attr_y.name];
    var DEFAULT_AXIS = new Axis(10, 10, 12, string_to_hex('grey'), string_to_hex('grey'), '', false, 0.5, true, 'axis');
    var DEFAULT_TOOLTIP = new Tooltip(string_to_hex('black'), string_to_hex('white'), 12, 'sans-serif', 5, to_disp_attr_name, 0.75, 'tooltip', '');
    var new_scatter = new Scatter(this.data['points'], DEFAULT_AXIS, DEFAULT_TOOLTIP, to_disp_attr_name, 'circle', 2, string_to_hex('lightblue'), string_to_hex('grey'), 0.5, 'scatterplot', '');
    var DEFAULT_WIDTH = 560;
    var DEFAULT_HEIGHT = 300;
    var new_plot_data = new PlotScatter(new_scatter, DEFAULT_WIDTH, DEFAULT_HEIGHT, 1000, this.buttons_ON, 0, 0, this.canvas_id, false);
    this.initializeObjectContext(new_plot_data);
    this.objectList.push(new_plot_data);
    this.nbObjects++;
    this.display_order.push(this.nbObjects-1);
    new_plot_data.draw_initial();
    new_plot_data.mouse_interaction(false);
    new_plot_data.interaction_ON = false;
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
      let isInObject = Shape.isInRect(x, y, this.objectList[display_index].X, this.objectList[display_index].Y, this.objectList[display_index].width, this.objectList[display_index].height);
      if (isInObject === true) {
        index = display_index;
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

  redrawAllObjects():void {
    this.clearAll();
    if (this.clickedPlotIndex != -1) {
      let old_index = List.get_index_of_element(this.clickedPlotIndex, this.display_order);
      this.display_order = List.move_elements(old_index, this.display_order.length - 1, this.display_order);
    }
    for (let i=0; i<this.nbObjects; i++) {
      let display_index = this.display_order[i]; 
      let obj = this.objectList[display_index];
      this.objectList[display_index].draw(false, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
      this.objectList[display_index].draw(true, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
    }
    if (this.buttons_ON) {
      this.draw_buttons();
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

  translateSelectedObject(selected_index, tx, ty):void {
    var obj:PlotData = this.objectList[selected_index]
    obj.X = this.initial_objectsX[selected_index] + tx;
    obj.Y = this.initial_objectsY[selected_index] + ty;
    this.redrawAllObjects();
  }

  setAllInteractionsToOff():void {
    for (let i=0; i<this.nbObjects; i++) {
      this.objectList[i].interaction_ON = false;
    }
  }

  setAllInterpolationToOFF(): void {
    for (let i=0; i<this.nbObjects; i++) {
      this.objectList[i].sc_interpolation_ON = false;
    }
  }

  manipulation_bool_action():void {
    this.manipulation_bool = !this.manipulation_bool;
    for (let i=0; i<this.nbObjects; i++) {
      this.objectList[i].manipulable_ON = this.manipulation_bool;
    }
    this.selectDependency_bool = false;
    if (this.manipulation_bool === false) {
      this.view_bool = false;
    }
  }

  selectDep_action():void {
    this.selectDependency_bool = !this.selectDependency_bool;
    this.manipulation_bool = false;
    this.view_bool = false;
    for (let i=0; i<this.nbObjects; i++) {
      this.objectList[i].manipulable_ON = this.manipulation_bool;
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
      if (equals(resize_style.split('').sort(), resize_dict[i].split('').sort())) {
        resize_style = resize_dict[i];
        break;
      }
    }
    return resize_style;
  }

  setCursorStyle(mouse2X, mouse2Y, canvas):void {
    if (this.selected_index != -1) {
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
        canvas.style.cursor = 'default';
      } else {
        resize_style = this.reorder_resize_style(resize_style);
        canvas.style.cursor = resize_style + '-resize';
      }
    } else {
      canvas.style.cursor = 'default';
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
      }
    }
  }

  getSortedList() {
    var big_coord = 'X';
    var small_coord = 'Y';
    if (this.width < this.height) {[big_coord, small_coord] = [small_coord, big_coord];}
    var sort = new Sort();
    var sortedObjectList = sort.sortObjsByAttribute(this.objectList, big_coord);
    var sorted_list = [];
    for (let i=0; i<this.nbObjects; i++) {
      sorted_list.push(List.get_index_of_element(sortedObjectList[i], this.objectList));
    }
    var j = 0;
    while (j<this.nbObjects - 1) {
      if (sortedObjectList[j+1][small_coord] < sortedObjectList[j][small_coord]) {
        List.switchElements(sorted_list, j, j+1);
      }
      j = j+2;
    }
    return sorted_list;
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
    let small_length_nbObjects = Math.min(Math.ceil(this.nbObjects/2), 2);
    let big_length_nbObjects = Math.ceil(this.nbObjects/small_length_nbObjects);
    let big_length_step = this[big_length]/big_length_nbObjects;
    let small_length_step = this[small_length]/small_length_nbObjects;
    for (let i=0; i<big_length_nbObjects - 1; i++) {
      for (let j=0; j<small_length_nbObjects; j++) {
        var current_index = i*small_length_nbObjects + j; //current_index in sorted_list
        this.objectList[this.sorted_list[current_index]][big_coord] = i*big_length_step;
        this.objectList[this.sorted_list[current_index]][small_coord] = j*small_length_step;
        this.objectList[this.sorted_list[current_index]][big_length] = big_length_step;
        this.objectList[this.sorted_list[current_index]][small_length] = small_length_step;
      }
    }
    let last_index = current_index + 1;
    let remaining_obj = this.nbObjects - last_index;
    let last_small_length_step = this[small_length]/remaining_obj;
    for (let j=0; j<remaining_obj; j++) {
      this.objectList[this.sorted_list[last_index + j]][big_coord] = (big_length_nbObjects - 1)*big_length_step;
      this.objectList[this.sorted_list[last_index + j]][small_coord] = j*last_small_length_step;
      this.objectList[this.sorted_list[last_index + j]][big_length] = big_length_step;
      this.objectList[this.sorted_list[last_index + j]][small_length] = last_small_length_step;
    }
    this.resetAllObjects();
    this.redrawAllObjects();
  }

  resizeObject(vertex_infos, mouse2X, mouse2Y):void {
    var widthSizeLimit = 100;
    var heightSizeLimit = 100;
    var deltaX = mouse2X - this.initial_mouseX;
    var deltaY = mouse2Y - this.initial_mouseY;
    for (let i=0; i<vertex_infos.length; i++) {
      let vertex_object_index = vertex_infos[i].index;
      var obj:PlotData = this.objectList[vertex_object_index];
      if (vertex_infos[i].up === true) {
        if (this.initial_object_height[vertex_object_index] - deltaY > heightSizeLimit) {
          this.objectList[vertex_object_index].Y = this.initial_objectsY[vertex_object_index] + deltaY;
          this.objectList[vertex_object_index].height = this.initial_object_height[vertex_object_index] - deltaY;
        } else {
          this.objectList[vertex_object_index].height = heightSizeLimit;
        }
      }
      if (vertex_infos[i].down === true) {
        if (this.initial_object_height[vertex_object_index] + deltaY > heightSizeLimit) {
          this.objectList[vertex_object_index].height = this.initial_object_height[vertex_object_index] + deltaY;
        } else {
          this.objectList[vertex_object_index].height = heightSizeLimit;
        }
      }
      if (vertex_infos[i].left === true) {
        if (this.initial_object_width[vertex_object_index] - deltaX > widthSizeLimit) {
          this.objectList[vertex_object_index].X = this.initial_objectsX[vertex_object_index] + deltaX;
          this.objectList[vertex_object_index].width = this.initial_object_width[vertex_object_index] - deltaX;
        } else {
          this.objectList[vertex_object_index].width = widthSizeLimit;
        }
      }
      if (vertex_infos[i].right === true) {
        if (this.initial_object_width[vertex_object_index] + deltaX > widthSizeLimit) {
          this.objectList[vertex_object_index].width = this.initial_object_width[vertex_object_index] + deltaX;
        } else {
          this.objectList[vertex_object_index].width = widthSizeLimit;
        }
      }
    }
    this.redrawAllObjects();
  }

  getSelectionONObject():number {
    for (let i=0; i<this.nbObjects; i++) {
      if (this.objectList[i].isSelecting === true) {
        return i;
      }
    }
    return -1;
  }

  scatter_communication(selection_coords:[number, number][], toDisplayAttributes:Attribute[], isSelectingObjIndex:number):void { //process received data from a scatterplot and send it to the other objects
    for (let i=0; i<selection_coords.length; i++) {
      for (let j=0; j<this.nbObjects; j++) {
        if (this.objectList[j]['type_'] == 'parallelplot') {
          let obj = this.objectList[j];
          for (let k=0; k<obj.axis_list.length; k++) {
            if (toDisplayAttributes[i]['name'] == obj.axis_list[k]['name']) {
              MultiplotCom.sc_to_pp_communication(selection_coords[i], toDisplayAttributes[i], k, this.objectList[j]);
              this.objectList[j].draw(false, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
              this.objectList[j].draw(true, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
            }
          }
        }
      }
    }

    for (let i=0; i<this.nbObjects; i++) {
      if ((this.objectList[i]['type_'] == 'scatterplot') && (i != isSelectingObjIndex)) {
        MultiplotCom.sc_to_sc_communication(selection_coords, toDisplayAttributes, this.objectList[i]);
        let obj = this.objectList[i];
        this.objectList[i].draw(false, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
        this.objectList[i].draw(true, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
      }
    }
  }

  pp_communication(rubberbands_dep:[string, [number, number]][]):void { //process received data from a parallelplot and send it to the other objects
    for (let i=0; i<this.nbObjects; i++) {
      var obj:PlotData = this.objectList[i];
      var axis_numbers:number[] = [];
      if (obj.type_ == 'scatterplot') {
        var to_select:[string, [number, number]][] = [];
        for (let j=0; j<rubberbands_dep.length; j++) {
          for (let k=0; k<obj.plotObject.toDisplayAttributes.length; k++) {
            if (rubberbands_dep[j][0] == obj.plotObject.toDisplayAttributes[k]['name']) {
              to_select.push(rubberbands_dep[j]);
              axis_numbers.push(k);
            }
          }
        }
        MultiplotCom.pp_to_sc_communication(to_select, axis_numbers, this.objectList[i]);
      } else { //ie type_ == 'parallelplot'
        MultiplotCom.pp_to_pp_communication(rubberbands_dep, this.objectList[i]);
      }
    }
    this.redrawAllObjects();
  }

  dependency_color_propagation(selected_axis_name:string, vertical:boolean, inverted:boolean, hexs: string[]):void {
    for (let i=0; i<this.nbObjects; i++) {
      let obj = this.objectList[i];
      if (obj.type_ == 'scatterplot') {
        let toDisplayAttributes = obj.plotObject.toDisplayAttributes;
        let attribute_index = -1;
        for (let j=0; j<toDisplayAttributes.length; j++) {
          if (toDisplayAttributes[j].name == selected_axis_name) {
            attribute_index = j;
          }
        }
        obj.dep_color_propagation(attribute_index, vertical, inverted, hexs, selected_axis_name);
        obj.sc_interpolation_ON = true;
      } 
    }
  }

  manage_mouse_interactions(mouse2X:number, mouse2Y:number):void {
    this.selected_index = this.getLastObjectIndex(mouse2X, mouse2Y);
    if (this.selected_index != this.last_index) {
      for (let i=0; i<this.nbObjects; i++) {
        if (i == this.selected_index) {
          this.objectList[i].interaction_ON = true;
        } else {
          this.objectList[i].interaction_ON = false;
        }
      }
      this.last_index = this.selected_index;
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
      this.objectList[i].X = mouse3X + zoom_coeff*(this.objectList[i].X - mouse3X);
      this.objectList[i].Y = mouse3Y + zoom_coeff*(this.objectList[i].Y - mouse3Y);
      this.objectList[i].width = this.objectList[i].width*zoom_coeff;
      this.objectList[i].height = this.objectList[i].height*zoom_coeff;
    }
    this.resetAllObjects();
  }

  translateAllObjects(mouse1X:number, mouse1Y:number, mouse2X:number, mouse2Y:number) {
    for (let i=0; i<this.nbObjects; i++) {
      this.objectList[i].X = this.initial_objectsX[i] + mouse2X - mouse1X;
      this.objectList[i].Y = this.initial_objectsY[i] + mouse2Y - mouse1Y;
    }
    this.redrawAllObjects();
  }

  mouse_interaction(): void {
    var canvas = document.getElementById(this.canvas_id);
    var mouse1X:number = 0;
    var mouse1Y:number = 0;
    var mouse2X:number = 0;
    var mouse2Y:number = 0;
    var mouse3X:number = 0;
    var mouse3Y:number = 0;
    var isDrawing = false;
    var mouse_moving:boolean = false;
    var vertex_infos:Object;
    var clickOnVertex:boolean = false;

    for (let i=0; i<this.nbObjects; i++) {
      this.objectList[i].mouse_interaction(this.objectList[i].isParallelPlot);
    }
    this.setAllInteractionsToOff();

    canvas.addEventListener('mousedown', e => {
      isDrawing = true;
      mouse1X = e.offsetX;
      mouse1Y = e.offsetY;
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
    });

    canvas.addEventListener('mousemove', e => {
      mouse2X = e.offsetX;
      mouse2Y = e.offsetY;
      if (this.manipulation_bool) {
        if (isDrawing) {
          mouse_moving = true;
          if ((this.clickedPlotIndex != -1) && !(clickOnVertex)) {
            this.setAllInteractionsToOff();
            let tx = mouse2X - mouse1X;
            let ty = mouse2Y - mouse1Y;
            canvas.style.cursor = 'move';
            this.translateSelectedObject(this.clickedPlotIndex, tx, ty);
          } else if (this.clickedPlotIndex == -1) {
            this.translateAllObjects(mouse1X, mouse1Y, mouse2X, mouse2Y);
          } else if (clickOnVertex) {
            this.resizeObject(vertex_infos, mouse2X, mouse2Y);
          }
          if (this.view_bool === true) {
            let refreshed_sorted_list = this.getSortedList();
            if (!equals(this.sorted_list, refreshed_sorted_list)) {
              this.clean_view();
            }
          }
        } else {
          this.selected_index = this.getLastObjectIndex(mouse2X, mouse2Y);
          this.setCursorStyle(mouse2X, mouse2Y, canvas);
        }
      } else {
        this.manage_mouse_interactions(mouse2X, mouse2Y);
        if (isDrawing) {
          mouse_moving = true;
          if (this.selectDependency_bool) {
            let isSelectingObjIndex = this.getSelectionONObject();
            if (isSelectingObjIndex != -1) {
              let isSelectingScatter = this.objectList[isSelectingObjIndex];
              let selection_coords = isSelectingScatter.selection_coords;
              let toDisplayAttributes:Attribute[] = isSelectingScatter.plotObject.toDisplayAttributes;
              this.scatter_communication(selection_coords, toDisplayAttributes, isSelectingObjIndex);
            }
            let isDrawingRubberObjIndex = this.get_drawing_rubberbands_obj_index();
            if (isDrawingRubberObjIndex != -1) {
              let isDrawingPP = this.objectList[isDrawingRubberObjIndex];
              let rubberbands_dep = isDrawingPP.rubberbands_dep;
              this.pp_communication(rubberbands_dep);
            }
          }
        }
        this.redrawAllObjects(); 
      }
    });

    canvas.addEventListener('mouseup', e => {
      mouse3X = e.offsetX;
      mouse3Y = e.offsetY;
      var click_on_manip_button = Shape.isInRect(mouse3X, mouse3Y, this.transbutton_x, this.transbutton_y, this.transbutton_w, this.transbutton_h);
      var click_on_selectDep_button = Shape.isInRect(mouse3X, mouse3Y, this.selectDep_x, this.selectDep_y, this.selectDep_w, this.selectDep_h);
      var click_on_view = Shape.isInRect(mouse3X, mouse3Y, this.view_button_x, this.view_button_y, this.view_button_w, this.view_button_h);
      var click_on_button = click_on_manip_button || click_on_selectDep_button || click_on_view;
      console.log(click_on_manip_button, click_on_selectDep_button, click_on_view)
      if (click_on_button) {
        this.click_on_button_action(click_on_manip_button, click_on_selectDep_button, click_on_view);
      }

      if (mouse_moving === false) {
        if (this.selectDependency_bool) {
          var selected_axis_name: string; var vertical: boolean;  var inverted: boolean;
          var hexs: string[]; var isSelectingppAxis: boolean;
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
          }
        }
      } else {
        if (this.view_bool) {
          this.clean_view();
        }
      }
      this.redrawAllObjects();
      isDrawing = false;
      mouse_moving = false;
    });

    canvas.addEventListener('wheel', e => {
      var mouse3X = e.offsetX;
      var mouse3Y = e.offsetY;
      var event = -e.deltaY/Math.abs(e.deltaY);
      if (this.manipulation_bool && !this.view_bool) {
        this.zoom_elements(mouse3X, mouse3Y, event);
      }
      this.redrawAllObjects();
    });

    canvas.addEventListener('mouseleave', e => {
      isDrawing = false;
      mouse_moving = false;
    });
  }
}

export abstract class PlotData {
  type_:string;
  context_show:any;
  context_hidden:any;
  context:any;
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
  initial_last_mouse1X:number=0;
  initial_last_mouse1Y:number=0;
  last_mouse1X:number;
  last_mouse1Y:number;
  colour_to_plot_data:any={};
  select_on_mouse:any;
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
  isParallelPlot:boolean;
  interaction_ON:boolean = true;
  x_nb_digits:number = 0;
  y_nb_digits:number = 0;
  manipulable_ON:boolean=false;
  fusion_coeff:number=1.2;

  plotObject:any;
  plot_datas:object={};
  tooltip_list:any[]=[];
  zoom_rect_x:number=0;
  zoom_rect_y:number=0;
  zoom_rect_w:number=0;
  zoom_rect_h:number=0;
  zw_bool:boolean=false;
  zw_x:number=0;
  zw_y:number=0;
  zw_w:number=0;
  zw_h:number=0;
  reset_rect_x:number=0;
  reset_rect_y:number=0;
  reset_rect_w:number=0;
  reset_rect_h:number=0;
  select_bool:boolean=false;
  select_x:number=0;
  select_y:number=0;
  select_w:number=0;
  select_h:number=0;
  sort_list_points:any[]=[];
  graph_to_display:boolean[]=[];
  graph1_button_x:number=0;
  graph1_button_y:number=0;
  graph1_button_w:number=0;
  graph1_button_h:number=0;
  nb_graph:number = 0;
  mergeON:boolean=false;
  merge_x:number=0;
  merge_y:number=0;
  merge_w:number=0;
  merge_h:number=0;
  permanent_window:boolean=true;
  perm_button_x:number=0;
  perm_button_y:number=0;
  perm_button_w:number=0;
  perm_button_h:number=0;
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

  displayable_attributes:Attribute[]=[];
  attribute_booleans:boolean[]=[];
  axis_list:Attribute[]=[];
  to_display_list:any[]=[];
  parallel_plot_lineColor:string;
  parallel_plot_linewidth:string;
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
  bandWidth:number=30;
  bandColor:string=string_to_hex('lightblue');
  bandOpacity:number=0.5;
  axisNameSize:number=12;
  gradSize:number=10;
  axisNbGrad:number=10;
  interpolation_colors:string[]=[];
  rgbs:[number, number, number][]=[];
  hexs:string[];

  initRectColorStroke:string=string_to_hex('grey');
  initRectLinewidth:number=0.2;
  initRectDashline:number[]=[];
  manipRectColorfill:string=string_to_hex('lightblue');
  manipRectColorstroke:string=string_to_hex('black');
  manipRectLinewidth:number=1;
  manipRectOpacity:number=0.3;
  manipRectDashline:number[]=[15,15];

  isSelecting:boolean=false;
  selection_coords:[number, number][]=[];
  isDrawing_rubber_band:boolean=false;
  rubberbands_dep:[string, [number, number]][]=[];

  public constructor(
    public data:any,
    public width: number,
    public height: number,
    public coeff_pixel: number,
    public buttons_ON: boolean,
    public X: number,
    public Y: number,
    public canvas_id: string) {}


  abstract draw(hidden, show_state, mvx, mvy, scaleX, scaleY, X, Y);

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
    this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);

  }

  refresh_MinMax(point_list):void {
    this.minX = point_list[0].minX;
    this.maxX = point_list[0].maxX;
    this.minY = point_list[0].minY;
    this.maxY = point_list[0].maxY;
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
    if ((this.axis_ON) && !(this.graph_ON)) {
      this.init_scaleX = (this.width-this.decalage_axis_x)/(this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX);
      this.init_scaleY = (this.height - this.decalage_axis_y-this.pointLength)/(this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY);
      this.scaleX = this.init_scaleX;
      this.scaleY = this.init_scaleY;
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX + this.decalage_axis_x/(2*this.scaleX);
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY - this.decalage_axis_y/(2*this.scaleY) + this.pointLength/(2*this.scaleY);
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
      this.init_scaleX = this.init_scale;
      this.init_scaleY = this.init_scale;
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX;
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY;
    }
  }

  draw_rect() {
    if (this.manipulable_ON === false) {
      Shape.rect(this.X, this.Y, this.width, this.height, this.context, 'white', this.initRectColorStroke, this.initRectLinewidth, 1, this.initRectDashline);
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
    Shape.rect(this.X, this.Y, this.width, this.height, this.context, this.manipRectColorfill, this.manipRectColorstroke, this.manipRectLinewidth, this.manipRectOpacity, this.manipRectDashline);
  }

  draw_contourgroup(hidden, show_state, mvx, mvy, scaleX, scaleY, d) {
    if (d['type_'] == 'contourgroup') {
      for (let i=0; i<d.contours.length; i++) {
        this.draw_contour(hidden, show_state, mvx, mvy, scaleX, scaleY, d.contours[i]);
      }
    }
  }

  draw_contour(hidden, show_state, mvx, mvy, scaleX, scaleY, d) {
    if (d['type_'] == 'contour') {
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
        if (j == 0) {var first_elem = true;} else {var first_elem = false;}
        elem.draw(this.context, first_elem,  mvx, mvy, scaleX, scaleY, this.X, this.Y);
      }
      this.context.fill();
      this.context.stroke();
      this.context.closePath();
    } else if (d['type_'] == 'text') {
      d.draw(this.context, mvx, mvy, scaleX, scaleY, this.X, this.Y) ;
    }
  }

  draw_point(hidden, show_state, mvx, mvy, scaleX, scaleY, d) {
    if (d['type_'] == 'point') {
      if (hidden) {
        this.context.fillStyle = d.mouse_selection_color;
      } else {
        if ((this.plotObject.type_ == 'scatterplot') && !this.sc_interpolation_ON) {
          this.context.fillStyle = this.plotObject.color_fill;
        } else {
          if ((this.select_on_click.length == 0) || List.contains_undefined(this.select_on_click)) {
            this.context.fillStyle = d.color_fill;
          } else {
            this.context.fillStyle = rgb_to_hex(tint_rgb(hex_to_rgb(d.color_fill), 0.75));
          }
        }
        this.context.lineWidth = d.stroke_width;
        this.context.strokeStyle = d.color_stroke;
        var shape = d.point_shape;

        if (shape == 'crux') {
          this.context.strokeStyle = d.color_fill;
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
              if (this.sc_interpolation_ON) {
                this.context.fillStyle = d.color_fill;
              } else {
                this.context.fillStyle = this.color_surface_on_click;
              }
            }
          }
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

  draw_axis(mvx, mvy, scaleX, scaleY, d) {
    if (d['type_'] == 'axis'){
      this.context.beginPath();
      d.draw(this.context, mvx, mvy, scaleX, scaleY, this.width, this.height, this.init_scaleX, this.init_scaleY, this.minX, this.maxX, this.minY, this.maxY, this.scroll_x, this.scroll_y, this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y);
      this.x_nb_digits = Math.max(0, 1-Math.floor(MyMath.log10(d.x_step)));
      this.y_nb_digits = Math.max(0, 1-Math.floor(MyMath.log10(d.y_step)));
      this.context.closePath();
      this.context.fill();
    }
  }

  draw_scatterplot_axis(mvx, mvy, scaleX, scaleY, d, lists, toDisplayAttributes) {
    d.draw_scatter_axis(this.context, mvx, mvy, scaleX, scaleY, this.width, this.height, this.init_scaleX, this.init_scaleY, lists, toDisplayAttributes, this.scroll_x, this.scroll_y, this.decalage_axis_x, this.decalage_axis_y, this.X, this.Y);
    this.x_nb_digits = Math.max(0, 1-Math.floor(MyMath.log10(d.x_step)));
    this.y_nb_digits = Math.max(0, 1-Math.floor(MyMath.log10(d.y_step)));
    this.context.closePath();
    this.context.fill();
  }

  draw_tooltip(d, mvx, mvy, point_list, elements, mergeON) {
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

  draw_dataset(d, hidden, mvx, mvy) {
    if ((d['type_'] == 'dataset') && (this.graph_to_display[d.id] === true)) {
      this.context.beginPath();
      this.context.setLineDash(d.dashline);
      this.context.strokeStyle = d.graph_colorstroke;
      this.context.lineWidth = d.graph_linewidth;
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
        this.draw_point(hidden, 0, mvx, mvy, this.scaleX, this.scaleY, point);
      }
    } else if ((d['type_'] == 'dataset') && (this.graph_to_display[d.id] === false)) {
      this.delete_clicked_points(d.point_list);
      this.delete_tooltip(d.point_list);
    }
  }

  draw_graph2D(d, hidden, mvx, mvy) {
    if (d['type_'] == 'graph2d') {
      for (let i=0; i<d.graphs.length; i++) {
        let graph = d.graphs[i];
        this.draw_dataset(graph, hidden, mvx, mvy);
      }
      this.draw_axis(mvx, mvy, this.scaleX, this.scaleY, d.axis);
      for (let i=0; i<d.graphs.length; i++) {
        let graph = d.graphs[i];
        this.draw_tooltip(graph.tooltip, mvx, mvy, graph.point_list, graph.point_list, false);
      }
    }
  }

  draw_scatterplot(d, hidden, mvx, mvy) {
    if (d['type_'] == 'scatterplot') {
      if (((this.scroll_x%5==0) || (this.scroll_y%5==0)) && this.refresh_point_list_bool && this.mergeON){
        let refreshed_points = this.refresh_point_list(d.point_list,mvx,mvy);
        if (!this.point_list_equals(refreshed_points, this.scatter_point_list)) {
          this.scatter_point_list = refreshed_points;
        }

        this.refresh_point_list_bool = false;
      } else if (this.mergeON === false) {
        if (!equals(this.scatter_point_list, d.point_list)) {
          this.scatter_point_list = d.point_list;
        }
      }
      if ((this.scroll_x%5 != 0) && (this.scroll_y%5 != 0)) {
        this.refresh_point_list_bool = true;
      }
      for (var i=0; i<this.scatter_point_list.length; i++) {
        var point = this.scatter_point_list[i];
        this.draw_point(hidden, 0, mvx, mvy, this.scaleX, this.scaleY, point);
      }

      for (var i=0; i<this.tooltip_list.length; i++) {
        if (!List.is_include(this.tooltip_list[i],this.scatter_point_list)) {
          this.tooltip_list = List.remove_selection(this.tooltip_list[i], this.tooltip_list);
        }
      }
      this.draw_scatterplot_axis(mvx, mvy, this.scaleX, this.scaleY, d.axis, d.lists, d.toDisplayAttributes);
      this.draw_tooltip(d.tooltip, mvx, mvy, this.scatter_point_list, d.elements, this.mergeON);
    }
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

  get_coord_on_parallel_plot(attribute_type, current_list, elt, axis_coord_start, axis_coord_end, inverted) {
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
      let sorted_elements = sort.sortObjsByAttribute(List.copy(this.elements), this.selected_axis_name);
      this.refresh_to_display_list(sorted_elements);
    }
  }

  pp_color_management(selected:boolean, index:number) {
    if (this.selected_axis_name == '') {
      if (selected === true) {
        this.context.strokeStyle = this.parallel_plot_lineColor;
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


  draw_parallel_coord_lines(nb_axis:number) {
    if (this.selected_axis_name != '') {
      this.sort_to_display_list();
    }
    for (var i=0; i<this.to_display_list.length; i++) {
      var to_display_list_i = this.to_display_list[i];
      var current_attribute_type = this.axis_list[0]['type_'];
      var current_list = this.axis_list[0]['list'];
      var selected:boolean = true;
      var seg_list = [];
      if (this.vertical === true) {
        var current_x = this.axis_x_start;
        var current_axis_y = this.get_coord_on_parallel_plot(current_attribute_type, current_list, to_display_list_i[0], this.axis_y_start, this.axis_y_end, this.inverted_axis_list[0]);
      } else {
        var current_x = this.get_coord_on_parallel_plot(current_attribute_type, current_list, to_display_list_i[0], this.axis_x_start, this.axis_x_end, this.inverted_axis_list[0]);
        var current_axis_y = this.axis_y_start;
      }
      selected = selected && this.is_inside_band(current_x, current_axis_y, 0);
      seg_list.push([current_x, current_axis_y]);
      for (var j=1; j<nb_axis; j++) {
        var next_attribute_type = this.axis_list[j]['type_'];
        var next_list = this.axis_list[j]['list'];
        if (this.vertical === true) {
          var next_x = this.axis_x_start + j*this.x_step;
          var next_axis_y = this.get_coord_on_parallel_plot(next_attribute_type, next_list, to_display_list_i[j], this.axis_y_start, this.axis_y_end, this.inverted_axis_list[j]);
        } else {
          var next_x = this.get_coord_on_parallel_plot(next_attribute_type, next_list, to_display_list_i[j], this.axis_x_start, this.axis_x_end, this.inverted_axis_list[j]);
          var next_axis_y = this.axis_y_start + j*this.y_step;
        }
        selected = selected && this.is_inside_band(next_x, next_axis_y, j);
        seg_list.push([next_x, next_axis_y]);
      }
      this.context.beginPath();
      this.pp_color_management(selected, i);
      this.context.lineWidth = this.parallel_plot_linewidth;
      Shape.drawLine(this.context, seg_list);
      this.context.stroke();
      this.context.closePath();
    }
  }


  draw_rubber_bands(mvx) {
    var colorstroke = string_to_hex('white');
    var linewidth = 0.1;
    for (var i=0; i<this.rubber_bands.length; i++) {
      if (this.rubber_bands[i].length != 0) {
        if (this.vertical) {
          var minY = this.rubber_bands[i][0];
          var maxY = this.rubber_bands[i][1];
          var real_minY = this.axis_y_end + minY*(this.axis_y_start - this.axis_y_end);
          var real_maxY = this.axis_y_end + maxY*(this.axis_y_start - this.axis_y_end);
          var current_x = this.axis_x_start + i*this.x_step;
          if (i == this.move_index) {
            Shape.rect(current_x - this.bandWidth/2 + mvx, real_minY, this.bandWidth, real_maxY - real_minY, this.context, this.bandColor, colorstroke, linewidth, this.bandOpacity, []);
          } else {
            Shape.rect(current_x - this.bandWidth/2, real_minY, this.bandWidth, real_maxY - real_minY, this.context, this.bandColor, colorstroke, linewidth, this.bandOpacity, []);
          }
        } else {
          var minX = this.rubber_bands[i][0];
          var maxX = this.rubber_bands[i][1];
          var real_minX = this.axis_x_start + minX*(this.axis_x_end - this.axis_x_start);
          var real_maxX = this.axis_x_start + maxX*(this.axis_x_end - this.axis_x_start);
          var current_y = this.axis_y_start + i*this.y_step;
          if (i == this.move_index) {
            Shape.rect(real_minX, current_y - this.bandWidth/2 + mvx, real_maxX - real_minX, this.bandWidth, this.context, this.bandColor, colorstroke, linewidth, this.bandOpacity, []);
          } else {
            Shape.rect(real_minX, current_y - this.bandWidth/2, real_maxX - real_minX, this.bandWidth, this.context, this.bandColor, colorstroke, linewidth, this.bandOpacity, []);
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

  dep_color_propagation(attribute_index:number, vertical:boolean, inverted:boolean, hexs:string[], attribute_name:string): void {
    var sort: Sort = new Sort();
    if (attribute_index == 0) {
      this.plotObject.point_list = sort.sortObjsByAttribute(this.plotObject.point_list, 'cx');
    } else if (attribute_index == 1) {
      this.plotObject.point_list = sort.sortObjsByAttribute(this.plotObject.point_list, 'cy').reverse();
    } else { //ie attribute_index = -1
      var elements = sort.sortObjsByAttribute(List.copy(this.plotObject.elements), attribute_name);
      this.plotObject.initialize_point_list(elements);
    }
    var nb_points = this.plotObject.point_list.length;
    for (let i=0; i<nb_points; i++) {
      if ((vertical && inverted) || (!vertical && !inverted)) {
        this.plotObject.point_list[i].color_fill = hexs[i];
      } else {
        this.plotObject.point_list[i].color_fill = hexs[nb_points - 1 - i];
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
    this.zoom_rect_x = this.width - 45;
    this.zoom_rect_y = 10;
    this.zoom_rect_w = 35;
    this.zoom_rect_h = 25;
    this.zw_x = this.width - 45;
    this.zw_y = 70;
    this.zw_w = 35;
    this.zw_h = 20;
    this.reset_rect_x = this.width - 45;
    this.reset_rect_y = 100;
    this.reset_rect_w = 35;
    this.reset_rect_h = 20;
    this.select_x = this.width - 45;
    this.select_y = 130;
    this.select_w = 35;
    this.select_h = 20;
    this.graph1_button_y = 10;
    this.graph1_button_w = 30;
    this.graph1_button_h = 15;
    this.merge_x = this.width - 50;
    this.merge_y = 160;
    this.merge_w = 45;
    this.merge_h = 20;
    this.perm_button_x = this.width - 50;
    this.perm_button_y = 190;
    this.perm_button_w = 45;
    this.perm_button_h = 20;
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

  add_to_axis_list(to_disp_attributes_names:string[]) {
    for (let i=0; i<to_disp_attributes_names.length; i++) {
      for (let j=0; j<this.displayable_attributes.length; j++) {
        if (to_disp_attributes_names[i] == this.displayable_attributes[j]['name']) {
          this.axis_list.push(this.displayable_attributes[j]);
        }
      }
    }
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
    this.draw(false, 0, 0 ,0 ,0 ,0, this.X, this.Y);
  }

  remove_axis_from_parallelplot(name:string) { //Remove an existing axis and redraw the whole canvas
    var is_in_axislist = false;
    for (var i=0; i<this.axis_list.length; i++) {
      if (this.axis_list[i]['name'] == name) {
        is_in_axislist = true;
        this.axis_list = List.remove_selection(this.axis_list[i], this.axis_list);
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
    this.draw(false, 0, 0 ,0 ,0 ,0, this.X, this.Y);
  }

  get_scatterplot_displayed_axis():Attribute[] {
    return this.plotObject.toDisplayAttributes;
  }

  get_scatterplot_displayable_axis():Attribute[] {
    return this.plotObject.displayableAttributes;
  }

  set_scatterplot_x_axis(attribute_name:string):void {
    var isAttributeInList:boolean = false;
    var attribute:Attribute;
    for (let i=0; i<this.plotObject.displayableAttributes.length; i++) {
      if (this.plotObject.displayableAttributes[i].name == attribute_name) {
        isAttributeInList = true;
        attribute = this.plotObject.displayableAttributes[i];
      }
    }
    if (isAttributeInList === false) {
      throw new Error('Attribute not found');
    }
    this.plotObject.toDisplayAttributes[0] = attribute;
    this.plotObject.initialize_lists();
    this.plotObject.initialize_point_list(this.plotObject.elements);
    this.refresh_MinMax(this.plotObject.point_list);
    this.reset_scales();
    if (this.mergeON) {this.scatter_point_list = this.refresh_point_list(this.plotObject.point_list, this.last_mouse1X, this.last_mouse1Y);}
    this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }

  set_scatterplot_y_axis(attribute_name:string):void {
    var isAttributeInList:boolean = false;
    var attribute:Attribute;
    for (let i=0; i<this.plotObject.displayableAttributes.length; i++) {
      if (this.plotObject.displayableAttributes[i].name == attribute_name) {
        isAttributeInList = true;
        attribute = this.plotObject.displayableAttributes[i];
      }
    }
    if (isAttributeInList === false) {
      throw new Error('Attribute not found');
    }
    this.plotObject.toDisplayAttributes[1] = attribute;
    this.plotObject.initialize_lists();
    this.plotObject.initialize_point_list(this.plotObject.elements);
    this.refresh_MinMax(this.plotObject.point_list);
    this.reset_scales();
    if (this.mergeON) {this.scatter_point_list = this.refresh_point_list(this.plotObject.point_list, this.last_mouse1X, this.last_mouse1Y);}
    this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }

  add_to_tooltip(tooltip:Tooltip, str:string): Tooltip {
    tooltip.to_plot_list.push(str);
    return tooltip;
  }

  remove_from_tooltip(tooltip:Tooltip, str:string): Tooltip {
    tooltip.to_plot_list = List.remove_selection(str, tooltip.to_plot_list);
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
      if (!(this.select_on_click[i] === undefined)) {
        if (this.plotObject['type_'] == 'scatterplot') {
          let clicked_points = this.select_on_click[i].points_inside;
          for (let j=0; j<clicked_points.length; j++) {
            this.selected_point_index.push(List.get_index_of_element(clicked_points[j], this.plotObject.point_list));
          }
        } else if (this.plotObject['type_'] == 'graph2D') {
          for (let j=0; j<this.plotObject.graphs.length; j++) {
            if (List.is_include(this.select_on_click[i], this.plotObject.graphs[j].point_list)) {
              this.selected_point_index.push([List.get_index_of_element(this.select_on_click[i], this.plotObject.graphs[j].point_list), j]);
            }
          }
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
        this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
        this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
        } else { // ie zw_bool === true
          this.zoom_box_x = Math.min(mouse1X, mouse2X);
          this.zoom_box_y = Math.min(mouse1Y, mouse2Y);
          this.zoom_box_w = Math.abs(mouse2X - mouse1X);
          this.zoom_box_h = Math.abs(mouse2Y - mouse1Y);
          this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
          this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
        }
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
      this.select_on_mouse = this.colour_to_plot_data[colKey];
      this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
      this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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

    var click_on_plus = Shape.isInRect(mouse1X, mouse1Y, this.zoom_rect_x + this.X, this.zoom_rect_y + this.Y, this.zoom_rect_w, this.zoom_rect_h);
    var click_on_minus = Shape.isInRect(mouse1X, mouse1Y, this.zoom_rect_x + this.X, this.zoom_rect_y + this.zoom_rect_h + this.Y, this.zoom_rect_w, this.zoom_rect_h);
    var click_on_zoom_window = Shape.isInRect(mouse1X, mouse1Y, this.zw_x + this.X, this.zw_y + this.Y, this.zw_w, this.zw_h);
    var click_on_reset = Shape.isInRect(mouse1X, mouse1Y, this.reset_rect_x + this.X, this.reset_rect_y + this.Y, this.reset_rect_w, this.reset_rect_h);
    var click_on_select = Shape.isInRect(mouse1X, mouse1Y, this.select_x + this.X, this.select_y + this.Y, this.select_w, this.select_h);
    var click_on_graph = false;
    var click_on_merge = Shape.isInRect(mouse1X, mouse1Y, this.merge_x + this.X, this.merge_y + this.Y, this.merge_w, this.merge_h);
    var click_on_perm = Shape.isInRect(mouse1X, mouse1Y, this.perm_button_x + this.X, this.perm_button_y + this.Y, this.perm_button_w, this.perm_button_h);

    var text_spacing_sum_i = 0;
    for (var i=0; i<this.nb_graph; i++) {
      var click_on_graph_i = Shape.isInRect(mouse1X, mouse1Y, this.graph1_button_x + i*this.graph1_button_w + text_spacing_sum_i, this.graph1_button_y, this.graph1_button_w, this.graph1_button_h);
      click_on_graph = click_on_graph || click_on_graph_i;
      text_spacing_sum_i = text_spacing_sum_i + this.graph_text_spacing_list[i];
    }
    var click_on_button = click_on_plus || click_on_minus || click_on_zoom_window || click_on_reset || click_on_select || click_on_graph || click_on_merge || click_on_perm;

    if (mouse_moving) {
        if (this.zw_bool) {
          Interactions.zoom_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y, scale_ceil, this);

        } else if ((this.select_bool) && (this.permanent_window)) {
          Interactions.refresh_permanent_rect(this);
        }
    } else {
        var col = this.context_hidden.getImageData(mouse1X, mouse1Y, 1, 1).data;
        var colKey = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
        var click_plot_data = this.colour_to_plot_data[colKey];
        if (List.is_include(click_plot_data, this.select_on_click)) {
          this.select_on_click = List.remove_selection(click_plot_data, this.select_on_click);
        } else {
          this.select_on_click.push(click_plot_data);
        }
        if (this.tooltip_ON) {
            if (List.is_include(click_plot_data, this.tooltip_list) && (!List.is_include(click_plot_data, this.select_on_click))) {
              this.tooltip_list = List.remove_selection(click_plot_data, this.tooltip_list);
            } else if (!List.is_include(click_plot_data, this.tooltip_list) && List.is_include(click_plot_data, this.select_on_click)){
              this.tooltip_list.push(click_plot_data);
            }
        }

        if (List.contains_undefined(this.select_on_click) && !click_on_button) {
          this.select_on_click = [];
          this.tooltip_list = [];
          Interactions.reset_permanent_window(this);
        }
        this.refresh_selected_point_index();
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
        }
      }
      this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
      this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
      var isDrawing = false;
      mouse_moving = false;
      this.isSelecting = false;
      this.isDrawing_rubber_band = false;
      Interactions.reset_zoom_box(this);
      return [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y];
  }

  wheel_interaction(mouse3X, mouse3Y, e) {
    var scale_ceil = 100*Math.max(this.init_scaleX, this.init_scaleY);
    var scale_floor = Math.min(this.init_scaleX, this.init_scaleY)/100;
    this.fusion_coeff = 1.2;
    var event = -e.deltaY;
    mouse3X = e.offsetX;
    mouse3Y = e.offsetY;
    if ((mouse3Y>=this.height - this.decalage_axis_y + this.Y) && (mouse3X>this.decalage_axis_x + this.X) && this.axis_ON) {
        var old_scaleX = this.scaleX;
        if ((event>0) && (this.scaleX*this.fusion_coeff<scale_ceil)) {
          this.scaleX = this.scaleX*this.fusion_coeff;
          this.scroll_x = this.scroll_x - e.deltaY/Math.abs(e.deltaY);
          this.last_mouse1X = this.last_mouse1X - ((this.width/2)/old_scaleX - (this.width/2)/this.scaleX);
        } else if ((event<0) && this.scaleX/this.fusion_coeff>scale_floor) {
          this.scaleX = this.scaleX/this.fusion_coeff;
          this.scroll_x = this.scroll_x - e.deltaY/Math.abs(e.deltaY);
          this.last_mouse1X = this.last_mouse1X - ((this.width/2)/old_scaleX - (this.width/2)/this.scaleX);
        }

    } else if ((mouse3X<=this.decalage_axis_x + this.X) && (mouse3Y<this.height - this.decalage_axis_y + this.Y) && this.axis_ON) {
        var old_scaleY = this.scaleY;
        if ((event>0) && (this.scaleY*this.fusion_coeff<scale_ceil)) {
          this.scaleY = this.scaleY*this.fusion_coeff;
          this.scroll_y = this.scroll_y - e.deltaY/Math.abs(e.deltaY);
          this.last_mouse1Y = this.last_mouse1Y - ((this.height/2)/old_scaleY - (this.height/2)/this.scaleY);
        } else if ((event<0) && this.scaleY/this.fusion_coeff>scale_floor) {
          this.scaleY = this.scaleY/this.fusion_coeff;
          this.scroll_y = this.scroll_y - e.deltaY/Math.abs(e.deltaY);
          this.last_mouse1Y = this.last_mouse1Y - ((this.height/2)/old_scaleY - (this.height/2)/this.scaleY);
        }

    } else {
        var old_scaleY = this.scaleY;
        var old_scaleX = this.scaleX;
        if ((event>0) && (this.scaleX*this.fusion_coeff<scale_ceil) && (this.scaleY*this.fusion_coeff<scale_ceil)) {
          this.scaleX = this.scaleX*this.fusion_coeff;
          this.scaleY = this.scaleY*this.fusion_coeff;
        } else if ((event<0) && (this.scaleX/this.fusion_coeff>scale_floor) && (this.scaleY/this.fusion_coeff>scale_floor)) {
          this.scaleX = this.scaleX/this.fusion_coeff;
          this.scaleY = this.scaleY/this.fusion_coeff;
        }
        this.scroll_x = this.scroll_x - e.deltaY/Math.abs(e.deltaY);
        this.scroll_y = this.scroll_y - e.deltaY/Math.abs(e.deltaY);
        this.last_mouse1X = this.last_mouse1X - ((mouse3X - this.X)/old_scaleX - (mouse3X - this.X)/this.scaleX);
        this.last_mouse1Y = this.last_mouse1Y - ((mouse3Y - this.Y)/old_scaleY - (mouse3Y - this.Y)/this.scaleY);
      }
      this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
      this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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
    if(click_on_disp) {
      Interactions.change_disposition_action(this);
    }
    this.isDrawing_rubber_band = false;
    mouse_moving = false;
    isDrawing = false;
    this.last_mouse1X = 0;
    return [mouse3X, mouse3Y, click_on_axis, isDrawing, mouse_moving, is_resizing];
  }

  mouse_interaction(parallelplot:boolean) {
    if (this.interaction_ON === true) {
      var isDrawing = false;
      var mouse_moving = false;
      var mouse1X = 0;
      var mouse1Y = 0;
      var mouse2X = 0;
      var mouse2Y = 0;
      var mouse3X = 0;
      var mouse3Y = 0;
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
      var up:boolean = false;
      var down:boolean = false;
      var left:boolean = false;
      var right:boolean = false;

      var canvas = document.getElementById(this.canvas_id);

      canvas.addEventListener('mousedown', e => {
        if (this.interaction_ON) {
          [mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing, click_on_selectw_border, up, down, left, right] = this.mouse_down_interaction(mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing, e);
          if (parallelplot) {
            [click_on_axis, selected_axis_index] = Interactions.initialize_click_on_axis(this.axis_list.length, mouse1X, mouse1Y, click_on_axis, this);
            [click_on_name, selected_name_index] = Interactions.initialize_click_on_name(this.axis_list.length, mouse1X, mouse1Y, this);
            [click_on_band, click_on_border, selected_band_index, selected_border] = Interactions.initialize_click_on_bands(mouse1X, mouse1Y, this);
          }
        }
      });

      canvas.addEventListener('mousemove', e => {
        if (this.interaction_ON) {
          if (parallelplot) {
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
            }
          } else {
            [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y] = this.mouse_move_interaction(isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y, e, canvas, click_on_selectw_border, up, down, left, right);
          }
        }
      });

      canvas.addEventListener('mouseup', e => {
        if (this.interaction_ON) {
          if (parallelplot) {
            [mouse3X, mouse3Y, click_on_axis, isDrawing, mouse_moving, is_resizing] = this.mouse_up_interaction_pp(click_on_axis, selected_axis_index, click_on_name, click_on_band, click_on_border, is_resizing, selected_name_index, mouse_moving, isDrawing, mouse1X, mouse1Y, mouse3X, mouse3Y, e);
          } else {
            [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y] = this.mouse_up_interaction(mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y);
          }
        }
      })

      canvas.addEventListener('wheel', e => {
        if (!parallelplot && this.interaction_ON) {
          [mouse3X, mouse3Y] = this.wheel_interaction(mouse3X, mouse3Y, e);
        }
      });
    }

  }

  get_nb_points_inside_canvas(list_points, mvx, mvy) { //given the fact that list_point ([[x0,y0],...,[xn,yn]) x is in an increasing order
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
    var point_list_copy:Point2D[] = List.copy(point_list);
    var i = 0;
    var length = point_list_copy.length;
    while (i<length) {
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
          var new_shape = point_list_copy[i].shape;
          var new_point_size = point_list_copy[i].point_size;
          var new_color_fill = point_list_copy[i].color_fill;
          var new_color_stroke = point_list_copy[i].color_stroke;
          var new_stroke_width = point_list_copy[i].stroke_width;
          var point = new Point2D(new_cx, new_cy, new_shape, new_point_size, new_color_fill, new_color_stroke, new_stroke_width, 'point', '');
          point.points_inside = point_list_copy[i].points_inside.concat(point_list_copy[j].points_inside);
          var size_coeff = 1.15;
          point.size = point_list_copy[max_size_index].size*size_coeff;
          var point_i = point_list_copy[i];
          var point_j = point_list_copy[j];
          this.delete_clicked_points([point_i, point_j]);
          this.delete_tooltip([point_i, point_j]);
          point_list_copy = List.remove_selection(point_list_copy[i], point_list_copy);
          point_list_copy = List.remove_selection(point_list_copy[j-1], point_list_copy);
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
        this.select_on_click = List.remove_selection(this.select_on_click[i], this.select_on_click);
      } else {
        i++;
      }
    }
  }

  delete_tooltip(point_list) {
    var i = 0;
    while (i<this.tooltip_list.length) {
      if (List.is_include(this.tooltip_list[i], point_list)) {
        this.tooltip_list = List.remove_selection(this.tooltip_list[i], this.tooltip_list);
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
    this.plot_datas = [];
    this.type_ = 'contourgroup';
    var d = this.data;
    if (d['type_'] == 'contourgroup') {
      var a = ContourGroup.deserialize(d);
      this.plot_datas.push(a);
      for (let i=0; i<a.contours.length; i++) {
        let contour = a.contours[i];
        if (isNaN(this.minX)) {this.minX = contour.minX} else {this.minX = Math.min(this.minX, contour.minX)};
        if (isNaN(this.maxX)) {this.maxX = contour.maxX} else {this.maxX = Math.max(this.maxX, contour.maxX)};
        if (isNaN(this.minY)) {this.minY = contour.minY} else {this.minY = Math.min(this.minY, contour.minY)};
        if (isNaN(this.maxY)) {this.maxY = contour.maxY} else {this.maxY = Math.max(this.maxY, contour.maxY)};
        this.colour_to_plot_data[contour.mouse_selection_color] = contour;
      }
    }
    
    this.plotObject = this.plot_datas[0];
    this.isParallelPlot = false;
    this.interaction_ON = true;
  }

  draw(hidden, show_state, mvx, mvy, scaleX, scaleY, X, Y) {
    this.define_context(hidden);
    this.context.save();
    this.draw_empty_canvas();
    this.draw_rect();
    this.context.beginPath();
    this.context.rect(X-1, Y-1, this.width+2, this.height+2);
    this.context.clip();
    this.context.closePath();
    for (let i=0; i<this.plot_datas.length; i++) {
      let d = this.plot_datas[i];
      this.draw_contourgroup(hidden, show_state, mvx, mvy, scaleX, scaleY, d);
    }
    if (this.manipulable_ON) {
      this.draw_manipulable_rect();
    }
    this.context.restore();
  }
}

export class PlotScatter extends PlotData {
  public constructor(public data:any,
    public width: number,
    public height: number,
    public coeff_pixel: number,
    public buttons_ON: boolean,
    public X: number,
    public Y: number,
    public canvas_id: string,
    public from_python: boolean) {
      super(data, width, height, coeff_pixel, buttons_ON, X, Y, canvas_id);
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
          this.graph_colorlist.push(graph.point_list[0].color_fill);
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
        if (from_python) {this.plotObject = Scatter.deserialize(data);} else {this.plotObject = data;}
        this.plot_datas['value'] = [this.plotObject];
        this.pointLength = 1000*this.plotObject.point_list[0].size;
        this.scatter_init_points = this.plotObject.point_list;
        this.refresh_MinMax(this.plotObject.point_list);
      }
      this.isParallelPlot = false;
  }

  draw(hidden, show_state, mvx, mvy, scaleX, scaleY, X, Y) {
    this.define_context(hidden);
    this.context.save();
    this.draw_empty_canvas();
    this.draw_rect();
    this.context.beginPath();
    this.context.rect(X-1, Y-1, this.width+2, this.height+2);
    this.context.clip();
    this.context.closePath();
    this.draw_graph2D(this.plotObject, hidden, mvx, mvy);
    this.draw_scatterplot(this.plotObject, hidden, mvx, mvy);
    this.draw_point(hidden, show_state, mvx, mvy, scaleX, scaleY, this.plotObject);
    this.draw_axis(mvx, mvy, scaleX, scaleY, this.plotObject);
    if (this.permanent_window) {
      this.draw_selection_rectangle();
    }
    if (this.zw_bool) {
      this.draw_zoom_rectangle();
    }

    if (this.buttons_ON) {
      this.refresh_buttons_coords();
      //Drawing the zooming button
      Buttons.zoom_button(this.zoom_rect_x, this.zoom_rect_y, this.zoom_rect_w, this.zoom_rect_h, this);

      //Drawing the button for zooming window selection
      Buttons.zoom_window_button(this.zw_x,this.zw_y,this.zw_w,this.zw_h, this);

      //Drawing the reset button
      Buttons.reset_button(this.reset_rect_x, this.reset_rect_y, this.reset_rect_w, this.reset_rect_h, this);

      //Drawing the selection button
      Buttons.selection_button(this.select_x, this.select_y, this.select_w, this.select_h, this);

      //Drawing the enable/disable graph button
      Buttons.graph_buttons(this.graph1_button_y, this.graph1_button_w, this.graph1_button_h, '10px Arial', this);

      if (this.plotObject.type_ == 'scatterplot') {
        // TODO To check, this in args is weird
        Buttons.merge_button(this.merge_x, this.merge_y, this.merge_w, this.merge_h, '10px Arial', this);
      }

      //draw permanent window button
      Buttons.perm_window_button(this.perm_button_x, this.perm_button_y, this.perm_button_w, this.perm_button_h, '10px Arial', this);
    }
    if (this.manipulable_ON) {
      this.draw_manipulable_rect();
    }
    this.context.restore();
  }
}


export class ParallelPlot extends PlotData {

  constructor(public data, public width, public height, public coeff_pixel, public buttons_ON, X, Y, public canvas_id: string) {
    super(data, width, height, coeff_pixel, buttons_ON, X, Y, canvas_id);
    this.type_ = 'parallelplot';
    if (this.buttons_ON) {
      this.disp_x = this.width - 35;
      this.disp_y = this.height - 25;
      this.disp_w = 30;
      this.disp_h = 20;
    }
    this.parallel_plot_lineColor = rgb_to_hex(data['line_color']);
    this.parallel_plot_linewidth = data['line_width'];
    this.elements = data['elements'];
    var to_disp_attribute_names = data['to_disp_attributes'];
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
    this.isParallelPlot = true;
    this.rgbs = data['rgbs'];
    this.interpolation_colors = rgb_interpolations(this.rgbs, this.to_display_list.length);
    this.initialize_hexs();
  }

  refresh_pp_buttons_coords() {
    this.disp_x = this.width - 35;
    this.disp_y = this.height - 25;
    this.disp_w = 30;
    this.disp_h = 20;
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
    this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }

  draw(hidden, show_state, mvx, mvy, scaleX, scaleY, X, Y) {
    this.refresh_axis_bounds(this.axis_list.length);
    this.define_context(hidden);
    this.context.save();
    this.draw_empty_canvas();
    this.draw_rect();
    this.context.beginPath();
    this.context.rect(X-1, Y-1, this.width+2, this.height + 2);
    this.context.clip();
    this.context.closePath();
    this.draw_rubber_bands(mvx);
    var nb_axis = this.axis_list.length;
    this.draw_parallel_coord_lines(nb_axis);
    this.draw_parallel_axis(nb_axis, mvx);
    if (this.buttons_ON) {
      this.refresh_pp_buttons_coords();
      Buttons.disp_button(this.disp_x + this.X, this.disp_y + this.Y, this.disp_w, this.disp_h, '10px Arial', this);
    }
    if (this.manipulable_ON) {
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

export class Interactions {
  public static initialize_select_win_bool(mouseX, mouseY, plot_data:PlotData): [boolean, boolean, boolean, boolean, boolean] {
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

  public static initialize_permWH(plot_data:PlotData) {
    plot_data.initial_permW = plot_data.perm_window_w;
    plot_data.initial_permH = plot_data.perm_window_h;
  }

  public static selection_window_resize(mouse1X, mouse1Y, mouse2X, mouse2Y, up, down, left, right, plot_data:PlotData) {
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
    plot_data.draw(false, 0, plot_data.last_mouse1X, plot_data.last_mouse1Y, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, plot_data.last_mouse1X, plot_data.last_mouse1Y, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
  }

  public static mouse_move_select_win_action(mouse1X, mouse1Y, mouse2X, mouse2Y, plot_data:PlotData) {
    plot_data.perm_window_x = plot_data.scatter_to_real_coords(Math.min(mouse1X, mouse2X), 'x');
    plot_data.perm_window_y = plot_data.scatter_to_real_coords(Math.min(mouse1Y, mouse2Y), 'y');
    plot_data.perm_window_w = plot_data.scatter_to_real_length(Math.abs(mouse2X - mouse1X), 'x');
    plot_data.perm_window_h = plot_data.scatter_to_real_length(Math.abs(mouse2Y - mouse1Y), 'y');
    plot_data.draw(false, 0, plot_data.last_mouse1X, plot_data.last_mouse1Y, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, plot_data.last_mouse1X, plot_data.last_mouse1Y, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
  }


  public static selection_window_action(plot_data:PlotData) {
    plot_data.select_on_click = [];
    plot_data.context_show.setLineDash([]);
    plot_data.context_hidden.setLineDash([]);
    if (plot_data.plotObject['type_'] == 'graph2d') {
      for (let i=0; i<plot_data.plotObject.graphs.length; i++) {
        let graph = plot_data.plotObject.graphs[i];
        for (let j=0; j<graph.point_list.length; j++) {
          let point = graph.point_list[j];
          var x = plot_data.scaleX*(1000*point.cx + plot_data.last_mouse1X) + plot_data.X;
          var y = plot_data.scaleY*(1000*point.cy + plot_data.last_mouse1Y) + plot_data.Y;
            var sc_perm_window_x = plot_data.real_to_scatter_coords(plot_data.perm_window_x, 'x');
            var sc_perm_window_y = plot_data.real_to_scatter_coords(plot_data.perm_window_y, 'y');
            var sc_perm_window_w = plot_data.real_to_scatter_length(plot_data.perm_window_w, 'x');
            var sc_perm_window_h = plot_data.real_to_scatter_length(plot_data.perm_window_h, 'y');
            var in_rect = Shape.isInRect(x, y, sc_perm_window_x, sc_perm_window_y, sc_perm_window_w, sc_perm_window_h);
          if ((in_rect===true) && !(List.is_include(point, plot_data.select_on_click))) {
            plot_data.select_on_click.push(point);
          }
        }
      }

    } else if (plot_data.plotObject['type_'] == 'scatterplot') {
      plot_data.select_on_click = [];
      for (var j=0; j<plot_data.scatter_point_list.length; j++) {
        var x = plot_data.scaleX*(1000*plot_data.scatter_point_list[j].cx + plot_data.last_mouse1X) + plot_data.X;
        var y = plot_data.scaleY*(1000*plot_data.scatter_point_list[j].cy + plot_data.last_mouse1Y) + plot_data.Y;
        var sc_perm_window_x = plot_data.real_to_scatter_coords(plot_data.perm_window_x, 'x');
        var sc_perm_window_y = plot_data.real_to_scatter_coords(plot_data.perm_window_y, 'y');
        var sc_perm_window_w = plot_data.real_to_scatter_length(plot_data.perm_window_w, 'x');
        var sc_perm_window_h = plot_data.real_to_scatter_length(plot_data.perm_window_h, 'y');
        in_rect = Shape.isInRect(x, y, sc_perm_window_x, sc_perm_window_y, sc_perm_window_w, sc_perm_window_h);
        if ((in_rect===true) && !(List.is_include(plot_data.scatter_point_list[j], plot_data.select_on_click))) {
          plot_data.select_on_click.push(plot_data.scatter_point_list[j]);
        }
      }
    }
    this.refresh_permanent_rect(plot_data);
    plot_data.draw(false, 0, plot_data.last_mouse1X, plot_data.last_mouse1Y, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, plot_data.last_mouse1X, plot_data.last_mouse1Y, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
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
      plot_data.draw(false, 0, plot_data.last_mouse1X, plot_data.last_mouse1Y, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
      plot_data.draw(true, 0, plot_data.last_mouse1X, plot_data.last_mouse1Y, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    }
  }

  public static refresh_permanent_rect(plot_data:PlotData) {
    if (plot_data.perm_window_w < 0) {
      plot_data.perm_window_x = plot_data.perm_window_x + plot_data.perm_window_w;
      plot_data.perm_window_w = -plot_data.perm_window_w;
    }
    if (plot_data.perm_window_h < 0) {
      plot_data.perm_window_y = plot_data.perm_window_y - plot_data.perm_window_h;
      plot_data.perm_window_h = -plot_data.perm_window_h;
    }
  }

  public static click_on_zoom_window_action(plot_data:PlotData) {
    plot_data.zw_bool = !plot_data.zw_bool;
    plot_data.select_bool = false;
  }

  public static click_on_selection_button_action(plot_data:PlotData) {
    plot_data.zw_bool = false;
    plot_data.select_bool = !plot_data.select_bool;
  }

  public static graph_button_action(mouse1X, mouse1Y, plot_data:PlotData) {
    var text_spacing_sum_i = 0;
    for (var i=0; i<plot_data.nb_graph; i++) {
      var click_on_graph_i = Shape.isInRect(mouse1X, mouse1Y, plot_data.graph1_button_x + i*plot_data.graph1_button_w + text_spacing_sum_i, plot_data.graph1_button_y, plot_data.graph1_button_w, plot_data.graph1_button_h);
      if (click_on_graph_i === true) {
        plot_data.graph_to_display[i] = !plot_data.graph_to_display[i];
      }
      text_spacing_sum_i = text_spacing_sum_i + plot_data.graph_text_spacing_list[i];
    }
  }

  public static click_on_merge_action(plot_data:PlotData) {
    plot_data.mergeON = !plot_data.mergeON;
    plot_data.refresh_point_list_bool = true;
    plot_data.reset_scroll();
    plot_data.select_on_click = [];
  }

  public static reset_zoom_box(plot_data: PlotData) {
    plot_data.zoom_box_x = 0;
    plot_data.zoom_box_y = 0;
    plot_data.zoom_box_w = 0;
    plot_data.zoom_box_h = 0;
  }

  public static reset_permanent_window(plot_data:PlotData) {
    plot_data.perm_window_x = 0;
    plot_data.perm_window_y = 0;
    plot_data.perm_window_w = 0;
    plot_data.perm_window_h = 0;
  }

  public static click_on_perm_action(plot_data:PlotData) {
    plot_data.permanent_window = !plot_data.permanent_window;
    this.reset_permanent_window(plot_data);
  }

  public static zoom_in_button_action(plot_data:PlotData) {
    var old_scaleX = plot_data.scaleX;
    var old_scaleY = plot_data.scaleY;
    plot_data.scaleX = plot_data.scaleX*1.2;
    plot_data.scaleY = plot_data.scaleY*1.2;
    plot_data.last_mouse1X = plot_data.last_mouse1X - (plot_data.width/(2*old_scaleX) - plot_data.width/(2*plot_data.scaleX));
    plot_data.last_mouse1Y = plot_data.last_mouse1Y - (plot_data.height/(2*old_scaleY) - plot_data.height/(2*plot_data.scaleY));
    plot_data.reset_scroll();
  }

  public static zoom_out_button_action(plot_data:PlotData) {
    var old_scaleX = plot_data.scaleX;
    var old_scaleY = plot_data.scaleY;
    plot_data.scaleX = plot_data.scaleX/1.2;
    plot_data.scaleY = plot_data.scaleY/1.2;
    plot_data.last_mouse1X = plot_data.last_mouse1X - (plot_data.width/(2*old_scaleX) - plot_data.width/(2*plot_data.scaleX));
    plot_data.last_mouse1Y = plot_data.last_mouse1Y - (plot_data.height/(2*old_scaleY) - plot_data.height/(2*plot_data.scaleY));
    plot_data.reset_scroll();
  }

  public static mouse_move_axis_inversion(isDrawing, e, selected_name_index, plot_data:PlotData) {
    isDrawing = true;
    plot_data.move_index = selected_name_index;
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    if (plot_data.vertical === true) {
      var axis_x = plot_data.axis_x_start + plot_data.move_index*plot_data.x_step;
      plot_data.last_mouse1X = mouse2X - axis_x
      plot_data.draw(false, 0, plot_data.last_mouse1X, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
      plot_data.draw(true, 0, plot_data.last_mouse1X, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    } else {
      var axis_y = plot_data.axis_y_start + plot_data.move_index*plot_data.y_step;
      plot_data.last_mouse1X = mouse2Y - axis_y;
      plot_data.draw(false, 0, plot_data.last_mouse1X, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
      plot_data.draw(true, 0, plot_data.last_mouse1X, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    }
    var is_inside_canvas = (mouse2X>=plot_data.X) && (mouse2X<=plot_data.width + plot_data.X) && (mouse2Y>=plot_data.Y) && (mouse2Y<=plot_data.height + plot_data.Y);
    var mouse_move = true;
    if (!is_inside_canvas) {
      isDrawing = false;
      mouse_move = false;
    }

    return [mouse2X, mouse2Y, isDrawing, mouse_move];
  }

  public static create_rubber_band(mouse1X, mouse1Y, selected_axis_index, e, plot_data:PlotData) {
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
    plot_data.draw(false, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    return [mouse2X, mouse2Y];
  }

  public static rubber_band_translation(mouse1X, mouse1Y, selected_band_index, e, plot_data:PlotData) {
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
    plot_data.draw(false, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    return [mouse2X, mouse2Y];
  }

  public static rubber_band_resize(mouse1X, mouse1Y, selected_border, e, plot_data:PlotData) {
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
    plot_data.draw(false, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
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
      }
    } else if ((plot_data.rubber_bands[selected_axis_index].length != 0) && !click_on_band && !click_on_border) {
      plot_data.rubber_bands[selected_axis_index] = [];
      for (let i=0; i<plot_data.rubberbands_dep.length; i++) {
        if (plot_data.rubberbands_dep[i][0] == plot_data.axis_list[selected_axis_index]['name']) {
          plot_data.rubberbands_dep = List.remove_at_index(i, plot_data.rubberbands_dep);
        }
      }
    }
    plot_data.draw(false, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
  }

  public static mouse_up_axis_interversion(mouse1X, mouse1Y, e, plot_data:PlotData) {
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
    return [mouse3X, mouse3Y, click_on_axis]
  }

  public static select_title_action(selected_name_index, plot_data:PlotData) {
    plot_data.inverted_axis_list[selected_name_index] = !plot_data.inverted_axis_list[selected_name_index];
    if (plot_data.rubber_bands[selected_name_index].length != 0) {
      plot_data.invert_rubber_bands([selected_name_index]);
    }
    plot_data.draw(false, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
  }

  public static change_disposition_action(plot_data:PlotData) {
    plot_data.vertical = !plot_data.vertical;
    plot_data.refresh_axis_bounds(plot_data.axis_list.length);
    plot_data.invert_rubber_bands('all');
    plot_data.draw(false, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
  }

  public static rubber_band_size_check(selected_band_index, plot_data:PlotData) {
    if (plot_data.rubber_bands[selected_band_index].length != 0 && Math.abs(plot_data.rubber_bands[selected_band_index][0] - plot_data.rubber_bands[selected_band_index][1])<=0.02) {
      plot_data.rubber_bands[selected_band_index] = [];
    }
    plot_data.draw(false, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, 0, 0, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    var is_resizing = false;
    return is_resizing;
  }

  public static move_axis(old_index, new_index, plot_data:PlotData) {
    plot_data.axis_list = List.move_elements(old_index, new_index, plot_data.axis_list);
    plot_data.rubber_bands = List.move_elements(old_index, new_index, plot_data.rubber_bands);
    plot_data.inverted_axis_list = List.move_elements(old_index, new_index, plot_data.inverted_axis_list);
    plot_data.refresh_to_display_list(plot_data.elements);
    plot_data.refresh_displayable_attributes(); //No need to refresh attribute_booleans as inverting axis doesn't affect its values
    var mvx = 0;
    var mvy = 0;
    plot_data.draw(false, 0, mvx, mvy, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, mvx, mvy, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
  }

  public static initialize_click_on_bands(mouse1X, mouse1Y, plot_data:PlotData) {
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

  public static initialize_click_on_axis(nb_axis:number, mouse1X:number, mouse1Y:number, click_on_axis, plot_data:PlotData) {
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

  public static initialize_click_on_name(nb_axis:number, mouse1X:number, mouse1Y:number, plot_data:PlotData) {
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
  }

  public static sc_to_sc_communication(selection_coords:[number, number][], toDisplayAttributes:Attribute[], plot_data:PlotData) {
    let obj_toDispAttrs = plot_data.plotObject.toDisplayAttributes;
    if (equals(obj_toDispAttrs, toDisplayAttributes) || equals(obj_toDispAttrs, List.reverse(toDisplayAttributes))) {
      if (equals(obj_toDispAttrs, List.reverse(toDisplayAttributes))) {
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
      for (let i=0; i<toDisplayAttributes.length; i++) {
        for (let j=0; j<obj_toDispAttrs.length; j++) {
          if (toDisplayAttributes[i]['name'] == obj_toDispAttrs[j]['name']) {
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
    var new_select_on_click = [];
    if (to_select.length == 1) {
      let min = to_select[0][1][0];
      let max = to_select[0][1][1];
      for (let i=0; i<plot_data.scatter_point_list.length; i++) {
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
        }
      }
      plot_data.select_on_click = new_select_on_click;
    } else if (to_select.length == 2) {
      let min1 = to_select[0][1][0];
      let max1 = to_select[0][1][1];
      let min2 = to_select[1][1][0];
      let max2 = to_select[1][1][1];
      for (let i=0; i<plot_data.scatter_point_list.length; i++) {
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
          new_select_on_click.push(point);
        }
      }
      plot_data.select_on_click = new_select_on_click;
    }
    plot_data.draw(false, 0, plot_data.last_mouse1X, plot_data.last_mouse1Y, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
    plot_data.draw(true, 0, plot_data.last_mouse1X, plot_data.last_mouse1Y, plot_data.scaleX, plot_data.scaleY, plot_data.X, plot_data.Y);
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
        }
      }
    }
  }
}

export class Buttons {
  public static zoom_button(x, y, w, h, plot_data:PlotData) {
    var actualX = x + plot_data.X;
    var actualY = y + plot_data.Y;
    plot_data.context.strokeStyle = 'black';
    plot_data.context.beginPath();
    plot_data.context.lineWidth = "2";
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
}

export class ContourGroup {
  constructor(public contours: any[],
              public type_: string,
              public name:string) {}
  
  public static deserialize(serialized) {
    var contours:any[] = [];
    var temp = serialized['contours'];
    for (let i=0; i<temp.length; i++) {
      if (temp[i]['type_'] == 'contour') {
        var b = Contour2D.deserialize(temp[i]);
        contours.push(b);
      }
      if (temp[i]['type_'] == 'text') {
        var c = Text.deserialize(temp[i]);
        contours.push(c);
      }
    }
    console.log(contours.length)
    return new ContourGroup(contours,
                            serialized['type_'],
                            serialized['name']);
  }
}

export class Contour2D {
  minX:number=0;
  maxX:number=0;
  minY:number=0;
  maxY:number=0;
  mouse_selection_color:any;

  constructor(public plot_data_primitives:any,
              public plot_data_states:any,
              public type_:string,
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
        plot_data_states.push(Settings.deserialize(d));
      }
      var temp = serialized['plot_data_primitives'];
      var plot_data_primitives = [];

      for (var i = 0; i < temp.length; i++) {
        var d = temp[i];
        if (d['type_'] == 'linesegment') {
          plot_data_primitives.push(LineSegment.deserialize(d));
        }
        if (d['type_'] == 'circle') {
          plot_data_primitives.push(Circle2D.deserialize(d));
        }
        if (d['type_'] == 'arc') {
          plot_data_primitives.push(Arc2D.deserialize(d));
        }

      }
      return new Contour2D(plot_data_primitives,
                                   plot_data_states,
                                   serialized['type_'],
                                   serialized['name']);
  }
}

export class Text {
  minX:number=0;
  maxX:number=0;
  minY:number=0;
  maxY:number=0;
  mouse_selection_color:any;

  constructor(public comment:any,
              public position_x:any,
              public position_y:any,
              public plot_data_states:any,
              public type_:string,
              public name:string) {
  }

  public static deserialize(serialized) {
    var temp = serialized['plot_data_states'];
    var plot_data_states = [];
    for (var i = 0; i < temp.length; i++) {
      var d = temp[i];
      plot_data_states.push(Settings.deserialize(d));
    }
    return new Text(serialized['comment'],
                    serialized['position_x'],
                    serialized['position_y'],
                    plot_data_states,
                    serialized['type_'],
                    serialized['name']);
  }

  draw(context, mvx, mvy, scaleX, scaleY, X, Y) {
    context.font = "regular 100px Arial";
    context.fillStyle = "black";
    context.fillText(this.comment, scaleX*(1000*this.position_x+ mvx) + X, scaleY*(1000*this.position_y+ mvy) + Y);
  }
}

export class LineSegment {
  minX:number=0;
  maxX:number=0;
  minY:number=0;
  maxY:number=0;

  constructor(public data:any,
              public plot_data_states:any,
              public type_:string,
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
        plot_data_states.push(Settings.deserialize(d));
      }
      return new LineSegment(serialized['data'],
                               plot_data_states,
                               serialized['type_'],
                               serialized['name']);
  }

  draw(context, first_elem, mvx, mvy, scaleX, scaleY, X, Y) {
    if (first_elem) {
      context.moveTo(scaleX*(1000*this.data[0]+ mvx) + X, scaleY*(1000*this.data[1]+ mvy) + Y);
    }
    context.lineTo(scaleX*(1000*this.data[2]+ mvx) + X, scaleY*(1000*this.data[3]+ mvy) + Y);
  }
}

export class Circle2D {
  minX:number=0;
  maxX:number=0;
  minY:number=0;
  maxY:number=0;

  constructor(public data:any,
              public cx:number,
              public cy:number,
              public r:number,
              public plot_data_states:Settings[],
              public type_:string,
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
        plot_data_states.push(Settings.deserialize(d))
      }
      return new Circle2D(serialized['data'],
                                  serialized['cx'],
                                  serialized['cy'],
                                  serialized['r'],
                                  plot_data_states,
                                  serialized['type_'],
                                  serialized['name']);
  }

  draw(context, first_elem, mvx, mvy, scaleX, scaleY, X, Y) {
    context.arc(scaleX*(1000*this.cx+ mvx) + X, scaleY*(1000*this.cy+ mvy) + Y, scaleX*1000*this.r, 0, 2*Math.PI);
  }

}

export class Point2D {
  minX:number=0;
  maxX:number=0;
  minY:number=0;
  maxY:number=0;
  mouse_selection_color:any;
  size:number;
  k:number=1;
  points_inside:Point2D[] = [this];

  constructor(public cx:number,
              public cy:number,
              public shape:string,
              public point_size:number,
              public color_fill:string,
              public color_stroke:string,
              public stroke_width:number,
              public type_:string,
              public name:string) {
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
      return new Point2D(serialized['cx'],
                                  -serialized['cy'],
                                  serialized['shape'],
                                  serialized['size'],
                                  rgb_to_hex(serialized['color_fill']),
                                  rgb_to_hex(serialized['color_stroke']),
                                  serialized['stroke_width'],
                                  serialized['type_'],
                                  serialized['name']);
    }

    draw(context, context_hidden, mvx, mvy, scaleX, scaleY, X, Y) {
        if (this.shape == 'circle') {
          context.arc(scaleX*(1000*this.cx+ mvx) + X, scaleY*(1000*this.cy+ mvy) + Y, 1000*this.size, 0, 2*Math.PI);
          context.stroke();
        } else if (this.shape == 'square') {
          context.rect(scaleX*(1000*this.cx + mvx) - 1000*this.size + X, scaleY*(1000*this.cy + mvy) - 1000*this.size + Y, 1000*this.size*2, 1000*this.size*2);
          context.stroke();
        } else if (this.shape == 'crux') {
          context.rect(scaleX*(1000*this.cx + mvx) + X, scaleY*(1000*this.cy + mvy) + Y, 1000*this.size, 100*this.size);
          context.rect(scaleX*(1000*this.cx + mvx) + X, scaleY*(1000*this.cy + mvy) + Y, -1000*this.size, 100*this.size);
          context.rect(scaleX*(1000*this.cx + mvx) + X, scaleY*(1000*this.cy + mvy) + Y, 100*this.size, 1000*this.size);
          context.rect(scaleX*(1000*this.cx + mvx) + X, scaleY*(1000*this.cy + mvy) + Y, 100*this.size, -1000*this.size);
          context.fillStyle = context.strokeStyle;
          context.stroke();
        } else {
          throw new Error('Invalid shape for point');
        }

    }

    copy() {
      return new Point2D(this.cx, this.cy, this.shape, this.point_size, this.color_fill, this.color_stroke, this.stroke_width, this.type_, this.name);
    }

    equals(point:Point2D): boolean {
      return (this.cx == point.cx) && (this.cy == point.cy) && (this.shape == point.shape)
              && (this.size == point.size) && (this.color_fill == point.color_fill) && (this.color_stroke == point.color_stroke)
              && (this.stroke_width == point.stroke_width);
    }

    getPointIndex(point_list:Point2D[]) {
      for (let i=0; i<point_list.length; i++) {
        if (this.equals(point_list[i])) {
          return i;
        }
      }
      throw new Error('getPointIndex : not in list');
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
              public axis_width:number,
              public grid_on:boolean,
              public type_:string) {}

  public static deserialize(serialized) {
    return new Axis(serialized['nb_points_x'],
                    serialized['nb_points_y'],
                    serialized['font_size'],
                    rgb_to_hex(serialized['graduation_color']),
                    rgb_to_hex(serialized['axis_color']),
                    serialized['name'],
                    serialized['arrow_on'],
                    serialized['axis_width'],
                    serialized['grid_on'],
                    serialized['type_']);
  }

  draw_graduations(context, mvx, mvy, scaleX, scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, minX, maxX, minY, maxY, x_step, y_step, font_size, X, Y) {
    //x axis graduations
    var i=0;
    context.textAlign = 'center';
    var x_nb_digits = Math.max(0, 1-Math.floor(MyMath.log10(x_step)));
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

      //y axis graduations
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

  draw(context, mvx, mvy, scaleX, scaleY, width, height, init_scaleX, init_scaleY, minX, maxX, minY, maxY, scroll_x, scroll_y, decalage_axis_x, decalage_axis_y, X, Y) {
    // Drawing the coordinate system
    context.beginPath();
    context.strokeStyle = this.axis_color;
    context.lineWidth = this.axis_width;
    var axis_x_start = decalage_axis_x + X;
    var axis_x_end = width + X;
    var axis_y_start = Y;
    var axis_y_end = height - decalage_axis_y + Y;
    //Arrows
    if (this.arrow_on === true) {
      Shape.drawLine(context, [[axis_x_start - 10, axis_y_start + 20], [axis_x_start, axis_y_start]]);
      Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start + 10, axis_y_start + 20]]);

      Shape.drawLine(context, [[axis_x_end - 20, axis_y_end - 10], [axis_x_end, axis_y_end]]);
      Shape.drawLine(context, [[axis_x_end, axis_y_end], [axis_x_end - 20, axis_y_end + 10]]);
    }

    //Axis
    Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start, axis_y_end]]);
    Shape.drawLine(context, [[axis_x_start, axis_y_end], [axis_x_end, axis_y_end]]);

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

    this.draw_graduations(context, mvx, mvy, scaleX, scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, minX, maxX, minY, maxY, this.x_step, this.y_step, this.font_size, X, Y);
    context.closePath();

  }

  draw_scatter_axis(context, mvx, mvy, scaleX, scaleY, width, height, init_scaleX, init_scaleY, lists, toDisplayAttributes, scroll_x, scroll_y, decalage_axis_x, decalage_axis_y, X, Y) {
    // Drawing the coordinate system
    context.beginPath();
    context.strokeStyle = this.axis_color;
    context.lineWidth = this.axis_width;
    var axis_x_start = decalage_axis_x + X;
    var axis_x_end = width + X;
    var axis_y_start = Y;
    var axis_y_end = height - decalage_axis_y + Y;
    //Arrows
    if (this.arrow_on === true) {
      Shape.drawLine(context, [[axis_x_start - 10, axis_y_start + 20], [axis_x_start, axis_y_start]]);
      Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start + 10, axis_y_start + 20]]);

      Shape.drawLine(context, [[axis_x_end - 20, axis_y_end - 10], [axis_x_end, axis_y_end]]);
      Shape.drawLine(context, [[axis_x_end, axis_y_end], [axis_x_end - 20, axis_y_end + 10]]);
    }

    //Axis
    Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start, axis_y_end]]);
    Shape.drawLine(context, [[axis_x_start, axis_y_end], [axis_x_end, axis_y_end]]);

    context.fillStyle = this.graduation_color;
    context.strokeStyle = this.axis_color;
    context.font = 'bold 20px Arial';
    context.textAlign = 'end';
    context.fillText(toDisplayAttributes[0]['name'], axis_x_end - 5, axis_y_end - 10);
    context.textAlign = 'start';
    context.fillText(toDisplayAttributes[1]['name'], axis_x_start + 5, axis_y_start + 10)

    context.stroke();

    //Graduations
    context.font = this.font_size.toString() + 'px Arial';

    this.draw_sc_horizontal_graduations(context, mvx, scaleX, init_scaleX, axis_x_start, axis_x_end, axis_y_start, axis_y_end, lists[0], toDisplayAttributes[0], scroll_x, X);
    this.draw_sc_vertical_graduations(context, mvy, scaleY, init_scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, lists[1], toDisplayAttributes[1], scroll_y, Y);
    context.stroke();
    context.fill();
    context.closePath();

  }

  draw_sc_horizontal_graduations(context, mvx, scaleX, init_scaleX, axis_x_start, axis_x_end, axis_y_start, axis_y_end, list, attribute, scroll_x, X) {
    context.textAlign = 'center';
    if (attribute['type_'] == 'float') {
      var minX = list[0];
      var maxX = list[1];
      if (scroll_x % 5 == 0) {
        var kx = 1.1*scaleX/init_scaleX;
        this.x_step = (maxX - minX)/(kx*(this.nb_points_x-1));
      }
      var i=0;
      var x_nb_digits = Math.max(0, 1-Math.floor(MyMath.log10(this.x_step)));
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
          context.fillText(MyMath.round(grad_beg_x + i*this.x_step, x_nb_digits), scaleX*(1000*(grad_beg_x + i*this.x_step) + mvx) + X, axis_y_end + this.font_size);
        }
        i++
      }
    } else {
      for (let i=0; i<list.length; i++) {
        if ((scaleX*(1000*i + mvx) + X > axis_x_start) && (scaleX*(1000*i + mvx) + X < axis_x_end - 9)) {
          if (this.grid_on === true) {
            Shape.drawLine(context, [[scaleX*(1000*i + mvx) + X, axis_y_start], [scaleX*(1000*i + mvx) + X, axis_y_end + 3]]);
          } else {
            Shape.drawLine(context, [[scaleX*(1000*i + mvx) + X, axis_y_end - 3], [scaleX*(1000*i + mvx) + X, axis_y_end + 3]]);
          }
          context.fillText(list[i], scaleX*(1000*i + mvx) + X, axis_y_end + this.font_size);
        }
      }
    }
  }

  draw_sc_vertical_graduations(context, mvy, scaleY, init_scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, list, attribute, scroll_y, Y) {
    context.textAlign = 'end';
    context.textBaseline = 'middle';
    if (attribute['type_'] == 'float') {
      var minY = list[0];
      var maxY = list[1];
      if (scroll_y % 5 == 0) {
        var ky = 1.1*scaleY/init_scaleY;
        this.y_step = (maxY - minY)/(ky*(this.nb_points_y-1));
      }
      var i=0;
      var delta_y = maxY - minY;
      var grad_beg_y = minY - 10*delta_y;
      var grad_end_y = maxY + 10*delta_y;
      var y_nb_digits = Math.max(0, 1-Math.floor(MyMath.log10(this.y_step)));
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
  constructor(public colorfill:string,
              public text_color: string,
              public font_size:number,
              public font_style:string,
              public tp_radius:any,
              public to_plot_list:any,
              public opacity:number,
              public type_:string,
              public name:string) {}

  public static deserialize(serialized) {
      return new Tooltip(rgb_to_hex(serialized['colorfill']),
                         rgb_to_hex(serialized['text_color']),
                         serialized['fontsize'],
                         serialized['fontstyle'],
                         serialized['tp_radius'],
                         serialized['to_plot_list'],
                         serialized['opacity'],
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
    for (let i=0; i<this.to_plot_list.length; i++) {
      let attribute_name = this.to_plot_list[i];
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

  initialize_text_mergeON(context, x_nb_digits, y_nb_digits, point): [string[], number] {
    var textfills = [];
    var text_max_length = 0;
    var text = 'cx : ' + MyMath.round(point.cx, x_nb_digits).toString();
    var text_w = context.measureText(text).width;
    textfills.push(text);
    if (text_w > text_max_length) {
      text_max_length = text_w;
    }

    var text = 'cy : ' + MyMath.round(-point.cy, y_nb_digits).toString();
    var text_w = context.measureText(text).width;
    textfills.push(text);
    if (text_w > text_max_length) {
      text_max_length = text_w;
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
        [textfills, text_max_length] = this.initialize_text_mergeON(context, x_nb_digits, y_nb_digits, point);
      } else {
        [textfills, text_max_length] = this.initialize_text_mergeOFF(context, x_nb_digits, y_nb_digits, elt);
      }
    }

    if (textfills.length > 0) {
      context.beginPath();
      var tp_height = (textfills.length + 0.25)*this.font_size ;
      var cx = point.cx;
      var cy = point.cy;
      var point_size = point.point_size;
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

      Shape.roundRect(tp_x, tp_y, tp_width, tp_height, this.tp_radius, context);
      context.strokeStyle = 'black';
      context.globalAlpha = this.opacity;
      context.fillStyle = this.colorfill;
      context.stroke();
      context.fill();
      context.fillStyle = this.text_color;
      context.textAlign = 'start';
      context.textBaseline = 'Alphabetic';

      var x_start = tp_x + 1/10*tp_width;
      context.font = this.font_size.toString() + 'px ' + this.font_style;

      var current_y = tp_y + 0.75*this.font_size;
      for (var i=0; i<textfills.length; i++) {
        context.fillText(textfills[i], x_start, current_y);
        current_y = current_y + this.font_size;
      }
      context.closePath();
      context.globalAlpha = 1;
    }

  }

  manage_tooltip(context, mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, tooltip_list, X, Y, x_nb_digits, y_nb_digits, point_list, elements, mergeON) {
    for (var i=0; i<tooltip_list.length; i++) {
      if (!(typeof tooltip_list[i] === "undefined") && this.isTooltipInsideCanvas(tooltip_list[i], mvx, mvy, scaleX, scaleY, canvas_width, canvas_height)) {
        this.draw(context, tooltip_list[i], mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, X, Y, x_nb_digits, y_nb_digits, point_list, elements, mergeON);
      }
    }
  }
}

export class Dataset {
  id:number=0;
  constructor(public point_list:Point2D[],
              public dashline: number[],
              public graph_colorstroke: string,
              public graph_linewidth: number,
              public segments:LineSegment[],
              public display_step:number,
              public tooltip:Tooltip,
              public type_: string,
              public name:string) {}

  public static deserialize(serialized) {
    var point_list = [];
    var temp = serialized['points'];
    for (var i=0; i<temp.length; i++) {
      var d = temp[i];
      point_list.push(Point2D.deserialize(d));
    }

    var segments = [];
    for (let i=0; i<point_list.length - 1; i++) {
      let current_point = point_list[i];
      let next_point = point_list[i+1];
      let data = [current_point.cx, current_point.cy, next_point.cx, next_point.cy];
      segments.push(new LineSegment(data, [], '', ''));
    }
    var tooltip = Tooltip.deserialize(serialized['tooltip']);
    return new Dataset(point_list,
                           serialized['dashline'],
                           rgb_to_hex(serialized['graph_colorstroke']),
                           serialized['graph_linewidth'],
                           segments,
                           serialized['display_step'],
                           tooltip,
                           serialized['type_'],
                           serialized['name']);
  }
}

export class Graph2D {
  constructor(public graphs: Dataset[],
              public axis: Axis,
              public type_: string,
              public name: string) {}

  public static deserialize(serialized) {
    var graphs:Dataset[] = [];
    for (let i=0; i<serialized['graphs'].length; i++) {
      graphs.push(Dataset.deserialize(serialized['graphs'][i]));
    }
    var axis = Axis.deserialize(serialized['axis']);

    return new Graph2D(graphs,
                        axis,
                        serialized['type_'],
                        serialized['name']);
  }
}

export class Scatter {

  point_list:Point2D[]=[];
  displayableAttributes:Attribute[]=[];
  lists:any[]=[];
  toDisplayAttributes:Attribute[]=[];

  constructor(public elements:Object[],
              public axis:Axis,
              public tooltip:Tooltip,
              public toDispAttNames:string[],
              public point_shape:string,
              public point_size:number,
              public color_fill:string,
              public color_stroke:string,
              public stroke_width:number,
              public type_:string,
              public name:string) {
    this.initialize_displayableAttributes();
    this.initialize_toDisplayAttributes();
    this.initialize_lists();
    this.initialize_point_list(elements);
  }

  public static deserialize(serialized) {
    var axis = Axis.deserialize(serialized['axis']);
    var tooltip = Tooltip.deserialize(serialized['tooltip']);
    return new Scatter(serialized['elements'],
                               axis,
                               tooltip,
                               serialized['to_display_att_names'],
                               serialized['point_shape'],
                               serialized['point_size'],
                               rgb_to_hex(serialized['color_fill']),
                               rgb_to_hex(serialized['color_stroke']),
                               serialized['stroke_width'],
                               serialized['type_'],
                               serialized['name']);
  }

  initialize_displayableAttributes() {
    var attribute_names = Object.getOwnPropertyNames(this.elements[0]);
    var exceptions = ['name', 'package_version', 'object_class'];
    for (let i=0; i<attribute_names.length; i++) {
      let name = attribute_names[i];
      if (!List.is_include(name, exceptions)) {
        let type_ = TypeOf(this.elements[0][name]);
        this.displayableAttributes.push(new Attribute(name, type_)); 
      }
    }
  }

  initialize_toDisplayAttributes() {
    for (let i=0; i<this.toDispAttNames.length; i++) {
      var name = this.toDispAttNames[i];
      for (let j=0; j<this.displayableAttributes.length; j++) {
        if (name == this.displayableAttributes[j]['name']) {
          this.toDisplayAttributes.push(this.displayableAttributes[j]);
          break;
        }
      }
    }
  }

  initialize_lists() {
    this.lists = [];
    for (let i=0; i<this.toDisplayAttributes.length; i++) {
      var value = [];
      var name = this.toDisplayAttributes[i].name;
      let type_ = this.toDisplayAttributes[i].type_;
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
      var elt0 = elements[i][this.toDisplayAttributes[0]['name']];
      var elt1 = elements[i][this.toDisplayAttributes[1]['name']];
      if (this.toDisplayAttributes[0]['type_'] == 'float') {
        var cx = elt0;
      } else if (this.toDisplayAttributes[0]['type_'] == 'color') {
        cx = List.get_index_of_element(rgb_to_string(elt0), this.lists[0]);
      } else {
        cx = List.get_index_of_element(elt0.toString(), this.lists[0]);
      }
      if (this.toDisplayAttributes[1]['type_'] == 'float') {
        var cy = -elt1;
      } else if (this.toDisplayAttributes[1]['type_'] == 'color') {
        cy = - List.get_index_of_element(rgb_to_string(elt1), this.lists[1]);
      } else {
        cy = - List.get_index_of_element(elt1.toString(), this.lists[1]);
      }
      this.point_list.push(new Point2D(cx, cy, this.point_shape, this.point_size, this.color_fill, this.color_stroke, this.stroke_width, 'point', ''));
    }
  }
}

export class Arc2D {
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
              public plot_data_states:Settings[],
              public type_:string,
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
        plot_data_states.push(Settings.deserialize(d));
      }
      return new Arc2D(serialized['cx'],
                                  serialized['cy'],
                                  serialized['r'],
                                  serialized['data'],
                                  serialized['angle1'],
                                  serialized['angle2'],
                                  plot_data_states,
                                  serialized['type_'],
                                  serialized['name']);
  }

  draw(context, first_elem, mvx, mvy, scaleX, scaleY, X, Y) {
    var ptsa = [];
    for (var l = 0; l < this.data.length; l++) {
      ptsa.push(scaleX*(1000*this.data[l]['x']+ mvx) + X);
      ptsa.push(scaleY*(1000*this.data[l]['y']+ mvy) + Y);
    }
    var tension = 0.4;
    var isClosed = false;
    var numOfSegments = 16;
    drawLines(context, getCurvePoints(ptsa, tension, isClosed, numOfSegments));
  }
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

export class Settings {

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
              public window_size:Window,
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
        window_size = Window.deserialize(serialized['window_size']);
      }
      var point_size = null;
      if (serialized['point_size'] != null) {
        point_size = PointSizeSet.deserialize(serialized['point_size']);
      }
      var point_color = null;
      if (serialized['point_color'] != null) {
        point_color = PointColorSet.deserialize(serialized['point_color']);
      }
      return new Settings(color_surface,
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
    return new Settings(this.color_surface, this.color_map, this.hatching, this.opacity, this.dash, this.marker, this.color_line, this.shape_set, this.point_size, this.point_color, this.window_size, this.stroke_width, this.name);
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

export class Window {
  constructor(public name:string, public height:number,public width:number){
  }

  public static deserialize(serialized) {
    return new Window(serialized['name'],
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

export class MyMath {
  public static round(x:number, n:number) {
    return Math.round(x*Math.pow(10,n)) / Math.pow(10,n);
  }
  public static log10(x) {
    return Math.log(x)/Math.log(10);
  }
}

export class Shape {

  public static drawLine(context, list) {
    context.moveTo(list[0][0], list[0][1]);
    for (var i=1; i<list.length; i++) {
      context.lineTo(list[i][0], list[i][1]);
    }
  }

  public static crux(context:any, cx:number, cy:number, length:number) {
    this.drawLine(context, [[cx, cy], [cx - length, cy]]);
    this.drawLine(context, [[cx, cy], [cx + length, cy]]);
    this.drawLine(context, [[cx, cy], [cx, cy - length]]);
    this.drawLine(context, [[cx, cy], [cx, cy + length]]);
  }

  public static roundRect(x, y, w, h, radius, context) {
    var r = x + w;
    var b = y + h;
    context.beginPath();
    context.strokeStyle="black";
    context.lineWidth="1";
    context.moveTo(x+radius, y);
    context.lineTo(r-radius, y);
    context.quadraticCurveTo(r, y, r, y+radius);
    context.lineTo(r, y+h-radius);
    context.quadraticCurveTo(r, b, r-radius, b);
    context.lineTo(x+radius, b);
    context.quadraticCurveTo(x, b, x, b-radius);
    context.lineTo(x, y+radius);
    context.quadraticCurveTo(x, y, x+radius, y);
    context.stroke();
    context.closePath();
  }

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
    context.font = police;
    context.fillText(text, x+w/2, y+h/1.8);
    context.fill();
    context.closePath();
  }

  public static createGraphButton(x, y, w, h, context, text, police, colorfill, strikeout) {
    context.beginPath();
    context.fillStyle = colorfill;
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

  public static rect(x, y, w, h, context, colorfill, colorstroke, linewidth, opacity, dashline) {
    context.beginPath();
    context.setLineDash(dashline);
    context.fillStyle = colorfill;
    context.strokeStyle = colorstroke;
    context.lineWidth = linewidth;
    context.globalAlpha = opacity;
    context.rect(x,y,w,h);
    if (colorfill != 'No') {
      context.fill();
    }
    if (colorstroke != 'No') {
      context.stroke();
    }
    context.closePath();
    context.globalAlpha = 1;
    context.setLineDash([]);
  }
}

export function drawLines(ctx, pts) {
  // ctx.moveTo(pts[0], pts[1]);
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

    nextCol += 50;
  }
  var col = "rgb(" + ret.join(',') + ")";
  return col;
}

export function componentToHex(c) {
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

var color_dict = [['red', '#f70000'], ['lightred', '#ed8080'], ['blue', '#0013fe'], ['lightblue', '#adb3ff'], ['lightskyblue', '#87CEFA'], ['green', '#00c112'], ['lightgreen', '#89e892'], ['yellow', '#f4ff00'], ['lightyellow', '#f9ff7b'], ['orange', '#ff8700'],
  ['lightorange', '#ff8700'], ['cyan', '#13f0f0'], ['lightcyan', '#90f7f7'], ['rose', '#FF69B4'], ['lightrose', '#FFC0CB'], ['violet', '#EE82EE'], ['lightviolet', '#eaa5f6'], ['white', '#ffffff'], ['black', '#000000'], ['brown', '#cd8f40'],
  ['lightbrown', '#DEB887'], ['grey', '#A9A9A9'], ['lightgrey', '#D3D3D3']];

export function hex_to_string(hexa:string): string {
  for (var i=0 ;i<color_dict.length; i++) {
    if (hexa.toUpperCase() === color_dict[i][1].toUpperCase()) {
      return color_dict[i][0];
    }
  }
  throw new Error('hex_to_string -> Invalid color : ' + hexa + ' not in list');
}

export function hexToRgbObj(hex):Object { // Returns an object {r: ..., g: ..., b: ...}
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function hex_to_rgb(hex:string): string {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(result[1], 16);
  var g = parseInt(result[2], 16);
  var b = parseInt(result[3], 16);
  return rgb_vectorToStr(r, g, b);
}

export function string_to_hex(str:string): string {
  for (var i=0 ;i<color_dict.length; i++) {
    if (str.toUpperCase() === color_dict[i][0].toUpperCase()) {
      return color_dict[i][1];
    }
  }
  throw new Error('string_to_hex -> Invalid color : ' + str + ' not in list');
}

export function rgb_to_string(rgb:string): string {
  return hex_to_string(rgb_to_hex(rgb));
}

export function color_to_string(color:string): string {
  if (isHex(color)) {
    return hex_to_string(color);
  } else if (isRGB(color)) {
    return rgb_to_string(color);
  }
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

class Sort {
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
    if (attribute_type == 'float') {
      var list_copy = List.copy(list);
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
      for (let i=0; i<list.length; i++) {
        if (!List.is_include(list[i][attribute_name], strings)) {
          strings.push(list[i][attribute_name]);
        }
      }
      let sorted_list = [];
      for (let i=0; i<strings.length; i++) {
        for (let j=0; j<list.length; j++) {
          if (strings[i] === list[j][attribute_name]) {
            sorted_list.push(list[j]);
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

export class List {
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
  }

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

  public static remove_selection(val:any, list:any[]): any[] { //remove every element=val from list
    var temp = [];
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if (val != d) {
        temp.push(d);
      }
    }
    return temp;
  }

  public static is_include(val:any, list:any[]): boolean {
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if (equals(val,d)) {
        return true;
      }
    }
    return false;
  }

  public static is_list_include(list:any[], listArray:any[][]) { //check if a list is inside a list of lists
    for (let i=0; i<listArray.length; i++) {
        if (equals(listArray[i], list)) {
            return true;
        }
    }
    return false;
  }

  public static is_name_include(name:string, obj_list:any[]): boolean {
    for (let i=0; i<obj_list.length; i++) {
      if (name === obj_list[i].name) {
        return true;
      }
    }
    return false;
  }

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

  public static get_index_of_element(val:any, list:any[]):number {
    for (var i=0; i<list.length; i++) {
      if (val === list[i]) {
        return i;
      }
    }
    throw new Error('cannot get index of element')
  }

  public static remove_at_index(i:number, list:any[]):any[] {
    return list.slice(0, i).concat(list.slice(i + 1, list.length));
  }

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

  public static switchElements(list:any[], index1:number, index2:number): void {
    [list[index1], list[index2]] = [list[index2], list[index1]];
  }

  public static reverse(list:any[]): any[] {
    return List.copy(list).reverse();
  }
} //end class List

export function equals(obj1:any, obj2:any): boolean { //Works on any kind of objects, including strings and arrays. Also works on numbers
  if ((obj1 === undefined) || (obj2 === undefined)) {
    return false;
  }
  var objClass1 = obj1.constructor.name;
  var objClass2 = obj2.constructor.name;
  if (objClass1 != objClass2) {
    return false;
  }
  if (objClass1 == 'Number') {
    return obj1 == obj2;
  }
  var attribute_names = Object.getOwnPropertyNames(obj1);
  for (let i=0; i<attribute_names.length; i++) {
    let attr_name = attribute_names[i];
    if (obj1[attr_name] !== obj2[attr_name]) {
      return false;
    }
  }
  return true;
}

var attr_x = new Attribute('cx', 'float');
var attr_y = new Attribute('cy', 'float');