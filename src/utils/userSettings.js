export const getUserSettings = () => {
  try {
    const settings = window.localStorage.getItem('userSettings')
    if (settings) {
      return JSON.parse(settings)
    }
    return {}
  } catch (err) {
    console.error(err)
    return {}
  }
}

export const updateUserSettings = (newSettings) => {
  let settings = window.localStorage.getItem('userSettings')
  try {
    if (settings) {
      settings = JSON.parse(settings)
    } else {
      settings = {}
    }
  } catch (err) {
    console.error(err)
  }

  Object.keys(newSettings).forEach((key) => {
    settings[key] = newSettings[key]
  })

  console.log('user settings updated to', settings)

  window.localStorage.setItem('userSettings', JSON.stringify(settings))
}

export const getSavedSongProgress = () => {
  return window.localStorage.getItem('progress') || 0
}

export const saveSongProgress = (progress) => {
  window.localStorage.setItem('progress', progress)
}
