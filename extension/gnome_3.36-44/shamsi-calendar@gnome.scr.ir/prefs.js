

const Config = imports.misc.config;
const [gnomeVersionMajor, gnomeVersionMinor] = Config.PACKAGE_VERSION.split('.').map(s => Number(s));
const Gtk = imports.gi.Gtk;
let extension = imports.misc.extensionUtils.getCurrentExtension();

function init() {
}

function buildPrefsWidget() {
  if(gnomeVersionMajor >= 42){
    return extension.imports.prefs_Gtk4_Gnome42.buildPrefsWidget();
  }else{
    var App = (Gtk.get_major_version() === 4) ? extension.imports.prefs_Gtk4.App : extension.imports.prefs_Gtk3.App;
    let widget = new App();
    return widget.main_hbox;
  }
}



