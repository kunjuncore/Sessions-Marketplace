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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-lg font-bold text-white">
              S
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-500">
                Sign in to browse and book sessions
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign-in failed.")}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              width="280"
            />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          By signing in, you agree to our{" "}
          <Link href="/" className="underline hover:text-gray-600">Terms</Link>
          {" "}and{" "}
          <Link href="/" className="underline hover:text-gray-600">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
