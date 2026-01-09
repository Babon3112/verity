"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm " +
  "text-neutral-100 placeholder-neutral-500 outline-none transition " +
  "focus:border-[#00F7FF] focus:ring-2 focus:ring-[#00F7FF]/30";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const [usernameStatus, setUserNameStatus] =
    useState<UsernameStatus>("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!username) {
      setUserNameStatus("idle");
      return;
    }

    if (username.length < 3) {
      setUserNameStatus("invalid");
      return;
    }

    const timer = setTimeout(async () => {
      setUserNameStatus("checking");
      try {
        const res = await axios.get("/api/check-username", {
          params: { username },
        });
        setUserNameStatus(res.data.available ? "available" : "taken");
      } catch {
        setUserNameStatus("invalid");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (usernameStatus !== "available") return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const verifyUrl = `${baseUrl}/verify/${username.toLowerCase()}`;

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("username", username.toLowerCase());
    formData.append("email", email.toLowerCase());
    formData.append("password", password);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("gender", gender);
    formData.append("verifyUrl", verifyUrl);

    try {
      setLoading(true);
      await axios.post("/api/signup", formData);
      router.replace(`/verify/${username}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mt-4 text-center">
        <h1 className="text-lg font-semibold text-neutral-100">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-[#B0FFFA]">
          Start with the essentials
        </p>
      </div>

      <input
        className={inputClass}
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <div className="space-y-1">
        <input
          className={inputClass}
          placeholder="Username"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
        />

        {usernameStatus === "checking" && (
          <p className="text-xs text-neutral-400">
            Checking availability…
          </p>
        )}
        {usernameStatus === "available" && (
          <p className="text-xs text-[#B0FFFA]">
            Username available
          </p>
        )}
        {usernameStatus === "taken" && (
          <p className="text-xs text-[#FF5FA2]">
            Username already taken
          </p>
        )}
        {usernameStatus === "invalid" && (
          <p className="text-xs text-neutral-400">
            Minimum 3 characters
          </p>
        )}
      </div>

      <input
        className={inputClass}
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className={inputClass}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        className={inputClass}
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <div className="flex gap-3">
        <input
          type="date"
          className={inputClass}
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />

        <select
          className={inputClass}
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {error && (
        <p className="text-sm text-[#FF5FA2] text-center">
          {error}
        </p>
      )}

      <button
        disabled={loading || usernameStatus !== "available"}
        className="
          w-full rounded-lg py-3 text-sm font-medium text-black
          bg-[#00F7FF]
          transition hover:brightness-110 active:scale-[0.99]
          disabled:bg-neutral-700 disabled:text-neutral-400
          disabled:cursor-not-allowed
        "
      >
        {loading ? "Creating…" : "Create account"}
      </button>
    </form>
  );
};

export default SignUp;
