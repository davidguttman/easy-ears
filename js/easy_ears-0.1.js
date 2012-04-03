(function() {
  var EasyEars, map, max, mean, min, sum;

  EasyEars = (function() {

    function EasyEars(url, callback) {
      this.url = url;
      this.onFinishLoad = callback;
      this.is_playing = false;
      this.freqByteData = [];
      this.timeByteData = [];
      this.audioContext = new window.webkitAudioContext();
      this.loadAudio(this.url);
    }

    EasyEars.prototype.loadAudio = function(url) {
      this.source = this.audioContext.createBufferSource();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      return this.loadAudioBuffer(url);
    };

    EasyEars.prototype.loadAudioBuffer = function(url) {
      var request,
        _this = this;
      request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";
      request.onload = function() {
        _this.audioBuffer = _this.audioContext.createBuffer(request.response, false);
        return _this.finishLoad();
      };
      return request.send();
    };

    EasyEars.prototype.finishLoad = function() {
      this.source.buffer = this.audioBuffer;
      this.source.noteOn(0.0);
      this.freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeByteData = new Uint8Array(this.analyser.frequencyBinCount);
      this.is_playing = true;
      if (this.onFinishLoad != null) return this.onFinishLoad();
    };

    EasyEars.prototype.updateAudio = function(smoothing) {
      var audioData;
      if (smoothing == null) smoothing = 0.0;
      this.analyser.smoothingTimeConstant = smoothing;
      this.analyser.getByteFrequencyData(this.freqByteData);
      this.analyser.getByteTimeDomainData(this.timeByteData);
      if (this.is_playing) {
        this.updateFreqGroups();
        this.updateMaxMinFreqs();
        this.updateRelativeFreqs();
      }
      audioData = {
        frequency: this.freqByteData,
        time: this.timeByteData
      };
      return audioData;
    };

    EasyEars.prototype.updateMaxMinFreqs = function() {
      var curGroupMax, curGroupMin, curMax, curMin;
      curMax = max(this.freqByteData);
      if (this.freqMax == null) this.freqMax = curMax;
      if (curMax > this.freqMax) this.freqMax = curMax;
      curMin = min(this.freqByteData);
      if (this.freqMin == null) this.freqMin = curMin;
      if (curMin < this.freqMin) this.freqMin = curMin;
      curGroupMax = max(this.freqGroups);
      if (this.groupMax == null) this.groupMax = curGroupMax;
      if (curGroupMax > this.groupMax) this.groupMax = curGroupMax;
      curGroupMin = min(this.freqGroups);
      if (this.groupMin == null) this.groupMin = curGroupMin;
      if (curGroupMin < this.groupMin) return this.groupMin = curGroupMin;
    };

    EasyEars.prototype.updateRelativeFreqs = function() {
      var amp, self, _i, _j, _len, _len2, _ref, _ref2, _results;
      self = this;
      this.relativeFreqs = [];
      _ref = this.freqByteData;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        amp = _ref[_i];
        this.relativeFreqs.push(map(amp, self.freqMin, self.freqMax, 0, 1));
      }
      this.relativeFreqGroups = [];
      _ref2 = this.freqGroups;
      _results = [];
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        amp = _ref2[_j];
        _results.push(this.relativeFreqGroups.push(map(amp, self.groupMin, self.groupMax, 0, 1)));
      }
      return _results;
    };

    EasyEars.prototype.updateFreqGroups = function() {
      var groups, n, nFreqs, nGroups;
      nGroups = 4;
      nFreqs = this.freqByteData.length;
      groups = [];
      for (n = 1; 1 <= nGroups ? n <= nGroups : n >= nGroups; 1 <= nGroups ? n++ : n--) {
        groups.push([]);
      }
      _.each(this.freqByteData, function(amp, i) {
        var iGroup;
        iGroup = Math.floor((i / nFreqs) * nGroups);
        return groups[iGroup].push(amp);
      });
      return this.freqGroups = _.map(groups, function(group) {
        return mean(group);
      });
    };

    return EasyEars;

  })();

  map = function(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
  };

  sum = function(array) {
    var item, _i, _len;
    sum = 0;
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      sum += item;
    }
    return sum;
  };

  mean = function(array) {
    return (sum(array)) / array.length;
  };

  max = function(array) {
    return Math.max.apply(Math, array);
  };

  min = function(array) {
    return Math.min.apply(Math, array);
  };

  window.EasyEars = EasyEars;

}).call(this);
