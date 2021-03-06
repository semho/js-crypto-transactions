import 'babel-polyfill'; //подключаем полифил для того, чтобы любой браузер понимал
import { setChildren } from 'redom';
import {
  loginInToApp,
  showError,
  createNewAccount,
  transferFoundsAccount,
  getAccountDetail,
  currencyTransfer,
} from './query.js'; // запросы к API
import { isAccounts } from './index.js';

//обработка события входа в приложение
export async function enterInApp(login, token, router) {
  //делаем кнопку не активной пока ждем ответ от сервера
  login.getButton().setAttribute('disabled', true);
  const data = await loginInToApp(login.getLogin(), login.getPassword()); //получаем ответ от сервера
  if (!data) {
    login.showErrorApp(showError()); //отображаем ошибки от сервера
    login.getButton().removeAttribute('disabled'); //активируем кнопку
    return; //если ответа нет, выпадает ошибка
  }
  token = data.payload.token; //запизываем ответ ввиде токена в переменную

  sessionStorage.setItem('tokenStorage', token); //записываем в локальное хранилище

  router.navigate('/accounts'); //переходим на страницу счетов
  document.body.querySelector('.header__list').classList.remove('d-none'); //верхнее меню делаем видимым
  document.body.querySelector('.burger').classList.remove('d-none');
}

//обработка события на добавление нового счете
export async function addNewAccountEvent(main) {
  const data = await createNewAccount(sessionStorage.getItem('tokenStorage'));
  if (data) setChildren(main, await isAccounts()); //обновление страницы
}

//функция делегирования событий по детальному просмотру каждого счета в отдельности
export function showCardDetail(event, router) {
  //получаем кнопку "Открыть" для каждой карточки счета
  const btn = event.target.closest('.card__btn');
  //если в event.target нет btn, то вернет null или если btn не принадлежит текущему контейнеру, тоже null
  if (!btn || !btn.contains(btn)) return;
  const id =
    btn.parentElement.previousElementSibling.previousElementSibling.textContent;
  router.navigate(`/account/${id}`); //переходим на страницу счета
}

//отправка новой транзакции на счет
export async function sendTransferFunds(card, data, id) {
  const obj = card.transferFunds(data.payload);
  const transfer = await transferFoundsAccount(
    obj,
    sessionStorage.getItem('tokenStorage')
  );
  //если есть ответ от сервера:
  if (transfer) {
    //сохраняем в sessionStorage счета
    savingLocalAccounts(id, obj);

    document.querySelectorAll('input').forEach((el) => (el.value = '')); //очищаем форму ввода
    //получаем новые данные текущего счета
    const newData = await getAccountDetail(
      sessionStorage.getItem('tokenStorage'),
      id
    );
    const body = card.getBodyTable(newData.payload); //отправляем новые данные для формирования таблицы
    const oldBody = document.querySelector('.history-transaction__tbody');
    oldBody.replaceWith(body); //обновляем таблицу

    document.querySelector('.account-card__balance-price').innerHTML =
      newData.payload.balance + ' ₽';
  }
}
//сохранение объекта в локальном хранилище с данными о транзакции
function savingLocalAccounts(id, obj) {
  //если по указаному id еще нет хранилища, создаем пустой массив
  const arrOldStorage = JSON.parse(sessionStorage.getItem(id)) || [];
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
  sessionStorage.setItem(id, JSON.stringify(arrOldStorage));
}

//событие обмена валют
export async function currencyExchangeEvent(currency) {
  //получаем объект с данными обмена валют из интерфейса
  const obj = currency.currencyExchange();
  if (!obj) return;
  //очищаем поле ввода суммы обмена
  document.querySelector('input').value = '';
  //отправляем данные из интерфеса и получаем объект ответа сервера
  const res = await currencyTransfer(
    obj,
    sessionStorage.getItem('tokenStorage')
  );
  if (!res) return;
  //если ответ без ошибок
  if (res.payload) {
    //обновляем представление списка валют
    const list = currency.getListCurrencies(res.payload);
    currency.getCurrenciesWrapper().firstChild.replaceWith(list);
  }
}

//обработчик на получения потока сообщений от сервера
export async function messageFlow(currency, event) {
  //переводим из строки в объект
  const message = JSON.parse(event.data);
  if (message.type === 'EXCHANGE_RATE_CHANGE') {
    //передаем данные в метод класса
    currency.addItemCourse(message);
  }
}
