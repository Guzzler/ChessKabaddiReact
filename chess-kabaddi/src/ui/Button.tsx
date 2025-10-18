import type { ComponentProps } from 'react'

export function Button({ className='', variant='primary', ...props }: ComponentProps<'button'> & { variant?: 'primary'|'ghost' }) {
  const base = 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-neutral-950'
  const styles = variant==='primary'
    ? 'bg-brand-600 hover:bg-brand-700 shadow-soft'
    : 'bg-transparent hover:bg-white/5 text-neutral-200'
  return <button className={`${base} ${styles} ${className}`} {...props} />
}
