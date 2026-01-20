
import React from 'react';

interface HangmanDrawingProps {
  wrongGuesses: number;
}

const HangmanDrawing: React.FC<HangmanDrawingProps> = ({ wrongGuesses }) => {
  const strokeColor = "#f1f5f9"; // slate-100
  // Scaling up from the original 250x200 to 360x300
  const base = <line x1="15" y1="345" x2="285" y2="345" stroke={strokeColor} strokeWidth="6" />;
  const pillar = <line x1="75" y1="345" x2="75" y2="30" stroke={strokeColor} strokeWidth="6" />;
  const top = <line x1="75" y1="30" x2="210" y2="30" stroke={strokeColor} strokeWidth="6" />;
  const rope = <line x1="210" y1="30" x2="210" y2="75" stroke={strokeColor} strokeWidth="3" />;

  const head = <circle cx="210" cy="105" r="30" stroke={strokeColor} strokeWidth="6" fill="none" key="head" />;
  const body = <line x1="210" y1="135" x2="210" y2="225" stroke={strokeColor} strokeWidth="6" key="body" />;
  const leftArm = <line x1="210" y1="165" x2="165" y2="195" stroke={strokeColor} strokeWidth="6" key="leftArm" />;
  const rightArm = <line x1="210" y1="165" x2="255" y2="195" stroke={strokeColor} strokeWidth="6" key="rightArm" />;
  const leftLeg = <line x1="210" y1="225" x2="165" y2="285" stroke={strokeColor} strokeWidth="6" key="leftLeg" />;
  const rightLeg = <line x1="210" y1="225" x2="255" y2="285" stroke={strokeColor} strokeWidth="6" key="rightLeg" />;

  const bodyParts = [head, body, leftArm, rightArm, leftLeg, rightLeg];

  return (
    <div className="flex justify-center items-center py-8">
      <svg height="360" width="300" className="drop-shadow-2xl">
        {base}
        {pillar}
        {top}
        {rope}
        {bodyParts.slice(0, wrongGuesses)}
      </svg>
    </div>
  );
};

export default HangmanDrawing;
