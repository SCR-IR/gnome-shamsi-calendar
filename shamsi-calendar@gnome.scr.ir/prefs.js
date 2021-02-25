

const Gtk = imports.gi.Gtk;
let extension = imports.misc.extensionUtils.getCurrentExtension();

function init() {
}

const App = (Gtk.get_major_version()===4)? extension.imports.prefs_Gtk4.App : extension.imports.prefs_Gtk3.App;

function buildPrefsWidget() {
  let widget = new App();
  return widget.main_hbox;
}

