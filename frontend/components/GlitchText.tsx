import React from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className = '', as: Component = 'span' }) => {
  return (
    <Component className={`glitch-wrapper ${className}`}>
      <span className="glitch-text" data-text={text}>
        {text}
      </span>
    </Component>
  );
};
