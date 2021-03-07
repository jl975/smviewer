const { getSongPosition } = require('../../lib/eagate')

export default async (req, res) => {
  const { title, id } = req.query

  try {
    const data = await getSongPosition({ title, id })

    res.statusCode = 200
    res.json(data)
  } catch (err) {
    console.log(err)
    res.statusCode = 500
    res.send(err)
  }
}
