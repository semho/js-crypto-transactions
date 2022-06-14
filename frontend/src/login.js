import 'babel-polyfill';
import { el } from 'redom';
import ComponentError from './error.js';
import icoError from './assets/images/icoError.svg';
import icoSuccess from './assets/images/icoSuccess.svg';

export default class Login {
  constructor(title) {
    //общий контейнер
    this.el = el(
      '.login-account__wrapper',
      //форма
      (this.form = el('form.login-account__form', [
        //заголовок формы
        (this.title = el(
          'h1.login-account__title.offset-sm-2.col-sm-10',
          title
        )),
        //группа ввода на логин
        (this.div = el('.login-account__row.row.align-items-center', [
          (this.subdiv = el(
            '.login-account__col.login-account__col--1.col-sm-1.offset-sm-1',
            (this.label = el(
              'label.login-account__label.col-form-label',
              { for: 'inputLogin' },
              'Логин'
            ))
          )),
          (this.subdiv = el(
            '.login-account__col.col-sm-7',
            (this.login = el('input.login-account__input', {
              type: 'text',
              id: 'inputLogin',
              placeholder: 'Введите Ваш логин',
              name: 'login',
            }))
          )),
          (this.subdiv = el(
            '.login-account__col.col-sm-1.login-account__col--error.d-none',
            (this.img = el('img.login-account__img', { src: icoError }))
          )),
          (this.subdiv = el(
            '.login-account__col.col-sm-1.login-account__col--success.d-none',
            (this.img = el('img.login-account__img', { src: icoSuccess }))
          )),
          (this.hiddenErrorLogin = el(
            '.login-account__error.login-account__error--login.offset-sm-3.col-sm-7.d-none'
          )),
        ])),
        //группа ввода на пароль
        (this.div = el(
          '.login-account__row.login-account__row--2.row.align-items-center',
          [
            (this.subdiv = el(
              '.login-account__col.col-sm-1.offset-sm-1',
              (this.label = el(
                'label.login-account__label.col-form-label',
                { for: 'inputPassword' },
                'Пароль'
              ))
            )),
            (this.subdiv = el(
              '.login-account__col.col-sm-7',
              (this.password = el('input.login-account__input', {
                type: 'password',
                id: 'inputPassword',
                placeholder: '**********',
                name: 'password',
              }))
            )),
            (this.subdiv = el(
              '.login-account__col.col-sm-1.login-account__col--error.d-none',
              (this.img = el('img.login-account__img', { src: icoError }))
            )),
            (this.subdiv = el(
              '.login-account__col.col-sm-1.login-account__col--success.d-none',
              (this.img = el('img.login-account__img', { src: icoSuccess }))
            )),
            (this.hiddenErrorPassword = el(
              '.login-account__error.login-account__error--password.offset-sm-3.col-sm-7.d-none'
            )),
          ]
        )),
        (this.div = el(
          '.login-account__row.row.align-items-center',
          (this.subdiv = el(
            '.login-account__col.login-account__col--3.offset-sm-2.col-sm-10',
            // (this.link = el(
            //   'a.login-account__link',
            //   { href: '/accounts' },
            (this.button = el(
              'button.login-account__btn.btn.btn-primary.disabled',
              { type: 'button' },
              (this.span = el('span', 'Войти'))
            ))
            // ))
          ))
        )),
      ]))
    );
    //помещаем все поля ввода в массив
    const inputs = this.form.querySelectorAll('.login-account__input');
    inputs.forEach((element) => {
      //проходимся по массиву
      //и на каждое поле вешаем обработчик событий blur, после срабатывания которого, отправляем данные поля в функцию
      element.addEventListener('blur', (ev) => this.validationBlur(ev));
      //событие input на каждое поле ввода
      element.addEventListener('input', (ev) => {
        //убираем класс ошибки при вводе нового символа
        element.classList.remove('is-invalid');
        element
          .closest('.login-account__row')
          .querySelector('.login-account__col--error')
          .classList.add('d-none');
        element
          .closest('.login-account__row')
          .querySelector('.login-account__error')
          .classList.add('d-none');
        //отправляем данные поля ввода на проверку, если количество символов более 5
        if (element.value.trim().length > 5) {
          this.validationBlur(ev);
        }
      });
      //имитируем нажатие кнопкой мыши по кнопке войти клавишей ENTER
      element.addEventListener('keydown', (ev) => {
        if (element.value.trim().length > 5 && ev.keyCode === 13) {
          this.getButton().click();
        }
      });
    });
    //флаги состояния валидации полей ввода
    this.loginValide = false;
    this.passwordValide = false;
  }
  //получить кнопку "Войти"
  getButton() {
    return this.button;
  }
  //получить логин
  getLogin() {
    return this.login.value;
  }
  //получить пароль
  getPassword() {
    return this.password.value;
  }
  //обработка события blur на поля ввода
  validationBlur(event) {
    switch (event.target) {
      case this.login: //если передаем логин
        this.conditionHandling(
          event.target.value.trim(),
          event.target,
          'login',
          'Слишком короткий логин'
        );
        break;
      case this.password: //если передаем пароль
        this.conditionHandling(
          event.target.value.trim(),
          event.target,
          'password',
          'Слишком короткий пароль'
        );
        break;
      default:
        break;
    }
    //проверяем валидность полей. Если все ок, кнопку "Войти" делаем активной, иначе снова ее деактивируем
    if (this.loginValide && this.passwordValide) {
      this.button.classList.remove('disabled');
    } else {
      this.button.classList.add('disabled');
    }
  }

