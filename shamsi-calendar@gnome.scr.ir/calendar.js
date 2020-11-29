const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const St = imports.gi.St;
const Pango = imports.gi.Pango;

const ExtensionUtils = imports.misc.extensionUtils;
const extension = ExtensionUtils.getCurrentExtension();
const convenience = extension.imports.convenience;

const PersianDate = extension.imports.PersianDate;
const Tarikh = extension.imports.Tarikh;

const str = extension.imports.strFunctions;
const Events = extension.imports.Events;

const Schema = convenience.getSettings('org.gnome.shell.extensions.shamsi-calendar');

function _rotate(a, b, x, y) {
  return (Schema.get_boolean('rotaton-to-vertical')) ? [7 - b, 8 - a + 1, y, x] : [a, b, x, y];
}

function _colPosition(rtl) {
  return ((
    Schema.get_boolean('reverse-direction') && rtl ||
    !Schema.get_boolean('reverse-direction') && !rtl
  ) ? 6 : 0);
}

function Calendar() {
  this._init();
}

Calendar.prototype = {
  _selectedDateObj: new Tarikh.TarikhObject(),
  _rtl: (Clutter.get_default_text_direction() === Clutter.TextDirection.RTL),
  // weekdayAbbr: ['شـ', 'یـ', 'د', 'سـ', 'چـ', 'پـ', 'جـ'],

  _init: function () {

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
      islamic: {
        monthShort: ['محر', 'صفر', 'رب۱', 'رب۲', 'جم۱', 'جم۲', 'رجب', 'شعب', 'رمض', 'شوا', 'ذیق', 'ذیح'],
        monthLong: ['محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذیقعده', 'ذیحجه'],
        weekdayShort: ['س', 'ا', 'ا', 'ث', 'ا', 'خ', 'ج'],
        weekdayLong: ['‫السبت', '‫الأحد', '‫الاثنين', '‫الثلاثاء', '‫الأربعاء', '‫الخميس', '‫الجمعة'],
      }
    };

    // change dow to Persian style!
    // dow++;
    // if (dow > 6) {
    //   dow = 0;
    // }

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
    this._selectedDateObj.change([0, -1], 'persian');
    this._update();
  },

  _onNextMonthButtonClicked: function () {
    this._selectedDateObj.change([0, +1], 'persian');
    this._update();
  },

  _onPrevYearButtonClicked: function () {
    this._selectedDateObj.change([-1], 'persian');
    this._update();
  },

  _onNextYearButtonClicked: function () {
    this._selectedDateObj.change([+1], 'persian');
    this._update();
  },

  _update: function () {
    let weekStart = parseInt(Schema.get_string('week-start'));
    let dateDisplay = {
      persian: Schema.get_boolean('persian-display'),
      islamic: Schema.get_boolean('islamic-display'),
      gregorian: Schema.get_boolean('gregorian-display')
    };
    // Remove everything but the topBox and the weekday labels
    let children = this.actorRight.get_children();

    for (let i = this._firstDayIndex; i < children.length; i++) {
      children[i].destroy();
    }

    // Add weekday labels...
    const weekdayAbbr = ['شنبه', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه'];
    for (let i = weekStart; i < (weekStart + 7); i++) {
      let label = new St.Label({
        style_class: 'pcalendar-day-heading pcalendar-rtl',
        text: weekdayAbbr[i % 7]
      });
      {
        let [left, top, width, height] = _rotate(
          Math.abs(_colPosition(this._rtl) - ((7 + i - weekStart) % 7)),
          // this._colPosition(this._rtl) - ((7 + (i % 7) - weekStart) % 7),
          1, 1, 1
        );
        this.actorRight.layout_manager.attach(label, left, top, width, height);
      }
    }


    this.actorLeft.destroy_all_children();
    let selectedDateStyleClass = '';
    // this._selectedDateObj = new Tarikh.TarikhObject();
    let nowObj = new Tarikh.TarikhObject();


    this._monthLabel.text = '« ' + PersianDate.PersianDate.p_month_names[this._selectedDateObj.persianMonth - 1] + ' ' +
      str.numbersFormat(this._selectedDateObj.persianYear) +
      ' »\n' +
      str.numbersFormat(
        this.format(
          '%MM %Y',
          this._selectedDateObj.islamicDay,
          this._selectedDateObj.islamicMonth,
          this._selectedDateObj.islamicYear,
          this._selectedDateObj.dayOfWeek,
          'islamic'
        )
      ) +
      ' | ' +
      this.format(
        '%MM %Y',
        this._selectedDateObj.gregorianDay,
        this._selectedDateObj.gregorianMonth,
        this._selectedDateObj.gregorianYear,
        this._selectedDateObj.dayOfWeek,
        'gregorian'
      );



    // Start at the beginning of the week before the start of the month
    let iterObj = new Tarikh.TarikhObject();
    iterObj.julianDay = this._selectedDateObj.julianDay;
    iterObj.persianDay = 1;
    iterObj.dayOfWeek = weekStart;


    let row = 2;

    let ev = new Events.Events();
    let events;

    /* eslint no-constant-condition: ["error", { "checkLoops": false }] */
    while (true) {
      // find events and holidays
      events = ev.getEvents(iterObj.all);
      let eventStatus = {
        persian: {
          hasEvent: false,
          isHoliday: false
        },
        islamic: {
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

      let alpha = (iterObj.persianMonth !== this._selectedDateObj.persianMonth) ? '-alpha' : '';

      let shamsiLabel = new St.Label({
        text: ((dateDisplay.persian) ? str.numbersFormat(iterObj.persianDay) : ' '),
        style_class: 'pcalendar-pdate-day-txt'
      });
      if (eventStatus.persian.hasEvent) shamsiLabel.style_class += ' pcalendar-underline';
      shamsiLabel.style_class += ((eventStatus.persian.isHoliday) ? ' pcalendar-txt-red' : ' pcalendar-txt-pdate-color') + alpha;

      let ghamariLabel = new St.Label({
        text: ((dateDisplay.islamic) ? str.numbersFormat(iterObj.islamicDay) : ' '),
        style_class: 'pcalendar-hdate-day-txt'
      });
      if (eventStatus.islamic.hasEvent) ghamariLabel.style_class += ' pcalendar-underline';
      ghamariLabel.style_class += ((eventStatus.islamic.isHoliday) ? ' pcalendar-txt-red' : ' pcalendar-txt-hdate-color') + alpha;

      let miladiLabel = new St.Label({
        text: ((dateDisplay.gregorian) ? iterObj.gregorianDay.toString() : ' '),
        style_class: 'pcalendar-gdate-day-txt'
      });
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
      let iterObj_julianDay = iterObj.julianDay;
      dayButton.connect('clicked', Lang.bind(this, function () {
        this._selectedDateObj.julianDay = iterObj_julianDay;
        this._update();
      }));


      let styleClass = 'pcalendar-day-button';

      {
        let bgColorStyle = '';
        if (events[1] && iterObj.julianDay === nowObj.julianDay) {// Holiday + Today
          bgColorStyle = ' pcalendar-bg-orange ';
        } else if (iterObj.julianDay === nowObj.julianDay) {// Today
          bgColorStyle = ' pcalendar-bg-green ';
        } else if (events[1]) {// Holiday
          bgColorStyle = ' pcalendar-bg-red ';
        }
        styleClass += bgColorStyle;
        if (iterObj.julianDay === this._selectedDateObj.julianDay) selectedDateStyleClass = (bgColorStyle === '') ? ' pcalendar-bg-grey ' : bgColorStyle;
      }

      if (iterObj.persianMonth !== this._selectedDateObj.persianMonth) {
        styleClass += ' pcalendar-other-month-day';
      } else if (this._selectedDateObj.julianDay === iterObj.julianDay) {
        styleClass += ' pcalendar-active-day';
      } else {
        styleClass += ' pcalendar-notactive-day';
      }

      dayButton.style_class = styleClass;







      // button.add_style_pseudo_class(styleClass);
      {
        let [left, top, width, height] = _rotate(
          Math.abs(_colPosition(this._rtl) - ((7 + iterObj.dayOfWeek - weekStart) % 7)),
          row,
          1,
          1
        );
        this.actorRight.layout_manager.attach(dayButton, left, top, width, height);
      }


      iterObj.julianDay++;//add 1 Day


      if (iterObj.dayOfWeek === weekStart) {
        // We stop on the first "first day of the week" after the month we are displaying
        if (iterObj.persianMonth > this._selectedDateObj.persianMonth || iterObj.persianYear > this._selectedDateObj.persianYear) {
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
    if (dateDisplay.persian) {
      let dateLabel = new St.Label({
        text: str.numbersFormat(
          this.format(
            '%WW\n' + Schema.get_string('persian-display-format'),
            this._selectedDateObj.persianDay,
            this._selectedDateObj.persianMonth,
            this._selectedDateObj.persianYear,
            this._selectedDateObj.dayOfWeek,
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

    // add islamic date
    if (dateDisplay.islamic) {
      let dateLabel = new St.Label({
        text: str.numbersFormat(
          this.format(
            Schema.get_string('islamic-display-format'),
            this._selectedDateObj.islamicDay,
            this._selectedDateObj.islamicMonth,
            this._selectedDateObj.islamicYear,
            this._selectedDateObj.dayOfWeek,
            'islamic'
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
    if (dateDisplay.gregorian) {
      let dateLabel = new St.Label({
        text: this.format(
          Schema.get_string('gregorian-display-format'),
          this._selectedDateObj.gregorianDay,
          this._selectedDateObj.gregorianMonth,
          this._selectedDateObj.gregorianYear,
          this._selectedDateObj.dayOfWeek,
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
    events = ev.getEvents(this._selectedDateObj.all);
    let evTopPosition = 0;
    for (let evObj of events[0]) {
      let _eventsBox = new St.BoxLayout();
      this.actorLeft.layout_manager.attach(_eventsBox, 0, ++evTopPosition, 1, 1);
      let evLabel = new St.Label({
        text: str.numbersFormat(evObj.symbol + ' ' + evObj.event),
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