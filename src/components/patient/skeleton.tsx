import { Skeleton } from "@/components/ui/skeleton";

export function PatientSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <div className="rounded-xl bg-surface p-5 shadow-border">
        <div className="flex gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-surface p-5 shadow-border">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-2 h-6 w-56" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="size-5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
