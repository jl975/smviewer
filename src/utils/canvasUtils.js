const tempCanvas = document.createElement('canvas')
const tctx = tempCanvas.getContext('2d')

export const scaleCanvas = (canvas, scaleFactor) => {
  const cw = canvas.width
  const ch = canvas.height
  tempCanvas.width = cw
  tempCanvas.height = ch
  tctx.drawImage(canvas, 0, 0)
  canvas.width *= scaleFactor
  canvas.height *= scaleFactor
  const c = canvas.getContext('2d')
  c.drawImage(tempCanvas, 0, 0, cw, ch, 0, 0, cw * scaleFactor, ch * scaleFactor)
}
