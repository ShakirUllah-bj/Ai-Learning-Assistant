import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import authService from "../../services/authService";
import {
  BrainCircuit,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      const message =
        err.error || err.message || "Failed to reset password. The link may have expired.";
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
              Set new password
            </h1>
            <p className="text-sm text-slate-500">
              Choose a strong password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                New password
              </label>

              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200"
                  strokeWidth={2}
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />

                {showPassword ? (
                  <EyeOff
                    className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 cursor-pointer"
                    strokeWidth={2}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <Eye
                    className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 cursor-pointer"
                    strokeWidth={2}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>

              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200"
                  strokeWidth={2}
                />

                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                  Resetting...
                </>
              ) : (
                <>
                  Reset password
                  <ArrowRight className="size-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-600">
              <Link
                to="/login"
                className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
