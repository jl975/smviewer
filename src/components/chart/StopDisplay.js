import React from 'react'
import { connect } from 'react-redux'

const StopDisplay = () => {
  return (
    <div className={`stop-display`}>
      <canvas id="stopReel" />
    </div>
  )
}

const mapStateToProps = (state) => {
  const { mods, songSelect } = state
  return { mods, songSelect }
}

export default connect(mapStateToProps, null)(StopDisplay)
