import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import Gdk from 'gi://Gdk';
import GObject from 'gi://GObject';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { Str } from './otherFunctions.js';
import * as Tarikh from './Tarikh.js';

export default class ShamsiCalendarPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    window.set_default_size(680, 600);
    new App(window, this.getSettings(), this.path);
  }
}

class App {
  constructor(window, schema, path) {
    this.window = window;
    this.schema = schema;
    this.path = path;
    this._dateObj = new Tarikh.TarikhObject();

    this._buildGeneralPage();
    this._buildEventsPage();
    this._buildWeekPage();
    this._buildAboutPage();
  }

  _buildGeneralPage() {
    let page = new Adw.PreferencesPage({
      title: 'تنظیمات عمومی',
      icon_name: 'preferences-desktop-appearance-symbolic'
    });
    this.window.add(page);

    // Group 1: Panel Widget
    let panelGroup = new Adw.PreferencesGroup({
      title: 'ابزارک نوار بالا',
      description: 'نحوه نمایش تاریخ در نوار وضعیت گنوم'
    });
    page.add(panelGroup);

    // Widget Position
    let posRow = new Adw.ComboRow({
      title: 'موقعیت در نوار',
      model: new Gtk.StringList({
        strings: ['سمت راست', 'وسط نوار', 'سمت چپ']
      })
    });
    let posMap = ['right', 'center', 'left'];
    let currentPos = this.schema.get_string('widget-position');
    posRow.set_selected(Math.max(0, posMap.indexOf(currentPos)));
    posRow.connect('notify::selected', () => {
      this.schema.set_string('widget-position', posMap[posRow.get_selected()]);
    });
    panelGroup.add(posRow);

    // Format
    let showFormats = [
      '%WW %d %MM',
      '%WW %d %MM %Y',
      '%d %MM',
      '%d %MM %Y',
      '%WW %d',
      '%d / %m / %Y',
      '%WW %d / %m / %Y'
    ];
    let formatStrings = showFormats.map(f =>
      Str.numbersFormat(
        Str.dateStrFormat(
          f,
          this._dateObj.persianDay,
          this._dateObj.persianMonth,
          this._dateObj.persianYear,
          this._dateObj.dayOfWeek,
          'persian'
        )
      )
    );

    let formatRow = new Adw.ComboRow({
      title: 'قالب نمایش تاریخ',
      model: new Gtk.StringList({ strings: formatStrings })
    });
    let currentFormat = this.schema.get_string('widget-format');
    let fIdx = showFormats.indexOf(currentFormat);
    formatRow.set_selected(fIdx >= 0 ? fIdx : 0);
    formatRow.connect('notify::selected', () => {
      this.schema.set_string('widget-format', showFormats[formatRow.get_selected()]);
    });
    panelGroup.add(formatRow);

    // Group 2: Colors & Style
    let colorGroup = new Adw.PreferencesGroup({
      title: 'شخصی‌سازی رنگ‌ها'
    });
    page.add(colorGroup);

    let customColorRow = new Adw.SwitchRow({
      title: 'استفاده از رنگ سفارشی در نوار'
    });
    this.schema.bind('custom-color', customColorRow, 'active', Gio.SettingsBindFlags.DEFAULT);
    colorGroup.add(customColorRow);

    this._addColorPickerRow(colorGroup, 'رنگ روزهای عادی', 'not-holiday-color');
    this._addColorPickerRow(colorGroup, 'رنگ روزهای تعطیل', 'holiday-color');

    // Group 3: Default Tab
    let popupGroup = new Adw.PreferencesGroup({
      title: 'پنجره تقویم'
    });
    page.add(popupGroup);

    let tabRow = new Adw.ComboRow({
      title: 'برگه پیش‌فرض',
      model: new Gtk.StringList({
        strings: ['مناسبت‌ها و رویدادها', 'تبدیل تاریخ']
      })
    });
    let tabKeys = ['events', 'dateConvert'];
    let curTab = this.schema.get_string('default-tab');
    tabRow.set_selected(tabKeys.indexOf(curTab) >= 0 ? tabKeys.indexOf(curTab) : 0);
    tabRow.connect('notify::selected', () => {
      this.schema.set_string('default-tab', tabKeys[tabRow.get_selected()]);
    });
    popupGroup.add(tabRow);
  }

  _addColorPickerRow(group, title, schemaKey) {
    let row = new Adw.ActionRow({ title: title });
    let colorStr = this.schema.get_string(schemaKey) || '#ffffff';
    let rgba = new Gdk.RGBA();
    rgba.parse(colorStr);

    let colorDialog = new Gtk.ColorDialog({ with_alpha: false });
    let colorButton = new Gtk.ColorDialogButton({
      dialog: colorDialog,
      rgba: rgba,
      valign: Gtk.Align.CENTER
    });

    colorButton.connect('notify::rgba', () => {
      let col = colorButton.get_rgba();
      let hex = col.to_string();
      this.schema.set_string(schemaKey, hex);
    });

    row.add_suffix(colorButton);
    group.add(row);
  }

