import Link from 'next/link';

interface HeroSectionProps {
  isLoggedIn?: boolean;
}

export function HeroSection({ isLoggedIn = false }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Logo mark */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Brand */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Greenlight
          </h1>

          {/* Tagline */}
          <p className="mt-4 text-xl text-green-100 sm:text-2xl lg:text-3xl">
            Get the Greenlight on Your Requirements
          </p>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-xl text-lg text-green-50/90">
            Streamline your approval process. Upload requirements, collect sign-offs from
            stakeholders, and track status in real-time.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isLoggedIn ? (
              <Link
                href="/requirements"
                className="inline-flex w-full items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-green-600 shadow-lg transition-all hover:bg-green-50 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 sm:w-auto"
              >
                Go to Dashboard
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-green-600 shadow-lg transition-all hover:bg-green-50 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 sm:w-auto"
                >
                  Get Started
                  <svg
                    className="ml-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/50 sm:w-auto"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="h-16 w-full text-gray-50 sm:h-24"
          viewBox="0 0 1440 74"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C240,74 480,74 720,37 C960,0 1200,0 1440,37 L1440,74 L0,74 Z" />
        </svg>
      </div>
    </section>
  );
}
