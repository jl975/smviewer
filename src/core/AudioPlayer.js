import { Howl } from "howler";
import { gsap } from "gsap";

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
    }; // map of song hash to associated Howl object
    this.currentSong = null; // hash of current song
    this.currentPreview = null; // hash of current preview

    this.currentSongId = null; // Howler soundID of current song
    this.currentPreviewId = null; // Howler soundId of current preview

    // this.updateTimeline = this.updateTimeline.bind(this);

    this.activeView = null; // gets updated whenever active view changes in React

    this.previewFadeTimeout = null; // reference to preview fade setTimeout so it can be cleared

    this.updateTimeline = this.updateTimeline.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.audioResyncFrames = 0;
  }

  // placeholders that will be overridden by a React state change method
  // these can probably all be replaced with Redux action dispatches
  setStateAudioPlaying() {}
  setStatePreviewPlaying() {}
  setStateProgress() {}

  getCurrentSong() {
    return this.sources.song[this.currentSong];
  }
  getCurrentPreview() {
    return this.sources.preview[this.currentPreview];
  }

  // when loading a song file for the first time, save it as two separate Howls:
  // one for the full song and one for the preview sample
  storeAudioSource(song) {
    if (!this.sources.song[song.hash]) {
      this.setLoadingAudio(true);

      this.sources.song[song.hash] = { title: song.title };
      this.sources.song[song.hash].audio = new Howl({
        src: `https://dl.dropboxusercontent.com/s/${song.dAudioUrl}`,
        format: ["mp3"],
        html5: true,
        onload: () => {
          // console.log(`AudioPlayer song loaded: ${song.title}`);
          this.setLoadingAudio(false);
        },
        onloaderror: (id, error, blah) => {
          alert(`${id};;; ${error};;; ${blah}`);
        },
        onplay: () => {
          this.getCurrentSong().tl.play();

          this.resync();
          this.setStateAudioPlaying(true);
          gsap.ticker.add(this.updateProgress);
        },
        onpause: () => {
          this.getCurrentSong().tl.pause();
          gsap.ticker.remove(this.updateTimeline);
          this.setStateAudioPlaying(false);
          gsap.ticker.remove(this.updateProgress);
        },
        onseek: () => {},
        onstop: () => {
          if (this.getCurrentSong().tl) {
            this.getCurrentSong().tl.restart().pause();
          }
          gsap.ticker.remove(this.updateTimeline);
          this.setStateAudioPlaying(false);
        },
        onend: (spriteId) => {
          gsap.ticker.remove(this.updateTimeline);
          this.setStateAudioPlaying(false);
        },
      });

      this.sources.preview[song.hash] = { title: song.title };
      this.sources.preview[song.hash].audio = new Howl({
        src: `https://dl.dropboxusercontent.com/s/${song.dAudioUrl}`,
        format: ["mp3"],
        html5: true,
        sprite: {
          sample: [
            parseFloat((song.sampleStart - 0.12) * 1000),
            parseFloat(song.sampleLength * 1000),
          ],
        },
        onplay: () => {},
        onstop: () => {
          clearTimeout(this.previewFadeTimeout);
          this.currentPreviewId = null;
          this.setStatePreviewPlaying(false);
        },
        onend: () => {
          clearTimeout(this.previewFadeTimeout);
          this.currentPreviewId = null;
          this.setStatePreviewPlaying(false);
        },
      });

      // console.log(`Added ${song.title} to AudioPlayer.sources`, this.sources);
    }
  }

  selectSong(song) {
    if (this.currentSong) {
      this.getCurrentSong().audio.stop(this.currentSongId);
    }

    this.storeAudioSource(song);
    this.currentSong = song.hash;
  }

  setTimeline(tl) {
    this.getCurrentSong().tl = tl;
  }

  resync() {
    // arbitrary number of frames chosen to tell timeline to resync with the audio
    // because audio playback takes a while to restabilize
    this.audioResyncFrames = 10;
    gsap.ticker.add(this.updateTimeline);
  }

  // when audio is played, resync timeline with audio a few times until audio playback
  // stabilizes, then remove this method from the ticker
  updateTimeline() {
    const self = this;
    this.getCurrentSong().tl.time(self.getCurrentTime() + 0.07);

    this.audioResyncFrames--;
    if (this.audioResyncFrames <= 0) {
      gsap.ticker.remove(this.updateTimeline);
    }
  }

  updateProgress(time, deltaTime, frame) {
    if (frame % 15 === 0 && this.setStateProgress) {
      const audio = this.getCurrentSong().audio;
      const progress = audio.seek() / audio.duration();
      this.setStateProgress(progress);
    }
  }

  play() {
    this.currentSongId = this.getCurrentSong().audio.play();
  }

  pause() {
    this.getCurrentSong().audio.pause(this.currentSongId);
  }

  stop() {
    this.getCurrentSong().audio.stop(this.currentSongId);
    this.currentSongId = null;
  }

  getCurrentTime() {
    return this.getCurrentSong().audio.seek();
  }

  goBack(ms) {
    const self = this;
    this.seekTime(self.getCurrentTime() - ms * 0.001);
    this.getCurrentSong().tl.time(self.getCurrentTime() + 0.07);
  }
  goForward(ms) {
    const self = this;
    this.seekTime(self.getCurrentTime() + ms * 0.001);
    this.getCurrentSong().tl.time(self.getCurrentTime() + 0.07);
  }

  seekTime(timestamp) {
    this.getCurrentSong().audio.seek(timestamp);
    this.resync();
  }

  seekProgress(value) {
    const self = this;
    this.seekTime(value * this.getCurrentSong().audio.duration());
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
      this.setStatePreviewPlaying(true);
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
