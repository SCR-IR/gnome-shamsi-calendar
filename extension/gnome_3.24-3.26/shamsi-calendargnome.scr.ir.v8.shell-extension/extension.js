const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const MainLoop = imports.mainloop;
const Lang = imports.lang;
const MessageTray = imports.ui.messageTray;
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;

const Gettext = imports.gettext.domain('shamsi-calendar');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const extension = ExtensionUtils.getCurrentExtension();
const convenience = extension.imports.convenience;

const PersianDate = extension.imports.PersianDate;
const Tarikh = extension.imports.Tarikh;
const Calendar = extension.imports.calendar;
const PrayTimes = extension.imports.PrayTimes.prayTimes;

const Events = extension.imports.Events;
const str = extension.imports.strFunctions;

const Schema = convenience.getSettings('org.gnome.shell.extensions.shamsi-calendar');
const ConverterTypes = {
  fromPersian: 0,
  fromGregorian: 1,
  fromIslamic: 2
};

let _mainLable, _indicator, _timer, messageTray;
let _prayTimeIs = '';

function _labelSchemaName(events1 = null) {
  let dateObj = new Tarikh.TarikhObject();
  if (events1 === null) events1 = new Events.Events().getEvents(dateObj.all)[1];
  return (events1) ? 'holiday-color' : 'not-holiday-color';
}