  _buildEventsPage() {
    let page = new Adw.PreferencesPage({
      title: 'رویدادها و همگام‌سازی',
      icon_name: 'view-list-symbolic'
    });
    this.window.add(page);

    // Group 1: Google Calendar
    let googleGroup = new Adw.PreferencesGroup({
      title: 'همگام‌سازی با حساب کاربری',
      description: 'اتصال خودکار به رویدادهای تقویم گوگل و GNOME Online Accounts'
    });
    page.add(googleGroup);

    let googleSyncRow = new Adw.SwitchRow({
      title: 'همگام‌سازی با Google Calendar / رویدادهای سیستم',
      subtitle: 'نمایش رویدادها و یادآورهای شخصی ثبت شده در تقویم لینوکس/گوگل'
    });
    this.schema.bind('enable-google-calendar', googleSyncRow, 'active', Gio.SettingsBindFlags.DEFAULT);
    googleGroup.add(googleSyncRow);

    // Group 2: Official Holidays & Events
    let eventsGroup = new Adw.PreferencesGroup({
      title: 'مناسبت‌های رسمی و تقویمی'
    });
    page.add(eventsGroup);

    let pEvRow = new Adw.SwitchRow({
      title: 'مناسبت‌های خورشیدی',
      subtitle: 'تعطیلات و مناسبت‌های رسمی تقویم شمسی ایران'
    });
    this.schema.bind('show-persian-events', pEvRow, 'active', Gio.SettingsBindFlags.DEFAULT);
    eventsGroup.add(pEvRow);

    let iEvRow = new Adw.SwitchRow({
      title: 'مناسبت‌های قمری',
      subtitle: 'مناسبت‌ها و تعطیلات مذهبی و قمری'
    });
    this.schema.bind('show-islamic-events', iEvRow, 'active', Gio.SettingsBindFlags.DEFAULT);
    eventsGroup.add(iEvRow);

    let gEvRow = new Adw.SwitchRow({
      title: 'مناسبت‌های بین‌المللی',
      subtitle: 'رویدادهای رسمی تقویم میلادی'
    });
    this.schema.bind('show-gregorian-events', gEvRow, 'active', Gio.SettingsBindFlags.DEFAULT);
    eventsGroup.add(gEvRow);

    let oldEvRow = new Adw.SwitchRow({
      title: 'جشن‌ها و مناسبت‌های کهن ایرانی'
    });
    this.schema.bind('show-old-events', oldEvRow, 'active', Gio.SettingsBindFlags.DEFAULT);
    eventsGroup.add(oldEvRow);
  }

  _buildWeekPage() {
    let page = new Adw.PreferencesPage({
      title: 'تنظیمات هفته',
      icon_name: 'x-office-calendar-symbolic'
    });
    this.window.add(page);

    let weekGroup = new Adw.PreferencesGroup({
      title: 'آغاز هفته و روزهای تعطیل'
    });
    page.add(weekGroup);

    let weekStartRow = new Adw.ComboRow({
      title: 'روز آغازین هفته',
      model: new Gtk.StringList({
        strings: ['شنبه', 'یکشنبه', 'دوشنبه']
      })
    });
    let startMap = ['0', '1', '2'];
    let curStart = this.schema.get_string('week-start');
    weekStartRow.set_selected(Math.max(0, startMap.indexOf(curStart)));
    weekStartRow.connect('notify::selected', () => {
      this.schema.set_string('week-start', startMap[weekStartRow.get_selected()]);
    });
    weekGroup.add(weekStartRow);

    let days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    days.forEach((dayName, idx) => {
      let row = new Adw.SwitchRow({
        title: `تعطیلی هفتگی: ${dayName}`
      });
      this.schema.bind(`none-work-${idx}`, row, 'active', Gio.SettingsBindFlags.DEFAULT);
      weekGroup.add(row);
    });
  }

  _buildAboutPage() {
    let page = new Adw.PreferencesPage({
      title: 'درباره',
      icon_name: 'help-about-symbolic'
    });
    this.window.add(page);

    let aboutGroup = new Adw.PreferencesGroup({
      title: 'تقویم شمسی برای گنوم ۵۰',
      description: 'نسخه مدرن، سبک و بازطراحی‌شده بر پایه استانداردهای Libadwaita'
    });
    page.add(aboutGroup);

    let versionRow = new Adw.ActionRow({
      title: 'نسخه',
      subtitle: '45'
    });
    aboutGroup.add(versionRow);

    let repoRow = new Adw.ActionRow({
      title: 'مخزن سورس‌کد',
      subtitle: 'github.com/xSOH3ILx/gnome-shamsi-calendar'
    });
    aboutGroup.add(repoRow);
  }
}
