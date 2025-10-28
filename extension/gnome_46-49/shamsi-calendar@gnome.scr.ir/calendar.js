import Clutter from 'gi://Clutter';
import St from 'gi://St';
import Pango from 'gi://Pango';

import { Str, getPrayTimeSetting } from './otherFunctions.js';
import PrayTimes from './PrayTimes.js';
import * as Tarikh from './Tarikh.js';
import * as Events from './Events.js';



export class Calendar {

  constructor(Schema, cssThemeID) {
    this.schema = Schema;
    this.cssThemeID = cssThemeID;

    this.actorRight = new St.Widget({
      style_class: 'shcalendar-actor-right',
      layout_manager: new Clutter.GridLayout(),
      reactive: true
    });
    this.actorLeft = new St.Widget({
      style_class: 'shcalendar-actor-left shcalendar-actor-left' + this.cssThemeID,
      layout_manager: new Clutter.GridLayout(),
      reactive: true
    });

    this.actor = new St.Widget({
      style_class: 'shcalendar shcalendar' + this.cssThemeID + ' shcalendar-top-div',
      layout_manager: new Clutter.GridLayout(),
      reactive: true
    });
    this.actor.layout_manager.attach(this.actorLeft, 0, 0, 1, 1);
    this.actor.layout_manager.attach(this.actorRight, 1, 0, 1, 1);

    this.actorRight.connect('scroll-event', this._onScroll);

    this._buildHeader();

    this._selectedDateObj = new Tarikh.TarikhObject();
    this._rtl = (Clutter.get_default_text_direction() === Clutter.TextDirection.RTL);
    this._selectedTab = this.schema.get_string('default-tab');
  }

  _buildHeader = () => {

    this.actorRight.destroy_all_children();

    // Top line of the calendar '« year month »'
    this._topBox = new St.BoxLayout();
    this.actorRight.layout_manager.attach(this._topBox, 0, 0, 7, 1);

    let rightButton = null;
    let icon = null;
    let style = 'shcalendar-top-button shcalendar-top-button' + this.cssThemeID;
    if (this._rtl) {
      icon = new St.Icon({ icon_name: 'go-last-symbolic' });
      rightButton = new St.Button({ style_class: style, child: icon });
      rightButton.connect('clicked', this._onPrevYearButtonClicked);
    } else {
      icon = new St.Icon({ icon_name: 'go-first-symbolic' });
      rightButton = new St.Button({ style_class: style, child: icon });
      rightButton.connect('clicked', this._onNextYearButtonClicked);
    }
    icon.set_icon_size(16);
    this._topBox.add_child(rightButton);

    if (this._rtl) {
      icon = new St.Icon({ icon_name: 'go-next-symbolic' });
      rightButton = new St.Button({ style_class: style, child: icon });
      rightButton.connect('clicked', this._onPrevMonthButtonClicked);
    } else {
      icon = new St.Icon({ icon_name: 'go-previous-symbolic' });
      rightButton = new St.Button({ style_class: style, child: icon });
      rightButton.connect('clicked', this._onNextMonthButtonClicked);
    }
    icon.set_icon_size(16);
    this._topBox.add_child(rightButton);

    this._monthLabel = new St.Label({
      style_class: 'shcalendar-month-label shcalendar-month-label' + this.cssThemeID,
      x_align: Clutter.ActorAlign.CENTER,
      x_expand: true
    });
    this._topBox.add_child(this._monthLabel);

    let leftButton = null;
    if (this._rtl) {
      icon = new St.Icon({ icon_name: 'go-previous-symbolic' });
      leftButton = new St.Button({ style_class: style, child: icon });
      leftButton.connect('clicked', this._onNextMonthButtonClicked);
    } else {
      icon = new St.Icon({ icon_name: 'go-next-symbolic' });
      leftButton = new St.Button({ style_class: style, child: icon });
      leftButton.connect('clicked', this._onPrevMonthButtonClicked);
    }
    icon.set_icon_size(16);
    this._topBox.add_child(leftButton);

    if (this._rtl) {
      icon = new St.Icon({ icon_name: 'go-first-symbolic' });
      leftButton = new St.Button({ style_class: style, child: icon });
      leftButton.connect('clicked', this._onNextYearButtonClicked);
    } else {
      icon = new St.Icon({ icon_name: 'go-last-symbolic' });
      leftButton = new St.Button({ style_class: style, child: icon });
      leftButton.connect('clicked', this._onPrevYearButtonClicked);
    }
    icon.set_icon_size(16);
    this._topBox.add_child(leftButton);

    // All the children after this are days, and get removed when we update the calendar
    this._firstDayIndex = this.actorRight.get_children().length;
  }

