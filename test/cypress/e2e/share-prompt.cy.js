/* eslint-disable cypress/no-unnecessary-waiting */
describe('Sharing a Prompt', () => {
  it('Should display properly and navigate to /month page', () => {
    // Visits the month page and waits for 5 seconds for the page to load
    cy.visit('/month').wait(5000)

    // Selects the 4th button on the page (share button) and clicks it
    cy.get('.q-btn').eq(3).scrollIntoView().click()

    // Selects the first card on the page (copy to clipboard) and clicks it
    cy.get('.q-card > .row > :nth-child(1) > img').click().wait(2000)

    // Select the amount of shares to see if its value is greater than 0
    cy.get(':nth-child(7) > .q-btn__content > .block').scrollIntoView().invoke('text').then(parseFloat).should('be.greaterThan', 0)

    // Selects the 4th button on the page and clicks it
    cy.get('.q-btn').eq(3).scrollIntoView().click()

    // Selects the second card on the page and clicks it
    cy.get('.q-card > .row > :nth-child(2) > img').click().wait(2000)

    // Select the amount of shares to see if its value is greater than 1
    cy.get(':nth-child(7) > .q-btn__content > .block').scrollIntoView().invoke('text').then(parseFloat).should('be.greaterThan', 1)

    // Selects the second tab on the page (Anthrogram Tab) and clicks it
    cy.get('[style="padding-bottom: 64px;"] > .q-tabs > .q-tabs__content > .q-tab--inactive').click()

    // Selects the second canvas on the page and checks to see if it is visible
    cy.get('canvas').eq(1).scrollIntoView().should('be.visible')
  })
})
