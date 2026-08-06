
import Tooltip from '../../common/Tooltip'

const DietaryIcons = ({ isVegetarian, isVegan, isGlutenFree }) => {
  return (
    <div className="flex gap-1">
      {isVegetarian && (
        <Tooltip content="Vegetarian">
          <span className="text-sm">🌱</span>
        </Tooltip>
      )}
      {isVegan && (
        <Tooltip content="Vegan">
          <span className="text-sm">🌿</span>
        </Tooltip>
      )}
      {isGlutenFree && (
        <Tooltip content="Gluten Free">
          <span className="text-sm">🚫🌾</span>
        </Tooltip>
      )}
    </div>
  )
}

export default DietaryIcons