// Button.tsx
import React from 'react';

 import {ButtonProps} from "../types/index"


const Button: React.FC<ButtonProps> = ({
  onClick,
  text,
  backgroundColor = 'white',
  textColor = 'slate-900',
  borderColor = 'slate-300',
  hoverBackgroundColor = 'white',
  hoverTextColor = 'primary',
  icon, 
  type,
  disabled
}) => {
  return (
    <button
    disabled={disabled} 
    type={type}
      onClick={onClick}
      className={`bg-${backgroundColor} border-2 border-${borderColor} text-${textColor} hover:bg-${hoverBackgroundColor} hover:text-${hoverTextColor} hover:cursor-pointer flex items-center p-2 rounded`}
    >
      {icon && <span className="mr-2">{icon}</span>} 
      {text}
    </button>
  );
};

export default Button;
