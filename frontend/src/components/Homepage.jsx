import React from "react";
import { useNavigate } from "react-router-dom";
import Particle from "./Particle";
import logo from "../assets/Dottie_Logo.png";

function Homepage() {
  const navigate = useNavigate();
  const handleButtonClick = () => {
    navigate("/upload");
  };
  return (
    <div className="homepage">
      <img className="homepage-logo" src={logo} alt="Logo" />
      <Particle />
      <button
        className="homepage-btn btn btn-outline-light"
        onClick={handleButtonClick}
      >
        Get Started
      </button>
    </div>
  );
}

export default Homepage;
