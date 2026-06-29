import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800/60",
        className
      )}
      {...props}
    >
      <span
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.06) 50%, transparent 100%)",
          animation: "shimmer 1.8s ease-in-out infinite",
        }}
      />
      <span
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
          animation: "shimmer 1.8s ease-in-out infinite",
        }}
      />
    </div>
  )
}

export { Skeleton }
