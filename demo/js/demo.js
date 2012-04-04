(function() {

  var codeExample, ears, hideHint, onSongLoad, unwrapJS, draw, canvas, ctx;
  
  canvas = document.getElementById('demo');
  ctx = canvas.getContext('2d');

  draw = function() {
    var w = Math.floor(canvas.width / 3);
    
    ears.updateAudio(0.5);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(80,80,80)";
    
    ctx.fillRect(0 * w, canvas.height, w, -canvas.height * ears.lows());
    ctx.fillRect(1 * w, canvas.height, w, -canvas.height * ears.mids());
    ctx.fillRect(2 * w, canvas.height, w, -canvas.height * ears.highs());
  };

  onSongLoad = function() {
    
    var animate = function() {
      requestAnimationFrame(animate);
      try {
        draw();  
      } catch(err) {
        // didn't work...
      }
      
    };
    
    animate();
  };

  hideHint = function() {
    var dragTarget = document.getElementById('drag_here');
    dragTarget.style.display = 'none';
  };

  unwrapJS = function(js) {
    var split = js.split("\n"),
        unwrappedSplit = split.slice(1, split.length-1),
        unwrappedSplitDespaced = unwrappedSplit.map(function(line){return line.replace(/^\s+/,'')}),
        unwrapped = unwrappedSplitDespaced.join("\n");

    return unwrapped;
  };

  codeExample = document.getElementById('code_example');
  codeExample.value = unwrapJS(draw.toString());

  var useNewCode = function(mirror) {
    console.log(mirror);
    try {
      eval("draw = function(){" + mirror.getValue() + "}");  
    } catch(err) {
      // less good...
    }
  };

  var mirror = CodeMirror.fromTextArea(codeExample, {
    onChange: useNewCode,
    theme: 'lesser-dark',
    autofocus: true
  });

  codeExample.addEventListener('keyup', function(){
    useNewCode();
    
  }, false)

  ears = new EasyEars({
    dropTarget: document
  }, function() {
    hideHint();
    onSongLoad();
  });

}).call(this);
