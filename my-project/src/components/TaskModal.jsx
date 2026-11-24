import { useState } from "react";
import { X } from "lucide-react";
import {
  STATUS,
  STATUS_KEYS,
  DEFAULT_STATUS,
  PRIORITIES,
  todayISO,
} from "../constants";

const field =
  "w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-ink placeholder:text-muted hover:border-input-hover focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState(
    task || {
      title: "",
      description: "",
      status: DEFAULT_STATUS,
      priority: "Medium",
      due: "",
    },
  );
  const [error, setError] = useState("");
  const today = todayISO();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.title.trim().length > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    const dateChanged = form.due !== (task?.due ?? "");
    if (form.due && dateChanged && form.due < today) {
      setError("Due date cannot be in the past.");
      return;
    }
    onSave({ ...form, title: form.title.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/50 p-4"
      onClick={onClose}
    >
      <form
        noValidate
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {task ? "Edit task" : "New task"}
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
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Title
            <input
              autoFocus
              className={`${field} mt-1.5`}
              value={form.title}
              onChange={set("title")}
              placeholder="What needs to be done?"
            />
          </label>
          <label className="block text-sm font-medium">
            Description
            <textarea
              rows={3}
              className={`${field} mt-1.5`}
              value={form.description}
              onChange={set("description")}
              placeholder="Add details (optional)"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">
              Status
              <select
                className={`${field} mt-1.5`}
                value={form.status}
                onChange={set("status")}
              >
                {STATUS_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {STATUS[k].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Priority
              <select
                className={`${field} mt-1.5`}
                value={form.priority}
                onChange={set("priority")}
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">
            Due date
            <input
              type="date"
              min={today}
              className={`${field} mt-1.5`}
              value={form.due}
              onChange={(e) => {
                setError("");
                setForm({ ...form, due: e.target.value });
              }}
            />
            {error && (
              <span role="alert" className="mt-1 block text-xs text-danger">
                {error}
              </span>
            )}
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-input bg-white px-4 py-2 text-sm font-semibold hover:bg-hover-bg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!valid}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled"
          >
            {task ? "Save changes" : "Add task"}
          </button>
        </div>
      </form>
    </div>
  );
}