const ShamsiCalendar = new Lang.Class({
  Name: 'ShamsiCalendar.ShamsiCalendar',
  Extends: PanelMenu.Button,

  _init: function () {
    messageTray = new MessageTray.MessageTray({ style_class: 'pcalendar-system-tray pcalendar-font' });
    this.parent(0.0);
    _mainLable = new St.Label({
      style_class: 'pcalendar-font',
      y_expand: true,
      y_align: Clutter.ActorAlign.CENTER
    });

    if (typeof this.add_actor === 'function') {
      this.add_actor(_mainLable);//Gnome-Shell >= 3.38
    } else {
      this.actor.add_actor(_mainLable);//Gnome-Shell <= 3.36
    }

    // some codes for coloring label
    if (Schema.get_boolean('custom-color')) {
      _mainLable.set_style('color: ' + Schema.get_string(_labelSchemaName()));
    }

    let dateObj = new Tarikh.TarikhObject();
    let isHoliday = new Events.Events().getEvents(dateObj.all)[1];
    let that = this;
    this.schema_not_holiday_color_change_signal = Schema.connect('changed::not-holiday-color', Lang.bind(
      that, function () {
        if (Schema.get_boolean('custom-color') && !isHoliday) {
          _mainLable.set_style('color: ' + Schema.get_string('not-holiday-color'));
        }
      }
    ));
    this.schema_holiday_color_change_signal = Schema.connect('changed::holiday-color', Lang.bind(
      that, function () {
        if (Schema.get_boolean('custom-color') && isHoliday) {
          _mainLable.set_style('color: ' + Schema.get_string('holiday-color'));
        }
      }
    ));

    this.schema_custom_color_signal = Schema.connect('changed::custom-color', Lang.bind(
      that, function () {
        if (Schema.get_boolean('custom-color')) {
          _mainLable.set_style('color: ' + Schema.get_string(_labelSchemaName()));
        } else {
          _mainLable.set_style('');
        }
      }
    ));

    this.schema_widget_format_signal = Schema.connect('changed::widget-format', Lang.bind(
      that, function () {
        this._updateDate(true, true)
      }
    ));


    this.schema_position_signal = Schema.connect('changed::position', Lang.bind(
      that, function () {
        disable();
        enable();
      }
    ));

    // /////////////////////////////
    // // some codes for fonts
    // let font = Schema.get_string('font').split(' ');
    // font.pop(); // remove size
    // font = font.join(' ');
    // if (Schema.get_boolean('custom-font')) {
    //   _mainLable.set_style('font-family: ' + font);
    // }
    // Schema.connect('changed::font', Lang.bind(
    //   this, function (schema, key) {
    //     if (Schema.get_boolean('custom-font')) {
    //       let font = Schema.get_string('font').split(' ');
    //       font.pop(); // remove size
    //       font = font.join(' ');
    //       _mainLable.set_style('font-family: ' + font);
    //     }
    //   }
    // ));
    // Schema.connect('changed::custom-font', Lang.bind(
    //   this, function (schema, key) {
    //     if (Schema.get_boolean('custom-font')) {
    //       let font = Schema.get_string('font').split(' ');
    //       font.pop(); // remove size
    //       font = font.join(' ');
    //       _mainLable.set_style('font-family: ' + font);
    //     } else {
    //       _mainLable.set_style('font-family: ');
    //     }
    //   }
    // ));
    // /////////////////////////////

    this._todayJD = '';

    let vbox = new St.BoxLayout({ vertical: true, style_class: '-pcalendar pcalendar-font' });
    let calendar = new PopupMenu.PopupBaseMenuItem({
      activate: false,
      hover: false,
      can_focus: false,
      style_class: '-pcalendar pcalendar-font'
    });
    calendar.actor.add_child(vbox);

    this.menu.addMenuItem(calendar);

    this._calendar = new Calendar.Calendar();
    vbox.add_actor(this._calendar.actor);

    this._calendar.actor.add_style_class_name('pcalendar pcalendar-font');

    this._generateConverterPart();

    // action buttons
    let actionButtons = new PopupMenu.PopupBaseMenuItem({
      reactive: false,
      can_focus: false,
      style_class: 'pcalendar pcalendar-font pcalendar-bottom-menu'
    });
    this.menu.addMenuItem(actionButtons);



    // Add preferences button
    let icon = new St.Icon({
      icon_name: 'emblem-system-symbolic',
      style_class: 'popup-menu-icon calendar-popup-menu-icon pcalendar-preferences-button-icon'
    });

    let preferencesIcon = new St.Button({
      child: icon,
      reactive: true,
      can_focus: true,
      style_class: 'system-menu-action pcalendar-preferences-button'
    });
    preferencesIcon.connect('clicked', openExtensionSetting);

    actionButtons.actor.add(preferencesIcon);






    let icon3 = new St.Icon({
      icon_name: 'view-refresh-symbolic',
      style_class: 'popup-menu-icon calendar-popup-menu-icon pcalendar-preferences-button-icon'
    });
    let todayIcon = new St.Button({
      child: icon3,
      reactive: true,
      can_focus: true,
      // x_expand: true,
      // expand: true, x_fill: false,
      style_class: 'system-menu-action pcalendar-preferences-button'
    });
    todayIcon.connect('clicked', function () {
      that._calendar._selectedDateObj.setNow();
      that._calendar._update();
    });
    actionButtons.actor.add(todayIcon/*, { expand: true, x_fill: false }*/);





    // Add Nowrooz button
    icon = new St.Icon({
      icon_name: 'emblem-favorite-symbolic',
      style_class: 'popup-menu-icon calendar-popup-menu-icon pcalendar-preferences-button-icon'
    });

    let nowroozIcon = new St.Button({
      child: icon,
      reactive: true,
      can_focus: true,
      // x_expand: true,
      // expand: true, x_fill: false,
      style_class: 'system-menu-action pcalendar-preferences-button'
    });
    nowroozIcon.connect('clicked', function () {
      /* calculate exact hour/minute/second of the next new year.
       it calculate with some small differences!*/

      let month_delta = 12 - dateObj.persianMonth;
      let day_delta, nowrooz = '';
      if (month_delta >= 6) {
        day_delta = 31 - dateObj.persianDay;
      } else {
        day_delta = 30 - dateObj.persianDay;
      }

      if (dateObj.persianMonth !== 12) nowrooz += month_delta + ' ماه و ';

      if (day_delta !== 0) {
        nowrooz += day_delta + ' روز مانده به ';
        nowrooz += 'نوروز سال ' + (dateObj.persianYear + 1);
      }

      notify(str.numbersFormat(nowrooz) + (day_delta < 7 ? ' * ' : ''));
    });
    actionButtons.actor.add(nowroozIcon/*, { expand: true, x_fill: false }*/);

    this.menu.connect('open-state-changed', Lang.bind(that, function (menu, isOpen) {
      if (isOpen) {
        that._calendar._selectedDateObj.setNow();
        that._calendar._update();
      }
    }));

    this._prayerTimeLoop();
  },

  _updateDate: function (skip_notification, force) {
    let _dateObj = new Tarikh.TarikhObject();

    // if today is "today" just return, don't change anything!
    if (!force && this._todayJD === _dateObj.julianDay) return true;

    // set todayJulianDay as "today"
    this._todayJD = _dateObj.julianDay;

    // set indicator label and popupmenu

    let events = new Events.Events().getEvents(_dateObj.all, 150);
    if (Schema.get_boolean('custom-color')) {
      // _mainLable.set_style(null);
      _mainLable.set_style('color: ' + Schema.get_string(_labelSchemaName(events[1])));
    }

    _mainLable.set_text(
      str.numbersFormat(
        str.dateStrFormat(
          Schema.get_string('widget-format'),
          _dateObj.persianDay,
          _dateObj.persianMonth,
          _dateObj.persianYear,
          _dateObj.dayOfWeek,
          'persian'
        )
      )
    );

    if (!skip_notification) {
      let notifyTxt = "";
      for (let evObj of events[0]) {
        notifyTxt += str.numbersFormat(evObj.symbol + ' ' + evObj.event + ((evObj.holiday) ? ' (تعطیل)' : '') + '\n');
      }
      notify(
        str.numbersFormat(
          _dateObj.persianDay + ' ' +
          PersianDate.PersianDate.p_month_names[_dateObj.persianMonth - 1] +
          ' ' + _dateObj.persianYear
        ),
        notifyTxt
      );
    }

    return true;
  },

  _prayerTimeLoop: function () {
    if (_prayTimeIs !== '') {
      _prayTimeIs = '';
      if (Schema.get_boolean('custom-color')) {
        _mainLable.set_style('color: ' + Schema.get_string(_labelSchemaName()));
      }
    }
    if (this._prayerTimeout) {
      MainLoop.source_remove(this._prayerTimeout);
      this._prayerTimeout = null;
    }
    this._prayerTimeout = MainLoop.timeout_add(60000 - (new Date().getSeconds() * 1000), Lang.bind(this, this._prayerTimeLoop));
    checkPrayTime();
  },

  _generateConverterPart: function () {
    // Add date conversion button
    let converterMenu = new PopupMenu.PopupSubMenuMenuItem('تبدیل تاریخ');
    converterMenu.actor.set_text_direction(Clutter.TextDirection.RTL);
    converterMenu.actor.add_style_class_name('pcalendar pcalendar-font pcalendar-converter-menu');

    this.menu.addMenuItem(converterMenu);
    this.converterVbox = new St.BoxLayout({ style_class: 'pcalendar pcalendar-font', vertical: true, x_expand: true });
    let converterSubMenu = new PopupMenu.PopupBaseMenuItem({
      reactive: false,
      can_focus: false
    });
    converterSubMenu.actor.add_child(this.converterVbox);
    converterMenu.menu.addMenuItem(converterSubMenu);

    let middleBox = new St.BoxLayout({ style_class: 'pcalendar pcalendar-converter-box', x_expand: true });

    this._activeConverter = ConverterTypes.fromPersian;

    let fromPersian = new St.Button({
      reactive: true,
      can_focus: true,
      track_hover: true,
      x_expand: true,
      label: 'از هـ.شمسی',
      accessible_name: 'fromPersian',
      style_class: 'popup-menu-item button pcalendar-button fromPersian active'
    });
    fromPersian.connect('clicked', Lang.bind(this, this._toggleConverter));
    fromPersian.TypeID = ConverterTypes.fromPersian;

    let fromGregorian = new St.Button({
      reactive: true,
      can_focus: true,
      track_hover: true,
      x_expand: true,
      label: 'از میلادی',
      accessible_name: 'fromGregorian',
      style_class: 'popup-menu-item button pcalendar-button fromGregorian'
    });
    fromGregorian.connect('clicked', Lang.bind(this, this._toggleConverter));
    fromGregorian.TypeID = ConverterTypes.fromGregorian;

    let fromIslamic = new St.Button({
      reactive: true,
      can_focus: true,
      track_hover: true,
      x_expand: true,
      label: 'از هـ.قمری',
      accessible_name: 'fromIslamic',
      style_class: 'popup-menu-item button pcalendar-button fromIslamic'
    });
    fromIslamic.connect('clicked', Lang.bind(this, this._toggleConverter));
    fromIslamic.TypeID = ConverterTypes.fromIslamic;

    middleBox.add(fromIslamic);
    middleBox.add(fromGregorian);
    middleBox.add(fromPersian);

    this.converterVbox.add(middleBox);

    let converterHbox = new St.BoxLayout({ style_class: 'pcalendar pcalendar-converter-box' });

    this.converterYear = new St.Entry({
      name: 'year',
      hint_text: 'سال',
      can_focus: true,
      x_expand: true,
      style_class: 'pcalendar-converter-entry'
    });
    this.converterYear.clutter_text.connect('text-changed', Lang.bind(this, this._onModifyConverter));
    converterHbox.add(this.converterYear/*, { expand: true }*/);

    this.converterMonth = new St.Entry({
      name: 'month',
      hint_text: 'ماه',
      can_focus: true,
      x_expand: true,
      style_class: 'pcalendar-converter-entry'
    });
    converterHbox.add(this.converterMonth/*, { expand: true }*/);
    this.converterMonth.clutter_text.connect('text-changed', Lang.bind(this, this._onModifyConverter));

    this.converterDay = new St.Entry({
      name: 'day',
      hint_text: 'روز',
      can_focus: true,
      x_expand: true,
      style_class: 'pcalendar-converter-entry'
    });
    converterHbox.add(this.converterDay/*, { expand: true }*/);
    this.converterDay.clutter_text.connect('text-changed', Lang.bind(this, this._onModifyConverter));

    this.converterVbox.add(converterHbox);

    this.convertedDatesVbox = new St.BoxLayout({ vertical: true });
    this.converterVbox.add(this.convertedDatesVbox);
  },

  _onModifyConverter: function () {
    // erase old date
    let convertedDatesChildren = this.convertedDatesVbox.get_children();
    for (let i = 0; i < convertedDatesChildren.length; i++) {
      convertedDatesChildren[i].destroy();
    }

    let year = this.converterYear.get_text();
    let month = this.converterMonth.get_text();
    let day = this.converterDay.get_text();

    // check if data is numerical and not empty
    if (!day || !month || !year) return;

    [year, month, day] = [parseInt(year), parseInt(month), parseInt(day)];

    let cDateObj = new Tarikh.TarikhObject();
    let checkInputDate = false;

    switch (this._activeConverter) {
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
      this.convertedDatesVbox.add(button);
      return;
    }

    // add persian date
    if (this._activeConverter !== ConverterTypes.fromPersian) {
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
        // x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        // x_fill: true,
        style_class: 'pcalendar-day pcalendar-date-label'
      });
      this.convertedDatesVbox.add(button/*, { expand: true, x_fill: true, x_align: St.Align.MIDDLE }*/);
      button.connect('clicked', Lang.bind(button, function () {
        St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, _mainLable)
      }));
    }

    // add islamic date
    if (this._activeConverter !== ConverterTypes.fromIslamic) {
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
        // x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        // x_fill: true,
        style_class: 'pcalendar-day pcalendar-date-label'
      });
      this.convertedDatesVbox.add(button/*, { expand: true, x_fill: true, x_align: St.Align.MIDDLE }*/);
      button.connect('clicked', Lang.bind(button, function () {
        St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, _mainLable)
      }));
    }

    // add gregorian date
    if (this._activeConverter !== ConverterTypes.fromGregorian) {
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
        // x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        // x_fill: true,
        style_class: 'pcalendar-day pcalendar-date-label'
      });
      this.convertedDatesVbox.add(button/*, { expand: true, x_fill: true, x_align: St.Align.MIDDLE }*/);
      button.connect('clicked', Lang.bind(button, function () {
        St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, _mainLable)
      }));
    }

  },

  _toggleConverter: function (button) {
    // skip because it is already active
    if (this._activeConverter === button.TypeID) {
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
    this._activeConverter = button.TypeID;

    this._onModifyConverter()
  }
});

