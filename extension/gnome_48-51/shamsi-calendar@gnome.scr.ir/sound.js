
import Gio from 'gi://Gio';



export const soundsDir = "sounds";// FolderName

export const sounds = {
  "azan_01": [
    'اذان ۱ ،مرحوم مؤذن‌زاده',
    'azan_01.ogg'
  ],
  "doa_01": [
    'ذکر قبل اذان ۱',
    'doa_01.ogg'
  ],
  "salawat_01": [
    'صلوات ۱',
    'salawat_01.ogg'
  ],
  "alert_01": [
    'هشدار صوتی ساده ۱',
    'alert_01.ogg'
  ],
  // "_custom_": [
  //   'انتخاب فایل سفارشی ←',
  //   '_custom_'
  // ],
};

export const player = (path, title = 'اوقات شرعی') => {
  if (!path || typeof path !== 'string') return false;
  try {
    let file = Gio.File.new_for_path(path);
    let player = global.display.get_sound_player();
    if (!file || !player) return false;
    player.play_from_file(file, title, null);
  } catch (e) {
    return false;
  }
  return true;
}
