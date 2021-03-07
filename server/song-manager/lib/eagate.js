const RequestPromise = require('request-promise')
const tough = require('tough-cookie')
const cheerio = require('cheerio')
const encoding = require('encoding-japanese')
const token573 = require('../../../config/m573ssid')
const { dancerId, dancerName } = require('../../../config/dancerIds')[0]

const { getSimfilesTsv } = require('./songs')

const createCookie = () => {
  return new tough.Cookie({
    key: 'M573SSID',
    value: token573,
    domain: 'p.eagate.573.jp',
    httpOnly: true,
    maxAge: 31536000,
  })
}
const cookie = createCookie()
const cookiejar = RequestPromise.jar()
cookiejar.setCookie(cookie.toString(), 'https://p.eagate.573.jp')

const fetchSongData = async (songId) => {
  let json = {}

  const songUrl = `/game/ddr/ddra20/p/playdata/music_detail.html?index=${songId}`

  let body = await RequestPromise({
    jar: cookiejar,
    uri: `https://p.eagate.573.jp${songUrl}`,
    encoding: null,
    headers: {
      Connection: 'keep-alive',
      'Accept-Encoding': '',
      'Accept-Language': 'en-US,en;q=0.8',
    },
  })
  const sjisArray = new Uint8Array(body)
  const unicodeArray = encoding.convert(sjisArray, {
    to: 'UNICODE',
    from: 'SJIS',
  })

  // Join to string.
  body = encoding.codeToString(unicodeArray)

  const $ = cheerio.load(body)

  const songDesc = $('#music_info td')[1]
  const title = songDesc.children[0].data
  const artist = songDesc.children[2].data

  const difficulties = []
  $('#single li.step')
    .children('img')
    .each((_, el) => {
      const src = el.attribs.src
      const level = /level_([0-9]*).png/.exec(src)[1]
      difficulties.push(level)
    })
  $('#double li.step')
    .children('img')
    .each((_, el) => {
      const src = el.attribs.src
      const level = /level_([0-9]*).png/.exec(src)[1]
      difficulties.push(level)
    })

  json = {
    title,
    artist,
    difficulties,
  }

  return json
}

let totalPages = 69 // temp number
let currentPage = 0

let songFound, followingSongFound
let orderedSongs = []

// find a song in the eagate song data table based on its id or title
// then figure out its alphabetical position by noting the songs right before and after it

const getSongPosition = async ({ title, id }) => {
  let parsedTsv = getSimfilesTsv()

  // parsedTsv = parsedTsv.map(({ index, hash, title, abcSort }) => {
  //   return { index, hash, title, abcSort };
  // });
  // console.log(parsedTsv);

  totalPages = 69
  currentPage = 0
  songFound = false
  followingSongFound = false
  orderedSongs = []

  console.log(`scraping ${dancerId} (${dancerName})`)
  while (currentPage < totalPages && !songFound && !followingSongFound) {
    console.log(`traversing page ${currentPage} of ${totalPages === 69 ? '?' : totalPages}`)
    await traversePage(currentPage, { title, id })
    currentPage++
  }

  if (songFound) {
    console.log('followingSongFound', followingSongFound)
    console.log('\nSong position:')

    let previousSong, actualSong

    // if followingSongFound is false, it means songFound is the last element in orderedSongs
    if (!followingSongFound) {
      console.log(orderedSongs[orderedSongs.length - 3].title)
      console.log(orderedSongs[orderedSongs.length - 2].title)
      console.log(orderedSongs[orderedSongs.length - 1].title, '***<-- the new song')
      previousSong = orderedSongs[orderedSongs.length - 2]
      actualSong = orderedSongs[orderedSongs.length - 1]
    }
    // otherwise, songFound is the second to last element in orderedSongs
    else {
      console.log(orderedSongs[orderedSongs.length - 3].title)
      console.log(orderedSongs[orderedSongs.length - 2].title, '***<-- the new song')
      console.log(orderedSongs[orderedSongs.length - 1].title)
      previousSong = orderedSongs[orderedSongs.length - 3]
      actualSong = orderedSongs[orderedSongs.length - 2]
    }

    console.log('\nDone. Please make sure the Title Sort field is correct if it was automatically filled out.\n')

    // const nextSong = orderedSongs[orderedSongs.length - 1];

    const abcSort = parsedTsv.find((song) => song.hash === previousSong.id).abcSort

    const json = {
      previousSongId: previousSong.id,
      previousSongTitle: previousSong.title,
      songId: actualSong.id,
      songTitle: actualSong.title,
      // nextSongId: nextSong.id,
      // nextSongTitle: nextSong.title,
      abcSort,
    }
    return json
  } else {
    console.log(`Song ${title || id} not found!`)
    throw new Error(`Song ${title || id} not found!`)
  }
}
const traversePage = async (pageIndex = 0, { title, id }) => {
  let body = await RequestPromise({
    jar: cookiejar,
    uri: `https://p.eagate.573.jp/game/ddr/ddra20/p/rival/rival_musicdata_single.html?offset=${pageIndex}&filter=0&filtertype=0&sorttype=0&rival_id=${dancerId}`,
    encoding: null,
    headers: {
      Connection: 'keep-alive',
      'Accept-Encoding': '',
      'Accept-Language': 'en-US,en;q=0.8',
    },
  })
  const sjisArray = new Uint8Array(body)
  const unicodeArray = encoding.convert(sjisArray, {
    to: 'UNICODE',
    from: 'SJIS',
  })

  // Join to string.
  body = encoding.codeToString(unicodeArray)

  const $ = cheerio.load(body)
  totalPages = $('.page_num').length

  const tableRows = $('tr.data')

  for (let i = 0; i < tableRows.length; i++) {
    const row = tableRows.eq(i)

    const songTd = row.children().eq(0)
    const songTitle = songTd.text()
    const pageHref = songTd.children('a').attr('href')
    const songId = /index=([0-9A-Za-z]+)/.exec(pageHref)[1]

    const songObj = { id: songId, title: songTitle }
    orderedSongs.push(songObj)

    console.log('checking', songTitle)

    // if song has already been found, this is the song right after it. done searching
    if (songFound) {
      followingSongFound = true
      break
    }

    // if this is the song we're looking for, go through one more iteration
    if (
      (id && id === songId) ||
      (title && title.toLowerCase().replace(/\s*/g, '') === songTitle.toLowerCase().replace(/\s*/g, ''))
    ) {
      songFound = true
    }
  }
}

module.exports = { fetchSongData, getSongPosition }
