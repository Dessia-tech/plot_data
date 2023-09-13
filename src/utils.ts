import { TextStyle, EdgeStyle, SurfaceStyle } from "./style";
import { string_to_rgb, colorHex, color_to_string, isHex, isRgb, string_to_hex, rgb_to_string, hslToArray, colorHsl } from "./color_conversion";
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
    return new PointFamily(colorHex(serialized['color']),
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
    if (isHex(element) || isRgb(element)) {
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
    if (Math.abs(mouseAxis - this.realMin) <= this.borderSize) this.minUpdate = true
    else if (Math.abs(mouseAxis - this.realMax) <= this.borderSize) this.maxUpdate = true
    else this.lastValues = new Vertex(this.minValue, this.maxValue);
  }

  public mouseMove(downValue: number, currentValue: number) {
    if (this.isClicked) {
      if (this.minUpdate) this.minValue = currentValue
      else if (this.maxUpdate) this.maxValue = currentValue
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
  constructor(public x: number = 0, public y: number = 0) {}

  get coordinates(): [number, number] { return [this.x, this.y] }

  public copy(): Vertex { return new Vertex(this.x, this.y) }

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

  public translate(translation: Vertex): Vertex { return this.add(translation) }

  public translateSelf(translation: Vertex): void {
    this.x += translation.x;
    this.y += translation.y;
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

  public mouseClick: Vertex = null;
  public isHovered: boolean = false;
  public isClicked: boolean = false;
  public isSelected: boolean = false;
  public isScaled: boolean = true;
  public isFilled: boolean = true;
  public inFrame: boolean = true;

  public tooltipOrigin: Vertex;
  protected _tooltipMap = new Map<string, any>();
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
    if (this.isFilled) context.fill(scaledPath);
    context.stroke(scaledPath);
    context.restore();
  }

  public setStrokeStyle(fillStyle: string): string {
    const [h, s, l] = hslToArray(colorHsl(fillStyle));
    const lValue = l <= STROKE_STYLE_OFFSET ? l + STROKE_STYLE_OFFSET : l - STROKE_STYLE_OFFSET;
    return `hsl(${h}, ${s}%, ${lValue}%)`;
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.strokeStyle;
    context.setLineDash(this.dashLine);
    context.globalAlpha = this.alpha;
    if (this.isFilled) {
      context.fillStyle = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.isSelected ? this.selectedStyle : this.fillStyle;
      context.strokeStyle = this.setStrokeStyle(context.fillStyle);
    } else context.strokeStyle = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.isSelected ? this.selectedStyle : this.strokeStyle;
  }

  public initTooltip(context: CanvasRenderingContext2D): newTooltip { return new newTooltip(this.tooltipOrigin, this.tooltipMap, context) }

  public drawTooltip(plotOrigin: Vertex, plotSize: Vertex, context: CanvasRenderingContext2D): void {
    if (this.isClicked && this.tooltipMap.size != 0) {
      const tooltip = this.initTooltip(context);
      tooltip.draw(plotOrigin, plotSize, context);
    }
  }

  public buildPath(): void {}

  public isPointInShape(context: CanvasRenderingContext2D, point: Vertex): boolean {
    if (this.isFilled) return context.isPointInPath(this.path, point.x, point.y);
    context.save();
    context.lineWidth = 10;
    const isHovered = context.isPointInStroke(this.path, point.x, point.y);
    context.restore();
    return isHovered
  }

  public mouseDown(mouseDown: Vertex) { if (this.isHovered) this.mouseClick = mouseDown.copy() }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): boolean {
    this.isHovered = this.isPointInShape(context, mouseCoords);
    return false
  }

  public mouseUp(context: CanvasRenderingContext2D, keepState: boolean): void {
    this.isClicked = this.isHovered ? !this.isClicked : (keepState ? this.isClicked : false);
    this.mouseClick = null;
  }
}

export class newCircle extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public radius: number = 1
  ) {
    super();
    this.buildPath();
  }

  public buildPath(): void {
    this.path = new Path2D();
    this.path.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
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

  public buildPath(): void {
    this.path = new Path2D();
    this.path.rect(this.origin.x, this.origin.y, this.size.x, this.size.y);
  }

  public translate(translation: Vertex): void {
    this.origin = this.origin.add(translation);
    this.buildPath();
  }
}

export class newRoundRect extends newRect {
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public size: Vertex = new Vertex(0, 0),
    public radius: number = 2
    ) {
      super();
      this.buildPath();
    }

  public buildPath(): void {
    this.path = new Path2D();
    const hLength = this.origin.x + this.size.x;
    const vLength = this.origin.y + this.size.y;
    this.path.moveTo(this.origin.x + this.radius, this.origin.y);
    this.path.lineTo(hLength - this.radius, this.origin.y);
    this.path.quadraticCurveTo(hLength, this.origin.y, hLength, this.origin.y + this.radius);
    this.path.lineTo(hLength, this.origin.y + this.size.y - this.radius);
    this.path.quadraticCurveTo(hLength, vLength, hLength - this.radius, vLength);
    this.path.lineTo(this.origin.x + this.radius, vLength);
    this.path.quadraticCurveTo(this.origin.x, vLength, this.origin.x, vLength - this.radius);
    this.path.lineTo(this.origin.x, this.origin.y + this.radius);
    this.path.quadraticCurveTo(this.origin.x, this.origin.y, this.origin.x + this.radius, this.origin.y);
  }
}

export class Mark extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }

  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y);
    this.path.lineTo(this.center.x + halfSize, this.center.y);
    this.path.moveTo(this.center.x, this.center.y - halfSize);
    this.path.lineTo(this.center.x, this.center.y + halfSize);
  }
}

export abstract class AbstractHalfLine extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }
}

export class UpHalfLine extends AbstractHalfLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x, this.center.y);
    this.path.lineTo(this.center.x, this.center.y + halfSize);
  }
}

export class DownHalfLine extends AbstractHalfLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x, this.center.y);
    this.path.lineTo(this.center.x, this.center.y - halfSize);
  }
}

export class LeftHalfLine extends AbstractHalfLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x, this.center.y);
    this.path.lineTo(this.center.x - halfSize, this.center.y);
  }
}

export class RightHalfLine extends AbstractHalfLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x, this.center.y);
    this.path.lineTo(this.center.x + halfSize, this.center.y);
  }
}

export class HalfLine extends AbstractHalfLine {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super(center, size, orientation);
    this.buildPath();
  }

  public buildPath(): void {
    if (this.orientation == 'up') this.path = new UpHalfLine(this.center, this.size).path;
    if (this.orientation == 'down') this.path = new DownHalfLine(this.center, this.size).path;
    if (this.orientation == 'left') this.path = new LeftHalfLine(this.center, this.size).path;
    if (this.orientation == 'right') this.path = new RightHalfLine(this.center, this.size).path;
    if (!['up', 'down', 'left', 'right'].includes(this.orientation)) throw new Error(`Orientation ${this.orientation} is unknown.`);
  }
}

export abstract class AbstractLine extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }
}

export class VerticalLine extends AbstractLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x, this.center.y - halfSize);
    this.path.lineTo(this.center.x, this.center.y + halfSize);
  }
}

export class HorizontalLine extends AbstractLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y);
    this.path.lineTo(this.center.x + halfSize, this.center.y);
  }
}

export class SlashLine extends AbstractLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y + halfSize);
  }
}

export class BackSlashLine extends AbstractLine {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y + halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y - halfSize);
  }
}

export class Line extends AbstractLine {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super(center, size, orientation);
    this.buildPath();
  }

  public buildPath(): void {
    if (this.orientation == 'vertical') this.path = new VerticalLine(this.center, this.size).path;
    if (this.orientation == 'horizontal') this.path = new HorizontalLine(this.center, this.size).path;
    if (this.orientation == 'slash') this.path = new SlashLine(this.center, this.size).path;
    if (this.orientation == 'backslash') this.path = new BackSlashLine(this.center, this.size).path;
    if (!['vertical', 'horizontal', 'slash', 'backslash'].includes(this.orientation)) throw new Error(`Orientation ${this.orientation} is unknown.`);
  }
}

