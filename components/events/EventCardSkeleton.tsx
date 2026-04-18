import { cn } from '@/lib/utils'

export function EventCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'featured' | 'compact' }) {
  if (variant === 'featured') {
    return (
      <div className="group relative overflow-hidden rounded-synlo-lg border border-zinc-800 block">
        <div className="relative h-72 skeleton" />
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <div className="h-6 w-3/4 skeleton" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-20 skeleton" />
            <div className="h-4 w-24 skeleton" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-5 w-16 skeleton" />
            <div className="h-4 w-12 skeleton" />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex gap-4 p-4">
        <div className="w-16 h-16 rounded-synlo-sm skeleton flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 skeleton" />
          <div className="h-3 w-1/2 skeleton" />
          <div className="h-3 w-1/4 skeleton" />
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className="card overflow-hidden">
      <div className="h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 skeleton" />
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-1/2 skeleton" />
        <div className="h-3 w-1/3 skeleton" />
        <div className="h-1 w-full skeleton mt-2" />
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <div className="space-y-1">
            <div className="h-4 w-16 skeleton" />
            <div className="h-3 w-20 skeleton" />
          </div>
          <div className="w-8 h-8 rounded-full skeleton" />
        </div>
      </div>
    </div>
  )
}

export function EventGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}