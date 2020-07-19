const { updateSimfiles } = require("../../lib/songs");

export default async (req, res) => {
  console.log(req.body);

  try {
    const data = await updateSimfiles(req.body);

    res.statusCode = 200;
    res.json(data);
  } catch (err) {
    res.statusCode = 500;
    res.send(err);
  }
};
