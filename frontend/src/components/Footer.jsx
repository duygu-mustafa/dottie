import React from "react";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const footerClass =
    location.pathname === "/" ? "footer-home" : "footer-other";

  return (
    <div className={`footer ${footerClass}`}>
      <p>&copy; {currentYear} Dottie Company</p>
    </div>
  );
};

export default Footer;
