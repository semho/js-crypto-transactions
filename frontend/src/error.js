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
    } else if (error instanceof TypeError) {
      console.log(error.message);
    } else throw error;
  }
}
