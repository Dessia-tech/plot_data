import { parseHTML } from '../support/parseHTML';
import multiplotData from '../data_src/multiplot.data.json';
import primitiveGroupContainerData from '../data_src/primitivegroupcontainer.data.json';

const fileName = "multiplot"

before(() => {
  parseHTML(fileName, multiplotData)
})

describe('MULTIPLOT CANVAS', () => {
  beforeEach(() => {
    cy.visit("cypress/html_files/" + fileName + ".html");
  })

  it("Unchanged raw canvas", () => {  
    cy.compareSnapshot(fileName + ".raw", 0.0);
  })

  it("Remove primitive group from container in multiplot", () => {  
    cy.window().then((win) => {
      win.eval('multiplot').remove_all_primitive_groups_from_container(6);
      cy.compareSnapshot(fileName + ".remove_primitive_group", 0.0);
    })
  })
  
  it("Add primitive group container in multiplot", () => {  
    cy.window().its('multiplot').then((multiplot) => {
      multiplot.add_primitive_group_container(primitiveGroupContainerData, [], null)
      cy.wrap('multiplot').as('multiplot')
      cy.compareSnapshot(fileName + ".add_primitive_group", 0.0);
    })
  })

  it("Should reorder all plots in canvas", () => {
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
})