const RequestPromise = require("request-promise");
const tough = require("tough-cookie");
const cheerio = require("cheerio");
const encoding = require("encoding-japanese");
const token573 = require("../../../config/m573ssid");

const createCookie = () => {
  return new tough.Cookie({
    key: "M573SSID",
    value: token573,
    domain: "p.eagate.573.jp",
    httpOnly: true,
    maxAge: 31536000,
  });
};
const cookie = createCookie();
const cookiejar = RequestPromise.jar();
cookiejar.setCookie(cookie.toString(), "https://p.eagate.573.jp");

const fetchSongData = async (songId) => {
  let json = {};

  const songUrl = `/game/ddr/ddra20/p/playdata/music_detail.html?index=${songId}`;

  let body = await RequestPromise({
    jar: cookiejar,
    uri: `https://p.eagate.573.jp${songUrl}`,
    encoding: null,
    headers: {
      Connection: "keep-alive",
      "Accept-Encoding": "",
      "Accept-Language": "en-US,en;q=0.8",
    },
  });
  const sjisArray = new Uint8Array(body);
  const unicodeArray = encoding.convert(sjisArray, {
    to: "UNICODE",
    from: "SJIS",
  });

  // Join to string.
  body = encoding.codeToString(unicodeArray);

  const $ = cheerio.load(body);

  const songDesc = $("#music_info td")[1];
  const title = songDesc.children[0].data;
  const artist = songDesc.children[2].data;

  const difficulties = [];
  $("#single li.step")
    .children("img")
    .each((_, el) => {
      const src = el.attribs.src;
      const level = /level_([0-9]*).png/.exec(src)[1];
      difficulties.push(level);
    });
  $("#double li.step")
    .children("img")
    .each((_, el) => {
      const src = el.attribs.src;
      const level = /level_([0-9]*).png/.exec(src)[1];
      difficulties.push(level);
    });

  json = {
    title,
    artist,
    difficulties,
  };

  return json;
};

module.exports = { fetchSongData };
