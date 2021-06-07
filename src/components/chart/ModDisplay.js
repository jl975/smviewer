import React from 'react'

import { options } from '../../components/form/options'
import { getAssetPath } from '../../utils'

const icons = {}

icons['blank'] = new Image()
icons['blank'].src = getAssetPath(`mods/blank.png`)
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
icons['cut1'] = new Image()
icons['cut1'].src = getAssetPath(`mods/cut_on1.png`)
icons['cut2'] = new Image()
icons['cut2'].src = getAssetPath(`mods/cut_on2.png`)
icons['freezesOff'] = new Image()
icons['freezesOff'].src = getAssetPath(`mods/freeze_arrow_off.png`)
icons['jumpsOff'] = new Image()
icons['jumpsOff'].src = getAssetPath(`mods/jump_off.png`)

const ModDisplay = (props) => {
  const { mods } = props

  const renderSpeedMod = () => {
    if (mods.speed === 'cmod' || mods.speed === 'mmod') {
      return (
        <>
          <img src={icons['blank'].src} />
          <div className="custom-mod">
            {mods.speed === 'mmod' ? 'M' : 'C'}
            {mods.cmod}
          </div>
        </>
      )
    }
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

  const renderCutMod = () => {
    if (mods.cut === 'on1') {
      return <img src={icons['cut1'].src} />
    } else if (mods.cut === 'on2') {
      return <img src={icons['cut2'].src} />
    }
  }
  const renderFreezesMod = () => {
    if (mods.freezes === 'off') {
      return <img src={icons['freezesOff'].src} />
    }
    return null
  }
  const renderJumpsMod = () => {
    if (mods.jumps === 'off') {
      return <img src={icons['jumpsOff'].src} />
    }
    return null
  }

  return (
    <div className={`mod-display-container ${mods.scroll === 'reverse' ? 'reverse' : ''}`}>
      <div className="mods-list">
        <div className="mod-wrapper">{renderSpeedMod()}</div>
        <div className="mod-wrapper">{renderTurnMod()}</div>
        <div className="mod-wrapper">{renderCutMod()}</div>
        <div className="mod-wrapper">{renderFreezesMod()}</div>
        <div className="mod-wrapper">{renderJumpsMod()}</div>
      </div>
    </div>
  )
}

export default ModDisplay
