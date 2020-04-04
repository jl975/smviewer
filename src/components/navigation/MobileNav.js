import React from "react";
import { Icon } from "semantic-ui-react";

const MobileNav = (props) => {
  const { activeView, setActiveView } = props;

  const navItems = [
    { view: "main", icon: "arrow up" },
    { view: "song", icon: "music" },
    { view: "2", icon: "" },
    { view: "3", icon: "" },
    { view: "mods", icon: "sidebar" },
  ];

  return (
    <nav className="mobileNav">
      {navItems.map((navItem) => {
        const { view, icon } = navItem;
        if (!view) return <div className="mobileNav_item" />;
        return (
          <div
            key={`mobileNavItem_${view}`}
            className={`mobileNav_item ${activeView === view ? "active" : ""}`}
            onClick={() => setActiveView(view)}
          >
            <Icon name={icon} />
          </div>
        );
      })}
      {/* <div
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
      </div> */}
    </nav>
  );
};

export default MobileNav;
