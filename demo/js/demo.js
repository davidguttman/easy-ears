(function() {
  var ears;

  ears = new EasyEars({
    dropTarget: document
  }, function() {
    var animate, canvas, ctx, dragTarget, draw;
    canvas = document.getElementById('demo');
    dragTarget = document.getElementById('drag_here');
    dragTarget.style.display = 'none';
    ctx = canvas.getContext('2d');
    draw = function() {
      var w;
      ears.updateAudio(0.5);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(80,80,80)";
      w = Math.floor(canvas.width / 3);
      ctx.fillRect(0 * w, canvas.height, w, -canvas.height * ears.lows());
      ctx.fillRect(1 * w, canvas.height, w, -canvas.height * ears.mids());
      ctx.fillRect(2 * w, canvas.height, w, -canvas.height * ears.highs());
      return true;
    };
    animate = function() {
      requestAnimationFrame(animate);
      return draw();
    };
    return animate();
  });

}).call(this);
