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
