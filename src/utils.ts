import { TextStyle, EdgeStyle, SurfaceStyle } from "./style";
import { string_to_rgb, colorHEX, color_to_string, isHex, isRGB, string_to_hex, rgb_to_string, arrayRGBToHSL, RGBToArray, HSLToArray } from "./color_conversion";
import { Shape, MyMath, List } from "./toolbox";
import { EventEmitter } from "events";

export class Axis {
  color_stroke: any;
  x_step: number;
  y_step: number;

  constructor(public nb_points_x: number = 10,
    public nb_points_y: number = 10,
    public graduation_style: TextStyle,
    public axis_style: EdgeStyle,
    public arrow_on: boolean = false,
    public grid_on: boolean = true,
    public type_: string = 'axis',
    public name = '') {
  }

  public static deserialize(serialized) {
    let default_axis_style = { line_width: 0.5, color_stroke: string_to_rgb('grey'), dashline: [], name: '' };
    let default_graduation_style = { text_color: string_to_rgb('grey'), font_size: 12, font_style: 'sans-serif', name: '' };
    let default_dict_ = {
      nb_points_x: 10, nb_points_y: 10, graduation_style: default_graduation_style,
      axis_style: default_axis_style, arrow_on: false, grid_on: true, name: ''
    };
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
    var i = 0;
    context.textAlign = 'center';
    var x_nb_digits = Math.max(0, 1 - Math.floor(Math.log10(x_step)));
    var grad_beg_x = Math.floor(1 / this.x_step * ((axis_x_start - mvx - X) / scaleX)) * this.x_step;
    var grad_end_x = Math.ceil(1 / this.x_step * ((canvas_width - mvx) / scaleX)) * this.x_step;

    while (grad_beg_x + i * x_step < grad_end_x) {
      if (this.grid_on === true) {
        context.strokeStyle = 'lightgrey';
        Shape.drawLine(context, [[scaleX * (grad_beg_x + i * x_step) + mvx + X, axis_y_start], [scaleX * (grad_beg_x + i * x_step) + mvx + X, axis_y_end + 3]]);
      } else {
        Shape.drawLine(context, [[scaleX * (grad_beg_x + i * x_step) + mvx + X, axis_y_end - 3], [scaleX * (grad_beg_x + i * x_step) + mvx + X, axis_y_end + 3]]);
      }
      context.fillText(MyMath.round(grad_beg_x + i * x_step, x_nb_digits), scaleX * (grad_beg_x + i * x_step) + mvx + X, axis_y_end + font_size);
      i++
    }
    context.stroke();
    // return [scaleX*(grad_beg_x) + mvx + X, scaleX*(grad_beg_x + (i-1)*x_step) + mvx + X]
  }

  draw_vertical_graduations(context, mvy, scaleY, axis_x_start, axis_x_end, axis_y_end, y_step, Y) {
    var i = 0;
    var grad_beg_y = Math.ceil(-1 / this.y_step * ((axis_y_end - mvy - Y) / scaleY)) * this.y_step;
    var grad_end_y = Math.floor(mvy / (this.y_step * scaleY)) * this.y_step;
    context.textAlign = 'end';
    context.textBaseline = 'middle';
    var y_nb_digits = Math.max(0, 1 - Math.floor(Math.log10(y_step)));
    while (grad_beg_y + (i - 1) * y_step < grad_end_y) {
      if (this.grid_on === true) {
        context.strokeStyle = 'lightgrey';
        Shape.drawLine(context, [[axis_x_start - 3, -scaleY * (grad_beg_y + i * y_step) + mvy + Y], [axis_x_end, -scaleY * (grad_beg_y + i * y_step) + mvy + Y]]);
      } else {
        Shape.drawLine(context, [[axis_x_start - 3, -scaleY * (grad_beg_y + i * y_step) + mvy + Y], [axis_x_start + 3, -scaleY * (grad_beg_y + i * y_step) + mvy + Y]]);
      }
      context.fillText(MyMath.round(grad_beg_y + i * y_step, y_nb_digits), axis_x_start - 5, -scaleY * (grad_beg_y + i * y_step) + mvy + Y);
      i++;
    }
    context.stroke();
  }

  draw_horizontal_log_graduations(context, mvx, scaleX, minX, maxX, axis_y_start, axis_y_end, font_size, X, canvas_width) {
    context.textAlign = 'center';
    let delta = scaleX;
    let numbers = [1];
    if (delta >= canvas_width / 3 && delta <= canvas_width / 2) {
      numbers = [1, 5];
    } else if (delta > canvas_width / 2 && delta <= 3 / 4 * canvas_width) {
      numbers = [1, 2, 5];
    } else if (delta > 3 / 4 * canvas_width) {
      numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }
    let start_pow = Math.floor(minX);
    let end_pow = Math.ceil(maxX);
    for (let power = start_pow; power <= end_pow; power++) {
      for (let num of numbers) {
        let x_coord = num * Math.pow(10, power);
        if (this.grid_on === true) {
          context.strokeStyle = 'lightgrey';
          Shape.drawLine(context, [[scaleX * Math.log10(x_coord) + mvx + X, axis_y_start], [scaleX * Math.log10(x_coord) + mvx + X, axis_y_end + 3]]);
        } else {
          Shape.drawLine(context, [[scaleX * Math.log10(x_coord) + mvx + X, axis_y_end - 3], [scaleX * Math.log10(x_coord) + mvx + X, axis_y_end + 3]]);
        }
        context.fillText(x_coord, scaleX * Math.log10(x_coord) + mvx + X, axis_y_end + font_size);
      }
    }
    context.stroke();
  }


  draw_vertical_log_graduations(context, mvy, scaleY, minY, maxY, axis_x_start, axis_x_end, axis_y_end, canvas_height, Y) {
    context.textAlign = 'end';
    context.textBaseline = 'middle';

    let delta = scaleY;
    let numbers = [1];
    if (delta >= canvas_height / 3 && delta <= canvas_height / 2) {
      numbers = [1, 5];
    } else if (delta > canvas_height / 2 && delta <= 3 / 4 * canvas_height) {
      numbers = [1, 2, 5];
    } else if (delta > 3 / 4 * canvas_height) {
      numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    let start_pow = Math.floor(-minY);
    let end_pow = Math.ceil(-maxY);

    for (let power = start_pow; power <= end_pow; power++) {
      for (let num of numbers) {
        let y_coord = num * Math.pow(10, power);
        if (this.grid_on === true) {
          context.strokeStyle = 'lightgrey';
          Shape.drawLine(context, [[axis_x_start - 3, -scaleY * Math.log10(y_coord) + mvy + Y], [axis_x_end, -scaleY * Math.log10(y_coord) + mvy + Y]]);
        } else {
          Shape.drawLine(context, [[axis_x_start - 3, -scaleY * Math.log10(y_coord) + mvy + Y], [axis_x_start + 3, -scaleY * Math.log10(y_coord) + mvy + Y]]);
        }
        context.fillText(y_coord, axis_x_start - 5, -scaleY * Math.log10(y_coord) + mvy + Y);
      }
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
      let kx = 1.1 * scaleX / init_scaleX;
      let num = Math.max(maxX - minX, 1);
      this.x_step = x_step || Math.min(num / (kx * (this.nb_points_x - 1)), width / (scaleX * (this.nb_points_x - 1)));
    }
    let font_size = Math.max(15, Math.ceil(0.01 * (height + width)));
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
      let ky = 1.1 * scaleY / init_scaleY;
      let num = Math.max(maxY - minY, 1);
      this.y_step = y_step || Math.min(num / (ky * (this.nb_points_y - 1)), height / (scaleY * (this.nb_points_y - 1)));
    }
    let font_size = Math.max(15, Math.ceil(0.01 * (height + width)));
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

  draw_scatter_axis(context, mvx, mvy, scaleX, scaleY, width, height, init_scaleX, init_scaleY, lists,
    to_display_attributes, scroll_x, scroll_y, decalage_axis_x, decalage_axis_y, X, Y, canvas_width, canvas_height,
    log_scale_x, log_scale_y) {

    this.draw_sc_horizontal_axis(context, mvx, scaleX, width, height, init_scaleX, lists[0], to_display_attributes[0],
      scroll_x, decalage_axis_x, decalage_axis_y, X, Y, canvas_width, log_scale_x);
    this.draw_sc_vertical_axis(context, mvy, scaleY, width, height, init_scaleY, lists[1], to_display_attributes[1],
      scroll_y, decalage_axis_x, decalage_axis_y, X, Y, canvas_height, log_scale_y);
  }

  draw_sc_horizontal_axis(context, mvx, scaleX, width, height, init_scaleX, list, to_display_attribute: Attribute,
    scroll_x, decalage_axis_x, decalage_axis_y, X, Y, canvas_width, log_scale_x = false) {
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
    let font_size = Math.max(15, Math.ceil(0.01 * (height + width)));
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
    decalage_axis_x, decalage_axis_y, X, Y, canvas_height, log_scale_y = false) {
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
    let font_size = Math.max(15, Math.ceil(0.01 * (height + width)));
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
        this.x_step = canvas_width / (scaleX * (this.nb_points_x - 1));
      }
      var i = 0;
      var x_nb_digits = Math.max(0, 1 - Math.floor(Math.log10(this.x_step)));
      var grad_beg_x = Math.ceil(1 / this.x_step * (axis_x_start - mvx - X) / scaleX) * this.x_step;
      var grad_end_x = Math.ceil(1 / this.x_step * ((canvas_width - mvx) / scaleX)) * this.x_step;
      while (grad_beg_x + i * this.x_step < grad_end_x) {
        if (this.grid_on === true) {
          Shape.drawLine(context, [[scaleX * (grad_beg_x + i * this.x_step) + mvx + X, axis_y_start], [scaleX * (grad_beg_x + i * this.x_step) + mvx + X, axis_y_end + 3]]);
        } else {
          Shape.drawLine(context, [[scaleX * (grad_beg_x + i * this.x_step) + mvx + X, axis_y_end - 3], [scaleX * (grad_beg_x + i * this.x_step) + mvx + X, axis_y_end + 3]]);
        }
        context.fillText(MyMath.round(grad_beg_x + i * this.x_step, x_nb_digits), scaleX * (grad_beg_x + i * this.x_step) + mvx + X, axis_y_end + this.graduation_style.font_size); i++;
      }
    } else {
      for (let i = 0; i < list.length; i++) {
        if ((scaleX * i + mvx + X > axis_x_start) && (scaleX * i + mvx + X < axis_x_end)) {
          if (this.grid_on === true) {
            Shape.drawLine(context, [[scaleX * i + mvx + X, axis_y_start], [scaleX * i + mvx + X, axis_y_end + 3]]);
          } else {
            Shape.drawLine(context, [[scaleX * i + mvx + X, axis_y_end - 3], [scaleX * i + mvx + X, axis_y_end + 3]]);
          }
          context.fillText(list[i], scaleX * i + mvx + X, axis_y_end + this.graduation_style.font_size);
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
        this.y_step = canvas_height / (scaleY * (this.nb_points_y - 1));
      }
      var i = 0;
      var grad_beg_y = Math.ceil(-1 / this.y_step * ((axis_y_end - mvy - Y) / scaleY)) * this.y_step;
      var grad_end_y = Math.floor(mvy / (this.y_step * scaleY)) * this.y_step;
      var y_nb_digits = Math.max(0, 1 - Math.floor(Math.log10(this.y_step)));
      while (grad_beg_y + (i - 1) * this.y_step < grad_end_y) {
        if (this.grid_on === true) {
          Shape.drawLine(context, [[axis_x_start - 3, -scaleY * (grad_beg_y + i * this.y_step) + mvy + Y], [axis_x_end, -scaleY * (grad_beg_y + i * this.y_step) + mvy + Y]]);
        } else {
          Shape.drawLine(context, [[axis_x_start - 3, -scaleY * (grad_beg_y + i * this.y_step) + mvy + Y], [axis_x_start + 3, -scaleY * (grad_beg_y + i * this.y_step) + mvy + Y]]);
        }
        context.fillText(MyMath.round(grad_beg_y + i * this.y_step, y_nb_digits), axis_x_start - 5, -scaleY * (grad_beg_y + i * this.y_step) + mvy + Y);
        i++;
      }
    } else {
      for (let i = 0; i < list.length; i++) {
        if ((-scaleY * i + mvy + Y > axis_y_start + 5) && (-scaleY * i + mvy + Y < axis_y_end)) {
          if (this.grid_on === true) {
            Shape.drawLine(context, [[axis_x_start - 3, -scaleY * i + mvy + Y], [axis_x_end, -scaleY * i + mvy + Y]]);
          } else {
            Shape.drawLine(context, [[axis_x_start - 3, -scaleY * i + mvy + Y], [axis_x_start + 3, -scaleY * i + mvy + Y]]);
          }
          context.fillText(list[i], axis_x_start - 5, -scaleY * i + mvy + Y);
        }
      }
    }
  }
}