export class Cross extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }

  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y + halfSize);
    this.path.moveTo(this.center.x - halfSize, this.center.y + halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y - halfSize);
  }
}

export abstract class AbstractTriangle extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
    ) {
    super();
    this.buildPath();
  }
  public abstract buildPath(): void;
}

export class UpTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x, this.center.y + halfSize);
    this.path.lineTo(this.center.x - halfSize, this.center.y - halfSize - this.lineWidth);
  }
}

export class DownTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x + halfSize, this.center.y + halfSize);
    this.path.lineTo(this.center.x, this.center.y - halfSize);
    this.path.lineTo(this.center.x - halfSize, this.center.y + halfSize);
    this.path.lineTo(this.center.x + halfSize + this.lineWidth, this.center.y + halfSize);
  }
}

export class LeftTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x + halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x - halfSize, this.center.y);
    this.path.lineTo(this.center.x + halfSize, this.center.y + halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y - halfSize - this.lineWidth);
  }
}

export class RightTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y);
    this.path.lineTo(this.center.x - halfSize, this.center.y + halfSize);
    this.path.lineTo(this.center.x - halfSize, this.center.y - halfSize - this.lineWidth);
  }
}

export class Triangle extends AbstractTriangle {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super();
    this.buildPath();
  }

  public buildPath(): void {
    if (this.orientation == 'up') this.path = new UpTriangle(this.center, this.size).path
    if (this.orientation == 'down') this.path = new DownTriangle(this.center, this.size).path
    if (this.orientation == 'right') this.path = new RightTriangle(this.center, this.size).path
    if (this.orientation == 'left') this.path = new LeftTriangle(this.center, this.size).path
    if (!['up', 'down', 'left', 'right'].includes(this.orientation)) throw new Error(`Orientation ${this.orientation} is unknown.`);
  }
}

export interface TextParams {
  width?: number,
  height?: number,
  fontsize?: number,
  multiLine?: boolean,
  font?: string,
  align?: string,
  baseline?: string,
  style?: string,
  orientation?: number,
  backgroundColor?: string,
  color?: string
}

const SEPARATORS = ["_", "/", "\\", " ", ",", ";", ":"];
const DEFAULT_FONTSIZE = 12;
export class newText extends newShape {
  public scale: number = 1;
  public fillStyle: string = 'hsl(0, 0%, 0%)';
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
  public boundingBox: newRect;
  public offset: number = 0;
  private words: string[];
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
    }: TextParams = {}) {
      super();
      this.boundingBox = new newRect(origin, new Vertex(width, height));
      this.boundingBox.fillStyle = backgroundColor;
      this.boundingBox.strokeStyle = backgroundColor;
      this.fontsize = fontsize;
      this.multiLine = multiLine;
      this.font = font;
      this.align = align;
      this.baseline = baseline;
      this.style = style;
      this.orientation = orientation;
      this.fillStyle = color;
      this.words = this.getWords();
    }

  private static buildFont(style: string, fontsize: number, font: string): string {
    return `${style} ${fontsize}px ${font}`
  }

  get fullFont(): string { return newText.buildFont(this.style, this.fontsize, this.font) }

  private automaticFontSize(context: CanvasRenderingContext2D): number {
    let pxMaxWidth: number = this.boundingBox.size.x * this.scale;
    context.font = '1px ' + this.font;
    return Math.min(pxMaxWidth / context.measureText(this.text).width, DEFAULT_FONTSIZE)
  }

  private setRectOffsetX(): number {
    if (this.align == "center") return -this.width / 2;
    if (["right", "end"].includes(this.align)) return -this.width;
    return 0;
  }

  private computeOffsetY(): void {
    if (this.multiLine) {
      this.offset = ["top", "hanging"].includes(this.baseline) ? this.height - this.boundingBox.size.y - this.fontsize : 0;
    }
  }

  private setRectOffsetY(): number {
    if (this.baseline == "middle") return -this.height / 2;
    if (["top", "hanging"].includes(this.baseline)) return -this.height + this.fontsize;
    return 0;
  }

  private computeRectHeight(): number {
    if (["alphabetic", "bottom"].includes(this.baseline)) return -this.height;
    return this.height;
  }

  public buildPath(): void {
    this.boundingBox.origin = this.origin.copy();
    this.boundingBox.origin.x += this.setRectOffsetX();
    this.boundingBox.origin.y += this.setRectOffsetY() + this.offset;
    this.boundingBox.size.x = this.width;
    this.boundingBox.size.y = this.computeRectHeight();
    this.boundingBox.buildPath();
    this.path = this.boundingBox.path;
  }

  public static capitalize(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1) }

  public capitalizeSelf(): void { this.text = newText.capitalize(this.text) }

  public draw(context: CanvasRenderingContext2D): void {
    if (this.text) {
      this.words = this.getWords();
      context.save();
      this.setBoundingBoxState();
      const writtenText = this.format(context);
      this.computeOffsetY();
      this.buildPath();
      this.boundingBox.draw(context)

      context.font = this.fullFont;
      context.textAlign = this.align as CanvasTextAlign;
      context.textBaseline = this.baseline as CanvasTextBaseline;

      context.fillStyle = this.fillStyle;
      context.globalAlpha = this.alpha;
      context.translate(this.origin.x, this.origin.y);
      context.rotate(Math.PI / 180 * this.orientation);
      this.write(writtenText, context);
      context.restore();
    }
  }

  private setBoundingBoxState(): void {
    this.boundingBox.isHovered = this.isHovered;
    this.boundingBox.isClicked = this.isClicked;
    this.boundingBox.isSelected = this.isSelected;
  }

  public updateParameters(textParams: TextParams): void {
    if (textParams.width) this.boundingBox.size.x = textParams.width;
    if (textParams.height) this.boundingBox.size.y = textParams.height;
    if (textParams.fontsize) this.fontsize = textParams.fontsize;
    if (textParams.multiLine) this.multiLine = textParams.multiLine;
    if (textParams.font) this.font = textParams.font;
    if (textParams.align) this.align = textParams.align;
    if (textParams.baseline) this.baseline = textParams.baseline;
    if (textParams.style) this.style = textParams.style;
    if (textParams.orientation) this.orientation = textParams.orientation;
    if (textParams.backgroundColor) this.boundingBox.fillStyle = textParams.backgroundColor;
    if (textParams.color) this.fillStyle = textParams.color;
  }

  private write(writtenText: string[], context: CanvasRenderingContext2D): void {
    context.fillStyle = this.fillStyle;
    if (writtenText.length != 1) {
      const nRows: number = writtenText.length - 1;
      writtenText.forEach((row, index) => context.fillText(row, 0, (index - nRows) * this.fontsize + this.offset));
    } else {
      context.fillText(writtenText[0], 0, this.offset);
    }
  }

  public removeEndZeros(): void {
    let splitText = this.text.split(".");
    if (splitText.length > 1) {
      let splitDecimal = splitText[1].split("e");
      let decimal = splitDecimal[0];
      if (decimal) {
        while (decimal[decimal.length - 1] == "0") decimal = decimal.slice(0, -1);
        if (decimal.length != 0) this.text = `${splitText[0]}.${decimal}`
        else this.text = splitText[0];
        if (splitDecimal.length > 1) this.text = `${this.text}e${splitDecimal[1]}`;
      }
    }
  }

  public format(context: CanvasRenderingContext2D): string[] {
    let writtenText = [this.text];
    let fontsize = this.fontsize ?? DEFAULT_FONTSIZE;
    context.font = newText.buildFont(this.style, fontsize, this.font);
    if (this.boundingBox.size.x) {
      if (this.multiLine) [writtenText, fontsize] = this.multiLineSplit(fontsize, context);
      else {
        if (!this.fontsize || context.measureText(this.text).width > this.boundingBox.size.x) fontsize = this.automaticFontSize(context);
      }
    }
    this.fontsize = fontsize;
    context.font = newText.buildFont(this.style, fontsize, this.font);
    this.height = writtenText.length * fontsize;
    let longestRow = writtenText[0];
    writtenText.forEach(row => { if (row.length > longestRow.length) longestRow = row });
    this.width = context.measureText(longestRow).width;
    this.nRows = writtenText.length;
    return writtenText
  }

  public multiLineSplit(fontsize: number, context: CanvasRenderingContext2D): [string[], number] {
    context.font = newText.buildFont(this.style, fontsize, this.font);
    const oneRowLength = context.measureText(this.text).width;
    if (oneRowLength <= this.boundingBox.size.x) return [[this.text], fontsize > this.boundingBox.size.y ? this.boundingBox.size.y : fontsize];
    if (!this.boundingBox.size.y) return [this.fixedFontSplit(context), fontsize];
    return this.autoFontSplit(fontsize, context);
  }

  private getWords(): string[] {
    if (this.words) return this.words;
    return this.splitInWords();
  }

  private splitInWords(): string[] {
    const words = [];
    let pickedChars = 0;
    while (pickedChars < this.text.length - 1) {
      let word = this.text[pickedChars];
      if (SEPARATORS.includes(this.text[pickedChars])) pickedChars++;
      else {
        while (!SEPARATORS.includes(this.text[pickedChars]) && pickedChars < this.text.length - 1) {
          pickedChars++;
          word += this.text[pickedChars];
        }
        if (SEPARATORS.includes(this.text[pickedChars])) {
          word += this.text[pickedChars];
          pickedChars++;
        }
      }
      words.push(word);
    }
    return words
  }

  private fixedFontSplit(context: CanvasRenderingContext2D): string[] {
    const rows: string[] = [];
    let pickedWords = 0;
    while (pickedWords < this.words.length) {
      let newRow = '';
      while (context.measureText(newRow).width < this.boundingBox.size.x && pickedWords < this.words.length) {
        if (context.measureText(newRow + this.words[pickedWords]).width > this.boundingBox.size.x) break
        else {
          newRow += this.words[pickedWords];
          pickedWords++;
        }
      }
      if (newRow.length != 0) rows.push(newRow);
    }
    return this.cleanStartAllRows(rows)
  }

  private cleanStartAllRows(rows: string[]): string[] {
    return rows.map(row => { return this.removeFirstSpaces(row) })
  }

  private removeFirstSpaces(row: string): string {
    let charIndex = 0;
    while (SEPARATORS.includes(row[charIndex])) charIndex++;
    return row.slice(charIndex);
  }

  private autoFontSplit(fontsize: number, context: CanvasRenderingContext2D): [string[], number] {
    let rows = [];
    let criterion = Number.POSITIVE_INFINITY;
    while (criterion > this.boundingBox.size.y) {
      context.font = newText.buildFont(this.style, fontsize, this.font);
      rows = this.fixedFontSplit(context);
      criterion = fontsize * rows.length;
      fontsize--;
    }
    return [rows, fontsize + 1]
  }
}

