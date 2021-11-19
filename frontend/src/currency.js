import 'babel-polyfill';
import { el } from 'redom';
import CustomSelect from './customSelect';
import ComponentError from './error.js';
import courseUp from './assets/images/courseUp.svg';
import courseDown from './assets/images/courseDown.svg';

export default class Currency {
  constructor(dataCurrencies, arrAllCurrencies) {
    this.el = el('.currency__wrapper.container', [
      (this.top = el(
        '.currency__top',
        (this.el = el('span.currency__title', 'Валютный обмен'))
      )),
      (this.bottom = el('.currency__bottom', [
        (this.leftWrapper = el('.currency__left-wrapper', [
          (this.currencies = el('.currency__currencies.currencies', [
            (this.title = el('.currencies__title', 'Ваши валюты')),
            (this.currenciesWrapper = el(
              '.currencies__wrapper',
              this.getListCurrencies(dataCurrencies)
            )),
          ])),
          (this.exchange = el('.currency__exchange.exchange', [
            (this.title = el('.exchange__title', 'Обмен валюты')),
            (this.exchangeWrapper = el('.exchange__wrapper', [
              (this.form = el('form.exchange__form.row', [
                (this.col = el('.col-sm-9', [
                  (this.row = el('.row.exchange__firstRow', [
                    (this.col = el(
                      '.col-sm-1',
                      (this.label = el(
                        'label.exchange__label.col-form-label',
                        'Из'
                      ))
                    )),
                    (this.col = el(
                      '.col-sm-5',
                      (this.selectFrom = this.getSelect(arrAllCurrencies))
                    )),
                    (this.col = el(
                      '.col-sm-1',
                      (this.label = el(
                        'label.exchange__label.col-form-label',
                        'в'
                      ))
                    )),
                    (this.col = el(
                      '.col-sm-5',
                      (this.selectTo = this.getSelect(arrAllCurrencies))
                    )),
                  ])),
                  (this.row = el('.row', [
                    (this.col = el(
                      '.col-sm-2',
                      (this.label = el(
                        'label.exchange__label.col-form-label',
                        { for: 'amountExchange' },
                        'Сумма'
                      ))
                    )),
                    (this.col = el(
                      '.col-sm-10',
                      (this.amount = el(
                        'input.exchange__input.exchange__input--amount',
                        {
                          type: 'text',
                          id: 'amountExchange',
                          placeholder: 'Введите сумму',
                          name: 'amountExchange',
                          autocomplete: 'off',
                        }
                      ))
                    )),
                  ])),
                ])),
                (this.col = el(
                  '.col-sm-3',
                  (this.btn = el(
                    'button.exchange__btn.btn.btn-primary',
                    { type: 'button' },
                    (this.span = el('span', 'Обменять'))
                  ))
                )),
              ])),
            ])),
          ])),
        ])),
        (this.rightWrapper = el(
          '.currency__right-wrapper.course-change',
          (this.box = el('.course-change__box', [
            (this.title = el(
              '.course-change__title',
              'Изменение курсов в реальном времени'
            )),
            (this.courseChangeList = el('ul.course-change__list')),
          ]))
        )),
      ])),
    ]);
    //запрещаем вводить все символы, кроме цифр в поле водда суммы
    this.amount.addEventListener('keydown', (ev) => this.validationKeyDown(ev));
    this.amount.addEventListener('input', () =>
      //убираем класс указывающий на ошибку
      this.amount.classList.remove('is-invalid')
    );
  }
  //возвращаем контейнер списка валют
  getCurrenciesWrapper() {
    return this.currenciesWrapper;
  }

  //возвращаем кнопку "Обменять" в блоке "обмен валюты"
  getBtnExchange() {
    return this.btn;
  }

