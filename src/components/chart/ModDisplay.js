import React from 'react'

import { options } from '../../components/form/options'
import { getAssetPath } from '../../utils'

const icons = {}

options.mods.speed.forEach((speedMod) => {
  const imageName = `speed_x${speedMod.toString().replace('.', '_')}`
  icons[speedMod] = new Image()
  icons[speedMod].src = getAssetPath(`mods/${imageName}.png`)
})
options.mods.turn.forEach((turnMod) => {
  if (turnMod === 'off') return
  const imageName = `turn_${turnMod}`
  icons[turnMod] = new Image()
  icons[turnMod].src = getAssetPath(`mods/${imageName}.png`)
})

const ModDisplay = (props) => {
  const { mods } = props
  console.log(mods)

  const renderSpeedMod = () => {
    if (!mods.speed || isNaN(mods.speed)) {
      return null
    }
    return <img src={icons[mods.speed].src} />
  }

  const renderTurnMod = () => {
    if (!mods.turn || mods.turn === 'off') {
      return null
    }
    return <img src={icons[mods.turn].src} />
  }

  return (
    <div className="mod-display-container">
      <div className="mods-list">
        <div className="mod-wrapper">{renderSpeedMod()}</div>
        <div className="mod-wrapper">{renderTurnMod()}</div>
      </div>
    </div>
  )
}

export default ModDisplay