export interface PointStyleInterface {
  size?: number,
  color_fill?: string,
  color_stroke?: string,
  stroke_width?: number,
  shape?: string,
  name?: string
}

export class newPointStyle implements PointStyleInterface {
  public size: number;
  public fillStyle: string;
  public strokeStyle: string;
  public marker: string;
  public lineWidth: number;
  constructor(
    { size = null,
      color_fill = null,
      color_stroke = null,
      stroke_width = null,
      shape = 'circle',
      name = ''
    }: PointStyleInterface = {}
    ) {
      this.size = size;
      this.fillStyle = color_fill;
      this.strokeStyle = color_stroke;
      this.marker = shape;
      this.lineWidth = stroke_width;
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
    fillStyle: string = null,
    strokeStyle: string = null
  ) {
    super();
    this.center = new Vertex(x, y);
    this.buildPath();
    this.fillStyle = fillStyle || this.fillStyle;
    this.strokeStyle = strokeStyle || this.setStrokeStyle(this.fillStyle);
    this.lineWidth = 1;
  };

  public updateStyle(style: newPointStyle): void {
    this.size = style.size ?? this.size;
    this.fillStyle = style.fillStyle ?? this.fillStyle;
    this.strokeStyle = style.strokeStyle ?? this.strokeStyle;
    this.marker = style.marker ?? this.marker;
  }

  public copy(): newPoint2D {
    const copy = new newPoint2D();
    copy.center = this.center.copy();
    copy.size = this.size;
    copy.marker = this.marker;
    copy.markerOrientation = this.markerOrientation;
    copy.fillStyle = this.fillStyle;
    copy.strokeStyle = this.strokeStyle;
    copy.lineWidth = this.lineWidth;
    return copy
  }

  public update() { this.buildPath() }

  public scale(scale: Vertex): newPoint2D {
    this.center = this.center.scale(scale);
    this.buildPath();
    return this
  }

  public setColors(color: string) {
    this.fillStyle = this.isFilled ? color : null;
    this.strokeStyle = this.isFilled ? this.setStrokeStyle(this.fillStyle) : color;
  }

  get drawnShape(): newShape {
    let marker = new newShape();
    if (CIRCLES.includes(this.marker)) marker = new newCircle(this.center, this.size / 2);
    if (MARKERS.includes(this.marker)) marker = new Mark(this.center, this.size);
    if (CROSSES.includes(this.marker)) marker = new Cross(this.center, this.size);
    if (SQUARES.includes(this.marker)) {
      const halfSize = this.size * 0.5;
      const origin = new Vertex(this.center.x - halfSize, this.center.y - halfSize)
      marker = new newRect(origin, new Vertex(this.size, this.size))
    };
    if (TRIANGLES.includes(this.marker)) marker = new Triangle(this.center, this.size, this.markerOrientation);
    if (this.marker == 'halfLine') marker = new HalfLine(this.center, this.size, this.markerOrientation);
    if (this.marker == 'line') marker = new Line(this.center, this.size, this.markerOrientation);
    marker.lineWidth = this.lineWidth;
    this.isFilled = marker.isFilled;
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

  public buildPath(): void { this.path = this.drawnShape.path };

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
    fillStyle: string = null,
    strokeStyle: string = null
  ) {
    super(x, y, _size, _marker, _markerOrientation, fillStyle, strokeStyle);
    this.isScaled = false;
  }

  public static fromPlottedValues(indices: number[], pointsData: {[key: string]: number[]}, pointSize: number, marker: string,
    thresholdDist: number, tooltipAttributes: string[], features: Map<string, number[]>, axes: newAxis[],
    xName: string, yName: string): ScatterPoint {
      const newPoint = new ScatterPoint(indices, 0, 0, pointSize, marker);
      newPoint.computeValues(pointsData, thresholdDist);
      newPoint.updateTooltip(tooltipAttributes, features, axes, xName, yName);
      newPoint.update();
      return newPoint
    }

  public updateTooltipMap() { this._tooltipMap = new Map<string, any>([["Number", this.values.length], ["X mean", this.mean.x], ["Y mean", this.mean.y],]) };

  public updateTooltip(tooltipAttributes: string[], features: Map<string, number[]>, axes: newAxis[], xName: string, yName: string) {
    this.updateTooltipMap();
    if (this.values.length == 1) {
      this.newTooltipMap();
      tooltipAttributes.forEach(attr => this.tooltipMap.set(attr, features.get(attr)[this.values[0]]));
      return;
    }
    this.tooltipMap.set(`Average ${xName}`, axes[0].isDiscrete ? axes[0].labels[Math.round(this.mean.x)] : this.mean.x);
    this.tooltipMap.set(`Average ${yName}`, axes[1].isDiscrete ? axes[1].labels[Math.round(this.mean.y)] : this.mean.y);
    this.tooltipMap.delete('X mean');
    this.tooltipMap.delete('Y mean');
  }

  public updateStyle(style: newPointStyle): void {
    super.updateStyle(style);
    this.marker = this.values.length > 1 ? this.marker : style.marker ?? this.marker;
  }

  public computeValues(pointsData: {[key: string]: number[]}, thresholdDist: number): void {
      let centerX = 0;
      let centerY = 0;
      let meanX = 0;
      let meanY = 0;
      this.values.forEach(index => {
        centerX += pointsData.xCoords[index];
        centerY += pointsData.yCoords[index];
        meanX += pointsData.xValues[index];
        meanY += pointsData.yValues[index];
      });
      this.center.x = centerX / this.values.length;
      this.center.y = centerY / this.values.length;
      this.size = Math.min(this.size * 1.15**(this.values.length - 1), thresholdDist);
      this.mean.x = meanX / this.values.length;
      this.mean.y = meanY / this.values.length;
    }
}

