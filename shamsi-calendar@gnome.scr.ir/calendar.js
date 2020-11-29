const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const St = imports.gi.St;
const Pango = imports.gi.Pango;

const ExtensionUtils = imports.misc.extensionUtils;
const extension = ExtensionUtils.getCurrentExtension();
const convenience = extension.imports.convenience;

const PersianDate = extension.imports.PersianDate;
const HijriDate = extension.imports.HijriDate;

const str = extension.imports.strFunctions;
const Events = extension.imports.Events;

const Schema = convenience.getSettings('org.gnome.shell.extensions.shamsi-calendar');

function _rotate(a, b, x, y) {
  return (Schema.get_boolean('rotaton-to-vertical')) ? [7 - b, 8 - a + 1, y, x] : [a, b, x, y];
}

function _sameDay(dateA, dateB) {
  return (dateA.year === dateB.year &&
    dateA.month === dateB.month &&
    dateA.day === dateB.day);
}

function Calendar() {
  this._init();
}

Calendar.prototype = {
  weekdayAbbr: ['شنبه', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه'],
  _rtl: (Clutter.get_default_text_direction() === Clutter.TextDirection.RTL),
  // weekdayAbbr: ['شـ', 'یـ', 'د', 'سـ', 'چـ', 'پـ', 'جـ'],
  _weekStart: 6,

  _init: function () {
    // Start off with the current date
    this._selectedDate = new Date();
    this._selectedDate = PersianDate.PersianDate.gregorianToPersian(
      this._selectedDate.getFullYear(),
      this._selectedDate.getMonth() + 1,
      this._selectedDate.getDate()
    );

    this.actorRight = new St.Widget({
      style_class: 'pcalendar-actor-right',
      layout_manager: new Clutter.GridLayout(),
      reactive: true
    });
    this.actorLeft = new St.Widget({
      style_class: 'pcalendar-actor-left',
      layout_manager: new Clutter.GridLayout(),
      reactive: true
    });

    this.actor = new St.Widget({
      style_class: 'pcalendar',
      layout_manager: new Clutter.GridLayout(),
      reactive: true
    });
    this.actor.layout_manager.attach(this.actorLeft, 0, 0, 1, 1);
    this.actor.layout_manager.attach(this.actorRight, 1, 0, 1, 1);

    this.actorRight.connect('scroll-event', Lang.bind(this, this._onScroll));

    this._buildHeader();
  },

  // Sets the calendar to show a specific date
  setDate: function (date) {
    if (!_sameDay(date, this._selectedDate)) {
      this._selectedDate = date;
    }

    this._update();
  },

  // Sets the calendar to show a specific date
  format: function (format, day, month, year, dow, calendar) {
    let phrases = {
      gregorian: {
        monthShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        monthLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        weekdayShort: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        weekdayLong: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      persian: {
        monthShort: ['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'],
        monthLong: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
        weekdayShort: ['شـ', 'یـ', 'د', 'سـ', 'چـ', 'پـ', 'جـ'],
        weekdayLong: ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
      },
      hijri: {
        monthShort: ['محر', 'صفر', 'رب۱', 'رب۲', 'جم۱', 'جم۲', 'رجب', 'شعب', 'رمض', 'شوا', 'ذیق', 'ذیح'],
        monthLong: ['محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذیقعده', 'ذیحجه'],
        weekdayShort: ['س', 'ا', 'ا', 'ث', 'ا', 'خ', 'ج'],
        weekdayLong: ['‫السبت', '‫الأحد', '‫الاثنين', '‫الثلاثاء', '‫الأربعاء', '‫الخميس', '‫الجمعة'],
      }
    };

    // change dow to Persian style!
    dow += 1;
    if (dow > 6) {
      dow = 0;
    }

    let find = ['%Y', '%y', '%MM', '%mm', '%M', '%m', '%D', '%d', '%WW', '%ww'];
    let replace = [
      year,
      (year + '').slice(-2),
      phrases[calendar].monthLong[month - 1],
      phrases[calendar].monthShort[month - 1],
      ('0' + (month)).slice(-2),
      month,
      ('0' + day).slice(-2),
      day,
      phrases[calendar].weekdayLong[dow],
      phrases[calendar].weekdayShort[dow],
    ];
    return str.replace(find, replace, format);
  },

  _buildHeader: function () {
    // this._rtl = (Clutter.get_default_text_direction() === Clutter.TextDirection.RTL);//v
    if (this._rtl) {
      this._colPosition = 0;
    } else {
      this._colPosition = 6;
    }

    this.actorRight.destroy_all_children();

    // Top line of the calendar '<| year month |>'
    this._topBox = new St.BoxLayout();
    this.actorRight.layout_manager.attach(this._topBox, 0, 0, 7, 1);

    let rightButton = null;
    let icon = null;
    let style = 'pcalendar-top-button';
    if (this._rtl) {
      icon = new St.Icon({ icon_name: 'go-last-symbolic' });
      rightButton = new St.Button({ style_class: style, child: icon });
      rightButton.connect('clicked', Lang.bind(this, this._onPrevYearButtonClicked));
    } else {
      icon = new St.Icon({ icon_name: 'go-first-symbolic' });
      rightButton = new St.Button({ style_class: style, child: icon });
      rightButton.connect('clicked', Lang.bind(this, this._onNextYearButtonClicked));
    }
    icon.set_icon_size(16);
    this._topBox.add(rightButton);

    if (this._rtl) {
      icon = new St.Icon({ icon_name: 'go-next-symbolic' });
      rightButton = new St.Button({ style_class: style, child: icon });
      rightButton.connect('clicked', Lang.bind(this, this._onPrevMonthButtonClicked));
    } else {
      icon = new St.Icon({ icon_name: 'go-previous-symbolic' });
      rightButton = new St.Button({ style_class: style, child: icon });
      rightButton.connect('clicked', Lang.bind(this, this._onNextMonthButtonClicked));
    }
    icon.set_icon_size(16);
    this._topBox.add(rightButton);

    this._monthLabel = new St.Label({
      style_class: 'pcalendar-month-label',
      x_align: Clutter.ActorAlign.CENTER,
      x_expand: true
      // ,x_fill: false
    });
    this._topBox.add(this._monthLabel/*, { expand: true, x_fill: false, x_align: St.Align.MIDDLE }*/);

    let leftButton = null;
    if (this._rtl) {
      icon = new St.Icon({ icon_name: 'go-previous-symbolic' });
      leftButton = new St.Button({ style_class: style, child: icon });
      leftButton.connect('clicked', Lang.bind(this, this._onNextMonthButtonClicked));
    } else {
      icon = new St.Icon({ icon_name: 'go-next-symbolic' });
      leftButton = new St.Button({ style_class: style, child: icon });
      leftButton.connect('clicked', Lang.bind(this, this._onPrevMonthButtonClicked));
    }
    icon.set_icon_size(16);
    this._topBox.add(leftButton);

    if (this._rtl) {
      icon = new St.Icon({ icon_name: 'go-first-symbolic' });
      leftButton = new St.Button({ style_class: style, child: icon });
      leftButton.connect('clicked', Lang.bind(this, this._onNextYearButtonClicked));
    } else {
      icon = new St.Icon({ icon_name: 'go-last-symbolic' });
      leftButton = new St.Button({ style_class: style, child: icon });
      leftButton.connect('clicked', Lang.bind(this, this._onPrevYearButtonClicked));
    }
    icon.set_icon_size(16);
    this._topBox.add(leftButton);

    //v
    // // Add weekday labels...
    // for (let i = 0; i < 7; i++) {
    //   let label = new St.Label({
    //     style_class: 'pcalendar-day-heading pcalendar-rtl',
    //     text: this.weekdayAbbr[i]
    //   });
    //   {
    //     let [left, top, width, height] = _rotate(Math.abs(this._colPosition - i), 1, 1, 1);
    //     this.actorRight.layout_manager.attach(label, left, top, width, height);
    //   }
    // }

    // All the children after this are days, and get removed when we update the calendar
    this._firstDayIndex = this.actorRight.get_children().length;//v
  },

  _onScroll: function (actor, event) {
    switch (event.get_scroll_direction()) {
      case Clutter.ScrollDirection.UP:
      case Clutter.ScrollDirection.LEFT:
        this._onNextMonthButtonClicked();
        break;
      case Clutter.ScrollDirection.DOWN:
      case Clutter.ScrollDirection.RIGHT:
        this._onPrevMonthButtonClicked();
        break;
      default:
      // do nothing
    }
  },

  _onPrevMonthButtonClicked: function () {
    let newDate = this._selectedDate;
    let oldMonth = newDate.month;
    if (oldMonth === 1) {
      newDate.month = 12;
      newDate.year--;
    } else {
      newDate.month--;
    }

    this.setDate(newDate);
  },

  _onNextMonthButtonClicked: function () {
    let newDate = this._selectedDate;
    let oldMonth = newDate.month;
    if (oldMonth === 12) {
      newDate.month = 1;
      newDate.year++;
    } else {
      newDate.month++;
    }

    this.setDate(newDate);
  },

  _onPrevYearButtonClicked: function () {
    let newDate = this._selectedDate;
    newDate.year--;

    this.setDate(newDate);
  },

  _onNextYearButtonClicked: function () {
    let newDate = this._selectedDate;
    newDate.year++;

    this.setDate(newDate);
  },

  _update: function () {
    // this.actorRight.destroy_all_children();//v
    // Remove everything but the topBox and the weekday labels
    let children = this.actorRight.get_children();
    for (let i = this._firstDayIndex; i < children.length; i++) {
      children[i].destroy();
    }
    let colPosition = (this._rtl) ? 0 : 6;//v
    // Add weekday labels...
    const weekdayAbbr = ['شنبه', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه'];
    for (let i = 0; i < 7; i++) {
      let label = new St.Label({
        style_class: 'pcalendar-day-heading pcalendar-rtl',
        text: weekdayAbbr[i]
      });
      {
        let [left, top, width, height] = _rotate(Math.abs(colPosition - i), 1, 1, 1);
        this.actorRight.layout_manager.attach(label, left, top, width, height);
      }
    }


    this.actorLeft.destroy_all_children();
    let selectedDateStyleClass = '';
    let now = new Date();
    now = PersianDate.PersianDate.gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());

    // find gregorian date
    let g_selectedDate = PersianDate.PersianDate.persianToGregorian(
      this._selectedDate.year,
      this._selectedDate.month,
      this._selectedDate.day
    );
    g_selectedDate = new Date(g_selectedDate.year, g_selectedDate.month - 1, g_selectedDate.day);

    let h_selectedDate = HijriDate.HijriDate.toHijri(
      g_selectedDate.getFullYear(),
      g_selectedDate.getMonth() + 1,
      g_selectedDate.getDate()
    );

    // if (this._selectedDate.year === now.year) {
    //   this._monthLabel.text = PersianDate.PersianDate.p_month_names[this._selectedDate.month - 1];
    // } else {
    this._monthLabel.text = '« ' + PersianDate.PersianDate.p_month_names[this._selectedDate.month - 1] + ' ' +
      str.format(this._selectedDate.year) +
      ' »\n' +
      str.format(
        this.format(
          '%MM %Y',
          h_selectedDate.day,
          h_selectedDate.month,
          h_selectedDate.year,
          g_selectedDate.getDay(),
          'hijri'
        )
      ) +
      ' | ' +
      this.format(
        '%MM %Y',
        g_selectedDate.getDate(),
        g_selectedDate.getMonth() + 1,
        g_selectedDate.getFullYear(),
        g_selectedDate.getDay(),
        'gregorian'
      );
    // }
    //v


    // Start at the beginning of the week before the start of the month
    let iter = this._selectedDate;
    iter = PersianDate.PersianDate.persianToGregorian(iter.year, iter.month, 1);
    iter = new Date(iter.year, iter.month - 1, iter.day);
    let daysToWeekStart = (7 + iter.getDay() - this._weekStart) % 7;
    iter.setDate(iter.getDate() - daysToWeekStart);

    let row = 2;

    let ev = new Events.Events();
    let events;

    // let p_iter = PersianDate.PersianDate.gregorianToPersian(
    //   iter.getFullYear(),
    //   iter.getMonth() + 1,
    //   iter.getDate()
    // );
    // // find hijri date of today
    // let h_iter = HijriDate.HijriDate.toHijri(
    //   iter.getFullYear(),
    //   iter.getMonth() + 1,
    //   iter.getDate()
    // );
    /* eslint no-constant-condition: ["error", { "checkLoops": false }] */
    while (true) {
      let p_iter = PersianDate.PersianDate.gregorianToPersian(
        iter.getFullYear(),
        iter.getMonth() + 1,
        iter.getDate()
      );
      // find hijri date of today
      let h_iter = HijriDate.HijriDate.toHijri(
        iter.getFullYear(),
        iter.getMonth() + 1,
        iter.getDate()
      );

      // find events and holidays
      events = ev.getEvents(iter);
      let eventStatus = {
        persian: {
          hasEvent: false,
          isHoliday: false
        },
        hijri: {
          hasEvent: false,
          isHoliday: false
        },
        gregorian: {
          hasEvent: false,
          isHoliday: false
        }
      };
      for (let evObj of events[0]) {
        eventStatus[evObj.type].hasEvent = true;
        if (evObj.holiday) eventStatus[evObj.type].isHoliday = true;
      }

      let alpha = (p_iter.month !== this._selectedDate.month) ? '-alpha' : '';

      let shamsiLabel = new St.Label({ text: str.format(p_iter.day), style_class: 'pcalendar-pdate-day-txt' });
      if (eventStatus.persian.hasEvent) shamsiLabel.style_class += ' pcalendar-underline';
      shamsiLabel.style_class += ((eventStatus.persian.isHoliday) ? ' pcalendar-txt-red' : ' pcalendar-txt-pdate-color') + alpha;

      let ghamariLabel = new St.Label({ text: str.format(h_iter.day), style_class: 'pcalendar-hdate-day-txt' });
      if (eventStatus.hijri.hasEvent) ghamariLabel.style_class += ' pcalendar-underline';
      ghamariLabel.style_class += ((eventStatus.hijri.isHoliday) ? ' pcalendar-txt-red' : ' pcalendar-txt-hdate-color') + alpha;

      let miladiLabel = new St.Label({ text: iter.getDate().toString(), style_class: 'pcalendar-gdate-day-txt' });
      if (eventStatus.gregorian.hasEvent) miladiLabel.style_class += ' pcalendar-underline';
      miladiLabel.style_class += ((eventStatus.gregorian.isHoliday) ? ' pcalendar-txt-red' : ' pcalendar-txt-gdate-color') + alpha;

      let datesOfDay = new St.Widget({
        style_class: '',
        layout_manager: new Clutter.GridLayout(),
        reactive: true
      });
      datesOfDay.layout_manager.attach(shamsiLabel, 0, 0, 2, 2);
      datesOfDay.layout_manager.attach(ghamariLabel, 2, 0, 1, 1);
      datesOfDay.layout_manager.attach(miladiLabel, 2, 1, 1, 1);


      let dayButton = new St.Button({ child: datesOfDay });
      dayButton.connect('clicked', Lang.bind(this, function () {
        this.setDate(p_iter);
      }));


      let styleClass = 'pcalendar-day-button';

      // if (events[1] && _sameDay(this._selectedDate, p_iter)) {
      //   styleClass += ' calendar-nonwork-day111 pcalendar-nonwork-day pcalendar-bg-orange';
      // } else if (events[1]) {
      //   styleClass += ' calendar-nonwork-day111 pcalendar-nonwork-day pcalendar-bg-red';
      // } else {
      //   styleClass += ' calendar-work-day111 pcalendar-work-day ';
      // }

      // if (row === 2) {
      //   styleClass = ' calendar-day-top111 ' + styleClass;
      // }
      // if (iter.getDay() === this._weekStart - 1) {
      //   styleClass = ' calendar-day-left111 ' + styleClass;
      // }

      {
        let bgColorStyle = '';
        if (events[1] && _sameDay(now, p_iter)) {// Holiday + Today
          bgColorStyle = ' pcalendar-bg-orange ';
        } else if (_sameDay(now, p_iter)) {// Today
          bgColorStyle = ' pcalendar-bg-green ';
        } else if (events[1]) {// Holiday
          bgColorStyle = ' pcalendar-bg-red ';
        }
        styleClass += bgColorStyle;
        if (_sameDay(this._selectedDate, p_iter)) selectedDateStyleClass = (bgColorStyle === '') ? ' pcalendar-bg-grey ' : bgColorStyle;
      }
      // if (events[0][0] !== undefined) {
      //   styleClass += ' pcalendar-day-with-events ';
      // }

      if (p_iter.month !== this._selectedDate.month) {
        // styleClass += ' calendar-other-month-day111 ';
        // if (events[1]) {
        styleClass += ' pcalendar-other-month-day';
        // } else {
        //   styleClass += 'pcalendar-other-month-nonwork-day ';
        // }
      } else if (_sameDay(this._selectedDate, p_iter)) {
        styleClass += ' pcalendar-active-day';
      } else {
        styleClass += ' pcalendar-notactive-day';
      }

      dayButton.style_class = styleClass;







      // button.add_style_pseudo_class(styleClass);
      {
        let [left, top, width, height] = _rotate(
          Math.abs(this._colPosition - (7 + iter.getDay() - this._weekStart) % 7),
          row,
          1,
          1
        );
        this.actorRight.layout_manager.attach(dayButton, left, top, width, height);
      }


      iter.setDate(iter.getDate() + 1);


      if (iter.getDay() === this._weekStart) {
        // We stop on the first "first day of the week" after the month we are displaying
        let tmp_p_iter = PersianDate.PersianDate.gregorianToPersian(
          iter.getFullYear(),
          iter.getMonth() + 1,
          iter.getDate()
        );
        if (tmp_p_iter.month > this._selectedDate.month || tmp_p_iter.year > this._selectedDate.year) {
          break;
        }
        row++;
      }
    }


    if (row === 6) {
      let [left, top, width, height] = _rotate(0, ++row, 7, 1);
      this.actorRight.layout_manager.attach(new St.Label({ text: " ", style_class: 'pcalendar-extra-height' }), left, top, width, height);
    }


    let _datesBox = new St.BoxLayout({ vertical: true, style_class: 'pcalendar-dates-show ' + selectedDateStyleClass });
    this.actorLeft.layout_manager.attach(_datesBox, 0, 0, 1, 1);

    // add persian date
    if (Schema.get_boolean('persian-display')) {
      let dateLabel = new St.Label({
        text: str.format(
          this.format(
            '%WW\n' + Schema.get_string('persian-display-format'),
            this._selectedDate.day,
            this._selectedDate.month,
            this._selectedDate.year,
            g_selectedDate.getDay(),
            'persian'
          )
        ) + ' هجری شمسی',
        // expand: true, x_fill: true, y_fill: true,
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        style_class: 'pcalendar-dates-show-label pcalendar-txt-pdate-color'
      });
      _datesBox.add(dateLabel/*, { expand: true, x_fill: true, y_fill: true, x_align: St.Align.MIDDLE }*/);
      // pDateLabel.connect('clicked', Lang.bind(pDateLabel, function () {
      //   St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.text)
      // }));
    }

    // add hijri date
    if (Schema.get_boolean('hijri-display')) {
      let dateLabel = new St.Label({
        text: str.format(
          this.format(
            Schema.get_string('hijri-display-format'),
            h_selectedDate.day,
            h_selectedDate.month,
            h_selectedDate.year,
            g_selectedDate.getDay(),
            'hijri'
          )
        ) + ' هجری قمری',
        // expand: true, x_fill: true, y_fill: true,
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        style_class: 'pcalendar-dates-show-label pcalendar-txt-hdate-color'
      });
      _datesBox.add(dateLabel/*, { expand: true, x_fill: true, y_fill: true, x_align: St.Align.MIDDLE }*/);
      // hDateLabel.connect('clicked', Lang.bind(hDateLabel, function () {
      //   St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.text)
      // }));
    }

    // add gregorian date
    if (Schema.get_boolean('gregorian-display')) {
      let dateLabel = new St.Label({
        text: this.format(
          Schema.get_string('gregorian-display-format'),
          g_selectedDate.getDate(),
          g_selectedDate.getMonth() + 1,
          g_selectedDate.getFullYear(),
          g_selectedDate.getDay(),
          'gregorian'
        ) + ' میلادی',
        // expand: true, x_fill: true, y_fill: true,
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        style_class: 'pcalendar-dates-show-label pcalendar-txt-gdate-color'
      });
      _datesBox.add(dateLabel/*, { expand: true, x_fill: true, y_fill: true, x_align: St.Align.MIDDLE }*/);
      // gDateLabel.connect('clicked', Lang.bind(gDateLabel, function () {
      //   St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, this.text)
      // }));
    }


    // add event box for selected date
    events = ev.getEvents(g_selectedDate);
    let evTopPosition = 0;
    for (let evObj of events[0]) {
      let _eventsBox = new St.BoxLayout();
      this.actorLeft.layout_manager.attach(_eventsBox, 0, ++evTopPosition, 1, 1);
      let evLabel = new St.Label({
        text: str.format(evObj.symbol + ' ' + evObj.event),
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        // expand: true, x_fill: true, y_fill: true, x_align: St.Align.MIDDLE,
        style_class: 'pcalendar-event-label ' + ((evObj.holiday) ? 'pcalendar-event-label-nonwork' : 'pcalendar-event-label-work')
      });
      evLabel.clutter_text.line_wrap = true;
      evLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
      evLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
      _eventsBox.add(evLabel/*, { expand: true, x_fill: true, y_fill: true, x_align: St.Align.MIDDLE }*/);
    }
  }
};