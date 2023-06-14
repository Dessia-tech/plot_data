import { TextStyle, EdgeStyle, SurfaceStyle } from "./style";
import { string_to_rgb, rgb_to_hex, color_to_string, isHex, isRGB, string_to_hex, rgb_to_string } from "./color_conversion";
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
      // return [scaleX*(grad_beg_x) + mvx + X, scaleX*(grad_beg_x + (i-1)*x_step) + mvx + X]
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
        // [this.xStart, this.xEnd] = this.draw_horizontal_graduations(context, mvx, scaleX, axis_x_start, axis_y_start, axis_y_end,
        //   this.x_step, this.graduation_style.font_size, X, width);
        this.draw_horizontal_graduations(context, mvx, scaleX, axis_x_start, axis_y_start, axis_y_end,
          this.x_step, this.graduation_style.font_size, X, width);
      }
      context.closePath();
      // return [axis_x_start, axis_x_end]
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
      // this.xStart = scaleX*(grad_beg_x) + mvx + X;
      // this.xEnd = scaleX*(grad_beg_x + i - 1) + mvx + X;
      // return [axis_x_start, axis_x_end]
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
      return [axis_y_end, axis_y_start]
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
  public strokeStyle: string ="hsl(0, 0%, 0%)";
  public textColor: string ="hsl(0, 0%, 100%)";
  public fillStyle: string ="hsl(0, 0%, 0%)";
  public fontSize: number = 12;
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

    buildText(context, elt): [string[], number] {
      var textfills = ['Information: '];
      var text_max_length = context.measureText('Information: ').width;

      elt.printedAttributes.forEach(attr => {
        let text = `  - ${attr}: ${elt[attr]}`
        textfills.push(text);
        let textWidth = context.measureText(text).width;
        if (textWidth > text_max_length) { text_max_length = textWidth };
      })

      return [textfills, text_max_length];
    }

    newDraw(shape: newShape, context: CanvasRenderingContext2D) {
      let [textfills, text_max_length] = this.buildText(context, shape);
      const contextMatrix = context.getTransform();
      const scaleX = contextMatrix.a;
      const scaleY = contextMatrix.d;
      const TEXT_OFFSET = 6;
      const SIZE_Y = textfills.length + 1.5;
      const SQUARE_OFFSET_Y = 15;
      const LENGTH_FACTOR = 1.1;
      if (textfills.length > 0) {
        
        const size = new Vertex(
          (text_max_length * LENGTH_FACTOR + TEXT_OFFSET) / Math.abs(scaleX),
          SIZE_Y * this.text_style.font_size / Math.abs(scaleY)
          );

        const OFFSET = new Vertex(
          scaleX < 0? TEXT_OFFSET - text_max_length * LENGTH_FACTOR : TEXT_OFFSET, 
          scaleY < 0? -this.text_style.font_size * (SIZE_Y + 1) / 2 : this.text_style.font_size * (SIZE_Y - 1) / 2
          );

        let squareOrigin = new Vertex(shape.tooltipOrigin.x - size.x / 2, shape.tooltipOrigin.y + SQUARE_OFFSET_Y / Math.abs(scaleY))
        let textOrigin = squareOrigin.scale(new Vertex(scaleX, scaleY)).add(OFFSET);
        console.log(this.tooltip_radius)

        let tooltip = new newRoundRect(squareOrigin, size, this.tooltip_radius);
        tooltip.fillStyle = this.fillStyle;
        let tooltip2 = new newRect(squareOrigin, size);
        tooltip2.fillStyle = this.fillStyle;
        console.log(tooltip)
        console.log(tooltip2)
        tooltip.draw(context);

        context.scale(1 / scaleX, 1 / scaleY);
        let downTriangle = new Triangle(shape.tooltipOrigin.scale(new Vertex(scaleX, scaleY)), SQUARE_OFFSET_Y, scaleY < 0? 'up' : 'down');
        downTriangle.center.y += Math.sign(scaleY) * SQUARE_OFFSET_Y / 2;
        downTriangle.path = downTriangle.buildPath();
        downTriangle.strokeStyle = this.strokeStyle;
        downTriangle.fillStyle = this.fillStyle;
        downTriangle.draw(context);
        textfills.forEach((row, index) => {
          textOrigin.y += index * this.text_style.font_size;
          const text = new newText(row, textOrigin, null, this.fontSize, "sans-serif", "left", "middle", index == 0? 'bold' : '');
          text.fillStyle = this.textColor;
          text.draw(context)
        })
        context.setTransform(contextMatrix)

        // Bec
        // var point1 = [shape.tooltipOrigin.x, shape.tooltipOrigin.y];
        // var point2 = [shape.tooltipOrigin.x + 5, shape.tooltipOrigin.y + 5];
        // var point3 = [shape.tooltipOrigin.x + 5, shape.tooltipOrigin.y - 5];

        // if (tp_x + tp_width  > canvasWidth) {
        //   tp_x = scaleX*cx + mvx - decalage - tp_width + X;
        //   point1 = [tp_x + tp_width, scaleY*cy + mvy + Y + 5];
        //   point2 = [tp_x + tp_width, scaleY*cy + mvy + Y - 5];
        //   point3 = [tp_x + tp_width + decalage/2, scaleY*cy + mvy + Y];
        // }
        // if (tp_y < Y) {
        //   tp_y = scaleY*cy + mvy + Y - 7*point_size;
        // }
        // if (tp_y + tp_height > canvas_height + Y) {
        //   tp_y = scaleY*cy + mvy - tp_height + Y + 7*point_size;
        // }
        // context.beginPath();
        // Shape.drawLine(context, [point1, point2, point3]);
        // context.stroke();
        // context.fill();

        // Shape.roundRect(
        //   tp_x, tp_y, tp_width, tp_height, this.tooltip_radius, context, this.surface_style.color_fill, 
        //   string_to_hex('black'), 0.5, this.surface_style.opacity, []);
        // context.fillStyle = this.text_style.text_color;
        // context.textAlign = 'center';
        // context.textBaseline = 'middle';

        // // var x_start = tp_x + 1/10*tp_width;

        // var current_y = tp_y + 0.75*this.text_style.font_size;
        // for (var i=0; i<textfills.length; i++) {
        //   if (i == 0) {
        //     context.font = 'bold ' + this.text_style.font;
        //     context.fillText(textfills[0], tp_x + tp_width/2, current_y);
        //     context.font = this.text_style.font;
        //     current_y += this.text_style.font_size * 1.1;
        //   } else {
        //     context.fillText(textfills[i], tp_x + tp_width/2, current_y);
        //     current_y += this.text_style.font_size;
        //   }
        // }

        // context.globalAlpha = 1;
        // context.stroke();
        // context.closePath();
      }

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
      if (tp_y < Y) { tp_y = y };
      if (tp_y + tp_height > canvas_height + Y) { tp_y = y - tp_height };

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

    // The algorithm require a previous and next point to the current point array.
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


export function export_to_txt(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function export_to_csv(rows, filename="my_data.csv") {
  let csvContent = "data:text/csv;charset=utf-8,"
    + rows.map(e => e.join(",")).join("\n");
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file named "my_data.csv".
  document.body.removeChild(link);
}

export class RubberBand {
  public axisMin: number = 0;
  public axisMax: number = 0;
  public realMin: number = 0;
  public realMax: number = 0;
  public isHover: boolean = false;
  public isClicked: boolean = false;
  public isSelected: boolean = false;
  public path: Path2D; // unused for the moment
  public minUpdate: boolean = false;
  public maxUpdate: boolean = false;
  public lastValues: Vertex = new Vertex(null, null);
  readonly SMALL_SIZE: number = 20;
  readonly BORDER_SIZE: number = 20;
  readonly MIN_LENGTH = 5;
  readonly BORDER = 5;
  constructor(public attributeName: string,
              private _minValue: number,
              private _maxValue: number,
              public isVertical: boolean) {}

  public get canvasLength() {return Math.abs(this.realMax - this.realMin)}

  public get length() {return Math.abs(this.maxValue - this.minValue)}

  public get normedLength() {return Math.abs(this.axisMax - this.axisMin)}

  public set minValue(value: number) {this._minValue = value}

  public get minValue() {return this._minValue}

  public set maxValue(value: number) {this._maxValue = value}

  public get maxValue() {return this._maxValue}

  public draw(origin: number, context: CanvasRenderingContext2D, colorFill: string, colorStroke: string, lineWidth: number, alpha: number) {
    if (this.isVertical) {
      Shape.rect(origin - this.SMALL_SIZE / 2, this.realMin, this.SMALL_SIZE, this.canvasLength, context, colorFill, colorStroke, lineWidth, alpha);
    } else {
      Shape.rect(this.realMin, origin - this.SMALL_SIZE / 2, this.canvasLength, this.SMALL_SIZE, context, colorFill, colorStroke, lineWidth, alpha);
    }
  }

  public realToAxis(initAxisCoord: number, endAxisCoord: number): void {
    const axisLength = Math.abs(initAxisCoord - endAxisCoord);
    this.axisMin = (this.realMin - endAxisCoord) / axisLength;
    this.axisMax = (this.realMax - endAxisCoord) / axisLength;
  }

  public axisToReal(initAxisCoord: number, endAxisCoord: number): void {
    const axisLength = Math.abs(initAxisCoord - endAxisCoord);
    this.realMin = this.axisMin * axisLength + initAxisCoord;
    this.realMax = this.axisMax * axisLength + initAxisCoord;
  }

  public valueToAxis(axisMin: number, axisMax: number): void {
    const interval = Math.abs(axisMin - axisMax)
    this.axisMin = this.minValue / interval;
    this.axisMax = this.maxValue / interval;
  }

  public axisToValue(axisValue: number, axis: Attribute, inverted: boolean): number { //from parallel plot axis coord (between 0 and 1) to real coord (between min_coord and max_coord)
    if (axis.type_ == 'float') {
      let real_min = axis.list[0];
      let real_max = axis.list[1];
      if ((this.isVertical && !inverted) || (!this.isVertical && inverted)) {return (1 - axisValue) * real_max + axisValue * real_min}
      return axisValue * real_max + (1 - axisValue) * real_min

    }
    let nb_values = axis.list.length;
    if ((this.isVertical && !inverted) || (!this.isVertical && inverted)) {return (1 - axisValue) * (nb_values - 1)}
    return axisValue * (nb_values - 1)
  }

  public updateFromOther(otherRubberBand: RubberBand, axisOrigin: number, axisEnd: number,
    axisInverted: boolean, otherAxisInverted: boolean) {
    this.axisMin = otherRubberBand.axisMin;
    this.axisMax = otherRubberBand.axisMax;
    this.minValue = otherRubberBand.minValue;
    this.maxValue = otherRubberBand.maxValue;
    const diffSenseSameDir = axisInverted != otherAxisInverted && this.isVertical == otherRubberBand.isVertical;
    const sameSenseDiffDir = axisInverted == otherAxisInverted && this.isVertical != otherRubberBand.isVertical;
    if (diffSenseSameDir || sameSenseDiffDir) {this.normedInvert()};
    this.axisToReal(axisOrigin, axisEnd);
  }

  public axisChangeUpdate(origin: number[], end: number[], wasVertical: boolean,
    newOrigin: number[], newEnd: number[], isVertical: boolean) {
      const bounds = [origin[0] + end[0], origin[1] + end[1]];
      const newBounds = [newOrigin[0] + newEnd[0], newOrigin[1] + newEnd[1]];
      const lengths = [Math.abs(origin[0] - end[0]), Math.abs(origin[1] - end[1])];
      const newLengths = [Math.abs(newOrigin[0] - newEnd[0]), Math.abs(newOrigin[1] - newEnd[1])];

      let index = 0;
      let newIndex = 0;
      if (wasVertical) {index = 1; this.invert(bounds);}
      else {newIndex = 1}

      const start = Math.min(origin[index], end[index]);
      const newStart = Math.min(newOrigin[newIndex], newEnd[newIndex]);
      this.switchOrientation(start, newStart, [lengths[index], newLengths[newIndex]]);

      if (!wasVertical) {this.invert(newBounds)}
  }

  public updateFromMouse(mouse1: [number, number], mouse2: [number, number], axis: Attribute,
    axisOrigin: [number, number], axisEnd: [number, number], inverted: boolean): void {
      var mouseIdx = this.isVertical ? 1 : 0;
      this.newBoundsUpdate(
        mouse1[mouseIdx], mouse2[mouseIdx],
        [axisOrigin[mouseIdx], axisEnd[mouseIdx]],
        axis, inverted);
  }

  public newBoundsUpdate(newMin: number, newMax: number, axisBounds: number[],
    axis: Attribute, inverted: boolean): void {
      this.realMin = Math.max(Math.min(newMin, newMax), axisBounds[1]);
      this.realMax = Math.min(Math.max(newMin, newMax), axisBounds[0]);
      this.realToAxis(axisBounds[0], axisBounds[1])
      this.updateMinMax(axis, inverted);
  }

  public updateMinMax(axis: Attribute, inverted: boolean): void {
    var minValue = this.axisToValue(this.axisMin, axis, inverted);
    var maxValue = this.axisToValue(this.axisMax, axis, inverted);
    this.minValue = Math.min(minValue, maxValue);
    this.maxValue = Math.max(minValue, maxValue);
  }

  public invert(axisBounds: number[]) {
    var axisIdx = this.isVertical ? 1 : 0;
    var tempMin = this.realMin;
    this.realMin = axisBounds[axisIdx] - this.realMax;
    this.realMax = axisBounds[axisIdx] - tempMin;
  }

  public normedInvert() {
    var tempMin = this.axisMin;
    this.axisMin = 1 - this.axisMax;
    this.axisMax = 1 - tempMin;
  }

  public switchOrientation(previousStart: number, newStart: number,
    axisLengths: [number, number]) {
    let relativeMin = (this.realMin - previousStart) / axisLengths[0];
    let normedLength = this.canvasLength / axisLengths[0];
    this.realMin = relativeMin * axisLengths[1] + newStart;
    this.realMax = this.realMin + normedLength * axisLengths[1];
    this.isVertical = !this.isVertical;
  }

  public flipValues(): void{
    [this.axisMin, this.axisMax] = [this.axisMax, this.axisMin];
    [this.minValue, this.maxValue] = [this.minValue, this.maxValue];
    [this.realMin, this.realMax] = [this.realMax, this.realMin];
  }

  public reset() {
    this.minValue = 0;
    this.maxValue = 0;
    this.axisMin = 0;
    this.axisMax = 0;
    this.realMin = 0;
    this.realMax = 0;
  }

  public flipMinMax() {
    if (this.minValue >= this.maxValue) {
      [this.minValue, this.maxValue] = [this.maxValue, this.minValue];
      [this.minUpdate, this.maxUpdate] = [this.maxUpdate, this.minUpdate];
    }
  }

  public includesValue(value: any, axis: Attribute): boolean {
    let includesValue = false;
    if (this.canvasLength <= this.MIN_LENGTH) {
      includesValue = true;
    }
    if (axis.name == this.attributeName) {
      let realValue = value;
      if (typeof realValue == "string") {
        if (realValue.includes('rgb') && !axis.list.includes('rgb')) {
          realValue = axis.list.indexOf(rgb_to_string(realValue));
        } else {
          realValue = axis.list.indexOf(realValue);
        }
      }
      if (realValue >= this.minValue && realValue <= this.maxValue) {
        includesValue = true;
      }
    }
    return includesValue
  }

  public includesMouse(mouseUniCoord: number): [boolean, boolean, boolean] {
    let isClicked = mouseUniCoord >= this.realMin - this.BORDER && mouseUniCoord <= this.realMax + this.BORDER;
    let onMinBorder = Math.abs(mouseUniCoord - this.realMin) <= this.BORDER;
    let onMaxBorder = Math.abs(mouseUniCoord - this.realMax) <= this.BORDER;
    return [isClicked, onMinBorder, onMaxBorder]
  }

  public mouseDown(mouseAxis: number) {
    this.isClicked = true;
    if (Math.abs(mouseAxis - this.realMin) <= this.BORDER_SIZE) {this.minUpdate = true}
    else if (Math.abs(mouseAxis - this.realMax) <= this.BORDER_SIZE) {this.maxUpdate = true}
    else {this.lastValues = new Vertex(this.minValue, this.maxValue)}
  }

  public mouseMove(downValue: number, currentValue: number) {
    if (this.isClicked) {
      if (this.minUpdate) {this.minValue = currentValue}
      else if (this.maxUpdate) {this.maxValue = currentValue}
      else {
        const translation = currentValue - downValue;
        this.minValue = this.lastValues.x + translation;
        this.maxValue = this.lastValues.y + translation;
      }
      this.flipMinMax();
    }
  }

  public mouseUp() {
    this.minUpdate = false;
    this.maxUpdate = false;
    this.isClicked = false;
  }
}

export class Vertex {
  public x: number;
  public y: number;
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  };

  get coordinates(): Vertex {return new Vertex(this.x, this.y)}

  public copy(): Vertex {return Object.create(this)}

  public add(other: Vertex): Vertex {
    let copy = this.copy();
    copy.x = this.x + other.x;
    copy.y = this.y + other.y;
    return copy
  }

  public divide(value: number): Vertex {
    let copy = this.copy();
    copy.x = this.x / value;
    copy.y = this.y / value;
    return copy
  }

  public multiply(value: number): Vertex {
    let copy = this.copy();
    copy.x = this.x * value;
    copy.y = this.y * value;
    return copy
  }

  public get normL1(): number {return Math.abs(this.x) + Math.abs(this.y)}

  public get norm(): number {return (this.x ** 2 + this.y ** 2) ** 0.5}

  public scale(scale: Vertex): Vertex {
    let copy = this.copy();
    copy.x = this.x * scale.x;
    copy.y = this.y * scale.y;
    return copy
  }

  public subtract(other: Vertex): Vertex {
    let copy = this.copy();
    copy.x = this.x - other.x;
    copy.y = this.y - other.y;
    return copy
  }

  public transform(matrix: DOMMatrix): Vertex {
    let copy = this.copy();
    copy.x = matrix.a * this.x + matrix.c * this.y + matrix.e;
    copy.y = matrix.b * this.x + matrix.d * this.y + matrix.f;
    return copy
  }

  public transformSelf(matrix: DOMMatrix): void {
    this.x = matrix.a * this.x + matrix.c * this.y + matrix.e;
    this.y = matrix.b * this.x + matrix.d * this.y + matrix.f;
  }
}

export class newShape {
  public path: Path2D = new Path2D();
  public lineWidth: number = 1;
  public strokeStyle: string = 'hsl(0, 0%, 0%)';
  public fillStyle: string = 'hsl(203, 90%, 85%)';
  public hoverStyle: string = 'hsl(203, 90%, 60%)';
  public clickedStyle: string = 'hsl(203, 90%, 35%)';
  public selectedStyle: string = 'hsl(267, 95%, 85%)';
  public isHovered: boolean = false;
  public isClicked: boolean = false;
  public isSelected: boolean = false;
  public printedAttributes: string[];
  protected readonly TOOLTIP_SURFACE: SurfaceStyle = new SurfaceStyle(string_to_hex("lightgrey"), 0.5, null);
  protected readonly TOOLTIP_TEXT_STYLE: TextStyle = new TextStyle(string_to_hex("black"), 14, "Calibri");
  constructor() {};

  get tooltipOrigin() { return new Vertex(0, 0) };

  public draw(context: CanvasRenderingContext2D) {
    const scaledPath = new Path2D();
    const contextMatrix = context.getTransform();
    scaledPath.addPath(this.path, new DOMMatrix().scale(contextMatrix.a, contextMatrix.d));
    context.save();
    context.scale(1 / contextMatrix.a, 1 / contextMatrix.d);
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.strokeStyle;
    context.fillStyle = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.isSelected ? this.selectedStyle : this.fillStyle;
    context.fill(scaledPath);
    context.stroke(scaledPath);
    context.restore();
  }

  public drawTooltip(context: CanvasRenderingContext2D) {
    if (this.isClicked) {
      let tooltip = new Tooltip(this.TOOLTIP_SURFACE, this.TOOLTIP_TEXT_STYLE, this.printedAttributes);
      tooltip.newDraw(this, context);
    }
  }

  public mouseDown(canvasMouse: Vertex, frameMouse: Vertex) {}

  public mouseMove(canvasMouse: Vertex, frameMouse: Vertex) {return false}

  public mouseUp() {}
}

export class newCircle extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public radius: number = 1
  ) {
    super();
  }

  public buildPath(): Path2D {
    const path = this.path;
    path.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
    return path
  }
}

