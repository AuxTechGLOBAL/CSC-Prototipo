import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('')
}

export function formatSlaDistance(dueAt: string) {
  const distance = new Date(dueAt).getTime() - Date.now()
  const absMinutes = Math.abs(Math.floor(distance / 60000))
  const hours = Math.floor(absMinutes / 60)
  const minutes = absMinutes % 60
  const label = `${hours}h ${minutes}m`

  if (distance >= 0) {
    return `restam ${label}`
  }

  return `atrasado ${label}`
}
