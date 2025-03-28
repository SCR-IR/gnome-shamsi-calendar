import * as Tarikh from './Tarikh.js';
import islamicEvents from './events/islamicEvents.js';
import persianEvents from './events/persianEvents.js';
import gregorianEvents from './events/gregorianEvents.js';
import oldPersianEvents from './events/oldPersianEvents.js';

export function Events(todayObj, schema) {
  this.todayObj = todayObj;
  this.schema = schema;
  this._init();
}

Events.prototype = {

  _init: function () {
    this._eventsList = [];
    if (this.schema.get_boolean('show-islamic-events')) {
      this._eventsList.push(new islamicEvents(Tarikh, this.todayObj));
    }
    if (this.schema.get_boolean('show-persian-events')) {
      this._eventsList.push(new persianEvents(Tarikh, this.todayObj));
    }
    if (this.schema.get_boolean('show-gregorian-events')) {
      this._eventsList.push(new gregorianEvents(Tarikh, this.todayObj));
    }
    if (this.schema.get_boolean('show-old-events')) {
      this._eventsList.push(new oldPersianEvents(Tarikh, this.todayObj));
    }
  },

  getEvents: function (maxLineLength = 40) {
    this._maxLineLength = maxLineLength;
    this._events = [];
    this._isHoliday = this.schema.get_boolean('none-work-' + this.todayObj.dayOfWeek);
    this._eventsList.forEach(this._checkEvent, this);
    return [this._events, this._isHoliday];
  },

  _checkEvent: function (el) {
    let evArr = el.events[this.todayObj[el.type][1]][this.todayObj[el.type][2]];
    let sym = { persian: '▪', islamic: '◆', gregorian: '▫' };
    if (evArr) {
      let events = evArr[0];
      for (let i in events) {
        let wTmp = events[i][0].split(' ');
        let event = '';
        let lineLength = 0;
        for (let w of wTmp) {
          let wLength = w.length + 1;
          if ((lineLength + wLength) > this._maxLineLength) {/* :max lines width */
            event += '\n     ' + w;
            lineLength = 4 + wLength;
          } else {
            event += ' ' + w;
            lineLength += wLength;
          }
        }

        this._events[this._events.length] = {
          type: el.type,
          symbol: sym[el.type],
          event: event,
          shadi: events[i][2],
          holiday: events[i][1]
        };

      }
      this._isHoliday = (this._isHoliday || evArr[1]);
    }
  }
};