export class newRect extends newShape {
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public size: Vertex = new Vertex(0, 0)
  ) {
    super();
    this.path = this.buildPath();
  }

  public buildPath(): Path2D {
    const path = this.path;
    path.rect(this.origin.x, this.origin.y, this.size.x, this.size.y);
    return path
  }
}

export class newRoundRect extends newRect {
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public size: Vertex = new Vertex(0, 0),
    public radius: number = 2
    ) {
      super();
      this.path = this.buildPath();
    }

  public buildPath(): Path2D {
    const path = this.path;
    const hLength = this.origin.x + this.size.x;
    const vLength = this.origin.y + this.size.y;
    // path.rect(this.origin.x, this.origin.y, this.size.x, this.size.y);


    path.moveTo(this.origin.x + this.radius, this.origin.y);
    path.lineTo(hLength - this.radius, this.origin.y);
    path.quadraticCurveTo(hLength, this.origin.y, hLength, this.origin.y + this.radius);
    path.lineTo(hLength, this.origin.y + this.size.y - this.radius);
    path.quadraticCurveTo(hLength, vLength, hLength - this.radius, vLength);
    path.lineTo(this.origin.x + this.radius, vLength);
    path.quadraticCurveTo(this.origin.x, vLength, this.origin.x, vLength - this.radius);
    path.lineTo(this.origin.x, this.origin.y + this.radius);
    path.quadraticCurveTo(this.origin.x, this.origin.y, this.origin.x + this.radius, this.origin.y);
    return path
  }
}