function notify(msg, details) {
  let source = new MessageTray.SystemNotificationSource();
  messageTray.add(source);
  let notification = new MessageTray.Notification(source, msg, details);
  notification.setTransient(true);
  source.notify(notification);
}

function init(metadata) {
}

function enable() {
  _indicator = new ShamsiCalendar();

  let positions = ['left', 'center', 'right'];
  let indexes = ['99999', '99999', '0'];

  Main.panel.addToStatusArea(
    'shamsi_calendar',
    _indicator,
    indexes[Schema.get_enum('position')],
    positions[Schema.get_enum('position')]
  );
  _indicator._updateDate(!Schema.get_boolean('startup-notification'));
  _timer = MainLoop.timeout_add(5000, Lang.bind(_indicator, _indicator._updateDate));

  // install fonts
  let path = extension.dir.get_path();
  GLib.spawn_sync(
    null,
    ['/bin/bash', path + '/bin/install_fonts.sh', path],
    null,
    GLib.SpawnFlags.DEFAULT,
    null
  );
}

function disable() {
  Schema.disconnect(_indicator.schema_not_holiday_color_change_signal);
  Schema.disconnect(_indicator.schema_holiday_color_change_signal);
  Schema.disconnect(_indicator.schema_custom_color_signal);
  Schema.disconnect(_indicator.schema_widget_format_signal);
  Schema.disconnect(_indicator.schema_position_signal);
  _indicator.destroy();
  MainLoop.source_remove(_timer);
}

