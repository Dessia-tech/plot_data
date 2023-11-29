import { parseHTML } from '../support/parseHTML';
import multiplotData from '../data_src/multiplot.data.json';
import primitiveGroupContainerData from '../data_src/primitivegroupcontainer.data.json';

const FEATURE_NAME = "multiplot"

before(() => {
  parseHTML(FEATURE_NAME, multiplotData)
})

describe('MULTIPLOT CANVAS', function () {
  const describeTitle = this.title + ' -- '
  beforeEach(() => {
    switch(Cypress.currentTest.title) {
      case "should draw a canvas with text of empty data":
        break;
      default:
        cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
        break;
    }
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
  //TODO: Removed because methods are removed because they don't seem useful to me but kept to remember they were tested
  // it("should remove primitive group from container in multiplot", function () {
  //   cy.window().then((win) => {
  //     win.eval('plot_data').remove_all_primitive_groups_from_container(6);
  //     cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  //   })
  // })

  // it("should add primitive group container in multiplot", function () {
  //   cy.window().its('plot_data').then((plot_data) => {
  //     plot_data.add_primitive_group_container(primitiveGroupContainerData, [], null)
  //     cy.wrap('plot_data').as('plot_data')
  //     cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  //   })
  // })

  // it("should reorder all plots in canvas", function () {
  //   cy.window().then((win) => {
  //     let plot_data = win.eval('plot_data')
  //     plot_data.add_primitive_group_container(primitiveGroupContainerData, [], null)
  //     plot_data.click_on_view_action()
  //     plot_data.click_on_view_action()
  //     cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  //   })
  // })

  it("should draw a canvas with text of empty data", function () {
    parseHTML("emptyMultiplot", {})
    cy.visit("cypress/html_files/emptyMultiplot.html");
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })
})