  _onScroll = (actor, event) => {
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
  }

  _onPrevMonthButtonClicked = () => {
    let [y, m, d] = this._selectedDateObj.persian;
    if (m === 1) {
      m = 12;
      y--;
      let dom = Tarikh.daysOfMonth_persian(y, 12);
      if (d > dom) d = dom;
    } else {
      m--;
    }
    this._selectedDateObj.persian = [y, m, d];
    this._update();
  }

  _onNextMonthButtonClicked = () => {
    let [y, m, d] = this._selectedDateObj.persian;
    if (m === 6 && d === 31) d = 30
    else if (m === 11 && d === 30 && !Tarikh.is_persian_leap(y)) d = 29
    else if (m === 12) {
      y++;
      m = 0;
    }
    this._selectedDateObj.persian = [y, m + 1, d];
    this._update();
  }

  _onPrevYearButtonClicked = () => {
    let [y, m, d] = this._selectedDateObj.persian;
    if (m === 12 && d === 30) d = 29;
    this._selectedDateObj.persian = [y - 1, m, d];
    this._update();
  }

  _onNextYearButtonClicked = () => {
    let [y, m, d] = this._selectedDateObj.persian;
    if (m === 12 && d === 30) d = 29;
    this._selectedDateObj.persian = [y + 1, m, d];
    this._update();
  }

