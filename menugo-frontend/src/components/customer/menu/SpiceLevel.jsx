
import Tooltip from '../../common/Tooltip'

const SpiceLevel = ({ level }) => {
  const levels = {
    0: { label: 'No Spice', emoji: '😊' },
    1: { label: 'Mild', emoji: '🌶️' },
    2: { label: 'Medium', emoji: '🌶️🌶️' },
    3: { label: 'Hot', emoji: '🌶️🌶️🌶️' },
    4: { label: 'Very Hot', emoji: '🌶️🌶️🌶️🌶️' },
    5: { label: 'Extreme', emoji: '🌶️🌶️🌶️🌶️🌶️🔥' }
  }

  const config = levels[level] || levels[0]

  return (
    <Tooltip content={config.label}>
      <span className="text-sm">{config.emoji}</span>
    </Tooltip>
  )
}

export default SpiceLevel