import { Howl } from "howler";
import { gsap } from "gsap";

import store from "../store";
import * as actions from "../actions/AudioActions";
import Progress from "../components/chart/canvas/Progress";
// import { changeActiveBpm, setCombo } from "../actions/ChartActions";
import { getAssetPath } from "../utils";
import { saveSongProgress } from "../utils/userSettings";
import {
  getGlobalOffset,
  getCurrentBpm,
  changeActiveBpm,
  getCurrentPosition,
  getFullCombo,
  initializeBeatWindow
} from "../utils/engineUtils";
// import { DEFAULT_OFFSET } from "../constants";
import { debugLog } from "../utils/debugUtils";

class AudioPlayer {
  constructor() {
    /*
      Trying to share the same audio source for both song and preview was causing too many
      issues. Sticking to keeping separate Howl objects for each even if means loading
      duplicate copies of the same mp3
    */
    this.sources = {
      song: {},
      preview: {}
      // assistTick: {
      //   // audio: new Howl({
      //   //   src: getAssetPath("sounds/assist_tick.wav"),
      //   //   volume: 1,
      //   //   // format: ["wav"],
      //   //   html5: true,
      //   // }),
      //   context: new (window.AudioContext || window.webkitAudioContext)(),
      //   buffer: null,
      //   unlocked: false
      // }
    }; // map of song hash to associated Howl object

    // this.initializeAssistTick();

    this.currentSong = null; // hash of current song
    this.currentPreview = null; // hash of current preview

    this.currentSongId = null; // Howler soundID of current song
    this.currentPreviewId = null; // Howler soundId of current preview

    // this.updateTimeline = this.updateTimeline.bind(this);

    this.previewFadeTimeout = null; // reference to preview fade setTimeout so it can be cleared

    this.updateTimeline = this.updateTimeline.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.audioResyncFrames = 0;
  }

  initializeAssistTick() {
    const currentSong = this.getCurrentSong();
    const assist = currentSong.globalParams.assist;

    const audioContext = assist.audioContext;
    const request = new XMLHttpRequest();
    request.open("GET", getAssetPath("sounds/assist_tick.wav"), true);
    request.responseType = "arraybuffer";

    // function onDecoded(buffer) {
    //   assistTick.buffer = buffer;
    // }
    request.onload = function() {
      audioContext.decodeAudioData(request.response, buffer => {
        assist.buffer = buffer;
      });
    };
    request.send();
  }

  playAssistTick(time) {
    const currentSong = this.getCurrentSong();
    const assist = currentSong.globalParams.assist;
    // if (!currentSong.globalParams.mods.assistTick) return;

    if (!this.isAudioStable) return;
    if (this.getChartAudioStatus() !== "playing") return;

    // const assistTick = this.sources.assistTick;
    // const audioContext = assistTick.context;

    const audioContext = currentSong.globalParams.assist.audioContext;
    const currentTime = audioContext.currentTime;

    // don't retroactively play ticks that were backed up past the lookahead window
    if (time < currentTime) return;

    // console.log("time", time, "currentTime", currentTime);

    if (assist.buffer) {
      const bufferSource = audioContext.createBufferSource();
      bufferSource.buffer = assist.buffer;
      bufferSource.connect(audioContext.destination);

      bufferSource.start(time - getGlobalOffset());
      // bufferSource.start(
      //   time - getGlobalOffset() - currentSong.globalParams.offset
      // );
      // bufferSource.start(100);
      // console.log(audioContext.currentTime);
    }
  }

  getCurrentSong() {
    const currentSong = this.sources.song[this.currentSong];
    return currentSong;
  }
  getCurrentPreview() {
    return this.sources.preview[this.currentPreview];
  }

  getCurrentTime() {
    return this.getCurrentSong().audio.seek();
  }

