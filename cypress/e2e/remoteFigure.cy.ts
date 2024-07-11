import { ZOOM_FACTOR } from "../../instrumented/constants";
import { Vertex } from "../../instrumented/baseShape";
import { Rect } from "../../instrumented/primitives";
import { Axis } from "../../instrumented/axes";
import { RemoteFigure } from "../../instrumented/remoteFigure";

const emptyData = {
    "name": "",
    "attribute_names": ["x", "y"],
};

const data = {
    "name": "",
    "attribute_names": ["x", "y"],
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
    ]
};

describe('RemoteFigure.unpackAxisStyle', function() {
    it("should create RemoteFigure with no elements", function() {
        const figure = new RemoteFigure(emptyData, 800, 600, 100, 100, "canvasID");
        expect(figure.features, "features").to.deep.equal(new Map<string, any>([["x", []], ["y", []]]));
        expect(figure.nSamples, "nSamples").to.be.equal(0);
    });

    it("should not change axisStyle of RemoteFigure when data is empty", function() {
        const figure = new RemoteFigure(data, 800, 600, 100, 100, "canvasID");
        expect(figure.axisStyle.get("strokeStyle")).to.be.equal("hsl(0, 0%, 30%)");
        expect(figure.axisStyle.get("lineWidth"), "lineWidth").to.be.undefined;
        expect(figure.axisStyle.get("font"), "font").to.be.undefined;
        expect(figure.axisStyle.get("ticksFontsize"), "ticksFontSize").to.be.undefined;
    })

    it("should not change axisStyle of RemoteFigure when axis is empty", function() {
        data["axis"] = {};
        const figure = new RemoteFigure(data, 800, 600, 100, 100, "canvasID");
        expect(figure.axisStyle.get("strokeStyle")).to.be.equal("hsl(0, 0%, 30%)");
        expect(figure.axisStyle.get("lineWidth"), "lineWidth").to.be.undefined;
        expect(figure.axisStyle.get("font"), "font").to.be.undefined;
        expect(figure.axisStyle.get("ticksFontsize"), "ticksFontSize").to.be.undefined;
    });

    it("should not change axisStyle of RemoteFigure when axis.axis_style is empty", function() {
        data["axis"]["axis_style"] = {};
        const figure = new RemoteFigure(data, 800, 600, 100, 100, "canvasID");
        expect(figure.axisStyle.get("strokeStyle")).to.be.equal("hsl(0, 0%, 30%)");
        expect(figure.axisStyle.get("lineWidth"), "lineWidth").to.be.undefined;
        expect(figure.axisStyle.get("font"), "font").to.be.undefined;
        expect(figure.axisStyle.get("ticksFontsize"), "ticksFontSize").to.be.undefined;
    });

    it("should not change axisStyle of RemoteFigure when axis.graduation_style is empty", function() {
        data["axis"]["graduation_style"] = {};
        const figure = new RemoteFigure(data, 800, 600, 100, 100, "canvasID");
        expect(figure.axisStyle.get("strokeStyle")).to.be.equal("hsl(0, 0%, 30%)");
        expect(figure.axisStyle.get("lineWidth"), "lineWidth").to.be.undefined;
        expect(figure.axisStyle.get("font"), "font").to.be.undefined;
        expect(figure.axisStyle.get("ticksFontsize"), "ticksFontSize").to.be.undefined;
    });

    it("should change axisStyle of RemoteFigure when axis.axis_style is given", function() {
        data["axis"]["axis_style"] = {
            "color_stroke": "hsl(24, 35%, 97%)",
            "line_width": 3
        };
        const figure = new RemoteFigure(data, 800, 600, 100, 100, "canvasID");
        expect(figure.axisStyle.get("strokeStyle")).to.be.equal("hsl(24, 35%, 97%)");
        expect(figure.axisStyle.get("lineWidth"), "lineWidth").to.be.equal(3);
        expect(figure.axisStyle.get("font"), "font").to.be.undefined;
        expect(figure.axisStyle.get("ticksFontsize"), "ticksFontSize").to.be.undefined;
    });

    it("should change axisStyle of RemoteFigure when axis.graduation_style is given", function() {
        data["axis"]["graduation_style"] = {
            "font_style": "serif",
            "font_size": 20
        };
        const figure = new RemoteFigure(data, 800, 600, 100, 100, "canvasID");
        expect(figure.axisStyle.get("strokeStyle")).to.be.equal("hsl(24, 35%, 97%)");
        expect(figure.axisStyle.get("lineWidth"), "lineWidth").to.be.equal(3);
        expect(figure.axisStyle.get("font"), "font").to.be.equal("serif");
        expect(figure.axisStyle.get("ticksFontsize"), "ticksFontSize").to.be.equal(20);
    });
});

