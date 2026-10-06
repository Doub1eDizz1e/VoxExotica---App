import React from 'react';

interface DemonicLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

/**
 * Demonic Face Logo incorporating two stylized letter "D"s.
 * The two mirrored "D"s (ᗡ and D) form the menacing cranial horns and cheek contours,
 * framing glowing demonic eyes, furrowed brow ridges, and underworld fangs.
 */
export const DemonicLogo: React.FC<DemonicLogoProps> = ({
  className = 'w-10 h-10',
  size = 40,
  glow = true,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="VoxExotica Demonic Double D Sigil"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full transition-transform duration-300 hover:scale-105 ${
          glow ? 'filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''
        }`}
      >
        <defs>
          {/* Demonic Flame & Metal Gradients */}
          <linearGradient id="demonHornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="45%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          <linearGradient id="demonDGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4444" />
            <stop offset="50%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>

          <linearGradient id="demonDGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff4444" />
            <stop offset="50%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>

          <linearGradient id="eyeGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>

          <filter id="demonicAura" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Demonic Face Shield / Chin */}
        <polygon
          points="50,96 26,72 22,46 50,56 78,46 74,72"
          fill="#1c0707"
          stroke="#991b1b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Central Crown / Forehead Crest */}
        <polygon
          points="50,14 44,38 50,45 56,38"
          fill="url(#demonHornGrad)"
          stroke="#fca5a5"
          strokeWidth="1.2"
        />

        {/* LEFT STYLIZED LETTER "D" (Facing left/mirrored ᗡ as left horn & cranial cheek) */}
        {/* Spine of the left 'D' at center x=45, curve arcing out to x=12 and looping up into horn */}
        <g id="letter-D-left">
          {/* The bold outline of the Left 'D' */}
          <path
            d="M 45 22 
               L 45 68 
               C 34 68 16 60 16 44 
               C 16 28 34 22 45 22 Z"
            fill="url(#demonDGradLeft)"
            stroke="#f87171"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Inner cutout hole of the Left 'D' creating the eye-socket brow */}
          <path
            d="M 41 30 
               L 41 60 
               C 32 60 23 54 23 44 
               C 23 34 32 30 41 30 Z"
            fill="#0f0202"
            stroke="#ef4444"
            strokeWidth="1.5"
          />
          {/* Top horn extension rising seamlessly from the outer curve of the Left 'D' */}
          <path
            d="M 16 44 
               C 14 30 18 16 8 8 
               C 18 14 26 24 30 30 Z"
            fill="url(#demonHornGrad)"
            stroke="#fca5a5"
            strokeWidth="1"
          />
        </g>

        {/* RIGHT STYLIZED LETTER "D" (Facing right 'D' as right horn & cranial cheek) */}
        {/* Spine of the right 'D' at center x=55, curve arcing out to x=88 and looping up into horn */}
        <g id="letter-D-right">
          {/* The bold outline of the Right 'D' */}
          <path
            d="M 55 22 
               L 55 68 
               C 66 68 84 60 84 44 
               C 84 28 66 22 55 22 Z"
            fill="url(#demonDGradRight)"
            stroke="#f87171"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Inner cutout hole of the Right 'D' creating the eye-socket brow */}
          <path
            d="M 59 30 
               L 59 60 
               C 68 60 77 54 77 44 
               C 77 34 68 30 59 30 Z"
            fill="#0f0202"
            stroke="#ef4444"
            strokeWidth="1.5"
          />
          {/* Top horn extension rising seamlessly from the outer curve of the Right 'D' */}
          <path
            d="M 84 44 
               C 86 30 82 16 92 8 
               C 82 14 74 24 70 30 Z"
            fill="url(#demonHornGrad)"
            stroke="#fca5a5"
            strokeWidth="1"
          />
        </g>

        {/* Sinister Demonic Glowing Eyes inside the D-inner chambers */}
        {/* Left Glowing Slit Eye */}
        <polygon
          points="31,43 39,40 37,47 28,48"
          fill="url(#eyeGlowGrad)"
          filter="url(#demonicAura)"
        />
        {/* Right Glowing Slit Eye */}
        <polygon
          points="69,43 61,40 63,47 72,48"
          fill="url(#eyeGlowGrad)"
          filter="url(#demonicAura)"
        />

        {/* Snarling Demonic Nose Bridge & Ridge */}
        <polygon
          points="50,47 46,57 50,60 54,57"
          fill="#450a0a"
          stroke="#dc2626"
          strokeWidth="1.2"
        />

        {/* Menacing Fangs & Mouth Ridge */}
        {/* Upper Jaw Ridge */}
        <path
          d="M 33 66 Q 50 62 67 66"
          stroke="#ef4444"
          strokeWidth="2"
          fill="none"
        />
        {/* Left Demon Fang */}
        <polygon
          points="37,66 42,66 39,78"
          fill="#fef2f2"
          stroke="#991b1b"
          strokeWidth="1"
        />
        {/* Center Demon Teeth */}
        <polygon points="46,65 50,65 48,72" fill="#fee2e2" />
        <polygon points="50,65 54,65 52,72" fill="#fee2e2" />
        {/* Right Demon Fang */}
        <polygon
          points="58,66 63,66 61,78"
          fill="#fef2f2"
          stroke="#991b1b"
          strokeWidth="1"
        />

        {/* Underworld Chin Spikes */}
        <polygon points="47,88 50,96 53,88" fill="#ef4444" />
      </svg>
    </div>
  );
};
