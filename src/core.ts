export class MultiplePlots {
  context_show:any;
  context_hidden:any;
  context:any;
  objectList:any[]=[];
  dataObjects:any[]=[]
  nbObjects:number=0;
  coords:[number, number][];
  points:PlotDataPoint2D[]=[];
  sizes:Window[]=[];
  selected_index:number=-1;
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
  initial_object_X:number=0;
  initial_object_Y:number=0;
  initial_object_width:number=0;
  initial_object_height:number=0;
  initial_mouseX:number=0;
  initial_mouseY:number=0;
  

  constructor(public data: any[], public width:number, public height:number, coeff_pixel: number, public buttons_ON: boolean) {
    var data_show = data[0];
    this.coords = data_show['coords'];
    this.dataObjects = data_show['objects'];
    var points = data_show['points'];
    var temp_sizes = data_show['sizes'];
    for (let i=0; i<temp_sizes.length; i++) {
      this.sizes.push(Window.deserialize(temp_sizes[i]));
    }

    this.nbObjects = this.dataObjects.length;
    this.define_canvas();
    for (let i=0; i<this.nbObjects; i++) {
      if (this.dataObjects[i]['type'] == 'ScatterPlot') {
        this.dataObjects[i]['elements'] = points;
        let newObject = new PlotScatter([this.dataObjects[i]], this.sizes[i]['width'], this.sizes[i]['height'], coeff_pixel, buttons_ON, this.coords[i][0], this.coords[i][1]);
        this.initializeObjectContext(newObject);
        this.objectList.push(newObject);
      } else if (this.dataObjects[i]['type'] == 'ParallelPlot') {
        this.dataObjects[i]['elements'] = points;
        let newObject = new ParallelPlot([this.dataObjects[i]], this.sizes[i]['width'], this.sizes[i]['height'], coeff_pixel, buttons_ON, this.coords[i][0], this.coords[i][1]);
        this.initializeObjectContext(newObject)
        this.objectList.push(newObject);
      } else {
        throw new Error('Invalid object type');
      }
    }
    for (let i=0; i<this.nbObjects; i++) {
      this.objectList[i].draw_initial();
    }
    this.mouse_interaction();

    if (buttons_ON) {
      this.initializeButtons();
      this.draw_manipulation_button();
      this.draw_selection_dependency_button();
    }
  }

  resize_canvas(new_width:number, new_height): void {
    var old_width = this.width;
    this.width = new_width;
    var ratio = new_width/old_width;
    this.height = new_height;
    for (let i=0; i<this.objectList.length; i++) {
      this.objectList[i].X = this.objectList[i].X * ratio;
      this.objectList[i].Y = this.objectList[i].Y * ratio;
    }
    this.define_canvas();
    this.RedrawAllObjects();
  }

  initializeButtons():void {
    this.transbutton_x = this.width - 45;
    this.transbutton_y = 10;
    this.transbutton_w = 35;
    this.transbutton_h = 25;
    this.selectDep_x = this.width - 50;
    this.selectDep_y = 40;
    this.selectDep_w = 40;
    this.selectDep_h = 20;
  }

  draw_manipulation_button():void {
    if (this.manipulation_bool === true) {
      Shape.createButton(this.transbutton_x, this.transbutton_y, this.transbutton_w, this.transbutton_h, this.context_show, 'True', '12px sans-serif');
    } else {
      Shape.createButton(this.transbutton_x, this.transbutton_y, this.transbutton_w, this.transbutton_h, this.context_show, 'False', '12px sans-serif');
    }
  }

  draw_selection_dependency_button():void {
    if (this.selectDependency_bool === true) {
      Shape.createButton(this.selectDep_x, this.selectDep_y, this.selectDep_w, this.selectDep_h, this.context_show, "Dep ON", '10px sans-serif');
    } else {
      Shape.createButton(this.selectDep_x, this.selectDep_y, this.selectDep_w, this.selectDep_h, this.context_show, "Dep OFF", '10px sans-serif');
    }
  }

  initializeObjectContext(object):void {
    object.context_show = this.context_show;
    object.context_hidden = this.context_hidden;
  }

  define_canvas():void {
    var canvas:any = document.getElementById('canvas');
    canvas.width = this.width;
		canvas.height = this.height;
    this.context_show = canvas.getContext("2d");

    var hiddenCanvas = document.createElement("canvas");
		hiddenCanvas.width = this.width;
		hiddenCanvas.height = this.height;
    this.context_hidden = hiddenCanvas.getContext("2d");
  }

  getObjectIndex(x,y):number {
    var index = -1;
    for (let i=0; i<this.nbObjects; i++) {
      let isInObject = Shape.Is_in_rect(x, y, this.objectList[i].X, this.objectList[i].Y, this.objectList[i].width, this.objectList[i].height);
      if (isInObject === true) {
        index = i;
      }
    }
    return index;
  }

  ClearCanvas():void {
    this.context_show.beginPath();
    this.context_show.clearRect(0, 0, this.width, this.height);
    this.context_show.stroke();
    this.context_show.closePath();
    this.context_hidden.beginPath();
    this.context_hidden.clearRect(0, 0, this.width, this.height);
    this.context_hidden.stroke();
    this.context_hidden.closePath();
  }

  RedrawAllObjects():void {
    this.ClearCanvas();
    for (let i=0; i<this.objectList.length; i++) {
      let obj = this.objectList[i];
      obj.draw(false, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
      obj.draw(true, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
    }
    if (this.buttons_ON) {
      this.draw_manipulation_button();
      this.draw_selection_dependency_button();
    }
  }

  RedrawMovingObjects(selected_index, mouse1X, mouse1Y, mouse2X, mouse2Y):void {
    this.ClearCanvas();
    for (let i=0; i<this.objectList.length; i++) {
      let obj = this.objectList[i];
      if (i == selected_index) {
        obj.draw(false, 0, obj.last_mouse1X + (mouse2X - mouse1X)/obj.scaleX, obj.last_mouse1Y + (mouse2Y - mouse1Y)/obj.scaleY, obj.scaleX, obj.scaleY, obj.X, obj.Y);
        obj.draw(true, 0, obj.last_mouse1X + (mouse2X - mouse1X)/obj.scaleX, obj.last_mouse1Y + (mouse2Y - mouse1Y)/obj.scaleY, obj.scaleX, obj.scaleY, obj.X, obj.Y);
      } else {
        obj.draw(false, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
        obj.draw(true, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
      }
    }
    if (this.buttons_ON) {
      this.draw_manipulation_button();
      this.draw_selection_dependency_button();
    }
  }

  isZwSelectBoolOn():boolean {
    for (let i=0; i<this.objectList.length; i++) {
      if ((this.objectList[i].zw_bool === true) || (this.objectList[i].select_bool === true)) {
        return true;
      }
    }
    return false;
  }

  TranslateSelectedObject(selected_index, tx, ty):void {
    var obj = this.objectList[selected_index]
    obj.X = this.initial_object_X + tx;
    obj.Y = this.initial_object_Y + ty;
    this.RedrawAllObjects();
  }

  InitializeObjectXY(selected_index):void {
    this.initial_object_X = this.objectList[selected_index].X;
    this.initial_object_Y = this.objectList[selected_index].Y;
  }
  SetAllInteractionsToOff():void {
    for (let i=0; i<this.objectList.length; i++) {
      this.objectList[i].interaction_ON = false;
    }
  }

  manipulable_bool_action() {
    this.manipulation_bool = !this.manipulation_bool;
    for (let i=0; i<this.objectList.length; i++) {
      this.objectList[i].manipulable_ON = this.manipulation_bool;
    }
    this.selectDependency_bool = false;
  }

  Initialize_ClickOnVertex(mouse1X, mouse1Y, clicked_obj_index):[boolean, boolean, boolean, boolean, boolean] { //[vertex_object_index, clickOnVertex, up, down, left, right]
    var thickness = 15;
    let obj = this.objectList[clicked_obj_index];
    let up = Shape.Is_in_rect(mouse1X, mouse1Y, obj.X - thickness/2, obj.Y - thickness/2, obj.width + thickness, thickness);
    let down = Shape.Is_in_rect(mouse1X, mouse1Y, obj.X - thickness/2, obj.Y + obj.height - thickness/2, obj.width + thickness, thickness); 
    let left = Shape.Is_in_rect(mouse1X, mouse1Y, obj.X - thickness/2, obj.Y - thickness/2, thickness, obj.height + thickness);
    let right = Shape.Is_in_rect(mouse1X, mouse1Y, obj.X + obj.width - thickness/2, obj.Y - thickness/2, thickness, obj.height + thickness);
    let clickOnVertex = up || down || left || right;
    return [clickOnVertex, up, down, left, right];
  }

  setCursorStyle(mouse2X, mouse2Y, canvas) {
    if (this.selected_index != -1) {
      var thickness = 15;
      var up = false;
      var down = false;
      var left = false;
      var right = false;
      let obj = this.objectList[this.selected_index];
      up = Shape.Is_in_rect(mouse2X, mouse2Y, obj.X - thickness/2, obj.Y - thickness/2, obj.width + thickness, thickness);
      down = Shape.Is_in_rect(mouse2X, mouse2Y, obj.X - thickness/2, obj.Y + obj.height - thickness/2, obj.width + thickness, thickness); 
      left = Shape.Is_in_rect(mouse2X, mouse2Y, obj.X - thickness/2, obj.Y - thickness/2, thickness, obj.height + thickness);
      right = Shape.Is_in_rect(mouse2X, mouse2Y, obj.X + obj.width - thickness/2, obj.Y - thickness/2, thickness, obj.height + thickness);
      var resize_style = '';
      if (up) {resize_style = resize_style + 'n';}
      if (down) {resize_style = resize_style + 's';}
      if (left) {resize_style = resize_style + 'w';}
      if (right) {resize_style = resize_style + 'e';}
      if (resize_style == '') {
        canvas.style.cursor = 'default';
      } else {
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

  initialize_object_hw(selected_index) {
    this.initial_object_width = this.objectList[selected_index].width;
    this.initial_object_height = this.objectList[selected_index].height;
  } 

  ResizeObject(vertex_object_index, up, down, left, right, mouse2X, mouse2Y):void {
    var widthSizeLimit = 100;
    var heightSizeLimit = 100;
    var obj:PlotData = this.objectList[vertex_object_index];
    var deltaX = mouse2X - this.initial_mouseX;
    var deltaY = mouse2Y - this.initial_mouseY;
    if (up === true) {
      if (this.initial_object_height - deltaY > heightSizeLimit) {
        obj.Y = this.initial_object_Y + deltaY;
        obj.height = this.initial_object_height - deltaY;
      } else {
        obj.height = heightSizeLimit;
      }
    }
    if (down === true) {
      if (this.initial_object_height + deltaY > heightSizeLimit) {
        obj.height = this.initial_object_height + deltaY;
      } else {
        obj.height = heightSizeLimit;
      }
    }
    if (left === true) {
      if (this.initial_object_width - deltaX > widthSizeLimit) {
        obj.X = this.initial_object_X + deltaX;
        obj.width = this.initial_object_width - deltaX;
      } else {
        obj.width = widthSizeLimit;
      }
    }
    if (right === true) {
      if (this.initial_object_width + deltaX > widthSizeLimit) {
        obj.width = this.initial_object_width + deltaX;
      } else {
        obj.width = widthSizeLimit;
      }
    }
    this.RedrawAllObjects();
  }

  selectDep_action():void {
    this.selectDependency_bool = !this.selectDependency_bool;
    this.manipulation_bool = false;
    for (let i=0; i<this.objectList.length; i++) {
      this.objectList[i].manipulable_ON = this.manipulation_bool;
    }
  }

  getSelectionONObject():number {
    for (let i=0; i<this.objectList.length; i++) {
      if (this.objectList[i].isSelecting === true) {
        return i;
      }
    }
    return -1;
  }

  Dependency_rubberbands_draw(selection_coords:[number, number][], toDisplayAttributes:Attribute[]):void {
    for (let i=0; i<selection_coords.length; i++) {
      for (let j=0; j<this.nbObjects; j++) {
        if (this.objectList[j]['type'] == 'ParallelPlot') {
          let obj = this.objectList[j];
          for (let k=0; k<obj.axis_list.length; k++) {
            if (toDisplayAttributes[i]['name'] == obj.axis_list[k]['name']) {
              obj.add_to_rubberbands(selection_coords[i], toDisplayAttributes[i], k);
              obj.draw(false, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
              obj.draw(true, 0, obj.last_mouse1X, obj.last_mouse1Y, obj.scaleX, obj.scaleY, obj.X, obj.Y);
            }
          }
        }
      }
    }
  }

  manage_mouse_interactions(mouse2X:number, mouse2Y:number):void {
    this.selected_index = this.getObjectIndex(mouse2X, mouse2Y);
    if (this.selected_index != this.last_index) {
      for (let i=0; i<this.objectList.length; i++) {
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

  Dependency_scatter_selection(rubberbands_dep:[string, [number, number]][]) {
    for (let i=0; i<this.nbObjects; i++) {
      var obj:PlotData = this.objectList[i];
      var axis_numbers:number[] = [];
      if (obj.type == 'ScatterPlot') {
        var to_select:[string, [number, number]][] = [];
        for (let j=0; j<rubberbands_dep.length; j++) {
          for (let k=0; k<obj.plotObject.toDisplayAttributes.length; k++) {
            if (rubberbands_dep[j][0] == obj.plotObject.toDisplayAttributes[k]['name']) {
              to_select.push(rubberbands_dep[j]);
              axis_numbers.push(k);
            }
          }
        }
        obj.dep_scatter_selection(to_select, axis_numbers);
      }
      
    }
  }

  mouse_interaction() {
    var canvas = document.getElementById('canvas');
    var mouse1X:number = 0;
    var mouse1Y:number = 0;
    var mouse2X:number = 0;
    var mouse2Y:number = 0;
    var mouse3X:number = 0;
    var mouse3Y:number = 0;
    var isDrawing = false;
    var mouse_moving:boolean = false;
    var clickUp:boolean = false;
    var clickDown:boolean = false;
    var clickLeft:boolean = false;
    var clickRight:boolean = false;
    var clickOnVertex:boolean = false;
    var clicked_obj_index = -1;

    for (let i=0; i<this.objectList.length; i++) {
      this.objectList[i].mouse_interaction(this.objectList[i].isParallelPlot);
    }
    this.SetAllInteractionsToOff();

    canvas.addEventListener('mousedown', e => {
      isDrawing = true;
      mouse1X = e.offsetX;
      mouse1Y = e.offsetY;
      clicked_obj_index = this.getObjectIndex(mouse1X, mouse1Y);
      if (this.manipulation_bool) {
        this.SetAllInteractionsToOff();
        if (clicked_obj_index != -1) {
          this.InitializeObjectXY(clicked_obj_index);
          [clickOnVertex, clickUp, clickDown, clickLeft, clickRight] = this.Initialize_ClickOnVertex(mouse1X, mouse1Y, clicked_obj_index);
        }
        if (clickOnVertex) {
          this.initializeMouseXY(mouse1X, mouse1Y);
          this.InitializeObjectXY(clicked_obj_index);
          this.initialize_object_hw(clicked_obj_index);
        }
      }
    });

    canvas.addEventListener('mousemove', e => {
      mouse2X = e.offsetX;
      mouse2Y = e.offsetY;
      if (this.manipulation_bool) {
        if (isDrawing) {
          mouse_moving = true;
          if ((clicked_obj_index != -1) && !(clickOnVertex)) {
            this.SetAllInteractionsToOff();
            let tx = mouse2X - mouse1X;
            let ty = mouse2Y - mouse1Y;
            canvas.style.cursor = 'move';
            this.TranslateSelectedObject(clicked_obj_index, tx, ty);
          } else if (clickOnVertex) {
            this.ResizeObject(clicked_obj_index, clickUp, clickDown, clickLeft, clickRight, mouse2X, mouse2Y);
          }
        } else {
          this.selected_index = this.getObjectIndex(mouse2X, mouse2Y);
          this.setCursorStyle(mouse2X, mouse2Y, canvas);
        }
      } else {
        this.manage_mouse_interactions(mouse2X, mouse2Y);
        if (isDrawing) {
          if (this.selectDependency_bool) {
            let isSelectingObjIndex = this.getSelectionONObject();
            if (isSelectingObjIndex != -1) {
              let isSelectingScatter = this.objectList[isSelectingObjIndex];
              let selection_coords = isSelectingScatter.selection_coords;
              let toDisplayAttributes:Attribute[] = isSelectingScatter.plotObject.toDisplayAttributes;
              this.Dependency_rubberbands_draw(selection_coords, toDisplayAttributes);
            }
  
             let isDrawingRubberObjIndex = this.get_drawing_rubberbands_obj_index();
             if (isDrawingRubberObjIndex != -1) {
               let isDrawingPP = this.objectList[isDrawingRubberObjIndex];
               let rubberbands_dep = isDrawingPP.rubberbands_dep;
               this.Dependency_scatter_selection(rubberbands_dep);
             }
          }
          if ((clicked_obj_index != -1)  && (this.objectList[clicked_obj_index].isSelecting === false)) {
            this.RedrawMovingObjects(clicked_obj_index, mouse1X, mouse1Y, mouse2X, mouse2Y);
          }
        } else {
          this.RedrawAllObjects();
        }
      } 
    });

    canvas.addEventListener('mouseup', e => {
      mouse3X = e.offsetX;
      mouse3Y = e.offsetY;
      var click_on_translation_button = Shape.Is_in_rect(mouse3X, mouse3Y, this.transbutton_x, this.transbutton_y, this.transbutton_w, this.transbutton_h);
      var click_on_selectDep_button = Shape.Is_in_rect(mouse3X, mouse3Y, this.selectDep_x, this.selectDep_y, this.selectDep_w, this.selectDep_h);
      if (click_on_translation_button) {
        this.manipulable_bool_action();
      } else if (click_on_selectDep_button) {
        this.selectDep_action();
      }
      if (mouse_moving === false) {
        this.clickedPlotIndex = this.getObjectIndex(mouse3X, mouse3Y);
      }
      this.RedrawAllObjects();
      isDrawing = false;
      mouse_moving = false;
    });
    
    canvas.addEventListener('wheel', e => {
      this.RedrawAllObjects();
    });

    canvas.addEventListener('mouseleave', e => {
      isDrawing = false;
      mouse_moving = false;
    })
  }
}

export abstract class PlotData {
  type:string;
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
  graph_colorlist:string[]=[];
  graph_name_list:string[]=[];
  graph_text_spacing_list:number[]=[];
  decalage_axis_x = 50;
  decalage_axis_y = 20;
  last_point_list:any[]=[];
  scatter_point_list:PlotDataPoint2D[]=[];
  scatter_init_points:PlotDataPoint2D[]=[];
  refresh_point_list_bool:boolean=true;

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

  public constructor(public data:any, 
    public width: number,
    public height: number,
    public coeff_pixel: number,
    public buttons_ON: boolean,
    public X: number,
    public Y: number) {}

  
  abstract draw(hidden, show_state, mvx, mvy, scaleX, scaleY, X, Y);
  
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

  set_canvas_size(height:number, width:number) {
    this.height = height;
    this.width = width;
  }

  draw_initial() {
    this.Reset_scales();
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

  Reset_scales() {
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
      this.last_mouse1X = (this.width/2 - (this.coeff_pixel*this.maxX - this.coeff_pixel*this.minX)*this.scaleX/2)/this.scaleX - this.coeff_pixel*this.minX;
      this.last_mouse1Y = (this.height/2 - (this.coeff_pixel*this.maxY - this.coeff_pixel*this.minY)*this.scaleY/2)/this.scaleY - this.coeff_pixel*this.minY;
    }
  }

  draw_rect() {
    if (this.manipulable_ON === false) {
      Shape.rect(this.X, this.Y, this.width, this.height, this.context, 'white', this.initRectColorStroke, this.initRectLinewidth, 1, this.initRectDashline);
    }
  }

  draw_empty_canvas(hidden) {
    if (hidden) {
      this.context = this.context_hidden;
    } else {
      this.context = this.context_show;
    }
    this.context.clearRect(this.X - 1, this.Y - 1, this.width + 2, this.height + 2);
  }

  draw_manipulable_rect() {
    Shape.rect(this.X, this.Y, this.width, this.height, this.context, this.manipRectColorfill, this.manipRectColorstroke, this.manipRectLinewidth, this.manipRectOpacity, this.manipRectDashline);
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
        elem.draw(this.context, first_elem,  mvx, mvy, scaleX, scaleY, this.X, this.Y);
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
        this.context.fillStyle = d.color_fill;
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
              this.context.fillStyle = this.color_surface_on_click;         
            }
          }
        }
      }
      var x = scaleX*(1000*d.cx+ mvx);
      var y = scaleY*(1000*d.cy + mvy);
      this.pointLength = 1000*d.size;

      var is_inside_canvas = ((x - this.pointLength>=0) && (x + this.pointLength <= this.width) && (y - this.pointLength >= 0) && (y + this.pointLength <= this.height));

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
    if (d['type'] == 'axis'){
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
    if (d['type'] == 'tooltip') {
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

  draw_graph2D(d, hidden, mvx, mvy) {
    if ((d['type'] == 'graph2D') && (this.graph_to_display[d.id] === true)) {
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
    } else if ((d['type'] == 'graph2D') && (this.graph_to_display[d.id] === false)) {
      this.delete_clicked_points(d.point_list);
      this.delete_tooltip(d.point_list);
    }
  }

  draw_graphs2D(d, hidden, mvx, mvy) {
    if (d['type'] == 'graphs2D') {
      for (let i=0; i<d.graphs.length; i++) {
        let graph = d.graphs[i];
        this.draw_graph2D(graph, hidden, mvx, mvy);
      }
      this.draw_axis(mvx, mvy, this.scaleX, this.scaleY, d.axis);
      for (let i=0; i<d.graphs.length; i++) {
        let graph = d.graphs[i];
        this.draw_tooltip(graph.tooltip, mvx, mvy, graph.point_list, graph.point_list, false);
      }
    }
  }

  draw_scatterplot(d, hidden, mvx, mvy) {
    if (d['type'] == 'ScatterPlot') {
      if (((this.scroll_x%5==0) || (this.scroll_y%5==0)) && this.refresh_point_list_bool && this.mergeON){
        this.scatter_point_list = this.refresh_point_list(d.point_list,mvx,mvy);
        this.refresh_point_list_bool = false;
      } else if (this.mergeON === false) {
        if (!arrayEquals(this.scatter_point_list, d.point_list)) {
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
        if (!is_include(this.tooltip_list[i],this.scatter_point_list)) {
          this.tooltip_list = this.remove_selection(this.tooltip_list[i], this.tooltip_list);
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
      var attribute_type = this.axis_list[i]['type'];
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
      var attribute_type = this.axis_list[i]['type'];
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

  add_to_rubberbands(coordinates:[number, number], attribute, index):void {
    var attribute_type = attribute['type'];
    var real_min = this.convert_real_to_axis_coord(coordinates[0], attribute_type, this.axis_list[index]['list'], this.inverted_axis_list[index]);
    var real_max = this.convert_real_to_axis_coord(coordinates[1], attribute_type, this.axis_list[index]['list'], this.inverted_axis_list[index]);
    var min = Math.min(real_min, real_max);
    var max = Math.max(real_min, real_max);
    this.rubber_bands[index] = [min, max];
  }

  convert_real_to_axis_coord(real_coord, type, list, inverted) {
    if (type == 'float') {
      if (this.vertical) {
        var axis_coord_start = this.axis_y_start;
        var axis_coord_end = this.axis_y_end;
      } else {
        var axis_coord_start = this.axis_x_start;
        var axis_coord_end = this.axis_x_end;
      }
      let pp_coord = this.get_coord_on_parallel_plot(type, list, real_coord, axis_coord_start, axis_coord_end, inverted);
      let axis_coord = Math.min(Math.max((pp_coord - this.axis_y_end)/(this.axis_y_start - this.axis_y_end), 0), 1);
      return axis_coord;
    } else {
      var nb_values = list.length;
      if (nb_values == 1) {
        return 0.5;
      } else {
        if (inverted) {
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
        var color_index = get_index_of_element(color, current_list);
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


  draw_parallel_coord_lines(nb_axis:number) {
    for (var i=0; i<this.to_display_list.length; i++) {
      var to_display_list_i = this.to_display_list[i];
      var current_attribute_type = this.axis_list[0]['type'];
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
        var next_attribute_type = this.axis_list[j]['type'];
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
      if (selected === true) {
        this.context.strokeStyle = this.parallel_plot_lineColor;
      } else {
        this.context.strokeStyle = string_to_hex('lightgrey');
      }
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

  dep_scatter_selection(to_select:[string, [number, number]][], axis_numbers:number[]):void {
    var new_select_on_click = [];
    if (to_select.length == 1) {
      var to_select_name = to_select[0][0];
      var min = to_select[0][1][0];
      var max = to_select[0][1][1];
      for (let i=0; i<this.scatter_point_list.length; i++) {
        if (axis_numbers[0] == 0) {
          var bool = (this.scatter_point_list[i].cx >= min) && (this.scatter_point_list[i].cx <= max);
        } else {
          var bool = (-this.scatter_point_list[i].cy >= min) && (-this.scatter_point_list[i].cy <= max)
        }
        if (bool === true) {
          new_select_on_click.push(this.scatter_point_list[i]);
        }
      }
      this.select_on_click = new_select_on_click;
    } else if (to_select.length == 2) {
      var min1 = to_select[0][1][0];
      var max1 = to_select[0][1][1];
      var min2 = to_select[1][1][0];
      var max2 = to_select[1][1][1];
      for (let i=0; i<this.scatter_point_list.length; i++) {
        let point = this.scatter_point_list[i];
        if (axis_numbers[0] == 0) {
          var bool1 = (point.cx >= min1) && (point.cx <= max1);
        } else {
          var bool1 = (-point.cy >= min1) && (-point.cy <= max1);
        }
        if (axis_numbers[1] == 0) {
          var bool2 = (point.cx >= min2) && (point.cx <= max2);
        } else {
          var bool2 = (-point.cy >= min2) && (-point.cy <= max2);
        }
        if (bool1 && bool2) {
          new_select_on_click.push(point);
        } 
      }
      this.select_on_click = new_select_on_click;
    }
    this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }

  refresh_to_display_list(elements) {
    this.to_display_list = [];
    for (var i=0; i<elements.length; i++) {
      var to_display = [];
      for (var j=0; j<this.axis_list.length; j++) {
        var attribute_name = this.axis_list[j]['name'];
        var type = this.axis_list[j]['type'];
        if (type == 'color') {
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
          this.displayable_attributes = remove_at_index(j, this.displayable_attributes);
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
        this.axis_list = this.remove_selection(this.axis_list[i], this.axis_list);
        break;
      }
    }
    if (is_in_axislist === false) {
      throw new Error('Cannot remove axis that is not displayed');
    }
    this.refresh_attribute_booleans();
    this.refresh_to_display_list(this.elements);
    this.rubber_bands = remove_at_index(i, this.rubber_bands);
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
    this.plotObject.initialize_point_list();
    this.refresh_MinMax(this.plotObject.point_list);
    this.Reset_scales();
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
    this.plotObject.initialize_point_list();
    this.refresh_MinMax(this.plotObject.point_list);
    this.Reset_scales();
    if (this.mergeON) {this.scatter_point_list = this.refresh_point_list(this.plotObject.point_list, this.last_mouse1X, this.last_mouse1Y);}
    this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }

  add_to_tooltip(tooltip:PlotDataTooltip, str:string): PlotDataTooltip {
    tooltip.to_plot_list.push(str);
    return tooltip;
  }

  remove_from_tooltip(tooltip:PlotDataTooltip, str:string): PlotDataTooltip {
    tooltip.to_plot_list = this.remove_selection(str, tooltip.to_plot_list);
    return tooltip;
  }

  zoom_button(x, y, w, h) {
    var actualX = x + this.X;
    var actualY = y + this.Y;
    this.context.strokeStyle = 'black';
    this.context.beginPath();
    this.context.lineWidth = "2";
    this.context.fillStyle = 'white';
    this.context.rect(actualX, actualY, w, h);
    this.context.rect(actualX, actualY + h, w, h);
    this.context.moveTo(actualX, actualY+h);
    this.context.lineTo(actualX+w, actualY+h);
    Shape.crux(this.context, actualX+w/2, actualY+h/2, h/3);
    this.context.moveTo(actualX + w/2 - h/3, actualY + 3*h/2);
    this.context.lineTo(actualX + w/2 + h/3, actualY + 3*h/2);
    this.context.fill();
    this.context.stroke();
    this.context.closePath();
  }

  zoom_window_button(x, y, w, h) {
    this.context.strokeStyle = 'black';
    if (this.zw_bool) {
      Shape.createButton(x + this.X, y + this.Y, w, h, this.context, "Z ON", "12px Arial");
    } else {
      Shape.createButton(x + this.X, y + this.Y, w, h, this.context, "Z OFF", "12px Arial");
    }
    
  }

  reset_button(x, y, w, h) {
    this.context.strokeStyle = 'black';
    Shape.createButton(x + this.X, y + this.Y, w, h, this.context, "Reset", "12px Arial");
  }

  selection_button(x, y, w, h) {
    this.context.strokeStyle = 'black';
    if (this.select_bool) {
      Shape.createButton(x + this.X, y + this.Y, w, h, this.context, "S ON", "12px Arial")
    } else {
      Shape.createButton(x + this.X, y + this.Y, w, h, this.context, "S OFF", "12px Arial")
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
        Shape.createGraphButton(this.graph1_button_x + i*w + text_spacing_sum_i + this.X, y + this.Y, w, h, this.context, this.graph_name_list[i], police, this.graph_colorlist[i], false);
      } else {
        Shape.createGraphButton(this.graph1_button_x + i*w + text_spacing_sum_i + this.X, y + this.Y, w, h, this.context, this.graph_name_list[i], police, this.graph_colorlist[i], true);
      }
      text_spacing_sum_i = text_spacing_sum_i + this.graph_text_spacing_list[i];
    }
  }

  disp_button(x, y, w, h, police) {
    Shape.createButton(x, y, w, h, this.context, 'Disp', police);
  }

  merge_button(x, y, w, h, police) {
    if (this.mergeON) {
      Shape.createButton(x + this.X, y + this.Y, w, h, this.context, 'mergeON', police);
    } else {
      Shape.createButton(x + this.X, y + this.Y, w, h, this.context, 'mergeOFF', police);
    }
  }

  zoom_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y, scale_ceil) {
    this.context_show.setLineDash([]);
    this.context_hidden.setLineDash([]);
    var zoom_coeff_x = this.width/Math.abs(mouse2X - mouse1X);
    var zoom_coeff_y = this.height/Math.abs(mouse2Y - mouse1Y);
    if ((this.scaleX*zoom_coeff_x < scale_ceil) && (this.scaleY*zoom_coeff_y < scale_ceil)) {
      this.last_mouse1X = this.last_mouse1X - Math.min(mouse1X - this.X, mouse2X - this.X)/this.scaleX;
      this.last_mouse1Y = this.last_mouse1Y - Math.min(mouse1Y - this.Y,mouse2Y - this.Y)/this.scaleY;
      this.scaleX = this.scaleX*zoom_coeff_x;
      this.scaleY = this.scaleY*zoom_coeff_y;
      this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
      this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    }
  }

  selection_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y) {
    this.context_show.setLineDash([]);
    this.context_hidden.setLineDash([]);
    var in_rect = Shape.Is_in_rect(this.scaleX*(1000*this.plotObject.cx + this.last_mouse1X),this.scaleY*(1000*this.plotObject.cy + this.last_mouse1Y), Math.min(mouse1X, mouse2X), Math.min(mouse1Y, mouse2Y), Math.abs(mouse2X - mouse1X), Math.abs(mouse2Y - mouse1Y));
    if ((this.plotObject['type']=="point") && (in_rect === true) && !(is_include(this.plotObject, this.select_on_click))) {
      this.select_on_click.push(this.plotObject);
    } else if (this.plotObject['type'] == 'graphs2D') {
      for (let i=0; i<this.plotObject.graphs.length; i++) {
        let graph = this.plotObject.graphs[i];
        for (let j=0; j<graph.point_list.length; j++) {
          let point = graph.point_list[j];
          var x = this.scaleX*(1000*point.cx + this.last_mouse1X) + this.X;
          var y = this.scaleY*(1000*point.cy + this.last_mouse1Y) + this.Y;
          in_rect = Shape.Is_in_rect(x, y, Math.min(mouse1X, mouse2X), Math.min(mouse1Y, mouse2Y), Math.abs(mouse2X - mouse1X), Math.abs(mouse2Y - mouse1Y));
          if ((in_rect===true) && !(is_include(point, this.select_on_click))) {
            this.select_on_click.push(point);
          }
        }
      }
      
    } else if (this.plotObject['type'] == 'ScatterPlot') {
      for (var j=0; j<this.scatter_point_list.length; j++) {
        var x = this.scaleX*(1000*this.scatter_point_list[j].cx + this.last_mouse1X) + this.X;
        var y = this.scaleY*(1000*this.scatter_point_list[j].cy + this.last_mouse1Y) + this.Y;
        in_rect = Shape.Is_in_rect(x, y, Math.min(mouse1X, mouse2X), Math.min(mouse1Y, mouse2Y), Math.abs(mouse2X - mouse1X), Math.abs(mouse2Y - mouse1Y));
        if ((in_rect===true) && !(is_include(this.scatter_point_list[j], this.select_on_click))) {
          this.select_on_click.push(this.scatter_point_list[j]);
        }
      }
    }
    
    this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
  }

  zoom_in_button_action() {
    var old_scaleX = this.scaleX;
    var old_scaleY = this.scaleY;
    this.scaleX = this.scaleX*1.2;
    this.scaleY = this.scaleY*1.2;
    this.last_mouse1X = this.last_mouse1X - (this.width/(2*old_scaleX) - this.width/(2*this.scaleX));
    this.last_mouse1Y = this.last_mouse1Y - (this.height/(2*old_scaleY) - this.height/(2*this.scaleY));
    this.reset_scroll();
  }

  zoom_out_button_action() {
    var old_scaleX = this.scaleX;
    var old_scaleY = this.scaleY;
    this.scaleX = this.scaleX/1.2;
    this.scaleY = this.scaleY/1.2;
    this.last_mouse1X = this.last_mouse1X - (this.width/(2*old_scaleX) - this.width/(2*this.scaleX));
    this.last_mouse1Y = this.last_mouse1Y - (this.height/(2*old_scaleY) - this.height/(2*this.scaleY));
    this.reset_scroll();
  }

  click_on_zoom_window_action() {
    this.zw_bool = !this.zw_bool;
    this.select_bool = false;
  }

  reset_scatter_point_list() {
    if (this.mergeON) {
      this.scatter_point_list = this.refresh_point_list(this.scatter_init_points, this.last_mouse1X, this.last_mouse1Y);
    }
  }
  reset_scroll() {
    this.scroll_x = 0;
    this.scroll_y = 0;
    this.refresh_point_list_bool = true;
  }

  click_on_reset_action() {
    this.Reset_scales();
    this.reset_scroll();
    this.reset_scatter_point_list();
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

  click_on_merge_action() {
    this.mergeON = !this.mergeON;
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

  convert_axis_to_real_coords(x:number, type:string,  list):number {
    if (type == 'float') {
      let real_min = list[0];
      let real_max = list[1];
      return (1-x)*real_max + x*real_min; //x must be between 0 and 1
    } else {
      let nb_values = list.length;
      return (1-x)*nb_values;
    }
  }

  change_disposition_action() {
    this.vertical = !this.vertical;
    this.refresh_axis_bounds(this.axis_list.length);
    this.invert_rubber_bands('all');
    this.draw(false, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
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

  create_rubber_band(mouse1X, mouse1Y, selected_axis_index, e) {
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    this.isDrawing_rubber_band = true;
    if (this.vertical) {
      var min = Math.max(Math.min((mouse1Y - this.axis_y_end)/(this.axis_y_start - this.axis_y_end), (mouse2Y - this.axis_y_end)/(this.axis_y_start - this.axis_y_end)), 0);
      var max = Math.min(Math.max((mouse1Y - this.axis_y_end)/(this.axis_y_start - this.axis_y_end), (mouse2Y - this.axis_y_end)/(this.axis_y_start - this.axis_y_end)), 1);
    } else {
      var min = Math.max(Math.min((mouse1X - this.axis_x_start)/(this.axis_x_end - this.axis_x_start), (mouse2X - this.axis_x_start)/(this.axis_x_end - this.axis_x_start)), 0);
      var max = Math.min(Math.max((mouse1X - this.axis_x_start)/(this.axis_x_end - this.axis_x_start), (mouse2X - this.axis_x_start)/(this.axis_x_end - this.axis_x_start)), 1);
    }
    this.rubber_bands[selected_axis_index] = [min, max];
    var realCoord_min = this.convert_axis_to_real_coords(min, this.axis_list[selected_axis_index]['type'], this.axis_list[selected_axis_index]['list']);
    var realCoord_max = this.convert_axis_to_real_coords(max, this.axis_list[selected_axis_index]['type'], this.axis_list[selected_axis_index]['list']);
    var real_min = Math.min(realCoord_min, realCoord_max);
    var real_max = Math.max(realCoord_min, realCoord_max);
    
    this.add_to_rubberbands_dep([this.axis_list[selected_axis_index]['name'], [real_min, real_max]]);
    this.draw(false, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
    return [mouse2X, mouse2Y];
  }

  rubber_band_translation(mouse1X, mouse1Y, selected_band_index, e) {
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    this.isDrawing_rubber_band = true;
    if (this.vertical) {
      var deltaY = (mouse2Y - mouse1Y)/(this.axis_y_start - this.axis_y_end);
      var new_min = Math.max(this.rubber_last_min + deltaY, 0);
      var new_max = Math.min(this.rubber_last_max + deltaY, 1);
    } else {
      var deltaX = (mouse2X - mouse1X)/(this.axis_x_end - this.axis_x_start);
      var new_min = Math.max(this.rubber_last_min + deltaX, 0);
      var new_max = Math.min(this.rubber_last_max + deltaX, 1);
    }
    this.rubber_bands[selected_band_index] = [new_min, new_max];
    let real_new_min = this.convert_axis_to_real_coords(new_min, this.axis_list[selected_band_index]['type'], this.axis_list[selected_band_index]['list']);
    let real_new_max = this.convert_axis_to_real_coords(new_max, this.axis_list[selected_band_index]['type'], this.axis_list[selected_band_index]['list']);
    let to_add_min = Math.min(real_new_min, real_new_max);
    let to_add_max = Math.max(real_new_min, real_new_max);
    this.add_to_rubberbands_dep([this.axis_list[selected_band_index]['name'], [to_add_min, to_add_max]]);
    this.draw(false, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
    return [mouse2X, mouse2Y];
  }

  rubber_band_resize(mouse1X, mouse1Y, selected_border, e) {
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    var axis_index = selected_border[0];
    var border_number = selected_border[1];
    this.isDrawing_rubber_band = true;
    if (this.vertical) {
      var deltaY = (mouse2Y - mouse1Y)/(this.axis_y_start - this.axis_y_end);
      if (border_number == 0) {
        var new_min = Math.min(Math.max(this.rubber_last_min + deltaY, 0), 1);
        this.rubber_bands[axis_index][0] = new_min;
      } else {
        var new_max = Math.min(Math.max(this.rubber_last_max + deltaY, 0), 1);
        this.rubber_bands[axis_index][1] = new_max;
      }
    } else {
      var deltaX = (mouse2X - mouse1X)/(this.axis_x_end - this.axis_x_start);
      if (border_number == 0) {
        var new_min = Math.min(Math.max(this.rubber_last_min + deltaX, 0), 1);
        this.rubber_bands[axis_index][0] = new_min;
      } else {
        var new_max = Math.min(Math.max(this.rubber_last_max + deltaX, 0), 1);
        this.rubber_bands[axis_index][1] = new_max;
      }
    }
    if (this.rubber_bands[axis_index][0]>this.rubber_bands[axis_index][1]) {
      [this.rubber_bands[axis_index][0],this.rubber_bands[axis_index][1]] = [this.rubber_bands[axis_index][1],this.rubber_bands[axis_index][0]];
      border_number = 1 - border_number;
      [this.rubber_last_min, this.rubber_last_max] = [this.rubber_last_max, this.rubber_last_min];
    }

    var real_new_min = this.convert_axis_to_real_coords(this.rubber_bands[axis_index][0], this.axis_list[axis_index]['type'], this.axis_list[axis_index]['list']);
    var real_new_max = this.convert_axis_to_real_coords(this.rubber_bands[axis_index][1], this.axis_list[axis_index]['type'][0], this.axis_list[axis_index]['list']);
    var to_add_min = Math.min(real_new_min, real_new_max);
    var to_add_max = Math.max(real_new_min, real_new_max);
    this.add_to_rubberbands_dep([this.axis_list[axis_index]['name'], [to_add_min, to_add_max]]);
    this.draw(false, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
    var is_resizing = true;
    return [border_number, mouse2X, mouse2Y, is_resizing];
  }

  get_nb_intersections(attrNum1, attrNum2) { //get the number of segment intersections given two axis index from the initial axis_list
    var compareList = [];
    var firstElts = []
    for (let i=0; i<this.to_display_list.length; i++) {
      let elt1 = this.get_coord_on_parallel_plot(this.axis_list[attrNum1]['type'], this.axis_list[attrNum1]['list'], this.to_display_list[i][attrNum1], this.axis_y_start, this.axis_y_end, false);
      let elt2 = this.get_coord_on_parallel_plot(this.axis_list[attrNum2]['type'], this.axis_list[attrNum2]['list'], this.to_display_list[i][attrNum2], this.axis_y_start, this.axis_y_end, false);
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
          compareList = remove_at_index(j, compareList);
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

  delete_inverted_list(lists) {
    var new_list = [];
    for (let i=0; i<lists.length; i++) {
      var inverted_list_i = [];
      for (let j=0; j<lists[i].length; j++) {
        inverted_list_i.push(lists[i][lists[i].length-j-1]);
      }
      if (is_list_include(inverted_list_i, new_list) === false) {
        new_list.push(lists[i]);
      }
    }
    return new_list;
  }

  getOptimalAxisDisposition() { //gives the optimal disposition for axis in order to minimize segment intersetions
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
  }

  refresh_selected_point_index() {
    this.selected_point_index = [];
    if (this.mergeON === false) {
      for (let i=0; i<this.select_on_click.length; i++) {
        if (!(this.select_on_click[i] === undefined)) {
          if (this.plotObject['type'] == 'ScatterPlot') {
            this.selected_point_index.push(get_index_of_element(this.select_on_click[i], this.plotObject.point_list));
          } else if (this.plotObject['type'] == 'Graphs2D') {
            for (let j=0; j<this.plotObject.graphs.length; j++) {
              if (is_include(this.select_on_click[i], this.plotObject.graphs[j].point_list)) {
                this.selected_point_index.push([get_index_of_element(this.select_on_click[i], this.plotObject.graphs[j].point_list), j]);
              }
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
    return [mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing];
  }

  mouse_move_interaction(isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y, e, canvas) {
    if (isDrawing === true) {
      if (!(this.zw_bool||this.select_bool)) {
        canvas.style.cursor = 'move';
        mouse_moving = true;
        mouse2X = e.offsetX;
        mouse2Y = e.offsetY;
        this.draw(false, 0, this.last_mouse1X + mouse2X/this.scaleX - mouse1X/this.scaleX, this.last_mouse1Y + mouse2Y/this.scaleY - mouse1Y/this.scaleY, this.scaleX, this.scaleY, this.X, this.Y);
        this.draw(true, 0, this.last_mouse1X + mouse2X/this.scaleX - mouse1X/this.scaleX, this.last_mouse1Y + mouse2Y/this.scaleY - mouse1Y/this.scaleY, this.scaleX, this.scaleY, this.X, this.Y);
      } else {
        if (this.select_bool) {
          this.isSelecting = true;
          let abs_min = 1/1000 * ((Math.min(mouse1X, mouse2X) - this.X)/this.scaleX - this.last_mouse1X);
          let abs_max = 1/1000 * ((Math.max(mouse1X, mouse2X) - this.X)/this.scaleX - this.last_mouse1X);
          let ord_min = -1/1000 * ((Math.max(mouse1Y, mouse2Y) - this.Y)/this.scaleY - this.last_mouse1Y);
          let ord_max = -1/1000 * ((Math.min(mouse1Y, mouse2Y) - this.Y)/this.scaleY - this.last_mouse1Y);
          this.selection_coords = [[abs_min, abs_max], [ord_min, ord_max]];
        }
        canvas.style.cursor = 'crosshair';
        mouse_moving = true;
        mouse2X = e.offsetX;
        mouse2Y = e.offsetY;
        this.context_show.setLineDash([]);
        this.context_hidden.setLineDash([]);
        this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
        this.draw(true, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
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

    var click_on_plus = Shape.Is_in_rect(mouse1X, mouse1Y, this.zoom_rect_x + this.X, this.zoom_rect_y + this.Y, this.zoom_rect_w, this.zoom_rect_h);
    var click_on_minus = Shape.Is_in_rect(mouse1X, mouse1Y, this.zoom_rect_x + this.X, this.zoom_rect_y + this.zoom_rect_h + this.Y, this.zoom_rect_w, this.zoom_rect_h);
    var click_on_zoom_window = Shape.Is_in_rect(mouse1X, mouse1Y, this.zw_x + this.X, this.zw_y + this.Y, this.zw_w, this.zw_h);
    var click_on_reset = Shape.Is_in_rect(mouse1X, mouse1Y, this.reset_rect_x + this.X, this.reset_rect_y + this.Y, this.reset_rect_w, this.reset_rect_h);
    var click_on_select = Shape.Is_in_rect(mouse1X, mouse1Y, this.select_x + this.X, this.select_y + this.Y, this.select_w, this.select_h);
    var click_on_graph = false;
    var click_on_merge = Shape.Is_in_rect(mouse1X, mouse1Y, this.merge_x + this.X, this.merge_y + this.Y, this.merge_w, this.merge_h);
    var text_spacing_sum_i = 0;
    for (var i=0; i<this.nb_graph; i++) {
      var click_on_graph_i = Shape.Is_in_rect(mouse1X, mouse1Y, this.graph1_button_x + i*this.graph1_button_w + text_spacing_sum_i, this.graph1_button_y, this.graph1_button_w, this.graph1_button_h);
      click_on_graph = click_on_graph || click_on_graph_i;
      text_spacing_sum_i = text_spacing_sum_i + this.graph_text_spacing_list[i];
    }
    var click_on_button = click_on_plus || click_on_minus || click_on_zoom_window || click_on_reset || click_on_select || click_on_graph || click_on_merge;

    if (mouse_moving) {
        if (this.zw_bool) {
          this.zoom_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y, scale_ceil);
          
        } else if (this.select_bool) {
          this.selection_window_action(mouse1X, mouse1Y, mouse2X, mouse2Y);
          this.refresh_selected_point_index();

        } else {
          this.last_mouse1X = this.last_mouse1X + mouse2X/this.scaleX - mouse1X/this.scaleX;
          this.last_mouse1Y = this.last_mouse1Y + mouse2Y/this.scaleY - mouse1Y/this.scaleY;
        }

    } else {
        var col = this.context_hidden.getImageData(mouse1X, mouse1Y, 1, 1).data;
        var colKey = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
        var click_plot_data = this.colour_to_plot_data[colKey];
        if (is_include(click_plot_data, this.select_on_click)) {
          this.select_on_click = this.remove_selection(click_plot_data, this.select_on_click);
        } else {
          this.select_on_click.push(click_plot_data);
        }
        if (this.tooltip_ON) {
            if (is_include(click_plot_data, this.tooltip_list) && (!is_include(click_plot_data, this.select_on_click))) {
              this.tooltip_list = this.remove_selection(click_plot_data, this.tooltip_list);
            } else if (!is_include(click_plot_data, this.tooltip_list) && is_include(click_plot_data, this.select_on_click)){
              this.tooltip_list.push(click_plot_data);
            }
        }
        
        if (this.contains_undefined(this.select_on_click) && !click_on_button) {
          this.select_on_click = [];
          this.tooltip_list = [];
        }
        this.refresh_selected_point_index();

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

        } else if (click_on_merge) {
          this.click_on_merge_action();
        }

        this.draw(false, 0, this.last_mouse1X, this.last_mouse1Y, this.scaleX, this.scaleY, this.X, this.Y);
      }
      var isDrawing = false;
      mouse_moving = false;
      this.isSelecting = false;
      this.isDrawing_rubber_band = false;
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

  mouse_move_axis_inversion(isDrawing, e, selected_name_index) {
    isDrawing = true;
    this.move_index = selected_name_index;
    var mouse2X = e.offsetX;
    var mouse2Y = e.offsetY;
    if (this.vertical === true) {
      var axis_x = this.axis_x_start + this.move_index*this.x_step;
      this.draw(false, 0, mouse2X - axis_x, 0, this.scaleX, this.scaleY, this.X, this.Y);
      this.draw(true, 0, mouse2X - axis_x, 0, this.scaleX, this.scaleY, this.X, this.Y);
    } else {
      var axis_y = this.axis_y_start + this.move_index*this.y_step;
      this.draw(false, 0, mouse2Y - axis_y, 0, this.scaleX, this.scaleY, this.X, this.Y);
      this.draw(true, 0, mouse2Y - axis_y, 0, this.scaleX, this.scaleY, this.X, this.Y);
    }
    var is_inside_canvas = (mouse2X>=this.X) && (mouse2X<=this.width + this.X) && (mouse2Y>=this.Y) && (mouse2Y<=this.height + this.Y);
    var mouse_move = true;
    if (!is_inside_canvas) {
      isDrawing = false;
      mouse_move = false;
    }
    
    return [mouse2X, mouse2Y, isDrawing, mouse_move];
  }

  initialize_click_on_axis(nb_axis:number, mouse1X:number, mouse1Y:number, click_on_axis) {
    click_on_axis = false;
    var selected_axis_index = -1;
    for (var i=0; i<nb_axis; i++) {
      if (this.vertical === true) {
        var current_x = this.axis_x_start + i*this.x_step;
        var bool = Shape.Is_in_rect(mouse1X, mouse1Y, current_x - this.bandWidth/2, this.axis_y_end, this.bandWidth, this.axis_y_start - this.axis_y_end);
      } else {
        var current_y = this.axis_y_start + i*this.y_step;
        var bool = Shape.Is_in_rect(mouse1X, mouse1Y, this.axis_x_start, current_y - this.bandWidth/2, this.axis_x_end - this.axis_x_start, this.bandWidth);
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

  initialize_click_on_name(nb_axis:number, mouse1X:number, mouse1Y:number) {
    var click_on_name:any = false;
    var selected_name_index:any = -1;
    for (var i=0; i<nb_axis; i++) {
      var attribute_alias = this.axis_list[i]['alias'];
      var text_w = this.context.measureText(attribute_alias).width;
      var text_h = parseInt(this.context.font.split('px')[0], 10);
      if (this.vertical === true) {
        var current_x = this.axis_x_start + i*this.x_step;
        click_on_name = click_on_name || Shape.Is_in_rect(mouse1X, mouse1Y, current_x - text_w/2, this.axis_y_end - 20 - text_h/2, text_w, text_h);

      } else {
        var current_y = this.axis_y_start + i*this.y_step;
        click_on_name = click_on_name || Shape.Is_in_rect(mouse1X, mouse1Y, this.axis_x_start - text_w/2, current_y + 15 - text_h/2, text_w, text_h);
      }
      if (click_on_name === true) {
        selected_name_index = i;
        break;
      }
    }
    return [click_on_name, selected_name_index];
  }

  initialize_click_on_bands(mouse1X, mouse1Y) {
    var border_size = 10;
    var click_on_band:any = false;
    var click_on_border:any = false;
    var selected_band_index:any = -1;
    var selected_border:any = [];
    for (var i=0; i<this.rubber_bands.length; i++) {
      if (this.rubber_bands[i].length != 0) {
        if (this.vertical) {
          var minY = this.rubber_bands[i][0];
          var maxY = this.rubber_bands[i][1];
          this.rubber_last_min = minY;
          this.rubber_last_max = maxY;
          var real_minY = this.axis_y_end + minY*(this.axis_y_start - this.axis_y_end);
          var real_maxY = this.axis_y_end + maxY*(this.axis_y_start - this.axis_y_end);
          var current_x = this.axis_x_start + i*this.x_step;
          var is_in_upper_border = Shape.Is_in_rect(mouse1X, mouse1Y, current_x - this.bandWidth/2, real_minY - border_size/2, this.bandWidth, border_size);
          var is_in_lower_border = Shape.Is_in_rect(mouse1X, mouse1Y, current_x - this.bandWidth/2, real_maxY - border_size/2, this.bandWidth, border_size);
          var is_in_rubber_band = Shape.Is_in_rect(mouse1X, mouse1Y, current_x - this.bandWidth/2, real_minY, this.bandWidth, real_maxY - real_minY);
        } else {
          var minX = this.rubber_bands[i][0];
          var maxX = this.rubber_bands[i][1];
          this.rubber_last_min = minX;
          this.rubber_last_max = maxX;
          var real_minX = this.axis_x_start + minX*(this.axis_x_end - this.axis_x_start);
          var real_maxX = this.axis_x_start + maxX*(this.axis_x_end - this.axis_x_start);
          var current_y = this.axis_y_start + i*this.y_step;
          is_in_upper_border = Shape.Is_in_rect(mouse1X, mouse1Y, real_minX - border_size/2, current_y - this.bandWidth/2, border_size, this.bandWidth);
          is_in_lower_border = Shape.Is_in_rect(mouse1X, mouse1Y, real_maxX - border_size/2, current_y - this.bandWidth/2, border_size, this.bandWidth);
          is_in_rubber_band = Shape.Is_in_rect(mouse1X, mouse1Y, real_minX, current_y - this.bandWidth/2, real_maxX - real_minX, this.bandWidth);
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



  mouse_up_axis_interversion(mouse1X, mouse1Y, e) {
    var mouse3X = e.offsetX;
    var mouse3Y = e.offsetY;
    if (this.vertical === true) {
      if (mouse3X>mouse1X) {
        var new_index = Math.floor((mouse3X - this.axis_x_start)/this.x_step);
      } else {
        var new_index = Math.ceil((mouse3X - this.axis_x_start)/this.x_step);
      }
    } else {
      if (mouse3Y>mouse1Y) {
        var new_index = Math.floor((mouse3Y - this.axis_y_start)/this.y_step);
      } else {
        var new_index = Math.ceil((mouse3Y - this.axis_y_start)/this.y_step);
      }
    }
    this.axis_list = move_elements(this.move_index, new_index, this.axis_list);
    this.rubber_bands = move_elements(this.move_index, new_index, this.rubber_bands);
    this.inverted_axis_list = move_elements(this.move_index, new_index, this.inverted_axis_list);
    this.move_index = -1;
    var click_on_axis = false;
    var mvx = 0;
    var mvy = 0;
    this.refresh_to_display_list(this.elements);
    this.refresh_displayable_attributes(); //No need to refresh attribute_booleans as inverting axis doesn't affect its values
    this.draw(false, 0, mvx, mvy, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, mvx, mvy, this.scaleX, this.scaleY, this.X, this.Y);
    return [mouse3X, mouse3Y, click_on_axis]
  }

  select_title_action(selected_name_index) {
    this.inverted_axis_list[selected_name_index] = !this.inverted_axis_list[selected_name_index];
    if (this.rubber_bands[selected_name_index].length != 0) {
      this.invert_rubber_bands([selected_name_index]);
    }
    this.draw(false, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
  }

  select_axis_action(selected_axis_index, click_on_band, click_on_border) {
    if (this.rubber_bands[selected_axis_index].length == 0) {
      var attribute_name = this.axis_list[selected_axis_index]['name'];
      if (attribute_name == this.selected_axis_name) {
        this.selected_axis_name = '';
      } else {
        this.selected_axis_name = attribute_name;
      }
    } else if ((this.rubber_bands[selected_axis_index].length != 0) && !click_on_band && !click_on_border) {
      this.rubber_bands[selected_axis_index] = [];
      for (let i=0; i<this.rubberbands_dep.length; i++) {
        if (this.rubberbands_dep[i][0] == this.axis_list[selected_axis_index]['name']) {
          this.rubberbands_dep = remove_at_index(i, this.rubberbands_dep);
        }
      }
    }
      this.draw(false, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
      this.draw(true, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
  }

  rubber_band_size_check(selected_band_index) {
    if (this.rubber_bands[selected_band_index].length != 0 && Math.abs(this.rubber_bands[selected_band_index][0] - this.rubber_bands[selected_band_index][1])<=0.02) {
      this.rubber_bands[selected_band_index] = [];
    }
    this.draw(false, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
    this.draw(true, 0, 0, 0, this.scaleX, this.scaleY, this.X, this.Y);
    var is_resizing = false;
    return is_resizing;
  }
 
  mouse_up_interaction_pp(click_on_axis, selected_axis_index, click_on_name, click_on_band, click_on_border, is_resizing, selected_name_index, mouse_moving, isDrawing, mouse1X, mouse1Y, mouse3X, mouse3Y, e) {
    var mouseX = e.offsetX;
    var mouseY = e.offsetY;
    var click_on_disp = Shape.Is_in_rect(mouseX, mouseY, this.disp_x + this.X, this.disp_y + this.Y, this.disp_w, this.disp_h);
    if (click_on_axis && !mouse_moving) {
      this.select_axis_action(selected_axis_index, click_on_band, click_on_border);
    } else if (click_on_name && mouse_moving) {
      [mouse3X, mouse3Y, click_on_axis] = this.mouse_up_axis_interversion(mouse1X, mouse1Y, e);
    } else if (click_on_name && !mouse_moving) {
      this.select_title_action(selected_name_index);
    } else if (this.isDrawing_rubber_band || is_resizing) {
      is_resizing = this.rubber_band_size_check(selected_axis_index);
    }
    if(click_on_disp) {
      this.change_disposition_action();
    } 
    this.isDrawing_rubber_band = false;
    mouse_moving = false;
    isDrawing = false;
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

      var canvas = document.getElementById('canvas');

      canvas.addEventListener('mousedown', e => {
        if (this.interaction_ON) {
          [mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing] = this.mouse_down_interaction(mouse1X, mouse1Y, mouse2X, mouse2Y, isDrawing, e);
          if (parallelplot) {
            [click_on_axis, selected_axis_index] = this.initialize_click_on_axis(this.axis_list.length, mouse1X, mouse1Y, click_on_axis);
            [click_on_name, selected_name_index] = this.initialize_click_on_name(this.axis_list.length, mouse1X, mouse1Y);
            [click_on_band, click_on_border, selected_band_index, selected_border] = this.initialize_click_on_bands(mouse1X, mouse1Y);
          }
        }
      });

      canvas.addEventListener('mousemove', e => {
        if (this.interaction_ON) {
          if (parallelplot) {
            if (isDrawing) {
              mouse_moving = true;
              if (click_on_name) {
                [mouse2X, mouse2Y, isDrawing, mouse_moving] = this.mouse_move_axis_inversion(isDrawing, e, selected_name_index);
              } else if (click_on_axis && !click_on_band && !click_on_border) {
                [mouse2X, mouse2Y] = this.create_rubber_band(mouse1X, mouse1Y, selected_axis_index, e);
              } else if (click_on_band) {
                [mouse2X, mouse2Y] = this.rubber_band_translation(mouse1X, mouse1Y, selected_band_index, e);
              } else if (click_on_border) {
                [selected_border[1], mouse2X, mouse2Y, is_resizing] = this.rubber_band_resize(mouse1X, mouse1Y, selected_border, e);
              }
            }
          } else {
            [isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y] = this.mouse_move_interaction(isDrawing, mouse_moving, mouse1X, mouse1Y, mouse2X, mouse2Y, e, canvas);
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

  remove_first_selection(val, list) {
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

  refresh_point_list(point_list, mvx, mvy) { //Naive search method
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
          var new_shape = new_point_list[i].shape;
          var new_point_size = new_point_list[i].point_size;
          var new_color_fill = new_point_list[i].color_fill;
          var new_color_stroke = new_point_list[i].color_stroke;
          var new_stroke_width = new_point_list[i].stroke_width;
          var point = new PlotDataPoint2D(new_cx, new_cy, new_shape, new_point_size, new_color_fill, new_color_stroke, new_stroke_width, 'point', '');
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
      if (is_include(this.select_on_click[i], point_list)) {
        this.select_on_click = this.remove_selection(this.select_on_click[i], this.select_on_click);
      } else {
        i++;
      }
    }
  }

  delete_tooltip(point_list) {
    var i = 0;
    while (i<this.tooltip_list.length) {
      if (is_include(this.tooltip_list[i], point_list)) {
        this.tooltip_list = this.remove_selection(this.tooltip_list[i], this.tooltip_list);
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
                public buttons_ON: boolean) {
    super(data, width, height, coeff_pixel, buttons_ON, 0, 0);
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
    this.isParallelPlot = false;
    this.interaction_ON = true;
    this.mouse_interaction(this.isParallelPlot);
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
    public coeff_pixel: number,
    public buttons_ON: boolean,
    public X: number,
    public Y: number) {
      super(data, width, height, coeff_pixel, buttons_ON, X, Y);
      if (this.buttons_ON) {
        this.refresh_buttons_coords();
      }
      for (var i = 0; i < data.length; i++) {
        var d = data[i]; 
        if (d['type'] == 'point') {
          this.type = 'point';
          this.plotObject = PlotDataPoint2D.deserialize(d);
          this.plot_datas['value'] = [this.plotObject];
          if (isNaN(this.minX)) {this.minX = this.plotObject.minX} else {this.minX = Math.min(this.minX, this.plotObject.minX)};
          if (isNaN(this.maxX)) {this.maxX = this.plotObject.maxX} else {this.maxX = Math.max(this.maxX, this.plotObject.maxX)};
          if (isNaN(this.minY)) {this.minY = this.plotObject.minY} else {this.minY = Math.min(this.minY, this.plotObject.minY)};
          if (isNaN(this.maxY)) {this.maxY = this.plotObject.maxY} else {this.maxY = Math.max(this.maxY, this.plotObject.maxY)};
          this.colour_to_plot_data[this.plotObject.mouse_selection_color] = this.plotObject;
        
        } else if (d['type'] == 'axis') {
          this.type = 'axis';
          this.axis_ON = true;
          this.plotObject = PlotDataAxis.deserialize(d);
        } else if (d['type'] == 'tooltip') {
          this.type = 'tooltip';
          this.plotObject = PlotDataTooltip.deserialize(d);
        } else if (d['type'] == 'graphs2D') {
          this.type = 'graphs2D';
          this.graph_ON = true;
          this.axis_ON = true;
          this.plotObject = Graphs2D.deserialize(d);
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
        } else if (d['type'] == 'ScatterPlot') {
          this.type = 'ScatterPlot';
          this.axis_ON = true;
          this.mergeON = true;
          this.plotObject = PlotDataScatter.deserialize(d);
          this.plot_datas['value'] = [this.plotObject];
          this.pointLength = 1000*this.plotObject.point_list[0].size;
          this.scatter_init_points = this.plotObject.point_list;
          this.refresh_MinMax(this.plotObject.point_list);
        }
      }
      this.isParallelPlot = false;
  }

  draw(hidden, show_state, mvx, mvy, scaleX, scaleY, X, Y) {
    this.draw_empty_canvas(hidden);
    this.draw_rect();
    this.draw_graphs2D(this.plotObject, hidden, mvx, mvy);
    this.draw_scatterplot(this.plotObject, hidden, mvx, mvy);
    this.draw_point(hidden, show_state, mvx, mvy, scaleX, scaleY, this.plotObject);
    this.draw_axis(mvx, mvy, scaleX, scaleY, this.plotObject);
    
    if (this.buttons_ON) {
      this.refresh_buttons_coords();
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

      if (this.plotObject.type == 'ScatterPlot') {
        this.merge_button(this.merge_x, this.merge_y, this.merge_w, this.merge_h, '10px Arial');
      }
    }
    if (this.manipulable_ON) {
      this.draw_manipulable_rect();
    }
  }
}


export class ParallelPlot extends PlotData {

  constructor(public data, public width, public height, public coeff_pixel, public buttons_ON, X, Y) {
    super(data, width, height, coeff_pixel, buttons_ON, X, Y);
    this.type = 'ParallelPlot';
    if (this.buttons_ON) {
      this.disp_x = this.width - 35;
      this.disp_y = this.height - 25;
      this.disp_w = 30;
      this.disp_h = 20;
    }
    var data_show = data[0];
    this.parallel_plot_lineColor = rgb_to_hex(data_show['line_color']);
    this.parallel_plot_linewidth = data_show['line_width'];
    this.elements = data_show['elements'];
    var to_disp_attribute_names = data_show['to_disp_attributes'];
    if (data_show['disposition'] == 'vertical') {
      this.vertical = true;
    } else if (data_show['disposition'] == 'horizontal') {
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
    this.refresh_axis_bounds(nb_axis);
    this.refresh_to_display_list(this.elements);
    this.refresh_displayable_attributes();
    this.refresh_attribute_booleans();
    this.isParallelPlot = true;
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
      if (!(is_include(attribute_names[i], exceptions))) {
        let name = attribute_names[i];
        let type = TypeOf(this.elements[0][name]);
        this.displayable_attributes.push(new Attribute(name, type));
      }
    }
  }

  initialize_attributes_list() { //Initialize 'list' and 'alias' of displayable_attributes's elements'
    for (var i=0; i<this.displayable_attributes.length; i++) {
      var attribute_name = this.displayable_attributes[i]['name'];
      this.displayable_attributes[i]['alias'] = this.displayable_attributes[i]['name'];
      var type = this.displayable_attributes[i]['type'];
      if (type == 'float') {
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
          if (type == 'color') {
            var elt:any = rgb_to_string(this.elements[j][attribute_name]);
          } else {
            var elt = this.elements[j][attribute_name];
          }
          if (!is_include(elt, list)) {
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
    this.draw_empty_canvas(hidden);
    this.draw_rect();
    this.draw_rubber_bands(mvx);
    var nb_axis = this.axis_list.length;
    this.draw_parallel_coord_lines(nb_axis);
    this.draw_parallel_axis(nb_axis, mvx);
    if (this.buttons_ON) {
      this.refresh_pp_buttons_coords();
      this.disp_button(this.disp_x + this.X, this.disp_y + this.Y, this.disp_w, this.disp_h, '10px Arial');
    }
    if (this.manipulable_ON) {
      this.draw_manipulable_rect();
    }
  }

  initialize_data_lists() {
    for (let i=0; i<this.axis_list.length; i++) {
      this.inverted_axis_list.push(false);
      this.rubber_bands.push([]);
    }
  }
}

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

  constructor(public cx:number,
              public cy:number,
              public shape:string,
              public point_size:number,
              public color_fill:string,
              public color_stroke:string,
              public stroke_width:number,
              public type:string,
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
      return new PlotDataPoint2D(serialized['cx'],
                                  -serialized['cy'],
                                  serialized['shape'],
                                  serialized['size'],
                                  rgb_to_hex(serialized['color_fill']),
                                  rgb_to_hex(serialized['color_stroke']),
                                  serialized['stroke_width'],
                                  serialized['type'],
                                  serialized['name']);
    }

    draw(context, context_hidden, mvx, mvy, scaleX, scaleY, X, Y) {
      var show_states = 0;
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

          context_hidden.beginPath()
          context_hidden.arc(scaleX*(1000*this.cx+ mvx), scaleY*(1000*this.cy+ mvy), 1000*this.size, 0, 2*Math.PI);
          context_hidden.stroke();
          context_hidden.closePath();
        } else {
          throw new Error('Invalid shape for point');
        }
        
    }

    copy() {
      return new PlotDataPoint2D(this.cx, this.cy, this.shape, this.point_size, this.color_fill, this.color_stroke, this.stroke_width, this.type, this.name);
    }

    equals(point:PlotDataPoint2D): boolean {
      return (this.cx == point.cx) && (this.cy == point.cy) && (this.shape == point.shape)
              && (this.size == point.size) && (this.color_fill == point.color_fill) && (this.color_stroke == point.color_stroke)
              && (this.stroke_width == point.stroke_width);
    }

    getPointIndex(point_list:PlotDataPoint2D[]) {
      for (let i=0; i<point_list.length; i++) {
        if (this.equals(point_list[i])) {
          return i;
        }
      }
      throw new Error('getPointIndex : not in list');
    }

    isPointInList(point_list:PlotDataPoint2D[]) {
      for (let i=0; i<point_list.length; i++) {
        if (this.equals(point_list[i])) {
          return true;
        }
      }
      return false;
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
                     public type:string) {}

  public static deserialize(serialized) {
    return new PlotDataAxis(serialized['nb_points_x'],
                                  serialized['nb_points_y'],
                                  serialized['font_size'],
                                  rgb_to_hex(serialized['graduation_color']),
                                  rgb_to_hex(serialized['axis_color']),
                                  serialized['name'],
                                  serialized['arrow_on'],
                                  serialized['axis_width'],
                                  serialized['grid_on'], 
                                  serialized['type']);
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
    if (attribute['type'] == 'float') {
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
    if (attribute['type'] == 'float') {
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

export class PlotDataTooltip {
  constructor(public colorfill:string, public text_color: string, public font_size:number, public font_style:string, public tp_radius:any, public to_plot_list:any, public opacity:number, public type:string, public name:string) {}

  public static deserialize(serialized) {
      return new PlotDataTooltip(rgb_to_hex(serialized['colorfill']),
                                  rgb_to_hex(serialized['text_color']),
                                  serialized['fontsize'],
                                  serialized['fontstyle'],
                                  serialized['tp_radius'],
                                  serialized['to_plot_list'],
                                  serialized['opacity'],
                                  serialized['type'],
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
        text = attribute_name + ' : ' + hex_to_string(elt[attribute_name]);
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

  initialize_text_mergeON(context, x_nb_digits, y_nb_digits, elt): [string[], number] {
    var textfills = [];
    var text_max_length = 0;
    var text = 'cx : ' + MyMath.round(elt.cx, x_nb_digits).toString();
    var text_w = context.measureText(text).width;
    textfills.push(text);
    if (text_w > text_max_length) {
      text_max_length = text_w;
    }

    var text = 'cy : ' + MyMath.round(-elt.cy, y_nb_digits).toString();
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
        [textfills, text_max_length] = this.initialize_text_mergeON(context, x_nb_digits, y_nb_digits, elt);
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

export class PlotDataGraph2D {
  id:number=0;
  constructor(public point_list:PlotDataPoint2D[],
              public dashline: number[],
              public graph_colorstroke: string,
              public graph_linewidth: number,
              public segments:PlotDataLine2D[],
              public display_step:number,
              public tooltip:PlotDataTooltip,
              public type: string,
              public name:string) {}
  
  public static deserialize(serialized) {
    var point_list = [];
    var temp = serialized['serialized_point_list'];
    for (var i=0; i<temp.length; i++) {
      var d = temp[i];
      point_list.push(PlotDataPoint2D.deserialize(d));
    }

    var segments = [];
    for (let i=0; i<point_list.length - 1; i++) {
      let current_point = point_list[i];
      let next_point = point_list[i+1];
      let data = [current_point.cx, current_point.cy, next_point.cx, next_point.cy];
      segments.push(new PlotDataLine2D(data, [], '', ''));
    }
    var tooltip = PlotDataTooltip.deserialize(serialized['tooltip']);
    return new PlotDataGraph2D(point_list,
                           serialized['dashline'],
                           rgb_to_hex(serialized['graph_colorstroke']),
                           serialized['graph_linewidth'],
                           segments,
                           serialized['display_step'],
                           tooltip,
                           serialized['type'],
                           serialized['name']);
  }
}

export class Graphs2D {
  constructor(public graphs: PlotDataGraph2D[],
              public axis: PlotDataAxis,
              public type: string,
              public name: string) {}
  
  public static deserialize(serialized) {
    var graphs:PlotDataGraph2D[] = [];
    for (let i=0; i<serialized['graphs'].length; i++) {
      graphs.push(PlotDataGraph2D.deserialize(serialized['graphs'][i]));
    }
    var axis = PlotDataAxis.deserialize(serialized['axis']);

    return new Graphs2D(graphs,
                        axis,
                        serialized['type'],
                        serialized['name']);
  }
}

export class PlotDataScatter {

  point_list:PlotDataPoint2D[]=[];
  displayableAttributes:Attribute[]=[];
  lists:any[]=[];
  toDisplayAttributes:Attribute[]=[];

  constructor(public elements:any[],
              public axis:PlotDataAxis,
              public tooltip:PlotDataTooltip,
              public toDispAttNames:string[],
              public point_shape:string,
              public point_size:number,
              public color_fill:string,
              public color_stroke:string,
              public stroke_width:number,
              public type:string,
              public name:string) {
    this.initialize_displayableAttributes();
    this.initialize_toDisplayAttributes();
    this.initialize_lists();
    this.initialize_point_list();
  }
  
  public static deserialize(serialized) {
    var axis = PlotDataAxis.deserialize(serialized['axis']);
    var tooltip = PlotDataTooltip.deserialize(serialized['tooltip']);
    return new PlotDataScatter(serialized['elements'],
                               axis,
                               tooltip,
                               serialized['to_display_att_names'],
                               serialized['point_shape'],
                               serialized['point_size'],
                               rgb_to_hex(serialized['color_fill']),
                               rgb_to_hex(serialized['color_stroke']),
                               serialized['stroke_width'],
                               serialized['type'],
                               serialized['name']);
  }

  initialize_displayableAttributes() {
    var attribute_names = Object.getOwnPropertyNames(this.elements[0]);
    for (let i=0; i<attribute_names.length; i++) {
      let name = attribute_names[i];
      let type = TypeOf(this.elements[0][name]);
      this.displayableAttributes.push(new Attribute(name, type));
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
      let type = this.toDisplayAttributes[i].type;
      if (type == 'float') {
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
      } else if (type == 'color') {
        for (let j=0; j<this.elements.length; j++) {
          let elt_color = rgb_to_string(this.elements[j][name]);
          if (!is_include(elt_color, value)) {
            value.push(elt_color);
          }
        }
        this.lists.push(value);
      } else {
        for (let j=0; j<this.elements.length; j++) {
          let elt = this.elements[j][name].toString();
          if (!is_include(elt, value)) {
            value.push(elt);
          }
        }
        this.lists.push(value);
      }
    }
  }

  initialize_point_list() {
    this.point_list = [];
    for (let i=0; i<this.elements.length; i++) {
      var elt0 = this.elements[i][this.toDisplayAttributes[0]['name']];
      var elt1 = this.elements[i][this.toDisplayAttributes[1]['name']];
      if (this.toDisplayAttributes[0]['type'] == 'float') {
        var cx = elt0;
      } else if (this.toDisplayAttributes[0]['type'] == 'color') {
        cx = get_index_of_element(rgb_to_string(elt0), this.lists[0]);
      } else {
        cx = get_index_of_element(elt0.toString(), this.lists[0]);
      }
      if (this.toDisplayAttributes[1]['type'] == 'float') {
        var cy = -elt1;
      } else if (this.toDisplayAttributes[1]['type'] == 'color') {
        cy = -get_index_of_element(rgb_to_string(elt1), this.lists[1]);
      } else {
        cy = -get_index_of_element(elt1.toString(), this.lists[1]);
      }
      this.point_list.push(new PlotDataPoint2D(cx, cy, this.point_shape, this.point_size, this.color_fill, this.color_stroke, this.stroke_width, 'point', ''));
    }
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

export class Attribute {
  list:any[];
  alias:string;
  constructor(public name:string,
              public type:string) {}
  
  public static deserialize(serialized) {
    return new Attribute(serialized['name'],
                         serialized['type']);
  }

  copy() {
    var attribute_copy = new Attribute(this.name, this.type);
    attribute_copy['list'] = this.list;
    return attribute_copy;
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

  public static Is_in_rect(x, y, rect_x, rect_y, rect_w, rect_h) {
    return ((x>=rect_x) && (x<= rect_x + rect_w) && (y>=rect_y) && (y<=rect_y + rect_h))
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
    context.fill();
    context.stroke();
    context.closePath();
    context.globalAlpha = 1;
    context.setLineDash([]);
  }
}

export function drawLines(ctx, pts) {
  // ctx.moveTo(pts[0], pts[1]);
  for(var i=2; i<pts.length-1; i+=2) ctx.lineTo(pts[i], pts[i+1]);
}

export function remove_at_index(i:number, list:any[]) {
  return list.slice(0, i).concat(list.slice(i + 1, list.length));
}

export function move_elements(old_index, new_index, list) {
  var elt = list[old_index];
  if (old_index<new_index) {
    list.splice(new_index+1, 0, elt);
    list = remove_at_index(old_index, list);
  } else {
    list.splice(new_index, 0, elt);
    list = remove_at_index(old_index + 1, list);
  }
  return list;
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

export function rgb_to_hex(rgb:string) {
  var tokens = rgb.slice(4, rgb.length - 1).split(',');
  var r = parseInt(tokens[0],10);
  var g = parseInt(tokens[1],10);
  var b = parseInt(tokens[2],10);
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var color_dict = [['red', '#f70000'], ['lightred', '#ed8080'], ['blue', '#0013fe'], ['lightblue', '#adb3ff'], ['lightskyblue', '#87CEFA'], ['green', '#00c112'], ['lightgreen', '#89e892'], ['yellow', '#f4ff00'], ['lightyellow', '#f9ff7b'], ['orange', '#ff8700'],
  ['lightorange', '#ff8700'], ['cyan', '#13f0f0'], ['lightcyan', '#90f7f7'], ['rose', '#FF69B4'], ['lightrose', '#FFC0CB'], ['violet', '#EE82EE'], ['lightviolet', '#eaa5f6'], ['white', '#ffffff'], ['black', '#000000'], ['brown', '#cd8f40'],
  ['lightbrown', '#DEB887'], ['grey', '#A9A9A9'], ['lightgrey', '#D3D3D3']];

export function hex_to_string(hexa:string) {
  for (var i=0 ;i<color_dict.length; i++) {
    if (hexa.toUpperCase() === color_dict[i][1].toUpperCase()) {
      return color_dict[i][0];
    }
  }
  throw new Error('hex_to_string -> Invalid color : ' + hexa + ' not in list');
}

export function string_to_hex(str:string) {
  for (var i=0 ;i<color_dict.length; i++) {
    if (str.toUpperCase() === color_dict[i][0].toUpperCase()) {
      return color_dict[i][1];
    }
  }
  throw new Error('string_to_hex -> Invalid color : ' + str + ' not in list');
}

export function rgb_to_string(rgb:string) {
  return hex_to_string(rgb_to_hex(rgb));
}

export function rgb_interpolation([r1, g1, b1], [r2, g2, b2], n:number) {
  var color_list = [];
  for (var k=0; k<n; k++) {
    var r = Math.floor(r1*(1-k/n) + r2*k/n);
    var g = Math.floor(g1*(1-k/n) + g2*k/n);
    var b = Math.floor(b1*(1-k/n) + b2*k/n);
    color_list.push([r,g,b]);
  }
  return color_list;
}

export function rgb_interpolations(rgbs, nb_pts:number) {
  var nb_seg = rgbs.length - 1;
  var arr = [];
  var color_list = [];
  for (var i=0; i<nb_seg; i++) {arr.push(0);}
  for (var i=0; i<nb_pts; i++) {
    arr[i%nb_seg]++;
  }
  for (var i=0; i<nb_seg; i++) {
    color_list.push(rgb_interpolation(rgbs[i], rgbs[i+1], arr[i]));
  }
  return color_list;
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

export function arrayEquals(list1, list2) {
  if (list1.length != list2.length) {
    return false;
  }
  for (let i=0; i<list1.length; i++) {
    if (list1[i] != list2[i]) {
      return false;
    }
  }
  return true;
}

export function is_list_include(list, listArray) {
  for (let i=0; i<listArray.length; i++) {
      if (arrayEquals(listArray[i], list)) {
          return true;
      }
  }
  return false;
}

export function is_include(val, list){
  for (var i = 0; i < list.length; i++) {
    var d = list[i];
    if (val == d) {
      return true;
    }
  }
  return false;
}

export function getExtremum(list:number[]):[number, number] {
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

export function get_index_of_element(val:any, list:any[]):number {
  for (var i=0; i<list.length; i++) {
    if (val == list[i]) {
      return i;
    }
  }
  throw new Error('cannot get index of element')
}

export function TypeOf(element:any):string {
  var type = typeof element;
  if (type == 'number') {
    return 'float';
  } else if (type == 'string') {
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