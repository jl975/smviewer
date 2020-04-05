import { Howl } from "howler";
import { gsap } from "gsap";

class AudioPlayer {
  constructor() {
    this.currentSong = {
      audio: null,
    };

    this.updateTimeline = this.updateTimeline.bind(this);
  }

  // placeholder that will be overridden by a React state change method
  setStateAudioPlaying() {}

  selectSong(song) {
    if (this.currentSong.audio) {
      this.currentSong.audio.stop();
    }
    this.setLoadingAudio(true);

    this.currentSong.audio = new Howl({
      src: `https://dl.dropboxusercontent.com/s/${song.dAudioUrl}`,
      format: ["mp3"],
      html5: true,
      onload: () => {
        console.log("AudioPlayer song loaded");
        this.setLoadingAudio(false);
      },
      onloaderror: (id, error, blah) => {
        alert(`${id};;; ${error};;; ${blah}`);
      },
      onplay: () => {
        gsap.ticker.add(this.updateTimeline);
      },
      onpause: () => {
        gsap.ticker.remove(this.updateTimeline);
      },
      onseek: () => {},
      onstop: () => {
        gsap.ticker.remove(this.updateTimeline);
      },
      onend: () => {
        gsap.ticker.remove(this.updateTimeline);
      },
    });
  }

  setTimeline(tl) {
    this.currentSong.tl = tl;
  }

  updateTimeline() {
    const self = this;
    this.currentSong.tl.time(self.getCurrentTime() + 0.07);
  }

  play() {
    this.currentSong.audio.play();
    this.setStateAudioPlaying(true);
  }

  pause() {
    this.currentSong.audio.pause();
    this.setStateAudioPlaying(false);
  }

  stop() {
    this.currentSong.audio.stop();
    this.setStateAudioPlaying(false);
  }

  getCurrentTime() {
    return this.currentSong.audio.seek();
  }

  seek(value) {}

  isPlaying() {
    return this.currentSong.audio && this.currentSong.audio.playing();
  }
  isPaused() {
    return this.currentSong.audio && !this.currentSong.audio.playing();
  }
}

export default new AudioPlayer();