export class LineSequence extends newShape {
  public previousTooltipOrigin: Vertex;
  public hoveredFactor: number = 2;
  public clickedFactor: number = 2;
  public selectedFactor: number = 2;
  constructor(
    public points: newPoint2D[] = [],
    public name: string = ""
  ) {
    super();
    this.isScaled = false;
    this.isFilled = false;
    this.updateTooltipMap();
  }

  public initTooltip(context: CanvasRenderingContext2D): newTooltip {
    const tooltip = super.initTooltip(context);
    tooltip.isFlipper = true;
    return tooltip
  }

  public setTooltipOrigin(vertex: Vertex): void {
    this.previousTooltipOrigin = vertex.copy();
    this.tooltipOrigin = this.previousTooltipOrigin.copy();
  }

  public translateTooltip(translation: Vertex): void { this.tooltipOrigin?.translateSelf(translation) }

  public mouseDown(mouseDown: Vertex) {
    super.mouseDown(mouseDown);
    if (this.isHovered) this.setTooltipOrigin(mouseDown);
  }

  public updateTooltipMap() { this._tooltipMap = new Map<string, any>([["Name", this.name]]) }

  private getEdgeStyle(edgeStyle: {[key: string]: any}): void {
    if (edgeStyle.line_width) this.lineWidth = edgeStyle.line_width;
    if (edgeStyle.color_stroke) this.strokeStyle = edgeStyle.color_stroke;
    if (edgeStyle.dashline) this.dashLine = edgeStyle.dashline;
  }

  public static getGraphProperties(graph: {[key: string]: any}): LineSequence {
    const emptyLineSequence = new LineSequence([], graph.name);
    if (graph.edge_style) emptyLineSequence.getEdgeStyle(graph.edge_style);
    return emptyLineSequence
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    super.setDrawingProperties(context);
    const factor = this.isSelected ? this.selectedFactor : this.isClicked ? this.clickedFactor : this.isHovered ? this.hoveredFactor : 1;
    context.lineWidth = this.lineWidth * factor;
  }

  public buildPath(): void {
    this.path = new Path2D();
    this.path.moveTo(this.points[0].center.x, this.points[0].center.y);
    this.points.slice(1).forEach(point=> this.path.lineTo(point.center.x, point.center.y));
  }

  public update(points: newPoint2D[]): void {
    this.points = points;
    this.buildPath();
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

  public updateStyle(origin: Vertex, size: Vertex, hoveredIndices: number[], clickedIndices: number[], selectedIndices: number[],
    fillStyle: string, strokeStyle: string, dashLine: number[], lineWidth: number): void {
    this.setGeometry(origin, size);
    this.fillStyle = fillStyle;
    this.strokeStyle = strokeStyle;
    this.dashLine = dashLine;
    this.lineWidth = lineWidth;
    if (this.values.some(valIdx => hoveredIndices.includes(valIdx))) this.isHovered = true;
    if (this.values.some(valIdx => clickedIndices.includes(valIdx))) this.isClicked = true;
    if (this.values.some(valIdx => selectedIndices.includes(valIdx))) this.isSelected = true;
    this.buildPath();
  }
}


const TOOLTIP_TEXT_OFFSET = 10;
const TOOLTIP_TRIANGLE_SIZE = 10;
export class newTooltip {
  public path: Path2D;

  public lineWidth: number = 1;
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
    const printedRows = [];
    let textLength = 0;
    this.dataToPrint.forEach((value, key) => {
      let text: string = null;
      if (key == "Number") {
        if (value != 1) text = `${value} samples`;
      } else {
        if (!(key == "name" && value == '')) text = `${key}: ${this.formatValue(value)}`;
      };
      const textWidth = context.measureText(text).width;
      if (textWidth > textLength) textLength = textWidth;
      if (text) printedRows.push(text);
    })
    context.restore();
    return [printedRows, new Vertex(textLength + TOOLTIP_TEXT_OFFSET * 2, (printedRows.length + 1.5) * this.fontsize)]
  }

  private formatValue(value: number | string): number | string {
    if (typeof value == "number") return Math.round(value * TOOLTIP_PRECISION) / TOOLTIP_PRECISION;
    return value
  };

  public buildPath(): void {
    this.path = new Path2D();
    const rectOrigin = this.squareOrigin.add(new Vertex(-this.size.x / 2, TOOLTIP_TRIANGLE_SIZE));
    const triangleCenter = this.origin;
    triangleCenter.y += TOOLTIP_TRIANGLE_SIZE / 2 * (this.isUp ? 1 : -1);
    this.path.addPath(new newRoundRect(rectOrigin, this.size, this.radius).path);
    this.path.addPath(new Triangle(triangleCenter, TOOLTIP_TRIANGLE_SIZE, this.isUp ? 'down' : 'up').path);
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

    if (upRightDiff.x < 0) this.squareOrigin.x += upRightDiff.x
    else if (upRightDiff.x > plotSize.x) this.squareOrigin.x += upRightDiff.x - plotSize.x;

    if (upRightDiff.y < 0) {
      if (this.isFlipper) {
        this.squareOrigin.y += -this.size.y - TOOLTIP_TRIANGLE_SIZE * 2;
        this.flip();
      } else {
        this.squareOrigin.y += upRightDiff.y;
        this.origin.y += upRightDiff.y;
      }

    } else if (upRightDiff.y > plotSize.y){
      if (this.isFlipper) {
        this.squareOrigin.y += this.size.y + TOOLTIP_TRIANGLE_SIZE * 2;
        this.flip();
      } else {
        this.squareOrigin.y += upRightDiff.y - plotSize.y;
        this.origin.y += upRightDiff.y - plotSize.y;
      }
    }

    if (downLeftDiff.x < 0) this.squareOrigin.x -= downLeftDiff.x
    else if (downLeftDiff.x > plotSize.x) this.squareOrigin.x -= downLeftDiff.x - plotSize.x;

    if (downLeftDiff.y < 0) { // Maybe wrong, did not met the case
      this.squareOrigin.y -= downLeftDiff.y;
      this.origin.y -= downLeftDiff.y;
    } else if (downLeftDiff.y > plotSize.y) {
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
    this.buildPath();
    scaledPath.addPath(this.path, new DOMMatrix().scale(contextMatrix.a, contextMatrix.d));

    context.save();
    context.scale(scaling.x, scaling.y);
    context.lineWidth = this.lineWidth;
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
  public minVertex: Vertex = null;
  public maxVertex: Vertex = null;
  private _previousMin: Vertex;
  private _previousMax: Vertex;
  private _scale: Vertex = new Vertex(1, 1);

  public leftUpdate: boolean = false;
  public rightUpdate: boolean = false;
  public upUpdate: boolean = false;
  public downUpdate: boolean = false;
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public size: Vertex = new Vertex(0, 0)
  ) {
    super(origin, size);
    this.mouseClick = this.origin.copy();
    this._previousMin = this.origin.copy();
    this._previousMax = this.origin.copy();
    this.dashLine = DASH_SELECTION_WINDOW;
    this.selectedStyle = this.clickedStyle = this.hoverStyle = this.fillStyle = "hsla(0, 0%, 100%, 0)";
    this.lineWidth = 0.5
  }

  get isDefined(): boolean { return (this.minVertex != null && this.maxVertex != null) }

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

  public buildRectangle(frameOrigin: Vertex, frameSize: Vertex) {
    this.origin = this.minVertex.copy();
    this.size = this.maxVertex.subtract(this.origin);
    this.insideCanvas(frameOrigin, frameSize);
    this.buildPath();
  }

  private insideCanvas(drawOrigin: Vertex, drawSize: Vertex): void {
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
    } else if (downLeftDiff.x > drawSize.x) {
      this.origin.x -= downLeftDiff.x - drawSize.x;
      this.size.x += downLeftDiff.x - drawSize.x;
    }
    if (downLeftDiff.y < 0) {
      this.origin.y -= downLeftDiff.y;
      this.size.y += downLeftDiff.y;
    } else if (downLeftDiff.y > drawSize.y) {
      this.origin.y -= downLeftDiff.y - drawSize.y;
      this.size.y += downLeftDiff.y - drawSize.y;
    }
  }

