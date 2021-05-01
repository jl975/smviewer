import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Radio, Checkbox, Input } from 'semantic-ui-react'

import { options } from './options'
import { SP_DIFFICULTIES, DEFAULT_CMOD } from '../../constants'
import { capitalize, renderWithSign } from '../../utils'
import { updateMods } from '../../actions/ModsActions'
import { setModalOpen } from '../../actions/ScreenActions'
import { updateSongAppOffset } from '../../actions/SongSelectActions'
import AudioPlayer from '../../core/AudioPlayer'

const ModsForm = (props) => {
  const { mods, updateMods, mode, song, difficulty } = props

  // // when switching between single and double, any mod set to a value incompatible
  // // with the new mode will be reset to its default value
  // useEffect(() => {
  //   if (mode === "double" && !["off", "mirror"].includes(mods.turn)) {
  //     updateMods({ turn: "off" });
  //   }
  // }, [mode]);

  // temp UX improvement (?)
  // revert any applied turn mods to normal turn when the chart is changed
  useEffect(() => {
    // console.log("mode, song, or difficulty changed");
    updateMods({ turn: 'off' })
  }, [mode, song, difficulty])

  const getEffectiveScrollSpeed = () => {
    if (!song) return null

    const cmodValue = isNaN(mods.cmod) || mods.cmod < 100 || mods.cmod > 1000 ? DEFAULT_CMOD : mods.cmod

    const rate = mods.rate || 1

    if (mods.speed === 'cmod') {
      return <strong>{Math.round(cmodValue * rate)}</strong>
    }

    let displayBpm = song.displayBpm
    if (displayBpm.includes(',')) {
      let difficultyIdx = SP_DIFFICULTIES.indexOf(difficulty)
      if (mode === 'double') difficultyIdx += 4
      displayBpm = displayBpm.split(',')[difficultyIdx]
    }

    const [lowBpm, highBpm] = displayBpm.split('-')
    if (!highBpm) {
      const scrollSpeed = mods.speed === 'mmod' ? cmodValue : Math.round(lowBpm * mods.speed)
      return <strong>{Math.round(scrollSpeed * rate)}</strong>
    } else {
      let lowScrollSpeed, highScrollSpeed
      if (mods.speed === 'mmod') {
        highScrollSpeed = cmodValue
        lowScrollSpeed = (lowBpm / highBpm) * cmodValue
      } else {
        lowScrollSpeed = lowBpm * mods.speed
        highScrollSpeed = highBpm * mods.speed
      }
      return <strong>{`${Math.round(lowScrollSpeed * rate)} - ${Math.round(highScrollSpeed * rate)}`}</strong>
    }
  }

  const resetCmodIfInvalid = (e) => {
    const fieldValue = e.target.value
    if (!fieldValue || parseInt(fieldValue) < 100 || parseInt(fieldValue) > 1000) {
      updateMods({ cmod: DEFAULT_CMOD })
    }
  }

  const handleSongAppOffsetChange = async (newOffset) => {
    console.log('newOffset', newOffset)
    await props.updateSongAppOffset(newOffset)
    AudioPlayer.resync()
  }

  return (
    <div className={`view-section modsView ${props.activeView === 'mods' ? 'active' : ''}`}>
      <div className="view-wrapper">
        <form className="modsForm" onSubmit={(e) => e.preventDefault()}>
          <div className="form-field">
            <h4 className="form-label">
              Speed
              {song && (
                <span className="form-sublabel">
                  (Effective scroll speed: <strong>{getEffectiveScrollSpeed()}</strong>)
                </span>
              )}
            </h4>
            {options.mods.speed.map((speed) => {
              return (
                <Radio
                  key={`speed_${speed}`}
                  label={`${speed}x`}
                  name="speed"
                  value={speed}
                  checked={mods.speed === speed}
                  onChange={() => updateMods({ speed })}
                />
              )
            })}
            <div>
              <Radio
                key="speed_cmod"
                label="Cmod"
                name="speed"
                value="cmod"
                checked={mods.speed === 'cmod'}
                onChange={() => updateMods({ speed: 'cmod' })}
              />
              <Radio
                key="speed_mmod"
                label="Mmod"
                name="speed"
                value="mmod"
                checked={mods.speed === 'mmod'}
                onChange={() => updateMods({ speed: 'mmod' })}
              />
              <Input
                type="number"
                disabled={mods.speed !== 'cmod' && mods.speed !== 'mmod'}
                min={100}
                max={1000}
                name="cmod"
                value={mods.cmod}
                onChange={(_, data) => updateMods({ cmod: data.value })}
                onBlur={resetCmodIfInvalid}
              />
            </div>
            <small>(Valid range: 100-1000)</small>
          </div>

          <div className="form-field">
            <h4 className="form-label">Rate</h4>
            {options.mods.rate.map((rate) => {
              return (
                <Radio
                  key={`rate_${rate}`}
                  label={`${rate}x`}
                  name="rate"
                  value={rate}
                  checked={mods.rate === rate}
                  onChange={() => updateMods({ rate })}
                />
              )
            })}
          </div>

          <div className="form-field">
            <h4 className="form-label">Appearance</h4>
            {options.mods.appearance.map((appearance, i) => {
              return (
                <Radio
                  key={`appearance_${appearance}`}
                  label={['Visible', 'Hidden+', 'Sudden+', 'Hidden+ / Sudden+', 'Stealth'][i]}
                  name="appearance"
                  value={appearance}
                  checked={mods.appearance === appearance}
                  onChange={() => updateMods({ appearance })}
                />
              )
            })}
          </div>

          <div className="form-field">
            <h4 className="form-label">Arrow color</h4>
            {options.mods.noteColor.map((noteColor) => {
              return (
                <Radio
                  key={`noteColor_${noteColor}`}
                  label={capitalize(noteColor)}
                  name="noteColor"
                  value={noteColor}
                  checked={mods.noteColor === noteColor}
                  onChange={() => updateMods({ noteColor })}
                />
              )
            })}
          </div>

          <div className="form-field">
            <h4 className="form-label">Arrow shape</h4>
            {options.mods.noteShape.map((noteShape) => {
              return (
                <Radio
                  key={`noteShape_${noteShape}`}
                  label={capitalize(noteShape)}
                  name="noteShape"
                  value={noteShape}
                  checked={mods.noteShape === noteShape}
                  onChange={() => updateMods({ noteShape })}
                />
              )
            })}
          </div>

          <div className="form-field">
            <h4 className="form-label">Turn</h4>
            {options.mods.turn
              .filter((turn) => {
                if (mode === 'double') return turn === 'off' || turn === 'mirror'
                return true
              })
              .map((turn) => {
                return (
                  <Radio
                    key={`turn_${turn}`}
                    label={capitalize(turn)}
                    name="turn"
                    value={turn}
                    checked={mods.turn === turn}
                    onChange={() => updateMods({ turn })}
                  />
                )
              })}
          </div>
          {mods.turn === 'shuffle' && (
            <div className="form-field">
              <h4 className="form-label">
                Shuffle pattern
                <span className="form-sublabel">(compare to original LDUR)</span>
              </h4>
              {options.mods.shuffle.map((shuffle, i) => {
                return (
                  <Radio
                    key={`shuffle_${shuffle}`}
                    label={['LRDU', 'UDRL', 'LRUD', 'DURL', 'DLUR', 'DULR', 'RLUD', 'RULD'][i]}
                    name="shuffle"
                    value={shuffle}
                    checked={mods.shuffle === shuffle}
                    onChange={() => updateMods({ shuffle })}
                  />
                )
              })}
            </div>
          )}

          <div className="form-field">
            <h4 className="form-label">Step zone</h4>
            {options.mods.stepZone.map((stepZone) => {
              return (
                <Radio
                  key={`stepZone_${stepZone}`}
                  label={capitalize(stepZone)}
                  name="stepZone"
                  value={stepZone}
                  checked={mods.stepZone === stepZone}
                  onChange={() => updateMods({ stepZone })}
                />
              )
            })}
          </div>

          <div className="form-field">
            <h4 className="form-label">Scroll</h4>
            {options.mods.scroll.map((scroll) => {
              return (
                <Radio
                  key={`scroll_${scroll}`}
                  label={capitalize(scroll)}
                  name="scroll"
                  value={scroll}
                  checked={mods.scroll === scroll}
                  onChange={() => updateMods({ scroll })}
                />
              )
            })}
          </div>

          <div className="form-field">
            <h4 className="form-label">Combo display</h4>
            {options.mods.comboDisplay.map((comboDisplay, i) => {
              return (
                <Radio
                  key={`comboDisplay_${comboDisplay}`}
                  label={['Behind arrows', 'In front of arrows', 'Hidden'][i]}
                  name="comboDisplay"
                  value={comboDisplay}
                  checked={mods.comboDisplay === comboDisplay}
                  onChange={() => updateMods({ comboDisplay })}
                />
              )
            })}
          </div>

          <div className="form-field">
            <h4 className="form-label">Combo font</h4>
            {options.mods.comboFont.map((comboFont) => {
              return (
                <Radio
                  key={`comboFont_${comboFont}`}
                  label={comboFont}
                  name="comboFont"
                  value={comboFont}
                  checked={mods.comboFont === comboFont}
                  onChange={() => updateMods({ comboFont })}
                />
              )
            })}
          </div>

          <h4>Miscellaneous</h4>
          <div className="form-field">
            <Checkbox
              toggle
              label="Guidelines"
              name="guidelines"
              checked={mods.guidelines}
              onChange={() => updateMods({ guidelines: !mods.guidelines })}
            />
          </div>
          <div className="form-field">
            <Checkbox
              toggle
              label="Color freeze heads"
              name="colorFreezes"
              checked={mods.colorFreezes}
              onChange={() => updateMods({ colorFreezes: !mods.colorFreezes })}
            />
          </div>
          <div className="form-field">
            <Checkbox
              toggle
              label="Scrolling BPM/stop values"
              name="bpmStopDisplay"
              checked={mods.bpmStopDisplay}
              onChange={() => updateMods({ bpmStopDisplay: !mods.bpmStopDisplay })}
            />
          </div>
          <div className="form-field">
            <button type="button" className="link-button" onClick={() => props.setModalOpen('offset', true)}>
              Set global offset
            </button>
          </div>

          {/* for admin use only; app-adjusted offset */}
          <div className="form-field">
            <h4 className="form-label">App-adjusted offset</h4>
            <Input
              type="range"
              min="-0.20"
              max="0.20"
              step="0.01"
              onChange={(_, data) => {
                handleSongAppOffsetChange(parseFloat(data.value))
              }}
            />
            <span>{song && renderWithSign(song.appOffset || 0, 2)}</span>
          </div>
        </form>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  const { mods, songSelect, screen } = state
  return {
    mods,
    mode: songSelect.mode,
    song: songSelect.song,
    difficulty: songSelect.difficulty,
    activeView: screen.activeView,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateMods: (mods) => dispatch(updateMods(mods)),
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
    updateSongAppOffset: (offset) => dispatch(updateSongAppOffset(offset)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModsForm)
