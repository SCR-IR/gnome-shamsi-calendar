#!/bin/sh
# Real GJS/GStreamer lifecycle test with silent output, independent of Shell.
set -eu
repo=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
task_tmp=$(mktemp -d)
trap 'rm -rf "$task_tmp"' EXIT
sound="$repo/extension/gnome_46-50/shamsi-calendar@gnome.scr.ir/sound.js"
# Expose state only in the disposable test copy and replace output with fakesink.
sed "/const bus = pipeline.get_bus();/i\    const sink = Gst.ElementFactory.make('fakesink', null); sink.set_property('sync', true); pipeline.set_property('audio-sink', sink);" "$sound" > "$task_tmp/sound.js"
printf '\nexport const testPlayback = () => playback;\n' >> "$task_tmp/sound.js"
gst-launch-1.0 -q audiotestsrc num-buffers=8 ! audioconvert ! vorbisenc ! oggmux ! filesink location="$task_tmp/short.ogg"
printf 'unsupported audio\n' > "$task_tmp/bad.ogg"
cat > "$task_tmp/test.js" <<'JS'
import GLib from 'gi://GLib';
import Gst from 'gi://Gst?version=1.0';
import * as sound from './sound.js';
const dir = GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]);
function check(value, label) {
    if (!value) throw new Error(label);
    print(`PASS: ${label}`);
}
function waitForPlaying() {
    const loop = new GLib.MainLoop(null, false);
    const unsubscribe = sound.subscribe(playing => { if (playing) loop.quit(); });
    const timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
        loop.quit();
        return GLib.SOURCE_REMOVE;
    });
    loop.run();
    unsubscribe();
    if (sound.isPlaying()) GLib.Source.remove(timeout);
    check(sound.isPlaying(), 'actual PLAYING bus state received');
}
const states = [];
const unsubscribe = sound.subscribe(playing => states.push(playing));
check(states.length === 1 && states[0] === false, 'subscriber starts idle');
function drainUntilIdle() {
    const loop = new GLib.MainLoop(null, false);
    const id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10, () => {
        if (sound.testPlayback() !== null) return GLib.SOURCE_CONTINUE;
        loop.quit();
        return GLib.SOURCE_REMOVE;
    });
    const timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
        loop.quit();
        return GLib.SOURCE_REMOVE;
    });
    loop.run();
    if (sound.testPlayback() === null) GLib.Source.remove(timeout);
    else GLib.Source.remove(id);
    check(sound.testPlayback() === null, 'bus cleanup completed');
    check(!sound.isPlaying() && states.at(-1) === false, 'EOS/error publishes idle');
}
check(sound.stop() && sound.stop(), 'repeated idle Stop');
check(!sound.player(`${dir}/missing.ogg`), 'missing file rejected');
check(!sound.player(dir), 'directory rejected');
check(!sound.player(null), 'invalid input rejected');
check(sound.player(`${dir}/short.ogg`), 'OGG startup accepted');
const first = sound.testPlayback().pipeline;
check(sound.player(`${dir}/short.ogg`), 'replacement startup accepted');
check(first.get_state(0)[1] === Gst.State.NULL, 'previous pipeline is NULL');
const second = sound.testPlayback().pipeline;
waitForPlaying();
check(states.at(-1) === true, 'UI subscriber receives playing state');
check(sound.stop(), 'active Stop succeeded');
check(second.get_state(0)[1] === Gst.State.NULL, 'stopped pipeline is NULL');
check(sound.testPlayback() === null, 'Stop cleared ownership');
check(states.at(-1) === false && !sound.isPlaying(), 'Stop publishes idle');
check(sound.player(`${dir}/short.ogg`), 'restart after Stop');
drainUntilIdle();
check(sound.player(`${dir}/bad.ogg`), 'invalid format startup accepted pending decoding');
drainUntilIdle();
check(sound.player(`${dir}/short.ogg`), 'restart after decode error');
waitForPlaying();
const finalPipeline = sound.testPlayback().pipeline;
check(sound.shutdown(), 'disable teardown');
check(finalPipeline.get_state(0)[1] === Gst.State.NULL, 'disable sets NULL');
const count = states.length;
check(sound.player(`${dir}/short.ogg`), 'restart after shutdown');
waitForPlaying();
check(states.length === count, 'shutdown removes subscribers');
unsubscribe();
check(sound.stop(), 'final teardown');
let calls = 0;
const remove = sound.subscribe(() => calls++);
remove();
check(sound.player(`${dir}/short.ogg`), 'restart after unsubscribe');
waitForPlaying();
sound.stop();
check(calls === 1, 'destroy unsubscribe prevents stale updates');
JS
gjs -m "$task_tmp/test.js"

# Fault injection into disposable copies: no packages or installed files change.
sed "s/const backend = imports.gi.Gst;/const backend = imports.gi.AzanMissingTypelibForTest;/" "$sound" > "$task_tmp/missing-typelib.js"
sed "s/ElementFactory.find('playbin')/ElementFactory.find('azan-missing-plugin-for-test')/" "$sound" > "$task_tmp/missing-plugin.js"
for module in missing-typelib missing-plugin; do
    sed -i 's/console.error(/testErrors.push(/g' "$task_tmp/$module.js"
    printf '\nexport const testErrors = [];\n' >> "$task_tmp/$module.js"
done
cat > "$task_tmp/dependencies.js" <<'JS'
import GLib from 'gi://GLib';
import * as missingTypelib from './missing-typelib.js';
import * as missingPlugin from './missing-plugin.js';
const dir = GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]);
for (const [label, controller] of [['typelib', missingTypelib], ['plugin', missingPlugin]]) {
    if (controller.player(`${dir}/short.ogg`) || controller.player(`${dir}/short.ogg`))
        throw new Error(`${label} failure accepted playback`);
    if (controller.testErrors.length !== 1 || controller.isPlaying() || !controller.shutdown())
        throw new Error(`${label} failure did not remain idle/log once`);
    print(`PASS: missing ${label}: module loads, Play fails, logs once, shutdown safe`);
}
JS
gjs -m "$task_tmp/dependencies.js"
