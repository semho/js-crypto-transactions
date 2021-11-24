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
//роутинг
const router = new Navigo('/');
//секция с картой. Выносим отдельно в секцию и скрываем на всех страницах кроме карты, чтобы при каждом роутинге ее не подгружать
const sectionMap = el('section.content-map.d-none', await isMap());
//секция с главным контентом
const section = el('section.content');
let token = null; //переменная в памяти для токена
//хедер сайта статичен от страницы к странице и потому тоже выносим в отдельный элемент
const header = new Header();
//создаем DOM дерево
setChildren(document.body, [header, el('main', [sectionMap, section])]);

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

    return el('div.section-login.login-account', login);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//функция загружает страницу со счетами
export async function isAccounts() {
  try {
    //подставляем лоадер-скелетон
    loaderSkeletonAccounts();
    const data = await getAccounts(sessionStorage.getItem('tokenStorage')); //получаем данные от сервера в виде массива объектов счетов
    if (!data) {
      //если нет доступа
      throw new ComponentError('Не удалось получить доступ к счетам');
    }
    const accounts = new Accounts(data); //отображаем данные на странице
    const btn = accounts.getButtonAddAccount(); //кнопка добавления счета
    btn.addEventListener('click', async () => {
      //событие на добавление нового счета
      await addNewAccountEvent(section);
    });
    //получаем контейнер со всеми счетами
    const containerCards = accounts.getContainerAllCards();
    //вешаем обработчие событий, делигируем события в функцию
    containerCards.addEventListener('click', (event) =>
      showCardDetail(event, router)
    );

    return el('div.section-accounts.accounts', accounts);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//функция загружает детальную страницу счета
async function isCard(id) {
  try {
    //получаем данные текущего счета
    const data = await getAccountDetail(
      sessionStorage.getItem('tokenStorage'),
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
    return el('div.section-account-card.account-card', card);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//страница для подробной история счета
async function isHistoryDetail(id) {
  try {
    //получаем данные текущего счета
    const data = await getAccountDetail(
      sessionStorage.getItem('tokenStorage'),
      id
    ); //получаем данные текущего счета
    if (!data) {
      //если нет доступа
      throw new ComponentError('Не удалось получить доступ к данному счету');
    }
    const history = new History(data.payload); //отображаем данные на странице
    return el('div.section-account-history.account-history', history);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//функция загружает страницу валютного обмена
async function isCurrency() {
  try {
    //получаем список валютных счетов текущего пользователя
    const dataCurrencies = await getCurrencies(
      sessionStorage.getItem('tokenStorage')
    );
    //получаем массив всех кодов валют
    const arrAllCurrencies = await getAllCurrencies(
      sessionStorage.getItem('tokenStorage')
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

    return el('div.section-currency.currency', currency);
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
    //вызываем новый экземпляр объекта класса Map и передаем координаты
    const map = new Map(coordinates.payload);

    return el('div.section-map.map', map);
  } catch (error) {
    ComponentError.errorHandling(error);
  }
}

//переход к детальной странице истории счета
function moveHistoryAccount(selector, id) {
  document
    .querySelector(selector)
    .addEventListener('click', () => router.navigate(`/account_history/${id}`));
}

//функция добавляет класс кнопке активной страницы
function pageActive(number) {
  const list = document.body.querySelectorAll('a.header__btn');
  list.forEach((element) => {
    element.classList.remove('is-active');
  });
  list[number].classList.add('is-active');

  if (number !== 0) {
    sectionMap.classList.add('d-none');
  } else {
    sectionMap.classList.remove('d-none');
  }
}
//функция лоадер-скелетон
function loaderSkeletonAccounts() {
  const container = el('.loader.container', [
    el('.loader__top'),
    el('.loader__bottom', [
      el('.loader__skeleton'),
      el('.loader__skeleton'),
      el('.loader__skeleton'),
    ]),
  ]);

  setChildren(section, container);
}
//функция добавления скелетона графика
function loaderSkeletonChart(id) {
  const container = document.getElementById(id);
  setChildren(container, el('.skeletonChart'));
}
//функция удаления скелетона графика
function destroySkeleton(id) {
  document.getElementById(id).querySelector('.skeletonChart').remove();
}

//роутинг
router.on({
  '/': async () => {
    // localStorage.clear();
    document.body.querySelector('.header__list').classList.add('d-none');
    setChildren(section, await isIndex());
    pageActive(3);
  },
  '/ATMs': async () => {
    setChildren(section, '');
    pageActive(0);
  },
  '/accounts': async () => {
    setChildren(section, await isAccounts());
    pageActive(1);
  },
  '/account/:id': async ({ data: { id } }) => {
    try {
      setChildren(section, await isCard(id));
      //лоадер-скелетон для графика
      loaderSkeletonChart('gd');
      //обновляем страницу для рендеринга графика
      await showChartForPage({ id: id, countMonths: 6, container: 'gd' });
      //переход к подробной истории баланса через события клика по графику или таблице
      moveHistoryAccount('#gd', id);
      moveHistoryAccount('.history-transaction__tbody', id);
    } catch (error) {
      ComponentError.errorHandling(error);
    } finally {
      //удаляем скелетон графика
      destroySkeleton('gd');
    }
  },
  '/account_history/:id': async ({ data: { id } }) => {
    try {
      setChildren(section, await isHistoryDetail(id));
      //лоадер-скелетон для графика
      loaderSkeletonChart('dynamicsChart');
      loaderSkeletonChart('ratioChart');
      //обновляем страницу для рендеринга графика
      await showChartForPage(
        {
          id: id,
          countMonths: 12,
          container: 'dynamicsChart',
        },
        { container: 'ratioChart' }
      );
    } catch (error) {
      ComponentError.errorHandling(error);
    } finally {
      //удаляем скелетон графика
      destroySkeleton('dynamicsChart');
      destroySkeleton('ratioChart');
    }
  },
  '/currency': async () => {
    setChildren(section, await isCurrency());
    pageActive(2);
  },
});

router.notFound(async () => {
  router.navigate('/');
});

router.resolve();
