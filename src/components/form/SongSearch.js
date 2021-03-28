import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import escapeRegExp from 'lodash/escapeRegExp'

const SongSearch = (props) => {
  const { selectedSongOption, onSongSelect, simfileOptions } = props

  const handleSearch = (options, searchQuery) => {
    const re = new RegExp(escapeRegExp(searchQuery), 'i')

    return options.filter((song) => {
      return re.test(song.text) || re.test(song.description)
    })
  }

  return (
    <Dropdown
      placeholder="Choose a song"
      className="song-title-search"
      search={handleSearch}
      selection
      value={selectedSongOption}
      onChange={(_, data) => onSongSelect(data.value)}
      options={simfileOptions}
      selectOnBlur={false}
      selectOnNavigation={false}
      upward={false}
    />
  )
}

export default SongSearch