export class Mark extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1
  ) {
    super();
    this.path = this.buildPath();
  }

  public buildPath(): Path2D {
    const path = this.path;
    const halfSize = this.size / 2;
    path.moveTo(this.center.x - halfSize, this.center.y);
    path.lineTo(this.center.x + halfSize, this.center.y);
    path.moveTo(this.center.x, this.center.y - halfSize);
    path.lineTo(this.center.x, this.center.y + halfSize);
    return path
  }
}

export abstract class AbstractHalfLine extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super();
    this.path = this.buildPath();
  }
  public abstract buildPath(): Path2D;
}

export class UpHalfLine extends AbstractHalfLine {
  public buildPath(): Path2D {
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x, this.center.y);
    path.lineTo(this.center.x, this.center.y + halfSize);
    return path;
  }
}

export class DownHalfLine extends AbstractHalfLine {
  public buildPath(): Path2D {
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x, this.center.y);
    path.lineTo(this.center.x, this.center.y - halfSize);
    return path;
  }
}

export class LeftHalfLine extends AbstractHalfLine {
  public buildPath(): Path2D {
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x, this.center.y);
    path.lineTo(this.center.x - halfSize, this.center.y);
    return path;
  }
}

export class RightHalfLine extends AbstractHalfLine {
  public buildPath(): Path2D {
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x, this.center.y);
    path.lineTo(this.center.x + halfSize, this.center.y);
    return path;
  }
}

