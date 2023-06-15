let audioContext;
let canvasControl;
let scene;
let audioElements = [];
let soundSources = [];
let sourceIds = ["sourceAButton", "sourceBButton", "sourceCButton"];
let dimensions = {
  small: {
    width: 1.5,
    height: 2.4,
    depth: 1.3,
  },
  medium: {
    width: 4,
    height: 3.2,
    depth: 3.9,
  },
  large: {
    width: 8,
    height: 3.4,
    depth: 9,
  },
  huge: {
    width: 20,
    height: 10,
    depth: 20,
  },
};
let materials = {
  brick: {
    left: "brick-bare",
    right: "brick-bare",
    up: "brick-bare",
    down: "wood-panel",
    front: "brick-bare",
    back: "brick-bare",
  },
  curtains: {
    left: "curtain-heavy",
    right: "curtain-heavy",
    up: "wood-panel",
    down: "wood-panel",
    front: "curtain-heavy",
    back: "curtain-heavy",
  },
  marble: {
    left: "marble",
    right: "marble",
    up: "marble",
    down: "marble",
    front: "marble",
    back: "marble",
  },
  outside: {
    left: "transparent",
    right: "transparent",
    up: "transparent",
    down: "grass",
    front: "transparent",
    back: "transparent",
  },
};
let dimensionSelection = "huge";
let materialSelection = "outside";
let audioReady = false;

let normalAudioElements = [];
let normalSourceIds = ["sourceDButton", "sourceEButton", "sourceFButton"];
let normalDirectivity = [];

let heightMultiplier = 10;

/**
 * @private
 */
function selectRoomProperties() {
  if (!audioReady) return;

  dimensionSelection = document.getElementById("roomDimensionsSelect").value;
  materialSelection = document.getElementById("roomMaterialsSelect").value;
  scene.setRoomProperties(
    dimensions[dimensionSelection],
    materials[materialSelection]
  );
  canvasControl.invokeCallback();
}

/**
 * @param {Object} elements
 * @private
 */
function updatePositions(elements) {
  if (!audioReady) return;

  for (let i = 0; i < elements.length; i++) {
    let x = ((elements[i].x - 0.5) * dimensions[dimensionSelection].width) / 2;
    let y = heightMultiplier;
    let z = ((elements[i].y - 0.5) * dimensions[dimensionSelection].depth) / 2;
    if (i < elements.length - 1) {
      soundSources[i].setPosition(x, y, z);
    } else {
      scene.setListenerPosition(x, 0, z);
    }
  }
}

/**
 * @private
 */
function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let audioSources = [
    "resources/jinen.mp4",
    "resources/lau.mp3",
    "resources/speech-sample.wav",
  ];
  let audioElementSources = [];
  for (let i = 0; i < audioSources.length; i++) {
    audioElements[i] = document.createElement("audio");
    audioElements[i].src = audioSources[i];
    audioElements[i].crossOrigin = "anonymous";
    audioElements[i].load();
    audioElements[i].loop = true;
    audioElementSources[i] = audioContext.createMediaElementSource(
      audioElements[i]
    );
  }

  // Initialize scene and create Source(s).
  scene = new ResonanceAudio(audioContext, {
    ambisonicOrder: 1,
  });
  for (let i = 0; i < audioSources.length; i++) {
    soundSources[i] = scene.createSource({ rolloff: "none" });
    audioElementSources[i].connect(soundSources[i].input);
  }
  scene.output.connect(audioContext.destination);

  // Normal audio sources that we just do volume on
  for (let i = 0; i < audioSources.length; i++) {
    normalAudioElements[i] = document.createElement("audio");
    normalAudioElements[i].src = audioSources[i];
    normalAudioElements[i].crossOrigin = "anonymous";
    normalAudioElements[i].load();
    normalAudioElements[i].loop = true;
  }

  audioReady = true;

  updatePositions(canvasControl._elements);
  setToDefault("close");
}

