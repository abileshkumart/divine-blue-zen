import React from "react";

interface MeditateIconProps {
  className?: string;
}

// Yoga meditation lotus pose icon
const MeditateIcon: React.FC<MeditateIconProps> = ({ className = "w-5 h-5" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Head */}
      <circle cx="12" cy="4" r="2" />
      {/* Body */}
      <path d="M12 6v4" />
      {/* Arms in namaste/meditation pose */}
      <path d="M9 9c-2 0-3.5 1-4.5 2" />
      <path d="M15 9c2 0 3.5 1 4.5 2" />
      {/* Crossed legs in lotus */}
      <ellipse cx="12" cy="16" rx="6" ry="3" />
      <path d="M6 16c1-2 3-3 6-3s5 1 6 3" />
    </svg>
  );
};

export default MeditateIcon;
