const commonlocators = require("../../../../locators/commonlocators.json");
const themelocator = require("../../../../locators/ThemeLocators.json");
import { ObjectsRegistry } from "../../../../support/Objects/Registry";

let themeFont;
let theme = ObjectsRegistry.ThemeSettings,
  ee = ObjectsRegistry.EntityExplorer,
  appSettings = ObjectsRegistry.AppSettings;

describe("Theme validation usecase for multi-select widget", function () {
  it("1. Drag and drop multi-select widget and validate Default font and list of font validation + Bug 15007", function () {
    //cy.reload(); // To remove the rename tooltip
    ee.DragDropWidgetNVerify("multiselectwidgetv2", 300, 80);
    cy.get(themelocator.canvas).click({ force: true });
    cy.wait(2000);

    appSettings.OpenAppSettings();
    appSettings.GoToThemeSettings();
    //Border validation
    //cy.contains("Border").click({ force: true });
    cy.get(themelocator.border).should("have.length", "3");
    cy.borderMouseover(0, "none");
    cy.borderMouseover(1, "M");
    cy.borderMouseover(2, "L");
    cy.get(themelocator.border).eq(1).click({ force: true });
    cy.wait("@updateTheme").should(
      "have.nested.property",
      "response.body.responseMeta.status",
      200,
    );
    cy.wait(1000);
    cy.contains("Border").click({ force: true });

    //Shadow validation
    //cy.contains("Shadow").click({ force: true });
    cy.wait(2000);
    cy.xpath(theme.locators._boxShadow("L")).click({ force: true });
    cy.wait("@updateTheme").should(
      "have.nested.property",
      "response.body.responseMeta.status",
      200,
    );
    cy.wait(1000);
    cy.contains("Shadow").click({ force: true });

    //Font
    cy.xpath(
      "//p[text()='App font']/following-sibling::section//div//input",
    ).then(($elem) => {
      cy.get($elem).click({ force: true });
      cy.wait(250);
      cy.fixture("fontData").then(function (testdata) {
        this.testdata = testdata;
      });

      cy.get(themelocator.fontsSelected)
        //.eq(10)
        .should("contain.text", "Nunito Sans");

      cy.get(".rc-virtual-list .rc-select-item-option")
        .find(".leading-normal")
        .eq(3)
        .then(($childElem) => {
          cy.get($childElem).click({ force: true });
          cy.get(".t--draggable-multiselectwidgetv2:contains('more')").should(
            "have.css",
            "font-family",
            `Inter, sans-serif`,
          );
          themeFont = `Inter, sans-serif`;
        });
    });
    cy.contains("Font").click({ force: true });

    //Color - Bug 23501 - hence skipping
    // cy.wait(1000);
    // theme.ChangeThemeColor("purple", "Primary");
    // cy.get(themelocator.inputColor).should("have.value", "purple");
    // cy.wait(1000);

    // theme.ChangeThemeColor("brown", "Background");
    // cy.get(themelocator.inputColor).should("have.value", "brown");
    // cy.wait(1000);
    // cy.contains("Color").click({ force: true });
    appSettings.ClosePane();
  });

  it.skip("2. Publish the App and validate Font across the app + Bug 15007", function () {
    //Skipping due to mentioned bug
    cy.PublishtheApp();
    cy.get(".rc-select-selection-item > .rc-select-selection-item-content")
      .first()
      .should("have.css", "font-family", themeFont);
    cy.get(".rc-select-selection-item > .rc-select-selection-item-content")
      .last()
      .should("have.css", "font-family", themeFont);
    cy.goToEditFromPublish();
  });

  it.skip("3. Validate current theme feature", function () {
    cy.get("#canvas-selection-0").click({ force: true });
    appSettings.OpenAppSettings();
    appSettings.GoToThemeSettings();
    //Change the Theme
    cy.get(commonlocators.changeThemeBtn).click({ force: true });
    cy.get(themelocator.currentTheme).click({ force: true });
    cy.get(".t--theme-card main > main")
      .first()
      .invoke("css", "background-color")
      .then(() => {
        cy.get(".t--draggable-multiselectwidgetv2:contains('more')")
          .last()
          .invoke("css", "background-color")
          .then((selectedBackgroudColor) => {
            expect("rgba(0, 0, 0, 0)").to.equal(selectedBackgroudColor);
            appSettings.ClosePane();
          });
      });

    //Publish the App and validate change of Theme across the app in publish mode
    cy.PublishtheApp();
    cy.xpath("//div[@id='root']//section/parent::div").should(
      "have.css",
      "background-color",
      "rgb(165, 42, 42)",
    );
  });
});
