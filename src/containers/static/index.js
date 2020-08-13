import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { getSimfileList, loadSimfile } from "../../actions/SimfileActions";

const StaticViewContainer = props => {
  const [songId, setSongId] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  console.log("StaticViewContainer props", props);

  useEffect(() => {
    const init = async () => {
      if (!props.simfileList.length) {
        console.log("loading simfileList");
        await props.getSimfileList();
      }
    };
    init();
  }, []);

  useEffect(() => {
    const params = props.location.search
      .slice(1)
      .split("&")
      .map(param => {
        const [key, value] = param.split("=");
        return { [key]: value };
      });
    console.log(params);
  }, [props.location.search]);

  return <div>cool</div>;
};

const mapStateToProps = state => {
  const { simfiles, songSelect } = state;
  const { sm, simfileList } = simfiles;
  const { song, difficulty, mode } = songSelect;
  return {
    simfileList,
    sm,
    song,
    difficulty,
    mode
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getSimfileList: () => dispatch(getSimfileList()),
    loadSimfile: song => dispatch(loadSimfile(song))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StaticViewContainer);
