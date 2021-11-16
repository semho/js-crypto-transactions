import 'babel-polyfill';
import Plotly from 'plotly.js-dist-min';
/*
 функция показывает график динамики баланса текущего счета за определенный период
  @param {String} id            номер счета
  @param {array}  transactions  массив транзакций
  @param {number} countMonths   количество месяцев
  @param {String} container     Имя id контейнера в DOM
  */
export function showChartDynamicBalance(
  id,
  transactions,
  countMonths,
  container
) {
  if (transactions.length === 0) return;
  //получаем копию массива объектов только с входящими транзакциями текущего счета
  const incomingTransactions = transactions
    .slice()
    .filter((item) => item.to === id);
  //группируем по год-месяц
  const incomingGroup = groupByMonth(incomingTransactions);
  //получаем массив объектов требуемого вида
  const arrObjectsAmountByMonth = getArrObjects(incomingGroup).sort((a, b) => {
    // и сортируем по дате
    return new Date(b.date) - new Date(a.date);
  });
  //получаем последние countMonths месяцев
  const lastMonths = arrObjectsAmountByMonth.slice(0, countMonths);
  //рендерим график
  renderChart(lastMonths, container);
}

/*
функция показывает график соотношение входящих исходящих транзакций текущего счета за определенный период
параметры теже самые, что и в предыдущей
*/
export function showChartRatio(id, transactions, countMonths, container) {
  if (transactions.length === 0) return;
  //получаем копию массива объектов только с входящими транзакциями текущего счета
  const incomingTransactions = transactions
    .slice()
    .filter((item) => item.to === id);
  //получаем копию массива объектов только с исходящими транзакциями текущего счета
  const outgoingTransactions = transactions
    .slice()
    .filter((item) => item.from === id);
  //группируем по год-месяц
  const incomingGroup = groupByMonth(incomingTransactions);
  const outgoingGroup = groupByMonth(outgoingTransactions);
  //получаем объединенный массив объектов сгруппированный по месяцам и вх/исх транзакциям
  const arrObjectsAmountByMonth = getArrObjectsUnited(
    incomingGroup,
    outgoingGroup
  );

  //получаем последние countMonths месяцев
  const lastMonths = arrObjectsAmountByMonth.slice(0, countMonths);
  //рендерим график
  renderChart(lastMonths, container, true);
}

//функция объединения входящих и исходящих транзакций в один объект сгруппированный по месяцу
function getArrObjectsUnited(incomingGroup, outgoingGroup) {
  const incoming = [];
  const outgoing = [];
  // перевел в массив объектов по нужным названиям ключ-значениям
  Object.entries(incomingGroup).forEach(([date, amountIn]) => {
    incoming.push({ date, amountIn });
  });
  Object.entries(outgoingGroup).forEach(([date, amountOut]) => {
    outgoing.push({ date, amountOut });
  });
  //массив объектов у которых совпадают даты входящих и исходящих транзакции
  const resMatch = mergeTransactions(incoming, outgoing);
  //массив транзакции у которых в месяц либо только входящие, либо исходящие
  const resNoMatchIncoming = noMatch(incoming, 'amountOut');
  const resNoMatchOutgoing = noMatch(outgoing, 'amountIn');
  const resNoMatch = [...resNoMatchIncoming, ...resNoMatchOutgoing];

  //объединяем в один массив и сортируем по дате
  const res = [...resMatch, ...resNoMatch].slice().sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  return res;
}
//функция объединяет входящие/исходщие транзакции в один объект
function mergeTransactions(incoming, outgoing) {
  const res = []; //массив совпадений даты входящих и исходящих транзакции
  //перебираем входящие транзакции
  incoming.forEach((elIn) => {
    //теперь исходящие
    outgoing.forEach((elOut) => {
      //если даты равны у транзакций, объединяем их в объект
      if (elOut.date === elIn.date) {
        let obj = Object.assign(elOut, elIn);
        obj = Object.assign(elIn, elOut);
        res.push(obj);
      }
    });
  });

  return res;
}
//функция возвращает массив объектов у которого нет либо исх, либо вх транзакций
function noMatch(arr, property) {
  const res = [];
  arr.forEach((el) => {
    if (!el[property]) {
      el[property] = 0;
      res.push(el);
    }
  });
  return res;
}

