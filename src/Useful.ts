export class MyMath {
    public static round(x:number, n:number) {
      return Math.round(x*Math.pow(10,n)) / Math.pow(10,n);
    }
    public static log10(x) {
      return Math.log(x)/Math.log(10)
    }
  }
  
export class Shape {
    public static drawLine(context, start, end) {
      context.moveTo(start[0], start[1]);
      context.lineTo(end[0], end[1]);
    }
  
    public static crux(context:any, cx:number, cy:number, length:number) {
      this.drawLine(context, [cx, cy], [cx - length, cy]);
      this.drawLine(context, [cx, cy], [cx + length, cy]);
      this.drawLine(context, [cx, cy], [cx, cy - length]);
      this.drawLine(context, [cx, cy], [cx, cy + length]);
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
        Shape.drawLine(context, [x+w + 5, y+h/1.8], [x+w+5+text_w, y+h/2]);
        context.stroke();
      }
      context.closePath();
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