export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-background polka-dots flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-primary neo-border neo-shadow flex items-center justify-center rotate-3">
            <svg
              className="h-10 w-10 text-primary-foreground animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="neo-border bg-card px-6 py-3 neo-shadow">
          <span className="text-xl font-bold text-foreground">
            Loading Vibe<span className="text-primary">OS</span>...
          </span>
        </div>
        
        {/* Loading bars */}
        <div className="flex gap-2">
          <div className="w-4 h-8 bg-primary neo-border animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-4 h-8 bg-secondary neo-border animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-4 h-8 bg-accent neo-border animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="w-4 h-8 bg-lime neo-border animate-bounce" style={{ animationDelay: "0.3s" }} />
          <div className="w-4 h-8 bg-neon-purple neo-border animate-bounce" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  )
}
