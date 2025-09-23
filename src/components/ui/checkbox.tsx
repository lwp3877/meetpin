/**
 * Checkbox 컴포넌트
 * 재사용 가능한 체크박스 UI 컴포넌트
 */

import React from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  description?: string
  error?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, onChange, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event)
      }
      if (onCheckedChange) {
        onCheckedChange(event.target.checked)
      }
    }

    return (
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          onChange={handleChange}
          {...props}
        />
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label className="text-sm font-medium text-gray-900">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

export default Checkbox