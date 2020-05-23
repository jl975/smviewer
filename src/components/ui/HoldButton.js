import React, { useEffect, useRef } from "react";
import { Button } from "semantic-ui-react";

const HoldButton = (props) => {
  const button = useRef();
  const requestRef = useRef();

  const pressingDownRef = useRef();
  const notPressingDownRef = useRef();

  const buttonProps = { ...props };
  delete buttonProps.onClick; // to avoid having the button invoke onClick an extra time

  useEffect(() => {
    const el = button.current.ref.current;
    el.removeEventListener("mousedown", pressingDownRef.current, false);
    el.removeEventListener("mouseup", notPressingDownRef.current, false);
    el.removeEventListener("mouseleave", notPressingDownRef.current, false);

    el.removeEventListener("touchstart", pressingDownRef.current, false);
    el.removeEventListener("touchend", notPressingDownRef.current, false);

    pressingDownRef.current = pressingDown;
    notPressingDownRef.current = notPressingDown;

    el.addEventListener("mousedown", pressingDownRef.current, false);
    el.addEventListener("mouseup", notPressingDownRef.current, false);
    el.addEventListener("mouseleave", notPressingDownRef.current, false);

    el.addEventListener("touchstart", pressingDownRef.current, false);
    el.addEventListener("touchend", notPressingDownRef.current, false);
  }, [props.onClick]);

  const pressingDown = (e) => {
    e.preventDefault();
    if (props.onClick) {
      props.onClick(e);
    }
    requestRef.current = requestAnimationFrame(handleHold.bind(null, e));
  };

  const notPressingDown = (e) => {
    e.preventDefault();
    cancelAnimationFrame(requestRef.current);
  };

  const handleHold = (e) => {
    if (props.onClick) {
      props.onClick(e);
    }
    requestRef.current = requestAnimationFrame(handleHold.bind(null, e));
  };

  return (
    <Button {...buttonProps} ref={button}>
      {props.children}
    </Button>
  );
};

export default HoldButton;
