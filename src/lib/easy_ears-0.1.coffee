###

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

###

class EasyEars

  constructor: (opts, callback) ->
    @isPlaying = false

    @url = opts.url
    @dropTarget = opts.dropTarget

    @onFinishLoad = callback

    @relativeFreqs = []
    @relativeFreqGroups = []

    @initAudio()
    if @url
      @loadAudioBufferFromUrl @url  
    else if @dropTarget
      @loadAudioBufferFromTarget @dropTarget
    else
      throw '[EasyEars] Constructor needs either a url or a dropTarget'

  updateAudio: (smoothing=0.0)->
    @analyser.smoothingTimeConstant = smoothing
    @analyser.getByteFrequencyData @freqData
    @analyser.getByteTimeDomainData @timeData
    
    if @isPlaying
      @updateFreqGroups()
      @updateMaxMinFreqs()
      @updateRelativeFreqs()

  lows: ->
    @relativeFreqGroups[0]

  mids: ->
    @relativeFreqGroups[1]

  highs: ->
    @relativeFreqGroups[2]

  initAudio: ->
    @audioContext = new window.webkitAudioContext()
    @source = @audioContext.createBufferSource()

    @analyser = @audioContext.createAnalyser()
    @analyser.fftSize = 256

    @source.connect @analyser
    @analyser.connect @audioContext.destination

    @freqData = []
    @timeData = []    

  loadAudioBufferFromTarget: (target) ->
    target.addEventListener 'dragover', @onTargetDragOver, false

    target.addEventListener 'drop', (event) =>
      event.stopPropagation()
      event.preventDefault()

      files = event.dataTransfer.files
      reader = new FileReader

      reader.onload = (fileEvent) =>
        data = fileEvent.target.result
        @audioBuffer = @audioContext.createBuffer data, false
        @finishLoad()

      reader.readAsArrayBuffer files[0]
    , false
    

  onTargetDragOver: (event) ->
    event.stopPropagation()
    event.preventDefault()
    return false

  loadAudioBufferFromUrl: (url) ->
    request = new XMLHttpRequest()
    request.open "GET", url, true
    request.responseType = "arraybuffer"

    request.onload = =>
      @audioBuffer = @audioContext.createBuffer request.response, false
      @finishLoad()

    request.send()

  finishLoad: ->
    @source.buffer = @audioBuffer;
    # @source.looping = true
    @source.noteOn 0.0

    @freqData = new Uint8Array @analyser.frequencyBinCount
    @timeData = new Uint8Array @analyser.frequencyBinCount

    @isPlaying = true
    @onFinishLoad() if @onFinishLoad?

  updateMaxMinFreqs: ->
    curMax = max @freqData
    @freqMax ?= curMax
    @freqMax = curMax if curMax > @freqMax

    curMin = min @freqData
    @freqMin ?= curMin
    @freqMin = curMin if curMin < @freqMin

    curGroupMax = max @freqGroups
    @groupMax ?= curGroupMax
    @groupMax = curGroupMax if curGroupMax > @groupMax

    curGroupMin = min @freqGroups
    @groupMin ?= curGroupMin
    @groupMin = curGroupMin if curGroupMin < @groupMin

  updateRelativeFreqs: ->
    self = this

    @relativeFreqs = []

    for amp in @freqData
      @relativeFreqs.push (map amp, self.freqMin, self.freqMax, 0, 1)

    @relativeFreqGroups = []

    for amp in @freqGroups
      @relativeFreqGroups.push (map amp, self.groupMin, self.groupMax, 0, 1)

  updateFreqGroups: ->
    nFreqs = @freqData.length

    nGroups = 4
  
    groups = []
    for n in [1..nGroups]
      groups.push []

    for amp, i in @freqData
      iGroup = Math.floor ((i/nFreqs)*nGroups)
      groups[iGroup].push amp

    @freqGroups = []

    for group in groups
      @freqGroups.push (mean group)

map = (value, inMin, inMax, outMin, outMax) ->
  outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin))

sum = (array) ->
  total = 0
  total += item for item in array
  return total

mean = (array) ->
  (sum array) / array.length

max = (array) ->
  Math.max array...

min = (array) ->
  Math.min array...

window.EasyEars = EasyEars