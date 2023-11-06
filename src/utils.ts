import { HatchingSet } from "./style";
import { hslToArray, colorHsl } from "./color_conversion";
import { Shape } from "./toolbox";
import { EventEmitter } from "events";

// All the following rows are purely removed.
// export class Axis {
//   color_stroke:any;
//   x_step:number;
//   y_step:number;

//   constructor(public nb_points_x:number=10,
//               public nb_points_y:number=10,
//               public graduation_style:TextStyle,
//               public axis_style:EdgeStyle,
//               public arrow_on:boolean=false,
//               public grid_on:boolean=true,
//               public type_:string='axis',
//               public name='') {
//   }

//   public static deserialize(serialized) {
//     let default_axis_style = {line_width:0.5, color_stroke:string_to_rgb('grey'), dashline:[], name:''};
//     let default_graduation_style = {text_color:string_to_rgb('grey'), font_size:12, font_style:'sans-serif', name:''};
//     let default_dict_ = {nb_points_x:10, nb_points_y:10, graduation_style:default_graduation_style, 
//                         axis_style:default_axis_style, arrow_on:false, grid_on:true, name:''};
//     serialized = set_default_values(serialized, default_dict_);
//     var graduation_style = TextStyle.deserialize(serialized['graduation_style']);
//     var axis_style = EdgeStyle.deserialize(serialized['axis_style']);
//     return new Axis(serialized['nb_points_x'],
//                     serialized['nb_points_y'],
//                     graduation_style,
//                     axis_style,
//                     serialized['arrow_on'],
//                     serialized['grid_on'],
//                     serialized['type_'],
//                     serialized['name']);
//   }


//   draw_horizontal_graduations(context, mvx, scaleX, axis_x_start, axis_y_start, axis_y_end, x_step, font_size, X, canvas_width) {
//     var i=0;
//     context.textAlign = 'center';
//     var x_nb_digits = Math.max(0, 1-Math.floor(Math.log10(x_step)));
//     var grad_beg_x = Math.floor(1/this.x_step * ((axis_x_start - mvx - X)/scaleX)) * this.x_step;
//     var grad_end_x = Math.ceil(1/this.x_step * ((canvas_width - mvx)/scaleX)) * this.x_step;

//     while(grad_beg_x + i*x_step < grad_end_x) {
//       if (this.grid_on === true) {
//         context.strokeStyle = 'lightgrey';
//         Shape.drawLine(context, [[scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_start], [scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end + 3]]);
//       } else {
//         Shape.drawLine(context, [[scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end - 3], [scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end + 3]]);
//       }
//       context.fillText(MyMath.round(grad_beg_x + i*x_step, x_nb_digits), scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end + font_size);
//       i++
//     }
//     context.stroke();
//   }

//   draw_vertical_graduations(context, mvy, scaleY, axis_x_start, axis_x_end, axis_y_end, y_step, Y) {
//     var i=0;
//     var grad_beg_y = Math.ceil(-1/this.y_step*((axis_y_end - mvy - Y)/scaleY)) * this.y_step;
//     var grad_end_y = Math.floor(mvy/(this.y_step * scaleY)) * this.y_step;
//     context.textAlign = 'end';
//     context.textBaseline = 'middle';
//     var y_nb_digits = Math.max(0, 1-Math.floor(Math.log10(y_step)));
//     while (grad_beg_y + (i-1)*y_step < grad_end_y) {
//         if (this.grid_on === true) {
//           context.strokeStyle = 'lightgrey';
//           Shape.drawLine(context, [[axis_x_start - 3, -scaleY*(grad_beg_y + i*y_step) + mvy + Y], [axis_x_end, -scaleY*(grad_beg_y + i*y_step) + mvy + Y]]);
//         } else {
//           Shape.drawLine(context, [[axis_x_start - 3, -scaleY*(grad_beg_y + i*y_step) + mvy + Y], [axis_x_start + 3, -scaleY*(grad_beg_y + i*y_step) + mvy + Y]]);
//         }
//         context.fillText(MyMath.round(grad_beg_y + i*y_step, y_nb_digits), axis_x_start - 5, -scaleY*(grad_beg_y + i*y_step) + mvy + Y);
//       i++;
//     }

//     context.stroke();
//   }

//   draw_horizontal_log_graduations(context, mvx, scaleX, minX, maxX, axis_y_start, axis_y_end, font_size, X, canvas_width) {
//     context.textAlign = 'center';
//     let delta = scaleX;
//     let numbers = [1];
//     if (delta >= canvas_width/3 && delta <= canvas_width/2) {
//       numbers = [1, 5];
//     } else if (delta > canvas_width/2 && delta <= 3/4*canvas_width) {
//       numbers = [1, 2, 5];
//     } else if (delta > 3/4*canvas_width) {
//       numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
//     }
//     let start_pow = Math.floor(minX);
//     let end_pow = Math.ceil(maxX);
//     for (let power=start_pow; power <= end_pow; power++) {
//       for (let num of numbers) {
//         let x_coord = num * Math.pow(10, power);
//         if (this.grid_on === true) {
//           context.strokeStyle = 'lightgrey';
//           Shape.drawLine(context, [[scaleX * Math.log10(x_coord) + mvx + X, axis_y_start], [scaleX * Math.log10(x_coord) + mvx + X, axis_y_end + 3]]);
//         } else {
//           Shape.drawLine(context, [[scaleX * Math.log10(x_coord) + mvx + X, axis_y_end - 3], [scaleX*Math.log10(x_coord) + mvx + X, axis_y_end + 3]]);
//         }
//         context.fillText(x_coord, scaleX*Math.log10(x_coord) + mvx + X, axis_y_end + font_size);
//       }
//     } 
//     context.stroke();
//   }


//   draw_vertical_log_graduations(context, mvy, scaleY, minY, maxY, axis_x_start, axis_x_end, axis_y_end, canvas_height, Y) {
//     context.textAlign = 'end';
//     context.textBaseline = 'middle';

//     let delta = scaleY;
//     let numbers = [1];
//     if (delta >= canvas_height/3 && delta <= canvas_height/2) {
//       numbers = [1, 5];
//     } else if (delta > canvas_height/2 && delta <= 3/4*canvas_height) {
//       numbers = [1, 2, 5];
//     } else if (delta > 3/4*canvas_height) {
//       numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
//     }

//     let start_pow = Math.floor(-minY);
//     let end_pow = Math.ceil(-maxY);

//     for (let power=start_pow; power<=end_pow; power++) {
//       for (let num of numbers) {
//         let y_coord = num * Math.pow(10, power);
//         if (this.grid_on === true) {
//           context.strokeStyle = 'lightgrey';
//           Shape.drawLine(context, [[axis_x_start - 3, -scaleY * Math.log10(y_coord) + mvy + Y], [axis_x_end, -scaleY* Math.log10(y_coord) + mvy + Y]]);
//         } else {
//           Shape.drawLine(context, [[axis_x_start - 3, -scaleY * Math.log10(y_coord) + mvy + Y], [axis_x_start + 3, -scaleY * Math.log10(y_coord) + mvy + Y]]);
//         }
//         context.fillText(y_coord, axis_x_start - 5, -scaleY * Math.log10(y_coord) + mvy + Y);
//       }
//     }
//     context.stroke();
//   }


//   draw_histogram_vertical_graduations(context, height, decalage_axis_y, max_frequency, axis_x_start, y_step, Y, coeff=0.88) {
//     let scale = (coeff*height - decalage_axis_y) / max_frequency;
//     let grad_beg_y = height - decalage_axis_y;
//     let i = 0;
//     context.textAlign = 'end';
//     context.textBaseline = 'middle';
//     while (i * y_step < max_frequency + y_step) {
//       Shape.drawLine(context, [[axis_x_start - 3, grad_beg_y - scale * (i * y_step) + Y], 
//                      [axis_x_start + 3, grad_beg_y - scale * (i * y_step) + Y]]);
//       context.fillText(i * y_step, axis_x_start - 5, grad_beg_y - scale * (i * y_step) + Y);
//       i++;
//     }
//     context.stroke();
//   }


//   draw_horizontal_axis(context, mvx, scaleX, width, height, init_scaleX, minX, maxX, scroll_x, 
//     decalage_axis_x, decalage_axis_y, X, Y, to_disp_attribute_name, log_scale_x, x_step?) {
//     context.beginPath();
//     context.strokeStyle = this.axis_style.color_stroke;
//     context.lineWidth = this.axis_style.line_width;
//     var axis_x_start = decalage_axis_x + X;
//     var axis_x_end = width + X;
//     var axis_y_start = Y;
//     var axis_y_end = height - decalage_axis_y + Y;
//     //Arrow
//     if (this.arrow_on) {
//       Shape.drawLine(context, [[axis_x_end - 20, axis_y_end - 10], [axis_x_end, axis_y_end]]);
//       Shape.drawLine(context, [[axis_x_end, axis_y_end], [axis_x_end - 20, axis_y_end + 10]]);
//     }
//     //Axis
//     Shape.drawLine(context, [[axis_x_start, axis_y_end], [axis_x_end, axis_y_end]]);
//     //Graduations
//     if (scroll_x % 5 == 0) {
//       let kx = 1.1*scaleX/init_scaleX;
//       let num = Math.max(maxX - minX, 1);
//       this.x_step = x_step || Math.min(num/(kx*(this.nb_points_x-1)), width/(scaleX*(this.nb_points_x - 1)));
//     }
//     context.font = 'bold 20px Arial';
//     context.textAlign = 'end';
//     context.fillStyle = this.graduation_style.text_color;
//     context.fillText(to_disp_attribute_name, axis_x_end - 5, axis_y_end - 10);
//     // draw_horizontal_graduations
//     context.font = this.graduation_style.font_size.toString() + 'px Arial';
//     if (log_scale_x) {
//       this.draw_horizontal_log_graduations(context, mvx, scaleX, minX, maxX, axis_y_start, axis_y_end, 
//         this.graduation_style.font_size, X, width);
//     } else {
//       this.draw_horizontal_graduations(context, mvx, scaleX, axis_x_start, axis_y_start, axis_y_end, 
//         this.x_step, this.graduation_style.font_size, X, width);
//     }
//     context.closePath();
//   }


//   draw_vertical_axis(context, mvy, scaleY, width, height, init_scaleY, minY, maxY, 
//     scroll_y, decalage_axis_x, decalage_axis_y, X, Y, to_disp_attribute_name, log_scale_y, y_step?) {
//     context.beginPath();
//     context.strokeStyle = this.axis_style.color_stroke;
//     context.lineWidth = this.axis_style.line_width;
//     var axis_x_start = decalage_axis_x + X;
//     var axis_x_end = width + X;
//     var axis_y_start = Y;
//     var axis_y_end = height - decalage_axis_y + Y;
//     //Arrows
//     if (this.arrow_on === true) {
//       Shape.drawLine(context, [[axis_x_start - 10, axis_y_start + 20], [axis_x_start, axis_y_start]]);
//       Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start + 10, axis_y_start + 20]]);
//     }
//     //Axis
//     Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start, axis_y_end]]);
//     // Graduations
//     if (scroll_y % 5 == 0) {
//       let ky = 1.1*scaleY/init_scaleY;
//       let num = Math.max(maxY - minY, 1);
//       this.y_step = y_step || Math.min(num/(ky*(this.nb_points_y-1)), height/(scaleY*(this.nb_points_y - 1)));
//     }
//     context.font = 'bold 20px Arial';
//     context.textAlign = 'start';
//     context.fillStyle = this.graduation_style.text_color;
//     context.fillText(to_disp_attribute_name, axis_x_start + 5, axis_y_start + 20);
//     context.font = this.graduation_style.font_size.toString() + 'px Arial';
//     if (log_scale_y) {
//       this.draw_vertical_log_graduations(context, mvy, scaleY, minY, maxY, axis_x_start, axis_x_end, axis_y_end, height, Y)
//     } else {
//       this.draw_vertical_graduations(context, mvy, scaleY, axis_x_start, axis_x_end, axis_y_end, this.y_step, Y);
//     }
//     context.closePath();
//   }


//   draw_histogram_x_axis(context, scaleX, init_scaleX, mvx, width, height, graduations, decalage_axis_x, 
//                         decalage_axis_y, scroll_x, X, Y, to_disp_attribute_name, x_step?) {
//     context.beginPath();
//     context.strokeStyle = this.axis_style.color_stroke;
//     context.lineWidth = this.axis_style.line_width;
//     var axis_x_start = decalage_axis_x + X;
//     var axis_x_end = width + X;
//     var axis_y_start = Y;
//     var axis_y_end = height - decalage_axis_y + Y;
//     //Arrow
//     if (this.arrow_on) {
//       Shape.drawLine(context, [[axis_x_end - 20, axis_y_end - 10], [axis_x_end, axis_y_end]]);
//       Shape.drawLine(context, [[axis_x_end, axis_y_end], [axis_x_end - 20, axis_y_end + 10]]);
//     }
//     //Axis
//     Shape.drawLine(context, [[axis_x_start, axis_y_end], [axis_x_end, axis_y_end]]);

//     //Graduations
//     context.font = 'bold 20px Arial';
//     context.textAlign = 'end';
//     context.fillStyle = this.graduation_style.text_color;
//     context.fillText(to_disp_attribute_name, axis_x_end - 5, axis_y_end - 10);