export class HalfLine extends AbstractHalfLine {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super(center, size, orientation);
    this.path = this.buildPath();
  }

  public buildPath(): Path2D {
    if (this.orientation == 'up') return new UpHalfLine(this.center, this.size).path;
    if (this.orientation == 'down') return new DownHalfLine(this.center, this.size).path;
    if (this.orientation == 'left') return new LeftHalfLine(this.center, this.size).path;
    if (this.orientation == 'right') return new RightHalfLine(this.center, this.size).path;
    throw new Error(`Orientation ${this.orientation} is unknown.`);
  }
}

export class Cross extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1
  ) {
    super();
    this.path = this.buildPath();
  }

  public buildPath(): Path2D {
    const path = this.path;
    const halfSize = this.size / 2;
    path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    path.lineTo(this.center.x + halfSize, this.center.y + halfSize);
    path.moveTo(this.center.x - halfSize, this.center.y + halfSize);
    path.lineTo(this.center.x + halfSize, this.center.y - halfSize);
    return path
  }
}

export abstract class AbstractTriangle extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
  ) {
    super();
    this.path = this.buildPath();
  }
  public abstract buildPath(): Path2D;
}

export class UpTriangle extends AbstractTriangle {
  public buildPath(): Path2D {
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    path.lineTo(this.center.x + halfSize, this.center.y - halfSize);
    path.lineTo(this.center.x, this.center.y + halfSize);
    path.lineTo(this.center.x - halfSize, this.center.y - halfSize - this.lineWidth);
    return path;
  }
}

