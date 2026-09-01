# نقشه راه و مستندات فنی اکستنشن تقویم شمسی گنوم (GNOME 46 - 50)
## Iranian Persian Calendar (Modern Edition)

این سند شامل تحلیل کامل معماری، نیازمندی‌ها، استانداردها و وضعیت پیاده‌سازی پروژه بازطراحی و مدرن‌سازی اکستنشن تقویم شمسی گنوم است.

---

### ۱. معماری و استانداردهای فنی (Technical Architecture & Standards)

1. **معماری ماژولار و سازگاری با GNOME 46 تا GNOME 50:**
   - توسعه بر پایه استانداردهای رسمی `GJS ESM` (`import ... from 'gi://...'` و `import ... from 'resource:///org/gnome/shell/...'`).
   - حذف کامل متدهای منسوخ و جلوگیری از آلودگی سراسری (`Global Scope Pollution`).

2. **حذف بخش‌های زائد و مدیریت ایمن منابع (`Debloat & Memory Safety`):**
   - حذف ۱۰۰٪ محاسبات اوقات شرعی، پخش صوت اذان، لیست شهرها و کدهای دستکاری فونت در مسیر کاربر (`~/fonts`).
   - مدیریت چرخه حیات سیگنال‌ها در `extension.js` و `prefs.js` با دیسکانکت قطعی هنگام غیرفعال‌سازی (`disable`).
   - جایگزینی تایمرهای مکرر با تایمر بهینه تغییر روز (`Day-change scheduler`).

3. **یکپارچگی ظاهر با Libadwaita و تم سیستم (`UI/UX Modernization`):**
   - استایل‌دهی در `stylesheet.css` با استفاده از متغیرهای استاندارد تم گنوم (`alpha(currentColor, ...)` و مقادیر رنگی سازگار با تم تیره و روشن).
   - نشانگرهای وضعیت روز انتخابی، روز جاری (`Today`) و روزهای تعطیل رسمی.
   - امکان شخصی‌سازی قالب نمایش تاریخ در نوار بالا (`Top Panel`).

4. **همگام‌سازی با Google Calendar و یادآورهای سیستمی (`EDS DBus Sync`):**
   - اتصال به رابط بومی `org.gnome.Shell.CalendarServer` روی باس `DBus`.
   - دریافت خودکار رویدادها و قرارهای تقویم گوگل بدون نیاز به کلید `API` یا توکن مجزا (با تکیه بر `GNOME Online Accounts`).
   - تبدیل محدوده زمانی و زمان رویدادها به ساعات دقیق و نمایش در کنار مناسبت‌های رسمی.

5. **پنجره تنظیمات مدرن (`Modern Libadwaita Preferences`):**
   - ساختاریافته بر اساس `Adw.PreferencesPage`، `Adw.PreferencesGroup`، `Adw.SwitchRow`، `Adw.ComboRow` و `Adw.ActionRow`.
   - دسته‌بندی منظم در ۴ بخش:
     1. **تنظیمات عمومی:** موقعیت در نوار، فرمت نمایش، رنگ سفارشی و تب پیش‌فرض.
     2. **رویدادها و همگام‌سازی:** فعال‌سازی تقویم گوگل و مدیریت نمایش مناسبت‌های خورشیدی، قمری، میلادی و ایران باستان.
     3. **تنظیمات هفته:** تعیین روز آغازین هفته و روزهای تعطیل هفتگی.
     4. **درباره:** اطلاعات نسخه و لینک مخزن.

---

### ۲. ماتریس فازهای پیاده‌سازی (Implementation Status)

| فاز | عنوان | شرح اقدامات | وضعیت |
| :--- | :--- | :--- | :---: |
| **فاز ۱** | **سبک‌سازی و حذف بخش‌های مذهبی/صوتی** | حذف `PrayTimes.js`، `cities.js`، `sound.js`، صوت‌ها و فونت‌ها؛ اصلاح اسکیما و کامپایل مجدد | ✅ انجام شد |
| **فاز ۲** | **بازطراحی ظاهر و رابط کاربری** | مدرن‌سازی `stylesheet.css` با استایل‌های Adwaita، پدینگ‌ها و گرید تمیز روزها | ✅ انجام شد |
| **فاز ۳** | **سیستم رویدادها و سینک Google Calendar** | پیاده‌سازی پروکسی `CalendarServer` روی DBus و ادغام رویدادهای شخصی گوگل | ✅ انجام شد |
| **فاز ۴** | **بازنویسی تنظیمات با Libadwaita** | بازنویسی کامل `prefs.js` با کامپوننت‌های مدرن `Adw` | ✅ انجام شد |
| **فاز ۵** | **کنترل کیفیت، تست و استقرار** | اعتبارسنجی لاگ‌ها در گنوم ۵۰ و آماده‌سازی اسکریپت نصب تمیز | ✅ آماده نصب |

---

### ۳. راهنمای نصب و استقرار محلی (Installation Guide)

#### روش ۱: نصب مستقیم از سورس
```bash
# ساخت دایرکتوری اکستنشن
mkdir -p ~/.local/share/gnome-shell/extensions/shamsi-calendar@gnome.scr.ir

# کپی فایل‌ها از سورس پروژه
cp -r extension/gnome_46-50/shamsi-calendar@gnome.scr.ir/* ~/.local/share/gnome-shell/extensions/shamsi-calendar@gnome.scr.ir/

# کامپایل اسکیما
glib-compile-schemas ~/.local/share/gnome-shell/extensions/shamsi-calendar@gnome.scr.ir/schemas/

# فعال‌سازی در گنوم
gnome-extensions enable shamsi-calendar@gnome.scr.ir
```

#### روش ۲: ساخت بسته زیپ (`Pack`)
```bash
cd extension/gnome_46-50/shamsi-calendar@gnome.scr.ir
gnome-extensions pack --force --out-dir=../../../
gnome-extensions install ../../../shamsi-calendar@gnome.scr.ir.shell-extension.zip --force
```

---

### ۴. ساختار فایل‌های پروژه پس از پالایش (Cleaned File Tree)

```text
extension/gnome_46-50/shamsi-calendar@gnome.scr.ir/
├── metadata.json           # متادیتا و مشخصات سازگاری با گنوم ۴۶-۵۰
├── extension.js            # فایل اصلی لودر افزونه و مدیریت نوار ابزار
├── calendar.js             # پاپ‌آپ تقویم، گرید ماه‌ها، تب‌ها و ابزار تبدیل تاریخ
├── Events.js               # مدیریت مناسبت‌ها و سرویس سینک تقویم گوگل (DBus)
├── prefs.js                # پنجره تنظیمات مدرن Libadwaita
├── stylesheet.css          # استایل‌های تم تیره/روشن و رنگ‌بندی سیستم
├── Tarikh.js               # توابع محاسبات ریاضی تقویم و سال کبیسه
├── tahvil.js               # محاسبه لحظه تحویل سال نو
├── otherFunctions.js       # توابع کمکی فرمت‌دهی متن و اعداد فارسی
├── events/                 # بانک اطلاعات مناسبت‌های رسمی
│   ├── persianEvents.js
│   ├── islamicEvents.js
│   ├── gregorianEvents.js
│   └── oldPersianEvents.js
└── schemas/                # تعاریف GSettings
    ├── org.gnome.shell.extensions.shamsi-calendar.gschema.xml
    └── gschemas.compiled
```