  //метод обработки ошибок
  errorHandling(error) {
    ComponentError.errorHandling(error);
  }
  //метод записи ошибки
  recordError(element, titleError) {
    this.showError(element);
    //массив для записи ошибки
    let errorsApp = [];
    errorsApp[element.name] = titleError;
    //показываем ошибку в приложение
    this.showErrorApp(errorsApp);
    //и выкидываем выше
    throw new ComponentError(`${titleError}`);
  }
  //метод отображения ошибки
  showError(element, success = false) {
    let isValid = 'is-valid';
    let isInvalid = 'is-invalid';
    let imgHidden = '.login-account__col--error';
    let imgShow = '.login-account__col--success';
    if (!success) {
      isValid = 'is-invalid';
      isInvalid = 'is-valid';
      imgHidden = '.login-account__col--success';
      imgShow = '.login-account__col--error';
    }
    element.classList.add(isValid);
    element.classList.remove(isInvalid);
    element
      .closest('.login-account__row')
      .querySelector(imgHidden)
      .classList.add('d-none');
    element
      .closest('.login-account__row')
      .querySelector(imgShow)
      .classList.remove('d-none');
  }
  //метод обработки условия
  /*
  @param {String} value   передаем значение поля ввода
  @param {String} input   передаем поле ввода
  @param {String} flag    строка с названием поля для проверки на валидацию
  @param {String} message сообщение об ошибке
  */
  conditionHandling(value, input, flag, message) {
    try {
      if (value.length < 6 && !value.includes(' ')) {
        if (input) {
          this[`${flag}Valide`] = false;
          this.recordError(input, message);
        }
        return false;
      } else if (value.includes(' ')) {
        if (input) {
          this[`${flag}Valide`] = false;
          this.recordError(input, 'В строке не может быть пробела!');
        }
        return false;
      } else {
        if (input) {
          this.showError(input, true);
          this[`${flag}Valide`] = true;
        }
        return true;
      }
    } catch (error) {
      this.errorHandling(error);
    }
  }

  //метод отображения ошибки
  /*@params {array} errors массив с ключ-значение ошибки*/
  showErrorApp(errors) {
    if (errors['login']) {
      this.hiddenErrorLogin.textContent = errors['login'];
      this.hiddenErrorLogin.classList.remove('d-none');
      this.showError(this.login);
    } else if (errors['password']) {
      this.hiddenErrorPassword.textContent = errors['password'];
      this.hiddenErrorPassword.classList.remove('d-none');
      this.showError(this.password);
    } else {
      return;
    }
  }
}
