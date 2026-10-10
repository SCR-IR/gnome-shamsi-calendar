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

// GStreamer bus signal watches dispatch on the main loop, never a streaming
// thread. Do not connect playbin's streaming-thread signals from GJS.
let playback = null;
let Gst = null;
let backendUnavailable = false;
const listeners = new Set();

// Synchronous lazy GI loading preserves player()'s boolean API. A static Gst
// import would make the entire calendar fail to load without the typelib.
function initializeBackend() {
  if (backendUnavailable)
    return false;
  if (Gst)
    return true;
  try {
    imports.gi.versions.Gst = '1.0';
    const backend = imports.gi.Gst;
    backend.init(null);
    if (!backend.ElementFactory.find('playbin'))
      throw new Error('GStreamer playbin plugin is unavailable');
    Gst = backend;
    return true;
  } catch (error) {
    backendUnavailable = true;
    console.error(`Azan audio unavailable: ${error.message}`);
    return false;
  }
}

export const isPlaying = () => playback?.playing ?? false;

function updatePlaying(playing) {
  if (playback)
    playback.playing = playing;
  for (const listener of listeners) {
    try {
      listener(playing);
    } catch (error) {
      console.error(`Azan state listener failed: ${error.message}`);
    }
  }
}

// Call the returned function before destroying the subscriber's UI.
export const subscribe = callback => {
  listeners.add(callback);
  callback(isPlaying());
  return () => listeners.delete(callback);
};

function disconnectBus(current) {
  if (current.messageId) {
    current.bus.disconnect(current.messageId);
    current.messageId = 0;
  }
  if (current.watching) {
    current.bus.remove_signal_watch();
    current.watching = false;
  }
}

export const stop = () => {
  if (playback === null)
    return true;

  const current = playback;
  // Retain ownership if teardown fails: a later Play must not overlap it.
  try {
    if (current.pipeline.set_state(Gst.State.NULL) === Gst.StateChangeReturn.FAILURE)
      return false;
  } catch (error) {
    console.error(`Azan stop failed: ${error.message}`);
    return false;
  }
  playback = null;
  disconnectBus(current);
  updatePlaying(false);
  return true;
};

// true means startup accepted, not that decoding/output has completed.
// Unsupported formats and output failures are reported asynchronously on the bus.
export const player = (path, title = 'اوقات شرعی') => {
  if (!stop())
    return false;

  try {
    if (typeof path !== 'string' || !path || !path.startsWith('/'))
      return false;
    const file = Gio.File.new_for_path(path);
    const info = file.query_info('standard::type,access::can-read',
      Gio.FileQueryInfoFlags.NONE, null);
    if (info.get_file_type() !== Gio.FileType.REGULAR ||
        !info.get_attribute_boolean('access::can-read'))
      return false;

    if (!initializeBackend())
      return false;
    const pipeline = Gst.ElementFactory.make('playbin', null);
    if (!pipeline)
      throw new Error('GStreamer playbin plugin is unavailable');
    const bus = pipeline.get_bus();
    playback = {pipeline, bus, messageId: 0, watching: false, playing: false};
    const current = playback;
    // Audio only: custom files must never open a video window inside Shell.
    pipeline.set_property('flags', 2); // GstPlayFlags.AUDIO
    pipeline.set_property('uri', file.get_uri());
    bus.add_signal_watch();
    current.watching = true;
    current.messageId = bus.connect('message', (_bus, message) => {
      if (playback !== current)
        return;
      if (message.type === Gst.MessageType.ERROR) {
        const [error, debug] = message.parse_error();
        console.error(`Azan playback failed (${title}): ${error.message}; ${debug ?? ''}`);
        stop();
      } else if (message.type === Gst.MessageType.EOS) {
        stop();
      } else if (message.type === Gst.MessageType.STATE_CHANGED &&
                 message.src === pipeline) {
        const [, state] = message.parse_state_changed();
        updatePlaying(state === Gst.State.PLAYING);
      }
    });
    if (pipeline.set_state(Gst.State.PLAYING) === Gst.StateChangeReturn.FAILURE)
      throw new Error('GStreamer could not start audio playback');
    return true;
  } catch (error) {
    console.error(`Azan playback failed (${title}): ${error.message}`);
    stop();
    return false;
  }
};

// Always detach callbacks on disable, even if a backend teardown fails.
// Failed teardown retains the pipeline so subsequent Play cannot overlap it.
export const shutdown = () => {
  const stopped = stop();
  if (playback)
    disconnectBus(playback);
  listeners.clear();
  return stopped;
};
