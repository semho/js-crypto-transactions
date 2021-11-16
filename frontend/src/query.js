import 'babel-polyfill';
import ComponentError from './error.js';
const URL = 'http://localhost:3000/'; //порт подключения к API
let errors = []; //массив для сохранения ошибок
//запрос от обработчика события на вход в приложение
export async function loginInToApp(login, password) {
  try {
    const response = await fetch(`${URL}login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        login: 'developer',
        password: 'skillbox',
        // login: login,
        // password: password,
      }),
    });
    if (response.ok === true) {
      const res = await response.json();
      if (res.error === 'Invalid password') {
        errors = [];
        errors['password'] = 'Неверный пароль';
        throw new ComponentError('Неверный пароль');
      } else if (res.error === 'No such user') {
        errors = [];
        errors['login'] = 'Логин не найден';
        throw new ComponentError('Пользователя с таким логином не существует');
      } else {
        return res;
      }
    } else {
      throw new ComponentError('Нет ответа от сервера');
    }
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//Возвращаем список счетов
export async function getAccounts(token) {
  try {
    const response = await fetch(`${URL}accounts`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Basic ${token}`,
      },
    });
    if (response.ok === true) {
      const res = await response.json();
      if (res.error) {
        throw new ComponentError('Неавторизированный пользователь');
      } else {
        return res;
      }
    } else {
      throw new ComponentError('Нет ответа от сервера');
    }
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//Возвращаем подробную информацию о счете
export async function getAccountDetail(token, id) {
  try {
    const response = await fetch(`${URL}account/${id}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Basic ${token}`,
      },
    });
    if (response.ok === true) {
      const res = await response.json();
      if (res.error) {
        throw new ComponentError('Неавторизированный пользователь');
      } else {
        return res;
      }
    } else {
      throw new ComponentError('Нет ответа от сервера');
    }
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//создаем новый счет
export async function createNewAccount(token) {
  try {
    const response = await fetch(`${URL}create-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Basic ${token}`,
      },
    });
    if (response.ok === true) {
      const res = await response.json();
      if (res.error) throw new ComponentError('Ошибка создания счета');
      return res;
    } else {
      throw new ComponentError('Нет ответа от сервера');
    }
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

export function showError() {
  return errors;
}
//перевод средств на другой счет
export async function transferFoundsAccount(obj, token) {
  if (obj === undefined) return;
  try {
    const response = await fetch(`${URL}transfer-funds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Basic ${token}`,
      },
      body: JSON.stringify({
        from: obj.from, // счёт с которого списываются средства
        to: obj.to, // счёт, на который зачисляются средства
        amount: obj.amount, // сумма для перевода
      }),
    });
    if (response.ok === true) {
      const res = await response.json();
      if (res.error === 'Unauthorized') {
        errors = [];
        errors['Unauthorized'] = 'Неавторизированный пользователь';
        throw new ComponentError(errors['Unauthorized']);
      } else if (res.error === 'Invalid account from') {
        errors = [];
        errors['InvalidAccountFrom'] = 'Не указан адрес счёта списания';
        throw new ComponentError(errors['InvalidAccount']);
      } else if (res.error === 'Invalid account to') {
        errors = [];
        errors['InvalidAccountTo'] = 'Не указан счёт зачисления';
        throw new ComponentError(errors['InvalidAccountTo']);
      } else if (res.error === 'Invalid amount') {
        errors = [];
        errors['InvalidAmount'] = 'Не указана сумма перевода';
        throw new ComponentError(errors['InvalidAmount']);
      } else if (res.error === 'Overdraft prevented') {
        errors = [];
        errors['OverdraftPrevented'] = 'Не хватает денег на счете';
        throw new ComponentError(errors['OverdraftPrevented']);
      } else {
        return res;
      }
    } else {
      throw new ComponentError('Нет ответа от сервера');
    }
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}
// возвращает список валютных счетов текущего пользователя
export async function getCurrencies(token) {
  try {
    const response = await fetch(`${URL}currencies`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Basic ${token}`,
      },
    });
    if (response.ok === true) {
      const res = await response.json();
      if (res.error) {
        throw new ComponentError('Неавторизированный пользователь');
      } else {
        return res;
      }
    } else {
      throw new ComponentError('Нет ответа от сервера');
    }
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}
// возвращает массив со списком кодов всех используемых бекэндом валют на данный момент
export async function getAllCurrencies(token) {
  try {
    const response = await fetch(`${URL}all-currencies`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Basic ${token}`,
      },
    });
    if (response.ok === true) {
      const res = await response.json();
      if (res.error) {
        throw new ComponentError('Неавторизированный пользователь');
      } else {
        return res;
      }
    } else {
      throw new ComponentError('Нет ответа от сервера');
    }
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//обмен валют на текущем аккаунте
export async function currencyTransfer(obj, token) {
  if (obj === undefined) return;
  try {
    const response = await fetch(`${URL}currency-buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Basic ${token}`,
      },
      body: JSON.stringify({
        from: obj.from, // валюта которую нужно поменять(списание)
        to: obj.to, // на валюту которую нужно получить(зачисление)
        amount: obj.amount, // сумма для обмена
      }),
    });
    if (response.ok === true) {
      const res = await response.json();
      if (res.error === 'Unauthorized') {
        errors = [];
        errors['Unauthorized'] = 'Неавторизированный пользователь';
        throw new ComponentError(errors['Unauthorized']);
      } else if (res.error === 'Unknown currency code') {
        errors = [];
        errors['UnknownСurrencyСode'] = 'Передан неверный валютный код';
        throw new ComponentError(errors['UnknownСurrencyСode']);
      } else if (res.error === 'Invalid amount') {
        errors = [];
        errors['InvalidAmount'] =
          'Не указана сумма перевода, или она отрицательная';
        throw new ComponentError(errors['InvalidAccountTo']);
      } else if (res.error === 'Not enough currency') {
        errors = [];
        errors['NotEnoughCurrency'] = 'Нет средств на счете списания';
        throw new ComponentError(errors['InvalidAmount']);
      } else if (res.error === 'Overdraft prevented') {
        errors = [];
        errors['OverdraftPrevented'] =
          'Попытка перевести больше, чем доступно на счёте списания';
        throw new ComponentError(errors['OverdraftPrevented']);
      } else {
        return res;
      }
    } else {
      throw new ComponentError('Нет ответа от сервера');
    }
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}
