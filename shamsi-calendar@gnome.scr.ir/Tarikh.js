/** In the name of Allah = بسم الله الرّحمن الرّحیم
 * 
 * توابع کاربردی تبدیل تاریخ هجری شمسی، قمری و میلادی
 * Date Converter Functions: Persian, Islamic, Gregorian
 * 
 * @author : JDF.SCR.IR
 * @website : https://jdf.scr.ir
 * @github : https://github.com/SCR-IR/tarikh-npm
 * @license : GNU/LGPL
 * @version : 2.0.0 alpha نسخه‌ی آزمایشی غیررسمی
 * 
 * هجری‌شمسی ۱۱۷۸ تا ۱۶۳۳ : دوره‌ی انطباق کامل کبیسه‌بندی جلالی با اعتدال بهاری
 * Persian:[1178-1633] = JD:[2378211-2544760]
*/

const COUNTRY = "IR"; //For now, only I.R.Iran is supported.

var julianDayFloat_to_julianDay = (julianDayFloat) => {
  return ~~(julianDayFloat + 0.5);
}

var julianDay_to_julianDayFloat = (julianDay) => {
  return (~~julianDay - 0.5);
}




/** 
 * @param {number} gY - Gregorian Year
 * @param {number} gM - Gregorian Month
 * @param {number} gD - Gregorian Day
 * @return {number} JulianDay
 */
var gregorian_to_julianDay = (gY, gM, gD) => {
  var gDoM, gY2, julianDay;
  gDoM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  gY2 = (gM > 2) ? (gY + 1) : gY;
  julianDay = 1721059 + (365 * gY) + ~~((gY2 + 3) / 4) - ~~((gY2 + 99) / 100) + ~~((gY2 + 399) / 400) + gD + gDoM[gM - 1];
  /* 1721059 = gregorian_to_julianDay(0, 1, 1) - 1 */
  return julianDay;
}
var gregorian_to_julianDayFloat = (gY, gM, gD) => {
  return gregorian_to_julianDay(gY, gM, gD) - 0.5;
}


var persian_to_julianDay = (pY, pM, pD) => {
  pY += 1595;
  var julianDay = 1365392 + (365 * pY) + ((~~(pY / 33)) * 8) + ~~(((pY % 33) + 3) / 4) + pD + ((pM < 7) ? (pM - 1) * 31 : ((pM - 7) * 30) + 186);
  /* 1365392=1721059-355746+79 */
  return julianDay;
}
var persian_to_julianDayFloat = (pY, pM, pD) => {
  return persian_to_julianDay(pY, pM, pD) - 0.5;
}


var julianDay_to_persian = (julianDay) => {
  var pY, pM, pD, days;
  days = ~~(julianDay - 1365393);
  pY = -1595 + (33 * ~~(days / 12053));
  days %= 12053;
  pY += 4 * ~~(days / 1461);
  days %= 1461;
  if (days > 365) {
    pY += ~~((days - 1) / 365);
    days = (days - 1) % 365;
  }
  pM = (days < 186) ? 1 + ~~(days / 31) : 7 + ~~((days - 186) / 30);
  pD = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return [pY, pM, pD];
}
var julianDayFloat_to_persian = (julianDayFloat) => {
  return julianDay_to_persian(~~(julianDayFloat + 0.5));
}

