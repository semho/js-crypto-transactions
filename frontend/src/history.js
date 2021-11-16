import 'babel-polyfill';
import { el } from 'redom';
import icoBack from './assets/images/coolicon.svg';

export default class History {
  constructor(data) {
    this.el = el('.account-history__wrapper.container', [
      (this.top = el('.account-history__top', [
        (this.el = el('span.account-history__title', 'История баланса')),
        (this.button = el(
          'button.account-history__btn.btn.btn-primary',
          { type: 'button' },
          (this.el = el('embed.account-history__img', {
            src: icoBack,
          })),
          (this.span = el('span', 'Вернуться назад'))
        )),
      ])),
      (this.bottom = el('.account-history__bottom', [
        (this.info = el('.account-history__info', [
          (this.el = el('.account-history__number', `N ${data.account}`)),
          (this.el = el('.account-history__balance', [
            (this.el = el('span.account-history__balance-name', 'Баланс')),
            (this.el = el(
              'span.account-history__balance-price',
              data.balance + ' Р'
            )),
          ])),
        ])),
        (this.dynamicsChart = this.getChart(
          data,
          'Динамика баланса',
          'dynamicsChart'
        )),
        (this.ratioChart = this.getChart(
          data,
          'Соотношение входящих исходящих транзакций',
          'ratioChart'
        )),
        (this.historyTransaction = this.getTable(data)), //отображаем транзакции
      ])),
    ]);
    //обработчик событий на кнопку "вернуться назад"
    this.button.addEventListener('click', () => window.history.back());
  }
  //метод возвращает контейнер под график
  getChart(data, title, id) {
    if (data.transactions.length === 0) return; //если нет массива транзакций, то график не показываем
    return el('.account-history__chart.chart', [
      (this.chartTitle = el('h3.chart__title', `${title}`)),
      (this.chart = el(`.chart__wrapper#${id}`)),
    ]);
  }
  //метод возвращает таблицу с транзакциями
  getTable(data) {
    //если есть транзацкии - отображаем таблицу
    if (data.transactions.length === 0) return;
    //возвращаем всю таблицу
    return el('.account-history__history-transaction.history-transaction', [
      el('h3.history-transaction__title', 'История переводов'),
      el('table.history-transaction__table.table', [
        el(
          'thead.history-transaction__thead',
          el('tr', [
            el('th', { scope: 'col' }, 'Счёт отправителя'),
            el('th', { scope: 'col' }, 'Счёт получателя'),
            el('th', { scope: 'col' }, 'Сумма'),
            el('th', { scope: 'col' }, 'Дата'),
          ])
        ),
        this.getBodyTable(data.transactions, data.account),
      ]),
      this.getPagination(data, data.account),
    ]);
  }
  //возвращает постраничную пагинацию
  getPagination(data, id) {
    if (data.transactions.length > 25) {
      //получаем отсортированный массив
      const sortedByDate = this.sortedByDate(data.transactions);
      //получаем первые(последние по проведению транзакций) 250 элементов массива
      const lastTransactions = sortedByDate.slice(0, 250);
      //получаем массив массивов объектов
      const arrCommon = this.getArrForPagination(lastTransactions);
      const list = el('ul.pagination__list'); //список
      //вставляем каждый элемент списка в список
      for (let index = 0; index < arrCommon.length; index++) {
        list.append(
          el(
            'li.pagination__item',
            el(
              'a.pagination__link',
              { href: index },
              el(
                'button.pagination__btn.btn.btn-primary',
                { type: 'button' },
                el('span', index + 1)
              )
            )
          )
        );
      }
      //обработчик на список страниц
      list.addEventListener('click', (event) =>
        this.openPage(list, arrCommon, id, event)
      );
      const container = el('.history-transaction__pagination.pagination', list);

      return container;
    }
  }
  //обработка нажатие на страницу постраничной навигации таблицы истории транзакций
  openPage(list, data, id, event) {
    event.preventDefault();
    const currentPage = event.target.closest('.pagination__link');
    if (!currentPage || !list.contains(currentPage)) return;
    const body = this.getBodyTable(data[currentPage.getAttribute('href')], id);
    document.querySelector('.history-transaction__tbody').replaceWith(body);
  }
  //получаем массив массивов объектов разбитый по 25 транзакций
  getArrForPagination(data) {
    const arrCommon = []; //главный массив
    let arrFor25Transactions = []; //массив под 25 транзакций
    let step = 0;
    //перебираем входящий массив
    for (let index = 0; index < data.length; index++) {
      step++;
      arrFor25Transactions.push(data[index]);
      //на 25 шаге заполняем главный массив массивом 25 транзакций и шаг вновь обнуляем
      if (step === 25) {
        arrCommon.splice(
          -1,
          0,
          ...arrCommon.splice(-1, 1, arrFor25Transactions)
        );
        arrFor25Transactions = [];
        step = 0;
      }
    }
    return arrCommon;
  }
  //возвращаем тело таблицы
  getBodyTable(data, id) {
    //получаем отсортированный массив
    const sortedByDate = this.sortedByDate(data);
    //получаем первые(последние по проведению транзакций) 25 элементов массива
    const lastTransactions = sortedByDate.slice(0, 25);
    //подставляем значения в тело таблицы
    const tbody = el('tbody.history-transaction__tbody');
    lastTransactions.forEach((element) => {
      const tr = el('tr', [
        el('td', element.from),
        el('td', element.to),
        this.checkingTransferAmount(id, element),
        el('td', this.dateConversion(element.date)),
      ]);
      tbody.append(tr);
    });
    return tbody;
  }
  //метод сортировки транзакций по убыванию
  sortedByDate(transactions) {
    return transactions.slice().sort((a, b) => {
      //получаем копию массива и сортируем по дате
      return new Date(b.date) - new Date(a.date);
    });
  }
  //метод преобразует дату к требуемому виду
  dateConversion(value) {
    const arrayDate = value.split('-');
    const getYear = arrayDate[0];
    const getMonth = arrayDate[1];
    const getDay = arrayDate[2].split('T')[0];

    return `${getDay}.${getMonth}.${getYear}`;
  }
  //метод меняет знак и цвет суммы перевода
  checkingTransferAmount(id, element) {
    if (id === element.to) {
      return el('td.plus', `+ ${element.amount} Р`);
    } else return el('td.minus', `- ${element.amount} Р`);
  }
}