  // when loading a song file for the first time, save it as two separate Howls:
  // one for the full song and one for the preview sample
  storeAudioSource(song, initialProgress = 0) {
    if (!this.sources.song[song.hash]) {
      this.setLoadingAudio(true);

      const thisSong = (this.sources.song[song.hash] = { title: song.title });

      thisSong.audio = new Howl({
        src: `https://dl.dropboxusercontent.com/s/${song.dAudioUrl}`,
        format: ["mp3"],
        html5: true,
        volume: 0.5,
        onload: () => {
          // console.log(`AudioPlayer song loaded: ${song.title}`);
          this.setLoadingAudio(false);
          this.seekProgress(initialProgress);
        },
        onloaderror: (id, error, blah) => {
          alert(`${id};;; ${error};;; ${blah}`);
        },
        onplay: () => {
          thisSong.tl.play();
          this.resync();
          gsap.ticker.add(this.updateProgress);
          this.startAnimationLoop();
          store.dispatch(actions.playChartAudio());
        },
        onpause: () => {
          thisSong.tl.pause();
          gsap.ticker.remove(this.updateTimeline);
          gsap.ticker.remove(this.updateProgress);
          this.stopAnimationLoop();
          store.dispatch(actions.pauseChartAudio());
        },
        onseek: () => {},
        onstop: () => {
          if (thisSong.tl) {
            thisSong.tl.restart().pause();
          }
          gsap.ticker.remove(this.updateTimeline);
          gsap.ticker.remove(this.updateProgress);
          this.stopAnimationLoop();
          store.dispatch(actions.stopChartAudio());
        },
        onend: spriteId => {
          if (thisSong.tl) {
            thisSong.tl.pause();
          }
          gsap.ticker.remove(this.updateTimeline);
          gsap.ticker.remove(this.updateProgress);
          this.stopAnimationLoop();
          store.dispatch(actions.stopChartAudio());
        }
      });
    }
  }

  storePreviewSource(song, simfile) {
    const thisPreview = (this.sources.preview[song.hash] = {
      title: song.title
    });
    thisPreview.audio = new Howl({
      src: `https://dl.dropboxusercontent.com/s/${song.dAudioUrl}`,
      format: ["mp3"],
      html5: true,
      sprite: {
        sample: [
          parseFloat((simfile.sampleStart - getGlobalOffset()) * 1000),
          parseFloat((simfile.sampleLength - getGlobalOffset()) * 1000)
        ]
      },
      onload: () => {
        // thisPreview.audio.volume(0);
      },
      onplay: () => {
        // const preview = this.getCurrentPreview().audio;
        thisPreview.audio.volume(1);

        const fadeinTime = 0;
        const fadeoutTime = 2000;
        // thisPreview.audio.fade(0, 1, fadeinTime);

        this.previewFadeTimeout = setTimeout(() => {
          thisPreview.audio.fade(1, 0, fadeoutTime);
        }, simfile.sampleLength * 1000 - fadeoutTime);

        store.dispatch(actions.playPreviewAudio());
      },
      onstop: () => {
        clearTimeout(this.previewFadeTimeout);
        // thisPreview.audio.volume(0);
        this.currentPreviewId = null;
        store.dispatch(actions.stopPreviewAudio());
      },
      onend: () => {
        clearTimeout(this.previewFadeTimeout);
        // thisPreview.audio.volume(0);
        this.currentPreviewId = null;
        store.dispatch(actions.stopPreviewAudio());
      }
    });
  }

  selectSong(song, initialProgress = 0) {
    if (this.currentSong) {
      this.getCurrentSong().audio.stop(this.currentSongId);
    }

    this.storeAudioSource(song, initialProgress);
    this.currentSong = song.hash;
  }

  resync() {
    // number of frames it takes for audio to reload/restabilize
    // this.getCurrentTime() (i.e. Howler .seek()) will return an object instead of a number
    // if audio is not loaded yet
    this.audioReloadFrames = 0;

    // arbitrary number of frames chosen to tell timeline to resync with the audio
    // this needs to be done after (/in addition to) the audio restabilizing
    this.audioResyncFrames = 10;

    const currentSong = this.getCurrentSong();
    if (currentSong.globalParams) {
      currentSong.globalParams.assist.nextNotePtr = null;
    }

    gsap.ticker.add(this.updateTimeline);
    // this.updateProgressOnce();
  }