//функция отображения графика
/*
  @param {array}   arrObj     массив объектов
  @param {String}  container  Имя id контейнера в DOM
  @param {Boolean} isRatio    проверка отношения к графику соотношения исх/вх транзакций
*/
function renderChart(arrObj, container, isRatio = false) {
  const axisDataIn = getAxisData(arrObj, isRatio); //получаем данные по осям по входящим транзакциям
  const configChart = getConfigChart(axisDataIn, isRatio); //получаем настройки графика
  //создаем график
  Plotly.newPlot(container, configChart.data, configChart.layout, {
    staticPlot: true,
  });
}
//возвращаем объект с данными по осям графика
/*
  @param {array}   arrObj  массив объектов
  @param {Boolean} isRatio проверка отношения к графику соотношения исх/вх транзакций
*/
function getAxisData(arrObj, isRatio = false) {
  //массив всех месяцев
  const months = [
    'янв',
    'фев',
    'мар',
    'апр',
    'май',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек',
  ];
  //массивы для значений по осям X и Y
  const valueX = [];
  if (!isRatio) {
    const valueY = [];
    //добавляем значения из объектов в массивы
    arrObj.forEach((item) => {
      const index = item.date.split('-')[1];
      valueX.push(months[index - 1]);
      valueY.push(item.amount);
    });
    return { valueX, valueY };
  } else {
    const valueYIn = [];
    const valueYOut = [];
    //добавляем значения из объектов в массивы
    arrObj.forEach((item) => {
      const index = item.date.split('-')[1];
      valueX.push(months[index - 1]);
      valueYIn.push(item.amountIn - item.amountOut);
      valueYOut.push(item.amountOut);
    });
    return { valueX, valueYIn, valueYOut };
  }
}

//возвращаем объект с настройками для графика
function getConfigChart(obj, isRatio = false) {
  let data = [];
  if (!isRatio) {
    data = [
      {
        x: obj.valueX,
        y: obj.valueY,
        type: 'bar',
        marker: {
          color: '#116ACC',
        },
        width: 0.6,
      },
    ];
  } else {
    data = [
      {
        x: obj.valueX,
        y: obj.valueYOut,
        type: 'bar',
        marker: {
          color: '#FD4E5D',
        },
        width: 0.6,
      },
      {
        x: obj.valueX,
        y: obj.valueYIn,
        type: 'bar',
        marker: {
          color: '#76CA66',
        },
        width: 0.6,
      },
    ];
  }

  const layout = {
    xaxis: {
      showgrid: false, //отключили сетку
      zeroline: false, //отключили нулевую линию
      showline: true, //линию по оси оставили
      mirror: 'ticks', //сделали ей отражение
      autorange: 'reversed', //развернули назад ось
      color: '#000',
    },
    yaxis: {
      side: 'right', //перенесли ось справа
      showgrid: false,
      zeroline: false,
      showline: true,
      mirror: 'ticks',
      color: '#000',
      ticklen: 15,
      tickcolor: '#fff',
    },

    font: { size: 20 },
    showlegend: false,
    autosize: true,
    // width: 583,
    height: 228,
    //отступы
    margin: {
      l: 1,
      r: 60,
      b: 50,
      t: 25,
      pad: 0,
    },
    bargap: 0,
    barmode: 'stack',
  };

  return { data, layout };
}

//тут что-то страшное, не знаю как и получил нужный результат: функция гпуппировки по год-месяцу
function groupByMonth(arr) {
  const reduce = arr.reduce(
    (acc, it) => ({
      ...acc,
      [it.date.split('-')[0] + '-' + it.date.split('-')[1]]:
        (acc[it.date.split('-')[0] + '-' + it.date.split('-')[1]] || 0) +
        it.amount,
    }),
    {}
  );

  return reduce;
}

//функция для перевода объекта объектов в массив объектов с требуемыми ключ-значение
function getArrObjects(obj) {
  const arr = [];
  // перевел в массив объектов по нужным ключ-значениям
  Object.entries(obj).forEach(([date, amount]) => {
    arr.push({ date, amount });
  });

  return arr;
}
