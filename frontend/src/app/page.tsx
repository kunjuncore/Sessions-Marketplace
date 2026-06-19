import Link from "next/link";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Learn from the best
          </h1>
          <p className="mt-6 text-xl text-blue-100">
            Book 1-on-1 sessions with expert creators across any topic.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/catalog">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                Browse Sessions
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto">
                Start as Creator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Why Sessions Marketplace?
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "🎯", title: "Expert Creators", desc: "Connect with verified experts in their field." },
              { icon: "📅", title: "Easy Booking", desc: "Book instantly and manage everything in one place." },
              { icon: "💬", title: "Any Topic", desc: "From coding to cooking — find sessions on anything." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 text-4xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-50 px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Ready to start teaching?</h2>
        <p className="mt-2 text-gray-500">Sign in and become a creator in seconds.</p>
        <div className="mt-6">
          <Link href="/login">
            <Button size="lg">Get Started Free</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
