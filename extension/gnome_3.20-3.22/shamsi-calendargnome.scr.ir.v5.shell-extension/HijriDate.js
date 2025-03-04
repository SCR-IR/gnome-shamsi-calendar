/*
 * Temp Codes By https://jdf.scr.ir (v0.1.0 ,GNU/LGPL)
 */

var HijriDate = {};

HijriDate.toHijri = function (y, m, d) {
  [y, m, d] = julianDate_to_ghamari(miladi_to_julianDate(parseInt(y), parseInt(m), parseInt(d)));
  return { year: y, month: m, day: d };
};

HijriDate.fromHijri = function (y, m, d) {
  [y, m, d] = julianDate_to_miladi(ghamari_to_julianDate(parseInt(y), parseInt(m), parseInt(d)));
  return { year: y, month: m, day: d };
};


// Private Function
function ghamari_to_julianDate_1(iy, im, id) {
  iy += 990;
  return (id + ~~((29.5 * (im - 1)) + 0.5) + ((iy - 1) * 354) + ~~((3 + (iy * 11)) / 30) + 1597615.5);
  //1714556.5=1948439.5 - 1-233882
  //1597615.5=1714556.5-116941
}

// Private Function
function julianDate_to_ghamari_1(julianDate) {
  var iy, im, id, tmp;
  julianDate = ~~(julianDate) + 0.5 + 350823;//350823d=990y
  iy = ~~(((30 * (julianDate - 1948439.5)) + 10646) / 10631);
  tmp = julianDate - (1948439.5 + ((iy - 1) * 354) + ~~((3 + (11 * iy)) / 30));
  iy -= 990;
  im = ~~(((tmp - 29) / 29.5) + 1.99);
  if (im > 12) im = 12;
  id = 1 + tmp - ~~((29.5 * (im - 1)) + 0.5);
  return [iy, im, id];
}

function julianDate_to_miladi(julianDate) {
  var sal_a, gy, gm, gd, days;
  days = -~~(1721059.5 - julianDate);
  gy = 400 * (~~(days / 146097));
  days %= 146097;
  if (days > 36524) {
    gy += 100 * (~~(--days / 36524));
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * (~~(days / 1461));
  days %= 1461;
  if (days > 365) {
    gy += ~~((days - 1) / 365);
    days = (days - 1) % 365;
  }
  gd = days + 1;
  sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (gm = 0; gm < 13, gd > sal_a[gm]; gm++) {
    gd -= sal_a[gm];
  }
  return [gy, gm, gd];
}

function miladi_to_julianDate(gy, gm, gd) {
  var g_d_m, gy2, julianDate;
  g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  gy2 = (gm > 2) ? (gy + 1) : gy;
  julianDate = 1721059 + (365 * gy) + (~~((gy2 + 3) / 4)) - (~~((gy2 + 99) / 100)) + (~~((gy2 + 399) / 400)) + gd + g_d_m[gm - 1];
  /* 1721059 = miladi_to_julianDate(0, 1, 1) - 1 */
  return julianDate - 0.5;
}

// Private
const ghamariMonths = {
  startYear: 1427,/* =iDoM:firstYear */
  startJD: 2453767,/* =islamicA_to_julianDay(startYear,1,1) */

  endYear: 1464,/* =iDoM:lastYear */
  endJD: 2467232,/* =islamicA_to_julianDay(endYear+1,1,1)-1 */

  iDoM: {//islamicYear: [Sum, m1, ..., m12],
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
    1443: [354, 29, 30, 30, 29, 29, 30, 29, 30, 30, 29, 30, 29],
    1444: [354, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29],
    1445: [354, 30, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 29],
    1446: [355, 30, 30, 30, 29, 30, 30, 29, 30, 29, 29, 29, 30],
    1447: [355, 29, 30, 30, 29, 30, 30, 30, 29, 30, /* :1404_Official_Iranian_Calendar and Temporary_1405: */29, 29, 30],
    1448: [354, 29, 29, 30, 29, 30, 30, 29, 30, 30, 30, 29, 29],
    1449: [355, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29, 30],
    1450: [354, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29],
    1451: [354, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 29],
    1452: [354, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 29],
    1453: [355, 30, 30, 29, 30, 29, 30, 30, 29, 29, 30, 29, 30],
    1454: [354, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29, 29],
    1455: [355, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29],
    1456: [355, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 30],
    1457: [354, 29, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30],
    1458: [354, 30, 29, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30],
    1459: [354, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30],
    1460: [354, 30, 29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29],
    1461: [355, 30, 29, 30, 30, 29, 30, 30, 29, 29, 30, 29, 30],
    1462: [354, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29],
    1463: [355, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30],
    1464: [354/* : 355|354 <- Sum <- */, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30/*: 30|29 -> verify -> true */],
    /*
      verify = ( (endJD - islamicA_to_julianDay(endYear,12,iDoM[endYear][12])) === 0 );
    */
  }
};

function julianDate_to_ghamari(julianDate) {
  if (julianDate < ghamariMonths.startJD || julianDate > ghamariMonths.endJD) {
    return this.julianDate_to_ghamari_1(julianDate);
  } else {
    let iy, im;
    let id = julianDate - ghamariMonths.startJD + 1;
    for (iy in ghamariMonths.iDoM) {
      if (id > ghamariMonths.iDoM[iy][0]) {
        id -= ghamariMonths.iDoM[iy][0];
      } else {
        for (im = 1; im < 13, id > ghamariMonths.iDoM[iy][im]; im++) {
          id -= ghamariMonths.iDoM[iy][im];
        }
        break;
      }
    }
    return [iy, im, id];
  }
}

function ghamari_to_julianDate(iy, im, id) {
  if (iy < ghamariMonths.startYear || iy > ghamariMonths.endYear) {
    return this.ghamari_to_julianDate_1(iy, im, id);
  } else {
    let julianDate = ghamariMonths.startJD - 1 + id;
    for (let y in ghamariMonths.iDoM) {
      if (y < iy) {
        julianDate += ghamariMonths.iDoM[y][0];
      } else {
        for (let m = 1; m < im; m++)julianDate += ghamariMonths.iDoM[iy][m];
        break;
      }
    }
    return julianDate;
  }
}

