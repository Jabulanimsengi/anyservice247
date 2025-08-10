// src/components/TypingEffect.tsx
'use client';

import { useState, useEffect } from 'react';

interface TypingEffectProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delay?: number;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ 
  words, 
  typingSpeed = 150, 
  deletingSpeed = 100, 
  delay = 2000 
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return; // Don't start the effect until the component has mounted on the client

    const currentWord = words[wordIndex];
    
    const handleTyping = () => {
      if (isDeleting) {
        setText(currentWord.substring(0, text.length - 1));
      } else {
        setText(currentWord.substring(0, text.length + 1));
      }

      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), delay);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    };

    const timeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, delay, hasMounted]);

  return (
    <span className="typing-effect">
      {text}
      <span className="blinking-cursor">|</span>
    </span>
  );
};

export default TypingEffect;