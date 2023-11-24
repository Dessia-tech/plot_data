import { ZOOM_FACTOR } from "../../instrumented/constants";
import { Vertex } from "../../instrumented/baseShape";
import { RubberBand } from "../../instrumented/shapes";
import { Figure, Frame, Histogram, Scatter, Draw, ParallelPlot, Graph2D, PrimitiveGroupContainer } from "../../instrumented/figures";

const data = {
    "name": "",
    "attribute_names": ["x", "y"],
    "x_variable": "x",
    "elements": [
        { "name": "", "values": { "x": 0, "y": 1 }, "x": 0, "y": 1 },
        { "name": "", "values": { "x": 1, "y": 2 }, "x": 1, "y": 2 },
        { "name": "", "values": { "x": 1, "y": 2 }, "x": 1, "y": 2 },
        { "name": "", "values": { "x": 1, "y": 2 }, "x": 1, "y": 2 },
        { "name": "", "values": { "x": 1, "y": 2 }, "x": 1, "y": 2 },
        { "name": "", "values": { "x": 2, "y": 1 }, "x": 2, "y": 1 },
        { "name": "", "values": { "x": 2, "y": 2 }, "x": 2, "y": 2 },
        { "name": "", "values": { "x": 2, "y": 2 }, "x": 2, "y": 2 },
        { "name": "", "values": { "x": 3, "y": 2 }, "x": 3, "y": 2 },
        { "name": "", "values": { "x": 4, "y": 3 }, "x": 4, "y": 3 }
    ],
    "primitives": [
        { "name": "", "cx": 3, "cy": 3, "type_": "point" },
        { "name": "", "cx": 8, "cy": 3, "type_": "point" },
        { "name": "", "data": [66, 11.5, 73, 11.5], "point1": [66, 11.5], "point2": [73, 11.5], "type_": "linesegment2d" }
    ]
}

const mouseMove = new MouseEvent('mousemove', { clientX: 150, clientY: 150 });
const mouseWheel = new WheelEvent('wheel', { clientX: 150, clientY: 150, deltaY: ZOOM_FACTOR });

const canvasID = "canvas";
const canvas = document.createElement(canvasID);
canvas.id = canvasID;
canvas.width = 1000;
canvas.height = 1000;
document.body.appendChild(canvas);

describe("Figure", function() {
    it('should create a new instance of Figure from multiplot data with valid arguments', function() {
        data["type_"] = "scatterplot";
        const scatter = Figure.fromMultiplot(data, canvas.width, canvas.height, canvasID);
        expect(scatter, `Scatter`).to.be.instanceof(Scatter);

        const dataTypes = ["histogram", "parallelplot", "draw", "primitivegroupcontainer", "graph2d"];
        const classes = [Histogram, ParallelPlot, Draw, PrimitiveGroupContainer, Graph2D];
        const features = scatter.features;
        dataTypes.forEach((dataType, i) => {
            data.attribute_names = ["x", "y"];
            data["type_"] = dataType;
            const figure = Figure.createFromMultiplot(data, features, scatter.context, canvasID);
            expect(figure, `${dataType}`).to.be.instanceof(classes[i]);
        });
    });

    it('should throw an error while instancing plot with wrong type_', function() {
        data["type_"] = "scatterplot";
        const scatter = Figure.fromMultiplot(data, canvas.width, canvas.height, canvasID);

        data["type_"] = "unknown";
        const features = scatter.features;
        expect(() => {
            Figure.createFromMultiplot(data, features, scatter.context, canvasID);
        }, "unknown").to.throw("unknown is not a known type of plot. Possible plots <type_> attributes are 'scatterplot', 'graph2d', 'parallelplot', 'histogram', 'draw', 'primitivegroupcontainer'.");
    });

    it("should be resized with new inputs", function() {
        const figure = new Figure(data, canvas.width, canvas.height, 0, 0, canvasID, true);
        figure.setCanvas(canvasID);
        const newOrigin = new Vertex(15, 15);
        const newWidth = 250;
        const newHeight = 400;
        figure.boundingBoxResize(newOrigin, newWidth, newHeight);

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
    });
});

