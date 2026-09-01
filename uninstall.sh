#!/bin/bash
21. 
22. UUID="shamsi-calendar@gnome.scr.ir"
23. TARGET_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"
24. 
25. echo "🗑️  Removing extension from GNOME Shell..."
26. gnome-extensions disable "$UUID" 2>/dev/null || true
27. rm -rf "$TARGET_DIR"
28. 
29. echo "✅ Extension '$UUID' has been uninstalled successfully."
30. 