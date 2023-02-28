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
    cy.visit("cypress/html_files/" + FEATURE_NAME + ".html");
  })

  it("should draw canvas", function () {
    cy.compareSnapshot(describeTitle + this.test.title, 0.05);
  })

  it("should remove primitive group from container in multiplot", function () {
    cy.window().then((win) => {
      win.eval('multiplot').remove_all_primitive_groups_from_container(6);
      cy.compareSnapshot(describeTitle + this.test.title, 0.05);
    })
  })

  it("should add primitive group container in multiplot", function () {
    cy.window().its('multiplot').then((multiplot) => {
      multiplot.add_primitive_group_container(primitiveGroupContainerData, [], null)
      cy.wrap('multiplot').as('multiplot')
      cy.compareSnapshot(describeTitle + this.test.title, 0.05);
    })
  })

  it("should reorder all plots in canvas", function () {
    cy.window().then((win) => {
      let multiplot = win.eval('multiplot')
      multiplot.add_primitive_group_container(primitiveGroupContainerData, [], null)
      multiplot.click_on_view_action()
      multiplot.click_on_view_action()
      cy.compareSnapshot(describeTitle + this.test.title, 0.05);
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
