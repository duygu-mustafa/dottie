import React from "react";
import { useLocation, NavLink } from "react-router-dom";

function PageNavigation({ selectedFile }) {
  const location = useLocation();
  return (
    <div className="page-navigation">
      <NavLink
        to={`/upload?file=${selectedFile}`}
        className={`circle ${location.pathname === "/" ? "active" : ""}`}
      >
        <span className="circle-label">Upload</span>
      </NavLink>
      <div className="line" />
      <NavLink
        to={`/files?file=${selectedFile}`}
        className={`circle ${location.pathname === "/files" ? "active" : ""}`}
      >
        <span className="circle-label">Files</span>
      </NavLink>
      <div className="line" />
      <NavLink
        to={`/preview?file=${selectedFile}`}
        className={`circle ${location.pathname === "/preview" ? "active" : ""}`}
      >
        <span className="circle-label">Preview</span>
      </NavLink>
      <div className="line" />
      <NavLink
        to={`/chart?file=${selectedFile}`}
        className={`circle ${location.pathname === "/chart" ? "active" : ""}`}
      >
        <span className="circle-label">Chart</span>
      </NavLink>
    </div>
  );
}

export default PageNavigation;
