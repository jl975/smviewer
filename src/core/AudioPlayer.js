import { Howl } from "howler";
import { gsap } from "gsap";

class AudioPlayer {
  constructor() {
    this.sources = {}; // map of song hash to associated Howl object
    this.currentSong = null; // hash of current song
    this.currentPreview = null; // hash of current preview

    this.currentSongId = null; // Howler soundID of current song
    this.currentPreviewId = null; // Howler soundId of current preview

    this.updateTimeline = this.updateTimeline.bind(this);

    this.activeView = null; // gets updated whenever active view changes in React

    this.previewFadeTimeout = null; // reference to preview fade setTimeout so it can be cleared
  }

  // placeholders that will be overridden by a React state change method
  setStateAudioPlaying() {}
  setStatePreviewPlaying() {}

  getCurrentSong() {
    return this.sources[this.currentSong];
  }
  getCurrentPreview() {
    return this.sources[this.currentPreview];
  }

  storeAudioSource(song) {
    if (!this.sources[song.hash]) {
      this.setLoadingAudio(true);

      this.sources[song.hash] = { title: song.title };
      this.sources[song.hash].audio = new Howl({
        src: `https://dl.dropboxusercontent.com/s/${song.dAudioUrl}`,
        format: ["mp3"],
        html5: true,
        sprite: {
          sample: [
            parseFloat((song.sampleStart - 0.12) * 1000),
            parseFloat(song.sampleLength * 1000),
          ],
          full: [0, 180000], // arbitrarily chosen 3 mins to represent "full duration"
        },
        onload: () => {
          console.log(`AudioPlayer song loaded: ${song.title}`);
          this.setLoadingAudio(false);
        },
        onloaderror: (id, error, blah) => {
          alert(`${id};;; ${error};;; ${blah}`);
        },
        onplay: (spriteId) => {
          if (this.currentSong === song.hash && this.activeView === "main") {
            gsap.ticker.add(this.updateTimeline);
            this.setStateAudioPlaying(true);
          } else if (spriteId === this.currentPreviewId) {
            const preview = this.getCurrentPreview().audio;

            const fadeinTime = 200;
            const fadeoutTime = 2000;
            preview.fade(0, 1, fadeinTime);
            this.previewFadeTimeout = setTimeout(() => {
              preview.fade(1, 0, fadeoutTime);
            }, song.sampleLength * 1000 - fadeoutTime);
            this.setStatePreviewPlaying(true);
          }
        },
        onpause: (spriteId) => {
          if (this.currentSong === song.hash && this.activeView === "main") {
            gsap.ticker.remove(this.updateTimeline);
            this.setStateAudioPlaying(false);
          } else if (spriteId === this.currentPreviewId) {
            console.log(spriteId, "paused");
          }
        },
        onseek: () => {},
        onstop: (spriteId) => {
          if (this.currentSong === song.hash && this.activeView === "main") {
            gsap.ticker.remove(this.updateTimeline);
            this.setStateAudioPlaying(false);
          } else if (spriteId === this.currentPreviewId) {
            clearTimeout(this.previewFadeTimeout);
            this.currentPreviewId = null;
            this.setStatePreviewPlaying(false);
          }
        },
        onend: (spriteId) => {
          if (this.currentSong === song.hash && this.activeView === "main") {
            gsap.ticker.remove(this.updateTimeline);
            this.setStateAudioPlaying(false);
          } else if (spriteId === this.currentPreviewId) {
            clearTimeout(this.previewFadeTimeout);
            this.currentPreviewId = null;
            this.setStatePreviewPlaying(false);
          }
        },
      });

      console.log(`Added ${song.title} to AudioPlayer.sources`, this.sources);
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

  updateTimeline() {
    const self = this;
    this.getCurrentSong().tl.time(self.getCurrentTime() + 0.07);
  }

  play() {
    this.currentSongId = this.getCurrentSong().audio.play(
      this.currentSongId || "full"
    );
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

  seek(value) {}

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
  }

  stopSongPreview() {
    if (!this.currentPreview) return;
    const preview = this.getCurrentPreview().audio;

    preview.stop(this.currentPreviewId);
    clearTimeout(this.previewFadeTimeout);
  }

  isPreviewPlaying() {
    return (
      this.getCurrentPreview() &&
      this.getCurrentPreview().audio.playing(this.currentPreviewId)
    );
  }
}

export default new AudioPlayer();
