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
})

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
})

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
})
