import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

import { Str, getPrayTimeSetting } from './otherFunctions.js';
import PrayTimes from './PrayTimes.js';
import * as Tarikh from './Tarikh.js';
import * as Calendar from './calendar.js';
import * as Events from './Events.js';
import * as tahvil from './tahvil.js';
import * as file from './file.js';
import * as sound from './sound.js';

let _mainLable, _indicator, _prayTimeIs, messageTray, _timers;

function _labelSchemaName(schema, events1 = null) {
  let dateObj = new Tarikh.TarikhObject();
  if (events1 === null) events1 = new Events.Events(dateObj, schema).getEvents()[1];
  return (events1) ? 'holiday-color' : 'not-holiday-color';
}

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {

    _init(_arg) {
      this.schema = _arg.settings;
      this.uuid = _arg.uuid;
      this.path = _arg.path;
      super._init(({ left: 1.0, center: 0.5, right: 0.0 }[this.schema.get_string('window-position')]), 'تقویم هجری شمسی'/*, false*/);
      this.NewPrayTimes = new PrayTimes();
      this._cssThemeID;
      this.interface_schema = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });//Gnome Settings for check: dark theme

      let onChangeTheme = () => {
        this._cssThemeID = '-thm' + (
          (isDarkGnomeTheme(this.interface_schema)) ?
            this.schema.get_int('dark-theme-id') : this.schema.get_int('light-theme-id')
        );
      };

      onChangeTheme();

      this.interface_schema_gnome_theme_change_signal = this.interface_schema.connect('changed', () => {
        onChangeTheme();
        _arg.restartExtension();
      });





      messageTray = new MessageTray.MessageTray({ style_class: 'shcalendar-system-tray shcalendar-font' });
      _mainLable = new St.Label({
        style_class: 'shcalendar-font',
        y_expand: true,
        y_align: Clutter.ActorAlign.CENTER
      });

      this.add_child(_mainLable);

      // some codes for coloring label
      if (this.schema.get_boolean('custom-color')) {
        _mainLable.set_style('color: ' + this.schema.get_string(_labelSchemaName(this.schema)));
      }

      let dateObj = new Tarikh.TarikhObject();
      let isHoliday = new Events.Events(dateObj, this.schema).getEvents()[1];
      let that = this;

      this.schema_all_change_signals = [
        this.schema.connect('changed::not-holiday-color', () => {
          if (this.schema.get_boolean('custom-color') && !isHoliday) {
            _mainLable.set_style('color: ' + this.schema.get_string('not-holiday-color'));
          }
        })
        ,
        this.schema.connect('changed::holiday-color', () => {
          if (this.schema.get_boolean('custom-color') && isHoliday) {
            _mainLable.set_style('color: ' + this.schema.get_string('holiday-color'));
          }
        })
        ,
        this.schema.connect('changed::custom-color', () => {
          if (this.schema.get_boolean('custom-color')) {
            _mainLable.set_style('color: ' + this.schema.get_string(_labelSchemaName(this.schema)));
          } else {
            _mainLable.set_style('');
          }
        })
        ,
        this.schema.connect('changed::widget-format', () => {
          this.updateDate(true, true);
        })
        ,
        this.schema.connect('changed::dark-theme-id', _arg.restartExtension)
        ,
        this.schema.connect('changed::light-theme-id', _arg.restartExtension)
        ,
        this.schema.connect('changed::widget-position', _arg.restartExtension)
        ,
        this.schema.connect('changed::window-position', _arg.restartExtension)
      ];

      // /////////////////////////////
      // // some codes for fonts
      // let font = this.schema.get_string('font-name').split(' ');
      // font.pop(); // remove size
      // font = font.join(' ');
      // if (this.schema.get_boolean('custom-font')) {
      //   _mainLable.set_style('font-family: ' + font);
      // }
      // this.schema_all_change_signals.push(this.schema.connect('changed::font', (schema, key) => {
      //   if (this.schema.get_boolean('custom-font')) {
      //     let font = this.schema.get_string('font-name').split(' ');
      //     font.pop(); // remove size
      //     font = font.join(' ');
      //     _mainLable.set_style('font-family: ' + font);
      //   }
      // }
      // ));
      // this.schema_all_change_signals.push(this.schema.connect('changed::custom-font', (schema, key) => {
      //   if (this.schema.get_boolean('custom-font')) {
      //     let font = this.schema.get_string('font-name').split(' ');
      //     font.pop(); // remove size
      //     font = font.join(' ');
      //     _mainLable.set_style('font-family: ' + font);
      //   } else {
      //     _mainLable.set_style('font-family: ');
      //   }
      // }
      // ));
      // /////////////////////////////

      let bottomBarLabel = new St.Label({
        text: '',
        x_align: Clutter.ActorAlign.END,
        y_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        style_class: 'shcalendar-month-heading shcalendar-month-heading' + this._cssThemeID + ' shcalendar-txt-orange' + this._cssThemeID
      });

      this._todayJD = '';

      let vbox = new St.BoxLayout({ vertical: true, style_class: 'shcalendar-font' });
      let calendar = new PopupMenu.PopupBaseMenuItem({
        activate: false,
        hover: false,
        can_focus: false,
        style_class: 'shcalendar shcalendar-font'
      });
      calendar.actor.add_child(vbox);

      this.menu.addMenuItem(calendar);


      this._calendar = new Calendar.Calendar(this.schema, this._cssThemeID, (text = '') => { bottomBarLabel.set_text(text); });
      vbox.add_child(this._calendar.actor);

      let actionButtons = new St.BoxLayout({
        vertical: false,
        style_class: 'shcalendar shcalendar' + this._cssThemeID + ' shcalendar-font shcalendar-bottom-menu shcalendar-bottom-menu' + this._cssThemeID
      });
      vbox.add_child(actionButtons);






      // Add preferences button
      let icon = new St.Icon({
        icon_name: 'preferences-system-symbolic',
        icon_size: 25,
        style: 'color: #3af'
      });
      let preferencesIcon = new St.Button({
        child: icon,
        reactive: true,
        can_focus: true,
        style_class: 'shcalendar-options-button shcalendar-options-button' + this._cssThemeID
      });
      preferencesIcon.connect('clicked', _arg.openPreferences);
      actionButtons.add_child(preferencesIcon);





      // Add Nowrooz button
      icon = new St.Icon({
        icon_name: 'starred-symbolic',
        icon_size: 25,
        style: 'color: #c55'
      });

      let nowroozIcon = new St.Button({
        child: icon,
        reactive: true,
        can_focus: true,
        style_class: 'shcalendar-options-button shcalendar-options-button' + this._cssThemeID
      });
      nowroozIcon.connect('clicked', function () {
        // let month_delta = 12 - dateObj.persianMonth;
        // let day_delta, nowrooz = '';
        // if (month_delta >= 6) {
        //   day_delta = 31 - dateObj.persianDay;
        // } else {
        //   day_delta = 30 - dateObj.persianDay;
        // }
        // if (dateObj.persianMonth !== 12) nowrooz += month_delta + ' ماه و ';
        // if (day_delta !== 0) {
        //   nowrooz += day_delta + ' روز مانده به ';
        //   nowrooz += 'نوروز سال ' + (dateObj.persianYear + 1);
        // }

        let text = Str.numbersFormat(tahvil.tahvilData(dateObj.persianYear + ((dateObj.persianMonth === 1) ? 0 : 1)).text);

        bottomBarLabel.set_text(text);
        // notify(text);
      });
      actionButtons.add_child(nowroozIcon);





      // Add Theme button
      let icon4 = new St.Icon({
        icon_name: 'night-light-symbolic',
        icon_size: 25,
        style: 'color: #c60'
      });
      let themeIcon = new St.Button({
        child: icon4,
        reactive: true,
        can_focus: true,
        style_class: 'shcalendar-options-button shcalendar-options-button' + this._cssThemeID
      });
      themeIcon.connect('clicked', () => {
        this.schema.set_int(
          (isDarkGnomeTheme(this.interface_schema)) ? 'dark-theme-id' : 'light-theme-id',
          (this._cssThemeID === '-thm1') ? 0 : 1
        );
      });
      actionButtons.add_child(themeIcon);





      // Add refresh button
      let icon3 = new St.Icon({
        icon_name: 'view-refresh-symbolic',
        icon_size: 25,
        style: 'color: #0c9'
      });
      let todayIcon = new St.Button({
        child: icon3,
        reactive: true,
        can_focus: true,
        style_class: 'shcalendar-options-button shcalendar-options-button' + this._cssThemeID
      });
      todayIcon.connect('clicked', function () {
        that._calendar._selectedDateObj.setNow();
        that._calendar._update();
      });
      actionButtons.add_child(todayIcon);



      actionButtons.add_child(bottomBarLabel);





      this.menu.connect('open-state-changed', (menu, isOpen) => {
        if (isOpen) {
          that._calendar._selectedDateObj.setNow();
          that._calendar._update();
        }
      });

      // prayer Time Loop
      _timers.push(GLib.timeout_add_seconds(
        GLib.PRIORITY_DEFAULT,
        60 - (new Date().getSeconds()),
        () => {
          _timers.push(GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            60,
            () => {
              this.checkPrayTime();
              return GLib.SOURCE_CONTINUE;
            }
          ))
          this.checkPrayTime();
          return GLib.SOURCE_REMOVE;
        }
      ));
    }



    updateDate(skip_notification = false, force = false) {

      let _dateObj = new Tarikh.TarikhObject();

      // if today is "today" just return, don't change anything!
      if (!force && this._todayJD === _dateObj.julianDay) return true;

      // set todayJulianDay as "today"
      this._todayJD = _dateObj.julianDay;

      // set indicator label and popupmenu

      let events = new Events.Events(_dateObj, this.schema).getEvents(150);
      if (this.schema.get_boolean('custom-color')) {
        _mainLable.set_style('color: ' + this.schema.get_string(_labelSchemaName(this.schema, events[1])));
      }

      _mainLable.set_text(
        Str.numbersFormat(
          Str.dateStrFormat(
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
          notifyTxt += Str.numbersFormat(evObj.symbol + ' ' + evObj.event + ((evObj.holiday) ? ' (تعطیل)' : '') + "\n");
        }
        notify(
          Str.numbersFormat(
            _dateObj.persianDay + ' ' +
            Tarikh.mName.shamsi[_dateObj.persianMonth] +
            ' ' + _dateObj.persianYear
          ),
          notifyTxt
        );
      }

      return true;
    }

    checkPrayTime() {
      let now = new Date();
      if (/*now.getSeconds() !== 0 || */!this.schema.get_boolean('praytime-play-and-notify')) return;
      let _prayTimes = {};
      {
        let coords = [this.schema.get_double('praytime-lat'), this.schema.get_double('praytime-lng')];
        let PT = this.NewPrayTimes;
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
      for (let tName in this.NewPrayTimes.persianMap) {
        const settings = getPrayTimeSetting(tName, this.schema);
        let timeStr;
        if (settings.CalcMethod === 'main') {// 'main' method:
          timeStr = _prayTimes['main'][tName];
        } else {// 'ehtiyat' method:
          const methodsTime = [
            Str.timeStrToMinutes(_prayTimes['main'][tName]),
            Str.timeStrToMinutes(_prayTimes['ehtiyat'][tName])
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

        let notifyIsEnable = false;
        let islamic = Tarikh.gregorian_to_islamic(now.getFullYear(), now.getMonth() + 1, now.getDate());
        // Schema Times settings value="ShowTime,TextNotify,PlaySound,CalcMethod,SoundId"
        if (
          settings.TextNotify === 'always' ||
          (settings.ShowTime === 'ramazan' && islamic[1] === 9)
        ) {
          notifyIsEnable = true;
          notify(
            this.NewPrayTimes.persianMap[tName] + ' به اُفق ' + this.schema.get_string('praytime-city') +
            ' / ساعت ' + Str.numbersFormat(_prayTimes['main'][tName]) + (
              (_prayTimes['main'][tName] === timeStr) ?
                '' : ' _ احتیاط ' + Str.numbersFormat(timeStr)
            )
          );
        }

        if (
          settings.PlaySound === 'never' ||
          (settings.PlaySound === 'ramazan' && islamic[1] !== 9)
        ) continue;

        if (settings.SoundId === '_custom_') {
          settings.SoundUri = this.schema.get_string('praytime-' + tName + '-sound-uri');
        } else {
          settings.SoundUri = this.path + '/' + sound.soundsDir + '/' + sound.sounds[settings.SoundId][1];
        }

        // if (player !== null) {
        //   // player.setVolume(this.schema.get_double('praytime-play-valume')); // this option removed!
        //   player.setUri({ ...settings.SoundUri});
        //   player.play();
        // }
        if (
          !sound.player(settings.SoundUri, this.NewPrayTimes.persianMap[tName] + ' به اُفق ' + this.schema.get_string('praytime-city')) &&
          !notifyIsEnable
        ) notify(
          this.NewPrayTimes.persianMap[tName] + ' به اُفق ' + this.schema.get_string('praytime-city') +
          ' / ساعت ' + Str.numbersFormat(_prayTimes['main'][tName]) + (
            (_prayTimes['main'][tName] === timeStr) ?
              '' : ' _ احتیاط ' + Str.numbersFormat(timeStr)
          )
        );


        if (this.schema.get_boolean('custom-color')) {
          _mainLable.set_style('color: ' + this.schema.get_string('pray-time-color'));
        }

        break;
      }

      _prayTimeIs = _prayTimeIs_nextValue;

      if (_prayTimeIs === '' /* && (player !== null && !player.isPlaying())*/) {
        if (this.schema.get_boolean('custom-color')) {
          _mainLable.set_style('color: ' + this.schema.get_string(_labelSchemaName(this.schema)));
        }
      }


    }



  }
);

function notify(title, body = '', iconName = 'x-office-calendar') {
  const source = new MessageTray.getSystemSource();
  const params = {
    source,
    title,
    isTransient: true,
  };
  if (body !== '') {
    params.body = body;
  }
  const notification = new MessageTray.Notification(params);
  if (iconName) {
    notification.set({ iconName });
  }
  source.addNotification(notification);
}

function isDarkGnomeTheme(interface_schema) {
  // log(interface_schema.get_string('color-scheme'))
  // log(interface_schema.get_string('gtk-theme'))

  // Prefer color-scheme when available (GNOME 42+): 'prefer-dark' means dark
  try {
    const cs = interface_schema.get_string('color-scheme');
    if (cs.includes('dark')) return true;
  } catch (e) { }

  // Fallback to gtk-theme name ending with '-dark' (older GNOME)
  try {
    const gt = interface_schema.get_string('gtk-theme');
    if (gt && gt.toLowerCase().endsWith('-dark')) return true;
  } catch (e) { }

  return false;
}

export default class ShamsiCalendarExtension extends Extension {

  enable() {
    _timers = [];
    _prayTimeIs = '';
    // if (player !== null && player.isPlaying()) player.pause();

    _indicator = new Indicator({
      settings: this.getSettings(),
      path: this.dir.get_path(),
      uuid: this.uuid,
      openPreferences: () => this.openPreferences()
      ,
      restartExtension: () => {
        this.disable();
        this.enable();
      }
    });

    let position = _indicator.schema.get_string('widget-position');
    Main.panel.addToStatusArea(
      this.uuid,
      _indicator,
      { 'left': '99999', 'center': '99999', 'right': '0' }[position],
      position
    );
    _indicator.updateDate(_indicator.schema.get_boolean('startup-notification'), true);

    // update indicator Loop
    _timers.push(GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      60 - (new Date().getSeconds()),
      () => {
        _timers.push(GLib.timeout_add_seconds(
          GLib.PRIORITY_DEFAULT,
          60,
          () => {
            _indicator.updateDate();
            return GLib.SOURCE_CONTINUE;
          }
        ))
        _indicator.updateDate();
        return GLib.SOURCE_REMOVE;
      }
    ));

    this.install_fonts();
  }

  install_fonts() {
    let dst = Gio.file_new_for_path(`${GLib.get_home_dir()}/fonts/shamsiCalendarFonts/`);
    if (!dst.query_exists(null)) {
      let src = Gio.file_new_for_path(`${this.dir.get_path()}/fonts`);
      file.copyDir(src, dst);
    }
  }

  disable() {
    _prayTimeIs = '';
    // if (player !== null && player.isPlaying()) player.pause();

    _indicator?.interface_schema.disconnect(_indicator.interface_schema_gnome_theme_change_signal);

    _indicator?.schema_all_change_signals.forEach(change_signal => {
      _indicator.schema.disconnect(change_signal);
    });
    _indicator?.destroy();

    for (let i in _timers) GLib.Source.remove(_timers[i]);

    _mainLable = null;
    _indicator = null;
    _prayTimeIs = null;
    messageTray = null;
    _timers = null;

    this.uninstall_fonts();
  }

  uninstall_fonts() {
    let isLocked = (Main.sessionMode.currentMode === 'unlock-dialog');
    let dir = Gio.file_new_for_path(`${GLib.get_home_dir()}/fonts/shamsiCalendarFonts/`);
    if (dir.query_exists(null) && !isLocked) {
      file.deleteDir(dir);
    }
  }

}
