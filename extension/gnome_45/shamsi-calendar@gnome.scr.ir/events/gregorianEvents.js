export default class evList {
  constructor(Tarikh, todayObj) {
    this.Tarikh = Tarikh;
    this.todayObj = todayObj;
    this.name = 'مناسبت‌های جهانی';
    this.type = 'gregorian';
    this.events = [[], [], [], [], [], [], [], [], [], [], [], [], []];
    this.addEvents()
  }

  addEvents() {
    /* this.events[month][day] = [ [ [title, eventIsHoliday, shadiState], ... ] , dayIsHoliday ] */

    this.events[1][1] = [[
      ['آغاز سال میلادی', false, 1],
    ], false];

    this.events[1][26] = [[
      ['روز جهانی گمرک', false, 0],
    ], false];

    this.events[3][22] = [[
      ['روز جهانی آب', false, 0],
    ], false];

    this.events[3][23] = [[
      ['روز جهانی هواشناسی', false, 0],
    ], false];

    this.events[5][1] = [[
      ['روز جهانی کار و کارگر', false, 0],
    ], false];

    this.events[5][5] = [[
      ['روز جهانی ماما', false, 0],
    ], false];

    this.events[5][8] = [[
      ['روز جهانی صلیب‌سرخ و هلال‌احمر', false, 0],
    ], false];

    this.events[5][18] = [[
      ['روز جهانی موزه و میراث‌فرهنگی', false, 0],
    ], false];

    this.events[5][31] = [[
      ['روز جهانی بدون دخانیات', false, 0],
    ], false];

    this.events[6][5] = [[
      ['روز جهانی محیط زیست', false, 0],
    ], false];

    this.events[6][17] = [[
      ['روز جهانی بیابان‌زدایی', false, 0],
    ], false];

    this.events[6][26] = [[
      ['روز جهانی مبارزه با مواد‌مخدر', false, 0],
    ], false];

    this.events[8][1] = [[
      ['روز جهانی شیر مادر', false, 0],
    ], false];

    this.events[8][21] = [[
      ['روز جهانی مسجد', false, 0],
    ], false];

    this.events[9][27] = [[
      ['روز جهانی جهانگردی - روز گردشگری', false, 0],
    ], false];

    this.events[9][30] = [[
      ['روز جهانی دریانوردی', false, 0],
      ['روز جهانی ناشنوایان', false, 0],
    ], false];

    this.events[10][1] = [[
      ['روز جهانی سالمندان', false, 0],
    ], false];

    this.events[10][8] = [[
      ['روز جهانی کودک', false, 0],
    ], false];

    this.events[10][9] = [[
      ['روز جهانی پست', false, 0],
    ], false];

    this.events[10][14] = [[
      ['روز جهانی استاندارد', false, 0],
    ], false];

    this.events[10][15] = [[
      ['روز جهانی نابینایان (عصای سفید)', false, 0],
    ], false];

    this.events[10][16] = [[
      ['روز جهانی غذا', false, 0],
    ], false];

    this.events[11][10] = [[
      ['روز جهانی علم در خدمت صلح و توسعه', false, 0],
    ], false];

    this.events[12][1] = [[
      ['روز جهانی مبارزه با ایدز', false, 0],
    ], false];

    this.events[12][3] = [[
      ['روز جهانی معلولان', false, 0],
    ], false];

    this.events[12][7] = [[
      ['روز جهانی هواپیمایی', false, 0],
    ], false];

    this.events[12][25] = [[
      ['ولادت حضرت عیسی مسیح علیه‌السلام', false, 0],
    ], false];

  }
};
