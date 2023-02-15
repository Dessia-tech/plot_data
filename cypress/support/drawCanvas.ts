import { parseHTML } from '../support/parseHTML';
import plotScatterData from '../data_src/plotScatter.data.json';
import { PlotScatter } from '../../src/subplots';

const corePath = 'http://localhost:3030/libdev/plot-data.js';
const fileName = "plotScatter"

// describe('canvas drawer', () => {
//   it("take screenshot", () => {  
//     parseHTML(fileName, corePath, plotScatterData)
//     cy.visit("cypress/html_files/" + fileName + ".html");
//     cy.compareSnapshot(fileName, 0.0);
//   })
// })

describe('script testing', () => {
  it("draw something", () => {
    cy.visit('./cypress/html_files/blankPage.template copy.html').then( () => {
      cy.document().then(($document) => {
        const canvas = $document.createElement("canvas"); 
        const width = 0.95*window.innerWidth;
        const height = Math.max(0.95*window.innerHeight, 350);
        const plot_data = new PlotScatter(plotScatterData, width, height, true, 0, 0, canvas.id);
        plot_data.define_canvas(canvas.id);
        plot_data.draw_initial();
        plot_data.mouse_interaction(plot_data.isParallelPlot);
        cy.wait(2000);
      })
    })
    
    // cy.visit('./cypress/html_files/blankPage.template copy.html').then( () => {
    //   // const canvas = document.querySelector('canvas') //.getElementById("canvas");
    //   // cy.get("canvas").then((canvas) => {
    //   //   let width = 0.95*window.innerWidth;
    //   //   let height = Math.max(0.95*window.innerHeight, 350);
    //   //   let data = plotScatterData;
    //   //   console.log(canvas)
    //   //   let plot_data = new PlotScatter(data, width, height, true, 0, 0, "canvas");
    //   //   plot_data.define_canvas("canvas");
    //   //   plot_data.draw_initial();
    //   //   plot_data.mouse_interaction(plot_data.isParallelPlot);
    //   // })
    //   // console.log(canvas)
    //   // // cy.wait(2000);
    //   // let width = 0.95*window.innerWidth;
    //   // let height = Math.max(0.95*window.innerHeight, 350);
    //   // let data = plotScatterData;
    //   // console.log(data)
    //   // let plot_data = new PlotScatter(data, width, height, true, 0, 0, canvas.id);
    //   // plot_data.define_canvas(canvas.id);
    //   // plot_data.draw_initial();
    //   // plot_data.mouse_interaction(plot_data.isParallelPlot);
      
    // })
    
    
  })  
})