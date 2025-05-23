


function tahvilData(year) {
   const tahvil = {
      1357: [1, 3, 4, 5, ""],
      1358: [29, 8, 55, 1, ""],
      1359: [30, 14, 40, 48, ""],
      1360: [29, 20, 33, 31, ""],
      1361: [1, 2, 25, 59, ""],
      1362: [1, 8, 8, 53, ""],
      1363: [30, 13, 54, 31, ""],
      1364: [29, 19, 43, 56, ""],
      1365: [1, 1, 32, 56, ""],
      1366: [1, 7, 22, 8, ""],
      1367: [30, 13, 8, 56, ""],
      1368: [29, 18, 58, 29, ""],
      1369: [1, 0, 49, 26, "تاکید بر «تحول درونی و اصلاح امور»"],
      1370: [1, 6, 32, 4, "تاکید بر «صبح روشنی»"],
      1371: [30, 12, 18, 11, "تاکید بر «تحکیم معنویت»"],
      1372: [29, 18, 10, 50, "تاکید بر «عدالت اجتماعی»"],
      1373: [29, 23, 58, 13, "تاکید بر «صرفه‌جویی»"],
      1374: [1, 5, 44, 35, "«وجدان کاری، انضباط اجتماعی، انضباط اقتصادی»"],
      1375: [1, 11, 33, 10, "«ضرورت پرهیز از اسراف و حفظ ثروت و منابع عمومی کشور»"],
      1376: [30, 17, 24, 46, "تاکید بر «توجه به معنویات و فضایل اخلاقی»"],
      1377: [29, 23, 24, 31, "تاکید بر «صرفه‌جویی و پرهیز از اسراف، قناعت و پایداری بر مواضع اسلامی و انقلابی»"],
      1378: [1, 5, 15, 48, "امام خمینی (ره)"],
      1379: [1, 11, 5, 14, "امیرالمؤمنین، امام علی (ع)"],
      1380: [30, 17, 0, 40, "اقتدار ملّی و اشتغال‌آفرینی"],
      1381: [29, 22, 46, 2, "سال عزّت و افتخار حسینی"],
      1382: [1, 4, 29, 45, "نهضت خدمت‌گزاری"],
      1383: [1, 10, 18, 37, "پاسخگویی (سه قوّه و سایر دستگاه‌ها به ملّت ایران)"],
      1384: [30, 16, 3, 24, "همبستگی ملّی و مشارکت عمومی"],
      1385: [29, 21, 55, 35, "پیامبر اعظم (ص)"],
      1386: [1, 3, 37, 26, "اتّحاد ملّی و انسجام اسلامی"],
      1387: [1, 9, 18, 19, "نوآوری و شکوفایی"],
      1388: [30, 15, 13, 39, "اصلاح الگوی مصرف"],
      1389: [29, 21, 2, 13, "همّت مضاعف، کار مضاعف"],
      1390: [1, 2, 50, 45, "جهاد اقتصادی"],
      1391: [1, 8, 44, 27, "تولید ملّی، حمایت از کار و سرمایه‌ی ایرانی"],
      1392: [30, 14, 31, 56, "حماسه‌ی سیاسی و حماسه‌ی اقتصادی"],
      1393: [29, 20, 27, 7, "اقتصاد و فرهنگ، با عزم ملّی و مدیریت جهادی"],
      1394: [1, 2, 15, 11, "دولت و ملّت ، همدلی و هم‌زبانی"],
      1395: [1, 8, 0, 12, "اقتصاد مقاومتی، اقدام و عمل"],
      1396: [30, 13, 58, 40, "اقتصاد مقاومتی، تولید - اشتغال"],
      1397: [29, 19, 45, 28, "حمایت از کالای ایرانی"],
      1398: [1, 1, 28, 27, "رونق تولید"],
      1399: [1, 7, 19, 37, "جهش تولید"],
      1400: [30, 13, 7, 28, "تولید، پشتیبانی‌ها، مانع‌زدایی‌ها"],
      1401: [29, 19, 3, 26, "تولید، دانش‌بنیان، اِشتغال‌آفرین"],
      1402: [1, 0, 54, 28, "مهار تورّم، رشد تولید"],
      1403: [1, 6, 36, 26, "جهش تولید با مشارکت مردم"],
      1404: [30, 12, 31, 30, "سرمایه‌گذاری برای تولید"],
      1405: [29, 18, 15, false, ""],
      1406: [29, 23, 54, false, ""],
      1407: [1, 5, 47, false, ""],
      1408: [1, 11, 32, false, ""],
      1409: [30, 17, 21, false, ""],
      1410: [29, 23, 11, false, ""],
      1411: [1, 4, 51, false, ""],
      1412: [1, 10, 52, false, ""],
      1413: [30, 16, 47, false, ""],
      1414: [29, 22, 32, false, ""],
      1415: [1, 4, 32, false, ""]
   };
   let data = tahvil[year];
   let text = '';
   if (data !== undefined) {
      text = 'زمان تحویل سال ' + year + ' -> ' +
         ((data[3] === false) ? 'حدود ساعت ' + data[1] + ':' + data[2] : 'ساعت ' + data[1] + ':' + data[2] + ':' + data[3]) +
         ' در روز ' + ((data[0] === 1) ? data[0] + ' فروردین ' + year : data[0] + ' اسفند ' + (year - 1))
   }
   return {
      data: data,
      text: text
   };
};
