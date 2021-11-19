import 'babel-polyfill'; //подключаем полифил для того, чтобы любой браузер понимал
import Navigo from 'navigo';
import { el, setChildren } from 'redom';
import ComponentError from './error.js';
import './style.scss';
import Header from './header.js'; //шапка
import Login from './login.js'; // класс для входа в аккаунт
import {
  getAccounts,
  getAccountDetail,
  getCurrencies,
  getAllCurrencies,
  connectWebSocket,
  getCoordinates,
} from './query.js'; // запросы к API

import {
  enterInApp,
  addNewAccountEvent,
  showCardDetail,
  sendTransferFunds,
  currencyExchangeEvent,
  messageFlow,
} from './eventHandler.js'; //функции для обработчиков событий

import Accounts from './accounts.js'; //класс для отображения всех счетов
import Card from './card.js'; //класс для отображения счета детально
import { showChartForPage } from './charts.js'; //библиотека графиков с их отображениями
import History from './history.js'; //подключаем класс для отображения подробной истории счета
import Currency from './currency.js'; //класс для отображения валютных операций
import Map from './map.js'; //класс для отображения карты с банкоматами

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
      await enterInApp(login, token, router);
    });

    return el('section.section-login.login-account', login);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//функция загружает страницу со счетами
export async function isAccounts() {
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
      await addNewAccountEvent(main);
    });
    //получаем контейнер со всеми счетами
    const containerCards = accounts.getContainerAllCards();
    //вешаем обработчие событий, делигируем события в функцию
    containerCards.addEventListener('click', (event) =>
      showCardDetail(event, router)
    );

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

    //подключаем WebSocket
    const ws = await connectWebSocket();

    //обработчик на получения потока сообщений
    ws.addEventListener(
      'message',
      async (event) => await messageFlow(currency, event)
    );
    //обработчик закрытия соединения
    ws.addEventListener('close', async (event) => {
      if (event.isTrusted)
        document.querySelector('.course-change__title').innerHTML =
          'WebSocket закрыл соединение';
    });

    return el('section.section-currency.currency', currency);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}
//функция отображает страницу карты
async function isMap() {
  try {
    //запрос к серверу на получение координат банкоматов
    const coordinates = await getCoordinates();
    if (!coordinates) return;
    //вызываем новый объект класса Map и передаем координаты
    const map = new Map(coordinates.payload);

    return el('section.section-map.map', map);
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

//функция добавляет класс кнопке активной страницы
function pageActive(number) {
  const list = document.body.querySelectorAll('a.header__btn');
  list.forEach((element) => {
    element.classList.remove('is-active');
  });
  list[number].classList.add('is-active');
}

//роутинг
router.on({
  '/': async () => {
    // localStorage.clear();
    document.body.querySelector('.header__list').classList.add('d-none');
    setChildren(main, await isIndex());
  },
  '/ATMs': async () => {
    setChildren(main, await isMap());
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
