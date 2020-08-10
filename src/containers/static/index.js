import React, { useState, useEffect } from "react";

const StaticViewContainer = props => {
  const [songId, setSongId] = useState(null);

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

export default StaticViewContainer;