function openExtensionSetting() {
  if (typeof ExtensionUtils.openPrefs === 'function') {
    ExtensionUtils.openPrefs();
  } else {
    let appSys = Shell.AppSystem.get_default();
    let app = appSys.lookup_app('gnome-shell-extension-prefs.desktop');
    let info = app.get_app_info();
    let timestamp = global.display.get_current_time_roundtrip();
    info.launch_uris(
      ['extension:///' + extension.metadata.uuid],
      global.create_app_launch_context(timestamp, -1)
    );
  }
}

function getPrayTimeSetting(tName) {
  // Schema Times Setting value="ShowTime,TextNotify,PlaySound,CalcMethod,SoundId"
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

function checkPrayTime() {
  let now = new Date();
  if (now.getSeconds() >= 3 || !Schema.get_boolean('praytime-play-and-notify')) return;






  let _prayTimes = {};
  {
    let coords = [Schema.get_double('praytime-lat'), Schema.get_double('praytime-lng')];
    let PT = PrayTimes;
    PT.setMethod(Schema.get_string('praytime-calc-method-main'));
    _prayTimes['main'] = PT.getTimes(now, coords);
    PT.setMethod(Schema.get_string('praytime-calc-method-ehtiyat'));
    _prayTimes['ehtiyat'] = PT.getTimes(now, coords);
  }

  let nowHM;
  {
    let [H, M] = [now.getHours(), now.getMinutes()];
    if (H < 10) H = "0" + H;
    if (M < 10) M = "0" + M;
    nowHM = "" + H + ':' + M;
  }

  for (let tName in PrayTimes.persianMap) {
    const settings = getPrayTimeSetting(tName);
    let timeStr;
    if (settings.CalcMethod === 'main') {// 'main' method:
      timeStr = _prayTimes['main'][tName];
    } else {// 'ehtiyat' method:
      const methodsTime = [
        timeStrToMinutes(_prayTimes['main'][tName]),
        timeStrToMinutes(_prayTimes['ehtiyat'][tName])
      ];
      const timeMinutes = (
        tName === 'imsak' ||
        tName === 'sunrise' ||
        tName === 'sunset' ||
        tName === 'midnight'
      ) ? Math.min(...methodsTime) : Math.max(...methodsTime);
      timeStr = (timeMinutes === methodsTime[0]) ? _prayTimes['main'][tName] : _prayTimes['ehtiyat'][tName];
    }

    // Schema Times Setting value="ShowTime,TextNotify,PlaySound,CalcMethod,SoundId"
    if (timeStr !== nowHM) continue;//now is not pray time
    if (_prayTimeIs === tName) continue;//do not repeat sound in pray time
    let islamic = Tarikh.gregorian_to_islamic(now.getFullYear(), now.getMonth() + 1, now.getDate());
    if (
      settings.TextNotify === 'always' ||
      (settings.ShowTime === 'ramazan' && islamic[1] === 9)
    ) notify(
      PrayTimes.persianMap[tName] + ' به اُفق ' + Schema.get_string('praytime-city') +
      ' / ساعت ' + str.numbersFormat(_prayTimes['main'][tName]) + (
        (_prayTimes['main'][tName] === timeStr) ?
          '' : ' _ احتیاط ' + str.numbersFormat(timeStr)
      )
    );
    if (
      settings.PlaySound === 'never' ||
      (settings.PlaySound === 'ramazan' && islamic[1] !== 9)
    ) continue;

    _prayTimeIs = tName;
    if (Schema.get_boolean('custom-color')) {
      _mainLable.set_style('color: ' + Schema.get_string('pray-time-color'));
    }

    break;
  }

}
