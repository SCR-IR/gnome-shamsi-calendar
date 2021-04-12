const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const St = imports.gi.St;
const Pango = imports.gi.Pango;

const ExtensionUtils = imports.misc.extensionUtils;
const extension = ExtensionUtils.getCurrentExtension();
const convenience = extension.imports.convenience;

const Tarikh = extension.imports.Tarikh;

const PrayTimes = extension.imports.PrayTimes.prayTimes;
const player = extension.imports.sound.player;

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
  _selectedTab: Schema.get_string('default-tab'),

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
      style_class: 'pcalendar pcalendar-top-div',
      layout_manager: new Clutter.GridLayout(),
      reactive: true
    });
    this.actor.layout_manager.attach(this.actorLeft, 0, 0, 1, 1);
    this.actor.layout_manager.attach(this.actorRight, 1, 0, 1, 1);

    this.actorRight.connect('scroll-event', Lang.bind(this, this._onScroll));

    //PrayTimes.setMethod(Schema.get_string('praytime-calc-method-main'));

    this._buildHeader();
  },

  _buildHeader: function () {

    this.actorRight.destroy_all_children();

    // Top line of the calendar '« year month »'
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
    });
    this._topBox.add(this._monthLabel);

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
    this._firstDayIndex = this.actorRight.get_children().length;
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
          1, 1, 1
        );
        this.actorRight.layout_manager.attach(label, left, top, width, height);
      }
    }


    this.actorLeft.destroy_all_children();
    let selectedDateStyleClass = '';
    let nowObj = new Tarikh.TarikhObject();


    this._monthLabel.text = '« ' + Tarikh.mName.shamsi[this._selectedDateObj.persianMonth] + ' ' +
      str.numbersFormat(this._selectedDateObj.persianYear) +
      ' »\n' +
      str.numbersFormat(
        str.dateStrFormat(
          '%MM %Y',
          this._selectedDateObj.islamicDay,
          this._selectedDateObj.islamicMonth,
          this._selectedDateObj.islamicYear,
          this._selectedDateObj.dayOfWeek,
          'islamic'
        )
      ) +
      ' | ' +
      str.dateStrFormat(
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
      } else if (iterObj.julianDay === this._selectedDateObj.julianDay) {
        styleClass += ' pcalendar-active-day';
      } else {
        styleClass += ' pcalendar-notactive-day';
      }

      dayButton.style_class = styleClass;







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

    let rooz = this._selectedDateObj.julianDay - nowObj.julianDay;
    if (rooz === 0) {
      rooz = 'امروز';
    } else if (rooz < 0) {
      rooz = (-1 * rooz) + ' روز قبل';
    } else {
      rooz = rooz + ' روز بعد';
    }
    let dateLabel = new St.Label({
      text: str.numbersFormat(
        str.dateStrFormat(
          '%WW',
          this._selectedDateObj.persianDay,
          this._selectedDateObj.persianMonth,
          this._selectedDateObj.persianYear,
          this._selectedDateObj.dayOfWeek,
          'persian'
        ) + '   ( ' + rooz + ' )'
      ),
      x_align: Clutter.ActorAlign.CENTER,
      x_expand: true,
      style_class: 'pcalendar-dates-show-label pcalendar-txt-pdate-color'
    });
    _datesBox.add(dateLabel);


    // add persian date
    if (dateDisplay.persian) {
      let dateLabel = new St.Label({
        text: str.numbersFormat(
          str.dateStrFormat(
            Schema.get_string('persian-display-format'),
            this._selectedDateObj.persianDay,
            this._selectedDateObj.persianMonth,
            this._selectedDateObj.persianYear,
            this._selectedDateObj.dayOfWeek,
            'persian'
          )
        ) + ' هجری شمسی',
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        style_class: 'pcalendar-dates-show-label pcalendar-txt-pdate-color'
      });
      _datesBox.add(dateLabel);
    }

    // add islamic date
    if (dateDisplay.islamic) {
      let dateLabel = new St.Label({
        text: str.numbersFormat(
          str.dateStrFormat(
            Schema.get_string('islamic-display-format'),
            this._selectedDateObj.islamicDay,
            this._selectedDateObj.islamicMonth,
            this._selectedDateObj.islamicYear,
            this._selectedDateObj.dayOfWeek,
            'islamic'
          )
        ) + ' هجری قمری',
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        style_class: 'pcalendar-dates-show-label pcalendar-txt-hdate-color'
      });
      _datesBox.add(dateLabel);
    }

    // add gregorian date
    if (dateDisplay.gregorian) {
      let dateLabel = new St.Label({
        text: str.dateStrFormat(
          Schema.get_string('gregorian-display-format'),
          this._selectedDateObj.gregorianDay,
          this._selectedDateObj.gregorianMonth,
          this._selectedDateObj.gregorianYear,
          this._selectedDateObj.dayOfWeek,
          'gregorian'
        ) + ' میلادی',
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        style_class: 'pcalendar-dates-show-label pcalendar-txt-gdate-color'
      });
      _datesBox.add(dateLabel);
    }
    let evTopPosition = 0;



    let _eventsBox3 = new St.BoxLayout({
      style: 'background-color: #323236; margin-bottom: 5px;'
    });
    _eventsBox3.add(new St.Button({
      label: '',
      style_class: 'pcalendar-tab-space',
      x_expand: true
    }));
    let tabs = {
      dateConvert: "تبدیل تاریخ",
      prayTimes: "اوقات شرعی",
      events: "مناسبت‌ها"
    };
    for (let i in tabs) {
      let tabBtn = new St.Button({
        label: tabs[i],
        style_class: 'pcalendar-tab' +
          ((this._selectedTab === i) ? ' pcalendar-selected-tab' : '')
      });
      tabBtn.connect('clicked', () => {
        this._selectedTab = i;
        this._update();
      });
      _eventsBox3.add(tabBtn);
    }
    this.actorLeft.layout_manager.attach(_eventsBox3, 0, ++evTopPosition, 1, 1);



    if (this._selectedTab === 'events') {

      // add events box for selected date
      events = ev.getEvents(this._selectedDateObj.all);
      for (let evObj of events[0]) {
        let _eventsBox = new St.BoxLayout();
        this.actorLeft.layout_manager.attach(_eventsBox, 0, ++evTopPosition, 1, 1);
        let evLabel = new St.Label({
          text: str.numbersFormat(evObj.symbol + ' ' + evObj.event),
          x_align: Clutter.ActorAlign.CENTER,
          x_expand: true,
          style_class: 'pcalendar-event-label ' + ((evObj.holiday) ? 'pcalendar-event-label-nonwork' : 'pcalendar-event-label-work')
        });
        evLabel.clutter_text.line_wrap = true;
        evLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
        evLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        _eventsBox.add(evLabel);
      }

    } else if (this._selectedTab === 'prayTimes') {

      // add praytimes box for selected date
      let _prayBox_v = new St.BoxLayout({
        style_class: 'pcalendar-praytimes-container',
        vertical: true,
        x_expand: true,
        x_align: Clutter.ActorAlign.CENTER
      });

      /* 'Tehran','Jafari','MWL','ISNA','Egypt','Makkah','Karachi' */
      const azanMethods = [
        Schema.get_string('praytime-calc-method-ehtiyat'),
        Schema.get_string('praytime-calc-method-main')
      ]
      let _prayTimes = {};
      for (let method of azanMethods) {
        let PT = PrayTimes;
        PT.setMethod(method);
        _prayTimes[method] = PT.getTimes(
          this._selectedDateObj.gregorian,
          [
            Schema.get_double('praytime-lat'),
            Schema.get_double('praytime-lng')
          ]
        );
      }

      let i = 0;


      let _prayColumnBox = new St.BoxLayout({ x_expand: false });

      {
        let playAzan = Schema.get_boolean('praytime-play-and-notify');
        let playAzanBtn = new St.Button({
          child: new St.Label({
            text: 'اذان‌گو ' + ((playAzan) ? '☑' : '☐'),
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            style: 'text-align: center; color: #' + ((playAzan) ? '269' : '666')
          })
        });
        playAzanBtn.connect('clicked', () => {
          Schema.set_boolean('praytime-play-and-notify', !playAzan);
          this._update();
        });
        let ofogh = new St.Label({
          text: 'به اُفق ' + Schema.get_string('praytime-city'),
          x_align: Clutter.ActorAlign.CENTER,
          x_expand: true,
          style: 'text-align: right; color: #b50'
        });
        let hBox = new St.BoxLayout({ x_expand: false });
        if (player !== null) hBox.add(playAzanBtn);
        hBox.add(ofogh);
        _prayBox_v.add(hBox);
      }


      let ehtiyatShow = Schema.get_boolean('praytime-ehtiyat-show');
      if (ehtiyatShow) _prayColumnBox.add(new St.Label({
        text: 'احتیاط',
        style_class: 'pcalendar-praytimes-time pcalendar-txt-grey pcalendar-underline',
        x_expand: false,
      }));
      _prayColumnBox.add(new St.Label({
        text: 'زمان',
        style_class: 'pcalendar-praytimes-time pcalendar-txt-grey pcalendar-underline',
        x_expand: false,
        style: 'text-align: center'
      }));
      _prayColumnBox.add(new St.Label({
        text: 'اوقات شرعی',
        style_class: 'pcalendar-praytimes-tname pcalendar-txt-grey pcalendar-underline',
        x_expand: false,
      }));
      _prayBox_v.add(_prayColumnBox);

      _prayColumnBox = new St.BoxLayout({ x_expand: false });
      for (let tName in _prayTimes[azanMethods[0]]) {
        // Schema Times Setting value="ShowTime,TextNotify,PlaySound,CalcMethod,SoundId"
        const settings = getPrayTimeSetting(tName);
        if (
          settings.ShowTime === 'never' ||
          (settings.ShowTime === 'ramazan' && this._selectedDateObj.islamicMonth !== 9)
        ) continue;
        // settings.SoundUri = Schema.get_string('praytime-' + tName + '-sound-uri');

        let oghat = { method: [], timeStr: [], minutes: [] };
        for (let i in azanMethods) {
          oghat.method[i] = parseInt(i);
          oghat.timeStr[i] = _prayTimes[azanMethods[i]][tName];
          oghat.minutes[i] = timeStrToMinutes(oghat.timeStr[i]);
        }

        let ehtiyat = (
          tName === 'imsak' ||
          tName === 'sunrise' ||
          tName === 'sunset' ||
          tName === 'midnight'
        ) ? Math.min(...oghat.minutes) : Math.max(...oghat.minutes);

        for (let i in oghat.method) {
          if (i == 0 && !ehtiyatShow) continue;
          _prayColumnBox.add(new St.Label({
            text: str.numbersFormat((oghat.method[i] === 1 || (oghat.minutes[i] === ehtiyat && oghat.minutes[0] !== oghat.minutes[1])) ? oghat.timeStr[i] : ''),
            style_class: 'pcalendar-praytimes-time ' +
              ((oghat.minutes[i] === ehtiyat) ? 'pcalendar-txt-green' : 'pcalendar-txt-grey'),
            x_expand: false,
          }));
        }

        let prayTimeStyle = 'pcalendar-txt-white', prayTimeSymbol = ' ';
        if (nowObj.julianDay === this._selectedDateObj.julianDay) {
          let date = new Date();
          let nowToMinutes = timeStrToMinutes(date.getHours() + ':' + date.getMinutes());
          if (nowToMinutes >= ehtiyat) {
            prayTimeSymbol = '✓';
            if (nowToMinutes === ehtiyat) prayTimeStyle = 'pcalendar-txt-green';
          }
        }
        _prayColumnBox.add(new St.Label({
          text: PrayTimes.persianMap[tName],
          style_class: 'pcalendar-praytimes-tname ' + prayTimeStyle,
          x_expand: false,
        }));
        _prayColumnBox.add(new St.Label({
          text: prayTimeSymbol,
          style_class: 'pcalendar-praytimes-symbol ' + prayTimeStyle,
          x_expand: false,
        }));
        if (true || ++i % 2 === 0) {
          _prayBox_v.add(_prayColumnBox);
          _prayColumnBox = new St.BoxLayout({ x_expand: false });
        }
      }



      this.actorLeft.layout_manager.attach(_prayBox_v, 0, ++evTopPosition, 1, 1);

      {
        const persianDate = nowObj.persian;
        const iranTZO = (
          persianDate[1] > 6 ||
          (persianDate[1] === 6 && persianDate[2] === 31) ||
          (persianDate[1] === 1 && persianDate[2] === 1)
        ) ? -210 : -270;
        if ((new Date().getTimezoneOffset()) !== iranTZO) {
          _prayBox_v.add(new St.Label({
            text: 'منطقه‌زمانی سیستم، ایران نیست!',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            style: 'text-align: right; color: #a22'
          }));
        }
      }

    } else if (this._selectedTab === 'dateConvert') {
      let _eventsBox = new St.BoxLayout();
      this.actorLeft.layout_manager.attach(_eventsBox, 0, ++evTopPosition, 1, 1);

      {
        let this1 = {};
        const ConverterTypes = {
          fromPersian: 0,
          fromGregorian: 1,
          fromIslamic: 2
        };
        let _activeConverter = ConverterTypes.fromPersian;
        let convertedDatesVbox = new St.BoxLayout({ vertical: true });
        let converterYear = new St.Entry({
          name: 'year',
          hint_text: 'سال',
          can_focus: true,
          x_expand: true,
          style_class: 'pcalendar-converter-entry'
        });
        let converterMonth = new St.Entry({
          name: 'month',
          hint_text: 'ماه',
          can_focus: true,
          x_expand: true,
          style_class: 'pcalendar-converter-entry'
        });
        let converterDay = new St.Entry({
          name: 'day',
          hint_text: 'روز',
          can_focus: true,
          x_expand: true,
          style_class: 'pcalendar-converter-entry'
        });

        const enNum = (faNum_) => {
          let faNum = "" + faNum_;
          let fa = {
            '۰': '0',
            '۱': '1',
            '۲': '2',
            '۳': '3',
            '۴': '4',
            '۵': '5',
            '۶': '6',
            '۷': '7',
            '۸': '8',
            '۹': '9'
          };

          let out = "";
          for (let i in faNum) {
            out += (fa[faNum[i]] !== undefined) ? fa[faNum[i]] : faNum[i];
          }

          return out;
        }

        const _onModifyConverter = () => {
          // erase old date
          let convertedDatesChildren = convertedDatesVbox.get_children();
          for (let i = 0; i < convertedDatesChildren.length; i++) {
            convertedDatesChildren[i].destroy();
          }

          let year = converterYear.get_text();
          let month = converterMonth.get_text();
          let day = converterDay.get_text();

          if (!day || !month || !year) return;

          [year, month, day] = [parseInt(enNum(year)), parseInt(enNum(month)), parseInt(enNum(day))];

          let cDateObj = new Tarikh.TarikhObject();
          let checkInputDate = false;

          switch (_activeConverter) {
            case ConverterTypes.fromGregorian:
              checkInputDate = Tarikh.check_gregorian(year, month, day, false);
              if (checkInputDate) cDateObj.gregorian = [year, month, day];
              break;
            case ConverterTypes.fromPersian:
              checkInputDate = Tarikh.check_persian(year, month, day, false);
              if (checkInputDate) cDateObj.persian = [year, month, day];
              break;
            case ConverterTypes.fromIslamic:
              checkInputDate = Tarikh.check_islamic(year, month, day, false);
              if (checkInputDate) cDateObj.islamic = [year, month, day];
              break;
            default:
              return;
          }

          if (!checkInputDate) {
            let button = new St.Button({
              label: 'تاریـخ وارد‌شده، صحیح نیست!\nاین تاریخ در تقویم وجود ندارد.',
              x_expand: true,
              style_class: 'pcalendar-day pcalendar-date-label'
            });
            convertedDatesVbox.add(button);
            return;
          }

          // add persian date
          if (_activeConverter !== ConverterTypes.fromPersian) {
            let button = new St.Button({
              label: str.numbersFormat(
                str.dateStrFormat(
                  Schema.get_string('persian-display-format'),
                  cDateObj.persianDay,
                  cDateObj.persianMonth,
                  cDateObj.persianYear,
                  cDateObj.dayOfWeek,
                  'persian'
                )
              ) + ' هجری شمسی',
              x_expand: true,
              style_class: 'pcalendar-day pcalendar-date-label'
            });
            convertedDatesVbox.add(button);
            button.connect('clicked', Lang.bind(button, function () {
              St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, _mainLable)
            }));
          }

          // add islamic date
          if (_activeConverter !== ConverterTypes.fromIslamic) {
            let button = new St.Button({
              label: str.numbersFormat(
                str.dateStrFormat(
                  Schema.get_string('islamic-display-format'),
                  cDateObj.islamicDay,
                  cDateObj.islamicMonth,
                  cDateObj.islamicYear,
                  cDateObj.dayOfWeek,
                  'islamic'
                )
              ) + ' هجری قمری',
              x_expand: true,
              style_class: 'pcalendar-day pcalendar-date-label'
            });
            convertedDatesVbox.add(button);
            button.connect('clicked', Lang.bind(button, function () {
              St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, _mainLable)
            }));
          }

          // add gregorian date
          if (_activeConverter !== ConverterTypes.fromGregorian) {
            let button = new St.Button({
              label: str.numbersFormat(
                str.dateStrFormat(
                  Schema.get_string('gregorian-display-format'),
                  cDateObj.gregorianDay,
                  cDateObj.gregorianMonth,
                  cDateObj.gregorianYear,
                  cDateObj.dayOfWeek,
                  'gregorian'
                )
              ) + ' میلادی',
              x_expand: true,
              style_class: 'pcalendar-day pcalendar-date-label'
            });
            convertedDatesVbox.add(button);
            button.connect('clicked', Lang.bind(button, function () {
              St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, _mainLable)
            }));
          }

        }

        const _toggleConverter = (button) => {
          // skip because it is already active
          if (_activeConverter === button.TypeID) {
            return;
          }

          // first remove active classes then highlight the clicked button
          let tabBox = button.get_parent();
          let tabBoxChildren = tabBox.get_children();

          for (let i = 0; i < tabBoxChildren.length; i++) {
            let tabButton = tabBoxChildren[i];
            tabButton.remove_style_class_name('active');
          }

          button.add_style_class_name('active');
          _activeConverter = button.TypeID;

          _onModifyConverter()
        }

        converterYear.clutter_text.connect('text-changed', _onModifyConverter);
        converterMonth.clutter_text.connect('text-changed', _onModifyConverter);
        converterDay.clutter_text.connect('text-changed', _onModifyConverter);

        let converterVbox = new St.BoxLayout({ style_class: 'pcalendar-font', vertical: true, x_expand: true });

        let middleBox = new St.BoxLayout({ style_class: 'pcalendar-converter-box', x_expand: true });

        _activeConverter = ConverterTypes.fromPersian;

        let fromPersian = new St.Button({
          reactive: true,
          can_focus: true,
          track_hover: true,
          x_expand: true,
          label: 'از هـ.شمسی',
          accessible_name: 'fromPersian',
          style_class: 'popup-menu-item button pcalendar-button fromPersian active'
        });
        fromPersian.connect('clicked', _toggleConverter);
        fromPersian.TypeID = ConverterTypes.fromPersian;

        let fromIslamic = new St.Button({
          reactive: true,
          can_focus: true,
          track_hover: true,
          x_expand: true,
          label: 'از هـ.قمری',
          accessible_name: 'fromIslamic',
          style_class: 'popup-menu-item button pcalendar-button fromIslamic'
        });
        fromIslamic.connect('clicked', _toggleConverter);
        fromIslamic.TypeID = ConverterTypes.fromIslamic;

        let fromGregorian = new St.Button({
          reactive: true,
          can_focus: true,
          track_hover: true,
          x_expand: true,
          label: 'از میلادی',
          accessible_name: 'fromGregorian',
          style_class: 'popup-menu-item button pcalendar-button fromGregorian'
        });
        fromGregorian.connect('clicked', _toggleConverter);
        fromGregorian.TypeID = ConverterTypes.fromGregorian;

        middleBox.add(fromGregorian);// Left
        middleBox.add(fromIslamic);// Center
        middleBox.add(fromPersian);// Right

        converterVbox.add(middleBox);

        let converterHbox = new St.BoxLayout({ style_class: 'pcalendar-converter-box' });

        converterHbox.add(converterYear);

        converterHbox.add(converterMonth);

        converterHbox.add(converterDay);

        converterVbox.add(converterHbox);

        converterVbox.add(convertedDatesVbox);



        _eventsBox.add(converterVbox);
      }

    }

    if (player !== null && player.isPlaying()) {
      let btn = new St.Button({ label: 'توقف پخش صدا', style_class: 'pcalendar-praytimes-azan' });
      btn.connect('clicked', Lang.bind(btn, () => {
        player.pause();
        this._update();
      }));
      this.actorLeft.layout_manager.attach(btn, 0, ++evTopPosition, 1, 1);
    }

  }

};

function getPrayTimeSetting(tName) {
  // Schema: Times Setting value="ShowTime,TextNotify,PlaySound,CalcMethod,SoundId"
  const [
    ShowTime,
    TextNotify,
    PlaySound,
    CalcMethod,
    SoundId
  ] = Schema.get_string('praytime-' + tName + '-setting').split(',');
  return {
    ShowTime,
    TextNotify,
    PlaySound,
    CalcMethod,
    SoundId
  };
}

function timeStrToMinutes(timeStr) {
  let [hour, min] = timeStr.split(':');
  hour = parseInt(hour);
  if (hour === 0) hour = 24;
  return ((hour * 60) + parseInt(min));
}
