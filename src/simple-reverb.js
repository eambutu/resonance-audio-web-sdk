"use strict";

const Utils = require("./utils.js");

function SimpleReverb(context, options) {
  if (options === undefined) {
    options = {};
  }
  if (options.reverbFreqCutoff === undefined) {
    options.reverbFreqCutoff = Utils.DEFAULT_REFLECTION_CUTOFF_FREQUENCY;
  }

  this.input = context.createGain();
  this.output = context.createGain();
  this._lowpass = context.createBiquadFilter();
  this.delay = context.createDelay(Utils.DEFAULT_REVERB_MAX_DURATION);
  this.gain = context.createGain();

  this._lowpass.type = "lowpass";
  this._lowpass.frequency.value = Utils.DEFAULT_REFLECTION_CUTOFF_FREQUENCY;
  this._lowpass.Q.value = 0;

  this.input.connect(this._lowpass);
  this._lowpass.connect(this.delay);
  this.delay.connect(this.gain);
  this.gain.connect(this.output);
}

SimpleReverb.prototype.setDelay = function (delaySecs) {
  this.delay.delayTime.value = delaySecs;
};

SimpleReverb.prototype.setGain = function (gain) {
  this.gain.gain.value = gain;
};

SimpleReverb.prototype.setFreq = function (freq) {
  this._lowpass.frequency.value = freq;
};

module.exports = SimpleReverb;
