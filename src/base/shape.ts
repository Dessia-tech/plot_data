// import { string_to_hex } from "./functions";

const string_to_hex_dict = {red:'#f70000', lightred:'#ed8080', blue:'#0013fe', lightblue:'#c3e6fc', lightskyblue:'#87cefa', green:'#00c112', lightgreen:'#89e892', yellow:'#f4ff00', lightyellow:'#f9ff7b', orange:'#ff8700',
lightorange:'#ff8700', cyan:'#13f0f0', lightcyan:'#90f7f7', rose:'#ff69b4', lightrose:'#ffc0cb', violet:'#ee82ee', lightviolet:'#eaa5f6', white:'#ffffff', black:'#000000', brown:'#cd8f40',
lightbrown:'#deb887', grey:'#a9a9a9', lightgrey:'#d3d3d3'};

function string_to_hex(str:string): string {
  if (!Object.keys(string_to_hex_dict).includes(str)) {throw new Error('string_to_hex -> Invalid color : ' + str + ' not in list');}
  return string_to_hex_dict[str];
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
  