//     // draw_horizontal_graduations
//     context.font = this.graduation_style.font_size.toString() + 'px Arial';
//     var i=0;
//     context.textAlign = 'center';
//     var grad_beg_x = decalage_axis_x/scaleX + 1/4;
//     while(i < graduations.length) {
//       if (this.grid_on === true) {
//         context.strokeStyle = 'lightgrey';
//         Shape.drawLine(context, [[scaleX*(grad_beg_x + i) + mvx + X, axis_y_start], [scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end + 3]]);
//       } else {
//         Shape.drawLine(context, [[scaleX*(grad_beg_x + i) + mvx + X, axis_y_end - 3], [scaleX*(grad_beg_x + i*x_step) + mvx + X, axis_y_end + 3]]);
//       }
//       context.fillText(graduations[i], scaleX*(grad_beg_x + i) + mvx + X, axis_y_end + this.graduation_style.font_size);
//       i++;
//     }
//     context.stroke();
//     context.closePath();
//   }


//   draw_histogram_y_axis(context, width, height, max_frequency, decalage_axis_x, 
//                         decalage_axis_y, X, Y, to_disp_attribute_name, y_step, coeff?) {
//     context.beginPath();
//     context.strokeStyle = this.axis_style.color_stroke;
//     context.lineWidth = this.axis_style.line_width;
//     var axis_x_start = decalage_axis_x + X;
//     var axis_x_end = width + X;
//     var axis_y_start = Y;
//     var axis_y_end = height - decalage_axis_y + Y;
//     //Arrows
//     if (this.arrow_on === true) {
//       Shape.drawLine(context, [[axis_x_start - 10, axis_y_start + 20], [axis_x_start, axis_y_start]]);
//       Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start + 10, axis_y_start + 20]]);
//     }
//     //Axis
//     Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start, axis_y_end]]);
//     // context.stroke();
//     // Graduations
//     this.y_step = y_step;
//     context.font = 'bold 20px Arial';
//     context.textAlign = 'start';
//     context.fillStyle = this.graduation_style.text_color;
//     context.fillText(to_disp_attribute_name, axis_x_start + 5, axis_y_start + 20);

//     //draw vertical graduations
//     context.font = this.graduation_style.font_size.toString() + 'px Arial';
//     this.draw_histogram_vertical_graduations(context, height, decalage_axis_y, max_frequency, axis_x_start, y_step, Y, coeff);
//     context.closePath();
//   }

//   draw_scatter_axis(context, mvx, mvy, scaleX, scaleY, width, height, init_scaleX, init_scaleY, lists, 
//     to_display_attributes, scroll_x, scroll_y, decalage_axis_x, decalage_axis_y, X, Y, canvas_width, canvas_height,
//     log_scale_x, log_scale_y) {

//     this.draw_sc_horizontal_axis(context, mvx, scaleX, width, height, init_scaleX, lists[0], to_display_attributes[0], 
//       scroll_x, decalage_axis_x, decalage_axis_y, X, Y, canvas_width, log_scale_x);
//     this.draw_sc_vertical_axis(context, mvy, scaleY, width, height, init_scaleY, lists[1], to_display_attributes[1], 
//       scroll_y, decalage_axis_x, decalage_axis_y, X, Y, canvas_height, log_scale_y);
//   }

//   draw_sc_horizontal_axis(context, mvx, scaleX, width, height, init_scaleX, list, to_display_attribute:Attribute, 
//     scroll_x, decalage_axis_x, decalage_axis_y, X, Y, canvas_width, log_scale_x=false) {
//     // Drawing the coordinate system
//     context.beginPath();
//     context.strokeStyle = this.axis_style.color_stroke;
//     context.lineWidth = this.axis_style.line_width;
//     var axis_x_start = decalage_axis_x + X;
//     var axis_x_end = width + X;
//     var axis_y_start = Y;
//     var axis_y_end = height - decalage_axis_y + Y;

//     //Arrows
//     if (this.arrow_on) {
//       Shape.drawLine(context, [[axis_x_end - 20, axis_y_end - 10], [axis_x_end, axis_y_end]]);
//       Shape.drawLine(context, [[axis_x_end, axis_y_end], [axis_x_end - 20, axis_y_end + 10]]);
//     }

//     //Axis
//     Shape.drawLine(context, [[axis_x_start, axis_y_end], [axis_x_end, axis_y_end]]);
//     context.fillStyle = this.graduation_style.text_color;
//     context.strokeStyle = this.axis_style.color_stroke;    
//     context.font = 'bold 20px Arial';
//     context.textAlign = 'end';
//     context.fillText(to_display_attribute['name'], axis_x_end - 5, axis_y_end - 10);
//     context.stroke();
//     //Graduations
//     context.font = this.graduation_style.font_size.toString() + 'px Arial';
//     if (log_scale_x) {
//       if (TypeOf(list[0]) === 'string') {
//         throw new Error("Cannot use log scale on a non float axis");
//       }
//       this.draw_horizontal_log_graduations(context, mvx, scaleX, Math.log10(list[0]), Math.log10(list[1]), axis_y_start,
//         axis_y_end, this.graduation_style.font_size, X, width);
//     } else {
//       this.draw_sc_horizontal_graduations(context, mvx, scaleX, init_scaleX, axis_x_start, axis_x_end, 
//         axis_y_start, axis_y_end, list, to_display_attribute, scroll_x, X, canvas_width);  
//     }
//     context.stroke();
//     context.closePath();  
//   }

//   draw_sc_vertical_axis(context, mvy, scaleY, width, height, init_scaleY, list, to_display_attribute, scroll_y, 
//     decalage_axis_x, decalage_axis_y, X, Y, canvas_height, log_scale_y=false) {
//     // Drawing the coordinate system
//     context.beginPath();
//     context.strokeStyle = this.axis_style.color_stroke;
//     context.lineWidth = this.axis_style.line_width;
//     var axis_x_start = decalage_axis_x + X;
//     var axis_x_end = width + X;
//     var axis_y_start = Y;
//     var axis_y_end = height - decalage_axis_y + Y;

//     if (this.arrow_on === true) {
//       Shape.drawLine(context, [[axis_x_start - 10, axis_y_start + 20], [axis_x_start, axis_y_start]]);
//       Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start + 10, axis_y_start + 20]]);
//     }
//     //Axis
//     Shape.drawLine(context, [[axis_x_start, axis_y_start], [axis_x_start, axis_y_end]]);

//     context.fillStyle = this.graduation_style.text_color;
//     context.strokeStyle = this.axis_style.color_stroke;    context.font = 'bold 20px Arial';
//     context.textAlign = 'start';
//     context.fillText(to_display_attribute['name'], axis_x_start + 5, axis_y_start + 20);
//     context.stroke();

//     //Graduations
//     context.font = this.graduation_style.font_size.toString() + 'px Arial';
//     if (log_scale_y) {
//       if (TypeOf(list[0]) === 'string') {
//         throw new Error("Cannot use log scale on a non float axis.")
//       }
//       this.draw_vertical_log_graduations(context, mvy, scaleY, -Math.log10(list[0]), -Math.log10(list[1]), 
//       axis_x_start, axis_x_end, axis_y_end, canvas_height, Y);
//     } else {
//       this.draw_sc_vertical_graduations(context, mvy, scaleY, init_scaleY, axis_x_start, axis_x_end, axis_y_start, 
//         axis_y_end, list, to_display_attribute, scroll_y, Y, canvas_height);
//     }
//     context.stroke();
//     context.closePath();
//   }

//   draw_sc_horizontal_graduations(context, mvx, scaleX, init_scaleX, axis_x_start, axis_x_end, axis_y_start, axis_y_end, list, attribute, scroll_x, X, canvas_width) {
//     context.textAlign = 'center';
//     if (attribute['type_'] == 'float') {
//       var minX = list[0];
//       var maxX = list[1];
//       if (scroll_x % 5 == 0) {
//         // let kx = 1.1*scaleX/init_scaleX;
//         // let num = Math.max(maxX - minX, 1);
//         // this.x_step = Math.min(num/(kx*(this.nb_points_x-1)), canvas_width/(scaleX*(this.nb_points_x - 1)));
//         this.x_step = canvas_width/(scaleX*(this.nb_points_x - 1));
//       }
//       var i=0;
//       var x_nb_digits = Math.max(0, 1-Math.floor(Math.log10(this.x_step)));
//       var grad_beg_x = Math.ceil(1/this.x_step * (axis_x_start - mvx - X)/scaleX) * this.x_step;
//       var grad_end_x = Math.ceil(1/this.x_step * ((canvas_width - mvx)/scaleX)) * this.x_step;
//       while(grad_beg_x + i*this.x_step < grad_end_x) {
//         if (this.grid_on === true) {
//           Shape.drawLine(context, [[scaleX*(grad_beg_x + i*this.x_step) + mvx + X, axis_y_start], [scaleX*(grad_beg_x + i*this.x_step) + mvx + X, axis_y_end + 3]]);
//         } else {
//           Shape.drawLine(context, [[scaleX*(grad_beg_x + i*this.x_step + mvx) + X, axis_y_end - 3], [scaleX*(grad_beg_x + i*this.x_step) + mvx + X, axis_y_end + 3]]);
//         }
//         context.fillText(MyMath.round(grad_beg_x + i*this.x_step, x_nb_digits), scaleX*(grad_beg_x + i*this.x_step) + mvx + X, axis_y_end + this.graduation_style.font_size);
//         i++;
//       }
//     } else {
//       for (let i=0; i<list.length; i++) {
//         if ((scaleX*(i + mvx) + X > axis_x_start) && (scaleX*(i + mvx) + X < axis_x_end - 9)) {
//           if (this.grid_on === true) {
//             Shape.drawLine(context, [[scaleX*i + mvx + X, axis_y_start], [scaleX*i + mvx + X, axis_y_end + 3]]);
//           } else {
//             Shape.drawLine(context, [[scaleX*i + mvx + X, axis_y_end - 3], [scaleX*i + mvx + X, axis_y_end + 3]]);
//           }
//           context.fillText(list[i], scaleX*i + mvx + X, axis_y_end + this.graduation_style.font_size);
//         }
//       }
//     }
//   }

//   draw_sc_vertical_graduations(context, mvy, scaleY, init_scaleY, axis_x_start, axis_x_end, axis_y_start, axis_y_end, list, attribute, scroll_y, Y, canvas_height) {
//     context.textAlign = 'end';
//     context.textBaseline = 'middle';
//     if (attribute['type_'] == 'float') {
//       var minY = list[0];
//       var maxY = list[1];
//       if (scroll_y % 5 == 0) {
//         // let ky = 1.1*scaleY/init_scaleY;
//         // let num = Math.max(maxY - minY, 1);
//         // this.y_step = Math.min(num/(ky*(this.nb_points_y-1)), canvas_height/(scaleY*(this.nb_points_y - 1)));
//         this.y_step = canvas_height/(scaleY*(this.nb_points_y - 1));
//       }
//       var i=0;
//       var grad_beg_y = Math.ceil(-1/this.y_step*((axis_y_end - mvy - Y)/scaleY)) * this.y_step;
//       var grad_end_y = Math.floor(mvy/(this.y_step * scaleY)) * this.y_step;
//       var y_nb_digits = Math.max(0, 1-Math.floor(Math.log10(this.y_step)));
//       while (grad_beg_y + (i-1)*this.y_step < grad_end_y) {
//         if (this.grid_on === true) {
//           Shape.drawLine(context,[[axis_x_start - 3, -scaleY*(grad_beg_y + i*this.y_step) + mvy + Y], [axis_x_end, -scaleY*(grad_beg_y + i*this.y_step) + mvy + Y]]);
//         } else {
//           Shape.drawLine(context, [[axis_x_start - 3, -scaleY*(grad_beg_y + i*this.y_step) + mvy + Y], [axis_x_start + 3, -scaleY*(grad_beg_y + i*this.y_step) + mvy + Y]]);
//         }
//         context.fillText(MyMath.round(grad_beg_y + i*this.y_step, y_nb_digits), axis_x_start - 5, -scaleY*(grad_beg_y + i*this.y_step) + mvy + Y);
//         i++;
//       }
//     } else {
//       for (let i=0; i<list.length; i++) {
//         if ((-scaleY*i + mvy + Y > axis_y_start + 5) && (-scaleY*i + mvy + Y < axis_y_end)) {
//           if (this.grid_on === true) {
//             Shape.drawLine(context,[[axis_x_start - 3, -scaleY*i + mvy + Y], [axis_x_end, -scaleY*i + mvy + Y]]);
//           } else {
//               Shape.drawLine(context, [[axis_x_start - 3, -scaleY*i + mvy + Y], [axis_x_start + 3, -scaleY*i + mvy + Y]]);
//           }
//           context.fillText(list[i], axis_x_start - 5, -scaleY*i + mvy + Y);
//         }
//       }
//     }
//   }
// }


// export class PointFamily {
//   constructor (public color: string,
//                public point_index: number[],
//                public name:string) {}

//   public static deserialize(serialized) {
//     return new PointFamily(rgb_to_hex(serialized['color']),
//                            serialized['point_index'],
//                            serialized['name']);
//   }
// }


// /**
// * A class for sorting lists.
// */
// export class Sort {
//   nbPermutations:number = 0;
//   permutations: number[] = [];
//   constructor(){};

//   MergeSort(items: number[]): number[] {
//     return this.divide(items);
//   }

//   divide(items: number[]): number[] {
//     var halfLength = Math.ceil(items.length / 2);
//     var low = items.slice(0, halfLength);
//     var high = items.slice(halfLength);
//     if (halfLength > 1) {
//         low = this.divide(low);
//         high = this.divide(high);
//     }
//     return this.combine(low, high);
//   }