export class PointFamily {
  constructor(public color: string,
    public pointIndices: number[],
    public name: string) { }

  public static deserialize(serialized) {
    return new PointFamily(colorHEX(serialized['color']),
      serialized['point_index'],
      serialized['name']);
  }
}


/**
 * A class for sorting lists.
 */
export class Sort {
  nbPermutations: number = 0;
  permutations: number[] = [];
  constructor() { };

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

  sortObjsByAttribute(list: any[], attribute_name: string): any[] {
    if (!List.is_include(attribute_name, Object.getOwnPropertyNames(list[0]))) {
      throw new Error('sortObjsByAttribute : ' + attribute_name + ' is not a property of the object')
    }
    var attribute_type = TypeOf(list[0][attribute_name]);
    var list_copy = Array.from(list);

    this.permutations = [];
    for (let i = 0; i < list.length; i++) this.permutations.push(i);

    if (attribute_type == 'float') {
      for (let i = 0; i < list_copy.length - 1; i++) {
        let min = i;
        let min_value = list_copy[i][attribute_name];
        for (let j = i + 1; j < list_copy.length; j++) {
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
      for (let i = 0; i < list_copy.length; i++) {
        if (!List.is_include(list_copy[i][attribute_name], strings)) {
          strings.push(list_copy[i][attribute_name]);
        }
      }
      let sorted_list = [];
      for (let i = 0; i < strings.length; i++) {
        for (let j = 0; j < list_copy.length; j++) {
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
  constructor(public surface_style: SurfaceStyle,
    public text_style: TextStyle,
    public attribute_names?: string[],
    public message?: Text,
    public tooltip_radius: number = 10,
    public type_: string = 'tooltip',
    public name: string = '') {
  }

  public static deserialize(serialized) {
    let default_surface_style = { color_fill: string_to_rgb('black'), opacity: 0.9, hatching: undefined };
    let default_text_style = {
      text_color: string_to_rgb('lightgrey'), font_size: 12, font_style: 'Calibri',
      text_align_x: 'start', text_align_y: 'alphabetic', name: ''
    };
    let default_dict_ = { surface_style: default_surface_style, text_style: default_text_style, tooltip_radius: 7 };
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
    var x = scaleX * cx + mvx;
    var y = scaleY * cy + mvy;
    var length = 100 * size;
    return (x + length >= 0) && (x - length <= canvasWidth) && (y + length >= 0) && (y - length <= canvasHeight);
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
    for (let i = 0; i < this.attribute_names.length; i++) {
      let attribute_name = this.attribute_names[i];
      let attribute_type = TypeOf(elt[attribute_name]);
      if (attribute_type == 'float') {
        var text = attribute_name + ' : ' + MyMath.round(elt[attribute_name], Math.max(x_nb_digits, y_nb_digits, 2)); //x_nb_digit évidemment pas définie lorsque l'axe des x est un string...
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
    for (let i = 0; i < this.attribute_names.length; i++) {
      let attribute_name = this.attribute_names[i];
      let attribute_type = TypeOf(elements[0][attribute_name]);
      if (attribute_type == 'float') {
        if (attribute_name === axes[0]) {
          var text = attribute_name + ' : ' + MyMath.round(point.cx, Math.max(x_nb_digits, y_nb_digits, 2)); //x_nb_digits évidemment pas définie lorsque l'axe des x est un string...
        } else if (attribute_name === axes[1]) {
          var text = attribute_name + ' : ' + MyMath.round(-point.cy, Math.max(x_nb_digits, y_nb_digits, 2));
        } else {
          let index = point.points_inside[0].getPointIndex(initial_point_list);
          let elt = elements[index];
          var text = attribute_name + ' : ' + MyMath.round(elt[attribute_name], Math.max(x_nb_digits, y_nb_digits, 2));
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
      var tp_height = textfills.length * this.text_style.font_size * 1.25;
      var cx = point.cx, cy = point.cy;
      if (log_scale_x) cx = Math.log10(cx);
      if (log_scale_y) cy = -Math.log10(-cy);
      var point_size = point.point_style.size;
      var decalage = 2.5 * point_size + 15;
      var tp_x = scaleX * cx + mvx + decalage + X;
      var tp_y = scaleY * cy + mvy - 1 / 2 * tp_height + Y;
      var tp_width = text_max_length * 1.3;

      // Bec
      var point1 = [tp_x - decalage / 2, scaleY * cy + mvy + Y];
      var point2 = [tp_x, scaleY * cy + mvy + Y + 5];
      var point3 = [tp_x, scaleY * cy + mvy + Y - 5];

      if (tp_x + tp_width > canvas_width + X) {
        tp_x = scaleX * cx + mvx - decalage - tp_width + X;
        point1 = [tp_x + tp_width, scaleY * cy + mvy + Y + 5];
        point2 = [tp_x + tp_width, scaleY * cy + mvy + Y - 5];
        point3 = [tp_x + tp_width + decalage / 2, scaleY * cy + mvy + Y];
      }
      if (tp_y < Y) {
        tp_y = scaleY * cy + mvy + Y - 7 * point_size;
      }
      if (tp_y + tp_height > canvas_height + Y) {
        tp_y = scaleY * cy + mvy - tp_height + Y + 7 * point_size;
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

      var current_y = tp_y + 0.75 * this.text_style.font_size;
      for (var i = 0; i < textfills.length; i++) {
        if (i == 0) {
          context.font = 'bold ' + this.text_style.font;
          context.fillText(textfills[0], tp_x + tp_width / 2, current_y);
          context.font = this.text_style.font;
          current_y += this.text_style.font_size * 1.1;
        } else {
          context.fillText(textfills[i], tp_x + tp_width / 2, current_y);
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

    for (var i = 0; i < tooltip_list.length; i++) {
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
    var tp_height = this.text_style.font_size * 1.25;
    var tp_x = x + 5
    var tp_y = y - 1 / 2 * tp_height;
    var text_length = context.measureText(this.message).width;
    var tp_width = text_length * 1.3;

    // Bec
    // var point1 = [tp_x + 5, y];
    // var point2 = [tp_x, y + 15];
    // var point3 = [tp_x, y - 15];

    if (tp_x + tp_width > canvas_width + X) {
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
    context.fillText(this.message, tp_x + tp_width / 2, tp_y + tp_height / 2);
  }
}


export class Attribute {
  list: any[];
  alias: string;
  constructor(public name: string,
    public type_: string) { }

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
  constructor(public height: number, public width: number, public name?: string) {
  }

  public static deserialize(serialized) {
    return new Window(serialized['height'],
      serialized['width'],
      serialized['name']);
  }
}


export function check_package_version(package_version: string, requirement: string) {
  var version_array = package_version.split('.');
  var requirement_array = requirement.split('.');
  var package_version_num = Number(version_array[0]) * Math.pow(10, 4) + Number(version_array[1]) * Math.pow(10, 2) +
    Number(version_array[2]);
  var requirement_num = Number(requirement_array[0]) * Math.pow(10, 4) + Number(requirement_array[1]) * Math.pow(10, 2) +
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
  return a !== a && b !== b;
}


var nextCol = 1;
export function genColor() {
  var ret = [];
  // via http://stackoverflow.com/a/15804183
  if (nextCol < 16777215) {
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
  for (i = 2; i < (_pts.length - 4); i += 2) {
    for (t = 0; t <= numOfSegments; t++) {

      // calc tension vectors
      t1x = (_pts[i + 2] - _pts[i - 2]) * tension;
      t2x = (_pts[i + 4] - _pts[i]) * tension;

      t1y = (_pts[i + 3] - _pts[i - 1]) * tension;
      t2y = (_pts[i + 5] - _pts[i + 1]) * tension;

      // calc step
      st = t / numOfSegments;

      // calc cardinals
      c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
      c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
      c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
      c4 = Math.pow(st, 3) - Math.pow(st, 2);

      // calc x and y cords with common control vectors
      x = c1 * _pts[i] + c2 * _pts[i + 2] + c3 * t1x + c4 * t2x;
      y = c1 * _pts[i + 1] + c2 * _pts[i + 3] + c3 * t1y + c4 * t2y;

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
  for (let i = 0; i < properties_names.length; i++) {
    let property = properties_names[i];
    if (!dict_.hasOwnProperty(property) || dict_[property] === null) {
      entries.push([property, default_dict_[property]]);
    }
  }
  return Object.fromEntries(entries);
}


export function TypeOf(element: any): string {
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
  for (var i = 2; i < pts.length - 1; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
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

export function export_to_csv(rows, filename = "my_data.csv") {
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

const BORDER_SIZE = 20;
const SMALL_RUBBERBAND_SIZE = 10;

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
  readonly MIN_LENGTH = 5;
  readonly BORDER = 5;
  constructor(
    public attributeName: string,
    private _minValue: number,
    private _maxValue: number,
    public isVertical: boolean) { }

  public get canvasLength() { return Math.abs(this.realMax - this.realMin) }

  public get length() { return Math.abs(this.maxValue - this.minValue) }

  public get normedLength() { return Math.abs(this.axisMax - this.axisMin) }

  public set minValue(value: number) { this._minValue = value }

  public get minValue() { return this._minValue }

  public set maxValue(value: number) { this._maxValue = value }

  public get maxValue() { return this._maxValue }

  public selfSend(rubberBands: Map<string, RubberBand>) { rubberBands.set(this.attributeName, new RubberBand(this.attributeName, 0, 0, this.isVertical)) }

  public selfSendRange(rubberBands: Map<string, RubberBand>) {
    rubberBands.get(this.attributeName).minValue = this.minValue;
    rubberBands.get(this.attributeName).maxValue = this.maxValue;
  }

  public draw(origin: number, context: CanvasRenderingContext2D, colorFill: string, colorStroke: string, lineWidth: number, alpha: number) {
    if (this.isVertical) {
      Shape.rect(origin - SMALL_RUBBERBAND_SIZE / 2, this.realMin, SMALL_RUBBERBAND_SIZE, this.canvasLength, context, colorFill, colorStroke, lineWidth, alpha);
    } else {
      Shape.rect(this.realMin, origin - SMALL_RUBBERBAND_SIZE / 2, this.canvasLength, SMALL_RUBBERBAND_SIZE, context, colorFill, colorStroke, lineWidth, alpha);
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
      if ((this.isVertical && !inverted) || (!this.isVertical && inverted)) { return (1 - axisValue) * real_max + axisValue * real_min }
      return axisValue * real_max + (1 - axisValue) * real_min

    }
    let nb_values = axis.list.length;
    if ((this.isVertical && !inverted) || (!this.isVertical && inverted)) { return (1 - axisValue) * (nb_values - 1) }
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
    if (diffSenseSameDir || sameSenseDiffDir) { this.normedInvert() };
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
    if (wasVertical) { index = 1; this.invert(bounds); }
    else { newIndex = 1 }

    const start = Math.min(origin[index], end[index]);
    const newStart = Math.min(newOrigin[newIndex], newEnd[newIndex]);
    this.switchOrientation(start, newStart, [lengths[index], newLengths[newIndex]]);

    if (!wasVertical) { this.invert(newBounds) }
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

  public flipValues(): void {
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

  private get borderSize() {return Math.min(BORDER_SIZE, this.canvasLength / 3)}

  public mouseDown(mouseAxis: number) {
    this.isClicked = true;
    if (Math.abs(mouseAxis - this.realMin) <= this.borderSize) { this.minUpdate = true }
    else if (Math.abs(mouseAxis - this.realMax) <= this.borderSize) { this.maxUpdate = true }
    else { this.lastValues = new Vertex(this.minValue, this.maxValue) }
  }

  public mouseMove(downValue: number, currentValue: number) {
    if (this.isClicked) {
      if (this.minUpdate) { this.minValue = currentValue }
      else if (this.maxUpdate) { this.maxValue = currentValue }
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

  get coordinates(): Vertex { return new Vertex(this.x, this.y) }

  public copy(): Vertex { return Object.create(this) }

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

  public distance(other: Vertex): number { return Math.sqrt((this.x - other.x)**2 + (this.y - other.y)**2) }

  public multiply(value: number): Vertex {
    let copy = this.copy();
    copy.x = this.x * value;
    copy.y = this.y * value;
    return copy
  }

  public get normL1(): number { return Math.abs(this.x) + Math.abs(this.y) }

  public get norm(): number { return (this.x ** 2 + this.y ** 2) ** 0.5 }

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

const TOOLTIP_PRECISION = 100;
export class newShape {
  public path: Path2D = new Path2D();

  public lineWidth: number = 1;
  public dashLine: number[] = [];
  public strokeStyle: string = 'hsl(0, 0%, 0%)';
  public fillStyle: string = 'hsl(203, 90%, 85%)';
  public hoverStyle: string = 'hsl(203, 90%, 60%)';
  public clickedStyle: string = 'hsl(203, 90%, 35%)';
  public selectedStyle: string = 'hsl(140, 65%, 60%)';
  public alpha: number = 1;

  public isHovered: boolean = false;
  public isClicked: boolean = false;
  public isSelected: boolean = false;
  public isScaled: boolean = true;
  public inFrame: boolean = true;

  public tooltipOrigin: Vertex;
  protected _tooltipMap = new Map<string, any>();

  protected readonly TOOLTIP_SURFACE: SurfaceStyle = new SurfaceStyle(string_to_hex("lightgrey"), 0.5, null);
  protected readonly TOOLTIP_TEXT_STYLE: TextStyle = new TextStyle(string_to_hex("black"), 14, "Calibri");
  constructor() {};

  get tooltipMap(): Map<string, any> { return this._tooltipMap };

  set tooltipMap(value: Map<string, any> ) { this._tooltipMap = value };

  public newTooltipMap(): void { this._tooltipMap = new Map<string, any>() };

  public draw(context: CanvasRenderingContext2D): void {
    context.save();
    const scaledPath = new Path2D();
    if (this.isScaled) {
      const contextMatrix = context.getTransform();
      scaledPath.addPath(this.path, new DOMMatrix().scale(contextMatrix.a, contextMatrix.d));
      context.scale(1 / contextMatrix.a, 1 / contextMatrix.d);
    } else scaledPath.addPath(this.path);
    this.setDrawingProperties(context);
    context.fill(scaledPath);
    context.stroke(scaledPath);
    context.restore();
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.strokeStyle;
    context.setLineDash(this.dashLine);
    context.globalAlpha = this.alpha;
    context.fillStyle = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.isSelected ? this.selectedStyle : this.fillStyle;
  }

  public initTooltip(context: CanvasRenderingContext2D): newTooltip { return new newTooltip(this.tooltipOrigin, this.tooltipMap, context) }

  public drawTooltip(plotOrigin: Vertex, plotSize: Vertex, context: CanvasRenderingContext2D): void {
    if (this.isClicked && this.tooltipMap.size != 0) {
      const tooltip = this.initTooltip(context);
      tooltip.draw(plotOrigin, plotSize, context);
    }
  }

  public buildPath(): Path2D { return new Path2D() }

  public mouseDown(mouseDown: Vertex) { }

  public mouseMove(mouseDown: Vertex, mouseCoords: Vertex): boolean { return false }

  public mouseUp() { }
}

export class newCircle extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public radius: number = 1
  ) {
    super();
    this.path = this.buildPath();
  }

  public buildPath(): Path2D {
    const path = new Path2D();
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
    this.buildPath();
  }

  get area(): number { return this.size.x * this.size.y }

  public buildPath(): Path2D {
    const path = new Path2D();
    path.rect(this.origin.x, this.origin.y, this.size.x, this.size.y);
    this.path = path;
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
    const path = new Path2D();
    const hLength = this.origin.x + this.size.x;
    const vLength = this.origin.y + this.size.y;
    path.moveTo(this.origin.x + this.radius, this.origin.y);
    path.lineTo(hLength - this.radius, this.origin.y);

    path.quadraticCurveTo(hLength, this.origin.y, hLength, this.origin.y + this.radius);

    path.lineTo(hLength, this.origin.y + this.size.y - this.radius);
    path.quadraticCurveTo(hLength, vLength, hLength - this.radius, vLength);
    path.lineTo(this.origin.x + this.radius, vLength);
    path.quadraticCurveTo(this.origin.x, vLength, this.origin.x, vLength - this.radius);
    path.lineTo(this.origin.x, this.origin.y + this.radius);
    path.quadraticCurveTo(this.origin.x, this.origin.y, this.origin.x + this.radius, this.origin.y);
    this.path = path;
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
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x - halfSize, this.center.y);
    path.lineTo(this.center.x + halfSize, this.center.y);
    path.moveTo(this.center.x, this.center.y - halfSize);
    path.lineTo(this.center.x, this.center.y + halfSize);
    this.path = path;
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
    this.path = path;
    return path;
  }
}

export class DownHalfLine extends AbstractHalfLine {
  public buildPath(): Path2D {
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x, this.center.y);
    path.lineTo(this.center.x, this.center.y - halfSize);
    this.path = path;
    return path;
  }
}

export class LeftHalfLine extends AbstractHalfLine {
  public buildPath(): Path2D {
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x, this.center.y);
    path.lineTo(this.center.x - halfSize, this.center.y);
    this.path = path;
    return path;
  }
}

export class RightHalfLine extends AbstractHalfLine {
  public buildPath(): Path2D {
    const path = new Path2D();
    const halfSize = this.size / 2;
    path.moveTo(this.center.x, this.center.y);
    path.lineTo(this.center.x + halfSize, this.center.y);
    this.path = path;
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
    const path = new Path2D();
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
    if (this.orientation == 'up') { return new UpTriangle(this.center, this.size).path }
    if (this.orientation == 'down') { return new DownTriangle(this.center, this.size).path }
    if (this.orientation == 'right') { return new RightTriangle(this.center, this.size).path }
    if (this.orientation == 'left') { return new LeftTriangle(this.center, this.size).path }
  }
}

export interface textParams {
  width?: number, height?: number, fontsize?: number, multiLine?: boolean, font?: string, align?: string,
  baseline?: string, style?: string, orientation?: number, backgroundColor?: string, color?: string
}

const DEFAULT_FONTSIZE = 12;
export class newText extends newShape {
  public scale: number = 1;
  public fillStyle: string = 'hsl(0, 0%, 0%)'
  public width: number;
  public height: number;
  public fontsize: number;
  public font: string;
  public align: string;
  public baseline: string;
  public style: string;
  public orientation: number;
  public multiLine: boolean;
  public nRows: number;
  public backgroundColor: string;
  constructor(
    public text: string,
    public origin: Vertex,
    { width = null,
      height = null,
      fontsize = null,
      multiLine = false,
      font = 'sans-serif',
      align = 'left',
      baseline = 'alphabetic',
      style = '',
      orientation = 0,
      color = "hsl(0, 0%, 0%)",
      backgroundColor = "hsla(0, 0%, 100%, 0)"
    }: textParams = {}) {
      super();
      this.width = width;
      this.height = height;
      this.fontsize = fontsize;
      this.multiLine = multiLine;
      this.font = font;
      this.align = align;
      this.baseline = baseline;
      this.style = style;
      this.orientation = orientation;
      this.backgroundColor = backgroundColor;
      this.fillStyle = color;
    }

  private static buildFont(style: string, fontsize: number, font: string): string {
    return `${style} ${fontsize}px ${font}`
  }

  get fullFont(): string { return newText.buildFont(this.style, this.fontsize, this.font) }

  private automaticFontSize(context: CanvasRenderingContext2D): number {
    let tmp_context: CanvasRenderingContext2D = context;
    let pxMaxWidth: number = this.width * this.scale;
    tmp_context.font = '1px ' + this.font;
    return Math.min(pxMaxWidth / (tmp_context.measureText(this.text).width), DEFAULT_FONTSIZE)
  }

  private setRectOffsetX(): number {
    if (this.align == "center") return -this.width / 2;
    if (["right", "end"].includes(this.align)) return -this.width;
    return 0;
  }

  private setRectOffsetY(): number {
    if (this.baseline == "middle") return -this.height / 2;
    if (["top", "hanging"].includes(this.baseline)) return -this.height + this.fontsize * 0.8;
    return 0;
  }

  private computeRectHeight(): number {
    if (["alphabetic", "bottom"].includes(this.baseline)) return -this.height;
    return this.height;
  }

  public buildPath(): Path2D {
    const path = this.path;
    let origin = this.origin.copy();
    origin.x += this.setRectOffsetX();
    origin.y += this.setRectOffsetY();
    let height = this.computeRectHeight();

    const rectPath = new Path2D();
    rectPath.rect(-this.width / 2, 0, this.width, height); // TODO: find the good formula for hanging and alphabetic (not trivial)

    const ANGLE_RAD = this.orientation * Math.PI / 180;
    const COS = Math.cos(ANGLE_RAD);
    const SIN = Math.sin(ANGLE_RAD);
    path.addPath(rectPath, new DOMMatrix([COS, SIN, -SIN, COS, origin.x + this.width / 2, origin.y]));
    return path
  }

  public static capitalize(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1) }

  public capitalizeSelf(): void { this.text = newText.capitalize(this.text) }

  public draw(context: CanvasRenderingContext2D): void {
    context.save();
    const writtenText = this.format(context);
    context.font = this.fullFont;
    context.textAlign = this.align as CanvasTextAlign;
    context.textBaseline = this.baseline as CanvasTextBaseline;
    this.path = this.buildPath();

    context.fillStyle = this.backgroundColor;
    context.fill(this.path);

    context.fillStyle = this.fillStyle;
    context.globalAlpha = this.alpha;
    context.translate(this.origin.x, this.origin.y);
    context.rotate(Math.PI / 180 * this.orientation);
    this.write(writtenText, context);
    context.restore();
  }

  public format(context: CanvasRenderingContext2D): string[] {
    let fontsize = this.fontsize? this.fontsize : DEFAULT_FONTSIZE;
    let writtenText = [this.text];
    context.font = newText.buildFont(this.style, fontsize, this.font);
    if (this.width) {
      if (this.multiLine) { writtenText = this.cutting_text(context, this.width) }
      else {
        if (!this.fontsize) {
          fontsize = this.automaticFontSize(context);
          context.font = newText.buildFont(this.style, fontsize, this.font);
        } else {
          if (context.measureText(this.text).width > this.width) { fontsize = this.automaticFontSize(context) }
        }
      }
    }
    this.fontsize = fontsize;
    this.width = context.measureText(writtenText[0]).width;
    const tempHeight = this.fontsize * writtenText.length;
    if (!this.height) { this.height = tempHeight };
    if (tempHeight > this.height) { this.fontsize = this.height / tempHeight * this.fontsize };
    this.nRows = writtenText.length;
    this.height = this.fontsize * writtenText.length;
    return writtenText
  }

  private write(writtenText: string[], context: CanvasRenderingContext2D): void {
    context.fillStyle = this.fillStyle
    if (writtenText.length != 1) {
      var offset: number = writtenText.length - 1;
      writtenText.forEach((row, index) => { context.fillText(row, 0, (index - offset) * this.fontsize) });
    } else {
      context.fillText(writtenText[0], 0, 0);
    }
  }

  public removeEndZeros(): void {
    let splitText = this.text.split(".");
    if (splitText.length > 1) {
      let splitDecimal = splitText[1].split("e");
      let decimal = splitDecimal[0];
      if (decimal) {
        while (decimal[decimal.length - 1] == "0") { decimal = decimal.slice(0, -1) };
        if (decimal.length != 0) { this.text = `${splitText[0]}.${decimal}` }
        else { this.text = splitText[0] };
        if (splitDecimal.length > 1) { this.text = `${this.text}e${splitDecimal[1]}` };
      }
    }
  }

  private cutting_text(context: CanvasRenderingContext2D, maxWidth: number): string[] {
    var words = this.text.split(' ');
    var space_length = context.measureText(' ').width;
    var cut_texts = [];
    var i = 0;
    var line_length = 0;
    var line_text = '';
    while (i < words.length) {
      let word = words[i];
      let word_length = context.measureText(word).width;
      if (word_length >= maxWidth) {
        if (line_text !== '') cut_texts.push(line_text);
        line_length = 0;
        line_text = '';
        cut_texts.push(word);
        i++;
      } else {
        if (line_length + word_length <= maxWidth) {
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

const CIRCLES = ['o', 'circle', 'round'];
const MARKERS = ['+', 'crux', 'mark'];
const CROSSES = ['x', 'cross', 'oblique'];
const SQUARES = ['square'];
const TRIANGLES = ['^', 'triangle', 'tri'];
const STROKE_STYLE_OFFSET = 15;
export class newPoint2D extends newShape {
  public path: Path2D;
  public center: Vertex;

  constructor(
    x: number = 0,
    y: number = 0,
    protected _size: number = 2,
    protected _marker: string = 'circle',
    protected _markerOrientation: string = 'up',
    fillStyle?: string,
    strokeStyle?: string
  ) {
    super();
    this.center = new Vertex(x, y);
    this.path = this.buildPath();
    this.fillStyle = fillStyle ? fillStyle : this.fillStyle;
    this.strokeStyle = strokeStyle ? strokeStyle : this.setStrokeStyle(this.fillStyle);
    this.lineWidth = 1;
  };

  public update() { this.path = this.buildPath() }

  public getFillStyleHSL(fillStyle: string): [number, number, number] {
    if (fillStyle.includes("rgb")) return arrayRGBToHSL(...RGBToArray(fillStyle));
    return HSLToArray(fillStyle)
  }

  public getFillStyleRGB(fillStyle: string): [number, number, number] {
    let [r, g, b] = fillStyle.split(',');
    return [Number(r.split('rgb(')[1]), Number(g), Number(b.split(")")[0])]
  }

  public setStrokeStyle(fillStyle: string): string {
    const [h, s, l] = this.getFillStyleHSL(fillStyle);
    const lValue = l <= STROKE_STYLE_OFFSET ? l + STROKE_STYLE_OFFSET : l - STROKE_STYLE_OFFSET;
    return `hsl(${h}, ${s}%, ${lValue}%)`;
  }

  public setColors(fillStyle?: string, strokeStyle?: string) {
    this.fillStyle = fillStyle ? fillStyle : this.fillStyle;
    this.strokeStyle = strokeStyle;
  }

  get drawnShape(): newShape {
    let marker = new newShape();
    if (CIRCLES.indexOf(this.marker) > -1) { marker = new newCircle(this.center.coordinates, this.size / 2) }
    if (MARKERS.indexOf(this.marker) > -1) { marker = new Mark(this.center.coordinates, this.size) };
    if (CROSSES.indexOf(this.marker) > -1) { marker = new Cross(this.center.coordinates, this.size) };
    if (SQUARES.indexOf(this.marker) > -1) {
      const halfSize = this.size * 0.5;
      const origin = new Vertex(this.center.coordinates.x - halfSize, this.center.coordinates.y - halfSize)
      marker = new newRect(origin, new Vertex(this.size, this.size))
    };
    if (TRIANGLES.indexOf(this.marker) > -1) { marker = new Triangle(this.center.coordinates, this.size, this.markerOrientation) };
    if (this.marker == 'halfLine') { marker = new HalfLine(this.center.coordinates, this.size, this.markerOrientation) };
    marker.lineWidth = this.lineWidth;
    return marker
  }

  public draw(context: CanvasRenderingContext2D): void {
    this.tooltipOrigin = this.center.copy();
    super.draw(context);
  }

  public initTooltip(context: CanvasRenderingContext2D): newTooltip {
    const tooltip = super.initTooltip(context);
    tooltip.isFlipper = true;
    return tooltip
  }

  get markerOrientation(): string { return this._markerOrientation };

  set markerOrientation(value: string) { this._markerOrientation = value };

  get size(): number { return this._size };

  set size(value: number) { this._size = value };

  get marker(): string { return this._marker };

  set marker(value: string) { this._marker = value };

  public buildPath(): Path2D { return this.drawnShape.path };

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    context.lineWidth = this.lineWidth;
    context.globalAlpha = this.alpha;
    const fillColor = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.isSelected ? this.selectedStyle : this.fillStyle;
    context.fillStyle = fillColor;
    context.strokeStyle = this.strokeStyle ? this.strokeStyle : this.setStrokeStyle(fillColor);
  }

  public isInFrame(origin: Vertex, end: Vertex, scale: Vertex): boolean {
    const inCanvasX = this.center.x * scale.x < end.x && this.center.x * scale.x > origin.x;
    const inCanvasY = this.center.y * scale.y < end.y && this.center.y * scale.y > origin.y;
    this.inFrame = inCanvasX && inCanvasY;
    return this.inFrame
  }
}

export class ScatterPoint extends newPoint2D {
  public mean = new Vertex();
  constructor(
    public values: number[],
    x: number = 0,
    y: number = 0,
    protected _size: number = 3,
    protected _marker: string = 'circle',
    protected _markerOrientation: string = 'up',
    fillStyle?: string,
    strokeStyle?: string
  ) {
    super(x, y, _size, _marker, _markerOrientation, fillStyle, strokeStyle);
    this.isScaled = false;
  };

  public updateTooltipMap() {
    this._tooltipMap = new Map<string, any>([["Number", this.values.length], ["X mean", this.mean.x], ["Y mean", this.mean.y],])
  }
}

export class Bar extends newRect {
  public min: number;
  public max: number;
  public mean: number;
  constructor(
    public values: any[] = [],
    public origin: Vertex = new Vertex(0, 0),
    public size: Vertex = new Vertex(0, 0)
  ) {
    super(origin, size);
  }

  get length(): number { return this.values.length };

  get tooltipMap(): Map<string, any> {
    return new Map<string, any>([["Number", this.length], ["Min", this.min], ["Max", this.max], ["Mean", this.mean]])
  }

  protected computeTooltipOrigin(contextMatrix: DOMMatrix): Vertex {
    return new Vertex(this.origin.x + this.size.x / 2, this.origin.y + this.size.y).transform(contextMatrix)
  }

  public setGeometry(origin: Vertex, size: Vertex): void {
    this.origin = origin;
    this.size = size;
  }

  public draw(context: CanvasRenderingContext2D): void {
    if (this.size.x != 0 && this.size.y != 0) {
      super.draw(context);
      this.tooltipOrigin = this.computeTooltipOrigin(context.getTransform());
    }
  }

  public computeStats(values: number[]): void {
    this.min = Math.min(...values);
    this.max = Math.max(...values);
    this.mean = values.reduce((a, b) => a + b, 0) / values.length;
  }
}


const TOOLTIP_TEXT_OFFSET = 10;
const TOOLTIP_TRIANGLE_SIZE = 10;
export class newTooltip {
  public path: Path2D;

  public strokeStyle: string = "hsl(210, 90%, 20%)";
  public textColor: string = "hsl(0, 0%, 100%)";
  public fillStyle: string = "hsl(210, 90%, 20%)";
  public alpha: number = 0.8;
  public fontsize: number = 10;
  public radius: number = 10;

  private printedRows: string[];
  private squareOrigin: Vertex;
  private size: Vertex;
  private isUp = true;
  public isFlipper = false;
  constructor(
    public origin,
    public dataToPrint: Map<string, any>,
    context: CanvasRenderingContext2D
    ) {
      [this.printedRows, this.size] = this.buildText(context);
      this.squareOrigin = new Vertex(this.origin.x, this.origin.y);
    }

  private buildText(context: CanvasRenderingContext2D): [string[], Vertex] {
    context.save();
    context.font = `${this.fontsize}px sans-serif`;
    let printedRows = [];
    let textLength = context.measureText(printedRows[0]).width;
    this.dataToPrint.forEach((value, key) => {
      let text: string;
    if (key == "Number") {
        if (value != 1) text = `${value} samples`;
      } else {
        if (!(key == "name" && value == '')) text = `${key}: ${this.formatValue(value)}`;
      };
      const textWidth = context.measureText(text).width;
      if (textWidth > textLength) { textLength = textWidth };
      if (text) printedRows.push(text);
    })
    context.restore();
    return [printedRows, new Vertex(textLength + TOOLTIP_TEXT_OFFSET * 2, (printedRows.length + 1.5) * this.fontsize)]
  }

  private formatValue(value: number | string): number | string {
    if (typeof value == "number") return Math.round(value * TOOLTIP_PRECISION) / TOOLTIP_PRECISION;
    return value
  };

  public buildPath(): Path2D {
    const path = new Path2D();
    const rectOrigin = this.squareOrigin.add(new Vertex(-this.size.x / 2, TOOLTIP_TRIANGLE_SIZE));
    const triangleCenter = this.origin;
    triangleCenter.y += TOOLTIP_TRIANGLE_SIZE / 2 * (this.isUp ? 1 : -1);
    path.addPath(new newRoundRect(rectOrigin, this.size, this.radius).path);
    path.addPath(new Triangle(triangleCenter, TOOLTIP_TRIANGLE_SIZE, this.isUp ? 'down' : 'up').path);
    return path
  }

  private computeTextOrigin(scaling: Vertex): Vertex {
    let textOrigin = this.squareOrigin;
    let textOffsetX = -this.size.x / 2 + TOOLTIP_TEXT_OFFSET;
    let textOffsetY = (scaling.y < 0 ? -this.size.y - TOOLTIP_TRIANGLE_SIZE : TOOLTIP_TRIANGLE_SIZE) + this.fontsize * 1.25;
    return textOrigin.add(new Vertex(textOffsetX, textOffsetY));
  }

  private writeText(textOrigin: Vertex, context: CanvasRenderingContext2D): void {
    const regexSamples: RegExp = /^[0-9]+\ssamples/;
    this.printedRows.forEach((row, index) => {
      textOrigin.y += index == 0 ? 0 : this.fontsize;
      const text = new newText(row, textOrigin, {fontsize: this.fontsize, baseline: "middle", style: regexSamples.test(row) ? 'bold' : ''});
      text.fillStyle = this.textColor;
      text.draw(context)
    })
  }

  public insideCanvas(plotOrigin: Vertex, plotSize: Vertex, scaling: Vertex): void {
    const downLeftCorner = this.squareOrigin.add(new Vertex(-this.size.x / 2, TOOLTIP_TRIANGLE_SIZE).scale(scaling));
    const upRightCorner = downLeftCorner.add(this.size.scale(scaling));
    const upRightDiff = plotOrigin.add(plotSize).subtract(upRightCorner);
    const downLeftDiff = downLeftCorner.subtract(plotOrigin);

    if (upRightDiff.x < 0) {
      this.squareOrigin.x += upRightDiff.x;
    } else if (upRightDiff.x > plotSize.x) {
      this.squareOrigin.x += upRightDiff.x - plotSize.x;
    }
    if (upRightDiff.y < 0) {
      if (!this.isFlipper) {
        this.squareOrigin.y += upRightDiff.y;
        this.origin.y += upRightDiff.y;
      } else {
        this.squareOrigin.y += -this.size.y - TOOLTIP_TRIANGLE_SIZE * 2;
        this.flip();
      }

    } else if (upRightDiff.y > plotSize.y){
      if (!this.isFlipper) {
        this.squareOrigin.y += upRightDiff.y - plotSize.y;
        this.origin.y += upRightDiff.y - plotSize.y;
      } else {
        this.squareOrigin.y += this.size.y + TOOLTIP_TRIANGLE_SIZE * 2;
        this.flip();
      }
    }

    if (downLeftDiff.x < 0) {
      this.squareOrigin.x -= downLeftDiff.x;
    } else if (downLeftDiff.x > plotSize.x){
      this.squareOrigin.x -= downLeftDiff.x - plotSize.x;
    }
    if (downLeftDiff.y < 0) { // Maybe wrong, did not met the case
      this.squareOrigin.y -= downLeftDiff.y;
      this.origin.y -= downLeftDiff.y;
    } else if (downLeftDiff.y > plotSize.y){
      this.squareOrigin.y += downLeftDiff.y - plotSize.y;
      this.origin.y += downLeftDiff.y - plotSize.y;
    }
  }

  public flip(): void { this.isUp = !this.isUp }

  public draw(plotOrigin: Vertex, plotSize: Vertex, context: CanvasRenderingContext2D): void {
    const contextMatrix = context.getTransform();
    const scaling = new Vertex(1 / contextMatrix.a, 1 / contextMatrix.d);
    this.insideCanvas(plotOrigin, plotSize, scaling);
    const textOrigin = this.computeTextOrigin(scaling);
    const scaledPath = new Path2D();
    this.squareOrigin = this.squareOrigin.scale(scaling);
    this.origin = this.origin.scale(scaling);
    scaledPath.addPath(this.buildPath(), new DOMMatrix().scale(contextMatrix.a, contextMatrix.d));

    context.save();
    context.scale(scaling.x, scaling.y);
    context.strokeStyle = this.strokeStyle;
    context.fillStyle = this.fillStyle;
    context.globalAlpha = this.alpha;
    context.fill(scaledPath);
    context.stroke(scaledPath);
    this.writeText(textOrigin, context);
    context.restore()
  }
}

const DASH_SELECTION_WINDOW = [7, 3];
export class SelectionBox extends newRect {
  public minVertex: Vertex;
  public maxVertex: Vertex;

  private _previousMin: Vertex;
  private _previousMax: Vertex;

  public leftUpdate: boolean = false;
  public rightUpdate: boolean = false;
  public upUpdate: boolean = false;
  public downUpdate: boolean = false;
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public size: Vertex = new Vertex(0, 0)
  ) {
    super(origin, size);
    this.dashLine = DASH_SELECTION_WINDOW;
    this.selectedStyle = this.clickedStyle = this.hoverStyle = this.fillStyle = "hsla(0, 0%, 100%, 0)";
    this.lineWidth = 0.5
  }

  get isDefined(): boolean { return (this.minVertex != undefined && this.maxVertex != undefined) }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    super.setDrawingProperties(context);
    context.lineWidth = (this.isHovered || this.isClicked) ? this.lineWidth * 2 : this.lineWidth;
  }

  public update(minVertex: Vertex, maxVertex: Vertex) {
    this.minVertex = minVertex;
    this.maxVertex = maxVertex;
  }

  public rubberBandUpdate(rubberBand: RubberBand, coordName: string) {
    if (this.isDefined) {
      this.minVertex[coordName] = rubberBand.minValue;
      this.maxVertex[coordName] = rubberBand.maxValue;
    }
  }

  public buildRectFromHTMatrix(plotOrigin: Vertex, plotSize: Vertex, HTMatrix: DOMMatrix) {
    this.origin = this.minVertex.transform(HTMatrix);
    this.size = this.maxVertex.transform(HTMatrix).subtract(this.origin);
    this.insideCanvas(plotOrigin, plotSize);
  }

  private insideCanvas(drawOrigin: Vertex, drawSize: Vertex): boolean {
    let isInside = true;
    const downLeftCorner = this.origin;
    const upRightCorner = downLeftCorner.add(this.size);
    const upRightDiff = drawOrigin.add(drawSize).subtract(upRightCorner);
    const downLeftDiff = downLeftCorner.subtract(drawOrigin);

    if (upRightDiff.x < 0) this.size.x += upRightDiff.x
    else if (upRightDiff.x > drawSize.x) this.size.x += upRightDiff.x - drawSize.x;

    if (upRightDiff.y < 0) this.size.y += upRightDiff.y
    else if (upRightDiff.y > drawSize.y) this.size.y += upRightDiff.y - drawSize.y;

    if (downLeftDiff.x < 0) {
      this.origin.x -= downLeftDiff.x;
      this.size.x += downLeftDiff.x;
    } else if (downLeftDiff.x > drawSize.x){
      this.origin.x -= downLeftDiff.x - drawSize.x;
      this.size.x += downLeftDiff.x - drawSize.x;
    }
    if (downLeftDiff.y < 0) {
      this.origin.y -= downLeftDiff.y;
      this.size.y += downLeftDiff.y;
    } else if (downLeftDiff.y > drawSize.y){
      this.origin.y -= downLeftDiff.y - drawSize.y;
      this.size.y += downLeftDiff.y - drawSize.y;
    }

    return isInside
  }

  private get borderSizeX() {return Math.min(BORDER_SIZE, Math.abs(this.size.x) / 3)}

  private get borderSizeY() {return Math.min(BORDER_SIZE, Math.abs(this.size.y) / 3)}

  private saveState() {
    this._previousMin = this.minVertex;
    this._previousMax = this.maxVertex;
  }

  public mouseDown(mouseDown: Vertex): void {
    this.isClicked = true;
    this.saveState();
    if (Math.abs(mouseDown.x - this.origin.x) <= this.borderSizeX) { this.leftUpdate = true }
    if (Math.abs(mouseDown.x - (this.origin.x + this.size.x)) <= this.borderSizeX) { this.rightUpdate = true }
    if (Math.abs(mouseDown.y - this.origin.y) <= this.borderSizeY) { this.downUpdate = true }
    if (Math.abs(mouseDown.y - (this.origin.y + this.size.y)) <= this.borderSizeY) { this.upUpdate = true }
  }

  public mouseMove(mouseDown: Vertex, mouseCoords: Vertex): boolean {
    if (!this.leftUpdate && !this.rightUpdate && !this.downUpdate && !this.upUpdate) {
      const translation = mouseCoords.subtract(mouseDown);
      this.minVertex = this._previousMin.add(translation);
      this.maxVertex = this._previousMax.add(translation);
      return false
    }
    if (this.leftUpdate) this.minVertex.x = Math.min(this._previousMax.x, mouseCoords.x);
    if (this.rightUpdate) this.maxVertex.x = Math.max(this._previousMin.x, mouseCoords.x);
    if (this.downUpdate) this.minVertex.y = Math.min(this._previousMax.y, mouseCoords.y);
    if (this.upUpdate) this.maxVertex.y = Math.max(this._previousMin.y, mouseCoords.y);
    if (this.minVertex.x == this._previousMax.x) this.maxVertex.x = mouseCoords.x;
    if (this.maxVertex.x == this._previousMin.x) this.minVertex.x = mouseCoords.x;
    if (this.minVertex.y == this._previousMax.y) this.maxVertex.y = mouseCoords.y;
    if (this.maxVertex.y == this._previousMin.y) this.minVertex.y = mouseCoords.y;
    return false
  }

  public mouseUp() { this.leftUpdate = this.rightUpdate = this.upUpdate = this.downUpdate = this.isClicked = this.isHovered = false }
}

export class newAxis extends EventEmitter {
  public ticksPoints: newPoint2D[];
  public drawPath: Path2D;
  public path: Path2D;
  public lineWidth: number = 1;
  public strokeStyle: string = 'hsl(0, 0%, 0%)';
  public hoverStyle: string = 'hsl(0, 100%, 48%)';
  public clickedStyle: string = 'hsl(126, 67%, 72%)';
  public rubberColor: string = 'hsla(200, 95%, 50%, 0.5)';//'hsla(127, 95%, 60%, 0.85)';
  public labels: string[];
  public isHovered: boolean = false;
  public isClicked: boolean = false;
  public mouseStyleON: boolean = false;
  public rubberBand: RubberBand;
  public centeredTitle: boolean = false;
  public font: string = 'sans-serif';

  protected _ticks: number[];
  public tickPrecision: number;
  public ticksFontsize: number = 12;
  protected _isDiscrete: boolean;

  public minValue: number;
  public maxValue: number;
  public initMinValue: number;
  public initMaxValue: number;
  private _previousMin: number;
  private _previousMax: number;

  private _marginRatio: number = 0.05;
  private offsetTicks: number;
  private offsetTitle: number;
  private maxTickWidth: number;
  private maxTickHeight: number;

  readonly DRAW_START_OFFSET = 0;
  readonly SELECTION_RECT_SIZE = 10;
  readonly SIZE_END = 7;
  readonly FONT_SIZE = 12;

  // OLD
  public is_drawing_rubberband: boolean = false;

  constructor(
    vector: any[],
    public freeSpace: number,
    public origin: Vertex,
    public end: Vertex,
    public name: string = '',
    public initScale: Vertex,
    private _nTicks: number = 10
    ) {
      super();
      this.isDiscrete = typeof vector[0] == 'string';
      if (this.isDiscrete) { this.labels = newAxis.uniqueValues(vector) };
      const [minValue, maxValue] = this.computeMinMax(vector);
      [this._previousMin, this._previousMax] = [this.initMinValue, this.initMaxValue] = [this.minValue, this.maxValue] = this.marginedBounds(minValue, maxValue);
      this.ticks = this.computeTicks();
      if (!this.isDiscrete) { this.labels = this.numericLabels() };
      this.drawPath = this.buildDrawPath();
      this.path = this.buildPath();
      this.rubberBand = new RubberBand(this.name, 0, 0, this.isVertical);
      this.offsetTicks = this.ticksFontsize * 0.8;
      this.offsetTitle = 0;
    };

  public get drawLength(): number {
    return this.isVertical ? Math.abs(this.origin.y - this.end.y) : Math.abs(this.origin.x - this.end.x);
  }

  // TODO: OLD, MUST DISAPPEAR ONE PARALLELPLOT ARE REFACTORED
  public get isInverted(): boolean { return this.initScale[this.isVertical ? 'y' : 'x'] == -1 }

  private get drawingColor(): string {
    let color = this.strokeStyle;
    if (this.mouseStyleON) { color = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.strokeStyle };
    return color
  }

  get interval(): number { return Math.abs(this.maxValue - this.minValue) };

  get isVertical(): boolean { return this.origin.x == this.end.x };

  get isDiscrete(): boolean { return this._isDiscrete };

  set isDiscrete(value: boolean) { this._isDiscrete = value };

  set marginRatio(value: number) { this._marginRatio = value };

  get marginRatio(): number { return this._marginRatio };

  set nTicks(value: number) { this._nTicks = value };

  get nTicks(): number {
    if (this.isDiscrete) return this.labels.length + 1
    return this._nTicks
  }

  get ticks(): number[] { return this._ticks }

  set ticks(value: number[]) { this._ticks = value }

  get title(): string { return newText.capitalize(this.name) }

  get transformMatrix(): DOMMatrix { return this.getValueToDrawMatrix() };

  private horizontalPickIdx(): number { return Math.sign(1 - Math.sign(this.initScale.y)) }

  private verticalPickIdx(): number { return Math.sign(1 - Math.sign(this.initScale.x)) }

  public transform(newOrigin: Vertex, newEnd: Vertex): void {
    this.origin = newOrigin;
    this.end = newEnd;
    this.drawPath = this.buildDrawPath();
    this.path = this.buildPath();
  }

  public resetScale(): void {
    this.rubberBand.reset();
    this.minValue = this.initMinValue;
    this.maxValue = this.initMaxValue;
    this._previousMin = this.initMinValue;
    this._previousMax = this.initMaxValue;
    this.updateTicks();
  }

  public reset(): void {
    this.rubberBand.reset();
    this.resetScale();
  }

  public sendRubberBand(rubberBands: Map<string, RubberBand>) { this.rubberBand.selfSend(rubberBands) }

  public sendRubberBandRange(rubberBands: Map<string, RubberBand>) { this.rubberBand.selfSendRange(rubberBands) }

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
    const verticalIdx = Number(this.isVertical); const horizontalIdx = Number(!this.isVertical);
    const path = new Path2D();
    const endArrow = new newPoint2D(this.end.x + this.SIZE_END / 2 * horizontalIdx, this.end.y + this.SIZE_END / 2 * verticalIdx, this.SIZE_END, 'triangle', ['right', 'up'][verticalIdx]);
    path.moveTo(this.origin.x - this.DRAW_START_OFFSET * horizontalIdx, this.origin.y - this.DRAW_START_OFFSET * verticalIdx);
    path.lineTo(this.end.x, this.end.y);
    path.addPath(endArrow.path);
    return path
  }

  private buildPath(): Path2D {
    const path = new Path2D();
    const offset = new Vertex(this.SELECTION_RECT_SIZE * Number(this.isVertical), this.SELECTION_RECT_SIZE * Number(!this.isVertical));
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

  public normedValue(value: number): number { return value / this.interval }

  private computeMinMax(vector: any[]): number[] {
    if (vector.length == 0) return [0, 1];;
    if (this.isDiscrete) return [0, this.labels.length - 1]
    const min = Math.min(...vector);
    const max = Math.max(...vector);
    return min != max ? [min ,max] : [min * 0.7, max * 1.3]
  }

  public computeTextBoxes(context: CanvasRenderingContext2D): void {
    context.save();
    const calibratedTickText = new newText("88.88e+88", new Vertex(0, 0), { fontsize: this.FONT_SIZE, font: this.font });
    context.font = calibratedTickText.fullFont;
    const calibratedMeasure = context.measureText(calibratedTickText.text).width;
    this.maxTickWidth = Math.min(this.freeSpace - this.offsetTicks - 1, calibratedMeasure);
    this.maxTickHeight = Math.min(this.freeSpace - this.offsetTicks - 1, calibratedTickText.fontsize);
    if (this.centeredTitle) {
      const FREE_SPACE = this.freeSpace - this.FONT_SIZE - 0.3 * this.maxTickHeight;
      this.offsetTitle = (this.isVertical ? Math.min(FREE_SPACE, calibratedMeasure) : Math.min(FREE_SPACE, this.FONT_SIZE * 1.5 + this.offsetTicks));
    }
    context.restore();
  }

  private computeTicks(): number[] {
    const increment = this.isDiscrete ? 1 : newAxis.nearestFive((this.maxValue - this.minValue) / this.nTicks);
    const remainder = this.minValue % increment;
    let ticks = [this.minValue - remainder];
    while (ticks.slice(-1)[0] <= this.maxValue) { ticks.push(ticks.slice(-1)[0] + increment) };
    if (ticks.slice(0)[0] < this.minValue) ticks.splice(0, 1);
    if (ticks.slice(-1)[0] >= this.maxValue) ticks.splice(-1, 1);
    return ticks
  }

  public draw(context: CanvasRenderingContext2D): void {
    const canvasHTMatrix = context.getTransform();
    const pointHTMatrix = canvasHTMatrix.multiply(this.transformMatrix);
    const color = this.drawingColor;

    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = this.lineWidth;
    context.stroke(this.drawPath);
    context.fill(this.drawPath);

    context.setTransform(pointHTMatrix);
    const [ticksPoints, ticksTexts] = this.drawTicksPoints(context, pointHTMatrix, color);
    this.ticksPoints = ticksPoints;

    context.resetTransform();
    this.drawTicksTexts(ticksTexts, color, context);
    this.computeTextBoxes(context);
    this.drawTitle(context, canvasHTMatrix, color);

    context.setTransform(canvasHTMatrix);
    this.drawRubberBand(context);
  }

  private drawTitle(context: CanvasRenderingContext2D, canvasHTMatrix: DOMMatrix, color: string): void {
    if (this.centeredTitle) {
      var [nameCoords, align, baseline, orientation] = this.centeredTitleProperties();
    } else {
      var [nameCoords, align, baseline, orientation] = this.topArrowTitleProperties();
    }
    nameCoords.transformSelf(canvasHTMatrix);
    const textParams: textParams = {
      width: this.drawLength, fontsize: this.FONT_SIZE, font: this.font, align: align, color: color,
      baseline: baseline, style: 'bold', orientation: orientation, backgroundColor: "hsla(0, 0%, 100%, 0.5)"
    };
    const textName = new newText(this.title, nameCoords, textParams);
    textName.draw(context);
  }

  private topArrowTitleProperties(): [Vertex, string, string, number] {
    let nameCoords = this.end.copy();
    let alignChoices = ["start", "end"];
    let signFontAdd = 1;
    if (!this.isVertical) {
      alignChoices = ["end", "start"];
      signFontAdd = -0.8;
      nameCoords.y += this.FONT_SIZE;
    }
    nameCoords.x += signFontAdd * this.FONT_SIZE;
    return [nameCoords, alignChoices[this.verticalPickIdx()], "middle", 0]
  }

  private centeredTitleProperties(): [Vertex, string, string, number] {
    let baseline = ['bottom', 'top'][this.horizontalPickIdx()];
    let nameCoords = this.end.add(this.origin).divide(2);
    if (this.isVertical) {
      nameCoords.x -= this.offsetTitle;
      baseline = ['bottom', 'top'][this.verticalPickIdx()];
    } else {
      nameCoords.y -= this.offsetTitle;
    }
    return [nameCoords, "center", baseline, this.isVertical ? -90 : 0]
  }

  private drawTicksPoints(context: CanvasRenderingContext2D, pointHTMatrix: DOMMatrix, color: string): [newPoint2D[], newText[]] {
    const ticksPoints = [];
    const ticksText: newText[] = [];
    const tickTextParams = this.computeTickTextParams();

    let count = Math.max(0, this.ticks[0]);
    this.ticks.forEach((tick, idx) => {
      if (tick >= this.minValue && tick <= this.maxValue) {
        let point = this.drawTickPoint(context, tick, this.isVertical, pointHTMatrix, color);
        let text = this.labels[idx];
        ticksPoints.push(point);
        if (this.isDiscrete) {
          if (count == tick && this.labels[count]) { text = this.labels[count] ; count++ }
          else { text = '' }
        }
        ticksText.push(this.computeTickText(context, text, tickTextParams, point, pointHTMatrix));
      }
    })
    return [ticksPoints, ticksText]
  }

  private drawTicksTexts(ticksTexts: newText[], color: string, context: CanvasRenderingContext2D): void {
    this.ticksFontsize = Math.min(...ticksTexts.map(tickText => tickText.fontsize));
    ticksTexts.forEach(tickText => { this.drawTickText(tickText, color, context) });
  }

  private drawTickText(tickText: newText, color: string, context: CanvasRenderingContext2D): void {
    tickText.fillStyle = color;
    tickText.fontsize = this.ticksFontsize;
    tickText.width = null;
    tickText.draw(context);
  }

  private computeTickTextParams(): textParams {
    const [textAlign, baseline] = this.textAlignments();
    let textWidth = null;
    let textHeight = null;
    const standardOffset = this.drawLength * 0.95 / this.ticks.length;
    if (['start', 'end'].includes(textAlign)) {
      textWidth = this.maxTickWidth;
      textHeight = standardOffset;
    }
    if (textAlign == 'center') {
      textWidth = standardOffset;
      textHeight = this.maxTickHeight;
    }
    return {
      width: textWidth, height: textHeight, fontsize: this.FONT_SIZE, font: this.font,
      align: textAlign, baseline: baseline, color: this.strokeStyle
    }
  }

  private drawTickPoint(context: CanvasRenderingContext2D, tick: number, vertical: boolean, HTMatrix: DOMMatrix, color: string): newPoint2D {
    const markerOrientation = this.isVertical ? 'right' : 'up';
    const point = new newPoint2D(tick * Number(!vertical), tick * Number(vertical), this.SIZE_END / Math.abs(HTMatrix.a), 'halfLine', markerOrientation, color);
    point.draw(context);
    return point
  }

  private computeTickText(context: CanvasRenderingContext2D, text: string, tickTextParams: textParams, point: newPoint2D, HTMatrix: DOMMatrix): newText {
    const textOrigin = this.tickTextPositions(point, HTMatrix);
    const tickText = new newText(newText.capitalize(text), textOrigin, tickTextParams);
    tickText.removeEndZeros();
    tickText.format(context);
    return tickText
  }

  private getValueToDrawMatrix(): DOMMatrix {
    const scale = this.drawLength / this.interval;
    return new DOMMatrix([
      scale, 0, 0, scale,
      this.origin.x - this.minValue * Number(!this.isVertical) * scale,
      this.origin.y - this.minValue * Number(this.isVertical) * scale]);
  }

  private marginedBounds(minValue: number, maxValue: number): [number, number] {
    const valueRange = Math.abs(maxValue - minValue);
    if (this.isDiscrete) { return [minValue - 1, maxValue + 1] };
    return [
      minValue - valueRange * this.marginRatio,
      maxValue + valueRange * this.marginRatio];
  }

  public drawRubberBand(context: CanvasRenderingContext2D): void {
    const realMin = this.relativeToAbsolute(this.rubberBand.minValue);
    const realMax = this.relativeToAbsolute(this.rubberBand.maxValue);
    const coord = this.isVertical ? "y" : "x";
    this.rubberBand.realMin = Math.max(Math.min(realMin, realMax), this.origin[coord]);
    this.rubberBand.realMax = Math.min(Math.max(realMin, realMax), this.end[coord]);
    this.rubberBand.realMin = Math.min(this.rubberBand.realMin, this.rubberBand.realMax);
    this.rubberBand.realMax = Math.max(this.rubberBand.realMin, this.rubberBand.realMax);
    this.rubberBand.draw(this.isVertical ? this.origin.x : this.origin.y, context, this.rubberColor, 'hsl(203, 0%, 100%, 0.5)', 0.1, 1.);
    if (this.rubberBand.isClicked) this.emit("rubberBandChange", this.rubberBand);
  }

  public mouseMove(mouseDown: Vertex, mouseCoords: Vertex): boolean {
    let downValue = this.absoluteToRelative(this.isVertical ? mouseDown.y : mouseDown.x);
    let currentValue = this.absoluteToRelative(this.isVertical ? mouseCoords.y : mouseCoords.x);
    if (!this.rubberBand.isClicked) {
      this.rubberBand.minValue = Math.min(downValue, currentValue);
      this.rubberBand.maxValue = Math.max(downValue, currentValue);
    } else { this.rubberBand.mouseMove(downValue, currentValue) }
    return true
  }

  public mouseDown(mouseDown: Vertex): boolean {
    let isReset = false;
    this.is_drawing_rubberband = true; // OLD
    const mouseUniCoord = this.isVertical ? mouseDown.y : mouseDown.x;
    if (!this.isInRubberBand(this.absoluteToRelative(mouseUniCoord))) {
      this.rubberBand.reset();
      isReset = true;
    } else { this.rubberBand.mouseDown(mouseUniCoord); }
    this.emit("rubberBandChange", this.rubberBand);
    return isReset
  }

  public mouseUp(): void { this.rubberBand.mouseUp() }

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

  public stringToValue(value: string | number): number {
    if (typeof value == 'string') return this.labels.indexOf(value)
    return value
  }

  private textAlignments(): [string, string] {
    const forVertical = ['end', 'start'][this.verticalPickIdx()];
    const forHorizontal = ['bottom', 'top'][this.horizontalPickIdx()]
    return this.isVertical ? [forVertical, 'middle'] : ['center', forHorizontal]
  }

  private tickTextPositions(point: newPoint2D, HTMatrix: DOMMatrix): Vertex {
    let origin = point.center.transform(HTMatrix);
    if (this.isVertical) { // a little strange, should be the same as name but different since points are already in a relative mode
      origin.x -= Math.sign(HTMatrix.a) * this.offsetTicks;
    }
    else {
      origin.y -= Math.sign(HTMatrix.d) * this.offsetTicks;
    }
    return origin
  }

  public updateScale(viewPoint: Vertex, scaling: Vertex, translation: Vertex): void {
    const HTMatrix = this.transformMatrix;
    let center = (viewPoint.x - HTMatrix.e) / HTMatrix.a;
    let offset = translation.x;
    let scale = scaling.x;
    if (this.isVertical) { center = (viewPoint.y - HTMatrix.f) / HTMatrix.d; offset = translation.y; scale = scaling.y };
    this.minValue = (this._previousMin - center) / scale + center - offset / HTMatrix.a;
    this.maxValue = (this._previousMax - center) / scale + center - offset / HTMatrix.a;
    this.updateTicks();
  }

  private updateTickPrecision(): number {
    this.tickPrecision = 1;
    for (let index = 0 ; index < this.ticks.length - 1 ; index++) {
      const rightTick = this.ticks[index + 1];
      const leftTick = this.ticks[index];
      while (Number(rightTick.toPrecision(this.tickPrecision)) / Number(leftTick.toPrecision(this.tickPrecision)) == 1) {
        this.tickPrecision++;
      };
    }
    return
  };

  public updateTicks(): void {
    this.ticks = this.computeTicks();
    if (!this.isDiscrete) { this.labels = this.numericLabels() };
  }
}

export class DrawingCollection {
  constructor(
    public drawings: any[] = [],
    public frame: DOMMatrix = new DOMMatrix()
  ) {}

  public updateMouseState(context: CanvasRenderingContext2D, mouseCoords: Vertex, stateName: string, keepState: boolean, invertState: boolean) {
    this.drawings.forEach(drawing => {
      if (context.isPointInPath(drawing.path, mouseCoords.x, mouseCoords.y)) drawing[stateName] = invertState ? !drawing[stateName] : true
      else {
        if (!keepState) drawing[stateName] = false;
      }
    })
  }

  public mouseDown(mouseCoords: Vertex): any {
    let clickedObject: any = null;
    this.drawings.forEach(drawing => {
      if (drawing.isHovered) {
        clickedObject = drawing;
        clickedObject.mouseDown(mouseCoords);
      }
    });
    return clickedObject
  }
}

export class ShapeCollection extends DrawingCollection {
  constructor(
    public drawings: newShape[] = [],
    public frame: DOMMatrix = new DOMMatrix()
  ) {
    super(drawings, frame);
  }

  public drawTooltips(canvasOrigin: Vertex, canvasSize: Vertex, context: CanvasRenderingContext2D, inMultiPlot: boolean): void {
    this.drawings.forEach(drawing => { if (!inMultiPlot && drawing.inFrame) drawing.drawTooltip(canvasOrigin, canvasSize, context) });
  }
}

export class GroupCollection extends ShapeCollection {
  constructor(
    public drawings: any[] = [],
    public frame: DOMMatrix = new DOMMatrix()
  ) {
    super(drawings, frame);
  }

  public drawingIsContainer(drawing: any): boolean { return drawing.values ? drawing.values.length > 1 ? true : false : false }

  public drawTooltips(canvasOrigin: Vertex, canvasSize: Vertex, context: CanvasRenderingContext2D, inMultiPlot: boolean): void {
    this.drawings.forEach(drawing => { if ((this.drawingIsContainer(drawing) || !inMultiPlot) && drawing.inFrame) drawing.drawTooltip(canvasOrigin, canvasSize, context) });
  }

  public updateSampleStates(stateName: string): number[] {
    const newSampleStates = [];
    this.drawings.forEach(drawing => {
      if (drawing.values) {
        if (drawing[stateName]) drawing.values.forEach(sample => newSampleStates.push(sample));
      }
    });
    return newSampleStates
  }
}
