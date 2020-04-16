import React, { useEffect, useRef } from "react";
import { Button } from "semantic-ui-react";

const HoldButton = (props) => {
  const button = useRef();
  const requestRef = useRef();

  useEffect(() => {
    const el = button.current.ref.current;
    el.addEventListener("mousedown", pressingDown, false);
    el.addEventListener("mouseup", notPressingDown, false);
    el.addEventListener("mouseleave", notPressingDown, false);

    el.addEventListener("touchstart", pressingDown, false);
    el.addEventListener("touchend", notPressingDown, false);
  }, []);

  const pressingDown = (e) => {
    e.preventDefault();
    if (props.onClick) {
      props.onClick();
    }
    requestRef.current = requestAnimationFrame(handleHold);
  };

  const notPressingDown = (e) => {
    cancelAnimationFrame(requestRef.current);
  };

  const handleHold = () => {
    if (props.onClick) {
      props.onClick();
    }
    requestRef.current = requestAnimationFrame(handleHold);
  };

  return (
    <Button {...props} ref={button}>
      {props.children}
    </Button>
  );
};

export default HoldButton;
