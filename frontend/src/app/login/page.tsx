"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { getApiError } from "@/lib/errors";
import Spinner from "@/components/ui/Spinner";

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
      toast.success(`Welcome, ${tokens.user.name}!`);
      router.push(tokens.user.role === "CREATOR" ? "/creator" : "/dashboard");
    } catch (e) {
      toast.error(getApiError(e, "Login failed. Please try again."));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl">⚡</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to browse and book sessions
          </p>
        </div>

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

        <p className="mt-6 text-center text-xs text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
