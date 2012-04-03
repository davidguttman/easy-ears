onSongLoad = ->
  canvas = document.getElementById 'demo'
  ctx = canvas.getContext '2d'

  draw = ->
    ears.updateAudio 0.5
    ctx.clearRect 0, 0, canvas.width, canvas.height
    
    ctx.fillStyle = "rgb(80,80,80)"

    w = Math.floor (canvas.width/3)
    ctx.fillRect 0*w, canvas.height, w, -canvas.height * ears.lows()
    ctx.fillRect 1*w, canvas.height, w, -canvas.height * ears.mids()
    ctx.fillRect 2*w, canvas.height, w, -canvas.height * ears.highs()
    return true

  animate = ->
    requestAnimationFrame animate
    draw()

  animate()

hideHint = ->
  dragTarget = document.getElementById 'drag_here'
  dragTarget.style.display = 'none'

codeExample = document.getElementById 'code_example'
codeExample.value = onSongLoad.toString()

ears = new EasyEars dropTarget: document, ->
  hideHint()
  onSongLoad()