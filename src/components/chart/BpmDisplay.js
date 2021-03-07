import React from 'react'
import { connect } from 'react-redux'

const BpmDisplay = () => {
  return (
    <div className={`bpm-display`}>
      <canvas id="bpmReel"></canvas>
      <div className={`current-bpm-container `}>
        <div className="current-bpm-wrapper">
          <div className="current-bpm-header">BPM</div>
          <div className="current-bpm-value"></div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  const { mods, songSelect } = state
  return { mods, songSelect }
}

export default connect(mapStateToProps, null)(BpmDisplay)