  private get borderSizeX() { return Math.min(BORDER_SIZE / Math.abs(this._scale.x), Math.abs(this.size.x) / 3) }

  private get borderSizeY() { return Math.min(BORDER_SIZE / Math.abs(this._scale.y), Math.abs(this.size.y) / 3) }

  private saveState() {
    this._previousMin = this.minVertex.copy();
    this._previousMax = this.maxVertex.copy();
  }

  public updateScale(scaleX: number, scaleY: number): void {
    this._scale.x = scaleX;
    this._scale.y = scaleY;
  }

  public mouseDown(mouseDown: Vertex): void {
    super.mouseDown(mouseDown);
    if (this.isHovered) {
      this.isClicked = true;
      this.saveState();
      this.leftUpdate = Math.abs(this.mouseClick.x - this.minVertex.x) <= this.borderSizeX;
      this.rightUpdate = Math.abs(this.mouseClick.x - (this.maxVertex.x)) <= this.borderSizeX;
      this.downUpdate = Math.abs(this.mouseClick.y - this.minVertex.y) <= this.borderSizeY;
      this.upUpdate = Math.abs(this.mouseClick.y - (this.maxVertex.y)) <= this.borderSizeY;
    }
  }

  mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): boolean {
    const mouseMoveBool = super.mouseMove(context, mouseCoords);
    if (!(this.leftUpdate || this.rightUpdate || this.downUpdate || this.upUpdate) && this.isClicked) {
      const translation = mouseCoords.subtract(this.mouseClick);
      this.minVertex = this._previousMin.add(translation);
      this.maxVertex = this._previousMax.add(translation);
      return false
    }
    if (this.leftUpdate) this.minVertex.x = Math.min(this._previousMax.x, mouseCoords.x);
    if (this.rightUpdate) this.maxVertex.x = Math.max(this._previousMin.x, mouseCoords.x);
    if (this.downUpdate) this.minVertex.y = Math.min(this._previousMax.y, mouseCoords.y);
    if (this.upUpdate) this.maxVertex.y = Math.max(this._previousMin.y, mouseCoords.y);
    if (this.isClicked) {
      if (this.minVertex.x == this._previousMax.x) this.maxVertex.x = mouseCoords.x;
      if (this.maxVertex.x == this._previousMin.x) this.minVertex.x = mouseCoords.x;
      if (this.minVertex.y == this._previousMax.y) this.maxVertex.y = mouseCoords.y;
      if (this.maxVertex.y == this._previousMin.y) this.minVertex.y = mouseCoords.y;
    }
    return mouseMoveBool
  }

  public mouseUp(context: CanvasRenderingContext2D, keepState: boolean) {
    super.mouseUp(context, keepState);
    this.isClicked = this.leftUpdate = this.rightUpdate = this.upUpdate = this.downUpdate = false;
  }
}

export class TitleSettings {
  constructor(
    public origin: Vertex = null,
    public align: string = null,
    public baseline: string = null,
    public orientation: number = null
  ) {}
}

export class newAxis extends newShape{
  public ticksPoints: newPoint2D[];
  public drawPath: Path2D;
  public path: Path2D;
  public lineWidth: number = 1;
  public strokeStyle: string = 'hsl(0, 0%, 0%)';
  public hoverStyle: string = 'hsl(0, 100%, 48%)';
  public clickedStyle: string = 'hsl(126, 67%, 72%)';
  public rubberColor: string = 'hsl(200, 95%, 50%)';//'hsla(127, 95%, 60%, 0.85)';
  public labels: string[];
  public isHovered: boolean = false;
  public isClicked: boolean = false;
  public isInverted: boolean = false;
  public mouseStyleON: boolean = false;
  public rubberBand: RubberBand;
  public title: newText;
  public centeredTitle: boolean = false;
  public titleSettings: TitleSettings = new TitleSettings();
  public font: string = 'sans-serif';

  protected _ticks: number[];
  public tickPrecision: number;
  public ticksFontsize: number = 12;
  protected _isDiscrete: boolean;

  public emitter: EventEmitter = new EventEmitter();
  public minValue: number;
  public maxValue: number;
  public initMinValue: number;
  public initMaxValue: number;
  private _previousMin: number;
  private _previousMax: number;

  private _marginRatio: number = 0.05;
  protected offsetTicks: number;
  protected offsetTitle: number;
  protected maxTickWidth: number;
  protected maxTickHeight: number;

  readonly DRAW_START_OFFSET = 0;
  readonly SELECTION_RECT_SIZE = 10;
  readonly SIZE_END = 7;
  readonly FONT_SIZE = 12;
  readonly isFilled = true;

  // OLD
  public is_drawing_rubberband: boolean = false;

  constructor(
    vector: any[],
    public boundingBox: newRect,
    public origin: Vertex,
    public end: Vertex,
    public name: string = '',
    public initScale: Vertex,
    protected _nTicks: number = 10
    ) {
      super();
      this.isDiscrete = vector === undefined ? true : typeof vector[0] == 'string';
      if (this.isDiscrete) {
        this.labels = vector === undefined ? ["0", "1"] : newAxis.uniqueValues(vector)
      }
      const [minValue, maxValue] = this.computeMinMax(vector);
      [this._previousMin, this._previousMax] = [this.initMinValue, this.initMaxValue] = [this.minValue, this.maxValue] = this.marginedBounds(minValue, maxValue);
      this.ticks = this.computeTicks();
      if (!this.isDiscrete) this.labels = this.numericLabels();
      this.computeEnds();
      this.adjustBoundingBox();
      this.drawPath = this.buildDrawPath();
      this.buildPath();
      this.rubberBand = new RubberBand(this.name, 0, 0, this.isVertical);
      this.offsetTicks = this.ticksFontsize * 0.8;
      this.offsetTitle = 0;
      this.title = new newText(this.titleText, new Vertex(0, 0), {});
    };

  public get drawLength(): number {
    return this.isVertical ? Math.abs(this.origin.y - this.end.y) : Math.abs(this.origin.x - this.end.x);
  }

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

  get tickMarker(): string { return "halfLine"}

  get tickOrientation(): string { return this.isVertical ? 'right' : 'up' }

  set nTicks(value: number) { this._nTicks = value };

  get nTicks(): number {
    if (this.isDiscrete) return this.labels.length + 1
    return this._nTicks
  }

  get ticks(): number[] { return this._ticks }

  set ticks(value: number[]) { this._ticks = value }

  get titleText(): string { return newText.capitalize(this.name) }

  get transformMatrix(): DOMMatrix { return this.getValueToDrawMatrix() };

  private horizontalPickIdx(): number { return Math.sign(1 - Math.sign(this.initScale.y)) }

  private verticalPickIdx(): number { return Math.sign(1 - Math.sign(this.initScale.x)) }

  protected computeEnds(): void {}

  public transform(newOrigin: Vertex, newEnd: Vertex): void {
    this.origin = newOrigin.copy();
    this.end = newEnd.copy();
    this.rubberBand.isVertical = this.isVertical;
    this.drawPath = this.buildDrawPath();
    this.buildPath();
  }

