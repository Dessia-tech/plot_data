import { TextStyle, EdgeStyle, SurfaceStyle } from "./style";
import { string_to_rgb, rgb_to_hex, color_to_string, isHex, isRGB, string_to_hex } from "./color_conversion";
import { Shape, MyMath, List } from "./toolbox";

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
  
  
    draw_horizontal_graduations(context, mvx, scaleX, axis_x_start, axis_y_start, axis_y_end, x_step, font_size, X, canvas_width) {
      var i=0;
      context.textAlign = 'center';
      var x_nb_digits = Math.max(0, 1-Math.floor(Math.log10(x_step)));
      var grad_beg_x = Math.floor(1/this.x_step * ((axis_x_start - mvx - X)/scaleX)) * this.x_step;
      var grad_end_x = Math.ceil(1/this.x_step * ((canvas_width - mvx)/scaleX)) * this.x_step;
  
      while(grad_beg_x + i*x_step < grad_end_x) {
        if (this.grid_on === true) {
          context.strokeStyle = 'lightgrey';
          Shape.drawLine(context, [[scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_start], [scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end + 3]]);
        } else {
          Shape.drawLine(context, [[scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end - 3], [scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end + 3]]);
        }
        context.fillText(MyMath.round(grad_beg_x + i*x_step, x_nb_digits), scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end + font_size);
        i++
      }
      context.stroke();
    }
  
    draw_vertical_graduations(context, mvy, scaleY, axis_x_start, axis_x_end, axis_y_end, y_step, Y) {
      var i=0;
      var grad_beg_y = Math.ceil(-1/this.y_step*((axis_y_end - mvy - Y)/scaleY)) * this.y_step;
      var grad_end_y = Math.floor(mvy/(this.y_step * scaleY)) * this.y_step;
      context.textAlign = 'end';
      context.textBaseline = 'middle';
      var y_nb_digits = Math.max(0, 1-Math.floor(Math.log10(y_step)));
      while (grad_beg_y + (i-1)*y_step < grad_end_y) {
          if (this.grid_on === true) {
            context.strokeStyle = 'lightgrey';
            Shape.drawLine(context, [[axis_x_start - 3, -scaleY*(grad_beg_y + i*y_step) + mvy + Y], [axis_x_end, -scaleY*(grad_beg_y + i*y_step) + mvy + Y]]);
          } else {
            Shape.drawLine(context, [[axis_x_start - 3, -scaleY*(grad_beg_y + i*y_step) + mvy + Y], [axis_x_start + 3, -scaleY*(grad_beg_y + i*y_step) + mvy + Y]]);
          }
          context.fillText(MyMath.round(grad_beg_y + i*y_step, y_nb_digits), axis_x_start - 5, -scaleY*(grad_beg_y + i*y_step) + mvy + Y);
        i++;
      }
  
      context.stroke();
    }

    draw_horizontal_log_graduations(context, mvx, scaleX, minX, maxX, axis_y_start, axis_y_end, font_size, X, canvas_width) {
      context.textAlign = 'center';
      let delta = scaleX;
      let numbers = [1];
      if (delta >= canvas_width/3 && delta <= canvas_width/2) {
        numbers = [1, 5];
      } else if (delta > canvas_width/2 && delta <= 3/4*canvas_width) {
        numbers = [1, 2, 5];
      } else if (delta > 3/4*canvas_width) {
        numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      }
      let start_pow = Math.floor(minX);
      let end_pow = Math.ceil(maxX);
      for (let power=start_pow; power <= end_pow; power++) {
        for (let num of numbers) {
          let x_coord = num * Math.pow(10, power);
          if (this.grid_on === true) {
            context.strokeStyle = 'lightgrey';
            Shape.drawLine(context, [[scaleX * Math.log10(x_coord) + mvx + X, axis_y_start], [scaleX * Math.log10(x_coord) + mvx + X, axis_y_end + 3]]);
          } else {
            Shape.drawLine(context, [[scaleX * Math.log10(x_coord) + mvx + X, axis_y_end - 3], [scaleX*Math.log10(x_coord) + mvx + X, axis_y_end + 3]]);
          }
          context.fillText(x_coord, scaleX*Math.log10(x_coord) + mvx + X, axis_y_end + font_size);
        }
      } 
      context.stroke();
    }


    draw_vertical_log_graduations(context, mvy, scaleY, minY, maxY, axis_x_start, axis_x_end, axis_y_end, canvas_height, Y) {
      context.textAlign = 'end';
      context.textBaseline = 'middle';

      let delta = scaleY;
      let numbers = [1];
      if (delta >= canvas_height/3 && delta <= canvas_height/2) {
        numbers = [1, 5];
      } else if (delta > canvas_height/2 && delta <= 3/4*canvas_height) {
        numbers = [1, 2, 5];
      } else if (delta > 3/4*canvas_height) {
        numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      }

      let start_pow = Math.floor(-minY);
      let end_pow = Math.ceil(-maxY);

      for (let power=start_pow; power<=end_pow; power++) {
        for (let num of numbers) {
          let y_coord = num * Math.pow(10, power);
          if (this.grid_on === true) {
            context.strokeStyle = 'lightgrey';
            Shape.drawLine(context, [[axis_x_start - 3, -scaleY * Math.log10(y_coord) + mvy + Y], [axis_x_end, -scaleY* Math.log10(y_coord) + mvy + Y]]);
          } else {
            Shape.drawLine(context, [[axis_x_start - 3, -scaleY * Math.log10(y_coord) + mvy + Y], [axis_x_start + 3, -scaleY * Math.log10(y_coord) + mvy + Y]]);
          }
          context.fillText(y_coord, axis_x_start - 5, -scaleY * Math.log10(y_coord) + mvy + Y);
        }
      }
      context.stroke();
    }

  
    draw_histogram_vertical_graduations(context, height, decalage_axis_y, max_frequency, axis_x_start, y_step, Y, coeff=0.88) {
      let scale = (coeff*height - decalage_axis_y) / max_frequency;
      let grad_beg_y = height - decalage_axis_y;
      let i = 0;
      context.textAlign = 'end';
      context.textBaseline = 'middle';
      while (i * y_step < max_frequency + y_step) {
        Shape.drawLine(context, [[axis_x_start - 3, grad_beg_y - scale * (i * y_step) + Y], 
                       [axis_x_start + 3, grad_beg_y - scale * (i * y_step) + Y]]);
        context.fillText(i * y_step, axis_x_start - 5, grad_beg_y - scale * (i * y_step) + Y);
        i++;
      }
      context.stroke();
    }
  
  
    draw_horizontal_axis(context, mvx, scaleX, width, height, init_scaleX, minX, maxX, scroll_x, 
      decalage_axis_x, decalage_axis_y, X, Y, to_disp_attribute_name, log_scale_x, x_step?) {
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
        this.x_step = x_step || Math.min(num/(kx*(this.nb_points_x-1)), width/(scaleX*(this.nb_points_x - 1)));
      }
      let font_size = Math.max(15, Math.ceil(0.01*(height + width)));
      context.font = 'bold ' + font_size + 'px Arial';
      context.textAlign = 'end';
      context.fillStyle = this.graduation_style.text_color;
      context.fillText(to_disp_attribute_name, axis_x_end - 5, axis_y_end - 10);
      // draw_horizontal_graduations
      context.font = this.graduation_style.font_size.toString() + 'px Arial';
      if (log_scale_x) {
        this.draw_horizontal_log_graduations(context, mvx, scaleX, minX, maxX, axis_y_start, axis_y_end, 
          this.graduation_style.font_size, X, width);
      } else {
        this.draw_horizontal_graduations(context, mvx, scaleX, axis_x_start, axis_y_start, axis_y_end, 
          this.x_step, this.graduation_style.font_size, X, width);
      }
      context.closePath();
    }
  
  
    draw_vertical_axis(context, mvy, scaleY, width, height, init_scaleY, minY, maxY, 
      scroll_y, decalage_axis_x, decalage_axis_y, X, Y, to_disp_attribute_name, log_scale_y, y_step?) {
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
        this.y_step = y_step || Math.min(num/(ky*(this.nb_points_y-1)), height/(scaleY*(this.nb_points_y - 1)));
      }
      let font_size = Math.max(15, Math.ceil(0.01*(height + width)));
      context.font = 'bold ' + font_size + 'px Arial';
      context.textAlign = 'start';
      context.fillStyle = this.graduation_style.text_color;
      context.fillText(to_disp_attribute_name, axis_x_start + 5, axis_y_start + 20);
      context.font = this.graduation_style.font_size.toString() + 'px Arial';
      if (log_scale_y) {
        this.draw_vertical_log_graduations(context, mvy, scaleY, minY, maxY, axis_x_start, axis_x_end, axis_y_end, height, Y)
      } else {
        this.draw_vertical_graduations(context, mvy, scaleY, axis_x_start, axis_x_end, axis_y_end, this.y_step, Y);
      }
      context.closePath();
    }
  
  
    draw_histogram_x_axis(context, scaleX, init_scaleX, mvx, width, height, graduations, decalage_axis_x, 
                          decalage_axis_y, scroll_x, X, Y, to_disp_attribute_name, x_step?) {
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
      let font_size = Math.max(15, Math.ceil(0.01*(height + width)));
      context.font = 'bold ' + font_size + 'px Arial';
      context.textAlign = 'end';
      context.fillStyle = this.graduation_style.text_color;
      context.fillText(to_disp_attribute_name, axis_x_end - 5, axis_y_end - 10);
  
      // draw_horizontal_graduations
      context.font = this.graduation_style.font_size.toString() + 'px Arial';
      var i=0;
      context.textAlign = 'center';
      var grad_beg_x = decalage_axis_x/scaleX + 1/4;
      while(i < graduations.length) {
        if (this.grid_on === true) {
          context.strokeStyle = 'lightgrey';
          Shape.drawLine(context, [[scaleX*(grad_beg_x + i) + mvx + X, axis_y_start], [scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end + 3]]);
        } else {
          Shape.drawLine(context, [[scaleX*(grad_beg_x + i) + mvx + X, axis_y_end - 3], [scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end + 3]]);
        }
        context.fillText(graduations[i], scaleX*(grad_beg_x + i) + mvx + X, axis_y_end + this.graduation_style.font_size);
        i++;
      }
      context.stroke();
      context.closePath();
    }
  
  
    draw_histogram_y_axis(context, width, height, max_frequency, decalage_axis_x, 
                          decalage_axis_y, X, Y, to_disp_attribute_name, y_step, coeff?) {
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
      // context.stroke();
      // Graduations
      this.y_step = y_step;
      let font_size = Math.max(15, Math.ceil(0.01*(height + width)));
      context.font = 'bold ' + font_size + 'px Arial';      
      context.textAlign = 'start';
      context.fillStyle = this.graduation_style.text_color;
      context.fillText(to_disp_attribute_name, axis_x_start + 5, axis_y_start + 20);
  
      //draw vertical graduations
      context.font = this.graduation_style.font_size.toString() + 'px Arial';
      this.draw_histogram_vertical_graduations(context, height, decalage_axis_y, max_frequency, axis_x_start, y_step, Y, coeff);
      context.closePath();
    }
  
    draw_scatter_axis(context, mvx, mvy, scaleX, scaleY, width, height, init_scaleX, init_scaleY, lists, 
      to_display_attributes, scroll_x, scroll_y, decalage_axis_x, decalage_axis_y, X, Y, canvas_width, canvas_height,
      log_scale_x, log_scale_y) {
      
      this.draw_sc_horizontal_axis(context, mvx, scaleX, width, height, init_scaleX, lists[0], to_display_attributes[0], 
        scroll_x, decalage_axis_x, decalage_axis_y, X, Y, canvas_width, log_scale_x);
      this.draw_sc_vertical_axis(context, mvy, scaleY, width, height, init_scaleY, lists[1], to_display_attributes[1], 
        scroll_y, decalage_axis_x, decalage_axis_y, X, Y, canvas_height, log_scale_y);
    }
  
    draw_sc_horizontal_axis(context, mvx, scaleX, width, height, init_scaleX, list, to_display_attribute:Attribute, 
      scroll_x, decalage_axis_x, decalage_axis_y, X, Y, canvas_width, log_scale_x=false) {
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
      let font_size = Math.max(15, Math.ceil(0.01*(height + width))); 
      context.font = 'bold ' + font_size + 'px Arial';
      context.textAlign = 'end';
      context.textBaseline = "alphabetic";
      context.fillText(to_display_attribute['name'], axis_x_end - 5, axis_y_end - 10);
      context.stroke();
      //Graduations
      context.font = this.graduation_style.font_size.toString() + 'px Arial';
      if (log_scale_x) {
        if (TypeOf(list[0]) === 'string') {
          throw new Error("Cannot use log scale on a non float axis");
        }
        this.draw_horizontal_log_graduations(context, mvx, scaleX, Math.log10(list[0]), Math.log10(list[1]), axis_y_start,
          axis_y_end, this.graduation_style.font_size, X, width);
      } else {
        this.draw_sc_horizontal_graduations(context, mvx, scaleX, init_scaleX, axis_x_start, axis_x_end, 
          axis_y_start, axis_y_end, list, to_display_attribute, scroll_x, X, canvas_width);  
      }
      context.stroke();
      context.closePath();  
    }
  
    draw_sc_vertical_axis(context, mvy, scaleY, width, height, init_scaleY, list, to_display_attribute, scroll_y, 
      decalage_axis_x, decalage_axis_y, X, Y, canvas_height, log_scale_y=false) {
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
      let font_size = Math.max(15, Math.ceil(0.01*(height + width)));
      context.font = 'bold ' + font_size + 'px Arial';
      context.strokeStyle = this.axis_style.color_stroke; 
      context.textAlign = 'start';
      context.textBaseline = "alphabetic";
      context.fillText(to_display_attribute['name'], axis_x_start + 5, axis_y_start + 20);
      context.stroke();
  
      //Graduations
      context.font = this.graduation_style.font_size.toString() + 'px Arial';
      if (log_scale_y) {
        if (TypeOf(list[0]) === 'string') {
          throw new Error("Cannot use log scale on a non float axis.")
        }
        this.draw_vertical_log_graduations(context, mvy, scaleY, -Math.log10(list[0]), -Math.log10(list[1]), 
        axis_x_start, axis_x_end, axis_y_end, canvas_height, Y);
      } else {
        this.draw_sc_vertical_graduations(context, mvy, scaleY, init_scaleY, axis_x_start, axis_x_end, axis_y_start, 
          axis_y_end, list, to_display_attribute, scroll_y, Y, canvas_height);
      }
      context.stroke();
      context.closePath();
    }
  
    draw_sc_horizontal_graduations(context, mvx, scaleX, init_scaleX, axis_x_start, axis_x_end, axis_y_start, axis_y_end, list, attribute, scroll_x, X, canvas_width) {
      context.textAlign = 'center';
      if (attribute['type_'] == 'float') {
        // var minX = list[0];
        // var maxX = list[1];
        if (scroll_x % 5 == 0) {
          // let kx = 1.1*scaleX/init_scaleX;
          // let num = Math.max(maxX - minX, 1);
          // this.x_step = Math.min(num/(kx*(this.nb_points_x-1)), canvas_width/(scaleX*(this.nb_points_x - 1)));
          this.x_step = canvas_width/(scaleX*(this.nb_points_x - 1));
        }
        var i=0;
        var x_nb_digits = Math.max(0, 1-Math.floor(Math.log10(this.x_step)));
        var grad_beg_x = Math.ceil(1/this.x_step * (axis_x_start - mvx - X)/scaleX) * this.x_step;
        var grad_end_x = Math.ceil(1/this.x_step * ((canvas_width - mvx)/scaleX)) * this.x_step;
        while(grad_beg_x + i*this.x_step < grad_end_x) {
          if (this.grid_on === true) {
            Shape.drawLine(context, [[scaleX*(grad_beg_x + i*this.x_step) + mvx + X, axis_y_start], [scaleX*(grad_beg_x + i*this.x_step) + mvx + X, axis_y_end + 3]]);
          } else {
            Shape.drawLine(context, [[scaleX*(grad_beg_x + i*this.x_step) + mvx + X, axis_y_end - 3], [scaleX*(grad_beg_x + i*this.x_step) + mvx + X, axis_y_end + 3]]);
          }
          context.fillText(MyMath.round(grad_beg_x + i*this.x_step, x_nb_digits), scaleX*(grad_beg_x + i*this.x_step) + mvx + X, axis_y_end + this.graduation_style.font_size);          i++;
        }
      } else {
        for (let i=0; i<list.length; i++) {
          if ((scaleX*i + mvx + X > axis_x_start) && (scaleX*i + mvx + X < axis_x_end)) {
            if (this.grid_on === true) {
              Shape.drawLine(context, [[scaleX*i + mvx + X, axis_y_start], [scaleX*i + mvx + X, axis_y_end + 3]]);
            } else {
              Shape.drawLine(context, [[scaleX*i + mvx + X, axis_y_end - 3], [scaleX*i + mvx + X, axis_y_end + 3]]);
            }
            context.fillText(list[i], scaleX*i + mvx + X, axis_y_end + this.graduation_style.font_size);
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
          // let ky = 1.1*scaleY/init_scaleY;
          // let num = Math.max(maxY - minY, 1);
          // this.y_step = Math.min(num/(ky*(this.nb_points_y-1)), canvas_height/(scaleY*(this.nb_points_y - 1)));
          this.y_step = canvas_height/(scaleY*(this.nb_points_y - 1));
        }
        var i=0;
        var grad_beg_y = Math.ceil(-1/this.y_step*((axis_y_end - mvy - Y)/scaleY)) * this.y_step;
        var grad_end_y = Math.floor(mvy/(this.y_step * scaleY)) * this.y_step;
        var y_nb_digits = Math.max(0, 1-Math.floor(Math.log10(this.y_step)));
        while (grad_beg_y + (i-1)*this.y_step < grad_end_y) {
          if (this.grid_on === true) {
            Shape.drawLine(context,[[axis_x_start - 3, -scaleY*(grad_beg_y + i*this.y_step) + mvy + Y], [axis_x_end, -scaleY*(grad_beg_y + i*this.y_step) + mvy + Y]]);
          } else {
            Shape.drawLine(context, [[axis_x_start - 3, -scaleY*(grad_beg_y + i*this.y_step) + mvy + Y], [axis_x_start + 3, -scaleY*(grad_beg_y + i*this.y_step) + mvy + Y]]);
          }
          context.fillText(MyMath.round(grad_beg_y + i*this.y_step, y_nb_digits), axis_x_start - 5, -scaleY*(grad_beg_y + i*this.y_step) + mvy + Y);
          i++;
        }
      } else {
        for (let i=0; i<list.length; i++) {
          if ((-scaleY*i + mvy + Y > axis_y_start + 5) && (-scaleY*i + mvy + Y < axis_y_end)) {
            if (this.grid_on === true) {
              Shape.drawLine(context,[[axis_x_start - 3, -scaleY*i + mvy + Y], [axis_x_end, -scaleY*i + mvy + Y]]);
            } else {
                Shape.drawLine(context, [[axis_x_start - 3, -scaleY*i + mvy + Y], [axis_x_start + 3, -scaleY*i + mvy + Y]]);
            }
            context.fillText(list[i], axis_x_start - 5, -scaleY*i + mvy + Y);
          }
        }
      }
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
 * A class for sorting lists.
 */
export class Sort {
    nbPermutations:number = 0;
    permutations: number[] = [];
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
  
      this.permutations = [];
      for (let i=0; i<list.length; i++) this.permutations.push(i);
  
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
            this.permutations = List.move_elements(min, i, this.permutations);
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


export class Tooltip {
    constructor(public surface_style:SurfaceStyle,
                public text_style:TextStyle,
                public attribute_names?:string[],
                public message?: Text,
                public tooltip_radius:number=10,
                public type_:string='tooltip',
                public name:string='') {
                }
  
    public static deserialize(serialized) {
      let default_surface_style = {color_fill:string_to_rgb('black'), opacity:0.9, hatching:undefined};
      let default_text_style = {text_color:string_to_rgb('lightgrey'), font_size:12, font_style:'Calibri', 
                                text_align_x:'start', text_align_y:'alphabetic', name:''};
      let default_dict_ = {surface_style:default_surface_style, text_style:default_text_style, tooltip_radius:7};
      serialized = set_default_values(serialized, default_dict_);
      var surface_style = SurfaceStyle.deserialize(serialized['surface_style']);
      var text_style = TextStyle.deserialize(serialized['text_style']);
  
      return new Tooltip(surface_style,
                         text_style,
                         serialized['attributes'],
                         serialized["text"],
                         serialized['tooltip_radius'],
                         serialized['type_'],
                         serialized['name']);
    }
  
    isTooltipInsideCanvas(cx, cy, size, mvx, mvy, scaleX, scaleY, canvasWidth, canvasHeight) {
      var x = scaleX*cx + mvx;
      var y = scaleY*cy + mvy;
      var length = 100*size;
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
      var textfills = ['Information'];
      var text_max_length = context.measureText('Information').width;
      for (let i=0; i<this.attribute_names.length; i++) {
        let attribute_name = this.attribute_names[i];
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
  
    initialize_text_mergeON(context, x_nb_digits, y_nb_digits, point, initial_point_list, elements, axes): [string[], number] {
      var textfills = ['Information'];
      var text_max_length = context.measureText('Information').width;
      for (let i=0; i<this.attribute_names.length; i++) {
        let attribute_name = this.attribute_names[i];
        let attribute_type = TypeOf(elements[0][attribute_name]);
        if (attribute_type == 'float') { 
          if (attribute_name === axes[0]) {
            var text = attribute_name + ' : ' + MyMath.round(point.cx, Math.max(x_nb_digits, y_nb_digits,2)); //x_nb_digits évidemment pas définie lorsque l'axe des x est un string...
          } else if (attribute_name === axes[1]) {
            var text = attribute_name + ' : ' + MyMath.round(-point.cy, Math.max(x_nb_digits, y_nb_digits,2));
          } else {
            let index = point.points_inside[0].getPointIndex(initial_point_list);
            let elt = elements[index];
            var text = attribute_name + ' : ' + MyMath.round(elt[attribute_name], Math.max(x_nb_digits, y_nb_digits,2));
          }
          var text_w = context.measureText(text).width;
          textfills.push(text);
        }
        if (text_w > text_max_length) {
          text_max_length = text_w;
        }
      }
      return [textfills, text_max_length];
    }
  
    draw(context, point, mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, 
      X, Y, x_nb_digits, y_nb_digits, point_list, initial_point_list, elements, 
      mergeON, axes, log_scale_x, log_scale_y) {
      var textfills = [];
      var text_max_length = 0;
      context.font = this.text_style.font;
      [x_nb_digits, y_nb_digits] = this.refresh_nb_digits(x_nb_digits, y_nb_digits);
      if (point.isPointInList(point_list)) {
        var index = point.getPointIndex(point_list);
        var elt = elements[index];
        if (mergeON === true) {
          [textfills, text_max_length] = this.initialize_text_mergeON(context, x_nb_digits, y_nb_digits, point, initial_point_list, elements, axes);
        } else {
          [textfills, text_max_length] = this.initialize_text_mergeOFF(context, x_nb_digits, y_nb_digits, elt);
        }
      }
  
      if (textfills.length > 0) {
        var tp_height = textfills.length*this.text_style.font_size*1.25;
        var cx = point.cx, cy = point.cy;
        if (log_scale_x) cx = Math.log10(cx);
        if (log_scale_y) cy = -Math.log10(-cy);
        var point_size = point.point_style.size;
        var decalage = 2.5*point_size + 15;
        var tp_x = scaleX*cx + mvx + decalage + X;
        var tp_y = scaleY*cy + mvy - 1/2*tp_height + Y;
        var tp_width = text_max_length*1.3;
  
        // Bec
        var point1 = [tp_x - decalage/2, scaleY*cy + mvy + Y];
        var point2 = [tp_x, scaleY*cy + mvy + Y + 5];
        var point3 = [tp_x, scaleY*cy + mvy + Y - 5];
  
        if (tp_x + tp_width  > canvas_width + X) {
          tp_x = scaleX*cx + mvx - decalage - tp_width + X;
          point1 = [tp_x + tp_width, scaleY*cy + mvy + Y + 5];
          point2 = [tp_x + tp_width, scaleY*cy + mvy + Y - 5];
          point3 = [tp_x + tp_width + decalage/2, scaleY*cy + mvy + Y];
        }
        if (tp_y < Y) {
          tp_y = scaleY*cy + mvy + Y - 7*point_size;
        }
        if (tp_y + tp_height > canvas_height + Y) {
          tp_y = scaleY*cy + mvy - tp_height + Y + 7*point_size;
        }
        context.beginPath();
        Shape.drawLine(context, [point1, point2, point3]);
        context.stroke();
        context.fill();
  
        Shape.roundRect(tp_x, tp_y, tp_width, tp_height, this.tooltip_radius, context, this.surface_style.color_fill, string_to_hex('black'), 0.5,
        this.surface_style.opacity, []);
        context.fillStyle = this.text_style.text_color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
  
        // var x_start = tp_x + 1/10*tp_width;
  
        var current_y = tp_y + 0.75*this.text_style.font_size;
        for (var i=0; i<textfills.length; i++) {
          if (i == 0) {
            context.font = 'bold ' + this.text_style.font;
            context.fillText(textfills[0], tp_x + tp_width/2, current_y);
            context.font = this.text_style.font;
            current_y += this.text_style.font_size * 1.1;
          } else {
            context.fillText(textfills[i], tp_x + tp_width/2, current_y); 
            current_y += this.text_style.font_size;
          }
        }
  
        context.globalAlpha = 1;
        context.stroke();
        context.closePath();
      }
  
    }
  
    manage_tooltip(context, mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, tooltip_list, 
      X, Y, x_nb_digits, y_nb_digits, point_list, initial_point_list, elements, mergeON, axes, 
      log_scale_x, log_scale_y) {

      for (var i=0; i<tooltip_list.length; i++) {
        let cx = tooltip_list[i].cx, cy = tooltip_list[i].cy;
        if (log_scale_x) cx = Math.log10(cx);
        if (log_scale_y) cy = -Math.log10(-cy);
        if (tooltip_list[i] && this.isTooltipInsideCanvas(cx, cy, tooltip_list[i].size, mvx, mvy, 
          scaleX, scaleY, canvas_width, canvas_height)) {

          this.draw(context, tooltip_list[i], mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, 
            X, Y, x_nb_digits, y_nb_digits, point_list, initial_point_list, elements, mergeON, axes,
            log_scale_x, log_scale_y);

        }
      }
    }


    draw_primitive_tooltip(context, scale, mvx, mvy, X, Y, x, y, canvas_width, canvas_height) {
      context.font = this.text_style.font;
      var tp_height = this.text_style.font_size*1.25;
      var tp_x = x + 5
      var tp_y = y - 1/2*tp_height;
      var text_length = context.measureText(this.message).width;
      var tp_width = text_length*1.3;
      
      // Bec
      // var point1 = [tp_x + 5, y];
      // var point2 = [tp_x, y + 15];
      // var point3 = [tp_x, y - 15];

      if (tp_x + tp_width  > canvas_width + X) {
        tp_x = x - tp_width;
        // point1 = [tp_x + tp_width, y + 15];
        // point2 = [tp_x + tp_width, y - 15];
        // point3 = [tp_x + tp_width, y];
      }
      if (tp_y < Y) {
        tp_y = y;
      }
      if (tp_y + tp_height > canvas_height + Y) {
        tp_y = y - tp_height;
      }

      // context.beginPath();
      // Shape.drawLine(context, [point1, point2, point3]);
      // context.stroke();
      // context.fill();

      Shape.roundRect(tp_x, tp_y, tp_width, tp_height, this.tooltip_radius, context, this.surface_style.color_fill, string_to_hex('black'), 0.5,
      this.surface_style.opacity, []);
      context.fillStyle = this.text_style.text_color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(this.message, tp_x + tp_width/2, tp_y + tp_height/2);
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


export class Window {
    constructor(public height:number,public width:number, public name?:string){
    }
  
    public static deserialize(serialized) {
      return new Window(serialized['height'],
                        serialized['width'],
                        serialized['name']);
    }
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


var alert_count = 0;

export function merge_alert() {
  alert('Note: when point merge option is enabled, only float attributes will be displayed in tooltips.')
  alert_count++;
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
      if (!dict_.hasOwnProperty(property) || dict_[property] === null) {
        entries.push([property, default_dict_[property]]);
      }
    }
    return Object.fromEntries(entries);
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


export function drawLines(ctx, pts, first_elem) {
    if (first_elem) ctx.moveTo(pts[0], pts[1]);
    for(var i=2; i<pts.length-1; i+=2) ctx.lineTo(pts[i], pts[i+1]);
}


export function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}