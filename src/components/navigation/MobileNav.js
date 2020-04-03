import React from "react";
import { Icon } from "semantic-ui-react";

const MobileNav = props => {
  const { activeView, setActiveView } = props;

  return (
    <nav className="mobileNav">
      <div
        className={`mobileNav_item ${activeView === "main" ? "active" : ""}`}
        onClick={() => setActiveView("main")}
      >
        <Icon name="arrow up" />
      </div>
      <div className="mobileNav_item" />
      <div className="mobileNav_item" />
      <div className="mobileNav_item" />

      <div
        className={`mobileNav_item ${activeView === "mods" ? "active" : ""}`}
        onClick={() => setActiveView("mods")}
      >
        <Icon name="sidebar" />
      </div>
    </nav>
  );
};

export default MobileNav;
