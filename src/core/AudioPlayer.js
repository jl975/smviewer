import { Howl } from "howler";
import { gsap } from "gsap";

class AudioPlayer {
  constructor() {
    this.currentSong = {
      audio: null,
    };

    this.updateTimeline = this.updateTimeline.bind(this);
  }

  selectSong(song) {
    if (this.currentSong.audio) {
      this.currentSong.audio.stop();
    }
    this.setLoadingAudio(true);

    this.currentSong.audio = new Howl({
      src: `${song.simfilePath}.ogg`,
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
    this.currentSong.tl.time(self.getCurrentTime());
  }

  play() {
    this.currentSong.audio.play();
  }

  pause() {
    this.currentSong.audio.pause();
  }

  stop() {
    this.currentSong.audio.stop();
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