//   combine(low: number[], high: number[]): number[] {
//     var indexLow = 0;
//     var indexHigh = 0;
//     var lengthLow = low.length;
//     var lengthHigh = high.length;
//     var combined = [];
//     while (indexLow < lengthLow || indexHigh < lengthHigh) {
//         var lowItem = low[indexLow];
//         var highItem = high[indexHigh];
//         if (lowItem !== undefined) {
//             if (highItem === undefined) {
//                 combined.push(lowItem);
//                 indexLow++;
//             } else {
//                 if (lowItem <= highItem) {
//                     combined.push(lowItem);
//                     indexLow++;
//                 } else {
//                     combined.push(highItem);
//                     this.nbPermutations = this.nbPermutations + lengthLow - indexLow;
//                     indexHigh++;
//                 }
//             }
//         } else {
//             if (highItem !== undefined) {
//                 combined.push(highItem);
//                 indexHigh++;
//             }
//         }
//     }
//     return combined;
//   }

//   sortObjsByAttribute(list:any[], attribute_name:string): any[] {
//     if (!List.is_include(attribute_name, Object.getOwnPropertyNames(list[0]))) {
//       throw new Error('sortObjsByAttribute : ' + attribute_name + ' is not a property of the object')
//     }
//     var attribute_type = TypeOf(list[0][attribute_name]);
//     var list_copy = Array.from(list);

//     this.permutations = [];
//     for (let i=0; i<list.length; i++) this.permutations.push(i);

//     if (attribute_type == 'float') {
//       for (let i=0; i<list_copy.length-1; i++) {
//         let min = i;
//         let min_value = list_copy[i][attribute_name];
//         for (let j=i+1; j<list_copy.length; j++) {
//           let current_value = list_copy[j][attribute_name];
//           if (current_value < min_value) {
//             min = j;
//             min_value = current_value;
//           }
//         }
//         if (min != i) {
//           list_copy = List.move_elements(min, i, list_copy);
//           this.permutations = List.move_elements(min, i, this.permutations);
//         }
//       }
//       return list_copy;
//     } else { // ie color or string
//       let strings = [];
//       for (let i=0; i<list_copy.length; i++) {
//         if (!List.is_include(list_copy[i][attribute_name], strings)) {
//           strings.push(list_copy[i][attribute_name]);
//         }
//       }
//       let sorted_list = [];
//       for (let i=0; i<strings.length; i++) {
//         for (let j=0; j<list_copy.length; j++) {
//           if (strings[i] === list_copy[j][attribute_name]) {
//             sorted_list.push(list_copy[j]);
//           }
//         }
//       }
//       return sorted_list;
//     }
//   }

// }


// export class Tooltip {
//   constructor(public attribute_names:string[],
//               public surface_style:SurfaceStyle,
//               public text_style:TextStyle,
//               public tooltip_radius:number=10,
//               public type_:string='tooltip',
//               public name:string='') {
//               }

//   public static deserialize(serialized) {
//     let default_surface_style = {color_fill:string_to_rgb('black'), opacity:0.9, hatching:undefined};
//     let default_text_style = {text_color:string_to_rgb('lightgrey'), font_size:12, font_style:'Calibri', 
//                               text_align_x:'start', text_align_y:'alphabetic', name:''};
//     let default_dict_ = {surface_style:default_surface_style, text_style:default_text_style, tooltip_radius:7};
//     serialized = set_default_values(serialized, default_dict_);
//     var surface_style = SurfaceStyle.deserialize(serialized['surface_style']);
//     var text_style = TextStyle.deserialize(serialized['text_style']);

//     return new Tooltip(serialized['attributes'],
//                        surface_style,
//                        text_style,
//                        serialized['tooltip_radius'],
//                        serialized['type_'],
//                        serialized['name']);
//   }

//   isTooltipInsideCanvas(cx, cy, size, mvx, mvy, scaleX, scaleY, canvasWidth, canvasHeight) {
//     var x = scaleX*cx + mvx;
//     var y = scaleY*cy + mvy;
//     var length = 100*size;
//     return (x+length>=0) && (x-length<=canvasWidth) && (y+length>=0) && (y-length<=canvasHeight);
//   }

//   refresh_nb_digits(x_nb_digits, y_nb_digits): [number, number] {
//     var new_x_digits = x_nb_digits;
//     var new_y_digit = y_nb_digits;
//     if (isNaN(new_x_digits)) {
//       new_x_digits = 3;
//     }
//     if (isNaN(new_y_digit)) {
//       new_y_digit = 3;
//     }
//     return [new_x_digits, new_y_digit];
//   }

//   initialize_text_mergeOFF(context, x_nb_digits, y_nb_digits, elt): [string[], number] {
//     var textfills = ['Information'];
//     var text_max_length = context.measureText('Information').width;
//     for (let i=0; i<this.attribute_names.length; i++) {
//       let attribute_name = this.attribute_names[i];
//       let attribute_type = TypeOf(elt[attribute_name]);
//       if (attribute_type == 'float') {
//         var text = attribute_name + ' : ' + MyMath.round(elt[attribute_name], Math.max(x_nb_digits, y_nb_digits,2)); //x_nb_digit évidemment pas définie lorsque l'axe des x est un string...
//       } else if (attribute_type == 'color') {
//         text = attribute_name + ' : ' + color_to_string(elt[attribute_name]);
//       } else {
//         text = attribute_name + ' : ' + elt[attribute_name];
//       }
//       var text_w = context.measureText(text).width;
//       textfills.push(text);
//       if (text_w > text_max_length) {
//         text_max_length = text_w;
//       }
//     }
//     return [textfills, text_max_length];
//   }

//   initialize_text_mergeON(context, x_nb_digits, y_nb_digits, point, initial_point_list, elements, axes): [string[], number] {
//     var textfills = ['Information'];
//     var text_max_length = context.measureText('Information').width;
//     for (let i=0; i<this.attribute_names.length; i++) {
//       let attribute_name = this.attribute_names[i];
//       let attribute_type = TypeOf(elements[0][attribute_name]);
//       if (attribute_type == 'float') { 
//         if (attribute_name === axes[0]) {
//           var text = attribute_name + ' : ' + MyMath.round(point.cx, Math.max(x_nb_digits, y_nb_digits,2)); //x_nb_digits évidemment pas définie lorsque l'axe des x est un string...
//         } else if (attribute_name === axes[1]) {
//           var text = attribute_name + ' : ' + MyMath.round(-point.cy, Math.max(x_nb_digits, y_nb_digits,2));
//         } else {
//           let index = point.points_inside[0].getPointIndex(initial_point_list);
//           let elt = elements[index];
//           var text = attribute_name + ' : ' + MyMath.round(elt[attribute_name], Math.max(x_nb_digits, y_nb_digits,2));
//         }
//         var text_w = context.measureText(text).width;
//         textfills.push(text);
//       }
//       if (text_w > text_max_length) {
//         text_max_length = text_w;
//       }
//     }
//     return [textfills, text_max_length];
//   }

//   draw(context, point, mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, 
//     X, Y, x_nb_digits, y_nb_digits, point_list, initial_point_list, elements, 
//     mergeON, axes, log_scale_x, log_scale_y) {
//     var textfills = [];
//     var text_max_length = 0;
//     context.font = this.text_style.font;
//     [x_nb_digits, y_nb_digits] = this.refresh_nb_digits(x_nb_digits, y_nb_digits);
//     if (point.isPointInList(point_list)) {
//       var index = point.getPointIndex(point_list);
//       var elt = elements[index];
//       if (mergeON === true) {
//         [textfills, text_max_length] = this.initialize_text_mergeON(context, x_nb_digits, y_nb_digits, point, initial_point_list, elements, axes);
//       } else {
//         [textfills, text_max_length] = this.initialize_text_mergeOFF(context, x_nb_digits, y_nb_digits, elt);
//       }
//     }

//     if (textfills.length > 0) {
//       var tp_height = textfills.length*this.text_style.font_size*1.25;
//       var cx = point.cx, cy = point.cy;
//       if (log_scale_x) cx = Math.log10(cx);
//       if (log_scale_y) cy = -Math.log10(-cy);
//       var point_size = point.point_style.size;
//       var decalage = 2.5*point_size + 15;
//       var tp_x = scaleX*cx + mvx + decalage + X;
//       var tp_y = scaleY*cy + mvy - 1/2*tp_height + Y;
//       var tp_width = text_max_length*1.3;

//       // Bec
//       var point1 = [tp_x - decalage/2, scaleY*cy + mvy + Y];
//       var point2 = [tp_x, scaleY*cy + mvy + Y + 5];
//       var point3 = [tp_x, scaleY*cy + mvy + Y - 5];

//       if (tp_x + tp_width  > canvas_width + X) {
//         tp_x = scaleX*cx + mvx - decalage - tp_width + X;
//         point1 = [tp_x + tp_width, scaleY*cy + mvy + Y + 5];
//         point2 = [tp_x + tp_width, scaleY*cy + mvy + Y - 5];
//         point3 = [tp_x + tp_width + decalage/2, scaleY*cy + mvy + Y];
//       }
//       if (tp_y < Y) {
//         tp_y = scaleY*cy + mvy + Y - 7*point_size;
//       }
//       if (tp_y + tp_height > canvas_height + Y) {
//         tp_y = scaleY*cy + mvy - tp_height + Y + 7*point_size;
//       }
//       context.beginPath();
//       Shape.drawLine(context, [point1, point2, point3]);
//       context.stroke();
//       context.fill();

//       Shape.roundRect(tp_x, tp_y, tp_width, tp_height, this.tooltip_radius, context, this.surface_style.color_fill, string_to_hex('black'), 0.5,
//       this.surface_style.opacity, []);
//       context.fillStyle = this.text_style.text_color;
//       context.textAlign = 'center';
//       context.textBaseline = 'middle';

//       var x_start = tp_x + 1/10*tp_width;

//       var current_y = tp_y + 0.75*this.text_style.font_size;
//       for (var i=0; i<textfills.length; i++) {
//         if (i == 0) {
//           context.font = 'bold ' + this.text_style.font;
//           context.fillText(textfills[0], tp_x + tp_width/2, current_y);
//           context.font = this.text_style.font;
//           current_y += this.text_style.font_size * 1.1;
//         } else {
//           context.fillText(textfills[i], tp_x + tp_width/2, current_y); 
//           current_y += this.text_style.font_size;
//         }
//       }

//       context.globalAlpha = 1;
//       context.stroke();
//       context.closePath();
//     }

//   }

//   manage_tooltip(context, mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, tooltip_list, 
//     X, Y, x_nb_digits, y_nb_digits, point_list, initial_point_list, elements, mergeON, axes, 
//     log_scale_x, log_scale_y) {

//     for (var i=0; i<tooltip_list.length; i++) {
//       let cx = tooltip_list[i].cx, cy = tooltip_list[i].cy;
//       if (log_scale_x) cx = Math.log10(cx);
//       if (log_scale_y) cy = -Math.log10(-cy);
//       if (tooltip_list[i] && this.isTooltipInsideCanvas(cx, cy, tooltip_list[i].size, mvx, mvy, 
//         scaleX, scaleY, canvas_width, canvas_height)) {

//         this.draw(context, tooltip_list[i], mvx, mvy, scaleX, scaleY, canvas_width, canvas_height, 
//           X, Y, x_nb_digits, y_nb_digits, point_list, initial_point_list, elements, mergeON, axes,
//           log_scale_x, log_scale_y);

//       }
//     }
//   }
// }


// export class Attribute {
//   list:any[];
//   alias:string;
//   constructor(public name:string,
//               public type_:string) {}

//   public static deserialize(serialized) {
//     return new Attribute(serialized['name'],
//                          serialized['type_']);
//   }

//   copy() {
//     var attribute_copy = new Attribute(this.name, this.type_);
//     attribute_copy['list'] = this.list;
//     return attribute_copy;
//   }
// }


// export class Window {
//   constructor(public height:number,public width:number, public name?:string){
//   }

//   public static deserialize(serialized) {
//     return new Window(serialized['height'],
//                       serialized['width'],
//                       serialized['name']);
//   }
// }


// export function check_package_version(package_version:string, requirement:string) {
//   var version_array = package_version.split('.');
//   var requirement_array = requirement.split('.');
//   var package_version_num = Number(version_array[0])*Math.pow(10, 4) + Number(version_array[1])*Math.pow(10,2) +
//     Number(version_array[2]);
//   var requirement_num = Number(requirement_array[0])*Math.pow(10, 4) + Number(requirement_array[1])*Math.pow(10,2) +
//     Number(requirement_array[2]);
//   if (package_version_num < requirement_num) {
//     alert("plot_data's version must be updated. Current version: " + package_version + ", minimum requirement: " + requirement);
//   }
// }

