#!/bin/bash

uuid=shamsi-calendar@gnome.scr.ir

extFontsDirName=shamsiCalendarFonts

gnomeVersion=$( gnome-shell --version | sed -Ee 's/GNOME Shell (([0-9]{1,2}).([0-9]{1,2})*).*/\1/i;q' )

dirName=""

if [ "`echo "${gnomeVersion} >= 46" | bc`" -eq 1 -a "`echo "${gnomeVersion} < 48" | bc`" -eq 1 ]
then
	dirName="gnome_46-47"
elif [ "`echo "${gnomeVersion} >= 45" | bc`" -eq 1 -a "`echo "${gnomeVersion} < 46" | bc`" -eq 1 ]
then
	dirName="gnome_45"
elif [ "`echo "${gnomeVersion} >= 3.36" | bc`" -eq 1 -a "`echo "${gnomeVersion} < 45" | bc`" -eq 1 ]
then
	dirName="gnome_3.36-44"
elif [ "`echo "${gnomeVersion} >= 3.28" | bc`" -eq 1 -a "`echo "${gnomeVersion} < 3.36" | bc`" -eq 1 ]
then
	dirName="gnome_3.28-3.34"
elif [ "`echo "${gnomeVersion} >= 3.24" | bc`" -eq 1 -a "`echo "${gnomeVersion} < 3.28" | bc`" -eq 1 ]
then
	dirName="gnome_3.24-3.26"
elif [ "`echo "${gnomeVersion} >= 3.20" | bc`" -eq 1 -a "`echo "${gnomeVersion} < 3.24" | bc`" -eq 1 ]
then
	dirName="gnome_3.20-3.22"
else
	echo "Gnome $gnomeVersion is not supported! Please update the extension"
fi

if [ "$dirName" != "" ]
then
	# echo "Gnome $gnomeVersion : ./extension/$dirName/"
    
    cd ./extension/$dirName/$uuid
    
    ## After Change & Develop:
    glib-compile-schemas ./schemas/
    zip -qrD9 ../$dirName.zip ./
    
    ## Install Extension:
    extDir=$HOME/.local/share/gnome-shell/extensions/$uuid/
    rm -rf $extDir
    mkdir -p $extDir && cp -r ./* $extDir
    
    ## Install Fonts:
    extFontDir=$HOME/.local/share/fonts/$extFontsDirName/
    rm -rf $extFontDir
    mkdir -p $extFontDir && cp -r ./fonts/* $extFontDir
    
    echo ""
    echo "Please restart gnome-shell:"
    echo " Wayland [or Xorg] => (logOut + logIn)"
    echo " Xorg => (Alt+F2 -> r -> Enter)"
    echo ""
    echo "Then run ./2-install.sh"
    echo ""
        
fi