  // when audio is played, resync timeline with audio a few times until audio playback
  // stabilizes, then remove this method from the ticker
  updateTimeline() {
    // // for reducing debugging headaches; don't remove
    const currentSong = this.getCurrentSong();
    if (!currentSong.tl || !currentSong.globalParams) return;

    this.isAudioStable = false;

    // NOTE: the following block will run 10 times on every resync
    try {
      const currentTime = this.getCurrentTime();
      // console.log("currentTime", currentTime);
      if (typeof currentTime === "number") {
        this.isAudioStable = true;
        // console.log(
        //   "seek timeline to",
        //   currentTime,
        //   "after",
        //   this.audioReloadFrames,
        //   "frames"
        // );
        // console.log("stabilized to", currentTime);

        const globalOffset = store.getState().mods.globalOffset;

        currentSong.tl.seek(
          // currentTime + DEFAULT_OFFSET + currentSong.globalParams.offset
          currentTime + globalOffset + currentSong.globalParams.offset
        );
        this.updateProgressOnce();

        if (this.getChartAudioStatus() === "playing") {
          currentSong.tl.play();
        }
        this.audioResyncFrames--;
      } else {
        // console.log("audio restabilizing");
        currentSong.tl.pause();
        this.audioReloadFrames++;
      }
    } catch (err) {
      console.log(err);
    }

    // This block will only run once on every resync
    if (this.isAudioStable && this.audioResyncFrames <= 0) {
      // recalculate current bpm (necessary if skipping progress)
      const currentBpm = getCurrentBpm(currentSong.globalParams);
      changeActiveBpm(currentBpm, currentSong.globalParams);
      // document.querySelector(".bpm-value").textContent = Math.round(currentBpm);

      const { currentCombo, nextNotePtr } = getCurrentPosition(currentSong);
      // currentSong.globalParams.combo = currentCombo;

      // store.dispatch(setCombo(currentCombo));
      const comboTemp = document.querySelector("#combo-temp .combo-num");
      if (comboTemp) comboTemp.textContent = currentCombo;

      const assist = currentSong.globalParams.assist;
      const audioContext = assist.audioContext;

      const progressTime = this.getCurrentTime();

      // console.log("doOnce");
      // console.log("audioStartContextTime", audioContext.currentTime);
      // console.log("audioStartProgressTime", progressTime);
      assist.audioStartContextTime = audioContext.currentTime;
      assist.audioStartProgressTime = progressTime;
      assist.nextNotePtr = nextNotePtr;

      gsap.ticker.remove(this.updateTimeline);
    }
  }

  seekTime(timestamp) {
    this.getCurrentSong().audio.seek(timestamp);
    this.resync();
  }
  goBack(ms) {
    this.seekTime(this.getCurrentTime() - ms * 0.001);
  }
  goForward(ms) {
    this.seekTime(this.getCurrentTime() + ms * 0.001);
  }

  seekProgress(value) {
    const audioDuration = this.getCurrentSong().audio.duration();
    this.seekTime(value * audioDuration);
  }

  // gsap ticker method for regularly updating progress bar, not called manually
  updateProgress(time, deltaTime, frame) {
    const currentSong = this.getCurrentSong();
    if (!currentSong || !currentSong.tl) return;

    // console.log(currentSong.tl);

    // detect significant frame skips and resync when it happens
    if (deltaTime > 60) {
      // console.log(deltaTime);
      const currentTime = this.getCurrentTime();
      console.log(
        "frame skip",
        "deltaTime:",
        deltaTime,
        "currentTime:",
        currentTime
      );
      if (typeof currentTime === "number") {
        const globalOffset = store.getState().mods.globalOffset;

        currentSong.tl.seek(
          currentTime + globalOffset + currentSong.globalParams.offset
        );
      } else {
        console.log("audio unstable after frame skip, resyncing");
        this.resync();
      }
    }
    if (frame % 15 === 0) {
      let t0 = performance.now();
      const audio = currentSong.audio;
      const progress = audio.seek() / audio.duration();
      let t1 = performance.now();
      const audioSeekPerf = t1 - t0;
      // console.log(`audio seek/duration progress: ${(t1 - t0).toFixed(3)} ms`);
      // store.dispatch(actions.setChartProgress(progress));

      t0 = performance.now();
      let tlProgress = currentSong.tl.progress();
      t1 = performance.now();
      const tlSeekPerf = t1 - t0;

      // console.log(
      //   `audioSeekPerf - tlSeekPerf = ${(audioSeekPerf - tlSeekPerf).toFixed(
      //     3
      //   )} ms`
      // );
      // console.log(`tl progress: ${(t1 - t0).toFixed(3)} ms`);

      t0 = performance.now();
      saveSongProgress(progress);
      Progress.render(progress);
      t1 = performance.now();
      // console.log(`renderProgress ${(t1 - t0).toFixed(3)} ms`);
    }
  }

