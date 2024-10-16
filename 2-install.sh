#!/bin/bash

extName=shamsi-calendar@gnome.scr.ir


gnome-extensions disable $extName >/dev/null 2>&1
gnome-extensions enable $extName >/dev/null 2>&1

gnome-shell-extension-tool -d $extName >/dev/null 2>&1
gnome-shell-extension-tool -e $extName >/dev/null 2>&1


echo ""
echo "Extension is Enabled"
echo ""