export class DownTriangle extends AbstractTriangle {
  public buildPath(): Path2D {
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x + halfSize, this.center.y + halfSize);
    path.lineTo(this.center.x, this.center.y - halfSize);
    path.lineTo(this.center.x - halfSize, this.center.y + halfSize);
    path.lineTo(this.center.x + halfSize + this.lineWidth, this.center.y + halfSize);
    return path;
  }
}

export class LeftTriangle extends AbstractTriangle {
  public buildPath(): Path2D {
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x + halfSize, this.center.y - halfSize);
    path.lineTo(this.center.x - halfSize, this.center.y);
    path.lineTo(this.center.x + halfSize, this.center.y + halfSize);
    path.lineTo(this.center.x + halfSize, this.center.y - halfSize - this.lineWidth);
    return path;
  }
}

export class RightTriangle extends AbstractTriangle {
  public buildPath(): Path2D {
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    path.lineTo(this.center.x + halfSize, this.center.y);
    path.lineTo(this.center.x - halfSize, this.center.y + halfSize);
    path.lineTo(this.center.x - halfSize, this.center.y - halfSize - this.lineWidth);
    return path;
  }
}

export class Triangle extends AbstractTriangle {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super();
    this.path = this.buildPath();
  }

  public buildPath(): Path2D {
    if (this.orientation == 'up') {return new UpTriangle(this.center, this.size).path}
    if (this.orientation == 'down') {return new DownTriangle(this.center, this.size).path}
    if (this.orientation == 'right') {return new RightTriangle(this.center, this.size).path}
    if (this.orientation == 'left') {return new LeftTriangle(this.center, this.size).path}
  }
}

export class newText extends newShape {
  public scale: number = 1;
  public fillStyle: string = 'hsl(0, 0%, 0%)'
  constructor(
    public text: string,
    public origin: Vertex = new Vertex(0, 0),
    public width: number = null,
    public fontsize: number = 12,
    public font: string = 'sans-serif',
    public justify: string = 'left',
    public baseline: string = 'alphabetic',
    protected _style: string = '',
    protected _orientation: number = 0
  ) {
    super();
    this.path = this.buildPath();
  }

  get orientation(): number {return this._orientation};

  set orientation(value: number) {this._orientation = value};

  get style(): string {return this._style};

  set style(value: string) {this._style = value};

  get fullFont() { return `${this.style} ${this.fontsize}px ${this.font}` }

  private automaticFontSize(context: CanvasRenderingContext2D): number {
    let tmp_context: CanvasRenderingContext2D = context
    let pxMaxWidth: number = this.width * this.scale;
    tmp_context.font = '1px ' + this.font;
    return pxMaxWidth / (tmp_context.measureText(this.text).width)
  }

  public buildPath(): Path2D {
    const path = this.path;
    path.rect(this.origin.x, this.origin.y, this.width, this.fontsize);
    return path
  }

  public static capitalize(value: string): string {return value.charAt(0).toUpperCase() + value.slice(1)}

  public capitalizeSelf(): void {this.text = newText.capitalize(this.text)}

  public draw(context: CanvasRenderingContext2D) {
    if (this.width === null && this.fontsize !== null) {
      this.width = context.measureText(this.text).width;
    } else if (this.width !== null && this.fontsize === null) {
      this.fontsize = this.automaticFontSize(context);
    } else if (this.width !== null && this.fontsize !== null) {
      let width = context.measureText(this.text).width;
      if (width > this.width) {this.fontsize = this.automaticFontSize(context)}
    } else {
      throw new Error('Cannot write text with no size');
    }
    context.font = this.fullFont;
    context.textAlign = this.justify as CanvasTextAlign;
    context.textBaseline = this.baseline as CanvasTextBaseline;
    this.path = this.buildPath();
    context.fillStyle = this.fillStyle;
    context.translate(this.origin.x, this.origin.y);
    context.rotate(Math.PI/180 * this.orientation);
    context.fillText(this.text, 0, 0);
    context.rotate(-Math.PI/180 * this.orientation);
    context.translate(-this.origin.x, -this.origin.y);
  }
}

const CIRCLES = ['o', 'circle', 'round'];
const MARKERS = ['+', 'crux', 'mark'];
const CROSSES = ['x', 'cross', 'oblique'];
const SQUARES = ['square'];
const TRIANGLES = ['^', 'triangle', 'tri'];
export class newPoint2D extends Vertex {
  public path: Path2D;
  public isHover: boolean = false;
  public isClicked: boolean = false;
  public isSelected: boolean = false;
  public color: string = string_to_hex('blue');
  protected _lineWidth: number = 2;

  constructor(
    x: number = 0,
    y: number = 0,
    private _size: number = 2,
    private _marker: string = 'circle',
    private _markerOrientation: string = 'up'
    ) {
      super(x, y);
      this.path = this.buildPath();
    };