describe("RemoteFigure.serializedFeatures", function() {
    it('should build a data object that matches with input data of any RemoteFigure', function() {
        const figure = new RemoteFigure(data, 800, 600, 100, 100, "canvasID");
        const serializedFeatures = figure.serializeFeatures();
        expect(serializedFeatures, "serializedFeatures").to.deep.equal(data["elements"]);
    });
});

const canvasID = "canvas";
const canvas = document.createElement(canvasID);
canvas.id = canvasID;
canvas.height = 1000;
canvas.width = 1000;
document.body.appendChild(canvas);

describe("RemoteFigure.changeAxisFeature", function() {
    it('should update the feature name of the given axis', function() {
        const figure = new RemoteFigure(data, canvas.width, canvas.height, 100, 100, canvas.id);
        figure.setCanvas(canvas.id);
        figure.axes[0] = new Axis(figure.features.get("x"), new Rect(new Vertex(), new Vertex(100, 100)), new Vertex(), new Vertex(100, 0), "x", new Vertex());
        expect(figure.drawnFeatures[0], "figure.drawnFeatures[0]").to.be.equal("x");
        expect(figure.axes[0].name, "axis.name").to.be.equal("x");
        expect(figure.axes[0].minValue, "axis.minValue").to.be.equal(-0.1);
        expect(figure.axes[0].maxValue, "axis.maxValue").to.be.equal(2.1);

        figure.changeAxisFeature("y", 0);

        expect(figure.drawnFeatures[0], "figure.drawnFeatures[0]").to.be.equal("y");
        expect(figure.axes[0].name, "axis.name").to.be.equal("y");
        expect(figure.axes[0].minValue, "axis.minValue").to.be.equal(0.9);
        expect(figure.axes[0].maxValue, "axis.maxValue").to.be.equal(3.1);
      });
});

describe("RemoteFigure.setFeatureFilters", function() {
    it('should write values in axes[0].rubberBand', function() {
        const figure = new RemoteFigure(data, canvas.width, canvas.height, 100, 100, canvas.id);
        figure.setCanvas(canvas.id);
        figure.axes[0] = new Axis(figure.features.get("x"), new Rect(new Vertex(), new Vertex(100, 100)), new Vertex(), new Vertex(100, 0), "x", new Vertex());
        figure.setFeatureFilter("x", -1, 1.1);
        expect(figure.selectedIndices.length, "figure.selectedIndices.length").to.be.equal(2);
      });
});


describe("RemoteFigure.resizeUpdate", function() {
    it("should resize figure", function() {
        const figure = new RemoteFigure(data, canvas.width, canvas.height, 100, 100, canvas.id);
        figure.setCanvas(canvas.id);
        figure.width = 700;
        figure.height = 500;
        figure.resizeUpdate();
        expect(figure.size.x, "size.x").to.be.equal(700);
        expect(figure.size.y, "size.y").to.be.equal(500);
    });
});

