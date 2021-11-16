import 'babel-polyfill'; //подключаем полифил для того, чтобы любой браузер понимал
import Navigo from 'navigo';
import { el, setChildren } from 'redom';
import ComponentError from './error.js';
import './style.scss';
import Header from './header.js'; //шапка
import Login from './login.js'; // класс для входа в аккаунт
import {
  loginInToApp,
  getAccounts,
  getAccountDetail,
  createNewAccount,
  showError,
  transferFoundsAccount,
  getCurrencies,
  getAllCurrencies,
  currencyTransfer,
} from './query.js'; // запросы к API
import Accounts from './accounts.js'; //класс для отображения всех счетов
import Card from './card.js'; //класс для отображения счета детально
import { showChartDynamicBalance, showChartRatio } from './charts.js'; //библиотека графиков с их отображениями
import History from './history.js'; //подключаем класс для отображения подробной истории счета
import Currency from './currency.js'; //класс для отображения валютных операций

import WebSocket from 'ws';
// import WebsocketTransport from 'websocket-transport';

const router = new Navigo('/'); //роутинг
const main = el('main'); //контент
let token = null; //переменная в памяти для токена

const header = new Header();
setChildren(document.body, [header, main]); //создаем DOM дерево

//функция загружает индексную страницу
async function isIndex() {
  try {
    const login = new Login('Вход в аккаунт');
    //обработчик на кнопку "Войти"
    const btn = login.getButton();
    btn.addEventListener('click', async () => {
      //входим в приложение
      await enterInApp(login);
    });

    return el('section.section-login.login-account', login);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//функция загружает страницу со счетами
async function isAccounts() {
  try {
    // const data = await getAccounts(token); //получаем данные от сервера в виде массива объектов счетов
    const data = await getAccounts(localStorage.getItem('tokenStorage')); //получаем данные от сервера в виде массива объектов счетов
    if (!data) {
      //если нет доступа
      throw new ComponentError('Не удалось получить доступ к счетам');
    }
    const accounts = new Accounts(data); //отображаем данные на странице
    const btn = accounts.getButtonAddAccount(); //кнопка добавления счета
    btn.addEventListener('click', async () => {
      //событие на добавление нового счета
      await addNewAccountEvent();
    });
    //получаем контейнер со всеми счетами
    const containerCards = accounts.getContainerAllCards();
    //вешаем обработчие событий, делигируем события в функцию
    containerCards.addEventListener('click', (event) => showCardDetail(event));

    return el('section.section-accounts.accounts', accounts);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//функция загружает детальную страницу счета
async function isCard(id) {
  try {
    // const data = await getAccountDetail(token, id); //получаем данные текущего счета
    const data = await getAccountDetail(
      localStorage.getItem('tokenStorage'),
      id
    ); //получаем данные текущего счета
    if (!data) {
      //если нет доступа
      throw new ComponentError('Не удалось получить доступ к данному счету');
    }
    const card = new Card(data.payload); //отображаем данные на странице
    //обработчик событий на кнопку "отправить" в блоке "новый перевод"
    card.getBtnSend().addEventListener('click', async () => {
      await sendTransferFunds(card, data, id);
    });
    return el('section.section-account-card.account-card', card);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}
//функция загружает страницу валютного обмена
async function isCurrency() {
  try {
    //получаем список валютных счетов текущего пользователя
    // const dataCurrencies = await getCurrencies(token);
    const dataCurrencies = await getCurrencies(
      localStorage.getItem('tokenStorage')
    );
    //получаем массив всех кодов валют
    const arrAllCurrencies = await getAllCurrencies(
      localStorage.getItem('tokenStorage')
    );

    //подключаем WebSocket
    const ws = new WebSocket('http://localhost:3000/currency-feed');
    ws.on('message', function incoming(message) {
      console.log('received: ', message);
    });

    // WebsocketTransport.connect(
    //   {
    //     WebSocket, // native WebSocket from global namespace
    //     url: 'ws://localhost:8080/currency-feed',
    //   },
    //   (err, transport) => {
    //     if (err) return console.log(err.message);
    //     console.log('connected');
    //     transport.on('message', (message) => {
    //       console.log('message: %j', message);
    //     });
    //     transport.on('close', (err) => {
    //       console.log('connection closed', err);
    //     });
    //   }
    // );

    if (!dataCurrencies || !arrAllCurrencies) {
      //если нет доступа
      throw new ComponentError('Не удалось получить доступ к обмену валют');
    }
    //отображаем данные на странице
    const currency = new Currency(
      dataCurrencies.payload,
      arrAllCurrencies.payload
    );

    //обработчик событий на кнопку "Обменять" в блоке "обмен валюты"
    currency.getBtnExchange().addEventListener('click', async () => {
      await currencyExchangeEvent(currency);
    });

    return el('section.section-currency.currency', currency);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}
//событие обмена валют
async function currencyExchangeEvent(currency) {
  //получаем объект с данными обмена валют из интерфейса
  const obj = currency.currencyExchange();
  if (!obj) return;
  //очищаем поле ввода суммы обмена
  document.querySelector('input').value = '';
  //отправляем данные из интерфеса и получаем объект ответа сервера
  const res = await currencyTransfer(obj, localStorage.getItem('tokenStorage'));
  if (!res) return;
  //если ответ без ошибок
  if (res.payload) {
    //обновляем представление списка валют
    const list = currency.getListCurrencies(res.payload);
    currency.getCurrenciesWrapper().firstChild.replaceWith(list);
  }
}

//отправка новой транзакции на счет
async function sendTransferFunds(card, data, id) {
  const obj = card.transferFunds(data.payload);
  // const transfer = await transferFoundsAccount(obj, token);
  const transfer = await transferFoundsAccount(
    obj,
    localStorage.getItem('tokenStorage')
  );
  //если есть ответ от сервера:
  if (transfer) {
    //сохраняем в localStorage счета
    savingLocalAccounts(id, obj);

    document.querySelectorAll('input').forEach((el) => (el.value = '')); //очищаем форму ввода
    // const data = await getAccountDetail(token, id); //получаем новые данные текущего счета
    const newData = await getAccountDetail(
      localStorage.getItem('tokenStorage'),
      id
    );
    const body = card.getBodyTable(newData.payload); //отправляем новые данные для формирования таблицы
    const oldBody = document.querySelector('.history-transaction__tbody');
    oldBody.replaceWith(body); //обновляем таблицу
  }
}
//сохранение объекта в локальном хранилище с данными о транзакции
function savingLocalAccounts(id, obj) {
  //если по указаному id еще нет хранилища, создаем пустой массив
  const arrOldStorage = JSON.parse(localStorage.getItem(id)) || [];
  let flag = false;
  //перебираем его
  if (arrOldStorage.length > 0) {
    arrOldStorage.forEach((objStorage) => {
      if (objStorage.to === obj.to) flag = true; //если хотя бы одно совпадение, то объект не добавляем
    });
    if (flag !== true) {
      //если совпадений нет, то добавляем в массив
      arrOldStorage.push(obj);
    }
  } else {
    arrOldStorage.push(obj); //либо сразу добавляем в массив, если нет прочих объектов
  }
  //и сразу добавляем в локальное хранилище
  localStorage.setItem(id, JSON.stringify(arrOldStorage));
}
//функция делегирования событий по детальному просмотру каждого счета в отдельности
function showCardDetail(event) {
  //получаем кнопку "Открыть" для каждой карточки счета
  const btn = event.target.closest('.card__btn');
  //если в event.target нет btn, то вернет null или если btn не принадлежит текущему контейнеру, тоже null
  if (!btn || !btn.contains(btn)) return;
  const id =
    btn.parentElement.previousElementSibling.previousElementSibling.textContent;
  router.navigate(`/account_id=${id}`); //переходим на страницу счета
}
//функция отображает график за последние countMonths месяцев на странице счета после рендеринга страницы
async function showChartForPage(obj, objRatio) {
  try {
    // const data = await getAccountDetail(token, obj.id); //получаем данные текущего счета
    const data = await getAccountDetail(
      localStorage.getItem('tokenStorage'),
      obj.id
    ); //получаем данные текущего счета
    if (!data) {
      //если нет доступа
      throw new ComponentError('Не удалось получить доступ к данному счету');
    }
    //привязываем график после загрузки DOM
    showChartDynamicBalance(
      obj.id,
      data.payload.transactions,
      obj.countMonths,
      obj.container
    );
    //если передан второй объект, отрисовываем график соотношений
    if (objRatio) {
      showChartRatio(
        obj.id,
        data.payload.transactions,
        obj.countMonths,
        objRatio.container
      );
    }
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//переход к детальной странице истории счета
function moveHistoryAccount(selector, id) {
  document
    .querySelector(selector)
    .addEventListener('click', () => router.navigate(`/account_history=${id}`));
}
//страница для подробной история счета
async function isHistoryDetail(id) {
  try {
    // const data = await getAccountDetail(token, id); //получаем данные текущего счета
    const data = await getAccountDetail(
      localStorage.getItem('tokenStorage'),
      id
    ); //получаем данные текущего счета
    if (!data) {
      //если нет доступа
      throw new ComponentError('Не удалось получить доступ к данному счету');
    }
    const history = new History(data.payload); //отображаем данные на странице
    return el('section.section-account-history.account-history', history);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}
//функция добавляет класс кнопке активной страницы
function pageActive(number) {
  const list = document.body.querySelectorAll('a.header__btn');
  list.forEach((element) => {
    element.classList.remove('is-active');
  });
  list[number].classList.add('is-active');
}

//обработка события на добавление нового счете
async function addNewAccountEvent() {
  // const data = await createNewAccount(token);
  const data = await createNewAccount(localStorage.getItem('tokenStorage'));
  if (data) setChildren(main, await isAccounts()); //обновление страницы
}

//обработка события входа в приложение
async function enterInApp(login) {
  const data = await loginInToApp(login.getLogin(), login.getPassword()); //получаем ответ от сервера
  if (!data) {
    login.showErrorApi(showError()); //отображаем ошибки от сервера
    return; //если ответа нет, выпадает ошибка
  }
  token = data.payload.token; //запизываем ответ ввиде токена в переменную

  localStorage.setItem('tokenStorage', token); //записываем в локальное хранилище для отладки

  router.navigate('/accounts'); //переходим на страницу счетов
  document.body.querySelector('.header__list').classList.remove('d-none'); //верхнее меню делаем видимым
}

//роутинг
router.on({
  '/': async () => {
    // localStorage.clear();
    document.body.querySelector('.header__list').classList.add('d-none');
    setChildren(main, await isIndex());
  },
  '/ATMs': () => {
    setChildren(main, el('h1', 'Банкоматы'));
    pageActive(0);
  },
  '/accounts': async () => {
    setChildren(main, await isAccounts());
    pageActive(1);
  },
  '/account_id=:id': async ({ data: { id } }) => {
    setChildren(main, await isCard(id));
    //обновляем страницу для рендеринга графика
    await showChartForPage({ id: id, countMonths: 6, container: 'gd' });
    //переход к подробной истории баланса через события клика по графику или таблице
    moveHistoryAccount('#gd', id);
    moveHistoryAccount('.history-transaction__tbody', id);
  },
  '/account_history=:id': async ({ data: { id } }) => {
    setChildren(main, await isHistoryDetail(id));
    //обновляем страницу для рендеринга графика
    await showChartForPage(
      {
        id: id,
        countMonths: 12,
        container: 'dynamicsChart',
      },
      { container: 'ratioChart' }
    );
  },
  '/currency': async () => {
    setChildren(main, await isCurrency());
    pageActive(2);
  },
});

router.resolve();
