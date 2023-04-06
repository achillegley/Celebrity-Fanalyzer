/// <reference types="cypress" />

// Use `cy.dataCy` custom command for more robust tests

describe('Commenting', async () => {
  beforeEach(() => {
    cy.viewport('iphone-x')
    // Visits the profile page
    cy.visit('/profile', { timeout: 10000 })

    // Get the login button and click it
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('.q-page > .q-btn').click({ timeout: 10000 }).wait(2000)

    // Visits the admin page and wait for 15 seconds
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="main-menu"]').find('a').eq(4).click({ timeout: 10000 }).wait(5000)
    cy.location('pathname').should('eq', '/admin')
  })
  // const store = useCommentStore()

  it('creating comment ', () => {
    // default to iphone as "mobile first" should be our montra
    cy.viewport('iphone-x')

    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs', { timeout: 5000 })

    // programmatically change the q-tab-panel to the comments section.
    cy.get('[data-test="panel-3-navigator"]').click()

    // hack to let all the loading happen

    // navigate to the comment input form.

    cy.get('[data-test="comment-entry-box"]').type('Javokhir-testing')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000) // wait 5 seconds always.
    // cy.get(':nth-child(20) > :nth-child(1)', { timeout: 100000 }) // give only as much time as necessary, no more, up to 100000

    //If you click too early, there is error -- so you need to wait.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="submit-comment"]').click().wait(5000)

    // console.log(store.isLoading())

    // push enter to submit
    //cy.get('[data-test="submit-comment"]').click({ timeout: 1000 }) //.wait(2000)
    // })
  })

  it('like comment', () => {
    // default to iphone as "mobile first" should be our montra
    cy.viewport('iphone-x')

    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs', { timeout: 5000 })

    // programmatically change the q-tab-panel to the comments section.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="panel-3-navigator"]').click().wait(10000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000) // wait 10 seconds always.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Javokhir-testing"]').click().wait(5000)
    console.log('I am liking')
  })

  it('dislike comment', () => {
    // default to iphone as "mobile first" should be our montra
    cy.viewport('iphone-x')

    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs', { timeout: 5000 })

    //programmatically change the q-tab-panel to the comments section.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="panel-3-navigator"]').click().wait(5000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000) // wait 10 seconds always.

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="dislikeJavokhir-testing"]').click().wait(5000)
  })

  it('add reply comment', () => {
    // default to iphone as "mobile first" should be our montra
    cy.viewport('iphone-x')

    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs', { timeout: 5000 })

    //programmatically change the q-tab-panel to the comments section.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="panel-3-navigator"]').click().wait(5000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000) // wait 10 seconds always.

    // expand the add reply form
    cy.get('[data-test="Javokhir-testing-add-reply"]').click()

    // fill add reply form input
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Javokhir-testing-fill-add-reply"]').type('Added-Reply').wait(1000)

    // submit filled add reply form
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Javokhir-testing-submit-fill-add-reply"]').click().wait(5000)
  })

  it('editing reply text', () => {
    // default to iphone as "mobile first" should be our montra
    cy.viewport('iphone-x')

    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs', { timeout: 5000 })

    //programmatically change the q-tab-panel to the comments section.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="panel-3-navigator"]').click().wait(5000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000) // wait 10 seconds always.

    // expand the add reply form
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Javokhir-testing-add-reply"]').click().wait(1000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Added-Reply-open-reply-edit-delete"]').click({ multiple: true, force: true }).wait(1000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Added-Reply-open-reply-edit"]').click().wait(1000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Added-ReplyfillEditReply"]').eq(0).type('Edited-Reply', { force: true })

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Added-ReplyEdited-Reply-submit-reply-edit"]').eq(0).click({ multiple: true, force: true }).wait(5000)
  })

  it('deleting reply text', () => {
    cy.viewport('iphone-x')
    cy.visit('/2023/02/more-frogs', { timeout: 5000 })
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="panel-3-navigator"]').click().wait(5000)
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Javokhir-testing-add-reply"]').click().wait(1000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Added-ReplyEdited-Reply-open-reply-edit-delete"]').eq(1).click({ multiple: true, force: true }).wait(1000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Added-ReplyEdited-Reply-open-reply-delete"]').click().wait(5000)
  })

  it('editing comment', () => {
    // default to iphone as "mobile first" should be our montra
    cy.viewport('iphone-x')

    // navigate to a dedicated entry that should always be there.
    cy.visit('/2023/02/more-frogs', { timeout: 5000 })

    //programmatically change the q-tab-panel to the comments section.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="panel-3-navigator"]').click().wait(5000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000) // wait 10 seconds always.

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Javokhir-testing-button-dropdown"]').click().wait(1000)

    cy.get('[data-test="comment-select-edit"]').click()

    cy.get('[data-test="Javokhir-testing-comment-edit"]').type('-EDITED')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="submit-edited-comment"]').click().wait(5000)
  })

  it('deleting comment', () => {
    cy.viewport('iphone-x')
    cy.visit('/2023/02/more-frogs', { timeout: 5000 })

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="panel-3-navigator"]').click().wait(5000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test="Javokhir-testing-EDITED-button-dropdown"]').click().wait(1000)

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get('[data-test = "comment-select-delete"]').click().wait(5000)
  })
})
