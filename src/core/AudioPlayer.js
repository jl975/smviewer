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
      // src: `/sample/Nagisa no koakuma lovely~radio.mp3`,
      // src: `https://dl.dropboxusercontent.com/s/bt44iw272m6ga04/O%20Botic%C3%A1rio%20-%20Dia%20dos%20Pais%20novo%20perfume%25`,
      // src: `https://dl.dropboxusercontent.com/s/3xjibl3d7kxcish/01.%20Track%2001.mp3`,
      // src: `https://doc-0o-2c-docs.googleusercontent.com/docs/securesc/fke70trc9ll79jvfpkduuourqa57e305/9oo8qvqneahfk9nhsd6dl1l68vteetfd/1585574400000/13185215351789048891/13185215351789048891/1PtUZQT5-WcUVQIrS0q2o4B9we-450L4v?e=open&authuser=0`,
      // src: `http://docs.google.com/uc?export=open&id=1PtUZQT5-WcUVQIrS0q2o4B9we-450L4v`,
      // src: `http://docs.google.com/uc?export=open&id=${song.gAudioId}`,
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
