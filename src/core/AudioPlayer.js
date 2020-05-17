import { Howl } from "howler";
import { gsap } from "gsap";

import store from "../store";
import * as actions from "../actions/AudioActions";
import Progress from "../components/chart/canvas/Progress";
import { changeActiveBpm, setCombo } from "../actions/ChartActions";
import { getAssetPath } from "../utils";
import { saveSongProgress } from "../utils/userSettings";
import { getCurrentBpm, getCurrentCombo } from "../utils/engineUtils";
import { GLOBAL_OFFSET } from "../constants";

class AudioPlayer {
  constructor() {
    /*
      Trying to share the same audio source for both song and preview was causing too many
      issues. Sticking to keeping separate Howl objects for each even if means loading
      duplicate copies of the same mp3
    */
    this.sources = {
      song: {},
      preview: {},
      assistTick: {
        audio: new Howl({
          src: getAssetPath("sounds/assist_tick.wav"),
          // format: ["wav"],
          // html5: true,
        }),
      },
    }; // map of song hash to associated Howl object

    window.sources = this.sources;
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
        onend: (spriteId) => {
          gsap.ticker.remove(this.updateTimeline);
          this.stopAnimationLoop();
          store.dispatch(actions.stopChartAudio());
        },
      });

      this.sources.preview[song.hash] = { title: song.title };
      this.sources.preview[song.hash].audio = new Howl({
        src: `https://dl.dropboxusercontent.com/s/${song.dAudioUrl}`,
        format: ["mp3"],
        html5: true,
        sprite: {
          sample: [
            parseFloat(song.sampleStart * 1000),
            parseFloat(song.sampleLength * 1000),
          ],
        },
        onplay: () => {
          store.dispatch(actions.playPreviewAudio());
        },
        onstop: () => {
          clearTimeout(this.previewFadeTimeout);
          this.currentPreviewId = null;
          store.dispatch(actions.stopPreviewAudio());
        },
        onend: () => {
          clearTimeout(this.previewFadeTimeout);
          this.currentPreviewId = null;
          store.dispatch(actions.stopPreviewAudio());
        },
      });

      // console.log(`Added ${song.title} to AudioPlayer.sources`, this.sources);
    }
  }

  selectSong(song, initialProgress = 0) {
    if (this.currentSong) {
      this.getCurrentSong().audio.stop(this.currentSongId);
    }

    this.storeAudioSource(song, initialProgress);
    this.currentSong = song.hash;
  }

  resync() {
    // arbitrary number of frames chosen to tell timeline to resync with the audio
    // because audio playback takes a while to restabilize
    this.audioResyncFrames = 10;
    gsap.ticker.add(this.updateTimeline);
    this.updateProgressOnce();
  }

  // when audio is played, resync timeline with audio a few times until audio playback
  // stabilizes, then remove this method from the ticker
  updateTimeline() {
    // // for reducing debugging headaches; don't remove
    if (!this.getCurrentSong().tl || !this.getCurrentSong().globalParams)
      return;

    // sometimes this will still error on load, just bypass it
    try {
      this.getCurrentSong().tl.seek(this.getCurrentTime() + GLOBAL_OFFSET);
    } catch (err) {}

    this.audioResyncFrames--;

    // if (this.getCurrentSong().globalParams) return;

    if (this.audioResyncFrames <= 0) {
      // recalculate current bpm (necessary if skipping progress)
      const currentBpm = getCurrentBpm(this.getCurrentSong().globalParams);
      store.dispatch(changeActiveBpm(currentBpm));
      // document.querySelector(".bpm-value").textContent = Math.round(currentBpm);

      const currentCombo = getCurrentCombo(this.getCurrentSong());
      // store.dispatch(setCombo(currentCombo));
      const comboTemp = document.querySelector("#combo-temp .combo-num");
      if (comboTemp) comboTemp.textContent = currentCombo;

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
    this.seekTime(value * this.getCurrentSong().audio.duration());
  }

  // gsap ticker method for regularly updating progress bar, not called manually
  updateProgress(time, deltaTime, frame) {
    const currentSong = this.getCurrentSong();
    if (!currentSong || !currentSong.tl) return;

    // detect significant frame skips and resync when it happens
    if (deltaTime > 60) {
      // console.log(deltaTime);
      currentSong.tl.seek(this.getCurrentTime() + GLOBAL_OFFSET);
    }
    if (frame % 15 === 0) {
      const audio = currentSong.audio;
      const progress = audio.seek() / audio.duration();
      // store.dispatch(actions.setChartProgress(progress));
      saveSongProgress(progress);
      Progress.render(progress);
    }
  }

  updateProgressOnce() {
    this.updateProgress(null, null, 0);
    this.updateAnimationLoopOnce();
  }

  setTimeline(tl) {
    this.getCurrentSong().tl = tl;
  }
  setGlobalParams(params) {
    this.getCurrentSong().globalParams = params;
  }

  play() {
    if (store.getState().audio.chartAudio.status === "pending") {
      return;
    }
    this.currentSongId = this.getCurrentSong().audio.play();
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
    this.seekTime(0);
    this.currentSongId = null;
  }

  killImmediately(songId) {
    const currentSong = this.sources.song[songId];
    if (currentSong) {
      if (currentSong.tl) {
        this.sources.song[songId].tl.kill();
        // console.log("kill", this.sources.song[songId].title);
      }
      this.stop();
    }
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

  playAssistTick() {
    this.sources.assistTick.audio.play();
  }

  playSongPreview(song) {
    if (this.currentPreview) {
      this.getCurrentPreview().audio.stop(this.currentPreviewId);
    }

    this.storeAudioSource(song);
    this.currentPreview = song.hash;

    const preview = this.getCurrentPreview().audio;

    this.currentPreviewId = preview.play("sample");

    preview.on("play", () => {
      const preview = this.getCurrentPreview().audio;

      const fadeinTime = 200;
      const fadeoutTime = 2000;
      preview.fade(0, 1, fadeinTime);

      this.previewFadeTimeout = setTimeout(() => {
        preview.fade(1, 0, fadeoutTime);
      }, song.sampleLength * 1000 - fadeoutTime);
    });
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
}

export default new AudioPlayer();
