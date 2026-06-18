import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-[180px] font-black text-[#CBDDE9] dark:text-[#2872A1]/20 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🎬</span>
          </div>
        </div>

        <h1 className="text-3xl font-black text-foreground mb-3">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/library"
            className="bg-[#2872A1] hover:bg-[#1A4A6B] text-white font-bold px-6 py-3 rounded-xl transition-all duration-200"
          >
            Go to Library
          </Link>
          <Link
            href="/"
            className="border-2 border-border hover:border-[#2872A1] text-foreground font-bold px-6 py-3 rounded-xl transition-all duration-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}