  get drawnShape() {
    let marker = new newShape();
    if (CIRCLES.indexOf(this.marker) > -1) {marker = new newCircle(this.coordinates, this.size)}
    if (MARKERS.indexOf(this.marker) > -1) {marker = new Mark(this.coordinates, this.size)};
    if (CROSSES.indexOf(this.marker) > -1) {marker = new Cross(this.coordinates, this.size)};
    if (SQUARES.indexOf(this.marker) > -1) {
      const halfSize = this.size * 0.5;
      const origin = new Vertex(this.coordinates.x - halfSize, this.coordinates.y - halfSize)
      marker = new newRect(origin, new Vertex(this.size, this.size))
    };
    if (TRIANGLES.indexOf(this.marker) > -1) {marker = new Triangle(this.coordinates, this.size, this.markerOrientation)};
    if (this.marker == 'halfLine') {marker = new HalfLine(this.coordinates, this.size, this.markerOrientation)};
    marker.lineWidth = this.lineWidth;
    return marker
  }

  get lineWidth(): number {return this._lineWidth};

  set lineWidth(value: number) {this._lineWidth = value};

  get markerOrientation(): string {return this._markerOrientation};

  set markerOrientation(value: string) {this._markerOrientation = value};

  get size(): number {return this._size};

  set size(value: number) {this._size = value};

  get marker(): string {return this._marker};

  set marker(value: string) {this._marker = value};

  private buildPath(): Path2D {return this.drawnShape.path};

  public draw(context: CanvasRenderingContext2D) {
    this.path = this.buildPath();
    context.lineWidth = this.lineWidth;
    context.fillStyle = this.color;
    context.strokeStyle = this.color;
    context.stroke(this.path);
    context.fill(this.path);
  }
}

export class Bar extends newRect {
  public printedAttributes: string[] = ["nValues"];
  public strokeStyle: string = 'hsl(270, 0%, 0%)';
  public fillStyle: string = 'hsl(203, 90%, 85%)';
  public hoverStyle: string = 'hsl(203, 90%, 60%)';
  public clickedStyle: string = 'hsl(203, 90%, 35%)';
  public selectedStyle: string = 'hsl(267, 95%, 85%)';
  constructor(
    public values: any[] = [],
    public origin: Vertex = new Vertex(0, 0),
    public size: Vertex = new Vertex(0, 0)
  ) {
    super(origin, size);
  }

  get tooltipOrigin() { return new Vertex(this.origin.x + this.size.x / 2, this.origin.y + this.size.y) };

  get length(): number { return this.values.length };

  get nValues(): number { return this.length };

  public setGeometry(origin: Vertex, size: Vertex) {
    this.origin = origin;
    this.size = size;
  }

  public draw(context: CanvasRenderingContext2D) {
    if (this.size.x != 0 && this.size.y != 0) { super.draw(context) }
  }
}

export class newAxis {
  public ticksCoords: newPoint2D[];
  public drawPath: Path2D;
  public path: Path2D;
  public lineWidth: number = 2;
  public strokeStyle: string = 'hsl(0, 0%, 0%)';
  public hoverStyle: string = 'hsl(0, 100%, 48%)';
  public clickedStyle: string = 'hsl(126, 67%, 72%)';
  public rubberColor: string = 'hsla(266, 95%, 60%, 0.8)';//'hsla(127, 95%, 60%, 0.85)';
  public labels: string[];
  public isHovered: boolean = false;
  public isClicked: boolean = false;
  public mouseStyleON: boolean = false;
  public rubberBand: RubberBand;

  protected _ticks: number[];
  protected _isDiscrete: boolean;

  private _marginRatio: number = 0.1;
  private _minValue: number;
  private _maxValue: number;
  private _previousMin: number;
  private _previousMax: number;
  private _tickPrecision: number = 4;

  readonly OFFSET_TICKS = new Vertex(10, 20);
  readonly OFFSET_NAME = this.OFFSET_TICKS.subtract(new Vertex(65, 60));
  readonly DRAW_START_OFFSET = 10;
  readonly SIZE_END = 10;
  readonly FONT_SIZE = 12;
  readonly FONT = 'sans-serif';

  // OLD
  public is_drawing_rubberband: boolean = false;

  constructor(
    vector: any[],
    public origin: Vertex,
    public end: Vertex,
    public name: string = '',
    private _nTicks: number = 10) {
      this.isDiscrete = typeof vector[0] == 'string';
      if (this.isDiscrete) {this.labels = newAxis.uniqueValues(vector)};
      const [minValue, maxValue] = this.computeMinMax(vector);
      [this._previousMin, this._previousMax] = [this.minValue, this.maxValue] = this.marginedBounds(minValue, maxValue);
      this.ticks = this.computeTicks();
      if (!this.isDiscrete) {this.labels = this.numericLabels()};
      this.drawPath = this.buildDrawPath();
      this.path = this.buildPath();
      this.rubberBand = new RubberBand(this.name, 0, 0, this.isVertical);
    };

  public get drawLength(): number {
    if (this.isVertical) {return Math.abs(this.origin.y - this.end.y)};
    return Math.abs(this.origin.x - this.end.x);
  }

  get interval(): number {return Math.abs(this.maxValue - this.minValue)};

  get isVertical(): boolean {return this.origin.x == this.end.x};

  get isDiscrete(): boolean {return this._isDiscrete};

  set isDiscrete(value: boolean) {this._isDiscrete = value};

  set marginRatio(value: number) {this._marginRatio = value};

  get marginRatio(): number {return this._marginRatio};

  set maxValue(value: number) {this._maxValue = value};

  get maxValue(): number {return this._maxValue};

  set minValue(value: number) {this._minValue = value};

  get minValue(): number {return this._minValue};

  set nTicks(value: number) {this._nTicks = value};

  get nTicks(): number {
    if (this.isDiscrete) return this.labels.length + 1
    return this._nTicks
  }

  get ticks() {return this._ticks}

  set ticks(value: number[]) {this._ticks = value}

  get tickPrecision(): number {return this._tickPrecision};

  get title(): string {return newText.capitalize(this.name)}

  get transformMatrix(): DOMMatrix {return this.getValueToDrawMatrix()};

  private horizontalPickIdx() {return Math.sign(1 - Math.sign(this.transformMatrix.f))}

  private verticalPickIdx() {return Math.sign(1 - Math.sign(this.transformMatrix.e))}

