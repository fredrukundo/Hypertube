import GuestGuard from "@/components/layout/GuestGuard";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <div className="min-h-screen flex">

        {/* Left: Brand Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#2872A1] flex-col items-center justify-center p-12 relative overflow-hidden">

          {/* Background decorative circles */}
          <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/5" />

          {/* Brand content */}
          <div className="relative z-10 text-center text-white">
            <div className="text-7xl mb-6">🎬</div>
            <h1 className="text-5xl font-black tracking-tight mb-4">
              Hypertube
            </h1>
            <p className="text-xl text-[#CBDDE9] font-light max-w-sm leading-relaxed">
              Search, stream and enjoy thousands of free, legal videos - all in one place.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 justify-center mt-10">
              {["Free & Legal", "HD Streaming", "Subtitles", "Multi-language"].map(
                (feature) => (
                  <span
                    key={feature}
                    className="bg-white/15 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full border border-white/20"
                  >
                    {feature}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right: Form Area */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <Image
                src="/logo.png"
                alt="Hypertube"
                width={60}
                height={60}
                className="object-contain h-10 w-auto"
                priority

              />
              <span className="text-2xl font-black text-foreground">
                Hypertube
              </span>
            </div>

            {children}
          </div>
        </div>

      </div>
    </GuestGuard>
  );
}