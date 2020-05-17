import React from "react";

const ToggleSwitch = (props) => {
  const { option1, option2, value, disabled } = props;

  const toggleChange = () => {
    if (disabled || !option1 || !option2) return;

    if (value === option1.value) {
      props.onChange(option2.value);
    } else if (value === option2.value) {
      props.onChange(option1.value);
    }

    // default to option 1 if uninitialized
    else {
      props.onChange(option1.value);
    }
  };

  const selectOption = (option) => {
    if (disabled || !option || typeof option.value === "undefined") return;
    props.onChange(option.value);
  };

  const getSwitchClassName = () => {
    let className = "toggleSwitch";
    if (value === option1.value) className += ` left`;
    else if (value === option2.value) className += ` right`;
    return className;
  };

  return (
    <div className={`toggleSwitch-wrapper ${disabled ? "disabled" : ""}`}>
      <label
        className={`toggleSwitch-option1 ${
          value === option1.value ? "selected" : ""
        }`}
        onClick={() => selectOption(option1)}
      >
        {option1.text}
      </label>
      <div className={getSwitchClassName()} onClick={toggleChange}></div>
      <label
        className={`toggleSwitch-option2 ${
          value === option2.value ? "selected" : ""
        }`}
        onClick={() => selectOption(option2)}
      >
        {option2.text}
      </label>
    </div>
  );
};

export default ToggleSwitch;
