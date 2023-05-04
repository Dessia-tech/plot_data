import { Frame } from "../../src/subplots";

export function initRubberBand(frame: Frame) {
    frame.axes[0].rubberBand.minValue = 600;
    frame.axes[0].rubberBand.maxValue = 6500;
    frame.axes[1].rubberBand.minValue = 0.9;
    frame.axes[1].rubberBand.maxValue = 5.1;
    frame.draw();
}