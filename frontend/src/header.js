import 'babel-polyfill';
import { el } from 'redom';

export default class Header {
  constructor() {
    this.el = el(
      'header.header',
      (this.el = el('.container.header__container', [
        (this.el = el('span.header__logo', 'Coin.')),
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
      ]))
    );

    // //список с кнопками
    // const buttonList = this.list.querySelectorAll('.header__btn');
    // //на каждую кнопку вешаем обработчик
    // buttonList.forEach((btn) => {
    //   btn.addEventListener('click', (e) => {
    //     //если кнопка "выйти", то класс не присваеваем
    //     if (e.target.closest('a.header__btn').getAttribute('href') === '/')
    //       return;
    //     e.target.closest('a.header__btn').classList.add('is-active'); //добавляем класс к текущей кнопке
    //     buttonList.forEach((el) => {
    //       //удаляем активный класс на других кнопках
    //       if (el != e.target.closest('a.header__btn')) {
    //         el.classList.remove('is-active');
    //       }
    //     });
    //   });
    // });
  }
}
