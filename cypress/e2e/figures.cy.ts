import { Vertex } from "../../instrumented/baseShape";
import { Rect } from "../../instrumented/primitives";
import { RubberBand } from "../../instrumented/shapes";
import { Axis } from "../../instrumented/axes";
import { Figure, PrimitiveGroupContainer, Histogram, Scatter, Draw, ParallelPlot, Graph2D } from "../../instrumented/figures";

const data = {
    "name": "", 
    "attribute_names": ["x", "y"], 
    "x_variable": "x",
    "elements": [
        {
            "name": "", 
            "values": { "x": 0, "y": 1 },
            "x": 0, 
            "y": 1 
        },
        {
            "name": "", 
            "values": { "x": 1, "y": 2 },
            "x": 1, 
            "y": 2
        },
        {
            "name": "", 
            "values": { "x": 2, "y": 3 },
            "x": 2, 
            "y": 3 
        }
    ],
    "primitives": [
        { "name": "", "cx": 3, "cy": 3, "type_": "point" },
        { "name": "", "cx": 8, "cy": 3, "type_": "point" },
        { "name": "", "data": [66, 11.5, 73, 11.5], "point1": [66, 11.5], "point2": [73, 11.5], "type_": "linesegment2d" }
    ]
}

const canvasID = "canvas";
const canvas = document.createElement(canvasID);
canvas.id = canvasID;
canvas.width = 1000;
canvas.height = 1000;
document.body.appendChild(canvas);

describe("Figure", function() {
    it('should create a new instance of Figure from multiplot data with valid arguments', function() {
        const dataTypes = ["histogram", "parallelplot", "draw", "primitivegroupcontainer", "graph2d"];
        data["type_"] = "scatterplot";
        const classes = [Histogram, ParallelPlot, Draw, PrimitiveGroupContainer, Graph2D];
        const scatter = Figure.fromMultiplot(data, canvas.width, canvas.height, canvasID);
        expect(scatter, `Scatter`).to.be.instanceof(Scatter);

        const features = scatter.features;
        dataTypes.forEach((dataType, i) => {
            data.attribute_names = ["x", "y"];
            data["type_"] = dataType;
            const figure = Figure.createFromMultiplot(data, features, scatter.context, canvasID);
            expect(figure, `${dataType}`).to.be.instanceof(classes[i]);
        });
    });

    it("should be resized with new inputs", function() {
        const figure = new Figure(data, canvas.width, canvas.height, 0, 0, canvasID, true);
        figure.setCanvas(canvasID);
        const newOrigin = new Vertex(15, 15);
        const newWidth = 250;
        const newHeight = 400;
        figure.multiplotResize(newOrigin, newWidth, newHeight);

        expect(figure.origin, "origin").to.deep.equal(newOrigin);
        expect(figure.size, "size").to.deep.equal(new Vertex(newWidth, newHeight));
    });

    it("should send its rubberBand to other figures", function() {
        data["type_"] = "scatterplot";
        const scatter = Figure.fromMultiplot(data, canvas.width, canvas.height, canvasID);
        scatter.setCanvas(canvasID);
        scatter.axes[0].rubberBand.minValue = 1;
        scatter.axes[0].rubberBand.maxValue = 4;
        scatter.axes[1].rubberBand.minValue = 2;
        scatter.axes[1].rubberBand.maxValue = 5;

        data["attribute_names"] = ["y", "x"];
        const scatter2 = Figure.fromMultiplot(data, canvas.width, canvas.height, canvasID);

        data["type_"] = "parallelplot";
        const parallelPlot = Figure.fromMultiplot(data, canvas.width, canvas.height, canvasID);

        scatter.sendRubberBandsMultiplot([scatter2, parallelPlot]);

        expect(scatter2.axes[0].rubberBand, "scatter2.axes[0].rubberBand").to.not.deep.equal(scatter.axes[1].rubberBand);
        expect(scatter2.axes[1].rubberBand, "scatter2.axes[1].rubberBand").to.not.deep.equal(scatter.axes[0].rubberBand);

        expect(parallelPlot.axes[0].rubberBand, "parallelPlot.axes[0].rubberBand").to.deep.equal(scatter.axes[1].rubberBand); // equal cause it is vertical too
        expect(parallelPlot.axes[1].rubberBand, "parallelPlot.axes[1].rubberBand").to.not.deep.equal(scatter.axes[0].rubberBand);

        expect(scatter2.axes[0].rubberBand.minValue, "scatter2.axes[0].rubberBand.minValue").to.be.equal(scatter.axes[1].rubberBand.minValue);
        expect(scatter2.axes[0].rubberBand.maxValue, "scatter2.axes[0].rubberBand.maxValue").to.be.equal(scatter.axes[1].rubberBand.maxValue);
        expect(scatter2.axes[1].rubberBand.minValue, "scatter2.axes[1].rubberBand.minValue").to.be.equal(scatter.axes[0].rubberBand.minValue);
        expect(scatter2.axes[1].rubberBand.maxValue, "scatter2.axes[1].rubberBand.maxValue").to.be.equal(scatter.axes[0].rubberBand.maxValue);
        
        expect(parallelPlot.axes[0].rubberBand.minValue, "parallelPlot.axes[0].rubberBand.minValue").to.be.equal(scatter.axes[1].rubberBand.minValue);
        expect(parallelPlot.axes[1].rubberBand.maxValue, "parallelPlot.axes[1].rubberBand.maxValue").to.be.equal(scatter.axes[0].rubberBand.maxValue);
        expect(parallelPlot.axes[0].rubberBand.minValue, "parallelPlot.axes[0].rubberBand.minValue").to.be.equal(scatter.axes[1].rubberBand.minValue);
        expect(parallelPlot.axes[1].rubberBand.maxValue, "parallelPlot.axes[1].rubberBand.maxValue").to.be.equal(scatter.axes[0].rubberBand.maxValue);
    });

    it("should initialize and update rubberBands in multiplot", function() {
        data["type_"] = "scatterplot";
        const multiplotRubberBands = new Map<string, RubberBand>();
        const scatter = Figure.fromMultiplot(data, canvas.width, canvas.height, canvasID);
        scatter.setCanvas(canvasID);
        const referenceRubberBands = new Map<string, RubberBand>([
            [scatter.axes[0].name, scatter.axes[0].rubberBand],
            [scatter.axes[1].name, scatter.axes[1].rubberBand]
        ]);
        scatter.initRubberBandMultiplot(multiplotRubberBands);

        expect(multiplotRubberBands, "empty multiplotRubberBands").to.deep.equal(referenceRubberBands);

        scatter.axes[0].rubberBand.minValue = 1;
        scatter.axes[0].rubberBand.maxValue = 4;
        scatter.axes[1].rubberBand.minValue = 2;
        scatter.axes[1].rubberBand.maxValue = 5;
        scatter.updateRubberBandMultiplot(multiplotRubberBands);

        expect(multiplotRubberBands, "edited multiplotRubberBands").to.deep.equal(referenceRubberBands);
    })
});