  public resetScale(): void {
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

  public update(axisStyle: Map<string, any>, viewPoint: Vertex, scale: Vertex, translation: Vertex): void {
    axisStyle.forEach((value, key) => this[key] = value);
    this.updateScale(viewPoint, scale, translation);
  }

  public updateStyle(axisStyle: Map<string, any>) { axisStyle.forEach((value, key) => this[key] = value) }

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

  public adjustBoundingBox(): void {
    if (this.isVertical) {
      this.boundingBox.size.x += this.SIZE_END / 2;
      this.boundingBox.size.y += this.SIZE_END;
    }
    else {
      this.boundingBox.size.x += this.SIZE_END;
      this.boundingBox.size.y += this.SIZE_END / 2;
    }
    this.boundingBox.buildPath();
  }

  protected buildDrawPath(): Path2D {
    const verticalIdx = Number(this.isVertical);
    const horizontalIdx = Number(!this.isVertical);
    const path = new Path2D();
    let endArrow: newPoint2D;
    if (this.isInverted) {
      endArrow = new newPoint2D(this.origin.x - this.SIZE_END / 2 * horizontalIdx, this.origin.y - this.SIZE_END / 2 * verticalIdx, this.SIZE_END, 'triangle', ['left', 'down'][verticalIdx]);
    } else {
      endArrow = new newPoint2D(this.end.x + this.SIZE_END / 2 * horizontalIdx, this.end.y + this.SIZE_END / 2 * verticalIdx, this.SIZE_END, 'triangle', ['right', 'up'][verticalIdx]);
    }
    path.moveTo(this.origin.x - this.DRAW_START_OFFSET * horizontalIdx, this.origin.y - this.DRAW_START_OFFSET * verticalIdx);
    path.lineTo(this.end.x, this.end.y);
    path.addPath(endArrow.path);
    return path
  }

  public buildPath(): void {
    this.path = new Path2D();
    const offset = new Vertex(this.SELECTION_RECT_SIZE * Number(this.isVertical), this.SELECTION_RECT_SIZE * Number(!this.isVertical));
    const origin = new Vertex(this.origin.x, this.origin.y).subtract(offset.multiply(2));
    const size = this.end.subtract(origin).add(offset);
    this.path.rect(origin.x, origin.y, size.x, size.y);
  }

  public absoluteToRelative(value: string | number): number {
    const numberedValue = this.stringToValue(value);
    return this.isVertical ? (numberedValue - this.transformMatrix.f) / this.transformMatrix.d : (numberedValue - this.transformMatrix.e) / this.transformMatrix.a
  }

  public relativeToAbsolute(value: string | number): number {
    const numberedValue = this.stringToValue(value);
    return this.isVertical ? numberedValue * this.transformMatrix.d + this.transformMatrix.f : numberedValue * this.transformMatrix.a + this.transformMatrix.e
  }

  public normedValue(value: number): number { return value / this.interval }

  private computeMinMax(vector: any[]): number[] {
    if (!vector?.length) return [0, 1];
    if (this.isDiscrete) return [0, this.labels.length - 1];
    const min = Math.min(...vector);
    const max = Math.max(...vector);
    return min != max ? [min ,max] : [min * 0.7, max * 1.3]
  }

  protected getCalibratedTextWidth(context: CanvasRenderingContext2D): [newText, number] {
    const calibratedTickText = new newText("88.88e+88", new Vertex(0, 0), { fontsize: this.FONT_SIZE, font: this.font });
    context.font = calibratedTickText.fullFont;
    const calibratedMeasure = context.measureText(calibratedTickText.text).width;
    return [calibratedTickText, calibratedMeasure]
  }

  public computeTextBoxes(context: CanvasRenderingContext2D): void {
    context.save();
    const [calibratedTickText, calibratedMeasure] = this.getCalibratedTextWidth(context);
    this.maxTickWidth = Math.min(this.boundingBox.size.x - this.offsetTicks - 3 - this.SIZE_END / 2, calibratedMeasure);
    this.maxTickHeight = Math.min(this.boundingBox.size.y - this.offsetTicks - 3 - this.SIZE_END / 2, calibratedTickText.fontsize);
    if (this.centeredTitle) this.centeredTitleTextBoxes(calibratedMeasure);
    context.restore();
  }

  private centeredTitleTextBoxes(calibratedMeasure: number): void {
    let freeSpace: number;
    if (this.isVertical) {
      freeSpace = this.boundingBox.size.x - this.FONT_SIZE - 0.3 * this.maxTickWidth;
      this.offsetTitle = Math.min(freeSpace, calibratedMeasure);
      this.maxTickHeight -= this.offsetTitle;
    } else {
      freeSpace = this.boundingBox.size.y - this.FONT_SIZE - 0.3 * this.maxTickHeight;
      this.offsetTitle = Math.min(freeSpace, this.FONT_SIZE * 1.5 + this.offsetTicks);
      this.maxTickWidth -= this.offsetTitle;
    }
  }

  protected computeTicks(): number[] {
    const increment = this.isDiscrete ? 1 : newAxis.nearestFive((this.maxValue - this.minValue) / this.nTicks);
    const remainder = this.minValue % increment;
    let ticks = [this.minValue - remainder];
    while (ticks.slice(-1)[0] <= this.maxValue) ticks.push(ticks.slice(-1)[0] + increment);
    if (ticks.slice(0)[0] < this.minValue) ticks.splice(0, 1);
    if (ticks.slice(-1)[0] >= this.maxValue) ticks.splice(-1, 1);
    return ticks
  }

  public draw(context: CanvasRenderingContext2D): void {
    context.save();
    this.drawPath = this.buildDrawPath();
    this.buildPath();
    const canvasHTMatrix = context.getTransform();
    const pointHTMatrix = canvasHTMatrix.multiply(this.transformMatrix);
    const color = this.drawingColor;

    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = this.lineWidth;
    context.stroke(this.drawPath);
    context.fill(this.drawPath);

    context.resetTransform();
    this.computeTextBoxes(context);

    context.setTransform(pointHTMatrix);
    const [ticksPoints, ticksTexts] = this.drawTicksPoints(context, pointHTMatrix, color);
    this.ticksPoints = ticksPoints;

    context.resetTransform();
    this.drawTickTexts(ticksTexts, color, context);
    this.drawTitle(context, canvasHTMatrix, color);

    context.setTransform(canvasHTMatrix);
    this.drawRubberBand(context);
    context.restore();
  }

  protected getTitleTextParams(color: string, align: string, baseline: string, orientation: number): TextParams {
    return {
      width: this.drawLength,
      fontsize: this.FONT_SIZE,
      font: this.font,
      align: align,
      color: color,
      baseline: baseline,
      style: 'bold',
      orientation: orientation,
      backgroundColor: "hsla(0, 0%, 100%, 0.5)"
    }
  }

  protected formatTitle(text: newText, context: CanvasRenderingContext2D): void { text.format(context) }

  protected updateTitle(context: CanvasRenderingContext2D, text: string, origin: Vertex, textParams: TextParams): void {
    this.title.text = text;
    this.title.origin = origin;
    this.title.updateParameters(textParams);
    this.title.boundingBox.buildPath();
    this.title.boundingBox.hoverStyle = this.title.boundingBox.clickedStyle = this.title.boundingBox.selectedStyle = this.title.boundingBox.fillStyle;
  }

  protected drawTitle(context: CanvasRenderingContext2D, canvasHTMatrix: DOMMatrix, color: string): void {
    this.setTitleSettings();
    const textParams = this.getTitleTextParams(color, this.titleSettings.align, this.titleSettings.baseline, this.titleSettings.orientation);
    this.updateTitle(context, this.titleText, this.titleSettings.origin.transform(canvasHTMatrix), textParams);
    this.title.draw(context);
    this.path.addPath(this.title.path, new DOMMatrix([this.initScale.x, 0, 0, this.initScale.y, 0, 0]));
  }

  public setTitleSettings(): void { this.centeredTitle ? this.centeredTitleProperties() : this.topArrowTitleProperties() }

  private centeredTitleProperties(): void {
    this.titleSettings.origin = this.end.add(this.origin).divide(2);
    this.titleSettings.align = "center";
    this.titleSettings.baseline = ['bottom', 'top'][this.horizontalPickIdx()];
    if (this.isVertical) {
      this.titleSettings.origin.x -= this.offsetTitle;
      this.titleSettings.baseline = ['bottom', 'top'][this.verticalPickIdx()];
    } else this.titleSettings.origin.y -= this.offsetTitle;
    this.titleSettings.orientation = this.isVertical ? -90 : 0;
  }

  private topArrowTitleProperties(): void {
    this.titleSettings.origin = this.end.copy();
    if (this.isVertical) {
      this.titleSettings.origin.x += this.FONT_SIZE;
      this.titleSettings.align = ["start", "end"][this.verticalPickIdx()];
    }
    else {
      this.titleSettings.origin.y += this.FONT_SIZE;
      this.titleSettings.align = ["end", "start"][this.verticalPickIdx()];
    }
    this.titleSettings.baseline = "middle";
    this.titleSettings.orientation = 0;
  }

  private drawTicksPoints(context: CanvasRenderingContext2D, pointHTMatrix: DOMMatrix, color: string): [newPoint2D[], newText[]] {
    const ticksPoints = [];
    const ticksText: newText[] = [];
    const tickTextParams = this.computeTickTextParams();
    let count = Math.max(0, this.ticks[0]);
    while (this.labels[count] == '') count++;
    this.ticks.forEach((tick, idx) => {
      let point = this.drawTickPoint(context, tick, this.isVertical, pointHTMatrix, color);
      let text = this.labels[idx];
      ticksPoints.push(point);
      if (this.isDiscrete) {
        if (count == tick && this.labels[count]) {
          text = this.labels[count];
          count++;
        }
        else text = '';
      }
      ticksText.push(this.computeTickText(context, text, tickTextParams, point, pointHTMatrix));
    })
    return [ticksPoints, ticksText]
  }

  private drawTickTexts(ticksTexts: newText[], color: string, context: CanvasRenderingContext2D): void {
    this.ticksFontsize = Math.min(...ticksTexts.map(tickText => tickText.fontsize));
    ticksTexts.forEach(tickText => this.drawTickText(tickText, color, context));
  }

  private drawTickText(tickText: newText, color: string, context: CanvasRenderingContext2D): void {
    tickText.fillStyle = color;
    tickText.fontsize = this.ticksFontsize;
    tickText.draw(context);
  }

  private computeTickTextParams(): TextParams {
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
      align: textAlign, baseline: baseline, color: this.strokeStyle, backgroundColor: "hsl(0, 0%, 100%, 0.5)"
    }
  }

