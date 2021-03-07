import React, { useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { Button } from 'semantic-ui-react'

import { LANE_COVER_INCREMENT } from '../../constants'
import HoldButton from '../ui/HoldButton'
import { updateMods, updateLaneCoverHeight } from '../../actions/ModsActions'
import { getAssetPath } from '../../utils'

const CabButtons = (props) => {
  const { canvas, mods, updateMods, updateLaneCoverHeight } = props

  const laneCoverFn = useRef()

  const adjustLaneCoverHeight = (e) => {
    // if key pressed is up or down, prevent default behavior
    // ignore if key pressed is not up or down
    if (e.keyCode !== 38 && e.keyCode !== 40) return
    else {
      e.preventDefault()
    }

    // after preventing default behavior, ignore if no lane cover mod is being used
    if (!['hidden', 'sudden', 'hiddensudden'].includes(mods.appearance)) {
      return
    }

    // the following code will only run if a lane cover mod is being used
    // and if the key pressed was either up or down

    const { scroll } = mods

    const laneCoverHeightDiff = [0, 0, 0]

    const reverseFactor = scroll === 'reverse' ? -1 : 1

    // up key
    if (e.keyCode === 38) {
      switch (mods.appearance) {
        case 'hidden':
          laneCoverHeightDiff[0] -= LANE_COVER_INCREMENT * reverseFactor
          break
        case 'sudden':
          laneCoverHeightDiff[1] += LANE_COVER_INCREMENT * reverseFactor
          break
        case 'hiddensudden':
          laneCoverHeightDiff[2] += LANE_COVER_INCREMENT
          break
        default:
          break
      }
    }
    // down key
    else if (e.keyCode === 40) {
      switch (mods.appearance) {
        case 'hidden':
          laneCoverHeightDiff[0] += LANE_COVER_INCREMENT * reverseFactor
          break
        case 'sudden':
          laneCoverHeightDiff[1] -= LANE_COVER_INCREMENT * reverseFactor
          break
        case 'hiddensudden':
          laneCoverHeightDiff[2] -= LANE_COVER_INCREMENT
          break
        default:
          break
      }
    }

    updateLaneCoverHeight({
      diff: laneCoverHeightDiff,
      canvasHeight: canvas.height,
    })
  }

  const toggleLaneCover = (e) => {
    e.preventDefault()
    const { laneCoverVisible } = mods
    updateMods({ laneCoverVisible: !laneCoverVisible })
  }

  const updateLaneCoverFn = () => {
    document.removeEventListener('keydown', laneCoverFn.current)
    laneCoverFn.current = adjustLaneCoverHeight
    document.addEventListener('keydown', laneCoverFn.current)
  }

  useEffect(() => {
    updateLaneCoverFn()
  }, [mods.appearance, mods.scroll, mods.laneCoverHeight, canvas])

  return (
    <div className="cab-buttons-container">
      <HoldButton
        className="directional-button"
        onClick={(e) => {
          e.keyCode = 38
          adjustLaneCoverHeight(e)
        }}
      >
        <img src={getAssetPath(`directional_button.png`)} alt="up directional cab button" />
      </HoldButton>
      <Button
        className="center-button"
        onClick={(e) => {
          toggleLaneCover(e)
        }}
      >
        <img src={getAssetPath(`center_button.png`)} alt="center cab button" />
      </Button>
      <HoldButton
        className="directional-button"
        onClick={(e) => {
          e.keyCode = 40
          adjustLaneCoverHeight(e)
        }}
      >
        <img src={getAssetPath(`directional_button.png`)} alt="down directional cab button" />
      </HoldButton>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateMods: (mods) => dispatch(updateMods(mods)),
    updateLaneCoverHeight: (diff) => dispatch(updateLaneCoverHeight(diff)),
  }
}

export default connect(null, mapDispatchToProps)(CabButtons)
