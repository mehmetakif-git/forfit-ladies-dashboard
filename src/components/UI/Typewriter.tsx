import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
}) => {
  const { settings } = useApp();
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (delay > 0 && !hasStarted) {
      const delayTimer = setTimeout(() => {
        setHasStarted(true);
        setIsTyping(true);
      }, delay);
      return () => clearTimeout(delayTimer);
    } else if (!hasStarted) {
      setHasStarted(true);
      setIsTyping(true);
    }
  }, [delay, hasStarted]);

  useEffect(() => {
    if (!hasStarted || !isTyping) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      onComplete?.();
    }
  }, [currentIndex, text, speed, hasStarted, isTyping, onComplete]);

  const shouldShowGlow = settings.typingGlowEnabled !== false && isTyping;

  return (
    <div className={`typewriter-container ${shouldShowGlow ? 'typewriter-anim' : ''}`}>
      <div className="typewriter-glow">
        <span className={className}>
          {displayText}
          {isTyping && (
            <span className="animate-pulse text-primary">|</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default Typewriter;