import {useState} from 'react'

const ItemOptions = ({ options, onChange }) => {
  const [selected, setSelected] = useState({})

  const handleSelect = (optionId, choiceId, priceAdjustment) => {
    setSelected(prev => ({
      ...prev,
      [optionId]: priceAdjustment
    }))
    onChange({ [optionId]: priceAdjustment })
  }

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <div key={option.id} className="border-b border-gray-100 pb-3">
          <p className="font-medium text-gray-900 mb-2">
            {option.name}
            {option.isRequired && <span className="text-red-500 ml-1">*</span>}
          </p>
          <div className="space-y-2">
            {option.choices.map((choice) => (
              <label key={choice.id} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type={option.maxSelection === 1 ? 'radio' : 'checkbox'}
                    name={option.id}
                    value={choice.id}
                    onChange={() => handleSelect(option.id, choice.id, choice.priceAdjustment)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">{choice.name}</span>
                </div>
                {choice.priceAdjustment > 0 && (
                  <span className="text-sm text-gray-500">+Br {choice.priceAdjustment}</span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ItemOptions