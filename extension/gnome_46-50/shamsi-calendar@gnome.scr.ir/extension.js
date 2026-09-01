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

import { Str } from './otherFunctions.js';
import * as Tarikh from './Tarikh.js';
import * as Calendar from './calendar.js';
import * as Events from './Events.js';
import * as tahvil from './tahvil.js';

let _mainLabel, _indicator, _timers = [];

function _labelSchemaName(schema, isHoliday = false) {
  return isHoliday ? 'holiday-color' : 'not-holiday-color';
}

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {

    _init(_arg) {
      this.schema = _arg.settings;
      this.uuid = _arg.uuid;
      this.path = _arg.path;
      this._openPreferences = _arg.openPreferences;
      this._restartExtension = _arg.restartExtension;

      super._init(
        { left: 1.0, center: 0.5, right: 0.0 }[this.schema.get_string('window-position')] ?? 0.5,
        'تقویم هجری شمسی'
      );

      this.schema_signals = [];

      _mainLabel = new St.Label({
        style_class: 'shcalendar-panel-label',
        y_expand: true,
        y_align: Clutter.ActorAlign.CENTER
      });

      this.add_child(_mainLabel);

      this._applyLabelStyle();

      this.schema_signals.push(
        this.schema.connect('changed::not-holiday-color', () => this._applyLabelStyle()),
        this.schema.connect('changed::holiday-color', () => this._applyLabelStyle()),
        this.schema.connect('changed::custom-color', () => this._applyLabelStyle()),
        this.schema.connect('changed::widget-format', () => this.updateDate(false, true)),
        this.schema.connect('changed::widget-position', () => this._restartExtension()),
        this.schema.connect('changed::window-position', () => this._restartExtension())
      );

      let bottomBarLabel = new St.Label({
        text: '',
        x_align: Clutter.ActorAlign.END,
        y_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
        style_class: 'shcalendar-bottom-label'
      });

      this._todayJD = '';

      let vbox = new St.BoxLayout({
        vertical: true,
        style_class: 'shcalendar-main-box'
      });

      let calendarMenuItem = new PopupMenu.PopupBaseMenuItem({
        activate: false,
        hover: false,
        can_focus: false,
        style_class: 'shcalendar-popup-item'
      });
      calendarMenuItem.actor.add_child(vbox);
      this.menu.addMenuItem(calendarMenuItem);

      this._calendar = new Calendar.Calendar(
        this.schema,
        '',
        (text = '') => { bottomBarLabel.set_text(text); }
      );
      vbox.add_child(this._calendar.actor);

      let actionButtons = new St.BoxLayout({
        vertical: false,
        style_class: 'shcalendar-action-bar'
      });
      vbox.add_child(actionButtons);

      // Preferences button
      let prefsIcon = new St.Icon({
        icon_name: 'preferences-system-symbolic',
        icon_size: 16
      });
      let prefsButton = new St.Button({
        child: prefsIcon,
        reactive: true,
        can_focus: true,
        style_class: 'button shcalendar-btn'
      });
      prefsButton.connect('clicked', () => this._openPreferences());
      actionButtons.add_child(prefsButton);

      // Nowrooz Countdown button
      let nowroozIcon = new St.Icon({
        icon_name: 'starred-symbolic',
        icon_size: 16
      });
      let nowroozButton = new St.Button({
        child: nowroozIcon,
        reactive: true,
        can_focus: true,
        style_class: 'button shcalendar-btn'
      });
      nowroozButton.connect('clicked', () => {
        let dateObj = new Tarikh.TarikhObject();
        let targetYear = dateObj.persianYear + ((dateObj.persianMonth === 1) ? 0 : 1);
        let text = Str.numbersFormat(tahvil.tahvilData(targetYear).text);
        bottomBarLabel.set_text(text);
      });
      actionButtons.add_child(nowroozButton);

      // Today / Refresh button
      let todayIcon = new St.Icon({
        icon_name: 'view-refresh-symbolic',
        icon_size: 16
      });
      let todayButton = new St.Button({
        child: todayIcon,
        reactive: true,
        can_focus: true,
        style_class: 'button shcalendar-btn'
      });
      todayButton.connect('clicked', () => {
        this._calendar._selectedDateObj.setNow();
        this._calendar._update();
      });
      actionButtons.add_child(todayButton);

      actionButtons.add_child(bottomBarLabel);

      this.menu.connect('open-state-changed', (menu, isOpen) => {
        if (isOpen) {
          this._calendar._selectedDateObj.setNow();
          this._calendar._update();
        }
      });
    }

    _applyLabelStyle(isHoliday = false) {
      if (this.schema.get_boolean('custom-color')) {
        let colorKey = _labelSchemaName(this.schema, isHoliday);
        _mainLabel.set_style(`color: ${this.schema.get_string(colorKey)};`);
      } else {
        _mainLabel.set_style('');
      }
    }

    updateDate(skip_notification = false, force = false) {
      let dateObj = new Tarikh.TarikhObject();

      if (!force && this._todayJD === dateObj.julianDay) return true;
      this._todayJD = dateObj.julianDay;

      let events = new Events.Events(dateObj, this.schema).getEvents(150);
      let isHoliday = events[1];

      this._applyLabelStyle(isHoliday);

      _mainLabel.set_text(
        Str.numbersFormat(
          Str.dateStrFormat(
            this.schema.get_string('widget-format'),
            dateObj.persianDay,
            dateObj.persianMonth,
            dateObj.persianYear,
            dateObj.dayOfWeek,
            'persian'
          )
        )
      );

      if (skip_notification) {
        let notifyTxt = '';
        for (let evObj of events[0]) {
          notifyTxt += Str.numbersFormat(`${evObj.symbol} ${evObj.event}${evObj.holiday ? ' (تعطیل)' : ''}\n`);
        }
        notify(
          Str.numbersFormat(
            `${dateObj.persianDay} ${Tarikh.mName.shamsi[dateObj.persianMonth]} ${dateObj.persianYear}`
          ),
          notifyTxt
        );
      }

      return true;
    }

    destroy() {
      if (this.schema_signals) {
        for (let sig of this.schema_signals) {
          this.schema.disconnect(sig);
        }
        this.schema_signals = [];
      }
      super.destroy();
    }
  }
);