  _update = () => {
    let weekStart = parseInt(this.schema.get_string('week-start'));
    let dateDisplay = {
      persian: this.schema.get_boolean('persian-display'),
      islamic: this.schema.get_boolean('islamic-display'),
      gregorian: this.schema.get_boolean('gregorian-display')
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
        style_class: 'shcalendar-day-heading shcalendar-day-heading' + this.cssThemeID + ' shcalendar-rtl',
        text: weekdayAbbr[i % 7]
      });
      {
        let [left, top, width, height] = this._rotate(
          Math.abs(this._colPosition(this._rtl, this.schema) - ((7 + i - weekStart) % 7)),
          1, 1, 1,
          this.schema
        );
        this.actorRight.layout_manager.attach(label, left, top, width, height);
      }
    }


    this.actorLeft.destroy_all_children();
    let selectedDateStyleClass = '';
    let nowObj = new Tarikh.TarikhObject();


    this._monthLabel.text = '« ' + Tarikh.mName.shamsi[this._selectedDateObj.persianMonth] + ' ' +
      Str.numbersFormat(this._selectedDateObj.persianYear) +
      ' »\n' +
      Str.numbersFormat(
        Str.dateStrFormat(
          '%MM %Y',
          this._selectedDateObj.islamicDay,
          this._selectedDateObj.islamicMonth,
          this._selectedDateObj.islamicYear,
          this._selectedDateObj.dayOfWeek,
          'islamic'
        )
      ) +
      ' | ' +
      Str.dateStrFormat(
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

    let selectedMonthEvents = [];
    let selectedDateEvents = [[], false];
    let afterSelectedDateEvents = [[], false];

    while (true) {
      // find events and holidays
      let events = new Events.Events(iterObj, this.schema).getEvents();
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

      let alpha = '';
      if (iterObj.persianMonth !== this._selectedDateObj.persianMonth) {
        alpha = '-alpha';
      } else {
        selectedMonthEvents.push(events);
      }

      let shamsiLabel = new St.Label({
        text: ((dateDisplay.persian) ? Str.numbersFormat(iterObj.persianDay) : ' '),
        style_class: 'shcalendar-pdate-day-txt'
      });
      if (eventStatus.persian.hasEvent) shamsiLabel.style_class += ' shcalendar-underline';
      shamsiLabel.style_class += ((eventStatus.persian.isHoliday) ? ' shcalendar-txt-bold shcalendar-txt-red' : ' shcalendar-txt-pdate-color') + alpha + this.cssThemeID;

      let ghamariLabel = new St.Label({
        text: ((dateDisplay.islamic) ? Str.numbersFormat(iterObj.islamicDay) : ' '),
        style_class: 'shcalendar-hdate-day-txt'
      });
      if (eventStatus.islamic.hasEvent) ghamariLabel.style_class += ' shcalendar-underline';
      ghamariLabel.style_class += ((eventStatus.islamic.isHoliday) ? ' shcalendar-txt-bold shcalendar-txt-red' : ' shcalendar-txt-hdate-color') + alpha + this.cssThemeID;

      let miladiLabel = new St.Label({
        text: ((dateDisplay.gregorian) ? iterObj.gregorianDay.toString() : ' '),
        style_class: 'shcalendar-gdate-day-txt'
      });
      if (eventStatus.gregorian.hasEvent) miladiLabel.style_class += ' shcalendar-underline';
      miladiLabel.style_class += ((eventStatus.gregorian.isHoliday) ? ' shcalendar-txt-bold shcalendar-txt-red' : ' shcalendar-txt-gdate-color') + alpha + this.cssThemeID;

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
      dayButton.connect('clicked', () => {
        this._selectedDateObj.julianDay = iterObj_julianDay;
        this._update();
      });


      let styleClass = 'shcalendar-day-button shcalendar-day-button' + this.cssThemeID;

      {
        let bgColorStyle = '';
        if (events[1] && iterObj.julianDay === nowObj.julianDay) {// Holiday + Today
          bgColorStyle = ' shcalendar-bg-orange' + this.cssThemeID + ' ';
        } else if (iterObj.julianDay === nowObj.julianDay) {// Today
          bgColorStyle = ' shcalendar-bg-green' + this.cssThemeID + ' ';
        } else if (events[1]) {// Holiday
          bgColorStyle = ' shcalendar-bg-red' + this.cssThemeID + ' ';
        }
        styleClass += bgColorStyle;
        if (iterObj.julianDay === this._selectedDateObj.julianDay) selectedDateStyleClass = (bgColorStyle === '') ? ' shcalendar-bg-grey' + this.cssThemeID + ' ' : bgColorStyle;
      }

      if (iterObj.persianMonth !== this._selectedDateObj.persianMonth) {
        styleClass += ' shcalendar-other-month-day' + this.cssThemeID;
      } else if (iterObj.julianDay === this._selectedDateObj.julianDay) {
        styleClass += ' shcalendar-active-day' + this.cssThemeID;
        selectedDateEvents = events;
      } else {
        styleClass += ' shcalendar-notactive-day' + this.cssThemeID;
      }

      if (iterObj.julianDay === (this._selectedDateObj.julianDay + 1)) {
        afterSelectedDateEvents = events;
      }

      dayButton.style_class = styleClass;







      {
        let [left, top, width, height] = this._rotate(
          Math.abs(this._colPosition(this._rtl, this.schema) - ((7 + iterObj.dayOfWeek - weekStart) % 7)),
          row,
          1,
          1,
          this.schema
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

    if (afterSelectedDateEvents === undefined) {// Example: 1404/12/29
      let _iterObj = new Tarikh.TarikhObject();
      _iterObj.julianDay = this._selectedDateObj.julianDay + 1;
      afterSelectedDateEvents = new Events.Events(_iterObj, this.schema).getEvents();
    }


    if (row === 6) {
      let [left, top, width, height] = this._rotate(0, ++row, 7, 1, this.schema);
      this.actorRight.layout_manager.attach(new St.Label({ text: " ", style_class: 'shcalendar-extra-height' }), left, top, width, height);
    }


    let _datesBox = new St.BoxLayout({ vertical: true, style_class: 'shcalendar-dates-show ' + selectedDateStyleClass });
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
      text: Str.numbersFormat(
        Str.dateStrFormat(
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
      style_class: 'shcalendar-dates-show-label shcalendar-txt-pdate-color' + this.cssThemeID
    });
    _datesBox.add_child(dateLabel);


    // add persian date
    if (dateDisplay.persian) {
      let dateLabel = new St.Label({
        text: Str.numbersFormat(
          Str.dateStrFormat(
            this.schema.get_string('persian-display-format'),
            this._selectedDateObj.persianDay,
            this._selectedDateObj.persianMonth,
            this._selectedDateObj.persianYear,
            this._selectedDateObj.dayOfWeek,
            'persian'
          )
        ) + ' هجری شمسی',
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        style_class: 'shcalendar-dates-show-label shcalendar-txt-pdate-color' + this.cssThemeID
      });
      _datesBox.add_child(dateLabel);
    }

    // add islamic date
    if (dateDisplay.islamic) {
      let dateLabel = new St.Label({
        text: Str.numbersFormat(
          Str.dateStrFormat(
            this.schema.get_string('islamic-display-format'),
            this._selectedDateObj.islamicDay,
            this._selectedDateObj.islamicMonth,
            this._selectedDateObj.islamicYear,
            this._selectedDateObj.dayOfWeek,
            'islamic'
          )
        ) + ' هجری قمری',
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        style_class: 'shcalendar-dates-show-label shcalendar-txt-hdate-color' + this.cssThemeID
      });
      _datesBox.add_child(dateLabel);
    }

    // add gregorian date
    if (dateDisplay.gregorian) {
      let dateLabel = new St.Label({
        text: Str.dateStrFormat(
          this.schema.get_string('gregorian-display-format'),
          this._selectedDateObj.gregorianDay,
          this._selectedDateObj.gregorianMonth,
          this._selectedDateObj.gregorianYear,
          this._selectedDateObj.dayOfWeek,
          'gregorian'
        ) + ' میلادی',
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        style_class: 'shcalendar-dates-show-label shcalendar-txt-gdate-color' + this.cssThemeID
      });
      _datesBox.add_child(dateLabel);
    }
    let evTopPosition = 0;



    /* 'Tehran','Jafari','MWL','ISNA','Egypt','Makkah','Karachi' */
    const azanMethods = [
      this.schema.get_string('praytime-calc-method-ehtiyat'),
      this.schema.get_string('praytime-calc-method-main')
    ]
    const NewPrayTimes = new PrayTimes();
    let _prayTimes = {};
    for (let method of azanMethods) {
      let PT = NewPrayTimes;
      PT.setMethod(method);
      _prayTimes[method] = PT.getTimes(
        this._selectedDateObj.gregorian,
        [
          this.schema.get_double('praytime-lat'),
          this.schema.get_double('praytime-lng')
        ]
      );
    }
    let date = new Date();
    let nowToMinutes = Str.timeStrToMinutes(date.getHours() + ':' + date.getMinutes());

    //
    let isAfterSunset = false;
    for (let tName in _prayTimes[azanMethods[0]]) {
      if (tName !== 'sunset') continue
      let oghat = { method: [], timeStr: [], minutes: [] };
      for (let i in azanMethods) {
        oghat.method[i] = parseInt(i);
        oghat.timeStr[i] = _prayTimes[azanMethods[i]][tName];
        oghat.minutes[i] = Str.timeStrToMinutes(oghat.timeStr[i]);
      }
      if (nowToMinutes >= Math.min(...oghat.minutes)) isAfterSunset = true;
    }
    //

    let afterSelectedDateShadiState = afterSelectedDateEvents[0].map((v) => v.shadi);
    let eventsTabColorClass = '';
    if (nowObj.julianDay === this._selectedDateObj.julianDay) {
      let selectedDateShadiState = selectedDateEvents[0].map((v) => v.shadi);
      let eventsShadiState = (isAfterSunset) ? [...selectedDateShadiState, ...afterSelectedDateShadiState] : selectedDateShadiState;
      if (eventsShadiState.includes(-1)) {
        eventsTabColorClass = ' shcalendar-txt-bold shcalendar-txt-red' + this.cssThemeID;
      } else if (eventsShadiState.includes(1)) {
        eventsTabColorClass = ' shcalendar-txt-bold shcalendar-txt-blue' + this.cssThemeID;
      }
    }
    //

    let _eventsBox3 = new St.BoxLayout({
      style: 'margin-bottom: 5px;'
    });
    _eventsBox3.add_child(new St.Button({
      label: '',
      style_class: 'shcalendar-tab-space shcalendar-tab-space' + this.cssThemeID,
      x_expand: true
    }));
    let tabs = {
      dateConvert: "تبدیل تاریخ",
      prayTimes: "اوقات شرعی",
      events: ((eventsTabColorClass !== '') ? '* ' : '') + "مناسبت‌ها"
    };
    for (let i in tabs) {
      let tabBtn = new St.Button({
        label: tabs[i],
        style_class: 'shcalendar-tab shcalendar-tab' + this.cssThemeID +
          ((this._selectedTab === i) ? ' shcalendar-selected-tab shcalendar-selected-tab' + this.cssThemeID : '') +
          ((i === 'events') ? eventsTabColorClass : '')//
      });
      tabBtn.connect('clicked', () => {
        this._selectedTab = i;
        this._update();
      });
      _eventsBox3.add_child(tabBtn);
    }
    this.actorLeft.layout_manager.attach(_eventsBox3, 0, ++evTopPosition, 1, 1);









    let _scrollBox = new St.ScrollView({
      overlay_scrollbars: true,
      enable_mouse_scrolling: true,
      hscrollbar_policy: 2,
      style_class: 'shcalendar-events-scrollable'
    });
    this.actorLeft.layout_manager.attach(_scrollBox, 0, ++evTopPosition, 1, 1);
    if (this._selectedTab === 'events') {



      let _eventsBox = new St.BoxLayout({ vertical: true, style_class: 'shcalendar-events-layout' });
      _scrollBox.add_child(_eventsBox);

      if (
        isAfterSunset &&
        nowObj.julianDay === this._selectedDateObj.julianDay &&
        afterSelectedDateShadiState.some((v) => v !== 0)
      ) {
        let evLabelA = new St.Label({
          text: Str.numbersFormat('یادآوری مهم‌ترین‌ها برای فردا:'),
          x_align: Clutter.ActorAlign.CENTER,
          x_expand: true,
          style_class: 'shcalendar-event-label shcalendar-txt-bold shcalendar-txt-orange' + this.cssThemeID
        });
        evLabelA.clutter_text.line_wrap = true;
        evLabelA.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
        evLabelA.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        _eventsBox.add_child(evLabelA);
        for (let evObj of afterSelectedDateEvents[0]) {
          if (evObj.shadi === 0) continue;
          let evLabel = new St.Label({
            text: Str.numbersFormat(evObj.symbol + ' ' + evObj.event),
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            style_class: 'shcalendar-event-label ' + ((evObj.holiday) ? 'shcalendar-event-label-nonwork' + this.cssThemeID : 'shcalendar-event-label-work' + this.cssThemeID)
          });
          evLabel.clutter_text.line_wrap = true;
          evLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
          evLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
          _eventsBox.add_child(evLabel);
        }
        let evLabelB = new St.Label({
          text: '-------------------------\n' + Str.numbersFormat((selectedDateEvents[0].length === 0) ? 'امروز:\n          مناسبت خاصی نداشت!' : 'مناسبت‌های امروز که گذشت:'),
          x_align: Clutter.ActorAlign.CENTER,
          x_expand: true,
          style_class: 'shcalendar-event-label shcalendar-txt-bold ' + ((selectedDateEvents[0].length === 0) ? 'shcalendar-txt-grey' : 'shcalendar-txt-green') + this.cssThemeID
        });
        evLabelB.clutter_text.line_wrap = true;
        evLabelB.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
        evLabelB.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        _eventsBox.add_child(evLabelB);
      }

      for (let evObj of selectedDateEvents[0]) {
        let evLabel = new St.Label({
          text: Str.numbersFormat(evObj.symbol + ' ' + evObj.event),
          x_align: Clutter.ActorAlign.CENTER,
          x_expand: true,
          style_class: 'shcalendar-event-label ' + ((evObj.holiday) ? 'shcalendar-event-label-nonwork' + this.cssThemeID : 'shcalendar-event-label-work' + this.cssThemeID)
        });
        evLabel.clutter_text.line_wrap = true;
        evLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
        evLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        _eventsBox.add_child(evLabel);
      }



    } else if (this._selectedTab === 'prayTimes') {

      // add praytimes box for selected date
      let _prayBox_v = new St.BoxLayout({
        style_class: 'shcalendar-praytimes-container',
        vertical: true,
        x_expand: true,
        x_align: Clutter.ActorAlign.CENTER
      });

      let i = 0;


      let _prayColumnBox = new St.BoxLayout({ x_expand: false });

      {
        let playAzan = this.schema.get_boolean('praytime-play-and-notify');
        let playAzanBtn = new St.Button({
          child: new St.Label({
            text: 'اذان‌گو ' + ((playAzan) ? '☑' : '☐'),
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            style: 'text-align: center; color: #' + ((playAzan) ? '05e' : '666')
          })
        });
        playAzanBtn.connect('clicked', () => {
          this.schema.set_boolean('praytime-play-and-notify', !playAzan);
          this._update();
        });
        let ofogh = new St.Label({
          text: 'به اُفق ' + this.schema.get_string('praytime-city'),
          x_align: Clutter.ActorAlign.CENTER,
          x_expand: true,
          style: 'text-align: right; color: #b50'
        });
        let hBox = new St.BoxLayout({ x_expand: false });
        /* if (player !== null) */ hBox.add_child(playAzanBtn);
        hBox.add_child(ofogh);
        _prayBox_v.add_child(hBox);
      }


      let ehtiyatShow = this.schema.get_boolean('praytime-ehtiyat-show');
      if (ehtiyatShow) _prayColumnBox.add_child(new St.Label({
        text: 'احتیاط',
        style_class: 'shcalendar-praytimes-time shcalendar-txt-grey' + this.cssThemeID + ' shcalendar-underline',
        x_expand: false,
      }));
      _prayColumnBox.add_child(new St.Label({
        text: 'زمان',
        style_class: 'shcalendar-praytimes-time shcalendar-txt-grey' + this.cssThemeID + ' shcalendar-underline',
        x_expand: false,
        style: 'text-align: center'
      }));
      _prayColumnBox.add_child(new St.Label({
        text: 'اوقات شرعی',
        style_class: 'shcalendar-praytimes-tname shcalendar-txt-grey' + this.cssThemeID + ' shcalendar-underline',
        x_expand: false,
      }));
      _prayBox_v.add_child(_prayColumnBox);

      _prayColumnBox = new St.BoxLayout({ x_expand: false });
      for (let tName in _prayTimes[azanMethods[0]]) {
        // Schema Times Setting value="ShowTime,TextNotify,PlaySound,CalcMethod,SoundId"
        const settings = getPrayTimeSetting(tName, this.schema);
        if (
          settings.ShowTime === 'never' ||
          (settings.ShowTime === 'ramazan' && this._selectedDateObj.islamicMonth !== 9)
        ) continue;
        // settings.SoundUri = this.schema.get_string('praytime-' + tName + '-sound-uri');

        let oghat = { method: [], timeStr: [], minutes: [] };
        for (let i in azanMethods) {
          oghat.method[i] = parseInt(i);
          oghat.timeStr[i] = _prayTimes[azanMethods[i]][tName];
          oghat.minutes[i] = Str.timeStrToMinutes(oghat.timeStr[i]);
        }

        let ehtiyat = (
          tName === 'imsak' ||
          tName === 'sunrise' ||
          tName === 'sunset' ||
          tName === 'midnight'
        ) ? Math.min(...oghat.minutes) : Math.max(...oghat.minutes);

        for (let i in oghat.method) {
          if (i == 0 && !ehtiyatShow) continue;
          _prayColumnBox.add_child(new St.Label({
            text: Str.numbersFormat((oghat.method[i] === 1 || (oghat.minutes[i] === ehtiyat && oghat.minutes[0] !== oghat.minutes[1])) ? oghat.timeStr[i] : ''),
            style_class: 'shcalendar-praytimes-time ' +
              ((oghat.minutes[i] === ehtiyat) ? 'shcalendar-txt-green' + this.cssThemeID : 'shcalendar-txt-grey' + this.cssThemeID),
            x_expand: false,
          }));
        }

        let prayTimeStyle = 'shcalendar-txt-color' + this.cssThemeID, prayTimeSymbol = ' ';
        if (nowObj.julianDay === this._selectedDateObj.julianDay) {
          if (nowToMinutes >= ehtiyat) {
            prayTimeSymbol = '✓';
            if (nowToMinutes === ehtiyat) prayTimeStyle = 'shcalendar-txt-green' + this.cssThemeID;
          }
        }
        _prayColumnBox.add_child(new St.Label({
          text: NewPrayTimes.persianMap[tName],
          style_class: 'shcalendar-praytimes-tname ' + prayTimeStyle,
          x_expand: false,
        }));
        _prayColumnBox.add_child(new St.Label({
          text: prayTimeSymbol,
          style_class: 'shcalendar-praytimes-symbol ' + prayTimeStyle,
          x_expand: false,
        }));
        if (true || ++i % 2 === 0) {
          _prayBox_v.add_child(_prayColumnBox);
          _prayColumnBox = new St.BoxLayout({ x_expand: false });
        }
      }


      _scrollBox.add_child(_prayBox_v);

      {
        // const persianDate = nowObj.persian;
        // const iranTZO = (
        //   persianDate[1] > 6 ||
        //   (persianDate[1] === 6 && persianDate[2] === 31) ||
        //   (persianDate[1] === 1 && persianDate[2] === 1)
        // ) ? -210 : -270;
        const iranTZO = -210; // from Year: 1402
        if ((new Date().getTimezoneOffset()) !== iranTZO) {
          _prayBox_v.add_child(new St.Label({
            text: 'منطقه‌زمانی سیستم، ایران نیست!',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            style: 'text-align: right; color: #a22'
          }));
        }
      }

    } else if (this._selectedTab === 'dateConvert') {
      let _eventsBox = new St.BoxLayout();
      _scrollBox.add_child(_eventsBox);

      {
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
          style_class: 'shcalendar-converter-entry shcalendar-converter-entry' + this.cssThemeID
        });
        let converterMonth = new St.Entry({
          name: 'month',
          hint_text: 'ماه',
          can_focus: true,
          x_expand: true,
          style_class: 'shcalendar-converter-entry shcalendar-converter-entry' + this.cssThemeID
        });
        let converterDay = new St.Entry({
          name: 'day',
          hint_text: 'روز',
          can_focus: true,
          x_expand: true,
          style_class: 'shcalendar-converter-entry shcalendar-converter-entry' + this.cssThemeID
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
              style_class: 'shcalendar-date-label' + this.cssThemeID
            });
            convertedDatesVbox.add_child(button);
            return;
          }

          // add persian date
          if (_activeConverter !== ConverterTypes.fromPersian) {
            let button = new St.Button({
              label: Str.numbersFormat(
                Str.dateStrFormat(
                  this.schema.get_string('persian-display-format'),
                  cDateObj.persianDay,
                  cDateObj.persianMonth,
                  cDateObj.persianYear,
                  cDateObj.dayOfWeek,
                  'persian'
                )
              ) + ' هجری شمسی',
              x_expand: true,
              style_class: 'shcalendar-date-label' + this.cssThemeID + ' shcalendar-rtl'
            });
            convertedDatesVbox.add_child(button);
            button.connect('clicked', () => {
              St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, _mainLable)
            });
          }

          // add islamic date
          if (_activeConverter !== ConverterTypes.fromIslamic) {
            let button = new St.Button({
              label: Str.numbersFormat(
                Str.dateStrFormat(
                  this.schema.get_string('islamic-display-format'),
                  cDateObj.islamicDay,
                  cDateObj.islamicMonth,
                  cDateObj.islamicYear,
                  cDateObj.dayOfWeek,
                  'islamic'
                )
              ) + ' هجری قمری',
              x_expand: true,
              style_class: 'shcalendar-date-label' + this.cssThemeID + ' shcalendar-rtl'
            });
            convertedDatesVbox.add_child(button);
            button.connect('clicked', () => {
              St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, _mainLable)
            });
          }

          // add gregorian date
          if (_activeConverter !== ConverterTypes.fromGregorian) {
            let button = new St.Button({
              label: (
                Str.dateStrFormat(
                  this.schema.get_string('gregorian-display-format'),
                  cDateObj.gregorianDay,
                  cDateObj.gregorianMonth,
                  cDateObj.gregorianYear,
                  cDateObj.dayOfWeek,
                  'gregorian'
                )
              ) + ' میلادی',
              x_expand: true,
              style_class: 'shcalendar-date-label' + this.cssThemeID + ' shcalendar-ltr'
            });
            convertedDatesVbox.add_child(button);
            button.connect('clicked', () => {
              St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, _mainLable)
            });
          }

          if (this._selectedDateObj.julianDay !== cDateObj.julianDay) {
            let btn = new St.Button({ label: 'رفتن تقویم به این تاریخ ↑', style_class: 'shcalendar-custom-btn shcalendar-custom-btn' + this.cssThemeID });
            btn.connect('clicked', () => {
              this._selectedDateObj.julianDay = cDateObj.julianDay;
              this._update();
            });
            convertedDatesVbox.add_child(btn);
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

        converterYear.clutter_text.connect('text-changed', () => _onModifyConverter());
        converterMonth.clutter_text.connect('text-changed', () => _onModifyConverter());
        converterDay.clutter_text.connect('text-changed', () => _onModifyConverter());

        let converterVbox = new St.BoxLayout({ style_class: 'shcalendar-font', vertical: true, x_expand: true });

        let middleBox = new St.BoxLayout({ style_class: 'shcalendar-converter-box', x_expand: true });

        _activeConverter = ConverterTypes.fromPersian;

        let fromPersian = new St.Button({
          reactive: true,
          can_focus: true,
          track_hover: true,
          x_expand: true,
          label: 'از هـ.شمسی',
          accessible_name: 'fromPersian',
          style_class: 'shcalendar-converter-button shcalendar-converter-button' + this.cssThemeID + ' fromPersian active'
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
          style_class: 'shcalendar-converter-button shcalendar-converter-button' + this.cssThemeID
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
          style_class: 'shcalendar-converter-button shcalendar-converter-button' + this.cssThemeID + ' fromGregorian'
        });
        fromGregorian.connect('clicked', _toggleConverter);
        fromGregorian.TypeID = ConverterTypes.fromGregorian;

        middleBox.add_child(fromGregorian);// Left
        middleBox.add_child(fromIslamic);// Center
        middleBox.add_child(fromPersian);// Right

        converterVbox.add_child(middleBox);

        let converterHbox = new St.BoxLayout({ style_class: 'shcalendar-converter-box' });

        converterHbox.add_child(converterYear);

        converterHbox.add_child(converterMonth);

        converterHbox.add_child(converterDay);

        converterVbox.add_child(converterHbox);

        converterVbox.add_child(convertedDatesVbox);



        _eventsBox.add_child(converterVbox);
      }

    }

    /*
        if (player !== null && player.isPlaying()) {
          let btn = new St.Button({ label: 'توقف پخش صدا', style_class: 'shcalendar-praytimes-azan shcalendar-praytimes-azan' + this.cssThemeID });
          btn.connect('clicked', () => {
            player.pause();
            this._update();
          });
          this.actorLeft.layout_manager.attach(btn, 0, ++evTopPosition, 1, 1);
        }
    */

  }

  _rotate = (a, b, x, y, Schema) => {
    return (Schema.get_boolean('rotaton-to-vertical')) ? [7 - b, 8 - a + 1, y, x] : [a, b, x, y];
  }

  _colPosition = (rtl, Schema) => {
    return ((
      Schema.get_boolean('reverse-direction') && rtl ||
      !Schema.get_boolean('reverse-direction') && !rtl
    ) ? 6 : 0);
  }

}