export function equals(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (a.length != b.length) return false;
      for (i = a.length; i-- !== 0;)
        if (!b.includes(a[i])) return false;
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

export function uniqueValues(vector: string[]): string[] {
  return vector.filter((value, index, array) => array.indexOf(value) === index)
}

export function arrayDiff(a: any[], b: any[]): any[] { // TODO: this seems duplicated in PP
  const diff = [];
  a.forEach(value => { if (!b.includes(value)) diff.push(value) });
  return diff
}

export class PointSet {
  public color: string;
  constructor(
    public indices: number[] = [],
    color: string = "hsl(32, 100%, 50%)",
    public name: string = ""
  ) {
    this.color = colorHsl(color);
  }

  public includes(pointIndex: number): boolean { return this.indices.includes(pointIndex) }

  public indexOf(pointIndex: number): number { return this.indices.indexOf(pointIndex) }
}

const BORDER_SIZE = 20;
const SMALL_RUBBERBAND_SIZE = 10;
// Changes in rubberbands are only code deletion
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

  private get borderSize() { return Math.min(BORDER_SIZE, this.canvasLength / 3) }

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
  constructor(public x: number = 0, public y: number = 0) { }

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

  public distance(other: Vertex): number { return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2) }

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
  public scaledPath: Path2D = new Path2D();
  public inStrokeScale: Vertex = new Vertex(1, 1);

  public lineWidth: number = 1;
  public dashLine: number[] = [];
  public hatching: HatchingSet;
  public strokeStyle: string = null;
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
  public hasTooltip: boolean = true;
  constructor() { };

  get tooltipMap(): Map<string, any> { return this._tooltipMap };

  set tooltipMap(value: Map<string, any>) { this._tooltipMap = value };

  public newTooltipMap(): void { this._tooltipMap = new Map<string, any>() };

  public get drawingStyle(): { [key: string]: any } {
    const style = {};
    style["lineWidth"] = this.lineWidth;
    style["dashLine"] = this.dashLine;
    style["hatching"] = this.hatching;
    style["strokeStyle"] = this.strokeStyle;
    style["fillStyle"] = this.fillStyle;
    style["alpha"] = this.alpha;
    return style
  }

  public styleToLegend(legendOrigin: Vertex, legendSize: Vertex): LineSegment | newRect | newPoint2D {
    if (!this.isFilled) return new LineSegment(legendOrigin.copy(), legendOrigin.add(legendSize))
    return new newRect(legendOrigin.copy(), legendSize);
  }

  public static deserialize(data: { [key: string]: any }, scale: Vertex): newShape {
    let shape: newShape;
    if (data.type_ == "circle") shape = newCircle.deserialize(data, scale)
    else if (data.type_ == "contour") shape = Contour.deserialize(data, scale);
    else if (data.type_ == "line2d") shape = Line.deserialize(data, scale);
    else if (data.type_ == "linesegment2d") shape = LineSegment.deserialize(data, scale);
    else if (data.type_ == "wire") shape = LineSequence.deserialize(data, scale);
    else if (data.type_ == "point") shape = newPoint2D.deserialize(data, scale);
    else if (data.type_ == "arc") shape = Arc.deserialize(data, scale);
    else if (data.type_ == "text") return newText.deserialize(data, scale);
    else if (data.type_ == "label") shape = newLabel.deserialize(data, scale);
    else if (data.type_ == "rectangle") shape = newRect.deserialize(data, scale);
    else if (data.type_ == "roundrectangle") shape = newRoundRect.deserialize(data, scale);
    else throw new Error(`${data.type_} deserialization is not implemented.`);
    shape.deserializeStyle(data)
    return shape
  }

  public deserializeStyle(data: any): void {
    this.deserializeEdgeStyle(data);
    this.deserializeSurfaceStyle(data);
    this.deserializeTooltip(data);
  }

  public deserializeEdgeStyle(data: any): void {
    this.lineWidth = data.edge_style?.line_width ?? this.lineWidth;
    this.dashLine = data.edge_style?.dashline ?? this.dashLine;
    this.strokeStyle = data.edge_style?.color_stroke ? colorHsl(data.edge_style.color_stroke) : null;
  }

  public deserializeSurfaceStyle(data: any): void {
    this.fillStyle = colorHsl(data.surface_style?.color_fill ?? this.fillStyle);
    this.alpha = data.surface_style?.opacity ?? this.alpha;
    this.hatching = data.surface_style?.hatching ? new HatchingSet("", data.surface_style.hatching.stroke_width, data.surface_style.hatching.hatch_spacing) : null;
  }

  protected deserializeTooltip(data: any): void { if (data.tooltip) this.tooltipMap.set(data.tooltip, "") }

  public getBounds(): [Vertex, Vertex] { return [new Vertex(0, 1), new Vertex(0, 1)] }

  protected updateTooltipOrigin(matrix: DOMMatrix): void {
    if (this.mouseClick) this.tooltipOrigin = this.mouseClick.transform(matrix);
  }

  public draw(context: CanvasRenderingContext2D): void {
    context.save();
    const scaledPath = new Path2D();
    const contextMatrix = context.getTransform();
    this.updateTooltipOrigin(contextMatrix);
    if (this.isScaled) {
      scaledPath.addPath(this.path, new DOMMatrix().scale(contextMatrix.a, contextMatrix.d));
      context.scale(1 / contextMatrix.a, 1 / contextMatrix.d);
      this.inStrokeScale = new Vertex(1 / contextMatrix.a, 1 / contextMatrix.d);
    } else scaledPath.addPath(this.buildUnscaledPath(context));
    this.setDrawingProperties(context);
    if (this.isFilled) context.fill(scaledPath);
    context.stroke(scaledPath);
    this.scaledPath = scaledPath;
    context.restore();
  }

  protected buildUnscaledPath(context: CanvasRenderingContext2D): Path2D {
    context.resetTransform();
    const path = new Path2D();
    path.addPath(this.path);
    return path
  }

  public setStrokeStyle(fillStyle: string): string {
    const [h, s, l] = hslToArray(colorHsl(fillStyle));
    const lValue = l <= STROKE_STYLE_OFFSET ? l + STROKE_STYLE_OFFSET : l - STROKE_STYLE_OFFSET;
    return `hsl(${h}, ${s}%, ${lValue}%)`;
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    context.lineWidth = this.lineWidth;
    context.setLineDash(this.dashLine);
    if (this.alpha == 0) this.isFilled = false
    else if (this.alpha != 1) context.globalAlpha = this.alpha;
    if (this.isFilled) {
      context.fillStyle = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.isSelected ? this.selectedStyle : this.fillStyle;
      context.strokeStyle = (this.isHovered || this.isClicked || this.isSelected) ? this.setStrokeStyle(context.fillStyle) : this.strokeStyle ? colorHsl(this.strokeStyle) : this.setStrokeStyle(context.fillStyle);
      if (this.hatching) context.fillStyle = context.createPattern(this.hatching.generate_canvas(context.fillStyle), 'repeat');
    } else context.strokeStyle = this.isHovered ? this.hoverStyle : this.isClicked ? this.clickedStyle : this.isSelected ? this.selectedStyle : this.strokeStyle ? colorHsl(this.strokeStyle) : 'hsl(0, 0%, 0%)';
  }

  public initTooltip(context: CanvasRenderingContext2D): newTooltip { return new newTooltip(this.tooltipOrigin, this.tooltipMap, context) }

  public drawTooltip(plotOrigin: Vertex, plotSize: Vertex, context: CanvasRenderingContext2D): void {
    if (this.isClicked && this.tooltipMap.size != 0) {
      const tooltip = this.initTooltip(context);
      tooltip.draw(plotOrigin, plotSize, context);
    }
  }

  public buildPath(): void { }

  public isPointInShape(context: CanvasRenderingContext2D, point: Vertex): boolean {
    if (this.isFilled) return context.isPointInPath(this.path, point.x, point.y);
    return this.isPointInStroke(context, point)
  }

  protected isPointInStroke(context: CanvasRenderingContext2D, point: Vertex): boolean {
    let isHovered: boolean
    context.save();
    context.resetTransform();
    context.lineWidth = 10;
    if (this.isScaled) {
      context.scale(this.inStrokeScale.x, this.inStrokeScale.y);
      isHovered = context.isPointInStroke(this.scaledPath, point.x, point.y);
    } else isHovered = context.isPointInStroke(this.path, point.x, point.y);
    context.restore();
    return isHovered
  }

  public mouseDown(mouseDown: Vertex) { if (this.isHovered) this.mouseClick = mouseDown.copy() }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void { this.isHovered = this.isPointInShape(context, mouseCoords) }

  public mouseUp(keepState: boolean): void {
    this.isClicked = this.isHovered ? !this.isClicked : (keepState ? this.isClicked : false);
  }
}

export class Arc extends newShape {
  constructor(
    public center: Vertex,
    public radius: number,
    public startAngle: number,
    public endAngle: number,
    public clockWise: boolean = true
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }

  public buildPath(): void {
    this.path = new Path2D();
    this.drawInContour(this.path);
  }

  public drawInContour(path: Path2D): void {
    path.arc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle, this.clockWise);
  }

  public static deserialize(data: any, scale: Vertex): Arc {
    const arc = new Arc(new Vertex(data.cx, data.cy), data.r, data.start_angle, data.end_angle, data.clockwise ?? true);
    arc.deserializeEdgeStyle(data);
    return arc
  }

  public getBounds(): [Vertex, Vertex] {
    return [
      new Vertex(this.center.x - this.radius, this.center.y - this.radius),
      new Vertex(this.center.x + this.radius, this.center.y + this.radius)
    ]
  }
}

export class newCircle extends Arc {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public radius: number = 1
  ) {
    super(center, radius, 0, 2 * Math.PI);
    this.isFilled = true;
  }

  public static deserialize(data: any, scale: Vertex): newCircle {
    const circle = new newCircle(new Vertex(data.cx, data.cy), data.r);
    circle.deserializeEdgeStyle(data);
    circle.deserializeSurfaceStyle(data);
    return circle
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

  public static deserialize(data: any, scale: Vertex): newRect {
    const rectangle = new newRect(new Vertex(data.x_coord, data.y_coord), new Vertex(data.width, data.height));
    return rectangle
  }

  public deserializeStyle

  public translate(translation: Vertex): void {
    this.origin = this.origin.add(translation);
    this.buildPath();
  }

  public get center(): Vertex { return this.origin.add(this.size).scale(new Vertex(0.5, 0.5)) }

  public getBounds(): [Vertex, Vertex] { return [this.origin, this.origin.add(new Vertex(Math.abs(this.size.x), Math.abs(this.size.y)))] }
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

  public static deserialize(data: any, scale: Vertex): newRect {
    const roundRectangle = new newRoundRect(new Vertex(data.x_coord, data.y_coord), new Vertex(data.width, data.height), data.radius);
    return roundRectangle
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

  public getBounds(): [Vertex, Vertex] {
    const halfSize = this.size / 2;
    const halfSizeVertex = new Vertex(halfSize, halfSize);
    return [this.center.subtract(halfSizeVertex), this.center.add(halfSizeVertex)]
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

  public get drawingStyle(): { [key: string]: any } {
    return { ...super.drawingStyle, "orientation": this.orientation }
  }

  public getBounds(): [Vertex, Vertex] {
    const halfSize = this.size / 2;
    const halfSizeVertex = new Vertex(halfSize, halfSize);
    return [this.center.subtract(halfSizeVertex), this.center.add(halfSizeVertex)]
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
    if (!['up', 'down', 'left', 'right'].includes(this.orientation)) throw new Error(`Orientation halfline ${this.orientation} is unknown.`);
  }
}

export class Line extends newShape {
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public end: Vertex = new Vertex(0, 0)
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }

  private computeSlope(): number {
    return (this.end.y - this.origin.y) / (this.end.x - this.origin.x);
  }

  private computeAffinity(slope: number): number {
    return this.origin.y - slope * this.origin.x
  }

  public getEquation(): [number, number] {
    const slope = this.computeSlope();
    const affinity = this.computeAffinity(slope);
    return [slope, affinity]
  }

  public static deserialize(data: any, scale: Vertex): Line { // TODO: Don't know how to factor this and the LineSegment one
    const line = new Line(new Vertex(data.point1[0], data.point1[1]), new Vertex(data.point2[0], data.point2[1]));
    return line
  }

  public buildPath(): void {
    const infiniteFactor = 1e3;
    const [slope, affinity] = this.getEquation();
    if (this.end.x == this.origin.x) {
      this.path = new LineSegment(new Vertex(this.origin.x, -this.end.y * infiniteFactor), new Vertex(this.origin.x, this.end.y * infiniteFactor)).path;
    } else {
      const fakeOrigin = new Vertex(-infiniteFactor, 0);
      const fakeEnd = new Vertex(infiniteFactor, 0);
      if (this.origin.x != 0) {
        fakeOrigin.x *= this.origin.x;
        fakeEnd.x *= this.origin.x;
      }
      fakeOrigin.y = fakeOrigin.x * slope + affinity;
      fakeEnd.y = fakeEnd.x * slope + affinity;
      this.path = new LineSegment(fakeOrigin, fakeEnd).path;
    }
  }

  public getBounds(): [Vertex, Vertex] {
    const minX = Math.min(this.origin.x, this.end.x);
    const minY = Math.min(this.origin.y, this.end.y);
    const maxX = Math.max(this.origin.x, this.end.x);
    const maxY = Math.max(this.origin.y, this.end.y);
    return [new Vertex(minX, minY), new Vertex(maxX, maxY)]
  }
}

export class LineSegment extends Line {
  constructor(
    public origin: Vertex = new Vertex(0, 0),
    public end: Vertex = new Vertex(0, 0)
  ) {
    super(origin, end);
  }

  public buildPath(): void {
    this.path = new Path2D();
    this.path.moveTo(this.origin.x, this.origin.y);
    this.drawInContour(this.path);
  }

  public static deserialize(data: any, scale: Vertex): LineSegment {
    const line = new LineSegment(new Vertex(data.point1[0], data.point1[1]), new Vertex(data.point2[0], data.point2[1]));
    line.deserializeEdgeStyle(data);
    return line
  }

  public drawInContour(path: Path2D): void { path.lineTo(this.end.x, this.end.y) }
}

export abstract class AbstractLinePoint extends newShape {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'up'
  ) {
    super();
    this.isFilled = false;
    this.buildPath();
  }

  public get drawingStyle(): { [key: string]: any } {
    return { ...super.drawingStyle, "orientation": this.orientation }
  }

  public getBounds(): [Vertex, Vertex] {
    const halfSize = this.size / 2;
    const halfSizeVertex = new Vertex(halfSize, halfSize);
    return [this.center.subtract(halfSizeVertex), this.center.add(halfSizeVertex)]
  }
}

