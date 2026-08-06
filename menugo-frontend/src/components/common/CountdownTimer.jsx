import {useState, useEffect} from 'react'

const CountdownTimer = ({ targetDate, onComplete, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = new Date(targetDate).getTime() - now

      if (distance < 0) {
        clearInterval(timer)
        onComplete?.()
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ]

  return (
    <div className={`flex gap-4 ${className}`}>
      {units.map((unit, index) => (
        <div key={index} className="text-center">
          <div className="bg-gray-900 text-white rounded-lg px-4 py-2 min-w-[70px]">
            <span className="text-2xl font-bold">{unit.value.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}

export default CountdownTimer