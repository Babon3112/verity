"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const inputWrap =
  "flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 " +
  "transition focus-within:border-cyan-300/40 focus-within:bg-white/[0.07]";

const inputField =
  "w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const [usernameStatus, setUserNameStatus] = useState<UsernameStatus>("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  /* ========== USERNAME CHECK ========== */
  useEffect(() => {
    const cleaned = username.trim();

    if (!cleaned) {
      setUserNameStatus("idle");
      return;
    }

    if (cleaned.length < 3) {
      setUserNameStatus("invalid");
      return;
    }

    const timer = setTimeout(async () => {
      setUserNameStatus("checking");
      try {
        const res = await axios.get("/api/check-username", {
          params: { username: cleaned.toLowerCase() },
        });
        setUserNameStatus(res.data.available ? "available" : "taken");
      } catch {
        setUserNameStatus("invalid");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  /* ========== PASSWORD STRENGTH ========== */
  const passwordScore = useMemo(() => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score; // 0..4
  }, [password]);

  const passwordLabel = useMemo(() => {
    if (!password) return "";
    if (passwordScore <= 1) return "Weak";
    if (passwordScore === 2) return "Okay";
    if (passwordScore === 3) return "Good";
    return "Strong";
  }, [password, passwordScore]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  /* ========== SUBMIT ========== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !username.trim() || !email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (usernameStatus !== "available") {
      setError("Please choose an available username.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const verifyUrl = `${baseUrl}/verify/${username.toLowerCase().trim()}`;

    const formData = new FormData();
    formData.append("fullName", fullName.trim());
    formData.append("username", username.toLowerCase().trim());
    formData.append("email", email.toLowerCase().trim());
    formData.append("password", password);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("gender", gender);
    formData.append("verifyUrl", verifyUrl);

    try {
      setLoading(true);
      await axios.post("/api/signup", formData);
      router.replace(`/verify/${username.toLowerCase().trim()}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const usernameHint = (() => {
    if (usernameStatus === "idle")
      return { text: "Pick a unique username.", tone: "neutral", icon: null };
    if (usernameStatus === "invalid")
      return {
        text: "Minimum 3 characters.",
        tone: "warn",
        icon: <AlertCircle className="h-4 w-4" />,
      };
    if (usernameStatus === "checking")
      return {
        text: "Checking availability…",
        tone: "neutral",
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
      };
    if (usernameStatus === "available")
      return {
        text: "Username available",
        tone: "good",
        icon: <CheckCircle2 className="h-4 w-4" />,
      };
    return {
      text: "Username already taken",
      tone: "bad",
      icon: <XCircle className="h-4 w-4" />,
    };
  })();

  const canSubmit =
    !loading &&
    fullName.trim() &&
    username.trim() &&
    email.trim() &&
    password &&
    confirmPassword &&
    usernameStatus === "available" &&
    password === confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Start with the essentials — we’ll handle the rest.
        </p>
      </div>

      {/* Full name */}
      <div className={inputWrap}>
        <User className="h-4 w-4 text-slate-400" />
        <input
          className={inputField}
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      {/* Username */}
      <div className="space-y-2">
        <div className={inputWrap}>
          <AtSign className="h-4 w-4 text-slate-400" />
          <input
            className={inputField}
            placeholder="Username"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        <div
          className={[
            "flex items-center gap-2 text-xs",
            usernameHint.tone === "good"
              ? "text-emerald-300"
              : usernameHint.tone === "bad"
                ? "text-red-300"
                : usernameHint.tone === "warn"
                  ? "text-yellow-200"
                  : "text-slate-400",
          ].join(" ")}
        >
          {usernameHint.icon}
          <span>{usernameHint.text}</span>
        </div>
      </div>

      {/* Email */}
      <div className={inputWrap}>
        <Mail className="h-4 w-4 text-slate-400" />
        <input
          className={inputField}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className={inputWrap}>
          <Lock className="h-4 w-4 text-slate-400" />
          <input
            className={inputField}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="
              rounded-xl border border-white/10 bg-white/5 p-1.5
              text-slate-300 transition hover:bg-white/10 hover:text-white
              active:scale-[0.98]
            "
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {password && (
          <>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Password strength</span>
              <span
                className={[
                  "font-semibold",
                  passwordScore <= 1
                    ? "text-red-300"
                    : passwordScore === 2
                      ? "text-yellow-300"
                      : passwordScore === 3
                        ? "text-emerald-300"
                        : "text-cyan-200",
                ].join(" ")}
              >
                {passwordLabel}
              </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-linear-to-r from-cyan-300 to-emerald-200 transition-all"
                style={{ width: `${(passwordScore / 4) * 100}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Confirm password */}
      <div className="space-y-2">
        <div className={inputWrap}>
          <Lock className="h-4 w-4 text-slate-400" />
          <input
            className={inputField}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((p) => !p)}
            className="
              rounded-xl border border-white/10 bg-white/5 p-1.5
              text-slate-300 transition hover:bg-white/10 hover:text-white
              active:scale-[0.98]
            "
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {!passwordsMatch && (
          <p className="text-xs text-red-300">Passwords don’t match.</p>
        )}
      </div>

      {/* DOB + Gender */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className={inputWrap}>
          <Calendar className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            className={inputField}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <div className={inputWrap}>
          <Users className="h-4 w-4 text-slate-400" />
          <select
            className={inputField}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-200 text-center">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        disabled={!canSubmit}
        className="
          relative w-full rounded-2xl py-3.5 text-sm font-semibold text-black
          bg-linear-to-r from-cyan-300 to-emerald-200
          shadow-[0_10px_25px_-18px_rgba(34,211,238,0.65)]
          transition hover:brightness-110 active:scale-[0.99]
          disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none
        "
      >
        {loading && (
          <span className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse" />
        )}

        {loading ? (
          <span className="relative flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating...
          </span>
        ) : (
          <span className="relative">Create account</span>
        )}
      </button>
    </form>
  );
};

export default SignUp;
