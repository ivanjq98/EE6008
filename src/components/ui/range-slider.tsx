import React, { useState, useCallback, useEffect, useRef } from 'react'

interface RangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onValueChange: (value: [number, number]) => void
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, step = 1, value, onValueChange }) => {
  const [minVal, setMinVal] = useState(value[0])
  const [maxVal, setMaxVal] = useState(value[1])
  const minValRef = useRef<HTMLInputElement>(null)
  const maxValRef = useRef<HTMLInputElement>(null)
  const range = useRef<HTMLDivElement>(null)

  // Convert to percentage
  const getPercent = useCallback((value: number) => Math.round(((value - min) / (max - min)) * 100), [min, max])

  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal)
      const maxPercent = getPercent(+maxValRef.current.value)

      if (range.current) {
        range.current.style.left = `${minPercent}%`
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [minVal, getPercent])

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value)
      const maxPercent = getPercent(maxVal)

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [maxVal, getPercent])

  // Get min and max values when their state changes
  useEffect(() => {
    onValueChange([minVal, maxVal])
  }, [minVal, maxVal, onValueChange])

  return (
    <div className='relative h-6 w-full'>
      <input
        type='range'
        min={min}
        max={max}
        value={minVal}
        ref={minValRef}
        onChange={(event) => {
          const value = Math.min(+event.target.value, maxVal - step)
          setMinVal(value)
          event.target.value = value.toString()
        }}
        className='thumb thumb--zindex-3 pointer-events-none absolute z-30 h-0 w-full appearance-none'
        style={{ zIndex: minVal > max - 100 ? 5 : undefined }}
      />
      <input
        type='range'
        min={min}
        max={max}
        value={maxVal}
        ref={maxValRef}
        onChange={(event) => {
          const value = Math.max(+event.target.value, minVal + step)
          setMaxVal(value)
          event.target.value = value.toString()
        }}
        className='thumb thumb--zindex-4 pointer-events-none absolute z-40 h-0 w-full appearance-none'
      />

      <div className='slider relative h-1 w-full'>
        <div className='slider__track absolute z-10 h-1 w-full bg-gray-200' />
        <div ref={range} className='slider__range absolute z-20 h-1 bg-blue-500' />
        <div className='slider__left-value absolute bottom-6 left-0 text-xs text-gray-700'>{minVal}</div>
        <div className='slider__right-value absolute bottom-6 right-0 text-xs text-gray-700'>{maxVal}</div>
      </div>
    </div>
  )
}

export default RangeSlider
