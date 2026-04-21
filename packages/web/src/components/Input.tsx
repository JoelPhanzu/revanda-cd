import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || props.name

  return (
    <div className="space-y-1">
      {label && inputId ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : ''} ${className || ''}`}
        {...props}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

export default Input
