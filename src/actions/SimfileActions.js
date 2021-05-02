import { tsv } from 'd3-fetch'

import { getOriginPath, fetchDocument } from '../utils'
import loadStore from '../utils/loadStore'

export const GET_SIMFILE_LIST = 'GET_SIMFILE_LIST'
export const LOAD_SIMFILE = 'LOAD_SIMFILE'

export const getSimfileList = () => async (dispatch) => {
  const parsedTsv = await tsv(getOriginPath() + 'data/simfiles.tsv')

  parsedTsv.forEach((row) => {
    row.levels = row.levels.split(',').map((level) => (level ? parseInt(level) : null))
    if (row.missingDifficulties) {
      row.missingDifficulties = row.missingDifficulties.split(',').map((level) => parseInt(level))
    } else {
      row.missingDifficulties = []
    }
    if (row.appOffset) {
      row.appOffset = parseFloat(row.appOffset)
    } else {
      row.appOffset = 0
    }
  })

  dispatch({
    type: GET_SIMFILE_LIST,
    payload: parsedTsv,
  })
}

export const loadSimfile = (song) => async (dispatch) => {
  let smName = song.smName

  // special case for tohoku evolved: pick one of its types at random
  if (song.hash === 'OddDoQ6dqi0QdQDDOO6qlO08d8bPbli1') {
    smName = smName.replace('1', Math.floor(Math.random() * 4) + 1)
  }

  try {
    // Immediately update the value of "last requested song"
    // Any pending requests that finish before the last song is loaded will be ignored
    loadStore.lastRequestedSong = song.title
    const sm = await fetchDocument(
      `${getOriginPath()}simfiles/${encodeURIComponent(smName)}.${song.useSsc ? 'ssc' : 'sm'}`
    )

    // User might try to select a new song before the simfile is fetched.
    // Only process simfile if this is the last song that was selected
    if (loadStore.lastRequestedSong === song.title) {
      dispatch({
        type: LOAD_SIMFILE,
        payload: sm,
      })
    }
  } catch (error) {
    alert(`Song ${song.title} failed to load`, error)
    throw error
  }
}
