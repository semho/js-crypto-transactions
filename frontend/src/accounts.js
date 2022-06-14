import 'babel-polyfill';
import { el, setChildren } from 'redom';
import CustomSelect from './customSelect.js';
import icoNewAccount from './assets/images/X.svg';

// в конcтанту получаем экзепляр класса селект
const select = new CustomSelect([
  { value: 'number', label: 'По номеру' },
  { value: 'balance', label: 'По балансу' },
  { value: 'transaction', label: 'По последней транзакции' },
]);

//класс отображения списка всех счетов с сортировкой и кнопкой создания счета
export default class Accounts {
  constructor(data) {
    this.el = el('.accounts__wrapper.container', [
      (this.top = el('.accounts__top', [
        (this.el = el('.accounts__select-wrapper', [
          (this.el = el('span.accounts__select-title', 'Ваши счета')),
          (this.option = select),
        ])),
        (this.button = el(
          'button.accounts__btn.btn.btn-primary',
          { type: 'button' },
          (this.el = el('embed.accounts__img', {
            src: icoNewAccount,
          })),
          (this.span = el('span', 'Создать новый счёт'))
        )),
      ])),
      (this.bottom = el('.accounts__bottom', this.getCards(data.payload))),
    ]);
    //обработчик собитий на элементы селекта
    this.option.querySelectorAll('.accounts__select-option').forEach((el) => {
      el.addEventListener('click', (event) =>
        this.sortingAccounts(event, data)
      );
    });
  }
  //метод сотрирует массив с счетами
  sortingAccounts(event, data) {
    const arrObjSort = data.payload.slice();
    const arrObjWithTransactions = [];
    const arrObjEmptyTransactions = [];
    switch (event.target.dataset.value) {
      case 'number':
        this.renderAccounts('account', arrObjSort);
        break;
      case 'balance':
        this.renderAccounts('balance', arrObjSort);
        break;
      case 'transaction':
        arrObjSort.forEach((item) => {
          if (item.transactions.length > 0) {
            arrObjWithTransactions.push(item);
          } else {
            arrObjEmptyTransactions.push(item);
          }
        });
        this.renderAccounts(
          'transaction',
          arrObjWithTransactions,
          arrObjEmptyTransactions
        );
        break;
      default:
        break;
    }
  }
  //отображение счетов в зависимости от поля сортировки
  /*@param {string} sortingByField поле по которому сортируем массив
    @param {array}  arr            сортируемый массив
    @param {array}  addArr         добавочный массив, который не должен быть сортирован
  */
  renderAccounts(sortingByField, arr, addArr) {
    let sortingArr = arr.sort((a, b) => a[sortingByField] - b[sortingByField]);
    if (addArr) {
      sortingArr.reverse();
      setChildren(this.bottom, this.getCards([...addArr, ...sortingArr]));
    } else {
      setChildren(this.bottom, this.getCards(sortingArr));
    }
  }
  //получить кнопку добавления счета
  getButtonAddAccount() {
    return this.button;
  }
  //получить контейнер со всеми счетами
  getContainerAllCards() {
    return this.bottom;
  }

  //метод отображения счетов по данным из API
  getCards(data) {
    const cards = data; //массив счетов
    const container = el('.accounts__wrapper-card'); //контейнер всех счетов
    cards.forEach((objCard) => {
      //получаем каждый счет из массива объектов
      const transactions = objCard.transactions; //массив транзакций
      const elInfoTransaction = el('.card__info-transaction'); //контейнер для транзакции
      if (transactions.length > 0) {
        //если в массиве транзакций есть хотя бы один элемент
        const date = this.getDate(transactions[0].date); //получаем дату последней транзакции
        setChildren(elInfoTransaction, [
          //добавляем в контейнер последнию транцакцию
          el('span.card__title-transaction', 'Последняя транзакция:'),
          el('span.card__date-transaction', `${date}`),
        ]);
      }
      //контейнер одного счета
      const card = el('.accounts__card.card', [
        el('h3.card__title', `${objCard.account}`),
        el('span.card__balance', `${objCard.balance} ₽`),
        el('.card__bottom', [
          elInfoTransaction,
          el(
            'button.card__btn.btn.btn-primary',
            { type: 'button' },
            el('span', 'Открыть')
          ),
        ]),
      ]);
      container.append(card); //помещаем каждый счет в общий контейнер
    });
    return container;
  }
  //метод отображения даты, полученной из API
  getDate(value) {
    const months = [
      'Января',
      'Февраля',
      'Марта',
      'Апреля',
      'Мая',
      'Июня',
      'Июля',
      'Августа',
      'Сентября',
      'Октября',
      'Ноября',
      'Декабря',
    ];
    const arrayDate = value.split('-');
    const getYear = arrayDate[0];
    const getMonth = arrayDate[1];
    const getDay = arrayDate[2].split('T')[0];

    return `${getDay} ${months[getMonth - 1]} ${getYear}`;
  }
}
