Azan playback validation (GNOME 46–50)
=====================================

The 46–50 variant loads Gst 1.0 synchronously through imports.gi on the
first valid playback request. This is intentional: a static gi://Gst import
would prevent the calendar from loading when the typelib is missing, while
asynchronous import would change the existing boolean player() API.
GJS exposes imports.gi in ES modules as well as legacy scripts.

GStreamer initializes lazily and uses ElementFactory.make('playbin'), since
PlayBin is a plugin element rather than a Gst.PlayBin GI class. Audio-only
flags avoid video windows. Bus signal watches dispatch through GLib's main
loop; no JavaScript callback runs from a streaming-thread signal. Never call
Gst.deinit() inside Shell: other components can share the library.

Dependencies
------------
Runtime packages on Ubuntu: gir1.2-gstreamer-1.0,
gstreamer1.0-plugins-base and gstreamer1.0-plugins-good. Playback requires
playbin, an audio output sink, and demuxer/decoder plugins for the selected
file. Bundled OGG/Vorbis audio uses oggdemux and vorbisdec. Custom formats may
need other codecs. No command-line player is used.

Missing typelibs, initialization failure, or an unavailable playbin factory
are caught on first use and logged once per loaded module. Later requests
return false without retrying initialization or repeating the backend error.
Restart the Shell session after installing missing dependencies. Calendar
and existing prayer notifications remain available; the existing notification
fallback is preserved. Decoder/output errors arrive asynchronously, are
logged, and release the pipeline; no new error notifications are introduced.

Lifecycle and UI
----------------
player() preserves the existing boolean API. true means the PLAYING request
was accepted; it cannot promise audible output or successful decoding.
Paths must designate readable local files; Gio converts them to escaped URIs.
Each Play first stops the previously owned pipeline. stop() is idempotent
and sets the pipeline to NULL before removing its signal handler/watch.

The production Stop button is hidden until the pipeline's STATE_CHANGED
bus message reports PLAYING. Stop, EOS, error, and other state transitions
update it without duration timers. Destroying the button unsubscribes its
listener. Extension disable and settings-triggered restart call shutdown(),
which stops audio and clears subscribers. Even if teardown fails, shutdown
removes bus callbacks; pipeline ownership is retained to prevent overlapping
playback. A native backend failure to enter NULL can still prevent silence;
this exceptional path cannot guarantee successful audio teardown.

Automated validation
--------------------
Run ./tests/azan-playback-smoke.sh with gjs, gst-launch-1.0 and OGG/Vorbis
encoding/decoding plugins installed. These tools are development dependencies
only. The test uses real decoding with a clocked silent fakesink in a
disposable module copy. It checks invalid files, repeat Stop, replacement,
NULL state, PLAYING notifications, EOS/error idle notifications, restart,
shutdown and unsubscribe cleanup. Disposable fault-injected copies simulate
missing typelib and playbin discovery and check module load, boolean failure,
one-time logging and safe shutdown. No packages or installed files change.

Validated locally with GJS 1.80.2 and GStreamer 1.24.2. Expected missing-file
and unsupported-format errors appear in the test output. Syntax checks use
node --input-type=module --check on sound.js, extension.js and calendar.js;
these check parsing only. git diff --check must also pass.

Manual verification
-------------------
The tester reported all five checks passing on Ubuntu GNOME Shell 46.0 with
the temporary Play control: audible startup, repeated Play without overlap,
immediate Stop, playback again after Stop, and silence on extension disable.
The tester subsequently confirmed final manual acceptance of the production
implementation on Ubuntu GNOME Shell 46.0, including scheduled Azan playback
triggered by temporarily changing the system clock. The development Play
control is removed; lazy dependency loading and state-driven Stop visibility
are included in the accepted implementation. These are tester-reported
results; no system clock changes are performed by the automated tests.

For repeat acceptance, use scheduled prayer playback through the normal
settings; keep notifications enabled. Confirm Stop appears during playback,
immediately silences it and disappears. Check subsequent scheduled playback,
natural completion, extension disable/re-enable and settings-triggered
restart. Check invalid custom files and journal errors without modifying
system packages. No playback-duration timers or temporary Play UI are needed.

A fresh login may be required to load replaced modules on Wayland. Disabling
and re-enabling can reuse modules already cached by Shell. Repeat acceptance
on 47–50 before claiming runtime validation there; those versions have not
been manually tested.

API references
--------------
https://gjs.guide/guides/gjs/intro.html
https://gstreamer.freedesktop.org/documentation/playback/playbin.html
https://gstreamer.freedesktop.org/documentation/gstreamer/gstbus.html
