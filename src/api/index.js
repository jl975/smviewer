import axios from 'axios'

export const makeRequestToSongManager = (url, method = 'GET', data, params) => {
  if (process.env.NODE_ENV !== 'development') {
    console.error('Song Manager API can only be accessed in development mode.')
    return
  }
  const baseURL = 'api'
  const headers = {
    'content-type': 'application/json',
  }
  return axios({ baseURL, timeout: 10000, url, method, data, params, headers })
}

export const getFromSongManager = (path, params = {}) => {
  return makeRequestToSongManager(path, 'GET', null, params)
}

export const postToSongManager = (path, data) => {
  return makeRequestToSongManager(path, 'POST', data)
}

export const putToSongManager = (path, data) => {
  return makeRequestToSongManager(path, 'PUT', data)
}