  public transform(newOrigin: Vertex, newEnd: Vertex) {
    this.origin = newOrigin;
    this.end = newEnd;
    this.drawPath = this.buildDrawPath();
    this.path = this.buildPath();
  }

  public reset(): void {this.rubberBand.reset()}

  private static nearestFive(value: number): number {
    const tenPower = Math.floor(Math.log10(Math.abs(value)));
    const normedValue = Math.floor(value / Math.pow(10, tenPower - 2));
    const fiveMultiple = Math.floor(normedValue / 50);
    return (50 * fiveMultiple) * Math.pow(10, tenPower - 2);
  }

  public static uniqueValues(vector: string[]): string[] {
    return vector.filter((value, index, array) => array.indexOf(value) === index)
  }

  private buildDrawPath(): Path2D {
    const verticalIdx =  Number(this.isVertical) ; const horizontalIdx = Number(!this.isVertical);
    const path = new Path2D();
    const endArrow = new newPoint2D(this.end.x + this.SIZE_END / 2 * horizontalIdx, this.end.y + this.SIZE_END / 2 * verticalIdx, this.SIZE_END, 'triangle', ['right', 'up'][verticalIdx]);
    path.moveTo(this.origin.x - this.DRAW_START_OFFSET * horizontalIdx, this.origin.y - this.DRAW_START_OFFSET * verticalIdx);
    path.lineTo(this.end.x, this.end.y);
    path.addPath(endArrow.path);
    return path
  }

  private buildPath(): Path2D {
    const path = new Path2D();
    const offset = new Vertex(this.DRAW_START_OFFSET * Number(this.isVertical), this.DRAW_START_OFFSET * Number(!this.isVertical));
    const origin = new Vertex(this.origin.x, this.origin.y).subtract(offset.multiply(2));
    const size = this.end.subtract(origin).add(offset);
    path.rect(origin.x, origin.y, size.x, size.y);
    return path
  }

  public absoluteToRelative(value: number): number {
    return this.isVertical ? (value - this.transformMatrix.f) / this.transformMatrix.d : (value - this.transformMatrix.e) / this.transformMatrix.a
  }

  public relativeToAbsolute(value: number): number {
    return this.isVertical ? value * this.transformMatrix.d + this.transformMatrix.f : value * this.transformMatrix.a + this.transformMatrix.e
  }

  public normedValue(value: number): number {
    return value / this.interval
  }

  private computeMinMax(vector: any[]): number[] {
    if (this.isDiscrete) {return [0, this.labels.length]};
    return [Math.min(...vector), Math.max(...vector)]
  }

  private computeTicks(): number[] {
    const increment = newAxis.nearestFive((this.maxValue - this.minValue) / this.nTicks);
    const remainder = this.minValue % increment;
    let ticks = [this.minValue - remainder];
    while (ticks.slice(-1)[0] <= this.maxValue) {ticks.push(ticks.slice(-1)[0] + increment)};
    if (ticks.slice(0)[0] < this.minValue) {ticks.splice(0, 1)};
    if (ticks.slice(-1)[0] > this.maxValue) {ticks.splice(-1, 1)};
    return ticks
  }

  public draw(context: CanvasRenderingContext2D) {
    context.lineWidth = this.lineWidth;
    let color = this.strokeStyle;
    if (this.mouseStyleON) {color = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.strokeStyle};
    context.strokeStyle = color;
    context.fillStyle = color;
    context.stroke(this.drawPath);
    context.fill(this.drawPath);

    const canvasHTMatrix = context.getTransform();
    const pointHTMatrix = canvasHTMatrix.multiply(this.transformMatrix);
    context.setTransform(pointHTMatrix);
    this.ticksCoords = this.drawTicks(context, pointHTMatrix, color);
    context.resetTransform();
    this.drawName(context, canvasHTMatrix);
    context.setTransform(canvasHTMatrix);
    this.drawRubberBand(context);
  }

  private drawName(context: CanvasRenderingContext2D, canvasHTMatrix: DOMMatrix) {
    let baseline = ['hanging', 'alphabetic'][this.horizontalPickIdx()]
    let nameCoords = this.end.add(this.origin).divide(2);
    if (this.isVertical) {
      nameCoords.x += this.OFFSET_NAME.x ;
      baseline = ['alphabetic', 'hanging'][this.verticalPickIdx()];
    }
    else {nameCoords.y += this.OFFSET_NAME.y}
    nameCoords.transformSelf(canvasHTMatrix);
    const orientation = this.isVertical ? -90 : 0;
    const textName = new newText(this.title, nameCoords, this.drawLength, this.FONT_SIZE, this.FONT, 'center', baseline, 'bold', orientation);
    textName.draw(context);
  }

  private drawTicks(context: CanvasRenderingContext2D, pointHTMatrix: DOMMatrix, color: string) {
    const ticksCoords = [];
    let count = Math.max(0, this.ticks[0]);
    this.ticks.forEach((tick, idx) => {
      if (tick >= this.minValue && tick <= this.maxValue) {
        let point = this.drawTickPoint(context, tick, this.isVertical, pointHTMatrix, color);
        ticksCoords.push(point);
        let text = this.labels[idx]
        if (this.isDiscrete) {
          if (count == tick && this.labels[count]) {text = this.labels[count] ; count++}
          else {text = ''}
        }
        this.drawTickText(context, text, point, pointHTMatrix);
      }
    })
    return ticksCoords
  }

  private drawTickPoint(context: CanvasRenderingContext2D, tick: number, vertical: boolean, HTMatrix: DOMMatrix, color: string): newPoint2D {
    const markerOrientation = this.isVertical ? 'right' : 'up';
    const point = new newPoint2D(tick * Number(!vertical), tick * Number(vertical), 10 / Math.abs(HTMatrix.a), 'halfLine', markerOrientation);
    point.color = color;
    point.lineWidth /= Math.abs(HTMatrix.a);
    point.draw(context);
    return point
  }