  protected drawTickPoint(context: CanvasRenderingContext2D, tick: number, vertical: boolean, HTMatrix: DOMMatrix, color: string): newPoint2D {
    const point = new newPoint2D(tick * Number(!vertical), tick * Number(vertical), this.SIZE_END / Math.abs(HTMatrix.a), this.tickMarker, this.tickOrientation, color);
    point.draw(context);
    return point
  }

  private computeTickText(context: CanvasRenderingContext2D, text: string, tickTextParams: TextParams, point: newPoint2D, HTMatrix: DOMMatrix): newText {
    const textOrigin = this.tickTextPositions(point, HTMatrix);
    const tickText = new newText(newText.capitalize(text), textOrigin, tickTextParams);
    tickText.removeEndZeros();
    tickText.format(context);
    return tickText
  }

  private getValueToDrawMatrix(): DOMMatrix {
    const scale = this.drawLength / this.interval;
    if (this.isInverted) {
      return new DOMMatrix([
        -scale, 0, 0, -scale,
        this.end.x + this.minValue * Number(!this.isVertical) * scale,
        this.end.y + this.minValue * Number(this.isVertical) * scale
      ]);
    }
    return new DOMMatrix([
      scale, 0, 0, scale,
      this.origin.x - this.minValue * Number(!this.isVertical) * scale,
      this.origin.y - this.minValue * Number(this.isVertical) * scale
    ]);
  }

  private marginedBounds(minValue: number, maxValue: number): [number, number] {
    const valueRange = Math.abs(maxValue - minValue);
    if (this.isDiscrete) return [minValue - 1, maxValue + 1]
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
    this.rubberBand.draw(this.isVertical ? this.origin.x : this.origin.y, context, this.rubberColor, this.rubberColor, 0.1, 0.5);
    if (this.rubberBand.isClicked) this.emitter.emit("rubberBandChange", this.rubberBand);
  }

  protected mouseTranslate(mouseDown: Vertex, mouseCoords: Vertex): void {}

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): boolean {
    super.mouseMove(context, mouseCoords);
    this.boundingBox.mouseMove(context, mouseCoords);
    this.title.mouseMove(context, mouseCoords.scale(this.initScale));
    if (this.mouseClick) {
      if (this.isClicked && !this.title.isClicked) this.mouseMoveClickedArrow(mouseCoords)
      else if (this.title.isClicked) this.mouseMoveClickedTitle(mouseCoords);
    }
    return false
  }

  public mouseMoveClickedArrow(mouseCoords: Vertex): void {
    const downValue = this.absoluteToRelative(this.isVertical ? this.mouseClick.y : this.mouseClick.x);
    const currentValue = this.absoluteToRelative(this.isVertical ? mouseCoords.y : mouseCoords.x);
    if (!this.rubberBand.isClicked) {
      this.rubberBand.minValue = Math.min(downValue, currentValue);
      this.rubberBand.maxValue = Math.max(downValue, currentValue);
    } else this.rubberBand.mouseMove(downValue, currentValue);
    this.emitter.emit("rubberBandChange", this.rubberBand);
  }

  public mouseMoveClickedTitle(mouseCoords: Vertex): void {}

  public mouseDown(mouseDown: Vertex): void {
    super.mouseDown(mouseDown);
    if (this.isHovered) {
      this.isClicked = true;
      if (this.title.isHovered) this.clickOnTitle(mouseDown)
      else {
        this.is_drawing_rubberband = true; // OLD
        const mouseUniCoord = this.isVertical ? mouseDown.y : mouseDown.x;
        if (!this.isInRubberBand(this.absoluteToRelative(mouseUniCoord))) this.rubberBand.reset()
        else this.rubberBand.mouseDown(mouseUniCoord);
        this.emitter.emit("rubberBandChange", this.rubberBand);
      }
    }
    if (this.boundingBox.isHovered) this.boundingBox.isClicked = true;
    this.saveLocation();
  }

  public mouseUp(context: CanvasRenderingContext2D, keepState: boolean): void {
    super.mouseUp(context, keepState);
    this.isClicked = false;
    this.boundingBox.isClicked = false;
    this.title.mouseUp(context, false);
    this.title.isClicked = false;
    this.rubberBand.mouseUp();
    if (this.is_drawing_rubberband) this.emitter.emit("rubberBandChange", this.rubberBand);
    this.is_drawing_rubberband = false;
  }

  protected isInTitleBox(context, coords: Vertex): boolean {
    return this.title.boundingBox.isPointInShape(context, coords)
  }

  protected clickOnTitle(mouseDown: Vertex): void { this.title.mouseDown(mouseDown); this.title.isClicked = true }

  public isInRubberBand(value: number): boolean {
    return (value >= this.rubberBand.minValue && value <= this.rubberBand.maxValue)
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

  protected textAlignments(): [string, string] {
    const forVertical = this.initScale.x > 0 ? 'end' : 'start';
    const forHorizontal = this.initScale.y > 0 ? 'bottom' : 'top';
    return this.isVertical ? [forVertical, 'middle'] : ['center', forHorizontal]
  }

  private tickTextPositions(point: newPoint2D, HTMatrix: DOMMatrix): Vertex {
    const origin = point.center.transform(HTMatrix);
    const inversionFactor = this.isInverted ? 1 : -1
    if (this.isVertical) origin.x += inversionFactor * Math.sign(HTMatrix.a) * this.offsetTicks
    else origin.y += inversionFactor * Math.sign(HTMatrix.d) * this.offsetTicks;
    return origin
  }

  public updateScale(viewPoint: Vertex, scaling: Vertex, translation: Vertex): void {
    const HTMatrix = this.transformMatrix;
    let center = (viewPoint.x - HTMatrix.e) / HTMatrix.a;
    let offset = translation.x;
    let scale = scaling.x;
    if (this.isVertical) {
      center = (viewPoint.y - HTMatrix.f) / HTMatrix.d;
      offset = translation.y;
      scale = scaling.y;
    }
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
    if (!this.isDiscrete) this.labels = this.numericLabels();
  }
}


export class ParallelAxis extends newAxis {
  public titleZone: newRect = new newRect();
  public hasMoved: boolean = false;
  private _previousOrigin: Vertex;
  private _previousEnd: Vertex;

