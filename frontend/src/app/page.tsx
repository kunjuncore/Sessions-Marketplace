import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            Now live — book expert sessions
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Learn from the{" "}
            <span className="text-blue-600">best minds</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
            Book 1-on-1 sessions with expert creators across any topic — coding, design, business, and more.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/catalog"
              className="w-full rounded-xl bg-gray-900 px-8 py-3.5 text-center text-sm font-semibold text-white transition-all hover:bg-gray-800 sm:w-auto"
            >
              Browse Sessions
            </Link>
            <Link
              href="/login"
              className="w-full rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-center text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 sm:w-auto"
            >
              Become a Creator
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-gray-100 bg-gray-50/50 px-4 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-gray-100">
          {[
            { value: "500+", label: "Sessions available" },
            { value: "2,000+", label: "Learners booked" },
            { value: "150+", label: "Expert creators" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center py-2">
              <span className="text-2xl font-bold text-gray-900 sm:text-3xl">{s.value}</span>
              <span className="mt-1 text-sm text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to grow
            </h2>
            <p className="mt-3 text-gray-500">
              Built for learners and creators alike.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Expert Creators", desc: "Every creator is verified and brings real-world expertise to each session." },
              { title: "Instant Booking", desc: "Browse, pick a slot, and confirm in seconds. No back-and-forth emails." },
              { title: "Any Topic", desc: "From full-stack engineering to entrepreneurship — find your niche." },
              { title: "Creator Dashboard", desc: "Powerful analytics and booking management for creators." },
              { title: "Secure Payments", desc: "Transparent pricing with no hidden fees." },
              { title: "Role-Based Access", desc: "Switch from learner to creator whenever you're ready." },
            ].map((f, i) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-100 bg-white p-6 transition-all hover:border-gray-200 hover:shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-600">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-gray-100 bg-gray-50/50 px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-16 text-3xl font-bold text-gray-900">How it works</h2>
          <div className="grid gap-12 sm:grid-cols-3">
            {[
              { step: "01", title: "Browse", desc: "Explore hundreds of sessions across topics." },
              { step: "02", title: "Book", desc: "One click to reserve your spot." },
              { step: "03", title: "Learn", desc: "Connect with your expert and grow." },
            ].map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center">
                {i < 2 && (
                  <div className="absolute left-[calc(50%+2.5rem)] top-5 hidden h-0.5 w-[calc(100%-5rem)] bg-gray-200 sm:block" />
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mt-6 font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-24 text-center">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-gray-50/50 p-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to share your expertise?
          </h2>
          <p className="mt-4 text-gray-500">
            Sign in with Google, become a Creator, and start earning — it takes under a minute.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800"
          >
            Get started — it&apos;s free
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">S</span>
            Sessions
          </div>
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Sessions Marketplace. All rights reserved.</p>
          <nav className="flex gap-5 text-sm text-gray-500">
            <Link href="/catalog" className="transition-colors hover:text-gray-900">Browse</Link>
            <Link href="/login" className="transition-colors hover:text-gray-900">Sign In</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