describe("RemoteFigure.reset", function() {
    it("should reset scales and selectors", function() {
        const figure = new RemoteFigure(data, canvas.width, canvas.height, 100, 100, canvas.id);
        figure.setCanvas(canvas.id);
        figure.axes[0] = new Axis(figure.features.get("x"), new Rect(new Vertex(), new Vertex(100, 100)), new Vertex(), new Vertex(100, 0), "x", new Vertex());
        figure.axes[0].rubberBand.minValue = 10;
        figure.axes[0].rubberBand.maxValue = 100;
        figure.axes[0].minValue = 17;
        figure.axes[0].maxValue = 27;
        figure.hoveredIndices = [1, 4];
        figure.clickedIndices = [2, 3];
        figure.selectedIndices = [0, 5];

        expect(figure.axes[0].minValue, "changed axis minValue").to.be.equal(17);
        expect(figure.axes[0].maxValue, "changed axis maxValue").to.be.equal(27);

        figure.reset();

        expect(figure.axes[0].minValue, "initial axis minValue").to.be.equal(-0.1);
        expect(figure.axes[0].maxValue, "initial axis maxValue").to.be.equal(2.1);
        expect(figure.axes[0].rubberBand.minValue, "rubberBand minValue").to.be.equal(0);
        expect(figure.axes[0].rubberBand.maxValue, "rubberBand maxValue").to.be.equal(0);
        expect(figure.hoveredIndices.length, "hoveredIndices").to.be.equal(0);
        expect(figure.clickedIndices.length, "clickedIndices").to.be.equal(0);
        expect(figure.selectedIndices.length, "selectedIndices").to.be.equal(0);
    });
});

describe("RemoteFigure.resetSelection", function() {
    it("should reset selectors", function() {
        const figure = new RemoteFigure(data, canvas.width, canvas.height, 100, 100, canvas.id);
        figure.setCanvas(canvas.id);
        figure.axes[0] = new Axis(figure.features.get("x"), new Rect(new Vertex(), new Vertex(100, 100)), new Vertex(), new Vertex(100, 0), "x", new Vertex());
        figure.axes[0].minValue = 17;
        figure.axes[0].maxValue = 27;
        figure.axes[0].rubberBand.minValue = 10;
        figure.axes[0].rubberBand.maxValue = 100;
        figure.hoveredIndices = [1, 4];
        figure.clickedIndices = [2, 3];
        figure.selectedIndices = [0, 5];
        figure.resetSelection();

        expect(figure.axes[0].minValue, "initial axis minValue").to.be.equal(17);
        expect(figure.axes[0].maxValue, "initial axis maxValue").to.be.equal(27);
        expect(figure.axes[0].rubberBand.minValue, "rubberBand minValue").to.be.equal(0);
        expect(figure.axes[0].rubberBand.maxValue, "rubberBand maxValue").to.be.equal(0);
        expect(figure.hoveredIndices.length, "hoveredIndices").to.be.equal(0);
        expect(figure.clickedIndices.length, "clickedIndices").to.be.equal(0);
        expect(figure.selectedIndices.length, "selectedIndices").to.be.equal(0);
    });
});

