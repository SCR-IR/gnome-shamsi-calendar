const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('shamsi-calendar');
const _ = Gettext.gettext;

let extension = imports.misc.extensionUtils.getCurrentExtension();
let convenience = extension.imports.convenience;

let Schema = convenience.getSettings('org.gnome.shell.extensions.shamsi-calendar');


function init() {
}

const App = new Lang.Class({
  Name: 'ShamsiCalendar.App',
  el: {},
  _init: function () {
    this.main_hbox = new Gtk.Notebook();
    // this.main_hbox.set_min_content_width(1000);
    // this.main_hbox1 = new Gtk.Box({
    //     orientation: Gtk.Orientation.HORIZONTAL,
    //     spacing: 20,
    //     border_width: 10
    //   });
    // 
    // this.vbox3 = new Gtk.Box({
    //   orientation: Gtk.Orientation.VERTICAL,
    //   spacing: 10,
    //   border_width: 10
    // });
    // this.vbox2 = new Gtk.Box({
    //   orientation: Gtk.Orientation.VERTICAL,
    //   spacing: 10,
    //   border_width: 10
    // });
    // this.vbox1 = new Gtk.Box({
    //   orientation: Gtk.Orientation.VERTICAL,
    //   spacing: 10,
    //   border_width: 10
    // });
    this.vbox1 = new Gtk.VBox();
    this.vbox2 = new Gtk.VBox();
    this.vbox3 = new Gtk.VBox();
    this.vbox4 = new Gtk.VBox();
    this.vbox5 = new Gtk.VBox();
    this.vbox6 = new Gtk.VBox();

    this.main_hbox.append_page(
      this.vbox1,
      new Gtk.Label({ label: _('تاریخ‌ها') })
    );
    this.main_hbox.append_page(
      this.vbox2,
      new Gtk.Label({ label: _('مناسبت‌ها') })
    );
    this.main_hbox.append_page(
      this.vbox3,
      new Gtk.Label({ label: _('نوار وضعیت') })
    );
    this.main_hbox.append_page(
      this.vbox4,
      new Gtk.Label({ label: _('جدول تقویم') })
    );
    this.main_hbox.append_page(
      this.vbox5,
      new Gtk.Label({ label: _('بازنشانی') })
    );
    this.main_hbox.append_page(
      this.vbox6,
      new Gtk.Label({ label: _('درباره') })
    );
    // this.main_hbox1.pack_start(this.vbox3, false, false, 0);
    // this.main_hbox1.pack_start(this.vbox2, false, false, 0);
    // this.main_hbox1.pack_start(this.vbox1, false, false, 0);

    let label, hbox, comment;


    // COLOR
    this.vbox3.add(new Gtk.Label({ label: _('حالت نمایش در نوار وضعیت:') }));

    this.vbox3.add(new Gtk.Label({ label: _('موقعیت') }));
    this.el['position'] = new Gtk.ComboBoxText();
    this.el['position'].append('left', 'سمت چپ');
    this.el['position'].append('center', 'وسط');
    this.el['position'].append('right', 'سمت راست');
    this.el['position'].set_active(Schema.get_enum('position'));
    this.vbox3.add(this.el['position']);
    Schema.bind('position', this.el['position'], 'active-id', Gio.SettingsBindFlags.DEFAULT);




    this.el['custom-color'] = new Gtk.CheckButton({ label: _('رنگ سفارشی متن') });
    this.vbox3.add(this.el['custom-color']);
    Schema.bind('custom-color', this.el['custom-color'], 'active', Gio.SettingsBindFlags.DEFAULT);



    let colorsGrid = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 20,
      border_width: 10
    });
    this.vbox3.add(colorsGrid);



    this.el['not-holiday-color'] = new Gtk.ColorButton();

    let _color = this.getColorByHexadecimal(Schema.get_string('not-holiday-color'));
    this.el['not-holiday-color'].set_color(_color);

    this.el['not-holiday-color'].connect('color-set', (function (innerColor) {
      Schema.set_string('not-holiday-color', this.getHexadecimalByColor(innerColor.get_color()));
    }).bind(this));



    this.el['holiday-color'] = new Gtk.ColorButton();
    // this.vbox3.add(color2);
    this.el['holiday-color'].set_color(this.getColorByHexadecimal(Schema.get_string('holiday-color')));

    this.el['holiday-color'].connect('color-set', (function (innerColor) {
      Schema.set_string('holiday-color', this.getHexadecimalByColor(innerColor.get_color()));
    }).bind(this));

    colorsGrid.pack_start(this.el['not-holiday-color'], false, false, 0);
    colorsGrid.pack_start(new Gtk.Label({ label: _('عادی:') }), false, false, 0);
    colorsGrid.pack_start(this.el['holiday-color'], false, false, 0);
    colorsGrid.pack_start(new Gtk.Label({ label: _('تعطیل:') }), false, false, 0);



    this.el['startup-notification'] = new Gtk.CheckButton({ label: _('اعلان هنگام راه‌اندازی') });
    this.vbox3.add(this.el['startup-notification']);
    Schema.bind('startup-notification', this.el['startup-notification'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['widget-format'] = new Gtk.Entry();
    label = new Gtk.Label({ label: 'قالب تاریخ در نوار وضعیت: ' });
    hbox = new Gtk.HBox();
    hbox.add(this.el['widget-format']);
    hbox.add(label);
    this.vbox3.add(hbox);
    this.el['widget-format'].set_text(Schema.get_string('widget-format'));
    this.el['widget-format'].connect('changed', function (innerFormat) {
      Schema.set_string('widget-format', innerFormat.text);
    });


    // FONT
    /* item = new Gtk.CheckButton({label: _('Use custom font')})
     this.vbox3.add(item)
     Schema.bind('custom-font', item, 'active', Gio.SettingsBindFlags.DEFAULT);
    
     label = new Gtk.Label({label: "Font: "});
     let font = new Gtk.FontButton();
     font.set_show_size(false);
     //font.set_show_style(false);
    
     let _actor = new Gtk.HBox();
     _actor.add(label);
     _actor.add(font);
     font.set_font_name(Schema.get_string('font'));
    
     this.vbox3.add(_actor);
     font.connect('font-set', function(font){
     Schema.set_string('font', font.get_font_name());
     });*/









    // let dialog = new Gtk.Dialog({
    //   title: _('Customize icon scroll behavior'),
    //   // transient_for: this.widget.get_toplevel(),
    //   use_header_bar: true,
    //   modal: true
    // });

    // // GTK+ leaves positive values for application-defined response ids.
    // // Use +1 for the reset action
    // dialog.add_button(_('Reset to defaults'), 1);

    // let box = new Gtk.CheckButton({ label: _('عمودی‌ تقویم') });
    // dialog.get_content_area().add(box);
    // dialog.show_all();








    // EVENTS
    this.vbox2.add(new Gtk.Label({
      label: _('تنظیمات نمایش مناسبت‌ها:\n<span size="x-small">(مناسبت‌های رسمی و غیر رسمی قابل نمایش)</span>'),
      use_markup: true
    }));

    this.el['event-iran-lunar'] = new Gtk.CheckButton({ label: _('مناسبت‌های رسمی کشور: هجری‌قمری') });
    this.vbox2.add(this.el['event-iran-lunar']);
    Schema.bind('event-iran-solar', this.el['event-iran-lunar'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['event-iran-solar'] = new Gtk.CheckButton({ label: _('مناسبت‌های رسمی کشور: هجری‌شمسی') });
    this.vbox2.add(this.el['event-iran-solar']);
    Schema.bind('event-iran-lunar', this.el['event-iran-solar'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['event-world'] = new Gtk.CheckButton({ label: _('مناسبت‌های رسمی کشور: میلادی (جهانی)') });
    this.vbox2.add(this.el['event-world']);
    Schema.bind('event-world', this.el['event-world'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['event-persian'] = new Gtk.CheckButton({ label: _('مناسبت‌های غیر رسمی ایران باستان') });
    this.vbox2.add(this.el['event-persian']);
    Schema.bind('event-persian', this.el['event-persian'], 'active', Gio.SettingsBindFlags.DEFAULT);

    /* Merged to iranSolar(event-iran-solar): */
    // item = new Gtk.CheckButton({label: _('Persian personages')});
    // this.vbox2.add(item);
    // Schema.bind('event-persian-personage', item, 'active', Gio.SettingsBindFlags.DEFAULT);










    // DATES FORMAT
    this.vbox1.add(new Gtk.Label({ label: _('نمایش تاریخ‌ها:') }));

    this.el['persian-display'] = new Gtk.CheckButton({ label: _('هجری شمسی') });
    this.vbox1.add(this.el['persian-display']);
    Schema.bind('persian-display', this.el['persian-display'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['persian-display-format'] = new Gtk.Entry();
    label = new Gtk.Label({ label: '     قالب: ' });
    hbox = new Gtk.HBox();
    hbox.add(this.el['persian-display-format']);
    hbox.add(label);
    this.vbox1.add(hbox);

    this.el['persian-display-format'].set_text(Schema.get_string('persian-display-format'));
    this.el['persian-display-format'].connect('changed', function (innerFormat) {
      Schema.set_string('persian-display-format', innerFormat.text);
    });


    this.el['hijri-display'] = new Gtk.CheckButton({ label: _('هجری قمری') });
    this.vbox1.add(this.el['hijri-display']);
    Schema.bind('hijri-display', this.el['hijri-display'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['hijri-display-format'] = new Gtk.Entry();
    label = new Gtk.Label({ label: '     قالب: ' });
    hbox = new Gtk.HBox();
    hbox.add(this.el['hijri-display-format']);
    hbox.add(label);
    this.vbox1.add(hbox);
    this.el['hijri-display-format'].set_text(Schema.get_string('hijri-display-format'));
    this.el['hijri-display-format'].connect('changed', function (innerFormat) {
      Schema.set_string('hijri-display-format', innerFormat.text);
    });


    this.el['gregorian-display'] = new Gtk.CheckButton({ label: _('میلادی') });
    this.vbox1.add(this.el['gregorian-display']);
    Schema.bind('gregorian-display', this.el['gregorian-display'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['gregorian-display-format'] = new Gtk.Entry();
    label = new Gtk.Label({ label: '     قالب: ' });
    hbox = new Gtk.HBox();
    hbox.add(this.el['gregorian-display-format']);
    hbox.add(label);
    this.vbox1.add(hbox);
    this.el['gregorian-display-format'].set_text(Schema.get_string('gregorian-display-format'));
    this.el['gregorian-display-format'].connect('changed', function (innerFormat) {
      Schema.set_string('gregorian-display-format', innerFormat.text);
    });

    comment = new Gtk.Label({
      label: _('<span size="x-small">قالب‌های قابل استفاده:\n%Y: سال چهار رقمی\n%y: سال دو رقمی\n%M: ماه دو رقمی\n%m: ماه یک یا دو رقمی\n%MM: نام کامل ماه\n%mm: خلاصه نام ماه\n%D: روز دو رقمی\n%d: روز یک یا دو رقمی\n%WW: نام روز هفته\n%ww: خلاصه نام روز هفته</span>'),
      use_markup: true
    });
    this.vbox1.add(comment);


    this.el['rotaton-to-vertical'] = new Gtk.CheckButton({ label: _('عمودی‌شدن جدول تقویم') });
    this.vbox4.add(this.el['rotaton-to-vertical']);
    Schema.bind('rotaton-to-vertical', this.el['rotaton-to-vertical'], 'active', Gio.SettingsBindFlags.DEFAULT);



    comment = new Gtk.Label({
      label: _('با انجام عمل بازنشانی، همه‌ی تنظیمات این افزونه به حالت پیشفرض اوّلیه باز خواهد گردید.'),
      use_markup: true
    });
    this.vbox5.add(comment);
    
    let resetBtn = new Gtk.Button({label: 'بازنشانی تنظیمات'});
    resetBtn.connect('clicked', () => this._resetConfig());
    this.vbox5.add(resetBtn);



    comment = new Gtk.Label({
      label: 'افزونه‌ی تقویم هجری شمسی، قمری و میلادی برای میز‌کار گنوم لینوکس\n\nتوسعه‌دهنده:\n<a href="https://jdf.scr.ir/">https://jdf.scr.ir</a>\n\nحمایت مالی:\n<a href="https://scr.ir/pardakht/?hemayat=gnome_shamsi_calendar">https://scr.ir/pardakht/?hemayat=gnome_shamsi_calendar</a>\n\nنصب:\n<a href="https://extensions.gnome.org/extension/3618/">https://extensions.gnome.org/extension/3618</a>\n\nکد منبع:\n<a href="https://github.com/scr-ir/gnome-shamsi-calendar/">https://github.com/scr-ir/gnome-shamsi-calendar</a>',
      use_markup: true
    });
    this.vbox6.add(comment);



    this.main_hbox.show_all();
  },

  _resetConfig: function (key = null) {
    // this.aaa.abc.set_text('66666666');
    // this.main_hbox.no_show_all(false);
    // this.vbox3.add(new Gtk.CheckButton({ label: _('اعلان هنگام را') }));
    const keysObj = {
      'hijri-display': 'CheckButton',
      'gregorian-display': 'CheckButton',
      'persian-display': 'CheckButton',
      'hijri-display-format': 'Entry',
      'persian-display-format': 'Entry',
      'gregorian-display-format': 'Entry',
      'event-iran-lunar': 'CheckButton',
      'event-iran-solar': 'CheckButton',
      'event-persian': 'CheckButton',
      'event-world': 'CheckButton',
      'rotaton-to-vertical': 'CheckButton',
      'widget-format': 'Entry',
      'startup-notification': 'CheckButton',
      'custom-color': 'CheckButton',
      'not-holiday-color': 'ColorButton',
      'holiday-color': 'ColorButton',
      'position': 'ComboBoxText'
    };//this.el['']



    for (let key in keysObj) {
      Schema.reset(key);
      switch (keysObj[key]) {
        case 'Entry':
          this.el[key].set_text(Schema.get_string(key));
          break;
        case 'CheckButton':
          Schema.bind(key, this.el[key], 'active', Gio.SettingsBindFlags.DEFAULT);
          break;
        case 'ColorButton':
          this.el[key].set_color(this.getColorByHexadecimal(Schema.get_string(key)));
          break;
        case 'ComboBoxText':
          this.el[key].set_active(Schema.get_enum(key));
          Schema.bind(key, this.el[key], 'active-id', Gio.SettingsBindFlags.DEFAULT);
          break;
      }
    }

    // Gtk.main_quit();
  },

  _scaleRound: function (value) {
    // Based on gtk/gtkcoloreditor.c
    value = Math.floor((value / 255) + 0.5);
    value = Math.max(value, 0);
    value = Math.min(value, 255);
    return value;
  },

  _dec2Hex: function (value) {
    value = value.toString(16);

    while (value.length < 2) {
      value = '0' + value;
    }

    return value;
  },

  getColorByHexadecimal: function (hex) {
    let colorArray = Gdk.Color.parse(hex);
    let color = null;

    if (colorArray[0]) {
      color = colorArray[1];
    } else {
      // On any error, default to red
      color = new Gdk.Color({ red: 65535 });
    }

    return color;
  },

  getHexadecimalByColor: function (color) {
    let red = this._scaleRound(color.red);
    let green = this._scaleRound(color.green);
    let blue = this._scaleRound(color.blue);
    return '#' + this._dec2Hex(red) + this._dec2Hex(green) + this._dec2Hex(blue);
  }
});

function buildPrefsWidget() {
  let widget = new App();
  return widget.main_hbox;
}
