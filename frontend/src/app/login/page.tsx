"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { getApiError } from "@/lib/errors";
import PageLoader from "@/components/ui/PageLoader";
import Link from "next/link";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "CREATOR" ? "/creator" : "/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleSuccess = async (res: CredentialResponse) => {
    if (!res.credential) return;
    try {
      const tokens = await authService.googleLogin(res.credential);
      login(tokens);
      toast.success(`Welcome back, ${tokens.user.name.split(" ")[0]}!`);
      router.push(tokens.user.role === "CREATOR" ? "/creator" : "/dashboard");
    } catch (e) {
      toast.error(getApiError(e, "Login failed. Please try again."));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-100/80">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-2xl font-extrabold shadow-md">
              S
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Sign in to browse and book sessions
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs font-medium text-gray-400">Continue with</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Google button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign-in failed.")}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              width="320"
            />
          </div>

          {/* Info chips */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { icon: "🎓", text: "Browse sessions" },
              { icon: "⚡", text: "Instant booking" },
              { icon: "🔒", text: "Secure login" },
              { icon: "🚀", text: "Become a creator" },
            ].map((c) => (
              <div
                key={c.text}
                className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs font-medium text-gray-600"
              >
                <span>{c.icon}</span>
                {c.text}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          By signing in, you agree to our{" "}
          <Link href="/" className="underline hover:text-blue-600">Terms</Link>
          {" "}and{" "}
          <Link href="/" className="underline hover:text-blue-600">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
