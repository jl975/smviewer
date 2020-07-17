// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const { fetchSongData } = require("../../lib/eagate");

export default async (req, res) => {
  // console.log(req);

  const { songId } = req.query;

  try {
    const data = await fetchSongData(songId);

    res.statusCode = 200;
    res.json(data);
  } catch (err) {
    res.send(err);
  }
};
