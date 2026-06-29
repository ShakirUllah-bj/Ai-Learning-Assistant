import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService";
import { BrainCircuit, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success("Check your email for reset instructions.");
    } catch (err) {
      const message =
        err.error || err.message || "Failed to send reset email. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 mb-5">
              <BrainCircuit className="size-7 text-white" strokeWidth={2} />
            </div>

            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Forgot password?
            </h1>
            <p className="text-sm text-slate-500">
              {submitted
                ? "If an account exists for that email, we sent a reset link."
                : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          {submitted ? (
            <div className="space-y-5">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                <p className="text-sm text-emerald-700 text-center">
                  Check your inbox (and spam folder) for the password reset link.
                  The link expires in 30 minutes.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full h-12 flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="size-4" strokeWidth={2.5} />
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200"
                    strokeWidth={2}
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="size-4" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          )}

          {!submitted && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-center text-sm text-slate-600">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
