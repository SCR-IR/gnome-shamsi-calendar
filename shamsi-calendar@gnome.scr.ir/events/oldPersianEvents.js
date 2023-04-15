
// copyright پژوهش‌های ایرانی at http://ghiasabadi.com/
// jdf.scr.ir : Only edit to new data structure (without big change events text)

function evList(Tarikh, todayObj) {
  this.Tarikh = Tarikh;
  this.todayObj = todayObj;
  this._init();
}

evList.prototype = {
  name: 'مناسبت‌های باستانی',
  type: 'persian',
  events: [],

  _init: function () {
    this.events = [[], [], [], [], [], [], [], [], [], [], [], [], []];

    /* this.events[month][day] = [ [ [title, eventIsHoliday, shadiState], ... ] , dayIsHoliday ] */

    this.events[1][1] = [[
      ['جشن نوروز', false, 1]
    ], false];

    this.events[1][6] = [[
      ['روز امید', false, 0],
      ['روز شادباش‌نویسی', false, 0]
    ], false];

    this.events[1][10] = [[
      ['جشن آبان‌گاه', false, 0]
    ], false];

    this.events[1][13] = [[
      ['جشن سیزده‌به‌در', false, 1]
    ], false];

    this.events[1][17] = [[
      ['سروش روز، جشن سروش‌گان', false, 0]
    ], false];

    this.events[1][19] = [[
      ['فروردین روز، جشن فروردین‌گان', false, 0]
    ], false];

    this.events[2][2] = [[
      ['جشن گیاه‌آوری', false, 0]
    ], false];

    this.events[2][3] = [[
      ['اردیبهشت روز، جشن اردیبهشت‌گان', false, 0]
    ], false];

    this.events[2][10] = [[
      ['جشن چهلم نوروز', false, 0]
    ], false];

    this.events[2][15] = [[
      ['گاهنبار میدیوزَرِم، جشن میانه بهار، جشن بهاربد', false, 0],
      ['روز پیام‌آوری زرتشت', false, 0]
    ], false];

    this.events[3][1] = [[
      ['ارغاسوان، جشن گرما', false, 0]
    ], false];

    this.events[3][6] = [[
      ['خرداد روز، جشن خردادگان', false, 0]
    ], false];

    this.events[4][1] = [[
      ['جشن آب‌پاشونک، جشن آغاز تابستان', false, 0],
      ['سال نو در گاهشماری گاهنباری', false, 0]
    ], false];

    this.events[4][6] = [[
      ['جشن نیلوفر', false, 0]
    ], false];

    this.events[4][13] = [[
      ['تیرروز، جشن تیرگان', false, 0]
    ], false];

    this.events[4][15] = [[
      ['جشن خام‌خواری', false, 0]
    ], false];

    this.events[5][7] = [[
      ['مردادروز، جشن مردادگان', false, 0]
    ], false];

    this.events[5][10] = [[
      ['جشن چهلم تابستان', false, 0]
    ], false];

    this.events[5][15] = [[
      ['گاهنبار میدیوشِم، جشن میانه تابستان', false, 0]
    ], false];

    this.events[5][18] = [[
      ['جشن مَی‌خواره', false, 0]
    ], false];

    this.events[6][1] = [[
      ['فغدیه، جشن خنکی هوا', false, 0]
    ], false];

    this.events[6][3] = [[
      ['جشن کشمین', false, 0]
    ], false];

    this.events[6][4] = [[
      ['شهریورروز، جشن شهریورگان', false, 0],
      ['زادروز داراب (کوروش)', false, 0],
      ['عروج مانی', false, 0]
    ], false];

    this.events[6][8] = [[
      ['خزان جشن', false, 0]
    ], false];

    this.events[6][15] = [[
      ['بازار جشن', false, 0]
    ], false];

    this.events[6][31] = [[
      ['گاهنبار پَتیَه‌شَهیم، جشن پایان تابستان', false, 0]
    ], false];

    this.events[7][1] = [[
      ['جشن میتراکانا', false, 0],
      ['سال نو هخامنشی', false, 0]
    ], false];

    this.events[7][14] = [[
      ['تیرروز، جشن تیرروزی', false, 0]
    ], false];

    this.events[7][13] = [[
      ['آیین قالیشویان اردهال، بازماندی از تیرگان', false, 0]
    ], false];

    this.events[7][16] = [[
      ['مهرروز، جشن مهرگان', false, 0]
    ], false];

    this.events[7][21] = [[
      ['رام روز، جشن رام روزی', false, 0],
      ['جشن پیروزی کاوه و فریدون', false, 0]
    ], false];

    this.events[8][10] = [[
      ['آبان روز، جشن آبان‌گان', false, 0]
    ], false];

    this.events[8][15] = [[
      ['گاهنبار اَیاثرَم، جشن میانه پاییز', false, 0]
    ], false];

    this.events[9][1] = [[
      ['آذر جشن', false, 0]
    ], false];

    this.events[9][9] = [[
      ['آذر روز، جشن آذرگان', false, 0]
    ], false];

    this.events[9][30] = [[
      ['جشن شب یلدا (چله)', false, 1],
      ['گاهنبار میدیارِم، جشن میانه سال گاهنباری و پایان پاییز', false, 0]
    ], false];

    this.events[10][1] = [[
      ['روز میلاد خورشید، جشن خرم روز', false, 0],
      ['نخستین جشن دی‌گان', false, 0]
    ], false];

    this.events[10][5] = [[
      ['بازار جشن', false, 0]
    ], false];

    this.events[10][8] = [[
      ['دی به آذر روز، دومین جشن دی‌گان', false, 0]
    ], false];

    this.events[10][14] = [[
      ['سیر روز، جشن گیاه‌خواری', false, 0]
    ], false];

    this.events[10][15] = [[
      ['جشن پیکرتراشی', false, 0],
      ['دی به مهر روز، سومین جشن دی‌گان', false, 0]
    ], false];

    this.events[10][16] = [[
      ['جشن درامزینان، جشن درفش‌ها', false, 0]
    ], false];

    this.events[10][23] = [[
      ['دی به دین روز، چهارمین جشن دی‌گان', false, 0]
    ], false];

    this.events[11][2] = [[
      ['بهمن روز، جشن بهمن‌گان', false, 0]
    ], false];

    this.events[11][4] = [[
      ['شهریور روز، آغاز پادشاهی داراب (کوروش)', false, 0]
    ], false];

    this.events[11][5] = [[
      ['جشن نوسَره', false, 0]
    ], false];

    this.events[11][10] = [[
      ['آبان روز، جشن سَدَه، آتش افروزی بر بام‌ها', false, 0],
      ['نمایش بازی همگانی', false, 0]
    ], false];

    this.events[11][15] = [[
      ['جشن میانه زمستان', false, 0]
    ], false];

    this.events[11][22] = [[
      ['بادروز، جشن بادروزی', false, 0]
    ], false];

    this.events[12][1] = [[
      ['جشن اسفندی', false, 0],
      ['جشن آبسالان، بهار جشن', false, 0],
      ['نمایش بازی همگانی', false, 0]
    ], false];

    this.events[12][5] = [[
      ['اسفند روز، جشن اسفندگان، گرامی‌داشت زمین و بانوان', false, 0],
      ['جشن برزگران', false, 0]
    ], false];

    this.events[12][10] = [[
      ['جشن وخشنکام', false, 0]
    ], false];

    this.events[12][19] = [[
      ['جشن نوروز رودها', false, 0]
    ], false];

    this.events[12][20] = [[
      ['جشن گلدان', false, 0]
    ], false];

    this.events[12][25] = [[
      ['پایان سرایش شاهنامه فردوسی', false, 0]
    ], false];

    this.events[12][26] = [[
      ['فروردگان', false, 0]
    ], false];

    this.addSpecificEvents();
  },

  addSpecificEvents: function () {

    this.events[1][((7 - this.Tarikh.persian_to_dayOfWeek_in_monthStart(this.todayObj.persianYear, 1)) % 7) + 1] = [[
      ['جشن نخستین شنبه سال', false, 0]
    ], false];

    this.events[1][this.Tarikh.julianDay_to_persian(this.Tarikh.firstNthDayOfWeek_in_persianMonth(this.todayObj.persianYear, 1, 4))[2]] = [[
      ['جشن نخستین چهارشنبه سال', false, 0]
    ], false];

    this.events[12][this.Tarikh.daysOfMonth_persian(this.todayObj.persianYear, 12)] = [[
      ['گاهنبار هَمَسپَتمَدَم، جشن پایان زمستان', false, 0],
      ['زادروز زرتشت', false, 0],
      ['جشن اوشیدر (نجات بخش ایرانی) در دریاچه هامون و کوه خواجه', false, 0],
      ['آتش افروزی بر بام‌ها در استقبال از نوروز', false, 0]
    ], false];

    this.events[12][this.Tarikh.julianDay_to_persian(this.Tarikh.lastNthDayOfWeek_in_persianMonth(this.todayObj.persianYear, 12, 4))[2] - 1] = [[
      ['چارشنبه سوری، جشن شب چهارشنبه آخر سال', false, 1]
    ], false];

  }
};
