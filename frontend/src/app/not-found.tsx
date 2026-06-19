import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="text-7xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-3 text-lg text-gray-500">Page not found</p>
      <Link href="/" className="mt-8">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
