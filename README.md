# EasyEars.js #

Easy sound reactivity for Chrome (and Safari nightly?).

[Demo page](http://davidguttman.github.com/easy-ears/)

## Getting Started ##

First, get the code.

Second, create a new instance of EasyEars with the form:

    new EasyEars(options, completeCallback);

Here are some examples:

    // Create a new ears instance that will use a DOM
    // element as a target for drag and dropped .mp3
    ears = new EasyEars({dropTarget: document}, function(){
      console.log('song loaded!');
    });
    
    // or...

    // Create one that will use an mp3 from a url
    ears = new EasyEars({url: '/mp3/a_song.mp3'});

To use it, first update the audio using <code>updateAudio(timeSmoothing)</code>. Where <code>timeSmoothing</code> is a value between 0.0 and 1.0.

Next, use <code>ears.lows()</code>, <code>ears.mids()</code>, and <code>ears.highs()</code> to get sound data back from EasyEars. These values will always be between 0.0 and 1.0.

Usage Examples:

    var animate = function() {
      webkitRequestAnimationFrame(animate);
      
      // call updateAudio periodically to get latest sound data
      ears.updateAudio(0.5);

      // use the following methods to get sound data,
      // each will return a value between 0.0 and 1.0
      ears.lows();
      ears.mids();
      ears.highs();
    }
