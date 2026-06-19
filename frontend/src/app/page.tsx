import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-28 text-white sm:py-36">
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-100 backdrop-blur-sm">
            🚀 Now live — book expert sessions
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Learn from the{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              best minds
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
            Book 1-on-1 sessions with expert creators across any topic — coding, design, business, and more.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/catalog"
              className="w-full rounded-xl bg-white px-8 py-3.5 text-center text-sm font-bold text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            >
              Browse Sessions →
            </Link>
            <Link
              href="/login"
              className="w-full rounded-xl border border-white/25 bg-white/10 px-8 py-3.5 text-center text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:w-auto"
            >
              Become a Creator
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-gray-100 bg-white px-4 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-gray-100">
          {[
            { value: "500+", label: "Sessions available" },
            { value: "2,000+", label: "Learners booked" },
            { value: "150+", label: "Expert creators" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center py-2">
              <span className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{s.value}</span>
              <span className="mt-1 text-xs text-gray-500 sm:text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to grow
            </h2>
            <p className="mt-3 text-gray-500">
              Built for learners and creators alike.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "🎯", title: "Expert Creators", desc: "Every creator is verified and brings real-world expertise to each session.", color: "from-blue-500 to-indigo-600" },
              { icon: "⚡", title: "Instant Booking", desc: "Browse, pick a slot, and confirm in seconds. No back-and-forth emails.", color: "from-violet-500 to-purple-600" },
              { icon: "🌍", title: "Any Topic", desc: "From full-stack engineering to entrepreneurship — find your niche.", color: "from-emerald-500 to-teal-600" },
              { icon: "📊", title: "Creator Dashboard", desc: "Powerful analytics and booking management for creators.", color: "from-orange-500 to-rose-600" },
              { icon: "🔒", title: "Secure Payments", desc: "Transparent pricing with no hidden fees.", color: "from-cyan-500 to-blue-600" },
              { icon: "💬", title: "Role-Based Access", desc: "Switch from learner to creator whenever you're ready.", color: "from-pink-500 to-fuchsia-600" },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-xl shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-12 text-3xl font-bold text-gray-900">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", icon: "🔍", title: "Browse", desc: "Explore hundreds of sessions across topics." },
              { step: "02", icon: "📅", title: "Book", desc: "One click to reserve your spot." },
              { step: "03", icon: "🚀", title: "Learn", desc: "Connect with your expert and grow." },
            ].map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center">
                {i < 2 && (
                  <div className="absolute left-[calc(50%+2rem)] top-6 hidden h-0.5 w-[calc(100%-4rem)] bg-blue-100 sm:block" />
                )}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-md">
                  {s.icon}
                </div>
                <span className="mt-3 text-xs font-bold uppercase tracking-widest text-blue-400">{s.step}</span>
                <h3 className="mt-1 font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-20 text-center text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to share your expertise?
          </h2>
          <p className="mt-4 text-blue-100">
            Sign in with Google, become a Creator, and start earning — it takes under a minute.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            Get started — it&apos;s free →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-lg font-extrabold text-blue-600">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">S</span>
            Sessions
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Sessions Marketplace. All rights reserved.</p>
          <nav className="flex gap-5 text-sm text-gray-500">
            <Link href="/catalog" className="hover:text-blue-600 transition-colors">Browse</Link>
            <Link href="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
