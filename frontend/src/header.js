import 'babel-polyfill';
import { el } from 'redom';

export default class Header {
  constructor() {
    this.el = el(
      'header.header',
      (this.elHeader = el('.container.header__container', [
        (this.el = el('span.header__logo', 'Coin.')),
        [
          (this.list = el('ul.header__list', [
            (this.el = el(
              'li.header__item',
              (this.link = el(
                'a.header__btn.btn.btn-primary',
                { href: 'ATMs', 'data-navigo': 'true' },
                (this.el = el('span', 'Банкоматы'))
              ))
            )),
            (this.el = el(
              'li.header__item',
              (this.link = el(
                'a.header__btn.btn.btn-primary',
                { href: 'accounts', 'data-navigo': 'true' },
                (this.el = el('span', 'Счета'))
              ))
            )),
            (this.el = el(
              'li.header__item',
              (this.link = el(
                'a.header__btn.btn.btn-primary',
                { href: 'currency', 'data-navigo': 'true' },
                (this.el = el('span', 'Валюта'))
              ))
            )),
            (this.el = el(
              'li.header__item',
              (this.link = el(
                'a.header__btn.btn.btn-primary',
                { href: '/', 'data-navigo': 'true' },
                (this.el = el('span', 'Выйти'))
              ))
            )),
          ])),
          (this.burger = el('span.burger')),
        ],
      ]))
    );
    //разворачиваем меню в мобильной версии
    this.burger.addEventListener('click', () => {
      this.list.classList.toggle('is-active');
    });
    //скрываем меню в мобильной версии при нажаии на любой пункт меню
    const buttonList = this.list.querySelectorAll('.header__btn');
    buttonList.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.list.classList.contains('is-active')) {
          this.list.classList.remove('is-active');
        }
      });
    });
  }
}