  //метод возвращает объект с валютами и суммой обмена
  currencyExchange() {
    const errors = []; //массив для ошибок
    try {
      if (Number(this.amount.value) === 0 || this.amount.value === '') {
        errors['amount'] = 'Сумма обмена не может быть ноль или пустой';
        this.amount.classList.add('is-invalid');
        throw new ComponentError(errors['amount']);
      } else if (!/^(0|[1-9]\d*)$/.test(this.amount.value)) {
        errors['noNumber'] =
          'В поле ввода суммы не число, либо оно начинается с нуля или оно отрицательное';
        this.amount.classList.add('is-invalid');
        throw new ComponentError(errors['noNumber']);
      } else if (
        this.selectFrom.firstChild.dataset.value === '' ||
        this.selectTo.firstChild.dataset.value === ''
      ) {
        errors['select'] = 'Не определена валюта в селекте для обмена';
        throw new ComponentError(errors['select']);
      } else if (
        this.selectFrom.firstChild.dataset.value ===
        this.selectTo.firstChild.dataset.value
      ) {
        errors['selectEquality'] = 'Валюты для обмена должны быть разными';
        throw new ComponentError(errors['selectEquality']);
      } else {
        return {
          from: this.selectFrom.firstChild.dataset.value,
          to: this.selectTo.firstChild.dataset.value,
          amount: this.amount.value,
        };
      }
    } catch (error) {
      ComponentError.errorHandling(error);
    }
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
  //метод возвращает экземпляр объекта кастомного селекта
  getSelect(arrCodes) {
    const arrObj = [];
    arrCodes.forEach((item) => {
      arrObj.push({ value: item, label: item });
    });
    const select = new CustomSelect(arrObj, 'Валюта');

    return select;
  }

  //метод возвращает список валют с данными из API
  getListCurrencies(data) {
    //контейнер списка
    const list = el('ul.currencies__list');
    //перебираем объекты объекта
    Object.values(data).forEach((obj) => {
      const item = el('li.currencies__item', [
        el('span.currencies__code', obj.code),
        el('span.currencies__border'),
        el('span.currencies__amount', this.transformAmount(obj.amount)),
      ]);
      list.append(item);
    });
    return list;
  }
  //возвращает преобразованную ценну с пробелами через 3 знака и без нулей после запятой
  transformAmount(amount) {
    //преобразовываем цену и убираем ноль в конце строки
    const numberFormat = this.numberFormat(amount, '2', '.', ' ').replace(
      /0*$/,
      ''
    );
    //убираем точку в конце строки
    const newFormat = numberFormat.replace(/\.*$/, '');

    return newFormat;
  }
  //возвращает число с заданными параметрами
  /*
  @param {number} number        передаем число
  @param {string} decimals      сколько нецелых значений после разделителя
  @param {string} dec_point     указываем разделитель
  @param {string} thousands_sep указываем символ, который будет разделять целые числа при их длине строки больше 3
  */
  numberFormat(number, decimals, dec_point, thousands_sep) {
    // Format a number with grouped thousands
    var i, j, kw, kd, km;

    if (isNaN((decimals = Math.abs(decimals)))) {
      decimals = 2;
    }
    if (dec_point == undefined) {
      dec_point = ',';
    }
    if (thousands_sep == undefined) {
      thousands_sep = '.';
    }

    i = parseInt((number = (+number || 0).toFixed(decimals))) + '';

    if ((j = i.length) > 3) {
      j = j % 3;
    } else {
      j = 0;
    }

    km = j ? i.substr(0, j) + thousands_sep : '';
    kw = i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands_sep);
    kd = decimals
      ? dec_point +
        Math.abs(number - i)
          .toFixed(decimals)
          .replace(/-/, 0)
          .slice(2)
      : '';

    return km + kw + kd;
  }
  //метод добавляет новый элемент списка с курсом
  addItemCourse(obj) {
    //в отдельную констанку выделяем элемент под бордер для возножности дальнейшей смены цвета в зависимости от курса
    const border = el('span.course-change__border');
    //новый элемент списка с курсом
    const li = el('li.course-change__item', [
      el('span.course-change__code', `${obj.from}/${obj.to}`),
      border,
      el('span.course-change__rate', obj.rate),
      el('span.course-change__change', this.courseChange(obj.change, border)),
    ]);
    //если элементов уже больше 12, то удаляем первый в списке(последний в коллекции)
    if (this.courseChangeList.childNodes.length < 12) {
      return this.courseChangeList.prepend(li);
    } else {
      this.courseChangeList.lastChild.remove();
      return this.courseChangeList.prepend(li);
    }
  }
  //в зависимости от курса меняем цвет бордера и цвет/положение стрелки
  courseChange(value, border) {
    if (value === 1) {
      //курс растет
      const img = el('img', { src: courseUp });
      border.style.color = '#76CA66';
      return img;
    } else {
      //курс падает
      const img = el('img', { src: courseDown });
      border.style.color = '#FD4E5D';
      return img;
    }
  }
}
