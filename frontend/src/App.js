import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Homepage from "./components/Homepage";
import Upload from "./components/Upload";
import Preview from "./components/Preview";
import Chart from "./components/Chart";
import Files from "./components/Files";

function App() {
  const location = useLocation();
  let className =
    location.pathname === "/" ? "main-container home" : "main-container";

  return (
    <div className={className}>
      <NavBar />
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/chart" element={<Chart />} />
          <Route path="/files" element={<Files />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
