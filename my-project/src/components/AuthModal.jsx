import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../AuthContext";
import { getManagers } from "../api";

const field =
  "w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-ink placeholder:text-muted hover:border-input-hover focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function AuthModal({ onClose }) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "MANAGER",
    managerId: "",
  });
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (tab === "signup")
      getManagers()
        .then(setManagers)
        .catch(() => {});
  }, [tab]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const switchTab = (t) => {
    setTab(t);
    setError("");
  };

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const request =
      tab === "login"
        ? login({ email: form.email, password: form.password })
        : signup(form);
    request
      .then(() => onClose())
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const tabClass = (t) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      tab === t ? "bg-primary-light text-primary" : "text-nav hover:bg-hover-bg"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {tab === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-nav hover:bg-hover-bg"
          >
            <X size={18} />
          </button>
        </div>

        <div
          role="tablist"
          className="mb-5 flex gap-2 rounded-xl border border-line p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "login"}
            onClick={() => switchTab("login")}
            className={tabClass("login")}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "signup"}
            onClick={() => switchTab("signup")}
            className={tabClass("signup")}
          >
            Sign up
          </button>
        </div>

        <div className="space-y-4">
          {tab === "signup" && (
            <label className="block text-sm font-medium">
              Full name
              <input
                required
                className={`${field} mt-1.5`}
                value={form.name}
                onChange={set("name")}
                placeholder="Your name"
              />
            </label>
          )}
          {tab !== "signup" && (
            <p className="">
              <span className="text-red-500 text-[14px]">
                Please login using this email and password.
              </span>
              <span className="flex flex-col">
                <strong>Email:</strong> imtiazali78652@gmail.com
                <strong>Password:</strong>password
              </span>
            </p>
          )}
          <label className="block text-sm font-medium">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              className={`${field} mt-1.5`}
              value={form.email}
              onChange={set("email")}
              placeholder="you@company.com"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              required
              type="password"
              minLength={tab === "signup" ? 6 : undefined}
              autoComplete={
                tab === "login" ? "current-password" : "new-password"
              }
              className={`${field} mt-1.5`}
              value={form.password}
              onChange={set("password")}
              placeholder={
                tab === "signup" ? "At least 6 characters" : "Your password"
              }
            />
          </label>

          {tab === "signup" && (
            <>
              <label className="block text-sm font-medium">
                I am a
                <select
                  className={`${field} mt-1.5`}
                  value={form.role}
                  onChange={set("role")}
                >
                  <option value="MANAGER">Manager</option>
                  <option value="MEMBER">Team member</option>
                </select>
              </label>
              {form.role === "MEMBER" && (
                <label className="block text-sm font-medium">
                  My manager
                  <select
                    required
                    className={`${field} mt-1.5`}
                    value={form.managerId}
                    onChange={set("managerId")}
                  >
                    <option value="">Select a manager</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  {!managers.length && (
                    <span className="mt-1 block text-xs text-muted">
                      No managers yet. Sign up as a manager first.
                    </span>
                  )}
                </label>
              )}
            </>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled"
        >
          {busy
            ? "Please wait…"
            : tab === "login"
              ? "Log in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
