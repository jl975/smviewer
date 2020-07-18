import axios from "axios";

export default async (req, res) => {
  const { smUrl } = req.query;
  const { data } = await axios.get(smUrl);

  res.statusCode = 200;
  res.json(data);
};