export class VerticalLinePoint extends AbstractLinePoint {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x, this.center.y - halfSize);
    this.path.lineTo(this.center.x, this.center.y + halfSize);
  }
}

export class HorizontalLinePoint extends AbstractLinePoint {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y);
    this.path.lineTo(this.center.x + halfSize, this.center.y);
  }
}

export class PositiveLinePoint extends AbstractLinePoint {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y + halfSize);
  }
}

export class NegativeLinePoint extends AbstractLinePoint {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y + halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y - halfSize);
  }
}

export class LinePoint extends AbstractLinePoint {
  constructor(
    public center: Vertex = new Vertex(0, 0),
    public size: number = 1,
    public orientation: string = 'vertical'
  ) {
    super(center, size, orientation);
    this.buildPath();
  }

  public buildPath(): void {
    if (this.orientation == 'vertical') this.path = new VerticalLinePoint(this.center, this.size).path;
    if (this.orientation == 'horizontal') this.path = new HorizontalLinePoint(this.center, this.size).path;
    if (['slash', 'positive'].includes(this.orientation)) this.path = new PositiveLinePoint(this.center, this.size).path;
    if (['backslash', 'negative'].includes(this.orientation)) this.path = new NegativeLinePoint(this.center, this.size).path;
    if (!['vertical', 'horizontal', 'slash', 'backslash', 'positive', 'negative'].includes(this.orientation)) throw new Error(`Orientation ${this.orientation} is unknown.`);
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

  public getBounds(): [Vertex, Vertex] {
    const halfSize = this.size / 2;
    const halfSizeVertex = new Vertex(halfSize, halfSize);
    return [this.center.subtract(halfSizeVertex), this.center.add(halfSizeVertex)]
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

  public get drawingStyle(): { [key: string]: any } {
    return { ...super.drawingStyle, "orientation": this.orientation }
  }

  public abstract buildPath(): void;

  public getBounds(): [Vertex, Vertex] {
    const halfSize = this.size / 2;
    const halfSizeVertex = new Vertex(halfSize, halfSize);
    return [this.center.subtract(halfSizeVertex), this.center.add(halfSizeVertex)]
  }
}

export class UpTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x, this.center.y + halfSize);
    this.path.closePath();
  }
}

export class DownTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x + halfSize, this.center.y + halfSize);
    this.path.lineTo(this.center.x, this.center.y - halfSize);
    this.path.lineTo(this.center.x - halfSize, this.center.y + halfSize);
    this.path.closePath();
  }
}

export class LeftTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x + halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x - halfSize, this.center.y);
    this.path.lineTo(this.center.x + halfSize, this.center.y + halfSize);
    this.path.closePath();
  }
}

