// src/components/WavesBackground.js
import React from "react";

export default function WavesBackground(){
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}>
      <svg style={{ width: "100%", height: "100%" }} preserveAspectRatio="none" viewBox="0 0 1440 600">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="#e6fbff" />
            <stop offset="1" stopColor="#f4f9ff" />
          </linearGradient>
        </defs>

        <path d="M0,160 C200,220 400,80 720,140 C1040,200 1240,60 1440,120 L1440,600 L0,600 Z"
          fill="url(#g1)" opacity="0.9">
          <animate attributeName="d" dur="12s" repeatCount="indefinite"
            values="
              M0,160 C200,220 400,80 720,140 C1040,200 1240,60 1440,120 L1440,600 L0,600 Z;
              M0,120 C220,160 420,40 720,120 C1020,200 1220,80 1440,140 L1440,600 L0,600 Z;
              M0,160 C200,220 400,80 720,140 C1040,200 1240,60 1440,120 L1440,600 L0,600 Z
            " />
        </path>
      </svg>
    </div>
  );
}
