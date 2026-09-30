import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Image
            src="/logo.png"
            alt="IGMART Loading"
            width={48}
            height={48}
            className="w-12 h-12 rounded-xl object-cover shadow-[0_0_20px_rgba(124,58,237,0.45)] animate-pulse"
            priority
          />
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
