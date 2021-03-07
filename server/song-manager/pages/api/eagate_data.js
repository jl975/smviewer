// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const { fetchSongData } = require('../../lib/eagate')

export default async (req, res) => {
  const { songId } = req.query

  try {
    const data = await fetchSongData(songId)

    res.statusCode = 200
    res.json(data)
  } catch (err) {
    console.log(err)
    res.statusCode = 500
    res.send(err)
  }
}
