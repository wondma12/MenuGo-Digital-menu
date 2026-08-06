// src/components/kitchen/KitchenTimer.jsx
import {useEffect, useState} from 'react'
import { Clock } from 'lucide-react'

const KitchenTimer = ({ elapsedTime, targetTime }) => {
  const [time, setTime] = useState(elapsedTime || 0);

  useEffect(() => {
    setTime(elapsedTime);
  }, [elapsedTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (time > 600) return 'text-red-600';
    if (time > 300) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className={`flex items-center gap-2 text-sm font-semibold ${getTimerColor()}`}>
      <Clock className="w-4 h-4" />
      <span>{formatTime(time)}</span>
    </div>
  );
};

export default KitchenTimer;