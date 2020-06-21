import { ARROW_HEIGHT } from "../../../constants";
import { getReverseCoord } from "../../../utils/engineUtils";

class BpmAndStopDisplay {
  constructor() {
    // store key-value pairs for the bpm and stop values
    // key: the index of the bpm/stop in its queue
    // value: reference to the DOM element displaying the value
    this.bpmElements = {};
    this.stopElements = {};
  }

  /*
    Go through the DOM element maps and delete any elements that no longer
    fall within the window, both from the maps and from the actual DOM.
  */
  refreshWindow(eventWindow, attrs) {
    if (!eventWindow) return;
    const [windowStart, windowEnd] = eventWindow;
    const { mods } = attrs;
    ["bpm", "stop"].forEach((event) => {
      const elementMap = this[`${event}Elements`];
      for (let domKey in elementMap) {
        const { obj, element } = elementMap[domKey];
        const ts = mods.speed === "cmod" ? "timestamp" : "beat";
        if (obj[ts] < windowStart || obj[ts] > windowEnd) {
          // remove from DOM (if it is still on the DOM) and from map
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
          delete elementMap[domKey];
        }
      }
    });

    // console.log("bpmElements after refreshWindow", this.bpmElements);
  }

  /*
    Delete all elements from the DOM, usually when changing the song or difficulty
  */
  clearWindow() {
    ["bpm", "stop"].forEach((event) => {
      const elementMap = this[`${event}Elements`];
      for (let domKey in elementMap) {
        const { obj, element } = elementMap[domKey];
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        delete elementMap[domKey];
      }
    });
  }

  /*
    Check if the event is in its corresponding map by its key.
    If it exists, update the properties on the existing DOM element.
    If not, create the DOM element, append it to the reel and store it in the map.
    Elements in the map that are no longer within the window are deleted
  */
  renderBpm(bpmReel, bpm, { beatTick, timeTick }, { mods }) {
    const key = bpm.beat;

    const pxPosition = getPxPosition(
      bpm,
      { beatTick, timeTick },
      mods,
      bpmReel
    );
    if (!this.bpmElements[key]) {
      const element = document.createElement("div");
      element.className = "bpm-value";
      // element.dataset["val"] = bpm.value;
      element.style.transform = `translateY(${pxPosition}px)`;
      const valueNode = document.createElement("div");
      valueNode.textContent = bpm.value;
      element.appendChild(valueNode);
      bpmReel.appendChild(element);
      this.bpmElements[key] = { value: bpm.value, obj: bpm, element };
    } else {
      const element = this.bpmElements[key].element;
      element.style.transform = `translateY(${pxPosition}px)`;
    }
  }

  renderStop(stopReel, stop, { beatTick, timeTick }, { mods }) {
    const key = stop.beat;
    const pxPosition = getPxPosition(
      stop,
      { beatTick, timeTick },
      mods,
      stopReel
    );
    if (!this.stopElements[key]) {
      const element = document.createElement("div");
      element.className = "stop-value";
      // element.dataset["val"] = stop.value;
      element.style.transform = `translateY(${pxPosition}px)`;
      const valueNode = document.createElement("div");
      valueNode.textContent = stop.value;
      element.appendChild(valueNode);
      stopReel.appendChild(element);
      this.stopElements[key] = { value: stop.value, obj: stop, element };
    } else {
      const element = this.stopElements[key].element;
      element.style.transform = `translateY(${pxPosition}px)`;
    }
  }
}

const getPxPosition = (event, { beatTick, timeTick }, mods, reel) => {
  let pxPosition;
  if (mods.speed === "cmod") {
    const timeDiff = event.timestamp - timeTick;
    pxPosition = timeDiff * ARROW_HEIGHT * (mods.cmod / 60);
  } else {
    const beatDiff = event.beat - beatTick;
    pxPosition = beatDiff * ARROW_HEIGHT * mods.speed;
  }
  pxPosition += ARROW_HEIGHT / 2;

  if (mods.scroll === "reverse") {
    pxPosition = getReverseCoord(pxPosition, 0, { height: reel.clientHeight });
  }
  return pxPosition;
};

export default BpmAndStopDisplay;
