import 'babel-polyfill';
import { el, setChildren } from 'redom';

//создание имитации селекта
/*
 @param {array}  arrayValue массив объектов типа: [{value: 'number', label: 'По номеру'}, {}]
 @param {string} nameField  строка с названием в поле селекта
*/

export default class CustomSelect {
  constructor(arrayValue, nameField) {
    this.container = el('.select.accounts__select');
    this.list = el('ul.accounts__select-box.select__list');

    for (let i = 0; i <= arrayValue.length - 1; i++) {
      this.li = el(
        'li.accounts__select-option.select__item',
        { 'data-value': arrayValue[i].value },
        arrayValue[i].label
      );
      this.list.append(this.li);
    }
    //выбранный элемент по умолчанию
    if (!nameField) {
      this.select = el(
        'a.accounts__select-link.form-select.select__link',
        { 'data-value': '' },
        'Сортировка'
      );
    } else {
      this.select = el(
        'a.accounts__select-link.form-select.select__link',
        { 'data-value': '' },
        nameField
      );
    }

    setChildren(this.container, [this.select, this.list]);
    //обработчик на селект
    this.select.addEventListener('click', (ev) =>
      this.openList(ev, this.select)
    );

    return this.container;
  }

  //метод открывает весь список селектов
  openList(ev, select) {
    //делаем видимым список
    select.nextElementSibling.classList.toggle('d-block');
    //добавляем клас самому селекту, чтобы перевернуть стрелку
    select.classList.toggle('is-active-select');
    //получаем все елементы списка
    const option = select.nextElementSibling.querySelectorAll(
      '.accounts__select-option'
    );
    //вешаем на них обработчик
    option.forEach((element) => {
      //в начале перебора скрытый элемент списка делаем видимым
      element.classList.remove('d-none');
      //если название элемента в списке равно текущему выбранному в селект, то делаем его невидимым
      if (element.textContent === select.textContent) {
        element.classList.add('d-none');
      }
    });
    //делегируем события каждого элемента списка на весь список
    select.nextElementSibling.addEventListener('click', (event) =>
      this.choiceCurrentElement(event)
    );
  }

  //метод получает выбранный элемент и закрывает весь список селектов
  choiceCurrentElement(event) {
    //получаем выбранный элемент списка
    const element = event.target.closest('.accounts__select-option');
    //если в event.target нет element, то вернет null или если element не принадлежит текущему списку, тоже null
    if (!element || !element.contains(element)) return;

    element.parentElement.classList.remove('d-block'); //сворачиваем список
    element.parentElement.previousElementSibling.classList.remove(
      'is-active-select'
    ); //стрелка в исходное состояние
    element.parentElement.previousElementSibling.textContent =
      element.textContent; //название селекта теперь = элементу списка
    element.parentElement.previousElementSibling.dataset.value =
      element.getAttribute('data-value'); //так же и его значение
  }
}
