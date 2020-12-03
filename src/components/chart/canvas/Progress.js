import { presetParams } from "../../../utils";
import AudioPlayer from "../../../core/AudioPlayer";

class Progress {
  constructor() {
    this.mouseDown = false;
    this.currentProgress = 0;

    this.presetStart = 0;
    if (presetParams.progress) {
      this.presetStart = presetParams.progress / 100000;
      this.currentProgress = this.presetStart;
    }
  }

  initCanvas() {
    this.canvas = document.querySelector("#progress");
    this.presetMarker = document.querySelector("#progress + .preset-marker-wrapper");

    this.drawBackground();

    // mobile scrub behavior
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.jumpToProgress(e.touches[0]);
    });
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this.jumpToProgress(e.touches[0]);
    });

    // desktop scrub behavior
    this.canvas.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.jumpToProgress(e);
      this.mouseDown = true;
    });
    this.canvas.addEventListener("mousemove", (e) => {
      e.preventDefault();
      if (this.mouseDown) {
        this.jumpToProgress(e);
      }
    });
    this.canvas.addEventListener("mouseup", (e) => {
      e.preventDefault();
      this.mouseDown = false;
    });

    this.setPresetMarker();
    window.addEventListener("resize", () => {
      this.setPresetMarker();
    });
  }

  setPresetMarker() {
    if (!this.presetStart || !this.presetMarker) return;
    const totalWidth = this.canvas.offsetWidth;
    this.presetPosition = totalWidth * this.presetStart;
    this.presetMarker.style.left = `${this.presetPosition}px`;
  }

  setProgress(progress) {
    this.currentProgress = progress;
  }
  getProgress() {
    return this.currentProgress;
  }

  jumpToProgress(event, presetProgress) {
    let progressPercent;

    if (presetProgress) {
      progressPercent = presetProgress;
    } else {
      const domRect = this.canvas.getBoundingClientRect();
      const totalWidth = domRect.width;
      const x = event.clientX - domRect.x;
      progressPercent = x / totalWidth;
    }

    if (progressPercent < 0 || progressPercent > 1) return;

    this.setProgress(progressPercent);
    AudioPlayer.seekProgress(progressPercent);
  }

  jumpToPresetStart(e) {
    this.jumpToProgress(e, this.presetStart);
    e.stopPropagation();
  }

  drawBackground() {
    const c = this.canvas.getContext("2d");
    c.fillStyle = "#d7e2ed";
    c.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(progress) {
    if (isNaN(progress)) return;

    this.setProgress(progress);

    this.drawBackground();
    const c = this.canvas.getContext("2d");
    c.fillStyle = "#627c92";
    c.fillRect(0, 0, this.canvas.width * progress, this.canvas.height);
  }
}

export default new Progress();
