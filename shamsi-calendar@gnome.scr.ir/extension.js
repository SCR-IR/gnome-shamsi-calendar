const { GObject, Clutter, St } = imports.gi;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const MainLoop = imports.mainloop;
const Lang = imports.lang;
const MessageTray = imports.ui.messageTray;
const Shell = imports.gi.Shell;
// const Gettext = imports.gettext.domain('shamsi-calendar');
// const _ = Gettext.gettext;
const ExtensionUtils = imports.misc.extensionUtils;
const extension = ExtensionUtils.getCurrentExtension();
const convenience = extension.imports.convenience;

const Tarikh = extension.imports.Tarikh;
const Calendar = extension.imports.calendar;
const PrayTimes = extension.imports.PrayTimes.prayTimes;
const player = extension.imports.sound.player;

const Events = extension.imports.Events;
const str = extension.imports.strFunctions;


let _mainLable, _indicator, _timer, messageTray;
let _prayTimeIs = '';

function _labelSchemaName(events1 = null) {
  let dateObj = new Tarikh.TarikhObject();
  if (events1 === null) events1 = new Events.Events().getEvents(dateObj.all)[1];
  return (events1) ? 'holiday-color' : 'not-holiday-color';
}

const ShamsiCalendar = GObject.registerClass(
  class ShamsiCalendar extends PanelMenu.Button {

    _init() {
      this.schema = convenience.getSettings('org.gnome.shell.extensions.shamsi-calendar');
      super._init(({ left: 1.0, center: 0.5, right: 0.0 }[this.schema.get_string('window-position')])/*, 'ShamsiCalendar', false*/);
      // this.parent();
      this.themeID = '-thm' + this.schema.get_int('theme-id');

      messageTray = new MessageTray.MessageTray({ style_class: 'pcalendar-system-tray pcalendar-font' });
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
      if (this.schema.get_boolean('custom-color')) {
        _mainLable.set_style('color: ' + this.schema.get_string(_labelSchemaName()));
      }

      let dateObj = new Tarikh.TarikhObject();
      let isHoliday = new Events.Events().getEvents(dateObj.all)[1];
      let that = this;
      this.schema_not_holiday_color_change_signal = this.schema.connect('changed::not-holiday-color', Lang.bind(
        that, function () {
          if (this.schema.get_boolean('custom-color') && !isHoliday) {
            _mainLable.set_style('color: ' + this.schema.get_string('not-holiday-color'));
          }
        }
      ));
      this.schema_holiday_color_change_signal = this.schema.connect('changed::holiday-color', Lang.bind(
        that, function () {
          if (this.schema.get_boolean('custom-color') && isHoliday) {
            _mainLable.set_style('color: ' + this.schema.get_string('holiday-color'));
          }
        }
      ));

      this.schema_custom_color_signal = this.schema.connect('changed::custom-color', Lang.bind(
        that, function () {
          if (this.schema.get_boolean('custom-color')) {
            _mainLable.set_style('color: ' + this.schema.get_string(_labelSchemaName()));
          } else {
            _mainLable.set_style('');
          }
        }
      ));

      this.schema_widget_format_signal = this.schema.connect('changed::widget-format', Lang.bind(
        that, function () {
          this._updateDate(true, true)
        }
      ));

      this.schema_theme_id_signal = this.schema.connect('changed::theme-id', Lang.bind(
        that, function () {
          disable();
          enable();
        }
      ));

      this.schema_widget_position_signal = this.schema.connect('changed::widget-position', Lang.bind(
        that, function () {
          disable();
          enable();
        }
      ));

      this.schema_window_position_signal = this.schema.connect('changed::window-position', Lang.bind(
        that, function () {
          disable();
          enable();
        }
      ));

      // /////////////////////////////
      // // some codes for fonts
      // let font = this.schema.get_string('font-name').split(' ');
      // font.pop(); // remove size
      // font = font.join(' ');
      // if (this.schema.get_boolean('custom-font')) {
      //   _mainLable.set_style('font-family: ' + font);
      // }
      // this.schema.connect('changed::font', Lang.bind(
      //   this, function (schema, key) {
      //     if (this.schema.get_boolean('custom-font')) {
      //       let font = this.schema.get_string('font-name').split(' ');
      //       font.pop(); // remove size
      //       font = font.join(' ');
      //       _mainLable.set_style('font-family: ' + font);
      //     }
      //   }
      // ));
      // this.schema.connect('changed::custom-font', Lang.bind(
      //   this, function (schema, key) {
      //     if (this.schema.get_boolean('custom-font')) {
      //       let font = this.schema.get_string('font-name').split(' ');
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

      let vbox = new St.BoxLayout({ vertical: true, style_class: 'pcalendar-font' });
      let calendar = new PopupMenu.PopupBaseMenuItem({
        activate: false,
        hover: false,
        can_focus: false,
        style_class: 'pcalendar-font'
      });
      calendar.actor.add_child(vbox);

      this.menu.addMenuItem(calendar);

      this._calendar = new Calendar.Calendar(this.schema);
      vbox.add_actor(this._calendar.actor);

      this._calendar.actor.add_style_class_name('pcalendar pcalendar' + this.themeID + ' pcalendar-font');

      let actionButtons = new St.BoxLayout({
        vertical: false,
        style_class: 'pcalendar pcalendar' + this.themeID + ' pcalendar-font pcalendar-bottom-menu pcalendar-bottom-menu' + this.themeID
      });
      vbox.add_actor(actionButtons);



      // Add preferences button
      let icon = new St.Icon({
        icon_name: 'emblem-system-symbolic',
        icon_size: 25,
        style: 'color: #3af'
      });
      let preferencesIcon = new St.Button({
        child: icon,
        reactive: true,
        can_focus: true,
        style_class: 'pcalendar-options-button pcalendar-options-button' + this.themeID
      });
      preferencesIcon.connect('clicked', openExtensionSetting);
      actionButtons.add(preferencesIcon);





      // Add Nowrooz button
      icon = new St.Icon({
        icon_name: 'emblem-favorite-symbolic',
        icon_size: 25,
        style: 'color: #c55'
      });

      let nowroozIcon = new St.Button({
        child: icon,
        reactive: true,
        can_focus: true,
        style_class: 'pcalendar-options-button pcalendar-options-button' + this.themeID
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
      actionButtons.add(nowroozIcon);
      // actionButtons.actor.add(nowroozIcon);






      let icon4 = new St.Icon({
        icon_name: 'preferences-desktop-theme',
        icon_size: 25,
        style: 'color: #c60'
      });
      let themeIcon = new St.Button({
        child: icon4,
        reactive: true,
        can_focus: true,
        style_class: 'pcalendar-options-button pcalendar-options-button' + this.themeID
      });
      themeIcon.connect('clicked', () => {
        this.schema.set_int('theme-id', (this.themeID === '-thm0') ? 1 : 0);
      });
      actionButtons.add(themeIcon);





      let icon3 = new St.Icon({
        icon_name: 'view-refresh-symbolic',
        icon_size: 25,
        style: 'color: #0c9'
      });
      let todayIcon = new St.Button({
        child: icon3,
        reactive: true,
        can_focus: true,
        style_class: 'pcalendar-options-button pcalendar-options-button' + this.themeID
      });
      todayIcon.connect('clicked', function () {
        that._calendar._selectedDateObj.setNow();
        that._calendar._update();
      });
      actionButtons.add(todayIcon);





      this.menu.connect('open-state-changed', Lang.bind(that, function (menu, isOpen) {
        if (isOpen) {
          that._calendar._selectedDateObj.setNow();
          that._calendar._update();
        }
      }));

      this._prayerTimeLoop();
    }

    _updateDate(skip_notification = false, force = false) {
      let _dateObj = new Tarikh.TarikhObject();

      // if today is "today" just return, don't change anything!
      if (!force && this._todayJD === _dateObj.julianDay) return true;

      // set todayJulianDay as "today"
      this._todayJD = _dateObj.julianDay;

      // set indicator label and popupmenu

      let events = new Events.Events().getEvents(_dateObj.all, 150);
      if (this.schema.get_boolean('custom-color')) {
        _mainLable.set_style('color: ' + this.schema.get_string(_labelSchemaName(events[1])));
      }

      _mainLable.set_text(
        str.numbersFormat(
          str.dateStrFormat(
            this.schema.get_string('widget-format'),
            _dateObj.persianDay,
            _dateObj.persianMonth,
            _dateObj.persianYear,
            _dateObj.dayOfWeek,
            'persian'
          )
        )
      );

      if (skip_notification) {
        let notifyTxt = "";
        for (let evObj of events[0]) {
          notifyTxt += str.numbersFormat(evObj.symbol + ' ' + evObj.event + ((evObj.holiday) ? ' (تعطیل)' : '') + '\n');
        }
        notify(
          str.numbersFormat(
            _dateObj.persianDay + ' ' +
            Tarikh.mName.shamsi[_dateObj.persianMonth] +
            ' ' + _dateObj.persianYear
          ),
          notifyTxt
        );
      }

      return true;
    }

    _prayerTimeLoop() {
      this._prayerTimeout = MainLoop.timeout_add(
        60000 - (new Date().getSeconds() * 1000),
        Lang.bind(this, this._prayerTimeLoop)
      );
      this.checkPrayTime();
    }

    getPrayTimeSetting(tName) {
      // Schema Times Setting value="ShowTime,TextNotify,PlaySound,CalcMethod,SoundId"
      const [
        ShowTime,
        TextNotify,
        PlaySound,
        CalcMethod,
        SoundId
      ] = this.schema.get_string('praytime-' + tName + '-setting').split(',');
      return {
        ShowTime,
        TextNotify,
        PlaySound,
        CalcMethod,
        SoundId
      };
    }

    checkPrayTime() {
      let now = new Date();
      if (now.getSeconds() !== 0 || !this.schema.get_boolean('praytime-play-and-notify')) return;

      let _prayTimes = {};
      {
        let coords = [this.schema.get_double('praytime-lat'), this.schema.get_double('praytime-lng')];
        let PT = PrayTimes;
        PT.setMethod(this.schema.get_string('praytime-calc-method-main'));
        _prayTimes['main'] = PT.getTimes(now, coords);
        PT.setMethod(this.schema.get_string('praytime-calc-method-ehtiyat'));
        _prayTimes['ehtiyat'] = PT.getTimes(now, coords);
      }

      let nowHM;
      {
        let [H, M] = [now.getHours(), now.getMinutes()];
        if (H < 10) H = "0" + H;
        if (M < 10) M = "0" + M;
        nowHM = "" + H + ':' + M;
      }

      let _prayTimeIs_nextValue = '';
      for (let tName in PrayTimes.persianMap) {
        const settings = this.getPrayTimeSetting(tName);
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



        if (timeStr !== nowHM) {// now: is_not pray_time
          continue;// Exit
        }

        _prayTimeIs_nextValue = tName;// now: is pray_time

        if (_prayTimeIs === tName) {// now: is pray_time, But play_or_show is run
          continue;// Exit: do not repeat sound_or_notify in pray_time
        }

        // now: is pray_time and play_or_show is not run



        let islamic = Tarikh.gregorian_to_islamic(now.getFullYear(), now.getMonth() + 1, now.getDate());
        // Schema Times Setting value="ShowTime,TextNotify,PlaySound,CalcMethod,SoundId"
        if (
          settings.TextNotify === 'always' ||
          (settings.ShowTime === 'ramazan' && islamic[1] === 9)
        ) notify(
          PrayTimes.persianMap[tName] + ' به اُفق ' + this.schema.get_string('praytime-city') +
          ' / ساعت ' + str.numbersFormat(_prayTimes['main'][tName]) + (
            (_prayTimes['main'][tName] === timeStr) ?
              '' : ' _ احتیاط ' + str.numbersFormat(timeStr)
          )
        );
        if (
          settings.PlaySound === 'never' ||
          (settings.PlaySound === 'ramazan' && islamic[1] !== 9)
        ) continue;
        if (settings.SoundId === '_custom_') {
          settings.SoundUri = this.schema.get_string('praytime-' + tName + '-sound-uri');
        } else {
          settings.SoundUri = '.local/share/gnome-shell/extensions/' + extension.metadata.uuid + '/' + extension.imports.sound.soundsDir + '/' + extension.imports.sound.sounds[settings.SoundId][1];
        }

        if (player !== null) {
          player.setVolume(this.schema.get_double('praytime-play-valume'));
          player.setUri(settings.SoundUri);
          player.play();
        }
        if (this.schema.get_boolean('custom-color')) {
          _mainLable.set_style('color: ' + this.schema.get_string('pray-time-color'));
        }

        break;
      }

      _prayTimeIs = _prayTimeIs_nextValue;

      if (_prayTimeIs === '' && (player !== null && !player.isPlaying())) {
        if (this.schema.get_boolean('custom-color')) {
          _mainLable.set_style('color: ' + this.schema.get_string(_labelSchemaName()));
        }
      }


    }

  });

function notify(msg, details = '', icon = 'x-office-calendar') {
  let source = new MessageTray.Source('تقویم', icon);
  Main.messageTray.add(source);
  let notification = new MessageTray.Notification(source, msg, details);
  notification.setTransient(true);
  if (typeof (source.showNotification) === "function") {
    source.showNotification(notification);// new method
  } else {
    source.notify(notification);// old method
  }
}

function init(metadata) {
}

function enable() {
  _prayTimeIs = '';
  if (player !== null && player.isPlaying()) player.pause();

  _indicator = new ShamsiCalendar();
  // _indicator.positions
  let positions = { 'left': '99999', 'center': '99999', 'right': '0' };
  Main.panel.addToStatusArea(
    'shamsi_calendar',
    _indicator,
    positions[_indicator.schema.get_string('widget-position')],
    _indicator.schema.get_string('widget-position')
  );
  _indicator._updateDate(_indicator.schema.get_boolean('startup-notification'), true);
  _timer = MainLoop.timeout_add(
    5000,
    Lang.bind(_indicator, _indicator._updateDate)
  );


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
  _prayTimeIs = '';
  if (player !== null && player.isPlaying()) player.pause();

  _indicator.schema.disconnect(_indicator.schema_not_holiday_color_change_signal);
  _indicator.schema.disconnect(_indicator.schema_holiday_color_change_signal);
  _indicator.schema.disconnect(_indicator.schema_custom_color_signal);
  _indicator.schema.disconnect(_indicator.schema_widget_format_signal);
  _indicator.schema.disconnect(_indicator.schema_theme_id_signal);
  _indicator.schema.disconnect(_indicator.schema_widget_position_signal);
  _indicator.schema.disconnect(_indicator.schema_window_position_signal);
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

function timeStrToMinutes(timeStr) {
  let [hour, min] = timeStr.split(':');
  hour = parseInt(hour);
  if (hour === 0) hour = 24;
  return ((hour * 60) + parseInt(min));
}

