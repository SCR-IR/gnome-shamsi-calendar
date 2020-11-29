#!/bin/bash

extName=shamsi-calendar@gnome.scr.ir


cd $extName
glib-compile-schemas ./schemas/
zip -qrD9 ../extension.zip ./

extDir=$HOME/.local/share/gnome-shell/extensions/$extName/
rm -rf $extDir
mkdir -p $extDir && cp -r ./* $extDir

$HOME/.local/share/gnome-shell/extensions/$extName/bin/install_fonts.sh

echo ""
echo "Please restart gnome-shell:"
echo "Xorg => (Alt+F2 -> r -> Enter)"
echo "Wayland [or Xorg] => (logOut + logIn)"
echo "Then run ./2-install.sh"
echo ""


