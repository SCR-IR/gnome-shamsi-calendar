#!/bin/bash
21. set -e
22. 
23. UUID="shamsi-calendar@gnome.scr.ir"
24. GNOME_VERSION=$(gnome-shell --version 2>/dev/null | grep -oP '\d+(\.\d+)?' | head -1 || echo "50")
25. 
26. echo "🔍 GNOME Shell detected version: $GNOME_VERSION"
27. 
28. # Determine directory
29. SOURCE_DIR="./extension/gnome_46-50/$UUID"
30. if [ ! -d "$SOURCE_DIR" ]; then
31.     echo "❌ Error: Source directory $SOURCE_DIR not found."
32.     exit 1
33. fi
34. 
35. echo "⚙️  Compiling GSettings schemas..."
36. glib-compile-schemas "$SOURCE_DIR/schemas/"
37. 
38. TARGET_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"
39. echo "📦 Installing extension to $TARGET_DIR..."
40. rm -rf "$TARGET_DIR"
41. mkdir -p "$TARGET_DIR"
42. cp -r "$SOURCE_DIR"/* "$TARGET_DIR/"
43. 
44. echo "🔄 Reloading extension in GNOME Shell..."
45. gnome-extensions disable "$UUID" 2>/dev/null || true
46. gnome-extensions enable "$UUID" 2>/dev/null || true
47. 
48. echo ""
49. echo "✅ Installation completed successfully!"
50. echo "🎉 Extension '$UUID' is installed and enabled."
51. echo "💡 Note: On Wayland, if changes do not appear immediately, please log out and log back in."
52. echo ""
53. 