import React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { FormControl } from '@/src/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { cn } from '@/src/lib/utils'
import { Calendar } from './calendar'
import { TimePicker } from './time-picker'

interface SingleDateTimeFormInputProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
}

const SingleDateTimeFormInput: React.FC<SingleDateTimeFormInputProps> = ({ value, onChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant='outline'
            className={cn('flex h-fit justify-start gap-1 text-left font-normal', !value && 'text-muted-foreground')}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            <div className='min-h-fit'>{value ? format(value, 'PPP HH:mm:ss') : <span>Pick a date and time</span>}</div>
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={value}
          onSelect={(date) => {
            if (date) {
              // If a date is selected, use it; otherwise, use current date
              const newDate = date || new Date()
              // Preserve the time if value exists, otherwise set to current time
              if (value) {
                newDate.setHours(value.getHours())
                newDate.setMinutes(value.getMinutes())
                newDate.setSeconds(value.getSeconds())
              }
              onChange(newDate)
            } else {
              onChange(undefined)
            }
          }}
          initialFocus
        />
        <div className='border-t border-border p-3'>
          <TimePicker
            setDate={(date) => {
              const newDate = value ? new Date(value) : new Date()
              newDate.setHours(date.getHours())
              newDate.setMinutes(date.getMinutes())
              newDate.setSeconds(date.getSeconds())
              onChange(newDate)
            }}
            date={value || new Date()} // Provide a default date if value is undefined
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default SingleDateTimeFormInput