export class RightTriangle extends AbstractTriangle {
  public buildPath(): void {
    this.path = new Path2D();
    const halfSize = this.size / 2;
    this.path.moveTo(this.center.x - halfSize, this.center.y - halfSize);
    this.path.lineTo(this.center.x + halfSize, this.center.y);
    this.path.lineTo(this.center.x - halfSize, this.center.y + halfSize);
    this.path.closePath();
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

export class Contour extends newShape {
  constructor(
    public lines: (Arc | LineSegment)[] = [],
    public isFilled: boolean = false
  ) {
    super();
    this.buildPath();
  }

  public static deserialize(data: any, scale: Vertex): Contour {
    const lines = data.plot_data_primitives.map(primitive => newShape.deserialize(primitive, scale));
    const contour = new Contour(lines, data.is_filled ?? false);
    contour.deserializeEdgeStyle(data);
    if (contour.isFilled) contour.deserializeSurfaceStyle(data);
    return contour
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    super.setDrawingProperties(context);
    context.strokeStyle = "hsla(0, 0%, 100%, 0)";
  }

  private setLineStyle(context: CanvasRenderingContext2D, line: newShape): void {
    line.dashLine = line.dashLine.length != 0 ? line.dashLine : this.dashLine;
    line.strokeStyle = line.strokeStyle ?? this.strokeStyle;
    line.lineWidth = line.lineWidth != 1 ? line.lineWidth : this.lineWidth;
    line.isHovered = this.isHovered;
    line.isClicked = this.isClicked;
    line.isSelected = this.isSelected;
  }

  public draw(context: CanvasRenderingContext2D): void {
    super.draw(context);
    context.save();
    super.setDrawingProperties(context);
    this.lines.forEach(line => {
      this.setLineStyle(context, line);
      line.draw(context)
    });
    context.restore();
  }

  public buildPath(): void {
    this.path = new Path2D();
    if (this.lines[0] instanceof LineSegment) this.path.moveTo(this.lines[0].origin.x, this.lines[0].origin.y);
    this.lines.forEach(line => line.drawInContour(this.path));
    if (this.isFilled) this.path.closePath();
  }

  public getBounds(): [Vertex, Vertex] {
    let minimum = new Vertex(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    let maximum = new Vertex(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
    this.lines.forEach(line => {
      const [shapeMin, shapeMax] = line.getBounds();
      if (shapeMin.x <= minimum.x) minimum.x = shapeMin.x;
      if (shapeMin.y <= minimum.y) minimum.y = shapeMin.y;
      if (shapeMax.x >= maximum.x) maximum.x = shapeMax.x;
      if (shapeMax.y >= maximum.y) maximum.y = shapeMax.y;
    })
    return [minimum, maximum]
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
  color?: string,
  scale?: Vertex
}

const SEPARATORS = ["_", "/", "\\", " ", ",", ";", ":", "!", "?", ")", "(", "{", "}", "[", "]", "=", "+", "-"];
const DEFAULT_FONTSIZE = 12;
export class newText extends newShape {
  public scale: Vertex = new Vertex(1, 1);
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
  public rowIndices: number[] = [];
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
      baseline = 'top',
      style = '',
      orientation = 0,
      color = "hsl(0, 0%, 0%)",
      backgroundColor = "hsla(0, 0%, 100%, 0)",
      scale = new Vertex(1, 1)
    }: TextParams = {}) {
    super();
    this.boundingBox = new newRect(origin, new Vertex(width, height));
    this.boundingBox.fillStyle = backgroundColor;
    this.boundingBox.strokeStyle = backgroundColor;
    this.boundingBox.lineWidth = 1e-6; //TODO: this is a HOT FIX
    this.fontsize = fontsize;
    this.multiLine = multiLine;
    this.font = font;
    this.style = style;
    this.orientation = orientation;
    this.fillStyle = color;
    this.words = this.getWords();
    this.align = align;
    this.baseline = baseline;
    this.scale = scale;
  }

  private static buildFont(style: string, fontsize: number, font: string): string { return `${style} ${fontsize}px ${font}` }

  public static deserializeTextParams(data: any): TextParams {
    const style = `${data.text_style?.bold ? "bold" : ""}${data.text_style?.bold || data.text_style?.italic ? " " : ""}${data.text_style?.italic ? "italic" : ""}`;
    return {
      width: data.max_width,
      height: data.height,
      fontsize: data.text_style?.font_size,
      multiLine: data.multi_lines,
      font: data.text_style?.font,
      align: data.text_style?.text_align_x,
      baseline: data.text_style?.text_align_y,
      style: style,
      orientation: data.text_style?.angle,
      color: data.text_style?.text_color
    } as TextParams
  }

  public static deserialize(data: any, scale: Vertex): newText {
    const textParams = newText.deserializeTextParams(data);
    const text = new newText(data.comment, new Vertex(data.position_x, data.position_y), textParams);
    text.isScaled = data.text_scaling ?? false;
    text.scale = new Vertex(scale.x, scale.y);
    return text
  }

  get fullFont(): string { return newText.buildFont(this.style, this.fontsize, this.font) }

  private getCornersUnscaled(): [Vertex, Vertex] {
    const firstCorner = this.origin.copy();
    const secondCorner = firstCorner.copy();
    const xMinMaxFactor = Math.sign(secondCorner.x) * 0.01 * Math.sign(this.scale.x);
    const yMinMaxFactor = Math.sign(secondCorner.y) * 0.01 * Math.sign(this.scale.y);
    if (this.align == "center") {
      firstCorner.x *= 0.99;
      secondCorner.x *= 1.01;
    } else if (["right", "end"].includes(this.align)) {
      if (secondCorner.x != 0) secondCorner.x *= 1 - xMinMaxFactor;
      else secondCorner.x = -Math.sign(this.scale.x);
    } else if (["left", "start"].includes(this.align)) {
      if (secondCorner.x != 0) secondCorner.x *= 1 + xMinMaxFactor;
      else secondCorner.x = Math.sign(this.scale.x);
    }
    if (this.baseline == "middle") {
      firstCorner.y *= 0.99;
      secondCorner.y *= 1.01;
    } else if (["top", "hanging"].includes(this.baseline)) {
      if (secondCorner.y != 0) secondCorner.y *= 1 + yMinMaxFactor;
      else secondCorner.y = Math.sign(this.scale.y);
    } else if (["bottom", "alphabetic"].includes(this.baseline)) {
      if (secondCorner.y != 0) secondCorner.y *= 1 - yMinMaxFactor;
      else secondCorner.y = -Math.sign(this.scale.y);
    }
    return [firstCorner, secondCorner]
  }

  private getCornersScaled(): [Vertex, Vertex] {
    const firstCorner = this.boundingBox.origin.copy();
    const diagonalVector = this.boundingBox.size.copy();
    const secondCorner = firstCorner.add(diagonalVector);
    return [firstCorner, secondCorner]
  }

  public getBounds(): [Vertex, Vertex] {
    const [firstCorner, secondCorner] = this.isScaled ? this.getCornersScaled() : this.getCornersUnscaled();
    return [
      new Vertex(Math.min(firstCorner.x, secondCorner.x), Math.min(firstCorner.y, secondCorner.y)),
      new Vertex(Math.max(firstCorner.x, secondCorner.x), Math.max(firstCorner.y, secondCorner.y))
    ]
  }

  private automaticFontSize(context: CanvasRenderingContext2D): number {
    let fontsize = Math.min(this.boundingBox.size.y ?? Number.POSITIVE_INFINITY, this.fontsize ?? Number.POSITIVE_INFINITY);
    if (fontsize == Number.POSITIVE_INFINITY) fontsize = DEFAULT_FONTSIZE;
    context.font = newText.buildFont(this.style, fontsize, this.font);
    if (context.measureText(this.text).width >= this.boundingBox.size.x) fontsize = fontsize * this.boundingBox.size.x / context.measureText(this.text).width;
    return fontsize
  }

  private setRectOffsetX(): number {
    if (this.align == "center") return -Math.sign(this.scale.x) * this.width / 2;
    if (["left", "start"].includes(this.align) && this.scale.x < 0) return this.width;
    if ((["right", "end"].includes(this.align) && this.scale.x > 0) || (["left", "start"].includes(this.align) && this.scale.x < 0)) return -this.width;
    return 0;
  }

  private setRectOffsetY(): number {
    if (this.baseline == "middle") return -Math.sign(this.scale.y) * this.height / 2;
    if (["top", "hanging"].includes(this.baseline) && this.scale.y < 0) return this.height;
    if (["bottom", "alphabetic"].includes(this.baseline) && this.scale.y > 0) return -this.fontsize * (this.rowIndices.length - 1);
    return 0;
  }

  public buildPath(): void { this.path = this.boundingBox.path }

  public static capitalize(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1) }

  public capitalizeSelf(): void { this.text = newText.capitalize(this.text) }

  public updateBoundingBox(context: CanvasRenderingContext2D): void {
    const matrix = context.getTransform();
    this.boundingBox.origin = this.origin.copy();
    this.boundingBox.origin.x += this.setRectOffsetX() / (this.isScaled ? Math.sign(this.scale.x) : matrix.a);
    this.boundingBox.origin.y += this.setRectOffsetY() / (this.isScaled ? Math.sign(this.scale.y) : matrix.d);
    this.boundingBox.size.x = this.width;
    this.boundingBox.size.y = this.height;
    if (!this.isScaled) {
      const boundingBox = new newRect(this.boundingBox.origin.copy(), this.boundingBox.size.scale(new Vertex(Math.abs(1 / matrix.a), Math.abs(1 / matrix.d))));
      boundingBox.buildPath();
      this.boundingBox.path = boundingBox.path;
    } else this.boundingBox.buildPath();
  }

  public draw(context: CanvasRenderingContext2D): void {
    if (this.text) {
      const contextMatrix = context.getTransform();
      const origin = this.origin.transform(contextMatrix);
      context.save();
      this.setBoundingBoxState();
      const writtenText = this.cleanStartAllRows(this.rowIndices.length == 0 ? this.format(context) : this.formattedTextRows());
      this.updateBoundingBox(context);
      this.buildPath();
      this.boundingBox.draw(context);

      context.font = this.fullFont;
      context.textAlign = this.align as CanvasTextAlign;
      context.textBaseline = this.baseline as CanvasTextBaseline;
      context.fillStyle = this.fillStyle;
      context.globalAlpha = this.alpha;

      context.resetTransform();
      context.translate(origin.x, origin.y);
      context.rotate(Math.PI / 180 * this.orientation);
      if (this.isScaled) context.scale(Math.abs(contextMatrix.a), Math.abs(contextMatrix.d));
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
    this.boundingBox.size.x = textParams.width ?? null;
    this.boundingBox.size.y = textParams.height ?? null;
    this.fontsize = textParams.fontsize ?? 12;
    this.multiLine = textParams.multiLine ?? false;
    this.font = textParams.font ?? "sans-serif";
    this.align = textParams.align ?? null;
    this.baseline = textParams.baseline ?? null;
    this.style = textParams.style ?? "";
    this.orientation = textParams.orientation ?? 0;
    this.boundingBox.fillStyle = textParams.backgroundColor ?? "hsla(0, 0%, 100%, 0)";
    this.fillStyle = textParams.color ?? "hsl(0, 0%, 0%)";
    this.scale = textParams.scale;
  }

  private write(writtenText: string[], context: CanvasRenderingContext2D): void {
    context.fillStyle = this.fillStyle;
    const nRows = writtenText.length - 1;
    const middleFactor = this.baseline == "middle" ? 2 : 1;
    if (nRows != 0) writtenText.forEach((row, index) => {
      if (["top", "hanging"].includes(this.baseline)) context.fillText(index == 0 ? newText.capitalize(row) : row, 0, index * this.fontsize + this.offset)
      else context.fillText(index == 0 ? newText.capitalize(row) : row, 0, (index - nRows / middleFactor) * this.fontsize + this.offset);
    })
    else context.fillText(newText.capitalize(writtenText[0]), 0, this.offset / middleFactor);
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

  private getLongestRow(context: CanvasRenderingContext2D, writtenText: string[]): number {
    return Math.max(...writtenText.map(row => context.measureText(row).width))
  }

  public formattedTextRows(): string[] {
    const writtenText = []
    this.rowIndices.slice(0, this.rowIndices.length - 1).forEach((_, rowIndex) => {
      writtenText.push(this.text.slice(this.rowIndices[rowIndex], this.rowIndices[rowIndex + 1]));
    })
    return writtenText
  }

  public format(context: CanvasRenderingContext2D): string[] {
    let writtenText = [this.text];
    let fontsize = this.fontsize ?? DEFAULT_FONTSIZE;
    if (this.boundingBox.size.x) {
      if (this.multiLine) [writtenText, fontsize] = this.multiLineSplit(fontsize, context)
      else fontsize = this.automaticFontSize(context);
    } else if (this.boundingBox.size.y) fontsize = this.fontsize ?? this.boundingBox.size.y;
    this.fontsize = Math.abs(fontsize);
    context.font = newText.buildFont(this.style, this.fontsize, this.font);
    this.height = writtenText.length * this.fontsize;
    this.width = this.getLongestRow(context, writtenText);
    this.rowIndices = [0];
    writtenText.forEach((row, index) => this.rowIndices.push(this.rowIndices[index] + row.length));
    return writtenText
  }

  public multiLineSplit(fontsize: number, context: CanvasRenderingContext2D): [string[], number] {
    context.font = newText.buildFont(this.style, fontsize, this.font);
    const oneRowLength = context.measureText(this.text).width;
    if (oneRowLength < this.boundingBox.size.x) {
      return [[this.text.trimStart()], fontsize > this.boundingBox.size.y ? this.boundingBox.size.y ?? fontsize : fontsize];
    }
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
    while (pickedChars < this.text.length) {
      let word = "";
      if (SEPARATORS.includes(this.text[pickedChars])) {
        word = this.text[pickedChars];
        pickedChars++;
      }
      else {
        while (!SEPARATORS.includes(this.text[pickedChars]) && pickedChars < this.text.length) {
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
        if (context.measureText(newRow + this.words[pickedWords]).width > this.boundingBox.size.x && newRow != '') break
        else {
          newRow += this.words[pickedWords];
          pickedWords++;
        }
      }
      if (newRow.length != 0) rows.push(newRow);
    }
    return rows
  }

  private cleanStartAllRows(rows: string[]): string[] { return rows.map(row => row.trimStart()) }

  private checkWordsLength(context: CanvasRenderingContext2D): boolean {
    for (let i = 0; i < this.words.length - 1; i++) {
      if (context.measureText(this.words[i]).width > this.boundingBox.size.x) return false;
    }
    return true
  }

  private autoFontSplit(fontsize: number, context: CanvasRenderingContext2D): [string[], number] {
    let increment = 1;
    let rows = [];
    let criterion = Number.POSITIVE_INFINITY;
    while (criterion > this.boundingBox.size.y && fontsize > 1) {
      context.font = newText.buildFont(this.style, fontsize, this.font);
      if (this.checkWordsLength(context)) {
        rows = this.fixedFontSplit(context);
        criterion = fontsize * rows.length;
      }
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
  orientation?: string,
  name?: string
}

export class newPointStyle implements PointStyleInterface {
  public size: number;
  public fillStyle: string;
  public strokeStyle: string;
  public marker: string;
  public lineWidth: number;
  public orientation: string;
  constructor(
    { size = null,
      color_fill = null,
      color_stroke = null,
      stroke_width = null,
      shape = 'circle',
      orientation = null,
      name = ''
    }: PointStyleInterface = {}
  ) {
    this.size = size;
    this.fillStyle = color_fill;
    this.strokeStyle = color_stroke;
    this.marker = shape;
    this.lineWidth = stroke_width;
    this.orientation = orientation;
  }
}

const CIRCLES = ['o', 'circle', 'round'];
const MARKERS = ['+', 'crux', 'mark'];
const CROSSES = ['x', 'cross', 'oblique'];
const SQUARES = ['square'];
const TRIANGLES = ['^', 'triangle', 'tri'];
const HALF_LINES = ['halfLine', 'halfline'];
const STROKE_STYLE_OFFSET = 15;
export class newPoint2D extends newShape {
  public path: Path2D;
  public center: Vertex;

  constructor(
    x: number = 0,
    y: number = 0,
    protected _size: number = 12,
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

  public get drawingStyle(): { [key: string]: any } {
    const style = super.drawingStyle;
    style["markerOrientation"] = this.markerOrientation;
    style["marker"] = this.marker;
    style["size"] = this.size;
    return style
  }

  public getBounds(): [Vertex, Vertex] { //TODO: not perfect when distance is large between points, should use point size, which is not so easy to get unscaled here (cf newText)
    const factor = 0.025;
    const minX = this.center.x != 0 ? this.center.x - Math.abs(this.center.x) * factor : -1;
    const minY = this.center.y != 0 ? this.center.y - Math.abs(this.center.y) * factor : -1;
    const maxX = this.center.x != 0 ? this.center.x + Math.abs(this.center.x) * factor : 1;
    const maxY = this.center.y != 0 ? this.center.y + Math.abs(this.center.y) * factor : 1;
    return [new Vertex(minX, minY), new Vertex(maxX, maxY)]
  }

  public static deserialize(data: any, scale: Vertex): newPoint2D {
    const point = new newPoint2D(data.cx, data.cy);
    point.isScaled = false;
    return point
  }

  public deserializeStyle(data: any): void {
    this.deserializeTooltip(data);
    this.deserializePointStyle(data.point_style ?? {});
  }

  protected deserializePointStyle(data: any): void {
    this.size = data.size ?? this.size;
    this.fillStyle = data.color_fill ?? this.fillStyle;
    this.strokeStyle = data.color_stroke ?? this.strokeStyle;
    this.lineWidth = data.stroke_width ?? this.lineWidth;
    this.marker = data.shape ?? this.marker;
    this.markerOrientation = data.orientation ?? this.markerOrientation;
  }

  public updateStyle(style: newPointStyle): void {
    this.size = style.size ?? this.size;
    this.fillStyle = style.fillStyle ?? this.fillStyle;
    this.strokeStyle = style.strokeStyle ?? this.strokeStyle;
    this.lineWidth = style.lineWidth ?? this.lineWidth;
    this.marker = style.marker ?? this.marker;
    this.markerOrientation = style.orientation ?? this.markerOrientation;
  }

  public styleToLegend(legendOrigin: Vertex, legendSize: Vertex): newPoint2D {
    const legend = new newPoint2D(legendOrigin.x, legendOrigin.y);
    legend.size = legendSize.y * 0.9;
    legend.marker = this.marker;
    legend.markerOrientation = this.markerOrientation;
    return legend
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
      const origin = new Vertex(this.center.x - halfSize, this.center.y - halfSize);
      marker = new newRect(origin, new Vertex(this.size, this.size));
    };
    if (TRIANGLES.includes(this.marker)) marker = new Triangle(this.center, this.size, this.markerOrientation);
    if (HALF_LINES.includes(this.marker)) marker = new HalfLine(this.center, this.size, this.markerOrientation);
    if (this.marker == 'line') marker = new LinePoint(this.center, this.size, this.markerOrientation);
    marker.lineWidth = this.lineWidth;
    this.isFilled = marker.isFilled;
    return marker
  }

  protected updateTooltipOrigin(matrix: DOMMatrix): void { this.tooltipOrigin = this.center.copy() }

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

  public buildPath(): void { this.path = this.drawnShape.path }

  protected buildUnscaledPath(context: CanvasRenderingContext2D) {
    const matrix = context.getTransform();
    context.resetTransform();
    const center = new Vertex(matrix.e, matrix.f).add(this.center.scale(new Vertex(matrix.a, matrix.d))).subtract(this.center);
    const path = new Path2D();
    path.addPath(this.drawnShape.path, new DOMMatrix([1, 0, 0, 1, center.x, center.y]));
    this.path = new Path2D();
    this.path.addPath(path, matrix.inverse());
    return path
  }

  public isInFrame(origin: Vertex, end: Vertex, scale: Vertex): boolean {
    const inCanvasX = this.center.x * scale.x < end.x && this.center.x * scale.x > origin.x;
    const inCanvasY = this.center.y * scale.y < end.y && this.center.y * scale.y > origin.y;
    this.inFrame = inCanvasX && inCanvasY;
    return this.inFrame
  }

  protected isPointInStroke(context: CanvasRenderingContext2D, point: Vertex): boolean {
    this.setContextPointInStroke(context);
    const isHovered = context.isPointInStroke(this.path, point.x, point.y);
    context.restore();
    return isHovered
  }

  protected setContextPointInStroke(context: CanvasRenderingContext2D): void {
    context.save();
    context.resetTransform();
  }
}

export class ScatterPoint extends newPoint2D {
  public mean = new Vertex();
  constructor(
    public values: number[],
    x: number = 0,
    y: number = 0,
    protected _size: number = 12,
    protected _marker: string = 'circle',
    protected _markerOrientation: string = 'up',
    fillStyle: string = null,
    strokeStyle: string = null
  ) {
    super(x, y, _size, _marker, _markerOrientation, fillStyle, strokeStyle);
    this.isScaled = false;
  }

  public static fromPlottedValues(indices: number[], pointsData: { [key: string]: number[] }, pointSize: number, marker: string,
    thresholdDist: number, tooltipAttributes: string[], features: Map<string, number[]>, axes: newAxis[],
    xName: string, yName: string): ScatterPoint {
    const newPoint = new ScatterPoint(indices, 0, 0, pointSize, marker);
    newPoint.computeValues(pointsData, thresholdDist);
    newPoint.updateTooltip(tooltipAttributes, features, axes, xName, yName);
    newPoint.update();
    return newPoint
  }

  protected setContextPointInStroke(context: CanvasRenderingContext2D): void {
    context.save();
    context.resetTransform();
    context.lineWidth = 10;
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

  public computeValues(pointsData: { [key: string]: number[] }, thresholdDist: number): void {
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
    this.size = Math.min(this.size * 1.15 ** (this.values.length - 1), thresholdDist);
    this.mean.x = meanX / this.values.length;
    this.mean.y = meanY / this.values.length;
  }
}

export class LineSequence extends newShape {
  public previousMouseClick: Vertex;
  public hoveredThickener: number = 2;
  public clickedThickener: number = 2;
  public selectedThickener: number = 2;
  constructor(
    public points: newPoint2D[] = [],
    public name: string = ""
  ) {
    super();
    this.isScaled = false;
    this.isFilled = false;
    this.updateTooltipMap();
  }

  public static deserialize(data: { [key: string]: any }, scale: Vertex): LineSequence {
    const points = [];
    data.lines.forEach(line => points.push(new newPoint2D(line[0], line[1])));
    const line = new LineSequence(points, data.name ?? "");
    line.deserializeEdgeStyle(data);
    line.isScaled = true;
    line.buildPath();
    return line
  }

  public initTooltip(context: CanvasRenderingContext2D): newTooltip {
    if (!this.tooltipOrigin) this.tooltipOrigin = this.points[Math.floor(this.points.length / 2)].center;
    return super.initTooltip(context);
  }

  public getBounds(): [Vertex, Vertex] { //TODO: not perfect when distance is large between points, should use point size, which is not so easy to get unscaled here (cf newText)
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    this.points.forEach(point => {
      if (point.center.x < minX) minX = point.center.x;
      if (point.center.y < minY) minY = point.center.y;
      if (point.center.x > maxX) maxX = point.center.x;
      if (point.center.y > maxY) maxY = point.center.y;
    })
    return [new Vertex(minX, minY), new Vertex(maxX, maxY)]
  }

  public mouseDown(mouseDown: Vertex) {
    super.mouseDown(mouseDown);
    if (this.isHovered) this.previousMouseClick = mouseDown.copy();
  }

  public updateTooltipMap() { this._tooltipMap = new Map<string, any>(this.name ? [["Name", this.name]] : []) }

  public static unpackGraphProperties(graph: { [key: string]: any }): LineSequence {
    const emptyLineSequence = new LineSequence([], graph.name);
    emptyLineSequence.deserializeEdgeStyle(graph);
    return emptyLineSequence
  }

  public setDrawingProperties(context: CanvasRenderingContext2D) {
    super.setDrawingProperties(context);
    const thickener = this.isSelected ? this.selectedThickener : this.isClicked ? this.clickedThickener : this.isHovered ? this.hoveredThickener : 0;
    context.lineWidth = this.lineWidth + thickener;
  }

  public buildPath(): void {
    this.path = new Path2D();
    this.path.moveTo(this.points[0].center.x, this.points[0].center.y);
    this.points.slice(1).forEach(point => this.path.lineTo(point.center.x, point.center.y));
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

  public initTooltip(context: CanvasRenderingContext2D): newTooltip {
    const tooltip = new newTooltip(this.tooltipOrigin, this.tooltipMap, context);
    tooltip.isFlipper = false;
    return tooltip
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

const MAX_LABEL_HEIGHT = 12;
export class newLabel extends newShape {
  public shapeSize: Vertex = new Vertex(30, MAX_LABEL_HEIGHT);
  public legend: newRect | LineSegment | newPoint2D;
  public maxWidth: number = 150;
  public readonly textOffset = 5;
  constructor(
    shape: newShape,
    public text: newText,
    public origin: Vertex = new Vertex(0, 0)
  ) {
    super();
    this.isScaled = false;
    this.text.width = this.maxWidth - this.shapeSize.x;
    this.getShapeStyle(shape, this.origin);
    this.buildPath();
  }

  public buildPath(): void {
    this.legend.buildPath();
    this.path = this.legend.path;
  }

  protected buildUnscaledPath(context: CanvasRenderingContext2D) {
    const matrix = context.getTransform();
    context.resetTransform();
    const origin = this.origin.transform(matrix);
    this.buildPath();
    const path = new Path2D();
    path.addPath(this.path);
    this.path = new Path2D();
    this.path.addPath(path, matrix.inverse());
    this.path.addPath(this.text.path, matrix.inverse());
    return path
  }

  private updateLegendGeometry(): void {
    if (this.legend instanceof LineSegment) {
      const margin = 2;
      this.legend.origin.x = this.origin.x;
      this.legend.origin.y = this.origin.y + margin;
      this.legend.end.x = this.origin.x + this.shapeSize.x;
      this.legend.end.y = this.origin.y + this.shapeSize.y - margin;
    }
    else if (this.legend instanceof newPoint2D) this.legend.center = this.origin.add(this.shapeSize.divide(2));
    else this.legend = new newRect(this.origin, this.shapeSize);
  }

  public getShapeStyle(shape: newShape, origin: Vertex): void {
    this.legend = shape.styleToLegend(origin, this.shapeSize);
    Object.entries(shape.drawingStyle).map(([key, value]) => this[key] = value);
  }

  public updateHeight(height: number): void {
    const heightRatio = height / this.shapeSize.y;
    this.shapeSize.x *= heightRatio;
    this.maxWidth *= heightRatio;
    this.shapeSize.y = height;
    if (this.legend instanceof newRect) this.legend.size.y = height
    else if (this.legend instanceof LineSegment) this.legend.end.y = this.legend.origin.y + height
    else this.legend.size = height;
    this.text.fontsize = height;
  }

  public static deserialize(data: any, scale: Vertex = new Vertex(1, 1)): newLabel {
    const textParams = newText.deserializeTextParams(data);
    const shape = data.shape ? newShape.deserialize(data.shape, scale) : new newRect();
    const text = new newText(data.title, new Vertex(0, 0), textParams);
    text.isScaled = false;
    text.baseline = "middle";
    text.align = "start";
    return new newLabel(shape, text)
  }

  public deserializeStyle(data): void {
    if (data.rectangle_edge_style) {
      data.edge_style = data.rectangle_edge_style;
      this.deserializeEdgeStyle(data);
    }
    if (data.rectangle_surface_style) {
      data.surface_style = data.rectangle_surface_style;
      this.deserializeSurfaceStyle(data);
    }
  }

  public updateOrigin(drawingZone: newRect, initScale: Vertex, nLabels: number): void {
    this.origin.x = drawingZone.origin.x + drawingZone.size.x - (initScale.x < 0 ? 0 : this.maxWidth);
    this.origin.y = drawingZone.origin.y + drawingZone.size.y - nLabels * this.shapeSize.y * 1.75 * initScale.y;
    this.updateLegendGeometry();
    this.text.origin = this.origin.add(new Vertex(this.shapeSize.x + this.textOffset, this.shapeSize.y / 2));
  }

  public draw(context: CanvasRenderingContext2D): void {
    super.draw(context);
    context.save();
    context.resetTransform();
    this.text.draw(context);
    context.restore();
  }

  public isPointInShape(context: CanvasRenderingContext2D, point: Vertex): boolean {
    return this.legend.isFilled ? context.isPointInPath(this.path, point.x, point.y) : (context.isPointInPath(this.path, point.x, point.y) || context.isPointInStroke(this.path, point.x, point.y))
  }
}

const TOOLTIP_TEXT_OFFSET = 10;
const TOOLTIP_TRIANGLE_SIZE = 10;
export class newTooltip {// TODO: make it a newShape
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
  public isFlipper = true;
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
        if (key != "name") {
          if (value != '') text = `${key}: ${this.formatValue(value)}`
          else text = key;
        }
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
      const text = new newText(row, textOrigin, { fontsize: this.fontsize, baseline: "middle", style: regexSamples.test(row) ? 'bold' : '' });
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

    } else if (upRightDiff.y > plotSize.y) {
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

    if (downLeftDiff.y < 0) { // Maybe wrong, did not meet the case
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
    this.initBoundariesVertex();
    this.dashLine = DASH_SELECTION_WINDOW;
    this.selectedStyle = this.clickedStyle = this.hoverStyle = this.fillStyle = "hsla(0, 0%, 100%, 0)";
    this.lineWidth = 0.5
  }

  get isDefined(): boolean { return (this.minVertex != null && this.maxVertex != null) }

  public setDrawingProperties(context: CanvasRenderingContext2D): void {
    super.setDrawingProperties(context);
    context.lineWidth = (this.isHovered || this.isClicked) ? this.lineWidth * 2 : this.lineWidth;
  }

  private initBoundariesVertex(): void {
    this.minVertex = this.origin.copy();
    this.maxVertex = this.origin.add(this.size);
    this.saveState();
  }

  public update(minVertex: Vertex, maxVertex: Vertex): void {
    this.minVertex = minVertex;
    this.maxVertex = maxVertex;
  }

  public updateRectangle(origin: Vertex, size: Vertex): void {
    this.origin = origin;
    this.size = size;
    this.initBoundariesVertex();
    this.buildPath();
  }

  public rubberBandUpdate(rubberBand: RubberBand, coordName: string): void {
    if (this.isDefined) {
      if (rubberBand.minValue != rubberBand.maxValue) {
        this.minVertex[coordName] = rubberBand.minValue;
        this.maxVertex[coordName] = rubberBand.maxValue;
      } else this.minVertex = this.maxVertex = null;
    }
  }

  public buildRectangle(frameOrigin: Vertex, frameSize: Vertex): void {
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
      this.rightUpdate = Math.abs(this.mouseClick.x - this.maxVertex.x) <= this.borderSizeX;
      this.downUpdate = Math.abs(this.mouseClick.y - this.minVertex.y) <= this.borderSizeY;
      this.upUpdate = Math.abs(this.mouseClick.y - this.maxVertex.y) <= this.borderSizeY;
    }
  }

  mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void {
    super.mouseMove(context, mouseCoords);
    if (!(this.leftUpdate || this.rightUpdate || this.downUpdate || this.upUpdate) && this.isClicked) {
      const translation = mouseCoords.subtract(this.mouseClick);
      this.minVertex = this._previousMin.add(translation);
      this.maxVertex = this._previousMax.add(translation);
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
  }

  public mouseUp(keepState: boolean) {
    super.mouseUp(keepState);
    this.isClicked = this.leftUpdate = this.rightUpdate = this.upUpdate = this.downUpdate = false;
  }
}

export class TitleSettings {
  constructor(
    public origin: Vertex = null,
    public align: string = null,
    public baseline: string = null,
    public orientation: number = null
  ) { }
}

export const SIZE_END = 7;
export class newAxis extends newShape {
  public ticksPoints: newPoint2D[];
  public rubberBand: RubberBand;

  public labels: string[];
  protected _ticks: number[];
  public tickPrecision: number;
  public ticksFontsize: number = 12;
  protected _isDiscrete: boolean = true;

  public drawPath: Path2D;
  public path: Path2D;
  public lineWidth: number = 1;
  public strokeStyle: string = 'hsl(0, 0%, 0%)';
  public hoverStyle: string = 'hsl(0, 100%, 48%)';
  public clickedStyle: string = 'hsl(126, 67%, 72%)';
  public rubberColor: string = 'hsl(200, 95%, 50%)';//'hsla(127, 95%, 60%, 0.85)';
  public rubberAlpha: number = 0.5;
  public mouseStyleON: boolean = false;

  public isHovered: boolean = false;
  public isClicked: boolean = false;
  public isInverted: boolean = false;
  public title: newText;
  public centeredTitle: boolean = false;
  public titleSettings: TitleSettings = new TitleSettings();
  public titleWidth: number;
  public font: string = 'sans-serif';

  public emitter: EventEmitter = new EventEmitter();
  public initMinValue: number;
  public initMaxValue: number;
  private _previousMin: number;
  private _previousMax: number;
  private _minValue: number;
  private _maxValue: number;

  private _marginRatio: number = 0.05;
  protected offsetTicks: number;
  public offsetTitle: number;
  protected maxTickWidth: number;
  protected maxTickHeight: number;

  readonly DRAW_START_OFFSET = 0;
  readonly SELECTION_RECT_SIZE = 10;
  readonly FONT_SIZE = 12;
  readonly isFilled = true;

  // OLD
  public is_drawing_rubberband: boolean = false;

  constructor(
    vector: any[] = null,
    public boundingBox: newRect,
    public origin: Vertex,
    public end: Vertex,
    public name: string = '',
    public initScale: Vertex,
    protected _nTicks: number = 10
  ) {
    super();
    this.discretePropertiesFromVector(vector);
    const [minValue, maxValue] = this.computeMinMax(vector);
    [this._previousMin, this._previousMax] = [this.initMinValue, this.initMaxValue] = [this.minValue, this.maxValue] = this.marginedBounds(minValue, maxValue);
    this.ticks = this.computeTicks();
    if (!this.isDiscrete) this.labels = this.numericLabels();
    this.computeEnds();
    this.adjustBoundingBox();
    this.drawPath = this.buildDrawPath();
    this.buildPath();
    this.rubberBand = new RubberBand(this.name, 0, 0, this.isVertical);
    this.updateOffsetTicks();
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

  get drawScale(): number { return this.drawLength / this.interval }

  get center(): number { return (this.maxValue + this.minValue) / 2 }

  get isVertical(): boolean { return this.origin.x == this.end.x };

  get isDiscrete(): boolean { return this._isDiscrete };

  set isDiscrete(value: boolean) { this._isDiscrete = value };

  set marginRatio(value: number) { this._marginRatio = value };

  get marginRatio(): number { return this._marginRatio };

  get tickMarker(): string { return "halfLine" }

  get tickOrientation(): string { return this.isVertical ? 'right' : 'up' }

  get minValue(): number { return this._minValue }

  set minValue(value: number) { this._minValue = value; this.emitter.emit("axisStateChange", this); }

  get maxValue(): number { return this._maxValue }

  set maxValue(value: number) { this._maxValue = value }

  set nTicks(value: number) { this._nTicks = value };

  get nTicks(): number {
    if (this.isDiscrete) return this.labels.length + 1
    return this._nTicks
  }

  get ticks(): number[] { return this._ticks }

  set ticks(value: number[]) { this._ticks = value }

  get titleText(): string { return newText.capitalize(this.name) }

  get transformMatrix(): DOMMatrix { return this.getValueToDrawMatrix() }

  protected updateOffsetTicks(): void { this.offsetTicks = Math.abs(this.boundingBox.size[this.isVertical ? "x" : "y"]) * 0.25 }

  private horizontalPickIdx(): number { return Math.sign(1 - Math.sign(this.initScale.y)) }

  private verticalPickIdx(): number { return Math.sign(1 - Math.sign(this.initScale.x)) }

  protected computeEnds(): void { }

  private discretePropertiesFromVector(vector: any[]): void {
    if (vector) {
      if (vector.length != 0) this.isDiscrete = typeof vector[0] == 'string';
      if (this.isDiscrete) this.labels = vector.length != 0 ? uniqueValues(vector) : ["0", "1"];
    } else {
      this.isDiscrete = true;
      this.labels = ["0", "1"];
    }
  }

  public otherAxisScaling(otherAxis: newAxis): void {
    const center = this.center;
    this.maxValue = this.minValue + otherAxis.interval * this.drawLength / otherAxis.drawLength;
    const translation = center - this.center;
    this.minValue += translation;
    this.maxValue += translation;
  }

  public transform(newOrigin: Vertex, newEnd: Vertex): void {
    this.origin = newOrigin.copy();
    this.end = newEnd.copy();
    this.rubberBand.isVertical = this.isVertical;
    this.drawPath = this.buildDrawPath();
    this.buildPath();
    this.emitter.emit("axisStateChange", this);
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

  public adjustBoundingBox(): void {
    if (this.isVertical) {
      this.boundingBox.size.x += SIZE_END / 2;
      this.boundingBox.size.y += SIZE_END;
    }
    else {
      this.boundingBox.size.x += SIZE_END;
      this.boundingBox.size.y += SIZE_END / 2;
    }
    this.boundingBox.buildPath();
  }

  protected buildDrawPath(): Path2D {
    const verticalIdx = Number(this.isVertical);
    const horizontalIdx = Number(!this.isVertical);
    const path = new Path2D();
    let endArrow: newPoint2D;
    if (this.isInverted) {
      endArrow = new newPoint2D(this.origin.x - SIZE_END / 2 * horizontalIdx, this.origin.y - SIZE_END / 2 * verticalIdx, SIZE_END, 'triangle', ['left', 'down'][verticalIdx]);
    } else {
      endArrow = new newPoint2D(this.end.x + SIZE_END / 2 * horizontalIdx, this.end.y + SIZE_END / 2 * verticalIdx, SIZE_END, 'triangle', ['right', 'up'][verticalIdx]);
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
    return min != max ? [min, max] : min != 0 ? [min * (min < 0 ? 1.3 : 0.7), max * (max < 0 ? 0.7 : 1.3)] : [-1, 1]
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
    this.maxTickWidth = Math.min(this.boundingBox.size.x - this.offsetTicks - 3, calibratedMeasure);
    this.maxTickHeight = Math.min(this.boundingBox.size.y - this.offsetTicks - 3, calibratedTickText.fontsize);
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
    context.setLineDash([]);
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
      width: this.titleWidth,
      fontsize: this.FONT_SIZE,
      font: this.font,
      align: align,
      color: color,
      baseline: baseline,
      style: 'bold',
      orientation: orientation,
      backgroundColor: "hsla(0, 0%, 100%, 0.5)",
      scale: new Vertex(1, 1)
    }
  }

  protected formatTitle(text: newText, context: CanvasRenderingContext2D): void { text.format(context) }

  protected updateTitle(context: CanvasRenderingContext2D, text: string, origin: Vertex, textParams: TextParams): void {
    this.title.text = text;
    this.title.origin = origin;
    this.title.updateParameters(textParams);
    this.title.boundingBox.buildPath();
    this.title.boundingBox.hoverStyle = this.title.boundingBox.clickedStyle = this.title.boundingBox.selectedStyle = this.title.boundingBox.fillStyle;
    this.title.rowIndices = [];
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
      this.titleSettings.baseline = ['bottom', 'top'][this.horizontalPickIdx()];
    }
    else {
      this.titleSettings.origin.y += this.FONT_SIZE;
      this.titleSettings.align = ["end", "start"][this.verticalPickIdx()];
      this.titleSettings.baseline = ['top', 'bottom'][this.horizontalPickIdx()];
    }
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
      width: textWidth, height: textHeight, fontsize: this.FONT_SIZE, font: this.font, scale: new Vertex(1, 1),
      align: textAlign, baseline: baseline, color: this.strokeStyle, backgroundColor: "hsl(0, 0%, 100%, 0.5)"
    }
  }

  protected drawTickPoint(context: CanvasRenderingContext2D, tick: number, vertical: boolean, HTMatrix: DOMMatrix, color: string): newPoint2D {
    const point = new newPoint2D(tick * Number(!vertical), tick * Number(vertical), SIZE_END / Math.abs(HTMatrix.a), this.tickMarker, this.tickOrientation, color);
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
    this.rubberBand.draw(this.isVertical ? this.origin.x : this.origin.y, context, this.rubberColor, this.rubberColor, 0.1, this.rubberAlpha);
    if (this.rubberBand.isClicked) this.emitter.emit("rubberBandChange", this.rubberBand);
  }

  protected mouseTranslate(mouseDown: Vertex, mouseCoords: Vertex): void { }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void {
    super.mouseMove(context, mouseCoords);
    this.boundingBox.mouseMove(context, mouseCoords);
    this.title.mouseMove(context, mouseCoords.scale(this.initScale));
    if (this.isClicked) {
      if (this.title.isClicked) this.mouseMoveClickedTitle(mouseCoords)
      else this.mouseMoveClickedArrow(mouseCoords);
    }
  }

  public mouseMoveClickedArrow(mouseCoords: Vertex): void {
    const downValue = this.absoluteToRelative(this.isVertical ? this.mouseClick.y : this.mouseClick.x);
    const currentValue = this.absoluteToRelative(this.isVertical ? mouseCoords.y : mouseCoords.x);
    if (!this.rubberBand.isClicked) {
      this.rubberBand.minValue = Math.min(downValue, currentValue);
      this.rubberBand.maxValue = Math.max(downValue, currentValue);
    } else this.rubberBand.mouseMove(downValue, currentValue);
  }

  public mouseMoveClickedTitle(mouseCoords: Vertex): void { }

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

  public mouseUp(keepState: boolean): void {
    super.mouseUp(keepState);
    this.isClicked = false;
    this.boundingBox.isClicked = false;
    this.title.mouseUp(false);
    this.title.isClicked = false;
    this.rubberBand.mouseUp();
    if (this.is_drawing_rubberband) this.emitter.emit("rubberBandChange", this.rubberBand);
    this.is_drawing_rubberband = false;
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
    for (let index = 0; index < this.ticks.length - 1; index++) {
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
  private _hasMoved: boolean = false;
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

  get hasMoved(): boolean { return this._hasMoved }

  set hasMoved(value: boolean) { this._hasMoved = value; if (this._hasMoved) this.emitter.emit("axisStateChange", this) }

  protected updateOffsetTicks(): void { this.offsetTicks = 10 } // TODO: make it responsive

  public resetScale(): void {
    this.isInverted = false;
    super.resetScale();
  }

  public setTitleSettings(): void {
    this.isVertical ? this.verticalTitleProperties() : this.horizontalTitleProperties()
  }

  private horizontalTitleProperties(): void {
    this.titleSettings.origin.y = this.titleZone.origin.y + this.titleZone.size.y;
    this.titleSettings.baseline = this.initScale.y > 0 ? "bottom" : "top";
    this.titleSettings.orientation = 0;
  }

  private verticalTitleProperties(): void {
    this.titleSettings.baseline = this.initScale.y > 0 ? "top" : "bottom";
    this.titleSettings.orientation = 0;
  }

  public computeTitle(index: number, nAxis: number): ParallelAxis {
    this.titleZone = new newRect(this.origin.copy(), this.boundingBox.size.copy());
    const SIZE_FACTOR = 0.35;
    let offset = 0;
    if (this.isVertical) {
      offset = this.drawLength + Math.min(SIZE_END * 2, this.drawLength * 0.05);
      this.titleZone.origin.y += offset;
    } else {
      offset = this.offsetTicks + this.FONT_SIZE + SIZE_END;
      if (index != nAxis - 1) this.titleZone.size.x *= SIZE_FACTOR;
      this.titleZone.size.y = Math.abs(this.boundingBox.origin.y) - Math.abs(this.origin.y);
      this.titleZone.origin.y -= this.titleZone.size.y;
    }
    this.titleZone.size.y -= offset;
    this.titleZone.buildPath();
    this.titleSettings.origin = this.titleZone.origin.copy();
    this.titleSettings.align = this.initScale.x > 0 ? "left" : "right";

    if (this.isVertical) this.titleSettings.align = "center";
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
      this.boundingBox.size.x -= SIZE_END / 2;
    }
    else this.boundingBox.size.y -= SIZE_END / 2;
  }

  public mouseMoveClickedTitle(mouseCoords: Vertex): void {
    const translation = mouseCoords.subtract(this.mouseClick);
    this.translate(this._previousOrigin.add(translation), this._previousEnd.add(translation));
    if (translation.norm > 10) this.hasMoved = true;
  }

  public mouseUp(keepState: boolean): void {
    if (this.title.isClicked && this.title.isHovered && !this.hasMoved) {
      this.title.isClicked = false;
      this.flip();
    }
    if (this.hasMoved) this.updateEnds();
    this.hasMoved = false;
    super.mouseUp(keepState);
  }

  private updateEnds(): void {
    this._previousOrigin = this.origin.copy();
    this._previousEnd = this.end.copy();
  }

  protected flip(): void {
    this.isInverted = !this.isInverted;
    this.emitter.emit("axisStateChange", this);
  }

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
    this.maxTickWidth = this.origin.x - this.boundingBox.origin.x - this.offsetTicks - 3;
    this.maxTickHeight = Math.min(this.boundingBox.size.y - this.offsetTicks - 3 - SIZE_END / 2, calibratedTickText.fontsize);
    context.restore();
  }
}

export class ShapeCollection {
  public minimum: Vertex;
  public maximum: Vertex;
  constructor(
    public shapes: newShape[] = [],
  ) {
    [this.minimum, this.maximum] = this.getBounds();
  }

  public get length(): number { return this.shapes.length }

  public includes(shape: newShape) { return this.shapes.includes(shape) }

  public static fromPrimitives(primitives: { [key: string]: any }, scale: Vertex = new Vertex(1, 1)): ShapeCollection {
    return new ShapeCollection(primitives.map(primitive => newShape.deserialize(primitive, scale)))
  }

  public getBounds(): [Vertex, Vertex] {
    let minimum = new Vertex(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    let maximum = new Vertex(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
    this.shapes.forEach(shape => {
      const [shapeMin, shapeMax] = shape.getBounds();
      if (shapeMin.x <= minimum.x) minimum.x = shapeMin.x; //for NaN reasons, must change
      if (shapeMin.y <= minimum.y) minimum.y = shapeMin.y;
      if (shapeMax.x >= maximum.x) maximum.x = shapeMax.x;
      if (shapeMax.y >= maximum.y) maximum.y = shapeMax.y;
    })
    return [minimum, maximum]
  }

  public drawTooltips(canvasOrigin: Vertex, canvasSize: Vertex, context: CanvasRenderingContext2D, inMultiPlot: boolean): void {
    this.shapes.forEach(shape => { if (!inMultiPlot && shape.inFrame) shape.drawTooltip(canvasOrigin, canvasSize, context) });
  }

  public mouseMove(context: CanvasRenderingContext2D, mouseCoords: Vertex): void {
    this.shapes.forEach(shape => shape.mouseMove(context, mouseCoords));
  }

  public mouseDown(mouseCoords: Vertex): newShape {
    let clickedObject: newShape = null;
    this.shapes.forEach(shape => {
      shape.mouseDown(mouseCoords);
      if (shape.isHovered) clickedObject = shape; //TODO: still insane ?
    });
    return clickedObject
  }

  public mouseUp(keepState: boolean): void { this.shapes.forEach(shape => shape.mouseUp(keepState)) }

  public draw(context: CanvasRenderingContext2D): void { this.shapes.forEach(shape => shape.draw(context)) }

  public removeShape(index: number): void {
    this.shapes.splice(index, 1);
    [this.minimum, this.maximum] = this.getBounds();
  }

  public updateBounds(context: CanvasRenderingContext2D): void {
    this.shapes.forEach(shape => {
      if (shape instanceof newText) {
        shape.format(context);
        shape.updateBoundingBox(context);
        const [textMin, textMax] = shape.getBounds();
        this.minimum.x = Math.min(this.minimum.x, textMin.x);
        this.minimum.y = Math.min(this.minimum.y, textMin.y);
        this.maximum.x = Math.max(this.maximum.x, textMax.x);
        this.maximum.y = Math.max(this.maximum.y, textMax.y);
      }
    })
    if (Number.isNaN(this.minimum.x)) this.minimum.x = this.maximum.x - 1;
    if (Number.isNaN(this.minimum.y)) this.minimum.y = this.maximum.y - 1;
    if (Number.isNaN(this.maximum.x)) this.maximum.x = this.maximum.x + 1;
    if (Number.isNaN(this.maximum.y)) this.maximum.y = this.maximum.y + 1;
  }

  public updateShapeStates(stateName: string): number[] {
    const newShapeStates = [];
    this.shapes.forEach((shape, index) => {
      if (shape[stateName] && !(shape instanceof SelectionBox)) newShapeStates.push(index);
    });
    return newShapeStates
  }

  public resetShapeStates(): void {
    this.shapes.forEach(shape => shape.isHovered = shape.isClicked = shape.isSelected = false);
  }

  public locateLabels(drawingZone: newRect, initScale: Vertex): void {
    const nLabels = 0.5 * initScale.y;
    const labels: newLabel[] = [];
    const others = [];
    this.shapes.forEach(shape => {
      if (shape instanceof newLabel) labels.push(shape)
      else others.push(shape);
    })
    if (labels.length != 0) {
      const labelHeight = Math.min(Math.abs(drawingZone.size.y) / (labels.length * 1.75 + 1), MAX_LABEL_HEIGHT);
      labels.forEach((label, index) => {
        label.updateHeight(labelHeight);
        label.updateOrigin(drawingZone, initScale, index - nLabels);
      });

    }
    this.shapes = [...others, ...labels];
  }
}

export class SelectionBoxCollection extends ShapeCollection {
  constructor(public shapes: SelectionBox[] = []) { super(shapes) }
}

export class GroupCollection extends ShapeCollection {
  constructor(
    public shapes: any[] = [],
  ) {
    super(shapes);
  }

  public shapeIsContainer(shape: any): boolean { return shape.values?.length > 1 || shape instanceof LineSequence }

  public drawTooltips(canvasOrigin: Vertex, canvasSize: Vertex, context: CanvasRenderingContext2D, inMultiPlot: boolean): void {
    this.shapes.forEach(shape => { if ((this.shapeIsContainer(shape) || !inMultiPlot) && shape.inFrame) shape.drawTooltip(canvasOrigin, canvasSize, context) });
  }

  public updateShapeStates(stateName: string): number[] {
    const newShapeStates = [];
    this.shapes.forEach((shape, index) => {
      if (shape.values) {
        if (shape[stateName]) shape.values.forEach(sample => newShapeStates.push(sample));
      } else {
        if (shape[stateName] && !(shape instanceof SelectionBox)) newShapeStates.push(index);
      }
    });
    return newShapeStates
  }
}