  constructor(
    vector: any[],
    public boundingBox: newRect,
    public origin: Vertex,
    public end: Vertex,
    public name: string = '',
    public initScale: Vertex,
    protected _nTicks: number = 10
    ) {
      super(vector, boundingBox, origin, end, name, initScale, _nTicks);
      this.centeredTitle = false;
      this.updateEnds();
    }

  get tickMarker(): string { return "line" }

  get tickOrientation(): string { return this.isVertical ? "horizontal" : "vertical" }

  public resetScale(): void {
    this.isInverted = false;
    super.resetScale();
  }

  public setTitleSettings(): void {
    this.isVertical ? this.verticalTitleProperties() : this.horizontalTitleProperties()
  }

  private horizontalTitleProperties(): void {
    if (this.initScale.y > 0) this.titleSettings.origin.y = this.titleZone.origin.y + this.titleZone.size.y;
    this.titleSettings.baseline = this.initScale.y > 0 ? "bottom" : "top";
    this.titleSettings.orientation = 0;
  }

  private verticalTitleProperties(): void {
    if (this.initScale.y > 0) this.titleSettings.origin.y = this.titleZone.origin.y + this.titleZone.size.y;
    this.titleSettings.baseline = this.initScale.y > 0 ? "top" : "bottom";
    this.titleSettings.orientation = 0;
  }

  public computeTitle(index: number, nAxis: number): ParallelAxis {
    this.titleZone = new newRect(this.boundingBox.origin.copy(), this.boundingBox.size.copy());
    const SIZE_FACTOR = 0.35;
    let offset = 0;
    if (this.isVertical) {
      offset = this.drawLength + this.SIZE_END * 2;
      this.titleZone.origin.y += offset;
    } else {
      offset = this.SIZE_END + this.offsetTicks + this.FONT_SIZE;
      this.titleZone.size.x *= SIZE_FACTOR;
    }
    this.titleZone.size.y -= offset;
    this.titleZone.buildPath();
    this.titleSettings.origin = this.titleZone.origin.copy();
    this.titleSettings.align = this.initScale.x > 0 ? "left" : "right";

    if (index != 0) {
      if (this.isVertical) {
        this.titleSettings.align = index == nAxis - 1 ? (this.initScale.x > 0 ? "right" : "left") : "center";
        this.titleSettings.origin.x += (index == nAxis - 1 ? 1 : 0.5) * this.boundingBox.size.x ;
      }
    }
    return this
  }

  protected getTitleTextParams(color: string, align: string, baseline: string, orientation: number): TextParams {
    const titleTextParams = super.getTitleTextParams(color, align, baseline, orientation);
    titleTextParams.multiLine = true;
    titleTextParams.width = this.titleZone.size.x;
    titleTextParams.height = this.titleZone.size.y;
    return titleTextParams
  }

  protected computeEnds(): void {
    super.computeEnds();
    if (this.isVertical) {
      this.end.y -= this.drawLength * 0.1;
      this.boundingBox.size.x -= this.SIZE_END / 2;
    }
    else this.boundingBox.size.y -= this.SIZE_END / 2;
  }

  public mouseMoveClickedTitle(mouseCoords: Vertex): void {
    const translation = mouseCoords.subtract(this.mouseClick);
    this.translate(this._previousOrigin.add(translation), this._previousEnd.add(translation));
    if (translation.norm > 10) this.hasMoved = true;
    this.emitter.emit("changeAxisState", this);
  }

  public mouseUp(context: CanvasRenderingContext2D, keepState: boolean): void {
    if (this.title.isClicked && this.title.isHovered && !this.hasMoved) {
      this.title.isClicked = false;
      this.flip();
      this.emitter.emit("changeAxisState", this);
    }
    if (this.hasMoved) {
      this.updateEnds();
      this.emitter.emit("changeAxisState", this);
    } 
    this.hasMoved = false;
    super.mouseUp(context, keepState);
  }

  private updateEnds(): void {
    this._previousOrigin = this.origin.copy();
    this._previousEnd = this.end.copy();
  }

  protected flip(): void { this.isInverted = !this.isInverted; this.emitter.emit("changeAxisState", this) }

  public updateLocation(newOrigin: Vertex, newEnd: Vertex, boundingBox: newRect, index: number, nAxis: number): void {
    this.boundingBox = boundingBox;
    this.transform(newOrigin, newEnd);
    this.computeEnds();
    this.adjustBoundingBox();
    this.updateEnds();
    this.drawPath = this.buildDrawPath();
    this.buildPath();
    this.computeTitle(index, nAxis);
  }

  public translate(newOrigin: Vertex, newEnd: Vertex): void {
    const translation = newOrigin.subtract(this.origin);
    this.boundingBox.translate(translation);
    this.titleSettings.origin = this.titleSettings.origin.add(translation);
    this.titleZone.origin = this.titleZone.origin.add(translation);
    this.transform(newOrigin, newEnd);
  }

  protected updateTitle(context: CanvasRenderingContext2D, text: string, origin: Vertex, textParams: TextParams): void {
    super.updateTitle(context, text, origin, textParams);
    const writtenText = this.title.format(context);
    if (this.isVertical && writtenText.length == 1) {
      this.titleSettings.align = "center";
      this.titleSettings.origin.x = this.origin.x * this.initScale.x;
      this.title.origin.x = this.titleSettings.origin.x;
      this.title.align = "center";
    }
  }

  public computeTextBoxes(context: CanvasRenderingContext2D): void {
    context.save();
    const [calibratedTickText, calibratedMeasure] = this.getCalibratedTextWidth(context);
    this.maxTickWidth = this.origin.x - this.boundingBox.origin.x - this.offsetTicks - 3; //Math.min(this.boundingBox.size.x - this.offsetTicks - 3 - this.SIZE_END / 2, calibratedMeasure);
    this.maxTickHeight = Math.min(this.boundingBox.size.y - this.offsetTicks - 3 - this.SIZE_END / 2, calibratedTickText.fontsize);
    context.restore();
  }
}

export class ShapeCollection {
  constructor(
    public drawings: newShape[] = [],
    public frame: DOMMatrix = new DOMMatrix()
  ) {}

  public drawTooltips(canvasOrigin: Vertex, canvasSize: Vertex, context: CanvasRenderingContext2D, inMultiPlot: boolean): void {
    this.drawings.forEach(drawing => { if (!inMultiPlot && drawing.inFrame) drawing.drawTooltip(canvasOrigin, canvasSize, context) });
  }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): boolean {
    let inTranslation = false;
    this.drawings.forEach(drawing => inTranslation = inTranslation || drawing.mouseMove(context, mouseCoords));
    return inTranslation
  }

  public mouseDown(mouseCoords: Vertex): any {
    let clickedObject: any = null;
    this.drawings.forEach(drawing => {
      drawing.mouseDown(mouseCoords);
      if (drawing.isHovered) clickedObject = drawing;
    });
    return clickedObject
  }

  public mouseUp(context: CanvasRenderingContext2D, keepState: boolean): void {
    this.drawings.forEach(drawing => drawing.mouseUp(context, keepState));
  }

  public draw(context: CanvasRenderingContext2D): void { this.drawings.forEach(drawing => drawing.draw(context)) }
}

export class GroupCollection extends ShapeCollection {
  constructor(
    public drawings: any[] = [],
    public frame: DOMMatrix = new DOMMatrix()
  ) {
    super(drawings, frame);
  }

  public drawingIsContainer(drawing: any): boolean { return drawing.values?.length > 1 || drawing instanceof LineSequence }

  public drawTooltips(canvasOrigin: Vertex, canvasSize: Vertex, context: CanvasRenderingContext2D, inMultiPlot: boolean): void {
    this.drawings.forEach(drawing => { if ((this.drawingIsContainer(drawing) || !inMultiPlot) && drawing.inFrame) drawing.drawTooltip(canvasOrigin, canvasSize, context) });
  }

  public updateSampleStates(stateName: string): number[] {
    const newSampleStates = [];
    this.drawings.forEach((drawing, index) => {
      if (drawing.values) {
        if (drawing[stateName]) drawing.values.forEach(sample => newSampleStates.push(sample));
      } else {
        if (drawing[stateName] && !(drawing instanceof SelectionBox)) newSampleStates.push(index);
      }
    });
    return newSampleStates
  }
}
