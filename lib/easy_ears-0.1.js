
/*

EasyEars helps add sound reactivity to your app

new EasyEars(options, completeCallback);

Initialization Examples:

  // Create a new ears instance that will use a DOM
  // element as a target for drag and dropped .mp3
  ears = new EasyEars({dropTarget: document}, function(){
    console.log('song loaded!');
  });
  
  // or...

  // Create one that will use an mp3 from a url
  ears = new EasyEars({url: '/mp3/a_song.mp3'});

Usage Examples:

  var animate = function() {
    webkitRequestAnimationFrame(animate);
    
    // call updateAudio periodically to get latest sound data
    ears.updateAudio();

    // use the following methods to get sound data,
    // each will return a value between 0.0 and 1.0
    ears.lows();
    ears.mids();
    ears.highs();
  }
*/

(function() {
  var EasyEars, map, max, mean, min, sum;

  EasyEars = (function() {

    function EasyEars(opts, callback) {
      this.isPlaying = false;
      this.url = opts.url;
      this.dropTarget = opts.dropTarget;
      this.onFinishLoad = callback;
      this.relativeFreqs = [];
      this.relativeFreqGroups = [];
      this.initAudio();
      if (this.url) {
        this.loadAudioBufferFromUrl(this.url);
      } else if (this.dropTarget) {
        this.loadAudioBufferFromTarget(this.dropTarget);
      } else {
        throw '[EasyEars] Constructor needs either a url or a dropTarget';
      }
    }

    EasyEars.prototype.updateAudio = function(smoothing) {
      if (smoothing == null) smoothing = 0.0;
      this.analyser.smoothingTimeConstant = smoothing;
      this.analyser.getByteFrequencyData(this.freqData);
      this.analyser.getByteTimeDomainData(this.timeData);
      if (this.isPlaying) {
        this.updateFreqGroups();
        this.updateMaxMinFreqs();
        return this.updateRelativeFreqs();
      }
    };

    EasyEars.prototype.lows = function() {
      return this.relativeFreqGroups[0];
    };

    EasyEars.prototype.mids = function() {
      return this.relativeFreqGroups[1];
    };

    EasyEars.prototype.highs = function() {
      return this.relativeFreqGroups[2];
    };

    EasyEars.prototype.initAudio = function() {
      this.audioContext = new window.webkitAudioContext();
      this.source = this.audioContext.createBufferSource();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.freqData = [];
      return this.timeData = [];
    };

    EasyEars.prototype.loadAudioBufferFromTarget = function(target) {
      var _this = this;
      target.addEventListener('dragover', this.onTargetDragOver, false);
      return target.addEventListener('drop', function(event) {
        var files, reader;
        event.stopPropagation();
        event.preventDefault();
        files = event.dataTransfer.files;
        reader = new FileReader;
        reader.onload = function(fileEvent) {
          var data;
          data = fileEvent.target.result;
          _this.audioBuffer = _this.audioContext.createBuffer(data, false);
          return _this.finishLoad();
        };
        return reader.readAsArrayBuffer(files[0]);
      }, false);
    };

    EasyEars.prototype.onTargetDragOver = function(event) {
      event.stopPropagation();
      event.preventDefault();
      return false;
    };

    EasyEars.prototype.loadAudioBufferFromUrl = function(url) {
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
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
      this.isPlaying = true;
      if (this.onFinishLoad != null) return this.onFinishLoad();
    };

    EasyEars.prototype.updateMaxMinFreqs = function() {
      var curGroupMax, curGroupMin, curMax, curMin;
      curMax = max(this.freqData);
      if (this.freqMax == null) this.freqMax = curMax;
      if (curMax > this.freqMax) this.freqMax = curMax;
      curMin = min(this.freqData);
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
      _ref = this.freqData;
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
      var amp, group, groups, i, iGroup, n, nFreqs, nGroups, _i, _len, _len2, _ref, _results;
      nFreqs = this.freqData.length;
      nGroups = 4;
      groups = [];
      for (n = 1; 1 <= nGroups ? n <= nGroups : n >= nGroups; 1 <= nGroups ? n++ : n--) {
        groups.push([]);
      }
      _ref = this.freqData;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        amp = _ref[i];
        iGroup = Math.floor((i / nFreqs) * nGroups);
        groups[iGroup].push(amp);
      }
      this.freqGroups = [];
      _results = [];
      for (_i = 0, _len2 = groups.length; _i < _len2; _i++) {
        group = groups[_i];
        _results.push(this.freqGroups.push(mean(group)));
      }
      return _results;
    };

    return EasyEars;

  })();

  map = function(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
  };

  sum = function(array) {
    var item, total, _i, _len;
    total = 0;
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      total += item;
    }
    return total;
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
