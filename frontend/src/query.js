import 'babel-polyfill';
import ComponentError from './error.js';

const URL = 'localhost:3000/'; //порт подключения к API
let errors = []; //массив для сохранения ошибок
//запрос от обработчика события на вход в приложение
export async function loginInToApp(login, password) {
  try {
    const response = await fetch(`http://${URL}login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        // login: 'developer',
        // password: 'skillbox',
        login: login,
        password: password,
      }),
    });
    if (response.ok === true) {
      const res = await response.json();
      if (res.error === 'Invalid password') {
        await recordErrorApi('password', 'Неверный пароль');
      } else if (res.error === 'No such user') {
        await recordErrorApi('login', 'Пользователь не найден');
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
    const response = await fetch(`http://${URL}accounts`, {
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
    const response = await fetch(`http://${URL}account/${id}`, {
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
    const response = await fetch(`http://${URL}create-account`, {
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
    const response = await fetch(`http://${URL}transfer-funds`, {
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
        await recordErrorApi('Unauthorized', 'Неавторизированный пользователь');
      } else if (res.error === 'Invalid account from') {
        await recordErrorApi(
          'InvalidAccountFrom',
          'Не указан адрес счёта списания'
        );
      } else if (res.error === 'Invalid account to') {
        await recordErrorApi('InvalidAccountTo', 'Не указан счёт зачисления');
      } else if (res.error === 'Invalid amount') {
        await recordErrorApi('InvalidAmount', 'Не указана сумма перевода');
      } else if (res.error === 'Overdraft prevented') {
        await recordErrorApi('OverdraftPrevented', 'Не хватает денег на счете');
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
//записывает ошибку в массив и выбрасывает вверх
export async function recordErrorApi(code, message) {
  errors = [];
  errors[code] = message;
  throw new ComponentError(errors[code]);
}
// возвращает список валютных счетов текущего пользователя
export async function getCurrencies(token) {
  try {
    const response = await fetch(`http://${URL}currencies`, {
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
    const response = await fetch(`http://${URL}all-currencies`, {
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
    const response = await fetch(`http://${URL}currency-buy`, {
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
        await recordErrorApi('Unauthorized', 'Неавторизированный пользователь');
      } else if (res.error === 'Unknown currency code') {
        await recordErrorApi(
          'UnknownСurrencyСode',
          'Передан неверный валютный код'
        );
      } else if (res.error === 'Invalid amount') {
        await recordErrorApi(
          'InvalidAccountTo',
          'Не указана сумма перевода, или она отрицательная'
        );
      } else if (res.error === 'Not enough currency') {
        await recordErrorApi(
          'NotEnoughCurrency',
          'Нет средств на счете списания'
        );
      } else if (res.error === 'Overdraft prevented') {
        await recordErrorApi(
          'OverdraftPrevented',
          'Попытка перевести больше, чем доступно на счёте списания'
        );
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
//подключение протокола WebSocket
export async function connectWebSocket() {
  try {
    const ws = new WebSocket(`ws://${URL}currency-feed`);
    return ws;
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}
//запрос на получение координат банкоматов
export async function getCoordinates() {
  try {
    const response = await fetch(`http://${URL}banks`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    });
    if (response.ok === true) {
      const res = await response.json();
      return res;
    } else {
      throw new ComponentError('Нет ответа от сервера');
    }
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}