describe("RemoteFigure.mouseListener", function() {
    const mouseUp = new MouseEvent('mouseup', { clientX: 150, clientY: 150 });
    const mouseDown = new MouseEvent('mousedown', { clientX: 150, clientY: 150 });
    const mouseMove1 = new MouseEvent('mousemove', { clientX: 150, clientY: 150 });
    const mouseMove2 = new MouseEvent('mousemove', { clientX: 370, clientY: 520 });
    const mouseMove3 = new MouseEvent('mousemove', { clientX: 20000, clientY: 0 });
    const mouseWheel = new WheelEvent('wheel', { clientX: 150, clientY: 150, deltaY: ZOOM_FACTOR });
    const mouseLeave = new MouseEvent('mouseleave', {});

    const ctrlKeyDown = new KeyboardEvent("keydown", { key: 'Control' });
    const shiftKeyDown = new KeyboardEvent("keydown", { key: 'Shift' });
    const spaceKeyDown = new KeyboardEvent("keydown", { key: ' ' });

    const ctrlKeyUp = new KeyboardEvent("keyup", { key: 'Control' });
    const shiftKeyUp = new KeyboardEvent("keyup", { key: 'Shift' });
    const spaceKeyUp = new KeyboardEvent("keyup", { key: ' ' });

    const figure = new RemoteFigure(data, canvas.width, canvas.height, 100, 100, canvas.id);
    figure.axes[0] = new Axis(figure.features.get("x"), new Rect(new Vertex(), new Vertex(100, 100)), new Vertex(), new Vertex(800, 0), "x", new Vertex());
    figure.axes.push(new Axis(figure.features.get("y"), new Rect(new Vertex(), new Vertex(100, 100)), new Vertex(), new Vertex(0, -800), "y", new Vertex()));
    figure.setCanvas(canvas.id);
    figure.mouseListener();

    it("should handle mouseMove", function() {
        canvas.dispatchEvent(mouseMove1);
        expect(figure.isHovered).to.be.true;
        if (canvas.style.cursor.length != 0) expect(canvas.style.cursor, "cursor").to.be.equal("default")
        else expect(canvas.style.cursor, "cursor").to.be.equal("");
    });

    it("should have a crosshair cursor when zooming", function() {
        figure.isZooming = true;
        canvas.dispatchEvent(mouseMove1);
        expect(canvas.style.cursor, "zooming cursor").to.be.equal("crosshair");
    });

    it("should set default cursor when mouse up while zooming switched to false", function() {
        figure.isZooming = false;
        canvas.dispatchEvent(mouseUp);
        expect(canvas.style.cursor, "default cursor").to.be.equal("default");
    });

    it("should have a crosshair cursor when selecting", function() {
        figure.isSelecting = true;
        canvas.dispatchEvent(mouseMove1);
        expect(canvas.style.cursor, "selecting cursor").to.be.equal("crosshair");
    });

    it("should set default cursor when mouse up while selecting switched to false", function() {
        figure.isSelecting = false;
        canvas.dispatchEvent(mouseUp);
        expect(canvas.style.cursor, "default cursor").to.be.equal("default");
    });

    it("should preserve rubberBand min and max values", function () {
        figure.axes[0].rubberBand.minValue = 0;
        figure.axes[0].rubberBand.maxValue = 200;
        figure.draw();
        expect(figure.axes[0].rubberBand.canvasLength, "rubberBand.canvasLength").to.be.closeTo(764, 1.);
        canvas.dispatchEvent(mouseMove1);
        canvas.dispatchEvent(mouseDown);
        canvas.dispatchEvent(mouseMove3);
        canvas.dispatchEvent(mouseUp);
        expect(figure.axes[0].rubberBand.canvasLength, "rubberBand.canvasLength").to.be.equal(0);
        figure.reset();
    });

    it("should translate figure", function() {
        canvas.dispatchEvent(mouseMove1);
        canvas.dispatchEvent(mouseDown);
        canvas.dispatchEvent(mouseMove2);
        expect(figure.translation, "translation").to.deep.equal(new Vertex(220, -370));
        expect(canvas.style.cursor, "moving cursor").to.be.equal("move");

        canvas.dispatchEvent(mouseUp);

        expect(figure.translation, "translation").to.deep.equal(new Vertex());
    });
    
    it("should handle wheel events", function() {
        const minValue0 = figure.axes[0].minValue;
        const maxValue0 = figure.axes[0].maxValue;
        const minValue1 = figure.axes[1].minValue;
        const maxValue1 = figure.axes[1].maxValue;
        canvas.dispatchEvent(mouseMove1);
        canvas.dispatchEvent(mouseWheel);

        expect(figure.axes[0].minValue, "minValue0").to.not.be.equal(minValue0);
        expect(figure.axes[0].maxValue, "maxValue0").to.not.be.equal(maxValue0);
        expect(figure.axes[1].minValue, "minValue0").to.not.be.equal(minValue1);
        expect(figure.axes[1].maxValue, "maxValue1").to.not.be.equal(maxValue1);
    });

    it("should handle zoom", function() {
        const minValue0 = figure.axes[0].minValue;
        const maxValue0 = figure.axes[0].maxValue;
        const minValue1 = figure.axes[1].minValue;
        const maxValue1 = figure.axes[1].maxValue;

        figure.zoomIn();
        expect(figure.axes[0].minValue, "minValue0").to.not.be.closeTo(minValue0, 0.001);
        expect(figure.axes[0].maxValue, "maxValue0").to.not.be.closeTo(maxValue0, 0.001);
        expect(figure.axes[1].minValue, "minValue0").to.not.be.closeTo(minValue1, 0.001);
        expect(figure.axes[1].maxValue, "maxValue1").to.not.be.closeTo(maxValue1, 0.001);

        figure.zoomOut();
        expect(figure.axes[0].minValue, "minValue0").to.be.closeTo(minValue0, 0.001);
        expect(figure.axes[0].maxValue, "maxValue0").to.be.closeTo(maxValue0, 0.001);
        expect(figure.axes[1].minValue, "minValue0").to.be.closeTo(minValue1, 0.001);
        expect(figure.axes[1].maxValue, "maxValue1").to.be.closeTo(maxValue1, 0.001);
    });

    it("should reset state correctly on mouseleave", function() {
        figure.is_drawing_rubber_band = true;
        figure.isZooming = true;
        figure.translation = new Vertex(20, 20);
        figure.axes.forEach(axis => axis.isClicked = axis.isHovered = true);
        canvas.dispatchEvent(mouseLeave);
        expect(figure.is_drawing_rubber_band, "is_drawing_rubber_band").to.be.false;
        expect(figure.isZooming, "isZooming").to.be.true;
        expect(figure.translation, "translation").to.deep.equal(new Vertex());
        figure.axes.forEach((axis, i) => {
            expect(axis.isHovered, `axis[${i}].isHovered`).to.be.false;
            expect(axis.isClicked, `axis[${i}].isClicked`).to.be.false;
        })
    });

    it("should draw a SelectionBox", function() {
        figure.isSelecting = true;
        canvas.dispatchEvent(mouseMove1);
        canvas.dispatchEvent(mouseDown);
        canvas.dispatchEvent(mouseMove2);

        expect(figure.translation, "translation").to.deep.equal(new Vertex());
        expect(canvas.style.cursor, "selecting cursor").to.be.equal("crosshair");
        expect(figure.selectionBox.minVertex, "selectionBox.minVertex").to.deep.equal(new Vertex(142, -142));
        expect(figure.selectionBox.maxVertex, "selectionBox.maxVertex").to.deep.equal(new Vertex(362, -512));

        figure.draw();

        expect(figure.selectionBox.origin, "selectionBox.origin").to.not.be.deep.equal(new Vertex());
        expect(figure.selectionBox.size, "selectionBox.size").to.not.be.deep.equal(new Vertex());
        canvas.dispatchEvent(mouseUp);
    });

    it("should reset on Control + Shift + click action", function() {
        cy.spy(figure, 'reset');
        window.dispatchEvent(ctrlKeyDown);
        window.dispatchEvent(shiftKeyDown);
        canvas.dispatchEvent(mouseMove1);
        canvas.dispatchEvent(mouseDown);
        canvas.dispatchEvent(mouseUp);

        cy.wrap(figure.reset).should('have.been.calledOnce');

        window.dispatchEvent(ctrlKeyUp);
        window.dispatchEvent(shiftKeyUp);
    });

    it("should resetView on Control + Space", function() {
        cy.spy(figure, 'resetView');
        window.dispatchEvent(ctrlKeyDown);
        window.dispatchEvent(spaceKeyDown);
        canvas.dispatchEvent(mouseMove1);
        canvas.dispatchEvent(mouseDown);
        canvas.dispatchEvent(mouseUp);

        cy.wrap(figure.resetView).should('have.been.calledOnce');

        window.dispatchEvent(ctrlKeyUp);
        window.dispatchEvent(spaceKeyUp);
    });

    it("should handle Shift key", function() {
        window.dispatchEvent(shiftKeyDown);
        expect(figure.isSelecting, "isSelecting").to.be.true;
        window.dispatchEvent(ctrlKeyDown);
        expect(figure.isSelecting, "isSelecting").to.be.false;
        window.dispatchEvent(ctrlKeyUp);
        expect(figure.isSelecting, "isSelecting").to.be.true;
        window.dispatchEvent(shiftKeyUp);
        expect(figure.isSelecting, "isSelecting").to.be.false;
    });
});
