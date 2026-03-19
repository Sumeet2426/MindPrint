import React from "react";
import NeuralLoader from "./NeuralLoader";

export default function RouteLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 2000,
      }}
    >
      <NeuralLoader />
    </div>
  );
}
