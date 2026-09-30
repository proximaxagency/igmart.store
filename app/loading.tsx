export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-heading font-black text-white text-lg animate-pulse" style={{ background: "var(--gradient-brand, linear-gradient(135deg,#6366f1,#8b5cf6))" }}>
          IG
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
