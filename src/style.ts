import { string_to_hex, string_to_rgb, colorHex } from "./color_conversion";

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
        return new EdgeStyle(serialized['line_width'],
                            colorHex(serialized['color_stroke']),
                            serialized['dashline'],
                            serialized['name']);
    }
}

export class HatchingSet {
    constructor(public name: string,
                public lineWidth: number = 0,
                public step: number = 0) {}

    public static deserialize(serialized) {
        return new HatchingSet(serialized['name'], serialized['stroke_width'], serialized['hatch_spacing']);
    }

    generate_canvas(fillStyle: string) { // TODO: Study this
      const nLines = this.lineWidth == 0 ? 0 : 20;
      const maxSize = nLines * this.step;
      const hatchCanvas = document.createElement("canvas");
      hatchCanvas.width = maxSize;
      hatchCanvas.height = maxSize;
      const context = this.setContext(hatchCanvas.getContext("2d"), fillStyle);
      context.beginPath();
      let xCoord = -((maxSize ** 2 / 2) ** 0.5);
      let yCoord = (maxSize ** 2 / 2) ** 0.5;
      for (let i = 0; i <= 2 * nLines; i++) {
        xCoord += this.step;
        yCoord -= this.step;
        context.moveTo(xCoord, yCoord);
        context.lineTo(xCoord + maxSize, yCoord + maxSize);
      }
      context.fillRect(0, 0, maxSize, maxSize);
      context.stroke();
      return hatchCanvas;
    }

    private setContext(context: CanvasRenderingContext2D, fillStyle: string): CanvasRenderingContext2D {
      context.lineCap = 'square';
      context.fillStyle = fillStyle;
      context.strokeStyle = 'black';
      context.lineWidth = this.lineWidth;
      return context
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
      return new PointStyle(colorHex(serialized['color_fill']),
      colorHex(serialized['color_stroke']),
                            serialized['stroke_width'],
                            serialized['size'],
                            serialized['shape'],
                            serialized['name']);
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
      if (serialized['hatching'] != null) {
        var hatching = HatchingSet.deserialize(serialized['hatching']);
      }
      return new SurfaceStyle(colorHex(serialized['color_fill']),
                                 serialized['opacity'],
                                 hatching);
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
                public angle: number = 0,
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
      this.refresh_font();
    }

    refresh_font() {
      this.option = '';
      if (this.bold && !this.italic) this.option = 'bold ';
      else if (this.italic && !this.bold) this.option = 'italic ';
      else if (this.italic && this.bold) this.option = 'bold italic ';
      this.font = this.option + this.font_size.toString() + 'px ' + this.font_style;
    }

    public static deserialize(serialized) {
      let default_dict_ = {text_color:string_to_rgb('black'), font_size:12,
                           font_style:'sans-serif', text_align_x:'start',
                           text_align_y: 'alphabetic', name:''};
      return new TextStyle(colorHex(serialized['text_color']),
                              serialized['font_size'],
                              serialized['font_style'],
                              serialized['text_align_x'],
                              serialized['text_align_y'],
                              serialized['bold'],
                              serialized['italic'],
                              serialized["angle"],
                              serialized['name']);
    }

    get_font_from_size(font_size:number): string {
      return this.font = this.option + font_size.toString() + 'px ' + this.font_style;
    }
}
