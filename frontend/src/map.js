import 'babel-polyfill';
import { el } from 'redom';
import ymaps from 'ymaps';

export default class Map {
  constructor(coordinates) {
    this.el = el('.map__wrapper.container', [
      (this.top = el(
        '.map__top',
        (this.el = el('span.map__title', 'Карта банкоматов'))
      )),
      (this.bottom = el('.map__bottom', (this.map = el('#myMap')))),
    ]);

    //подгружаем карту после события загрузки страницы
    ymaps
      .load('https://api-maps.yandex.ru/2.1/?lang=ru_RU')
      .then((maps) => {
        const map = new maps.Map('myMap', {
          center: [55.76, 37.64],
          zoom: 10,
        });
        //получаем массив массивов координат из массива объектов координат
        const coords = this.convertCoordinates(coordinates);
        //объявляем экземпляр объекта для гео коллекций
        const myCollection = new maps.GeoObjectCollection();
        //создаем метки по координатам
        coords.forEach((el) => {
          myCollection.add(
            new maps.Placemark(el, {
              hintContent: 'Coin',
            })
          );
        });
        //добавляем всю коллекцию на карту
        map.geoObjects.add(myCollection);
      })
      .catch((error) => console.log('Failed to load Yandex Maps', error));
  }

  //метод возвращает преобразованный массив координат
  convertCoordinates(arr) {
    const newArray = [];
    arr.forEach((element) => {
      newArray.push([element.lat, element.lon]);
    });

    return newArray;
  }
}
