import React, { useState, useEffect, useRef } from 'react'

interface RangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, step = 1, value, onChange }) => {
  const [minValue, setMinValue] = useState(value[0])
  const [maxValue, setMaxValue] = useState(value[1])
  const minInputRef = useRef<HTMLInputElement>(null)
  const maxInputRef = useRef<HTMLInputElement>(null)
  const rangeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMinValue(value[0])
    setMaxValue(value[1])
  }, [value])

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMinValue = Math.min(+event.target.value, maxValue - step)
    setMinValue(newMinValue)
    onChange([newMinValue, maxValue])
  }

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxValue = Math.max(+event.target.value, minValue + step)
    setMaxValue(newMaxValue)
    onChange([minValue, newMaxValue])
  }

  const getPercent = (value: number) => {
    return Math.round(((value - min) / (max - min)) * 100)
  }

  useEffect(() => {
    if (maxInputRef.current) {
      const minPercent = getPercent(minValue)
      const maxPercent = getPercent(+maxInputRef.current.value)

      if (rangeRef.current) {
        rangeRef.current.style.left = `${minPercent}%`
        rangeRef.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [minValue, maxValue])

  useEffect(() => {
    if (minInputRef.current) {
      const minPercent = getPercent(+minInputRef.current.value)
      const maxPercent = getPercent(maxValue)

      if (rangeRef.current) {
        rangeRef.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [maxValue])

  return (
    <div className='relative w-full'>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={minValue}
        ref={minInputRef}
        onChange={handleMinChange}
        className='pointer-events-none absolute h-2 w-full appearance-none bg-gray-200'
        aria-label='Minimum value'
      />
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={maxValue}
        ref={maxInputRef}
        onChange={handleMaxChange}
        className='pointer-events-none absolute h-2 w-full appearance-none bg-gray-200'
        aria-label='Maximum value'
      />
      <div className='relative w-full'>
        <div className='absolute h-2 w-full rounded bg-gray-200' />
        <div ref={rangeRef} className='absolute h-2 rounded bg-blue-500' />
        <div className='absolute left-0 right-0 top-2 mt-2 flex justify-between'>
          <span>{minValue}</span>
          <span>{maxValue}</span>
        </div>
      </div>
    </div>
  )
}

export default RangeSlider
