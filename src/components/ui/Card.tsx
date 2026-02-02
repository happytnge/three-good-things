import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
}

export default function Card({ children, className, hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-md border border-gray-300 p-6',
        hover && 'transition-all duration-200 hover:shadow-lg hover:border-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