let onLoad = function () {
  // Initialize play button functionality.
  for (let i = 0; i < sourceIds.length; i++) {
    let button = document.getElementById(sourceIds[i]);
    button.addEventListener("click", function (event) {
      switch (event.target.textContent.trim()) {
        case "Play":
          {
            if (!audioReady) {
              initAudio();
            }
            event.target.textContent = "Pause";
            audioElements[i].play();
          }
          break;
        case "Pause":
          {
            event.target.textContent = "Play";
            audioElements[i].pause();
          }
          break;
      }
    });
  }

  for (let i = 0; i < normalSourceIds.length; i++) {
    let button = document.getElementById(normalSourceIds[i]);
    button.addEventListener("click", function (event) {
      switch (event.target.textContent.trim()) {
        case "Play":
          {
            if (!audioReady) {
              initAudio();
            }
            event.target.textContent = "Pause";
            normalAudioElements[i].play();
          }
          break;
        case "Pause":
          {
            event.target.textContent = "Play";
            normalAudioElements[i].pause();
          }
          break;
      }
    });
  }

  document
    .getElementById("switchToDefaultsA")
    .addEventListener("click", (_) => {
      setToDefault("close");
    });

  document
    .getElementById("switchToDefaultsB")
    .addEventListener("click", (_) => {
      setToDefault("faraway");
    });

  document
    .getElementById("volumeForOther")
    .addEventListener("input", (event) => {
      const newVolume = parseInt(event.target.value) / 100;
      for (let i = 0; i < normalAudioElements.length; i++) {
        normalAudioElements[i].volume = newVolume;
      }
    });

  document
    .getElementById("manualGainAdjust")
    .addEventListener("input", (event) => {
      const gain = parseFloat(event.target.value);
      setGain(gain);
    });

  document.getElementById("reverbDelay").addEventListener("input", (event) => {
    const delayInSecs = parseFloat(event.target.value);
    setReverbDelay(delayInSecs);
  });

  document.getElementById("reverbGain").addEventListener("input", (event) => {
    const gain = parseFloat(event.target.value);
    setReverbGain(gain);
  });

  document
    .getElementById("reverbFreqCutoff")
    .addEventListener("input", (event) => {
      const freq = parseFloat(event.target.value);
      setReverbFreq(freq);
    });

  document
    .getElementById("generalFreqCutoff")
    .addEventListener("input", (event) => {
      const freq = parseFloat(event.target.value);
      setGeneralFreq(freq);
    });

  /*
  document
    .getElementById("heightMultiplier")
    .addEventListener("input", (event) => {
      heightMultiplier = parseFloat(event.target.value);
      updatePositions(canvasControl._elements);
    });
  */

  document
    .getElementById("roomDimensionsSelect")
    .addEventListener("change", function (event) {
      selectRoomProperties();
    });

  document
    .getElementById("roomMaterialsSelect")
    .addEventListener("change", function (event) {
      selectRoomProperties();
    });

  let canvas = document.getElementById("canvas");
  let elements = [
    {
      icon: "sourceAIcon",
      x: 0.1,
      y: 0.5,
      radius: 0.04,
      alpha: 0.75,
      clickable: true,
    },
    {
      icon: "sourceBIcon",
      x: 0.9,
      y: 0.5,
      radius: 0.04,
      alpha: 0.75,
      clickable: true,
    },
    {
      icon: "sourceCIcon",
      x: 0.25,
      y: 0.75,
      radius: 0.04,
      alpha: 0.75,
      clickable: true,
    },
    {
      icon: "listenerIcon",
      x: 0.5,
      y: 0.5,
      radius: 0.04,
      alpha: 0.75,
      clickable: true,
    },
  ];
  canvasControl = new CanvasControl(canvas, elements, updatePositions);

  selectRoomProperties();
};

const setGain = (gain) => {
  document.getElementById("manualGainAdjust").value = gain;
  console.log("here in set gain", soundSources);
  soundSources.forEach((source) => {
    source._attenuation.setManualGain(gain);
  });
  updateStats();
};

const setReverbDelay = (delayInSecs) => {
  document.getElementById("reverbDelay").value = delayInSecs;
  soundSources.forEach((source) => {
    source.simpleReverb.setDelay(delayInSecs);
  });
  updateStats();
};

const setReverbGain = (gain) => {
  document.getElementById("reverbGain").value = gain;
  soundSources.forEach((source) => {
    source.simpleReverb.setGain(gain);
  });
  updateStats();
};

const setReverbFreq = (freq) => {
  document.getElementById("reverbFreqCutoff").value = freq;
  soundSources.forEach((source) => {
    source.simpleReverb.setFreq(freq);
  });
  updateStats();
};

const setGeneralFreq = (freq) => {
  document.getElementById("generalFreqCutoff").value = freq;
  soundSources.forEach((source) => {
    source.setCutoffFrequency(freq);
  });
  updateStats();
};

const updateStats = () => {
  const gain = document.getElementById("manualGainAdjust").value;
  const reverbDelay = document.getElementById("reverbDelay").value;
  const reverbGain = document.getElementById("reverbGain").value;
  const reverbFreq = document.getElementById("reverbFreqCutoff").value;
  const generalFreq = document.getElementById("generalFreqCutoff").value;
  document.getElementById("stats").innerText =
    "Gain: " +
    gain +
    " Reverb Delay: " +
    reverbDelay +
    " Reverb Gain: " +
    reverbGain +
    " Reverb Freq: " +
    reverbFreq +
    " General Freq: " +
    generalFreq +
    " Height: 10";
};

const setToDefault = (type) => {
  if (type === "close") {
    setGain(valueDefaults.close.gain);
    setReverbDelay(valueDefaults.close.reverbDelay);
    setReverbGain(valueDefaults.close.reverbGain);
    setReverbFreq(valueDefaults.close.reverbFreq);
    setGeneralFreq(valueDefaults.close.generalFreq);
  } else {
    setGain(valueDefaults.faraway.gain);
    setReverbDelay(valueDefaults.faraway.reverbDelay);
    setReverbGain(valueDefaults.faraway.reverbGain);
    setReverbFreq(valueDefaults.faraway.reverbFreq);
    setGeneralFreq(valueDefaults.faraway.generalFreq);
  }
};

const valueDefaults = {
  close: {
    gain: 0.25,
    reverbDelay: 0.09,
    reverbGain: 0.2,
    reverbFreq: 400,
    generalFreq: 2000,
  },
  faraway: {
    gain: 0.15,
    reverbDelay: 0.09,
    reverbGain: 0.7,
    reverbFreq: 400,
    generalFreq: 2000,
  },
};

window.addEventListener("load", onLoad);
