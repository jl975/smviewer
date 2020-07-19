const { addSimfile } = require("../../lib/songs");

export default async (req, res) => {
  try {
    const data = await addSimfile(req.body);

    res.statusCode = 200;
    res.json(data);
  } catch (err) {
    res.statusCode = 500;
    res.send(err);
  }
};
