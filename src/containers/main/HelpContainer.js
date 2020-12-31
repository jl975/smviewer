import React from "react";
import { connect } from "react-redux";

const HelpContainer = (props) => {
  console.log("HelpContainer props", props);
  return <div className="help-container">Help</div>;
};

export default connect(null, null)(HelpContainer);
