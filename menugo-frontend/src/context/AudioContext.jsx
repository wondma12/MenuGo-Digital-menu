// src/context/AudioContext.jsx
import {createContext, useContext, useRef, useCallback} from 'react'

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const audioRefs = useRef({});

  const playSound = useCallback((soundName) => {
    try {
      if (!audioRefs.current[soundName]) {
        audioRefs.current[soundName] = new Audio(`/sounds/${soundName}`);
      }
      
      const audio = audioRefs.current[soundName];
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Error playing sound:', error);
      });
    } catch (error) {
      console.error('Audio error:', error);
    }
  }, []);

  const preloadSounds = useCallback((sounds) => {
    sounds.forEach(sound => {
      if (!audioRefs.current[sound]) {
        audioRefs.current[sound] = new Audio(`/sounds/${sound}`);
        audioRefs.current[sound].load();
      }
    });
  }, []);

  return (
    <AudioContext.Provider value={{ playSound, preloadSounds }}>
      {children}
    </AudioContext.Provider>
  );
};