const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Lang = imports.lang;

// const Gettext = imports.gettext.domain('shamsi-calendar');
// const _ = Gettext.gettext;

let extension = imports.misc.extensionUtils.getCurrentExtension();
let convenience = extension.imports.convenience;
let Schema = convenience.getSettings('org.gnome.shell.extensions.shamsi-calendar');
const Tarikh = extension.imports.Tarikh;
const str = extension.imports.strFunctions;
const Cities = extension.imports.cities;
const PrayTimes = extension.imports.PrayTimes.prayTimes;
const player = extension.imports.sound.player;

function init() {
}

var App = new Lang.Class({
  Name: 'ShamsiCalendar.App',
  el: {},
  _init: function () {
    this.main_hbox = new Gtk.Notebook();
    let _dateObj = new Tarikh.TarikhObject();
    let sensitiveFunc, hbox, tmp;
    const showFormats = [
      '%WW',
      '%d',
      '%d %MM',
      '%WW %d',
      '%WW %d %MM',
      '%WW %d %MM %Y',
      '%WW %d %MM %y',
      '%WW %d / %MM / %Y',
      '%WW %d / %m / %Y',
      '%WW %d / %MM / %y',
      '%WW %d / %m / %y',
      '%d / %MM / %Y',
      '%d / %MM / %y',
      '%d %MM %Y',
      '%d %MM %y',
      '%WW %d / %m / %Y (%MM)',
      '%d / %m / %Y (%MM)',
    ];



    [
      ['vbox1', 'نوار وضعیت'],
      ['vbox2', 'نمایش'],
      ['vbox3', 'مناسبت‌ها'],
      ['vbox4', 'هفته'],
      ['vbox5', 'اوقات شرعی'],
      ['vbox6', 'بازنشانی'],
      ['vbox7', 'درباره'],
    ].forEach((v) => {
      this[v[0]] = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 6, halign: Gtk.Align.CENTER, margin_top: 14, margin_bottom: 14, margin_start: 14, margin_end: 14 });
      this.main_hbox.append_page(
        this[v[0]],
        new Gtk.Label({ label: v[1] })
      );
    });



    // COLOR
    this.vbox1.append(new Gtk.Label({ label: 'حالت نمایش در نوار وضعیت:\n' }));

    this.el['position'] = new Gtk.ComboBoxText();
    this.el['position'].append('left', 'سمت چپ');
    this.el['position'].append('center', 'وسط');
    this.el['position'].append('right', 'سمت راست');
    this.el['position'].set_active(Schema.get_enum('position'));
    Schema.bind('position', this.el['position'], 'active-id', Gio.SettingsBindFlags.DEFAULT);


    this.el['custom-color'] = new Gtk.CheckButton({ label: 'رنگ سفارشی متن' });
    Schema.bind('custom-color', this.el['custom-color'], 'active', Gio.SettingsBindFlags.DEFAULT);

    let colorsGrid = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 3
    });

    this.el['pray-time-color'] = Gtk.ColorButton.new_with_rgba(this.getColorByHexadecimal(Schema.get_string('pray-time-color')));
    this.el['pray-time-color'].set_modal(true);
    this.el['pray-time-color'].connect('color-set', (function (innerColor) {
      Schema.set_string('pray-time-color', this.getHexadecimalByColor(innerColor.get_rgba()));
    }).bind(this));

    this.el['holiday-color'] = Gtk.ColorButton.new_with_rgba(this.getColorByHexadecimal(Schema.get_string('holiday-color')));
    this.el['holiday-color'].set_modal(true);
    this.el['holiday-color'].connect('color-set', (function (innerColor) {
      Schema.set_string('holiday-color', this.getHexadecimalByColor(innerColor.get_rgba()));
    }).bind(this));

    this.el['not-holiday-color'] = Gtk.ColorButton.new_with_rgba(this.getColorByHexadecimal(Schema.get_string('not-holiday-color')));
    this.el['not-holiday-color'].set_modal(true);
    this.el['not-holiday-color'].connect('color-set', (function (innerColor) {
      Schema.set_string('not-holiday-color', this.getHexadecimalByColor(innerColor.get_rgba()));
    }).bind(this));

    colorsGrid.append(this.el['pray-time-color']);
    colorsGrid.append(new Gtk.Label({ label: ' هنگام اوقات شرعی:' }));
    colorsGrid.append(this.el['holiday-color']);
    colorsGrid.append(new Gtk.Label({ label: ' روز تعطیل:' }));
    colorsGrid.append(this.el['not-holiday-color']);
    colorsGrid.append(new Gtk.Label({ label: ' روز عادی:' }));


    sensitiveFunc = () => {
      let els = ['pray-time-color', 'not-holiday-color', 'holiday-color'];
      let active = Schema.get_boolean('custom-color');
      els.forEach((el) => this.el[el].set_sensitive(active));
    }
    sensitiveFunc();
    Schema.connect('changed::custom-color', sensitiveFunc);






    this.el['widget-format'] = new Gtk.ComboBoxText();
    for (let showFormat of showFormats) this.el['widget-format'].append(
      showFormat,
      str.numbersFormat(
        str.dateStrFormat(
          showFormat,
          _dateObj.persianDay,
          _dateObj.persianMonth,
          _dateObj.persianYear,
          _dateObj.dayOfWeek,
          'persian'
        )
      )
    );
    this.el['widget-format'].set_active(Schema.get_string('widget-format'));
    Schema.bind('widget-format', this.el['widget-format'], 'active-id', Gio.SettingsBindFlags.DEFAULT);

    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 6 });
    hbox.append(this.el['widget-format']);
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(new Gtk.Label({ label: ' قالب: ' }));
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(this.el['position']);
    hbox.append(new Gtk.Label({ label: 'موقعیت: ' }));
    hbox.append(new Gtk.Label({ label: '' }));
    this.vbox1.append(hbox);

    this.vbox1.append(new Gtk.Label({ label: '' }));

    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 6 });
    hbox.append(colorsGrid);
    hbox.append(this.el['custom-color']);
    this.vbox1.append(hbox);


    this.vbox1.append(new Gtk.Label({ label: '\n' }));

    this.el['startup-notification'] = new Gtk.CheckButton({ label: 'اعلان متنی هنگام راه‌اندازی' });
    this.vbox1.append(this.el['startup-notification']);
    Schema.bind('startup-notification', this.el['startup-notification'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.vbox1.append(new Gtk.Label({ label: '\n' }));

    // FONT
    /* item = new Gtk.CheckButton({label: 'Use custom font'})
    this.vbox1.append(item)
    Schema.bind('custom-font', item, 'active', Gio.SettingsBindFlags.DEFAULT);
   
    label = new Gtk.Label({label: "Font: "});
    let font = new Gtk.FontButton();
    font.set_show_size(false);
    font.set_show_style(false);
   
    let _actor = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 0});
    _actor.add(label);
    _actor.add(font);
    font.set_font_name(Schema.get_string('font'));
   
    this.vbox1.append(_actor);
    font.connect('font-set', function(font){
    Schema.set_string('font', font.get_font_name());
    });*/
















    // TAB and DATES FORMAT
    let tabs = {
      dateConvert: "تبدیل تاریخ",
      prayTimes: "اوقات شرعی",
      events: "مناسبت‌ها"
    };
    this.el['default-tab'] = new Gtk.ComboBoxText();
    for (let i in tabs) this.el['default-tab'].append(i, tabs[i]);
    this.el['default-tab'].set_active(Schema.get_string('default-tab'));
    Schema.bind('default-tab', this.el['default-tab'], 'active-id', Gio.SettingsBindFlags.DEFAULT);
    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(this.el['default-tab']);
    hbox.append(new Gtk.Label({ label: 'زبانه‌ی فعّال پیشفرض: ' }));
    this.vbox2.append(hbox);



    this.vbox2.append(new Gtk.Label({ label: '\n\nنمایش تاریخ‌ها:\n' }));

    this.el['persian-display'] = new Gtk.CheckButton({ label: 'هجری شمسی' });
    Schema.bind('persian-display', this.el['persian-display'], 'active', Gio.SettingsBindFlags.DEFAULT);
    this.el['persian-display-format'] = new Gtk.ComboBoxText();
    for (let showFormat of showFormats) this.el['persian-display-format'].append(
      showFormat,
      str.numbersFormat(
        str.dateStrFormat(
          showFormat,
          _dateObj.persianDay,
          _dateObj.persianMonth,
          _dateObj.persianYear,
          _dateObj.dayOfWeek,
          'persian'
        )
      )
    );
    this.el['persian-display-format'].set_active(Schema.get_string('persian-display-format'));
    Schema.bind('persian-display-format', this.el['persian-display-format'], 'active-id', Gio.SettingsBindFlags.DEFAULT);
    sensitiveFunc = () => {
      this.el['persian-display-format'].set_sensitive(Schema.get_boolean('persian-display'));
    }
    sensitiveFunc();
    Schema.connect('changed::persian-display', sensitiveFunc);
    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(this.el['persian-display-format']);
    hbox.append(new Gtk.Label({ label: 'قالب: ' }));
    hbox.append(this.el['persian-display']);
    this.vbox2.append(hbox);


    this.vbox2.append(new Gtk.Label({ label: '' }));


    this.el['islamic-display'] = new Gtk.CheckButton({ label: 'هجری قمری' });
    Schema.bind('islamic-display', this.el['islamic-display'], 'active', Gio.SettingsBindFlags.DEFAULT);
    this.el['islamic-display-format'] = new Gtk.ComboBoxText();
    for (let showFormat of showFormats) this.el['islamic-display-format'].append(
      showFormat,
      str.numbersFormat(
        str.dateStrFormat(
          showFormat,
          _dateObj.islamicDay,
          _dateObj.islamicMonth,
          _dateObj.islamicYear,
          _dateObj.dayOfWeek,
          'islamic'
        )
      )
    );
    this.el['islamic-display-format'].set_active(Schema.get_string('islamic-display-format'));
    Schema.bind('islamic-display-format', this.el['islamic-display-format'], 'active-id', Gio.SettingsBindFlags.DEFAULT);
    sensitiveFunc = () => {
      this.el['islamic-display-format'].set_sensitive(Schema.get_boolean('islamic-display'));
    }
    sensitiveFunc();
    Schema.connect('changed::islamic-display', sensitiveFunc);
    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(this.el['islamic-display-format']);
    hbox.append(new Gtk.Label({ label: 'قالب: ' }));
    hbox.append(this.el['islamic-display']);
    this.vbox2.append(hbox);


    this.vbox2.append(new Gtk.Label({ label: '' }));


    this.el['gregorian-display'] = new Gtk.CheckButton({ label: 'میلادی' });
    Schema.bind('gregorian-display', this.el['gregorian-display'], 'active', Gio.SettingsBindFlags.DEFAULT);
    this.el['gregorian-display-format'] = new Gtk.ComboBoxText();
    for (let showFormat of showFormats) this.el['gregorian-display-format'].append(
      showFormat,
      // str.numbersFormat(
      str.dateStrFormat(
        showFormat,
        _dateObj.gregorianDay,
        _dateObj.gregorianMonth,
        _dateObj.gregorianYear,
        _dateObj.dayOfWeek,
        'gregorian'
      )
      // )
    );
    this.el['gregorian-display-format'].set_active(Schema.get_string('gregorian-display-format'));
    Schema.bind('gregorian-display-format', this.el['gregorian-display-format'], 'active-id', Gio.SettingsBindFlags.DEFAULT);
    sensitiveFunc = () => {
      this.el['gregorian-display-format'].set_sensitive(Schema.get_boolean('gregorian-display'));
    }
    sensitiveFunc();
    Schema.connect('changed::gregorian-display', sensitiveFunc);
    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(this.el['gregorian-display-format']);
    hbox.append(new Gtk.Label({ label: 'قالب: ' }));
    hbox.append(this.el['gregorian-display']);
    this.vbox2.append(hbox);



    this.vbox2.append(new Gtk.Label({ label: '\n' }));










    // EVENTS
    this.vbox3.append(new Gtk.Label({
      label: 'تنظیمات نمایش مناسبت‌ها:\n<span size="x-small">(مناسبت‌های رسمی و غیر رسمی قابل نمایش)</span>',
      use_markup: true
    }));

    this.el['show-persian-events'] = new Gtk.CheckButton({ label: 'مناسبت‌های رسمی کشور: هجری‌شمسی' });
    this.vbox3.append(this.el['show-persian-events']);
    Schema.bind('show-persian-events', this.el['show-persian-events'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['show-islamic-events'] = new Gtk.CheckButton({ label: 'مناسبت‌های رسمی کشور: هجری‌قمری' });
    this.vbox3.append(this.el['show-islamic-events']);
    Schema.bind('show-islamic-events', this.el['show-islamic-events'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['show-gregorian-events'] = new Gtk.CheckButton({ label: 'مناسبت‌های رسمی کشور: میلادی (جهانی)' });
    this.vbox3.append(this.el['show-gregorian-events']);
    Schema.bind('show-gregorian-events', this.el['show-gregorian-events'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['show-old-events'] = new Gtk.CheckButton({ label: 'مناسبت‌های غیر رسمی ایران باستان' });
    this.vbox3.append(this.el['show-old-events']);
    Schema.bind('show-old-events', this.el['show-old-events'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.vbox3.append(new Gtk.Label({ label: '\n\n\n' }));








    // WEEK
    this.vbox4.append(new Gtk.Label({ label: 'تنظیمات روزهای هفته\n\n' }));

    this.el['week-start'] = new Gtk.ComboBoxText();
    this.el['week-start'].append('0', 'شنبه');
    this.el['week-start'].append('1', 'یک‌شنبه');
    this.el['week-start'].append('2', 'دوشنبه');
    this.el['week-start'].append('3', 'سه‌شنبه');
    this.el['week-start'].append('4', 'چهارشنبه');
    this.el['week-start'].append('5', 'پنج‌شنبه');
    this.el['week-start'].append('6', 'جمعه');
    this.el['week-start'].set_active(Schema.get_string('week-start'));
    Schema.bind('week-start', this.el['week-start'], 'active-id', Gio.SettingsBindFlags.DEFAULT);
    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(this.el['week-start']);
    hbox.append(new Gtk.Label({ label: 'آغاز هفته: ' }));
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(new Gtk.Label({ label: '' }));
    this.vbox4.append(hbox);


    this.vbox4.append(new Gtk.Label({
      label: '\n\n\nروزهای تعطیل در هفته:',
      use_markup: true
    }));
    tmp = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    tmp.border_width = 1;
    this.vbox4.append(tmp);

    this.el['none-work-0'] = new Gtk.CheckButton({ label: 'شنبه' });
    Schema.bind('none-work-0', this.el['none-work-0'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['none-work-1'] = new Gtk.CheckButton({ label: 'یک‌شنبه' });
    Schema.bind('none-work-1', this.el['none-work-1'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['none-work-2'] = new Gtk.CheckButton({ label: 'دوشنبه' });
    Schema.bind('none-work-2', this.el['none-work-2'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['none-work-3'] = new Gtk.CheckButton({ label: 'سه‌شنبه' });
    Schema.bind('none-work-3', this.el['none-work-3'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['none-work-4'] = new Gtk.CheckButton({ label: 'چهارشنبه' });
    Schema.bind('none-work-4', this.el['none-work-4'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['none-work-5'] = new Gtk.CheckButton({ label: 'پنج‌شنبه' });
    Schema.bind('none-work-5', this.el['none-work-5'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['none-work-6'] = new Gtk.CheckButton({ label: 'جمعه' });
    Schema.bind('none-work-6', this.el['none-work-6'], 'active', Gio.SettingsBindFlags.DEFAULT);

    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(this.el['none-work-6']);
    hbox.append(this.el['none-work-5']);
    hbox.append(this.el['none-work-4']);
    hbox.append(this.el['none-work-3']);
    hbox.append(this.el['none-work-2']);
    hbox.append(this.el['none-work-1']);
    hbox.append(this.el['none-work-0']);
    hbox.append(new Gtk.Label({ label: '' }));
    this.vbox4.append(hbox);

    this.vbox4.append(new Gtk.Label({ label: '\n\n' }));


    this.el['reverse-direction'] = new Gtk.CheckButton({ label: 'ترتیب چیدمان برعکس' });
    Schema.bind('reverse-direction', this.el['reverse-direction'], 'active', Gio.SettingsBindFlags.DEFAULT);

    this.el['rotaton-to-vertical'] = new Gtk.CheckButton({ label: 'عمودی‌شدن جدول تقویم' });
    Schema.bind('rotaton-to-vertical', this.el['rotaton-to-vertical'], 'active', Gio.SettingsBindFlags.DEFAULT);

    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(this.el['reverse-direction']);
    hbox.append(new Gtk.Label({ label: '' }));
    hbox.append(this.el['rotaton-to-vertical']);
    hbox.append(new Gtk.Label({ label: '' }));
    this.vbox4.append(hbox);

    this.vbox4.append(new Gtk.Label({ label: '\n' }));






    //PrayTimes
    this.vbox5.append(new Gtk.Label({ label: 'تذکّر: حتماً نتایج نرم‌افزار را با اذان محلّی شهرتان مطابقت دهید و همیشه جوانب احتیاط را رعایت فرمایید!' }));
    tmp = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    tmp.border_width = 1;
    this.vbox5.append(tmp);


    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 3, margin_top: 6 });
    hbox.border_width = 3;

    const soundsUri = '.local/share/gnome-shell/extensions/' + extension.metadata.uuid + '/' + extension.imports.sound.soundsDir + '/';
    const sounds = {
      ...extension.imports.sound.sounds,
      "_custom_": [
        'انتخاب فایل سفارشی ←',
        '_custom_'
      ],
    };









    const ptCalcMethods = {
      Tehran: "انجمن ژئوفیزیک، دانشگاه تهران ☫",
      Jafari: "انجمن لواء، قم",
      MWL: "اتّحادیه‌ی جهانی اسلام، عربستان سعودی",
      ISNA: "جامعه‌ی اسلامی آمریکای شمالی",
      Egypt: "مرجع عمومی تحقیقات مصر",
      Makkah: "دانشگاه امّ‌القریٰ، مکّه",
      Karachi: "دانشگاه علوم اسلامی، کراچی"
    };

    // MainCalcMethod:
    this.el['praytime-calc-method-main'] = new Gtk.ComboBoxText();
    for (let i in ptCalcMethods) {
      this.el['praytime-calc-method-main'].append(i, ptCalcMethods[i]);
    }
    this.el['praytime-calc-method-main'].set_active_id(Schema.get_string('praytime-calc-method-main'));
    this.el['praytime-calc-method-main'].connect('changed', () => {
      Schema.set_string('praytime-calc-method-main', this.el['praytime-calc-method-main'].get_active_id().toString());
    });

    // EhtyiatCalcMethod:
    this.el['praytime-calc-method-ehtiyat'] = new Gtk.ComboBoxText();
    for (let i in ptCalcMethods) {
      this.el['praytime-calc-method-ehtiyat'].append(i, ptCalcMethods[i]);
    }
    this.el['praytime-calc-method-ehtiyat'].set_active_id(Schema.get_string('praytime-calc-method-ehtiyat'));
    this.el['praytime-calc-method-ehtiyat'].connect('changed', () => {
      Schema.set_string('praytime-calc-method-ehtiyat', this.el['praytime-calc-method-ehtiyat'].get_active_id().toString());
    });

    this.el['praytime-ehtiyat-show'] = new Gtk.CheckButton({ label: 'نمایش احتیاط' });
    Schema.bind('praytime-ehtiyat-show', this.el['praytime-ehtiyat-show'], 'active', Gio.SettingsBindFlags.DEFAULT);

    hbox.append(this.el['praytime-calc-method-main']);
    hbox.append(new Gtk.Label({ label: '      روش محاسبه‌ی اصلی: ' }));

    let prayTimeSetting = new Gtk.Button({ label: 'تنظیمات پیشرفته' });
    prayTimeSetting.connect('clicked', () => {

      let dialog = new Gtk.Dialog({
        title: 'تنظیمات پیشرفته‌ی اوقات شرعی',
        transient_for: this.vbox5.get_root(),
        use_header_bar: true,
        modal: true,
        default_width: 50
      });

      dialog.add_button('بازنشانی تنظیمات این بخش', 1);

      let hBoxSetting = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0, margin_top: 14, margin_bottom: 14, margin_start: 14, margin_end: 14 });
      hBoxSetting.border_width = 14;
      let vBoxSoundUri = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
      vBoxSoundUri.append(new Gtk.Label({ label: 'فایل' }));
      let vBoxSoundId = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
      vBoxSoundId.append(new Gtk.Label({ label: 'صدای اذان' }));
      let vBoxCalcMethod = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
      vBoxCalcMethod.append(new Gtk.Label({ label: 'طبق روش' }));
      let vBoxPlaySound = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
      vBoxPlaySound.append(new Gtk.Label({ label: 'پخش صدا' }));
      let vBoxTextNotify = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
      vBoxTextNotify.append(new Gtk.Label({ label: 'اعلان متنی' }));
      let vBoxShowTime = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
      vBoxShowTime.append(new Gtk.Label({ label: 'نمایش' }));
      let vBoxTitle = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
      vBoxTitle.append(new Gtk.Label({ label: '' }));
      hBoxSetting.append(vBoxSoundUri);
      hBoxSetting.append(vBoxSoundId);
      hBoxSetting.append(vBoxCalcMethod);
      hBoxSetting.append(vBoxPlaySound);
      hBoxSetting.append(vBoxTextNotify);
      hBoxSetting.append(vBoxShowTime);
      hBoxSetting.append(vBoxTitle);

      for (let tName in PrayTimes.persianMap) {
        const title = PrayTimes.persianMap[tName];
        const {
          ShowTime,
          TextNotify,
          PlaySound,
          CalcMethod,
          SoundId
        } = this.getPrayTimeSetting(tName);
        const SoundUri = Schema.get_string('praytime-' + tName + '-sound-uri');

        let label = new Gtk.Label({ label: title + ': ', margin_bottom: 11 });

        // SoundUri
        this.el['praytime-' + tName + '-sound-uri'] = new Gtk.Button({ label: '  →  غیرفعال  ', sensitive: (SoundId === '_custom_') });

        this.el['praytime-' + tName + '-sound-uri'].connect('clicked', () => {
          let fChNative = new Gtk.FileChooserNative({
            title: 'انتخاب یک فایل صوتی',
            transient_for: this.el['praytime-' + tName + '-sound-uri'].get_root(),
            modal: true,
            action: Gtk.FileChooserAction.OPEN,
            select_multiple: false
          });
          {
            let audioFilter = new Gtk.FileFilter;
            audioFilter.add_mime_type('audio/*');// 'audio/mpeg'
            fChNative.set_filter(audioFilter);
          }
          fChNative.connect('response', (native, response) => {
            if (response !== Gtk.ResponseType.ACCEPT) {
              return;
            }
            let fileURI = native.get_file().get_path();
            Schema.set_string('praytime-' + tName + '-sound-uri', fileURI);
            fileURI = fileURI.slice(0, fileURI.lastIndexOf('.'));
            fileURI = fileURI.slice(fileURI.lastIndexOf('/') + 1);
            if (fileURI.length > 8) fileURI = fileURI.slice(0, 8) + '...';
            this.btnIconLabel(this.el['praytime-' + tName + '-sound-uri'], fileURI);
          });
          fChNative.show();
        });

        // SoundId
        this.el['praytime-' + tName + '-setting_SoundId'] = new Gtk.ComboBoxText();
        for (let i in sounds) {
          this.el['praytime-' + tName + '-setting_SoundId'].append(i, sounds[i][0]);
        }
        this.el['praytime-' + tName + '-setting_SoundId'].set_active_id(SoundId);
        this.el['praytime-' + tName + '-setting_SoundId'].connect('changed', () => {
          let newSoundId = this.el['praytime-' + tName + '-setting_SoundId'].get_active_id().toString();
          this.setPrayTimeSetting(tName, 'SoundId', newSoundId);
          //this.el['praytime-' + tName + '-sound-uri'].set_sensitive(newSoundId === '_custom_');

          if (newSoundId === '_custom_') {
            //selectedSoundUri = '';
            this.el['praytime-' + tName + '-sound-uri'].set_sensitive(true);
            if (SoundUri === '' || SoundUri === 'Music') {
              this.btnIconLabel(this.el['praytime-' + tName + '-sound-uri'], '');
            } else {
              fileName = SoundUri.slice(0, SoundUri.lastIndexOf('.'));
              fileName = fileName.slice(fileName.lastIndexOf('/') + 1);
              if (fileName.length > 8) fileName = fileName.slice(0, 8) + '...';
              this.btnIconLabel(this.el['praytime-' + tName + '-sound-uri'], fileName);
            }
          } else {
            selectedSoundUri = soundsUri + sounds[newSoundId][1];
            this.el['praytime-' + tName + '-sound-uri'].set_sensitive(false);
            this.el['praytime-' + tName + '-sound-uri'].set_label('  →  غیرفعال  ');
          }
        });

        if (this.el['praytime-' + tName + '-setting_SoundId'].get_active_id().toString() === '_custom_') {
          if (SoundUri === '' || SoundUri === 'Music') {
            this.btnIconLabel(this.el['praytime-' + tName + '-sound-uri'], '');
          } else {
            fileName = SoundUri.slice(0, SoundUri.lastIndexOf('.'));
            fileName = fileName.slice(fileName.lastIndexOf('/') + 1);
            if (fileName.length > 8) fileName = fileName.slice(0, 8) + '...';
            this.btnIconLabel(this.el['praytime-' + tName + '-sound-uri'], fileName);
          }
        } else {
          this.el['praytime-' + tName + '-sound-uri'].set_label('  →  غیرفعال  ');
        }

        // CalcMethod
        let list = {
          main: "اصلی",
          ehtiyat: "احتیاط"
        };
        this.el['praytime-' + tName + '-setting_CalcMethod'] = new Gtk.ComboBoxText();
        for (let i in list) {
          this.el['praytime-' + tName + '-setting_CalcMethod'].append(i, list[i]);
        }
        this.el['praytime-' + tName + '-setting_CalcMethod'].set_active_id(CalcMethod);
        this.el['praytime-' + tName + '-setting_CalcMethod'].connect('changed', () => {
          this.setPrayTimeSetting(tName, 'CalcMethod', this.el['praytime-' + tName + '-setting_CalcMethod'].get_active_id());
        });

        // PlaySound & TextNotify & ShowTime
        list = {
          always: "همیشه",
          ramazan: "رمضان",
          never: "هیچگاه"
        };

        //PlaySound
        this.el['praytime-' + tName + '-setting_PlaySound'] = new Gtk.ComboBoxText();
        for (let i in list) {
          this.el['praytime-' + tName + '-setting_PlaySound'].append(i, list[i]);
        }
        this.el['praytime-' + tName + '-setting_PlaySound'].set_active_id(PlaySound);
        sensitiveFunc = (playSound, tName_) => {
          let active = (playSound !== 'never');
          let els = ['praytime-' + tName_ + '-setting_SoundId', 'praytime-' + tName_ + '-setting_CalcMethod'];
          els.forEach((el) => this.el[el].set_sensitive(active));
          //
          let newSoundId = this.el['praytime-' + tName_ + '-setting_SoundId'].get_active_id().toString();
          this.el['praytime-' + tName_ + '-sound-uri'].set_sensitive(active && newSoundId === '_custom_');
        }
        sensitiveFunc(PlaySound, tName);
        this.el['praytime-' + tName + '-setting_PlaySound'].connect('changed', () => {
          let playSound = this.el['praytime-' + tName + '-setting_PlaySound'].get_active_id();
          this.setPrayTimeSetting(tName, 'PlaySound', playSound);
          sensitiveFunc(playSound, tName);
        });

        //TextNotify
        this.el['praytime-' + tName + '-setting_TextNotify'] = new Gtk.ComboBoxText({
          margin_start: 4,
          margin_end: 4
        });
        for (let i in list) {
          this.el['praytime-' + tName + '-setting_TextNotify'].append(i, list[i]);
        }
        this.el['praytime-' + tName + '-setting_TextNotify'].set_active_id(TextNotify);
        this.el['praytime-' + tName + '-setting_TextNotify'].connect('changed', () => {
          this.setPrayTimeSetting(tName, 'TextNotify', this.el['praytime-' + tName + '-setting_TextNotify'].get_active_id());
        });

        //ShowTime
        this.el['praytime-' + tName + '-setting_ShowTime'] = new Gtk.ComboBoxText();
        for (let i in list) {
          this.el['praytime-' + tName + '-setting_ShowTime'].append(i, list[i]);
        }
        this.el['praytime-' + tName + '-setting_ShowTime'].set_active_id(ShowTime);
        this.el['praytime-' + tName + '-setting_ShowTime'].connect('changed', () => {
          this.setPrayTimeSetting(tName, 'ShowTime', this.el['praytime-' + tName + '-setting_ShowTime'].get_active_id());
        });

        vBoxSoundUri.append(this.el['praytime-' + tName + '-sound-uri']);
        vBoxSoundId.append(this.el['praytime-' + tName + '-setting_SoundId']);
        vBoxCalcMethod.append(this.el['praytime-' + tName + '-setting_CalcMethod']);
        vBoxPlaySound.append(this.el['praytime-' + tName + '-setting_PlaySound']);
        vBoxTextNotify.append(this.el['praytime-' + tName + '-setting_TextNotify']);
        vBoxShowTime.append(this.el['praytime-' + tName + '-setting_ShowTime']);
        vBoxTitle.append(label);

      }

      dialog.get_content_area().append(hBoxSetting);

      dialog.connect('response', (dialog, id) => {
        if (id == 1) {
          this._resetPrayTimesAdvanceSettings();
        } else {
          //dialog.get_content_area().remove(hBoxSetting);
          //dialog.destroy();
        }
        return;
      });

      dialog.present();
    });
    hbox.append(prayTimeSetting);

    this.vbox5.append(hbox);



    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 3 });
    hbox.border_width = 3;
    hbox.append(this.el['praytime-calc-method-ehtiyat']);
    hbox.append(new Gtk.Label({ label: 'احتیاط بین روش اصلی و روش: ' }));
    hbox.append(this.el['praytime-ehtiyat-show']);
    this.vbox5.append(hbox);


    tmp = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    tmp.border_width = 3;
    this.vbox5.append(tmp);


    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 3 });
    hbox.border_width = 3;
    this.el['praytime-city'] = new Gtk.Entry({ max_length: 22, width_chars: 22 });

    this.el['praytime-lat'] = new Gtk.Entry({ max_length: 7, width_chars: 7 });
    hbox.append(this.el['praytime-lat']);
    hbox.append(new Gtk.Label({ label: '    عرض جغرافیایی: ' }));
    this.el['praytime-lat'].set_text(Schema.get_double('praytime-lat').toString());
    this.el['praytime-lat'].connect('changed', () => {
      if (isNaN(parseFloat(this.el['praytime-lat'].text))) return false;
      Schema.set_double('praytime-lat', parseFloat(this.el['praytime-lat'].text));
      this.el['praytime-city'].set_text('_سفارشی_');
      Schema.set_string('praytime-city', '_سفارشی_');
    });

    this.el['praytime-lng'] = new Gtk.Entry({ max_length: 7, width_chars: 7 });
    hbox.append(this.el['praytime-lng']);
    hbox.append(new Gtk.Label({ label: '      طول جغرافیایی: ' }));
    this.el['praytime-lng'].set_text(Schema.get_double('praytime-lng').toString());
    this.el['praytime-lng'].connect('changed', () => {
      if (isNaN(parseFloat(this.el['praytime-lng'].text))) return false;
      Schema.set_double('praytime-lng', parseFloat(this.el['praytime-lng'].text));
      this.el['praytime-city'].set_text('_سفارشی_');
      Schema.set_string('praytime-city', '_سفارشی_');
    });




    const chaneLocation = (cityData) => {
      this.el['praytime-lat'].set_text(cityData[1].toString());
      Schema.set_double('praytime-lat', cityData[1]);

      this.el['praytime-lng'].set_text(cityData[2].toString());
      Schema.set_double('praytime-lng', cityData[2]);

      this.el['praytime-city'].set_text(cityData[0]);
      Schema.set_string('praytime-city', cityData[0]);
    }



    let selectCity = new Gtk.Button({ label: 'انتخاب شهر از فهرست' });
    selectCity.connect('clicked', () => {
      let _stateId = Schema.get_int('praytime-state');
      let _cityData = [Schema.get_string('praytime-city'), 0, 0];

      let dialog = new Gtk.Dialog({
        title: 'انتخاب شهر از فهرست',
        transient_for: this.vbox5.get_root(),
        use_header_bar: true,
        modal: true,
        default_width: 50
      });

      dialog.add_button('بازنشانی', 1);//Reset Button

      this.el['praytime-state'] = new Gtk.ComboBoxText();
      this.el['praytime-city_ComboBox'] = new Gtk.ComboBoxText();

      for (let i in Cities.cities) {
        this.el['praytime-state'].append(
          i,
          str.numbersFormat(
            str.dateStrFormat(
              Cities.cities[i][0],
              _dateObj.persianDay,
              _dateObj.persianMonth,
              _dateObj.persianYear,
              _dateObj.dayOfWeek,
              'persian'
            )
          )
        );
      }
      if (Cities.cities[_stateId] !== undefined) this.el['praytime-state'].set_active(_stateId);



      const changeStateAndCity = (stateId, cityName = null) => {
        this.el['praytime-city_ComboBox'].remove_all();
        let cityId = -1;
        let centerId = 0;
        let cities = Cities.cities[stateId];
        for (let i in cities) {
          if (i == 0) continue;
          if (cityName !== null && cityName === cities[i][0]) cityId = i - 1;
          if (cities[i][3] !== undefined) centerId = i - 1;
          this.el['praytime-city_ComboBox'].append(
            cities[i][0],
            str.numbersFormat(
              str.dateStrFormat(
                cities[i][0],
                _dateObj.persianDay,
                _dateObj.persianMonth,
                _dateObj.persianYear,
                _dateObj.dayOfWeek,
                'persian'
              )
            )
          );
        }

        if (cityId === -1) cityId = centerId;
        this.el['praytime-city_ComboBox'].set_active(cityId);
        _cityData = Cities.cities[stateId][cityId + 1];
      }

      this.el['praytime-city_ComboBox'].connect('changed', () => {
        _cityData = Cities.cities[_stateId][this.el['praytime-city_ComboBox'].get_active() + 1];
      });

      changeStateAndCity(_stateId, _cityData[0]);
      this.el['praytime-state'].connect('changed', () => {
        _stateId = this.el['praytime-state'].get_active();
        changeStateAndCity(_stateId, _cityData[0]);
      });



      let box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL, spacing: 10, halign: Gtk.Align.CENTER, margin_top: 14, margin_bottom: 14, margin_start: 14, margin_end: 14
      });

      let boxH = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
      boxH.append(this.el['praytime-city_ComboBox']);
      boxH.append(new Gtk.Label({ label: '      شهر: ' }));
      boxH.append(this.el['praytime-state']);
      boxH.append(new Gtk.Label({ label: 'استان: ' }));
      box.append(boxH);

      let stateAndCitySubmit = new Gtk.Button({ label: '\nذخیره\n', margin_top: 14 });
      box.append(stateAndCitySubmit);

      box.append(new Gtk.Label({
        label: '<span size="small">\nاگر مکان شما در فهرست بالا نیست و یا مختصات آن اشتباه است،\nمی‌توانید در صفحه‌ی اصلی، اطّلاعات را به‌صورت دستی وارد نمایید.</span>',
        use_markup: true
      }));

      dialog.get_content_area().append(box);

      stateAndCitySubmit.connect('clicked', () => {
        chaneLocation(_cityData);
        Schema.set_int('praytime-state', _stateId);
        // this.el['praytime-timezone'].set_active(18);//index 18: Asia/Tehran
        // Schema.set_double('praytime-timezone', 3.5);//TZ 3.5: Asia/Tehran
      });

      dialog.connect('response', (dialog, id) => {
        if (id == 1) {
          changeStateAndCity(7);// 7: Tehran State
          this.el['praytime-state'].set_active(7);// 7: Tehran State
          Schema.bind('praytime-state', this.el['praytime-state'], 'active-id', Gio.SettingsBindFlags.DEFAULT);
          // this.el['praytime-timezone'].set_active(18);//index 18: Asia/Tehran
          // Schema.set_double('praytime-timezone', 3.5);//TZ 3.5: Asia/Tehran
        } else {
          // remove the settings box so it doesn't get destroyed;
          // this.el['praytime-state'].set_active(7);// 7: Tehran State
          // Schema.bind('praytime-state', this.el['praytime-state'], 'active-id', Gio.SettingsBindFlags.DEFAULT);
          //dialog.get_content_area().remove(box);
          //dialog.destroy();
        }
        return;
      });

      dialog.present();
    });

    hbox.append(selectCity);
    this.vbox5.append(hbox);

    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 3 });
    hbox.border_width = 3;

    // let tzs = [
    //   [-12, 'UTC−12:00'],
    //   [-11, 'UTC−11:00'],
    //   [-10, 'UTC−10:00'],
    //   [-9.5, 'UTC−09:30'],
    //   [-9, 'UTC−09:00'],
    //   [-8, 'UTC−08:00'],
    //   [-7, 'UTC−07:00'],
    //   [-6, 'UTC−06:00'],
    //   [-5, 'UTC−05:00'],
    //   [-4, 'UTC−04:00'],
    //   [-3.5, 'UTC−03:30'],
    //   [-3, 'UTC−03:00'],
    //   [-2, 'UTC−02:00'],
    //   [-1, 'UTC−01:00'],
    //   [0, 'UTC±00:00'],
    //   [1, 'UTC+01:00'],
    //   [2, 'UTC+02:00'],
    //   [3, 'UTC+03:00'],
    //   [3.5, 'UTC+03:30'],
    //   [4, 'UTC+04:00'],
    //   [4.5, 'UTC+04:30'],
    //   [5, 'UTC+05:00'],
    //   [5.5, 'UTC+05:30'],
    //   [5.75, 'UTC+05:45'],
    //   [6, 'UTC+06:00'],
    //   [6.5, 'UTC+06:30'],
    //   [7, 'UTC+07:00'],
    //   [8, 'UTC+08:00'],
    //   [8.75, 'UTC+08:45'],
    //   [9, 'UTC+09:00'],
    //   [9.5, 'UTC+09:30'],
    //   [10, 'UTC+10:00'],
    //   [10.5, 'UTC+10:30'],
    //   [11, 'UTC+11:00'],
    //   [12, 'UTC+12:00'],
    //   [12.75, 'UTC+12:45'],
    //   [13, 'UTC+13:00'],
    //   [14, 'UTC+14:00']
    // ];
    // this.el['praytime-timezone'] = new Gtk.ComboBoxText();
    // let _tz = Schema.get_double('praytime-timezone');
    // let tzIndex = -1;
    // for (let i in tzs) {
    //   this.el['praytime-timezone'].append(tzs[i][0].toString(), tzs[i][1]);
    //   if (tzs[i][0] === _tz) tzIndex = i;
    // }
    // this.el['praytime-timezone'].set_active(tzIndex);
    // this.el['praytime-timezone'].connect('changed', () => {
    //   Schema.set_double('praytime-timezone', parseFloat(tzs[this.el['praytime-timezone'].get_active()][0]));
    // });
    // hbox.append(this.el['praytime-timezone']);
    // hbox.append(new Gtk.Label({ label: '      اختلاف ساعت: ' }));

    // let tzEl = new Gtk.Entry({ max_length: 22, width_chars: 22 });
    // tzEl.set_text(Schema.get_double('praytime-timezone').toString());
    // //Schema.bind('praytime-timezone', tzEl, 'active', Gio.SettingsBindFlags.DEFAULT);
    // tzEl.connect('changed', () => {
    //   Schema.set_double('praytime-timezone', parseFloat(tzEl.text));
    // });
    // hbox.append(tzEl);
    // hbox.append(new Gtk.Label({ label: '      اختلاف ساعت: ' }));
    // // let tzEl = this.createTextEntry('praytime-timezone', 'منطقه‌ی زمانی: ');
    // // hbox.append(tzEl.hbox);
    // // if (tzEl.comment) this.vbox5.append(tzEl.comment);



    this.el['praytime-city'].set_text(Schema.get_string('praytime-city'));
    this.el['praytime-city'].connect('changed', () => {
      Schema.set_string('praytime-city', this.el['praytime-city'].text);
    });
    hbox.append(this.el['praytime-city']);
    hbox.append(new Gtk.Label({ label: 'نام نمایشی مکان: ' }));


    this.vbox5.append(hbox);

    tmp = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    tmp.border_width = 3;
    this.vbox5.append(tmp);

    hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 3 });
    hbox.border_width = 3;


    let playSounds = new Gtk.Button({ label: 'آزمایش صداها' });
    playSounds.connect('clicked', () => {


      let dialog = new Gtk.Dialog({
        title: 'آزمایش صداها',
        transient_for: this.vbox1.get_root(),
        use_header_bar: true,
        modal: true,
        default_width: 50
      });


      let selectedSound = '';
      let selectedSoundUri = '';
      let selectedSoundFileName = '';


      let btnFCh = new Gtk.Button({ label: '  →  غیرفعال  ', sensitive: false });


      btnFCh.connect('clicked', () => {

        this.el['play-sound-file-test'] = new Gtk.FileChooserNative({
          title: 'انتخاب یک فایل صوتی',
          transient_for: btnFCh.get_root(),
          modal: true,
          action: Gtk.FileChooserAction.OPEN,
          select_multiple: false
        });
        {
          let audioFilter = new Gtk.FileFilter;
          audioFilter.add_mime_type('audio/*');// 'audio/mpeg'
          this.el['play-sound-file-test'].set_filter(audioFilter);
        }

        this.el['play-sound-file-test'].connect('response', (native, response) => {
          if (response !== Gtk.ResponseType.ACCEPT) {
            return;
          }
          let fileURI = native.get_file().get_path();
          selectedSoundUri = fileURI;
          fileURI = fileURI.slice(0, fileURI.lastIndexOf('.'));
          fileURI = fileURI.slice(fileURI.lastIndexOf('/') + 1);
          if (fileURI.length > 8) fileURI = fileURI.slice(0, 8) + '...';
          this.btnIconLabel(btnFCh, fileURI);
          selectedSoundFileName = fileURI;
        });
        this.el['play-sound-file-test'].show();
      });



      this.el['play-sound-test'] = new Gtk.ComboBoxText();
      for (let i in sounds) {
        if (selectedSound === '') {
          selectedSound = i;
          selectedSoundUri = soundsUri + sounds[selectedSound][1];
        }
        this.el['play-sound-test'].append(
          i,
          sounds[i][0]
        );
      }
      this.el['play-sound-test'].set_active(selectedSound);
      this.el['play-sound-test'].connect('changed', () => {
        selectedSound = this.el['play-sound-test'].get_active_id();
        if (selectedSound === '_custom_') {
          btnFCh.set_sensitive(true);
          if (selectedSoundUri === '') {
            this.btnIconLabel(btnFCh, '');
          } else {
            this.btnIconLabel(btnFCh, selectedSoundFileName);
          }
        } else {
          selectedSoundUri = soundsUri + sounds[selectedSound][1];
          btnFCh.set_sensitive(false);
          btnFCh.set_label('  →  غیرفعال  ');
        }
        if (player !== null && player.isPlaying()) {
          player.pause();
          playPauseBtn.label = 'پخش';
        }
      });

      let box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL, spacing: 10, halign: Gtk.Align.CENTER, margin_top: 14, margin_bottom: 14, margin_start: 14, margin_end: 14
      });

      let boxH = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
      boxH.append(btnFCh);
      boxH.append(this.el['play-sound-test']);
      boxH.append(new Gtk.Label({ label: 'عنوان صدا: ' }));
      box.append(boxH);



      let valume = 0;
      let testValume = new Gtk.Scale;
      testValume.set_size_request(293, 14);
      testValume.set_range(0.0, 1.0);
      testValume.set_value(Schema.get_double('praytime-play-valume'));
      const DEFAULT_ICONS_SIZES = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      for (let i in DEFAULT_ICONS_SIZES) {
        testValume.add_mark(DEFAULT_ICONS_SIZES[i], Gtk.PositionType.TOP, '');
      }
      this._rtl = (Gtk.Widget.get_default_direction() == Gtk.TextDirection.RTL);
      if (this._rtl) {
        testValume.set_value_pos(Gtk.PositionType.LEFT);
        testValume.set_flippable(false);
        testValume.set_inverted(true);
      }
      testValume.connect('change-value', (scroll, value) => {
        valume = value;
      });
      boxH = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
      boxH.append(testValume);
      boxH.append(new Gtk.Label({ label: 'شدّت صدا:' }));
      box.append(boxH);



      let playPauseBtn = new Gtk.Button({ label: 'پخش', margin_top: 14 });
      playPauseBtn.connect('clicked', () => {
        if (player === null) return;
        if (player.isPlaying()) {
          player.pause();
          testValume.set_sensitive(true);
          playPauseBtn.label = 'پخش';
        } else if (selectedSoundUri !== '') {
          player.setVolume(valume);
          player.setUri(selectedSoundUri);
          player.play();
          player.onEnd = () => {
            testValume.set_sensitive(true);
            playPauseBtn.label = 'پخش';
          }
          testValume.set_sensitive(false);
          playPauseBtn.label = 'توقّف';
        }
      });
      box.append(playPauseBtn);

      box.append(new Gtk.Label({
        label: '<span size="medium" color="#999">\nاین صفحه فقط برای شنیدن و آزمایش صداهاست.\nتغییر موارد بالا، هرگز در تنظیمات ذخیره نمی‌شود.</span>',
        use_markup: true
      }));

      dialog.get_content_area().append(box);

      dialog.connect('response', (dialog, id) => {
        if (id != 1) {
          if (player !== null && player.isPlaying()) player.pause();
          //dialog.get_content_area().remove(box);
          //dialog.destroy();
        }
        return;
      });

      dialog.present();
    });





    this.el['praytime-play-valume'] = new Gtk.Scale;
    this.el['praytime-play-valume'].set_size_request(220, 14);
    this.el['praytime-play-valume'].set_range(0.0, 1.0);
    this.el['praytime-play-valume'].set_value(Schema.get_double('praytime-play-valume'));
    const DEFAULT_ICONS_SIZES = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    for (let i in DEFAULT_ICONS_SIZES) {
      this.el['praytime-play-valume'].add_mark(DEFAULT_ICONS_SIZES[i], Gtk.PositionType.TOP, '');
    }
    this._rtl = (Gtk.Widget.get_default_direction() == Gtk.TextDirection.RTL);
    if (this._rtl) {
      this.el['praytime-play-valume'].set_value_pos(Gtk.PositionType.LEFT);
      this.el['praytime-play-valume'].set_flippable(false);
      this.el['praytime-play-valume'].set_inverted(true);
    }
    this.el['praytime-play-valume'].connect('value-changed', () => {
      Schema.set_double('praytime-play-valume', this.el['praytime-play-valume'].get_value());
    });
    this.el['label_praytime-play-valume'] = new Gtk.Label({ label: 'شدّت صدا:' });

    this.el['praytime-play-and-notify'] = new Gtk.CheckButton({ label: 'اعلان و پخش اذان' });
    Schema.bind('praytime-play-and-notify', this.el['praytime-play-and-notify'], 'active', Gio.SettingsBindFlags.DEFAULT);

    if (player !== null) {
      hbox.append(playSounds);
      hbox.append(this.el['praytime-play-valume']);
      hbox.append(this.el['label_praytime-play-valume']);
      hbox.append(this.el['praytime-play-and-notify']);
    } else {
      hbox.append(new Gtk.Label({
        label: '<span size="medium" color="#f66">برای پخش اذان، باید کتابخانه‌ی gir1.2-gst-plugins-base-1.0 را نصب نمایید:\n</span><span size="large" color="#66f">sudo apt install gir1.2-gst-plugins-base-1.0</span>',
        use_markup: true
      }));
    }
    this.vbox5.append(hbox);




    this.vbox6.set_spacing(1);

    // Reset Settings
    this.vbox6.append(new Gtk.Label({
      label: 'با انجام عمل بازنشانی، تنظیمات این افزونه به حالت پیشفرض اوّلیه باز خواهد گردید.',
      use_markup: true
    }));
    tmp = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    tmp.border_width = 1;
    this.vbox6.append(tmp);

    let resetBtn = new Gtk.Button({ label: 'بازنشانی تنظیمات «نوار وضعیت»' });
    resetBtn.connect('clicked', () => this._resetConfig(['vbox1']));
    this.vbox6.append(resetBtn);

    resetBtn = new Gtk.Button({ label: 'بازنشانی تنظیمات «نمایش»' });
    resetBtn.connect('clicked', () => this._resetConfig(['vbox2']));
    this.vbox6.append(resetBtn);

    resetBtn = new Gtk.Button({ label: 'بازنشانی تنظیمات «مناسبت‌ها»' });
    resetBtn.connect('clicked', () => this._resetConfig(['vbox3']));
    this.vbox6.append(resetBtn);

    resetBtn = new Gtk.Button({ label: 'بازنشانی تنظیمات «هفته»' });
    resetBtn.connect('clicked', () => this._resetConfig(['vbox4']));
    this.vbox6.append(resetBtn);

    resetBtn = new Gtk.Button({ label: 'بازنشانی تنظیمات «اوقات شرعی»، بخش عادی' });
    resetBtn.connect('clicked', () => this._resetConfig(['vbox5']));
    this.vbox6.append(resetBtn);

    resetBtn = new Gtk.Button({ label: 'بازنشانی بخش «تنظیمات پیشرفته» اوقات شرعی' });
    resetBtn.connect('clicked', () => this._resetPrayTimesAdvanceSettings());
    this.vbox6.append(resetBtn);

    tmp = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    tmp.border_width = 1;
    this.vbox6.append(tmp);

    resetBtn = new Gtk.Button({ label: '\nبازنشانی همه‌ی تنظیمات بالا به‌صورت یکجا\n' });
    resetBtn.connect('clicked', () => {
      this._resetConfig();
      this._resetPrayTimesAdvanceSettings();
    });
    this.vbox6.append(resetBtn);

    this.vbox7.append(new Gtk.Label({
      label: 'افزونه‌ی تقویم هجری شمسی، قمری و میلادی برای میز‌کار گنوم لینوکس\n\nصفحه‌ی رسمی (دریافت آخرین نسخه):\n<a href="https://jdf.scr.ir/gnome_shamsi_calendar">https://jdf.scr.ir/gnome_shamsi_calendar</a>\n\nحمایت مالی:\n<a href="https://scr.ir/pardakht/?hemayat=gnome_shamsi_calendar">https://scr.ir/pardakht/?hemayat=gnome_shamsi_calendar</a>\n\nصفحه‌ی گنوم:\n<a href="https://extensions.gnome.org/extension/3618/">https://extensions.gnome.org/extension/3618</a>\n\nکد منبع:\n<a href="https://github.com/scr-ir/gnome-shamsi-calendar/">https://github.com/scr-ir/gnome-shamsi-calendar</a>',
      use_markup: true
    }));
  },

  _resetPrayTimesAdvanceSettings: function () {
    for (let tName in PrayTimes.persianMap) {
      Schema.reset('praytime-' + tName + '-setting');
      Schema.reset('praytime-' + tName + '-sound-uri');
      if (this.el['praytime-imsak-setting_ShowTime'] === undefined) continue;
      const settings = this.getPrayTimeSetting(tName);
      // Schema: Times Setting value="ShowTime,TextNotify,PlaySound,CalcMethod,SoundId"
      ['ShowTime', 'TextNotify', 'PlaySound', 'CalcMethod', 'SoundId'].forEach((indexId) => {
        this.el['praytime-' + tName + '-setting_' + indexId].set_active_id(settings[indexId]);
      });
      let SoundUri = Schema.get_string('praytime-' + tName + '-sound-uri');
      if (this.el['praytime-' + tName + '-setting_SoundId'].get_active_id().toString() === '_custom_') {
        if (SoundUri === '' || SoundUri === 'Music') {
          this.btnIconLabel(this.el['praytime-' + tName + '-sound-uri'], '');
        } else {
          fileName = SoundUri.slice(0, SoundUri.lastIndexOf('.'));
          fileName = fileName.slice(fileName.lastIndexOf('/') + 1);
          if (fileName.length > 8) fileName = fileName.slice(0, 8) + '...';
          this.btnIconLabel(this.el['praytime-' + tName + '-sound-uri'], fileName);
        }
      } else {
        this.el['praytime-' + tName + '-sound-uri'].set_label('  →  غیرفعال  ');
      }
    }
  },

  _resetConfig: function (sections = ['vbox1', 'vbox2', 'vbox3', 'vbox4', 'vbox5']) {
    const keysObj = {
      vbox1: {
        'widget-format': 'ComboBoxText',
        'position': 'ComboBoxText',
        'pray-time-color': 'ColorButton',
        'holiday-color': 'ColorButton',
        'not-holiday-color': 'ColorButton',
        'custom-color': 'CheckButton',
        'startup-notification': 'CheckButton'
      },
      vbox2: {
        'default-tab': 'ComboBoxText',
        'persian-display-format': 'ComboBoxText',
        'persian-display': 'CheckButton',
        'islamic-display-format': 'ComboBoxText',
        'islamic-display': 'CheckButton',
        'gregorian-display-format': 'ComboBoxText',
        'gregorian-display': 'CheckButton'
      },
      vbox3: {
        'show-persian-events': 'CheckButton',
        'show-islamic-events': 'CheckButton',
        'show-gregorian-events': 'CheckButton',
        'show-old-events': 'CheckButton'
      },
      vbox4: {
        'week-start': 'ComboBoxText',
        'none-work-0': 'CheckButton',
        'none-work-1': 'CheckButton',
        'none-work-2': 'CheckButton',
        'none-work-3': 'CheckButton',
        'none-work-4': 'CheckButton',
        'none-work-5': 'CheckButton',
        'none-work-6': 'CheckButton',
        'reverse-direction': 'CheckButton',
        'rotaton-to-vertical': 'CheckButton'
      },
      vbox5: {
        'praytime-calc-method-main': 'ComboBoxText',
        'praytime-calc-method-ehtiyat': 'ComboBoxText',
        'praytime-ehtiyat-show': 'CheckButton',
        'praytime-lat': 'Entry-Double',
        'praytime-lng': 'Entry-Double',
        'praytime-city': 'Entry-String',
        'praytime-state': '_only_reset_schema_',
        'praytime-play-valume': 'Scale',
        'praytime-play-and-notify': 'CheckButton'
      }
    };


    for (let i in sections) {
      for (let key in keysObj[sections[i]]) {
        Schema.reset(key);
        switch (keysObj[sections[i]][key]) {
          case 'Entry-String':
            this.el[key].set_text(Schema.get_string(key));
            break;
          case 'Entry-Double':
            this.el[key].set_text(Schema.get_double(key).toString());
            break;
          case 'CheckButton':
            Schema.bind(key, this.el[key], 'active', Gio.SettingsBindFlags.DEFAULT);
            break;
          case 'ColorButton':
            this.el[key].set_modal(this.getColorByHexadecimal(Schema.get_string(key)));
            break;
          case 'ComboBoxText':
            Schema.bind(key, this.el[key], 'active-id', Gio.SettingsBindFlags.DEFAULT);
            break;
          case 'Scale':
            this.el[key].set_value(Schema.get_double(key));
            break;
        }
      }
    }
  },

  setPrayTimeSetting: function (tName, indexId, value) {
    indexId = indexId.toString();
    // Schema: Times Setting value="ShowTime,TextNotify,PlaySound,CalcMethod,SoundId"
    const indexIds = {
      ShowTime: 0,
      TextNotify: 1,
      PlaySound: 2,
      CalcMethod: 3,
      SoundId: 4
    };
    let setting = Schema.get_string('praytime-' + tName + '-setting').split(',');
    setting[indexIds[indexId]] = value;
    Schema.set_string('praytime-' + tName + '-setting', setting.join(','));
  },

  getPrayTimeSetting: function (tName) {
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
  },

  btnIconLabel: function (btn, label = '') {
    let boxH = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    boxH.append(new Gtk.Image({ icon_name: (label === '') ? 'folder' : 'audio-x-generic' }));
    boxH.append(new Gtk.Label({ label: ' ' + ((label === '') ? 'انتخاب' : label) + ' ' }));
    btn.set_child(boxH);
  },

  createTextEntry: function (value, labelText, commentText) {
    let label = new Gtk.Label({ label: labelText });
    let format = new Gtk.Entry();
    let hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    hbox.append(label);
    hbox.append(format);
    let comment = null;
    if (commentText)
      comment = new Gtk.Label({
        label: commentText,
        use_markup: true
      });
    format.set_text(Schema.get_double(value).toString());
    format.connect('changed', function (innerFormat) {
      Schema.set_string(value, innerFormat.text);
    });

    return { hbox: hbox, comment: comment };
  },

  _dec2Hex: function (value) {
    value = parseInt(value * 255).toString(16);
    while (value.length < 2) {
      value = '0' + value;
    }
    return value;
  },

  getColorByHexadecimal: function (hex) {
    let color = new Gdk.RGBA();
    color.parse(hex);
    if (!color) color.parse('#cc0000');
    return color;
  },

  getHexadecimalByColor: function (color) {
    return '#' + this._dec2Hex(color.red) + this._dec2Hex(color.green) + this._dec2Hex(color.blue);
  }

});

function buildPrefsWidget() {
  let widget = new App();
  return widget.main_hbox;
}