import React from "react";
import "./loader.css";

export default function Loader() {
  return (
    <div className="loader-container bg-transparent">
      <div className="spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