describe("Frame", function() {
    it("should be built without attribute_names", function() {
        const data = {
            "name": "",
            "elements": [
                { "name": "", "values": { "x": 0, "y": 1 }, "x": 0, "y": 1 },
                { "name": "", "values": { "x": 1, "y": 2 }, "x": 1, "y": 2 },
                { "name": "", "values": { "x": 2, "y": 3 }, "x": 2, "y": 3 }
            ]
        };
        const frame = new Frame(data, canvas.width, canvas.height, 0, 0, canvasID, false);
        expect(frame.xFeature, "xFeature").to.be.equal("x");
        expect(frame.yFeature, "yFeature").to.be.equal("y");
        expect(frame.axes[0].ticks[0], "axes[0].ticks[0]").to.be.equal(0);
        expect(frame.axes[0].ticks[4], "axes[0].ticks[4]").to.be.equal(0.8);
    });

    it("should be built with empty attribute_names", function() {
        const data = {
            "name": "",
            "attribute_names": [],
            "elements": [
                { "name": "", "values": { "x": 0, "y": 1 }, "x": 0, "y": 1 },
                { "name": "", "values": { "x": 1, "y": 2 }, "x": 1, "y": 2 },
                { "name": "", "values": { "x": 2, "y": 3 }, "x": 2, "y": 3 }
            ],
            "type_": "frame"
        };
        const frame = new Frame(data, canvas.width, canvas.height, 0, 0, canvasID, false);
        expect(frame.xFeature, "xFeature").to.be.equal("indices");
        expect(frame.yFeature, "yFeature").to.be.equal("x");
        expect(frame.axes[0].ticks[0], "axes[0].ticks[0]").to.be.equal(0);
        expect(frame.axes[0].ticks[4], "axes[0].ticks[4]").to.be.equal(0.8);
    });

    it("should change axis feature", function() {
        const frame = new Frame(data, canvas.width, canvas.height, 0, 0, canvasID, false);
        frame.setCanvas(canvasID);
        frame.changeAxisFeature("name", 0);
        expect(frame.axes[0].name, "axes[0].name").to.be.equal("name");
    });

    it("should handle wheel events", function() {
        const frame = new Frame(data, canvas.width, canvas.height, 0, 0, canvasID, false);
        const minValue0 = frame.axes[0].minValue;
        const maxValue0 = frame.axes[0].maxValue;
        const minValue1 = frame.axes[1].minValue;
        const maxValue1 = frame.axes[1].maxValue;

        frame.setCanvas(canvas.id);
        frame.mouseListener();
        canvas.dispatchEvent(mouseMove);
        canvas.dispatchEvent(mouseWheel);

        expect(frame.axes[0].minValue, "minValue0").to.not.be.equal(minValue0);
        expect(frame.axes[0].maxValue, "maxValue0").to.not.be.equal(maxValue0);
        expect(frame.axes[1].minValue, "minValue0").to.not.be.equal(minValue1);
        expect(frame.axes[1].maxValue, "maxValue1").to.not.be.equal(maxValue1);
    });
});

describe("Histogram", function() {
    data["type_"] = "histogram";
    const histogram = new Histogram(data, canvas.width, canvas.height, 0, 0, canvasID, false);
    histogram.setCanvas(canvas.id);
    histogram.mouseListener();
    histogram.draw();
    const initBars = histogram.bars;

    it("should zoom correctly", function() {
        canvas.dispatchEvent(mouseMove);
        canvas.dispatchEvent(mouseWheel);
        canvas.dispatchEvent(mouseWheel);
        expect(histogram.bars, "bars").to.not.deep.equal(initBars);
    });

    it("should reset correctly", function() {
        histogram.reset();
        expect(histogram.bars, "bars").to.deep.equal(initBars);
    });
});

