#!/bin/bash

UUID="shamsi-calendar@gnome.scr.ir"
TARGET_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"

echo "🗑️  Removing extension from GNOME Shell..."
gnome-extensions disable "$UUID" 2>/dev/null || true
rm -rf "$TARGET_DIR"

echo "✅ Extension '$UUID' has been uninstalled successfully."
