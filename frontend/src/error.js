import 'babel-polyfill';
import { el, mount } from 'redom';

//класс ошибки
export default class ComponentError extends Error {
  constructor(fieldErrors) {
    super();
    this.fieldErrors = fieldErrors;
  }

  //метод обработки ошибок
  static errorHandling(error) {
    if (error instanceof ComponentError) {
      console.log(error.fieldErrors);
      this.blockWithErrorApp(error.fieldErrors);
    } else if (error instanceof TypeError) {
      console.log(error.message);
      this.blockWithErrorServer(error.message);
    } else throw error;
  }
  static async blockWithErrorApp(message) {
    mount(
      document.querySelector('.content'),
      await this.createBlockWithErrorApp(message)
    );
    setTimeout(this.destroyBlockWithErrorApp, 3000);
  }

  //создание блока с ошибкой
  static async createBlockWithErrorApp(message) {
    return el('.block-with-error-app', el('h3', message));
  }
  //удаление блока с ошибкой
  static destroyBlockWithErrorApp() {
    document.querySelector('.block-with-error-app').remove();
  }

  //появление и удаление блока с ошибкой разрыва сервера после 3 секунд
  static async blockWithErrorServer(message) {
    if (message === 'Failed to fetch') {
      mount(
        document.querySelector('.content'),
        await this.createBlockWithErrorServer(
          'Нет соединениея с сервером. Попробуйте еще раз.'
        )
      );
    } else {
      mount(
        document.querySelector('.content'),
        await this.createBlockWithErrorServer(message)
      );
    }
    setTimeout(this.destroyBlockWithErrorServer, 3000);
  }

  //создание блока с ошибкой
  static async createBlockWithErrorServer(message) {
    return el('.block-with-error', el('h3', message));
  }
  //удаление блока с ошибкой
  static destroyBlockWithErrorServer() {
    document.querySelector('.block-with-error').remove();
  }
}