function notify(title, body = '', iconName = 'x-office-calendar') {
  try {
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
  } catch (e) {
    // Fallback if MessageTray API differs
  }
}

export default class ShamsiCalendarExtension extends Extension {

  enable() {
    _timers = [];

    _indicator = new Indicator({
      settings: this.getSettings(),
      path: this.dir.get_path(),
      uuid: this.uuid,
      openPreferences: () => this.openPreferences(),
      restartExtension: () => {
        this.disable();
        this.enable();
      }
    });

    let position = _indicator.schema.get_string('widget-position');
    Main.panel.addToStatusArea(
      this.uuid,
      _indicator,
      { 'left': '99999', 'center': '99999', 'right': '0' }[position] ?? '99999',
      position
    );

    _indicator.updateDate(_indicator.schema.get_boolean('startup-notification'), true);

    // Schedule next day update at midnight accurately
    this._scheduleNextUpdate();
  }

  _scheduleNextUpdate() {
    let now = new Date();
    let secondsToNextMinute = 60 - now.getSeconds();

    let initialTimer = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      secondsToNextMinute,
      () => {
        let intervalTimer = GLib.timeout_add_seconds(
          GLib.PRIORITY_DEFAULT,
          60,
          () => {
            _indicator?.updateDate();
            return GLib.SOURCE_CONTINUE;
          }
        );
        _timers.push(intervalTimer);
        _indicator?.updateDate();
        return GLib.SOURCE_REMOVE;
      }
    );
    _timers.push(initialTimer);
  }

  disable() {
    for (let timer of _timers) {
      if (timer) GLib.Source.remove(timer);
    }
    _timers = [];

    if (_indicator) {
      _indicator.destroy();
      _indicator = null;
    }

    _mainLabel = null;
  }
}
