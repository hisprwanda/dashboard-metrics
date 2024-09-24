// Button.tsx
import React from 'react';

export interface ButtonProps {
    onClick?: () => void;
    type: "submit" | "reset" | "button" | undefined;
    text: string;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    hoverBackgroundColor?: string;
    hoverTextColor?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }