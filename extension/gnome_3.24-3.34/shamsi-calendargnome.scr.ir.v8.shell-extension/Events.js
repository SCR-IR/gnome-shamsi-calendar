const ExtensionUtils = imports.misc.extensionUtils;
const extension = ExtensionUtils.getCurrentExtension();
const convenience = extension.imports.convenience;

const PersianDate = extension.imports.PersianDate;

const persian = extension.imports.events.persian;
const world = extension.imports.events.world;
const iranSolar = extension.imports.events.iranSolar;
const iranLunar = extension.imports.events.iranLunar;

const Schema = convenience.getSettings('org.gnome.shell.extensions.shamsi-calendar');

function Events() {
  this._init();
}

Events.prototype = {

  _init: function () {
    this._eventsList = [];
    if (Schema.get_boolean('event-iran-lunar')) {
      this._eventsList.push(new iranLunar.iranLunar());
    }
    if (Schema.get_boolean('event-iran-solar')) {
      this._eventsList.push(new iranSolar.iranSolar());
    }
    if (Schema.get_boolean('event-world')) {
      this._eventsList.push(new world.world());
    }
    if (Schema.get_boolean('event-persian')) {
      this._eventsList.push(new persian.persian(PersianDate.PersianDate));
    }
  },

  getEvents: function (todayObj, maxLineLength = 40) {
    this._today = todayObj;
    this._maxLineLength = maxLineLength;
    this._events = [];
    this._isHoliday = Schema.get_boolean('none-work-' + this._today.dayOfWeek);
    this._eventsList.forEach(this._checkEvent, this);
    return [this._events, this._isHoliday];
  },

  _checkEvent: function (el) {
    let evArr = el.events[this._today[el.type][1]][this._today[el.type][2]];
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
          holiday: (events[i][1] !== undefined) ? true : false
        };

      }
      this._isHoliday = (this._isHoliday || evArr[1]);
    }
  }
};