var julianDay_to_gregorian = (julianDay) => {
  var gDoM, gY, gM, gD, days;
  days = -~~(1721060 - julianDay);
  gY = 400 * ~~(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gY += 100 * ~~(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gY += 4 * ~~(days / 1461);
  days %= 1461;
  if (days > 365) {
    gY += ~~((days - 1) / 365);
    days = (days - 1) % 365;
  }
  gD = days + 1;
  gDoM = [0, 31, ((gY % 4 === 0 && gY % 100 !== 0) || (gY % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (gM = 0; gM < 13, gD > gDoM[gM]; gM++) {
    gD -= gDoM[gM];
  }
  return [gY, gM, gD];
}
var julianDayFloat_to_gregorian = (julianDayFloat) => {
  return julianDay_to_gregorian(~~(julianDayFloat + 0.5));
}

/**  Gregorian & Jalali (Hijri_Shamsi,Solar) Date Converter Functions
Author: JDF.SCR.IR =>> Download Full Version :  http://jdf.scr.ir/jdf
License: GNU/LGPL _ Open Source & Free :: Version: 2.81 : [2020=1399]
---------------------------------------------------------------------
355746=361590-5844 & 361590=(30*33*365)+(30*8) & 5844=(16*365)+(16/4)
355666=355746-79-1 & 355668=355746-79+1 &  1595=605+990 &  605=621-16
990=30*33 & 12053=(365*33)+(32/4) & 36524=(365*100)+(100/4)-(100/100)
1461=(365*4)+(4/4) & 146097=(365*400)+(400/4)-(400/100)+(400/400)  */

/** تبدیل تاریخ میلادی به هجری شمسی
 * 
 * @param {number} gY - GregorianYear: Int
 * @param {number} gM - GregorianMonth: Int
 * @param {number} gD - GregorianDay: Int
 * 
 * @return {[number, number, number]} [PersianYear: Int, PersianMonth: Int, PersianDay: Int]: Array
 */
var gregorian_to_persian = (gY, gM, gD) => {
  var gDoM, pY, pM, pD, gY2, days;
  gDoM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  gY2 = (gM > 2) ? (gY + 1) : gY;
  days = 355666 + (365 * gY) + ~~((gY2 + 3) / 4) - ~~((gY2 + 99) / 100) + ~~((gY2 + 399) / 400) + gD + gDoM[gM - 1];
  pY = -1595 + (33 * ~~(days / 12053));
  days %= 12053;
  pY += 4 * ~~(days / 1461);
  days %= 1461;
  if (days > 365) {
    pY += ~~((days - 1) / 365);
    days = (days - 1) % 365;
  }
  if (days < 186) {
    pM = 1 + ~~(days / 31);
    pD = 1 + (days % 31);
  } else {
    pM = 7 + ~~((days - 186) / 30);
    pD = 1 + ((days - 186) % 30);
  }
  return [pY, pM, pD];
}


/** تبدیل تاریخ هجری شمسی به میلادی
 * 
 * @param {number} gY - PersianYear: Int
 * @param {number} gM - PersianMonth: Int
 * @param {number} gD - PersianDay: Int
 * 
 * @return {[number, number, number]} [GregorianYear: Int, GregorianMonth: Int, GregorianDay: Int]: Array
 */
var persian_to_gregorian = (pY, pM, pD) => {
  var gDoM, gY, gM, gD, days;
  pY += 1595;
  days = -355668 + (365 * pY) + (~~(pY / 33) * 8) + ~~(((pY % 33) + 3) / 4) + pD + ((pM < 7) ? (pM - 1) * 31 : ((pM - 7) * 30) + 186);
  gY = 400 * ~~(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gY += 100 * ~~(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gY += 4 * ~~(days / 1461);
  days %= 1461;
  if (days > 365) {
    gY += ~~((days - 1) / 365);
    days = (days - 1) % 365;
  }
  gD = days + 1;
  gDoM = [0, 31, ((gY % 4 === 0 && gY % 100 !== 0) || (gY % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (gM = 0; gM < 13 && gD > gDoM[gM]; gM++) gD -= gDoM[gM];
  return [gY, gM, gD];
}


// // --Old Function
// var islamicA0_to_julianDay = (iY, iM, iD) => {
//   return (iD + Math.ceil(29.5 * (iM - 1)) + ((iY - 1) * 354) + Math.floor((3 + (11 * iY)) / 30) + 1948439.5) - 1;
// }

// // --Old Function
// var julianDay_to_islamicA0 = (julianDay) => {
//   var iY, iM, iD;
//   julianDay = Math.floor(julianDay) + 0.5;
//   iY = Math.floor(((30 * (julianDay - 1948439.5)) + 10646) / 10631);
//   iM = Math.min(12, Math.ceil((julianDay - (29 + islamicA0_to_julianDay(iY, 1, 1))) / 29.5) + 1);
//   iD = (julianDay - islamicA0_to_julianDay(iY, iM, 1)) + 1;
//   return [iY, iM, iD];
// }


var islamicA_to_julianDay = (iy, im, id) => {
  iy += 990;
  return ~~(id + ~~((29.5 * (im - 1)) + 0.5) + ((iy - 1) * 354) + ~~((3 + (iy * 11)) / 30) + 1597616);//
  //1714556.5=1948439.5 - 1-233882
  //1597615.5=1714556.5-116941
}
var islamicA_to_julianDayFloat = (iY, iM, iD) => {
  return islamicA_to_julianDay(iY, iM, iD) - 0.5;
}

var julianDay_to_islamicA = (julianDay) => {
  var iy, im, id, tmp;
  julianDay = ~~(julianDay) + 350822.5;//350823d=990y
  iy = ~~(((30 * (julianDay - 1948439.5)) + 10646) / 10631);
  tmp = julianDay - (1948439.5 + ((iy - 1) * 354) + ~~((3 + (11 * iy)) / 30));
  iy -= 990;
  im = ~~(((tmp - 29) / 29.5) + 1.99);
  if (im > 12) im = 12;
  id = 1 + tmp - ~~((29.5 * (im - 1)) + 0.5);
  return [iy, im, id];
}
var julianDayFloat_to_islamicA = (julianDayFloat) => {
  return julianDay_to_islamicA(~~(julianDayFloat + 0.5));
}

/** تبدیل تاریخ میلادی به هجری قمری هلالی - طبق رؤیت ماه ایران
 * 
 * @param {number} gY - GregorianYear: Int
 * @param {number} gM - GregorianMonth: Int
 * @param {number} gD - GregorianDay: Int
 * 
 * @return {[number, number, number]} [IslamicYear: Int, IslamicMonth: Int, IslamicDay: Int]: Array
 */
var gregorian_to_islamic = (gY, gM, gD) => {
  return julianDay_to_islamic(gregorian_to_julianDay(gY, gM, gD));
}

/** تبدیل تاریخ میلادی به هجری قمری الگوریتمی
 * 
 * @param {number} gY - GregorianYear: Int
 * @param {number} gM - GregorianMonth: Int
 * @param {number} gD - GregorianDay: Int
 * 
 * @return {[number, number, number]} [IslamicAYear: Int, IslamicAMonth: Int, IslamicADay: Int]: Array
 */
var gregorian_to_islamicA = (gY, gM, gD) => {
  return julianDay_to_islamicA(gregorian_to_julianDay(gY, gM, gD));
}

/** تبدیل تاریخ هجری قمری هلالی به میلادی - طبق رؤیت ماه ایران
 * 
 * @param {number} gY - IslamicYear: Int
 * @param {number} gM - IslamicMonth: Int
 * @param {number} gD - IslamicDay: Int
 * 
 * @return {[number, number, number]} [GregorianYear: Int, GregorianMonth: Int, GregorianDay: Int]: Array
 */
var islamic_to_gregorian = (iY, iM, iD) => {
  return julianDay_to_gregorian(islamic_to_julianDay(iY, iM, iD));
}

/** تبدیل تاریخ هجری قمری الگوریتمی به میلادی
 * 
 * @param {number} gY - IslamicAYear: Int
 * @param {number} gM - IslamicAMonth: Int
 * @param {number} gD - IslamicADay: Int
 * 
 * @return {[number, number, number]} [GregorianYear: Int, GregorianMonth: Int, GregorianDay: Int]: Array
 */
var islamicA_to_gregorian = (iY, iM, iD) => {
  return julianDay_to_gregorian(islamicA_to_julianDay(iY, iM, iD));
}

/** تبدیل تاریخ هجری شمسی (جلالی) به هجری قمری هلالی - طبق رؤیت ماه ایران
 * 
 * @param {number} gY - PersianYear: Int
 * @param {number} gM - PersianMonth: Int
 * @param {number} gD - PersianDay: Int
 * 
 * @return {[number, number, number]} [IslamicYear: Int, IslamicMonth: Int, IslamicDay: Int]: Array
 */
var persian_to_islamic = (pY, pM, pD) => {
  return julianDay_to_islamic(persian_to_julianDay(pY, pM, pD));
}

/** تبدیل تاریخ هجری هجری شمسی به قمری الگوریتمی
 * 
 * @param {number} gY - PersianAYear: Int
 * @param {number} gM - PersianAMonth: Int
 * @param {number} gD - PersianADay: Int
 * 
 * @return {[number, number, number]} [IslamicAYear: Int, IslamicAMonth: Int, IslamicADay: Int]: Array
 */
var persian_to_islamicA = (pY, pM, pD) => {
  return julianDay_to_islamicA(persian_to_julianDay(pY, pM, pD));
}

/** تبدیل تاریخ هجری شمسی (جلالی) به هجری قمری هلالی - طبق رؤیت ماه ایران
 * 
 * @param {number} gY - IslamicYear: Int
 * @param {number} gM - IslamicMonth: Int
 * @param {number} gD - IslamicDay: Int
 * 
 * @return {[number, number, number]} [PersianYear: Int, PersianMonth: Int, PersianDay: Int]: Array
 */
var islamic_to_persian = (iY, iM, iD) => {
  return julianDay_to_persian(islamic_to_julianDay(iY, iM, iD));
}

/** تبدیل تاریخ هجری قمری الگوریتمی به هجری شمسی
 * 
 * @param {number} gY - IslamicAYear: Int
 * @param {number} gM - IslamicAMonth: Int
 * @param {number} gD - IslamicADay: Int
 * 
 * @return {[number, number, number]} [PersianYear: Int, PersianMonth: Int, PersianDay: Int]: Array
 */
var islamicA_to_persian = (iY, iM, iD) => {
  return julianDay_to_persian(islamicA_to_julianDay(iY, iM, iD));
}



// Private
// https://github.com/ilius/starcal/blob/master/scal3/cal_types/hijri-monthes.json
var hilalIM = (country = 'IR') => {
  return {
    "IR": {
      startYear: 1427,/* =iDoM:firstYear */
      startJD: 2453767,/* =islamicA_to_julianDay(startYear,1,1) */

      endYear: 1444,/* =iDoM:lastYear */
      endJD: 2460143.5,/* =islamicA_to_julianDay(endYear+1,1,1)-1 */

      iDoM: {
        1427: [355, 30, 29, 29, 30, 29, 30, 30, 30, 30, 29, 29, 30],
        1428: [354, 29, 30, 29, 29, 29, 30, 30, 29, 30, 30, 30, 29],
        1429: [354, 30, 29, 30, 29, 29, 29, 30, 30, 29, 30, 30, 29],
        1430: [354, 30, 30, 29, 29, 30, 29, 30, 29, 29, 30, 30, 29],
        1431: [354, 30, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 29],
        1432: [355, 30, 30, 29, 30, 30, 30, 29, 29, 30, 29, 30, 29],
        1433: [355, 29, 30, 29, 30, 30, 30, 29, 30, 29, 30, 29, 30],
        1434: [354, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29],
        1435: [355, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30, 29, 30],
        1436: [354, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30],
        1437: [354, 29, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30],
        1438: [354, 29, 30, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30],
        1439: [354, 29, 30, 30, 30, 30, 29, 30, 29, 29, 30, 29, 29],
        1440: [355, 30, 29, 30, 30, 30, 29, 30, 30, 29, 29, 30, 29],
        1441: [355, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29, 30],
        1442: [354, 29, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29],
        1443: [354, 29, 30, 30, 29, 29, 30, 29, 30, 29, 30, 30, 29],
        1444: [354/*|355*/, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29/*|30 :خنثی‌سازی اختلاف مجموع کل*/]
        /*
          اختلاف = endJd - islamicA_to_julianDate(endYear,12,29)
        */
      }
    }
  }[country];
}


var julianDay_to_islamic = (julianDay) => {
  const HILAL = hilalIM(COUNTRY);
  if (julianDay < HILAL.startJD || julianDay > HILAL.endJD) {
    return julianDay_to_islamicA(julianDay);
  } else {
    let iY, iM;
    let iD = julianDay - HILAL.startJD + 1;
    for (iY in HILAL.iDoM) {
      if (iD > HILAL.iDoM[iY][0]) {
        iD -= HILAL.iDoM[iY][0];
      } else {
        for (iM = 1; iM < 13, iD > HILAL.iDoM[iY][iM]; iM++) {
          iD -= HILAL.iDoM[iY][iM];
        }
        break;
      }
    }
    return [+iY, iM, ~~iD];
  }
}
var julianDayFloat_to_islamic = (julianDayFloat) => {
  const HILAL = hilalIM(COUNTRY);
  if (julianDayFloat < (HILAL.startJD - 0.5) || julianDayFloat > (HILAL.endJD - 0.5)) {
    return julianDayFloat_to_islamicA(julianDayFloat);
  } else {
    let iY, iM;
    let iD = julianDayFloat - (HILAL.startJD - 0.5) + 1;
    for (iY in HILAL.iDoM) {
      if (iD > HILAL.iDoM[iY][0]) {
        iD -= HILAL.iDoM[iY][0];
      } else {
        for (iM = 1; iM < 13, iD > HILAL.iDoM[iY][iM]; iM++) {
          iD -= HILAL.iDoM[iY][iM];
        }
        break;
      }
    }
    return [+iY, iM, ~~(iD + 0)];
  }
}

var islamic_to_julianDay = (iY, iM, iD) => {
  const HILAL = hilalIM(COUNTRY);
  if (iY < HILAL.startYear || iY > HILAL.endYear) {
    return islamicA_to_julianDay(iY, iM, iD);
  } else {
    let julianDay = HILAL.startJD - 1 + iD;
    for (let y in HILAL.iDoM) {
      if (y < iY) {
        julianDay += HILAL.iDoM[y][0];
      } else {
        for (let m = 1; m < iM; m++)julianDay += HILAL.iDoM[iY][m];
        break;
      }
    }
    return julianDay;
  }
}
var islamic_to_julianDayFloat = (iY, iM, iD) => {
  const HILAL = hilalIM(COUNTRY);
  if (iY < HILAL.startYear || iY > HILAL.endYear) {
    return islamicA_to_julianDayFloat(iY, iM, iD);
  } else {
    let julianDayFloat = HILAL.startJD - 1.5 + iD;
    for (let y in HILAL.iDoM) {
      if (y < iY) {
        julianDayFloat += HILAL.iDoM[y][0];
      } else {
        for (let m = 1; m < iM; m++)julianDayFloat += HILAL.iDoM[iY][m];
        break;
      }
    }
    return julianDayFloat;
  }
}


/** تبدیل تاریخ هجری قمری هلالی به هجری قمری الگوریتمی - طبق رؤیت ماه ایران
 * 
 * @param {number} iY - IslamicYear: Int
 * @param {number} iM - IslamicMonth: Int
 * @param {number} iD - IslamicDay: Int
 * 
 * @return {[number, number, number]} [IslamicAYear: Int, IslamicAMonth: Int, IslamicADay: Int]: Array
 */
var islamic_to_islamicA = (iY, iM, iD) => {
  return julianDay_to_islamicA(islamic_to_julianDay(iY, iM, iD));
}

/** تبدیل تاریخ هجری قمری الگوریتمی به هجری قمری هلالی - طبق رؤیت ماه ایران
 * 
 * @param {number} iY - IslamicAYear: Int
 * @param {number} iM - IslamicAMonth: Int
 * @param {number} iD - IslamicADay: Int
 * 
 * @return {[number, number, number]} [IslamicYear: Int, IslamicMonth: Int, IslamicDay: Int]: Array
 */
var islamicA_to_islamic = (iY, iM, iD) => {
  return julianDay_to_islamic(islamicA_to_julianDay(iY, iM, iD));
}


// Private Function, Only for test "hilalIM(COUNTRY)" object
var barrasiyeEkhtelafGhamari = () => {
  const HILAL = hilalIM(COUNTRY);
  return '\n-----\n' +
    /* خروجی این بخش، قطعاً باید مساوی باشد */
    islamicA_to_julianDay(HILAL.startYear, 1, 1) + ' old'
    + '\n' + islamic_to_julianDay(HILAL.startYear, 1, 1) + ' new'
    + '\n\n' + julianDay_to_islamicA(HILAL.startJD).join('/') + ' old'
    + '\n' + julianDay_to_islamic(HILAL.startJD).join('/') + ' new'

    // + '\n-----\n' +
    /* مساوی یا نامساوی بودن این بخش وسط، مهم نیست */
    // islamicA_to_julianDay(HILAL.endYear, 12, HILAL.iDoM[HILAL.endYear][12]) + ' old : == or !='
    // + '\n' + islamic_to_julianDay(HILAL.endYear, 12, HILAL.iDoM[HILAL.endYear][12]) + ' new : == or !='
    // + '\n\n' + julianDay_to_islamicA(HILAL.endJD).join('/') + ' old : == or !='
    // + '\n' + julianDay_to_islamic(HILAL.endJD).join('/') + ' new : == or !='

    + '\n-----\n' +
    /* خنثی‌سازی اختلاف مجموع کل: اگر خروجی بخش پایین، نامساوی بود */
    islamicA_to_julianDay(HILAL.endYear + 1, 1, 1) + ' old'
    + '\n' + islamic_to_julianDay(HILAL.endYear + 1, 1, 1) + ' new'
    + '\n\n' + julianDay_to_islamicA(HILAL.endJD + 1).join('/') + ' old'
    + '\n' + julianDay_to_islamic(HILAL.endJD + 1).join('/') + ' new';
}


var roozeJulian_be_hameh = (roozeJulian) => {//موقت + اصلاح شود مثل پایین‌تر
  return {
    shamsi: julianDay_to_persian(roozeJulian),
    ghamari: julianDay_to_islamic(roozeJulian),
    ghamariA: julianDay_to_islamicA(roozeJulian),
    miladi: julianDay_to_gregorian(roozeJulian),
    roozeHafteh: ((~~(roozeJulian - 0.5) + 3) % 7),
    zaman: julianDay_to_time(julianDay),
    mohreZaman: julianDay_to_timeStamp(roozeJulian),
    roozeJulian: roozeJulian,
    roozeJulianS12: ~~(roozeJulian + 0.5)
  };
}
// roozeJulian_be_hameh <<==>> julianDay_to_all
var julianDay_to_all = (julianDay) => {
  let timeStamp = julianDay_to_timeStamp(julianDay);
  let date0 = new Date(timeStamp);
  return {
    persian: julianDay_to_persian(julianDay),
    gregorian: julianDay_to_gregorian(julianDay),
    islamic: julianDay_to_islamic(julianDay),
    islamicA: julianDay_to_islamicA(julianDay),
    dayOfWeek: ((~~(julianDay + 0.5) + 2) % 7),
    time: [date0.getHours(), date0.getMinutes(), date0.getSeconds(), date0.getMilliseconds()],
    timeStamp: timeStamp,
    timezoneOffset: date0.getTimezoneOffset(timeStamp),
    julianDayFloat: julianDay,
    julianDay: ~~(julianDay + 0.5)
  };
}

var julianDay_to_dayOfWeek = (julianDay) => {
  return ((~~(julianDay + 0.5) + 2) % 7);
}


var mohreZaman_be_hameh = (mohreZaman) => {//موقت + اصلاح شود مثل پایین‌تر
  return roozeJulian_be_hameh(timeStamp_to_julianDay(mohreZaman));
};

var timeStamp_to_all = (timeStamp) => {
  let date0 = new Date(timeStamp);
  let [gYear, gMonth, gDay, hour, minute, second, miliSecond] = [
    date0.getFullYear(), date0.getMonth() + 1, date0.getDate(),
    date0.getHours(), date0.getMinutes(), date0.getSeconds(), date0.getMilliseconds()
  ];
  let julianDay = gregorian_to_julianDay(gYear, gMonth, gDay);
  return {
    persian: julianDay_to_persian(julianDay),
    gregorian: [gYear, gMonth, gDay],
    islamic: julianDay_to_islamic(julianDay),
    islamicA: julianDay_to_islamicA(julianDay),
    dayOfWeek: ((~~(julianDay + 0.5) + 2) % 7),
    time: [hour, minute, second, miliSecond],
    timeStamp,
    timezoneOffset: date0.getTimezoneOffset(),
    julianDayFloat: timeStamp_to_julianDay(timeStamp),
    julianDay: ~~(julianDay + 0.5)
  };

};


var timeStamp_to_persian = (timeStamp) => {
  return julianDay_to_persian(timeStamp_to_julianDay(timeStamp));
}

var timeStamp_to_islamic = (timeStamp) => {
  return julianDay_to_islamic(timeStamp_to_julianDay(timeStamp));
}

var timeStamp_to_gregorian = (timeStamp) => {
  return julianDay_to_gregorian(timeStamp_to_julianDay(timeStamp));
}


var persian_to_timeStamp = (year, month, day) => {
  return julianDay_to_timeStamp(persian_to_julianDay(year, month, day));
}

var islamic_to_timeStamp = (year, month, day) => {
  return julianDay_to_timeStamp(islamic_to_julianDay(year, month, day));
}

var gregorian_to_timeStamp = (year, month, day) => {
  return julianDay_to_timeStamp(gregorian_to_julianDay(year, month, day));
}


var is_persian_leap = (py) => {
  return ((((py + 990 + 12) % 33) % 4) === 1) ? true : false;
}

var is_gregorian_leap = (gY) => {
  return ((gY % 4 === 0 && gY % 100 !== 0) || (gY % 400 === 0)) ? true : false;
}

var is_islamicA_leap = (iY) => {
  return (((((iY + 990 + 3) % 30) % 11) % 3) === 0) ? true : false;
}

var is_islamic_leap = (iY) => {
  const HILAL = hilalIM(COUNTRY);
  if (HILAL.iDoM[iM] !== undefined) {
    return (HILAL.iDoM[iM][0] === 355) ? true : false;
  } else {
    return is_islamicA_leap(iY);
  }
}

var mName = {
  shamsi: ['', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
  ghamari: ['', 'محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاولی', 'جمادی‌الثانیه', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذی‌القعده', 'ذی‌الحجه'],
  miladiEn: ['', 'January', 'February', 'March', 'April', 'May', 'Juan', 'July', 'August', 'September', 'October', 'November', 'December'],
  miladi: ['', 'ژانویه', 'فوریه', 'مارس', 'آوریل', 'می', 'ژوئن', 'جولای', 'آگوست', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر']
};






var date_to_days = (
  daysOfYear/* ~365.2425:Pesrsian&Gregorian | ~354.3667:Islamic */,
  daysOfMonth/* ~30.4369:Pesrsian&Gregorian | ~29.5305:Islamic */,
  year = 0, month = 0, day = 0
) => {
  return ~~((year * daysOfYear) + (month * daysOfMonth) + day);
}

var days_to_date = (
  daysOfYear/* ~365.2425:Pesrsian&Gregorian | ~354.3667:Islamic */,
  daysOfMonth/* ~30.4369:Pesrsian&Gregorian | ~29.5305:Islamic */,
  days = 0
) => {
  let year = ~~(days / daysOfYear);
  days -= days % daysOfYear;
  let month = ~~(days / daysOfMonth);
  days -= days % daysOfMonth;
  let day = ~~(days);
  return {
    year, month, day,
    toArray: () => [year, month, day]
  };
}


var time_to_miliSeconds = (hour = 0, minute = 0, second = 0, miliSecond = 0) => {
  return ((((hour * 3600) + (minute * 60) + second) * 1000) + miliSecond);
}

var time_to_Seconds = (hour = 0, minute = 0, second = 0) => {
  return ((hour * 3600) + (minute * 60) + second);
}

var miliSeconds_to_time = (miliSeconds) => {
  let miliSecond = ~~(miliSeconds % 1000);
  let second = ~~(miliSeconds / 1000);
  let hour = ~~(second / 3600);
  second = second % 3600;
  let minute = ~~(second / 60);
  second = second % 60;
  return [hour, minute, second, miliSecond];
}

var seconds_to_time = (seconds) => {
  let hour = ~~(seconds / 3600);
  let second = seconds % 3600;
  let minute = ~~(second / 60);
  second = second % 60;
  return [hour, minute, second];
}


var julianDay_to_time = (none = null) => {
  return [12, 0, 0, 0];
}
var julianDayFloat_to_time = (julianDayFloat) => {
  let date0 = new Date(julianDayFloat_to_timeStamp(julianDayFloat));
  return [date0.getHours(), date0.getMinutes(), date0.getSeconds(), date0.getMilliseconds()];
}

var timeStamp_to_time = (timeStamp) => {
  let date0 = new Date(timeStamp);
  return [date0.getHours(), date0.getMinutes(), date0.getSeconds(), date0.getMilliseconds()];
}

var timeStamp_to_julianDayFloat = (timeStamp, time = null) => {
  if (Array.isArray(time)) {
    let tmp = 0;
    if (!isNaN(time[0])) tmp += (time[0] * 3600);
    if (!isNaN(time[1])) tmp += (time[1] * 60);
    if (!isNaN(time[2])) tmp += time[2];
    return (~~(timeStamp / 86400000) + (tmp / 86400) + 2440587.5);
  }
  return ((timeStamp / 86400000) + 2440587.5);
}
var timeStamp_to_julianDay = (timeStamp, time = null) => {
  return ~~(timeStamp_to_julianDayFloat(timeStamp, time) + 0.5);
}

var julianDay_to_timeStamp = (julianDay, time = null) => {
  let [hour, minute, second, miliSecond] = (time === null) ? [12, 0, 0, 0]
    : [time[0] || 12, time[1] || 0, time[2] || 0, time[3] || 0];
  let date0 = new Date(~~(julianDay - 2440587) * 86400000);
  date0.setHours(hour, minute, second, miliSecond);
  return date0.getTime();
}

var julianDayFloat_to_timeStamp = (julianDayFloat) => {
  return Math.round((julianDayFloat - 2440587.5) * 86400000);
}

var now_gregorian = () => {
  let gDate = new Date();
  return [gDate.getFullYear(), gDate.getMonth() + 1, gDate.getDate()];
}

var now_persian = () => {
  let gDate = now_gregorian();
  return gregorian_to_persian(gDate[0], gDate[1], gDate[2]);
}

var now_islamic = () => {
  let gDate = now_gregorian();
  return gregorian_to_islamic(gDate[0], gDate[1], gDate[2]);
}

var now_islamicA = () => {
  let gDate = now_gregorian();
  return gregorian_to_islamicA(gDate[0], gDate[1], gDate[2]);
}

var now_julianDay = (time = null) => {
  return timeStamp_to_julianDay(Date.now(), time);
}

var now_timeStamp = () => {
  return Date.now();
}

var now_timeStampS = (intOut = true) => {
  let tsS = (Date.now() / 1000);
  return (intOut) ? ~~(tsS) : tsS;
}

var diff_gregorian = (date1, date0 = null) => {
  return (
    gregorian_to_julianDay(date1[0], date1[1], date1[2]) -
    ((date0 === null) ? now_julianDay() : gregorian_to_julianDay(date0[0], date0[1], date0[2]))
  );
}

var diff_persian = (date1, date0 = null) => {
  return (
    persian_to_julianDay(date1[0], date1[1], date1[2]) -
    ((date0 === null) ? now_julianDay() : persian_to_julianDay(date0[0], date0[1], date0[2]))
  );
}

var diff_islamic = (date1, date0 = null) => {
  return (
    islamic_to_julianDay(date1[0], date1[1], date1[2]) -
    ((date0 === null) ? now_julianDay() : islamic_to_julianDay(date0[0], date0[1], date0[2]))
  );
}

var diff_islamicA = (date1, date0 = null) => {
  return (
    islamicA_to_julianDay(date1[0], date1[1], date1[2]) -
    ((date0 === null) ? now_julianDay() : islamicA_to_julianDay(date0[0], date0[1], date0[2]))
  );
}

var daysOfMonth_persian = (year, month) => {
  return ((month < 7) ? 31 : ((month < 12) ? 30 : (is_persian_leap(year) ? 30 : 29)));
}

var check_persian = (year, month, day, strict = true) => {
  return !(
    isNaN(year) || isNaN(month) || isNaN(day) ||
    year < -32767 || year > 32767 ||
    month < 1 || month > 12 ||
    day < 1 || day > ((month === 12 && (!strict || year < 1178 || year > 1633)) ? 30 : daysOfMonth_persian(year, month))
  );
}


var daysOfMonth_gregorian = (year, month) => {
  return [0, 31, (is_gregorian_leap(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

var check_gregorian = (year, month, day, strict = true) => {
  return !(
    isNaN(year) || isNaN(month) || isNaN(day) ||
    year < -32767 || year > 32767 ||
    month < 1 || month > 12 ||
    day < 1 || day > ((!strict && month === 2) ? 29 : daysOfMonth_gregorian(year, month))
  );
}


var daysOfMonth_islamic = (year, month) => {
  if (month === 12) {
    year++;
    month = 1;
  } else {
    month++;
  }
  return julianDay_to_islamic(islamic_to_julianDay(year, month, 1) - 1)[2];
}

var check_islamic = (year, month, day, strict = false) => {
  return !(
    isNaN(year) || isNaN(month) || isNaN(day) ||
    year < -641 || year > 32767 ||
    month < 1 || month > 12 ||
    day < 1 || day > ((!strict) ? 30 : daysOfMonth_islamic(year, month))
  );
}


var daysOfMonth_islamicA = (year, month) => {
  if (month === 12) {
    year++;
    month = 1;
  } else {
    month++;
  }
  return julianDay_to_islamicA(islamicA_to_julianDay(year, month, 1) - 1)[2];
}

var check_islamicA = (year, month, day, strict = false) => {
  return !(
    isNaN(year) || isNaN(month) || isNaN(day) ||
    year < -641 || year > 32767 ||
    month < 1 || month > 12 ||
    day < 1 || day > ((!strict) ? 30 : daysOfMonth_islamicA(year, month))
  );
}

var change_persian = (change, dateTime = null) => {
  let _julianDay = 0, _miliSeconds, year, month, day, hour, minute, second, miliSecond;

  let [ch_year, ch_month, ch_day, ch_hour, ch_minute, ch_second, ch_miliSecond] = [
    change[0] || 0, change[1] || 0, change[2] || 0,
    change[3] || 0, change[4] || 0, change[5] || 0, change[6] || 0
  ];

  if (dateTime === null) {
    let date = new Date();
    [year, month, day] = gregorian_to_persian(date.getFullYear(), date.getMonth() + 1, date.getDate());
    [hour, minute, second, miliSecond] = [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
  } else if (Array.isArray(dateTime)) {
    [year, month, day, hour, minute, second, miliSecond] = [
      dateTime[0], dateTime[1] || 1, dateTime[2] || 1,
      dateTime[3] || 0, dateTime[4] || 0, dateTime[5] || 0, dateTime[6] || 0
    ];
  } else if (typeof (dateTime) === "object") {
    if ('julianDay' in dateTime) {
      [year, month, day, hour, minute, second, miliSecond] = [
        ...julianDay_to_persian(dateTime),
        ...julianDay_to_time(dateTime)
      ];
    } else if ('julianDayFloat' in dateTime) {
      [year, month, day, hour, minute, second, miliSecond] = [
        ...julianDayFloat_to_persian(dateTime),
        ...julianDayFloat_to_time(dateTime)
      ];
    } else if ('timeStamp' in dateTime) {
      [year, month, day, hour, minute, second, miliSecond] = [
        ...timeStamp_to_persian(dateTime),
        ...timeStamp_to_time(dateTime)
      ];
    }
  }

  year += ch_year;
  month += ch_month;

  if (month < 1 || month > 12) {
    year += ~~(month / 12);
    month %= 12;
    if (month < 1) {
      month += 12;
      year--;
    }
  }

  _miliSeconds = time_to_miliSeconds(hour + ch_hour, minute + ch_minute, second + ch_second, miliSecond + ch_miliSecond);

  if (_miliSeconds < 0 || _miliSeconds >= 86400000) {
    if (_miliSeconds < 0) _julianDay--;
    _julianDay += ~~(_miliSeconds / 86400000);
    _miliSeconds %= 86400000;
  }

  _julianDay += ch_day + persian_to_julianDay(year, month, day) + (_miliSeconds / 86400000);

  return [
    ...julianDay_to_persian(~~_julianDay),
    ...miliSeconds_to_time(_miliSeconds),
    ~~_julianDay
  ];
}

var change_gregorian = (change, dateTime = null) => {
  let _julianDay = 0, _miliSeconds, year, month, day, hour, minute, second, miliSecond;

  let [ch_year, ch_month, ch_day, ch_hour, ch_minute, ch_second, ch_miliSecond] = [
    change[0] || 0, change[1] || 0, change[2] || 0,
    change[3] || 0, change[4] || 0, change[5] || 0, change[6] || 0
  ];

  if (dateTime === null) {
    let date = new Date();
    [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    [hour, minute, second, miliSecond] = [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
  } else {
    [year, month, day, hour, minute, second, miliSecond] = [
      dateTime[0], dateTime[1] || 1, dateTime[2] || 1,
      dateTime[3] || 0, dateTime[4] || 0, dateTime[5] || 0, dateTime[6] || 0
    ];
  }

  year += ch_year;
  month += ch_month;

  if (month < 1 || month > 12) {
    year += ~~(month / 12);
    month %= 12;
    if (month < 1) {
      month += 12;
      year--;
    }
  }

  _miliSeconds = time_to_miliSeconds(hour + ch_hour, minute + ch_minute, second + ch_second, miliSecond + ch_miliSecond);

  if (_miliSeconds < 0 || _miliSeconds >= 86400000) {
    if (_miliSeconds < 0) _julianDay--;
    _julianDay += ~~(_miliSeconds / 86400000);
    _miliSeconds %= 86400000;
  }

  _julianDay += ch_day + gregorian_to_julianDay(year, month, day) + (_miliSeconds / 86400000);

  return [
    ...julianDay_to_gregorian(~~_julianDay),
    ...miliSeconds_to_time(_miliSeconds),
    ~~_julianDay
  ];
}

var change_islamic = (change, dateTime = null) => {
  let _julianDay = 0, _miliSeconds, year, month, day, hour, minute, second, miliSecond;

  let [ch_year, ch_month, ch_day, ch_hour, ch_minute, ch_second, ch_miliSecond] = [
    change[0] || 0, change[1] || 0, change[2] || 0,
    change[3] || 0, change[4] || 0, change[5] || 0, change[6] || 0
  ];

  if (dateTime === null) {
    let date = new Date();
    [year, month, day] = gregorian_to_islamic(date.getFullYear(), date.getMonth() + 1, date.getDate());
    [hour, minute, second, miliSecond] = [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
  } else {
    [year, month, day, hour, minute, second, miliSecond] = [
      dateTime[0], dateTime[1] || 1, dateTime[2] || 1,
      dateTime[3] || 0, dateTime[4] || 0, dateTime[5] || 0, dateTime[6] || 0
    ];
  }

  year += ch_year;
  month += ch_month;

  if (month < 1 || month > 12) {
    year += ~~(month / 12);
    month %= 12;
    if (month < 1) {
      month += 12;
      year--;
    }
  }

  _miliSeconds = time_to_miliSeconds(hour + ch_hour, minute + ch_minute, second + ch_second, miliSecond + ch_miliSecond);

  if (_miliSeconds < 0 || _miliSeconds >= 86400000) {
    if (_miliSeconds < 0) _julianDay--;
    _julianDay += ~~(_miliSeconds / 86400000);
    _miliSeconds %= 86400000;
  }

  _julianDay += ch_day + islamic_to_julianDay(year, month, day) + (_miliSeconds / 86400000);

  return [
    ...julianDay_to_islamic(~~_julianDay),
    ...miliSeconds_to_time(_miliSeconds),
    ~~_julianDay
  ];
}

var change_islamicA = (change, dateTime = null) => {
  let _julianDay = 0, _miliSeconds, year, month, day, hour, minute, second, miliSecond;

  let [ch_year, ch_month, ch_day, ch_hour, ch_minute, ch_second, ch_miliSecond] = [
    change[0] || 0, change[1] || 0, change[2] || 0,
    change[3] || 0, change[4] || 0, change[5] || 0, change[6] || 0
  ];

  if (dateTime === null) {
    let date = new Date();
    [year, month, day] = gregorian_to_islamicA(date.getFullYear(), date.getMonth() + 1, date.getDate());
    [hour, minute, second, miliSecond] = [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
  } else {
    [year, month, day, hour, minute, second, miliSecond] = [
      dateTime[0], dateTime[1] || 1, dateTime[2] || 1,
      dateTime[3] || 0, dateTime[4] || 0, dateTime[5] || 0, dateTime[6] || 0
    ];
  }

  year += ch_year;
  month += ch_month;

  if (month < 1 || month > 12) {
    year += ~~(month / 12);
    month %= 12;
    if (month < 1) {
      month += 12;
      year--;
    }
  }

  _miliSeconds = time_to_miliSeconds(hour + ch_hour, minute + ch_minute, second + ch_second, miliSecond + ch_miliSecond);

  if (_miliSeconds < 0 || _miliSeconds >= 86400000) {
    if (_miliSeconds < 0) _julianDay--;
    _julianDay += ~~(_miliSeconds / 86400000);
    _miliSeconds %= 86400000;
  }

  _julianDay += ch_day + islamicA_to_julianDay(year, month, day) + (_miliSeconds / 86400000);

  return [
    ...julianDay_to_persian(~~_julianDay),
    ...miliSeconds_to_time(_miliSeconds),
    ~~_julianDay
  ];
}


var persian_to_dayOfWeek = (year, month, day) => {
  return ((persian_to_julianDay(year, month, day) + 2) % 7);
}
var gregorian_to_dayOfWeek = (year, month, day) => {
  return ((gregorian_to_julianDay(year, month, day) + 2) % 7);
}
var islamic_to_dayOfWeek = (year, month, day) => {
  return ((islamic_to_julianDay(year, month, day) + 2) % 7);
}
var islamicA_to_dayOfWeek = (year, month, day) => {
  return ((islamicA_to_julianDay(year, month, day) + 2) % 7);
}



var persian_to_julianDay_in_monthStart = (year, month) => {
  return persian_to_julianDay(year, month, 1);
}
var gregorian_to_julianDay_in_monthStart = (year, month) => {
  return gregorian_to_julianDay(year, month, 1);
}
var islamic_to_julianDay_in_monthStart = (year, month) => {
  return islamic_to_julianDay(year, month, 1);
}
var islamicA_to_julianDay_in_monthStart = (year, month) => {
  return islamicA_to_julianDay(year, month, 1);
}

var persian_to_julianDay_in_monthEnd = (year, month) => {
  return persian_to_julianDay(year, month, daysOfMonth_persian(year, month));
}
var gregorian_julianDay_in_to_monthEnd = (year, month) => {
  return gregorian_to_julianDay(year, month, daysOfMonth_gregorian(year, month));
}
var islamic_to_julianDay_in_monthEnd = (year, month) => {
  return islamic_to_julianDay(year, month, daysOfMonth_islamic(year, month));
}
var islamicA_to_julianDay_in_monthEnd = (year, month) => {
  return islamicA_to_julianDay(year, month, daysOfMonth_islamicA(year, month));
}



var persian_to_dayOfWeek_in_monthStart = (year, month) => {
  return ((persian_to_julianDay(year, month, 1) + 2) % 7);
}
var gregorian_to_dayOfWeek_in_monthStart = (year, month) => {
  return ((gregorian_to_julianDay(year, month, 1) + 2) % 7);
}
var islamic_to_dayOfWeek_in_monthStart = (year, month) => {
  return ((islamic_to_julianDay(year, month, 1) + 2) % 7);
}
var islamicA_to_dayOfWeek_in_monthStart = (year, month) => {
  return ((islamicA_to_julianDay(year, month, 1) + 2) % 7);
}

var persian_to_dayOfWeek_in_monthEnd = (year, month) => {
  return ((persian_to_julianDay(year, month, daysOfMonth_persian(year, month)) + 2) % 7);
}
var gregorian_to_dayOfWeek_in_monthEnd = (year, month) => {
  return ((gregorian_to_julianDay(year, month, daysOfMonth_gregorian(year, month)) + 2) % 7);
}
var islamic_to_dayOfWeek_in_monthEnd = (year, month) => {
  return ((islamic_to_julianDay(year, month, daysOfMonth_islamic(year, month)) + 2) % 7);
}
var islamicA_to_dayOfWeek_in_monthEnd = (year, month) => {
  return ((islamicA_to_julianDay(year, month, daysOfMonth_islamicA(year, month)) + 2) % 7);
}



var firstNthDayOfWeek_in_persianMonth = (year, month, nthDayOfWeek) => {
  let mStartJD = persian_to_julianDay(year, month, 1);
  return (mStartJD + ((7 + nthDayOfWeek - ((mStartJD + 2) % 7)) % 7));
}
var firstNthDayOfWeek_in_gregorianMonth = (year, month, nthDayOfWeek) => {
  let mStartJD = gregorian_to_julianDay(year, month, 1);
  return (mStartJD + ((7 + nthDayOfWeek - ((mStartJD + 2) % 7)) % 7));
}
var firstNthDayOfWeek_in_islamicMonth = (year, month, nthDayOfWeek) => {
  let mStartJD = islamic_to_julianDay(year, month, 1);
  return (mStartJD + ((7 + nthDayOfWeek - ((mStartJD + 2) % 7)) % 7));
}
var firstNthDayOfWeek_in_islamicAMonth = (year, month, nthDayOfWeek) => {
  let mStartJD = islamicA_to_julianDay(year, month, 1);
  return (mStartJD + ((7 + nthDayOfWeek - ((mStartJD + 2) % 7)) % 7));
}

var lastNthDayOfWeek_in_persianMonth = (year, month, nthDayOfWeek) => {
  let mEndJD = persian_to_julianDay(year, month, daysOfMonth_persian(year, month));
  return (mEndJD - ((7 + ((mEndJD + 2) % 7) - nthDayOfWeek) % 7));
}
var lastNthDayOfWeek_in_gregorianMonth = (year, month, nthDayOfWeek) => {
  let mEndJD = gregorian_to_julianDay(year, month, daysOfMonth_gregorian(year, month));
  return (mEndJD - ((7 + ((mEndJD + 2) % 7) - nthDayOfWeek) % 7));
}
var lastNthDayOfWeek_in_islamicMonth = (year, month, nthDayOfWeek) => {
  let mEndJD = islamic_to_julianDay(year, month, daysOfMonth_islamic(year, month));
  return (mEndJD - ((7 + ((mEndJD + 2) % 7) - nthDayOfWeek) % 7));
}
var lastNthDayOfWeek_in_islamicAMonth = (year, month, nthDayOfWeek) => {
  let mEndJD = islamicA_to_julianDay(year, month, daysOfMonth_islamicA(year, month));
  return (mEndJD - ((7 + ((mEndJD + 2) % 7) - nthDayOfWeek) % 7));
}





// var roozeHafteh = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

var roozeHafteh = new Proxy(
  ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
  {
    get(target, prop) {
      if (prop >= 0 && prop <= 6) {
        return target[prop];
      } else if (prop > 6) {
        return target[prop % 7];
      } else if (prop < 0) {
        return target[6 - ((Math.abs(prop) - 1) % 7)];
      } else {
        return 'نامعلوم'; // default value
      }
    }
  }
);

var TarikhObject = function (timeStamp = Date.now()) {

  const [
    _all, _setPersian, _setGregorian, _setIslamic, _setIslamicA, _setTime
  ] = [Symbol(), Symbol(), Symbol(), Symbol(), Symbol(), Symbol()];

  return {
    [_all]: timeStamp_to_all(timeStamp),

    get all() {
      return this[_all];
    },
    // all<<==>>valueOf()
    valueOf() {
      return this[_all];
    },

    setNow() {
      this[_all] = timeStamp_to_all(Date.now());
    },

    [_setTime](hour, minute, second, miliSecond) {
      let julianDayFloat = this[_all].julianDay + (time_to_miliSeconds(hour, minute, second, miliSecond) / 86400000) - 0.5;
      this[_all].julianDayFloat = julianDayFloat;
      this[_all].timeStamp = julianDay_to_timeStamp(julianDayFloat);
      this[_all].time = [hour, minute, second, miliSecond];
    },

    set time(time) {
      this[_setTime](time[0] || 0, time[1] || 0, time[2] || 0, time[3] || 0);
    },

    get time() {
      return this[_all].time;
    },

    set hour(hour) {
      this[_setTime](hour, this[_all].time[1], this[_all].time[2], this[_all].time[3]);
    },

    get hour() {
      return this[_all].time[0];
    },

    set minute(minute) {
      this[_setTime](this[_all].time[0], minute, this[_all].time[2], this[_all].time[3]);
    },

    get minute() {
      return this[_all].time[1];
    },

    set second(second) {
      this[_setTime](this[_all].time[0], this[_all].time[1], second, this[_all].time[3]);
    },

    get second() {
      return this[_all].time[2];
    },

    set miliSecond(miliSecond) {
      this[_setTime](this[_all].time[0], this[_all].time[1], this[_all].time[2], miliSecond);
    },

    get miliSecond() {
      return this[_all].time[3];
    },


    set timeStamp(timeStamp) {
      this[_all] = timeStamp_to_all(timeStamp);
    },

    get timeStamp() {
      return this[_all].timeStamp;
    },


    set julianDay(julianDay) {
      this[_all] = julianDay_to_all(~~julianDay);
    },

    get julianDay() {
      return this[_all].julianDay;
    },

    set julianDayFloat(julianDayFloat) {
      this[_all] = julianDay_to_all(julianDayFloat);
    },

    get julianDayFloat() {
      return this[_all].julianDayFloat;
    },

    setJulianDayToOnlyDates(julianDay) {
      const a = julianDay_to_all(julianDay);
      [
        this[_all].julianDayFloat,
        this[_all].julianDay,
        this[_all].timeStamp,
        this[_all].persian,
        this[_all].gregorian,
        this[_all].islamic,
        this[_all].islamicA,
        this[_all].dayOfWeek
      ] = [
          ~~(a.julianDayFloat) + (this[_all].julianDayFloat % 1),
          ~~(a.julianDay + 0.5),
          a.timeStamp,
          a.persian,
          a.gregorian,
          a.islamic,
          a.islamicA,
          a.dayOfWeek
        ];
    },

    set dayOfWeek(dayNum) {
      if (
        !isNaN(dayNum) && dayNum >= 0 && dayNum <= 6
      ) this.setJulianDayToOnlyDates(this[_all].julianDay + (~~dayNum - this[_all].dayOfWeek));
    },

    get dayOfWeek() {
      return this[_all].dayOfWeek;
    },

    get persian() {
      return this[_all].persian;
    },

    get persianYear() {
      return this[_all].persian[0];
    },

    get persianMonth() {
      return this[_all].persian[1];
    },

    get persianDay() {
      return this[_all].persian[2];
    },


    get gregorian() {
      return this[_all].gregorian;
    },

    get gregorianYear() {
      return this[_all].gregorian[0];
    },

    get gregorianMonth() {
      return this[_all].gregorian[1];
    },

    get gregorianDay() {
      return this[_all].gregorian[2];
    },


    get islamic() {
      return this[_all].islamic;
    },

    get islamicYear() {
      return this[_all].islamic[0];
    },

    get islamicMonth() {
      return this[_all].islamic[1];
    },

    get islamicDay() {
      return this[_all].islamic[2];
    },


    get islamicA() {
      return this[_all].islamicA;
    },

    get islamicAYear() {
      return this[_all].islamicA[0];
    },

    get islamicAMonth() {
      return this[_all].islamicA[1];
    },

    get islamicADay() {
      return this[_all].islamicA[2];
    },


    [_setPersian](year, month, day) {
      this.setJulianDayToOnlyDates(persian_to_julianDay(year, month, day));
    },

    set persian(persian) {
      this[_setPersian](persian[0], persian[1] || 1, persian[2] || 1);
    },

    set persianYear(year) {
      this[_setPersian](year, this[_all].persian[1], this[_all].persian[2]);
    },

    set persianMonth(month) {
      this[_setPersian](this[_all].persian[0], month, this[_all].persian[2]);
    },

    set persianDay(day) {
      this[_setPersian](this[_all].persian[0], this[_all].persian[1], day);
    },


    [_setGregorian](year, month, day) {
      this.setJulianDayToOnlyDates(gregorian_to_julianDay(year, month, day));
    },

    set gregorian(gregorian) {
      this[_setGregorian](gregorian[0], gregorian[1] || 1, gregorian[2] || 1);
    },

    set gregorianYear(year) {
      this[_setGregorian](year, this[_all].gregorian[1], this[_all].gregorian[2]);
    },

    set gregorianMonth(month) {
      this[_setGregorian](this[_all].gregorian[0], month, this[_all].gregorian[2]);
    },

    set gregorianDay(day) {
      this[_setGregorian](this[_all].gregorian[0], this[_all].gregorian[1], day);
    },


    [_setIslamic](year, month, day) {
      this.setJulianDayToOnlyDates(islamic_to_julianDay(year, month, day));
    },

    set islamic(islamic) {
      this[_setIslamic](islamic[0], islamic[1] || 1, islamic[2] || 1);
    },

    set islamicYear(year) {
      this[_setIslamic](year, this[_all].islamic[1], this[_all].islamic[2]);
    },

    set islamicMonth(month) {
      this[_setIslamic](this[_all].islamic[0], month, this[_all].islamic[2]);
    },

    set islamicDay(day) {
      this[_setIslamic](this[_all].islamic[0], this[_all].islamic[1], day);
    },


    [_setIslamicA](year, month, day) {
      this.setJulianDayToOnlyDates(islamicA_to_julianDay(year, month, day));
    },

    set islamicA(islamicA) {
      this[_setIslamicA](islamicA[0], islamicA[1] || 1, islamicA[2] || 1);
    },

    set islamicAYear(year) {
      this[_setIslamicA](year, this[_all].islamicA[1], this[_all].islamicA[2]);
    },

    set islamicAMonth(month) {
      this[_setIslamicA](this[_all].islamicA[0], month, this[_all].islamicA[2]);
    },

    set islamicADay(day) {
      this[_setIslamicA](this[_all].islamicA[0], this[_all].islamicA[1], day);
    },







    change(change, dateType = 'persian') {
      let dTJ;
      if (dateType === 'persian') {
        dTJ = change_persian(change, [...this[_all].persian, ...this[_all].time]);
      } else if (dateType === 'gregorian') {
        dTJ = change_gregorian(change, [...this[_all].gregorian, ...this[_all].time]);
      } else if (dateType === 'islamic') {
        dTJ = change_islamic(change, [...this[_all].islamic, ...this[_all].time]);
      } else if (dateType === 'islamicA') {
        dTJ = change_islamicA(change, [...this[_all].islamicA, ...this[_all].time]);
      }
      this[_all] = julianDay_to_all(dTJ[7]);
      this[_setTime](dTJ[3], dTJ[4], dTJ[5], dTJ[6]);
    },

    diff(date1, dateType = 'persian') {
      if (dateType === 'persian') {
        return diff_persian(date1, this[_all].persian);
      } else if (dateType === 'gregorian') {
        return diff_gregorian(date1, this[_all].gregorian);
      } else if (dateType === 'islamic') {
        return diff_islamic(date1, this[_all].islamic);
      } else if (dateType === 'islamicA') {
        return diff_islamicA(date1, this[_all].islamicA);
      }
    }

  };
}

