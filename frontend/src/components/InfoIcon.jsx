import React from 'react';

const InfoIcon = ({ tooltip }) => {
  return (
    <span className="tooltip-container">
      <svg 
        className="tooltip-icon" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        style={{ verticalAlign: 'middle', display: 'inline-block' }}
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span className="tooltip-box">{tooltip}</span>
    </span>
  );
};

export default InfoIcon;
