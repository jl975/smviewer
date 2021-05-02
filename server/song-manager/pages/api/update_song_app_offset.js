const { updateSongAppOffset } = require('../../lib/songs')

export default async (req, res) => {
  try {
    const { songId, offset } = req.body
    const data = await updateSongAppOffset(songId, offset)

    res.statusCode = 200
    res.json(data)
  } catch (err) {
    console.log(err)
    res.statusCode = 500
    res.send(err)
  }
}
