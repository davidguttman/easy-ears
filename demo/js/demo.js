(function() {

  var codeExample, ears, hideHint, onSongLoad, draw, canvas, ctx;
  
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

  codeExample = document.getElementById('code_example');
  codeExample.value = draw.toString();
  codeExample.addEventListener('keyup', function(){
    try {
      draw = eval("draw = " + codeExample.value);  
    } catch(err) {
      // less good...
    }
    
  }, false)

  ears = new EasyEars({
    dropTarget: document
  }, function() {
    hideHint();
    onSongLoad();
  });

}).call(this);