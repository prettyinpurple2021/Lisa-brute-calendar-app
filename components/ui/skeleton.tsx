import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted neo-border', className)}
      {...props}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="neo-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

function TaskSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg neo-border border-2">
      <Skeleton className="w-16 h-6 rounded" />
      <Skeleton className="flex-1 h-5" />
      <Skeleton className="w-20 h-6 rounded" />
    </div>
  )
}

function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <TaskSkeleton key={i} />
      ))}
    </div>
  )
}

function EventSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg neo-border border-2">
      <Skeleton className="w-3 h-3 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

function HabitSkeleton() {
  return (
    <div className="neo-border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="w-5 h-5 rounded flex-shrink-0" />
        ))}
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="neo-card p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="neo-card p-6 y2k-gradient-warm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex gap-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}

function FileSkeleton() {
  return (
    <div className="neo-card p-4 flex flex-col items-center gap-3">
      <Skeleton className="w-16 h-16 rounded-lg" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

function FileGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <FileSkeleton key={i} />
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  CardSkeleton, 
  TaskSkeleton, 
  TaskListSkeleton, 
  EventSkeleton, 
  HabitSkeleton, 
  StatCardSkeleton, 
  DashboardSkeleton,
  FileSkeleton,
  FileGridSkeleton,
}
