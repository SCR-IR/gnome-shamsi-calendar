

export let player = null;

export const soundsDir = "sounds";// FolderName

export const sounds = {
  "azan_01": [
    'اذان ۱ ،مرحوم مؤذن‌زاده',
    'azan_01.mp3'
  ],
  "doa_01": [
    'ذکر قبل اذان ۱',
    'doa_01.mp3'
  ],
  "salawat_01": [
    'صلوات ۱',
    'salawat_01.mp3'
  ],
  "alert_01": [
    'هشدار صوتی ساده ۱',
    'alert_01.mp3'
  ],
  // "_custom_": [
  //   'انتخاب فایل سفارشی ←',
  //   '_custom_'
  // ],
};

import Gst from 'gi://Gst';
import GstAudio from 'gi://GstAudio';
try {

  Gst.init(null);

  const SoundPlayer = class SoundPlayer {
    constructor(sound) {
      this.onEnd = null;
      this.playbin = Gst.ElementFactory.make("playbin", sound.name);
      this.setUri(sound.uri);
      let bus = this.playbin.get_bus();
      bus.add_signal_watch();
      bus.connect('message', (_, msg) => this._on_message_received(msg));
    }

    setUri(uri) {
      this.playbin.set_property("uri", Gst.filename_to_uri(uri));
    }

    isPlaying() {
      let [rv, state, pstate] = this.playbin.get_state(Gst.State.NULL);
      return state === Gst.State.PLAYING;
    }

    play() {
      this.playbin.set_state(Gst.State.PLAYING);
    }

    pause() {
      this.playbin.set_state(Gst.State.NULL);
    }

    setVolume(value) {
      this.playbin.set_volume(GstAudio.StreamVolumeFormat.LINEAR, ((value * 2) ** 2) / 4);
    }

    _on_message_received(msg) {
      if (msg.type == Gst.MessageType.EOS || msg.type == Gst.MessageType.ERROR) {
        this.playbin.set_state(Gst.State.NULL);
        if (typeof (this.onEnd) === "function") this.onEnd();
      }
    }
  };

  player = new SoundPlayer({ name: "Azan", uri: "" });
} catch (e) {
  player = null;
}
