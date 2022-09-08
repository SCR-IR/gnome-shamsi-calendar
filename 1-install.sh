#!/bin/bash

extName=shamsi-calendar@gnome.scr.ir

extFontsDirName=shamsiCalendarFonts

cd $extName

## After Change & Develop:
glib-compile-schemas ./schemas/
zip -qrD9 ../extension.zip ./

## Install Extension:
extDir=$HOME/.local/share/gnome-shell/extensions/$extName/
rm -rf $extDir
mkdir -p $extDir && cp -r ./* $extDir

## Install Fonts:
extFontDir=$HOME/.local/share/fonts/$extFontsDirName/
rm -rf $extFontDir
mkdir -p $extFontDir && cp -r ./fonts/* $extFontDir

echo ""
echo "Please restart gnome-shell:"
echo "Xorg => (Alt+F2 -> r -> Enter)"
echo "Wayland [or Xorg] => (logOut + logIn)"
echo "Then run ./2-install.sh"
echo ""


