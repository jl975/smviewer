import React from 'react'
import { connect } from 'react-redux'

const LogView = (props) => {
  return (
    <div
      className={`view-section logView1
    ${props.activeView === 'logView1' ? 'active' : ''}`}
    >
      <div className="view-wrapper">
        <pre id="logView1">test debug log</pre>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  const { screen } = state
  return {
    activeView: screen.activeView,
  }
}

export default connect(mapStateToProps, null)(LogView)
