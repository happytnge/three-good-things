import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'

  const variants = {
    primary: 'bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg hover:scale-105',
    secondary: 'bg-white text-blue-700 border-2 border-blue-700 shadow-sm hover:bg-blue-50 hover:shadow-md hover:scale-105',
    danger: 'bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg hover:scale-105',
  }

  const sizes = {
    sm: 'px-3 py-2.5 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
