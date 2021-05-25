export const getAudioTimeDisplay = (totalSeconds) => {
  let minutes = Math.floor(totalSeconds / 60).toString()
  let seconds = Math.floor(totalSeconds % 60).toString()
  if (seconds.length === 1) seconds = `0${seconds}`
  return `${minutes}:${seconds}`
}