  private drawTickText(context: CanvasRenderingContext2D, text: string, point: newPoint2D, HTMatrix: DOMMatrix): void {
    const [textOrigin, textAlign, baseline] = this.tickTextPositions(point, HTMatrix);
    let textWidth = null;
    if (textAlign == 'left') textWidth = context.canvas.width - textOrigin.x - 5;
    if (textAlign == 'right') textWidth = textOrigin.x - 5;
    if (textAlign == 'center') textWidth = (this.drawLength) / (this.nTicks * 1.5);
    context.resetTransform()
    const tickText = new newText(newText.capitalize(text), textOrigin, textWidth, this.FONT_SIZE, this.FONT, textAlign, baseline);
    tickText.draw(context)
    context.setTransform(HTMatrix)
  }

  private getValueToDrawMatrix() {
    const scale = this.drawLength / this.interval;
    return new DOMMatrix([
      scale, 0, 0, scale,
      this.origin.x - this.minValue * Number(!this.isVertical) * scale,
      this.origin.y - this.minValue * Number(this.isVertical) * scale]);
  }

  private marginedBounds(minValue: number, maxValue: number): [number, number] {
    if (this.isDiscrete) {return [minValue - 1, maxValue + 1]};
    return [minValue * (1 - Math.sign(minValue) * this.marginRatio),
            maxValue * (1 + Math.sign(maxValue) * this.marginRatio)];
  }

  public drawRubberBand(context: CanvasRenderingContext2D) {
    const realMin = this.relativeToAbsolute(this.rubberBand.minValue);
    const realMax = this.relativeToAbsolute(this.rubberBand.maxValue);
    const coord = this.isVertical ? "y" : "x";
    this.rubberBand.realMin = Math.max(Math.min(realMin, realMax), this.origin[coord]);
    this.rubberBand.realMax = Math.min(Math.max(realMin, realMax), this.end[coord]);
    this.rubberBand.realMin = Math.min(this.rubberBand.realMin, this.rubberBand.realMax);
    this.rubberBand.realMax = Math.max(this.rubberBand.realMin, this.rubberBand.realMax);
    this.rubberBand.draw(this.isVertical ? this.origin.x : this.origin.y, context, this.rubberColor, 'hsl(203, 0%, 100%, 0.5)', 0.1, 1.);
  }

  public mouseMove(mouseDown: Vertex, mouseCoords: Vertex) {
    let downValue = this.absoluteToRelative(this.isVertical ? mouseDown.y : mouseDown.x);
    let currentValue = this.absoluteToRelative(this.isVertical ? mouseCoords.y : mouseCoords.x);
    if (!this.rubberBand.isClicked) {
      this.rubberBand.minValue = Math.min(downValue, currentValue);
      this.rubberBand.maxValue = Math.max(downValue, currentValue);
    } else {this.rubberBand.mouseMove(downValue, currentValue)}
    return true
  }

  public mouseDown(mouseDown: Vertex) {
    let isReset = false;
    this.is_drawing_rubberband = true; // OLD
    const mouseUniCoord = this.isVertical ? mouseDown.y : mouseDown.x;
    if (!this.isInRubberBand(this.absoluteToRelative(mouseUniCoord))) {
      this.rubberBand.reset();
      isReset = true;
    } else {this.rubberBand.mouseDown(mouseUniCoord);}
    return isReset
  }

  public mouseUp() {
    this.rubberBand.mouseUp();
    this.is_drawing_rubberband = false; // OLD
  }

  public isInRubberBand(value: number): boolean {
    return (value >= this.rubberBand.minValue && value <= this.rubberBand.maxValue) ? true : false
  }

  public numericLabels(): string[] {
    this.updateTickPrecision();
    return this.ticks.map(tick => tick.toPrecision(this.tickPrecision))
  }

  public saveLocation(): void {
    this._previousMin = this.minValue;
    this._previousMax = this.maxValue;
  }

  public stringsToValues(vector: any[]): number[] {
    if (this.isDiscrete) return vector.map(value => this.labels.indexOf(value))
    return vector
  }

  private textAlignments(): [string, string] {
    const forVertical = ['right', 'left'][this.verticalPickIdx()];
    const forHorizontal = ['hanging', 'alphabetic'][this.horizontalPickIdx()]
    return this.isVertical ? [forVertical, 'middle'] : ['center', forHorizontal]
  }

  private tickTextPositions(point: newPoint2D, HTMatrix: DOMMatrix): [Vertex, string, string] {
    let origin = new Vertex(point.x, point.y).transform(HTMatrix);
    if (this.isVertical) { // a little strange, should be the same as name but different since points are already in a relative mode
      origin.x -= Math.sign(HTMatrix.a) * this.OFFSET_TICKS.x
    }
    else {
      origin.y -= Math.sign(HTMatrix.d) * this.OFFSET_TICKS.y
    }
    const [textAlign, baseline] = this.textAlignments();
    return [origin, textAlign, baseline]
  }

  public updateScale(viewPoint: Vertex, scaling: Vertex, translation: Vertex): void {
    const HTMatrix = this.transformMatrix;
    let center = (viewPoint.x - HTMatrix.e) / HTMatrix.a;
    let offset = translation.x;
    let scale = scaling.x;
    if (this.isVertical) {center = (viewPoint.y - HTMatrix.f) / HTMatrix.d ; offset = translation.y ; scale = scaling.y};
    this.minValue = (this._previousMin - center) / scale + center + offset / HTMatrix.a;
    this.maxValue = (this._previousMax - center) / scale + center + offset / HTMatrix.a;
    this.updateTicks();
  }

  private updateTickPrecision(): number {
    const minTick = Math.min(...this.ticks);
    const maxTick = Math.max(...this.ticks);
    const ratio = Number(maxTick.toPrecision(this.tickPrecision)) / Number(minTick.toPrecision(this.tickPrecision));
    if (ratio == 1) {this._tickPrecision++};
    if (Number(maxTick.toPrecision(this.tickPrecision - 1)) != Number(minTick.toPrecision(this.tickPrecision - 1)) && this.tickPrecision > 4) {this._tickPrecision--};
    return
  };

  private updateTicks(): void {
    this.ticks = this.computeTicks();
    if (!this.isDiscrete) {this.labels = this.numericLabels()};
  }
}