  updateProgressOnce() {
    this.updateProgress(null, null, 0);

    const currentSong = this.getCurrentSong();
    const { currentCombo } = getCurrentPosition(currentSong);

    const audioContext = currentSong.globalParams.assist.audioContext;
    // if (audioContext.state === "suspended") {
    //   audioContext.resume();
    // }

    // const comboDebug = document.querySelector("#combo-debug .combo-debug-num");
    // if (comboDebug) {
    //   comboDebug.textContent = currentCombo;
    // }

    debugLog(`FC: ${getFullCombo(currentSong)}`);

    currentSong.globalParams.combo = currentCombo;

    initializeBeatWindow(currentSong.globalParams);

    this.updateAnimationLoopOnce();
  }

  setTimeline(tl) {
    this.getCurrentSong().tl = tl;
  }
  setGlobalParams(params) {
    this.getCurrentSong().globalParams = params;
  }

  play() {
    if (this.getChartAudioStatus() === "pending") {
      return;
    }
    const currentSong = this.getCurrentSong();
    this.currentSongId = currentSong.audio.play();

    debugLog(`last played: ${currentSong.title}`, 2);
    store.dispatch(actions.setChartAudioStatus("pending"));
  }

  pause() {
    this.getCurrentSong().audio.pause(this.currentSongId);

    const audio = this.getCurrentSong().audio;
    const progress = audio.seek() / audio.duration();
    saveSongProgress(progress);
  }

  stop() {
    if (!this.getCurrentSong()) {
      return;
    }
    this.getCurrentSong().audio.stop(this.currentSongId);
    this.stopAnimationLoop();
    setTimeout(() => this.seekTime(0));
    this.currentSongId = null;
  }

  killImmediately(songId) {
    const currentSong = this.sources.song[songId];
    if (currentSong) {
      if (currentSong.tl) {
        this.sources.song[songId].tl.kill();
      }
      this.stop();
    }
    store.dispatch(actions.setChartAudioStatus("stopped"));
  }

  isPlaying() {
    return (
      this.getCurrentSong() &&
      this.getCurrentSong().audio.playing(this.currentSongId)
    );
  }
  isPaused() {
    return (
      this.getCurrentSong() &&
      !this.getCurrentSong().audio.playing(this.currentSongId)
    );
  }

  // playAssistTick() {
  //   this.sources.assistTick.audio.play();
  // }

  playSongPreview(song) {
    if (this.getPreviewAudioStatus() === "pending") {
      return;
    }
    if (this.currentPreview) {
      this.getCurrentPreview().audio.stop(this.currentPreviewId);
    }

    // this.storeAudioSource(song);
    this.currentPreview = song.hash;

    const preview = this.getCurrentPreview().audio;

    this.currentPreviewId = preview.play("sample");
    store.dispatch(actions.setPreviewAudioStatus("pending"));
  }

  stopSongPreview() {
    if (!this.currentPreview) return;
    const preview = this.getCurrentPreview().audio;

    preview.stop(this.currentPreviewId);

    // clearTimeout(this.previewFadeTimeout);
  }

  isPreviewPlaying() {
    return (
      this.getCurrentPreview() &&
      this.getCurrentPreview().audio.playing(this.currentPreviewId)
    );
  }

  getChartAudioStatus() {
    return store.getState().audio.chartAudio.status;
  }
  getPreviewAudioStatus() {
    return store.getState().audio.previewAudio.status;
  }
}

export default new AudioPlayer();
