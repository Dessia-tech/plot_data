import graph2dData from '../data_src/graph2d.data.json';
import histogramData from '../data_src/histogram.data.json';
import parallelPlotData from '../data_src/parallelplot.data.json';
import plotScatterData from '../data_src/plotscatter.data.json';
import primitiveGroupContainerData from '../data_src/primitivegroupcontainer.data.json';
import scattermatrixData from '../data_src/scattermatrix.data.json';
import simpleshapesData from '../data_src/simpleshapes.data.json';
import textscalingData from '../data_src/textscaling.data.json';
import { parseHTML } from '../support/parseHTML';

const FIGURES_DATA = [
    { name: "graph2d", data: graph2dData },
    { name: "histogram", data: histogramData },
    { name: "parallelplot", data: parallelPlotData },
    { name: "plotscatter", data: plotScatterData },
    { name: "primitivegroupcontainer", data: primitiveGroupContainerData },
    { name: "scattermatrix", data: scattermatrixData },
    { name: "simpleshapes", data: simpleshapesData },
    { name: "textscaling", data: textscalingData }
]

FIGURES_DATA.forEach(figureData => {
    describe(figureData.name.toUpperCase(), function () {
        const describeTitle = this.title + ' -- ';
        
        it("should draw canvas", function () {
            parseHTML(figureData.name, figureData.data);
            cy.visit("cypress/html_files/" + figureData.name + ".html");
            cy.compareSnapshot(describeTitle + this.test.title, 0.05);
        })
    })
})