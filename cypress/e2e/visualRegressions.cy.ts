import graph2dData from '../data_src/graph2d.data.json';
import histogramData from '../data_src/histogram.data.json';
import parallelPlotData from '../data_src/parallelplot.data.json';
import plotScatterData from '../data_src/plotscatter.data.json';
import primitiveGroupContainerData from '../data_src/primitivegroupcontainer.data.json';
import scattermatrixData from '../data_src/scattermatrix.data.json';
import simpleshapesData from '../data_src/simpleshapes.data.json';
import textscalingData from '../data_src/textscaling.data.json';
import multiplotData from '../data_src/multiplot.data.json';
import { parseHTML } from '../support/parseHTML';

const FIGURES_DATA = [
    { name: "graph2d", data: graph2dData, threshold: 0.05 },
    { name: "histogram", data: histogramData, threshold: 0.05 },
    { name: "parallelplot", data: parallelPlotData, threshold: 0.05 },
    { name: "plotscatter", data: plotScatterData, threshold: 0.05 },
    { name: "primitivegroupcontainer", data: primitiveGroupContainerData, threshold: 0.05 },
    { name: "scattermatrix", data: scattermatrixData, threshold: 0.08 },
    { name: "simpleshapes", data: simpleshapesData, threshold: 0.05 },
    { name: "textscaling", data: textscalingData, threshold: 0.05 },
    { name: "multiplot", data: multiplotData, threshold: 0.05 }
]

FIGURES_DATA.forEach(figureData => {
    before(() => { parseHTML(figureData.name, figureData.data) });
    describe(figureData.name.toUpperCase(), function () {
        const describeTitle = this.title + ' -- ';

        beforeEach(() => cy.visit("cypress/html_files/" + figureData.name + ".html"));

        it("should draw canvas", function () {
            cy.compareSnapshot(describeTitle + this.test.title, figureData.threshold);
        });

        if (figureData.name == "parallelplot") {
            it("should draw a nice horizontal parallel plot", function () {
                cy.window().then((win) => {
                  let parallelPlot = win.eval('plot_data')
                  parallelPlot.switchOrientation();
                  cy.compareSnapshot(describeTitle + this.test.title, 0.05);
                });
            });
        }

        if (figureData.name == "graph2d") {
            it("should draw a nice horizontal parallel plot", function () {
                cy.window().then((win) => {
                  let graph2d = win.eval('plot_data');
                  graph2d.togglePoints();
                  cy.compareSnapshot(describeTitle + this.test.title, 0.05);
                });
            });
        }

        if (figureData.name == "simpleshapes") {
            it("should color hovered circle", function () {
                cy.window().then((win) => {
                    let plot_data = win.eval('plot_data');
                    cy.get('canvas').click(544, 376).then( () => {
                        expect(plot_data.relativeObjects.shapes[21].isClicked).to.be.true;
                    });
                });
            });

            it("should draw tooltip on line", function () {
                cy.window().then((win) => {
                    const draw = win.eval('plot_data');
                    const [canvasMouse, frameMouse, mouseCoords] = draw.projectMouse({"offsetX": 746, "offsetY": 176} as MouseEvent);
                    draw.castMouseMove(canvasMouse, frameMouse, mouseCoords);
                    draw.castMouseDown(canvasMouse, frameMouse, mouseCoords);
                    draw.castMouseUp(false);
                    draw.draw();
                    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
                });
            });

            it("should hover line even if mouse is not exactly on line", function () {
                cy.window().then((win) => {
                    const draw = win.eval('plot_data');
                    let [canvasMouse, frameMouse, mouseCoords] = draw.projectMouse({"offsetX": 807, "offsetY": 196} as MouseEvent);
                    draw.castMouseMove(canvasMouse, frameMouse, mouseCoords);
                    expect(draw.relativeObjects.shapes[23].isHovered).to.be.true;

                    [canvasMouse, frameMouse, mouseCoords] = draw.projectMouse({"offsetX": 810, "offsetY": 196} as MouseEvent);
                    draw.castMouseMove(canvasMouse, frameMouse, mouseCoords);
                    expect(draw.relativeObjects.shapes[23].isHovered).to.be.true;
                });
            });
        }

        if (figureData.name == "multiplot") {
            it("should draw a canvas with text of empty data", function () {
                parseHTML("emptyMultiplot", {});
                cy.visit("cypress/html_files/emptyMultiplot.html");
                cy.compareSnapshot(describeTitle + this.test.title, 0.05);
            });
        }
    });
});
