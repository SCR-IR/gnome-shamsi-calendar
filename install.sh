#!/bin/bash
set -e

UUID="shamsi-calendar@gnome.scr.ir"
GNOME_VERSION=$(gnome-shell --version 2>/dev/null | grep -oP "\d+(\.\d+)?" | head -1 || echo "50")

echo "🔍 GNOME Shell detected version: $GNOME_VERSION"

SOURCE_DIR="./extension/gnome_46-50/$UUID"
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source directory $SOURCE_DIR not found."
    exit 1
fi

echo "⚙️  Compiling GSettings schemas..."
glib-compile-schemas "$SOURCE_DIR/schemas/"

TARGET_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"
echo "📦 Installing extension to $TARGET_DIR..."
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -r "$SOURCE_DIR"/* "$TARGET_DIR/"

echo "🔄 Reloading extension in GNOME Shell..."
gnome-extensions disable "$UUID" 2>/dev/null || true
gnome-extensions enable "$UUID" 2>/dev/null || true

echo ""
echo "✅ Installation completed successfully!"
echo "🎉 Extension '$UUID' is installed and enabled."
echo "💡 Note: On Wayland, if changes do not appear immediately, please log out and log back in."
echo ""
