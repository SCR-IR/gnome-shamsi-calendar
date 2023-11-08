function evList(Tarikh, todayObj) {
  this.Tarikh = Tarikh;
  this.todayObj = todayObj;
  this._init();
}

evList.prototype = {
  name: 'مناسبت‌های رسمی ایران',
  type: 'persian',
  events: [],

  _init: function () {
    this.events = [[], [], [], [], [], [], [], [], [], [], [], [], []];

    /* this.events[month][day] = [ [ [title, eventIsHoliday, shadiState], ... ] , dayIsHoliday ] */

    this.events[1][1] = [[
      ['آغاز نوروز', true, 1],
    ], true];

    this.events[1][2] = [[
      ['ایّام نوروز', true, 0],
      ['هجوم مأموران ستم‌شاهی پهلوی به مدرسه‌ی فیضیه‌ی قم (۱۳۴۲ ه‍.ش)', false, 0],
      ['آغاز عملیات فتح‌المبین (۱۳۶۱ ه‍.ش)', false, 0],
    ], true];

    this.events[1][3] = [[
      ['ایّام نوروز', true, 0],
    ], true];

    this.events[1][4] = [[
      ['ایّام نوروز', true, 0],
    ], true];

    this.events[1][6] = [[
      ['زادروز زرتشت', false, 0],
    ], false];

    this.events[1][7] = [[
      ['روز هنرهای نمایشی', false, 0],
    ], false];

    this.events[1][12] = [[
      ['روز جمهوری اسلامی ایران', true, 0],
    ], true];

    this.events[1][13] = [[
      ['روز طبیعت', true, 1],
    ], true];

    this.events[1][15] = [[
      ['روز ذخایر ژنتیکی و زیستی', false, 0],
    ], false];

    this.events[1][18] = [[
      ['روز سلامتی', false, 0],
    ], false];

    this.events[1][19] = [[
      ['شهادت آیت‌اللّه سیدمحمدباقر صدر و خواهر ایشان بنت‌الهدی به دست حکومت بعث عراق (۱۳۵۹ ه‍.ش)', false, 0],
    ], false];

    this.events[1][20] = [[
      ['روز ملّی فنّاوری هسته‌ای', false, 0],
      ['روز هنر انقلاب اسلامی (سالروز شهادت سیدمرتضی آوینی) (۱۳۷۲ ه‍.ش)', false, 0],
    ], false];

    this.events[1][21] = [[
      ['شهادت امیر سپهبد علی صیاد شیرازی (۱۳۷۸ ه‍.ش)', false, 0],
      ['سالروز افتتاح حساب شماره‌ی ۱۰۰ به فرمان امام خمینی (رحمة‌اللّه علیه) و تأسیس بنیاد مسکن انقلاب اسلامی (۱۳۵۸ ه‍.ش)', false, 0],
    ], false];

    this.events[1][25] = [[
      ['روز بزرگداشت عطّار نیشابوری', false, 0],
    ], false];

    this.events[1][29] = [[
      ['روز ارتش جمهوری اسلامی و نیروی زمینی', false, 0],
    ], false];

    this.events[2][1] = [[
      ['روز بزرگداشت سعدی', false, 0],
      ['روز نثر فارسی', false, 0],
      ['روز شهدای ورزشکار (همزمان با روز تولد شهید ابراهیم هادی)', false, 0],
    ], false];

    this.events[2][2] = [[
      ['تأسیس سپاه پاسداران انقلاب اسلامی (۱۳۵۸ ه‍.ش)', false, 0],
      ['سالروز اعلام انقلاب فرهنگی (۱۳۵۹ ه‍.ش)', false, 0],
      ['روز زمین پاک', false, 0],
    ], false];

    this.events[2][3] = [[
      ['روز بزرگداشت شیخ بهایی', false, 0],
      ['روز معماری', false, 0],
      ['سالروز شهادت امیر سپهبد قرنی (۱۳۵۸ ه‍.ش)', false, 0],
    ], false];

    this.events[2][5] = [[
      ['شکست حمله نظامی آمریکا به ایران در طبس (۱۳۵۹ ه‍.ش)', false, 0],
    ], false];

    this.events[2][7] = [[
      ['روز ایمنی حمل و نقل', false, 0],
    ], false];

    this.events[2][9] = [[
      ['روز شوراها', false, 0],
    ], false];

    this.events[2][10] = [[
      ['روز ملی خلیج فارس', false, 0],
      ['آغاز عملیات بیت‌المقدس (۱۳۶۱ ه‍.ش)', false, 0],
    ], false];

    this.events[2][12] = [[
      ['شهادت استاد مرتضی مطهری و روز معلم (۱۳۵۸ ه‍.ش)', false, 0],
    ], false];

    this.events[2][15] = [[
      ['روز بزرگداشت شیخ صدوق', false, 0],
    ], false];

    this.events[2][18] = [[
      ['روز بیماری‌های خاص و صعب‌العلاج', false, 0],
    ], false];

    this.events[2][19] = [[
      ['روز بزرگداشت شیخ کلینی', false, 0],
      ['روز اسناد ملی و میراث مکتوب', false, 0],
    ], false];

    this.events[2][24] = [[
      ['لغو امتیاز تنباکو به فتوای آیت‌اللّه میرزا حسن شیرازی (۱۲۷۰ ه‍.ش)', false, 0],
    ], false];

    this.events[2][25] = [[
      ['روز پاسداشت زبان فارسی و بزرگداشت حکیم ابوالقاسم فردوسی', false, 0],
    ], false];

    this.events[2][27] = [[
      ['روز ارتباطات و روابط عمومی', false, 0],
    ], false];

    this.events[2][28] = [[
      ['روز بزرگداشت حکیم عمر خیام', false, 0],
    ], false];

    this.events[2][30] = [[
      ['روز ملی جمعیت', false, 0],
    ], false];

    this.events[2][31] = [[
      ['روز اهدای عضو، اهدای زندگی', false, 0],
    ], false];

    this.events[3][1] = [[
      ['روز بهره‌وری و بهینه‌سازی مصرف', false, 0],
      ['روز بزرگداشت ملّاصدرا (صدرالمتألهین)', false, 0],
    ], false];

    this.events[3][3] = [[
      ['فتح خرمشهر در عملیات بیت‌المقدس و روز مقاومت، ایثار و پیروزی (۱۳۶۱ ه‍.ش)', false, 0],
    ], false];

    this.events[3][4] = [[
      ['روز دزفول', false, 0],
      ['روز مقاومت و پایداری', false, 0],
    ], false];

    this.events[3][5] = [[
      ['روز نسیم مهر (روز حمایت از خانواده زندانیان)', false, 0],
    ], false];

    this.events[3][7] = [[
      ['افتتاح اولین دوره‌ی مجلس شورای اسلامی (۱۳۵۹ ه‍.ش)', false, 0],
    ], false];

    this.events[3][14] = [[
      ['رحلت حضرت امام خمینی (رحمة‌اللّه علیه) رهبر کبیر انقلاب و بنیان‌گذار جمهوری اسلامی ایران (۱۳۶۸ ه‍.ش)', true, -1],
      ['انتخاب حضرت آیت‌اللّه امام خامنه‌ای به رهبری (۱۳۶۸ ه‍.ش)', false, 0],
    ], true];

    this.events[3][15] = [[
      ['قیام خونین ۱۵ خرداد (۱۳۴۲ ه‍.ش)', true, -1],
      ['زندانی شدن حضرت امام خمینی (رحمة‌اللّه علیه) به دست مأموران ستم‌شاهی پهلوی (۱۳۴۲ ه‍.ش)', false, 0],
    ], true];

    this.events[3][20] = [[
      ['روز جهانی صنایع دستی - روز ملّی فرش', false, 0],
      ['شهادت آیت‌اللّه سعیدی به دست مأموران ستم‌شاهی پهلوی (۱۳۴۹ ه‍.ش)', false, 0],
    ], false];

    this.events[3][26] = [[
      ['شهادت سربازان دلیر اسلام :بخارایی، امانی، صفار هرندی و نیک‌نژاد (۱۳۴۴ ه‍.ش)', false, 0],
    ], false];

    this.events[3][27] = [[
      ['روز جهاد کشاورزی (تشکیل جهاد سازندگی به فرمان حضرت امام خمینی رحمة‌اللّه علیه) (۱۳۵۸ ه‍.ش)', false, 0],
    ], false];

    this.events[3][29] = [[
      ['درگذشت دکتر علی شریعتی (۱۳۵۶ ه‍.ش)', false, 0],
    ], false];

    this.events[3][30] = [[
      ['شهادت زائران حرم رضوی علیه‌السلام به دست ایادی آمریکا در روز عاشورا (۱۳۷۳ ه‍.ش)', false, 0],
    ], false];

    this.events[3][31] = [[
      ['شهادت دکتر مصطفی چمران (۱۳۶۰ ه‍.ش)', false, 0],
      ['روز بسیج استادان', false, 0],
    ], false];

    this.events[4][1] = [[
      ['روز تبلیغ و اطلاع‌رسانی دینی (سالروز صدور فرمان امام خمینی رحمة‌اللّه علیه مبنی بر تأسیس سازمان تبلیغات اسلامی) (۱۳۶۰ ه‍.ش)', false, 0],
      ['روز اصناف', false, 0],
    ], false];

    this.events[4][7] = [[
      ['شهادت مظلومانه‌ی آیت‌اللّه دکتر بهشتی و ۷۲ تن از یاران امام با انفجار بمب به دست منافقان در دفتر مرکزی حزب جمهوری اسلامی (۱۳۶۰ ه‍.ش)', false, -1],
      ['روز قوه‌ی قضائیه', false, 0],
      ['سالروز بمباران شیمیایی شهر سردشت (۱۳۶۶ ه‍.ش)', false, 0],
    ], false];

    this.events[4][8] = [[
      ['روز مبارزه با سلاح‌های شیمیایی و میکروبی', false, 0],
    ], false];

    this.events[4][10] = [[
      ['روز صنعت و معدن', false, 0],
      ['روز دیپلماسی فرهنگی و تعامل با جهان', false, 0],
      ['یادروز ورود امام رضا علیه‌السلام به نیشابور و نقل حدیث سلسلة‌الذهب', false, 0],
      ['روز آزادسازی شهر مهران', false, 0],
      ['روز بزرگداشت صائب تبریزی', false, 0],
    ], false];

    this.events[4][11] = [[
      ['شهادت آیت‌اللّه صدوقی چهارمین شهید محراب به دست منافقان (۱۳۶۱ ه‍.ش)', false, 0],
    ], false];

    this.events[4][12] = [[
      ['حمله‌ی ددمنشانه‌ی ناوگان آمریکای جنایتکار به هواپیمای مسافربری جمهوری اسلامی ایران (۱۳۶۷ ه‍.ش)', false, 0],
      ['روز افشای حقوق بشر آمریکایی', false, 0],
      ['روز بزرگداشت علامه امینی (۱۳۴۹ ه‍.ش)', false, 0],
    ], false];

    this.events[4][14] = [[
      ['روز قلم', false, 0],
      ['روز شهرداری و دهیاری', false, 0],
    ], false];

    this.events[4][16] = [[
      ['روز مالیات', false, 0],
    ], false];

    this.events[4][18] = [[
      ['روز ادبیات کودکان و نوجوانان', false, 0],
      ['کشف توطئه‌ی آمریکایی در پایگاه هوایی شهید نوژه (کودتای نافرجام نقاب) (۱۳۵۹ ه‍.ش)', false, 0],
    ], false];

    this.events[4][21] = [[
      ['روز عفاف و حجاب', false, 0],
      ['حمله به مسجد گوهرشاد و کشتار مردم به دست رضاخان (۱۳۱۴ ه‍.ش)', false, 0],
    ], false];

    this.events[4][22] = [[
      ['روز بزرگداشت خوارزمی - روز فناوری اطلاعات', false, 0],
    ], false];

    this.events[4][23] = [[
      ['سالروز اشتباه برجام، مایه‌ی عبرت آیندگان (۱۳۹۴ ه‍.ش)', false, 0],
      ['گشایش نخستین مجلس خبرگان رهبری (۱۳۶۲ ه‍.ش)', false, 0],
    ], false];

    this.events[4][25] = [[
      ['روز بهزیستی و تأمین اجتماعی', false, 0],
    ], false];

    this.events[4][26] = [[
      ['سالروز تأسیس نهاد شورای نگهبان (۱۳۵۹ ه‍.ش)', false, 0],
    ], false];

    this.events[4][27] = [[
      ['اعلام پذیرش قطعنامه‌ی ۵۹۸ شورای امنیت از سوی ایران (۱۳۶۷ ه‍.ش)', false, 0],
    ], false];

    this.events[4][30] = [[
      ['روز بزرگداشت آیت‌اللّه سید ابوالقاسم کاشانی', false, 0],
    ], false];

    this.events[5][4] = [[
      ['روز بزرگداشت شیخ صفی‌الدین اردبیلی', false, 0],
    ], false];

    this.events[5][5] = [[
      ['سالروز عملیات افتخار‌آفرین مرصاد (۱۳۶۷ ه‍.ش)', false, 0],
      ['روز مقاومت و پایداری', false, 0],
      ['اقامه‌ی اوّلین نماز جمعه با حکم امام خمینی (ره) (۱۳۵۸ ه‍.ش)', false, 0],
    ], false];

    this.events[5][6] = [[
      ['روز کارآفرینی و آموزش‌های فنّی‌و‌حرفه‌ای', false, 0],
    ], false];

    this.events[5][8] = [[
      ['روز بزرگداشت شیخ شهاب‌الدین سهروردی (شیخ اشراق)', false, 0],
    ], false];

    this.events[5][9] = [[
      ['روز اهدای خون', false, 0],
    ], false];

    this.events[5][11] = [[
      ['شهادت آیت‌اللّه شیخ فضل‌اللّه نوری (۱۲۸۸ ه‍.ش)', false, 0],
    ], false];

    this.events[5][14] = [[
      ['صدور فرمان مشروطیت (۱۲۸۵ ه‍.ش)', false, 0],
      ['روز حقوق بشر اسلامی و کرامت انسانی', false, 0],
    ], false];

    this.events[5][15] = [[
      ['انفجار بمب‌های اتمی آمریکای جنایتکار در هیروشیما و ناکازاکی (۶ و ۹ اوت ۱۹۴۵ میلادی) با صدهاهزار کشته', false, 0],
      ['سالروز شهادت امیر سرلشکر خلبان عباس بابایی (۱۳۶۶ ه‍.ش)', false, 0],
    ], false];

    this.events[5][16] = [[
      ['تشکیل جهاد دانشگاهی (۱۳۵۹ ه‍.ش)', false, 0],
    ], false];

    this.events[5][17] = [[
      ['روز خبرنگار', false, 0],
    ], false];

    this.events[5][18] = [[
      ['روز بزرگداشت شهدای مدافع حرم', false, 0],
    ], false];

    this.events[5][21] = [[
      ['روز حمایت از صنایع کوچک', false, 0],
    ], false];

    this.events[5][22] = [[
      ['روز تشکّل‌ها و مشارکت‌های اجتماعی', false, 0],
    ], false];

    this.events[5][23] = [[
      ['روز مقاومت اسلامی', false, 0],
    ], false];

    this.events[5][26] = [[
      ['آغاز بازگشت آزادگان به میهن اسلامی (۱۳۶۹ ه‍.ش)', false, 0],
    ], false];

    this.events[5][28] = [[
      ['کودتای آمریکا برای بازگرداندن شاه  (۱۳۳۲ ه‍.ش)', false, 0],
      ['گشایش مجلس خبرگان برای بررسی نهایی قانون اساسی جمهوری اسلامی ایران (۱۳۵۸ ه‍.ش)', false, 0],
    ], false];

    this.events[5][30] = [[
      ['روز بزرگداشت علامه مجلسی', false, 0],
    ], false];

    this.events[5][31] = [[
      ['روز صنعت دفاعی', false, 0],
    ], false];

    this.events[6][1] = [[
      ['روز بزرگداشت ابوعلی سینا', false, 0],
      ['روز پزشک', false, 0],
      ['روز همدان', false, 0],
    ], false];

    this.events[6][2] = [[
      ['آغاز هفته‌ی دولت', false, 0],
      ['شهادت سید‌علی اندرزگو (در روز ۱۹ ماه مبارک رمضان) (۱۳۵۷ ه‍.ش)', false, 0],
    ], false];

    this.events[6][3] = [[
      ['اِشغال ایران توسّط متّفقین و فرار رضاخان (۱۳۲۰ ه‍.ش)', false, 0],
    ], false];

    this.events[6][4] = [[
      ['روز کارمند', false, 0],
    ], false];

    this.events[6][5] = [[
      ['روز بزرگداشت محمّدبن زکریای رازی', false, 0],
      ['روز داروسازی', false, 0],
      ['روز کشتی', false, 0],
    ], false];

    this.events[6][8] = [[
      ['روز مبارزه با تروریسم (انفجار دفتر نخست‌وزیری به دست منافقان و شهادت مظلومانه‌ی شهیدان رجایی و باهنر) (۱۳۶۰ ه‍.ش)', false, -1],
    ], false];

    this.events[6][10] = [[
      ['روز بانکداری اسلامی (سالروز تصویب قانون عملیات بانکی بدون ربا) (۱۳۶۲ ه‍.ش)', false, 0],
      ['روز تشکیل قرارگاه پدافند هوایی حضرت خاتم‌الانبیا صلی اللّه علیه و آله (۱۳۷۱ ه‍.ش)', false, 0],
    ], false];

    this.events[6][11] = [[
      ['روز صنعت چاپ', false, 0],
    ], false];

    this.events[6][12] = [[
      ['روز مبارزه بااستعمار انگلیس (سالروز شهادت رئیسعلی دلواری - ۱۲۹۴ هـ.ش)', false, 0],
      ['روز بهوَرز', false, 0],
    ], false];

    this.events[6][13] = [[
      ['روز تعاون', false, 0],
      ['روز بزرگداشت ابوریحان بیرونی', false, 0],
      ['روز علوم پایه (همزمان با روز تولد ابوریحان بیرونی)', false, 0],
      ['روز مردم‌شناسی', false, 0],
    ], false];

    this.events[6][14] = [[
      ['شهادت آیت‌اللّه قدّوسی و سرتیپ وحید دستجردی (۱۳۶۰ ه‍.ش)', false, 0],
    ], false];

    this.events[6][17] = [[
      ['قیام ۱۷ شهریور و کشتار جمعی از مردم به‌دست مأموران ستم‌شاهی پهلوی (۱۳۵۷ ه‍.ش)', false, -1],
    ], false];

    this.events[6][19] = [[
      ['وفات آیت‌اللّه سیدمحمود طالقانی اوّلین امام جمعه‌ی تهران (۱۳۵۸ ه‍.ش)', false, 0],
    ], false];

    this.events[6][20] = [[
      ['شهادت دومین شهید محراب آیت‌اللّه مدنی به دست منافقان (۱۳۶۰ ه‍.ش)', false, 0],
    ], false];

    this.events[6][21] = [[
      ['روز سینما', false, 0],
    ], false];

    this.events[6][27] = [[
      ['روز شعر و ادب فارسی', false, 0],
      ['روز بزرگداشت استاد سید‌محمّد‌حسین شهریار', false, 0],
    ], false];

    this.events[6][31] = [[
      ['آغاز جنگ تحمیلی (۱۳۵۹ ه‍.ش)', false, 0],
      ['آغاز هفته‌ی دفاع مقدّس', false, 0],
    ], false];

    this.events[7][2] = [[
      ['روز بزرگداشت شهدای منا (۱۳۹۴ ه‍.ش)', false, 0],
    ], false];

    this.events[7][4] = [[
      ['روز سرباز', false, 0],
    ], false];

    this.events[7][5] = [[
      ['شکست حصر آبادان در عملیات ثامن‌الائمه علیه‌السلام (۱۳۶۰ ه‍.ش)', false, 0],
    ], false];

    this.events[7][7] = [[
      ['روز بزرگداشت فرماندهان شهید دفاع مقدّس', false, 0],
      ['شهادت سرداران اسلام: فلاحی، فکوری، نامجو، کلاهدوز و جهان‌آرا (۱۳۶۰ ه‍.ش)', false, 0],
      ['روز آتش‌نشانی و ایمنی', false, 0],
      ['روز بزرگداشت شمس', false, 0],
    ], false];

    this.events[7][8] = [[
      ['روز بزرگداشت مولوی', false, 0],
    ], false];

    this.events[7][9] = [[
      ['روز همبستگی و همدردی با کودکان و نوجوانان فلسطینی', false, 0],
    ], false];

    this.events[7][10] = [[
      ['روز نخبگان', false, 0],
    ], false];

    this.events[7][13] = [[
      ['هجرت حضرت امام خمینی (رحمة‌اللّه علیه) از عراق به پاریس (۱۳۵۷ ه‍.ش)', false, 0],
      ['روز نیروی انتظامی', false, 0],
    ], false];

    this.events[7][14] = [[
      ['روز دامپزشکی', false, 0],
    ], false];

    this.events[7][15] = [[
      ['روز روستا و عشایر', false, 0],
    ], false];

    this.events[7][20] = [[
      ['روز بزرگداشت حافظ', false, 0],
    ], false];

    this.events[7][23] = [[
      ['شهادت پنجمین شهید محراب آیت‌اللّه اشرفی اصفهانی به دست منافقان (۱۳۶۱ ه‍.ش)', false, 0],
    ], false];

    this.events[7][24] = [[
      ['روز ملی پارالمپیک', false, 0],
      ['روز پیوند اولیا و مربیان', false, 0],
      ['سالروز واقعه‌ی به‌آتش‌کشیدن مسجد جامع شهر کرمان به دست دژخیمان حکومت پهلوی (۱۳۵۷ ه‍.ش)', false, 0],
    ], false];

    this.events[7][26] = [[
      ['روز تربیت‌بدنی و ورزش', false, 0],
    ], false];

    this.events[7][29] = [[
      ['روز صادرات', false, 0],
    ], false];

    this.events[8][1] = [[
      ['روز بزرگداشت ابوالفضل بیهقی', false, 0],
      ['شهادت مظلومانه‌ی آیت‌اللّه حاج سید مصطفی خمینی (۱۳۵۶ ه‍.ش)', false, 0],
      ['روز آمار و برنامه‌ریزی', false, 0],
    ], false];

    this.events[8][4] = [[
      ['اعتراض و افشاگری حضرت امام خمینی (ره) علیه پذیرش کاپیتولاسیون (۱۳۴۳ ه‍.ش)', false, 0],
    ], false];

    this.events[8][8] = [[
      ['شهادت محمّدحسین فهمیده (بسیجی ۱۳ ساله) (۱۳۵۹ ه‍.ش)', false, 0],
      ['روز نوجوان و بسیج دانش‌آموزی', false, 0],
      ['روز پدافند غیرعامل', false, 0],
    ], false];

    this.events[8][10] = [[
      ['شهادت آیت‌اللّه قاضی طباطبایی، اوّلین شهید محراب به دست منافقان (۱۳۵۸ ه‍.ش)', false, 0],
    ], false];

    this.events[8][13] = [[
      ['تسخیر لانه‌ی جاسوسی آمریکا به دست دانشجویان پیرو خط امام (۱۳۵۸ ه‍.ش)', false, 0],
      ['روز ملی مبارزه با استکبار جهانی', false, 0],
      ['روز دانش‌آموز', false, 0],
      ['تبعید حضرت امام خمینی (رحمة‌اللّه علیه) از ایران به ترکیه (۱۳۴۳ ه‍.ش)', false, 0],
    ], false];

    this.events[8][14] = [[
      ['روز فرهنگ عمومی', false, 0],
      ['روز مازندران', false, 0],
    ], false];

    this.events[8][18] = [[
      ['روز کیفیت', false, 0],
    ], false];

    this.events[8][24] = [[
      ['روز کتاب، کتاب‌خوانی و کتابدار', false, 0],
      ['روز بزرگداشت آیت‌اللّه علامه سیدمحمّدحسین طباطبایی (۱۳۶۰ ه‍.ش)', false, 0],
    ], false];

    this.events[8][25] = [[
      ['روز اصفهان', false, 0],
    ], false];

    this.events[8][26] = [[
      ['سالروز آزادسازی سوسنگرد (۱۳۵۹ ه‍.ش)', false, 0],
    ], false];

    this.events[8][30] = [[
      ['روز قهرمان ملّی', false, 0],
      ['روز بزرگداشت ابونصر فارابی - روز حکمت و فلسفه', false, 0],
    ], false];

    this.events[9][5] = [[
      ['روزبسیج مستضعفان (تشکیل بسیج مستضعفان به فرمان حضرت امام خمینی رحمة‌اللّه علیه) (۱۳۵۸ ه‍.ش)', false, 0],
      ['سالروز قیام مردم گرگان (۱۳۵۷ ه‍.ش)', false, 0],
    ], false];

    this.events[9][7] = [[
      ['روز نیروی دریایی', false, 0],
      ['روز نوآوری و فناوری ایران ساخت (همزمان با سالروز شهادت دکتر محسن فخری زاده در سال ۱۳۹۹)', false, 0],
    ], false];

    this.events[9][9] = [[
      ['روز بزرگداشت شیخ مفید', false, 0],
    ], false];

    this.events[9][10] = [[
      ['شهادت آیت‌اللّه سید‌حسن مدرّس و روز مجلس (۱۳۱۶ ه‍.ش)', false, 0],
    ], false];

    this.events[9][11] = [[
      ['شهادت میرزا‌کوچک‌خان جنگلی (۱۳۰۰ ه‍.ش)', false, 0],
    ], false];

    this.events[9][12] = [[
      ['روز قانون اساسی جمهوری اسلامی ایران (تصویب قانون اساسی جمهوری اسلامی ایران) (۱۳۵۸ ه‍.ش)', false, 0],
    ], false];

    this.events[9][13] = [[
      ['روز بیمه', false, 0],
    ], false];

    this.events[9][16] = [[
      ['روز دانشجو', false, 0],
    ], false];

    this.events[9][18] = [[
      ['معرّفی عراق به عنوان مسئول و آغازگر جنگ از سوی سازمان ملل (۱۳۷۰ ه‍.ش)', false, 0],
    ], false];

    this.events[9][19] = [[
      ['تشکیل شورای عالی انقلاب فرهنگی به فرمان حضرت امام خمینی (رحمة‌اللّه علیه) (۱۳۶۳ ه‍.ش)', false, 0],
    ], false];

    this.events[9][20] = [[
      ['شهادت آیت‌اللّه دستغیب، سومین شهید محراب به دست منافقان (۱۳۶۰ ه‍.ش)', false, 0],
    ], false];

    this.events[9][25] = [[
      ['روز پژوهش', false, 0],
    ], false];

    this.events[9][26] = [[
      ['روز حمل‌و‌نقل و رانندگان', false, 0],
    ], false];

    this.events[9][27] = [[
      ['شهادت آیت‌اللّه دکتر محمّد مفتّح (۱۳۵۸ ه‍.ش)', false, 0],
      ['روز وحدت حوزه و دانشگاه', false, 0],
    ], false];

    this.events[9][29] = [[
      ['روز تجلیل از شهید تندگویان', false, 0],
    ], false];

    this.events[9][30] = [[
      ['شب یلدا - ترویج فرهنگ میهمانی و پیوند با خویشان', false, 1],
    ], false];

    this.events[10][3] = [[
      ['روز ثبت‌احوال', false, 0],
    ], false];

    this.events[10][4] = [[
      ['روز بزرگداشت رودکی', false, 0],
    ], false];

    this.events[10][5] = [[
      ['روز ایمنی در برابر زلزله و کاهش اثرات بلایای طبیعی', false, 0],
    ], false];

    this.events[10][7] = [[
      ['سالروز تشکیل نهضت سوادآموزی به فرمان حضرت امام خمینی (رحمة‌اللّه علیه) (۱۳۵۸ ه‍.ش)', false, 0],
      ['شهادت آیت‌اللّه حسین غفّاری به دست مأموران ستم‌شاهی پهلوی (۱۳۵۳ ه‍.ش)', false, 0],
    ], false];

    this.events[10][8] = [[
      ['روز صنعت پتروشیمی', false, 0],
    ], false];

    this.events[10][9] = [[
      ['روز بصیرت و میثاق امّت با ولایت (سالروز حماسه‌ی ۹ دی ۸۸)', false, 0],
    ], false];

    this.events[10][13] = [[
      ['روز جهانی مقاومت - شهادت الگوی اخلاص و عمل، سردار سپهبد حاج قاسم سلیمانی و هم‌رزمان ایشان به دست استکبار جهانی (۱۳۹۸ ه‍.ش)', false, -1],
      ['ابلاغ پیام تاریخی حضرت امام خمینی (ره) به گورباچف رهبر شوروی سابق (۱۳۶۷ ه‍.ش)', false, 0],
    ], false];

    this.events[10][16] = [[
      ['روز شهدای دانشجو (شهادت سیدحسن علم‌الهدی و همرزمان وی در هویزه)', false, 0],
    ], false];

    this.events[10][17] = [[
      ['اجرای طرح استعماری حذف حجاب (کشف حجاب) به دست رضاخان دیکتاتور (۱۳۱۴ ه‍.ش)', false, 0],
      ['روز بزرگداشت خواجوی کرمانی', false, 0],
    ], false];

    this.events[10][19] = [[
      ['قیام خونین مردم قم (۱۳۵۶ ه‍.ش)', false, 0],
    ], false];

    this.events[10][20] = [[
      ['شهادت میرزا تقی خان امیرکبیر (۱۲۳۰ ه‍.ش)', false, 0],
    ], false];

    this.events[10][22] = [[
      ['تشکیل شورای انقلاب به فرمان حضرت امام خمینی (رحمة‌اللّه علیه) (۱۳۵۷ ه‍.ش)', false, 0],
    ], false];

    this.events[10][25] = [[
      ['روز تاریخ‌نگاری انقلاب اسلامی (همزمان با سالروز صدور نامه تاریخی حضرت امام(ره) در سال ۱۳۶۷)', false, 0],
    ], false];

    this.events[10][26] = [[
      ['فرار شاه معدوم (۱۳۵۷ ه‍.ش)', false, 0],
    ], false];

    this.events[10][27] = [[
      ['شهادت شهیدان: نواب صفوی، طهماسبی، برادران واحدی و ذوالقدر از فدائیان اسلام (۱۳۳۴ ه‍.ش)', false, 0],
    ], false];

    this.events[10][29] = [[
      ['روز غزه', false, 0],
    ], false];

    this.events[11][6] = [[
      ['سالروز حماسه‌ی مردم آمل', false, 0],
      ['روز آواها و نواهای ایرانی - روز بزرگداشت صفی‌الدّین اُرمَوی', false, 0],
    ], false];

    this.events[11][12] = [[
      ['سالروز بازگشت حضرت امام خمینی (رحمة‌اللّه علیه) به ایران و آغاز دهه‌ی مبارک فجر انقلاب اسلامی', false, 1],
    ], false];

    this.events[11][14] = [[
      ['روز فنّاوری فضایی', false, 0],
    ], false];

    this.events[11][19] = [[
      ['روز نیروی هوایی', false, 0],
    ], false];

    this.events[11][20] = [[
      ['روز چهارمحال و بختیاری', false, 0],
    ], false];

    this.events[11][21] = [[
      ['شکسته‌شدن حکومت‌نظامی به فرمان امام خمینی (رحمة‌اللّه علیه) (۱۳۵۷ ه‍.ش)', false, 0],
    ], false];

    this.events[11][22] = [[
      ['پیروزی انقلاب اسلامی ایران و سقوط نظام شاهنشاهی (۱۳۵۷ ه‍.ش)', true, 1],
    ], true];

    this.events[11][25] = [[
      ['صدور حکم تاریخی حضرت امام خمینی (رحمة‌اللّه علیه) مبنی بر ارتداد سلمان‌رشدی نویسنده‌ی خائن کتاب آیات شیطانی (۱۳۶۷ ه‍.ش)', false, 0],
    ], false];

    this.events[11][29] = [[
      ['قیام مردم تبریز به مناسبت چهلمین روز شهادت شهدای قم (۱۳۵۶ ه‍.ش)', false, 0],
      ['روز اقتصاد مقاومتی و کارآفرینی', false, 0],
    ], false];

    this.events[12][3] = [[
      ['کودتای انگلیسی رضاخان (۱۲۹۹ ه‍.ش)', false, 0],
    ], false];

    this.events[12][5] = [[
      ['روز بزرگداشت خواجه‌نصیرالدّین طوسی', false, 0],
      ['روز مهندسی', false, 0],
    ], false];

    this.events[12][8] = [[
      ['روز حمایت از بیماران نادر', false, 0],
      ['روز امور تربیتی و تربیت اسلامی', false, 0],
      ['روز بزرگداشت حکیم حاج ملاهادی سبزواری', false, 0],
    ], false];

    this.events[12][9] = [[
      ['روز حمایت از حقوق مصرف‌کنندگان', false, 0],
    ], false];

    this.events[12][14] = [[
      ['روز احسان و نیکوکاری', false, 0],
      ['روز ترویج فرهنگ قرض‌الحسنه', false, 0],
    ], false];

    this.events[12][15] = [[
      ['روز درختکاری', false, 0],
      ['روز آموزش همگانی حفظ محیط زیست', false, 0],
    ], false];

    this.events[12][18] = [[
      ['روز بزرگداشت سید‌جمال‌الدّین اسدآبادی', false, 0],
      ['سالروز تأسیس کانون‌های فرهنگی‌و‌هنری مساجد کشور', false, 0],
      ['روز بوشهر', false, 0],
    ], false];

    this.events[12][20] = [[
      ['روز راهیان نور', false, 0],
    ], false];

    this.events[12][21] = [[
      ['روز بزرگداشت نظامی گنجوی', false, 0],
    ], false];

    this.events[12][22] = [[
      ['روز بزرگداشت شهدا (سالروز صدور فرمان حضرت امام خمینی رحمة‌اللّه علیه، مبنی بر تأسیس بنیاد شهید انقلاب اسلامی) (۱۳۵۸ ه‍.ش)', false, 0],
    ], false];

    this.events[12][25] = [[
      ['بمباران شیمیایی حلبچه به دست ارتش بعث عراق (۱۳۶۶ ه‍.ش)', false, 0],
    ], false];

    this.events[12][29] = [[
      ['روز ملّی‌شدن صنعت نفت ایران (۱۳۲۹ ه‍.ش)', true, 0],
    ], true];

    this.events[12][30] = [[
      ['این روز فقط در سال‌های کبیسه وجود دارد و معمولاً تعطیل اعلام می‌گردد', false, 0],
    ], false];

    this.addSpecificEvents();
  },

  addSpecificEvents: function () {

    this.events[12][this.Tarikh.julianDay_to_persian(this.Tarikh.lastNthDayOfWeek_in_persianMonth(this.todayObj.persianYear, 12, 4))[2] - 1] = [[
      ['روز تکریم همسایگان', false, 0],
      ['شب چهارشنبه سوری : احتیاط کنیم!', false, 1],
    ], false];

  }
};
