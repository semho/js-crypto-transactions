import 'babel-polyfill';
import { el } from 'redom';
import icoBack from './assets/images/coolicon.svg';
import icoSend from './assets/images/mail.svg';
import ComponentError from './error.js';

export default class Card {
  constructor(data) {
    this.el = el('.account-card__wrapper.container', [
      (this.top = el('.account-card__top', [
        (this.el = el('span.account-card__title', 'Просмотр счёта')),
        (this.button = el(
          'button.account-card__btn.btn.btn-primary',
          { type: 'button' },
          (this.el = el('embed.account-card__img', {
            src: icoBack,
          })),
          (this.span = el('span', 'Вернуться назад'))
        )),
      ])),
      (this.bottom = el('.account-card__bottom', [
        (this.info = el('.account-card__info', [
          (this.el = el('.account-card__number', `N ${data.account}`)),
          (this.el = el('.account-card__balance', [
            (this.el = el('span.account-card__balance-name', 'Баланс')),
            (this.balance = el(
              'span.account-card__balance-price',
              data.balance + ' ₽'
            )),
          ])),
        ])),
        (this.view = el('.account-card__view', [
          (this.el = el(
            '.account-card__new-transaction.new-transaction',
            (this.form = el('form.new-transaction__form', [
              (this.title = el('h3.new-transaction__title', 'Новый перевод')),
              (this.div = el('.new-transaction__row.row.align-items-center', [
                (this.subdiv = el(
                  '.new-transaction__col.col-sm-5',
                  (this.label = el(
                    'label.new-transaction__label.col-form-label',
                    { for: 'inputRecipient' },
                    'Номер счета получателя'
                  ))
                )),
                (this.subdiv = el(
                  '.new-transaction__col.col-sm-7.new-transaction__col--p0',
                  [
                    (this.recipient = el('input.new-transaction__input', {
                      type: 'text',
                      id: 'inputRecipient',
                      placeholder: 'Введите счет',
                      name: 'recipient',
                      autocomplete: 'off',
                    })),
                    (this.containerList = el(
                      '.new-transaction__container-list',
                      (this.list = el('ul.new-transaction__list.d-none'))
                    )),
                  ]
                )),
              ])),
              (this.div = el('.new-transaction__row.row.align-items-center', [
                (this.subdiv = el(
                  '.new-transaction__col.col-sm-5',
                  (this.label = el(
                    'label.new-transaction__label.col-form-label',
                    { for: 'inputAmount' },
                    'Сумма перевода'
                  ))
                )),
                (this.subdiv = el(
                  '.new-transaction__col.col-sm-7.new-transaction__col--p0',
                  (this.amount = el('input.new-transaction__input', {
                    type: 'number',
                    id: 'inputAmount',
                    placeholder: 'Введите сумму',
                    name: 'amount',
                    min: '1',
                    autocomplete: 'off',
                  }))
                )),
              ])),
              (this.div = el(
                '.new-transaction__row.row.align-items-center',
                (this.subdiv = el(
                  '.new-transaction__col-btn.offset-sm-5.col-sm-7',
                  (this.buttonSend = el(
                    'button.new-transaction__btn.btn.btn-primary',
                    { type: 'button' },
                    (this.el = el('embed.new-transaction__img', {
                      src: icoSend,
                    })),
                    (this.span = el('span', 'Отправить'))
                  ))
                ))
              )),
            ]))
          )),
          (this.elChart = this.getChart(data)), //отображаем график
        ])),
        (this.historyTransaction = this.getTable(data)), //отображаем транзакции
      ])),
    ]);
    //обработчик событий на кнопку "вернуться назад"
    this.button.addEventListener('click', () => window.history.back());
    //собираем поля формы
    const inputs = this.form.querySelectorAll('input');
    //на каждую вешаем
    inputs.forEach((element) => {
      //обработчик нажития кнопки клавиатуры
      element.addEventListener('keydown', (ev) => this.validationKeyDown(ev));
      //обработчик ввода значения в поле
      element.addEventListener('input', () =>
        element.classList.remove('is-invalid')
      ); //убираем класс указывающий на ошибку
    });
    //обработчик событий на поле ввода счета
    this.recipient.addEventListener('input', () => {
      this.showTransferAccounts(data);
    });
  }
  //показываем список счетов перевода прошлых транзакций
  showTransferAccounts(data) {
    //получаем массив объектов
    const arrTransfers = JSON.parse(sessionStorage.getItem(data.account));
    //если его нет, выходим
    if (arrTransfers === null) return;
    //создаем элемент список для счетов
    const list = el('ul.new-transaction__list');
    //проходимся по массиву объектов
    arrTransfers.forEach((obj) => {
      //если номер счета в локальном хранилище совпадает с вводимым в поле
      if (
        obj.to.startsWith(this.recipient.value) &&
        this.recipient.value !== ''
      ) {
        //добавляем в выпадающий список этот счет
        list.append(
          el(
            'li.new-transaction__item',
            el('a.new-transaction__link', { href: '#' }, obj.to)
          )
        );
      }
    });
    //заменяем прошлый список вновь сформированным
    document.querySelector('.new-transaction__list').replaceWith(list);
    //вызываем метод, который вставляет в поле ввода выбранный счет
    this.insertAccount();
  }
  //метод вставляет в поле ввода выбранный счет
  insertAccount() {
    //получаем все ссылки списка в NodeList
    const linksToAccouns = document.querySelectorAll('.new-transaction__link');
    //если есть хотя бы одна
    if (linksToAccouns.length > 0) {
      //на каждую ссылку вешаем обработчик
      linksToAccouns.forEach((link) => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          //при клике поле ввода получает значение ссылки
          this.recipient.value = event.target.textContent;
          //удаляем выпадающий список
          document.querySelector('.new-transaction__list').innerHTML = '';
          document
            .querySelector('.new-transaction__list')
            .classList.add('d-none');
        });
      });
    } else {
      //иначе скрываем список
      document.querySelector('.new-transaction__list').classList.add('d-none');
    }
  }

  //возвращаем кнопку "отправить" в блоке "новый перевод"
  getBtnSend() {
    return this.buttonSend;
  }

  //метод переводит средства с текущего счета на новый счет
  transferFunds(data) {
    try {
      if (this.recipient.value === '') {
        this.recordError(this.recipient, 'Не введен счет получателя');
      } else if (!/^(0|[1-9]\d*)$/.test(this.recipient.value)) {
        this.recordError(
          this.recipient,
          'В поле ввода не число, либо оно начинается с нуля'
        );
      } else if (Number(this.amount.value) === 0 || this.amount.value === '') {
        this.recordError(
          this.amount,
          'Сумма перевода не может быть ноль или пустой'
        );
      } else {
        return {
          from: data.account,
          to: this.recipient.value,
          amount: this.amount.value,
        };
      }
    } catch (error) {
      ComponentError.errorHandling(error);
    }
  }
  //метод выбрасывает ошибку выше
  recordError(field, message) {
    field.classList.add('is-invalid');
    throw new ComponentError(message);
  }

  //метод запрещает вводить все символы, кроме цифр
  validationKeyDown(event) {
    // Разрешаем: backspace, delete, tab и escape
    if (
      event.keyCode == 46 ||
      event.keyCode == 8 ||
      event.keyCode == 9 ||
      event.keyCode == 27 ||
      // Разрешаем: Ctrl+A
      (event.keyCode == 65 && event.ctrlKey === true) ||
      // Разрешаем: Ctrl+V
      (event.keyCode == 86 && event.ctrlKey === true) ||
      // Разрешаем: home, end, влево, вправо
      (event.keyCode >= 35 && event.keyCode <= 39)
    ) {
      // Ничего не делаем
      return;
    } else {
      // Запрещаем все, кроме цифр на основной клавиатуре, а так же Num-клавиатуре
      if (
        (event.keyCode < 48 || event.keyCode > 57) &&
        (event.keyCode < 96 || event.keyCode > 105)
      ) {
        event.preventDefault();
      }
    }
  }
  //метод возвращает контейнер под график с балансом
  getChart(data) {
    if (data.transactions.length === 0) return; //если нет массива транзакций, то график не показываем
    return el('.account-card__chart.chart', [
      (this.chartTitle = el('h3.chart__title', 'Динамика баланса')),
      (this.chart = el('.chart__wrapper#gd')),
    ]);
  }
  //метод возвращает таблицу с транзакциями
  getTable(data) {
    //если есть транзацкии - отображаем таблицу
    if (data.transactions.length === 0) return;
    //возвращаем всю таблицу
    return el('.account-card__history-transaction.history-transaction', [
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
        this.getBodyTable(data),
      ]),
    ]);
  }
  //возвращаем тело таблицы
  getBodyTable(data) {
    //получаем отсортированный массив
    const sortedByDate = this.sortedByDate(data.transactions);
    //получаем первые(последние по проведению транзакций) 10 элементов массива
    const lastTenTransactions = sortedByDate.slice(0, 10);
    //подставляем значения в тело таблицы
    const tbody = el('tbody.history-transaction__tbody');
    lastTenTransactions.forEach((element) => {
      const tr = el('tr', [
        el('td', element.from),
        el('td.history-transaction__element-to', element.to),
        this.checkingTransferAmount(data, element),
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
  checkingTransferAmount(data, element) {
    if (data.account === element.to) {
      return el('td.plus', `+ ${element.amount} ₽`);
    } else return el('td.minus', `- ${element.amount} ₽`);
  }
}
