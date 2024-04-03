function iranLunar() {
  this._init();
}

iranLunar.prototype = {
  name: 'مناسبت‌های مذهبی ایران',
  type: 'hijri',
  /* [month][day] = [title, isHoliday] */
  events: [[], [], [], [], [], [], [], [], [], [], [], [], []],

  _init: function () {

    this.events[1][1] = [[
      ['آغاز سال هجری قمری (اوّل ماه محرّم)'],
    ]];

    this.events[1][9] = [[
      ['تاسوعای حسینی', true],
    ], true];

    this.events[1][10] = [[
      ['عاشورای حسینی', true],
    ], true];

    this.events[1][11] = [[
      ['روز تجلیل از اسرا و مفقودان'],
    ]];

    this.events[1][12] = [[
      ['شهادت حضرت امام زین‌العابدین علیه‌السلام (۹۵ ه‍.ق)'],
    ]];

    this.events[1][25] = [[
      ['شهادت حضرت امام زین‌العابدین علیه‌السلام :به روایتی (۹۵ ه‍.ق)'],
    ]];

    this.events[2][7] = [[
      ['شهادت حضرت امام حسن مجتبی علیه‌السلام :به روایتی (۵۰ ه‍.ق)'],
      ['روز بزرگداشت سلمان فارسی'],
    ]];

    this.events[2][20] = [[
      ['اربعین حسینی', true],
    ], true];

    this.events[2][28] = [[
      ['رحلت حضرت رسول اکرم صلی اللّه علیه و آله (۱۱ ه‍.ق)', true],
      ['شهادت حضرت امام حسن مجتبی علیه‌السلام (۵۰ ه‍.ق)', true],
    ], true];

    this.events[2][29] = [[
      ['شهادت حضرت امام رضا علیه‌السلام', true],
    ], true];

    this.events[3][1] = [[
      ['هجرت حضرت رسول اکرم صلی اللّه علیه و آله از مکّه به مدینه'],
    ]];

    this.events[3][8] = [[
      ['شهادت حضرت امام حسن عسکری علیه‌السلام (۲۶۰ ه‍.ق)', true],
      ['آغاز امامت حضرت ولی‌عصر (عج) (۲۶۰ ه‍.ق)', true],
    ], true];

    this.events[3][12] = [[
      ['ولادت حضرت رسول اکرم صلی اللّه علیه و آله :به روایت اهل سنت (۵۳ سال قبل از هجرت)'],
      ['آغاز هفته‌ی وحدت'],
    ]];

    this.events[3][14] = [[
      ['روز سیستان و بلوچستان'],
    ]];

    this.events[3][16] = [[
      ['روز وقف'],
    ]];

    this.events[3][17] = [[
      ['ولادت حضرت رسول اکرم صلی اللّه علیه و آله - روز اخلاق و مهرورزی (۵۳ سال قبل از هجرت)', true],
      ['ولادت حضرت امام جعفر صادق علیه‌السلام، مؤسس مذهب جعفری (۸۳ ه‍.ق)', true],
    ], true];

    this.events[4][4] = [[
      ['ولادت حضرت عبدالعظیم حسنی علیه‌السلام'],
    ]];

    this.events[4][8] = [[
      ['ولادت حضرت امام حسن عسکری علیه‌السلام (۲۳۲ ه‍.ق)'],
    ]];

    this.events[4][10] = [[
      ['وفات حضرت معصومه سلام‌اللّه علیها (۲۰۱ ه‍.ق)'],
    ]];

    this.events[5][5] = [[
      ['ولادت حضرت زینب سلام‌اللّه علیها و روز پرستار'],
    ]];

    this.events[5][13] = [[
      ['شهادت حضرت فاطمه‌ی زهرا سلام‌اللّه علیها :به روایتی (۱۱ ه‍.ق)'],
    ]];

    this.events[6][3] = [[
      ['شهادت حضرت فاطمه‌ی زهرا سلام‌اللّه علیها (۱۱ ه‍.ق)', true],
    ], true];

    this.events[6][13] = [[
      ['سالروز وفات حضرت اُم‌البنین سلام‌اللّه علیها'],
      ['روز تکریم مادران و همسران شهدا'],
    ]];

    this.events[6][20] = [[
      ['ولادت حضرت فاطمه‌ی زهرا سلام‌اللّه علیها و روز زن (۸ سال قبل از هجرت)'],
      ['تولّد حضرت امام خمینی (رحمة‌اللّه علیه)، رهبر کبیر انقلاب اسلامی (۱۳۲۰ ه‍.ق)'],
      ['روز مادر - روز زن'],
    ]];

    this.events[7][1] = [[
      ['ولادت حضرت امام محمّد باقر علیه‌السلام (۵۷ ه‍.ق)'],
    ]];

    this.events[7][3] = [[
      ['شهادت حضرت امام علی نقی «هادی» علیه‌السلام (۲۵۴ ه‍.ق)'],
    ]];

    this.events[7][10] = [[
      ['ولادت حضرت امام محمد تقی علیه‌السلام «جوادالائمه» (۱۹۵ ه‍.ق)'],
    ]];

    this.events[7][13] = [[
      ['ولادت حضرت امام علی علیه‌السلام (۲۳ سال قبل از هجرت)', true],
      ['آغاز ایام البیض (اعتکاف)'],
      ['روز پدر - روز مرد'],
    ], true];

    this.events[7][15] = [[
      ['ارتحال حضرت زینب کبری سلام‌اللّه علیها (۶۲ ه‍.ق)'],
      ['تغییر قبله‌ی مسلمین از بیت‌المقدس به مکّه‌ی معظّمه (۲ ه‍.ق)'],
    ]];

    this.events[7][25] = [[
      ['شهادت حضرت امام موسی کاظم علیه‌السلام (۱۸۳ ه‍.ق)'],
    ]];

    this.events[7][27] = [[
      ['مبعث حضرت رسول اکرم صلی‌اللّه علیه و آله (۱۳ سال قبل از هجرت)', true],
    ], true];

    this.events[8][3] = [[
      ['ولادت حضرت امام حسین علیه‌السلام و روز پاسدار (۴ ه‍.ق)'],
    ]];

    this.events[8][4] = [[
      ['ولادت حضرت ابوالفضل‌العباس علیه‌السلام و روز جانباز (۲۶ ه‍.ق)'],
    ]];

    this.events[8][5] = [[
      ['ولادت حضرت امام زین‌العابدین علیه‌السلام (۳۸ ه‍.ق)'],
    ]];

    this.events[8][11] = [[
      ['ولادت حضرت علی‌اکبر علیه‌السلام و روز جوان (۳۳ ه‍.ق)'],
    ]];

    this.events[8][15] = [[
      ['ولادت حضرت قائم عجل‌اللّه تعالی فرجه (جشن صاحب‌الزّمان) و روز جهانی مستضعفان (۲۵۵ ه‍.ق)', true],
      ['روز سربازان گمنام امام زمان (عج)'],
    ], true];

    this.events[9][10] = [[
      ['وفات حضرت خدیجه سلام‌اللّه علیها (۳ سال قبل از هجرت)'],
    ]];

    this.events[9][15] = [[
      ['ولادت حضرت امام حسن مجتبی علیه‌السلام (۳ ه‍.ق)'],
      ['روز اکرام و تکریم خیّرین'],
    ]];

    this.events[9][18] = [[
      ['شب قدر'],
    ]];

    this.events[9][19] = [[
      ['ضربت‌خوردن حضرت امام علی علیه‌السلام (۴۰ ه‍.ق)'],
    ]];

    this.events[9][20] = [[
      ['شب قدر'],
    ]];

    this.events[9][21] = [[
      ['شهادت امیر‌المؤمنین، حضرت امام علی علیه‌السلام (۴۰ ه‍.ق)', true],
    ], true];

    this.events[9][22] = [[
      ['شب قدر'],
    ]];

    this.events[9][23] = [[
      ['پیش‌یادآوری: آخرین جمعه‌ی ماه مبارک رمضان، روز قدس خواهد‌بود'],
    ]];

    this.events[10][1] = [[
      ['عید سعید فطر', true],
    ], true];

    this.events[10][2] = [[
      ['تعطیل به مناسبت عید سعید فطر', true],
    ], true];

    this.events[10][17] = [[
      ['روز فرهنگ پهلوانی و ورزش زورخانه‌ای'],
    ]];

    this.events[10][21] = [[
      ['فتح اندلس به دست مسلمانان (۹۲ ه‍.ق)'],
    ]];

    this.events[10][25] = [[
      ['شهادت حضرت امام جعفر صادق علیه‌السلام (۱۴۸ ه‍.ق)', true],
    ], true];

    this.events[11][1] = [[
      ['ولادت حضرت معصومه سلام‌اللّه علیها و روز دختران (۱۷۳ ه‍.ق)'],
    ]];

    this.events[11][5] = [[
      ['روز تجلیل از امام‌زادگان و بقاع متبرکه'],
      ['روز بزرگداشت حضرت صالح بن موسی کاظم علیه‌السلام'],
    ]];

    this.events[11][6] = [[
      ['روز بزرگداشت حضرت احمد بن موسی شاهچراغ علیه‌السلام'],
    ]];

    this.events[11][11] = [[
      ['ولادت حضرت امام رضا علیه‌السلام (۱۴۸ ه‍.ق)'],
    ]];

    this.events[11][29] = [[
      ['آخرین روز (۲۹ یا ۳۰) ماه ذی‌القعده: شهادت حضرت امام محمد تقی علیه‌السلام «جوادالائمه» (۱۴۸ ه‍.ق)'],
    ]];

    this.events[11][30] = [[
      ['شهادت حضرت امام محمد تقی علیه‌السلام «جوادالائمه» (۲۲۰ ه‍.ق)'],
    ]];

    this.events[12][1] = [[
      ['سالروز ازدواج حضرت امام علی علیه‌السلام و حضرت فاطمه سلام‌اللّه علیها (۲ ه‍.ق)'],
      ['روز ازدواج'],
    ]];

    this.events[12][6] = [[
      ['شهادت مظلومانه‌ی زائران خانه‌ی خدا به دست مأموران آل‌سعود در سال ۱۳۶۶ هجری‌شمسی (۱۴۰۷ ه‍.ق)'],
    ]];

    this.events[12][7] = [[
      ['شهادت حضرت امام محمد باقر علیه‌السلام (۱۱۴ ه‍.ق)'],
    ]];

    this.events[12][9] = [[
      ['روز عرفه (روز نیایش)'],
    ]];

    this.events[12][10] = [[
      ['عید سعید قربان', true],
    ], true];

    this.events[12][15] = [[
      ['ولادت حضرت امام علی نقی «هادی» علیه‌السلام (۲۱۲ ه‍.ق)'],
    ]];

    this.events[12][18] = [[
      ['عید سعید غدیر خم (۱۰ ه‍.ق)', true],
    ], true];

    this.events[12][20] = [[
      ['ولادت حضرت امام موسی کاظم علیه‌السلام (۱۲۸ ه‍.ق)'],
    ]];

    this.events[12][24] = [[
      ['روز مباهله‌ی پیامبر اسلام صلی‌اللّه علیه و آله (۱۰ ه‍.ق)'],
    ]];

    this.events[12][25] = [[
      ['روز خانواده و تکریم بازنشستگان'],
    ]];

  }
};