describe("Scatter", function() {
    const data = {
        "name": "",
        "attribute_names": ["y", "x"],
        "elements": [
            { "name": "", "values": { "x": 0, "y": 1 }, "x": 0, "y": 1 },
            { "name": "", "values": { "x": 1, "y": 2 }, "x": 1, "y": 2 },
            { "name": "", "values": { "x": 1, "y": 2 }, "x": 1, "y": 2 },
            { "name": "", "values": { "x": 1, "y": 2 }, "x": 1, "y": 2 },
            { "name": "", "values": { "x": 1, "y": 2 }, "x": 1, "y": 2 },
            { "name": "", "values": { "x": 2, "y": 1 }, "x": 2, "y": 1 },
            { "name": "", "values": { "x": 2, "y": 2 }, "x": 2, "y": 2 },
            { "name": "", "values": { "x": 2, "y": 2 }, "x": 2, "y": 2 },
            { "name": "", "values": { "x": 3, "y": 2 }, "x": 3, "y": 2 },
            { "name": "", "values": { "x": 4, "y": 3 }, "x": 4, "y": 3 }
        ],
        "type_": "scatterplot"
    }
    const scatter = new Scatter(data, canvas.width, canvas.height, 0, 0, canvasID, false);
    const frameMatrix = new DOMMatrix([
        scatter.frameMatrix.a,
        scatter.frameMatrix.b,
        scatter.frameMatrix.c,
        scatter.frameMatrix.d,
        scatter.frameMatrix.e,
        scatter.frameMatrix.f
    ]);
    scatter.setCanvas(canvas.id);
    scatter.mouseListener();
    scatter.draw();

    it("should zoom frame correctly", function() {
        canvas.dispatchEvent(mouseMove);
        canvas.dispatchEvent(mouseWheel);
        canvas.dispatchEvent(mouseWheel);
        expect(scatter.frameMatrix, "zoomed frameMatrix").to.not.deep.equal(frameMatrix);
    });
    
    it("should reset frame correctly", function() {
        scatter.reset();
        expect(scatter.frameMatrix, "init frameMatrix").to.deep.equal(frameMatrix);
    });

    it("should resize frame correctly", function() {
        scatter.boundingBoxResize(new Vertex(20, 20), 450, 250);
        scatter.reset();
        expect(scatter.frameMatrix, "init frameMatrix").to.not.deep.equal(frameMatrix);
    });

    it("should merge points", function() {
        expect(scatter.points.length, "drawn points length").to.be.equal(10);
        scatter.switchMerge();
        expect(scatter.isMerged, "isMerged").to.be.true;
        expect(scatter.points.length, "drawn points length").to.be.equal(6);
    });
});

describe("Graph2D", function() {
    const data = {
        "name": "",
        "graphs": [
            {
                "name": "I = f(t)",
                "edge_style": { "object_class": "plot_data.core.EdgeStyle", "name": "", "color_stroke": "rgb(0, 194, 139)", "dashline": [10, 5] },
                "point_style": { "object_class": "plot_data.core.PointStyle", "name": "", "color_fill": "rgb(247,0,0)", "color_stroke": "rgb(247,0,0)", "shape": "crux"},
                "elements": [
                    { "name": "", "values": {"time": 1, "electric current": 1}, "type_": "sample", "time": 1, "electric current": 1 },
                    { "name": "", "values": {"time": 2, "electric current": 4}, "type_": "sample", "time": 2, "electric current": 4 }
                ]
            },
            {
                "name": "I = g(t)",
                "edge_style": { "object_class": "plot_data.core.EdgeStyle", "name": "", "color_stroke": "rgb(0,19,254)", "dashline": [10, 5] },
                "point_style": { "object_class": "plot_data.core.PointStyle", "name": "", "color_fill": "rgb(247,0,0)", "color_stroke": "rgb(247,0,0)", "shape": "square" },
                "elements": [
                    { "name": "", "values": {"time": 3, "electric current": 2}, "type_": "sample", "time": 1, "electric current": 1 },
                    { "name": "", "values": {"time": 12, "electric current": 64}, "type_": "sample", "time": 2, "electric current": 4 }
                ]
            },
        ],
        "type_": "scatterplot"
    }
    const graph = new Graph2D(data, canvas.width, canvas.height, 0, 0, canvasID, false);

    it("should deserialize styles", function() {
        expect(graph.pointStyles.length, "pointStyles").to.be.equal(4);
        expect(graph.curves[0].strokeStyle, "strokeStyle").to.not.be.null;
        expect(graph.curves[0].dashLine, "dashLine").to.deep.equal([10, 5]);
    });

    it("should not merge points", function() {
        graph.switchMerge();
        expect(graph.isMerged, "graph isMerged").to.be.false;
    });
});
