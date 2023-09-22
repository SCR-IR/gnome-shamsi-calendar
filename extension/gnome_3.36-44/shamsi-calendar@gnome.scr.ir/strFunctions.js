function numbersFormat(str, out = 'fa') {
  let enums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let pnums = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return (out === 'fa') ? replace(enums, pnums, str) : replace(pnums, enums, str);
}

function replace(search, substitute, subject) {
  let length = search.length;
  subject = subject.toString();

  for (let i = 0; i < length; i++) {
    subject = subject.split(search[i]).join(substitute[i]);
  }

  return subject;
}

function dateStrFormat(format, day, month, year, dow, calendar) {
  let phrases = {
    gregorian: {
      monthShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      monthLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      weekdayShort: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      weekdayLong: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    persian: {
      monthShort: ['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'],
      monthLong: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
      weekdayShort: ['شـ', 'یـ', 'د', 'سـ', 'چـ', 'پـ', 'جـ'],
      weekdayLong: ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
    },
    islamic: {
      monthShort: ['محر', 'صفر', 'رب۱', 'رب۲', 'جم۱', 'جم۲', 'رجب', 'شعب', 'رمض', 'شوا', 'ذیق', 'ذیح'],
      monthLong: ['محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذیقعده', 'ذیحجه'],
      weekdayShort: ['س', 'ا', 'ا', 'ث', 'ا', 'خ', 'ج'],
      weekdayLong: ['‫السبت', '‫الأحد', '‫الاثنين', '‫الثلاثاء', '‫الأربعاء', '‫الخميس', '‫الجمعة'],
    }
  };

  let find = ['%Y', '%y', '%MM', '%mm', '%M', '%m', '%D', '%d', '%WW', '%ww'];
  let replaceArr = [
    year,
    (year + '').slice(-2),
    phrases[calendar].monthLong[month - 1],
    phrases[calendar].monthShort[month - 1],
    ('0' + (month)).slice(-2),
    month,
    ('0' + day).slice(-2),
    day,
    phrases[calendar].weekdayLong[dow],
    phrases[calendar].weekdayShort[dow],
  ];
  return replace(find, replaceArr, format);
}