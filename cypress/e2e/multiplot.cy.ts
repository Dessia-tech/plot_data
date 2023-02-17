import { parseHTML } from '../support/parseHTML';
import multiplotData from '../data_src/multiplot.data.json';
import primitiveGroupContainerData from '../data_src/primitivegroupcontainer.data.json';

const fileName = "multiplot"

before(() => {
  parseHTML(fileName, multiplotData)
})

describe("MULTIPLOT TESTS", () => {
  beforeEach(() => {
    cy.visit("cypress/html_files/" + fileName + ".html");
  })

  it("should draw the canvas", () => {  
    cy.compareSnapshot(fileName + ".raw", 0.0);
  })

  it("should remove primitive group from container in multiplot", () => {  
    cy.window().then((win) => {
      win.eval('multiplot').remove_all_primitive_groups_from_container(6);
      cy.compareSnapshot(fileName + ".remove_primitive_group", 0.0);
    })
  })
  
  it("should add primitive group container in multiplot", () => {  
    cy.window().its('multiplot').then((multiplot) => {
      multiplot.add_primitive_group_container(primitiveGroupContainerData, [], null)
      cy.wrap('multiplot').as('multiplot')
      cy.compareSnapshot(fileName + ".add_primitive_group", 0.0);
    })
  })

  it("should reorder all plots in canvas", () => {
    cy.window().then((win) => {
      let multiplot = win.eval('multiplot')
      multiplot.add_primitive_group_container(primitiveGroupContainerData, [], null)
      cy.wait(500)
      multiplot.click_on_view_action()
      cy.wait(2000)
      multiplot.click_on_view_action()
      cy.wait(500)
      cy.compareSnapshot(fileName + ".reordered_plots", 0.0);
    }) 
  })

  // describe('MULTIPLOT FRONTEND INTERFACE', () => {
  //   it("should return a list of 10 points", () => {
  //     cy.window().then((win) => {
  //       let multiplot = win.eval('multiplot')
              
  //     })
  //   })
  //   it("should return a list of 10 points", () => {
  //     cy.window().then((win) => {
  //       let multiplot = win.eval('multiplot')
              
  //     })
  //   })
  //   it("should return a list of 10 points", () => {
  //     cy.window().then((win) => {
  //       let multiplot = win.eval('multiplot')
              
  //     })
  //   })
  //   it("should return a list of 10 points", () => {
  //     cy.window().then((win) => {
  //       let multiplot = win.eval('multiplot')
              
  //     })
  //   })
  // })
})

