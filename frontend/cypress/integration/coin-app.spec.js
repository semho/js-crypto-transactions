/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/valid-expect-in-promise */
/// <reference types="cypress" />

describe('Приложение Coin', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/');
  });

  // eslint-disable-next-line jest/expect-expect
  it('Вход в приложение c просмотром всех счетов', () => {
    cy.get('#inputLogin').type('developer');
    cy.get('#inputPassword').type('skillbox');
    cy.contains('Войти').click();
    cy.get('.accounts__select-title').should('be.visible');
  });

  // eslint-disable-next-line jest/expect-expect
  it('Перевод суммы со счета на счет', () => {
    cy.get('#inputLogin').type('developer');
    cy.get('#inputPassword').type('skillbox');
    cy.contains('Войти').click();
    //получаем номер счета второго элемента
    cy.get('.accounts__wrapper-card .card')
      .eq(1)
      .find('.card__title')
      .then((card) => {
        const account = card.text();
        transfer(account);
      });
    function transfer(account) {
      //заходим в первый счет
      cy.get('.accounts__wrapper-card .card').eq(0).find('.card__btn').click();
      cy.get('#inputRecipient').type(account);
      cy.get('#inputAmount').type('10000');
      cy.contains('Отправить').click();
      //отправляем средства на номер счета второго элемента
      cy.get('.history-transaction__element-to:first').should(
        'have.text',
        account
      );
    }
  });

  it('Создание нового счета', () => {
    cy.get('#inputLogin').type('developer');
    cy.get('#inputPassword').type('skillbox');
    cy.contains('Войти').click();
    //считаем сколько сейчас счетов
    cy.get('.accounts__wrapper-card .card').then((card) => {
      const count = card.length;
      addAccount(count);
    });
    //функция добавляет счет
    function addAccount(count) {
      cy.get('.accounts__btn').click();
      //ждем ответ от сервера
      cy.request('http://localhost:3000/accounts');
      //и считаем вновь счета
      cy.get('.accounts__wrapper-card .card').then((card) => {
        const countNew = card.length;
        if (count !== countNew) {
          expect(count, 'Добавили еще один счет').to.not.equal(countNew);
        }
      });
    }
  });
});
