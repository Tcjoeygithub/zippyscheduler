import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-xl text-brand-dark">
              Zippy Scheduler
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-brand-gray hover:text-brand-dark transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-2 px-4 rounded-full text-sm transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-brand-dark mb-6 tracking-tight">
          Pinterest scheduling,
          <br />
          <span className="text-brand-red">made zippy.</span>
        </h1>
        <p className="text-xl text-brand-gray max-w-2xl mx-auto mb-10">
          Schedule pins, create boards, and manage multiple Pinterest accounts
          from one simple dashboard. No bloat. No lock-in.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-4 px-8 rounded-full text-lg transition-colors shadow-lg"
          >
            Start Scheduling Free
          </Link>
          <Link
            href="#features"
            className="bg-brand-gray-light hover:bg-gray-200 text-brand-dark font-bold py-4 px-8 rounded-full text-lg transition-colors"
          >
            See How It Works
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-brand-gray-light py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark text-center mb-12">
            Everything you need, nothing you don&rsquo;t
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📌",
                title: "Schedule Pins",
                description:
                  "Queue up pins for any time in the future. Set it and forget it.",
              },
              {
                icon: "📋",
                title: "Manage Boards",
                description:
                  "Create and organize boards across all your Pinterest accounts.",
              },
              {
                icon: "👥",
                title: "Multi-Account",
                description:
                  "Connect unlimited Pinterest accounts and switch between them easily.",
              },
              {
                icon: "⚡",
                title: "Fast & Simple",
                description:
                  "No bloat, no confusing settings. Just a clean tool that works.",
              },
              {
                icon: "🔗",
                title: "Link to Your Site",
                description:
                  "Every pin links back to your website so you capture the traffic.",
              },
              {
                icon: "🔒",
                title: "Secure OAuth",
                description:
                  "We never see your Pinterest password. Standard OAuth 2.0.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                  {f.title}
                </h3>
                <p className="text-brand-gray">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark text-center mb-12">
            How it works
          </h2>
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Create your account",
                description: "Sign up with email in seconds. No credit card.",
              },
              {
                step: "2",
                title: "Connect Pinterest",
                description:
                  "Click the connect button, sign in to Pinterest, and authorize Zippy Scheduler. Standard OAuth 2.0 — your credentials stay on Pinterest.",
              },
              {
                step: "3",
                title: "Create boards and pins",
                description:
                  "Build your boards, add pins with images, titles, descriptions, and links.",
              },
              {
                step: "4",
                title: "Schedule and publish",
                description:
                  "Pick a date and time. We'll publish your pin automatically.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-red text-white rounded-full flex items-center justify-center font-bold text-xl">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-dark mb-1">
                    {s.title}
                  </h3>
                  <p className="text-brand-gray">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-dark text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to save time on Pinterest?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Free to get started. No credit card required.
          </p>
          <Link
            href="/login"
            className="inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-4 px-8 rounded-full text-lg transition-colors"
          >
            Start Scheduling Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚡</span>
                <span className="font-bold text-lg">Zippy Scheduler</span>
              </div>
              <p className="text-brand-gray text-sm">
                Simple Pinterest scheduling for content creators.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-brand-gray hover:text-brand-dark"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-brand-gray hover:text-brand-dark"
              >
                Terms of Service
              </Link>
              <a
                href="mailto:hello@zippyscheduler.com"
                className="text-brand-gray hover:text-brand-dark"
              >
                Contact
              </a>
            </div>
          </div>
          <p className="text-xs text-brand-gray mt-8 text-center">
            &copy; {new Date().getFullYear()} Zippy Scheduler. Not affiliated
            with Pinterest, Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
